/**
 * SpatialSoundSystem.js
 * Manages 3D positional audio emitters throughout Pirituba (Bar do Tião, Adega, Baile da Laje, etc.).
 * Simulates realistic acoustic distance falloff and lowpass air-muffling so that
 * as the player walks toward a sound source, the radio swells from distant muffled bass
 * into full, crisp, vibrant sound.
 */

export const CITY_EMITTERS = [
  {
    id: 'BAR_DO_TIAO',
    name: 'Bar do Tião (Radinho do Balcão)',
    x: 12.0,
    y: 1.2,
    z: 41.5,
    refDist: 4.5,
    maxDist: 42.0,
    preferredGenre: 'PAGODE',
    ambienceFile: 'media/audio/ambience/boteco_chatter.mp3'
  },
  {
    id: 'ADEGA_DO_ZE',
    name: 'Adega do Zé (Caixa da Calçada)',
    x: -14.0,
    y: 1.2,
    z: 37.8,
    refDist: 4.0,
    maxDist: 36.0,
    preferredGenre: 'SERTANEJO',
    ambienceFile: 'media/audio/ambience/papo_calcada.mp3'
  },
  {
    id: 'PADARIA_ESTRELA',
    name: 'Padaria Estrela (Som Ambiente)',
    x: 32.0,
    y: 1.2,
    z: 37.8,
    refDist: 4.0,
    maxDist: 36.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'POSTO_PIRITUBA',
    name: 'Posto Pirituba 24h (Rádio da Conveniência)',
    x: -42.0,
    y: 1.2,
    z: 41.0,
    refDist: 5.0,
    maxDist: 45.0,
    preferredGenre: 'ROCK',
    ambienceFile: null
  },
  {
    id: 'CRUZAMENTO_EDGAR_FACCO',
    name: 'Cruzamento Paula Ferreira (Banca / Camelô)',
    x: 0.0,
    y: 1.2,
    z: 16.0,
    refDist: 5.0,
    maxDist: 46.0,
    preferredGenre: 'ROCK',
    ambienceFile: 'media/audio/ambience/feira_ambulante.mp3'
  },
  {
    id: 'BANCA_JORNAL',
    name: 'Banca do Seu Mário (Radinho de Pilha)',
    x: 7.5,
    y: 1.2,
    z: 35.8,
    refDist: 3.5,
    maxDist: 32.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'BAILE_LAJE',
    name: 'Baile da Laje no Escadão (Paredão de Som)',
    x: 0.0,
    y: 8.4,
    z: -66.0,
    refDist: 8.0,
    maxDist: 70.0,
    preferredGenre: 'FUNK',
    ambienceFile: null
  },
  {
    id: 'CAMPINHO_FAVELA',
    name: 'Campinho da Favela (Radinho da Roda de Samba)',
    x: 0.0,
    y: 9.5,
    z: -99.0,
    refDist: 6.0,
    maxDist: 55.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'BAR_FRANGO',
    name: 'O Lendário Bar Frangó (Som do Casarão)',
    x: 20.5,
    y: 9.6,
    z: 183.0,
    refDist: 6.0,
    maxDist: 55.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'BOTECO_SETE_BARRAS',
    name: 'Boteco das 7 Barras (Caixa da Calçada)',
    x: 18.0,
    y: 1.2,
    z: 68.0,
    refDist: 4.5,
    maxDist: 40.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'CASA_DO_NORTE',
    name: 'Casa do Norte Asa Branca (Rádio do Balcão)',
    x: -27.0,
    y: 1.2,
    z: 38.0,
    refDist: 4.0,
    maxDist: 36.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'PASTELARIA_BETO',
    name: 'Pastelaria do Beto (Caixinha de Som)',
    x: 74.5,
    y: 1.2,
    z: 38.0,
    refDist: 4.0,
    maxDist: 38.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'ESCOLA_LOURENCO',
    name: 'E.E. Prof. Lourenço Filho (Som da Portaria)',
    x: 131.5,
    y: 1.2,
    z: 74.0,
    refDist: 5.0,
    maxDist: 45.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'PARQUE_PETRONIO',
    name: 'Parque Linear Petrônio Portela (Radinho da Pipoca)',
    x: 160.5,
    y: 1.2,
    z: 72.0,
    refDist: 5.0,
    maxDist: 48.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'ESPETINHO_PETRONIO',
    name: 'Bar & Espetinho da Petrônio (Caixa da Calçada)',
    x: 129.8,
    y: 1.2,
    z: 125.0,
    refDist: 4.5,
    maxDist: 42.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'PAPELARIA_BAZAR',
    name: 'Autoescola & Papelaria (Rádio do Uno)',
    x: 159.0,
    y: 1.2,
    z: 145.0,
    refDist: 4.5,
    maxDist: 42.0,
    preferredGenre: 'ROCK',
    ambienceFile: null
  },
  {
    id: 'IGREJA_DO_MORRO',
    name: 'Igrejinha no Morro (Rádio da Sacristia)',
    x: 176.0,
    y: 4.5,
    z: 205.0,
    refDist: 5.5,
    maxDist: 50.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'COLEGIO_WELLINGTON',
    name: 'Colégio Wellington (Som da Cantina)',
    x: 160.0,
    y: 1.2,
    z: 248.0,
    refDist: 5.5,
    maxDist: 48.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'MERCADO_PYRITUBA',
    name: 'Mercado Municipal de Pyrituba (Rádio dos Pastéis)',
    x: 160.0,
    y: 1.2,
    z: 285.0,
    refDist: 5.5,
    maxDist: 50.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'AMIGOS_DO_PICUI',
    name: 'Restaurante Amigos do Picuí (Som da Varanda)',
    x: 160.0,
    y: 1.2,
    z: 318.0,
    refDist: 5.5,
    maxDist: 50.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'FARMACIA_PETRONIO',
    name: 'Drogaria & Farmácia Petrônio (Som Ambiente)',
    x: 131.0,
    y: 1.2,
    z: 218.0,
    refDist: 4.5,
    maxDist: 42.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'SOBRADOS_PAULA_FERREIRA',
    name: 'Sobrado Residencial (Janela do 1º Andar)',
    x: -10.0,
    y: 2.5,
    z: 0.0,
    refDist: 4.0,
    maxDist: 38.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'SOBRADOS_PETRONIO_SUL',
    name: 'Sobrado Comercial Sul (Rádio da Oficina)',
    x: 131.0,
    y: 2.5,
    z: 285.0,
    refDist: 4.5,
    maxDist: 42.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  }
];

