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
    let pageTarget = null;
    for (let retry = 0; retry < 25; retry++) {
      try {
        await new Promise(r => setTimeout(r, 400));
        const listRes = await fetch(`http://127.0.0.1:${port}/json`);
        if (listRes.ok) {
          const targets = await listRes.json();
          pageTarget = targets.find(t => t.type === 'page');
          if (pageTarget) break;
        }
      } catch (e) {}
    }
    if (!pageTarget) throw new Error(`Chrome CDP page target not reachable on port ${port}`);

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
    await send('Page.navigate', { url });

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

    // TEST 2b: Keyboard Arrow Keys Full Rotation (Look Up, Down, Left, Right)
    const arrowRotResult = await evaluate(`
      (() => {
        const ctrl = window.app.controls;
        const initialEulerX = ctrl.euler.x;
        const initialEulerY = ctrl.euler.y;

        // 1. Look Left (Yaw left / increase euler.y)
        ctrl.onKeyDown({ code: 'ArrowLeft' });
        ctrl.update(0.1);
        ctrl.onKeyUp({ code: 'ArrowLeft' });
        const leftEulerY = ctrl.euler.y;

        // 2. Look Right (Yaw right / decrease euler.y)
        ctrl.onKeyDown({ code: 'ArrowRight' });
        ctrl.update(0.2);
        ctrl.onKeyUp({ code: 'ArrowRight' });
        const rightEulerY = ctrl.euler.y;

        // 3. Look Up (Pitch up / increase euler.x)
        ctrl.onKeyDown({ code: 'ArrowUp' });
        ctrl.update(0.1);
        ctrl.onKeyUp({ code: 'ArrowUp' });
        const upEulerX = ctrl.euler.x;

        // 4. Look Down (Pitch down / decrease euler.x)
        ctrl.onKeyDown({ code: 'ArrowDown' });
        ctrl.update(0.2);
        ctrl.onKeyUp({ code: 'ArrowDown' });
        const downEulerX = ctrl.euler.x;

        // Reset euler to clean orientation
        ctrl.euler.set(0, 0, 0, 'YXZ');
        ctrl.camera.quaternion.setFromEuler(ctrl.euler);

        return {
          leftTurned: leftEulerY > initialEulerY,
          rightTurned: rightEulerY < leftEulerY,
          pitchedUp: upEulerX > initialEulerX,
          pitchedDown: downEulerX < upEulerX
        };
      })()
    `);
    console.log('[TEST 2b] Keyboard Arrow Keys Rotation:', arrowRotResult);
    if (!arrowRotResult.leftTurned || !arrowRotResult.rightTurned || !arrowRotResult.pitchedUp || !arrowRotResult.pitchedDown) {
      throw new Error(`TEST 2b FAILED: Arrow keys rotation check failed: ${JSON.stringify(arrowRotResult)}`);
    }

    // TEST 2c: Brazilian Music System & Rádio Pirituba FM (MPB, Pagode, Funk)
    const musicTest = await evaluate(`
      (() => {
        const sound = window.app.sound;
        if (!sound.isInitialized) sound.init();

        const engine = sound.musicEngine;
        if (!engine) return { error: 'musicEngine missing' };

        // 1. Initial state
        const initialStation = sound.getRadioStation();

        // 2. Cycle stations: AUTO -> MPB -> PAGODE -> FUNK -> OFF -> AUTO
        const cycled = [];
        for (let i = 0; i < 5; i++) {
          const s = sound.cycleRadioStation();
          cycled.push({ station: s.id, effectiveGenre: sound.getEffectiveGenre() });
        }

        // 3. Test AUTO mode context switching:
        sound.setRadioStation('AUTO');
        sound.updateMusicContext('BAR_DO_TIAO', 14.0);
        const tiaoGenre = sound.getEffectiveGenre();

        sound.updateMusicContext('BAILE_LAJE', 14.0);
        const lajeGenre = sound.getEffectiveGenre();

        sound.updateMusicContext('PADARIA_ESTRELA', 10.0);
        const morningGenre = sound.getEffectiveGenre();

        sound.updateMusicContext('POSTO_PIRITUBA', 19.0);
        const eveningGenre = sound.getEffectiveGenre();

        sound.updateMusicContext('POSTO_PIRITUBA', 23.5);
        const nightGenre = sound.getEffectiveGenre();

        // 4. Test KeyN hotkey event
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', bubbles: true }));
        const postKeyNStation = sound.getRadioStation();

        // 5. Check HUD label
        const radioText = document.getElementById('hud-radio')?.textContent;

        // Reset to AUTO
        sound.setRadioStation('AUTO');

        return {
          ok: true,
          initialStation,
          cycled,
          tiaoGenre,
          lajeGenre,
          morningGenre,
          eveningGenre,
          nightGenre,
          postKeyNStation,
          radioText
        };
      })()
    `);
    console.log('[TEST 2c] Brazilian Music Engine & Radio Station Tuning:', musicTest);
    if (
      !musicTest.ok ||
      musicTest.tiaoGenre !== 'PAGODE' ||
      musicTest.lajeGenre !== 'FUNK' ||
      musicTest.morningGenre !== 'MPB' ||
      musicTest.eveningGenre !== 'PAGODE' ||
      musicTest.nightGenre !== 'FUNK' ||
      musicTest.postKeyNStation !== 'MPB' ||
      !musicTest.radioText?.includes('MPB') ||
      musicTest.cycled.length !== 5 ||
      musicTest.cycled[0].station !== 'MPB' ||
      musicTest.cycled[1].station !== 'PAGODE' ||
      musicTest.cycled[2].station !== 'FUNK' ||
      musicTest.cycled[3].station !== 'OFF' ||
      musicTest.cycled[4].station !== 'AUTO'
    ) {
      throw new Error(`TEST 2c FAILED: Music engine test failed: ${JSON.stringify(musicTest)}`);
    }

    // TEST 2d: Visual Parameters, Character Density, & Real-Time Tuning
    const visualTest = await evaluate(`
      (() => {
        const app = window.app;
        const renderer = app.renderer;
        if (!renderer || !renderer.params) return { error: 'renderer params missing' };

        // 1. Initial defaults
        const initialDensity = renderer.params.density;
        const initialCols = renderer.asciiCols;
        const initialCharW = renderer.charW;

        // 2. Adjust density
        renderer.setVisualParams({ density: 1.8, brightness: 1.4, contrast: 1.3, gamma: 1.35, edgeEnhance: true, rampType: 'CONTRAST' });
        const highDensity = renderer.params.density;
        const highCols = renderer.asciiCols;
        const highCharW = renderer.charW;

        // 3. Test hotkey [P] to toggle Visuals Modal
        const prePFreeze = app.controls.freeze;
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', bubbles: true }));
        const modalOpen = !document.getElementById('visuals-modal').classList.contains('modal-hidden');
        const postPFreeze = app.controls.freeze;

        // Verify moto trigger is gated while visuals modal is open
        const motoPreActive = app.game.isAnyModalActive();
        app.game.triggerDoisCarasMoto();
        const dialogOpenUnderModal = app.game.dialog.isOpen;

        // 4. Test hotkey [Escape] to close
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
        const modalClosed = document.getElementById('visuals-modal').classList.contains('modal-hidden');
        const postCloseFreeze = app.controls.freeze;
        const immunityTimerSet = app.game.collisionImmunityTimer >= 2.0;

        // 4b. Test Digit keys do NOT leak to Dialog when Visuals overlay is open
        app.game.dialog.open({ title: 'Test', text: 'LeakTest', options: [{ label: 'Option 1', execute: () => {} }] }, () => {});
        const dialogOpenBefore = app.game.dialog.isOpen;
        app.toggleVisualsModal(true);
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1', bubbles: true }));
        const dialogStillOpenUnderOverlay = app.game.dialog.isOpen;
        app.toggleVisualsModal(false);
        app.game.dialog.close();

        // 5. Test hotkey [ and ] density stepping & slider sync
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'BracketRight', bubbles: true }));
        const steppedUpDensity = renderer.params.density;
        const sliderDensityUp = Number(document.getElementById('slider-density').value);

        // Test ABNT2 layout using key property
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '[', bubbles: true }));
        const steppedDownDensity = renderer.params.density;
        const sliderDensityDown = Number(document.getElementById('slider-density').value);

        // 6. Test hotkey - and = brightness stepping
        const preBright = renderer.params.brightness;
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Equal', bubbles: true }));
        const postBrightUp = renderer.params.brightness;
        const sliderBrightUp = Number(document.getElementById('slider-brightness').value);

        // Test modifier guard: Ctrl+Equal should NOT alter brightness (protects Zoom)
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Equal', ctrlKey: true, bubbles: true }));
        const guardProtectedBright = renderer.params.brightness;

        // Test Ctrl+P does NOT toggle visuals (protects Print)
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', ctrlKey: true, bubbles: true }));
        const ctrlPProtected = document.getElementById('visuals-modal').classList.contains('modal-hidden');

        // Test Ctrl-crouch does NOT swallow game hotkeys: [M] should cycle render mode even when ctrlKey is true
        renderer.setRenderMode('ASCII_COLOR');
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', ctrlKey: true, bubbles: true }));
        const ctrlCrouchKeyMSuccess = renderer.currentMode === 'ASCII_MATRIX';

        // 7. Test render mode cycling through all 11 modes
        renderer.setRenderMode('ASCII_COLOR');
        const modeCycle = [];
        for (let i = 0; i < 11; i++) {
          modeCycle.push(renderer.cycleRenderMode());
        }

        // Test select-render-mode dropdown and preset buttons
        const selectMode = document.getElementById('select-render-mode');
        const hasSelectMode = !!selectMode && selectMode.options.length === 11;
        const btnThermal = document.getElementById('preset-thermal');
        const btnWireframe = document.getElementById('preset-wireframe');
        const btnBraille = document.getElementById('preset-braille');
        const hasNewPresets = !!(btnThermal && btnWireframe && btnBraille);

        // 8. Reset to defaults
        renderer.resetVisualParams();
        const resetDensity = renderer.params.density;
        const resetBrightness = renderer.params.brightness;
        const resetContrast = renderer.params.contrast;
        const resetGamma = renderer.params.gamma;

        return {
          ok: true,
          initialDensity,
          initialCols,
          initialCharW,
          highDensity,
          highCols,
          highCharW,
          colsIncreased: highCols > initialCols,
          charWShrunk: highCharW < initialCharW,
          prePFreeze,
          modalOpen,
          postPFreeze,
          motoPreActive,
          dialogOpenUnderModal,
          modalClosed,
          postCloseFreeze,
          immunityTimerSet,
          dialogOpenBefore,
          dialogStillOpenUnderOverlay,
          steppedUpDensity,
          sliderDensityUp,
          steppedDownDensity,
          sliderDensityDown,
          preBright,
          postBrightUp,
          sliderBrightUp,
          guardProtectedBright,
          ctrlPProtected,
          ctrlCrouchKeyMSuccess,
          modeCycle,
          hasSelectMode,
          hasNewPresets,
          resetDensity,
          resetBrightness,
          resetContrast,
          resetGamma
        };
      })()
    `);
    console.log('[TEST 2d] Visual Parameters & Real-Time Tuning:', visualTest);
    if (
      !visualTest.ok ||
      !visualTest.colsIncreased ||
      !visualTest.charWShrunk ||
      !visualTest.modalOpen ||
      visualTest.postPFreeze !== true ||
      !visualTest.motoPreActive ||
      visualTest.dialogOpenUnderModal ||
      !visualTest.modalClosed ||
      visualTest.postCloseFreeze !== false ||
      !visualTest.immunityTimerSet ||
      visualTest.dialogOpenBefore !== true ||
      visualTest.dialogStillOpenUnderOverlay !== true ||
      visualTest.postBrightUp <= visualTest.preBright ||
      Math.abs(visualTest.sliderDensityUp - visualTest.steppedUpDensity) > 0.05 ||
      Math.abs(visualTest.sliderDensityDown - visualTest.steppedDownDensity) > 0.05 ||
      visualTest.guardProtectedBright !== visualTest.postBrightUp ||
      visualTest.ctrlPProtected !== true ||
      visualTest.ctrlCrouchKeyMSuccess !== true ||
      JSON.stringify(visualTest.modeCycle) !== JSON.stringify(['ASCII_MATRIX', 'ASCII_AMBER', 'ASCII_CYBER', 'ASCII_BRAILLE', 'SHADER_THERMAL', 'SHADER_DITHER', 'SHADER_COMIC', 'SHADER_WIREFRAME', 'SHADER_VHS', 'RETRO_3D', 'ASCII_COLOR']) ||
      !visualTest.hasSelectMode ||
      !visualTest.hasNewPresets ||
      visualTest.resetDensity !== 1.0 ||
      visualTest.resetBrightness !== 1.0 ||
      visualTest.resetContrast !== 1.0 ||
      visualTest.resetGamma !== 1.0
    ) {
      throw new Error(`TEST 2d FAILED: Visual parameters test failed: ${JSON.stringify(visualTest)}`);
    }

    // TEST 2e: 3rd Person Perspective & Avatar Rigging & Controls
    const thirdPersonTest = await evaluate(`
      (() => {
        const c = window.app.controls;
        const cam = window.app.renderer.camera;
        const btn = document.getElementById('btn-camera');
        const initial3rd = c.isThirdPerson;
        const initialMeshVis = c.avatarMesh ? c.avatarMesh.visible : false;
        const initialBtnText = btn ? btn.textContent : '';

        // 1. Hotkey [B] Toggle
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB', key: 'b' }));
        const postB3rd = c.isThirdPerson;
        const postBMeshVis = c.avatarMesh ? c.avatarMesh.visible : false;
        const postBBtnText = btn ? btn.textContent : '';

        // Check camera pulled back in 3rd person
        c.update(0.05);
        const camDist3rd = Math.sqrt(
          (cam.position.x - c.position.x) ** 2 +
          (cam.position.z - c.position.z) ** 2
        );

        // Check avatar hierarchy
        const hasTorso = !!c.avatarTorso;
        const hasHead = !!c.avatarHead;
        const hasLimbs = !!(c.avatarLeftArm && c.avatarRightArm && c.avatarLeftLeg && c.avatarRightLeg);

        // 2. Walking animation gait test
        c.moveForward = true;
        c.canJump = true;
        c.update(0.12);
        const walkLegL = c.avatarLeftLeg ? c.avatarLeftLeg.rotation.x : 0;
        const walkLegR = c.avatarRightLeg ? c.avatarRightLeg.rotation.x : 0;
        const walkArmL = c.avatarLeftArm ? c.avatarLeftArm.rotation.x : 0;
        const walkArmR = c.avatarRightArm ? c.avatarRightArm.rotation.x : 0;
        c.moveForward = false;

        // 3. Crouch squash test
        c.isCrouching = true;
        c.update(0.1);
        const crouchScaleY = c.avatarMesh ? c.avatarMesh.scale.y : 1.0;
        c.isCrouching = false;
        c.update(0.3);
        const uncrouchScaleY = c.avatarMesh ? c.avatarMesh.scale.y : 1.0;

        // 4. UI Button Click toggle back to 1st person
        if (btn) btn.click();
        const postClick3rd = c.isThirdPerson;
        const postClickMeshVis = c.avatarMesh ? c.avatarMesh.visible : false;
        c.update(0.05);
        const camDist1st = Math.sqrt(
          (cam.position.x - c.position.x) ** 2 +
          (cam.position.z - c.position.z) ** 2
        );

        // 5. Mouse wheel zoom toggle
        // Scroll down (deltaY > 0) -> activates 3rd person
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
        const postWheelDown3rd = c.isThirdPerson;
        // Scroll up multiple times (deltaY < 0) -> zooms in until 1st person
        for (let i = 0; i < 10; i++) {
          window.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
        }
        const postWheelUp3rd = c.isThirdPerson;

        return {
          ok: true,
          initial3rd,
          initialMeshVis,
          initialBtnText,
          postB3rd,
          postBMeshVis,
          postBBtnText,
          camDist3rd,
          hasTorso,
          hasHead,
          hasLimbs,
          legsSwingOpposite: (walkLegL * walkLegR) < 0,
          armsSwingOpposite: (walkArmL * walkArmR) < 0,
          crouchSquashed: crouchScaleY < 0.95,
          uncrouchRecovered: uncrouchScaleY > crouchScaleY,
          postClick3rd,
          postClickMeshVis,
          camDist1st,
          postWheelDown3rd,
          postWheelUp3rd
        };
      })()
    `);
    console.log('[TEST 2e] 3rd Person Mode & Avatar Rigging:', thirdPersonTest);
    if (
      !thirdPersonTest.ok ||
      thirdPersonTest.initial3rd !== false ||
      thirdPersonTest.initialMeshVis !== false ||
      !thirdPersonTest.initialBtnText.includes('1ª PESSOA') ||
      thirdPersonTest.postB3rd !== true ||
      thirdPersonTest.postBMeshVis !== true ||
      !thirdPersonTest.postBBtnText.includes('3ª PESSOA') ||
      thirdPersonTest.camDist3rd < 1.5 ||
      !thirdPersonTest.hasTorso ||
      !thirdPersonTest.hasHead ||
      !thirdPersonTest.hasLimbs ||
      !thirdPersonTest.legsSwingOpposite ||
      !thirdPersonTest.armsSwingOpposite ||
      !thirdPersonTest.crouchSquashed ||
      !thirdPersonTest.uncrouchRecovered ||
      thirdPersonTest.postClick3rd !== false ||
      thirdPersonTest.postClickMeshVis !== false ||
      thirdPersonTest.camDist1st > 0.1 ||
      thirdPersonTest.postWheelDown3rd !== true ||
      thirdPersonTest.postWheelUp3rd !== false
    ) {
      throw new Error(`TEST 2e FAILED: 3rd person mode test failed: ${JSON.stringify(thirdPersonTest)}`);
    }

    // TEST 2f: Depth-Scaled Monospace Quantization & Studio Branding Parity
    const depthStudioTest = await evaluate(`
      (() => {
        const app = window.app;
        const renderer = app.renderer;
        if (!renderer || !renderer.params) return { error: 'renderer params missing' };

        // 1. Initial depth scale & tier verification
        const initialDepth = renderer.params.depthScale;
        const initialTiers = renderer.depthFontTiers ? renderer.depthFontTiers.map(t => ({ scale: t.scale, sizePx: t.sizePx })) : null;

        // 2. Set depthScale to 1.8x
        renderer.setVisualParams({ depthScale: 1.8 });
        app.syncVisualControlsUI();
        const highDepth = renderer.params.depthScale;
        const highTiers = renderer.depthFontTiers.map(t => ({ scale: t.scale, sizePx: t.sizePx }));
        const sliderValAfterSet = Number(document.getElementById('slider-depth')?.value);
        const readoutTextAfterSet = document.getElementById('val-depth')?.textContent;

        // 3. Set depthScale via slider DOM event
        const depthSlider = document.getElementById('slider-depth');
        if (depthSlider) {
          depthSlider.value = '0.5';
          depthSlider.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const sliderInputDepth = renderer.params.depthScale;
        const sliderInputReadout = document.getElementById('val-depth')?.textContent;

        // 4. Flatten depthScale to 0.0 (uniform font scaling across all depth bands)
        renderer.setVisualParams({ depthScale: 0.0 });
        const flatTiers = renderer.depthFontTiers.map(t => t.scale);
        const allFlatOne = flatTiers.every(s => Math.abs(s - 1.0) < 0.001);

        // 5. Extended Visual Controls: FOV, Bloom, Fog & Color Palettes
        const initialFov = renderer.params.fov;
        const initialBloom = renderer.params.bloom;
        const initialFog = renderer.params.fogDensity;
        const initialPalette = renderer.params.colorPalette;
        const hasInitialFogObj = !!renderer.scene.fog;

        // Test FOV adjustment
        renderer.setVisualParams({ fov: 90 });
        app.syncVisualControlsUI();
        const postSetCamFov = renderer.camera.fov;
        const sliderFovVal = Number(document.getElementById('slider-fov')?.value);
        const readoutFovText = document.getElementById('val-fov')?.textContent;

        // Test Bloom adjustment
        renderer.setVisualParams({ bloom: 1.4 });
        app.syncVisualControlsUI();
        const postSetBloom = renderer.params.bloom;
        const sliderBloomVal = Number(document.getElementById('slider-bloom')?.value);
        const readoutBloomText = document.getElementById('val-bloom')?.textContent;

        // Test Fog adjustment
        renderer.setVisualParams({ fogDensity: 2.0 });
        app.syncVisualControlsUI();
        const postSetFog = renderer.params.fogDensity;
        const fogDensityVal = renderer.scene.fog ? renderer.scene.fog.density : 0;
        renderer.setVisualParams({ fogDensity: 0.0 });
        const zeroFogObj = renderer.scene.fog;

        // Test Palette adjustment & grading
        renderer.setVisualParams({ colorPalette: 'VAPORWAVE' });
        app.syncVisualControlsUI();
        const postSetPalette = renderer.params.colorPalette;
        const paletteSelectVal = document.getElementById('select-palette')?.value;
        const [rVap, gVap, bVap] = renderer.applyColorPalette(100, 100, 100, 0.5);
        const isPaletteGraded = (rVap !== 100 || gVap !== 100 || bVap !== 100);

        // 6. Reset params
        renderer.resetVisualParams();
        app.syncVisualControlsUI();
        const resetDepth = renderer.params.depthScale;
        const resetFov = renderer.params.fov;
        const resetBloom = renderer.params.bloom;
        const resetFog = renderer.params.fogDensity;
        const resetPalette = renderer.params.colorPalette;

        // 7. Studio Branding & Attribution Verification
        const btnStudio = document.getElementById('btn-studio');
        const studioBadge = document.querySelector('.studio-badge a');
        const studioBtnHref = btnStudio ? btnStudio.getAttribute('href') : null;
        const studioBtnText = btnStudio ? btnStudio.textContent : null;
        const studioBadgeHref = studioBadge ? studioBadge.getAttribute('href') : null;
        const studioBadgeText = studioBadge ? studioBadge.textContent : null;

        return {
          ok: true,
          initialDepth,
          initialTiersCount: initialTiers ? initialTiers.length : 0,
          highDepth,
          highTiersCount: highTiers ? highTiers.length : 0,
          highDistantTierSmaller: highTiers && highTiers[5].sizePx < highTiers[0].sizePx,
          sliderValAfterSet,
          readoutTextAfterSet,
          sliderInputDepth,
          sliderInputReadout,
          allFlatOne,
          initialFov,
          initialBloom,
          initialFog,
          initialPalette,
          hasInitialFogObj,
          postSetCamFov,
          sliderFovVal,
          readoutFovText,
          postSetBloom,
          sliderBloomVal,
          readoutBloomText,
          postSetFog,
          fogDensityVal,
          zeroFogObj,
          postSetPalette,
          paletteSelectVal,
          isPaletteGraded,
          resetDepth,
          resetFov,
          resetBloom,
          resetFog,
          resetPalette,
          studioBtnHref,
          studioBtnText,
          studioBadgeHref,
          studioBadgeText
        };
      })()
    `);
    console.log('[TEST 2f] Depth-Scaled ASCII Perspective, Extended Visuals & Studio Branding:', depthStudioTest);
    if (
      !depthStudioTest.ok ||
      depthStudioTest.initialDepth !== 1.0 ||
      depthStudioTest.initialTiersCount !== 6 ||
      depthStudioTest.highDepth !== 1.8 ||
      !depthStudioTest.highDistantTierSmaller ||
      Math.abs(depthStudioTest.sliderValAfterSet - 1.8) > 0.05 ||
      !depthStudioTest.readoutTextAfterSet?.includes('1.8x') ||
      Math.abs(depthStudioTest.sliderInputDepth - 0.5) > 0.05 ||
      !depthStudioTest.sliderInputReadout?.includes('0.5x') ||
      !depthStudioTest.allFlatOne ||
      depthStudioTest.initialFov !== 70 ||
      depthStudioTest.postSetCamFov !== 90 ||
      depthStudioTest.sliderFovVal !== 90 ||
      !depthStudioTest.readoutFovText?.includes('90°') ||
      depthStudioTest.initialBloom !== 0.0 ||
      Math.abs(depthStudioTest.postSetBloom - 1.4) > 0.05 ||
      Math.abs(depthStudioTest.sliderBloomVal - 1.4) > 0.05 ||
      !depthStudioTest.readoutBloomText?.includes('1.4x') ||
      depthStudioTest.initialFog !== 0.8 ||
      !depthStudioTest.hasInitialFogObj ||
      Math.abs(depthStudioTest.postSetFog - 2.0) > 0.05 ||
      depthStudioTest.fogDensityVal <= 0.005 ||
      depthStudioTest.zeroFogObj !== null ||
      depthStudioTest.initialPalette !== 'DEFAULT' ||
      depthStudioTest.postSetPalette !== 'VAPORWAVE' ||
      depthStudioTest.paletteSelectVal !== 'VAPORWAVE' ||
      !depthStudioTest.isPaletteGraded ||
      depthStudioTest.resetDepth !== 1.0 ||
      depthStudioTest.resetFov !== 70 ||
      depthStudioTest.resetBloom !== 0.0 ||
      depthStudioTest.resetFog !== 0.8 ||
      depthStudioTest.resetPalette !== 'DEFAULT' ||
      depthStudioTest.studioBtnHref !== 'https://bhr3x.github.io/game.md/' ||
      !depthStudioTest.studioBtnText?.includes('game.md') ||
      depthStudioTest.studioBadgeHref !== 'https://bhr3x.github.io/game.md/' ||
      !depthStudioTest.studioBadgeText?.includes('game.md')
    ) {
      throw new Error(`TEST 2f FAILED: Depth perspective & studio branding test failed: ${JSON.stringify(depthStudioTest)}`);
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

    // TEST 7: Verify WASD and Arrow Keys ignored when frozen on End Screen
    await evaluate(`
      window.app.controls.onKeyDown({ code: 'KeyW' });
      window.app.controls.onKeyDown({ code: 'ArrowUp' });
      window.app.controls.onKeyDown({ code: 'ArrowLeft' });
    `);
    const moveForward = await evaluate(`window.app.controls.moveForward`);
    const lookUp = await evaluate(`window.app.controls.lookUp`);
    const lookLeft = await evaluate(`window.app.controls.lookLeft`);
    console.log(`[TEST 7] KeyW & Arrows pressed during End Screen: moveForward=${moveForward}, lookUp=${lookUp}, lookLeft=${lookLeft}`);
    if (moveForward === true || lookUp === true || lookLeft === true) {
      throw new Error('TEST 7 FAILED: Movement/Rotation was true despite frozen controls');
    }

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
        const testPos = new THREE.Vector3(baileAnchor.position.x, baileAnchor.position.y, baileAnchor.position.z + 1.0);
        window.app.game.clock.elapsed = (3.0 - 6.0 + 24) % 24 * (900 / 24); // 03:00
        window.app.game.interactables.update(testPos, new THREE.Vector3(0, 0, -1), window.app.game.clock, window.app.game.state);
        const openAt3 = window.app.game.interactables.currentTarget?.isOpen;

        window.app.game.clock.elapsed = (12.0 - 6.0) * (900 / 24); // 12:00
        window.app.game.interactables.update(testPos, new THREE.Vector3(0, 0, -1), window.app.game.clock, window.app.game.state);
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
            // Padaria Estrela (open until 20:00): afternoon coxinha + caldo de cana
            const optCoxinha = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'coxinha_estufa');
            if (optCoxinha && !optCoxinha.disabled) optCoxinha.execute(state, sound);
          } else if (classId === 'CLASSE_DE') {
            // Work semáforo shifts (up to quota of 2 sales and 2 windshield cleanings) to ensure R$ 40 target
            for (let a = 0; a < 4; a++) {
              const optBala = encs.SEMAFORO_BICO.getOptions(state).find(o => o.id === 'vender_balas');
              if (optBala && !optBala.disabled) optBala.execute(state, sound);
            }
            for (let a = 0; a < 4; a++) {
              const optRodo = encs.SEMAFORO_BICO.getOptions(state).find(o => o.id === 'limpar_parabrisa');
              if (optRodo && !optRodo.disabled) optRodo.execute(state, sound);
            }
            // Buy coxinha at padaria to maintain stamina
            const optCoxinha = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'coxinha_estufa');
            if (optCoxinha && !optCoxinha.disabled) optCoxinha.execute(state, sound);
          } else if (classId === 'CLASSE_AB') {
            // Recover sanity & hunger at Padaria Estrela (open until 20h) and Posto Pirituba (open 24h)
            const optCoxinha = encs.PADARIA_ESTRELA.getOptions(state).find(o => o.id === 'coxinha_estufa');
            if (optCoxinha && !optCoxinha.disabled) optCoxinha.execute(state, sound);
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

    // TEST 20: Roaming NPC System & Dynamic Utility
    const npcTest = await evaluate(`
      (() => {
        const game = window.app.game;
        const npcs = game ? game.npcs : null;
        if (!npcs || !npcs.npcs || npcs.npcs.length < 4) {
          return { ok: false, reason: 'NpcSystem or NPCs array missing' };
        }

        const ids = npcs.npcs.map(n => n.id);
        const expectedIds = ['clodoaldo', 'caramelo', 'juninho', 'dona_neide', 'sargento_rocha', 'menor_corre'];
        const hasAllIds = expectedIds.every(id => ids.includes(id));

        // Check 3D groups and children
        const validMeshes = npcs.npcs.every(n => n.group && n.group.children.length > 0);

        // Check dynamic targets exported for raycasting
        const targets = npcs.getInteractableTargets();
        const validTargets = targets.length >= 4 && targets.every(t => t.isOpen && t.position && t.prompt);

        // Test motion update: advance coordinates along waypoints
        const initialClodoaldoX = npcs.npcs[0].group.position.x;
        npcs.update(1.0, { x: 0, y: 1.2, z: 0 }, false, game.state);
        const postMoveClodoaldoX = npcs.npcs[0].group.position.x;
        const hasMoved = initialClodoaldoX !== postMoveClodoaldoX;

        // Test encounter definitions and options
        const encBaleiro = window.app.game.encounters['NPC_BALEIRO'];
        const encCaramelo = window.app.game.encounters['NPC_CARAMELO'];
        const encBike = window.app.game.encounters['NPC_BIKE'];
        const encNeide = window.app.game.encounters['NPC_DONA_NEIDE'];
        const encPol = window.app.game.encounters['NPC_POLICIA'];
        const encMal = window.app.game.encounters['NPC_MALANDRO'];
        const hasAllEncounters = !!(encBaleiro && encCaramelo && encBike && encNeide && encPol && encMal);

        // Test Caramelo interaction execution
        const petOption = encCaramelo.getOptions(game.state).find(o => o.id === 'carinho_caramelo');
        const preSanidade = game.state.sanidade;
        const petResult = petOption ? petOption.execute(game.state, window.app.sound) : null;
        const postSanidade = game.state.sanidade;
        const petSucceeded = postSanidade >= preSanidade && !!petResult;

        // Test Dona Neide starving protection (free meal if hungry)
        const savedFome = game.state.fome;
        game.state.fome = 15;
        const marmitaOption = encNeide.getOptions(game.state).find(o => o.id === 'comprar_marmita');
        const isFreeWhenStarving = marmitaOption && marmitaOption.costCentavos === 0;
        game.state.fome = savedFome;

        return {
          ok: hasAllIds && validMeshes && validTargets && hasMoved && hasAllEncounters && petSucceeded && isFreeWhenStarving,
          ids,
          validMeshes,
          targetsCount: targets.length,
          hasMoved,
          hasAllEncounters,
          petSucceeded,
          isFreeWhenStarving
        };
      })()
    `);
    console.log(`[TEST 20] Roaming NPC System & Dynamic Utility:`, npcTest);
    if (!npcTest.ok) {
      throw new Error(`TEST 20 FAILED: NPC test failed: ${JSON.stringify(npcTest)}`);
    }

    // TEST 21: Mobile Touch Controls & Virtual Joystick Subsystem
    const touchTest = await evaluate(`
      (() => {
        const touch = window.app.touch;
        const controls = window.app.controls;
        if (!touch) return { ok: false, error: 'TouchController missing' };

        // Ensure modals closed and controls active for touch testing
        document.getElementById('end-run-modal').classList.add('modal-hidden');
        document.getElementById('dialogue-modal').classList.add('modal-hidden');
        controls.refreshFreeze();
        controls.hasStarted = true;

        // Force enable touch mode for test verification
        touch.enable();
        const isEnabled = touch.isEnabled;
        const containerVisible = !touch.container.classList.contains('touch-hidden');
        const bodyClass = document.body.classList.contains('mobile-touch-active');

        // Helper for touch events
        const simulateTouch = (handlerName, id, x, y) => {
          try {
            const t = new Touch({ identifier: id, target: document.body, clientX: x, clientY: y });
            const type = handlerName.replace('handleTouch', 'touch').toLowerCase();
            window.dispatchEvent(new TouchEvent(type, { changedTouches: [t], touches: [t], cancelable: true }));
          } catch (e) {
            touch[handlerName]({
              changedTouches: [{ identifier: id, target: document.body, clientX: x, clientY: y }],
              preventDefault: () => {}
            });
          }
        };

        // 1. Test Virtual Joystick Simulation (Left Zone)
        simulateTouch('handleTouchStart', 101, 120, 250);
        const baseDisplayed = touch.joystickBase.style.display === 'block';

        // Move thumbstick forward (dy = -40px)
        simulateTouch('handleTouchMove', 101, 120, 210);
        const hasMoveVector = controls.touchMoveVector && controls.touchMoveVector.y < -0.5;

        // Release thumbstick: vector resets to 0 and moveTouchId clears while base remains visible
        simulateTouch('handleTouchEnd', 101, 120, 210);
        const moveReset = controls.touchMoveVector.y === 0 && touch.moveTouchId === null;

        // 2. Test Swipe-to-Look Simulation (Right Zone)
        const initialPitch = controls.euler.x;
        const initialYaw = controls.euler.y;
        const lookStartX = window.innerWidth - 80;
        simulateTouch('handleTouchStart', 102, lookStartX, 200);
        simulateTouch('handleTouchMove', 102, lookStartX - 60, 170);
        const yawChanged = controls.euler.y !== initialYaw;
        const pitchChanged = controls.euler.x !== initialPitch;
        simulateTouch('handleTouchEnd', 102, lookStartX - 60, 170);

        // 3. Test Action Buttons: Jump, Crouch, Camera, Menu
        controls.canJump = true;
        touch.btnJump.dispatchEvent(new Event('touchstart'));
        const jumpTriggered = controls.velocity.y > 0;

        const initialCrouch = controls.isCrouching;
        touch.btnCrouch.dispatchEvent(new Event('touchstart'));
        const crouchToggled = controls.isCrouching !== initialCrouch;
        touch.btnCrouch.dispatchEvent(new Event('touchstart')); // restore

        const initial3rd = controls.isThirdPerson;
        touch.btnCam.dispatchEvent(new Event('touchstart'));
        const camToggled = controls.isThirdPerson !== initial3rd;
        touch.btnCam.dispatchEvent(new Event('touchstart')); // restore

        // Menu drawer
        touch.btnMenu.dispatchEvent(new Event('touchstart'));
        const drawerOpen = !touch.menuDrawer.classList.contains('modal-hidden');
        document.getElementById('btn-close-mobile-menu').click();
        const drawerClosed = touch.menuDrawer.classList.contains('modal-hidden');

        // Check stick ticks & base elements
        const hasTicks = !!document.getElementById('stick-tick-up') && !!document.getElementById('stick-tick-down');
        const hasBase = !!document.getElementById('touch-joystick-base');

        // Restore state
        touch.disable();
        const disabledDisplayNone = touch.joystickBase.style.display === 'none';

        return {
          ok: isEnabled && containerVisible && bodyClass && baseDisplayed && hasMoveVector && moveReset &&
              yawChanged && pitchChanged && jumpTriggered && crouchToggled && camToggled && drawerOpen && drawerClosed &&
              hasTicks && hasBase && disabledDisplayNone,
          isEnabled,
          containerVisible,
          bodyClass,
          baseDisplayed,
          hasMoveVector,
          moveReset,
          yawChanged,
          pitchChanged,
          jumpTriggered,
          crouchToggled,
          camToggled,
          drawerOpen,
          drawerClosed,
          hasTicks,
          hasBase,
          disabledDisplayNone
        };
      })()
    `);
    console.log(`[TEST 21] Mobile Touch Controls & Virtual Joystick Subsystem:`, touchTest);
    if (!touchTest.ok) {
      throw new Error(`TEST 21 FAILED: Touch controls test failed: ${JSON.stringify(touchTest)}`);
    }

    // TEST 22: Expanded City Streets, Bank & Bankruptcy Defeat, Cops & Thugs, and Visual Action Badges
    const expansionTest = await evaluate(`
      (() => {
        const game = window.app.game;
        const state = game.state;
        const dialog = game.dialog;
        const interactables = game.interactables;

        // 1. Check Bank Anchor & Encounter
        const bankAnchor = interactables.anchors.find(a => a.id === 'banco');
        const hasBankAnchor = !!bankAnchor && bankAnchor.encounterId === 'BANCO_PIRITUBA';

        const encBanco = game.encounters['BANCO_PIRITUBA'];
        const encPol = game.encounters['NPC_POLICIA'];
        const encMal = game.encounters['NPC_MALANDRO'];
        const hasAllNewEncounters = !!(encBanco && encPol && encMal);

        // 2. Test Bank Overdraft & Defeat Conditions
        const savedGrana = state.grana;
        const savedTimer = state.bankruptTimer;

        // Saque Cheque Especial drives balance negative
        const saqueOpt = encBanco.getOptions(state).find(o => o.id === 'saque_cheque_especial');
        state.grana = 1000;
        saqueOpt.execute(state, window.app.sound);
        const balanceWentNegative = state.grana < 0;

        // Test Overdraft Limit Defeat (-R$ 150,00)
        state.grana = -15500;
        const defeatLimit = state.checkDefeat();
        const limitDefeatPassed = defeatLimit && defeatLimit.cause.includes('FALÊNCIA');

        // Test Bankruptcy Timer Defeat (>= 90s)
        state.grana = -5000;
        state.bankruptTimer = 92;
        const defeatTimer = state.checkDefeat();
        const timerDefeatPassed = defeatTimer && defeatTimer.cause.includes('FALÊNCIA');

        // Restore state
        state.grana = savedGrana;
        state.bankruptTimer = savedTimer;

        // 3. Test Cops & Thugs Narrative Interactions
        // Snitch to police
        const caguetarOpt = encPol.getOptions(state).find(o => o.id === 'caguetar_malandro');
        state.flags.caguetouMalandro = false;
        caguetarOpt.execute(state, window.app.sound);
        const snitchFlagRaised = state.flags.caguetouMalandro === true;

        // When snitched, Menor do Corre offers Cobrança
        const malandroOptions = encMal.getOptions(state);
        const hasCobranca = malandroOptions.some(o => o.id === 'cobranca_pedagio');

        // Normal crime courier gig
        state.flags.caguetouMalandro = false;
        const correOpt = encMal.getOptions(state).find(o => o.id === 'fazer_corre_crime');
        const preCorreGrana = state.grana;
        correOpt.execute(state, window.app.sound);
        const correEarnedGrana = state.grana === preCorreGrana + 7500;

        // 4. Test Visual Action Badges in Dialog
        const gainBadges = dialog.formatActionBadges({ gainCentavos: 8000, label: 'Corre do Crime' });
        const hasGreenPips = gainBadges.includes('badge-gain') && gainBadges.includes('💵 $$$$$');

        const costBadges = dialog.formatActionBadges({ costCentavos: 1200, label: 'Lanche' });
        const hasRedPips = costBadges.includes('badge-cost') && costBadges.includes('🔻 -$$');

        const statBadges = dialog.formatActionBadges({ deltas: { fome: 30, sanidade: -15, perigo: 20 } });
        const hasStatBadges = statBadges.includes('🍗 +30%') && statBadges.includes('🧠 -15%') && statBadges.includes('🚨 +20%');

        return {
          ok: hasBankAnchor && hasAllNewEncounters && balanceWentNegative && limitDefeatPassed &&
              timerDefeatPassed && snitchFlagRaised && hasCobranca && correEarnedGrana &&
              hasGreenPips && hasRedPips && hasStatBadges,
          hasBankAnchor,
          hasAllNewEncounters,
          balanceWentNegative,
          limitDefeatPassed,
          timerDefeatPassed,
          snitchFlagRaised,
          hasCobranca,
          correEarnedGrana,
          hasGreenPips,
          hasRedPips,
          hasStatBadges
        };
      })()
    `);
    console.log(`[TEST 22] Expanded City Streets, Bank, Cops & Thugs, and Visual Action Badges:`, expansionTest);
    if (!expansionTest.ok) {
      throw new Error(`TEST 22 FAILED: Expansion test failed: ${JSON.stringify(expansionTest)}`);
    }

    // TEST 23: Bilingual Language Switcher (PT 🇧🇷 / EN 🇺🇸)
    const langTest = await evaluate(`
      (() => {
        const btnLang = document.getElementById('btn-lang');
        const hudLangLabel = document.getElementById('hud-lang-label');
        const mobileBtnLang = document.getElementById('mobile-btn-lang');
        const rouletteGroup = document.getElementById('roulette-lang-group');
        const ptBtn = document.querySelector('.lang-btn[data-lang="pt"]');
        const enBtn = document.querySelector('.lang-btn[data-lang="en"]');
        const statMoney = document.getElementById('stat-money');
        const statFome = document.getElementById('stat-fome');
        const statSanidade = document.getElementById('stat-sanidade');
        const statPerigo = document.getElementById('stat-perigo');
        const hudObj = document.getElementById('hud-objective');

        const hasSwitchers = !!(btnLang && hudLangLabel && mobileBtnLang && rouletteGroup && ptBtn && enBtn);

        // 1. Initial State should be Portuguese
        const initialLabel = hudLangLabel ? hudLangLabel.textContent.trim() : '';
        const initialPtActive = ptBtn ? ptBtn.classList.contains('active') : false;
        const initialMoneyPt = statMoney ? statMoney.textContent.includes('GRANA') : false;
        const initialObjPt = hudObj ? hudObj.textContent.includes('META DO DIA:') : false;

        // 2. Toggle to English via button click
        btnLang.click();
        const enLabel = hudLangLabel ? hudLangLabel.textContent.trim() : '';
        const enActive = enBtn ? enBtn.classList.contains('active') : false;
        const moneyEn = statMoney ? statMoney.textContent.includes('CASH') : false;
        const fomeEn = statFome ? statFome.textContent.includes('HUNGER') : false;
        const sanidadeEn = statSanidade ? statSanidade.textContent.includes('SANITY') : false;
        const perigoEn = statPerigo ? statPerigo.textContent.includes('HEAT') : false;
        const objEn = hudObj ? hudObj.textContent.includes('DAILY GOAL:') : false;

        // Verify Dialog Localization in English
        const sampleDialog = window.app.game.dialog.localizeData({
          id: 'PADARIA_ESTRELA',
          encounterId: 'PADARIA_ESTRELA',
          title: '🥖 PADARIA ESTRELA DE PIRITUBA',
          options: [{ id: 'pingado_pao', label: 'Pingado no copo americano' }]
        });
        const dialogTranslated = sampleDialog && sampleDialog.title.includes('ESTRELA BAKERY') &&
                                 sampleDialog.options[0].label.includes('Half-and-half');

        // 3. Toggle back to Portuguese via roulette button click
        ptBtn.click();
        const backPtLabel = hudLangLabel ? hudLangLabel.textContent.trim() : '';
        const backPtActive = ptBtn ? ptBtn.classList.contains('active') : false;
        const backMoneyPt = statMoney ? statMoney.textContent.includes('GRANA') : false;
        const backObjPt = hudObj ? hudObj.textContent.includes('META DO DIA:') : false;

        return {
          ok: hasSwitchers && initialLabel.includes('PT') && initialPtActive && initialMoneyPt && initialObjPt &&
              enLabel.includes('EN') && enActive && moneyEn && fomeEn && sanidadeEn && perigoEn && objEn && dialogTranslated &&
              backPtLabel.includes('PT') && backPtActive && backMoneyPt && backObjPt,
          hasSwitchers,
          initialLabel,
          initialPtActive,
          initialMoneyPt,
          initialObjPt,
          enLabel,
          enActive,
          moneyEn,
          fomeEn,
          sanidadeEn,
          perigoEn,
          objEn,
          dialogTranslated,
          backPtLabel,
          backPtActive,
          backMoneyPt,
          backObjPt
        };
      })()
    `);
    console.log(`[TEST 23] Bilingual Language Switcher (PT 🇧🇷 / EN 🇺🇸):`, langTest);
    if (!langTest.ok) {
      throw new Error(`TEST 23 FAILED: Bilingual language switcher test failed: ${JSON.stringify(langTest)}`);
    }

    // TEST 24: Post-Interaction Pointer Lock Reacquisition & Mouse Look Continuity
    const pointerLockTest = await evaluate(`
      (() => {
        // Ensure active run state and hidden end-run modal for test
        const prevActive = window.app.game.isRunActive;
        window.app.game.isRunActive = true;
        const endModal = document.getElementById('end-run-modal');
        const prevEndHidden = endModal ? endModal.classList.contains('modal-hidden') : true;
        if (endModal) endModal.classList.add('modal-hidden');

        let lockRequestedCount = 0;
        const origRequest = window.app.controls.requestPointerLock;
        window.app.controls.requestPointerLock = function() {
          lockRequestedCount++;
          if (origRequest) origRequest.apply(this, arguments);
        };

        // 1. Single-step dialog (no outcome dialog)
        window.app.game.dialog.open({
          id: 'TEST_ENCOUNTER_1',
          title: 'Teste 1',
          text: 'Teste de Opção Direta',
          options: [
            { label: 'Opção Direta', execute: () => null }
          ]
        }, (opt) => {
          if (opt && opt.execute) opt.execute();
        });

        const openFrozen = window.app.controls.freeze === true;
        const openIsOpen = window.app.game.dialog.isOpen === true;

        // Select option 0 -> should close dialog, unfreeze controls, and re-request pointer lock
        window.app.game.dialog.selectOption(0);

        const afterSelectClosed = window.app.game.dialog.isOpen === false;
        const afterSelectUnfrozen = window.app.controls.freeze === false;
        const afterSelectLockedCount = lockRequestedCount;

        // 2. Multi-step dialog (with outcome confirmation)
        window.app.game.dialog.open({
          id: 'TEST_ENCOUNTER_2',
          title: 'Teste 2',
          text: 'Teste com Desfecho',
          options: [
            { label: 'Ação com Desfecho', execute: () => 'Ação realizada com sucesso.' }
          ]
        }, (opt) => {
          const outcome = opt.execute();
          if (outcome) {
            window.app.game.dialog.open({
              title: 'DESFECHO DO ENCONTRO',
              text: outcome,
              options: [{ label: 'Continuar o dia', execute: () => {} }]
            }, () => {});
          }
        });

        // Select option on first dialog -> triggers outcome modal
        window.app.game.dialog.selectOption(0);

        const outcomeModalOpen = window.app.game.dialog.isOpen === true;
        const countBeforeOutcomeDismiss = lockRequestedCount;

        // Select option on outcome modal ("Continuar o dia")
        window.app.game.dialog.selectOption(0);

        const outcomeClosed = window.app.game.dialog.isOpen === false;
        const outcomeUnfrozen = window.app.controls.freeze === false;
        const countAfterOutcomeDismiss = lockRequestedCount;

        // Restore original state
        window.app.controls.requestPointerLock = origRequest;
        window.app.game.isRunActive = prevActive;
        if (endModal && !prevEndHidden) endModal.classList.remove('modal-hidden');

        const ok = openFrozen &&
          openIsOpen &&
          afterSelectClosed &&
          afterSelectUnfrozen &&
          afterSelectLockedCount === 1 &&
          outcomeModalOpen &&
          countBeforeOutcomeDismiss === 1 &&
          outcomeClosed &&
          outcomeUnfrozen &&
          countAfterOutcomeDismiss === 2;

        return {
          ok,
          openFrozen,
          openIsOpen,
          afterSelectClosed,
          afterSelectUnfrozen,
          afterSelectLockedCount,
          outcomeModalOpen,
          countBeforeOutcomeDismiss,
          outcomeClosed,
          outcomeUnfrozen,
          countAfterOutcomeDismiss
        };
      })()
    `);
    console.log(`[TEST 24] Post-Interaction Pointer Lock Reacquisition:`, pointerLockTest);
    if (!pointerLockTest.ok) {
      throw new Error(`TEST 24 FAILED: Pointer lock reacquisition failed: ${JSON.stringify(pointerLockTest)}`);
    }

    // -------------------------------------------------------------
    // TEST 25: Elevator Transit, Multi-Floor Physics & FPS Hands Dual-Wield
    // -------------------------------------------------------------
    const elevatorHandsTest = await evaluate(`
      (function() {
        const app = window.app;
        if (!app) return { ok: false, reason: 'app not available' };

        // 1. Dismiss roulette and start run as CLASSE_AB (Faria Limer in Penthouse)
        document.getElementById('roulette-modal')?.classList.add('modal-hidden');
        if (app.controls.refreshFreeze) app.controls.refreshFreeze();
        app.controls.hasStarted = true;
        app.game.startRun('CLASSE_AB');

        const startY = app.controls.position.y;
        const abHands = app.game.hands ? app.game.hands.getHandStatus() : null;
        const hasIphone = abHands?.right?.id === 'IPHONE' && abHands?.left === null;

        // Position in front of Penthouse elevator doors
        app.controls.teleport(31.5, 32.25, 4.0, 0);
        app.game.interactables.update(app.controls.position, app.controls.getForwardVector(), app.game.clock, app.game.state);
        const penthouseTarget = app.game.interactables.currentTarget?.anchor?.id;

        // Trigger elevator descent
        app.game.handleInteract();

        // Advance physics to verify no snap-back to 32.05
        for (let i = 0; i < 15; i++) {
          app.controls.update(0.016);
        }
        const postDescentY = app.controls.position.y;
        const postDescentUnfrozen = !app.controls.freeze;
        const noModalOpen = !app.game.dialog?.isOpen;

        // Walk inside lobby
        app.controls.moveForward = true;
        for (let i = 0; i < 15; i++) {
          app.controls.update(0.016);
        }
        app.controls.moveForward = false;
        const lobbyWalkY = app.controls.position.y;

        // Trigger ground elevator to ascend back up
        app.controls.teleport(31.5, 0.25, 4.0, 0);
        app.game.interactables.update(app.controls.position, app.controls.getForwardVector(), app.game.clock, app.game.state);
        const groundTarget = app.game.interactables.currentTarget?.anchor?.id;
        app.game.handleInteract();

        for (let i = 0; i < 15; i++) {
          app.controls.update(0.016);
        }
        const postAscentY = app.controls.position.y;
        const postAscentUnfrozen = !app.controls.freeze;

        // 2. Test Quebrada starting loadout (JBL)
        app.game.startRun('CLASSE_DE');
        const deHands = app.game.hands ? app.game.hands.getHandStatus() : null;
        const hasJbl = deHands?.right?.id === 'JBL_SOUNDBOX' && deHands?.left === null;

        // 3. Test CLT starting loadout (Bilhete Único) & Hands mechanics
        app.game.startRun('CLASSE_C');
        const cltHands = app.game.hands ? app.game.hands.getHandStatus() : null;
        const hasBu = cltHands?.right?.id === 'CARTAO_ONIBUS' && cltHands?.left === null;

        // Bare left hand punch
        app.game.hands.useLeftHand(app.game.state);
        const leftPunched = app.game.hands.isLeftPunching;

        // Use Bilhete Único
        const sanidadeBefore = app.game.state.sanidade;
        const itemMsg = app.game.hands.useRightHand(app.game.state);
        const sanidadeAfter = app.game.state.sanidade;

        // Drop item
        app.game.hands.dropRightHand();
        const droppedHands = app.game.hands.getHandStatus();
        const bothHandsEmpty = droppedHands.left === null && droppedHands.right === null;

        // Bare right hand punch
        app.game.hands.useRightHand(app.game.state);
        const rightPunched = app.game.hands.isRightPunching;

        const ok = (
          startY >= 32.0 &&
          hasIphone &&
          penthouseTarget === 'elevador_penthouse' &&
          postDescentY < 1.0 &&
          postDescentUnfrozen &&
          noModalOpen &&
          lobbyWalkY < 1.0 &&
          groundTarget === 'elevador_terreo' &&
          postAscentY >= 32.0 &&
          postAscentUnfrozen &&
          hasJbl &&
          hasBu &&
          leftPunched &&
          sanidadeAfter > sanidadeBefore &&
          bothHandsEmpty &&
          rightPunched
        );

        return {
          ok,
          startY,
          hasIphone,
          penthouseTarget,
          postDescentY,
          postDescentUnfrozen,
          noModalOpen,
          lobbyWalkY,
          groundTarget,
          postAscentY,
          postAscentUnfrozen,
          hasJbl,
          hasBu,
          leftPunched,
          sanidadeBefore,
          sanidadeAfter,
          bothHandsEmpty,
          rightPunched
        };
      })()
    `);
    console.log(`[TEST 25] Elevator Transit, Multi-Floor Physics & FPS Hands Dual-Wield:`, elevatorHandsTest);
    if (!elevatorHandsTest.ok) {
      throw new Error(`TEST 25 FAILED: Elevator transit or hands dual-wield test failed: ${JSON.stringify(elevatorHandsTest)}`);
    }

    // TEST 26: 100% Walkable Interiors, Punchable House Doors & BRAHM.AI Boteco Furniture
    const walkableInteriorsTest = await evaluate(`
      (() => {
        const game = window.app.game;
        const physics = window.app.physics;
        const controls = window.app.controls;
        const interactables = game.interactables;

        // 1. Verify Padaria Estrela walkable floor collider at X=32, Z=42
        const padariaWalkable = physics.colliders.some(c =>
          c.type === 'walkable' && c.min.x <= 32 && c.max.x >= 32 && c.min.z <= 42 && c.max.z >= 42
        );

        // 2. Verify Borracharia walkable floor collider at X=-34, Z=42
        const borrachariaWalkable = physics.colliders.some(c =>
          c.type === 'walkable' && c.min.x <= -34 && c.max.x >= -34 && c.min.z <= 42 && c.max.z >= 42
        );

        // 3. Verify Banco Pirituba walkable floor collider at X=48, Z=42
        const bancoWalkable = physics.colliders.some(c =>
          c.type === 'walkable' && c.min.x <= 48 && c.max.x >= 48 && c.min.z <= 42 && c.max.z >= 42
        );

        // 4. Verify Interactive Doors registered across houses
        const doorCount = interactables.doors ? interactables.doors.length : 0;
        const hasDoors = doorCount >= 20;

        // 5. Test Door Punch-to-Open Action
        const testDoor = interactables.doors ? interactables.doors[0] : null;
        let doorPunchedOpen = false;
        let doorColliderRemoved = false;

        if (testDoor) {
          const colliderRef = testDoor.collider;
          const colliderPresentBefore = physics.colliders.includes(colliderRef);

          // Punch / Bash door open
          interactables.triggerDoor(testDoor);

          doorPunchedOpen = testDoor.isOpen === true;
          doorColliderRemoved = colliderPresentBefore && !physics.colliders.includes(colliderRef);
        }

        const ok = padariaWalkable && borrachariaWalkable && bancoWalkable && hasDoors && doorPunchedOpen && doorColliderRemoved;

        return {
          ok,
          padariaWalkable,
          borrachariaWalkable,
          bancoWalkable,
          doorCount,
          hasDoors,
          doorPunchedOpen,
          doorColliderRemoved
        };
      })()
    `);
    console.log(`[TEST 26] Walkable Interiors, Punchable Doors & BRAHM.AI Furniture:`, walkableInteriorsTest);
    if (!walkableInteriorsTest.ok) {
      throw new Error(`TEST 26 FAILED: Walkable interiors or door punch test failed: ${JSON.stringify(walkableInteriorsTest)}`);
    }

    // TEST 27: Radio forecast vs scheduled 16:00–17:15 storm ownership
    const radioWeatherTested = await evaluate(`
      (() => {
        const game = window.app.game;
        const origSetWeather = game.dayCycle.setWeather.bind(game.dayCycle);
        const origToast = game.hud.showToast.bind(game.hud);
        let setWeatherCalls = 0;
        let toastCalls = 0;
        game.dayCycle.setWeather = (mode) => { setWeatherCalls++; return origSetWeather(mode); };
        game.hud.showToast = (msg, duration) => { toastCalls++; return origToast(msg, duration); };

        const setSimHour = (hour) => {
          game.isRunActive = true;
          game.clock.hasEnded = false;
          game.clock.isPaused = false;
          game.clock.elapsed = (hour - 6.0) * (900 / 24);
        };

        try {
          const weatherCb = game.sound && game.sound.newsDesk && game.sound.newsDesk.weatherCallback;
          if (typeof weatherCb !== 'function') {
            return { ok: false, reason: 'newsDesk weatherCallback is not registered' };
          }

          setSimHour(12.0);
          weatherCb('GAROA');
          game.update(0.016);
          const garoaOutside = {
            dayCycle: game.dayCycle.weather,
            traffic: game.traffic ? game.traffic.weather : null,
            isStorming: game.isStorming,
            raining: !!(game.sound && game.sound.isRaining)
          };

          setWeatherCalls = 0;
          toastCalls = 0;
          game.update(0.016);
          game.update(0.016);
          game.update(0.016);
          const unchangedGaroaApplies = { setWeatherCalls, toastCalls };

          setSimHour(16.2);
          game.update(0.016);
          const scheduledOverride = {
            dayCycle: game.dayCycle.weather,
            traffic: game.traffic ? game.traffic.weather : null,
            isStorming: game.isStorming,
            raining: !!(game.sound && game.sound.isRaining)
          };

          setWeatherCalls = 0;
          toastCalls = 0;
          game.update(0.016);
          game.update(0.016);
          const unchangedStormApplies = { setWeatherCalls, toastCalls };

          setSimHour(18.0);
          game.update(0.016);
          const restoredAfterWindow = {
            dayCycle: game.dayCycle.weather,
            traffic: game.traffic ? game.traffic.weather : null,
            isStorming: game.isStorming,
            raining: !!(game.sound && game.sound.isRaining)
          };

          weatherCb('STORM');
          game.update(0.016);
          const radioStormOutside = {
            dayCycle: game.dayCycle.weather,
            traffic: game.traffic ? game.traffic.weather : null,
            isStorming: game.isStorming
          };

          const ok = garoaOutside.dayCycle === 'GAROA'
            && garoaOutside.traffic === 'GAROA'
            && garoaOutside.isStorming === false
            && garoaOutside.raining === true
            && unchangedGaroaApplies.setWeatherCalls === 0
            && unchangedGaroaApplies.toastCalls === 0
            && scheduledOverride.dayCycle === 'STORM'
            && scheduledOverride.traffic === 'STORM'
            && scheduledOverride.isStorming === true
            && unchangedStormApplies.setWeatherCalls === 0
            && unchangedStormApplies.toastCalls === 0
            && restoredAfterWindow.dayCycle === 'GAROA'
            && restoredAfterWindow.traffic === 'GAROA'
            && restoredAfterWindow.isStorming === false
            && restoredAfterWindow.raining === true
            && radioStormOutside.dayCycle === 'STORM'
            && radioStormOutside.isStorming === true;

          return { ok, garoaOutside, unchangedGaroaApplies, scheduledOverride, unchangedStormApplies, restoredAfterWindow, radioStormOutside };
        } finally {
          game.dayCycle.setWeather = origSetWeather;
          game.hud.showToast = origToast;
        }
      })()
    `);
    console.log(`[TEST 27] Radio weather vs scheduled storm:`, radioWeatherTested);
    if (!radioWeatherTested.ok) {
      throw new Error(`TEST 27 FAILED: radio GAROA must survive outside 16:00–17:15, yield to the scheduled storm inside the window, and be restored when the window ends. ${JSON.stringify(radioWeatherTested)}`);
    }

    // TEST 28: Vinheta completion must not run normal song-end accounting
    const vinhetaEndedTested = await evaluate(`
      (() => {
        const radio = window.app.sound && window.app.sound.radioBroadcast;
        if (!radio || !radio.audioElement) {
          return { ok: false, reason: 'radioBroadcast audioElement missing' };
        }

        const origStation = radio.activeStation;
        const origNewsDesk = radio.newsDesk;
        const origPlayNext = radio.playNextSong.bind(radio);
        let playNextCalls = 0;
        radio.playNextSong = (...args) => { playNextCalls++; return origPlayNext(...args); };

        try {
          radio.songsPlayedInBlock = 0;
          radio.isBroadcastingNews = false;
          const trackBefore = radio.currentTrack ? radio.currentTrack.id : null;
          let vinhetaContinued = false;
          radio.playAudioFile('media/audio/vinhetas/vinheta_alfa_fm.mp3', () => { vinhetaContinued = true; });
          radio.audioElement.dispatchEvent(new Event('ended'));
          const afterVinheta = {
            songsPlayedInBlock: radio.songsPlayedInBlock,
            vinhetaContinued,
            playNextCalls,
            trackAfter: radio.currentTrack ? radio.currentTrack.id : null,
            trackBefore
          };

          radio.songsPlayedInBlock = 0;
          playNextCalls = 0;
          let newsStarted = false;
          radio.newsDesk = { broadcastBreakingNews: (_state, _cb) => { newsStarted = true; } };
          radio.isBroadcastingNews = false;
          radio.startRadioIntermission();
          radio.audioElement.dispatchEvent(new Event('ended'));
          const afterIntermissionVinheta = {
            songsPlayedInBlock: radio.songsPlayedInBlock,
            newsStarted,
            playNextCalls
          };

          let staleFired = false;
          radio.songsPlayedInBlock = 0;
          radio.isBroadcastingNews = false;
          radio.playAudioFile('media/audio/vinhetas/vinheta_transmatrix.mp3', () => { staleFired = true; });
          radio.setStation('FUNK');
          radio.audioElement.dispatchEvent(new Event('ended'));
          const afterStationChange = { staleFired };

          const ok = afterVinheta.songsPlayedInBlock === 0
            && afterVinheta.vinhetaContinued === true
            && afterVinheta.playNextCalls === 0
            && afterVinheta.trackAfter === afterVinheta.trackBefore
            && afterIntermissionVinheta.songsPlayedInBlock === 0
            && afterIntermissionVinheta.newsStarted === true
            && afterIntermissionVinheta.playNextCalls === 0
            && afterStationChange.staleFired === false;

          return { ok, afterVinheta, afterIntermissionVinheta, afterStationChange };
        } finally {
          radio.playNextSong = origPlayNext;
          radio.newsDesk = origNewsDesk;
          if (origStation) radio.setStation(origStation);
        }
      })()
    `);
    console.log(`[TEST 28] Vinheta ended accounting:`, vinhetaEndedTested);
    if (!vinhetaEndedTested.ok) {
      throw new Error(`TEST 28 FAILED: vinheta completion must continue without song-end accounting or stale station callbacks. ${JSON.stringify(vinhetaEndedTested)}`);
    }

    // TEST 29: TRACKS_CATALOGUE and VINHETAS_CATALOGUE URLs resolve to non-empty audio
    const catalogueFetchTested = await evaluate(`
      (async () => {
        const radio = window.app.sound && window.app.sound.radioBroadcast;
        const tracks = radio && radio.constructor && radio.constructor.TRACKS_CATALOGUE;
        const vinhetas = radio && radio.constructor && radio.constructor.VINHETAS_CATALOGUE;
        if (!Array.isArray(tracks) || tracks.length !== 13) {
          return { ok: false, reason: 'TRACKS_CATALOGUE must expose 13 tracks on RadioBroadcast', trackCount: tracks && tracks.length };
        }
        if (!Array.isArray(vinhetas) || vinhetas.length !== 2) {
          return { ok: false, reason: 'VINHETAS_CATALOGUE must expose 2 vinhetas on RadioBroadcast', vinhetaCount: vinhetas && vinhetas.length };
        }
        const items = tracks.concat(vinhetas);
        const results = [];
        for (const item of items) {
          const res = await fetch(item.src);
          const buf = await res.arrayBuffer();
          results.push({ id: item.id, src: item.src, status: res.status, ok: res.ok, bytes: buf.byteLength });
        }
        const failed = results.filter(r => !r.ok || r.bytes <= 0);
        return { ok: failed.length === 0, trackCount: tracks.length, vinhetaCount: vinhetas.length, failed, results };
      })()
    `);
    console.log(`[TEST 29] Radio catalogue HTTP fetch:`, catalogueFetchTested);
    if (!catalogueFetchTested.ok) {
      throw new Error(`TEST 29 FAILED: all 13 TRACKS_CATALOGUE URLs and both VINHETAS_CATALOGUE URLs must return successful non-empty responses. ${JSON.stringify(catalogueFetchTested)}`);
    }

    // TEST 30: Intermission must recover from failed vinheta load and busy NewsDesk
    const intermissionRecoveryTested = await evaluate(`
      (() => {
        const radio = window.app.sound && window.app.sound.radioBroadcast;
        const desk = radio && radio.newsDesk;
        if (!radio || !radio.audioElement || !desk) {
          return { ok: false, reason: 'radioBroadcast or newsDesk missing' };
        }

        const origPlayNext = radio.playNextSong.bind(radio);
        const origBroadcast = desk.broadcastBreakingNews.bind(desk);
        const origPlayingNews = desk.isPlayingNews;
        let playNextCalls = 0;
        radio.playNextSong = (...args) => { playNextCalls++; return origPlayNext(...args); };

        try {
          desk.broadcastBreakingNews = (state, cb) => { if (typeof cb === 'function') cb(); };
          desk.isPlayingNews = false;
          radio.songsPlayedInBlock = 0;
          radio.isBroadcastingNews = false;
          radio.pendingEndedCallback = null;
          playNextCalls = 0;
          radio.startRadioIntermission();
          const duckedBeforeError = radio.isBroadcastingNews === true;
          radio.audioElement.dispatchEvent(new Event('error'));
          const afterVinhetaError = {
            duckedBeforeError,
            isBroadcastingNews: radio.isBroadcastingNews,
            playNextCalls,
            pendingEndedCallback: radio.pendingEndedCallback !== null
          };

          desk.broadcastBreakingNews = origBroadcast;
          desk.isPlayingNews = true;
          radio.songsPlayedInBlock = 0;
          radio.isBroadcastingNews = false;
          radio.pendingEndedCallback = null;
          playNextCalls = 0;
          radio.startRadioIntermission();
          radio.audioElement.dispatchEvent(new Event('ended'));
          const afterBusyNews = {
            isBroadcastingNews: radio.isBroadcastingNews,
            playNextCalls,
            newsStillMarkedPlaying: desk.isPlayingNews === true
          };

          desk.isPlayingNews = true;
          radio.songsPlayedInBlock = 0;
          playNextCalls = 0;
          radio.startRadioIntermission();
          const secondIntermissionStarted = radio.isBroadcastingNews === true;
          radio.audioElement.dispatchEvent(new Event('ended'));
          const afterSecondBusyNews = {
            secondIntermissionStarted,
            isBroadcastingNews: radio.isBroadcastingNews,
            playNextCalls
          };

          const ok = afterVinhetaError.duckedBeforeError === true
            && afterVinhetaError.isBroadcastingNews === false
            && afterVinhetaError.playNextCalls >= 1
            && afterVinhetaError.pendingEndedCallback === false
            && afterBusyNews.isBroadcastingNews === false
            && afterBusyNews.playNextCalls >= 1
            && afterSecondBusyNews.secondIntermissionStarted === true
            && afterSecondBusyNews.isBroadcastingNews === false
            && afterSecondBusyNews.playNextCalls >= 1;

          return { ok, afterVinhetaError, afterBusyNews, afterSecondBusyNews };
        } finally {
          radio.playNextSong = origPlayNext;
          desk.broadcastBreakingNews = origBroadcast;
          desk.isPlayingNews = origPlayingNews;
        }
      })()
    `);
    console.log(`[TEST 30] Intermission stall recovery:`, intermissionRecoveryTested);
    if (!intermissionRecoveryTested.ok) {
      throw new Error(`TEST 30 FAILED: failed vinheta and busy NewsDesk must resume the radio program instead of stalling the intermission. ${JSON.stringify(intermissionRecoveryTested)}`);
    }

    // TEST 31: Carnival plaza + favela campinho zones, geometry, connector, and world bound
    const carnivalCampinhoTested = await evaluate(`
      (async () => {
        const leakedZoneHook = Object.prototype.hasOwnProperty.call(globalThis, 'ZoneManager')
          || Object.prototype.hasOwnProperty.call(globalThis, 'WORLD_ZONES');
        const zoneApi = await (async () => {
          const pagePath = window.location.pathname;
          const isEsmBuild = pagePath.endsWith('index.html') || pagePath === '/' || pagePath === '';
          if (isEsmBuild) {
            const mod = await import('/src/world/Zones.js');
            return {
              getZoneAt: mod.ZoneManager.getZoneAt.bind(mod.ZoneManager),
              isZoneOpen: mod.ZoneManager.isZoneOpen.bind(mod.ZoneManager),
              WORLD_ZONES: mod.WORLD_ZONES,
              source: 'esm-import'
            };
          }
          if (typeof ZoneManager === 'undefined' || typeof WORLD_ZONES === 'undefined') {
            return { getZoneAt: () => ({ id: 'MISSING' }), isZoneOpen: () => false, WORLD_ZONES: [], source: 'missing-classic' };
          }
          return {
            getZoneAt: ZoneManager.getZoneAt.bind(ZoneManager),
            isZoneOpen: ZoneManager.isZoneOpen.bind(ZoneManager),
            WORLD_ZONES,
            source: 'classic-lexical'
          };
        })();

        const preservedHours = {
          BAR_DO_TIAO: [16, 2],
          ADEGA_DO_ZE: [8, 24],
          PADARIA_ESTRELA: [5, 20],
          POSTO_PIRITUBA: [0, 24],
          PONTO_ONIBUS_SPTRANS: [4, 24],
          CRUZAMENTO_EDGAR_FACCO: [0, 24],
          PORTICO_CET: [0, 24],
          RADAR_50KM: [0, 24],
          CORREDOR_BUS: [0, 24],
          AV_EDGAR_FACCO: [0, 24],
          LAJE_MIRANTE: [0, 24],
          ESCADAO_CENTRAL: [0, 24],
          BECO_DO_SOSSEGO: [0, 24],
          BANCA_JORNAL: [6, 20],
          BARRACA_PASTEL: [6.5, 14],
          BAILE_LAJE: [1.5, 5.5],
          SEMAFORO_BICO: [7, 22],
          FLANELINHA_PAULA_FERREIRA: [7, 21],
          BANCO_PIRITUBA: [0, 24],
          RUA_BENTO_BICUDO: [0, 24],
          RUA_EMILIO_LESSORE: [0, 24],
          AUTO_MECANICA_BETO: [7.5, 19.5],
          CASA_CLASSE_C: [0, 24],
          EDIFICIO_PENTHOUSE: [0, 24],
          EDIFICIO_PORTARIA: [0, 24],
          LARGO_DA_MATRIZ: [0, 24],
          BAR_FRANGO: [11, 24],
          IGREJA_MATRIZ_O: [6, 20],
          RUA_SETE_BARRAS: [0, 24],
          PAULA_FERREIRA_FREGUESIA: [0, 24],
          CRUZAMENTO_PETRONIO_PORTELA: [0, 24]
        };

        const zoneById = {};
        (zoneApi.WORLD_ZONES || []).forEach((z) => { zoneById[z.id] = z; });
        const preservedHoursOk = Object.entries(preservedHours).every(([id, hours]) => {
          const z = zoneById[id];
          return !!z && z.openHour === hours[0] && z.closeHour === hours[1];
        });

        const bloco = zoneApi.getZoneAt({ x: 146, y: 2, z: 43 });
        const campinho = zoneApi.getZoneAt({ x: 0, y: 10, z: -99 });
        const petronio = zoneApi.getZoneAt({ x: 145, y: 1, z: 20 });
        const avenueEast = zoneApi.getZoneAt({ x: 90, y: 1, z: 12 });

        const blocoHours = {
          openAtOpen: zoneApi.isZoneOpen(bloco, 10),
          closedBefore: zoneApi.isZoneOpen(bloco, 9.99),
          openBeforeClose: zoneApi.isZoneOpen(bloco, 15.99),
          closedAtClose: zoneApi.isZoneOpen(bloco, 16)
        };
        const campinhoHours = {
          openAtOpen: zoneApi.isZoneOpen(campinho, 11),
          closedBefore: zoneApi.isZoneOpen(campinho, 10.99),
          openBeforeClose: zoneApi.isZoneOpen(campinho, 19.99),
          closedAtClose: zoneApi.isZoneOpen(campinho, 20)
        };

        const blocoBounds = bloco && bloco.min && bloco.max ? {
          minX: bloco.min.x, maxX: bloco.max.x,
          minY: bloco.min.y, maxY: bloco.max.y,
          minZ: bloco.min.z, maxZ: bloco.max.z,
          openHour: bloco.openHour, closeHour: bloco.closeHour
        } : null;
        const campinhoBounds = campinho && campinho.min && campinho.max ? {
          minX: campinho.min.x, maxX: campinho.max.x,
          minY: campinho.min.y, maxY: campinho.max.y,
          minZ: campinho.min.z, maxZ: campinho.max.z,
          openHour: campinho.openHour, closeHour: campinho.closeHour
        } : null;

        const city = window.app.city;
        const physics = window.app.physics;
        const trioGroup = city && city.blocoTrioGroup;
        const campGroup = city && city.campinhoGroup;

        let trioWorldBox = null;
        let trioOnLiveRoad = true;
        if (trioGroup && THREE && THREE.Box3) {
          trioGroup.updateWorldMatrix(true, true);
          const box = new THREE.Box3().setFromObject(trioGroup);
          trioWorldBox = {
            minX: box.min.x, maxX: box.max.x,
            minY: box.min.y, maxY: box.max.y,
            minZ: box.min.z, maxZ: box.max.z
          };
          const overlapsRoad = box.max.z > 8 && box.min.z < 32;
          trioOnLiveRoad = overlapsRoad;
        }

        const pitchGround = physics.getGroundHeight(0, -99, 9.5);
        const pitchWalkable = physics.colliders.some((c) =>
          (c.type === 'walkable' || c.type === 'stair' || c.type === 'curb')
          && c.min.x <= -14 && c.max.x >= 14
          && c.min.z <= -106 && c.max.z >= -92
          && Math.abs(c.max.y - 9.5) <= 0.15
        );

        const walkNorth = (x, y, startZ, step, count) => {
          let pos = new THREE.Vector3(x, y, startZ);
          for (let i = 0; i < count; i++) {
            const target = pos.clone();
            target.z -= step;
            pos = physics.resolveMovement(pos, target, 0.38, 0.5);
          }
          return pos;
        };

        // Hillside west of the mirante house (x=1±5, z=-73±4.5), south of the connector (z=-78).
        const hillsideY = physics.getGroundHeight(-7, -77, 9.5);
        const connectorStartReachable = hillsideY >= 8.5 && hillsideY <= 10.0;
        const connectorMidY = physics.getGroundHeight(0, -79.5);
        const connectorMeetsCrest = Math.abs(connectorMidY - 9.5) <= 0.2;
        let walkPos = walkNorth(-7, hillsideY, -77, 0.45, 30);
        const connectorReached = walkPos.z <= -86.5 && walkPos.y >= 9.2 && walkPos.y <= 10.2;

        const westCrestY = physics.getGroundHeight(-28, -78);
        const eastCrestY = physics.getGroundHeight(40, -78);
        const westEdgeY = physics.getGroundHeight(-65, -78);
        const eastEdgeY = physics.getGroundHeight(177, -78);
        const westProbe = walkNorth(-28, Math.max(westCrestY, 9.0), -78, 0.5, 40);
        const eastProbe = walkNorth(40, Math.max(eastCrestY, 9.0), -78, 0.5, 40);
        const farEastProbe = walkNorth(80, 9.5, -78, 0.5, 40);
        const westEdgeProbe = walkNorth(-65, Math.max(westEdgeY, 0.5), -78, 0.5, 40);
        const eastEdgeProbe = walkNorth(177, Math.max(eastEdgeY, 0.5), -78, 0.5, 40);
        const offCentreClosed = westProbe.z >= -84 && eastProbe.z >= -84 && farEastProbe.z >= -84
          && westEdgeProbe.z >= -84 && eastEdgeProbe.z >= -84;

        const floorNear = (x, z) => Math.abs(physics.getGroundHeight(x, z, 9.5) - 9.5) <= 0.2;
        const southWestFloor = floorNear(-16, -84);
        const southEastFloor = floorNear(16, -84);
        const northMidFloor = floorNear(0, -112.5);
        const northWestFloor = floorNear(-16, -112.5);
        const northEastFloor = floorNear(16, -112.5);
        const westSideFloor = floorNear(-20.3, -99);
        const eastSideFloor = floorNear(20.3, -99);
        const floorsClosed = southWestFloor && southEastFloor && northMidFloor
          && northWestFloor && northEastFloor && westSideFloor && eastSideFloor;

        const avZone = zoneById.AV_EDGAR_FACCO;
        const busZone = zoneById.CORREDOR_BUS;
        const doorCount = window.app.game && window.app.game.interactables && window.app.game.interactables.doors
          ? window.app.game.interactables.doors.length
          : 0;

        const ok = bloco.id === 'BLOCO_EDGAR_FACCO'
          && blocoBounds
          && blocoBounds.minX === 132 && blocoBounds.maxX === 160
          && blocoBounds.minY === 0 && blocoBounds.maxY === 8
          && blocoBounds.minZ === 34 && blocoBounds.maxZ === 52
          && blocoBounds.openHour === 10 && blocoBounds.closeHour === 16
          && blocoHours.openAtOpen === true
          && blocoHours.closedBefore === false
          && blocoHours.openBeforeClose === true
          && blocoHours.closedAtClose === false
          && campinho.id === 'CAMPINHO_CHURRASCO'
          && campinhoBounds
          && campinhoBounds.minX === -22 && campinhoBounds.maxX === 22
          && campinhoBounds.minY === 8.5 && campinhoBounds.maxY === 15
          && campinhoBounds.minZ === -112 && campinhoBounds.maxZ === -86
          && campinhoBounds.openHour === 11 && campinhoBounds.closeHour === 20
          && campinhoHours.openAtOpen === true
          && campinhoHours.closedBefore === false
          && campinhoHours.openBeforeClose === true
          && campinhoHours.closedAtClose === false
          && petronio.id === 'CRUZAMENTO_PETRONIO_PORTELA'
          && avenueEast.id === 'AV_EDGAR_FACCO'
          && avZone && avZone.max.x === 165
          && busZone && busZone.max.x === 165
          && preservedHoursOk
          && !!trioGroup && trioGroup.children && trioGroup.children.length > 0
          && !!campGroup && campGroup.children && campGroup.children.length > 0
          && trioOnLiveRoad === false
          && Math.abs(pitchGround - 9.5) <= 0.15
          && pitchWalkable === true
          && connectorStartReachable === true
          && connectorMeetsCrest === true
          && connectorReached === true
          && offCentreClosed === true
          && floorsClosed === true
          && leakedZoneHook === false
          && (zoneApi.source === 'esm-import' || zoneApi.source === 'classic-lexical')
          && physics.worldBounds.minZ === -120
          && doorCount >= 20;

        return {
          ok,
          bloco: { id: bloco.id, bounds: blocoBounds, hours: blocoHours },
          campinho: { id: campinho.id, bounds: campinhoBounds, hours: campinhoHours },
          petronioId: petronio.id,
          avenueEastId: avenueEast.id,
          avenueMaxX: avZone && avZone.max.x,
          busMaxX: busZone && busZone.max.x,
          preservedHoursOk,
          hasTrioGroup: !!(trioGroup && trioGroup.children && trioGroup.children.length > 0),
          hasCampinhoGroup: !!(campGroup && campGroup.children && campGroup.children.length > 0),
          trioWorldBox,
          trioOnLiveRoad,
          pitchGround,
          pitchWalkable,
          connectorStartReachable,
          hillsideY,
          crestY: hillsideY,
          connectorMidY,
          connectorMeetsCrest,
          connectorReached,
          connectorEnd: { x: walkPos.x, y: walkPos.y, z: walkPos.z },
          offCentreClosed,
          westProbe: { x: westProbe.x, y: westProbe.y, z: westProbe.z },
          eastProbe: { x: eastProbe.x, y: eastProbe.y, z: eastProbe.z },
          farEastProbe: { x: farEastProbe.x, y: farEastProbe.y, z: farEastProbe.z },
          westEdgeProbe: { x: westEdgeProbe.x, y: westEdgeProbe.y, z: westEdgeProbe.z },
          eastEdgeProbe: { x: eastEdgeProbe.x, y: eastEdgeProbe.y, z: eastEdgeProbe.z },
          floorsClosed,
          floorProbes: { southWestFloor, southEastFloor, northMidFloor, northWestFloor, northEastFloor, westSideFloor, eastSideFloor },
          leakedZoneHook,
          zoneSource: zoneApi.source,
          minZ: physics.worldBounds.minZ,
          doorCount
        };
      })()
    `);
    console.log(`[TEST 31] Carnival plaza and favela campinho:`, carnivalCampinhoTested);
    if (!carnivalCampinhoTested.ok) {
      throw new Error(`TEST 31 FAILED: carnival plaza and favela campinho must seal world-bound north edges, walk a hillside-to-plateau connector, close reachable floor gaps, and keep the original zone/geometry contracts. ${JSON.stringify(carnivalCampinhoTested)}`);
    }

    // TEST 32: Street + campinho soccer balls on the I9 dynamic-body path
    const carnivalBallsTested = await evaluate(`
      (() => {
        const physics = window.app.physics;
        const props = window.app.game && window.app.game.props;
        const sound = (window.app.game && window.app.game.sound) || window.app.sound;
        const news = sound && sound.newsDesk;
        const bodies = physics.dynamicBodies || [];
        const ids = bodies.map((b) => b.id);
        const countId = (id) => ids.filter((x) => x === id).length;
        const street = bodies.find((b) => b.id === 'soccer_ball');
        const camp = bodies.find((b) => b.id === 'soccer_ball_campinho');
        const beerOk = ['beer_can_0', 'beer_can_1', 'beer_can_2'].every((id) => countId(id) === 1);

        const streetOnce = countId('soccer_ball') === 1;
        const campOnce = countId('soccer_ball_campinho') === 1;
        const ballBodyIsStreet = !!(props && street && props.ballBody === street);
        const campBodyIsCamp = !!(props && camp && props.campinhoBallBody === camp);
        const ballBodiesOk = !!(props && Array.isArray(props.ballBodies)
          && props.ballBodies.length === 2
          && street && camp
          && props.ballBodies.includes(street)
          && props.ballBodies.includes(camp));

        const sharedPhysOk = !!(street && camp
          && street.radius === 0.26 && camp.radius === 0.26
          && street.mass === 0.45 && camp.mass === 0.45
          && street.restitution === 0.72 && camp.restitution === 0.72
          && street.friction === 0.982 && camp.friction === 0.982
          && street.isKickable === true && camp.isKickable === true
          && typeof street.onKick === 'function' && typeof camp.onKick === 'function');

        const resetBody = (body, x, y, z) => {
          if (!body) return;
          body.mesh.position.set(x, y, z);
          body.velocity.set(0, 0, 0);
          body.angularVelocity.set(0, 0, 0);
        };
        resetBody(street, 0, 0.4, 14.5);
        resetBody(camp, 0, 9.8, -99);
        if (street || camp) {
          for (let i = 0; i < 180; i++) physics.updateDynamicBodies(1 / 60);
        }

        const readPos = (body) => body ? {
          x: body.mesh.position.x,
          y: body.mesh.position.y,
          z: body.mesh.position.z
        } : null;
        const streetPos = readPos(street);
        const campPos = readPos(camp);
        const streetFloor = streetPos ? physics.getGroundHeight(streetPos.x, streetPos.z, streetPos.y) : null;
        const campFloor = campPos ? physics.getGroundHeight(campPos.x, campPos.z, campPos.y) : null;

        const streetSettled = !!(street && streetPos
          && Math.abs(streetPos.y - (streetFloor + street.radius)) <= 0.08
          && Math.abs(streetPos.x - 0) <= 0.35
          && Math.abs(streetPos.z - 14.5) <= 0.35
          && streetPos.y < 2);
        const campSettled = !!(camp && campPos
          && Math.abs(campPos.y - (campFloor + camp.radius)) <= 0.08
          && Math.abs(campPos.x - 0) <= 0.35
          && Math.abs(campPos.z + 99) <= 0.35
          && campPos.y > 9.5);
        const bounds = physics.worldBounds;
        const campInBounds = !!(campPos
          && campPos.x >= bounds.minX && campPos.x <= bounds.maxX
          && campPos.z >= bounds.minZ && campPos.z <= bounds.maxZ
          && campPos.y > 9.5);

        let kickCalls = 0;
        const origKick = sound && sound.playKickBall ? sound.playKickBall.bind(sound) : null;
        if (sound && sound.playKickBall) {
          sound.playKickBall = function wrappedPlayKickBall() {
            kickCalls += 1;
            return origKick ? origKick() : undefined;
          };
        }

        const lastKick = (afterLen) => {
          if (!news) return null;
          const kicks = news.events.filter((e) => e.category === 'KICK');
          return kicks.length > afterLen ? kicks[kicks.length - 1] : null;
        };
        const zeroBody = (body) => {
          if (!body) return;
          body.velocity.set(0, 0, 0);
          body.angularVelocity.set(0, 0, 0);
        };
        const horiz = (body) => body ? Math.hypot(body.velocity.x, body.velocity.z) : 0;

        const streetNewsBefore = news ? news.events.filter((e) => e.category === 'KICK').length : 0;
        if (street) street.lastKickTime = 0;
        zeroBody(street);
        const streetKicked = street
          ? physics.checkPlayerKick({ x: 0, y: streetPos ? streetPos.y : 0.4, z: 15.3 }, new THREE.Vector3(0, 0, -1), 4)
          : null;
        const streetKickOk = !!(streetKicked === street && street && horiz(street) > 0 && street.velocity.y > 0);
        const streetNews = lastKick(streetNewsBefore);
        const streetNewsOk = !!(streetNews && streetNews.desc === 'Chutou a bola dente-de-leite na calçada');
        const streetSoundOk = kickCalls === 1;

        zeroBody(street);
        const streetCooldownKick = street
          ? physics.checkPlayerKick({ x: 0, y: streetPos ? streetPos.y : 0.4, z: 15.3 }, new THREE.Vector3(0, 0, -1), 4)
          : 'skipped';
        const streetCooldownOk = streetCooldownKick === null && street && horiz(street) === 0 && street.velocity.y === 0;

        zeroBody(street);
        zeroBody(camp);
        const farKick = physics.checkPlayerKick({ x: 40, y: 1, z: 40 }, new THREE.Vector3(0, 0, -1), 4);
        const rangeGuardOk = farKick === null
          && (!street || (horiz(street) === 0 && street.velocity.y === 0))
          && (!camp || (horiz(camp) === 0 && camp.velocity.y === 0));

        if (camp) camp.lastKickTime = 0;
        zeroBody(camp);
        const heightKick = camp
          ? physics.checkPlayerKick({ x: 0, y: 0.4, z: -99 }, new THREE.Vector3(0, 0, -1), 4)
          : 'skipped';
        const heightGuardOk = heightKick === null && camp && horiz(camp) === 0 && camp.velocity.y === 0;

        const campNewsBefore = news ? news.events.filter((e) => e.category === 'KICK').length : 0;
        const soundsBeforeCamp = kickCalls;
        if (camp) camp.lastKickTime = 0;
        zeroBody(camp);
        const campKicked = camp
          ? physics.checkPlayerKick({ x: 0, y: campPos ? campPos.y : 9.8, z: -98.2 }, new THREE.Vector3(0, 0, -1), 4)
          : null;
        const campKickOk = !!(campKicked === camp && camp && horiz(camp) > 0 && camp.velocity.y > 0);
        const campNews = lastKick(campNewsBefore);
        const campNewsOk = !!(campNews && typeof campNews.desc === 'string' && campNews.desc.length > 0
          && campNews.desc !== 'Chutou a bola dente-de-leite na calçada');
        const campSoundOk = kickCalls === soundsBeforeCamp + 1;

        if (sound && origKick) sound.playKickBall = origKick;

        const ok = streetOnce && campOnce && ballBodyIsStreet && campBodyIsCamp && ballBodiesOk
          && sharedPhysOk && beerOk && streetSettled && campSettled && campInBounds
          && streetKickOk && streetNewsOk && streetSoundOk && streetCooldownOk
          && rangeGuardOk && heightGuardOk && campKickOk && campNewsOk && campSoundOk;

        return {
          ok,
          streetOnce,
          campOnce,
          ballBodyIsStreet,
          campBodyIsCamp,
          ballBodiesOk,
          ballBodiesLen: props && props.ballBodies ? props.ballBodies.length : null,
          sharedPhysOk,
          beerOk,
          streetSettled,
          campSettled,
          campInBounds,
          streetPos,
          campPos,
          streetFloor,
          campFloor,
          streetKickOk,
          streetNewsOk,
          streetNews: streetNews ? streetNews.desc : null,
          streetSoundOk,
          streetCooldownOk,
          rangeGuardOk,
          heightGuardOk,
          campKickOk,
          campNewsOk,
          campNews: campNews ? campNews.desc : null,
          campSoundOk,
          kickCalls
        };
      })()
    `);
    console.log(`[TEST 32] Street and campinho soccer balls:`, carnivalBallsTested);
    if (!carnivalBallsTested.ok) {
      throw new Error(`TEST 32 FAILED: both soccer balls must exist once on the I9 path, keep ballBody as the street body, settle on their real surfaces, stay in bounds above the 9.5 pitch, and take real kicks with distinct NewsDesk/sound callbacks under cooldown and range guards. ${JSON.stringify(carnivalBallsTested)}`);
    }

    // TEST 33: Scheduled carnival + campinho crowds, elevation, cull, and seed signature
    const carnivalCrowdTested = await evaluate(`
      (async () => {
        const game = window.app.game;
        const npcs = game && game.npcs;
        if (!npcs || !Array.isArray(npcs.npcs)) {
          return { ok: false, reason: 'NpcSystem missing' };
        }

        const originalIds = ['clodoaldo', 'caramelo', 'juninho', 'dona_neide', 'sargento_rocha', 'menor_corre'];
        const ids = npcs.npcs.map((n) => n.id);
        const originalsPresent = originalIds.every((id) => ids.includes(id));
        const originals = originalIds.map((id) => npcs.npcs.find((n) => n.id === id)).filter(Boolean);
        const originalsIntact = originals.length === 6 && originals.every((n) => n.group && n.group.children.length > 0);

        const carnivalCostumes = ['spider', 'nocturnal_cape', 'red_gold_armor', 'neon_masked', 'round_mascot', 'antenna_suit'];
        const forbiddenNameRe = /homem[-\\s]?aranha|spiderman|batman|iron\\s*man|homem\\s*de\\s*ferro|capit[aã]o\\s*am[eé]rica|super[-\\s]?homem/i;

        const blocoZone = { min: { x: 132, y: 0, z: 34 }, max: { x: 160, y: 8, z: 52 } };
        const inOrBordering = (pos, zone, margin = 1.5) => !!(pos
          && pos.x >= zone.min.x - margin && pos.x <= zone.max.x + margin
          && pos.z >= zone.min.z - margin && pos.z <= zone.max.z + margin);
        const hitsCampFurniture = (x, z) => {
          if (x >= -18.7 && x <= -17.3 && z >= -89.1 && z <= -87.9) return true;
          const tables = [[-17.2, -91.2], [17.4, -88.8], [17.6, -91.4]];
          return tables.some(([tx, tz]) => Math.abs(x - tx) <= 0.7 && Math.abs(z - tz) <= 0.45);
        };
        const inCampSafe = (x, z) => x >= -20 && x <= 20 && z >= -111 && z <= -87 && !hitsCampFurniture(x, z);

        const carnival = npcs.npcs.filter((n) => n.zoneId === 'BLOCO_EDGAR_FACCO' && n.interactable === false);
        const campinho = npcs.npcs.filter((n) => n.zoneId === 'CAMPINHO_CHURRASCO' && n.interactable === false);
        const danceCount = carnival.filter((n) => n.animationMode === 'DANCE').length;
        const runCount = carnival.filter((n) => n.animationMode === 'RUN').length;
        const footballCount = campinho.filter((n) => n.animationMode === 'FOOTBALL').length;
        const carnivalCostumesUsed = carnival.map((n) => n.costumeId).filter(Boolean).sort();
        const costumesExact = carnivalCostumesUsed.length === 6
          && carnivalCostumes.slice().sort().every((c, i) => carnivalCostumesUsed[i] === c);
        const namesClean = [...carnival, ...campinho].every((n) => !forbiddenNameRe.test(n.id || '') && !forbiddenNameRe.test(n.name || '') && !forbiddenNameRe.test(n.costumeId || ''));

        const carnivalPlaced = carnival.length === 6 && carnival.every((n) => {
          const p = n.group && n.group.position;
          const wps = n.waypoints || [];
          return inOrBordering(p, blocoZone)
            && wps.length > 0
            && wps.every((wp) => inOrBordering(wp, blocoZone) && wp.z > 32);
        });
        const runnersOffRoad = carnival.filter((n) => n.animationMode === 'RUN').every((n) =>
          (n.waypoints || []).every((wp) => wp.z > 32)
        );
        const campPlaced = campinho.length === 6 && campinho.every((n) => {
          const p = n.group && n.group.position;
          const wps = n.waypoints || [];
          const baseOk = Math.abs((n.baseY != null ? n.baseY : -99) - 9.5) <= 0.05;
          return baseOk && p && inCampSafe(p.x, p.z)
            && wps.length > 0
            && wps.every((wp) => inCampSafe(wp.x, wp.z) && (wp.y == null || Math.abs(wp.y - 9.5) <= 0.05));
        });

        const countSpectators = (group) => {
          if (!group) return 0;
          let instanced = 0;
          const visit = (obj) => {
            if (obj.isInstancedMesh) instanced += obj.count;
            (obj.children || []).forEach(visit);
          };
          visit(group);
          if (instanced > 0) return instanced;
          return (group.children || []).length;
        };
        const blocoSpecs = countSpectators(npcs.blocoSpectatorGroup);
        const campSpecs = countSpectators(npcs.campinhoSpectatorGroup);
        const spectatorCountsOk = blocoSpecs === 16 && campSpecs === 16;
        const spectatorsLightweight = spectatorCountsOk
          && !npcs.npcs.some((n) => n.id && String(n.id).includes('spectator'));

        const hasPointLight = (() => {
          let found = false;
          const scan = (root) => {
            if (!root) return;
            root.traverse((obj) => {
              if (obj.isPointLight) found = true;
            });
          };
          scan(npcs.npcGroup);
          scan(npcs.blocoSpectatorGroup);
          scan(npcs.campinhoSpectatorGroup);
          return found;
        })();

        const hourState = (hour) => ({ currentHour: hour });
        const applyHour = (hour, playerPos) => {
          if (game.state) game.state.currentHour = hour;
          npcs.update(0.016, playerPos, false, hourState(hour));
        };
        const farStreet = { x: 0, y: 1.2, z: 0 };
        applyHour(9.99, farStreet);
        const blocoClosedBefore = carnival.every((n) => n.group.visible === false)
          && !!(npcs.blocoSpectatorGroup && npcs.blocoSpectatorGroup.visible === false);
        applyHour(10.0, farStreet);
        const blocoOpenAtOpen = carnival.every((n) => n.group.visible === true)
          && !!(npcs.blocoSpectatorGroup && npcs.blocoSpectatorGroup.visible === true);
        applyHour(15.99, farStreet);
        const blocoOpenBeforeClose = carnival.every((n) => n.group.visible === true)
          && !!(npcs.blocoSpectatorGroup && npcs.blocoSpectatorGroup.visible === true);
        applyHour(16.0, farStreet);
        const blocoClosedAtClose = carnival.every((n) => n.group.visible === false)
          && !!(npcs.blocoSpectatorGroup && npcs.blocoSpectatorGroup.visible === false);

        applyHour(10.99, farStreet);
        const campClosedBefore = campinho.every((n) => n.group.visible === false)
          && !!(npcs.campinhoSpectatorGroup && npcs.campinhoSpectatorGroup.visible === false);
        applyHour(11.0, farStreet);
        const campOpenAtOpen = campinho.every((n) => n.group.visible === true)
          && !!(npcs.campinhoSpectatorGroup && npcs.campinhoSpectatorGroup.visible === true);
        applyHour(19.99, farStreet);
        const campOpenBeforeClose = campinho.every((n) => n.group.visible === true)
          && !!(npcs.campinhoSpectatorGroup && npcs.campinhoSpectatorGroup.visible === true);
        applyHour(20.0, farStreet);
        const campClosedAtClose = campinho.every((n) => n.group.visible === false)
          && !!(npcs.campinhoSpectatorGroup && npcs.campinhoSpectatorGroup.visible === false);
        const scheduleOk = blocoClosedBefore && blocoOpenAtOpen && blocoOpenBeforeClose && blocoClosedAtClose
          && campClosedBefore && campOpenAtOpen && campOpenBeforeClose && campClosedAtClose;

        const clodoaldo = npcs.npcs.find((n) => n.id === 'clodoaldo');
        const streetX0 = clodoaldo ? clodoaldo.group.position.x : null;
        applyHour(12.0, farStreet);
        const streetMoved = !!(clodoaldo && streetX0 != null && clodoaldo.group.position.x !== streetX0);

        const runner = carnival.find((n) => n.animationMode === 'RUN');
        const dancer = carnival.find((n) => n.animationMode === 'DANCE');
        const campNpc = campinho[0];
        const snap = (n) => n && n.group ? {
          x: n.group.position.x, y: n.group.position.y, z: n.group.position.z,
          anim: n.animTimer,
          armX: n.leftArm ? n.leftArm.rotation.x : 0,
          armZ: n.leftArm ? n.leftArm.rotation.z : 0,
          legX: n.leftLeg ? n.leftLeg.rotation.x : 0
        } : null;
        const xzChanged = (a, b) => !!(a && b && (a.x !== b.x || a.z !== b.z));
        const limbsChanged = (a, b) => !!(a && b && (a.armX !== b.armX || a.armZ !== b.armZ || a.legX !== b.legX));

        const parkOnWp0 = (n) => {
          if (!n || !n.waypoints || !n.waypoints[0]) return;
          const wp = n.waypoints[0];
          n.currentWpIndex = 0;
          n.group.position.x = wp.x;
          n.group.position.z = wp.z;
          if (wp.y != null) n.group.position.y = wp.y;
        };

        const streetWp0 = clodoaldo && clodoaldo.waypoints[0];
        const savedStreet = clodoaldo ? {
          x: clodoaldo.group.position.x, y: clodoaldo.group.position.y, z: clodoaldo.group.position.z,
          idx: clodoaldo.currentWpIndex
        } : null;
        parkOnWp0(clodoaldo);
        const streetArrival0 = snap(clodoaldo);
        npcs.update(1.0, { x: streetWp0 ? streetWp0.x : 0, y: 1.2, z: streetWp0 ? streetWp0.z : 0 }, false, hourState(12));
        const streetArrival1 = snap(clodoaldo);
        const streetArrivalHeld = !!(streetArrival0 && streetArrival1
          && streetArrival0.x === streetArrival1.x && streetArrival0.z === streetArrival1.z);
        if (clodoaldo && savedStreet) {
          clodoaldo.group.position.set(savedStreet.x, savedStreet.y, savedStreet.z);
          clodoaldo.currentWpIndex = savedStreet.idx;
        }

        const savedRunner = runner ? {
          x: runner.group.position.x, y: runner.group.position.y, z: runner.group.position.z,
          idx: runner.currentWpIndex
        } : null;
        parkOnWp0(runner);
        const eventArrival0 = snap(runner);
        const eventNear = runner ? { x: runner.group.position.x, y: 1.2, z: runner.group.position.z } : farStreet;
        npcs.update(1.0, eventNear, false, hourState(12));
        const eventArrival1 = snap(runner);
        const eventArrivalSteers = xzChanged(eventArrival0, eventArrival1);
        if (runner && savedRunner) {
          runner.group.position.set(savedRunner.x, savedRunner.y, savedRunner.z);
          runner.currentWpIndex = savedRunner.idx;
        }

        const runnerFar0 = snap(runner);
        applyHour(12.0, farStreet);
        npcs.update(1.0, farStreet, false, hourState(12));
        const runnerFar1 = snap(runner);
        const runnerFarFixed = !!(runnerFar0 && runnerFar1
          && runnerFar0.x === runnerFar1.x && runnerFar0.z === runnerFar1.z && runnerFar0.anim === runnerFar1.anim);
        const farCulled = runnerFarFixed;

        const nearRunner = runner ? { x: runner.group.position.x, y: 1.2, z: runner.group.position.z } : farStreet;
        const runnerNear0 = snap(runner);
        npcs.update(1.0, nearRunner, false, hourState(12));
        const runnerNear1 = snap(runner);
        const runnerNearMoved = xzChanged(runnerNear0, runnerNear1);
        const nearMoved = runnerNearMoved;

        const dance0 = snap(dancer);
        if (dancer) {
          npcs.update(0.45, { x: dancer.group.position.x, y: 1.2, z: dancer.group.position.z }, false, hourState(12));
        }
        const dance1 = snap(dancer);
        const danceLimbsChanged = limbsChanged(dance0, dance1);
        const danceNoPathDrift = !!(dance0 && dance1
          && Math.hypot(dance1.x - dance0.x, dance1.z - dance0.z) <= 0.55);
        const dancerStreetYOk = !dancer || Math.abs(dancer.group.position.y) <= 0.2;

        const foot0 = snap(campNpc);
        if (campNpc) {
          const nearCamp = { x: campNpc.group.position.x, y: 9.5, z: campNpc.group.position.z };
          for (let i = 0; i < 24; i++) npcs.update(0.05, nearCamp, false, hourState(12));
        }
        const foot1 = snap(campNpc);
        const campYAfter = campNpc && campNpc.group ? campNpc.group.position.y : null;
        const campYOk = campYAfter != null && Math.abs(campYAfter - 9.5) <= 0.2;
        const footballMoved = xzChanged(foot0, foot1);
        const footballLimbsChanged = limbsChanged(foot0, foot1);
        const footballElevated = campYOk && footballMoved && footballLimbsChanged;

        let waypointYFollows = false;
        if (campNpc) {
          const savedCamp = {
            wps: campNpc.waypoints,
            idx: campNpc.currentWpIndex,
            baseY: campNpc.baseY,
            x: campNpc.group.position.x,
            y: campNpc.group.position.y,
            z: campNpc.group.position.z
          };
          campNpc.waypoints = [
            { x: savedCamp.x, y: 9.5, z: savedCamp.z },
            { x: savedCamp.x + 3.0, y: 11.0, z: savedCamp.z }
          ];
          campNpc.currentWpIndex = 0;
          campNpc.baseY = 9.5;
          campNpc.group.position.set(savedCamp.x, 9.5, savedCamp.z);
          const climbNear = { x: savedCamp.x, y: 9.5, z: savedCamp.z };
          for (let i = 0; i < 20; i++) npcs.update(0.1, climbNear, false, hourState(12));
          waypointYFollows = campNpc.group.position.y > 9.75 && campNpc.group.position.y <= 11.25;
          campNpc.waypoints = savedCamp.wps;
          campNpc.currentWpIndex = savedCamp.idx;
          campNpc.baseY = savedCamp.baseY;
          campNpc.group.position.set(savedCamp.x, savedCamp.y, savedCamp.z);
        }
        const streetYFlat = !clodoaldo || Math.abs(clodoaldo.group.position.y) <= 0.2;

        applyHour(12.0, farStreet);
        const targetsOpen = npcs.getInteractableTargets();
        const targetIdsOpen = targetsOpen.map((t) => t.id).sort();
        const expectedTargets = originalIds.slice().sort();
        const targetsExactWhenOpen = targetIdsOpen.length === 6
          && expectedTargets.every((id, i) => targetIdsOpen[i] === id)
          && targetsOpen.every((t) => t.isNpc && t.isOpen);
        applyHour(8.0, farStreet);
        const targetsClosed = npcs.getInteractableTargets();
        const targetsExactWhenClosed = targetsClosed.length === 6
          && targetsClosed.map((t) => t.id).sort().every((id, i) => expectedTargets[i] === id);
        const eventNeverTargeted = [...carnival, ...campinho].every((n) =>
          !targetsOpen.some((t) => t.id === n.id) && !targetsClosed.some((t) => t.id === n.id)
        );

        const hostProbe = carnival[0];
        let hostOpenTargeted = false;
        let hostClosedExcluded = false;
        if (hostProbe) {
          const savedInteractable = hostProbe.interactable;
          hostProbe.interactable = true;
          applyHour(12.0, farStreet);
          hostOpenTargeted = npcs.getInteractableTargets().some((t) => t.id === hostProbe.id);
          applyHour(8.0, farStreet);
          hostClosedExcluded = !npcs.getInteractableTargets().some((t) => t.id === hostProbe.id);
          hostProbe.interactable = savedInteractable;
          applyHour(12.0, farStreet);
        }
        const hostScheduleContract = hostOpenTargeted && hostClosedExcluded;

        const pagePath = window.location.pathname;
        const isEsmBuild = pagePath.endsWith('index.html') || pagePath === '/' || pagePath === '';
        let NpcCtor = null;
        let RngCtor = null;
        let ctorSource = 'missing';
        if (isEsmBuild) {
          const npcMod = await import('/src/game/NpcSystem.js');
          const rngMod = await import('/src/game/Rng.js');
          NpcCtor = npcMod.NpcSystem;
          RngCtor = rngMod.Rng;
          ctorSource = 'esm-import';
        } else if (typeof NpcSystem !== 'undefined' && typeof Rng !== 'undefined') {
          NpcCtor = NpcSystem;
          RngCtor = Rng;
          ctorSource = 'classic-lexical';
        }

        const cosmeticSignature = (system) => (system.npcs || [])
          .filter((n) => n.zoneId === 'BLOCO_EDGAR_FACCO' || n.zoneId === 'CAMPINHO_CHURRASCO')
          .map((n) => [
            n.id,
            n.costumeId || '',
            n.animationMode || '',
            (n.waypoints || []).map((wp) => [wp.x, wp.y, wp.z].join(',')).join('/')
          ].join('|'))
          .join(';');

        let sameSeed = false;
        let differentSeed = false;
        let sigA = '';
        let usedDirectRng = false;
        let rngStateRestored = false;
        let noCrowdRng = false;
        if (NpcCtor && RngCtor && game.scene) {
          const sysA = new NpcCtor(game.scene, game.sound, new RngCtor(424242), game.textures);
          const sysB = new NpcCtor(game.scene, game.sound, new RngCtor(424242), game.textures);
          const sysC = new NpcCtor(game.scene, game.sound, new RngCtor(999001), game.textures);
          sigA = cosmeticSignature(sysA);
          const sigB = cosmeticSignature(sysB);
          const sigC = cosmeticSignature(sysC);
          sameSeed = sigA.length > 0 && sigA === sigB;
          differentSeed = sigA.length > 0 && sigA !== sigC;
          [sysA, sysB, sysC].forEach((sys) => {
            if (sys.npcGroup && sys.npcGroup.parent) sys.npcGroup.parent.remove(sys.npcGroup);
            if (sys.blocoSpectatorGroup && sys.blocoSpectatorGroup.parent) sys.blocoSpectatorGroup.parent.remove(sys.blocoSpectatorGroup);
            if (sys.campinhoSpectatorGroup && sys.campinhoSpectatorGroup.parent) sys.campinhoSpectatorGroup.parent.remove(sys.campinhoSpectatorGroup);
          });

          const probeRng = new RngCtor(777001);
          const stateBefore = probeRng.state;
          let draws = 0;
          const origRandom = probeRng.random.bind(probeRng);
          probeRng.random = function wrappedRandom() {
            draws += 1;
            return origRandom();
          };
          const sysProbe = new NpcCtor(game.scene, game.sound, probeRng, game.textures);
          probeRng.random = origRandom;
          usedDirectRng = draws > 0;
          rngStateRestored = probeRng.state === stateBefore;
          noCrowdRng = !sysProbe.crowdRng;
          if (sysProbe.npcGroup && sysProbe.npcGroup.parent) sysProbe.npcGroup.parent.remove(sysProbe.npcGroup);
          if (sysProbe.blocoSpectatorGroup && sysProbe.blocoSpectatorGroup.parent) {
            sysProbe.blocoSpectatorGroup.parent.remove(sysProbe.blocoSpectatorGroup);
          }
          if (sysProbe.campinhoSpectatorGroup && sysProbe.campinhoSpectatorGroup.parent) {
            sysProbe.campinhoSpectatorGroup.parent.remove(sysProbe.campinhoSpectatorGroup);
          }
        }

        const ok = originalsPresent && originalsIntact
          && carnival.length === 6 && campinho.length === 6
          && danceCount === 4 && runCount === 2 && footballCount === 6
          && costumesExact && namesClean
          && carnivalPlaced && runnersOffRoad && campPlaced
          && spectatorCountsOk && spectatorsLightweight && hasPointLight === false
          && scheduleOk && streetMoved && farCulled && nearMoved
          && streetArrivalHeld && eventArrivalSteers
          && runnerFarFixed && runnerNearMoved
          && danceLimbsChanged && danceNoPathDrift && dancerStreetYOk
          && footballElevated && campYOk
          && waypointYFollows && streetYFlat
          && targetsExactWhenOpen && targetsExactWhenClosed && eventNeverTargeted
          && hostScheduleContract
          && sameSeed && differentSeed
          && usedDirectRng && rngStateRestored && noCrowdRng
          && (ctorSource === 'esm-import' || ctorSource === 'classic-lexical');

        return {
          ok,
          originalsPresent,
          originalsIntact,
          carnivalCount: carnival.length,
          campinhoCount: campinho.length,
          danceCount,
          runCount,
          footballCount,
          costumesExact,
          carnivalCostumesUsed,
          namesClean,
          carnivalPlaced,
          runnersOffRoad,
          campPlaced,
          blocoSpecs,
          campSpecs,
          spectatorCountsOk,
          spectatorsLightweight,
          hasPointLight,
          schedule: {
            blocoClosedBefore, blocoOpenAtOpen, blocoOpenBeforeClose, blocoClosedAtClose,
            campClosedBefore, campOpenAtOpen, campOpenBeforeClose, campClosedAtClose
          },
          scheduleOk,
          streetMoved,
          streetArrivalHeld,
          eventArrivalSteers,
          farCulled,
          runnerFarFixed,
          nearMoved,
          runnerNearMoved,
          danceLimbsChanged,
          danceNoPathDrift,
          dancerStreetYOk,
          footballMoved,
          footballLimbsChanged,
          footballElevated,
          campYAfter,
          campYOk,
          waypointYFollows,
          streetYFlat,
          targetsOpenCount: targetsOpen.length,
          targetsClosedCount: targetsClosed.length,
          targetIdsOpen,
          targetsExactWhenOpen,
          targetsExactWhenClosed,
          eventNeverTargeted,
          hostOpenTargeted,
          hostClosedExcluded,
          hostScheduleContract,
          sameSeed,
          differentSeed,
          usedDirectRng,
          rngStateRestored,
          noCrowdRng,
          ctorSource,
          sigLen: sigA.length
        };
      })()
    `);
    console.log(`[TEST 33] Scheduled carnival and campinho crowds:`, carnivalCrowdTested);
    if (!carnivalCrowdTested.ok) {
      throw new Error(`TEST 33 FAILED: scheduled carnival/campinho crowds must preserve original arrival-frame steering, hide inactive interactable zone NPCs, draw costumes/paths from this.rng with restored state, differ by costume/path across seeds, and interpolate event waypoint y. ${JSON.stringify(carnivalCrowdTested)}`);
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
    const customUrl = process.argv[2];
    if (customUrl) {
      await runTestSuite(customUrl);
    } else {
      await runTestSuite('http://localhost:8090/index.html?seed=42');
      await runTestSuite('http://localhost:8090/pirituba_standalone.html?seed=42');
    }
    console.log('🎉 ALL TEST SUITES PASSED WITH 100% INVARIANT COMPLIANCE!');
    process.exit(0);
  } catch (e) {
    console.error('❌ TEST FAILED:', e);
    process.exit(1);
  }
}

main();
