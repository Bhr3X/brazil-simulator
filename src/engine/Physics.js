/**
 * Physics and Collision System
 * Handles AABB collision, wall sliding, step-up climbing (escadão/stairs),
 * and terrain height evaluation.
 */

export class PhysicsEngine {
  constructor() {
    this.colliders = []; // Array of AABBs { min: Vector3, max: Vector3, isStair: bool, isStep: bool }
    this.slopes = [];    // Sloped terrain ramps { minX, maxX, minZ, maxZ, baseY, slopeY_Z }
    this.dynamicBodies = []; // Array of physical interactable bodies (soccer ball, cans, crates)
    this.worldBounds = {
      minX: -70, maxX: 180,
      minZ: -120, maxZ: 250
    };
  }

  // Register an interactive dynamic rigid body (e.g. kickable soccer ball, cans)
  addDynamicBody(config) {
    const body = {
      mesh: config.mesh,
      radius: config.radius || 0.25,
      mass: config.mass || 0.45,
      restitution: config.restitution !== undefined ? config.restitution : 0.65, // Bounciness
      friction: config.friction || 0.98,
      velocity: config.velocity || new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      isKickable: config.isKickable || false,
      id: config.id || 'body_' + Math.random().toString(36).substr(2, 9),
      onKick: config.onKick || null
    };
    this.dynamicBodies.push(body);
    return body;
  }

  // Apply instantaneous physical impulse (e.g., foot kick, bullet, explosion)
  applyImpulse(body, impulseVector) {
    if (!body || !body.velocity) return;
    body.velocity.add(impulseVector);
  }

  // Check if player runs into or kicks any dynamic bodies
  checkPlayerKick(playerPos, forwardVector, playerSpeed = 0, kickRange = 1.35, kickForce = 9.0) {
    let kickedBody = null;
    const now = performance.now();

    for (const body of this.dynamicBodies) {
      if (!body.isKickable) continue;

      // Cooldown guard to avoid spamming kicks every frame
      if (body.lastKickTime && (now - body.lastKickTime < 350)) continue;

      const bodyPos = body.mesh.position;
      const dx = bodyPos.x - playerPos.x;
      const dy = Math.abs(bodyPos.y - playerPos.y);
      const dz = bodyPos.z - playerPos.z;

      // Height reach check: must be near player foot level
      if (dy > 1.35) continue;

      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < kickRange) {
        body.lastKickTime = now;

        // Calculate kick direction: blend player forward vector and displacement vector
        const kickDir = new THREE.Vector3(dx, 0, dz).normalize();
        if (forwardVector) {
          kickDir.add(forwardVector.clone().multiplyScalar(0.7)).normalize();
        }

        const totalForce = kickForce + Math.min(playerSpeed * 0.8, 6.0);
        body.velocity.x = kickDir.x * totalForce;
        body.velocity.z = kickDir.z * totalForce;
        body.velocity.y = 3.2; // Deterministic upward loft arc

        // Deterministic tumbling spin
        body.angularVelocity.set(kickDir.z * 10, 3.5, -kickDir.x * 10);

        if (body.onKick) body.onKick(body, totalForce);
        kickedBody = body;
      }
    }

