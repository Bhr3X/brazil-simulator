/**
 * TouchControls.js — Mobile Touch Controller for Brazil Simulator // Sobrevivência BR
 * Provides a dual-zone touch interface:
 * - Left Zone: Floating Virtual Thumbstick (360° analog movement + auto-sprint)
 * - Right Zone: Touch Drag-to-Look Orbit Camera (Yaw + Pitch)
 * - Action Buttons: [E] Interagir, [Pular / Chute], [Agachar], [1ª/3ª Pessoa], [Menu]
 */

export class TouchController {
  constructor(controls, app) {
    this.controls = controls;
    this.app = app;
    this.isEnabled = false;

    // Active touch tracking IDs
    this.moveTouchId = null;
    this.lookTouchId = null;

    // Joystick coordinates
    this.joystickOrigin = { x: 0, y: 0 };
    this.maxRadius = 50; // Max displacement in pixels

    // Look tracking
    this.lastLookX = 0;
    this.lastLookY = 0;
    this.lookSensitivity = 0.0036;

    // DOM Elements
    this.container = null;
    this.joystickBase = null;
    this.joystickKnob = null;
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
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    );
  }

  init() {
    this.container = document.getElementById('touch-controls-container');
    this.joystickBase = document.getElementById('touch-joystick-base');
    this.joystickKnob = document.getElementById('touch-joystick-knob');
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
    if (this.btnMenu) {
      this.btnMenu.classList.add('touch-hidden');
    }
    document.body.classList.remove('mobile-touch-active');
    this.resetMove();
    this.resetLook();
  }

  bindEvents() {
    // 1. Fullscreen / Canvas Touch Routing
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
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
  }

  isInteractiveElement(target) {
    if (!target) return false;
    return !!target.closest(
      'button, a, input, select, .touch-btn, #mobile-menu-drawer, #roulette-modal, #dialogue-modal, #street-view-modal, #end-run-modal, #visuals-modal, .hud-btn'
    );
  }

  handleTouchStart(e) {
    // If not enabled or modal frozen, ignore movement
    if (!this.isEnabled) return;
    if (this.controls && this.controls.freeze) return;

    const screenWidth = window.innerWidth;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = touch.target;

      // Ignore touches on HUD buttons or modals
      if (this.isInteractiveElement(target)) continue;

      // Left Half: Virtual Joystick (Movement)
      if (touch.clientX < screenWidth * 0.48 && this.moveTouchId === null) {
        e.preventDefault();
        this.moveTouchId = touch.identifier;
        this.joystickOrigin.x = touch.clientX;
        this.joystickOrigin.y = touch.clientY;

        if (this.joystickBase) {
          this.joystickBase.style.left = `${touch.clientX}px`;
          this.joystickBase.style.top = `${touch.clientY}px`;
          this.joystickBase.style.display = 'block';
        }
        if (this.joystickKnob) {
          this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        }
      }
      // Right Half: Camera Drag Look
      else if (touch.clientX >= screenWidth * 0.48 && this.lookTouchId === null) {
        e.preventDefault();
        this.lookTouchId = touch.identifier;
        this.lastLookX = touch.clientX;
        this.lastLookY = touch.clientY;
      }
    }
  }

  handleTouchMove(e) {
    if (!this.isEnabled) return;
    if (this.controls && this.controls.freeze) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Handle Movement Joystick
      if (touch.identifier === this.moveTouchId) {
        e.preventDefault();
        const dx = touch.clientX - this.joystickOrigin.x;
        const dy = touch.clientY - this.joystickOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const clampedDist = Math.min(dist, this.maxRadius);
        const angle = Math.atan2(dy, dx);
        const clampedX = Math.cos(angle) * clampedDist;
        const clampedY = Math.sin(angle) * clampedDist;

        if (this.joystickKnob) {
          this.joystickKnob.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
        }

        // Normalize movement vector between -1.0 and 1.0
        let vx = clampedX / this.maxRadius;
        let vy = clampedY / this.maxRadius;

        // Deadzone threshold (0.12)
        if (Math.hypot(vx, vy) < 0.12) {
          vx = 0;
          vy = 0;
        }

        // Auto-sprint when pulling beyond 82% radius
        if (this.controls) {
          this.controls.isSprinting = (dist > this.maxRadius * 0.82);
          this.controls.setTouchMovement(vx, vy);
        }
      }
      // Handle Camera Drag Look
      else if (touch.identifier === this.lookTouchId) {
        e.preventDefault();
        const deltaX = touch.clientX - this.lastLookX;
        const deltaY = touch.clientY - this.lastLookY;

        this.lastLookX = touch.clientX;
        this.lastLookY = touch.clientY;

        if (this.controls) {
          this.controls.addTouchRotation(
            -deltaY * this.lookSensitivity,
            -deltaX * this.lookSensitivity
          );
        }
      }
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
    if (this.joystickBase) {
      this.joystickBase.style.display = 'none';
    }
    if (this.joystickKnob) {
      this.joystickKnob.style.transform = 'translate(-50%, -50%)';
    }
    if (this.controls) {
      this.controls.setTouchMovement(0, 0);
      this.controls.isSprinting = false;
    }
  }

  resetLook() {
    this.lookTouchId = null;
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
