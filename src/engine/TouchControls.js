/**
 * TouchControls.js — Mobile Touch Controller for Brazil Simulator // Sobrevivência BR
 * Provides an ergonomic mobile touch interface:
 * - Left Zone: Visible Virtual Thumbstick ("Stick to Walk") with 360° analog control + auto-sprint
 * - Right Zone: Touch Drag-to-Look Camera Orbit (Yaw + Pitch)
 * - Action Buttons: [⚡ INTERAGIR], [🦘 PULAR], [🦵 AGACHA], [👤 1ª/3ª Pessoa], [⚙️ MENU]
 */

export class TouchController {
  constructor(controls, app) {
    this.controls = controls;
    this.app = app;
    this.isEnabled = false;

    // Active touch tracking IDs
    this.moveTouchId = null;
    this.lookTouchId = null;

    // Movement Joystick coordinates
    this.joystickOrigin = { x: 0, y: 0 };
    this.maxRadius = 48; // Max displacement in pixels
    this.isFloating = false;

    // Look Joystick coordinates & state
    this.lookOrigin = { x: 0, y: 0 };
    this.isUsingLookStick = false;
    this.isLookFloating = false;

    // Look tracking
    this.lastLookX = 0;
    this.lastLookY = 0;
    this.lookSensitivity = 0.0036;

    // DOM Elements - Movement Stick (Left)
    this.container = null;
    this.joystickBase = null;
    this.joystickKnob = null;
    this.tickUp = null;
    this.tickDown = null;
    this.tickLeft = null;
    this.tickRight = null;

    // DOM Elements - Look Stick (Right)
    this.lookBase = null;
    this.lookKnob = null;
    this.lookTickUp = null;
    this.lookTickDown = null;
    this.lookTickLeft = null;
    this.lookTickRight = null;

    // Action buttons & menus
    this.btnInteract = null;
    this.btnJump = null;
    this.btnCrouch = null;
    this.btnCam = null;
    this.btnMenu = null;
    this.menuDrawer = null;

    this.init();
  }

