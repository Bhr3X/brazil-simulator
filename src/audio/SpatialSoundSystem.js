/**
 * SpatialSoundSystem.js
 * Manages 3D positional audio emitters throughout Pirituba (Bar do Tião, Adega, Baile da Laje, etc.).
 * Simulates realistic acoustic distance falloff and lowpass air-muffling so that
 * as the player walks toward a sound source, the radio swells from distant muffled bass
 * into full, crisp, vibrant sound.
 */

export const CITY_EMITTERS = [
  // --- OS BARES & BOTECOS (Loud Hotspots, High Power) ---
  {
    id: 'BAR_DO_TIAO',
    name: 'Bar do Tião (Radinho do Balcão e Mesinhas)',
    x: 12.0,
    y: 1.2,
    z: 41.5,
    refDist: 6.5,
    maxDist: 26.0,
    power: 1.0,
    preferredGenre: 'PAGODE',
    ambienceFile: 'media/audio/ambience/boteco_chatter.mp3'
  },
  {
    id: 'ADEGA_DO_ZE',
    name: 'Adega do Zé (Caixa de Som da Calçada)',
    x: -14.0,
    y: 1.2,
    z: 37.8,
    refDist: 4.5,
    maxDist: 22.0,
    power: 1.0,
    preferredGenre: 'SERTANEJO',
    ambienceFile: 'media/audio/ambience/papo_calcada.mp3'
  },
  {
    id: 'BAR_FRANGO',
    name: 'O Lendário Bar Frangó (Som do Casarão Colonial)',
    x: 20.5,
    y: 9.6,
    z: 183.0,
    refDist: 6.0,
    maxDist: 26.0,
    power: 1.0,
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
    maxDist: 22.0,
    power: 1.0,
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
    maxDist: 20.0,
    power: 1.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'ESPETINHO_PETRONIO',
    name: 'Bar & Espetinho da Petrônio (Caixa da Calçada)',
    x: 129.8,
    y: 1.2,
    z: 125.0,
    refDist: 4.5,
    maxDist: 22.0,
    power: 1.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'AMIGOS_DO_PICUI',
    name: 'Restaurante & Bar Amigos do Picuí (Som da Varanda)',
    x: 160.0,
    y: 1.2,
    z: 318.0,
    refDist: 5.0,
    maxDist: 22.0,
    power: 1.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },

  // --- A FAVELA / BAILE ROLANDO (Paredão de Som, Loud & Wide Throw) ---
  {
    id: 'BAILE_LAJE',
    name: 'Baile da Laje no Escadão (Paredão de Som da Favela)',
    x: 0.0,
    y: 8.4,
    z: -66.0,
    refDist: 8.0,
    maxDist: 42.0,
    power: 1.0,
    preferredGenre: 'FUNK',
    ambienceFile: null
  },
  {
    id: 'CAMPINHO_FAVELA',
    name: 'Campinho da Favela (Roda de Samba e Churrasco)',
    x: 0.0,
    y: 9.5,
    z: -99.0,
    refDist: 6.0,
    maxDist: 28.0,
    power: 1.0,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },

  // --- O AP & RESIDÊNCIAS (Som Residencial / Janela do Ap) ---
  {
    id: 'SOBRADOS_PAULA_FERREIRA',
    name: 'Apartamento / Sobrado Residencial (Som da Janela)',
    x: -10.0,
    y: 2.5,
    z: 0.0,
    refDist: 4.5,
    maxDist: 20.0,
    power: 1.0,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'SOBRADOS_PETRONIO_SUL',
    name: 'Sobrado Comercial Sul (Rádio da Oficina)',
    x: 131.0,
    y: 2.5,
    z: 285.0,
    refDist: 4.0,
    maxDist: 18.0,
    power: 0.8,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },

  // --- LOCAIS PÚBLICOS & COMÉRCIOS MENORES (Potência Moderada / Localizada) ---
  {
    id: 'PADARIA_ESTRELA',
    name: 'Padaria Estrela (Som Ambiente da Padoca)',
    x: 32.0,
    y: 1.2,
    z: 37.8,
    refDist: 3.0,
    maxDist: 15.0,
    power: 0.55,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'POSTO_PIRITUBA',
    name: 'Posto Pirituba 24h (Rádio da Conveniência)',
    x: -42.0,
    y: 1.2,
    z: 41.0,
    refDist: 3.5,
    maxDist: 16.0,
    power: 0.6,
    preferredGenre: 'ROCK',
    ambienceFile: null
  },
  {
    id: 'CRUZAMENTO_EDGAR_FACCO',
    name: 'Cruzamento Paula Ferreira (Som do Camelô)',
    x: 0.0,
    y: 1.2,
    z: 16.0,
    refDist: 3.0,
    maxDist: 15.0,
    power: 0.5,
    preferredGenre: 'ROCK',
    ambienceFile: 'media/audio/ambience/feira_ambulante.mp3'
  },
  {
    id: 'BANCA_JORNAL',
    name: 'Banca do Seu Mário (Radinho de Pilha)',
    x: 7.5,
    y: 1.2,
    z: 35.8,
    refDist: 2.2,
    maxDist: 11.0,
    power: 0.4,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'PASTELARIA_BETO',
    name: 'Pastelaria do Beto (Caixinha de Som)',
    x: 74.5,
    y: 1.2,
    z: 38.0,
    refDist: 3.0,
    maxDist: 15.0,
    power: 0.5,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'ESCOLA_LOURENCO',
    name: 'E.E. Prof. Lourenço Filho (Rádio da Portaria)',
    x: 131.5,
    y: 1.2,
    z: 74.0,
    refDist: 2.5,
    maxDist: 12.0,
    power: 0.35,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'PARQUE_PETRONIO',
    name: 'Parque Linear Petrônio Portela (Radinho da Pipoca)',
    x: 160.5,
    y: 1.2,
    z: 72.0,
    refDist: 2.5,
    maxDist: 12.0,
    power: 0.4,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'PAPELARIA_BAZAR',
    name: 'Autoescola & Papelaria (Rádio do Carro)',
    x: 159.0,
    y: 1.2,
    z: 145.0,
    refDist: 2.5,
    maxDist: 12.0,
    power: 0.4,
    preferredGenre: 'ROCK',
    ambienceFile: null
  },
  {
    id: 'IGREJA_DO_MORRO',
    name: 'Igrejinha no Morro (Rádio da Sacristia)',
    x: 176.0,
    y: 4.5,
    z: 205.0,
    refDist: 2.5,
    maxDist: 12.0,
    power: 0.3,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'COLEGIO_WELLINGTON',
    name: 'Colégio Wellington (Som da Cantina)',
    x: 160.0,
    y: 1.2,
    z: 248.0,
    refDist: 2.5,
    maxDist: 12.0,
    power: 0.35,
    preferredGenre: 'MPB',
    ambienceFile: null
  },
  {
    id: 'MERCADO_PYRITUBA',
    name: 'Mercado Municipal de Pyrituba (Rádio dos Pastéis)',
    x: 160.0,
    y: 1.2,
    z: 285.0,
    refDist: 3.5,
    maxDist: 16.0,
    power: 0.6,
    preferredGenre: 'PAGODE',
    ambienceFile: null
  },
  {
    id: 'FARMACIA_PETRONIO',
    name: 'Drogaria & Farmácia Petrônio (Som Ambiente)',
    x: 131.0,
    y: 1.2,
    z: 218.0,
    refDist: 2.5,
    maxDist: 12.0,
    power: 0.35,
    preferredGenre: 'MPB',
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
      // 2. Multi-emitter 3D acoustic projection
      // Bares, o AP, e o Baile da Laje na Favela are the loud primary sound sources.
      // Sound dynamically attenuates as the player walks across the map into open streets and residential alleys.
      let maxAudibleGain = 0.0;
      let targetFreq = 800;
      let dominantEmitter = null;

      for (const em of this.emitters) {
        const dx = playerPos.x - em.x;
        const dy = (playerPos.y !== undefined && playerPos.y !== null ? playerPos.y - em.y : 0);
        const dz = playerPos.z - em.z;
        // 3D Euclidean distance
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const power = em.power !== undefined ? em.power : 1.0;
        const refDist = em.refDist || 4.0;
        const maxDist = em.maxDist || 20.0;

        if (dist <= refDist) {
          // Inside hotspot: maximum loud sound and wide open frequency
          if (power > maxAudibleGain) {
            maxAudibleGain = power;
            targetFreq = 20000;
            dominantEmitter = em;
          }
        } else if (dist < maxDist) {
          // Smooth acoustic attenuation as the player walks away from the sound source
          const tNorm = (dist - refDist) / (maxDist - refDist);
          const falloff = 1.0 - tNorm;
          const gain = power * Math.pow(falloff, 1.6);
          if (gain > maxAudibleGain) {
            maxAudibleGain = gain;
            targetFreq = 800 + 19200 * Math.pow(falloff, 1.6);
            dominantEmitter = em;
          }
        }
      }

      this.nearestEmitter = dominantEmitter;
      const t = this.ctx.currentTime;

      // When player is far from music sources, the sound fades cleanly to silence / near-silence (0.0)
      const calculatedGain = Math.min(1.0, maxAudibleGain);
      const calculatedFreq = Math.min(20000, Math.max(800, targetFreq));

      this.spatialGain.gain.setTargetAtTime(calculatedGain, t, 0.15);
      this.spatialFilter.frequency.setTargetAtTime(calculatedFreq, t, 0.15);
      this.spatialGain.gain.value = calculatedGain;
      this.spatialFilter.frequency.value = calculatedFreq;
      this.currentAudibleGain = calculatedGain;
      this.currentAudibleFreq = calculatedFreq;
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
