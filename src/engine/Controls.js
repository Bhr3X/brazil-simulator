/**
 * First-Person Controller with Pointer Lock, Head Bobbing,
 * Sprint, Jump, Crouch, and Step Climbing.
 */

export class FirstPersonControls {
  constructor(camera, domElement, physics, soundEngine) {
    this.camera = camera;
    this.domElement = domElement;
    this.physics = physics;
    this.sound = soundEngine;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.canJump = false;

    // Arrow keys rotation state (look up, down, left, right)
    this.lookUp = false;
    this.lookDown = false;
    this.lookLeft = false;
    this.lookRight = false;
    this.keyRotateSpeed = 2.4; // radians/sec (~137.5 deg/sec for smooth, responsive look)

    // Speeds & physics parameters
    this.walkSpeed = 4.8;
    this.sprintSpeed = 9.2;
    this.crouchSpeed = 2.4;
    this.jumpVelocity = 7.2;
    this.gravity = 20.0;
    this.playerRadius = 0.38;
    this.standingEyeHeight = 1.75;
    this.crouchingEyeHeight = 0.95;

    // Current velocities & positions
    this.velocity = new THREE.Vector3();
    this.position = new THREE.Vector3(0, 0, 15); // Start on main street
    this.eyeHeight = this.standingEyeHeight;
    this.freezeSources = new Set();
    this.bobTimer = 0;
    this.stepDistance = 0;
    this.lastFootstepDist = 0;

    // Mouse look state
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.mouseSensitivity = 0.0022;
    this.isLocked = false;

    // Flashlight
    this.flashlight = new THREE.SpotLight(0xfffaed, 2.5, 30, Math.PI / 6, 0.4, 1.2);
    this.flashlight.position.set(0.2, -0.2, 0);
    this.flashlight.target.position.set(0, 0, -10);
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
    this.flashlight.visible = false;

    // Auto Tour Mode (Version 2 Update)
    this.isAutoTour = false;
    this.autoTourTime = 0;
    this.hasStarted = false;
    this.isMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.tourWaypoints = [
      { pos: new THREE.Vector3(26, 1.8, 17.5), look: new THREE.Vector3(-15, 2.0, 17.5) },
      { pos: new THREE.Vector3(12, 1.8, 33), look: new THREE.Vector3(12, 1.8, 42) },
      { pos: new THREE.Vector3(10.5, 1.8, 40), look: new THREE.Vector3(12, 1.2, 42) },
      { pos: new THREE.Vector3(2.0, 1.8, 8), look: new THREE.Vector3(2.0, 2.5, -8) },
      { pos: new THREE.Vector3(2.0, 4.8, -20), look: new THREE.Vector3(2.0, 6.5, -36) },
      { pos: new THREE.Vector3(1.0, 9.8, -44), look: new THREE.Vector3(28, 45, -190) }
    ];

    this.initListeners();
  }

