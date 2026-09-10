/**
 * Brazilian Style Procedural Music Engine
 * Generates authentic MPB / Bossa Nova, Pagode Raiz / Samba de Roda,
 * and Baile Funk / Tamborzão Mandelão using the Web Audio API.
 * 100% procedural Web Audio synthesis, zero external audio assets.
 */

export const RADIO_STATIONS = {
  AUTO: { id: 'AUTO', name: 'AUTO (ZONAS & HORAS)', icon: '📻', desc: 'Sintoniza automaticamente conforme o bairro e a hora' },
  MPB: { id: 'MPB', name: 'MPB / BOSSA PIRITUBA', icon: '☕', desc: 'Violão de nylon sincopado e jazz brasileiro' },
  PAGODE: { id: 'PAGODE', name: 'PAGODE DO TIÃO', icon: '🍺', desc: 'Cavaquinho, surdo e pandeiro de boteco' },
  FUNK: { id: 'FUNK', name: 'BAILE DA LAJE 130 BPM', icon: '🔊', desc: 'Tamborzão VoltMix, 808 e Mandelão' },
  OFF: { id: 'OFF', name: 'DESLIGADO', icon: '🔇', desc: 'Música desligada (apenas sons do ambiente)' }
};

export class BrazilianMusicEngine {
  constructor(ctx, destinationNode) {
    this.ctx = ctx;
    this.destination = destinationNode;

    this.activeStation = 'AUTO';
    this.effectiveGenre = 'MPB'; // 'MPB' | 'PAGODE' | 'FUNK' | 'OFF'

    // Master music gain node for crossfades
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    this.musicGain.connect(this.destination);

    // Track-specific gains for smooth crossfades
    this.genreGains = {
      MPB: this.ctx.createGain(),
      PAGODE: this.ctx.createGain(),
      FUNK: this.ctx.createGain()
    };

    // Lowpass warmth filter for natural acoustic resonance
    this.acousticFilter = this.ctx.createBiquadFilter();
    this.acousticFilter.type = 'lowpass';
    this.acousticFilter.frequency.setValueAtTime(3600, this.ctx.currentTime);

    for (const key of ['MPB', 'PAGODE', 'FUNK']) {
      this.genreGains[key].gain.setValueAtTime(key === 'MPB' ? 1.0 : 0.0, this.ctx.currentTime);
      this.genreGains[key].connect(this.acousticFilter);
    }
    this.acousticFilter.connect(this.musicGain);

    // Sequencer state
    this.isPlaying = false;
    this.stepIndex = 0;
    this.nextNoteTime = 0;
    this.timerId = null;

    // Tempos (BPM)
    this.tempos = {
      MPB: 82,      // Relaxed Bossa Nova tempo
      PAGODE: 102,  // Lively Samba/Pagode tempo
      FUNK: 130     // Classic Baile Funk / Tamborzão tempo
    };

    // Shared white noise buffer for shakers, pandeiros, and snares
    this.noiseBuffer = this.createNoiseBuffer(2.0);
  }

