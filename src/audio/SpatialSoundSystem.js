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
    z: 42.0,
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
    z: 42.0,
    refDist: 4.0,
    maxDist: 36.0,
    preferredGenre: 'SERTANEJO',
    ambienceFile: 'media/audio/ambience/papo_calcada.mp3'
  },
  {
    id: 'BAILE_LAJE',
    name: 'Baile da Laje (Paredão de Som)',
    x: -15.0,
    y: 7.2,
    z: -78.0,
    refDist: 8.0,
    maxDist: 70.0,
    preferredGenre: 'FUNK',
    ambienceFile: null
  },
  {
    id: 'PADARIA_ESTRELA',
    name: 'Padaria Estrela (Som Ambiente)',
    x: 32.0,
    y: 1.2,
    z: 41.0,
    refDist: 4.0,
    maxDist: 35.0,
    preferredGenre: 'MPB',
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
    this.nearestEmitter = null;
    this.isPersonalRadio = false; // When true (headphones), spatial falloff is bypassed
  }

  // Pre-load ambient audio loops for locations
  initChatterStreams() {
    for (const emitter of this.emitters) {
      if (!emitter.ambienceFile) continue;
      try {
        const audio = new Audio();
        audio.src = emitter.ambienceFile;
        audio.loop = true;
        audio.volume = 0.0;
        audio.preload = 'auto';
        this.chatterAudios.set(emitter.id, {
          audio,
          emitter,
          isPlaying: false
        });
      } catch (e) {
        console.warn('[SpatialSound] Could not init chatter for', emitter.id, e);
      }
    }

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
    this.isPersonalRadio = enabled;
  }

  // Main frame update: calculate distances to all emitters and adjust gain + filter
  update(playerPos, dangerLevel = 0) {
    if (!playerPos || !this.ctx) return;

    // 1. Personal radio (headphone / manual dial override): always full volume
    if (this.isPersonalRadio) {
      const t = this.ctx.currentTime;
      this.spatialGain.gain.setTargetAtTime(1.0, t, 0.2);
      this.spatialFilter.frequency.setTargetAtTime(20000, t, 0.2);
      this.currentAudibleGain = 1.0;
      return;
    }

    // 2. Find closest emitter to player
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
      // Out of range of all emitters: faint background murmur (5% volume, muffled)
      const ambientFloor = 0.06;
      this.spatialGain.gain.setTargetAtTime(ambientFloor, t, 0.35);
      this.spatialFilter.frequency.setTargetAtTime(750, t, 0.35);
      this.currentAudibleGain = ambientFloor;
    } else {
      // Smooth distance attenuation (inverse-power curve)
      const range = closest.maxDist - closest.refDist;
      const distDelta = Math.max(0, minDist - closest.refDist);
      const factor = Math.max(0.0, 1.0 - (distDelta / range));
      // Organic curve: volume swells quickly as you get close
      const calculatedGain = Math.pow(factor, 1.6);
      // Frequency opens up: from 700 Hz (distant muffled thud) up to 20,000 Hz (clear acoustic highs)
      const targetFreq = 700 + 19300 * Math.pow(factor, 2.0);

      this.spatialGain.gain.setTargetAtTime(Math.max(0.05, calculatedGain), t, 0.18);
      this.spatialFilter.frequency.setTargetAtTime(targetFreq, t, 0.18);
      this.currentAudibleGain = calculatedGain;
    }

    // 3. Update spatial chatter loops for local establishments
    for (const [emitterId, item] of this.chatterAudios.entries()) {
      const dist = Math.hypot(playerPos.x - item.emitter.x, playerPos.z - item.emitter.z);
      const maxChatterDist = 28.0; // Audible within 28 meters of boteco/feira
      if (dist < maxChatterDist) {
        const chatterFactor = Math.max(0, 1.0 - (dist / maxChatterDist));
        const chatterVol = Math.pow(chatterFactor, 1.4) * 0.45;
        if (!item.isPlaying) {
          item.audio.play().then(() => { item.isPlaying = true; }).catch(() => {});
        }
        item.audio.volume = chatterVol;
      } else {
        if (item.isPlaying && item.audio.volume > 0.01) {
          item.audio.volume = Math.max(0, item.audio.volume - 0.05);
        } else if (item.isPlaying) {
          item.audio.pause();
          item.isPlaying = false;
        }
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
