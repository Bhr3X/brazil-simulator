/**
 * Autonomous Roaming NPC System for Brazil Simulator (Pirituba, SP)
 * Features 4 iconic Brazilian characters roaming sidewalks with procedural 3D meshes,
 * waypoint navigation, walking animations, and dynamic interaction hooks.
 */

export class NpcSystem {
  constructor(scene, soundEngine, rng, textures = null) {
    this.scene = scene;
    this.sound = soundEngine;
    this.rng = rng;
    this.textures = textures;

    this.npcGroup = new THREE.Group();
    this.npcGroup.name = 'roaming_npcs';
    this.scene.add(this.npcGroup);

    this.npcs = [];
    this.activeTalkingNpc = null;

    this.initNpcs();
  }

  initNpcs() {
    // 1. Clodoaldo das Balas (Ambulante / Baleiro da Edgar Facó)
    const clodoaldo = this.createHumanoidNpc({
      id: 'clodoaldo',
      name: 'CLODOALDO DAS BALAS',
      prompt: 'CONVERSAR COM CLODOALDO (AMBULANTE)',
      encounterId: 'NPC_BALEIRO',
      shirtColor: 0x1a66b8,
      skinColor: 0x8d5524,
      pantsColor: 0x2b384a,
      capColor: 0xffcc00,
      hasCap: true,
      hasCoolerBox: true,
      speed: 1.4,
      waypoints: [
        { x: -22.0, z: 33.5 },
        { x: -8.0, z: 33.5 },
        { x: 6.0, z: 33.5 },
        { x: 22.0, z: 33.5 },
        { x: 6.0, z: 33.5 },
        { x: -8.0, z: 33.5 }
      ]
    });
    this.npcs.push(clodoaldo);

    // 2. Caramelo de Pirituba (O Lendário Cão Caramelo Comunitário)
    const caramelo = this.createCarameloNpc({
      id: 'caramelo',
      name: 'CARAMELO (CÃO COMUNITÁRIO)',
      prompt: 'FAZER CARINHO NO CÃO CARAMELO',
      encounterId: 'NPC_CARAMELO',
      speed: 2.0,
      waypoints: [
        { x: 26.0, z: 36.0 },
        { x: 13.0, z: 36.0 },
        { x: 4.0, z: 34.5 },
        { x: -5.0, z: 36.0 },
        { x: 10.0, z: 36.0 }
      ]
    });
    this.npcs.push(caramelo);

    // 3. Juninho da Monark (O Moleque do Grau de Bike)
    const juninho = this.createBikeNpc({
      id: 'juninho',
      name: 'JUNINHO DA MONARK',
      prompt: 'FALAR COM JUNINHO DA BIKE',
      encounterId: 'NPC_BIKE',
      shirtColor: 0x009944,
      skinColor: 0xa0673d,
      pantsColor: 0x18181a,
      speed: 3.2,
      waypoints: [
        { x: -36.0, z: 37.5 },
        { x: -16.0, z: 36.5 },
        { x: 8.0, z: 36.5 },
        { x: 28.0, z: 36.5 },
        { x: 8.0, z: 36.5 },
        { x: -16.0, z: 36.5 }
      ]
    });
    this.npcs.push(juninho);

    // 4. Dona Neide (A Tia da Marmita e da Feira)
    const donaNeide = this.createHumanoidNpc({
      id: 'dona_neide',
      name: 'DONA NEIDE (MARMITA & FEIRA)',
      prompt: 'CUMPRIMENTAR DONA NEIDE (FEIRA)',
      encounterId: 'NPC_DONA_NEIDE',
      shirtColor: 0xd95b96,
      skinColor: 0xb58055,
      pantsColor: 0xf5f5f5,
      hasCap: false,
      hasHairBun: true,
      hasShoppingBags: true,
      speed: 1.0,
      waypoints: [
        { x: -8.0, z: 35.5 },
        { x: -2.0, z: 35.5 },
        { x: 5.5, z: 35.5 },
        { x: -2.0, z: 35.5 }
      ]
    });
    this.npcs.push(donaNeide);
  }

