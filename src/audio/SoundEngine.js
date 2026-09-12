import { BrazilianMusicEngine } from './BrazilianMusic.js';
import { SpatialSoundSystem } from './SpatialSoundSystem.js';
import { NewsDesk } from './NewsDesk.js';
import { RadioBroadcast, RADIO_STATIONS } from './RadioBroadcast.js';

export { RADIO_STATIONS };

/**
 * Procedural Web Audio Engine & Spatial Radio Broadcasting
 * Coordinates 13-track authentic Brazilian radio, 3D sound boxes with distance muffling,
 * live breaking news desk with dual journalists, and procedural environmental effects.
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.musicEngine = null;
    this.spatialSystem = null;
    this.newsDesk = null;
    this.radioBroadcast = null;

    this.isDay = true;
    this.isRaining = false;
  }

  // Initialize Web Audio context upon user interaction (browser policy)
  init() {
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient channel
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // 1. Spatial Sound System (3D positional emitters in Bar do Tião, Adega, Laje, etc.)
      this.spatialSystem = new SpatialSoundSystem(this.ctx, this.masterGain);

      // 2. Satirical Breaking News Desk with Cadu & Marcão
      this.newsDesk = new NewsDesk(this);

      // 3. Procedural synthesis engine (offline/fallback)
      this.musicEngine = new BrazilianMusicEngine(this.ctx, this.spatialSystem.inputNode);

      // 4. Radio Broadcast Engine (13 recorded Brazilian tracks, vinhetas, ducking, weather triggers)
      this.radioBroadcast = new RadioBroadcast(this.ctx, this.spatialSystem, this.newsDesk, this.musicEngine);

      this.isInitialized = true;
      this.startAmbience();

      // Auto-resume AudioContext and active radio stream on tab focus / visibility
      if (typeof document !== 'undefined') {
        const resumeAudioIfActive = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          if (this.radioBroadcast && this.radioBroadcast.isPlaying && this.radioBroadcast.activeStation !== 'OFF') {
            if (this.radioBroadcast.audioElement && this.radioBroadcast.audioElement.paused && !this.radioBroadcast.isBroadcastingNews) {
              this.radioBroadcast.audioElement.play().catch(() => {});
            }
          }
        };
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) resumeAudioIfActive();
        });
        window.addEventListener('focus', resumeAudioIfActive);
      }
    } catch (e) {
      console.warn('Web Audio could not be initialized:', e);
    }
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      return false;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    }
    if (this.radioBroadcast && this.radioBroadcast.audioElement) {
      this.radioBroadcast.audioElement.muted = this.isMuted;
    }
    if (!this.isMuted && this.isRaining) {
      this.playRain(true);
    }
    return this.isMuted;
  }

  playClassMusic(genre, preferredTrackId = null) {
    if (!this.isInitialized) this.init();
    if (this.musicEngine) {
      this.musicEngine.stop();
    }
    if (this.radioBroadcast) {
      this.radioBroadcast.playClassMusic(genre, preferredTrackId);
    }
  }

  // Radio Station Controls (MPB, Pagode, Baile Funk, Auto, Off)
  setRadioStation(stationId) {
    if (!this.isInitialized) this.init();
    if (this.musicEngine) {
      this.musicEngine.stop();
    }
    if (this.radioBroadcast) {
      this.radioBroadcast.setStation(stationId);
    }
  }

  cycleRadioStation() {
    if (!this.isInitialized) this.init();
    if (this.musicEngine) {
      this.musicEngine.stop();
    }
    if (this.radioBroadcast) {
      const st = this.radioBroadcast.cycleStation();
      this.playRadioTuningGlitch();
      return st;
    }
    return RADIO_STATIONS.AUTO;
  }

  updateMusicContext(zoneId, inGameHour) {
    if (this.radioBroadcast) {
      this.radioBroadcast.updateContext(zoneId, inGameHour);
    }
    if (this.musicEngine && (!this.radioBroadcast || !this.radioBroadcast.isPlaying)) {
      this.musicEngine.updateContext(zoneId, inGameHour);
    }
  }

  updateSpatial(playerPos, dangerLevel = 0, delta = 0.016) {
    if (this.spatialSystem) {
      this.spatialSystem.update(playerPos, dangerLevel);
    }
    if (this.radioBroadcast && typeof this.radioBroadcast.update === 'function') {
      this.radioBroadcast.update(delta);
    }
  }

  getRadioStation() {
    return this.radioBroadcast?.activeStation || 'AUTO';
  }

  getEffectiveGenre() {
    return this.radioBroadcast?.effectiveGenre || 'MPB';
  }

  // Radio analog tuning static sound when cycling stations
  playRadioTuningGlitch() {
    if (!this.ctx || this.isMuted) return;
    try {
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    } catch (e) {}
  }

  // Walkie-talkie / radio microphone click
  playRadioClick() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Dual-tone classic elevator arrival chime
  playElevatorChime() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t); // E5
      osc2.frequency.setValueAtTime(880.0, t + 0.16); // A5
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);
      osc1.start(t);
      osc1.stop(t + 0.35);
      osc2.start(t + 0.16);
      osc2.stop(t + 1.2);
    } catch (e) {}
  }

  // 1. Procedural Footstep (surface aware)
  playFootstep(surface = 'concrete') {
    if (!this.isInitialized || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (surface === 'metal') {
      // Metallic ringing clink on escadão/corrimão
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, t);
      filter.Q.setValueAtTime(4.0, t);
    } else {
      // Concrete / Asphalt thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.07);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, t);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // 2. Flashlight Toggle Click
  playClick() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 3. Ambient Background generator (wind + cicadas / crickets)
  startAmbience() {
    // Generate pinkish noise buffer for gentle suburban wind
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    whiteNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.ambientGain);

    whiteNoise.start();

    // Periodic cicada / cricket chirp routine
    setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      if (Math.random() < 0.6) {
        this.playInsectChirp();
      }
    }, 1800);
  }

  // Chirps for cicadas (day) or night crickets
  playInsectChirp() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = this.isDay ? 3800 : 4600;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);

    // Rapid amplitude modulation
    gain.gain.setValueAtTime(0.015, t);
    for (let i = 0; i < 4; i++) {
      gain.gain.setValueAtTime(0.035, t + i * 0.04);
      gain.gain.setValueAtTime(0.005, t + i * 0.04 + 0.02);
    }
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 4. Motorcycle Rev / "Grau" exhaust sound
  playMotorcycleRev() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.7);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.Q.setValueAtTime(2.0, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  // 6. Coin Cash Register Clink (Pagamento / Grana)
  playCoin() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;

    [1180, 1580].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.2, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.32);
    });
  }

  // 7. Snooker Ball Impact Click (Tacada na Sinuca do Tião)
  playSnookerHit() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.04);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // 8. Beer Can Pop & Hiss (Cerveja no Boteco / Adega)
  playCanOpen() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Pop click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);

    // Fizz hiss
    const bufSize = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.12, t + 0.03);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'highpass';
    nFilter.frequency.setValueAtTime(2500, t);
    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t + 0.03);
  }

  // 9. Soccer Ball Kick Hollow Thud (Chute na Bola Dente-de-Leite)
  playKickBall() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playKick() {
    this.playKickBall();
  }

  // 10. Distant Police Siren (Viatura da PM / B.O. Alto)
  playSiren() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.linearRampToValueAtTime(950, t + 0.4);
    osc.frequency.linearRampToValueAtTime(650, t + 0.8);
    osc.frequency.linearRampToValueAtTime(950, t + 1.2);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.6);
  }

  // 11. Bite / Snack Crunch (Pão na chapa / Pastel)
  playBite() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 11b. Gulp / Drinking Sound (Caldo de cana / Litrão / Copão de Whisky)
  playGulp() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // 12. End-of-Run Fanfare (Vitória ou Derrota)
  playFanfare(won = true) {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = won ? [440, 554, 659, 880] : [330, 311, 293, 220]; // Major arpeggio vs sad descending

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = won ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.15);

      gain.gain.setValueAtTime(won ? 0.22 : 0.16, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.4);
    });
  }

  // 13. Procedural São Paulo Summer Rain Loop
  playRain(enable) {
    this.isRaining = !!enable;
    if (!enable) {
      if (this.rainGain && this.rainSource && this.ctx) {
        try {
          const t = this.ctx.currentTime;
          const currentVal = this.rainGain.gain.value;
          this.rainGain.gain.cancelScheduledValues(t);
          this.rainGain.gain.setValueAtTime(currentVal, t);
          this.rainGain.gain.linearRampToValueAtTime(0.001, t + 0.8);
          const oldSrc = this.rainSource;
          setTimeout(() => {
            try { oldSrc.stop(); oldSrc.disconnect(); } catch (e) {}
          }, 850);
        } catch (e) {}
        this.rainSource = null;
        this.rainGain = null;
      }
      return;
    }

    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.rainSource) return;
    const bufSize = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = buf;
    this.rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, t);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.001, t);
    this.rainGain.gain.linearRampToValueAtTime(0.22, t + 2.0);

    this.rainSource.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    this.rainSource.start(t);
  }

  // 14. Deep Summer Thunder Rumble
  playThunder() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, t);
    filter.frequency.exponentialRampToValueAtTime(45, t + 2.0);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.3);
  }

  // 15. Pastel Oil Frying Sizzle
  playSizzle() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufSize = Math.floor(this.ctx.sampleRate * 0.8);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 16. Brazilian Traffic Horn (Buzinaço)
  playTrafficHonk() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [420, 525].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  // 17. Brazilian Stray Dog Bark (Latido do Cão Caramelo)
  playDogBark() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.16].forEach((delay, idx) => {
      const startT = t + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 320 : 380, startT);
      osc.frequency.exponentialRampToValueAtTime(140, startT + 0.12);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, startT);
      filter.Q.setValueAtTime(3.0, startT);

      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.linearRampToValueAtTime(0.25, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startT);
      osc.stop(startT + 0.15);
    });
  }

  // 18. Bicycle Bell Clink (Triiim da Monark)
  playBikeBell() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.09].forEach((delay) => {
      const startT = t + delay;
      [2093, 3136].forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);

        gain.gain.setValueAtTime(0.15, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startT);
        osc.stop(startT + 0.24);
      });
    });
  }

  setTimeOfDay(isDay) {
    this.isDay = isDay;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(isDay ? 0.32 : 0.18, this.ctx.currentTime);
    }
  }

  // 19. Punch Whoosh (Golpe no ar / Jab / Direto)
  playPunchWhoosh() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.14, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 0.12);
      filter.Q.setValueAtTime(2.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
    } catch (e) {}
  }

  // 20. Punch Hit Impact (Impacto de soco / Porrada)
  playPunchHit() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  // 21. Item Pickup Click (Coleta de objeto no chão)
  playItemPickup() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  // 22. Item Drop Clatter (Descarte de objeto na calçada / asfalto)
  playItemDrop() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) {}
  }

  // 23. Drink Gulp (Gole refrescante de cerveja / água)
  playDrinkGulp() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.22);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  // 24. Food Bite (Mordida crocante de pão na chapa / pastel de feira)
  playFoodBite() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.16, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(800, t + 0.14);
      filter.Q.setValueAtTime(3.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
    } catch (e) {}
  }

  // 25. JBL Soundbox Beat Snippet (Batidão da caixinha portátil)
  playJblSnippet() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // 808 sub kick
      const kick = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(140, t);
      kick.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      kickGain.gain.setValueAtTime(0.4, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      kick.connect(kickGain);
      kickGain.connect(this.masterGain);
      kick.start(t);
      kick.stop(t + 0.25);

      // Clave / Cowbell accent
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'square';
      bell.frequency.setValueAtTime(840, t + 0.08);
      bellGain.gain.setValueAtTime(0.18, t + 0.08);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      bell.connect(bellGain);
      bellGain.connect(this.masterGain);
      bell.start(t + 0.08);
      bell.stop(t + 0.26);
    } catch (e) {}
  }

  // 26. iPhone Alert Tone (Notificação de Faria Limer)
  playPhoneChirp() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [0, 0.09].forEach((delay, idx) => {
        const startT = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 1174.66 : 1567.98, startT); // D6 -> G6
        gain.gain.setValueAtTime(0.2, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startT);
        osc.stop(startT + 0.16);
      });
    } catch (e) {}
  }

  // 27. Wooden Door Creak & Bash Open (Arrombamento de Porta)
  playDoorOpen() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Wooden hinge creak
      const creakOsc = this.ctx.createOscillator();
      const creakGain = this.ctx.createGain();
      const creakFilter = this.ctx.createBiquadFilter();

      creakOsc.type = 'sawtooth';
      creakOsc.frequency.setValueAtTime(140, t);
      creakOsc.frequency.linearRampToValueAtTime(320, t + 0.18);
      creakOsc.frequency.exponentialRampToValueAtTime(90, t + 0.38);

      creakFilter.type = 'bandpass';
      creakFilter.frequency.setValueAtTime(450, t);
      creakFilter.Q.setValueAtTime(4.0, t);

      creakGain.gain.setValueAtTime(0.01, t);
      creakGain.gain.linearRampToValueAtTime(0.35, t + 0.08);
      creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      creakOsc.connect(creakFilter);
      creakFilter.connect(creakGain);
      creakGain.connect(this.masterGain);

      creakOsc.start(t);
      creakOsc.stop(t + 0.45);

      // Wood latch pop / door swing slam
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(80, t + 0.05);
      popOsc.frequency.exponentialRampToValueAtTime(35, t + 0.22);
      popGain.gain.setValueAtTime(0.4, t + 0.05);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain);

      popOsc.start(t + 0.05);
      popOsc.stop(t + 0.26);
    } catch (e) {}
  }

  // 28. Domestic Cat Meow ("Miau!")
  playCatMeow() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.linearRampToValueAtTime(780, t + 0.14);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.45);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) {}
  }

  // 29. Backyard Hen Cluck ("Có-có-có!")
  playChickenCluck() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [0, 0.08, 0.16].forEach((delay, i) => {
        const startT = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420 + i * 40, startT);
        osc.frequency.exponentialRampToValueAtTime(220, startT + 0.06);

        gain.gain.setValueAtTime(0.15, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startT);
        osc.stop(startT + 0.08);
      });
    } catch (e) {}
  }

  // 31. Cartoon Head Bonk on Solid Illusion Wall (Bater a testa no muro de obra)
  playHeadBonk() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Pitch-dropping hollow thud oscillator (Bonk resonance)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.16);

      oscGain.gain.setValueAtTime(0.60, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.20);

      // 2. Forehead impact dull thud transient
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(150, t);
      thud.frequency.exponentialRampToValueAtTime(40, t + 0.09);

      thudGain.gain.setValueAtTime(0.65, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      thud.connect(thudGain);
      thudGain.connect(this.masterGain);
      thud.start(t);
      thud.stop(t + 0.12);

      // 3. Subtle comical high ping ring (slapstick stars effect)
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(780, t + 0.02);
      ping.frequency.exponentialRampToValueAtTime(520, t + 0.25);

      pingGain.gain.setValueAtTime(0.20, t + 0.02);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      ping.connect(pingGain);
      pingGain.connect(this.masterGain);
      ping.start(t + 0.02);
      ping.stop(t + 0.30);
    } catch (e) {}
  }
}

