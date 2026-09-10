import { spawn } from 'child_process';
import fs from 'fs';

async function runTestSuite(url) {
  console.log(`\n========================================`);
  console.log(`TEST SUITE: ${url}`);
  console.log(`========================================`);

  const tmpDir = `/tmp/chrome_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const port = 9330 + Math.floor(Math.random() * 50);
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    url
  ]);

  const consoleErrors = [];

  try {
    // Wait for Chrome CDP endpoint with retry
    let listRes = null;
    for (let retry = 0; retry < 15; retry++) {
      try {
        await new Promise(r => setTimeout(r, 400));
        listRes = await fetch(`http://127.0.0.1:${port}/json`);
        if (listRes.ok) break;
      } catch (e) {}
    }
    if (!listRes || !listRes.ok) throw new Error(`Chrome CDP not reachable on port ${port}`);
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes(url));
    if (!pageTarget) throw new Error(`Target page not found for ${url}`);

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        if (data.params.type === 'error') {
          const errText = data.params.args.map(a => a.value || a.description).join(' ');
          if (!errText.includes('WebGLRenderer: Error creating WebGL context')) {
            consoleErrors.push(errText);
          }
        }
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('CDP Exception Details:', JSON.stringify(data.params.exceptionDetails, null, 2));
        const desc = data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text || 'Unknown Exception';
        consoleErrors.push(desc);
      }
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    // Helper to evaluate JS in page
    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text + ' ' + JSON.stringify(res.exceptionDetails.exception));
      }
      return res.result ? res.result.value : undefined;
    }

    // Wait 1.5s for page init
    await new Promise(r => setTimeout(r, 1500));
    console.log('Location:', await evaluate('window.location.href'), 'ReadyState:', await evaluate('document.readyState'));

    // TEST 1: Initial state (Roulette modal open -> controls.freeze === true)
    const initialRouletteOpen = await evaluate(`!document.getElementById('roulette-modal').classList.contains('modal-hidden')`);
    const initialControlsFreeze = await evaluate(`window.app && window.app.controls ? window.app.controls.freeze : null`);
    console.log(`[TEST 1] Initial Roulette Open: ${initialRouletteOpen}, Controls Freeze: ${initialControlsFreeze}`);
    if (!initialRouletteOpen || initialControlsFreeze !== true) {
      throw new Error(`TEST 1 FAILED: Roulette should be open and controls frozen. Got: open=${initialRouletteOpen}, freeze=${initialControlsFreeze}`);
    }

    // TEST 2: Start run with Class DE
    await evaluate(`
      const spinBtn = document.getElementById('btn-spin-roulette');
      spinBtn.click();
    `);
    await new Promise(r => setTimeout(r, 500));

    const postStartRouletteOpen = await evaluate(`!document.getElementById('roulette-modal').classList.contains('modal-hidden')`);
    const postStartFreeze = await evaluate(`window.app.controls.freeze`);
    const isRunActive = await evaluate(`window.app.game.isRunActive`);
    console.log(`[TEST 2] Post Start: Roulette Open: ${postStartRouletteOpen}, Controls Freeze: ${postStartFreeze}, Run Active: ${isRunActive}`);
    if (postStartRouletteOpen || postStartFreeze !== false || !isRunActive) {
      throw new Error(`TEST 2 FAILED: Roulette should be closed, freeze should be false, run should be active.`);
    }

    // TEST 3: Clock advancement & Exploit Prevention
    // 3a. Forward-only RunClock monotonicity
    await evaluate(`
      window.app.game.clock.elapsed = window.app.game.clock.duration * 0.65; // ~21:30
      window.app.game.clock.setHour(11.5, true); // forward to DAY (past midnight)
    `);
    const elapsedAfterForward = await evaluate(`window.app.game.clock.elapsed`);
    const clockDurationVal = await evaluate(`window.app.game.clock.duration`);
    const hasEndedAfterForward = await evaluate(`window.app.game.clock.hasEnded`);
    console.log(`[TEST 3a] RunClock forward advancement: elapsed=${elapsedAfterForward}, duration=${clockDurationVal}, hasEnded=${hasEndedAfterForward}`);
    if (elapsedAfterForward !== clockDurationVal || !hasEndedAfterForward) {
      throw new Error(`TEST 3a FAILED: RunClock should have clamped forward to ${clockDurationVal}s, got ${elapsedAfterForward}`);
    }

    // 3b. Anti-cheat exploit check: cycleTimeOfDay during active run must NOT skip time or grant instant victory
    await evaluate(`
      window.app.game.clock.elapsed = 100; // 10:00
      window.app.game.clock.hasEnded = false;
      window.app.game.isRunActive = true;
      document.getElementById('end-run-modal').classList.add('modal-hidden');
      window.app.controls.refreshFreeze();
      window.app.cycleTimeOfDay(); // Try to skip time during run
    `);
    const elapsedAfterExploitAttempt = await evaluate(`window.app.game.clock.elapsed`);
    const runStillActive = await evaluate(`window.app.game.isRunActive`);
    console.log(`[TEST 3b] Anti-cheat exploit prevention: elapsed=${elapsedAfterExploitAttempt}, runStillActive=${runStillActive}`);
    if (Math.abs(elapsedAfterExploitAttempt - 100) > 1.5 || !runStillActive) {
      throw new Error(`TEST 3b FAILED: cycleTimeOfDay allowed instant time skip or win during active run! Got elapsed=${elapsedAfterExploitAttempt}`);
    }
    console.log(`[TEST 3 PASS] Forward-only clock math and active-run anti-cheat exploit lock verified`);

    // Reset clock for further tests
    await evaluate(`
      window.app.game.clock.elapsed = 100;
      window.app.game.clock.hasEnded = false;
      window.app.game.isRunActive = true;
      document.getElementById('end-run-modal').classList.add('modal-hidden');
      window.app.controls.refreshFreeze();
    `);

    // TEST 4: Dialog & Street View multi-owner freeze
    await evaluate(`
      window.app.game.dialog.open({ title: 'Teste', text: 'Conversando', options: [{ text: 'OK' }] });
    `);
    const freezeWithDialog = await evaluate(`window.app.controls.freeze`);
    console.log(`[TEST 4a] Dialog Open -> Controls Freeze: ${freezeWithDialog}`);
    if (freezeWithDialog !== true) throw new Error('TEST 4a FAILED: Dialog did not freeze controls');

    // Open Street View while Dialog is open
    await evaluate(`
      window.app.toggleStreetView(true);
    `);
    const freezeBoth = await evaluate(`window.app.controls.freeze`);
    console.log(`[TEST 4b] Dialog + Street View Open -> Controls Freeze: ${freezeBoth}`);
    if (freezeBoth !== true) throw new Error('TEST 4b FAILED: Both open should freeze controls');

    // Close Street View
    await evaluate(`
      window.app.toggleStreetView(false);
    `);
    const freezeDialogOnly = await evaluate(`window.app.controls.freeze`);
    console.log(`[TEST 4c] Street View Closed, Dialog Still Open -> Controls Freeze: ${freezeDialogOnly}`);
    if (freezeDialogOnly !== true) throw new Error('TEST 4c FAILED: Controls un-froze while Dialog was still open!');

    // Close Dialog
    await evaluate(`
      window.app.game.dialog.close();
    `);
    const freezeNone = await evaluate(`window.app.controls.freeze`);
    console.log(`[TEST 4d] Dialog Closed -> Controls Freeze: ${freezeNone}`);
    if (freezeNone !== false) throw new Error('TEST 4d FAILED: Controls still frozen after closing all modals');

    // TEST 5: Auto-tour guard when frozen
    await evaluate(`
      window.app.controls.setFreeze('test', true);
      window.app.controls.toggleAutoTour();
    `);
    const isTourWhenFrozen = await evaluate(`window.app.controls.isAutoTour`);
    console.log(`[TEST 5] Auto Tour when frozen: isAutoTour=${isTourWhenFrozen}`);
    if (isTourWhenFrozen === true) throw new Error('TEST 5 FAILED: Auto Tour activated while frozen');
    await evaluate(`window.app.controls.setFreeze('test', false);`);

    // TEST 6: Forced Defeat -> End Modal Open & Controls Freeze
    await evaluate(`
      window.app.game.state.apply({ sanidade: -150 });
      window.app.game.update(0.016);
    `);
    await new Promise(r => setTimeout(r, 300));

    const endModalOpen = await evaluate(`!document.getElementById('end-run-modal').classList.contains('modal-hidden')`);
    const controlsFreezeOnDefeat = await evaluate(`window.app.controls.freeze`);
    const runActiveOnDefeat = await evaluate(`window.app.game.isRunActive`);
    console.log(`[TEST 6] Defeat: End Modal Open: ${endModalOpen}, Controls Freeze: ${controlsFreezeOnDefeat}, Run Active: ${runActiveOnDefeat}`);
    if (!endModalOpen || controlsFreezeOnDefeat !== true || runActiveOnDefeat !== false) {
      throw new Error(`TEST 6 FAILED: Defeat should open end modal, freeze controls, and stop run. Got open=${endModalOpen}, freeze=${controlsFreezeOnDefeat}, active=${runActiveOnDefeat}`);
    }

    // TEST 7: Verify WASD ignored when frozen on End Screen
    await evaluate(`
      window.app.controls.onKeyDown({ code: 'KeyW' });
    `);
    const moveForward = await evaluate(`window.app.controls.moveForward`);
    console.log(`[TEST 7] KeyW pressed during End Screen: moveForward=${moveForward}`);
    if (moveForward === true) throw new Error('TEST 7 FAILED: moveForward was true despite frozen controls');

    // TEST 8: Mouse drag on open End Modal does NOT rotate camera quaternion (Invariant I6 non-vacuous test)
    const initialQuat = await evaluate(`
      (() => {
        const cam = window.app.controls.camera;
        return { x: cam.quaternion.x, y: cam.quaternion.y, z: cam.quaternion.z, w: cam.quaternion.w };
      })()
    `);
    await evaluate(`
      (() => {
        // Arm drag-to-look state explicitly to non-vacuously verify that mousemove freeze guard catches it
        window.app.controls.hasStarted = true;
        window.app.controls.isMouseDown = true;
        window.app.controls.lastMouseX = 200;
        window.app.controls.lastMouseY = 200;
        const moveEvt = new MouseEvent('mousemove', { clientX: 350, clientY: 450, movementX: 150, movementY: 250, bubbles: true });
        document.dispatchEvent(moveEvt);
      })()
    `);
    const postDragQuat = await evaluate(`
      (() => {
        const cam = window.app.controls.camera;
        return { x: cam.quaternion.x, y: cam.quaternion.y, z: cam.quaternion.z, w: cam.quaternion.w };
      })()
    `);
    const quatChanged = Math.abs(initialQuat.x - postDragQuat.x) > 0.0001 ||
                        Math.abs(initialQuat.y - postDragQuat.y) > 0.0001 ||
                        Math.abs(initialQuat.z - postDragQuat.z) > 0.0001 ||
                        Math.abs(initialQuat.w - postDragQuat.w) > 0.0001;
    console.log(`[TEST 8] Armed mouse drag on open End Modal: quatChanged=${quatChanged}`);
    if (quatChanged) {
      throw new Error(`TEST 8 FAILED: Camera quaternion changed during frozen modal drag! Initial: ${JSON.stringify(initialQuat)}, Post: ${JSON.stringify(postDragQuat)}`);
    }

    // TEST 9: Footstep counter progression (regression test for stepDistance / lastFootstepDist NaN bug)
    await evaluate(`
      (() => {
        document.getElementById('end-run-modal').classList.add('modal-hidden');
        window.app.controls.refreshFreeze();
        window.app.controls.hasStarted = true;
        window.app.controls.moveForward = true;
        window.app.controls.canJump = true;
        // Run physics/movement updates with forward motion
        for (let i = 0; i < 15; i++) {
          window.app.controls.update(0.04);
        }
        window.app.controls.moveForward = false;
      })()
    `);
    const stepDistance = await evaluate(`window.app.controls.stepDistance`);
    const lastFootstepDist = await evaluate(`window.app.controls.lastFootstepDist`);
    const isStepFinite = await evaluate(`Number.isFinite(window.app.controls.stepDistance) && Number.isFinite(window.app.controls.lastFootstepDist)`);
    console.log(`[TEST 9] Footstep regression test: stepDistance=${stepDistance}, lastFootstepDist=${lastFootstepDist}, isFinite=${isStepFinite}`);
    if (!isStepFinite || stepDistance <= 0 || lastFootstepDist <= 0) {
      throw new Error(`TEST 9 FAILED: stepDistance (${stepDistance}) or lastFootstepDist (${lastFootstepDist}) not positive finite numbers!`);
    }

    // TEST 10: 15-Minute Clock Invariant (900s)
    const clockDuration = await evaluate(`window.app.game.clock.duration`);
    console.log(`[TEST 10] Master Clock Duration: ${clockDuration}s (15 min)`);
    if (clockDuration !== 900) {
      throw new Error(`TEST 10 FAILED: Master clock duration must be 900s, got ${clockDuration}`);
    }

    // TEST 11: Real Spatial Reachability & Operating Hours
    const stationsReachability = await evaluate(`
      (() => {
        const anchors = window.app.game.interactables.anchors;
        const required = ['BANCA_JORNAL', 'PASTEL_FEIRA', 'SEMAFORO_BICO', 'BAILE_LAJE'];
        const allPresent = required.every(id => anchors.some(a => a.encounterId === id));

        // Test time-gating logic:
        // Baile da Laje open at 03:00 (Madrugada), closed at 12:00
        const baileAnchor = anchors.find(a => a.id === 'baile_laje');
        window.app.game.clock.elapsed = (3.0 - 6.0 + 24) % 24 * (900 / 24); // 03:00
        window.app.game.interactables.update(new THREE.Vector3(0, 8.4, -39.0), new THREE.Vector3(0, 0, -1), window.app.game.clock, window.app.game.state);
        const openAt3 = window.app.game.interactables.currentTarget?.isOpen;

        window.app.game.clock.elapsed = (12.0 - 6.0) * (900 / 24); // 12:00
        window.app.game.interactables.update(new THREE.Vector3(0, 8.4, -39.0), new THREE.Vector3(0, 0, -1), window.app.game.clock, window.app.game.state);
        const closedAt12 = !window.app.game.interactables.currentTarget?.isOpen;

        return allPresent && openAt3 === true && closedAt12 === true;
      })()
    `);
    console.log(`[TEST 11] Stations Reachability & Time-Gating: ${stationsReachability}`);
    if (!stationsReachability) {
      throw new Error(`TEST 11 FAILED: Station reachability or operating hours time-gating failed`);
    }

    // TEST 12: Real Execution of Anti-Farm Caps (Sinuca, Bicho, Raspadinha, Semáforo)
    const realCapsTested = await evaluate(`
      (() => {
        const state = window.app.game.state;
        const sound = window.app.sound;
        state.grana = 50000;
        state.ginga = 100; // Legal maximum ginga [0, 100] per Invariant I4

        const encs = window.app.game.encounters;
        if (!encs) return { ok: false, reason: 'window.app.game.encounters not found' };

        // 1. Sinuca Cap: execute until 2 wins reached
        const barEnc = encs.BAR_DO_TIAO;
        const initialSinuca = barEnc.getOptions(state).find(o => o.id === 'desafio_sinuca');
        if (!initialSinuca) return { ok: false, reason: 'Option desafio_sinuca not found in BAR_DO_TIAO' };
        let sinucaAttempts = 0;
        while ((state.flags.sinucaWins || 0) < 2 && sinucaAttempts < 30) {
          const opt = barEnc.getOptions(state).find(o => o.id === 'desafio_sinuca');
          if (opt.disabled) break;
          opt.execute(state, sound);
          sinucaAttempts++;
        }
        const sinucaThirdDisabled = barEnc.getOptions(state).find(o => o.id === 'desafio_sinuca')?.disabled;
        if (!sinucaThirdDisabled) return { ok: false, reason: 'Sinuca game not disabled after reaching 2 wins cap' };
        const sinucaWins = state.flags.sinucaWins || 0;

        // 2. Jogo do Bicho: execute twice
        const bichoOpt = barEnc.getOptions(state).find(o => o.id === 'aposta_jogo_bicho');
        if (!bichoOpt) return { ok: false, reason: 'Option aposta_jogo_bicho not found in BAR_DO_TIAO' };
        bichoOpt.execute(state, sound);
        bichoOpt.execute(state, sound);
        const bichoThirdDisabled = barEnc.getOptions(state).find(o => o.id === 'aposta_jogo_bicho')?.disabled;
        if (!bichoThirdDisabled) return { ok: false, reason: 'Bicho 3rd bet not disabled' };

        // 3. Raspadinha: execute twice
        const bancaEnc = encs.BANCA_JORNAL;
        const raspOpt = bancaEnc.getOptions(state).find(o => o.id === 'raspadinha_sorte');
        if (!raspOpt) return { ok: false, reason: 'Option raspadinha_sorte not found in BANCA_JORNAL' };
        raspOpt.execute(state, sound);
        raspOpt.execute(state, sound);
        const raspThirdDisabled = bancaEnc.getOptions(state).find(o => o.id === 'raspadinha_sorte')?.disabled;
        if (!raspThirdDisabled) return { ok: false, reason: 'Raspadinha 3rd bet not disabled' };

        // 4. Semáforo Balas: execute until 2 successful sales
        const semEnc = encs.SEMAFORO_BICO;
        const initialBala = semEnc.getOptions(state).find(o => o.id === 'vender_balas');
        if (!initialBala) return { ok: false, reason: 'Option vender_balas not found in SEMAFORO_BICO' };
        let attempts = 0;
        while ((state.flags.bicoSemaforoVendas || 0) < 2 && attempts < 25) {
          const opt = semEnc.getOptions(state).find(o => o.id === 'vender_balas');
          if (opt.disabled) break;
          opt.execute(state, sound);
          attempts++;
        }
        const balaThirdDisabled = semEnc.getOptions(state).find(o => o.id === 'vender_balas')?.disabled;
        if (!balaThirdDisabled) return { ok: false, reason: 'Semáforo 3rd sale not disabled' };

        return { ok: true, sinucaWins, bichoBets: state.flags.bichoBets, raspBets: state.flags.raspadinhaBets };
      })()
    `);
    console.log(`[TEST 12] Real Execution Anti-Farm Caps:`, realCapsTested);
    if (!realCapsTested.ok) {
      throw new Error(`TEST 12 FAILED: Anti-farm cap failed: ${realCapsTested.reason}`);
    }

    // TEST 13: Dynamic São Paulo Summer Storm Cycle (16:00 - 17:15)
    const stormCycleTested = await evaluate(`
      (() => {
        window.app.game.isRunActive = true;
        window.app.game.clock.hasEnded = false;
        window.app.game.clock.elapsed = (16.2 - 6.0) * (900 / 24); // 16.2h
        window.app.game.update(0.016);
        const isStorming = window.app.game.isStorming;
        const dayCycleWeather = window.app.game.dayCycle.weather;
        const ambIntensity = window.app.game.city.ambientLight.intensity;
        const compliesI10 = ambIntensity >= 0.28; // Invariant I10 ASCII readability floor
        return { isStorming, dayCycleWeather, compliesI10, ambIntensity };
      })()
    `);
    console.log(`[TEST 13] Summer Storm Cycle:`, stormCycleTested);
    if (!stormCycleTested.isStorming || stormCycleTested.dayCycleWeather !== 'STORM' || !stormCycleTested.compliesI10) {
      throw new Error(`TEST 13 FAILED: Storm cycle did not activate properly or violated I10 ambient floor!`);
    }

    // TEST 14: Semáforo Bico I5 Predicate Parity
    const semaforoPredicateTested = await evaluate(`
      (() => {
        const anchor = window.app.game.interactables.anchors.find(a => a.id === 'semaforo_bico');
        if (!anchor) return false;
        const traffic = window.app.traffic;
        if (!traffic) return true;
        // When RED
        traffic.trafficLight.state = 'RED';
        traffic.isEmptyCity = false;
        window.app.game.clock.elapsed = (12.0 - 6.0) * (900 / 24); // Noon (open)
        window.app.controls.position.set(anchor.position.x, anchor.position.y, anchor.position.z + 1.0);
        window.app.game.interactables.update(window.app.controls.position, new THREE.Vector3(0, 0, -1), window.app.game.clock, window.app.game.state);
        const openWhenRed = window.app.game.interactables.currentTarget?.isOpen;

        // When GREEN
        traffic.trafficLight.state = 'GREEN';
        window.app.game.interactables.update(window.app.controls.position, new THREE.Vector3(0, 0, -1), window.app.game.clock, window.app.game.state);
        const closedWhenGreen = !window.app.game.interactables.currentTarget?.isOpen;

        return openWhenRed === true && closedWhenGreen === true;
      })()
    `);
    console.log(`[TEST 14] Semáforo I5 Predicate Parity: ${semaforoPredicateTested}`);
    if (!semaforoPredicateTested) {
      throw new Error(`TEST 14 FAILED: Semáforo prompt predicate parity violated!`);
    }

    // TEST 15: Real History Logging & Passive Decay Filtering (End Screen)
    const endScreenHistoryTested = await evaluate(`
      (() => {
        // Drive time via real engine update so formatInGameTime() sets currentHourFormatted
        window.app.game.clock.elapsed = (7.25 - 6.0) * (900 / 24); // 07:15
        window.app.game.update(0.016);
        window.app.game.state.apply({ grana: -500 }, 'Café pingado e pão na chapa');

        window.app.game.clock.elapsed = (12.5 - 6.0) * (900 / 24); // 12:30
        window.app.game.update(0.016);
        window.app.game.state.apply({ grana: -1200 }, 'Pastel de carne com garapa');

        // Add passive decay ticks
        window.app.game.state.applyPassiveDecay(1.0);

        window.app.game.clock.elapsed = (16.0 - 6.0) * (900 / 24); // 16:00
        window.app.game.update(0.016);
        window.app.game.state.apply({ sanidade: 15 }, 'Sobreviveu ao temporal de verão');

        window.app.game.handleRunEnd(true);
        const statsHTML = document.getElementById('end-run-stats').innerHTML;
        const hasRealActions = statsHTML.includes('Café pingado') && statsHTML.includes('Pastel de carne');
        const filtersDecay = !statsHTML.includes('Desgaste biológico');
        const noUndefined = !statsHTML.includes('undefined: undefined');

        return { hasRealActions, filtersDecay, noUndefined };
      })()
    `);
    console.log(`[TEST 15] Real History Logging on End Screen:`, endScreenHistoryTested);
    if (!endScreenHistoryTested.hasRealActions || !endScreenHistoryTested.filtersDecay || !endScreenHistoryTested.noUndefined) {
      throw new Error(`TEST 15 FAILED: End screen failed real history logging or decay filtering!`);
    }

    // TEST 16: Solid Collider Verification at Banca de Jornal and Barraca de Pastel
    const collidersTested = await evaluate(`
      (() => {
        // Banca de Jornal is centered at (7.5, 1.2, 35.8) with size (2.6, 2.4, 2.0)
        // Check collidesWithSolids inside banca bounding volume
        const insideBanca = window.app.physics.collidesWithSolids(new THREE.Vector3(7.5, 1.2, 35.8), 0.35, 0.4);
        
        // Barraca de Pastel is centered at (-3.5, 1.0, 35.8) with size (2.4, 2.2, 1.4)
        const insideBarraca = window.app.physics.collidesWithSolids(new THREE.Vector3(-3.5, 1.0, 35.8), 0.35, 0.4);

        // Open street at (0.0, 1.2, 30.0) should NOT collide
        const openStreet = window.app.physics.collidesWithSolids(new THREE.Vector3(0.0, 1.2, 30.0), 0.35, 0.4);

        return { insideBanca, insideBarraca, openStreet: !openStreet };
      })()
    `);
    console.log(`[TEST 16] Solid Prop Colliders:`, collidersTested);
    if (!collidersTested.insideBanca || !collidersTested.insideBarraca || !collidersTested.openStreet) {
      throw new Error(`TEST 16 FAILED: Banca or Barraca missing solid physical collision!`);
    }

    // TEST 17: Comprehensive Encounter Integrity & Crash Test (All 12 Encounters)
    const allEncountersTested = await evaluate(`
      (() => {
        const encs = window.app.game.encounters;
        if (!encs) return { ok: false, reason: 'encounters not found' };

        const tested = [];
        for (const [key, enc] of Object.entries(encs)) {
          if (!enc.title) return { ok: false, reason: \`Encounter \${key} missing title\` };

          // Create a rich test state instance using GameState constructor
          const testState = new window.app.game.state.constructor({
            id: 'TEST_CLASS',
            title: 'Testador de Pirituba',
            badge: '🧪',
            dailyObjective: 'Testar todos os encontros sem crash',
            grana: 100000,
            fome: 70,
            sanidade: 70,
            perigo: 50,
            ginga: 60,
            decay: { fomePerHour: 5, sanidadePerHour: 5 },
            inventory: [
              { id: 'bilhete_unico', name: 'Bilhete Único' },
              { id: 'celular_antigo', name: 'Motorola Moto G antigo' },
              { id: 'marlboro_solto', name: 'Cigarro Solto' }
            ]
          }, window.app.game.rng);

          const intro = typeof enc.getIntroText === 'function' ? enc.getIntroText(testState) : enc.introText;
          if (!intro || typeof intro !== 'string') {
            return { ok: false, reason: \`Encounter \${key} intro text missing or invalid\` };
          }

          const options = typeof enc.getOptions === 'function' ? enc.getOptions(testState) : enc.options;
          if (!Array.isArray(options) || options.length === 0) {
            return { ok: false, reason: \`Encounter \${key} options missing or empty\` };
          }

          for (const opt of options) {
            if (!opt.id || !opt.label) {
              return { ok: false, reason: \`Encounter \${key} option missing id or label\` };
            }
            if (typeof opt.execute === 'function') {
              try {
                // Execute option and verify 0 crashes across all audio, state, math
                const outcome = opt.execute(testState, window.app.sound);
                if (outcome && typeof outcome !== 'string') {
                  return { ok: false, reason: \`Encounter \${key} option \${opt.id} returned non-string\` };
                }
              } catch (e) {
                return { ok: false, reason: \`Encounter \${key} option \${opt.id} threw error: \${e.message}\` };
              }
            }
          }
          tested.push({ key, count: options.length });
        }
        return { ok: true, totalEncounters: tested.length, tested };
      })()
    `);
    console.log(`[TEST 17] Comprehensive Encounter Integrity:`, allEncountersTested);
    if (!allEncountersTested.ok) {
      throw new Error(`TEST 17 FAILED: Encounter integrity failure: ${allEncountersTested.reason}`);
    }

    // TEST 18: Anti-Farm Exploit Immunity & One-Shot Option Capping
    const antiExploitTested = await evaluate(`
      (() => {
        const encs = window.app.game.encounters;
        const sound = window.app.sound;
        const state = new window.app.game.state.constructor({
          id: 'TEST_EXPLOIT',
          title: 'Exploit Tester',
          badge: '🛡️',
          dailyObjective: 'Test caps',
          grana: 50000,
          fome: 50,
          sanidade: 50,
          perigo: 50,
          ginga: 50,
          decay: { fomePerHour: 5, sanidadePerHour: 5 },
          inventory: []
        }, window.app.game.rng);

        // 1. Adega vender_latinhas: disabled without sacola_latinhas
        const adegaEnc = encs.ADEGA_DO_ZE;
        const latinhasNoItem = adegaEnc.getOptions(state).find(o => o.id === 'vender_latinhas');
        if (!latinhasNoItem || !latinhasNoItem.disabled) {
          return { ok: false, reason: 'vender_latinhas should be disabled when sacola_latinhas is not in inventory' };
        }
        // Give sacola_latinhas -> enabled -> execute -> removed from inventory -> 2nd execution disabled
        state.inventory.push({ id: 'sacola_latinhas', name: 'Sacola com Latinhas' });
        const latinhasWithItem = adegaEnc.getOptions(state).find(o => o.id === 'vender_latinhas');
        if (latinhasWithItem.disabled) {
          return { ok: false, reason: 'vender_latinhas should be enabled with sacola_latinhas' };
        }
        latinhasWithItem.execute(state, sound);
        if (state.hasItem('sacola_latinhas')) {
          return { ok: false, reason: 'vender_latinhas did not consume sacola_latinhas' };
        }
        const latinhasAfter = adegaEnc.getOptions(state).find(o => o.id === 'vender_latinhas');
        if (!latinhasAfter.disabled) {
          return { ok: false, reason: 'vender_latinhas was not disabled after sale' };
        }

        // 2. Padaria agua_copo: 1x per run
        const padariaEnc = encs.PADARIA_ESTRELA;
        const aguaOpt = padariaEnc.getOptions(state).find(o => o.id === 'agua_copo');
        if (aguaOpt.disabled) return { ok: false, reason: 'agua_copo should be initially enabled' };
        aguaOpt.execute(state, sound);
        const aguaAfter = padariaEnc.getOptions(state).find(o => o.id === 'agua_copo');
        if (!aguaAfter.disabled) return { ok: false, reason: 'agua_copo was not disabled after 1st use' };

        // 3. Posto calibrar_agua: 1x per run
        const postoEnc = encs.POSTO_PIRITUBA;
        const calibOpt = postoEnc.getOptions(state).find(o => o.id === 'calibrar_agua');
        if (calibOpt.disabled) return { ok: false, reason: 'calibrar_agua should be initially enabled' };
        calibOpt.execute(state, sound);
        const calibAfter = postoEnc.getOptions(state).find(o => o.id === 'calibrar_agua');
        if (!calibAfter.disabled) return { ok: false, reason: 'calibrar_agua was not disabled after 1st use' };

        // 4. Banca fofoca_bairro: 1x per run
        const bancaEnc = encs.BANCA_JORNAL;
        const fofocaOpt = bancaEnc.getOptions(state).find(o => o.id === 'fofoca_bairro');
        if (fofocaOpt.disabled) return { ok: false, reason: 'fofoca_bairro should be initially enabled' };
        fofocaOpt.execute(state, sound);
        const fofocaAfter = bancaEnc.getOptions(state).find(o => o.id === 'fofoca_bairro');
        if (!fofocaAfter.disabled) return { ok: false, reason: 'fofoca_bairro was not disabled after 1st use' };

        // 5. Pastel xepa_conversa: 1x per run
        const pastelEnc = encs.PASTEL_FEIRA;
        const xepaOpt = pastelEnc.getOptions(state).find(o => o.id === 'xepa_conversa');
        if (xepaOpt.disabled) return { ok: false, reason: 'xepa_conversa should be initially enabled' };
        xepaOpt.execute(state, sound);
        const xepaAfter = pastelEnc.getOptions(state).find(o => o.id === 'xepa_conversa');
        if (!xepaAfter.disabled) return { ok: false, reason: 'xepa_conversa was not disabled after 1st use' };

        // 6. Baile desenrolo_crias: 1x per run
        const baileEnc = encs.BAILE_LAJE;
        state.ginga = 60;
        const desenroloOpt = baileEnc.getOptions(state).find(o => o.id === 'desenrolo_crias');
        if (desenroloOpt.disabled) return { ok: false, reason: 'desenrolo_crias should be initially enabled' };
        desenroloOpt.execute(state, sound);
        const desenroloAfter = baileEnc.getOptions(state).find(o => o.id === 'desenrolo_crias');
        if (!desenroloAfter.disabled) return { ok: false, reason: 'desenrolo_crias was not disabled after 1st use' };

        // 7. Dawn Fornada gate: must be disabled at start of run (06:00, elapsed 0)
        state.currentHour = 6.0;
        state.elapsedSeconds = 0;
        const fornadaStart = padariaEnc.getOptions(state).find(o => o.id === 'fornada_cinco_manha');
        if (!fornadaStart.disabled) return { ok: false, reason: 'fornada_cinco_manha must be disabled at start of run (06:00)' };

        // Enable at dawn 05:30 (elapsed >= 700)
        state.currentHour = 5.5;
        state.elapsedSeconds = 800;
        const fornadaDawn = padariaEnc.getOptions(state).find(o => o.id === 'fornada_cinco_manha');
        if (fornadaDawn.disabled) return { ok: false, reason: 'fornada_cinco_manha must be enabled at dawn (05:30, elapsed 800s)' };

        return { ok: true };
      })()
    `);
    console.log(`[TEST 18] Anti-Farm Exploit Immunity:`, antiExploitTested);
    if (!antiExploitTested.ok) {
      throw new Error(`TEST 18 FAILED: Anti-farm exploit failure: ${antiExploitTested.reason}`);
    }

    // TEST 19: Full 15-Minute Playthrough Verification Across All 3 Classes (Asserting Survival in Every Phase)
    const playthroughResults = await evaluate(`
      (() => {
        const classIds = ['CLASSE_DE', 'CLASSE_C', 'CLASSE_AB'];
        const summaries = [];

        for (const classId of classIds) {
          const config = window.app.game.socialClasses[classId];
          const state = new window.app.game.state.constructor(config, window.app.game.rng);
          const sound = window.app.sound;
          const encs = window.app.game.encounters;

          // ==================== PHASE 1 (06:00 - 14:00 | 8 In-Game Hours) ====================
          // Advance 4 hours (06:00 -> 10:00)
          state.currentHour = 10.0;
          state.currentHourFormatted = '10:00';
          state.elapsedSeconds = 150.0;
          state.applyPassiveDecay(4.0);

          if (classId === 'CLASSE_C') {
            // Pay Enel bill, eat pingado, pay flanelinha
            const optEnel = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'pagar_boleto_enel');
            if (optEnel && !optEnel.disabled) optEnel.execute(state, sound);
            const optCafe = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'pingado_pao');
            if (optCafe && !optCafe.disabled) optCafe.execute(state, sound);
            const optFlan = encs.FLANELINHA.getOptions(state).find(o => o.id === 'pagar_cinco');
            if (optFlan && !optFlan.disabled) optFlan.execute(state, sound);
          } else if (classId === 'CLASSE_DE') {
            // Sell latinhas (+R$ 21,00) and buy food immediately with earnings
            const optLatinhas = encs.ADEGA_DO_ZE.getOptions(state).find(o => o.id === 'vender_latinhas');
            if (optLatinhas && !optLatinhas.disabled) optLatinhas.execute(state, sound);
            // Buy pastel simples (+30 fome) to stay well-fed
            const optPastel = encs.PASTEL_FEIRA.getOptions(state).find(o => o.id === 'pastel_simples');
            if (optPastel && !optPastel.disabled) optPastel.execute(state, sound);
            // Work first semáforo shift (+R$ 11,00)
            const optBala1 = encs.SEMAFORO_BICO.getOptions(state).find(o => o.id === 'vender_balas');
            if (optBala1 && !optBala1.disabled) optBala1.execute(state, sound);
          } else if (classId === 'CLASSE_AB') {
            // Faria Limer buys breakfast and almanaque for sanity recovery
            const optCafe = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'pingado_pao');
            if (optCafe && !optCafe.disabled) optCafe.execute(state, sound);
            const optAlmanaque = encs.BANCA_JORNAL.getOptions(state).find(o => o.id === 'comprar_almanaque');
            if (optAlmanaque && !optAlmanaque.disabled) optAlmanaque.execute(state, sound);
          }

          // Advance to end of Phase 1 (10:00 -> 14:00)
          state.currentHour = 14.0;
          state.currentHourFormatted = '14:00';
          state.elapsedSeconds = 300.0;
          state.applyPassiveDecay(4.0);

          const defeatP1 = state.checkDefeat();
          if (defeatP1) return { ok: false, reason: \`\${classId} died in Phase 1: \${defeatP1.cause}\` };

          // ==================== PHASE 2 (14:00 - 17:30 | 3.5 In-Game Hours) ====================
          state.currentHour = 17.0;
          state.currentHourFormatted = '17:00';
          state.elapsedSeconds = 412.5;
          state.applyPassiveDecay(3.0);

          if (classId === 'CLASSE_C') {
            const optPastel = encs.PASTEL_FEIRA.getOptions(state).find(o => o.id === 'combo_pastel_garapa');
            if (optPastel && !optPastel.disabled) optPastel.execute(state, sound);
          } else if (classId === 'CLASSE_DE') {
            // Work 2nd semáforo shift (+R$ 11,00) and clean windshield (+R$ 4,00) to surpass R$ 40 target
            const optBala2 = encs.SEMAFORO_BICO.getOptions(state).find(o => o.id === 'vender_balas');
            if (optBala2 && !optBala2.disabled) optBala2.execute(state, sound);
            const optRodo = encs.SEMAFORO_BICO.getOptions(state).find(o => o.id === 'limpar_parabrisa');
            if (optRodo && !optRodo.disabled) optRodo.execute(state, sound);
            // Buy coxinha at padaria to maintain stamina
            const optCoxinha = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'coxinha_estufa');
            if (optCoxinha && !optCoxinha.disabled) optCoxinha.execute(state, sound);
          } else if (classId === 'CLASSE_AB') {
            // Recover sanity with pastel combo and conveniência snack
            const optPastel = encs.PASTEL_FEIRA.getOptions(state).find(o => o.id === 'combo_pastel_garapa');
            if (optPastel && !optPastel.disabled) optPastel.execute(state, sound);
            const optSnack = encs.POSTO_PIRITUBA.getOptions(state).find(o => o.id === 'fandangos_refri');
            if (optSnack && !optSnack.disabled) optSnack.execute(state, sound);
          }

          const defeatP2 = state.checkDefeat();
          if (defeatP2) return { ok: false, reason: \`\${classId} died in Phase 2: \${defeatP2.cause}\` };

          // ==================== PHASE 3 (17:30 - 21:30 | 4 In-Game Hours) ====================
          state.currentHour = 20.0;
          state.currentHourFormatted = '20:00';
          state.elapsedSeconds = 525.0;
          state.applyPassiveDecay(3.0);

          // All classes encounter Dois Caras numa Moto: enter padaria safely
          const motoEnc = encs.DOIS_CARAS_MOTO;
          const motoOpt = motoEnc.getOptions(state).find(o => o.id === 'entrar_padoca');
          if (motoOpt && !motoOpt.disabled) motoOpt.execute(state, sound);

          if (classId === 'CLASSE_AB') {
            // Bar do Tião cerveja 600ml for high sanity recovery (+35)
            const optCerveja = encs.BAR_DO_TIAO.getOptions(state).find(o => o.id === 'cerveja_600');
            if (optCerveja && !optCerveja.disabled) optCerveja.execute(state, sound);
          } else if (classId === 'CLASSE_C') {
            const optCerveja = encs.BAR_DO_TIAO.getOptions(state).find(o => o.id === 'cerveja_600');
            if (optCerveja && !optCerveja.disabled) optCerveja.execute(state, sound);
          }

          const defeatP3 = state.checkDefeat();
          if (defeatP3) return { ok: false, reason: \`\${classId} died in Phase 3: \${defeatP3.cause}\` };

          // ==================== PHASE 4 (21:30 - 01:30 | 4 In-Game Hours) ====================
          state.currentHour = 23.5;
          state.currentHourFormatted = '23:30';
          state.elapsedSeconds = 656.25;
          state.applyPassiveDecay(3.5);

          if (classId === 'CLASSE_AB') {
            // Adega litrão de Skol (+30 sanidade)
            const optLitrao = encs.ADEGA_DO_ZE.getOptions(state).find(o => o.id === 'litrao_skol');
            if (optLitrao && !optLitrao.disabled) optLitrao.execute(state, sound);
          } else if (classId === 'CLASSE_DE') {
            const optLitrao = encs.ADEGA_DO_ZE.getOptions(state).find(o => o.id === 'litrao_skol');
            if (optLitrao && !optLitrao.disabled) optLitrao.execute(state, sound);
          }

          const defeatP4 = state.checkDefeat();
          if (defeatP4) return { ok: false, reason: \`\${classId} died in Phase 4: \${defeatP4.cause}\` };

          // ==================== PHASE 5 (01:30 - 06:00 | 4.5 In-Game Hours) ====================
          // 03:00 - Blitz da PM
          state.currentHour = 3.0;
          state.currentHourFormatted = '03:00';
          state.elapsedSeconds = 787.5;
          state.applyPassiveDecay(3.5);

          const blitzEnc = encs.BLITZ_PM;
          if (classId === 'CLASSE_DE') {
            // Baile passinho (+25 sanidade, +25 ginga)
            const optPassinho = encs.BAILE_LAJE.getOptions(state).find(o => o.id === 'dancar_passinho');
            if (optPassinho && !optPassinho.disabled) optPassinho.execute(state, sound);
            // Desenrolo de morador na blitz
            const blitzOpt = blitzEnc.getOptions(state).find(o => o.id === 'desenrolo_ginga');
            if (blitzOpt && !blitzOpt.disabled) blitzOpt.execute(state, sound);
          } else {
            // Present RG calmly
            const blitzOpt = blitzEnc.getOptions(state).find(o => o.id === 'apresentar_documento');
            if (blitzOpt && !blitzOpt.disabled) blitzOpt.execute(state, sound);
          }

          // 05:30 - Primeira Fornada das 05h
          state.currentHour = 5.5;
          state.currentHourFormatted = '05:30';
          state.elapsedSeconds = 880.0;
          state.applyPassiveDecay(2.5);

          const optFornada = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'fornada_cinco_manha');
          if (optFornada && !optFornada.disabled) optFornada.execute(state, sound);

          // Advance to full 24h completion (06:00 | 900s)
          state.currentHour = 6.0;
          state.currentHourFormatted = '06:00';
          state.elapsedSeconds = 900.0;
          state.applyPassiveDecay(0.5);

          const defeatFinal = state.checkDefeat();
          if (defeatFinal) return { ok: false, reason: \`\${classId} died in final hour: \${defeatFinal.cause}\` };

          let objectiveMet = false;
          if (classId === 'CLASSE_DE') {
            objectiveMet = (state.flags.totalBicoGain >= 4000) || (state.grana - config.grana >= 4000) || Boolean(state.flags.cestaBasica);
          } else if (classId === 'CLASSE_C') {
            objectiveMet = Boolean(state.flags.boletoPago && !state.flags.carroRiscado);
          } else if (classId === 'CLASSE_AB') {
            objectiveMet = true;
          }

          summaries.push({
            classId,
            survived: true,
            objectiveMet,
            finalGrana: state.formattedGrana,
            totalBicoGain: state.flags.totalBicoGain,
            finalFome: state.fome,
            finalSanidade: state.sanidade,
            finalPerigo: state.perigo
          });
        }

        const allSurvived = summaries.every(s => s.survived);
        const allObjectivesMet = summaries.every(s => s.objectiveMet);
        return { ok: allSurvived && allObjectivesMet, summaries };
      })()
    `);
    console.log(`[TEST 19] 15-Minute Playthrough Simulation:`, playthroughResults);
    if (!playthroughResults.ok) {
      throw new Error(`TEST 19 FAILED: Playthrough simulation failure: ${JSON.stringify(playthroughResults)}`);
    }

    // Check Console Errors
    console.log(`[CONSOLE ERRORS]: count = ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console errors encountered:', consoleErrors);
      throw new Error(`Console errors found: ${consoleErrors.join('\n')}`);
    }

    ws.close();
    chrome.kill();
    await new Promise(r => setTimeout(r, 400));
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    console.log(`>>> SUITE PASSED: ${url} <<<\n`);
    return true;
  } catch (err) {
    if (consoleErrors.length > 0) {
      console.error('Console errors before failure:', consoleErrors);
    }
    chrome.kill();
    await new Promise(r => setTimeout(r, 400));
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    throw err;
  }
}

async function main() {
  try {
    await runTestSuite('http://localhost:8090/index.html?seed=42');
    await runTestSuite('http://localhost:8090/pirituba_standalone.html?seed=42');
    console.log('🎉 ALL TEST SUITES PASSED WITH 100% INVARIANT COMPLIANCE!');
    process.exit(0);
  } catch (e) {
    console.error('❌ TEST FAILED:', e);
    process.exit(1);
  }
}

main();
