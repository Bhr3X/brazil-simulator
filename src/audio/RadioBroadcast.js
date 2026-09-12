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

export const CANONICAL_TRACK_ORDER = [
  'rap_sp',                // 0: CLASSE_DE (Muleke de Quebrada) starting track: Rap Boom Bap
  'pagode_romantico',      // 1: CLASSE_C (Trabalhador CLT) starting track: Pagode Romântico
  'bossa_mpb',             // 2: CLASSE_AB (Faria Lima) starting track: Bossa Nova MPB
  'sertanejo_sofrencia',   // 3: Sertanejo Sofrência
  'forro_xote',            // 4: Forró Pé de Serra
  'samba_raiz',            // 5: Samba de Raiz
  'axe_micareta',          // 6: Axé Micareta
  'funk_bonde',            // 7: Funk Bonde do Tigrão
  'brega_romantico',       // 8: Brega Romântico
  'manguebeat',            // 9: Manguebeat Maracatu
  'rock_80s',              // 10: Rock Nacional 80s
  'choro',                 // 11: Chorinho Tradicional
  'samba_carnaval'         // 12: Samba Enredo Carnaval
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
    this.currentStreamIndex = 0;
    this.vinhetaIndex = 0;
    this.songsPlayedInBlock = 0;
    this.songsPerNewsBlock = 1; // Intermission (vinheta + news & banter) after each song
    this.isBroadcastingNews = false;
    this.pendingEndedCallback = null;
    this.playbackGeneration = 0;
    this.sessionGeneration = 0;

    this.audioElement.addEventListener('ended', () => this.handleAudioEnded());

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[RadioBroadcast] Track load error, using procedural fallback:', e);
      if (this.fallback && !this.isBroadcastingNews) this.fallback.start();
      this.handleAudioEnded();
    });
  }

  start() {
    this.isPlaying = true;
    if (!this.currentTrack) {
      this.playNextProgramItem();
    }
  }

  stop() {
    this.isPlaying = false;
    this.pendingEndedCallback = null;
    this.playbackGeneration++;
    this.sessionGeneration++;
    if (this.newsDesk && this.newsDesk.stop) {
      this.newsDesk.stop();
    }
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
    this.sessionGeneration++;
    if (this.newsDesk && this.newsDesk.stop) {
      this.newsDesk.stop();
    }
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

    // Update spatial mode: in AUTO mode, use 3D city projection nodes; in manual dials, use personal radio
    if (this.spatial) {
      this.spatial.setPersonalRadio(stationId !== 'AUTO' && stationId !== 'OFF');
    }

    this.songsPlayedInBlock = 0;
    this.songsPerNewsBlock = 1;

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

  playClassMusic(genre, preferredTrackId = null) {
    if (['MPB', 'PAGODE', 'FUNK'].includes(genre)) {
      this.effectiveGenre = genre;
      this.cachedAutoGenre = genre;
      let trackIndex = -1;
      if (preferredTrackId) {
        trackIndex = CANONICAL_TRACK_ORDER.indexOf(preferredTrackId);
      }
      if (trackIndex === -1) {
        trackIndex = CANONICAL_TRACK_ORDER.findIndex(id => {
          const t = TRACKS_CATALOGUE.find(item => item.id === id);
          return t && t.genre === genre;
        });
      }
      if (trackIndex !== -1) {
        this.currentStreamIndex = trackIndex;
      }
      const classTrack = TRACKS_CATALOGUE.find(t => t.id === CANONICAL_TRACK_ORDER[this.currentStreamIndex]);
      if (classTrack) {
        this.currentTrack = classTrack;
        this.isPlaying = true;
        this.isBroadcastingNews = false;
        // Make sure after this first music, an intermission (news & banter) is guaranteed to play!
        this.songsPlayedInBlock = 0;
        this.songsPerNewsBlock = 1;
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
    if (this.isBroadcastingNews) return;
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

  // Intermission: Vinheta -> News & Weather -> Next Song
  startRadioIntermission() {
    if (this.isBroadcastingNews) return;
    this.isBroadcastingNews = true;

    // Full volume for radio vinheta and speech
    if (this.duckingGain && this.ctx) {
      this.duckingGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.1);
    }

    // 1. Play Station Vinheta
    const sessionGen = this.sessionGeneration;
    const vinheta = VINHETAS_CATALOGUE[this.vinhetaIndex % VINHETAS_CATALOGUE.length];
    this.vinhetaIndex++;
    this.playAudioFile(vinheta.src, () => {
      if (this.sessionGeneration !== sessionGen || !this.isPlaying || this.activeStation === 'OFF') {
        this.isBroadcastingNews = false;
        return;
      }
      const finishIntermission = () => {
        if (this.sessionGeneration !== sessionGen || !this.isPlaying || this.activeStation === 'OFF') {
          this.isBroadcastingNews = false;
          return;
        }
        if (this.duckingGain && this.ctx) {
          this.duckingGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.2);
        }
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
    if (!this.isPlaying || this.activeStation === 'OFF' || this.isBroadcastingNews) return;

    if (this.activeStation === 'AUTO' || !this.activeStation) {
      // Advance cyclically in canonical rolling stream
      this.currentStreamIndex = (this.currentStreamIndex + 1) % CANONICAL_TRACK_ORDER.length;
      const nextId = CANONICAL_TRACK_ORDER[this.currentStreamIndex];
      const pick = TRACKS_CATALOGUE.find(tr => tr.id === nextId) || TRACKS_CATALOGUE[0];
      this.currentTrack = pick;
      this.playAudioFile(pick.src);
    } else {
      // Manual dial station (MPB, PAGODE, FUNK): cycle within station's genre
      let pool = TRACKS_CATALOGUE.filter(tr => tr.genre === this.activeStation);
      if (pool.length === 0) pool = TRACKS_CATALOGUE;
      let pick = pool.find(tr => tr.id !== this.currentTrack?.id) || pool[0];
      this.currentTrack = pick;
      const idx = CANONICAL_TRACK_ORDER.indexOf(pick.id);
      if (idx !== -1) this.currentStreamIndex = idx;
      this.playAudioFile(pick.src);
    }
  }

  playAudioFile(src, onEndCallback = null) {
    if (!this.audioElement) return;
    if (this.fallback && typeof this.fallback.stop === 'function') {
      this.fallback.stop();
    }
    this.playbackGeneration++;
    const gen = this.playbackGeneration;
    this.pendingEndedCallback = typeof onEndCallback === 'function'
      ? () => {
          if (this.playbackGeneration !== gen) return;
          onEndCallback();
        }
      : null;
    this.audioElement.pause();
    this.audioElement.src = src;
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('[RadioBroadcast] Autoplay blocked or error:', err);
          // Safety recovery watchdog: if play failed or was blocked, recover after brief delay
          setTimeout(() => {
            if (this.playbackGeneration === gen && this.isPlaying && this.activeStation !== 'OFF') {
              this.handleAudioEnded();
            }
          }, 1200);
        }
      });
    }
  }
}

RadioBroadcast.TRACKS_CATALOGUE = TRACKS_CATALOGUE;
RadioBroadcast.VINHETAS_CATALOGUE = VINHETAS_CATALOGUE;
RadioBroadcast.CANONICAL_TRACK_ORDER = CANONICAL_TRACK_ORDER;
