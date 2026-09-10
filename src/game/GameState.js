/**
 * GameState: Single Source of Truth for Character & Run State
 * Invariant I4: Stats are ints clamped 0..100. Grana is integer centavos.
 * Mutation only occurs via apply(deltas, reason).
 */

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

  // Format centavos to Brazilian Reais (e.g. R$ 14,50)
  static formatBRL(centavos) {
    const val = (centavos || 0) / 100;
    return new Intl.NumberFormat('pt-BR', {
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
  apply(deltas = {}, reason = '') {
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
        time: Date.now(),
        reason,
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
        sanidade: sanidadePoints
      }, 'Desgaste biológico/urbano contínuo');
    }
  }

  // Check Game Over conditions
  checkDefeat() {
    if (this.fome <= 0) {
      return {
        isDead: true,
        cause: 'DESMAIO DE FOME',
        desc: 'Sua fome zerou e você desmaiou de fraqueza no meio-fio. Uma viatura do SAMU te levou pro Hospital Geral de Vila Penteado.'
      };
    }
    if (this.sanidade <= 0) {
      return {
        isDead: true,
        cause: 'BURNOUT / SURTO URBANO',
        desc: 'Sua sanidade zerou diante do caos de buzinas, boletos e calor. Você surtou, subiu no teto de um ônibus da SPTrans e foi contido.'
      };
    }
    if (this.perigo >= 100) {
      return {
        isDead: true,
        cause: 'XILINDRÓ / COBRANÇA DO AGIOTA',
        desc: 'Seu medidor de B.O. chegou a 100%. A ROTA te levou detido pro 87º DP de Pirituba ou o agiota te pegou na esquina.'
      };
    }
    return null;
  }
}
