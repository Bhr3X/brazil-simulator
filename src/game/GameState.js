import { getLanguage, getLocalizedDefeat } from './i18n.js';

export class GameState {
  constructor(classConfig, rng, seed = null) {
    this.rng = rng;
    this.seed = seed;
    this.classId = classConfig.id;
    this.className = classConfig.title;
    this.badge = classConfig.badge;
    this.dailyObjective = classConfig.dailyObjective;

    // Currency in integer centavos (1 Real = 100 centavos)
    this.grana = classConfig.grana;
    this.debt = 0; // Fiado / Dívida acumulada
    this.bankruptTimer = 0; // Tempo acumulado com saldo negativo (Falência se >= 90s)

    // Stats clamped 0..100 strictly integers
    this.fome = Math.round(classConfig.fome);
    this.sanidade = Math.round(classConfig.sanidade);
    this.perigo = Math.round(classConfig.perigo);
    this.ginga = Math.round(classConfig.ginga);

    // Passive decay rates per sim-hour and fractional accumulators
    this.decay = classConfig.decay;
    this._fomeAcc = 0;
    this._sanidadeAcc = 0;

    // Items and narrative flags
    this.inventory = [...classConfig.inventory];
    this.flags = {};

    // Action log for run summary
    this.history = [];
    this.currentHour = 6.0;
    this.currentHourFormatted = '06:00';
    this.elapsedSeconds = 0;

    // Repetitive action tracker for diminishing returns
    this.actionTracker = new Map();
    this.lastDiminishing = null;

    // Change listener
    this.listeners = [];
  }

  // Diminishing returns calculation for repetitive actions
  getActionDiminishing(reason) {
    if (!reason) {
      return { mult: 1.0, reps: 1, isDiminished: false, isExhausted: false };
    }
    const key = reason.trim().toLowerCase();
    const now = typeof this.elapsedSeconds === 'number' && this.elapsedSeconds > 0
      ? this.elapsedSeconds
      : (Date.now() / 1000);

    let record = this.actionTracker.get(key);
    if (!record) {
      record = { count: 0, lastTime: now };
      this.actionTracker.set(key, record);
    }

    // Natural recovery over time: 1 repetition level recovered every 18 seconds of rest
    const dt = Math.max(0, now - record.lastTime);
    const recovered = Math.floor(dt / 18.0);
    if (recovered > 0) {
      record.count = Math.max(0, record.count - recovered);
    }

    record.count += 1;
    record.lastTime = now;

    const reps = record.count;
    let mult = 1.0;
    if (reps === 1) {
      mult = 1.0;
    } else if (reps === 2) {
      mult = 0.50;
    } else if (reps === 3) {
      mult = 0.25;
    } else if (reps === 4) {
      mult = 0.10;
    } else {
      mult = 0.0;
    }

    return {
      key,
      mult,
      reps,
      isDiminished: reps > 1,
      isExhausted: mult === 0
    };
  }

