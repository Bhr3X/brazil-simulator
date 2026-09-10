/**
 * In-Game Survival HUD Controller
 * Invariant I11: DOM only, pt-BR, R$ formatted via Intl.
 */

export class HudGame {
  constructor() {
    this.runClockElem = document.getElementById('hud-run-clock');
    this.inGameClockElem = document.getElementById('hud-ingame-clock');
    this.granaElem = document.getElementById('hud-grana');
    this.debtElem = document.getElementById('hud-debt');
    this.fomeElem = document.getElementById('hud-fome-bar');
    this.fomeText = document.getElementById('hud-fome-text');
    this.sanidadeElem = document.getElementById('hud-sanidade-bar');
    this.sanidadeText = document.getElementById('hud-sanidade-text');
    this.perigoElem = document.getElementById('hud-perigo-bar');
    this.perigoText = document.getElementById('hud-perigo-text');
    this.classBadge = document.getElementById('hud-class-badge');
    this.objectiveElem = document.getElementById('hud-objective');
    this.toastContainer = document.getElementById('hud-toast-container');
  }

  update(clock, state) {
    if (this.runClockElem) this.runClockElem.textContent = clock.formatRemaining();
    if (this.inGameClockElem) this.inGameClockElem.textContent = clock.formatInGameTime();

    if (this.granaElem) this.granaElem.textContent = state.formattedGrana;

    if (this.debtElem) {
      if (state.debt > 0) {
        this.debtElem.textContent = `(Fiado: ${state.formattedDebt})`;
        this.debtElem.style.display = 'inline';
      } else {
        this.debtElem.style.display = 'none';
      }
    }

    const fomeInt = Math.round(state.fome);
    const sanidadeInt = Math.round(state.sanidade);
    const perigoInt = Math.round(state.perigo);

    if (this.fomeElem) this.fomeElem.style.width = `${fomeInt}%`;
    if (this.fomeText) this.fomeText.textContent = `${fomeInt}%`;

    if (this.sanidadeElem) this.sanidadeElem.style.width = `${sanidadeInt}%`;
    if (this.sanidadeText) this.sanidadeText.textContent = `${sanidadeInt}%`;

    if (this.perigoElem) this.perigoElem.style.width = `${perigoInt}%`;
    if (this.perigoText) this.perigoText.textContent = `${perigoInt}%`;

    if (this.classBadge) this.classBadge.textContent = state.badge;
    if (this.objectiveElem) this.objectiveElem.textContent = `META DO DIA: ${state.dailyObjective}`;
  }

  showToast(message, duration = 3500) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'hud-toast';
    toast.innerHTML = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
}
