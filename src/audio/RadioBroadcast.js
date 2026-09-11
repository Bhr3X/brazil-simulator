/**
 * RadioBroadcast.js
 * Comprehensive Brazilian FM Radio Station Engine for Brazil Simulator.
 *
 * Coordinates:
 * - Full 13-track Brazilian music catalogue across all iconic genres
 * - Authentic radio vinhetas (Alfa FM Pirituba, TransMatrix FM, etc.)
 * - Programmed station flow: [1-3 Songs] -> [Vinheta] -> [Breaking News & Weather] -> [Vinheta] -> [Next Song]
 * - Audio ducking during news and vinhetas
 * - Seamless integration with SpatialSoundSystem for city sound box falloff
 */

export const RADIO_STATIONS = {
  AUTO: { id: 'AUTO', name: 'AUTO (ESPACIAL / BAIRRO)', icon: '📻', desc: 'Rádio espacial das caixas de som da cidade' },
  MPB: { id: 'MPB', name: 'MPB / BOSSA PIRITUBA', icon: '☕', desc: 'Tom Gilberto, violão de nylon, choro e rock clássico' },
  PAGODE: { id: 'PAGODE', name: 'PAGODE DO TIÃO', icon: '🍺', desc: 'Rollback do Zé, samba de raiz, forró e modão de boteco' },
  FUNK: { id: 'FUNK', name: 'BAILE DA LAJE 114 BPM', icon: '🔊', desc: 'Bonde do Tigrão, tamborzão 2000s, rap nacional e axé' },
  OFF: { id: 'OFF', name: 'DESLIGADO', icon: '🔇', desc: 'Rádio desligada (apenas sons do ambiente)' }
};

export const TRACKS_CATALOGUE = [
  { id: 'funk_bonde', title: 'Bonde da Simulação', artist: 'Bonde do Tigrão (Matrix Edition)', genre: 'FUNK', src: 'media/audio/tracks/funk_bonde_tigrao.mp3' },
  { id: 'pagode_romantico', title: 'Rollback do Zé', artist: 'Só Pra Contrariar o Bug', genre: 'PAGODE', src: 'media/audio/tracks/pagode_romantico.mp3' },
  { id: 'bossa_mpb', title: 'Bossa na Simulação', artist: 'Tom Gilberto dos Bytes', genre: 'MPB', src: 'media/audio/tracks/bossa_nova_mpb.mp3' },
  { id: 'sertanejo_sofrencia', title: 'Código Binário', artist: 'Zezé di Camargo & o Servidor', genre: 'PAGODE', src: 'media/audio/tracks/sertanejo_sofrencia.mp3' },
  { id: 'forro_xote', title: 'Matrix do Forró', artist: 'Trio Nordestino do Glitch', genre: 'PAGODE', src: 'media/audio/tracks/forro_pe_de_serra.mp3' },
  { id: 'samba_carnaval', title: 'Tigre da Ilusão', artist: 'G.R.E.S. Vai-Vai do Byte', genre: 'PAGODE', src: 'media/audio/tracks/samba_enredo_carnaval.mp3' },
  { id: 'samba_raiz', title: 'Samba do NPC', artist: 'Zeca do Boteco', genre: 'PAGODE', src: 'media/audio/tracks/samba_de_raiz.mp3' },
  { id: 'axe_micareta', title: 'Pula no Glitch', artist: 'Chiclete com Firewall', genre: 'FUNK', src: 'media/audio/tracks/axe_micareta.mp3' },
  { id: 'brega_romantico', title: 'Garçom, Me Reinicia', artist: 'Reginaldo do Cabaré', genre: 'PAGODE', src: 'media/audio/tracks/brega_romantico.mp3' },
  { id: 'rap_sp', title: 'Sobreviver Não É Videogame', artist: 'Racionais do Asfalto', genre: 'FUNK', src: 'media/audio/tracks/rap_nacional_sp.mp3' },
  { id: 'manguebeat', title: 'Da Lama ao Byte', artist: 'Chico Science & Transistor', genre: 'FUNK', src: 'media/audio/tracks/manguebeat_maracatu.mp3' },
  { id: 'rock_80s', title: 'Aperte o Reset', artist: 'Titãs da Central', genre: 'MPB', src: 'media/audio/tracks/rock_nacional_80s.mp3' },
  { id: 'choro', title: 'Doçura do Choro', artist: 'Pixinguinha do Algoritmo', genre: 'MPB', src: 'media/audio/tracks/chorinho_tradicional.mp3' }
];

