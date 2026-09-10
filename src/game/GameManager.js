/**
 * GameManager: Central Roguelite Orchestrator
 * Governs 15-minute day cycle, character roulette, defeat/victory conditions, and sub-systems.
 */

import { Rng } from './Rng.js';
import { RunClock } from './RunClock.js';
import { GameState } from './GameState.js';
import { SOCIAL_CLASSES } from './Classes.js';
import { DayCycle } from './DayCycle.js';
import { GameProps } from './Props.js';
import { DialogSystem } from './Dialog.js';
import { InteractableSystem } from './Interactables.js';
import { HudGame } from './HudGame.js';
import { BRAZILIAN_ENCOUNTERS } from './Encounters.js';
import { WORLD_ZONES } from '../world/Zones.js';

export class GameManager {
  constructor(scene, camera, controls, physics, textures, sound, cityBuilder, trafficSystem, initialSeed = null) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.physics = physics;
    this.textures = textures;
    this.sound = sound;
    this.city = cityBuilder;
    this.traffic = trafficSystem;

    // Seeded PRNG (Invariant I2)
    this.seed = typeof initialSeed === 'number' ? initialSeed : (Date.now() ^ Math.floor(Math.random() * 0x100000000));
    this.rng = new Rng(this.seed);
    this.clock = new RunClock(900, 6.0); // 900 seconds = 15 minutes (24 in-game hours, 37.5s/hour)
    this.state = null;
    this.dayCycle = new DayCycle(this.city);
    this.dialog = new DialogSystem(this.controls);
    this.interactables = new InteractableSystem(this.scene, this.camera, this.dialog, this.sound, this.traffic);
    this.hud = new HudGame();
    this.props = new GameProps(this.scene, this.physics, this.textures, this.sound);
    this.encounters = BRAZILIAN_ENCOUNTERS;
    this.socialClasses = SOCIAL_CLASSES;

    this.isRunActive = false;
    this.hasMotoTriggered = false;
    this.motoCheckTimer = 0;
    this.isStorming = false;
    this.lastThunderTime = 0;
    this.blitzCount = 0;
    this.lastBlitzHour = -99;
    this.collisionImmunityTimer = 2.0;
    this.dialog.onClose = () => {
      this.collisionImmunityTimer = 2.5;
    };

