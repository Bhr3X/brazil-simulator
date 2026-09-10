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
      window.app.game.clock.elapsed = 387.5; // 21:30
      window.app.game.clock.setHour(11.5, true); // forward to DAY
    `);
    const elapsedAfterForward = await evaluate(`window.app.game.clock.elapsed`);
    const hasEndedAfterForward = await evaluate(`window.app.game.clock.hasEnded`);
    console.log(`[TEST 3a] RunClock forward advancement: elapsed=${elapsedAfterForward}, hasEnded=${hasEndedAfterForward}`);
    if (elapsedAfterForward < 387.5 || elapsedAfterForward !== 600) {
      throw new Error(`TEST 3a FAILED: RunClock should have clamped forward to 600s, got ${elapsedAfterForward}`);
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
    if (elapsedAfterExploitAttempt !== 100 || !runStillActive) {
      throw new Error(`TEST 3b FAILED: cycleTimeOfDay allowed instant time skip or win during active run!`);
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
    chrome.kill();
    await new Promise(r => setTimeout(r, 400));
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    throw err;
  }
}

async function main() {
  try {
    await runTestSuite('http://localhost:8090/index.html');
    await runTestSuite('http://localhost:8090/pirituba_standalone.html');
    console.log('🎉 ALL TEST SUITES PASSED WITH 100% INVARIANT COMPLIANCE!');
    process.exit(0);
  } catch (e) {
    console.error('❌ TEST FAILED:', e);
    process.exit(1);
  }
}

main();