export const VINHETAS_CATALOGUE = [
  { id: 'alfa_fm', title: 'Alfa FM Pirituba', src: 'media/audio/vinhetas/vinheta_alfa_fm.mp3' },
  { id: 'transmatrix', title: 'TransMatrix FM', src: 'media/audio/vinhetas/vinheta_transmatrix.mp3' }
];

export class RadioBroadcast {
  constructor(ctx, spatialSystem, newsDesk, proceduralFallback) {
    this.ctx = ctx;
    this.spatial = spatialSystem;
    this.newsDesk = newsDesk;
    this.fallback = proceduralFallback;

    this.activeStation = 'AUTO';
    this.effectiveGenre = 'MPB';
    this.isPlaying = false;

    // Radio Audio Element
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    // Connect audioElement through Web Audio API for spatial processing & ducking
    this.sourceNode = null;
    this.duckingGain = this.ctx.createGain();
    this.duckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Connect: duckingGain -> spatial input -> master
    this.duckingGain.connect(this.spatial.inputNode);

    try {
      this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.duckingGain);
    } catch (e) {
      console.warn('[RadioBroadcast] createMediaElementSource error:', e);
    }

    // Program rotation state
    this.currentTrack = null;
    this.songsPlayedInBlock = 0;
    this.songsPerNewsBlock = 2; // News after every 2 songs
    this.isBroadcastingNews = false;
    this.pendingEndedCallback = null;
    this.playbackGeneration = 0;

