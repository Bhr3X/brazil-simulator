/**
 * Fast ray/segment-AABB intersection via slab method for 3rd person camera spring-arm
 */
function intersectSegmentAABB(p1, p2, min, max) {
  let tmin = 0.0;
  let tmax = 1.0;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;

  // X slab
  if (Math.abs(dx) < 1e-6) {
    if (p1.x < min.x || p1.x > max.x) return null;
  } else {
    const invD = 1.0 / dx;
    let t1 = (min.x - p1.x) * invD;
    let t2 = (max.x - p1.x) * invD;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }

  // Y slab
  if (Math.abs(dy) < 1e-6) {
    if (p1.y < min.y || p1.y > max.y) return null;
  } else {
    const invD = 1.0 / dy;
    let t1 = (min.y - p1.y) * invD;
    let t2 = (max.y - p1.y) * invD;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }

  // Z slab
  if (Math.abs(dz) < 1e-6) {
    if (p1.z < min.z || p1.z > max.z) return null;
  } else {
    const invD = 1.0 / dz;
    let t1 = (min.z - p1.z) * invD;
    let t2 = (max.z - p1.z) * invD;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }

  if (tmin >= 0.0 && tmin <= 1.0) {
    return tmin * Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return null;
}

export class FirstPersonControls {
  constructor(camera, domElement, physics, soundEngine, scene = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.physics = physics;
    this.sound = soundEngine;
    this.scene = scene;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.canJump = false;
    this.touchMoveVector = null;

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

    // 3rd Person Perspective & Player Character Avatar
    this.isThirdPerson = false;
    this.thirdPersonDistance = 2.6; // Distance behind player
    this.thirdPersonHeight = 0.45;   // Height offset above shoulders
    this.thirdPersonShoulderOffset = 0.40; // Over-the-shoulder right offset
    this.avatarMesh = null;
    this.walkTimer = 0;
    this.idleTimer = 0;
    this.onPerspectiveChange = null;

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

    if (this.scene) {
      this.createPlayerAvatar();
    }

    this.initListeners();
  }

  initListeners() {
    const overlay = document.getElementById('click-overlay');

    const startGame = () => {
      this.hasStarted = true;
      this.isLocked = true;
      if (overlay) overlay.style.display = 'none';
      if (this.sound) this.sound.init();

      const roulette = document.getElementById('roulette-modal');
      if (roulette && (!window.app || !window.app.game || !window.app.game.isRunActive)) {
        roulette.classList.remove('modal-hidden');
      }
      if (this.refreshFreeze) this.refreshFreeze();

      // Attempt pointer lock gracefully
      this.requestPointerLock();
    };

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
      });
    }

    // Pointer lock request on canvas / body
    document.addEventListener('click', (e) => {
      // Don't re-lock if clicking buttons, links, active modals or mobile touch controls
      if (e.target.closest && e.target.closest('.hud-btn, #roulette-modal, #dialogue-modal, #street-view-modal, #end-run-modal, #visuals-modal, button, a, input, select, .touch-btn, .touch-action-btn, #touch-controls-container, #mobile-menu-drawer')) return;
      if (window.app && window.app.touch && window.app.touch.isEnabled) return;
      if (this.freeze) return;
      if (!this.hasStarted) return;
      if (!this.isLocked) {
        this.requestPointerLock();
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
      // On touch devices / mobile mode, ignore synthetic mousedown to prevent camera fighting
      if (window.app && window.app.touch && window.app.touch.isEnabled) return;
      if (e.target.closest && e.target.closest('.hud-btn, #roulette-modal, #dialogue-modal, #street-view-modal, #end-run-modal, #visuals-modal, button, a, input, select, .touch-btn, .touch-action-btn, #touch-controls-container, #mobile-menu-drawer')) return;
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Mouse wheel zoom: smooth transition between 1st Person and 3rd Person
    window.addEventListener('wheel', (e) => {
      if (!this.hasStarted || this.freeze) return;

      // Scrolling down (deltaY > 0) pulls camera back; scrolling up (deltaY < 0) zooms in
      if (e.deltaY > 0) {
        if (!this.isThirdPerson) {
          this.togglePerspective(true);
          this.thirdPersonDistance = 1.8;
        } else {
          this.thirdPersonDistance = Math.min(4.5, this.thirdPersonDistance + 0.25);
        }
      } else if (e.deltaY < 0) {
        if (this.isThirdPerson) {
          this.thirdPersonDistance -= 0.25;
          if (this.thirdPersonDistance < 1.2) {
            this.togglePerspective(false);
            this.thirdPersonDistance = 2.6;
          }
        }
      }
    }, { passive: true });

    // Mouse movement: works with Pointer Lock OR Drag-to-look fallback
    document.addEventListener('mousemove', (e) => {
      if (!this.hasStarted || this.freeze) return;
      // On touch devices / mobile mode, do not process synthetic mouse movement unless in true desktop pointer lock
      if (window.app && window.app.touch && window.app.touch.isEnabled && !this.isLocked) return;

      let movementX = 0;
      let movementY = 0;

      if (this.isLocked || (typeof document !== 'undefined' && !!document.pointerLockElement)) {
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

  requestPointerLock() {
    if (typeof window !== 'undefined' && window.app && window.app.touch && window.app.touch.isEnabled) return;
    if (this.freeze) return;
    if (!this.hasStarted) return;
    try {
      const target = document.body;
      const p = target.requestPointerLock ? target.requestPointerLock() : null;
      if (p && p.catch) p.catch(() => {});
    } catch (err) {}
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
      const isVisuals = !!document.getElementById('visuals-modal') && !document.getElementById('visuals-modal').classList.contains('modal-hidden');

      if (isDialog) this.freezeSources.add('dialog'); else this.freezeSources.delete('dialog');
      if (isSV) this.freezeSources.add('streetView'); else this.freezeSources.delete('streetView');
      if (isRoulette) this.freezeSources.add('roulette'); else this.freezeSources.delete('roulette');
      if (isEnd) this.freezeSources.add('endModal'); else this.freezeSources.delete('endModal');
      if (isVisuals) this.freezeSources.add('visuals'); else this.freezeSources.delete('visuals');
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

  setTouchMovement(vx, vy) {
    if (!this.touchMoveVector) {
      this.touchMoveVector = new THREE.Vector2();
    }
    this.touchMoveVector.set(vx, vy);
  }

  addTouchRotation(rotX, rotY) {
    if (this.freeze) return;
    this.euler.x += rotX;
    this.euler.y += rotY;
    const maxPitch = Math.PI / 2 - 0.05;
    this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));
    if (!this.isThirdPerson) {
      this.camera.quaternion.setFromEuler(this.euler);
    }
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

    // Support analog touch joystick vector
    if (this.touchMoveVector && (this.touchMoveVector.x !== 0 || this.touchMoveVector.y !== 0)) {
      moveDir.addScaledVector(forward, -this.touchMoveVector.y);
      moveDir.addScaledVector(right, this.touchMoveVector.x);
    }

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving && moveDir.lengthSq() > 1.0) moveDir.normalize();

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

    // 7. Update player avatar animations & 3rd person camera
    this.updateAvatarAnimation(delta, isMoving, this.isSprinting, this.isCrouching);
    this.updateCameraPosition(bobOffsetY);
  }

  setScene(scene) {
    this.scene = scene;
    if (!this.avatarMesh) {
      this.createPlayerAvatar();
    }
  }

  togglePerspective(forceState) {
    this.isThirdPerson = typeof forceState === 'boolean' ? forceState : !this.isThirdPerson;
    if (this.avatarMesh) {
      this.avatarMesh.visible = this.isThirdPerson;
      if (this.isThirdPerson) this.setAvatarOpacity(1.0);
    }
    if (typeof this.onPerspectiveChange === 'function') {
      this.onPerspectiveChange(this.isThirdPerson);
    }
    return this.isThirdPerson;
  }

  setAvatarOpacity(opacity) {
    if (!this.avatarMaterials) return;
    for (let i = 0; i < this.avatarMaterials.length; i++) {
      this.avatarMaterials[i].opacity = opacity;
    }
  }

  createPlayerAvatar() {
    if (typeof THREE === 'undefined') return null;

    const avatar = new THREE.Group();
    avatar.name = 'player_avatar';

    // Materials (with alpha transparency support for proximity fading)
    // Skin tone
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xba7d56, transparent: true, opacity: 1.0 });
    // Brazilian Soccer Jersey: Canarinho yellow with green trim
    const jerseyMat = new THREE.MeshLambertMaterial({ color: 0xffdf00, transparent: true, opacity: 1.0 });
    const greenTrimMat = new THREE.MeshLambertMaterial({ color: 0x009b3a, transparent: true, opacity: 1.0 });
    // Bermuda Tactel: Navy blue / Dark cyan
    const shortsMat = new THREE.MeshLambertMaterial({ color: 0x1d3557, transparent: true, opacity: 1.0 });
    // Cap: Royal blue with green/yellow visor
    const capMat = new THREE.MeshLambertMaterial({ color: 0x0d47a1, transparent: true, opacity: 1.0 });
    const capVisorMat = new THREE.MeshLambertMaterial({ color: 0xffcc00, transparent: true, opacity: 1.0 });
    // Sunglasses (Juliet): Metallic chrome with gold/iridescent tint
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 1.0 });
    // Flip-Flops (Havaianas): White rubber sole with blue straps
    const soleMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee, transparent: true, opacity: 1.0 });
    const strapMat = new THREE.MeshBasicMaterial({ color: 0x1565c0, transparent: true, opacity: 1.0 });

    // 1. Torso
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.05, 0);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.24), jerseyMat);
    torsoGroup.add(torso);

    // Green collar band
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.25), greenTrimMat);
    collar.position.set(0, 0.24, 0);
    torsoGroup.add(collar);

    // Brazilian badge on chest
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), greenTrimMat);
    badge.position.set(-0.12, 0.12, 0.125);
    torsoGroup.add(badge);

    avatar.add(torsoGroup);
    this.avatarTorso = torsoGroup;

    // 2. Head & Neck
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.48, 0);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), skinMat);
    headGroup.add(head);

    // Backward / sideways baseball cap (Boné)
    const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.26), capMat);
    capCrown.position.set(0, 0.10, 0);
    headGroup.add(capCrown);

    // Visor pointed backward
    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.16), capVisorMat);
    capVisor.position.set(0, 0.08, -0.19);
    capVisor.rotation.x = -0.15;
    headGroup.add(capVisor);

    // Sunglasses (Óculos Juliet)
    const glassLens = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.04), glassesMat);
    glassLens.position.set(0, 0.02, 0.13);
    headGroup.add(glassLens);

    avatar.add(headGroup);
    this.avatarHead = headGroup;

    // 3. Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.28, 1.25, 0);
    const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.16), jerseyMat);
    leftSleeve.position.set(0, -0.09, 0);
    leftArmGroup.add(leftSleeve);
    const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.12), skinMat);
    leftForearm.position.set(0, -0.32, 0);
    leftArmGroup.add(leftForearm);
    avatar.add(leftArmGroup);
    this.avatarLeftArm = leftArmGroup;

    // 4. Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.28, 1.25, 0);
    const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.16), jerseyMat);
    rightSleeve.position.set(0, -0.09, 0);
    rightArmGroup.add(rightSleeve);
    const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.12), skinMat);
    rightForearm.position.set(0, -0.32, 0);
    rightArmGroup.add(rightForearm);
    avatar.add(rightArmGroup);
    this.avatarRightArm = rightArmGroup;

    // 5. Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.13, 0.78, 0);
    const leftShort = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.30, 0.20), shortsMat);
    leftShort.position.set(0, -0.15, 0);
    leftLegGroup.add(leftShort);
    const leftCalf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.14), skinMat);
    leftCalf.position.set(0, -0.45, 0);
    leftLegGroup.add(leftCalf);
    // Left Flip-Flop
    const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.26), soleMat);
    leftSole.position.set(0, -0.66, 0.04);
    leftLegGroup.add(leftSole);
    const leftStrap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.10), strapMat);
    leftStrap.position.set(0, -0.63, 0.03);
    leftLegGroup.add(leftStrap);
    avatar.add(leftLegGroup);
    this.avatarLeftLeg = leftLegGroup;

    // 6. Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.13, 0.78, 0);
    const rightShort = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.30, 0.20), shortsMat);
    rightShort.position.set(0, -0.15, 0);
    rightLegGroup.add(rightShort);
    const rightCalf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.14), skinMat);
    rightCalf.position.set(0, -0.45, 0);
    rightLegGroup.add(rightCalf);
    // Right Flip-Flop
    const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.26), soleMat);
    rightSole.position.set(0, -0.66, 0.04);
    rightLegGroup.add(rightSole);
    const rightStrap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.10), strapMat);
    rightStrap.position.set(0, -0.63, 0.03);
    rightLegGroup.add(rightStrap);
    avatar.add(rightLegGroup);
    this.avatarRightLeg = rightLegGroup;

    avatar.visible = false;
    if (this.scene) {
      this.scene.add(avatar);
    }
    this.avatarMesh = avatar;
    this.avatarMaterials = [skinMat, jerseyMat, greenTrimMat, shortsMat, capMat, capVisorMat, glassesMat, soleMat, strapMat];
    return avatar;
  }

  updateAvatarAnimation(delta, isMoving, isSprinting, isCrouching) {
    if (!this.avatarMesh || !this.avatarMesh.visible) return;

    // Position avatar at player base coordinates
    this.avatarMesh.position.set(this.position.x, this.position.y, this.position.z);

    // Orient avatar to camera horizontal yaw
    this.avatarMesh.rotation.y = this.euler.y;

    if (isMoving && this.canJump) {
      this.walkTimer = (this.walkTimer || 0) + delta * (isSprinting ? 14 : 9);
      const legSwing = Math.sin(this.walkTimer) * (isSprinting ? 0.75 : 0.55);
      const armSwing = Math.cos(this.walkTimer) * (isSprinting ? 0.70 : 0.50);

      this.avatarLeftLeg.rotation.x = legSwing;
      this.avatarRightLeg.rotation.x = -legSwing;
      this.avatarLeftArm.rotation.x = -armSwing;
      this.avatarRightArm.rotation.x = armSwing;

      // Torso slight forward lean when sprinting
      this.avatarTorso.rotation.x = isSprinting ? 0.2 : 0.05;
      this.avatarHead.rotation.x = this.euler.x * 0.4;
    } else {
      // Idle breathing and gentle return to rest position
      this.idleTimer = (this.idleTimer || 0) + delta * 2.5;
      const breathe = Math.sin(this.idleTimer) * 0.015;

      this.avatarLeftLeg.rotation.x *= 0.8;
      this.avatarRightLeg.rotation.x *= 0.8;
      this.avatarLeftArm.rotation.x *= 0.8;
      this.avatarRightArm.rotation.x *= 0.8;
      this.avatarTorso.position.y = 1.05 + breathe;
      this.avatarTorso.rotation.x *= 0.8;
      this.avatarHead.position.y = 1.48 + breathe * 1.2;
      this.avatarHead.rotation.x = this.euler.x * 0.6;
    }

    // Squash avatar if crouching
    const targetScaleY = isCrouching ? 0.65 : 1.0;
    this.avatarMesh.scale.y += (targetScaleY - this.avatarMesh.scale.y) * Math.min(delta * 12, 1);
  }

  updateCameraPosition(bobOffsetY) {
    if (!this.isThirdPerson) {
      if (this.avatarMesh) this.avatarMesh.visible = false;
      this.camera.position.set(
        this.position.x,
        this.position.y + this.eyeHeight + bobOffsetY,
        this.position.z
      );
      this.camera.quaternion.setFromEuler(this.euler);
      return;
    }

    // Focal target is around player upper chest / head
    const focusY = this.position.y + this.eyeHeight * 0.85;
    const focusPoint = new THREE.Vector3(this.position.x, focusY, this.position.z);

    // Current view angles
    const yaw = this.euler.y;
    const pitch = this.euler.x;

    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);

    // Forward aim direction
    const forwardDir = new THREE.Vector3(
      -sinYaw * cosPitch,
      sinPitch,
      -cosYaw * cosPitch
    ).normalize();

    // Backward vector (away from where player looks)
    const backDir = new THREE.Vector3(
      sinYaw * cosPitch,
      -sinPitch,
      cosYaw * cosPitch
    ).normalize();

    // Right-hand shoulder offset vector
    const rightDir = new THREE.Vector3(cosYaw, 0, -sinYaw).normalize();

    let targetDist = this.thirdPersonDistance;

    // Dynamic pitch-based height offset:
    // When looking down (pitch < 0), lift camera slightly up so head doesn't occlude reticle
    // When looking up (pitch > 0), raise camera smoothly so it doesn't sink into thighs
    const heightOffset = this.thirdPersonHeight - Math.min(0, sinPitch) * 0.35;

    // Calculate preliminary camera position
    let camPos = focusPoint.clone()
      .addScaledVector(backDir, targetDist)
      .addScaledVector(rightDir, this.thirdPersonShoulderOffset)
      .add(new THREE.Vector3(0, heightOffset, 0));

    // Spring-arm collision avoidance: segment raycast against world colliders
    if (this.physics && this.physics.colliders) {
      const rayLen = camPos.distanceTo(focusPoint);
      if (rayLen > 0.01) {
        for (const col of this.physics.colliders) {
          if (col.isStep || col.isStair) continue;
          const hitDist = intersectSegmentAABB(focusPoint, camPos, col.min, col.max);
          if (hitDist !== null && hitDist < targetDist) {
            const safeDist = Math.max(0.4, hitDist - 0.25);
            if (safeDist < targetDist) {
              targetDist = safeDist;
            }
          }
        }
      }
    }

    // Recompute camPos with adjusted targetDist
    const distFactor = Math.min(1.0, targetDist / this.thirdPersonDistance);
    camPos = focusPoint.clone()
      .addScaledVector(backDir, targetDist)
      .addScaledVector(rightDir, this.thirdPersonShoulderOffset * distFactor)
      .add(new THREE.Vector3(0, heightOffset * distFactor, 0));

    // Ensure camera does not go below ground
    const groundY = this.physics ? this.physics.getGroundHeight(camPos.x, camPos.z) : 0;
    if (camPos.y < groundY + 0.35) {
      camPos.y = groundY + 0.35;
    }

    // Avatar Proximity & Occlusion Guard:
    // Calculate distance from camera to player's head and focal center
    const headPos = new THREE.Vector3(this.position.x, this.position.y + 1.48, this.position.z);
    const distToHead = camPos.distanceTo(headPos);
    const distToFocus = camPos.distanceTo(focusPoint);
    const effectiveDist = Math.min(distToHead, distToFocus);

    if (this.avatarMesh) {
      if (effectiveDist < 1.0) {
        // Occlusion safety: hide avatar when camera is too close
        this.avatarMesh.visible = false;
      } else {
        this.avatarMesh.visible = true;
        // Smooth proximity fade between 1.0m and 1.5m
        const fade = Math.max(0.25, Math.min(1.0, (effectiveDist - 0.95) / 0.55));
        this.setAvatarOpacity(fade);
      }
    }

    this.camera.position.copy(camPos);

    // Aim convergence: point towards target 25m ahead along player's forward aim vector
    const aimTarget = focusPoint.clone().addScaledVector(forwardDir, 25.0);
    this.camera.lookAt(aimTarget);
  }
}
