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

    // Change listener
    this.listeners = [];
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

  // Atomic state mutation
  apply(deltas = {}, reason = '', isDecay = false) {
    const oldState = {
      grana: this.grana,
      debt: this.debt,
      fome: this.fome,
      sanidade: this.sanidade,
      perigo: this.perigo,
      ginga: this.ginga
    };

    if (typeof deltas.grana === 'number') {
      if (deltas.allowDebt && this.grana + deltas.grana < 0) {
        const remainingCost = -(this.grana + deltas.grana);
        this.debt += remainingCost;
        this.grana = 0;
      } else if (deltas.allowNegative) {
        this.grana = Math.round(this.grana + deltas.grana);
      } else {
        this.grana = Math.max(0, Math.round(this.grana + deltas.grana));
      }
    }

    if (typeof deltas.debt === 'number') {
      this.debt = Math.max(0, Math.round(this.debt + deltas.debt));
    }

    if (typeof deltas.fome === 'number') {
      this.fome = Math.max(0, Math.min(100, Math.round(this.fome + deltas.fome)));
    }

    if (typeof deltas.sanidade === 'number') {
      this.sanidade = Math.max(0, Math.min(100, Math.round(this.sanidade + deltas.sanidade)));
    }

    if (typeof deltas.perigo === 'number') {
      this.perigo = Math.max(0, Math.min(100, Math.round(this.perigo + deltas.perigo)));
    }

    if (typeof deltas.ginga === 'number') {
      this.ginga = Math.max(0, Math.min(100, Math.round(this.ginga + deltas.ginga)));
    }

    if (deltas.addInventory) {
      this.inventory.push(deltas.addInventory);
    }

    if (deltas.removeInventoryId) {
      this.inventory = this.inventory.filter(item => item.id !== deltas.removeInventoryId);
    }

    if (deltas.setFlags || deltas.flags) {
      Object.assign(this.flags, deltas.setFlags || deltas.flags);
    }

    if (reason) {
      this.history.push({
        time: this.currentHourFormatted || '06:00',
        hour: this.currentHourFormatted || '06:00',
        reason,
        desc: reason,
        isDecay: Boolean(isDecay || deltas.isDecay),
        deltas,
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
