/**
 * Interactables Registry & Raycast Picker
 * Invariant I5: The [E] prompt shows iff the same predicate gating the action is true.
 */

import { BRAZILIAN_ENCOUNTERS } from './Encounters.js';
import { ZoneManager, WORLD_ZONES } from '../world/Zones.js';

export class InteractableSystem {
  constructor(scene, camera, dialogSystem, soundEngine) {
    this.scene = scene;
    this.camera = camera;
    this.dialog = dialogSystem;
    this.sound = soundEngine;

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
        zoneId: 'CRUZAMENTO_EDGAR_FACCO'
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
      }
    ];
  }

  update(playerPos, cameraForward, runClock, gameState) {
    if (this.dialog && this.dialog.isOpen) {
      this.currentTarget = null;
      this.hidePrompt();
      return;
    }

    const inGameHour = runClock.inGameHour;
    let closestTarget = null;
    let closestDist = Infinity;

    for (const anchor of this.anchors) {
      const dx = anchor.position.x - playerPos.x;
      const dy = anchor.position.y - playerPos.y;
      const dz = anchor.position.z - playerPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= anchor.maxDist) {
        // Check facing direction
        const toTarget = new THREE.Vector3(dx, dy, dz).normalize();
        const dot = cameraForward.dot(toTarget);

        if (dot >= 0.45 && dist < closestDist) {
          closestDist = dist;

          // Check if zone is currently open
          const zone = WORLD_ZONES.find(z => z.id === anchor.zoneId);
          const isOpen = ZoneManager.isZoneOpen(zone, inGameHour);

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
        this.showPrompt(`[FECHADO] ${closestTarget.anchor.name} (ABRE ÀS ${String(WORLD_ZONES.find(z => z.id === closestTarget.anchor.zoneId)?.openHour || 0).padStart(2, '0')}:00)`);
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