  isTouchDevice() {
    return (
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) ||
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 1024px)').matches && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
    );
  }

  init() {
    this.container = document.getElementById('touch-controls-container');
    this.joystickBase = document.getElementById('touch-joystick-base');
    this.joystickKnob = document.getElementById('touch-joystick-knob');
    this.tickUp = document.getElementById('stick-tick-up');
    this.tickDown = document.getElementById('stick-tick-down');
    this.tickLeft = document.getElementById('stick-tick-left');
    this.tickRight = document.getElementById('stick-tick-right');

    this.lookBase = document.getElementById('touch-look-base');
    this.lookKnob = document.getElementById('touch-look-knob');
    this.lookTickUp = document.getElementById('look-tick-up');
    this.lookTickDown = document.getElementById('look-tick-down');
    this.lookTickLeft = document.getElementById('look-tick-left');
    this.lookTickRight = document.getElementById('look-tick-right');

    this.btnInteract = document.getElementById('touch-btn-interact');
    this.btnJump = document.getElementById('touch-btn-jump');
    this.btnCrouch = document.getElementById('touch-btn-crouch');
    this.btnCam = document.getElementById('touch-btn-camera');
    this.btnMenu = document.getElementById('touch-btn-menu');
    this.menuDrawer = document.getElementById('mobile-menu-drawer');

    if (this.isTouchDevice()) {
      this.enable();
    }

    this.bindEvents();
  }

  enable() {
    this.isEnabled = true;
    if (this.container) {
      this.container.classList.remove('touch-hidden');
    }
    if (this.joystickBase) {
      this.joystickBase.style.display = 'block';
    }
    if (this.lookBase) {
      this.lookBase.style.display = 'block';
    }
    if (this.btnMenu) {
      this.btnMenu.classList.remove('touch-hidden');
    }
    document.body.classList.add('mobile-touch-active');
  }

  disable() {
    this.isEnabled = false;
    if (this.container) {
      this.container.classList.add('touch-hidden');
    }
    if (this.joystickBase) {
      this.joystickBase.style.display = 'none';
    }
    if (this.lookBase) {
      this.lookBase.style.display = 'none';
    }
    if (this.btnMenu) {
      this.btnMenu.classList.add('touch-hidden');
    }
    document.body.classList.remove('mobile-touch-active');
    this.resetMove();
    this.resetLook();
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  bindEvents() {
    // 1. Direct Touchstart on Left Movement Joystick Base
    if (this.joystickBase) {
      this.joystickBase.addEventListener('touchstart', (e) => {
        if (!this.isEnabled) this.enable();
        if (this.controls && typeof this.controls.refreshFreeze === 'function') {
          this.controls.refreshFreeze();
        }
        if (this.controls && this.controls.freeze) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (this.moveTouchId === null) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            this.moveTouchId = touch.identifier;
            const anchor = this.getStickAnchorCenter();
            this.joystickOrigin = { x: anchor.x, y: anchor.y };
            this.isFloating = false;
            this.updateStickKnobAndMovement(touch.clientX, touch.clientY);
            break;
          }
        }
      }, { passive: false });
    }

    // 2. Direct Touchstart on Right Look Joystick Base ("Stick to Look")
    if (this.lookBase) {
      this.lookBase.addEventListener('touchstart', (e) => {
        if (!this.isEnabled) this.enable();
        if (this.controls && typeof this.controls.refreshFreeze === 'function') {
          this.controls.refreshFreeze();
        }
        if (this.controls && this.controls.freeze) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (this.lookTouchId === null) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            this.lookTouchId = touch.identifier;
            this.isUsingLookStick = true;
            const anchor = this.getLookAnchorCenter();
            this.lookOrigin = { x: anchor.x, y: anchor.y };
            this.isLookFloating = false;
            this.lastLookX = touch.clientX;
            this.lastLookY = touch.clientY;
            if (this.lookBase) this.lookBase.classList.add('active');
            this.updateLookKnobAndLook(touch.clientX, touch.clientY);
            break;
          }
        }
      }, { passive: false });
    }

    // 2. Fullscreen / Window Touch Routing
    window.addEventListener('touchstart', (e) => {
      // Auto-enable on very first touch gesture if not already active
      if (!this.isEnabled) {
        this.enable();
      }
      this.handleTouchStart(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.moveTouchId !== null || this.lookTouchId !== null) {
        if (e.cancelable) e.preventDefault();
      }
      this.handleTouchMove(e);
    }, { passive: false });

    window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    window.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

    // 2. Action Button Listeners
    if (this.btnJump) {
      const doJump = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.controls && !this.controls.freeze) {
          if (this.controls.canJump) {
            this.controls.velocity.y = this.controls.jumpVelocity;
            this.controls.canJump = false;
            if (this.controls.sound && typeof this.controls.sound.playFootstep === 'function') {
              this.controls.sound.playFootstep('concrete');
            }
          }
        }
      };
      this.btnJump.addEventListener('touchstart', doJump, { passive: false });
      this.btnJump.addEventListener('mousedown', doJump);
    }

    if (this.btnCrouch) {
      const doCrouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.controls && !this.controls.freeze) {
          this.controls.isCrouching = !this.controls.isCrouching;
          this.btnCrouch.classList.toggle('active', this.controls.isCrouching);
        }
      };
      this.btnCrouch.addEventListener('touchstart', doCrouch, { passive: false });
      this.btnCrouch.addEventListener('mousedown', doCrouch);
    }

    if (this.btnInteract) {
      const doInteract = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.app && this.app.game && !this.controls.freeze) {
          this.app.game.handleInteract();
        }
      };
      this.btnInteract.addEventListener('touchstart', doInteract, { passive: false });
      this.btnInteract.addEventListener('mousedown', doInteract);
    }

    if (this.btnCam) {
      const doCam = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.controls) {
          const is3rd = this.controls.togglePerspective();
          if (this.btnCam) {
            this.btnCam.textContent = is3rd ? '👤 3ªP' : '👁️ 1ªP';
          }
        }
      };
      this.btnCam.addEventListener('touchstart', doCam, { passive: false });
      this.btnCam.addEventListener('mousedown', doCam);
    }

    if (this.btnMenu) {
      const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.menuDrawer) {
          this.menuDrawer.classList.toggle('modal-hidden');
          const isOpen = !this.menuDrawer.classList.contains('modal-hidden');
          this.btnMenu.classList.toggle('active', isOpen);
        }
      };
      this.btnMenu.addEventListener('touchstart', toggleMenu, { passive: false });
      this.btnMenu.addEventListener('mousedown', toggleMenu);
    }

    // Close menu drawer button
    const closeDrawerBtn = document.getElementById('btn-close-mobile-menu');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.menuDrawer) {
          this.menuDrawer.classList.add('modal-hidden');
          if (this.btnMenu) this.btnMenu.classList.remove('active');
        }
      });
    }

    // Close drawer when clicking outside
    if (this.menuDrawer) {
      this.menuDrawer.addEventListener('click', (e) => {
        if (e.target === this.menuDrawer) {
          this.menuDrawer.classList.add('modal-hidden');
          if (this.btnMenu) this.btnMenu.classList.remove('active');
        }
      });
    }

    // Mobile Menu Drawer Toggle Touch Controls Button
    const mobileBtnToggleTouch = document.getElementById('mobile-btn-toggle-touch');
    if (mobileBtnToggleTouch) {
      mobileBtnToggleTouch.addEventListener('click', (e) => {
        e.stopPropagation();
        const enabled = this.toggle();
        mobileBtnToggleTouch.textContent = enabled ? '📱 Controles Touch: LIGADO' : '📱 Controles Touch: DESLIGADO';
      });
    }
  }

  isInteractiveElement(target) {
    if (!target) return false;
    return !!target.closest(
      'button, a, input, select, .touch-action-btn, .npc-action-card, #npc-quick-dock, #interact-prompt, #mobile-menu-drawer, #roulette-modal, #dialogue-modal, #street-view-modal, #end-run-modal, #visuals-modal, .hud-btn, .interactive-touch, [role="button"]'
    );
  }

  getStickAnchorCenter() {
    if (!this.joystickBase) return { x: 80, y: window.innerHeight - 80 };
    const rect = this.joystickBase.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  getLookAnchorCenter() {
    if (!this.lookBase) return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    const rect = this.lookBase.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  handleTouchStart(e) {
    if (!this.isEnabled) return;
    if (this.controls && typeof this.controls.refreshFreeze === 'function') {
      this.controls.refreshFreeze();
    }
    if (this.controls && this.controls.freeze) return;

    const screenWidth = window.innerWidth;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = touch.target;

      // Ignore touches on HUD buttons, active modals or action buttons
      if (this.isInteractiveElement(target)) continue;

      const isLeftZone = touch.clientX < screenWidth * 0.48;

      if (isLeftZone) {
        // Left Zone: Movement Thumbstick (Walk / Run) — 100% independent of look
        if (this.moveTouchId === null) {
          if (e.cancelable) e.preventDefault();
          this.moveTouchId = touch.identifier;

          const anchor = this.getStickAnchorCenter();
          const distFromAnchor = Math.hypot(touch.clientX - anchor.x, touch.clientY - anchor.y);

          // If touched directly on or near the stick (<= 90px), keep fixed anchor
          if (distFromAnchor <= 90) {
            this.joystickOrigin = { x: anchor.x, y: anchor.y };
            this.isFloating = false;
          } else {
            // If touched further out in the movement zone, float stick to thumb
            this.joystickOrigin = { x: touch.clientX, y: touch.clientY };
            this.isFloating = true;
            if (this.joystickBase) {
              this.joystickBase.style.left = `${touch.clientX}px`;
              this.joystickBase.style.top = `${touch.clientY}px`;
              this.joystickBase.classList.add('floating');
            }
          }
          if (this.joystickBase) {
            this.joystickBase.classList.add('active');
          }

          this.updateStickKnobAndMovement(touch.clientX, touch.clientY);
        }
      } else {
        // Right Zone: Look Thumbstick & Swipe Camera Orbit — 100% independent of move
        if (this.lookTouchId === null) {
          if (e.cancelable) e.preventDefault();
          this.lookTouchId = touch.identifier;
          this.lastLookX = touch.clientX;
          this.lastLookY = touch.clientY;

          const lookAnchor = this.getLookAnchorCenter();
          const distFromLookAnchor = Math.hypot(touch.clientX - lookAnchor.x, touch.clientY - lookAnchor.y);

          if (distFromLookAnchor <= 90) {
            this.isUsingLookStick = true;
            this.lookOrigin = { x: lookAnchor.x, y: lookAnchor.y };
            this.isLookFloating = false;
            if (this.lookBase) this.lookBase.classList.add('active');
            this.updateLookKnobAndLook(touch.clientX, touch.clientY);
          } else {
            this.isUsingLookStick = false;
          }
        }
      }
    }
  }

  handleTouchMove(e) {
    if (!this.isEnabled) return;
    if (this.controls && this.controls.freeze) {
      if (typeof this.controls.refreshFreeze === 'function') {
        this.controls.refreshFreeze();
      }
      if (this.controls.freeze) return;
    }

    // Multi-touch sanity check: verify active touches still present
    if (this.moveTouchId !== null && e.touches) {
      let moveFound = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.moveTouchId) {
          moveFound = true;
          break;
        }
      }
      if (!moveFound) this.resetMove();
    }

    if (this.lookTouchId !== null && e.touches) {
      let lookFound = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.lookTouchId) {
          lookFound = true;
          break;
        }
      }
      if (!lookFound) this.resetLook();
    }

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // 1. Handle Virtual Stick Movement (Left Thumb)
      if (touch.identifier === this.moveTouchId) {
        if (e.cancelable) e.preventDefault();
        this.updateStickKnobAndMovement(touch.clientX, touch.clientY);
      }
      // 2. Handle Camera Look (Right Thumb) — completely independent
      else if (touch.identifier === this.lookTouchId) {
        if (e.cancelable) e.preventDefault();
        const deltaX = touch.clientX - this.lastLookX;
        const deltaY = touch.clientY - this.lastLookY;

        this.lastLookX = touch.clientX;
        this.lastLookY = touch.clientY;

        if (this.isUsingLookStick) {
          this.updateLookKnobAndLook(touch.clientX, touch.clientY);
        }

        if (this.controls) {
          this.controls.addTouchRotation(
            -deltaY * this.lookSensitivity,
            -deltaX * this.lookSensitivity
          );
        }
      }
    }
  }

  updateStickKnobAndMovement(clientX, clientY) {
    const dx = clientX - this.joystickOrigin.x;
    const dy = clientY - this.joystickOrigin.y;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, this.maxRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(calc(-50% + ${clampedX.toFixed(1)}px), calc(-50% + ${clampedY.toFixed(1)}px))`;
    }

    // Normalize movement vector between -1.0 and 1.0
    let vx = clampedX / this.maxRadius;
    let vy = clampedY / this.maxRadius;

    // Deadzone threshold (0.08) to prevent micro-jitter
    if (Math.hypot(vx, vy) < 0.08) {
      vx = 0;
      vy = 0;
    }

    // Update directional indicator tick highlights
    if (this.tickUp) this.tickUp.classList.toggle('active', vy < -0.32);
    if (this.tickDown) this.tickDown.classList.toggle('active', vy > 0.32);
    if (this.tickLeft) this.tickLeft.classList.toggle('active', vx < -0.32);
    if (this.tickRight) this.tickRight.classList.toggle('active', vx > 0.32);

    // Auto-sprint when pulled beyond 82% radius
    const isSprinting = dist >= this.maxRadius * 0.82;
    if (this.joystickBase) {
      this.joystickBase.classList.toggle('sprinting', isSprinting);
    }

    if (this.controls) {
      this.controls.isSprinting = isSprinting;
      this.controls.setTouchMovement(vx, vy);
    }
  }

  updateLookKnobAndLook(clientX, clientY) {
    const dx = clientX - this.lookOrigin.x;
    const dy = clientY - this.lookOrigin.y;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, this.maxRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    if (this.lookKnob) {
      this.lookKnob.style.transform = `translate(calc(-50% + ${clampedX.toFixed(1)}px), calc(-50% + ${clampedY.toFixed(1)}px))`;
    }

    // Normalize look vector between -1.0 and 1.0
    let vx = clampedX / this.maxRadius;
    let vy = clampedY / this.maxRadius;

    // Deadzone threshold (0.08) to prevent micro-jitter
    if (Math.hypot(vx, vy) < 0.08) {
      vx = 0;
      vy = 0;
    }

    // Update directional indicator tick highlights
    if (this.lookTickUp) this.lookTickUp.classList.toggle('active', vy < -0.32);
    if (this.lookTickDown) this.lookTickDown.classList.toggle('active', vy > 0.32);
    if (this.lookTickLeft) this.lookTickLeft.classList.toggle('active', vx < -0.32);
    if (this.lookTickRight) this.lookTickRight.classList.toggle('active', vx > 0.32);

    if (this.controls) {
      this.controls.setTouchLook(vx, vy);
    }
  }

  handleTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.moveTouchId) {
        this.resetMove();
      } else if (touch.identifier === this.lookTouchId) {
        this.resetLook();
      }
    }
  }

  resetMove() {
    this.moveTouchId = null;
    this.isFloating = false;

    if (this.joystickBase) {
      // Clear floating coordinate overrides to smoothly return to home anchor
      this.joystickBase.style.left = '';
      this.joystickBase.style.top = '';
      this.joystickBase.classList.remove('floating', 'sprinting', 'active');
    }

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = 'translate(-50%, -50%)';
    }

    // Deactivate all directional pips
    if (this.tickUp) this.tickUp.classList.remove('active');
    if (this.tickDown) this.tickDown.classList.remove('active');
    if (this.tickLeft) this.tickLeft.classList.remove('active');
    if (this.tickRight) this.tickRight.classList.remove('active');

    if (this.controls) {
      this.controls.setTouchMovement(0, 0);
      this.controls.isSprinting = false;
    }
  }

  resetLook() {
    this.lookTouchId = null;
    this.isUsingLookStick = false;
    this.isLookFloating = false;

    if (this.lookBase) {
      this.lookBase.style.left = '';
      this.lookBase.style.top = '';
      this.lookBase.classList.remove('floating', 'active');
    }

    if (this.lookKnob) {
      this.lookKnob.style.transform = 'translate(-50%, -50%)';
    }

    if (this.lookTickUp) this.lookTickUp.classList.remove('active');
    if (this.lookTickDown) this.lookTickDown.classList.remove('active');
    if (this.lookTickLeft) this.lookTickLeft.classList.remove('active');
    if (this.lookTickRight) this.lookTickRight.classList.remove('active');

    if (this.controls) {
      this.controls.setTouchLook(0, 0);
    }
  }

  updateInteractionState(hasActiveTarget) {
    if (!this.btnInteract) return;
    if (hasActiveTarget) {
      this.btnInteract.classList.add('interact-active');
    } else {
      this.btnInteract.classList.remove('interact-active');
    }
  }
}
