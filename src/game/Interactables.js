/**
 * Interactables Registry & Raycast Picker
 * Invariant I5: The [E] prompt shows iff the same predicate gating the action is true.
 */

import { BRAZILIAN_ENCOUNTERS } from './Encounters.js';
import { ZoneManager, WORLD_ZONES } from '../world/Zones.js';
import { getLanguage, getLocalizedInteractable, getLocalizedNpc } from './i18n.js';

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
    if (this.promptElem) {
      let promptFired = false;
      const onPromptTrigger = (e) => {
        if (promptFired) return;
        promptFired = true;
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        setTimeout(() => { promptFired = false; }, 350);
        if (this.game && typeof this.game.handleInteract === 'function') {
          this.game.handleInteract();
        }
      };
      this.promptElem.addEventListener('click', onPromptTrigger);
      this.promptElem.addEventListener('touchend', onPromptTrigger);
    }

    this.activeQuickNpc = null;
    this.activeQuickOptions = [];
    this.doors = [];
    this.residentNpcs = [];
    this.houseItems = [];

    // Keyboard hotkeys [1], [2], [3] for seamless NPC Quick Actions
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].includes(e.code)) {
          const idx = parseInt(e.code.replace('Digit', '').replace('Numpad', ''), 10) - 1;
          if (this.activeQuickNpc && this.activeQuickOptions[idx]) {
            e.preventDefault();
            this.executeQuickAction(idx);
          }
        }
      });
    }

    // Authoritative interaction anchors
    this.anchors = [
      {
        id: 'padaria',
        name: 'PADARIA ESTRELA DE PIRITUBA',
        prompt: 'ENTRAR NA PADOCA E PEDIR PÃO NA CHAPA',
        position: new THREE.Vector3(32.0, 1.2, 37.8),
        maxDist: 3.5,
        encounterId: 'PADARIA_ESTRELA',
        zoneId: 'PADARIA_ESTRELA'
      },
      {
        id: 'padaria_counter',
        name: 'BALCÃO DA PADARIA ESTRELA',
        prompt: 'PEDIR NO BALCÃO DO SEU MANUEL',
        position: new THREE.Vector3(33.2, 1.2, 43.6),
        maxDist: 3.5,
        encounterId: 'PADARIA_ESTRELA',
        zoneId: 'PADARIA_ESTRELA'
      },
      {
        id: 'bar_sinuca',
        name: 'BAR DO TIÃO (MESA DE SINUCA & BALCÃO)',
        prompt: 'PEDIR NO BALCÃO DO SEU TIÃO OU JOGAR SINUCA',
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
        position: new THREE.Vector3(0.0, 8.4, -66.0),
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
      },
      {
        id: 'elevador_penthouse',
        name: 'ELEVADOR DA COBERTURA (JARAGUÁ TOWER)',
        prompt: 'PEGAR ELEVADOR (DESCER PARA A PORTARIA / TÉRREO)',
        position: new THREE.Vector3(31.5, 33.2, 2.5),
        maxDist: 3.5,
        encounterId: 'ELEVADOR_PENTHOUSE',
        zoneId: 'EDIFICIO_PENTHOUSE'
      },
      {
        id: 'elevador_terreo',
        name: 'ELEVADOR DA PORTARIA (JARAGUÁ TOWER)',
        prompt: 'PEGAR ELEVADOR (SUBIR PARA A COBERTURA / PENTHOUSE)',
        position: new THREE.Vector3(31.5, 1.4, 2.5),
        maxDist: 3.5,
        encounterId: 'ELEVADOR_TERREO',
        zoneId: 'EDIFICIO_PORTARIA'
      },
      {
        id: 'bar_frango',
        name: 'O LENDÁRIO BAR FRANGÓ (DESDE 1987)',
        prompt: 'PEDIR FAMOSA COXINHA COM CATUPIRY & CHOPP ARTESANAL',
        position: new THREE.Vector3(20.5, 9.6, 183.0),
        maxDist: 3.8,
        encounterId: 'BAR_FRANGO',
        zoneId: 'BAR_FRANGO'
      },
      {
        id: 'igreja_matriz',
        name: 'PARÓQUIA NOSSA SENHORA DO Ó (1580)',
        prompt: 'ENTRAR NA IGREJA HISTÓRICA, REZAR OU ACENDER UMA VELA',
        position: new THREE.Vector3(-20.0, 9.6, 202.0),
        maxDist: 4.5,
        encounterId: 'IGREJA_MATRIZ',
        zoneId: 'IGREJA_MATRIZ_O'
      },
      {
        id: 'boteco_sete_barras',
        name: 'BOTECO DAS 7 BARRAS (SINUCA & TUBAÍNA)',
        prompt: 'TOMAR UMA TUBAÍNA GELADA OU JOGAR UMA PARTIDA DE SINUCA',
        position: new THREE.Vector3(18.0, 1.2, 68.0),
        maxDist: 3.8,
        encounterId: 'BOTECO_SETE_BARRAS',
        zoneId: 'RUA_SETE_BARRAS'
      },
      {
        id: 'barbearia_antonio',
        name: 'BARBEARIA DO SEU ANTÔNIO (NAVALHA & DEGRADÊ)',
        prompt: 'CORTAR CABELO, FAZER BARBA OU PROSEAR',
        position: new THREE.Vector3(-6.2, 2.2, 85.0),
        maxDist: 3.5,
        encounterId: 'BARBEARIA_ACLIVE',
        zoneId: 'BARBEARIA_ACLIVE'
      },
      {
        id: 'acougue_boi_ouro',
        name: 'AÇOUGUE BOI DE OURO (CORTE & PICANHA)',
        prompt: 'COMPRAR CARNES NOBRES OU LINGUIÇA CASEIRA',
        position: new THREE.Vector3(-6.2, 4.1, 103.0),
        maxDist: 3.5,
        encounterId: 'ACOUQUE_BOI_DE_OURO',
        zoneId: 'ACOUQUE_BOI_DE_OURO'
      },
      {
        id: 'hortifruti_ladeira',
        name: 'HORTIFRÚTI DA LADEIRA (FRUTAS & LEGUMES)',
        prompt: 'COMPRAR FRUTAS FRESCAS OU ÁGUA DE COCO',
        position: new THREE.Vector3(9.2, 2.2, 85.0),
        maxDist: 3.5,
        encounterId: 'HORTIFRUTI_PAULA_FERREIRA',
        zoneId: 'HORTIFRUTI_PAULA_FERREIRA'
      },
      {
        id: 'boteco_ladeira',
        name: 'BAR DA LADEIRA (SINUCA & DOMINÓ)',
        prompt: 'JOGAR DOMINÓ OU PEDIR CERVEJA COM TORRESMO',
        position: new THREE.Vector3(9.2, 6.0, 121.0),
        maxDist: 3.8,
        encounterId: 'BOTECO_LADEIRA',
        zoneId: 'BOTECO_LADEIRA'
      },
      {
        id: 'casa_do_norte',
        name: 'CASA DO NORTE ASA BRANCA (QUEIJOS & FARINHA)',
        prompt: 'PEDIR BAIÃO DE DOIS OU COMPRAR QUEIJO COALHO',
        position: new THREE.Vector3(-27.0, 1.2, 38.0),
        maxDist: 3.5,
        encounterId: 'CASA_DO_NORTE',
        zoneId: 'CASA_DO_NORTE'
      },
      {
        id: 'loterica_pirituba',
        name: 'LOTÉRICA PIRITUBA (CAIXA AQUI & MEGA-SENA)',
        prompt: 'APOSTAR NA MEGA-SENA OU PAGAR CONTAS',
        position: new THREE.Vector3(62.5, 1.2, 38.0),
        maxDist: 3.5,
        encounterId: 'LOTERICA_PIRITUBA',
        zoneId: 'LOTERICA_PIRITUBA'
      },
      {
        id: 'pastelaria_beto',
        name: 'PASTELARIA DO BETO (PASTEL GIGANTE & CALDO)',
        prompt: 'PEDIR PASTEL DE 30CM & CALDO DE CANA',
        position: new THREE.Vector3(74.5, 1.2, 39.5),
        maxDist: 4.5,
        encounterId: 'PASTELARIA_BETO',
        zoneId: 'PASTELARIA_BETO'
      },
      {
        id: 'bar_peixe',
        name: 'BAR & PETISCARIA CANTINHO DO PEIXE',
        prompt: 'PEDIR ISCA DE TILÁPIA & CERVEJA TRINCANDO',
        position: new THREE.Vector3(104.0, 1.2, 1.0),
        maxDist: 3.8,
        encounterId: 'BAR_DO_PEIXE',
        zoneId: 'BAR_DO_PEIXE'
      },
      {
        id: 'escola_publica',
        name: 'E.E. PROF. LOURENÇO FILHO (ESCOLA ESTADUAL)',
        prompt: 'FALAR COM A TIA CIDA NO PORTÃO DA ESCOLA',
        position: new THREE.Vector3(131.5, 1.2, 74.0),
        maxDist: 3.8,
        encounterId: 'ESCOLA_PUBLICA',
        zoneId: 'ESCOLA_LOURENCO_FILHO'
      },
      {
        id: 'parque_petronio',
        name: 'PRAÇA & PARQUE LINEAR PETRÔNIO PORTELA',
        prompt: 'COMPRAR PIPOCA DO SEU ZICO OU USAR A PRAÇA',
        position: new THREE.Vector3(160.5, 1.2, 72.0),
        maxDist: 3.8,
        encounterId: 'PARQUE_PETRONIO',
        zoneId: 'PARQUE_PETRONIO'
      },
      {
        id: 'espetinho_petronio',
        name: 'BAR & ESPETINHO DA PETRÔNIO',
        prompt: 'PEDIR ESPETINHO COM SEU TONINHO NA BRASA',
        position: new THREE.Vector3(129.8, 1.2, 125.0),
        maxDist: 3.8,
        encounterId: 'ESPETINHO_PETRONIO',
        zoneId: 'ESPETINHO_PETRONIO'
      },
      {
        id: 'papelaria_bazar',
        name: 'PAPELARIA, BAZAR & AUTOESCOLA PETRÔNIO',
        prompt: 'RECARREGAR BILHETE ÚNICO OU COMPRAR MATERIAIS',
        position: new THREE.Vector3(159.0, 1.2, 145.0),
        maxDist: 3.8,
        encounterId: 'PAPELARIA_BAZAR',
        zoneId: 'PAPELARIA_BAZAR'
      },
      {
        id: 'igreja_morro',
        name: 'IGREJINHA DO MORRO (PADRE BENTO)',
        prompt: 'SUBIR A ESCADARIA DA IGREJINHA OU FALAR COM PADRE BENTO',
        position: new THREE.Vector3(176.0, 4.5, 205.0),
        maxDist: 4.2,
        encounterId: 'IGREJA_DO_MORRO',
        zoneId: 'IGREJA_DO_MORRO'
      },
      {
        id: 'colegio_wellington',
        name: 'COLÉGIO WELLINGTON (PROF. MAURÍCIO)',
        prompt: 'FALAR COM PROF. MAURÍCIO NO PORTÃO OU ENTRAR NA QUADRA',
        position: new THREE.Vector3(160.0, 1.2, 248.0),
        maxDist: 3.8,
        encounterId: 'COLEGIO_WELLINGTON',
        zoneId: 'COLEGIO_WELLINGTON'
      },
      {
        id: 'mercado_pyrituba',
        name: 'MERCADO MUNICIPAL DE PYRITUBA (SEU BETO)',
        prompt: 'COMPRAR PASTEL, CALDO DE CANA OU FRUTAS COM SEU BETO',
        position: new THREE.Vector3(160.0, 1.2, 285.0),
        maxDist: 3.8,
        encounterId: 'MERCADO_PYRITUBA',
        zoneId: 'MERCADO_PYRITUBA'
      },
      {
        id: 'amigos_do_picui',
        name: 'RESTAURANTE AMIGOS DO PICUÍ (MESTRE SEVERINO)',
        prompt: 'SABOREAR CARNE DE SOL & BAIÃO DE DOIS COM MESTRE SEVERINO',
        position: new THREE.Vector3(160.0, 1.2, 318.0),
        maxDist: 3.8,
        encounterId: 'RESTAURANTE_AMIGOS_DO_PICUI',
        zoneId: 'RESTAURANTE_AMIGOS_DO_PICUI'
      },
      {
        id: 'farmacia_petronio',
        name: 'DROGARIA & FARMÁCIA PETRÔNIO (DRA. CAMILA)',
        prompt: 'COMPRAR MEDICAMENTOS OU AFERIR PRESSÃO COM DRA. CAMILA',
        position: new THREE.Vector3(131.0, 1.2, 218.0),
        maxDist: 3.8,
        encounterId: 'FARMACIA_PETRONIO',
        zoneId: 'FARMACIA_PETRONIO'
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
      this.hideNpcQuickDock();
      return;
    }

    const inGameHour = runClock ? runClock.inGameHour : 12.0;
    let closestTarget = null;
    let closestDist = Infinity;

    const npcTargets = (this.npcs && this.npcs.getInteractableTargets) ? this.npcs.getInteractableTargets() : [];
    const extNpcTargets = (this.npcs && this.npcs.getExtendedInteractableTargets) ? this.npcs.getExtendedInteractableTargets() : [];
    const residentTargets = (this.residentNpcs || []).map(r => ({
      ...r,
      isOpen: true,
      isNpc: true
    }));
    const doorTargets = (this.doors || []).filter(d => !d.isOpen).map(d => ({
      ...d,
      isDoor: true,
      prompt: d.prompt || 'ARROMBAR / ABRIR PORTA NO SOCO'
    }));
    const houseItemTargets = (this.houseItems || []).filter(item => !item.isStolen).map(item => ({
      ...item,
      isHouseItem: true,
      isOpen: true
    }));
    const allTargets = [...this.anchors, ...npcTargets, ...extNpcTargets, ...residentTargets, ...doorTargets, ...houseItemTargets];

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
          if (anchor.isDoor) {
            isOpen = true; // doors are interactable while closed
          } else if (anchor.isNpc || anchor.isHouseItem) {
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
      const isEn = typeof getLanguage === 'function' && getLanguage() === 'en';
      const loc = (closestTarget.anchor.isDoor || closestTarget.anchor.isHouseItem)
        ? null
        : (closestTarget.anchor.isNpc
          ? getLocalizedNpc(closestTarget.anchor.id)
          : getLocalizedInteractable(closestTarget.anchor.id));

      if (closestTarget.anchor.isNpc) {
        // Seamless NPC Quick Action Dock (3 Action Options)
        this.hidePrompt();
        this.renderNpcQuickActions(closestTarget);
      } else if (closestTarget.anchor.isDoor) {
        this.hideNpcQuickDock();
        const doorName = closestTarget.anchor.name || 'PORTA';
        const promptStr = isEn
          ? `[E] PUNCH / BASH DOOR OPEN (${doorName})`
          : `[E] ARROMBAR / ABRIR PORTA NO SOCO (${doorName})`;
        this.showPrompt(promptStr);
      } else if (closestTarget.anchor.isHouseItem) {
        this.hideNpcQuickDock();
        const itemName = closestTarget.anchor.name || 'OBJETO';
        const promptStr = isEn
          ? `[E] ${itemName} (STEAL OR LEAVE)`
          : `[E] ${closestTarget.anchor.prompt || itemName}`;
        this.showPrompt(promptStr);
      } else {
        // Static location interactable (Padaria, Bar, Elevador, Semáforo)
        this.hideNpcQuickDock();
        if (closestTarget.isOpen) {
          const promptStr = loc ? loc.prompt : closestTarget.anchor.prompt;
          this.showPrompt(`[E] ${promptStr}`);
        } else {
          const zone = WORLD_ZONES.find(z => z.id === closestTarget.anchor.zoneId);
          const anchorName = loc ? loc.name : closestTarget.anchor.name;
          if (closestTarget.anchor.id === 'semaforo_bico') {
            const isDuringOperatingHours = ZoneManager.isZoneOpen(zone, inGameHour);
            if (isDuringOperatingHours) {
              this.showPrompt(isEn ? `[WAIT FOR RED TRAFFIC LIGHT] ${anchorName}` : `[AGUARDE O SINAL VERMELHO DOS CARROS] ${anchorName}`);
            } else {
              const rawHour = zone?.openHour || 7;
              const hh = Math.floor(rawHour);
              const mm = Math.round((rawHour - hh) * 60);
              const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
              this.showPrompt(isEn ? `[RUSH HOUR OVER] ${anchorName} (RETURNS AT ${timeStr})` : `[HORÁRIO DE PICO ENCERRADO] ${anchorName} (RETORNA ÀS ${timeStr})`);
            }
          } else {
            const rawHour = zone?.openHour || 0;
            const hh = Math.floor(rawHour);
            const mm = Math.round((rawHour - hh) * 60);
            const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
            this.showPrompt(isEn ? `[CLOSED] ${anchorName} (OPENS AT ${timeStr})` : `[FECHADO] ${anchorName} (ABRE ÀS ${timeStr})`);
          }
        }
      }
    } else {
      this.hidePrompt();
      this.hideNpcQuickDock();
    }
  }

  showPrompt(text) {
    if (!this.promptElem) return;
    const isTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    let displayText = text;
    if (isTouch) {
      displayText = text.replace(/\[E\]\s*/g, '⚡ [TOQUE] ');
    }
    this.promptElem.textContent = displayText;
    this.promptElem.classList.remove('modal-hidden');
  }

  hidePrompt() {
    if (!this.promptElem) return;
    this.promptElem.classList.add('modal-hidden');
  }

  hideNpcQuickDock() {
    const dock = document.getElementById('npc-quick-dock');
    if (dock) dock.classList.add('modal-hidden');
    this.activeQuickNpc = null;
    this.activeQuickOptions = [];
  }

  // Render 3 visual seamless action cards when near an NPC
  renderNpcQuickActions(target) {
    const dock = document.getElementById('npc-quick-dock');
    const avatarElem = document.getElementById('npc-quick-avatar');
    const nameElem = document.getElementById('npc-quick-name');
    const optionsElem = document.getElementById('npc-quick-options');
    if (!dock || !optionsElem) return;

    const encId = target.anchor.encounterId;
    const encounter = BRAZILIAN_ENCOUNTERS[encId];
    if (!encounter) return;

    const gameState = window.app?.game?.state;
    if (!gameState) return;

    const allOptions = encounter.getOptions(gameState) || [];
    const top3 = allOptions.slice(0, 3);
    this.activeQuickNpc = target.anchor.id;
    this.activeQuickOptions = top3;

    // Avatar Icon Map
    const avatarMap = {
      clodoaldo: '🍬',
      caramelo: '🐕',
      juninho: '🚴',
      dona_neide: '👵',
      sargento_rocha: '👮',
      menor_corre: '🧢',
      mestre_bloco: '🥁',
      churrasqueiro_campo: '🍖',
      flanelinha: '🚙',
      // Living residents & domestic animals
      tio_wilson: '📺',
      manuel_padeiro: '🥖',
      padaria: '🥖',
      padaria_counter: '🥖',
      louro_varanda: '🦜',
      galo_quintal: '🐔',
      mecanico_beto: '🔧',
      porteiro_valdir: '🏢',
      guarda_silva: '🛡️',
      caixa_banco: '🏦',
      // Bar do Tião patrons
      baixinho_sinuca: '🎱',
      ze_taco: '🍺',
      rubao_pinga: '🍶',
      chicao_litrao: '😂',
      seu_pedro_torresmo: '🥓',
      // Pastelaria do Beto diners & staff
      marquinhos_garcom: '🥟',
      tio_carlinhos_cliente: '🥟',
      dona_ivone_cliente: '👵',
      luquinhas_balcao: '🧒',
      // Citywide pedestrians
      cabo_oliveira: '👮',
      soldado_nascimento: '👮',
      cabo_santos: '👮',
      vitinho_grau: '🧢',
      diguinho_noia: '🧢',
      nelsinho_chapa: '🧢',
      dona_carmem: '👵',
      dona_lurdes: '👵',
      dona_maria_parque: '👵',
      seu_valdir: '👴',
      seu_geraldo: '👴',
      seu_osvaldo: '👴'
    };

    let avatarIcon = avatarMap[target.anchor.id];
    if (!avatarIcon && target.anchor.id && target.anchor.id.startsWith('favela_resident')) {
      avatarIcon = '🏠';
    }
    if (!avatarIcon) avatarIcon = '👤';

    if (avatarElem) avatarElem.textContent = avatarIcon;
    if (nameElem) nameElem.textContent = target.anchor.name;

    optionsElem.innerHTML = '';
    top3.forEach((opt, idx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `npc-action-card ${opt.disabled ? 'disabled' : ''}`;
      if (opt.disabled) card.disabled = true;

      // Extract crisp Verb from label
      let verb = opt.label;
      if (verb.length > 34) verb = verb.substring(0, 32) + '...';

      // Generate visual effect pills
      let badgesHtml = '';
      if (opt.costCentavos && opt.costCentavos > 0) {
        badgesHtml += `<span class="pip-pill pip-red">$$ -R$ ${(opt.costCentavos / 100).toFixed(0)}</span>`;
      } else if (opt.costLabel && opt.costLabel.includes('+R$')) {
        badgesHtml += `<span class="pip-pill pip-green">$$$ +Grana</span>`;
      }

      const labelLower = opt.label.toLowerCase();
      if (labelLower.includes('fome') || labelLower.includes('paçoca') || labelLower.includes('marmita') || labelLower.includes('salgado') || labelLower.includes('rango')) {
        badgesHtml += `<span class="pip-pill pip-food">🍖 +Bucho</span>`;
      }
      if (labelLower.includes('sanidade') || labelLower.includes('ideia') || labelLower.includes('carinho') || labelLower.includes('grau') || labelLower.includes('energético')) {
        badgesHtml += `<span class="pip-pill pip-sanity">🧠 +Sanidade</span>`;
      }
      if (labelLower.includes('perigo') || labelLower.includes('geral') || labelLower.includes('enquadro') || labelLower.includes('corre')) {
        badgesHtml += `<span class="pip-pill pip-danger">🚨 Risco</span>`;
      }

      card.innerHTML = `
        <div class="npc-card-top">
          <span class="npc-card-key">[${idx + 1}]</span>
          <span class="npc-card-verb">${verb}</span>
        </div>
        <div class="npc-card-badges">${badgesHtml}</div>
      `;

      let actionFired = false;
      const onAction = (e) => {
        if (opt.disabled) return;
        if (actionFired) return;
        actionFired = true;
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        setTimeout(() => { actionFired = false; }, 350);
        this.executeQuickAction(idx);
      };
      card.addEventListener('click', onAction);
      card.addEventListener('touchend', onAction);

      optionsElem.appendChild(card);
    });

    dock.classList.remove('modal-hidden');
  }

  // Execute NPC quick action immediately without modal freezing
  executeQuickAction(index) {
    if (!this.activeQuickOptions || !this.activeQuickOptions[index]) return;
    const opt = this.activeQuickOptions[index];
    const game = window.app?.game;
    if (!game || !game.state || !game.isRunActive) return;
    if (this.dialog && this.dialog.isOpen) return;

    if (opt.disabled) {
      if (game.hud) game.hud.showToast('⚠️ <strong>AÇÃO INDISPONÍVEL:</strong> Recursos insuficientes!', 2500);
      return;
    }

    const outcome = opt.execute(game.state, this.sound);
    let finalOutcome = outcome;
    if (game.state.lastDiminishing && game.state.lastDiminishing.isDiminished) {
      const dim = game.state.lastDiminishing;
      if (dim.isExhausted) {
        finalOutcome = `⚠️ <strong>${opt.label}:</strong> Efeito esgotado pela repetição contínua! (0% de efeito)`;
      } else if (finalOutcome) {
        finalOutcome += `<div style="margin-top:3px;font-size:10px;color:#ffcc00;font-weight:bold;">⚠️ Ação repetitiva: rendimento reduzido (${Math.round(dim.mult * 100)}% de efeito)</div>`;
      }
    }
    if (game.hud && finalOutcome) {
      game.hud.showToast(finalOutcome, 2800);
    }

    // Check item robbery or police confiscation hooks
    const robberyChance = game.state?.rng ? game.state.rng.chance(0.35) : (Math.random() < 0.35);
    if (this.activeQuickNpc === 'menor_corre' && robberyChance) {
      if (game.hands) game.hands.robItem();
    } else if (this.activeQuickNpc === 'sargento_rocha' && opt.id === 'tomar_geral') {
      if (game.hands) game.hands.confiscateItem();
    }

    // Refresh quick dock cards with updated state
    if (this.currentTarget && this.currentTarget.anchor.isNpc) {
      this.renderNpcQuickActions(this.currentTarget);
    }
  }

  setResidentNpcs(npcs) {
    this.residentNpcs = npcs || [];
  }

  setHouseItems(items) {
    this.houseItems = items || [];
  }

  setDoors(doors) {
    this.doors = doors || [];
  }

  addDoor(door) {
    if (!this.doors) this.doors = [];
    this.doors.push(door);
  }

  triggerDoor(door) {
    if (!door || door.isOpen) return;
    door.isOpen = true;

    const game = window.app?.game;
    if (game?.hands) {
      game.hands.triggerPunch('right');
    }

    if (this.sound) {
      if (this.sound.playPunchHit) this.sound.playPunchHit();
      if (this.sound.playDoorOpen) this.sound.playDoorOpen();
    }

    if (door.doorMesh) {
      door.doorMesh.rotation.y = door.openAngle !== undefined ? door.openAngle : Math.PI / 2;
    }

    const physics = window.app?.physics;
    if (physics && door.collider) {
      const idx = physics.colliders.indexOf(door.collider);
      if (idx !== -1) {
        physics.colliders.splice(idx, 1);
      }
    }

    const isEn = typeof getLanguage === 'function' && getLanguage() === 'en';
    if (game?.hud) {
      const doorName = door.name || 'PORTA';
      game.hud.showToast(
        isEn
          ? `🚪 <strong>DOOR BASHED OPEN!</strong> You punched open the entrance to ${doorName}!`
          : `🚪 <strong>PORTA ARROMBADA!</strong> Você meteu o soco e arrombou a ${doorName}!`,
        3000
      );
    }
    this.hidePrompt();

    // Check if this door leads to a house with an entry intent encounter (steal or respect)
    if (door.entryEncounterId && this.dialog && !this.dialog.isOpen) {
      const enc = BRAZILIAN_ENCOUNTERS[door.entryEncounterId];
      if (enc && game?.state) {
        setTimeout(() => {
          if (!this.dialog.isOpen) {
            this.dialog.open({
              id: enc.id,
              encounterId: enc.id,
              _state: game.state,
              title: enc.title,
              text: enc.getIntroText(game.state),
              options: enc.getOptions(game.state)
            }, (opt) => {
              const outcome = opt.execute(game.state, this.sound);
              if (outcome && game.hud) {
                game.hud.showToast(outcome, 4000);
              }
            });
          }
        }, 350);
      }
    }
  }

  trigger(gameState) {
    if (!this.currentTarget || !this.currentTarget.isOpen) return;

    // If near an NPC, pressing [E] triggers the primary Quick Action [1]
    if (this.currentTarget.anchor.isNpc) {
      this.executeQuickAction(0);
      return;
    }

    // If aiming at an interactive door, punch/bash it open
    if (this.currentTarget.anchor.isDoor) {
      this.triggerDoor(this.currentTarget.anchor);
      return;
    }

    // If aiming at an interactive house item (TV, Botijão, Stanley, iPhone, etc.)
    if (this.currentTarget.anchor.isHouseItem) {
      if (this.dialog && this.dialog.isOpen) return;
      const item = this.currentTarget.anchor;
      const encId = item.encounterId;
      const enc = BRAZILIAN_ENCOUNTERS[encId];
      if (!enc) return;

      this.dialog.open({
        id: encId,
        encounterId: encId,
        _state: gameState,
        title: enc.title,
        text: enc.getIntroText(gameState),
        options: enc.getOptions(gameState)
      }, (chosenOption) => {
        const outcomeText = chosenOption.execute(gameState, this.sound);
        if (chosenOption.id.startsWith('furtar_')) {
          item.isStolen = true;
          if (item.mesh) {
            item.mesh.visible = false;
          }
        }
        if (outcomeText) {
          const isEn = typeof getLanguage === 'function' && getLanguage() === 'en';
          this.dialog.open({
            title: isEn ? 'ITEM INTERACTION' : 'INTERAÇÃO COM OBJETO',
            text: `<p>${outcomeText}</p>`,
            options: [
              { label: isEn ? 'Continue' : 'Continuar', execute: () => {} }
            ]
          }, () => {});
        }
      });
      return;
    }

    // Direct, seamless elevator transit (no modal freezes, no pointer lock loss)
    const anchorId = this.currentTarget.anchor.id;
    if (anchorId === 'elevador_penthouse') {
      const controls = window.app?.controls;
      const game = window.app?.game;
      if (this.sound && this.sound.playElevatorChime) this.sound.playElevatorChime();
      else if (this.sound && this.sound.playCoin) this.sound.playCoin();
      if (controls) {
        controls.teleport(31.5, 0.25, 4.2, 0); // Ground lobby facing South towards entrance
      }
      const isEn = typeof getLanguage === 'function' && getLanguage() === 'en';
      if (game?.hud) {
        game.hud.showToast(
          isEn
            ? '🛗 <strong>ELEVATOR:</strong> Descended 12 floors to the ground floor lobby of Jaraguá Tower!'
            : '🛗 <strong>ELEVADOR:</strong> Você desceu 12 andares até a portaria térrea do Jaraguá Tower!',
          3500
        );
      }
      return;
    }

    if (anchorId === 'elevador_terreo') {
      const controls = window.app?.controls;
      const game = window.app?.game;
      if (this.sound && this.sound.playElevatorChime) this.sound.playElevatorChime();
      else if (this.sound && this.sound.playCoin) this.sound.playCoin();
      if (controls) {
        controls.teleport(31.5, 32.25, 4.0, Math.PI); // Penthouse facing North towards Jaraguá
      }
      const isEn = typeof getLanguage === 'function' && getLanguage() === 'en';
      if (game?.hud) {
        game.hud.showToast(
          isEn
            ? '🛗 <strong>ELEVATOR:</strong> Ascended to the 12th floor Penthouse with 180° view of Pico do Jaraguá!'
            : '🛗 <strong>ELEVADOR:</strong> Você subiu para a Cobertura no 12º andar (vista 180° do Pico do Jaraguá)!',
          3500
        );
      }

      // Trigger Penthouse entry intent encounter
      if (this.dialog && !this.dialog.isOpen && game?.state) {
        const enc = BRAZILIAN_ENCOUNTERS.HOUSE_ENTRY_PENTHOUSE;
        if (enc) {
          setTimeout(() => {
            if (!this.dialog.isOpen) {
              this.dialog.open({
                id: enc.id,
                encounterId: enc.id,
                _state: game.state,
                title: enc.title,
                text: enc.getIntroText(game.state),
                options: enc.getOptions(game.state)
              }, (opt) => {
                const outcome = opt.execute(game.state, this.sound);
                if (outcome && game.hud) {
                  game.hud.showToast(outcome, 4000);
                }
              });
            }
          }, 400);
        }
      }
      return;
    }

    // Static location interactables (Padaria, Bar, Banco)
    if (this.dialog && this.dialog.isOpen) return;

    const encId = this.currentTarget.anchor.encounterId;
    const encounter = BRAZILIAN_ENCOUNTERS[encId];
    if (!encounter) return;

    const dialogData = {
      id: encId,
      encounterId: encId,
      _state: gameState,
      title: encounter.title,
      text: encounter.getIntroText(gameState),
      options: encounter.getOptions(gameState)
    };

    this.dialog.open(dialogData, (chosenOption) => {
      const outcomeText = chosenOption.execute(gameState, this.sound);
      if (outcomeText) {
        let finalOutcomeText = outcomeText;
        if (gameState.lastDiminishing && gameState.lastDiminishing.isDiminished) {
          const dim = gameState.lastDiminishing;
          if (dim.isExhausted) {
            finalOutcomeText = `⚠️ <strong>${chosenOption.label}:</strong> Efeito esgotado pela repetição contínua! (0% de efeito adicional)`;
          } else {
            finalOutcomeText += `<br><span style="color:#ffcc00;font-size:11px;font-weight:bold;">⚠️ Ação repetitiva: rendimento reduzido (${Math.round(dim.mult * 100)}% de efeito)</span>`;
          }
        }
        const isEn = typeof getLanguage === 'function' && getLanguage() === 'en';
        this.dialog.open({
          title: isEn ? 'ENCOUNTER OUTCOME' : 'DESFECHO DO ENCONTRO',
          text: `<p>${finalOutcomeText}</p>`,
          options: [
            { label: isEn ? 'Continue the day' : 'Continuar o dia', execute: () => {} }
          ]
        }, () => {});
      }
    });
  }
}