  initListeners() {
    const overlay = document.getElementById('click-overlay');

    const startGame = () => {
      this.hasStarted = true;
      this.isLocked = true;
      if (overlay) overlay.style.display = 'none';
      if (this.sound) this.sound.init();

      // Attempt pointer lock gracefully
      try {
        const target = document.body;
        const p = target.requestPointerLock ? target.requestPointerLock() : null;
        if (p && p.catch) p.catch(() => {});
      } catch (err) {
        // Fallback to drag-to-look
      }
    };

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
      });
    }

    // Pointer lock request on canvas / body
    document.addEventListener('click', (e) => {
      // Don't re-lock if clicking buttons, links, or active modals
      if (e.target.closest && e.target.closest('.hud-btn, #roulette-modal, #dialogue-modal, #street-view-modal, #end-run-modal, button, a')) return;
      if (this.freeze) return;
      if (!this.hasStarted) return;
      if (!this.isLocked) {
        try {
          const p = document.body.requestPointerLock ? document.body.requestPointerLock() : null;
          if (p && p.catch) p.catch(() => {});
        } catch (err) {}
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = !!(document.pointerLockElement);
      if (this.isLocked) {
        this.hasStarted = true;
        if (overlay) overlay.style.display = 'none';
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (this.freeze) return;
      if (e.target.closest && e.target.closest('.hud-btn, #roulette-modal, #dialogue-modal, #street-view-modal, #end-run-modal, button, a')) return;
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Mouse movement: works with Pointer Lock OR Drag-to-look fallback
    document.addEventListener('mousemove', (e) => {
      if (!this.hasStarted || this.freeze) return;

      let movementX = 0;
      let movementY = 0;

      if (this.isLocked) {
        movementX = e.movementX || 0;
        movementY = e.movementY || 0;
      } else if (this.isMouseDown) {
        // Drag-to-look fallback when Pointer Lock is unavailable or paused
        movementX = e.clientX - this.lastMouseX;
        movementY = e.clientY - this.lastMouseY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        return;
      }

      this.euler.y -= movementX * this.mouseSensitivity;
      this.euler.x -= movementY * this.mouseSensitivity;

      // Clamp vertical pitch (-85 deg to +85 deg)
      const maxPitch = Math.PI / 2 - 0.05;
      this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));

      this.camera.quaternion.setFromEuler(this.euler);
    });

    // Keyboard handlers
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(e) {
    if (this.freeze) {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.isSprinting = false;
      this.isCrouching = false;
      this.lookUp = false;
      this.lookDown = false;
      this.lookLeft = false;
      this.lookRight = false;
      return;
    }

    switch (e.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'ArrowUp':
        this.lookUp = true;
        break;
      case 'ArrowDown':
        this.lookDown = true;
        break;
      case 'ArrowLeft':
        this.lookLeft = true;
        break;
      case 'ArrowRight':
        this.lookRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
      case 'KeyC':
      case 'ControlLeft':
        this.isCrouching = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpVelocity;
          this.canJump = false;
          if (this.sound) this.sound.playFootstep('concrete');
        }
        break;
      case 'KeyF':
        // Flashlight toggle
        this.flashlight.visible = !this.flashlight.visible;
        if (this.sound) this.sound.playClick();
        break;
      case 'KeyR':
        // Motorcycle sound Easter egg
        if (this.sound) this.sound.playMotorcycleRev();
        break;
    }
  }

  toggleAutoTour() {
    if (this.freeze) return this.isAutoTour;
    this.isAutoTour = !this.isAutoTour;
    if (this.isAutoTour) {
      this.autoTourTime = 0;
    } else {
      // Sync manual player position and Euler to current camera position
      this.position.copy(this.camera.position);
      this.position.y -= this.eyeHeight;
      this.euler.setFromQuaternion(this.camera.quaternion, 'YXZ');
    }
    return this.isAutoTour;
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
      case 'ArrowUp':
        this.lookUp = false;
        break;
      case 'ArrowDown':
        this.lookDown = false;
        break;
      case 'ArrowLeft':
        this.lookLeft = false;
        break;
      case 'ArrowRight':
        this.lookRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
      case 'KeyC':
      case 'ControlLeft':
        this.isCrouching = false;
        break;
    }
  }

  setFreeze(source, isFrozen) {
    if (isFrozen) {
      this.freezeSources.add(source);
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.lookUp = false;
      this.lookDown = false;
      this.lookLeft = false;
      this.lookRight = false;
    } else {
      this.freezeSources.delete(source);
    }
    return this.freeze;
  }

  refreshFreeze() {
    if (typeof document !== 'undefined') {
      const isDialog = !!document.getElementById('dialogue-modal') && !document.getElementById('dialogue-modal').classList.contains('modal-hidden');
      const isSV = !!document.getElementById('street-view-modal') && !document.getElementById('street-view-modal').classList.contains('modal-hidden');
      const isRoulette = !!document.getElementById('roulette-modal') && !document.getElementById('roulette-modal').classList.contains('modal-hidden');
      const isEnd = !!document.getElementById('end-run-modal') && !document.getElementById('end-run-modal').classList.contains('modal-hidden');

      if (isDialog) this.freezeSources.add('dialog'); else this.freezeSources.delete('dialog');
      if (isSV) this.freezeSources.add('streetView'); else this.freezeSources.delete('streetView');
      if (isRoulette) this.freezeSources.add('roulette'); else this.freezeSources.delete('roulette');
      if (isEnd) this.freezeSources.add('endModal'); else this.freezeSources.delete('endModal');
    }
    if (this.freeze) {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.lookUp = false;
      this.lookDown = false;
      this.lookLeft = false;
      this.lookRight = false;
    }
    return this.freeze;
  }

  get freeze() {
    return this.freezeSources.size > 0;
  }

  set freeze(val) {
    if (val) {
      this.freezeSources.add('manual');
    } else {
      this.freezeSources.delete('manual');
    }
  }

  teleport(x, y, z) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.camera.position.set(x, y + this.eyeHeight, z);
  }

  update(delta) {
    if (!this.hasStarted || this.freeze) return;

    // If in Auto Tour mode, animate autonomous camera along cinematic trajectory
    if (this.isAutoTour) {
      this.autoTourTime += delta * 0.18; // ~34 seconds per full loop
      const totalPoints = this.tourWaypoints.length;
      const loopProgress = this.autoTourTime % totalPoints;
      const idx1 = Math.floor(loopProgress);
      const idx2 = (idx1 + 1) % totalPoints;
      const t = loopProgress - idx1;

      // Smooth cosine easing
      const smoothT = (1 - Math.cos(t * Math.PI)) / 2;

      const wp1 = this.tourWaypoints[idx1];
      const wp2 = this.tourWaypoints[idx2];

      const currentPos = new THREE.Vector3().lerpVectors(wp1.pos, wp2.pos, smoothT);
      const currentLook = new THREE.Vector3().lerpVectors(wp1.look, wp2.look, smoothT);

      this.camera.position.copy(currentPos);
      this.camera.lookAt(currentLook);
      this.position.copy(currentPos);
      this.position.y -= this.eyeHeight;
      return;
    }

    // 0. Arrow Keys Rotation (Look Up, Down, Left, Right)
    let rotX = 0;
    let rotY = 0;
    if (this.lookUp) rotX += this.keyRotateSpeed * delta;
    if (this.lookDown) rotX -= this.keyRotateSpeed * delta;
    if (this.lookLeft) rotY += this.keyRotateSpeed * delta;
    if (this.lookRight) rotY -= this.keyRotateSpeed * delta;

    if (rotX !== 0 || rotY !== 0) {
      this.euler.x += rotX;
      this.euler.y += rotY;

      // Clamp vertical pitch (-85 deg to +85 deg)
      const maxPitch = Math.PI / 2 - 0.05;
      this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));

      this.camera.quaternion.setFromEuler(this.euler);
    }

    // 1. Calculate horizontal movement direction relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

    const moveDir = new THREE.Vector3();
    if (this.moveForward) moveDir.add(forward);
    if (this.moveBackward) moveDir.sub(forward);
    if (this.moveRight) moveDir.add(right);
    if (this.moveLeft) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) moveDir.normalize();

    // 2. Select speed based on state
    let speed = this.walkSpeed;
    if (this.isCrouching) {
      speed = this.crouchSpeed;
    } else if (this.isSprinting) {
      speed = this.sprintSpeed;
    }

    // 3. Smooth crouching eye height transition
    const targetEyeHeight = this.isCrouching ? this.crouchingEyeHeight : this.standingEyeHeight;
    this.eyeHeight += (targetEyeHeight - this.eyeHeight) * Math.min(delta * 12, 1);

    // 4. Calculate target position
    const targetPos = this.position.clone();
    targetPos.x += moveDir.x * speed * delta;
    targetPos.z += moveDir.z * speed * delta;

    // Apply gravity
    this.velocity.y -= this.gravity * delta;
    targetPos.y += this.velocity.y * delta;

    // 5. Resolve collision with world & stairs
    const resolved = this.physics.resolveMovement(this.position, targetPos, this.playerRadius, 0.45);
    const groundY = this.physics.getGroundHeight(resolved.x, resolved.z);

    if (resolved.y <= groundY + 0.01) {
      resolved.y = groundY;
      this.velocity.y = 0;
      this.canJump = true;
    } else {
      this.canJump = false;
    }

    // Update actual velocity and position
    if (delta > 0) {
      this.velocity.x = (resolved.x - this.position.x) / delta;
      this.velocity.z = (resolved.z - this.position.z) / delta;
    }
    const actualMoveDist = Math.hypot(resolved.x - this.position.x, resolved.z - this.position.z);
    this.position.copy(resolved);

    // 6. Head bobbing & footsteps
    let bobOffsetY = 0;
    if (isMoving && this.canJump) {
      this.bobTimer += delta * (this.isSprinting ? 14 : 9);
      bobOffsetY = Math.sin(this.bobTimer) * (this.isSprinting ? 0.08 : 0.045);

      // Trigger footsteps based on travelled distance
      this.stepDistance += actualMoveDist;
      const stepThreshold = this.isSprinting ? 2.3 : 1.6;
      if (this.stepDistance - this.lastFootstepDist >= stepThreshold) {
        this.lastFootstepDist = this.stepDistance;
        const isStairs = this.position.y > 1.0 && this.position.z < 5;
        if (this.sound) {
          this.sound.playFootstep(isStairs ? 'metal' : 'concrete');
        }
      }
    } else {
      this.bobTimer = 0;
    }

    // 7. Update camera position with eye height + bobbing
    this.camera.position.set(
      this.position.x,
      this.position.y + this.eyeHeight + bobOffsetY,
      this.position.z
    );
  }
}
