/**
 * Main Application Entry Point (Version 2 Update)
 * Wires together Renderer, CityBuilder, TrafficSystem, Controls, Physics, Audio, and HUD.
 */

import { CityRenderer } from './engine/Renderer.js';
import { FirstPersonControls } from './engine/Controls.js';
import { PhysicsEngine } from './engine/Physics.js';
import { TextureGenerator } from './world/Textures.js';
import { CityBuilder } from './world/CityBuilder.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { TrafficSystem } from './engine/TrafficSystem.js';
import { GameManager } from './game/GameManager.js';
import { ZoneManager } from './world/Zones.js';
import { TouchController } from './engine/TouchControls.js';
import { initLanguage, getLanguage, setLanguage, toggleLanguage, updateDomTranslations } from './game/i18n.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // Subsystems
    this.renderer = new CityRenderer(this.container);
    this.physics = new PhysicsEngine();
    this.textures = new TextureGenerator();
    this.sound = new SoundEngine();

    // Build World (Favela, Escadão, Lajes, Walkable Interiors)
    this.city = new CityBuilder(this.renderer.scene, this.physics, this.textures);
    this.city.build();

    // Traffic System (SPTrans Bus, Cars, Motoboy, Semáforo)
    this.traffic = new TrafficSystem(this.renderer.scene, this.sound, this.textures);

    // Controls
    this.controls = new FirstPersonControls(
      this.renderer.camera,
      document.body,
      this.physics,
      this.sound,
      this.renderer.scene
    );

    const urlParams = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : null;
    const seedParam = urlParams ? urlParams.get('seed') : null;
    const parsedSeed = seedParam !== null ? parseInt(seedParam, 10) : null;
    const initialSeed = Number.isFinite(parsedSeed) ? parsedSeed : null;

    // Brazil Simulator Roguelite Master Manager
    this.game = new GameManager(
      this.renderer.scene,
      this.renderer.camera,
      this.controls,
      this.physics,
      this.textures,
      this.sound,
      this.city,
      this.traffic,
      initialSeed
    );
    console.log('[Sobrevivência BR] Active Seed:', this.game.seed);

    // Touch Controls Subsystem (Virtual Thumbstick & Mobile Action Buttons)
    this.touch = new TouchController(this.controls, this);

    // Unlock Web Audio context on first mobile touch gesture
    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', () => {
        if (this.sound && !this.sound.isInitialized) {
          this.sound.init();
        }
      }, { once: true });
    }

    // Initial time of day
    this.timeOfDay = 'DAY';
    this.city.setTimeOfDay(this.timeOfDay);
    this.sound.setTimeOfDay(true);

    // Performance & loop metrics
    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.fps = 60;

    // HUD Elements
    this.fpsElem = document.getElementById('hud-fps');
    this.locationElem = document.getElementById('hud-location');
    this.coordsElem = document.getElementById('hud-coords');
    this.modeElem = document.getElementById('hud-mode');
    this.timeElem = document.getElementById('hud-time');
    this.audioBtn = document.getElementById('btn-audio');
    this.radioBtn = document.getElementById('btn-radio');
    this.radioLabel = document.getElementById('hud-radio');
    this.tourBtn = document.getElementById('btn-tour');
    this.emptyBtn = document.getElementById('btn-empty');
    this.streetViewBtn = document.getElementById('btn-streetview');
    this.visualsBtn = document.getElementById('btn-visuals');
    this.cameraBtn = document.getElementById('btn-camera');
    this.cameraLabel = document.getElementById('hud-camera-label');
    this.langBtn = document.getElementById('btn-lang');
    this.mobileLangBtn = document.getElementById('mobile-btn-lang');

    // Google Street View Modal Elements
    this.streetViewModal = document.getElementById('street-view-modal');
    this.streetViewIframe = document.getElementById('streetview-iframe');
    this.btnCloseStreetView = document.getElementById('btn-close-streetview');
    this.btnRefreshStreetView = document.getElementById('btn-refresh-sv');
    this.isStreetViewOpen = false;

    // Visual Parameters Modal Elements
    this.visualsModal = document.getElementById('visuals-modal');
    this.isVisualsModalOpen = false;

    initLanguage();
    this.initUI();
    this.initRoulette();
    updateDomTranslations();
    window.app = this;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initRoulette() {
    const rouletteModal = document.getElementById('roulette-modal');
    const spinBtn = document.getElementById('btn-spin-roulette');
    const classBtns = document.querySelectorAll('.class-select-btn');
    const clickOverlay = document.getElementById('click-overlay');

    if (clickOverlay) {
      clickOverlay.style.display = 'none';
    }

    if (rouletteModal) {
      rouletteModal.classList.remove('modal-hidden');
    }
    if (this.controls && this.controls.refreshFreeze) this.controls.refreshFreeze();

    const startWithClass = (classKey) => {
      if (rouletteModal) rouletteModal.classList.add('modal-hidden');
      if (clickOverlay) clickOverlay.style.display = 'none';
      if (this.controls && this.controls.refreshFreeze) this.controls.refreshFreeze();

      this.controls.hasStarted = true;
      this.game.startRun(classKey);

      try {
        const target = document.body;
        const p = target.requestPointerLock ? target.requestPointerLock() : null;
        if (p && p.catch) p.catch(() => {});
      } catch (err) {}
    };

    if (spinBtn) {
      spinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startWithClass(null);
      });
    }

    classBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const classKey = btn.getAttribute('data-class');
        startWithClass(classKey);
      });
    });

    const rouletteLangBtns = document.querySelectorAll('#roulette-lang-group .lang-btn');
    rouletteLangBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang, this);
      });
    });
  }

  toggleStreetView(forceState) {
    this.isStreetViewOpen = typeof forceState === 'boolean' ? forceState : !this.isStreetViewOpen;

    if (this.isStreetViewOpen) {
      // Open modal
      if (this.streetViewModal) this.streetViewModal.classList.remove('modal-hidden');
      if (this.streetViewBtn) this.streetViewBtn.classList.add('active');
      if (this.controls && this.controls.refreshFreeze) this.controls.refreshFreeze();

      if (this.sound && this.sound.newsDesk) {
        this.sound.newsDesk.recordAction('STREETVIEW', 'Congelou e ficou encarando o céu em 360 graus na Edgar Facó');
      }

      // Lazy-load iframe source if needed
      if (this.streetViewIframe && (this.streetViewIframe.src === 'about:blank' || !this.streetViewIframe.src)) {
        const dataSrc = this.streetViewIframe.getAttribute('data-src');
        if (dataSrc) this.streetViewIframe.src = dataSrc;
      }

      // Exit pointer lock so user can interact with 360 panorama
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    } else {
      // Close modal
      if (this.streetViewModal) this.streetViewModal.classList.add('modal-hidden');
      if (this.streetViewBtn) this.streetViewBtn.classList.remove('active');
      if (this.controls && this.controls.refreshFreeze) this.controls.refreshFreeze();
      if (this.game) this.game.collisionImmunityTimer = 2.5;
      if (this.controls && typeof this.controls.requestPointerLock === 'function') {
        this.controls.requestPointerLock();
      }
    }
  }

  toggleVisualsModal(forceState) {
    this.isVisualsModalOpen = typeof forceState === 'boolean' ? forceState : !this.isVisualsModalOpen;

    if (this.visualsModal) {
      this.visualsModal.classList.toggle('modal-hidden', !this.isVisualsModalOpen);
    }
    if (this.visualsBtn) {
      this.visualsBtn.classList.toggle('active', this.isVisualsModalOpen);
    }
    if (this.controls && this.controls.refreshFreeze) {
      this.controls.refreshFreeze();
    }

    if (this.isVisualsModalOpen) {
      if (document.exitPointerLock) document.exitPointerLock();
      const visualWindow = document.querySelector('.visual-modal-window');
      const btnMinimize = document.getElementById('btn-minimize-visuals');
      if (visualWindow) visualWindow.classList.remove('minimized');
      if (btnMinimize) {
        btnMinimize.textContent = '—';
        btnMinimize.title = 'Minimizar Painel';
      }
      this.syncVisualControlsUI();
    } else {
      if (this.game) this.game.collisionImmunityTimer = 2.5;
      if (this.controls && typeof this.controls.requestPointerLock === 'function') {
        this.controls.requestPointerLock();
      }
    }
  }

  syncVisualControlsUI() {
    const params = this.renderer.params;
    const densitySlider = document.getElementById('slider-density');
    const brightnessSlider = document.getElementById('slider-brightness');
    const contrastSlider = document.getElementById('slider-contrast');
    const gammaSlider = document.getElementById('slider-gamma');
    const saturationSlider = document.getElementById('slider-saturation');
    const edgeChk = document.getElementById('chk-edges');
    const rampSelect = document.getElementById('select-ramp');
    const scanlineChk = document.getElementById('chk-scanlines');
    const depthSlider = document.getElementById('slider-depth');
    const fovSlider = document.getElementById('slider-fov');
    const bloomSlider = document.getElementById('slider-bloom');
    const fogSlider = document.getElementById('slider-fog');
    const paletteSelect = document.getElementById('select-palette');

    if (densitySlider) densitySlider.value = params.density;
    if (brightnessSlider) brightnessSlider.value = params.brightness;
    if (contrastSlider) contrastSlider.value = params.contrast;
    if (gammaSlider) gammaSlider.value = params.gamma;
    if (saturationSlider) saturationSlider.value = params.saturation;
    if (depthSlider) depthSlider.value = params.depthScale !== undefined ? params.depthScale : 1.0;
    if (fovSlider) fovSlider.value = params.fov !== undefined ? params.fov : 70;
    if (bloomSlider) bloomSlider.value = params.bloom !== undefined ? params.bloom : 0.0;
    if (fogSlider) fogSlider.value = params.fogDensity !== undefined ? params.fogDensity : 0.8;
    if (paletteSelect) paletteSelect.value = params.colorPalette || 'DEFAULT';
    if (edgeChk) edgeChk.checked = !!params.edgeEnhance;
    if (rampSelect) rampSelect.value = params.rampType || 'DETAILED';
    if (scanlineChk) scanlineChk.checked = !!params.scanlines;

    this.updateVisualReadouts();
  }

  updateVisualReadouts() {
    const params = this.renderer.params;
    const valDensity = document.getElementById('val-density');
    const valBrightness = document.getElementById('val-brightness');
    const valContrast = document.getElementById('val-contrast');
    const valGamma = document.getElementById('val-gamma');
    const valSaturation = document.getElementById('val-saturation');
    const valDepth = document.getElementById('val-depth');
    const valFov = document.getElementById('val-fov');
    const valBloom = document.getElementById('val-bloom');
    const valFog = document.getElementById('val-fog');

    if (valDensity) valDensity.textContent = `${Number(params.density).toFixed(1)}x (${this.renderer.charW}px)`;
    if (valBrightness) valBrightness.textContent = `${Number(params.brightness).toFixed(2)}x`;
    if (valContrast) valContrast.textContent = `${Number(params.contrast).toFixed(2)}x`;
    if (valGamma) valGamma.textContent = `${Number(params.gamma).toFixed(2)}x`;
    if (valSaturation) valSaturation.textContent = `${Number(params.saturation).toFixed(2)}x`;
    if (valDepth) valDepth.textContent = `${Number(params.depthScale !== undefined ? params.depthScale : 1.0).toFixed(1)}x`;
    if (valFov) valFov.textContent = `${Math.round(params.fov !== undefined ? params.fov : 70)}°`;
    if (valBloom) valBloom.textContent = `${Number(params.bloom !== undefined ? params.bloom : 0.0).toFixed(1)}x`;
    if (valFog) valFog.textContent = `${Number(params.fogDensity !== undefined ? params.fogDensity : 0.8).toFixed(1)}x`;

    // Keep slider thumbs synchronized when modified via hotkeys or presets
    const sliderDensity = document.getElementById('slider-density');
    const sliderBrightness = document.getElementById('slider-brightness');
    const sliderContrast = document.getElementById('slider-contrast');
    const sliderGamma = document.getElementById('slider-gamma');
    const sliderSaturation = document.getElementById('slider-saturation');
    const sliderDepth = document.getElementById('slider-depth');
    const sliderFov = document.getElementById('slider-fov');
    const sliderBloom = document.getElementById('slider-bloom');
    const sliderFog = document.getElementById('slider-fog');
    const selectPalette = document.getElementById('select-palette');
    const selectRenderMode = document.getElementById('select-render-mode');

    if (sliderDensity && document.activeElement !== sliderDensity) sliderDensity.value = params.density;
    if (sliderBrightness && document.activeElement !== sliderBrightness) sliderBrightness.value = params.brightness;
    if (sliderContrast && document.activeElement !== sliderContrast) sliderContrast.value = params.contrast;
    if (sliderGamma && document.activeElement !== sliderGamma) sliderGamma.value = params.gamma;
    if (sliderSaturation && document.activeElement !== sliderSaturation) sliderSaturation.value = params.saturation;
    if (sliderDepth && document.activeElement !== sliderDepth) sliderDepth.value = params.depthScale !== undefined ? params.depthScale : 1.0;
    if (sliderFov && document.activeElement !== sliderFov) sliderFov.value = params.fov !== undefined ? params.fov : 70;
    if (sliderBloom && document.activeElement !== sliderBloom) sliderBloom.value = params.bloom !== undefined ? params.bloom : 0.0;
    if (sliderFog && document.activeElement !== sliderFog) sliderFog.value = params.fogDensity !== undefined ? params.fogDensity : 0.8;
    if (selectPalette && document.activeElement !== selectPalette) selectPalette.value = params.colorPalette || 'DEFAULT';
    if (selectRenderMode && document.activeElement !== selectRenderMode) selectRenderMode.value = this.renderer.currentMode;
  }

  initUI() {
    // Street View modal toggle button
    if (this.streetViewBtn) {
      this.streetViewBtn.addEventListener('click', () => this.toggleStreetView());
    }

    if (this.btnCloseStreetView) {
      this.btnCloseStreetView.addEventListener('click', () => this.toggleStreetView(false));
    }

    const svBackdrop = document.querySelector('#street-view-modal .modal-backdrop');
    if (svBackdrop) {
      svBackdrop.addEventListener('click', () => this.toggleStreetView(false));
    }

    if (this.btnRefreshStreetView && this.streetViewIframe) {
      this.btnRefreshStreetView.addEventListener('click', () => {
        const dataSrc = this.streetViewIframe.getAttribute('data-src');
        if (dataSrc) this.streetViewIframe.src = dataSrc;
      });
    }

    // Mode toggle button
    const modeBtn = document.getElementById('btn-mode');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        const nextMode = this.renderer.cycleRenderMode();
        this.updateModeLabel(nextMode);
      });
    }

    // Visual Parameters modal toggle button
    if (this.visualsBtn) {
      this.visualsBtn.addEventListener('click', () => this.toggleVisualsModal());
    }

    // Camera perspective toggle button & Controls callback
    if (this.controls) {
      this.controls.onPerspectiveChange = (is3rd) => {
        this.updateCameraLabel(is3rd);
      };
    }

    if (this.cameraBtn) {
      this.cameraBtn.addEventListener('click', () => {
        const is3rd = this.controls.togglePerspective();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast(is3rd ? '👤 Visão em 3ª Pessoa Ativada' : '👁️ Visão em 1ª Pessoa Ativada', 1500);
        }
      });
    }

    const btnCloseVisuals = document.getElementById('btn-close-visuals');
    if (btnCloseVisuals) {
      btnCloseVisuals.addEventListener('click', () => this.toggleVisualsModal(false));
    }

    const btnDoneVisuals = document.getElementById('btn-done-visuals');
    if (btnDoneVisuals) {
      btnDoneVisuals.addEventListener('click', () => this.toggleVisualsModal(false));
    }

    const visualsBackdrop = document.querySelector('#visuals-modal .modal-backdrop');
    if (visualsBackdrop) {
      visualsBackdrop.addEventListener('click', () => this.toggleVisualsModal(false));
    }

    // Visual Tabs navigation
    const tabButtons = document.querySelectorAll('.visual-tab-btn');
    const tabPanes = {
      'tab-presets': document.getElementById('visual-pane-presets'),
      'tab-camera': document.getElementById('visual-pane-camera'),
      'tab-ascii': document.getElementById('visual-pane-ascii')
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');

        if (targetTab === 'tab-all') {
          Object.values(tabPanes).forEach(pane => {
            if (pane) pane.classList.remove('pane-hidden');
          });
        } else {
          Object.entries(tabPanes).forEach(([tabKey, pane]) => {
            if (pane) {
              pane.classList.toggle('pane-hidden', tabKey !== targetTab);
            }
          });
        }
      });
    });

    // Minimize / Expand button
    const btnMinimize = document.getElementById('btn-minimize-visuals');
    const visualWindow = document.querySelector('.visual-modal-window');
    if (btnMinimize && visualWindow) {
      btnMinimize.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMin = visualWindow.classList.toggle('minimized');
        btnMinimize.textContent = isMin ? '□' : '—';
        btnMinimize.title = isMin ? 'Expandir Painel' : 'Minimizar Painel';
      });
    }

    // Live sliders
    const densitySlider = document.getElementById('slider-density');
    if (densitySlider) {
      densitySlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ density: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const brightnessSlider = document.getElementById('slider-brightness');
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ brightness: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const contrastSlider = document.getElementById('slider-contrast');
    if (contrastSlider) {
      contrastSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ contrast: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const gammaSlider = document.getElementById('slider-gamma');
    if (gammaSlider) {
      gammaSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ gamma: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const saturationSlider = document.getElementById('slider-saturation');
    if (saturationSlider) {
      saturationSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ saturation: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const depthSlider = document.getElementById('slider-depth');
    if (depthSlider) {
      depthSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ depthScale: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const fovSlider = document.getElementById('slider-fov');
    if (fovSlider) {
      fovSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ fov: parseInt(e.target.value, 10) });
        this.updateVisualReadouts();
      });
    }

    const bloomSlider = document.getElementById('slider-bloom');
    if (bloomSlider) {
      bloomSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ bloom: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const fogSlider = document.getElementById('slider-fog');
    if (fogSlider) {
      fogSlider.addEventListener('input', (e) => {
        this.renderer.setVisualParams({ fogDensity: parseFloat(e.target.value) });
        this.updateVisualReadouts();
      });
    }

    const paletteSelect = document.getElementById('select-palette');
    if (paletteSelect) {
      paletteSelect.addEventListener('change', (e) => {
        this.renderer.setVisualParams({ colorPalette: e.target.value });
      });
    }

    const renderModeSelect = document.getElementById('select-render-mode');
    if (renderModeSelect) {
      renderModeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        this.renderer.setRenderMode(mode);
        this.updateModeLabel(mode);
      });
    }

    const edgeChk = document.getElementById('chk-edges');
    if (edgeChk) {
      edgeChk.addEventListener('change', (e) => {
        this.renderer.setVisualParams({ edgeEnhance: e.target.checked });
      });
    }

    const rampSelect = document.getElementById('select-ramp');
    if (rampSelect) {
      rampSelect.addEventListener('change', (e) => {
        this.renderer.setVisualParams({ rampType: e.target.value });
      });
    }

    const scanlineChk = document.getElementById('chk-scanlines');
    if (scanlineChk) {
      scanlineChk.addEventListener('change', (e) => {
        this.renderer.setVisualParams({ scanlines: e.target.checked });
      });
    }

    // Reset button
    const btnResetVisuals = document.getElementById('btn-reset-visuals');
    if (btnResetVisuals) {
      btnResetVisuals.addEventListener('click', () => {
        this.renderer.resetVisualParams();
        this.renderer.setRenderMode('RETRO_3D');
        this.updateModeLabel('RETRO_3D');
        this.syncVisualControlsUI();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast('🔄 Padrões visuais restaurados (Retro 3D)', 2000);
        }
      });
    }

    // Presets
    const presetBtns = document.querySelectorAll('.preset-btn');
    const setPresetActive = (targetBtn) => {
      presetBtns.forEach(b => b.classList.remove('active'));
      if (targetBtn) targetBtn.classList.add('active');
    };

    const btnPresetUltra = document.getElementById('preset-ultra');
    if (btnPresetUltra) {
      btnPresetUltra.addEventListener('click', () => {
        setPresetActive(btnPresetUltra);
        this.renderer.setRenderMode('ASCII_COLOR');
        this.updateModeLabel('ASCII_COLOR');
        this.renderer.setVisualParams({
          density: 1.8,
          brightness: 1.35,
          contrast: 1.35,
          gamma: 1.35,
          saturation: 1.3,
          bloom: 0.3,
          fogDensity: 0.3,
          colorPalette: 'DEFAULT',
          edgeEnhance: true,
          rampType: 'CONTRAST',
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetBlocks = document.getElementById('preset-blocks');
    if (btnPresetBlocks) {
      btnPresetBlocks.addEventListener('click', () => {
        setPresetActive(btnPresetBlocks);
        this.renderer.setRenderMode('ASCII_COLOR');
        this.updateModeLabel('ASCII_COLOR');
        this.renderer.setVisualParams({
          density: 1.4,
          brightness: 1.25,
          contrast: 1.4,
          gamma: 1.25,
          saturation: 1.2,
          bloom: 0.0,
          fogDensity: 0.8,
          colorPalette: 'DEFAULT',
          edgeEnhance: true,
          rampType: 'BLOCKS',
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetFavela = document.getElementById('preset-favela');
    if (btnPresetFavela) {
      btnPresetFavela.addEventListener('click', () => {
        setPresetActive(btnPresetFavela);
        this.renderer.setRenderMode('ASCII_COLOR');
        this.updateModeLabel('ASCII_COLOR');
        this.renderer.setVisualParams({
          density: 1.2,
          brightness: 1.3,
          contrast: 1.3,
          gamma: 1.2,
          saturation: 1.85,
          bloom: 0.6,
          fogDensity: 0.5,
          colorPalette: 'DEFAULT',
          edgeEnhance: true,
          rampType: 'DETAILED',
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetMatrix = document.getElementById('preset-matrix');
    if (btnPresetMatrix) {
      btnPresetMatrix.addEventListener('click', () => {
        setPresetActive(btnPresetMatrix);
        this.renderer.setRenderMode('ASCII_MATRIX');
        this.updateModeLabel('ASCII_MATRIX');
        this.renderer.setVisualParams({
          density: 1.5,
          brightness: 1.3,
          contrast: 1.4,
          gamma: 1.3,
          bloom: 0.8,
          fogDensity: 0.6,
          edgeEnhance: true,
          rampType: 'MATRIX',
          scanlines: true
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetVaporwave = document.getElementById('preset-vaporwave');
    if (btnPresetVaporwave) {
      btnPresetVaporwave.addEventListener('click', () => {
        setPresetActive(btnPresetVaporwave);
        this.renderer.setRenderMode('ASCII_COLOR');
        this.updateModeLabel('ASCII_COLOR');
        this.renderer.setVisualParams({
          density: 1.2,
          brightness: 1.25,
          contrast: 1.4,
          gamma: 1.25,
          saturation: 1.8,
          bloom: 0.9,
          fogDensity: 0.6,
          colorPalette: 'VAPORWAVE',
          edgeEnhance: true,
          rampType: 'SHARPLINE',
          scanlines: true
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetGameboy = document.getElementById('preset-gameboy');
    if (btnPresetGameboy) {
      btnPresetGameboy.addEventListener('click', () => {
        setPresetActive(btnPresetGameboy);
        this.renderer.setRenderMode('ASCII_COLOR');
        this.updateModeLabel('ASCII_COLOR');
        this.renderer.setVisualParams({
          density: 1.1,
          brightness: 1.15,
          contrast: 1.35,
          gamma: 1.1,
          saturation: 1.0,
          bloom: 0.0,
          fogDensity: 0.4,
          colorPalette: 'GAMEBOY',
          edgeEnhance: true,
          rampType: 'BLOCKS',
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetThermal = document.getElementById('preset-thermal');
    if (btnPresetThermal) {
      btnPresetThermal.addEventListener('click', () => {
        setPresetActive(btnPresetThermal);
        this.renderer.setRenderMode('SHADER_THERMAL');
        this.updateModeLabel('SHADER_THERMAL');
        this.renderer.setVisualParams({
          density: 1.2,
          brightness: 1.2,
          contrast: 1.4,
          gamma: 1.2,
          bloom: 0.5,
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetWireframe = document.getElementById('preset-wireframe');
    if (btnPresetWireframe) {
      btnPresetWireframe.addEventListener('click', () => {
        setPresetActive(btnPresetWireframe);
        this.renderer.setRenderMode('SHADER_WIREFRAME');
        this.updateModeLabel('SHADER_WIREFRAME');
      });
    }

    const btnPresetComic = document.getElementById('preset-comic');
    if (btnPresetComic) {
      btnPresetComic.addEventListener('click', () => {
        setPresetActive(btnPresetComic);
        this.renderer.setRenderMode('SHADER_COMIC');
        this.updateModeLabel('SHADER_COMIC');
        this.renderer.setVisualParams({
          density: 1.3,
          brightness: 1.2,
          contrast: 1.6,
          gamma: 1.1,
          edgeEnhance: true,
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetDither = document.getElementById('preset-dither');
    if (btnPresetDither) {
      btnPresetDither.addEventListener('click', () => {
        setPresetActive(btnPresetDither);
        this.renderer.setRenderMode('SHADER_DITHER');
        this.updateModeLabel('SHADER_DITHER');
        this.renderer.setVisualParams({
          density: 1.2,
          brightness: 1.1,
          contrast: 1.5,
          gamma: 1.0,
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetVhs = document.getElementById('preset-vhs');
    if (btnPresetVhs) {
      btnPresetVhs.addEventListener('click', () => {
        setPresetActive(btnPresetVhs);
        this.renderer.setRenderMode('SHADER_VHS');
        this.updateModeLabel('SHADER_VHS');
        this.renderer.setVisualParams({
          density: 1.1,
          brightness: 1.2,
          contrast: 1.3,
          gamma: 1.2,
          saturation: 1.5,
          bloom: 0.4,
          scanlines: true
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPresetBraille = document.getElementById('preset-braille');
    if (btnPresetBraille) {
      btnPresetBraille.addEventListener('click', () => {
        setPresetActive(btnPresetBraille);
        this.renderer.setRenderMode('ASCII_BRAILLE');
        this.updateModeLabel('ASCII_BRAILLE');
        this.renderer.setVisualParams({
          density: 1.0,
          brightness: 1.3,
          contrast: 1.4,
          gamma: 1.2,
          bloom: 0.2,
          scanlines: false
        });
        this.syncVisualControlsUI();
      });
    }

    const btnPreset3d = document.getElementById('preset-3d');
    if (btnPreset3d) {
      btnPreset3d.addEventListener('click', () => {
        setPresetActive(btnPreset3d);
        this.renderer.setRenderMode('RETRO_3D');
        this.updateModeLabel('RETRO_3D');
      });
    }

    const btnPresetDefault = document.getElementById('preset-default');
    if (btnPresetDefault) {
      btnPresetDefault.addEventListener('click', () => {
        setPresetActive(btnPresetDefault);
        this.renderer.setRenderMode('RETRO_3D');
        this.updateModeLabel('RETRO_3D');
        this.renderer.resetVisualParams();
        this.syncVisualControlsUI();
      });
    }

    // Time of day toggle button
    const timeBtn = document.getElementById('btn-time');
    if (timeBtn) {
      timeBtn.addEventListener('click', () => {
        if (!this.controls.freeze) {
          this.cycleTimeOfDay();
        }
      });
    }

    // Audio toggle button
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', () => {
        const muted = this.sound.toggleMute();
        this.audioBtn.textContent = muted ? '🔇 SOM: DESLIGADO' : '🔊 SOM: LIGADO';
      });
    }

    // Radio station toggle button & hotkey [N]
    const handleRadioCycle = () => {
      const station = this.sound.cycleRadioStation();
      this.updateRadioLabel();
      if (this.game && this.game.hud && this.game.hud.showToast) {
        this.game.hud.showToast(`📻 <strong>RÁDIO PIRITUBA FM</strong><br>${station.icon} <strong>${station.name}</strong>: ${station.desc}`, 4000);
      }
    };

    if (this.radioBtn) {
      this.radioBtn.addEventListener('click', () => handleRadioCycle());
    }

    // Auto Tour toggle button (Version 2)
    if (this.tourBtn) {
      this.tourBtn.addEventListener('click', () => {
        if (this.controls.freeze) return;
        const active = this.controls.toggleAutoTour();
        this.tourBtn.textContent = active ? '🎥 TOUR: ATIVO [U]' : '🎥 AUTO TOUR [U]';
      });
    }

    // Empty City toggle button (Version 2)
    if (this.emptyBtn) {
      this.emptyBtn.addEventListener('click', () => {
        const isEmpty = this.traffic.toggleEmptyCity();
        this.emptyBtn.textContent = isEmpty ? '🏙️ CIDADE VAZIA [X]' : '🚗 TRÂNSITO ATIVO [X]';
      });
    }

    // Language Toggle Button [L]
    if (this.langBtn) {
      this.langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLanguage(this);
      });
    }

    // Wire Mobile Menu Drawer Buttons
    const closeMobileDrawer = () => {
      const drawer = document.getElementById('mobile-menu-drawer');
      const btnMenu = document.getElementById('touch-btn-menu');
      if (drawer) drawer.classList.add('modal-hidden');
      if (btnMenu) btnMenu.classList.remove('active');
    };

    const mBtnLang = document.getElementById('mobile-btn-lang');
    if (mBtnLang) {
      mBtnLang.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLanguage(this);
      });
    }

    const mBtnStreetview = document.getElementById('mobile-btn-streetview');
    if (mBtnStreetview) {
      mBtnStreetview.addEventListener('click', () => {
        closeMobileDrawer();
        this.toggleStreetView();
      });
    }

    const mBtnMode = document.getElementById('mobile-btn-mode');
    if (mBtnMode) {
      mBtnMode.addEventListener('click', () => {
        const nextMode = this.renderer.cycleRenderMode();
        this.updateModeLabel(nextMode);
      });
    }

    const mBtnVisuals = document.getElementById('mobile-btn-visuals');
    if (mBtnVisuals) {
      mBtnVisuals.addEventListener('click', () => {
        closeMobileDrawer();
        this.toggleVisualsModal();
      });
    }

    const mBtnCamera = document.getElementById('mobile-btn-camera');
    if (mBtnCamera) {
      mBtnCamera.addEventListener('click', () => {
        this.controls.togglePerspective();
      });
    }

    const mBtnRadio = document.getElementById('mobile-btn-radio');
    if (mBtnRadio) {
      mBtnRadio.addEventListener('click', () => {
        handleRadioCycle();
      });
    }

    const mBtnAudio = document.getElementById('mobile-btn-audio');
    if (mBtnAudio) {
      mBtnAudio.addEventListener('click', () => {
        const muted = this.sound.toggleMute();
        mBtnAudio.textContent = muted ? '🔇 Som: Desligado' : '🔊 Som: Ligado';
        if (this.audioBtn) this.audioBtn.textContent = muted ? '🔇 SOM: DESLIGADO' : '🔊 SOM: LIGADO';
      });
    }

    const mBtnTour = document.getElementById('mobile-btn-tour');
    if (mBtnTour) {
      mBtnTour.addEventListener('click', () => {
        closeMobileDrawer();
        if (this.controls.freeze) return;
        const active = this.controls.toggleAutoTour();
        mBtnTour.textContent = active ? '🎥 Tour: Ativo [U]' : '🎥 Auto Tour [U]';
      });
    }

    const mBtnTraffic = document.getElementById('mobile-btn-traffic');
    if (mBtnTraffic) {
      mBtnTraffic.addEventListener('click', () => {
        const isEmpty = this.traffic.toggleEmptyCity();
        mBtnTraffic.textContent = isEmpty ? '🏙️ Cidade Vazia [X]' : '🚗 Trânsito Ativo [X]';
      });
    }

    // Hotkeys
    window.addEventListener('keydown', (e) => {
      // Guard browser-level commands: ignore Meta (Cmd) and Alt combos
      if (e.metaKey || e.altKey) return;

      // When Ctrl is held (e.g. crouching with ControlLeft), protect browser shortcuts like Print (Ctrl+P) or Zoom (Ctrl+/Ctrl+)
      // without swallowing game hotkeys like [E] interact, [M] mode, [T] time, [N] radio, etc.
      if (e.ctrlKey) {
        if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P' ||
            e.code === 'Minus' || e.code === 'Equal' || e.key === '-' || e.key === '=' || e.key === '+') {
          return;
        }
      }

      const isRouletteOpen = typeof document !== 'undefined' && document.getElementById('roulette-modal') && !document.getElementById('roulette-modal').classList.contains('modal-hidden');

      if (e.code === 'KeyL' || e.key === 'l' || e.key === 'L') {
        toggleLanguage(this);
      } else if (e.code === 'KeyV' || e.key === 'v' || e.key === 'V') {
        this.toggleStreetView();
      } else if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        if (isRouletteOpen) return;
        this.toggleVisualsModal();
      } else if (e.code === 'Escape' || e.key === 'Escape') {
        if (this.isStreetViewOpen) {
          this.toggleStreetView(false);
        } else if (this.isVisualsModalOpen) {
          this.toggleVisualsModal(false);
        }
      } else if (e.code === 'BracketLeft' || e.key === '[') {
        const newD = Math.max(0.6, +(this.renderer.params.density - 0.1).toFixed(1));
        this.renderer.setVisualParams({ density: newD });
        this.updateVisualReadouts();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast(`🔤 Densidade ASCII: ${newD.toFixed(1)}x (${this.renderer.charW}px)`, 1500);
        }
      } else if (e.code === 'BracketRight' || e.key === ']') {
        const newD = Math.min(2.4, +(this.renderer.params.density + 0.1).toFixed(1));
        this.renderer.setVisualParams({ density: newD });
        this.updateVisualReadouts();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast(`🔤 Densidade ASCII: ${newD.toFixed(1)}x (${this.renderer.charW}px)`, 1500);
        }
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract' || e.key === '-') {
        const newB = Math.max(0.5, +(this.renderer.params.brightness - 0.05).toFixed(2));
        this.renderer.setVisualParams({ brightness: newB });
        this.updateVisualReadouts();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast(`☀️ Brilho: ${newB.toFixed(2)}x`, 1500);
        }
      } else if (e.code === 'Equal' || e.code === 'NumpadAdd' || e.key === '=' || e.key === '+') {
        const newB = Math.min(2.5, +(this.renderer.params.brightness + 0.05).toFixed(2));
        this.renderer.setVisualParams({ brightness: newB });
        this.updateVisualReadouts();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast(`☀️ Brilho: ${newB.toFixed(2)}x`, 1500);
        }
      } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
        const nextMode = this.renderer.cycleRenderMode();
        this.updateModeLabel(nextMode);
      } else if (e.code === 'KeyT' || e.key === 't' || e.key === 'T') {
        if (!this.controls.freeze) {
          this.cycleTimeOfDay();
        }
      } else if (e.code === 'KeyO' || e.key === 'o' || e.key === 'O') {
        const muted = this.sound.toggleMute();
        if (this.audioBtn) {
          this.audioBtn.textContent = muted ? '🔇 SOM: DESLIGADO' : '🔊 SOM: LIGADO';
        }
      } else if (e.code === 'KeyN' || e.key === 'n' || e.key === 'N') {
        handleRadioCycle();
      } else if (e.code === 'KeyU' || e.key === 'u' || e.key === 'U') {
        if (!this.controls.freeze) {
          const active = this.controls.toggleAutoTour();
          if (this.tourBtn) {
            this.tourBtn.textContent = active ? '🎥 TOUR: ATIVO [U]' : '🎥 AUTO TOUR [U]';
          }
        }
      } else if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
        const isEmpty = this.traffic.toggleEmptyCity();
        if (this.emptyBtn) {
          this.emptyBtn.textContent = isEmpty ? '🏙️ CIDADE VAZIA [X]' : '🚗 TRÂNSITO ATIVO [X]';
        }
      } else if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        if (!this.controls.freeze) {
          this.game.handleInteract();
        }
      } else if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B' || e.code === 'F5') {
        if (!isRouletteOpen && !this.isVisualsModalOpen && !this.isStreetViewOpen) {
          if (e.code === 'F5') e.preventDefault();
          const is3rd = this.controls.togglePerspective();
          if (this.game && this.game.hud && this.game.hud.showToast) {
            this.game.hud.showToast(is3rd ? '👤 Visão em 3ª Pessoa [B]' : '👁️ Visão em 1ª Pessoa [B]', 1500);
          }
        }
      }
    });

    this.updateModeLabel(this.renderer.currentMode);
  }

  cycleTimeOfDay() {
    if (this.controls && this.controls.freeze) return;

    // During active survival run, time flows naturally to prevent instant-win exploits
    if (this.game && this.game.isRunActive) {
      if (this.game.hud && this.game.hud.showToast) {
        this.game.hud.showToast('⏱️ O tempo corre naturalmente na sobrevivência! (Avanço manual desativado na run)', 3000);
      }
      return;
    }

    const times = ['DAY', 'SUNSET', 'NIGHT'];
    const nextIdx = (times.indexOf(this.timeOfDay) + 1) % times.length;
    this.timeOfDay = times[nextIdx];
    this.city.setTimeOfDay(this.timeOfDay);
    this.sound.setTimeOfDay(this.timeOfDay !== 'NIGHT');

    // Harmonize sim clock with manual time-of-day toggle
    const hourTargets = { DAY: 11.5, SUNSET: 17.5, NIGHT: 21.5 };
    if (this.game && this.game.clock) {
      const targetH = hourTargets[this.timeOfDay] || 12.0;
      this.game.clock.setHour(targetH, false);
    }

    const labels = {
      DAY: '☀️ DIA (SOL)',
      SUNSET: '🌇 ENTARDECER (DOURADA)',
      NIGHT: '🌙 NOITE (NEON & POSTES)'
    };
    if (this.timeElem) this.timeElem.textContent = labels[this.timeOfDay];
  }

  updateModeLabel(mode) {
    const labels = {
      ASCII_COLOR: 'FAVELA ASCII (RGB)',
      ASCII_MATRIX: 'CYBER MATRIX (VERDE)',
      ASCII_AMBER: 'TERMINAL AMBER (CRT)',
      ASCII_CYBER: 'CYBER NEON (CYAN/ROSA)',
      ASCII_BRAILLE: 'BRAILLE HD 2x4 (SUBPIXEL)',
      SHADER_THERMAL: 'FLIR TÉRMICO (INFRAVERMELHO)',
      SHADER_DITHER: 'DITHER 1-BIT (OBRA DINN)',
      SHADER_COMIC: 'CEL SHADING (QUADRINHOS)',
      SHADER_WIREFRAME: 'VETORIAL ARCADE (WIREFRAME)',
      SHADER_VHS: 'VHS GLITCH (CAMCORDER 1995)',
      RETRO_3D: 'RETRO 3D (TEXTURAS)'
    };
    if (this.modeElem) {
      this.modeElem.textContent = labels[mode] || mode;
    }
    const selectRenderMode = document.getElementById('select-render-mode');
    if (selectRenderMode && document.activeElement !== selectRenderMode) {
      selectRenderMode.value = mode;
    }
  }

  updateCameraLabel(isThirdPerson) {
    if (this.cameraLabel) {
      this.cameraLabel.textContent = isThirdPerson ? '👤 VISÃO: 3ª PESSOA' : '👤 VISÃO: 1ª PESSOA';
    } else if (this.cameraBtn) {
      this.cameraBtn.innerHTML = `<span>${isThirdPerson ? '👤 VISÃO: 3ª PESSOA' : '👤 VISÃO: 1ª PESSOA'}</span><small style="opacity:0.7">[B]</small>`;
    }
  }

  updateHUD() {
    // 1. Calculate FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
      if (this.fpsElem) this.fpsElem.textContent = `${this.fps} FPS`;
    }

    // 2. Player Coordinates
    const pos = this.controls.position;
    if (this.coordsElem) {
      this.coordsElem.textContent = `X: ${pos.x.toFixed(1)} | Y: ${pos.y.toFixed(1)} | Z: ${pos.z.toFixed(1)}`;
    }

    // 3. Dynamic Location Name Detection (Data-Driven Zone Table)
    const zone = ZoneManager.getZoneAt(pos);
    let loc = zone.name;

    if (this.controls.isAutoTour) {
      loc = `[TOUR] ${loc}`;
    }

    if (this.locationElem) {
      this.locationElem.textContent = `📍 ${loc}`;
    }

    // 4. Dynamic Brazilian Music Context
    const inGameHour = this.game && this.game.clock ? this.game.clock.inGameHour : 12.0;
    if (this.sound && this.sound.updateMusicContext) {
      this.sound.updateMusicContext(zone.id, inGameHour);
    }
    this.updateRadioLabel();

    // 5. Mobile Orientation Tip (Show only in portrait on mobile)
    const orientBanner = document.getElementById('orientation-banner');
    if (orientBanner && ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))) {
      const isPortrait = window.innerHeight > window.innerWidth;
      orientBanner.classList.toggle('modal-hidden', !isPortrait);
    }
  }

  updateRadioLabel() {
    if (!this.radioLabel || !this.sound) return;
    const station = this.sound.getRadioStation();
    const effectiveGenre = this.sound.getEffectiveGenre ? this.sound.getEffectiveGenre() : 'MPB';
    if (station === 'AUTO') {
      const genreLabels = { MPB: 'MPB', PAGODE: 'PAGODE', FUNK: 'FUNK', OFF: 'OFF' };
      this.radioLabel.textContent = `AUTO (${genreLabels[effectiveGenre] || 'ZONAS'})`;
    } else {
      this.radioLabel.textContent = station;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update controls, city animations, traffic, and Brazil Simulator roguelite
    this.controls.update(delta);
    this.city.update(elapsedTime);
    this.traffic.update(delta, elapsedTime);
    this.game.update(delta);

    // Update touch interaction button highlight state
    if (this.touch && this.game && this.game.interactables) {
      this.touch.updateInteractionState(!!this.game.interactables.activeTarget);
    }

    // Render frame
    this.renderer.render();

    // Update HUD
    this.updateHUD();
  }
}

// Start application when DOM is ready, or immediately if already loaded
function bootGameApp() {
  if (window.app) return;
  new GameApp();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGameApp);
} else {
  bootGameApp();
}