  hasItem(id) {
    return this.inventory.some(item => item.id === id);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  // Format centavos to Brazilian Reais (e.g. R$ 14,50 in PT, R$14.00 in EN)
  static formatBRL(centavos) {
    const val = (centavos || 0) / 100;
    const lang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
    const locale = lang === 'en' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  }

  get formattedGrana() {
    return GameState.formatBRL(this.grana);
  }

  get formattedDebt() {
    return GameState.formatBRL(this.debt);
  }

  // Check if player can afford a cost in centavos
  canAfford(centavos) {
    return this.grana >= centavos;
  }

  // Atomic state mutation with diminishing returns on repetition
  apply(deltas = {}, reason = '', isDecay = false) {
    const appliedDeltas = { ...deltas };

    // Diminishing returns on repetitive non-decay actions
    let diminishing = { mult: 1.0, reps: 1, isDiminished: false, isExhausted: false };
    if (!isDecay && reason && reason !== 'Desgaste biológico/urbano contínuo') {
      diminishing = this.getActionDiminishing(reason);
      const mult = diminishing.mult;

      // Scale beneficial deltas
      if (typeof appliedDeltas.sanidade === 'number' && appliedDeltas.sanidade > 0) {
        appliedDeltas.sanidade = Math.round(appliedDeltas.sanidade * mult);
      }
      if (typeof appliedDeltas.fome === 'number' && appliedDeltas.fome > 0) {
        appliedDeltas.fome = Math.round(appliedDeltas.fome * mult);
      }
      if (typeof appliedDeltas.perigo === 'number' && appliedDeltas.perigo < 0) {
        appliedDeltas.perigo = Math.round(appliedDeltas.perigo * mult);
      }
      if (typeof appliedDeltas.grana === 'number' && appliedDeltas.grana > 0) {
        appliedDeltas.grana = Math.round(appliedDeltas.grana * mult);
      }
      if (typeof appliedDeltas.ginga === 'number' && appliedDeltas.ginga > 0) {
        appliedDeltas.ginga = Math.round(appliedDeltas.ginga * mult);
      }
    }
    this.lastDiminishing = diminishing;

    const oldState = {
      grana: this.grana,
      debt: this.debt,
      fome: this.fome,
      sanidade: this.sanidade,
      perigo: this.perigo,
      ginga: this.ginga
    };

    if (typeof appliedDeltas.grana === 'number') {
      if (appliedDeltas.allowDebt && this.grana + appliedDeltas.grana < 0) {
        const remainingCost = -(this.grana + appliedDeltas.grana);
        this.debt += remainingCost;
        this.grana = 0;
      } else if (appliedDeltas.allowNegative) {
        this.grana = Math.round(this.grana + appliedDeltas.grana);
      } else {
        this.grana = Math.max(0, Math.round(this.grana + appliedDeltas.grana));
      }
    }

    if (typeof appliedDeltas.debt === 'number') {
      this.debt = Math.max(0, Math.round(this.debt + appliedDeltas.debt));
    }

    if (typeof appliedDeltas.fome === 'number') {
      this.fome = Math.max(0, Math.min(100, Math.round(this.fome + appliedDeltas.fome)));
    }

    if (typeof appliedDeltas.sanidade === 'number') {
      this.sanidade = Math.max(0, Math.min(100, Math.round(this.sanidade + appliedDeltas.sanidade)));
    }

    if (typeof appliedDeltas.perigo === 'number') {
      this.perigo = Math.max(0, Math.min(100, Math.round(this.perigo + appliedDeltas.perigo)));
    }

    if (typeof appliedDeltas.ginga === 'number') {
      this.ginga = Math.max(0, Math.min(100, Math.round(this.ginga + appliedDeltas.ginga)));
    }

    if (appliedDeltas.addInventory) {
      this.inventory.push(appliedDeltas.addInventory);
    }

    if (appliedDeltas.removeInventoryId) {
      this.inventory = this.inventory.filter(item => item.id !== appliedDeltas.removeInventoryId);
    }

    if (appliedDeltas.setFlags || appliedDeltas.flags) {
      Object.assign(this.flags, appliedDeltas.setFlags || appliedDeltas.flags);
    }

    if (reason) {
      this.history.push({
        time: this.currentHourFormatted || '06:00',
        hour: this.currentHourFormatted || '06:00',
        reason,
        desc: reason,
        isDecay: Boolean(isDecay || appliedDeltas.isDecay),
        deltas: appliedDeltas,
        diminishing: diminishing.isDiminished ? diminishing : null,
        diff: {
          grana: this.grana - oldState.grana,
          fome: this.fome - oldState.fome,
          sanidade: this.sanidade - oldState.sanidade,
          perigo: this.perigo - oldState.perigo
        }
      });
    }

    this.notify();
    return this;
  }

  // Passive decay over time: accumulates float fractions and applies strict integer deltas via apply()
  applyPassiveDecay(deltaHours) {
    const fomeDelta = -this.decay.fomePerHour * deltaHours;
    const sanidadeDelta = -this.decay.sanidadePerHour * deltaHours;

    this._fomeAcc += fomeDelta;
    this._sanidadeAcc += sanidadeDelta;

    let fomePoints = 0;
    if (Math.abs(this._fomeAcc) >= 1.0) {
      fomePoints = Math.trunc(this._fomeAcc);
      this._fomeAcc -= fomePoints;
    }

    let sanidadePoints = 0;
    if (Math.abs(this._sanidadeAcc) >= 1.0) {
      sanidadePoints = Math.trunc(this._sanidadeAcc);
      this._sanidadeAcc -= sanidadePoints;
    }

    if (fomePoints !== 0 || sanidadePoints !== 0) {
      this.apply({
        fome: fomePoints,
        sanidade: sanidadePoints,
        isDecay: true
      }, 'Desgaste biológico/urbano contínuo', true);
    }
  }

  // Check Game Over conditions
  checkDefeat() {
    if (this.fome <= 0) {
      const def = typeof getLocalizedDefeat === 'function' ? getLocalizedDefeat('fome') : null;
      return {
        isDead: true,
        cause: def ? def.cause : 'DESMAIO DE FOME',
        desc: def ? def.desc : 'Sua fome zerou e você desmaiou de fraqueza no meio-fio. Uma viatura do SAMU te levou pro Hospital Geral de Vila Penteado.'
      };
    }
    if (this.sanidade <= 0) {
      const def = typeof getLocalizedDefeat === 'function' ? getLocalizedDefeat('sanidade') : null;
      return {
        isDead: true,
        cause: def ? def.cause : 'BURNOUT / SURTO URBANO',
        desc: def ? def.desc : 'Sua sanidade zerou diante do caos de buzinas, boletos e calor. Você surtou, subiu no teto de um ônibus da SPTrans e foi contido.'
      };
    }
    if (this.perigo >= 100) {
      const def = typeof getLocalizedDefeat === 'function' ? getLocalizedDefeat('perigo') : null;
      return {
        isDead: true,
        cause: def ? def.cause : 'XILINDRÓ / COBRANÇA DO AGIOTA',
        desc: def ? def.desc : 'Seu medidor de B.O. chegou a 100%. A ROTA te levou detido pro 87º DP de Pirituba ou o agiota te pegou na esquina.'
      };
    }
    if (this.grana <= -15000) {
      const def = typeof getLocalizedDefeat === 'function' ? getLocalizedDefeat('falencia_limite') : null;
      return {
        isDead: true,
        cause: def ? def.cause : 'FALÊNCIA & EXECUÇÃO DO CPF',
        desc: def ? def.desc : 'Sua conta estourou o limite de cheque especial do Banco Pirituba (-R$ 150,00). O banco bloqueou seus bens e executou seu CPF no Serasa. Você faliu na quebrada!'
      };
    }
    if (this.bankruptTimer >= 90) {
      const def = typeof getLocalizedDefeat === 'function' ? getLocalizedDefeat('falencia_tempo') : null;
      return {
        isDead: true,
        cause: def ? def.cause : 'FALÊNCIA & PRAZO ESGOTADO',
        desc: def ? def.desc : 'Você passou mais de 90 segundos com a conta no vermelho sem quitar a dívida no Banco Pirituba. O oficial de justiça confiscou seus pertences!'
      };
    }
    return null;
  }
}
