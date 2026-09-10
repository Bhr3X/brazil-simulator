/**
 * Procedural Web Audio Engine
 * Generates all suburban Brazilian soundscapes, distant beats, footsteps,
 * and ambient effects in real time without external audio files.
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.masterGain = null;
    this.musicGain = null;
    this.ambientGain = null;

    this.isDay = true;
    this.nextBeatTime = 0;
    this.beatIndex = 0;
    this.isPlayingMusic = true;
    this.timerId = null;
    this.isRaining = false;
  }

  // Initialize Web Audio context upon user interaction (browser policy)
  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient channel
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Distant music channel (low-passed to sound muffled through walls/hills)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(320, this.ctx.currentTime); // Muffled laje party
      this.musicFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);
      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.masterGain);

      this.isInitialized = true;
      this.startAmbience();
      this.startMusicLoop();
    } catch (e) {
      console.warn('Web Audio could not be initialized:', e);
    }
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      return false;
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    }
    if (!this.isMuted && this.isRaining) {
      this.playRain(true);
    }
    return this.isMuted;
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

  // 4. Muffled Distant Favela Funk & Pagode Bass Beat
  // Simulates a low-frequency syncopated drum beat echoing softly from a terrace
  startMusicLoop() {
    const stepDuration = 0.22; // ~136 BPM (classic baile funk / pagode tempo)

    const scheduleBeats = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Brazilian syncopated funk beat pattern (16 steps):
      // Kick:   X . . X . X . . X . . X . X . .
      // Snare:  . . X . . . X . . . X . . . X .
      const patternKick = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0];
      const patternSnare = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];

      while (this.nextBeatTime < t + 0.5) {
        const step = this.beatIndex % 16;

        if (patternKick[step] && this.isPlayingMusic && !this.isMuted) {
          this.triggerDistantKick(this.nextBeatTime);
        }
        if (patternSnare[step] && this.isPlayingMusic && !this.isMuted) {
          this.triggerDistantSnare(this.nextBeatTime);
        }

        this.nextBeatTime += stepDuration;
        this.beatIndex++;
      }
    };

    this.nextBeatTime = this.ctx.currentTime + 0.1;
    setInterval(scheduleBeats, 100);
  }

  triggerDistantKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Deep 808 pitch dive
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.15);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  triggerDistantSnare(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  // 5. Motorcycle Rev / "Grau" exhaust sound
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

  setTimeOfDay(isDay) {
    this.isDay = isDay;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(isDay ? 0.32 : 0.18, this.ctx.currentTime);
    }
  }
}

