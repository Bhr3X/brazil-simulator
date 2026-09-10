/**
 * In-Game Survival HUD Controller
 * Invariant I11: DOM only, pt-BR, R$ formatted via Intl.
 */

import { t, getLanguage } from './i18n.js';

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

    if (this.granaElem) {
      this.granaElem.textContent = state.formattedGrana;
      if (state.grana < 0) {
        this.granaElem.style.color = '#ff3344';
      } else {
        this.granaElem.style.color = '';
      }
    }

    if (this.debtElem) {
      if (state.grana < 0) {
        const remainingSec = Math.max(0, Math.ceil(90 - (state.bankruptTimer || 0)));
        const warnPrefix = t('ui.stat_debt_warning', '⚠️ DÉBITO BANCO: FALÊNCIA EM');
        this.debtElem.textContent = `[${warnPrefix} ${remainingSec}s]`;
        this.debtElem.style.color = '#ff3344';
        this.debtElem.style.display = 'inline';
      } else if (state.debt > 0) {
        const tabPrefix = t('ui.stat_tab', 'Fiado:');
        this.debtElem.textContent = `(${tabPrefix} ${state.formattedDebt})`;
        this.debtElem.style.color = '';
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
    const objPrefix = t('ui.objective_prefix', 'META DO DIA:');
    if (this.objectiveElem) this.objectiveElem.textContent = `${objPrefix} ${state.dailyObjective}`;
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