export class SpatialSoundSystem {
  constructor(ctx, destinationNode) {
    this.ctx = ctx;
    this.destination = destinationNode;
    this.emitters = CITY_EMITTERS;

    // Spatial filter (lowpass filter that opens up as player approaches)
    this.spatialFilter = this.ctx.createBiquadFilter();
    this.spatialFilter.type = 'lowpass';
    this.spatialFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
    this.spatialFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Spatial gain node
    this.spatialGain = this.ctx.createGain();
    this.spatialGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.spatialFilter.connect(this.spatialGain);
    this.spatialGain.connect(this.destination);

    // Ambient chatter elements
    this.chatterAudios = new Map();
    this.initChatterStreams();

    this.currentAudibleGain = 1.0;
    this.currentAudibleFreq = 20000;
    this.nearestEmitter = null;
    this.isPersonalRadio = false; // When false, radio broadcast is projected by 3D nodes across Pirituba
  }

  // Pre-load ambient audio loops for locations (disabled to ensure pristine radio broadcast)
  initChatterStreams() {
    // High danger police siren & enquadro chatter
    try {
      const pmAudio = new Audio();
      pmAudio.src = 'media/audio/ambience/enquadro_pm.mp3';
      pmAudio.loop = true;
      pmAudio.volume = 0.0;
      pmAudio.preload = 'auto';
      this.policeAudio = pmAudio;
    } catch (e) {
      console.warn('[SpatialSound] Police chatter init failed:', e);
    }
  }

  // Input node for music or radio to pass through the spatial filter & gain
  get inputNode() {
    return this.spatialFilter;
  }

