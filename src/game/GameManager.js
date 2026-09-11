/**
 * GameManager: Central Roguelite Orchestrator
 * Governs 15-minute day cycle, character roulette, defeat/victory conditions, and sub-systems.
 */

import { Rng } from './Rng.js';
import { RunClock } from './RunClock.js';
import { GameState } from './GameState.js';
import { SOCIAL_CLASSES, getActiveClassConfig } from './Classes.js';
import { DayCycle } from './DayCycle.js';
import { GameProps } from './Props.js';
import { DialogSystem } from './Dialog.js';
import { InteractableSystem } from './Interactables.js';
import { NpcSystem } from './NpcSystem.js';
import { HudGame } from './HudGame.js';
import { HandsSystem } from './HandsSystem.js';
import { BRAZILIAN_ENCOUNTERS } from './Encounters.js';
import { WORLD_ZONES } from '../world/Zones.js';
import { t, getLanguage } from './i18n.js';

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
    this.npcs = new NpcSystem(this.scene, this.sound, this.rng, this.textures);
    this.interactables = new InteractableSystem(this.scene, this.camera, this.dialog, this.sound, this.traffic, this.npcs);
    if (this.city && this.city.interactiveDoors) {
      this.interactables.setDoors(this.city.interactiveDoors);
    }
    this.hud = new HudGame();
    this.hands = new HandsSystem(this.scene, this.camera, this.sound);
    if (this.controls) {
      this.controls.handsSystem = this.hands;
      this.controls.onHeadBonk = (wall) => {
        const bonkMsg = t(
          'toasts.head_bonk',
          '💥 <strong>POFT!</strong> Você deu com a cara no muro! A rua era só uma pintura na parede...<br><span style="font-size:11px;color:#fcd34d;">🚧 Desculpe pelo transtorno, estamos em obras!</span>'
        );
        if (this.hud) {
          this.hud.showToast(bonkMsg, 4000);
        }
        if (this.sound && this.sound.newsDesk) {
          this.sound.newsDesk.recordAction(
            'HEAD_BONK',
            'Bateu com a cara no muro pintado de obra achando que a rua continuava',
            { wallId: wall ? wall.id : 'unknown' }
          );
        }
        if (this.isRunActive && this.state) {
          this.state.apply({ sanidade: -1 }, 'news.head_bonk');
        }
      };
    }
    this.props = new GameProps(this.scene, this.physics, this.textures, this.sound);
    this.encounters = BRAZILIAN_ENCOUNTERS;
    this.socialClasses = SOCIAL_CLASSES;

    this.isRunActive = false;
    this.hasMotoTriggered = false;
    this.motoCheckTimer = 0;
    this.isStorming = false;
    this.lastRadioForecast = 'CLEAR';
    this.effectiveWeather = 'CLEAR';
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
    const classConfig = getActiveClassConfig(chosenKey);

    this.state = new GameState(classConfig, this.rng, this.seed);
    this.isRunActive = true;

    // Teleport player to class spawn point
    if (classConfig.spawn && this.controls) {
      this.controls.teleport(classConfig.spawn.x, classConfig.spawn.y, classConfig.spawn.z);
    }

    // Equip starting items on FPS hands according to social class
    if (this.hands) {
      this.hands.equipStartingLoadout(chosenKey);
    }

    // Initialize Audio on this first user interaction gesture
    if (this.sound) {
      this.sound.init();
      this.sound.playCoin();

      // Trigger class-specific soundtrack: Funk for poor, Pagode for mid-class, MPB for rich
      const classGenreMap = {
        CLASSE_DE: 'FUNK',
        CLASSE_C: 'PAGODE',
        CLASSE_AB: 'MPB'
      };
      const genre = classGenreMap[chosenKey] || 'MPB';
      this.sound.playClassMusic(genre);

      // Register radio weather forecast broadcast callback
      if (this.sound.newsDesk) {
        this.sound.newsDesk.setWeatherCallback((weatherMode) => {
          this.lastRadioForecast = (weatherMode === 'STORM' || weatherMode === 'GAROA') ? weatherMode : 'CLEAR';
          this.applyEffectiveWeather();
        });
      }
    }

    // Expose active state to window for live satirical radio reporting
    if (typeof window !== 'undefined') {
      window.__BS_GAME_STATE__ = this.state;
    }

    const toastTpl = t('toasts.spawn_intro', '🌟 <strong>VOCÊ NASCEU COMO: {title}</strong><br>{subtitle}');
    this.hud.showToast(toastTpl.replace('{title}', classConfig.title.toUpperCase()).replace('{subtitle}', classConfig.subtitle), 5000);

    // Run end callback
    this.clock.onRunEnd = () => this.handleRunEnd(true);
  }

  applyEffectiveWeather() {
    const hour = this.clock.inGameHour;
    const inStormWindow = hour >= 16.0 && hour <= 17.25;
    const nextWeather = inStormWindow ? 'STORM' : (this.lastRadioForecast || 'CLEAR');
    this.isStorming = nextWeather === 'STORM';
    if (nextWeather === this.effectiveWeather) return;

    const prevWeather = this.effectiveWeather;
    this.effectiveWeather = nextWeather;
    this.dayCycle.setWeather(nextWeather);
    if (this.traffic) this.traffic.setWeather(nextWeather);

    if (this.sound) {
      this.sound.playRain(nextWeather === 'STORM' || nextWeather === 'GAROA');
      if (nextWeather === 'STORM' && prevWeather !== 'STORM') {
        this.sound.playThunder();
      }
    }

    if (!this.hud) return;
    if (inStormWindow && nextWeather === 'STORM') {
      this.hud.showToast(t('toasts.storm_start', '⛈️ <strong>TEMPORAL DE VERÃO EM SÃO PAULO!</strong><br>Chuva torrencial e trânsito lento na Edgar Facó.'), 6000);
      return;
    }
    if (prevWeather === 'STORM' && nextWeather === 'CLEAR') {
      this.hud.showToast(t('toasts.storm_end', '🌤️ <strong>A CHUVA PASSOU!</strong> O céu de São Paulo abriu novamente.'), 4000);
      return;
    }
    if (nextWeather === 'STORM') {
      this.hud.showToast('⛈️ <strong>ALERTA DA RÁDIO:</strong> Temporal desabando em Pirituba!', 5000);
    } else if (nextWeather === 'GAROA') {
      this.hud.showToast('🌧️ <strong>ALERTA DA RÁDIO:</strong> Garoa paulistana típica e asfalto molhado.', 5000);
    } else {
      this.hud.showToast('☀️ <strong>ALERTA DA RÁDIO:</strong> Sol abriu em Pirituba! Tarde quente!', 4000);
    }
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

    // 3b. Scheduled 16:00–17:15 storm has priority; otherwise honor last radio forecast
    this.applyEffectiveWeather();

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

    // Update 3D spatial radio emitters (distance falloff & lowpass acoustic muffling)
    if (this.sound && this.sound.updateSpatial) {
      this.sound.updateSpatial(playerPos, this.state ? this.state.perigo : 0);
    }

    // 5b. Update autonomous roaming NPCs (Clodoaldo, Caramelo, Juninho, Dona Neide)
    const isModalOpen = this.isAnyModalActive();
    if (this.npcs) {
      this.npcs.update(delta, playerPos, isModalOpen, this.state);
    }

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

    // 8c. Update bank bankruptcy timer if account balance is negative
    if (this.state) {
      if (this.state.grana < 0) {
        this.state.bankruptTimer = (this.state.bankruptTimer || 0) + delta;
      } else {
        this.state.bankruptTimer = 0;
      }
    }

    // 9. Check defeat conditions
    const defeat = this.state.checkDefeat();
    if (defeat) {
      this.handleRunEnd(false, defeat);
    }

    // 10. Update FPS hands viewmodel & item status
    if (this.hands) {
      const isMoving = this.controls ? (this.controls.moveForward || this.controls.moveBackward || this.controls.moveLeft || this.controls.moveRight) : false;
      const isSprinting = this.controls ? this.controls.isSprinting : false;
      const is3rd = this.controls ? this.controls.isThirdPerson : false;
      this.hands.update(delta, this.controls?.position, isMoving, isSprinting, is3rd);
      if (this.hud && typeof this.hud.updateHands === 'function') {
        this.hud.updateHands(this.hands.getHandStatus());
      }
    }

    // 11. Update HUD
    this.hud.update(this.clock, this.state);
  }

  // Handle [E] key interaction press (Invariant I6: forbidden during active dialog)
  handleInteract() {
    if (!this.isRunActive || !this.interactables || (this.dialog && this.dialog.isOpen)) return;
    if (this.interactables.currentTarget && this.interactables.currentTarget.isOpen) {
      this.interactables.trigger(this.state);
    } else if (this.hands) {
      this.hands.useRightHand(this.state);
    }
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

        // Companion Caramelo bark warning if vehicle speeds close
        if (dist < 3.8 && dist > 1.8 && this.state && this.state.flags && this.state.flags.carameloCompanheiro) {
          if (!this.lastCarameloWarning || this.clock.elapsed - this.lastCarameloWarning > 4.0) {
            this.lastCarameloWarning = this.clock.elapsed;
            if (this.sound && this.sound.playDogBark) this.sound.playDogBark();
            this.hud.showToast(t('toasts.caramelo_bark', '🐕 <strong>CARAMELO LATIU!</strong> Cuidado com o carro em alta velocidade!'), 2500);
          }
        }

        if (dist < 1.8) {
          // Player hit by vehicle!
          if (this.sound) this.sound.playSiren();
          this.state.apply({
            sanidade: -25,
            perigo: 20
          }, 'Atropelamento leve na Edgar Facó');

          // Push player back to nearest sidewalk
          playerPos.z = playerPos.z < (minZ + maxZ) / 2 ? minZ - 2.0 : maxZ + 2.0;
          this.hud.showToast(t('toasts.traffic_hit', '🚨 <strong>CUIDADO!</strong> Você quase foi atropelado na pista! Olhe para os dois lados! (-25% Sanidade, +20% Perigo)'), 4000);
          break;
        }
      }
    }
  }

  isAnyModalActive() {
    if (this.dialog && this.dialog.isOpen) return true;
    if (this.controls && this.controls.freeze) return true;
    if (typeof document !== 'undefined') {
      const modalIds = ['dialogue-modal', 'street-view-modal', 'visuals-modal', 'roulette-modal', 'end-run-modal'];
      for (const id of modalIds) {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('modal-hidden')) return true;
      }
    }
    return false;
  }

  triggerDoisCarasMoto() {
    if (this.isAnyModalActive()) return; // Do not interrupt active dialog, modals, or frozen state
    this.hasMotoTriggered = true;
    if (this.sound) {
      this.sound.playMotorcycleRev();
      if (this.sound.newsDesk) {
        this.sound.newsDesk.recordAction('ENCOUNTER', 'Dois caras numa moto avistados na calçada');
      }
    }

    const enc = BRAZILIAN_ENCOUNTERS.DOIS_CARAS_MOTO;
    this.dialog.open({
      id: 'DOIS_CARAS_MOTO',
      encounterId: 'DOIS_CARAS_MOTO',
      _state: this.state,
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
    if (this.isAnyModalActive()) return; // Do not interrupt active dialog, modals, or frozen state
    this.blitzCount++;
    this.lastBlitzHour = this.clock.inGameHour;
    if (this.sound) {
      this.sound.playSiren();
      if (this.sound.newsDesk) {
        this.sound.newsDesk.recordAction('ENCOUNTER', 'Enquadro e blitz da Polícia Militar na madrugada');
      }
    }

    const enc = BRAZILIAN_ENCOUNTERS.BLITZ_PM;
    this.dialog.open({
      id: 'BLITZ_PM',
      encounterId: 'BLITZ_PM',
      _state: this.state,
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
      if (this.endTitleElem) this.endTitleElem.innerHTML = t('ui.end_title_win', '🏆 VOCÊ SOBREVIVEU A 24 HORAS NO BRASIL!');
      if (this.endDescElem) {
        const winTpl = t('ui.end_desc_win', 'Parabéns! Você completou os 15 minutos de run intacto(a) como <strong>{className}</strong>.<br>Sobreviveu ao trânsito da Edgar Facó, ao temporal de verão, aos boletos e à madrugada na quebrada!');
        this.endDescElem.innerHTML = winTpl.replace('{className}', this.state.className);
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

      const emptyMoment = t('ui.end_moments_empty', 'Dia tranquilo em Pirituba sem grandes incidentes');
      const recentHistory = notableEvents.length > 0
        ? notableEvents.map(h => {
            const raw = h.desc || h.reason || '';
            const translated = (typeof t === 'function' && raw) ? t(raw, raw) : raw;
            return `<li><span style="color:#888">${h.hour || h.time}</span>: ${translated}</li>`;
          }).join('')
        : `<li>${emptyMoment}</li>`;

      const lblClass = t('ui.end_stat_class', 'Classe Social:');
      const lblObj = t('ui.end_stat_objective', 'Meta do Dia:');
      const objMsg = objCompleted ? t('ui.end_stat_obj_success', '✅ CUMPRIDA COM SUCESSO!') : t('ui.end_stat_obj_fail', '❌ NÃO CONCLUÍDA');
      const lblGrana = t('ui.end_stat_grana', 'Saldo Final:');
      const lblDebt = t('ui.end_stat_debt', 'Dívida / Fiado Pendente:');
      const lblFome = t('ui.end_stat_fome', 'Bucho / Fome Final:');
      const lblSanidade = t('ui.end_stat_sanidade', 'Sanidade Mental:');
      const lblPerigo = t('ui.end_stat_perigo', 'Nível de B.O. / Perigo:');
      const lblGinga = t('ui.end_stat_ginga', 'Ginga / Jeitinho Score:');
      const lblMoments = t('ui.end_moments_title', 'Momentos Marcantes do Dia:');

      this.endStatsElem.innerHTML = `
        <div class="end-stat-row"><span>${lblClass}</span> <strong>${this.state.className}</strong></div>
        <div class="end-stat-row"><span>${lblObj}</span> <strong style="color:${objCompleted ? '#00ff66' : '#ffaa33'}">${objMsg}</strong></div>
        <div class="end-stat-row"><span>${lblGrana}</span> <strong>${this.state.formattedGrana}</strong></div>
        <div class="end-stat-row"><span>${lblDebt}</span> <strong>${this.state.formattedDebt}</strong></div>
        <div class="end-stat-row"><span>${lblFome}</span> <strong>${Math.round(this.state.fome)}%</strong></div>
        <div class="end-stat-row"><span>${lblSanidade}</span> <strong>${Math.round(this.state.sanidade)}%</strong></div>
        <div class="end-stat-row"><span>${lblPerigo}</span> <strong>${Math.round(this.state.perigo)}%</strong></div>
        <div class="end-stat-row"><span>${lblGinga}</span> <strong>${Math.round(this.state.ginga)} pts</strong></div>
        <div style="margin-top:12px;text-align:left;background:#151515;padding:8px 12px;border:1px solid #333;border-radius:4px;font-size:12px;">
          <strong style="color:#00ffcc">${lblMoments}</strong>
          <ul style="margin:4px 0 0 16px;padding:0;color:#bbb;">${recentHistory}</ul>
        </div>
      `;
    }
  }
}