    return kickedBody;
  }

  // Update simulation loop for all dynamic physical objects
  updateDynamicBodies(delta) {
    const gravity = -14.0;

    for (const body of this.dynamicBodies) {
      const pos = body.mesh.position;

      // 1. Apply gravity
      body.velocity.y += gravity * delta;

      // 2. Integrate position
      pos.x += body.velocity.x * delta;
      pos.y += body.velocity.y * delta;
      pos.z += body.velocity.z * delta;

      // 3. Ground collision and bouncing
      const floorY = this.getGroundHeight(pos.x, pos.z, pos.y) + body.radius;
      if (pos.y <= floorY) {
        pos.y = floorY;
        if (body.velocity.y < 0) {
          body.velocity.y = -body.velocity.y * body.restitution;
          if (Math.abs(body.velocity.y) < 0.3) {
            body.velocity.y = 0; // Rest threshold
          }
        }
        // Apply ground rolling friction
        body.velocity.x *= body.friction;
        body.velocity.z *= body.friction;
      } else {
        // Air resistance
        body.velocity.x *= 0.995;
        body.velocity.z *= 0.995;
      }

      // 4. Solid obstacle bounce / deflection
      const testPos = new THREE.Vector3(pos.x, pos.y, pos.z);
      if (this.collidesWithSolids(testPos, body.radius, 0.1)) {
        body.velocity.x = -body.velocity.x * 0.5;
        body.velocity.z = -body.velocity.z * 0.5;
      }

      // 5. Enforce world bounds
      if (pos.x < this.worldBounds.minX + body.radius) {
        pos.x = this.worldBounds.minX + body.radius;
        body.velocity.x = Math.abs(body.velocity.x) * body.restitution;
      } else if (pos.x > this.worldBounds.maxX - body.radius) {
        pos.x = this.worldBounds.maxX - body.radius;
        body.velocity.x = -Math.abs(body.velocity.x) * body.restitution;
      }

      if (pos.z < this.worldBounds.minZ + body.radius) {
        pos.z = this.worldBounds.minZ + body.radius;
        body.velocity.z = Math.abs(body.velocity.z) * body.restitution;
      } else if (pos.z > this.worldBounds.maxZ - body.radius) {
        pos.z = this.worldBounds.maxZ - body.radius;
        body.velocity.z = -Math.abs(body.velocity.z) * body.restitution;
      }

      // 6. Natural visual tumbling / rolling rotation
      const rollSpeed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.z * body.velocity.z);
      if (rollSpeed > 0.05) {
        body.mesh.rotation.x += body.velocity.z * delta * 2.5;
        body.mesh.rotation.z -= body.velocity.x * delta * 2.5;
      }
    }
  }

  // Register a static box collider
  addBoxCollider(min, max, type = 'solid') {
    const col = {
      min: min.clone(),
      max: max.clone(),
      type: type // 'solid', 'stair', 'curb'
    };
    this.colliders.push(col);
    return col;
  }

  // Remove a static box collider
  removeBoxCollider(collider) {
    if (!collider) return false;
    const idx = this.colliders.indexOf(collider);
    if (idx !== -1) {
      this.colliders.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Register a static box by center and dimensions
  addStaticBox(cx, cy, cz, sizeX, sizeY, sizeZ, type = 'solid') {
    const halfX = sizeX / 2;
    const halfY = sizeY / 2;
    const halfZ = sizeZ / 2;
    return this.addBoxCollider(
      new THREE.Vector3(cx - halfX, cy - halfY, cz - halfZ),
      new THREE.Vector3(cx + halfX, cy + halfY, cz + halfZ),
      type
    );
  }

  // Register a sloped ramp
  addSlope(minX, maxX, minZ, maxZ, startY, endY) {
    this.slopes.push({
      minX, maxX, minZ, maxZ, startY, endY
    });
  }

  // Get ground/floor height beneath a given position.
  // When currentY is specified, only surfaces at or below (currentY + 0.6) are eligible,
  // preventing upper multi-floor levels (e.g. 12th floor penthouse at Y=32) from snapping
  // players who are walking on ground level (Y=0.25).
  getGroundHeight(x, z, currentY = null) {
    let groundY = 0; // Default street level

    // Check sloped hills
    for (const slope of this.slopes) {
      if (x >= slope.minX && x <= slope.maxX && z >= slope.minZ && z <= slope.maxZ) {
        const factor = (z - slope.minZ) / (slope.maxZ - slope.minZ);
        const yOnSlope = slope.startY + factor * (slope.endY - slope.startY);
        if (currentY === null || currentY === undefined || yOnSlope <= currentY + 0.6) {
          if (yOnSlope > groundY) {
            groundY = yOnSlope;
          }
        }
      }
    }

    // Check stairs and flat surfaces player can stand on
    for (const box of this.colliders) {
      if (box.type === 'stair' || box.type === 'walkable' || box.type === 'curb') {
        if (x >= box.min.x && x <= box.max.x && z >= box.min.z && z <= box.max.z) {
          if (currentY === null || currentY === undefined || box.max.y <= currentY + 0.6) {
            if (box.max.y > groundY) {
              groundY = box.max.y;
            }
          }
        }
      }
    }

    return groundY;
  }

  // Resolve player movement with wall sliding, step climbing, and multi-pass penetration pushout
  resolveMovement(oldPos, targetPos, playerRadius = 0.38, maxStepHeight = 0.5) {
    const resolved = targetPos.clone();

    // 1. Enforce world boundaries
    resolved.x = Math.max(this.worldBounds.minX + playerRadius, Math.min(this.worldBounds.maxX - playerRadius, resolved.x));
    resolved.z = Math.max(this.worldBounds.minZ + playerRadius, Math.min(this.worldBounds.maxZ - playerRadius, resolved.z));

    // 2. Multi-pass penetration resolution (up to 3 iterations for corners, wedges, and multi-collider pinches)
    const playerMinY = oldPos.y + maxStepHeight;
    const playerMaxY = oldPos.y + 1.7;

    for (let iter = 0; iter < 3; iter++) {
      let collided = false;

      for (const box of this.colliders) {
        if (box.type !== 'solid') continue;
        if (playerMaxY < box.min.y || playerMinY > box.max.y) continue;

        // Find closest point on horizontal AABB
        const closestX = Math.max(box.min.x, Math.min(resolved.x, box.max.x));
        const closestZ = Math.max(box.min.z, Math.min(resolved.z, box.max.z));

        const dx = resolved.x - closestX;
        const dz = resolved.z - closestZ;
        const distSq = dx * dx + dz * dz;

        // Case A: Player center is inside the solid box volume
        if (resolved.x >= box.min.x && resolved.x <= box.max.x &&
            resolved.z >= box.min.z && resolved.z <= box.max.z) {
          const dLeft = resolved.x - box.min.x;
          const dRight = box.max.x - resolved.x;
          const dBack = resolved.z - box.min.z;
          const dFront = box.max.z - resolved.z;
          const minD = Math.min(dLeft, dRight, dBack, dFront);

          if (minD === dLeft) {
            resolved.x = box.min.x - playerRadius - 0.01;
          } else if (minD === dRight) {
            resolved.x = box.max.x + playerRadius + 0.01;
          } else if (minD === dBack) {
            resolved.z = box.min.z - playerRadius - 0.01;
          } else {
            resolved.z = box.max.z + playerRadius + 0.01;
          }
          collided = true;
        }
        // Case B: Player bounding circle overlaps the solid box surface within playerRadius
        else if (distSq < playerRadius * playerRadius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const overlap = playerRadius - dist;
            resolved.x += (dx / dist) * (overlap + 0.005);
            resolved.z += (dz / dist) * (overlap + 0.005);
          } else {
            // Degenerate center match: push away from box center
            const boxCx = (box.min.x + box.max.x) / 2;
            const boxCz = (box.min.z + box.max.z) / 2;
            const pushDirX = resolved.x >= boxCx ? 1 : -1;
            const pushDirZ = resolved.z >= boxCz ? 1 : -1;
            resolved.x += pushDirX * (playerRadius + 0.02);
            resolved.z += pushDirZ * (playerRadius + 0.02);
          }
          collided = true;
        }
      }

      if (!collided) break;
    }

    // 3. Ground height check (respecting current vertical position for multi-floor buildings)
    const floorY = this.getGroundHeight(resolved.x, resolved.z, oldPos.y);
    if (resolved.y < floorY) {
      resolved.y = floorY;
    }

    return resolved;
  }

  // Check if a point at player height collides with any solid obstacle that is too tall to step over
  collidesWithSolids(pos, radius, maxStepHeight) {
    const playerMinY = pos.y + maxStepHeight;
    const playerMaxY = pos.y + 1.7;

    for (const box of this.colliders) {
      if (box.type !== 'solid') continue;

      // Check vertical overlap
      if (playerMaxY < box.min.y || playerMinY > box.max.y) {
        continue;
      }

      // Check horizontal circular/AABB overlap
      const closestX = Math.max(box.min.x, Math.min(pos.x, box.max.x));
      const closestZ = Math.max(box.min.z, Math.min(pos.z, box.max.z));

      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;

      if ((dx * dx + dz * dz) < (radius * radius)) {
        return true;
      }
    }
    return false;
  }
}
