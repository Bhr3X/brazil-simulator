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
    this.tourBtn = document.getElementById('btn-tour');
    this.emptyBtn = document.getElementById('btn-empty');
    this.streetViewBtn = document.getElementById('btn-streetview');

    // Google Street View Modal Elements
    this.streetViewModal = document.getElementById('street-view-modal');
    this.streetViewIframe = document.getElementById('streetview-iframe');
    this.btnCloseStreetView = document.getElementById('btn-close-streetview');
    this.btnRefreshStreetView = document.getElementById('btn-refresh-sv');
    this.isStreetViewOpen = false;

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
    }
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
      if (e.code === 'KeyV') {
        this.toggleStreetView();
      } else if (e.code === 'Escape' && this.isStreetViewOpen) {
        this.toggleStreetView(false);
      } else if (e.code === 'KeyM') {
        const nextMode = this.renderer.cycleRenderMode();
        this.updateModeLabel(nextMode);
      } else if (e.code === 'KeyT') {
        if (!this.controls.freeze) {
          this.cycleTimeOfDay();
        }
      } else if (e.code === 'KeyO') {
        const muted = this.sound.toggleMute();
        if (this.audioBtn) {
          this.audioBtn.textContent = muted ? '🔇 SOM: DESLIGADO' : '🔊 SOM: LIGADO';
        }
      } else if (e.code === 'KeyU') {
        if (!this.controls.freeze) {
          const active = this.controls.toggleAutoTour();
          if (this.tourBtn) {
            this.tourBtn.textContent = active ? '🎥 TOUR: ATIVO [U]' : '🎥 AUTO TOUR [U]';
          }
        }
      } else if (e.code === 'KeyX') {
        const isEmpty = this.traffic.toggleEmptyCity();
        if (this.emptyBtn) {
          this.emptyBtn.textContent = isEmpty ? '🏙️ CIDADE VAZIA [X]' : '🚗 TRÂNSITO ATIVO [X]';
        }
      } else if (e.code === 'KeyE') {
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