  createNoiseBuffer(durationSeconds = 2.0) {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  start() {
    if (this.isPlaying || !this.ctx) return;
    this.isPlaying = true;
    this.stepIndex = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduler = this.scheduler.bind(this);
    this.timerId = setInterval(this.scheduler, 35);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setStation(stationId) {
    if (!RADIO_STATIONS[stationId]) return;
    this.activeStation = stationId;

    if (stationId === 'OFF') {
      this.fadeToGenre('OFF');
    } else if (stationId !== 'AUTO') {
      this.fadeToGenre(stationId);
    }
  }

  cycleStation() {
    const order = ['AUTO', 'MPB', 'PAGODE', 'FUNK', 'OFF'];
    const currentIdx = order.indexOf(this.activeStation);
    const nextIdx = (currentIdx + 1) % order.length;
    const nextStation = order[nextIdx];
    this.setStation(nextStation);
    return RADIO_STATIONS[nextStation];
  }

  updateContext(zoneId, inGameHour) {
    if (this.activeStation !== 'AUTO') return;

    let targetGenre = 'MPB';

    // 1. Zone-specific overrides:
    if (zoneId === 'BAR_DO_TIAO' || zoneId === 'ADEGA_DO_ZE') {
      targetGenre = 'PAGODE';
    } else if (zoneId === 'BAILE_LAJE') {
      targetGenre = 'FUNK';
    } else {
      // 2. Time-of-day dynamic soundtrack:
      // 06:00 - 15:30: MPB / Bossa Nova (Manhã de trampo e feira livre)
      // 15:30 - 22:30: Pagode Raiz (Tarde quente, boteco, sinuca e cerveja gelada)
      // 22:30 - 06:00: Baile Funk da Laje (Madrugada, batidão 130 BPM)
      if (inGameHour >= 22.5 || inGameHour < 6.0) {
        targetGenre = 'FUNK';
      } else if (inGameHour >= 15.5) {
        targetGenre = 'PAGODE';
      } else {
        targetGenre = 'MPB';
      }
    }

    if (targetGenre !== this.effectiveGenre) {
      this.fadeToGenre(targetGenre);
    }
  }

  fadeToGenre(targetGenre) {
    const t = this.ctx.currentTime;
    const fadeDuration = 0.65; // Smooth crossfade

    for (const [genre, gainNode] of Object.entries(this.genreGains)) {
      // Capture current value before canceling scheduled values to maintain continuity on WebKit/Gecko
      const currentVal = gainNode.gain.value;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(currentVal, t);

      if (targetGenre === 'OFF') {
        gainNode.gain.linearRampToValueAtTime(0.0001, t + fadeDuration);
      } else if (genre === targetGenre) {
        gainNode.gain.linearRampToValueAtTime(1.0, t + fadeDuration);
      } else {
        gainNode.gain.linearRampToValueAtTime(0.0001, t + fadeDuration);
      }
    }

    this.effectiveGenre = targetGenre;
  }

  // Lookahead scheduler: schedules note events ahead of time for jitter-free audio
  scheduler() {
    if (!this.ctx || !this.isPlaying) return;
    // Skip scheduling while tab is in background (pausing music in sync with sim clock)
    if (typeof document !== 'undefined' && document.hidden) return;

    // If audio clock has advanced past nextNoteTime (tab throttle/hidden), skip ahead cleanly
    if (this.nextNoteTime < this.ctx.currentTime) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    const lookahead = 0.15; // Schedule 150ms into the future
    const currentBpm = this.tempos[this.effectiveGenre] || 100;
    const stepDuration = 60 / currentBpm / 4; // 16th note step duration

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      const step = this.stepIndex % 16;
      const measure = Math.floor(this.stepIndex / 16) % 4;

      if (this.effectiveGenre === 'MPB') {
        this.playMpbStep(step, measure, this.nextNoteTime);
      } else if (this.effectiveGenre === 'PAGODE') {
        this.playPagodeStep(step, measure, this.nextNoteTime);
      } else if (this.effectiveGenre === 'FUNK') {
        this.playFunkStep(step, measure, this.nextNoteTime);
      }

      this.nextNoteTime += stepDuration;
      this.stepIndex++;
    }
  }

  // =========================================================================
  // 1. MPB / BOSSA NOVA (82 BPM, Dm9 -> G13 -> Cmaj7 -> A7b13)
  // =========================================================================
  playMpbStep(step, measure, time) {
    const dest = this.genreGains.MPB;

    // A. Soft Bossa Shaker (Ganzá) on every 16th note
    const isDownbeat = step % 4 === 0;
    const shakerGain = isDownbeat ? 0.05 : (step % 2 === 0 ? 0.03 : 0.018);
    this.playNoisePercussion(time, 4200, 0.04, shakerGain, dest);

    // B. Acoustic Upright Bass (Baixo Acústico) on root & fifth with bossa syncopation
    // Notes: Dm9 (D2: 73.4), G13 (G2: 98.0), Cmaj7 (C2: 65.4), A7 (A1: 55.0)
    const bassRoots = [73.42, 98.00, 65.41, 55.00];
    const bassFifths = [110.00, 146.83, 98.00, 82.41];
    const rootFreq = bassRoots[measure];
    const fifthFreq = bassFifths[measure];

    if (step === 0) {
      this.playBassNote(time, rootFreq, 0.35, 0.28, dest);
    } else if (step === 6) {
      this.playBassNote(time, fifthFreq, 0.28, 0.22, dest);
    } else if (step === 8) {
      this.playBassNote(time, rootFreq, 0.35, 0.26, dest);
    } else if (step === 14) {
      this.playBassNote(time, fifthFreq, 0.25, 0.20, dest);
    }

    // C. Nylon Guitar (Violão de Nylon) with authentic João Gilberto syncopation
    // Chord voicings:
    const bossaChords = [
      [174.61, 220.00, 261.63, 329.63], // Dm9 (F3, A3, C4, E4)
      [174.61, 246.94, 329.63, 392.00], // G13 (F3, B3, E4, G4)
      [164.81, 196.00, 246.94, 293.66], // Cmaj7 (E3, G3, B3, D4)
      [196.00, 277.18, 349.23, 440.00]  // A7b13 (G3, C#4, F4, A4)
    ];
    // Syncopated comping steps: 0, 3, 6, 10, 12, 14
    const isCompingStep = (step === 0 || step === 3 || step === 6 || step === 10 || step === 12 || step === 14);
    if (isCompingStep) {
      const chord = bossaChords[measure];
      const duration = (step === 6 || step === 14) ? 0.32 : 0.22;
      this.playGuitarChord(time, chord, duration, 0.16, dest);
    }

    // D. Soft Wood Clave / Rimshot on steps 0, 6, 10, 14
    if (step === 0 || step === 6 || step === 10 || step === 14) {
      this.playWoodClave(time, 1400, 0.06, 0.08, dest);
    }
  }

  // =========================================================================
  // 2. PAGODE RAIZ / SAMBA DE RODA (102 BPM, C -> A7 -> Dm7 -> G7)
  // =========================================================================
  playPagodeStep(step, measure, time) {
    const dest = this.genreGains.PAGODE;

    // A. Surdo de Marcação:
    // Beat 1 (step 0): Surdo de Segunda (damped, higher: 95Hz -> 65Hz)
    // Beat 2 (step 8): Surdo de Primeira (open, deep: 75Hz -> 48Hz, louder)
    // Syncopated pickup on step 7
    if (step === 0) {
      this.playSurdo(time, 95, 65, 0.18, 0.32, dest);
    } else if (step === 7) {
      this.playSurdo(time, 105, 75, 0.12, 0.20, dest);
    } else if (step === 8) {
      this.playSurdo(time, 76, 46, 0.34, 0.42, dest);
    } else if (step === 15) {
      this.playSurdo(time, 90, 60, 0.10, 0.18, dest);
    }

    // B. Pandeiro: Slap on beats 2 and 4 (steps 4 and 12) + pratinelas
    if (step === 4 || step === 12) {
      this.playPandeiroSlap(time, 0.28, dest);
    }
    // Continuous pandeiro jingle (pratinelas)
    if (step % 2 === 0) {
      this.playNoisePercussion(time, 5800, 0.03, 0.035, dest);
    }

    // C. Tamborim Telecoteco syncopation: 0, 3, 5, 6, 8, 11, 13, 14
    const tamborimPattern = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0];
    if (tamborimPattern[step]) {
      this.playTamborimTap(time, 0.09, dest);
    }

    // D. Cavaquinho: Strumming with bright syncopated palhetada
    // Chords: C (measure 0), A7 (measure 1), Dm7 (measure 2), G7 (measure 3)
    const cavacoChords = [
      [261.63, 329.63, 392.00, 523.25], // C (C4, E4, G4, C5)
      [277.18, 329.63, 440.00, 554.37], // A7 (C#4, E4, A4, C#5)
      [293.66, 349.23, 440.00, 523.25], // Dm7 (D4, F4, A4, C5)
      [246.94, 293.66, 392.00, 493.88]  // G7 (B3, D4, G4, B4)
    ];
    // Palhetada rhythm: 0, 2, 3, 5, 6, 8, 10, 11, 13, 14
    const cavacoPattern = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0];
    if (cavacoPattern[step]) {
      const chord = cavacoChords[measure];
      const isAccent = (step === 3 || step === 6 || step === 11 || step === 14);
      this.playCavacoStrum(time, chord, 0.10, isAccent ? 0.15 : 0.10, dest);
    }
  }

  // =========================================================================
  // 3. BAILE FUNK / TAMBORZÃO MANDELÃO (130 BPM, VoltMix Tum-Tchá-Tchá)
  // =========================================================================
  playFunkStep(step, measure, time) {
    const dest = this.genreGains.FUNK;

    // A. VoltMix Beat Pattern (16 steps):
    // Kick (Tum):   Step 0, 8, 10
    // Snare (Tchá): Step 3, 6, 12
    if (step === 0 || step === 8 || step === 10) {
      const isDownbeat = step === 0;
      this.playFunkKick(time, isDownbeat ? 135 : 120, 38, isDownbeat ? 0.26 : 0.20, isDownbeat ? 0.45 : 0.38, dest);
    }
    if (step === 3 || step === 6 || step === 12) {
      this.playFunkSnare(time, 0.32, dest);
    }

    // B. Sub-Bass 808 (Grave Furioso) on step 0 and step 8
    if (step === 0 || step === 8) {
      const bassNote = measure === 3 ? 36.71 : (measure === 2 ? 43.65 : 38.89); // Eb1 / F1 / D1
      this.play808Sub(time, bassNote, 0.45, 0.35, dest);
    }

    // C. Hi-Hat / Palminha Sizzle on offbeats (2, 4, 6, 8, 10, 12, 14)
    if (step % 2 === 0) {
      this.playNoisePercussion(time, 6500, 0.025, 0.04, dest);
    }

    // D. Mandelão Horn / Synth Riff (Ostinato)
    // Measure 0 & 1: D4 (step 0), D4 (step 3), F4 (step 6), D4 (step 8), C4 (step 11)
    // Measure 2 & 3: D4 (step 0), F4 (step 3), G4 (step 6), F4 (step 8), E4 (step 10), D4 (step 12)
    const melodyPatternA = { 0: 293.66, 3: 293.66, 6: 349.23, 8: 293.66, 11: 261.63 };
    const melodyPatternB = { 0: 293.66, 3: 349.23, 6: 392.00, 8: 349.23, 10: 329.63, 12: 293.66 };
    const activePattern = measure < 2 ? melodyPatternA : melodyPatternB;

    if (activePattern[step]) {
      this.playFunkSynth(time, activePattern[step], 0.12, 0.16, dest);
    }
  }

  // =========================================================================
  // SYNTHESIS PRIMITIVES (Zero assets, pure Web Audio)
  // =========================================================================

  playBassNote(time, freq, duration, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  playGuitarChord(time, freqs, duration, gainVal, dest) {
    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(gainVal, time);
    chordGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(450, time + duration);

    chordGain.connect(filter);
    filter.connect(dest);

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, time + i * 0.008); // Subtle finger strum arpeggiation
      osc.connect(chordGain);
      osc.start(time + i * 0.008);
      osc.stop(time + duration + 0.05);
    });
  }

  playCavacoStrum(time, freqs, duration, gainVal, dest) {
    const strumGain = this.ctx.createGain();
    strumGain.gain.setValueAtTime(gainVal, time);
    strumGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2200, time);
    bandpass.Q.setValueAtTime(2.2, time);

    strumGain.connect(bandpass);
    bandpass.connect(dest);

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time + idx * 0.005);
      osc.connect(strumGain);
      osc.start(time + idx * 0.005);
      osc.stop(time + duration + 0.02);
    });
  }

  playSurdo(time, startFreq, endFreq, duration, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  playPandeiroSlap(time, gainVal, dest) {
    // Sharp noise snap + ringing pratinelas
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(3.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.08);
  }

  playTamborimTap(time, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(840, time);
    osc.frequency.exponentialRampToValueAtTime(320, time + 0.05);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  playWoodClave(time, freq, duration, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  playNoisePercussion(time, highpassFreq, duration, gainVal, dest) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpassFreq, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + duration + 0.02);
  }

  playFunkKick(time, startFreq, endFreq, duration, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  playFunkSnare(time, gainVal, dest) {
    // Sharp 90s funk snare (tonal body + noise snap)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.08);
    oscGain.gain.setValueAtTime(gainVal * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.1);

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1800, time);
    noiseFilter.Q.setValueAtTime(1.8, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(gainVal, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.13);
  }

  play808Sub(time, freq, duration, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.8, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  playFunkSynth(time, freq, duration, gainVal, dest) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(3.0, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }
}
