/**
 * Modal Dialogue System for Brazilian Encounters
 * Invariant I6: With dialog open, player movement, kick, and interact are disabled.
 * Keys [1], [2], [3], [4] select options; [Q] / [Esc] cancels.
 */

import { getLanguage, getLocalizedEncounter } from './i18n.js';

export class DialogSystem {
  constructor(controls) {
    this.controls = controls;
    this.isOpen = false;
    this.currentEncounter = null;
    this.onChoiceCallback = null;

    this.modalElem = document.getElementById('dialogue-modal');
    this.titleElem = document.getElementById('dialog-title');
    this.textElem = document.getElementById('dialog-text');
    this.optionsElem = document.getElementById('dialog-options');
    this.btnClose = document.getElementById('dialog-btn-close');

    this.initEvents();
  }

  initEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      const isOverlayOpen = typeof document !== 'undefined' && (
        (document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('visuals-modal') && !document.getElementById('visuals-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('roulette-modal') && !document.getElementById('roulette-modal').classList.contains('modal-hidden')) ||
        (document.getElementById('end-run-modal') && !document.getElementById('end-run-modal').classList.contains('modal-hidden'))
      );
      if (isOverlayOpen) return;

      if (e.code === 'KeyQ' || e.code === 'Escape') {
        this.close();
      } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
        this.selectOption(0);
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        this.selectOption(1);
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        this.selectOption(2);
      } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
        this.selectOption(3);
      }
    });
  }

  localizeData(dialogData) {
    if (typeof getLanguage !== 'function' || getLanguage() !== 'en' || !dialogData) return dialogData;
    const encId = dialogData.encounterId || dialogData.id;
    if (!encId) return dialogData;

    const loc = getLocalizedEncounter(encId, 'en');
    if (!loc) return dialogData;

    const st = dialogData._state || (typeof window !== 'undefined' && window.app?.game?.state ? window.app.game.state : {});

    const locOptions = (dialogData.options || []).map(opt => {
      const optTrans = loc.options && loc.options[opt.id];
      if (!optTrans) return opt;
      const newLabel = typeof optTrans.label === 'function' ? optTrans.label(st) : optTrans.label;
      const newCostLabel = typeof optTrans.costLabel === 'function' ? optTrans.costLabel(st) : (optTrans.costLabel || opt.costLabel);

      return {
        ...opt,
        label: newLabel || opt.label,
        costLabel: newCostLabel || opt.costLabel,
        execute: (state, sound) => {
          const ptResult = opt.execute(state, sound);
          if (optTrans.outcome) {
            if (typeof optTrans.outcome === 'function') {
              return optTrans.outcome(state, ptResult || '');
            }
            return optTrans.outcome;
          }
          return ptResult;
        }
      };
    });

    const newIntro = typeof loc.intro === 'function' ? loc.intro(st) : (loc.intro || dialogData.text);

    return {
      ...dialogData,
      title: loc.title || dialogData.title,
      text: newIntro || dialogData.text,
      options: locOptions
    };
  }

  open(rawDialogData, onChoice) {
    const dialogData = this.localizeData(rawDialogData);
    this.isOpen = true;
    this.currentEncounter = dialogData;
    this.onChoiceCallback = onChoice;

    if (this.modalElem) {
      this.modalElem.classList.remove('modal-hidden');
    }

    // Freeze player input and release pointer lock
    if (this.controls) {
      this.controls.isLocked = false;
      if (this.controls.refreshFreeze) {
        this.controls.refreshFreeze();
      } else {
        this.controls.freeze = true;
      }
    }
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }

    if (this.titleElem) this.titleElem.textContent = dialogData.title || 'ENCONTRO BRASILEIRO';
    if (this.textElem) this.textElem.innerHTML = dialogData.text || '';

    // Render options
    if (this.optionsElem) {
      this.optionsElem.innerHTML = '';
      (dialogData.options || []).forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'dialog-option-btn';
        if (opt.disabled) {
          btn.classList.add('disabled');
          btn.disabled = true;
        }

        const keyBadge = `<span class="dialog-key-badge">[${idx + 1}]</span>`;
        const visualBadges = this.formatActionBadges(opt);
        btn.innerHTML = `${keyBadge} <span class="dialog-option-label">${opt.label}</span> ${visualBadges}`;

        btn.addEventListener('click', () => this.selectOption(idx));
        this.optionsElem.appendChild(btn);
      });
    }
  }

  // Format visual action badges ($ to $$$$$ green/red and stat chips)
  formatActionBadges(opt) {
    let badgesHtml = '';

    // 1. Determine money delta in centavos
    let granaDelta = 0;
    if (typeof opt.gainCentavos === 'number' && opt.gainCentavos > 0) {
      granaDelta = opt.gainCentavos;
    } else if (typeof opt.costCentavos === 'number' && opt.costCentavos > 0) {
      granaDelta = -opt.costCentavos;
    } else if (opt.deltas && typeof opt.deltas.grana === 'number') {
      granaDelta = opt.deltas.grana;
    } else if (typeof opt.costLabel === 'string' && opt.costLabel.includes('R$')) {
      const match = opt.costLabel.match(/([+-]?)\s*R\$\s*(\d+)(?:[.,](\d{2}))?/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const reais = parseInt(match[2], 10) || 0;
        const centavos = match[3] ? parseInt(match[3], 10) : 0;
        granaDelta = sign * (reais * 100 + centavos);
      }
    }

    if (granaDelta > 0) {
      let pips = '$';
      if (granaDelta <= 500) pips = '$';
      else if (granaDelta <= 1500) pips = '$$';
      else if (granaDelta <= 3500) pips = '$$$';
      else if (granaDelta <= 7500) pips = '$$$$';
      else pips = '$$$$$';

      badgesHtml += `<span class="action-badge badge-gain" title="+R$ ${(granaDelta / 100).toFixed(2)}">💵 ${pips}</span>`;
    } else if (granaDelta < 0) {
      const absVal = Math.abs(granaDelta);
      let pips = '-$';
      if (absVal <= 500) pips = '-$';
      else if (absVal <= 1500) pips = '-$$';
      else if (absVal <= 3500) pips = '-$$$';
      else if (absVal <= 7500) pips = '-$$$$';
      else pips = '-$$$$$';

      badgesHtml += `<span class="action-badge badge-cost" title="-R$ ${(absVal / 100).toFixed(2)}">🔻 ${pips}</span>`;
    }

    // 2. Stat attributes in deltas
    if (opt.deltas) {
      if (typeof opt.deltas.fome === 'number' && opt.deltas.fome !== 0) {
        const sign = opt.deltas.fome > 0 ? '+' : '';
        const cls = opt.deltas.fome > 0 ? 'badge-fome' : 'badge-fome-neg';
        badgesHtml += `<span class="action-badge ${cls}">🍗 ${sign}${opt.deltas.fome}%</span>`;
      }
      if (typeof opt.deltas.sanidade === 'number' && opt.deltas.sanidade !== 0) {
        const sign = opt.deltas.sanidade > 0 ? '+' : '';
        const cls = opt.deltas.sanidade > 0 ? 'badge-sanidade' : 'badge-sanidade-neg';
        badgesHtml += `<span class="action-badge ${cls}">🧠 ${sign}${opt.deltas.sanidade}%</span>`;
      }
      if (typeof opt.deltas.perigo === 'number' && opt.deltas.perigo !== 0) {
        const sign = opt.deltas.perigo > 0 ? '+' : '';
        const cls = opt.deltas.perigo > 0 ? 'badge-perigo' : 'badge-perigo-safe';
        badgesHtml += `<span class="action-badge ${cls}">🚨 ${sign}${opt.deltas.perigo}%</span>`;
      }
      if (typeof opt.deltas.ginga === 'number' && opt.deltas.ginga !== 0) {
        const sign = opt.deltas.ginga > 0 ? '+' : '';
        badgesHtml += `<span class="action-badge badge-ginga">⚡ ${sign}${opt.deltas.ginga}</span>`;
      }
    }

    // 3. Keep narrative tag if no stats or special tag
    if (!badgesHtml && opt.costLabel) {
      badgesHtml += `<span class="dialog-cost-tag">${opt.costLabel}</span>`;
    } else if (opt.costLabel && !opt.costLabel.includes('R$') && !opt.costLabel.includes('%')) {
      badgesHtml += `<span class="dialog-cost-tag dialog-cost-secondary">${opt.costLabel}</span>`;
    }

    return `<div class="dialog-badges-container">${badgesHtml}</div>`;
  }

  selectOption(index) {
    if (!this.isOpen || !this.currentEncounter) return;
    const options = this.currentEncounter.options || [];
    const opt = options[index];
    if (!opt || opt.disabled) return;

    const cb = this.onChoiceCallback;
    this.close();
    if (cb) {
      cb(opt, index);
    }
  }

  close() {
    this.isOpen = false;
    this.currentEncounter = null;
    this.onChoiceCallback = null;

    if (this.modalElem) {
      this.modalElem.classList.add('modal-hidden');
    }

    // Recompute freeze state based on remaining active modals
    if (this.controls) {
      if (this.controls.refreshFreeze) {
        this.controls.refreshFreeze();
      } else {
        this.controls.freeze = false;
      }
    }

    if (this.onClose) {
      this.onClose();
    }
  }
}