    this.endModalElem = document.getElementById('end-run-modal');
    this.endTitleElem = document.getElementById('end-run-title');
    this.endDescElem = document.getElementById('end-run-desc');
    this.endStatsElem = document.getElementById('end-run-stats');
    this.btnRestart = document.getElementById('end-run-restart');

    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        window.location.reload();
      });
    }

    // Bus stop boarding hook
    this.lastBusPromptTime = 0;
  }

  // Start run with chosen class or demographic roulette (60% Quebrada, 30% Subúrbio, 10% Faria Lima)
  startRun(classKey = null) {
    let chosenKey = classKey;
    if (!chosenKey) {
      const roll = this.rng.random();
      chosenKey = roll < 0.60 ? 'CLASSE_DE' : (roll < 0.90 ? 'CLASSE_C' : 'CLASSE_AB');
    }
    const classConfig = SOCIAL_CLASSES[chosenKey] || SOCIAL_CLASSES.CLASSE_DE;

    this.state = new GameState(classConfig, this.rng, this.seed);
    this.isRunActive = true;

    // Teleport player to class spawn point
    if (classConfig.spawn && this.controls) {
      this.controls.teleport(classConfig.spawn.x, classConfig.spawn.y, classConfig.spawn.z);
    }

    // Initialize Audio on this first user interaction gesture
    if (this.sound) {
      this.sound.init();
      this.sound.playCoin();
    }

    this.hud.showToast(`🌟 <strong>VOCÊ NASCEU COMO: ${classConfig.title.toUpperCase()}</strong><br>${classConfig.subtitle}`, 5000);

    // Run end callback
    this.clock.onRunEnd = () => this.handleRunEnd(true);
  }

  update(delta) {
    if (!this.isRunActive || !this.state || this.clock.isPaused) return;

    // 1. Advance sim clock
    this.clock.update(delta);
    if (this.state) {
      this.state.currentHour = this.clock.inGameHour;
      this.state.currentHourFormatted = this.clock.formatInGameTime();
      this.state.elapsedSeconds = this.clock.elapsed;
    }
    if (this.collisionImmunityTimer > 0) {
      this.collisionImmunityTimer -= delta;
    }

    // 2. Passive hourly decay (delta in sim-seconds converted to sim-hours)
    // 24 hours across full duration (900s => 24/900 = 0.02667 h/s)
    const deltaHours = delta * (24.0 / this.clock.duration);
    this.state.applyPassiveDecay(deltaHours);

    // 3. Continuous 24h solar lighting
    this.dayCycle.update(this.clock.inGameHour);

    // 3b. Dynamic São Paulo Summer Storm (16:00 - 17:15)
    const hour = this.clock.inGameHour;
    const inStormWindow = hour >= 16.0 && hour <= 17.25;
    if (inStormWindow && !this.isStorming) {
      this.isStorming = true;
      this.dayCycle.setWeather('STORM');
      if (this.traffic) this.traffic.setWeather('STORM');
      if (this.sound) {
        this.sound.playRain(true);
        this.sound.playThunder();
      }
      this.hud.showToast('⛈️ <strong>TEMPORAL DE VERÃO EM SÃO PAULO!</strong><br>Chuva torrencial e trânsito lento na Edgar Facó.', 6000);
    } else if (!inStormWindow && this.isStorming) {
      this.isStorming = false;
      this.dayCycle.setWeather('CLEAR');
      if (this.traffic) this.traffic.setWeather('CLEAR');
      if (this.sound) {
        this.sound.playRain(false);
      }
      this.hud.showToast('🌤️ <strong>A CHUVA PASSOU!</strong> O céu de São Paulo abriu novamente.', 4000);
    }

    if (this.isStorming && this.sound) {
      this.lastThunderTime += delta;
      if (this.lastThunderTime > 18.0) {
        this.lastThunderTime = 0;
        // Invariant I2 hygiene: use Math.random for cosmetic audio rumble
        if (Math.random() < 0.4) {
          this.sound.playThunder();
        }
      }
    }

    // 4. Update dynamic physics bodies (soccer ball, cans)
    this.physics.updateDynamicBodies(delta);

    // 5. Check if player kicks the soccer ball or cans (using horizontal speed, forbidden when controls frozen)
    if (this.controls && !this.controls.freeze) {
      const playerPos = this.controls.position;
      const forwardVec = new THREE.Vector3();
      this.camera.getWorldDirection(forwardVec);
      const horizSpeed = this.controls.velocity
        ? Math.sqrt(this.controls.velocity.x * this.controls.velocity.x + this.controls.velocity.z * this.controls.velocity.z)
        : 0;
      this.physics.checkPlayerKick(playerPos, forwardVec, horizSpeed);
    }

    if (!this.controls) return;
    const playerPos = this.controls.position;
    const forwardVec = new THREE.Vector3();
    this.camera.getWorldDirection(forwardVec);

    // 6. Raycast interactables check
    this.interactables.update(playerPos, forwardVec, this.clock, this.state);

    // 7. Traffic collision hit-test (atropelamento)
    this.checkTrafficCollision(playerPos);

    // 8. Marquee evening event: "Dois Caras numa Moto" (guaranteed evening encounter)
    const elapsedHours = (this.clock.elapsed / this.clock.duration) * 24.0;
    if (!this.hasMotoTriggered && elapsedHours >= 12.5) {
      this.motoCheckTimer += delta;
      const forceTrigger = elapsedHours >= 15.0;
      if (this.motoCheckTimer >= 8.0 || forceTrigger) {
        this.motoCheckTimer = 0;
        if (forceTrigger || this.rng.chance(0.12)) {
          const isSV = typeof document !== 'undefined' && document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden');
          if (!this.dialog?.isOpen && !isSV) {
            this.triggerDoisCarasMoto();
          }
        }
      }
    }

    // 8b. Marquee madrugada event: "Blitz da PM" (guaranteed madrugada encounter)
    if (this.blitzCount === 0 && elapsedHours >= 20.0) {
      const isLateMadrugada = elapsedHours >= 21.0;
      if (this.state.perigo >= 35 || isLateMadrugada) {
        const isSV = typeof document !== 'undefined' && document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden');
        if (!this.dialog?.isOpen && !isSV) {
          this.triggerBlitzPM();
        }
      }
    }

    // 9. Check defeat conditions
    const defeat = this.state.checkDefeat();
    if (defeat) {
      this.handleRunEnd(false, defeat);
    }

    // 10. Update HUD
    this.hud.update(this.clock, this.state);
  }

  // Handle [E] key interaction press (Invariant I6: forbidden during active dialog)
  handleInteract() {
    if (!this.isRunActive || !this.interactables || (this.dialog && this.dialog.isOpen)) return;
    this.interactables.trigger(this.state);
  }

  // Check if player gets hit by speeding car or bus on Edgar Facó (Data-Driven via WORLD_ZONES)
  checkTrafficCollision(playerPos) {
    if (!this.traffic || this.traffic.isEmptyCity) return;
    if (this.dialog && this.dialog.isOpen) return; // Invariant: player cannot be hit during active modal dialog
    if (this.controls && this.controls.freeze) return;
    if (this.collisionImmunityTimer && this.collisionImmunityTimer > 0) return;

    const avZone = WORLD_ZONES.find(z => z.id === 'AV_EDGAR_FACCO');
    const minZ = avZone ? avZone.min.z + 0.5 : 8.5;
    const maxZ = avZone ? avZone.max.z - 0.5 : 31.5;

    if (playerPos.z >= minZ && playerPos.z <= maxZ) {
      for (const v of this.traffic.vehicles) {
        if (!v.currentSpeed || v.currentSpeed < 2.5) continue;
        const dist = Math.sqrt((v.x - playerPos.x) ** 2 + (v.z - playerPos.z) ** 2);
        if (dist < 1.8) {
          // Player hit by vehicle!
          if (this.sound) this.sound.playSiren();
          this.state.apply({
            sanidade: -25,
            perigo: 20
          }, 'Atropelamento leve na Edgar Facó');

          // Push player back to nearest sidewalk
          playerPos.z = playerPos.z < (minZ + maxZ) / 2 ? minZ - 2.0 : maxZ + 2.0;
          this.hud.showToast('🚨 <strong>CUIDADO!</strong> Você quase foi atropelado na pista! Olhe para os dois lados! (-25% Sanidade, +20% Perigo)', 4000);
          break;
        }
      }
    }
  }

  triggerDoisCarasMoto() {
    if (this.dialog && this.dialog.isOpen) return; // Do not interrupt active dialog
    const isSV = typeof document !== 'undefined' && document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden');
    if (isSV) return; // Do not interrupt active Street View panorama
    this.hasMotoTriggered = true;
    if (this.sound) this.sound.playMotorcycleRev();

    const enc = BRAZILIAN_ENCOUNTERS.DOIS_CARAS_MOTO;
    this.dialog.open({
      title: enc.title,
      text: enc.getIntroText(this.state),
      options: enc.getOptions(this.state)
    }, (opt) => {
      const outcome = opt.execute(this.state, this.sound);
      if (outcome) {
        this.hud.showToast(`🚨 ${outcome}`, 5000);
      }
    });
  }

  triggerBlitzPM() {
    if (this.dialog && this.dialog.isOpen) return;
    this.blitzCount++;
    this.lastBlitzHour = this.clock.inGameHour;
    if (this.sound) this.sound.playSiren();

    const enc = BRAZILIAN_ENCOUNTERS.BLITZ_PM;
    this.dialog.open({
      title: enc.title,
      text: enc.getIntroText(this.state),
      options: enc.getOptions(this.state)
    }, (opt) => {
      const outcome = opt.execute(this.state, this.sound);
      if (outcome) {
        this.hud.showToast(`🚔 ${outcome}`, 6000);
      }
    });
  }

  handleRunEnd(won, defeatData = null) {
    this.isRunActive = false;
    if (this.clock) this.clock.hasEnded = true;
    if (this.interactables) this.interactables.hidePrompt();
    if (this.sound) {
      this.sound.playRain(false);
      this.sound.playFanfare(won);
    }

    // Release pointer lock
    if (this.controls) this.controls.isLocked = false;
    if (document.exitPointerLock) document.exitPointerLock();

    if (this.endModalElem) {
      this.endModalElem.classList.remove('modal-hidden');
    }
    if (this.controls && this.controls.refreshFreeze) {
      this.controls.refreshFreeze();
    }

    if (won) {
      if (this.endTitleElem) this.endTitleElem.innerHTML = '🏆 VOCÊ SOBREVIVEU A 24 HORAS NO BRASIL!';
      if (this.endDescElem) {
        this.endDescElem.innerHTML = `
          Parabéns! Você completou os 15 minutos de run intacto(a) como <strong>${this.state.className}</strong>.<br>
          Sobreviveu ao trânsito da Edgar Facó, ao temporal de verão, aos boletos e à madrugada na quebrada!
        `;
      }
    } else {
      if (this.endTitleElem) this.endTitleElem.innerHTML = `💀 GAME OVER // ${defeatData.cause}`;
      if (this.endDescElem) {
        this.endDescElem.innerHTML = defeatData.desc;
      }
    }

    if (this.endStatsElem && this.state) {
      let objCompleted = false;
      if (this.state.classId === 'CLASSE_DE') {
        objCompleted = !!(this.state.flags.cestaBasica || (this.state.flags.totalBicoGain >= 4000) || (this.state.grana - SOCIAL_CLASSES.CLASSE_DE.grana >= 4000));
      } else if (this.state.classId === 'CLASSE_C') {
        objCompleted = !!(this.state.flags.boletoPago && !this.state.flags.carroRiscado);
      } else if (this.state.classId === 'CLASSE_AB') {
        objCompleted = won && !defeatData;
      }

      const notableEvents = (this.state.history || [])
        .filter(h => !h.isDecay && h.reason !== 'Desgaste biológico/urbano contínuo' && !h.reason?.includes('Desgaste'))
        .slice(-3);

      const recentHistory = notableEvents.length > 0
        ? notableEvents.map(h => `<li><span style="color:#888">${h.hour || h.time}</span>: ${h.desc || h.reason}</li>`).join('')
        : '<li>Dia tranquilo em Pirituba sem grandes incidentes</li>';

      this.endStatsElem.innerHTML = `
        <div class="end-stat-row"><span>Classe Social:</span> <strong>${this.state.className}</strong></div>
        <div class="end-stat-row"><span>Meta do Dia:</span> <strong style="color:${objCompleted ? '#00ff66' : '#ffaa33'}">${objCompleted ? '✅ CUMPRIDA COM SUCESSO!' : '❌ NÃO CONCLUÍDA'}</strong></div>
        <div class="end-stat-row"><span>Saldo Final:</span> <strong>${this.state.formattedGrana}</strong></div>
        <div class="end-stat-row"><span>Dívida / Fiado Pendente:</span> <strong>${this.state.formattedDebt}</strong></div>
        <div class="end-stat-row"><span>Bucho / Fome Final:</span> <strong>${Math.round(this.state.fome)}%</strong></div>
        <div class="end-stat-row"><span>Sanidade Mental:</span> <strong>${Math.round(this.state.sanidade)}%</strong></div>
        <div class="end-stat-row"><span>Nível de B.O. / Perigo:</span> <strong>${Math.round(this.state.perigo)}%</strong></div>
        <div class="end-stat-row"><span>Ginga / Jeitinho Score:</span> <strong>${Math.round(this.state.ginga)} pts</strong></div>
        <div style="margin-top:12px;text-align:left;background:#151515;padding:8px 12px;border:1px solid #333;border-radius:4px;font-size:12px;">
          <strong style="color:#00ffcc">Momentos Marcantes do Dia:</strong>
          <ul style="margin:4px 0 0 16px;padding:0;color:#bbb;">${recentHistory}</ul>
        </div>
      `;
    }
  }
}
