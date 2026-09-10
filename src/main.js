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
      this.sound
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

    // Google Street View Modal Elements
    this.streetViewModal = document.getElementById('street-view-modal');
    this.streetViewIframe = document.getElementById('streetview-iframe');
    this.btnCloseStreetView = document.getElementById('btn-close-streetview');
    this.btnRefreshStreetView = document.getElementById('btn-refresh-sv');
    this.isStreetViewOpen = false;

    // Visual Parameters Modal Elements
    this.visualsModal = document.getElementById('visuals-modal');
    this.isVisualsModalOpen = false;

    this.initUI();
    this.initRoulette();
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
  }

  toggleStreetView(forceState) {
    this.isStreetViewOpen = typeof forceState === 'boolean' ? forceState : !this.isStreetViewOpen;

    if (this.isStreetViewOpen) {
      // Open modal
      if (this.streetViewModal) this.streetViewModal.classList.remove('modal-hidden');
      if (this.streetViewBtn) this.streetViewBtn.classList.add('active');
      if (this.controls && this.controls.refreshFreeze) this.controls.refreshFreeze();

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
      this.syncVisualControlsUI();
    } else {
      if (this.game) this.game.collisionImmunityTimer = 2.5;
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

    if (densitySlider) densitySlider.value = params.density;
    if (brightnessSlider) brightnessSlider.value = params.brightness;
    if (contrastSlider) contrastSlider.value = params.contrast;
    if (gammaSlider) gammaSlider.value = params.gamma;
    if (saturationSlider) saturationSlider.value = params.saturation;
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

    if (valDensity) valDensity.textContent = `${Number(params.density).toFixed(1)}x (${this.renderer.charW}px)`;
    if (valBrightness) valBrightness.textContent = `${Number(params.brightness).toFixed(2)}x`;
    if (valContrast) valContrast.textContent = `${Number(params.contrast).toFixed(2)}x`;
    if (valGamma) valGamma.textContent = `${Number(params.gamma).toFixed(2)}x`;
    if (valSaturation) valSaturation.textContent = `${Number(params.saturation).toFixed(2)}x`;

    // Keep slider thumbs synchronized when modified via hotkeys or presets
    const sliderDensity = document.getElementById('slider-density');
    const sliderBrightness = document.getElementById('slider-brightness');
    const sliderContrast = document.getElementById('slider-contrast');
    const sliderGamma = document.getElementById('slider-gamma');
    const sliderSaturation = document.getElementById('slider-saturation');

    if (sliderDensity && document.activeElement !== sliderDensity) sliderDensity.value = params.density;
    if (sliderBrightness && document.activeElement !== sliderBrightness) sliderBrightness.value = params.brightness;
    if (sliderContrast && document.activeElement !== sliderContrast) sliderContrast.value = params.contrast;
    if (sliderGamma && document.activeElement !== sliderGamma) sliderGamma.value = params.gamma;
    if (sliderSaturation && document.activeElement !== sliderSaturation) sliderSaturation.value = params.saturation;
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
        this.syncVisualControlsUI();
        if (this.game && this.game.hud && this.game.hud.showToast) {
          this.game.hud.showToast('🔄 Padrões visuais restaurados', 2000);
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
          edgeEnhance: true,
          rampType: 'MATRIX',
          scanlines: true
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
        this.renderer.setRenderMode('ASCII_COLOR');
        this.updateModeLabel('ASCII_COLOR');
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

    // Hotkeys
    window.addEventListener('keydown', (e) => {
      // Ignore modified combinations so browser shortcuts (e.g. Cmd+P, Ctrl+P, Cmd+-, Cmd++) work normally
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const isRouletteOpen = typeof document !== 'undefined' && document.getElementById('roulette-modal') && !document.getElementById('roulette-modal').classList.contains('modal-hidden');

      if (e.code === 'KeyV' || e.key === 'v' || e.key === 'V') {
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
      RETRO_3D: 'RETRO 3D (TEXTURAS)'
    };
    if (this.modeElem) {
      this.modeElem.textContent = labels[mode] || mode;
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

    // Render frame
    this.renderer.render();

    // Update HUD
    this.updateHUD();
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