  setPersonalRadio(enabled) {
    this.isPersonalRadio = enabled !== false;
  }

  // Main frame update: calculate distances to all emitters and adjust gain + filter
  update(playerPos, dangerLevel = 0) {
    if (!playerPos || !this.ctx) return;

    // 1. Personal radio (headphone / manual dial override): always full volume and crystal clear 20kHz
    if (this.isPersonalRadio) {
      const t = this.ctx.currentTime;
      this.spatialGain.gain.setTargetAtTime(1.0, t, 0.2);
      this.spatialFilter.frequency.setTargetAtTime(20000, t, 0.2);
      this.spatialGain.gain.value = 1.0;
      this.spatialFilter.frequency.value = 20000;
      this.currentAudibleGain = 1.0;
      this.currentAudibleFreq = 20000;
    } else {
      // 2. Find closest emitter to player among all 23 citywide nodes
      let closest = null;
      let minDist = Infinity;

      for (const em of this.emitters) {
        const dist = Math.hypot(playerPos.x - em.x, playerPos.z - em.z);
        if (dist < minDist) {
          minDist = dist;
          closest = em;
        }
      }

      this.nearestEmitter = closest;
      const t = this.ctx.currentTime;

      if (!closest || minDist > closest.maxDist) {
        // Out of range of all emitters: warm distant neighborhood echo
        const ambientFloor = 0.22;
        this.spatialGain.gain.setTargetAtTime(ambientFloor, t, 0.3);
        this.spatialFilter.frequency.setTargetAtTime(2200, t, 0.3);
        this.spatialGain.gain.value = ambientFloor;
        this.spatialFilter.frequency.value = 2200;
        this.currentAudibleGain = ambientFloor;
        this.currentAudibleFreq = 2200;
      } else {
        // Smooth distance attenuation (inverse-power curve)
        const range = closest.maxDist - closest.refDist;
        const distDelta = Math.max(0, minDist - closest.refDist);
        const factor = Math.max(0.0, 1.0 - (distDelta / range));
        // Organic curve: volume swells smoothly as you approach (minimum 0.25 on open street, 1.0 near node)
        const calculatedGain = 0.25 + 0.75 * Math.pow(factor, 1.4);
        // Frequency opens up: from 2,200 Hz (warm muffled street sound) up to 20,000 Hz (crisp, pristine near node)
        const targetFreq = 2200 + 17800 * Math.pow(factor, 1.5);

        this.spatialGain.gain.setTargetAtTime(calculatedGain, t, 0.18);
        this.spatialFilter.frequency.setTargetAtTime(targetFreq, t, 0.18);
        this.spatialGain.gain.value = calculatedGain;
        this.spatialFilter.frequency.value = targetFreq;
        this.currentAudibleGain = calculatedGain;
        this.currentAudibleFreq = targetFreq;
      }
    }

    // 3. Keep chatter audio loops strictly paused so they never compete with or drown out the radio
    for (const [emitterId, item] of this.chatterAudios.entries()) {
      if (item.isPlaying) {
        item.audio.pause();
        item.isPlaying = false;
      }
    }

    // 4. Update police chatter / sirens when danger is high
    if (this.policeAudio) {
      if (dangerLevel >= 55) {
        const dangerFactor = Math.min(1.0, (dangerLevel - 55) / 45);
        const targetVol = dangerFactor * 0.40;
        if (this.policeAudio.paused) {
          this.policeAudio.play().catch(() => {});
        }
        this.policeAudio.volume = targetVol;
      } else {
        if (!this.policeAudio.paused && this.policeAudio.volume > 0.02) {
          this.policeAudio.volume = Math.max(0, this.policeAudio.volume - 0.04);
        } else if (!this.policeAudio.paused) {
          this.policeAudio.pause();
        }
      }
    }
  }

  stopAll() {
    for (const item of this.chatterAudios.values()) {
      if (item.audio) {
        item.audio.pause();
        item.audio.currentTime = 0;
      }
    }
    if (this.policeAudio) {
      this.policeAudio.pause();
      this.policeAudio.currentTime = 0;
    }
  }
}
