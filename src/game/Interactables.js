/**
 * Interactables Registry & Raycast Picker
 * Invariant I5: The [E] prompt shows iff the same predicate gating the action is true.
 */

import { BRAZILIAN_ENCOUNTERS } from './Encounters.js';
import { ZoneManager, WORLD_ZONES } from '../world/Zones.js';

export class InteractableSystem {
  constructor(scene, camera, dialogSystem, soundEngine, trafficSystem = null, npcSystem = null) {
    this.scene = scene;
    this.camera = camera;
    this.dialog = dialogSystem;
    this.sound = soundEngine;
    this.traffic = trafficSystem;
    this.npcs = npcSystem;

    this.currentTarget = null;
    this.promptElem = document.getElementById('interact-prompt');

    // Authoritative interaction anchors
    this.anchors = [
      {
        id: 'padaria',
        name: 'PADARIA ESTRELA DE PIRITUBA',
        prompt: 'ENTRAR NA PADOCA E PEDIR PÃO NA CHAPA',
        position: new THREE.Vector3(32.0, 1.2, 37.8),
        maxDist: 3.2,
        encounterId: 'PADARIA_ESTRELA',
        zoneId: 'PADARIA_ESTRELA'
      },
      {
        id: 'bar_sinuca',
        name: 'BAR DO TIÃO (MESA DE SINUCA & BALCÃO)',
        prompt: 'JOGAR SINUCA OU PEDIR NO BALCÃO',
        position: new THREE.Vector3(12.0, 1.2, 41.5),
        maxDist: 3.8,
        encounterId: 'BAR_DO_TIAO',
        zoneId: 'BAR_DO_TIAO'
      },
      {
        id: 'adega',
        name: 'ADEGA DO ZÉ (BEBIDAS & LITRÃO)',
        prompt: 'COMPRAR LITRÃO OU VENDER LATINHAS',
        position: new THREE.Vector3(-14.0, 1.2, 37.8),
        maxDist: 3.2,
        encounterId: 'ADEGA_DO_ZE',
        zoneId: 'ADEGA_DO_ZE'
      },
      {
        id: 'flanelinha',
        name: 'FLANELINHA NO CRUZAMENTO',
        prompt: 'CONVERSAR COM O FLANELINHA',
        position: new THREE.Vector3(4.5, 1.2, 32.5),
        maxDist: 3.5,
        encounterId: 'FLANELINHA',
        zoneId: 'FLANELINHA_PAULA_FERREIRA'
      },
      {
        id: 'posto',
        name: 'POSTO PIRITUBA 24H',
        prompt: 'ABASTECER OU TOMAR ÁGUA NO BEBEDOURO',
        position: new THREE.Vector3(-42.0, 1.2, 41.0),
        maxDist: 4.5,
        encounterId: 'POSTO_PIRITUBA',
        zoneId: 'POSTO_PIRITUBA'
      },
      {
        id: 'ponto_bus',
        name: 'PONTO DE ÔNIBUS SPTRANS',
        prompt: 'EMBARCAR NA LINHA 8400-10 TERM. PIRITUBA',
        position: new THREE.Vector3(-24.0, 1.2, 6.5),
        maxDist: 3.5,
        encounterId: 'PONTO_ONIBUS',
        zoneId: 'PONTO_ONIBUS_SPTRANS'
      },
      {
        id: 'banca_jornal',
        name: 'BANCA DE JORNAL DO SEU MÁRIO',
        prompt: 'LER JORNAL OU COMPRAR RASPADINHA DA SORTE',
        position: new THREE.Vector3(7.5, 1.2, 35.8),
        maxDist: 3.2,
        encounterId: 'BANCA_JORNAL',
        zoneId: 'BANCA_JORNAL'
      },
      {
        id: 'barraca_pastel',
        name: 'BARRACA DE PASTEL DA DONA MARIA',
        prompt: 'PEDIR PASTEL DE FEIRA & CALDO DE CANA',
        position: new THREE.Vector3(-3.5, 1.2, 35.8),
        maxDist: 3.2,
        encounterId: 'PASTEL_FEIRA',
        zoneId: 'BARRACA_PASTEL'
      },
      {
        id: 'baile_laje',
        name: 'BAILE DA LAJE NO ALTO DO ESCADÃO',
        prompt: 'CURTIR BAILE NA QUEBRADA OU TOMAR COROTE',
        position: new THREE.Vector3(0.0, 8.4, -40.0),
        maxDist: 4.5,
        encounterId: 'BAILE_LAJE',
        zoneId: 'BAILE_LAJE'
      },
      {
        id: 'semaforo_bico',
        name: 'SEMÁFORO DA EDGAR FACÓ',
        prompt: 'VENDER PAÇOCA OU LIMPAR PÁRA-BRISA NO SINAL',
        position: new THREE.Vector3(1.5, 1.2, 8.2),
        maxDist: 3.5,
        encounterId: 'SEMAFORO_BICO',
        zoneId: 'SEMAFORO_BICO'
      },
      {
        id: 'banco',
        name: 'BANCO PIRITUBA (AGÊNCIA 0086 & CAIXA 24H)',
        prompt: 'ACESSAR CAIXA ELETRÔNICO DO BANCO',
        position: new THREE.Vector3(48.0, 1.2, 38.0),
        maxDist: 3.8,
        encounterId: 'BANCO_PIRITUBA',
        zoneId: 'BANCO_PIRITUBA'
      }
    ];
  }

