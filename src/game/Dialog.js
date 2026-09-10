/**
 * Modal Dialogue System for Brazilian Encounters
 * Invariant I6: With dialog open, player movement, kick, and interact are disabled.
 * Keys [1], [2], [3], [4] select options; [Q] / [Esc] cancels.
 */

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

      if (e.code === 'KeyQ' || e.code === 'Escape') {
        const isOverlayOpen = typeof document !== 'undefined' && (
          (document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden')) ||
          (document.getElementById('visuals-modal') && !document.getElementById('visuals-modal').classList.contains('modal-hidden'))
        );
        if (isOverlayOpen) return;
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

  open(dialogData, onChoice) {
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
        const costTag = opt.costLabel ? `<span class="dialog-cost-tag">${opt.costLabel}</span>` : '';
        btn.innerHTML = `${keyBadge} <span class="dialog-option-label">${opt.label}</span> ${costTag}`;

        btn.addEventListener('click', () => this.selectOption(idx));
        this.optionsElem.appendChild(btn);
      });
    }

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