  // Build articulated humanoid 3D mesh
  createHumanoidNpc(config) {
    const group = new THREE.Group();
    group.name = `npc_${config.id}`;

    const skinMat = new THREE.MeshLambertMaterial({ color: config.skinColor || 0x8d5524 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: config.shirtColor || 0x1155cc });
    const pantsMat = new THREE.MeshLambertMaterial({ color: config.pantsColor || 0x223344 });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.28);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.position.y = 1.05;
    group.add(torsoMesh);

    // 2. Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), skinMat);
    headGroup.add(headMesh);

    // Head Accessories
    if (config.hasCap) {
      const capMat = new THREE.MeshLambertMaterial({ color: config.capColor || 0xffcc00 });
      const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), capMat);
      capCrown.position.y = 0.14;
      headGroup.add(capCrown);
      // Cap visor backwards
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.18), capMat);
      visor.position.set(0, 0.1, -0.22);
      headGroup.add(visor);
    } else if (config.hasHairBun) {
      const hairMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
      const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hairMat);
      hairBun.position.set(0, 0.18, -0.12);
      headGroup.add(hairBun);
    }
    group.add(headGroup);

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.32, 1.35, 0);
    const lArmMesh = new THREE.Mesh(armGeo, skinMat);
    lArmMesh.position.y = -0.25;
    leftArm.add(lArmMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.32, 1.35, 0);
    const rArmMesh = new THREE.Mesh(armGeo, skinMat);
    rArmMesh.position.y = -0.25;
    rightArm.add(rArmMesh);
    group.add(rightArm);

    // 4. Legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.72, 0.18);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.15, 0.72, 0);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.36;
    leftLeg.add(lLegMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.15, 0.72, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.36;
    rightLeg.add(rLegMesh);
    group.add(rightLeg);

    // 5. Props (Cooler Box or Shopping Bags)
    if (config.hasCoolerBox) {
      const boxGroup = new THREE.Group();
      boxGroup.position.set(0, 0.95, 0.32);

      const coolerMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f5 });
      const coolerBox = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.32), coolerMat);
      boxGroup.add(coolerBox);

      const lidMat = new THREE.MeshLambertMaterial({ color: 0x1166cc });
      const coolerLid = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.34), lidMat);
      coolerLid.position.y = 0.2;
      boxGroup.add(coolerLid);

      group.add(boxGroup);
    } else if (config.hasShoppingBags) {
      const bagMatL = new THREE.MeshLambertMaterial({ color: 0xffd700 });
      const bagMatR = new THREE.MeshLambertMaterial({ color: 0x00b050 });

      const bagL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.15), bagMatL);
      bagL.position.set(-0.35, 0.65, 0.05);
      group.add(bagL);

      const bagR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.15), bagMatR);
      bagR.position.set(0.35, 0.65, 0.05);
      group.add(bagR);
    }

    // Set initial position
    const startWp = config.waypoints[0];
    group.position.set(startWp.x, 0, startWp.z);
    this.npcGroup.add(group);

    return {
      id: config.id,
      name: config.name,
      prompt: config.prompt,
      encounterId: config.encounterId,
      group,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      headGroup,
      waypoints: config.waypoints,
      currentWpIndex: 0,
      speed: config.speed || 1.4,
      animTimer: 0,
      animSpeed: 7.0,
      type: 'HUMANOID'
    };
  }

  // Build 4-legged articulated Cão Caramelo mesh
  createCarameloNpc(config) {
    const group = new THREE.Group();
    group.name = 'npc_caramelo';

    // Warm caramel fur material
    const furMat = new THREE.MeshLambertMaterial({ color: 0xd49339 });
    const darkFurMat = new THREE.MeshLambertMaterial({ color: 0x965a18 });
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    // 1. Dog Torso
    const bodyGeo = new THREE.BoxGeometry(0.32, 0.34, 0.62);
    const bodyMesh = new THREE.Mesh(bodyGeo, furMat);
    bodyMesh.position.y = 0.45;
    group.add(bodyMesh);

    // 2. Neck & Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0.35);

    const headGeo = new THREE.BoxGeometry(0.24, 0.24, 0.28);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.position.set(0, 0.08, 0.06);
    headGroup.add(headMesh);

    // Snout / Focinho
    const snoutMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.16), furMat);
    snoutMesh.position.set(0, 0.04, 0.24);
    headGroup.add(snoutMesh);

    // Black Nose tip
    const noseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), noseMat);
    noseMesh.position.set(0, 0.08, 0.32);
    headGroup.add(noseMesh);

    // Floppy Caramel Ears
    const lEar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.1), darkFurMat);
    lEar.position.set(-0.14, 0.14, 0.02);
    lEar.rotation.z = 0.25;
    headGroup.add(lEar);

    const rEar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.1), darkFurMat);
    rEar.position.set(0.14, 0.14, 0.02);
    rEar.rotation.z = -0.25;
    headGroup.add(rEar);

    group.add(headGroup);

    // 3. Four Articulated Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.36, 6);

    // Front Left Leg
    const flLeg = new THREE.Group();
    flLeg.position.set(-0.12, 0.32, 0.22);
    const flMesh = new THREE.Mesh(legGeo, furMat);
    flMesh.position.y = -0.16;
    flLeg.add(flMesh);
    group.add(flLeg);

    // Front Right Leg
    const frLeg = new THREE.Group();
    frLeg.position.set(0.12, 0.32, 0.22);
    const frMesh = new THREE.Mesh(legGeo, furMat);
    frMesh.position.y = -0.16;
    frLeg.add(frMesh);
    group.add(frLeg);

    // Back Left Leg
    const blLeg = new THREE.Group();
    blLeg.position.set(-0.12, 0.32, -0.22);
    const blMesh = new THREE.Mesh(legGeo, furMat);
    blMesh.position.y = -0.16;
    blLeg.add(blMesh);
    group.add(blLeg);

    // Back Right Leg
    const brLeg = new THREE.Group();
    brLeg.position.set(0.12, 0.32, -0.22);
    const brMesh = new THREE.Mesh(legGeo, furMat);
    brMesh.position.y = -0.16;
    brLeg.add(brMesh);
    group.add(brLeg);

    // 4. Wagging Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.55, -0.3);
    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.32, 6), furMat);
    tailMesh.position.set(0, 0.12, -0.1);
    tailMesh.rotation.x = -0.7;
    tailGroup.add(tailMesh);
    group.add(tailGroup);

    const startWp = config.waypoints[0];
    group.position.set(startWp.x, 0, startWp.z);
    this.npcGroup.add(group);

    return {
      id: config.id,
      name: config.name,
      prompt: config.prompt,
      encounterId: config.encounterId,
      group,
      headGroup,
      flLeg,
      frLeg,
      blLeg,
      brLeg,
      tailGroup,
      waypoints: config.waypoints,
      currentWpIndex: 0,
      speed: config.speed || 2.0,
      animTimer: 0,
      animSpeed: 10.0,
      type: 'CARAMELO'
    };
  }

  // Build Juninho riding bicycle mesh
  createBikeNpc(config) {
    const group = new THREE.Group();
    group.name = 'npc_juninho_bike';

    // 1. Red Bicycle Frame
    const bikeGroup = new THREE.Group();
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xcc1111 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x888899 });
    const rubberMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // Wheels (Front & Back)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    const fWheel = new THREE.Mesh(wheelGeo, rubberMat);
    fWheel.position.set(0, 0.32, 0.65);
    bikeGroup.add(fWheel);

    const rWheel = new THREE.Mesh(wheelGeo, rubberMat);
    rWheel.position.set(0, 0.32, -0.65);
    bikeGroup.add(rWheel);

    // Frame tubes (Top tube, down tube, seat tube)
    const tubeMat = frameMat;
    const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), tubeMat);
    topTube.position.set(0, 0.72, 0);
    topTube.rotation.x = Math.PI / 2;
    bikeGroup.add(topTube);

    const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6), tubeMat);
    downTube.position.set(0, 0.52, 0.12);
    downTube.rotation.x = -Math.PI / 4;
    bikeGroup.add(downTube);

    // Handlebars
    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.04), metalMat);
    handleBar.position.set(0, 0.96, 0.45);
    bikeGroup.add(handleBar);

    // Seat / Selim
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.26), rubberMat);
    seat.position.set(0, 0.82, -0.22);
    bikeGroup.add(seat);

    group.add(bikeGroup);

    // 2. Juninho Cyclist Avatar
    const skinMat = new THREE.MeshLambertMaterial({ color: config.skinColor || 0xa0673d });
    const shirtMat = new THREE.MeshLambertMaterial({ color: config.shirtColor || 0x009944 });
    const pantsMat = new THREE.MeshLambertMaterial({ color: config.pantsColor || 0x18181a });

    // Torso leaning forward
    const riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.24), shirtMat);
    riderTorso.position.set(0, 1.15, -0.1);
    riderTorso.rotation.x = 0.35;
    group.add(riderTorso);

    // Head
    const riderHead = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), skinMat);
    riderHead.position.set(0, 1.55, 0.04);
    group.add(riderHead);

    // Legs on pedals
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), pantsMat);
    leftLeg.position.set(-0.16, 0.68, -0.12);
    leftLeg.rotation.x = 0.6;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), pantsMat);
    rightLeg.position.set(0.16, 0.68, -0.12);
    rightLeg.rotation.x = 0.2;
    group.add(rightLeg);

    const startWp = config.waypoints[0];
    group.position.set(startWp.x, 0, startWp.z);
    this.npcGroup.add(group);

    return {
      id: config.id,
      name: config.name,
      prompt: config.prompt,
      encounterId: config.encounterId,
      group,
      fWheel,
      rWheel,
      leftLeg,
      rightLeg,
      waypoints: config.waypoints,
      currentWpIndex: 0,
      speed: config.speed || 3.2,
      animTimer: 0,
      animSpeed: 8.0,
      type: 'BIKE'
    };
  }

  // Update NPC navigation, motion, and visual animations
  update(delta, playerPos, isModalOpen, gameState = null) {
    for (const npc of this.npcs) {
      // 1. Companion logic: If Caramelo is player's companion, follow player!
      if (npc.id === 'caramelo' && gameState && gameState.flags && gameState.flags.carameloCompanheiro) {
        this.updateCompanionCaramelo(npc, playerPos, delta, isModalOpen);
        continue;
      }

      // 2. Waypoint navigation along streets and sidewalks
      const targetWp = npc.waypoints[npc.currentWpIndex];
      const dx = targetWp.x - npc.group.position.x;
      const dz = targetWp.z - npc.group.position.z;
      const distToWp = Math.sqrt(dx * dx + dz * dz);

      // Advance to next waypoint if reached
      if (distToWp < 1.0) {
        npc.currentWpIndex = (npc.currentWpIndex + 1) % npc.waypoints.length;
      }

      // Check distance to player for conversational pauses
      const distToPlayer = Math.sqrt(
        (playerPos.x - npc.group.position.x) ** 2 +
        (playerPos.z - npc.group.position.z) ** 2
      );

      // Pause moving if active dialog is open and player is interacting nearby
      const isTalkingToThisNpc = isModalOpen && distToPlayer < 4.0;
      if (isTalkingToThisNpc) {
        // Face the player smoothly
        const lookAngle = Math.atan2(playerPos.x - npc.group.position.x, playerPos.z - npc.group.position.z);
        npc.group.rotation.y = lookAngle;
        continue;
      }

      // Move towards target waypoint
      if (distToWp > 0.05) {
        const moveDist = Math.min(npc.speed * delta, distToWp);
        const dirX = dx / distToWp;
        const dirZ = dz / distToWp;

        npc.group.position.x += dirX * moveDist;
        npc.group.position.z += dirZ * moveDist;

        // Orient heading along movement trajectory
        const targetYaw = Math.atan2(dirX, dirZ);
        npc.group.rotation.y = targetYaw;

        // Advance animation
        npc.animTimer += delta;
        this.animateNpc(npc, delta);
      }
    }
  }

  // Update Caramelo trotting beside player as loyal companion
  updateCompanionCaramelo(caramelo, playerPos, delta, isModalOpen) {
    const dx = playerPos.x - caramelo.group.position.x;
    const dz = playerPos.z - caramelo.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Stop at friendly companion radius (~1.6m)
    if (dist > 1.6) {
      const moveDist = Math.min(caramelo.speed * 1.5 * delta, dist - 1.5);
      const dirX = dx / dist;
      const dirZ = dz / dist;

      caramelo.group.position.x += dirX * moveDist;
      caramelo.group.position.z += dirZ * moveDist;

      caramelo.group.rotation.y = Math.atan2(dirX, dirZ);
      caramelo.animTimer += delta * 1.4;
      this.animateNpc(caramelo, delta);
    } else {
      // Idle tail wagging beside player
      caramelo.animTimer += delta;
      if (caramelo.tailGroup) {
        caramelo.tailGroup.rotation.y = Math.sin(caramelo.animTimer * 14) * 0.45;
      }
    }
  }

  // Animate character limbs based on type
  animateNpc(npc, delta) {
    if (npc.type === 'HUMANOID') {
      const legSwing = Math.sin(npc.animTimer * npc.animSpeed) * 0.55;
      const armSwing = Math.sin(npc.animTimer * npc.animSpeed) * 0.45;

      npc.leftLeg.rotation.x = legSwing;
      npc.rightLeg.rotation.x = -legSwing;
      npc.leftArm.rotation.x = -armSwing;
      npc.rightArm.rotation.x = armSwing;

      // Subtle walking vertical bob
      npc.group.position.y = Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.05;
    } else if (npc.type === 'CARAMELO') {
      const trot = Math.sin(npc.animTimer * npc.animSpeed) * 0.5;

      // Diagonal trotting gait
      npc.flLeg.rotation.x = trot;
      npc.brLeg.rotation.x = trot;
      npc.frLeg.rotation.x = -trot;
      npc.blLeg.rotation.x = -trot;

      // Energetic tail wag
      if (npc.tailGroup) {
        npc.tailGroup.rotation.y = Math.sin(npc.animTimer * 16) * 0.5;
      }

      npc.group.position.y = Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.04;
    } else if (npc.type === 'BIKE') {
      // Spin bicycle wheels
      const spinSpeed = npc.speed * 5.0 * delta;
      npc.fWheel.rotation.x += spinSpeed;
      npc.rWheel.rotation.x += spinSpeed;

      // Pedaling legs
      const pedalCycle = Math.sin(npc.animTimer * npc.animSpeed) * 0.35;
      npc.leftLeg.rotation.x = 0.6 + pedalCycle;
      npc.rightLeg.rotation.x = 0.2 - pedalCycle;
    }
  }

  // Expose dynamic targets for raycast interaction in InteractableSystem
  getInteractableTargets() {
    return this.npcs.map(npc => ({
      id: npc.id,
      name: npc.name,
      prompt: npc.prompt,
      encounterId: npc.encounterId,
      position: npc.group.position,
      maxDist: npc.type === 'BIKE' ? 4.0 : 3.5,
      isOpen: true,
      isNpc: true
    }));
  }
}