  update(playerPos, cameraForward, runClock, gameState) {
    const isAnyModalOpen = (this.dialog && this.dialog.isOpen) ||
      (typeof document !== 'undefined' && (
        (document.getElementById('dialogue-modal') && !document.getElementById('dialogue-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('visuals-modal') && !document.getElementById('visuals-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('roulette-modal') && !document.getElementById('roulette-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('end-run-modal') && !document.getElementById('end-run-modal').classList.contains('modal-hidden'))
      ));

    if (isAnyModalOpen) {
      this.currentTarget = null;
      this.hidePrompt();
      return;
    }

    const inGameHour = runClock.inGameHour;
    let closestTarget = null;
    let closestDist = Infinity;

    const npcTargets = (this.npcs && this.npcs.getInteractableTargets) ? this.npcs.getInteractableTargets() : [];
    const allTargets = [...this.anchors, ...npcTargets];

    for (const anchor of allTargets) {
      const dx = anchor.position.x - playerPos.x;
      const dy = ((anchor.position.y !== undefined ? anchor.position.y : 1.2)) - playerPos.y;
      const dz = anchor.position.z - playerPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= anchor.maxDist) {
        // Check facing direction
        const toTarget = new THREE.Vector3(dx, dy, dz).normalize();
        const dot = cameraForward.dot(toTarget);

        if (dot >= 0.35 && dist < closestDist) {
          closestDist = dist;

          let isOpen = true;
          if (anchor.isNpc) {
            isOpen = true;
          } else {
            // Check if zone is currently open
            const zone = WORLD_ZONES.find(z => z.id === anchor.zoneId);
            isOpen = ZoneManager.isZoneOpen(zone, inGameHour);

            // Invariant I5 Predicate Parity for Semáforo Bico:
            // Must be RED light for vehicles and traffic must be active (not empty city)
            if (anchor.id === 'semaforo_bico') {
              const isRed = this.traffic && this.traffic.trafficLight && this.traffic.trafficLight.state === 'RED';
              const notEmpty = !this.traffic || !this.traffic.isEmptyCity;
              isOpen = isOpen && isRed && notEmpty;
            }
          }

          closestTarget = {
            anchor,
            isOpen,
            dist
          };
        }
      }
    }

    this.currentTarget = closestTarget;

    if (closestTarget) {
      if (closestTarget.isOpen) {
        this.showPrompt(`[E] ${closestTarget.anchor.prompt}`);
      } else {
        const zone = WORLD_ZONES.find(z => z.id === closestTarget.anchor.zoneId);
        if (closestTarget.anchor.id === 'semaforo_bico') {
          const isDuringOperatingHours = ZoneManager.isZoneOpen(zone, inGameHour);
          if (isDuringOperatingHours) {
            this.showPrompt(`[AGUARDE O SINAL VERMELHO DOS CARROS] ${closestTarget.anchor.name}`);
          } else {
            const rawHour = zone?.openHour || 7;
            const hh = Math.floor(rawHour);
            const mm = Math.round((rawHour - hh) * 60);
            const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
            this.showPrompt(`[HORÁRIO DE PICO ENCERRADO] ${closestTarget.anchor.name} (RETORNA ÀS ${timeStr})`);
          }
        } else {
          const rawHour = zone?.openHour || 0;
          const hh = Math.floor(rawHour);
          const mm = Math.round((rawHour - hh) * 60);
          const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
          this.showPrompt(`[FECHADO] ${closestTarget.anchor.name} (ABRE ÀS ${timeStr})`);
        }
      }
    } else {
      this.hidePrompt();
    }
  }

  showPrompt(text) {
    if (!this.promptElem) return;
    this.promptElem.textContent = text;
    this.promptElem.classList.remove('modal-hidden');
  }

  hidePrompt() {
    if (!this.promptElem) return;
    this.promptElem.classList.add('modal-hidden');
  }

  trigger(gameState) {
    if (this.dialog && this.dialog.isOpen) return;
    if (!this.currentTarget || !this.currentTarget.isOpen) return;

    const encId = this.currentTarget.anchor.encounterId;
    const encounter = BRAZILIAN_ENCOUNTERS[encId];
    if (!encounter) return;

    const dialogData = {
      title: encounter.title,
      text: encounter.getIntroText(gameState),
      options: encounter.getOptions(gameState)
    };

    this.dialog.open(dialogData, (chosenOption) => {
      const outcomeText = chosenOption.execute(gameState, this.sound);
      // Optional follow-up feedback toast/dialog
      if (outcomeText) {
        this.dialog.open({
          title: 'DESFECHO DO ENCONTRO',
          text: `<p>${outcomeText}</p>`,
          options: [
            { label: 'Continuar o dia', execute: () => {} }
          ]
        }, () => {});
      }
    });
  }
}