    this.audioElement.addEventListener('ended', () => this.handleAudioEnded());

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[RadioBroadcast] Track load error, using procedural fallback:', e);
      if (this.fallback) this.fallback.start();
      this.handleAudioEnded();
    });
  }

  start() {
    this.isPlaying = true;
    this.playNextProgramItem();
  }

  stop() {
    this.isPlaying = false;
    this.pendingEndedCallback = null;
    this.playbackGeneration++;
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  setStation(stationId) {
    if (!RADIO_STATIONS[stationId]) return RADIO_STATIONS[this.activeStation];
    this.activeStation = stationId;
    this.pendingEndedCallback = null;
    this.isBroadcastingNews = false;
    this.playbackGeneration++;
    if (this.duckingGain && this.ctx) {
      this.duckingGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.05);
    }

    if (stationId === 'OFF') {
      this.effectiveGenre = 'OFF';
      this.stop();
      if (this.fallback) this.fallback.setStation('OFF');
      return RADIO_STATIONS.OFF;
    }

    if (stationId !== 'AUTO') {
      this.effectiveGenre = stationId;
      if (this.fallback) this.fallback.setStation(stationId);
    } else {
      if (this.effectiveGenre === 'OFF') {
        this.effectiveGenre = this.cachedAutoGenre || 'MPB';
      }
      if (this.fallback) this.fallback.setStation('AUTO');
    }

    // Update spatial mode: AUTO uses city speakers; specific station is direct
    if (this.spatial) {
      this.spatial.setPersonalRadio(stationId !== 'AUTO' && stationId !== 'OFF');
    }

    this.isPlaying = true;
    this.playNextProgramItem();
    return RADIO_STATIONS[stationId];
  }

  cycleStation() {
    const order = ['AUTO', 'MPB', 'PAGODE', 'FUNK', 'OFF'];
    const currentIdx = order.indexOf(this.activeStation);
    const nextIdx = (currentIdx + 1) % order.length;
    const nextStation = order[nextIdx];
    return this.setStation(nextStation);
  }

  playClassMusic(genre) {
    if (['MPB', 'PAGODE', 'FUNK'].includes(genre)) {
      this.effectiveGenre = genre;
      this.cachedAutoGenre = genre;
      const classTrack = TRACKS_CATALOGUE.find(t => t.genre === genre);
      if (classTrack) {
        this.currentTrack = classTrack;
        this.isPlaying = true;
        this.playAudioFile(classTrack.src);
      }
    }
  }

  updateContext(zoneId, inGameHour) {
    let targetGenre = 'MPB';
    if (zoneId === 'BAR_DO_TIAO' || zoneId === 'ADEGA_DO_ZE') {
      targetGenre = 'PAGODE';
    } else if (zoneId === 'BAILE_LAJE') {
      targetGenre = 'FUNK';
    } else {
      if (inGameHour >= 22.5 || inGameHour < 6.0) {
        targetGenre = 'FUNK';
      } else if (inGameHour >= 15.5) {
        targetGenre = 'PAGODE';
      } else {
        targetGenre = 'MPB';
      }
    }

    this.cachedAutoGenre = targetGenre;
    if (this.activeStation !== 'AUTO') return;

    if (targetGenre !== this.effectiveGenre) {
      this.effectiveGenre = targetGenre;
    }
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  onSongEnded() {
    this.songsPlayedInBlock++;
    if (this.songsPlayedInBlock >= this.songsPerNewsBlock) {
      this.songsPlayedInBlock = 0;
      this.startRadioIntermission();
    } else {
      this.playNextSong();
    }
  }

  handleAudioEnded() {
    const cb = this.pendingEndedCallback;
    this.pendingEndedCallback = null;
    if (!this.isPlaying || this.activeStation === 'OFF') return;
    if (cb) {
      cb();
      return;
    }
    this.onSongEnded();
  }

  // Intermission: Vinheta -> News & Weather -> Return Vinheta -> Next Song
  startRadioIntermission() {
    if (this.isBroadcastingNews) return;
    this.isBroadcastingNews = true;

    // Duck volume to 12%
    const t = this.ctx.currentTime;
    this.duckingGain.gain.setTargetAtTime(0.12, t, 0.5);

    // 1. Play Station Vinheta
    const vinheta = VINHETAS_CATALOGUE[Math.floor(Math.random() * VINHETAS_CATALOGUE.length)];
    this.playAudioFile(vinheta.src, () => {
      if (!this.isPlaying || this.activeStation === 'OFF') {
        this.isBroadcastingNews = false;
        return;
      }
      const newsGen = this.playbackGeneration;
      const finishIntermission = () => {
        if (this.playbackGeneration !== newsGen || !this.isPlaying || this.activeStation === 'OFF') {
          this.isBroadcastingNews = false;
          return;
        }
        this.duckingGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.8);
        this.isBroadcastingNews = false;
        this.playNextSong();
      };
      // 2. Broadcast Breaking News with dual journalists & Weather
      if (this.newsDesk && !this.newsDesk.isPlayingNews) {
        this.newsDesk.broadcastBreakingNews(window.__BS_GAME_STATE__ || null, finishIntermission);
      } else {
        finishIntermission();
      }
    });
  }

  playNextProgramItem() {
    this.playNextSong();
  }

  playNextSong() {
    if (!this.isPlaying || this.activeStation === 'OFF') return;

    let pool = TRACKS_CATALOGUE;
    if (this.activeStation !== 'AUTO' && this.activeStation !== 'TODAS') {
      pool = TRACKS_CATALOGUE.filter(tr => tr.genre === this.activeStation);
      if (pool.length === 0) pool = TRACKS_CATALOGUE;
    } else if (this.activeStation === 'AUTO') {
      // Pick based on zone / time-of-day genre
      const matching = TRACKS_CATALOGUE.filter(tr => tr.genre === this.effectiveGenre);
      if (matching.length > 0) pool = matching;
    }

    // Pick a random track (avoid repeating immediate last track)
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && this.currentTrack && pick.id === this.currentTrack.id) {
      pick = pool.find(tr => tr.id !== this.currentTrack.id) || pick;
    }

    this.currentTrack = pick;
    this.playAudioFile(pick.src);
  }

  playAudioFile(src, onEndCallback = null) {
    if (!this.audioElement) return;
    this.playbackGeneration++;
    const gen = this.playbackGeneration;
    this.pendingEndedCallback = typeof onEndCallback === 'function'
      ? () => {
          if (this.playbackGeneration !== gen) return;
          onEndCallback();
        }
      : null;
    this.audioElement.src = src;
    this.audioElement.play().catch(err => {
      console.warn('[RadioBroadcast] Autoplay blocked or error:', err);
    });
  }
}

RadioBroadcast.TRACKS_CATALOGUE = TRACKS_CATALOGUE;
RadioBroadcast.VINHETAS_CATALOGUE = VINHETAS_CATALOGUE;
