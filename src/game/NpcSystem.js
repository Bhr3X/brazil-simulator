/**
 * Autonomous Roaming NPC System for Brazil Simulator (Pirituba, SP)
 * Features 4 iconic Brazilian characters roaming sidewalks with procedural 3D meshes,
 * waypoint navigation, walking animations, and dynamic interaction hooks.
 */

import { ZoneManager, WORLD_ZONES } from '../world/Zones.js';
import { Rng } from './Rng.js';

const EVENT_CULL_DISTANCE = 70;
const BLOCO_ZONE_ID = 'BLOCO_EDGAR_FACCO';
const CAMPINHO_ZONE_ID = 'CAMPINHO_CHURRASCO';
const CARNIVAL_COSTUMES = ['spider', 'nocturnal_cape', 'red_gold_armor', 'neon_masked', 'round_mascot', 'antenna_suit'];

export class NpcSystem {
  constructor(scene, soundEngine, rng, textures = null) {
    this.scene = scene;
    this.sound = soundEngine;
    this.rng = rng;
    this.crowdRng = new Rng((((rng && rng.seed) ? rng.seed : 1) ^ 0xC4A111) >>> 0);
    this.textures = textures;

    this.npcGroup = new THREE.Group();
    this.npcGroup.name = 'roaming_npcs';
    this.scene.add(this.npcGroup);

    this.npcs = [];
    this.activeTalkingNpc = null;
    this.blocoSpectatorGroup = null;
    this.campinhoSpectatorGroup = null;

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

    // 5. Sargento Rocha (Polícia Militar de SP - Ronda Ostensiva)
    const sargentoRocha = this.createHumanoidNpc({
      id: 'sargento_rocha',
      name: 'SARGENTO ROCHA (PMESP)',
      prompt: 'FALAR COM SARGENTO ROCHA (PMESP)',
      encounterId: 'NPC_POLICIA',
      shirtColor: 0x4f5d6b, // PM gray uniform
      skinColor: 0x8a5832,
      pantsColor: 0x1c2430, // Navy dark trousers
      hasPoliceCap: true,
      hasPoliceBelt: true,
      speed: 1.2,
      waypoints: [
        { x: 1.5, z: 8.0 },
        { x: 4.5, z: -4.0 },
        { x: 20.0, z: -4.0 },
        { x: -15.0, z: -4.0 },
        { x: -3.5, z: -4.0 },
        { x: 1.5, z: 8.0 }
      ]
    });
    this.npcs.push(sargentoRocha);

    // 6. Menor do Corre (Malandro / Aviãozinho da Quebrada)
    const menorCorre = this.createHumanoidNpc({
      id: 'menor_corre',
      name: 'MENOR DO CORRE (MALANDRO)',
      prompt: 'TROCAR UMA IDÉIA COM MENOR DO CORRE',
      encounterId: 'NPC_MALANDRO',
      shirtColor: 0x1e1e24, // Camisa preta / regata
      skinColor: 0x9c653d,
      pantsColor: 0x0077cc, // Bermuda tactel azul
      hasForwardCap: true,
      capColor: 0x111111,
      hasShoulderBag: true,
      speed: 1.5,
      waypoints: [
        { x: -16.0, z: -4.0 },
        { x: 14.0, z: -4.0 },
        { x: 1.5, z: -12.0 },
        { x: 20.0, z: -20.0 },
        { x: -14.0, z: -20.0 },
        { x: 1.5, z: -12.0 }
      ]
    });
    this.npcs.push(menorCorre);

    this.initEventCrowds();
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
    if (config.hasPoliceCap) {
      const capMat = new THREE.MeshLambertMaterial({ color: 0x1e2733 });
      const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), capMat);
      capCrown.position.y = 0.15;
      headGroup.add(capCrown);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.16), capMat);
      visor.position.set(0, 0.1, 0.22);
      headGroup.add(visor);

      const goldBadge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), new THREE.MeshLambertMaterial({ color: 0xf1c40f }));
      goldBadge.position.set(0, 0.16, 0.18);
      headGroup.add(goldBadge);
    } else if (config.hasForwardCap) {
      const capMat = new THREE.MeshLambertMaterial({ color: config.capColor || 0x111111 });
      const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), capMat);
      capCrown.position.y = 0.14;
      headGroup.add(capCrown);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.18), capMat);
      visor.position.set(0, 0.1, 0.22);
      headGroup.add(visor);
    } else if (config.hasCap) {
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
    } else if (config.hasPoliceBelt) {
      const beltMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.3), beltMat);
      belt.position.y = 0.77;
      group.add(belt);

      const holster = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), beltMat);
      holster.position.set(0.28, 0.74, 0.05);
      group.add(holster);

      const badgeMat = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
      const chestBadge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.02), badgeMat);
      chestBadge.position.set(-0.14, 1.22, 0.15);
      group.add(chestBadge);
    } else if (config.hasShoulderBag) {
      const strapMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.3), strapMat);
      strap.position.set(0.0, 1.1, 0.02);
      strap.rotation.z = 0.55;
      group.add(strap);

      const pouchMat = new THREE.MeshLambertMaterial({ color: 0x222225 });
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.12), pouchMat);
      pouch.position.set(-0.25, 0.82, 0.15);
      group.add(pouch);

      const chainMat = new THREE.MeshLambertMaterial({ color: 0xdeb841 });
      const chain = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.15), chainMat);
      chain.position.set(0.0, 1.34, 0.12);
      group.add(chain);
    }

    this.applyCarnivalCostume(group, headGroup, config.costumeId);

    // Set initial position (waypoint y / baseY keep elevated NPCs off the street plane)
    const startWp = config.waypoints[0];
    const startY = startWp.y != null ? startWp.y : (config.baseY != null ? config.baseY : 0);
    group.position.set(startWp.x, startY, startWp.z);
    if (config.zoneId) group.visible = false;
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
      animTimer: config.animTimer != null ? config.animTimer : 0,
      animSpeed: config.animSpeed || 7.0,
      type: 'HUMANOID',
      zoneId: config.zoneId || null,
      interactable: config.interactable !== false,
      animationMode: config.animationMode || null,
      baseY: config.baseY != null ? config.baseY : startY,
      costumeId: config.costumeId || null
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
    const hour = (gameState && typeof gameState.currentHour === 'number') ? gameState.currentHour : 6;
    this.updateEventVisibility(hour);

    for (const npc of this.npcs) {
      // 1. Companion logic: If Caramelo is player's companion, follow player!
      if (npc.id === 'caramelo' && gameState && gameState.flags && gameState.flags.carameloCompanheiro) {
        this.updateCompanionCaramelo(npc, playerPos, delta, isModalOpen);
        continue;
      }

      if (npc.zoneId) {
        if (!this.isZoneNpcActive(npc, hour)) continue;
        const dist3 = Math.hypot(
          playerPos.x - npc.group.position.x,
          (playerPos.y || 0) - npc.group.position.y,
          playerPos.z - npc.group.position.z
        );
        if (dist3 > EVENT_CULL_DISTANCE) continue;
      }

      // 2. Waypoint navigation along streets and sidewalks
      let targetWp = npc.waypoints[npc.currentWpIndex];
      let dx = targetWp.x - npc.group.position.x;
      let dz = targetWp.z - npc.group.position.z;
      let distToWp = Math.sqrt(dx * dx + dz * dz);

      // Advance to next waypoint if reached, then steer toward the new target this frame
      if (distToWp < 1.0) {
        npc.currentWpIndex = (npc.currentWpIndex + 1) % npc.waypoints.length;
        targetWp = npc.waypoints[npc.currentWpIndex];
        dx = targetWp.x - npc.group.position.x;
        dz = targetWp.z - npc.group.position.z;
        distToWp = Math.sqrt(dx * dx + dz * dz);
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

      const isDance = npc.animationMode === 'DANCE';

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

        if (!isDance) {
          npc.animTimer += delta;
          this.animateNpc(npc, delta);
        }
      }

      if (isDance) {
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
    const baseY = npc.baseY != null ? npc.baseY : 0;

    if (npc.animationMode === 'DANCE') {
      const sway = Math.sin(npc.animTimer * 6.0) * 0.35;
      npc.leftArm.rotation.z = 0.8 + sway;
      npc.rightArm.rotation.z = -0.8 - sway;
      npc.leftArm.rotation.x = Math.sin(npc.animTimer * 7.0) * 0.4;
      npc.rightArm.rotation.x = Math.cos(npc.animTimer * 7.0) * 0.4;
      npc.leftLeg.rotation.x = Math.sin(npc.animTimer * 5.0) * 0.12;
      npc.rightLeg.rotation.x = -npc.leftLeg.rotation.x;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * 8.0)) * 0.08;
      return;
    }

    if (npc.animationMode === 'FOOTBALL') {
      const kick = Math.sin(npc.animTimer * npc.animSpeed) * 0.7;
      npc.leftLeg.rotation.x = kick;
      npc.rightLeg.rotation.x = -kick * 0.45;
      npc.leftArm.rotation.x = -kick * 0.3;
      npc.rightArm.rotation.x = kick * 0.3;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.06;
      return;
    }

    if (npc.animationMode === 'RUN') {
      const swing = Math.sin(npc.animTimer * npc.animSpeed) * 0.7;
      npc.leftLeg.rotation.x = swing;
      npc.rightLeg.rotation.x = -swing;
      npc.leftArm.rotation.x = -swing * 0.85;
      npc.rightArm.rotation.x = swing * 0.85;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.07;
      return;
    }

    if (npc.type === 'HUMANOID') {
      const legSwing = Math.sin(npc.animTimer * npc.animSpeed) * 0.55;
      const armSwing = Math.sin(npc.animTimer * npc.animSpeed) * 0.45;

      npc.leftLeg.rotation.x = legSwing;
      npc.rightLeg.rotation.x = -legSwing;
      npc.leftArm.rotation.x = -armSwing;
      npc.rightArm.rotation.x = armSwing;

      // Subtle walking vertical bob relative to street or elevated base
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.05;
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

      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.04;
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
    return this.npcs.filter((npc) => npc.interactable !== false).map(npc => ({
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

  isZoneNpcActive(npc, hour) {
    if (!npc.zoneId) return true;
    const zone = WORLD_ZONES.find((z) => z.id === npc.zoneId);
    return ZoneManager.isZoneOpen(zone, hour);
  }

  updateEventVisibility(hour) {
    const blocoZone = WORLD_ZONES.find((z) => z.id === BLOCO_ZONE_ID);
    const campZone = WORLD_ZONES.find((z) => z.id === CAMPINHO_ZONE_ID);
    const blocoOpen = ZoneManager.isZoneOpen(blocoZone, hour);
    const campOpen = ZoneManager.isZoneOpen(campZone, hour);
    for (const npc of this.npcs) {
      if (npc.zoneId === BLOCO_ZONE_ID) npc.group.visible = blocoOpen;
      if (npc.zoneId === CAMPINHO_ZONE_ID) npc.group.visible = campOpen;
    }
    if (this.blocoSpectatorGroup) this.blocoSpectatorGroup.visible = blocoOpen;
    if (this.campinhoSpectatorGroup) this.campinhoSpectatorGroup.visible = campOpen;
  }

  shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.crowdRng.int(0, i);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  applyCarnivalCostume(group, headGroup, costumeId) {
    if (!costumeId) return;
    if (costumeId === 'spider') {
      const extraMat = new THREE.MeshLambertMaterial({ color: 0x330000 });
      [-0.18, 0.18].forEach((x) => {
        const limb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.42), extraMat);
        limb.position.set(x, 1.15, -0.22);
        limb.rotation.x = 0.6;
        group.add(limb);
      });
      const abdomen = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.2), extraMat);
      abdomen.position.set(0, 1.0, -0.22);
      group.add(abdomen);
      return;
    }
    if (costumeId === 'nocturnal_cape') {
      const cape = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.95, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x0b0b18 })
      );
      cape.position.set(0, 1.05, -0.2);
      cape.rotation.x = 0.15;
      group.add(cape);
      return;
    }
    if (costumeId === 'red_gold_armor') {
      const gold = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
      const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), gold);
      pauldronL.position.set(-0.32, 1.32, 0);
      group.add(pauldronL);
      const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), gold);
      pauldronR.position.set(0.32, 1.32, 0);
      group.add(pauldronR);
      return;
    }
    if (costumeId === 'neon_masked') {
      const mask = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.14, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x22d3ee })
      );
      mask.position.set(0, 0.02, 0.16);
      headGroup.add(mask);
      return;
    }
    if (costumeId === 'round_mascot') {
      const noggin = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 10, 10),
        new THREE.MeshLambertMaterial({ color: 0xf2c14e })
      );
      noggin.position.set(0, 0.06, 0);
      headGroup.add(noggin);
      return;
    }
    if (costumeId === 'antenna_suit') {
      const antMat = new THREE.MeshLambertMaterial({ color: 0xf5d90a });
      const bulbMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
      [-0.08, 0.08].forEach((x) => {
        const rod = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 0.03), antMat);
        rod.position.set(x, 0.28, 0);
        headGroup.add(rod);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), bulbMat);
        bulb.position.set(x, 0.42, 0);
        headGroup.add(bulb);
      });
    }
  }

  initEventCrowds() {
    const costumes = this.shuffleInPlace(CARNIVAL_COSTUMES.slice());
    const costumeColors = {
      spider: { shirt: 0x1a0508, pants: 0x111111, skin: 0x8d5524 },
      nocturnal_cape: { shirt: 0x141428, pants: 0x0a0a12, skin: 0x6b4423 },
      red_gold_armor: { shirt: 0xb91c1c, pants: 0x7f1d1d, skin: 0xa0673d },
      neon_masked: { shirt: 0x22c55e, pants: 0x14532d, skin: 0x8d5524 },
      round_mascot: { shirt: 0xf59e0b, pants: 0xc2410c, skin: 0xf2c14e },
      antenna_suit: { shirt: 0x7c3aed, pants: 0x4c1d95, skin: 0xb58055 }
    };

    const dancerLoops = this.shuffleInPlace([
      [{ x: 140.2, z: 47.2 }, { x: 141.4, z: 48.4 }],
      [{ x: 146.0, z: 48.6 }, { x: 147.1, z: 49.4 }],
      [{ x: 151.8, z: 47.0 }, { x: 150.6, z: 48.3 }],
      [{ x: 146.2, z: 37.6 }, { x: 147.4, z: 38.8 }],
      [{ x: 138.8, z: 45.5 }, { x: 139.6, z: 46.8 }],
      [{ x: 153.4, z: 45.2 }, { x: 154.2, z: 46.6 }]
    ]);

    const runnerLoops = [
      [{ x: 137.0, z: 39.0 }, { x: 137.0, z: 48.0 }, { x: 155.0, z: 48.0 }, { x: 155.0, z: 39.0 }],
      [{ x: 136.5, z: 38.2 }, { x: 136.5, z: 49.0 }, { x: 155.5, z: 49.0 }, { x: 155.5, z: 38.2 }],
      [{ x: 138.0, z: 40.0 }, { x: 154.0, z: 40.0 }, { x: 154.0, z: 47.2 }, { x: 138.0, z: 47.2 }]
    ];

    for (let i = 0; i < 4; i++) {
      const costumeId = costumes[i];
      const pal = costumeColors[costumeId];
      this.npcs.push(this.createHumanoidNpc({
        id: `bloco_dancer_${i}`,
        name: 'FOLIAO DO BLOCO',
        prompt: '',
        encounterId: null,
        shirtColor: pal.shirt,
        skinColor: pal.skin,
        pantsColor: pal.pants,
        speed: 0.55,
        waypoints: dancerLoops[i],
        zoneId: BLOCO_ZONE_ID,
        interactable: false,
        animationMode: 'DANCE',
        baseY: 0,
        costumeId,
        animTimer: this.crowdRng.range(0, Math.PI * 2),
        animSpeed: 6.0
      }));
    }

    for (let i = 0; i < 2; i++) {
      const costumeId = costumes[4 + i];
      const pal = costumeColors[costumeId];
      this.npcs.push(this.createHumanoidNpc({
        id: `bloco_runner_${i}`,
        name: 'CORREDOR DO BLOCO',
        prompt: '',
        encounterId: null,
        shirtColor: pal.shirt,
        skinColor: pal.skin,
        pantsColor: pal.pants,
        speed: 3.1,
        waypoints: runnerLoops[this.crowdRng.int(0, runnerLoops.length - 1)],
        zoneId: BLOCO_ZONE_ID,
        interactable: false,
        animationMode: 'RUN',
        baseY: 0,
        costumeId,
        animTimer: this.crowdRng.range(0, Math.PI * 2),
        animSpeed: 10.0
      }));
    }

    const footballPaths = this.shuffleInPlace([
      [{ x: -10, y: 9.5, z: -99 }, { x: -10, y: 9.5, z: -94 }, { x: -6, y: 9.5, z: -99 }],
      [{ x: 10, y: 9.5, z: -99 }, { x: 10, y: 9.5, z: -104 }, { x: 6, y: 9.5, z: -99 }],
      [{ x: 0, y: 9.5, z: -94 }, { x: 4, y: 9.5, z: -96 }, { x: 0, y: 9.5, z: -98 }],
      [{ x: -4, y: 9.5, z: -99 }, { x: 4, y: 9.5, z: -99 }],
      [{ x: -8, y: 9.5, z: -104 }, { x: 8, y: 9.5, z: -104 }],
      [{ x: -12, y: 9.5, z: -99 }, { x: -11, y: 9.5, z: -97 }, { x: -11, y: 9.5, z: -101 }],
      [{ x: 8, y: 9.5, z: -96 }, { x: 3, y: 9.5, z: -100 }, { x: 8, y: 9.5, z: -103 }],
      [{ x: -2, y: 9.5, z: -102 }, { x: 2, y: 9.5, z: -93 }, { x: -5, y: 9.5, z: -97 }]
    ]);
    const kits = [
      { shirt: 0x16a34a, pants: 0xffffff, skin: 0x8d5524 },
      { shirt: 0xf8fafc, pants: 0x111827, skin: 0xa0673d },
      { shirt: 0x2563eb, pants: 0x1e3a8a, skin: 0x9c653d },
      { shirt: 0xdc2626, pants: 0xffffff, skin: 0xb58055 },
      { shirt: 0xfacc15, pants: 0x1f2937, skin: 0x8a5832 },
      { shirt: 0x0f172a, pants: 0x22c55e, skin: 0x6b4423 }
    ];

    for (let i = 0; i < 6; i++) {
      const kit = kits[this.crowdRng.int(0, kits.length - 1)];
      this.npcs.push(this.createHumanoidNpc({
        id: `campinho_player_${i}`,
        name: 'JOGADOR DO CAMPINHO',
        prompt: '',
        encounterId: null,
        shirtColor: kit.shirt,
        skinColor: kit.skin,
        pantsColor: kit.pants,
        speed: 2.15,
        waypoints: footballPaths[i],
        zoneId: CAMPINHO_ZONE_ID,
        interactable: false,
        animationMode: 'FOOTBALL',
        baseY: 9.5,
        animTimer: this.crowdRng.range(0, Math.PI * 2),
        animSpeed: 8.0
      }));
    }

    this.initEventSpectators();
  }

  initEventSpectators() {
    if (!this._spectatorGeo) {
      this._spectatorGeo = new THREE.BoxGeometry(0.36, 1.1, 0.26);
      this._blocoSpecMat = new THREE.MeshLambertMaterial({ color: 0xdb2777 });
      this._campSpecMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    }

    const dummy = new THREE.Object3D();
    const placeInstances = (mesh, spots, baseY) => {
      for (let i = 0; i < 16; i++) {
        const spot = spots[i];
        dummy.position.set(
          spot.x + this.crowdRng.range(-0.15, 0.15),
          baseY + 0.55,
          spot.z + this.crowdRng.range(-0.15, 0.15)
        );
        dummy.rotation.set(0, this.crowdRng.range(0, Math.PI * 2), 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    const blocoSpots = [
      { x: 134.2, z: 50.4 }, { x: 137.4, z: 50.6 }, { x: 140.6, z: 50.5 }, { x: 144.0, z: 50.7 },
      { x: 147.6, z: 50.5 }, { x: 151.0, z: 50.6 }, { x: 154.4, z: 50.4 }, { x: 157.4, z: 50.2 },
      { x: 133.4, z: 36.4 }, { x: 133.6, z: 39.2 }, { x: 133.5, z: 46.8 }, { x: 133.6, z: 49.2 },
      { x: 158.6, z: 36.6 }, { x: 158.4, z: 39.4 }, { x: 158.5, z: 46.6 }, { x: 158.4, z: 49.0 }
    ];
    const campSpots = [
      { x: -12.0, z: -107.4 }, { x: -8.0, z: -107.6 }, { x: -4.0, z: -107.5 }, { x: 0.0, z: -107.6 },
      { x: 4.0, z: -107.5 }, { x: 8.0, z: -107.4 }, { x: 12.0, z: -107.6 }, { x: -12.0, z: -90.6 },
      { x: -6.0, z: -90.4 }, { x: 0.0, z: -90.5 }, { x: 6.0, z: -90.4 }, { x: 12.0, z: -90.6 },
      { x: -16.2, z: -102.0 }, { x: -16.2, z: -96.0 }, { x: 16.2, z: -102.0 }, { x: 16.2, z: -96.0 }
    ];

    this.blocoSpectatorGroup = new THREE.Group();
    this.blocoSpectatorGroup.name = 'blocoSpectatorGroup';
    const blocoMesh = new THREE.InstancedMesh(this._spectatorGeo, this._blocoSpecMat, 16);
    blocoMesh.count = 16;
    blocoMesh.name = 'blocoSpectators';
    placeInstances(blocoMesh, blocoSpots, 0);
    this.blocoSpectatorGroup.add(blocoMesh);
    this.blocoSpectatorGroup.visible = false;
    this.npcGroup.add(this.blocoSpectatorGroup);

    this.campinhoSpectatorGroup = new THREE.Group();
    this.campinhoSpectatorGroup.name = 'campinhoSpectatorGroup';
    const campMesh = new THREE.InstancedMesh(this._spectatorGeo, this._campSpecMat, 16);
    campMesh.count = 16;
    campMesh.name = 'campinhoSpectators';
    placeInstances(campMesh, campSpots, 9.5);
    this.campinhoSpectatorGroup.add(campMesh);
    this.campinhoSpectatorGroup.visible = false;
    this.npcGroup.add(this.campinhoSpectatorGroup);
  }
}
