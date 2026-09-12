/**
 * Autonomous Roaming NPC System for Brazil Simulator (Pirituba, SP)
 * Features 4 iconic Brazilian characters roaming sidewalks with procedural 3D meshes,
 * waypoint navigation, walking animations, and dynamic interaction hooks.
 */

import { ZoneManager, WORLD_ZONES } from '../world/Zones.js';

const EVENT_CULL_DISTANCE = 70;
const BLOCO_ZONE_ID = 'BLOCO_EDGAR_FACCO';
const CAMPINHO_ZONE_ID = 'CAMPINHO_CHURRASCO';
const CARNIVAL_COSTUMES = ['spider', 'nocturnal_cape', 'red_gold_armor', 'neon_masked', 'round_mascot', 'antenna_suit'];

export class NpcSystem {
  constructor(scene, soundEngine, rng, textures = null) {
    this.scene = scene;
    this.sound = soundEngine;
    this.rng = rng;
    this.textures = textures;
    this.currentHour = 6;

    this.npcGroup = new THREE.Group();
    this.npcGroup.name = 'roaming_npcs';
    this.scene.add(this.npcGroup);

    this.npcs = [];
    this.establishmentNpcs = [];
    this.pastelariaNpcs = [];
    this.barTiaoNpcs = [];
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
    this.initEventHosts();
    this.initEstablishmentNpcs();
    this.initCitywidePedestrians();
    this.initPastelariaNpcs();
    this.initBarTiaoNpcs();
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
    } else if (config.hasChefHat) {
      const hatMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), hatMat);
      hatBand.position.y = 0.2;
      headGroup.add(hatBand);
      const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.22, 12), hatMat);
      hatCrown.name = 'npc_chef_hat';
      hatCrown.position.y = 0.32;
      headGroup.add(hatCrown);
    } else if (config.hasHairnet) {
      const netMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      const netMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 10), netMat);
      netMesh.name = 'npc_hairnet';
      netMesh.position.set(0, 0.08, 0);
      headGroup.add(netMesh);
    }

    // Facial features: glasses & boteco mustache
    if (config.hasGlasses) {
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.04), frameMat);
      glasses.name = 'npc_glasses';
      glasses.position.set(0, 0.02, 0.16);
      headGroup.add(glasses);
    }
    if (config.hasMustache) {
      const stacheMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.06), stacheMat);
      mustache.name = 'npc_mustache';
      mustache.position.set(0, -0.06, 0.16);
      headGroup.add(mustache);
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

    // 5. Props (Cooler Box, Shopping Bags, Apron, Cloth, Tongs, Scoop, Lanyard)
    if (config.hasApron) {
      const apronMat = new THREE.MeshLambertMaterial({ color: config.apronColor || 0xffffff });
      const apronBib = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.04), apronMat);
      apronBib.name = 'npc_apron';
      apronBib.position.set(0, 1.05, 0.15);
      group.add(apronBib);
      const apronSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.45, 0.04), apronMat);
      apronSkirt.position.set(0, 0.62, 0.15);
      group.add(apronSkirt);
    }

    if (config.hasCloth) {
      const clothMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), clothMat);
      cloth.name = 'npc_cloth';
      cloth.position.set(-0.24, 1.25, 0.08);
      group.add(cloth);
    }

    if (config.hasTongs) {
      const tongMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
      const tongs = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.04), tongMat);
      tongs.name = 'npc_tongs';
      tongs.position.set(0, -0.38, 0.08);
      rightArm.add(tongs);
    }

    if (config.hasScoop) {
      const scoopMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
      const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.1), scoopMat);
      scoop.name = 'npc_scoop';
      scoop.position.set(0, -0.35, 0.08);
      rightArm.add(scoop);
    }

    if (config.hasLanyard) {
      const strapMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
      const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.02), strapMat);
      strapL.position.set(-0.08, 1.15, 0.15);
      group.add(strapL);
      const strapR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.02), strapMat);
      strapR.position.set(0.08, 1.15, 0.15);
      group.add(strapR);
      const whistle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
      whistle.name = 'npc_lanyard';
      whistle.position.set(0, 0.92, 0.16);
      group.add(whistle);
    }

    if (config.hasCross) {
      const crossMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
      const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.03), crossMat);
      crossVert.name = 'npc_cross';
      crossVert.position.set(0, 1.15, 0.16);
      group.add(crossVert);
      const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.03), crossMat);
      crossHoriz.position.set(0, 1.20, 0.16);
      group.add(crossHoriz);
    }

    if (config.hasBook) {
      const bookMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.22), bookMat);
      book.name = 'npc_book';
      book.position.set(0.12, -0.28, 0.08);
      leftArm.add(book);
    }

    if (config.hasCrate) {
      const crateMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.28), crateMat);
      crate.name = 'npc_crate';
      crate.position.set(0, 0.85, 0.25);
      group.add(crate);
    }

    if (config.hasPlatter) {
      const platterMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
      const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 12), platterMat);
      platter.name = 'npc_platter';
      platter.position.set(0, -0.32, 0.2);
      rightArm.add(platter);
      const meatMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const meat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.12), meatMat);
      meat.position.set(0, 0.04, 0);
      platter.add(meat);
    }

    if (config.hasLabCoat) {
      const coatMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const coatTorso = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.68, 0.31), coatMat);
      coatTorso.name = 'npc_labcoat';
      coatTorso.position.y = 1.05;
      group.add(coatTorso);
      const coatSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.3), coatMat);
      coatSkirt.position.set(0, 0.62, 0);
      group.add(coatSkirt);
    }

    if (config.hasClipboard) {
      const boardMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const clipMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.2), boardMat);
      board.name = 'npc_clipboard';
      board.position.set(0.12, -0.25, 0.08);
      rightArm.add(board);
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.08), clipMat);
      clip.position.set(0, 0.13, 0);
      board.add(clip);
    }

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
    } else if (config.hasPastelInHands) {
      const pastelMat = new THREE.MeshLambertMaterial({ color: 0xeab308 });
      const pastelGroup = new THREE.Group();
      pastelGroup.name = 'npc_pastel';
      pastelGroup.position.set(0, 1.15, 0.28);

      const pastelBody = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.18), pastelMat);
      pastelGroup.add(pastelBody);

      const paperWrap = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.045, 0.19),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      paperWrap.position.x = -0.07;
      pastelGroup.add(paperWrap);

      group.add(pastelGroup);
    } else if (config.hasPastelPlatter) {
      const trayGroup = new THREE.Group();
      trayGroup.name = 'npc_pastel_tray';
      trayGroup.position.set(0, 1.0, 0.35);

      const trayMat = new THREE.MeshLambertMaterial({ color: 0xd4d4d8 });
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.38), trayMat);
      trayGroup.add(tray);

      const pMat = new THREE.MeshLambertMaterial({ color: 0xeab308 });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.12), pMat);
      p1.position.set(-0.12, 0.03, 0.05);
      trayGroup.add(p1);

      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.12), pMat);
      p2.position.set(0.12, 0.03, -0.05);
      trayGroup.add(p2);

      const cupMat = new THREE.MeshLambertMaterial({ color: 0x84cc16, transparent: true, opacity: 0.85 });
      const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.14, 8), cupMat);
      cup1.position.set(-0.12, 0.08, -0.1);
      trayGroup.add(cup1);

      const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.14, 8), cupMat);
      cup2.position.set(0.12, 0.08, 0.1);
      trayGroup.add(cup2);

      group.add(trayGroup);
    } else if (config.hasSinucaCue) {
      const cueGroup = new THREE.Group();
      cueGroup.name = 'npc_sinuca_cue';
      const shaftMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 1.4, 8), shaftMat);
      shaft.rotation.x = Math.PI / 2;
      shaft.position.set(0, -0.28, 0.45);
      cueGroup.add(shaft);

      const tipMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.04, 8), tipMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(0, -0.28, 1.16);
      cueGroup.add(tip);

      const gripMat = new THREE.MeshLambertMaterial({ color: 0x3d1d0c });
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.35, 8), gripMat);
      grip.rotation.x = Math.PI / 2;
      grip.position.set(0, -0.28, -0.1);
      cueGroup.add(grip);

      rightArm.add(cueGroup);
    }

    if (config.hasVerticalCue) {
      const vCueGroup = new THREE.Group();
      vCueGroup.name = 'npc_vertical_cue';
      const shaftMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.024, 1.45, 8), shaftMat);
      shaft.position.set(-0.25, 0.72, 0.22);
      vCueGroup.add(shaft);

      const tipMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.04, 8), tipMat);
      tip.position.set(-0.25, 1.46, 0.22);
      vCueGroup.add(tip);

      const gripMat = new THREE.MeshLambertMaterial({ color: 0x3d1d0c });
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 8), gripMat);
      grip.position.set(-0.25, 0.18, 0.22);
      vCueGroup.add(grip);

      group.add(vCueGroup);
    }

    if (config.hasBeerBottle) {
      const bottleGroup = new THREE.Group();
      bottleGroup.name = 'npc_beer_bottle';
      const glassMat = new THREE.MeshLambertMaterial({ color: config.bottleColor || 0x78350f });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.22, 8), glassMat);
      bottleGroup.add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.038, 0.12, 8), glassMat);
      neck.position.y = 0.16;
      bottleGroup.add(neck);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      cap.position.y = 0.23;
      bottleGroup.add(cap);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.08, 8), new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
      label.position.y = 0.0;
      bottleGroup.add(label);

      bottleGroup.position.set(0, -0.36, 0.1);
      rightArm.add(bottleGroup);
    }

    if (config.hasShotGlass) {
      const glassGroup = new THREE.Group();
      glassGroup.name = 'npc_shot_glass';
      const glassMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.75 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.08, 8), glassMat);
      glassGroup.add(cup);
      const pingaMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const pinga = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.05, 8), pingaMat);
      pinga.position.y = -0.01;
      glassGroup.add(pinga);

      glassGroup.position.set(0, -0.32, 0.08);
      rightArm.add(glassGroup);
    }

    if (config.hasTorresmoPlate) {
      const dishGroup = new THREE.Group();
      dishGroup.name = 'npc_torresmo_plate';
      const dishMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.03, 12), dishMat);
      dishGroup.add(plate);
      const porkMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
      for (let p = 0; p < 5; p++) {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.05), porkMat);
        const ang = (p / 5) * Math.PI * 2;
        piece.position.set(Math.cos(ang) * 0.08, 0.03, Math.sin(ang) * 0.08);
        piece.rotation.y = ang;
        dishGroup.add(piece);
      }
      const limeMat = new THREE.MeshLambertMaterial({ color: 0x65a30d });
      const lime = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 6), limeMat);
      lime.position.set(0, 0.035, 0);
      dishGroup.add(lime);

      dishGroup.position.set(0, 0.82, 0.38);
      group.add(dishGroup);
    }

    if (config.isSitting) {
      leftLeg.rotation.x = -Math.PI / 2;
      rightLeg.rotation.x = -Math.PI / 2;
    }

    this.applyCarnivalCostume(group, headGroup, config.costumeId);

    // Set initial position (waypoint y / baseY keep elevated NPCs off the street plane)
    const startWp = config.waypoints[0];
    const rawY = startWp.y != null ? startWp.y : (config.baseY != null ? config.baseY : 0);
    const startY = rawY - (config.isSitting ? 0.28 : 0);
    group.position.set(startWp.x, startY, startWp.z);
    if (config.defaultYaw != null) group.rotation.y = config.defaultYaw;
    if (config.zoneId) group.visible = false;
    this.npcGroup.add(group);

    return {
      id: config.id,
      name: config.name,
      prompt: config.prompt,
      encounterId: config.encounterId,
      group,
      mesh: group,
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
      baseY: config.baseY != null ? config.baseY : rawY,
      isSitting: Boolean(config.isSitting),
      costumeId: config.costumeId || null,
      stationary: config.stationary || false,
      lockYaw: Boolean(config.lockYaw),
      defaultYaw: config.defaultYaw != null ? config.defaultYaw : 0
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
    this.currentHour = hour;
    this.updateEventVisibility(hour);
    this.lastPlayerPos = playerPos;

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

      // 2. Distance to player
      const distToPlayer = Math.sqrt(
        (playerPos.x - npc.group.position.x) ** 2 +
        (playerPos.z - npc.group.position.z) ** 2
      );

      // 3. Stationary establishment shopkeepers (Tião, Zé, Manuel, etc.)
      if (npc.stationary) {
        if (!npc.lockYaw && distToPlayer < 7.5) {
          const lookAngle = Math.atan2(playerPos.x - npc.group.position.x, playerPos.z - npc.group.position.z);
          let angleDiff = lookAngle - npc.group.rotation.y;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          npc.group.rotation.y += angleDiff * Math.min(1.0, delta * 3.5);
        } else if (npc.defaultYaw != null) {
          let angleDiff = npc.defaultYaw - npc.group.rotation.y;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          npc.group.rotation.y += angleDiff * Math.min(1.0, delta * 2.0);
        }
        npc.animTimer += delta;
        this.animateNpc(npc, delta);
        continue;
      }

      // 4. Waypoint navigation along streets and sidewalks
      let targetWp = npc.waypoints[npc.currentWpIndex];
      let dx = targetWp.x - npc.group.position.x;
      let dz = targetWp.z - npc.group.position.z;
      let distToWp = Math.sqrt(dx * dx + dz * dz);

      // Advance to next waypoint if reached. Only event NPCs steer to the new
      // target this frame; the original six keep the arrival-frame stall.
      if (distToWp < 1.0) {
        npc.currentWpIndex = (npc.currentWpIndex + 1) % npc.waypoints.length;
        if (npc.zoneId) {
          targetWp = npc.waypoints[npc.currentWpIndex];
          dx = targetWp.x - npc.group.position.x;
          dz = targetWp.z - npc.group.position.z;
          distToWp = Math.sqrt(dx * dx + dz * dz);
        }
      }

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
        if (targetWp.y != null) {
          const fromY = npc.baseY != null ? npc.baseY : 0;
          const frac = distToWp > 0 ? Math.min(1, moveDist / distToWp) : 1;
          npc.baseY = fromY + (targetWp.y - fromY) * frac;
        }

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

    if (npc.animationMode === 'WIPE') {
      const wipe = Math.sin(npc.animTimer * 2.5) * 0.2;
      npc.rightArm.rotation.x = -0.85 + wipe;
      npc.rightArm.rotation.z = -0.25 + Math.cos(npc.animTimer * 2.5) * 0.15;
      npc.leftArm.rotation.x = -0.2 + Math.sin(npc.animTimer * 1.2) * 0.05;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 0.8) * 0.12;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * 1.5)) * 0.02;
      return;
    }

    if (npc.animationMode === 'IDLE_HOST') {
      const breath = Math.sin(npc.animTimer * 1.6) * 0.04;
      npc.rightArm.rotation.x = -0.25 + breath;
      npc.leftArm.rotation.x = -0.25 - breath;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 0.6) * 0.15;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * 1.6)) * 0.02;
      return;
    }

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

    if (npc.animationMode === 'EAT_PASTEL') {
      const eatCycle = Math.sin(npc.animTimer * 2.2);
      const lift = Math.max(0, eatCycle);
      npc.leftArm.rotation.x = -0.85 - lift * 0.45;
      npc.rightArm.rotation.x = -0.85 - lift * 0.45;
      npc.leftArm.rotation.z = 0.3;
      npc.rightArm.rotation.z = -0.3;
      npc.headGroup.rotation.x = lift * 0.2;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 5.0) * 0.04;
      if (npc.isSitting) {
        npc.leftLeg.rotation.x = -Math.PI / 2;
        npc.rightLeg.rotation.x = -Math.PI / 2;
        npc.group.position.y = baseY - 0.28 + Math.abs(Math.sin(npc.animTimer * 1.5)) * 0.01;
      } else {
        npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * 1.5)) * 0.02;
      }
      return;
    }

    if (npc.animationMode === 'SERVE_PASTEL') {
      npc.leftArm.rotation.x = -0.85;
      npc.rightArm.rotation.x = -0.85;
      npc.leftArm.rotation.z = 0.18;
      npc.rightArm.rotation.z = -0.18;
      const legSwing = Math.sin(npc.animTimer * npc.animSpeed) * 0.45;
      npc.leftLeg.rotation.x = legSwing;
      npc.rightLeg.rotation.x = -legSwing;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 1.5) * 0.12;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * npc.animSpeed)) * 0.04;
      return;
    }

    if (npc.animationMode === 'FRY_PASTEL') {
      const fry = Math.sin(npc.animTimer * 2.8) * 0.25;
      npc.rightArm.rotation.x = -0.8 + fry;
      npc.leftArm.rotation.x = -0.35 + Math.cos(npc.animTimer * 1.4) * 0.1;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 1.2) * 0.18;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * 1.5)) * 0.02;
      return;
    }

    if (npc.animationMode === 'PLAY_SINUCA') {
      const cycle = (npc.animTimer * 2.6) % (Math.PI * 2);
      const stroke = Math.sin(cycle) * 0.22;
      // Cue stroke with right arm
      npc.rightArm.rotation.x = -1.15 + stroke;
      npc.rightArm.rotation.z = -0.15;
      // Bridge hand extended on felt rail
      npc.leftArm.rotation.x = -1.1;
      npc.leftArm.rotation.z = 0.25;
      // Head looking forward down cue line
      npc.headGroup.rotation.x = 0.28;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 0.8) * 0.08;
      // Aiming stance posture
      npc.group.position.y = baseY - 0.05;

      // Ball impact click audio sync
      npc.cueStrikeCooldown = (npc.cueStrikeCooldown || 0) + delta;
      if (npc.cueStrikeCooldown > 3.6 && stroke > 0.18) {
        npc.cueStrikeCooldown = 0;
        if (this.sound && typeof this.sound.playSnookerHit === 'function') {
          const pPos = this.lastPlayerPos;
          if (pPos) {
            const dist = Math.hypot(pPos.x - npc.group.position.x, pPos.z - npc.group.position.z);
            if (dist < 18.0) {
              this.sound.playSnookerHit();
            }
          }
        }
      }
      return;
    }

    if (npc.animationMode === 'WATCH_SINUCA') {
      // Left arm holds the vertical cue resting on ground
      npc.leftArm.rotation.x = -0.55;
      npc.leftArm.rotation.z = -0.22;
      // Right arm holds beer bottle and periodically sips
      const sip = Math.max(0, Math.sin(npc.animTimer * 0.6) - 0.6) * 2.5;
      npc.rightArm.rotation.x = -0.35 - sip * 0.65;
      npc.rightArm.rotation.z = -0.15 - sip * 0.15;
      // Head tilts back slightly when sipping, otherwise scans table
      npc.headGroup.rotation.x = -sip * 0.2;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 1.2) * 0.18;
      npc.group.position.y = baseY;
      return;
    }

    if (npc.animationMode === 'DRUNK_TALK') {
      // Drunken body sway & gentle roll
      const sway = Math.sin(npc.animTimer * 1.8) * 0.08;
      const roll = Math.cos(npc.animTimer * 1.3) * 0.06;
      npc.group.rotation.z = roll;
      npc.group.rotation.x = sway * 0.5;
      // Left arm resting on bar counter
      npc.leftArm.rotation.x = -0.95 + sway * 0.4;
      npc.leftArm.rotation.z = 0.2;
      // Right arm with shot glass gesticulating passionately
      const talkGesture = Math.sin(npc.animTimer * 3.5) * 0.25;
      npc.rightArm.rotation.x = -0.7 + talkGesture;
      npc.rightArm.rotation.z = -0.3 + Math.cos(npc.animTimer * 2.8) * 0.15;
      // Head nodding and wobbling
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 2.0) * 0.22;
      npc.headGroup.rotation.x = 0.1 + Math.sin(npc.animTimer * 2.6) * 0.1;
      npc.group.position.y = baseY + Math.abs(Math.sin(npc.animTimer * 1.8)) * 0.02;
      return;
    }

    if (npc.animationMode === 'DRUNK_SIT') {
      // High stool seating posture
      npc.leftLeg.rotation.x = -Math.PI / 2.3;
      npc.rightLeg.rotation.x = -Math.PI / 2.3;
      npc.group.position.y = baseY + 0.16;
      // Left arm resting on bar counter
      npc.leftArm.rotation.x = -0.85;
      npc.leftArm.rotation.z = 0.18;
      // Right arm raising 600ml beer bottle for toasts & laughing
      const toast = Math.max(0, Math.sin(npc.animTimer * 0.7) - 0.4) * 1.8;
      npc.rightArm.rotation.x = -0.5 - toast * 0.6;
      npc.rightArm.rotation.z = -0.22 - toast * 0.15;
      const chuckle = Math.sin(npc.animTimer * 6.0) * 0.04;
      npc.headGroup.rotation.x = chuckle;
      npc.headGroup.rotation.y = -0.2 + Math.sin(npc.animTimer * 1.4) * 0.16;
      return;
    }

    if (npc.animationMode === 'BOTECO_EAT') {
      // Sitting at boteco dining table
      npc.leftLeg.rotation.x = -Math.PI / 2;
      npc.rightLeg.rotation.x = -Math.PI / 2;
      npc.group.position.y = baseY - 0.28;
      // Reaching for torresmo and eating
      const eat = Math.sin(npc.animTimer * 2.0);
      const lift = Math.max(0, eat);
      npc.rightArm.rotation.x = -0.7 - lift * 0.5;
      npc.rightArm.rotation.z = -0.2;
      npc.leftArm.rotation.x = -0.6;
      npc.leftArm.rotation.z = 0.2;
      npc.headGroup.rotation.x = lift * 0.15;
      npc.headGroup.rotation.y = Math.sin(npc.animTimer * 1.0) * 0.1;
      return;
    }

    if (npc.type === 'HUMANOID') {
      if (npc.isSitting) {
        npc.leftLeg.rotation.x = -Math.PI / 2;
        npc.rightLeg.rotation.x = -Math.PI / 2;
        npc.group.position.y = baseY - 0.28;
        return;
      }

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
    const hour = typeof this.currentHour === 'number' ? this.currentHour : 6;
    return this.npcs.filter((npc) => {
      if (npc.interactable === false) return false;
      if (npc.zoneId && !this.isZoneNpcActive(npc, hour)) return false;
      return true;
    }).map(npc => ({
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
      const j = this.rng.int(0, i);
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
    const savedState = this.rng.state;
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
        animTimer: this.rng.range(0, Math.PI * 2),
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
        waypoints: runnerLoops[this.rng.int(0, runnerLoops.length - 1)],
        zoneId: BLOCO_ZONE_ID,
        interactable: false,
        animationMode: 'RUN',
        baseY: 0,
        costumeId,
        animTimer: this.rng.range(0, Math.PI * 2),
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
      const kit = kits[this.rng.int(0, kits.length - 1)];
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
        animTimer: this.rng.range(0, Math.PI * 2),
        animSpeed: 8.0
      }));
    }

    this.initEventSpectators();
    this.rng.state = savedState;
  }

  initEventHosts() {
    this.npcs.push(this.createHumanoidNpc({
      id: 'mestre_bloco',
      name: 'MESTRE DO BLOCO',
      prompt: 'FALAR COM O MESTRE DO BLOCO',
      encounterId: 'BLOCO_CARNAVAL',
      shirtColor: 0xf59e0b,
      skinColor: 0x8d5524,
      pantsColor: 0x1f2937,
      capColor: 0xdc2626,
      hasCap: true,
      speed: 0.35,
      waypoints: [{ x: 137.2, z: 42.4 }],
      zoneId: BLOCO_ZONE_ID,
      interactable: true,
      animationMode: 'DANCE',
      baseY: 0
    }));

    this.npcs.push(this.createHumanoidNpc({
      id: 'churrasqueiro_campo',
      name: 'CHURRASQUEIRO DO CAMPINHO',
      prompt: 'FALAR COM O CHURRASQUEIRO',
      encounterId: 'CHURRASCO_CAMPO',
      shirtColor: 0x7f1d1d,
      skinColor: 0x6b4423,
      pantsColor: 0x111827,
      capColor: 0xf8fafc,
      hasCap: true,
      speed: 0.3,
      waypoints: [{ x: -19.4, y: 9.5, z: -89.6 }],
      zoneId: CAMPINHO_ZONE_ID,
      interactable: true,
      animationMode: null,
      baseY: 9.5
    }));
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
          spot.x + this.rng.range(-0.15, 0.15),
          baseY + 0.55,
          spot.z + this.rng.range(-0.15, 0.15)
        );
        dummy.rotation.set(0, this.rng.range(0, Math.PI * 2), 0);
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

  // Populate iconic local establishments with visible shopkeeper/character 3D meshes
  initEstablishmentNpcs() {
    this.establishmentNpcs = [
      // 1. Tião do Bar (Barkeep of Bar do Tião)
      this.createHumanoidNpc({
        id: 'tiao_bar',
        name: 'SEU TIÃO (BAR DO TIÃO)',
        prompt: 'CONVERSAR COM SEU TIÃO NO BALCÃO',
        encounterId: 'BAR_DO_TIAO',
        shirtColor: 0x1e3a8a, // Classic blue polo shirt
        skinColor: 0x94603d,
        pantsColor: 0x1f2937,
        hasApron: true,
        apronColor: 0xffffff, // White boteco apron
        hasMustache: true,
        hasCloth: true,
        stationary: true,
        defaultYaw: Math.PI, // Facing front (-Z towards entrance)
        waypoints: [{ x: 14.8, y: 0.25, z: 45.4 }],
        interactable: false, // Handled authoritatively by bar_sinuca anchor in Interactables
        animationMode: 'WIPE',
        baseY: 0.25
      }),

      // 2. Seu Zé da Adega (Beverage Wholesaler)
      this.createHumanoidNpc({
        id: 'ze_adega',
        name: 'SEU ZÉ (ADEGA DO ZÉ)',
        prompt: 'FALAR COM SEU ZÉ DA ADEGA',
        encounterId: 'ADEGA_DO_ZE',
        shirtColor: 0x18181b, // Black tee
        skinColor: 0x8a5832,
        pantsColor: 0x27272a,
        hasCap: true,
        capColor: 0xdc2626, // Red cap
        hasApron: true,
        apronColor: 0x991b1b, // Dark red apron
        stationary: true,
        defaultYaw: Math.PI,
        waypoints: [{ x: -12.2, y: 0.25, z: 44.8 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 3. Seu Manuel (Padeiro da Padaria Estrela)
      this.createHumanoidNpc({
        id: 'manuel_padeiro',
        name: 'SEU MANUEL (PADARIA ESTRELA)',
        prompt: 'PEDIR PÃO COM SEU MANUEL',
        encounterId: 'PADARIA_ESTRELA',
        shirtColor: 0xfef08a, // Cream baker shirt
        skinColor: 0xae7d55,
        pantsColor: 0xf5f5f5,
        hasChefHat: true,
        hasApron: true,
        apronColor: 0xffffff,
        hasMustache: true,
        stationary: true,
        defaultYaw: Math.PI,
        waypoints: [{ x: 33.2, y: 0.25, z: 44.6 }],
        interactable: false,
        animationMode: 'WIPE',
        baseY: 0.25
      }),

      // 4. Dona Maria (Pasteleira da Feira)
      this.createHumanoidNpc({
        id: 'dona_maria_pastel',
        name: 'DONA MARIA (PASTEL DA FEIRA)',
        prompt: 'PEDIR PASTEL COM DONA MARIA',
        encounterId: 'PASTEL_FEIRA',
        shirtColor: 0xdc2626, // Red shirt
        skinColor: 0xa86c43,
        pantsColor: 0x475569,
        hasHairnet: true,
        hasApron: true,
        apronColor: 0xf59e0b, // Yellow/golden apron
        stationary: true,
        defaultYaw: 0, // Facing street (+Z)
        waypoints: [{ x: -3.5, y: 0.25, z: 37.0 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 5. Seu Mário (Banca de Jornal)
      this.createHumanoidNpc({
        id: 'mario_banca',
        name: 'SEU MÁRIO (BANCA DE JORNAL)',
        prompt: 'FALAR COM SEU MÁRIO NA BANCA',
        encounterId: 'BANCA_JORNAL',
        shirtColor: 0x15803d, // Green cardigan
        skinColor: 0x92613d,
        pantsColor: 0x374151,
        hasGlasses: true,
        stationary: true,
        defaultYaw: 0, // Facing street (+Z)
        waypoints: [{ x: 7.5, y: 0.25, z: 36.8 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 6. Frentista Tonho (Posto Pirituba 24H)
      this.createHumanoidNpc({
        id: 'frentista_tonho',
        name: 'TONHO (FRENTISTA POSTO 24H)',
        prompt: 'FALAR COM FRENTISTA TONHO',
        encounterId: 'POSTO_PIRITUBA',
        shirtColor: 0xeab308, // Yellow Petrobras uniform
        skinColor: 0x7c4e2d,
        pantsColor: 0x15803d, // Green pants
        hasCap: true,
        capColor: 0x15803d, // Green Petrobras cap
        stationary: true,
        defaultYaw: Math.PI / 2, // Facing +X
        waypoints: [{ x: -38.0, y: 0.25, z: 41.5 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 7. Tia Cida (Inspetora Escolar - E.E. Prof. Lourenço Filho)
      this.createHumanoidNpc({
        id: 'tia_cida',
        name: 'TIA CIDA (INSPETORA ESCOLAR)',
        prompt: 'FALAR COM TIA CIDA NA PORTARIA',
        encounterId: 'ESCOLA_PUBLICA',
        shirtColor: 0x2563eb, // Blue school uniform/smock
        skinColor: 0x6e4325,
        pantsColor: 0x334155,
        hasGlasses: true,
        hasLanyard: true,
        stationary: true,
        defaultYaw: Math.PI / 2, // Facing East (+X towards sidewalk)
        waypoints: [{ x: 131.5, y: 0.25, z: 74.0 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 8. Seu Zico (Pipoca & Algodão Doce - Praça Petrônio Portela)
      this.createHumanoidNpc({
        id: 'zico_pipoca',
        name: 'SEU ZICO (PIPOCA & ALGODÃO DOCE)',
        prompt: 'COMPRAR PIPOCA COM SEU ZICO',
        encounterId: 'PARQUE_PETRONIO',
        shirtColor: 0xffffff,
        skinColor: 0x8a5832,
        pantsColor: 0x1e293b,
        hasChefHat: true,
        hasApron: true,
        apronColor: 0xdc2626, // Red/white vendor apron
        hasScoop: true,
        stationary: true,
        defaultYaw: -Math.PI / 2, // Facing West (-X towards sidewalk)
        waypoints: [{ x: 160.5, y: 0.25, z: 72.0 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 9. Seu Toninho (Espeteiro & Bar da Petrônio)
      this.createHumanoidNpc({
        id: 'toninho_espetinho',
        name: 'SEU TONINHO (BAR & ESPETINHO)',
        prompt: 'PEDIR ESPETINHO COM SEU TONINHO',
        encounterId: 'ESPETINHO_PETRONIO',
        shirtColor: 0x1c1917, // Dark tee
        skinColor: 0x9a653f,
        pantsColor: 0x292524,
        hasApron: true,
        apronColor: 0x7f1d1d, // Barbecue apron
        hasTongs: true,
        hasCloth: true,
        stationary: true,
        defaultYaw: Math.PI / 2, // Facing East (+X towards sidewalk)
        waypoints: [{ x: 129.8, y: 0.25, z: 125.0 }],
        interactable: false,
        animationMode: 'WIPE',
        baseY: 0.25
      }),

      // 10. Padre Bento (Igrejinha do Morro)
      this.createHumanoidNpc({
        id: 'padre_bento',
        name: 'PADRE BENTO (IGREJINHA DO MORRO)',
        prompt: 'RECEBER BÊNÇÃO COM PADRE BENTO',
        encounterId: 'IGREJA_DO_MORRO',
        shirtColor: 0x111111, // Black cassock
        skinColor: 0x9e6a45,
        pantsColor: 0x111111,
        hasCross: true,
        hasGlasses: true,
        stationary: true,
        defaultYaw: -Math.PI / 2, // Facing West towards stairs / avenue
        waypoints: [{ x: 176.0, y: 4.5, z: 203.5 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 4.5
      }),

      // 11. Professor Maurício (Colégio Wellington)
      this.createHumanoidNpc({
        id: 'prof_mauricio',
        name: 'PROFESSOR MAURÍCIO (COLÉGIO WELLINGTON)',
        prompt: 'CONVERSAR COM PROFESSOR MAURÍCIO',
        encounterId: 'COLEGIO_WELLINGTON',
        shirtColor: 0x1d4ed8, // Blue school polo
        skinColor: 0x8a5530,
        pantsColor: 0x334155,
        hasGlasses: true,
        hasLanyard: true,
        hasBook: true,
        stationary: true,
        defaultYaw: -Math.PI / 2, // Facing West towards sidewalk
        waypoints: [{ x: 160.0, y: 0.25, z: 246.5 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 12. Seu Beto do Mercado (Mercado Municipal de Pyrituba)
      this.createHumanoidNpc({
        id: 'beto_mercado',
        name: 'SEU BETO (MERCADO MUNICIPAL)',
        prompt: 'FALAR COM SEU BETO NO MERCADO',
        encounterId: 'MERCADO_PYRITUBA',
        shirtColor: 0xffffff,
        skinColor: 0xa16843,
        pantsColor: 0x1e293b,
        hasCap: true,
        capColor: 0x15803d, // Green market cap
        hasApron: true,
        apronColor: 0x16a34a, // Green merchant apron
        hasCrate: true,
        stationary: true,
        defaultYaw: -Math.PI / 2, // Facing West towards entrance
        waypoints: [{ x: 160.0, y: 0.25, z: 283.5 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 13. Mestre Severino (Restaurante Amigos do Picuí)
      this.createHumanoidNpc({
        id: 'mestre_severino',
        name: 'MESTRE SEVERINO (AMIGOS DO PICUÍ)',
        prompt: 'PEDIR CARNE DE SOL COM MESTRE SEVERINO',
        encounterId: 'RESTAURANTE_AMIGOS_DO_PICUI',
        shirtColor: 0xffffff, // Chef jacket
        skinColor: 0x784421,
        pantsColor: 0x1c1917,
        hasChefHat: true,
        hasApron: true,
        apronColor: 0xb91c1c, // Red apron
        hasPlatter: true,
        stationary: true,
        defaultYaw: -Math.PI / 2, // Facing West towards veranda
        waypoints: [{ x: 160.0, y: 0.25, z: 316.5 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      }),

      // 14. Dra. Camila (Farmácia Petrônio)
      this.createHumanoidNpc({
        id: 'farmaceutica_camila',
        name: 'DRA. CAMILA (FARMÁCIA PETRÔNIO)',
        prompt: 'FALAR COM DRA. CAMILA NA FARMÁCIA',
        encounterId: 'FARMACIA_PETRONIO',
        shirtColor: 0x059669, // Teal medical scrubs
        skinColor: 0xa9714b,
        pantsColor: 0x0f766e,
        hasLabCoat: true,
        hasClipboard: true,
        stationary: true,
        defaultYaw: Math.PI / 2, // Facing East towards counter
        waypoints: [{ x: 131.0, y: 0.25, z: 216.5 }],
        interactable: false,
        animationMode: 'IDLE_HOST',
        baseY: 0.25
      })
    ];

    this.establishmentNpcs.forEach(n => this.npcs.push(n));
  }

  // Citywide roaming pedestrians: Police, Thugs/Malandros, Tias, and Tios
  initCitywidePedestrians() {
    this.cityPedestrians = [
      // ==========================================
      // 1. POLÍCIA MILITAR (PMESP - Ronda Ostensiva)
      // ==========================================
      // Cabo Oliveira: Petrônio Portela Norte (sidewalk and park entrance patrol)
      this.createHumanoidNpc({
        id: 'cabo_oliveira',
        name: 'CABO OLIVEIRA (PMESP)',
        shirtColor: 0x4f5d6b, // PM grey
        skinColor: 0x8a5832,
        pantsColor: 0x1c2430, // Navy dark
        hasPoliceCap: true,
        hasPoliceBelt: true,
        interactable: false,
        speed: 1.25,
        waypoints: [
          { x: 155.5, z: 72.0 },
          { x: 155.5, z: 105.0 },
          { x: 159.0, z: 126.0 },
          { x: 155.5, z: 105.0 },
          { x: 155.5, z: 72.0 }
        ]
      }),

      // Soldado Nascimento: Petrônio Portela Sul (Colégio Wellington & Mercado patrol)
      this.createHumanoidNpc({
        id: 'soldado_nascimento',
        name: 'SOLDADO NASCIMENTO (PMESP)',
        shirtColor: 0x4f5d6b,
        skinColor: 0x5a3418,
        pantsColor: 0x1c2430,
        hasPoliceCap: true,
        hasPoliceBelt: true,
        interactable: false,
        speed: 1.3,
        waypoints: [
          { x: 155.0, z: 195.0 },
          { x: 155.0, z: 245.0 },
          { x: 155.0, z: 310.0 },
          { x: 155.0, z: 245.0 },
          { x: 155.0, z: 195.0 }
        ]
      }),

      // Cabo Santos: Edgar Facó north sidewalk and bridge approach
      this.createHumanoidNpc({
        id: 'cabo_santos',
        name: 'CABO SANTOS (PMESP)',
        shirtColor: 0x4f5d6b,
        skinColor: 0xa16843,
        pantsColor: 0x1c2430,
        hasPoliceCap: true,
        hasPoliceBelt: true,
        hasMustache: true,
        interactable: false,
        speed: 1.2,
        waypoints: [
          { x: -35.0, z: 5.5 },
          { x: 5.0, z: 5.5 },
          { x: 45.0, z: 5.5 },
          { x: 5.0, z: 5.5 },
          { x: -35.0, z: 5.5 }
        ]
      }),

      // ==========================================
      // 2. THUGS / MALANDROS / NOIAS (Quebrada)
      // ==========================================
      // Vitinho do Grau: Favela Escadão & Mirante (alto da comunidade)
      this.createHumanoidNpc({
        id: 'vitinho_grau',
        name: 'VITINHO DO GRAU (MALANDRO)',
        shirtColor: 0x15803d, // Palmeiras green jersey
        skinColor: 0x9c653d,
        pantsColor: 0x0284c7, // Bermuda tactel azul
        hasForwardCap: true,
        capColor: 0xffffff,
        hasShoulderBag: true,
        interactable: false,
        speed: 1.6,
        baseY: 8.5,
        waypoints: [
          { x: -30.0, y: 8.5, z: -72.0 },
          { x: -22.0, y: 9.0, z: -88.0 },
          { x: -35.0, y: 9.5, z: -102.0 },
          { x: -22.0, y: 9.0, z: -88.0 },
          { x: -30.0, y: 8.5, z: -72.0 }
        ]
      }),

      // Diguinho Noia: Petrônio Commercial Alleys & Autoescola
      this.createHumanoidNpc({
        id: 'diguinho_noia',
        name: 'DIGUINHO NOIA',
        shirtColor: 0x27272a, // Regata preta
        skinColor: 0x8a5530,
        pantsColor: 0x3b82f6, // Jeans azul claro
        hasForwardCap: true,
        capColor: 0xd97706,
        hasShoulderBag: true,
        interactable: false,
        speed: 1.45,
        waypoints: [
          { x: 134.5, z: 115.0 },
          { x: 122.0, z: 114.0 },
          { x: 134.5, z: 138.0 },
          { x: 134.5, z: 165.0 },
          { x: 134.5, z: 138.0 }
        ]
      }),

      // Nelsinho Chapa: Petrônio Sul outside Mercado Pyrituba & Amigos do Picuí
      this.createHumanoidNpc({
        id: 'nelsinho_chapa',
        name: 'NELSINHO CHAPA (FLANELINHA)',
        shirtColor: 0xb91c1c, // Regata vermelha
        skinColor: 0x6e4325,
        pantsColor: 0x1e293b, // Bermuda tactel preta
        hasForwardCap: true,
        capColor: 0x111111,
        hasShoulderBag: true,
        interactable: false,
        speed: 1.5,
        waypoints: [
          { x: 134.5, z: 260.0 },
          { x: 134.5, z: 295.0 },
          { x: 134.5, z: 325.0 },
          { x: 134.5, z: 295.0 },
          { x: 134.5, z: 260.0 }
        ]
      }),

      // ==========================================
      // 3. TIAS (Bairro & Devoção)
      // ==========================================
      // Dona Carmem: Igrejinha no Morro (subindo e descendo as escadarias)
      this.createHumanoidNpc({
        id: 'dona_carmem',
        name: 'DONA CARMEM (IGREJINHA)',
        shirtColor: 0x7c3aed, // Vestido lilás/roxo
        skinColor: 0xb58055,
        pantsColor: 0x6d28d9,
        hasHairBun: true,
        hasCross: true,
        hasBook: true, // Bíblia
        interactable: false,
        speed: 0.95,
        baseY: 0.25,
        waypoints: [
          { x: 156.0, y: 0.25, z: 185.0 },
          { x: 162.0, y: 1.8, z: 195.0 },
          { x: 172.0, y: 4.5, z: 202.0 },
          { x: 162.0, y: 1.8, z: 195.0 },
          { x: 156.0, y: 0.25, z: 185.0 }
        ]
      }),

      // Dona Lurdes: Petrônio Portela Norte (calçada comercial com sacolas)
      this.createHumanoidNpc({
        id: 'dona_lurdes',
        name: 'DONA LURDES',
        shirtColor: 0xec4899, // Blusa rosa
        skinColor: 0xa86c43,
        pantsColor: 0xf3f4f6,
        hasHairBun: true,
        hasShoppingBags: true,
        hasGlasses: true,
        interactable: false,
        speed: 1.05,
        waypoints: [
          { x: 155.5, z: 80.0 },
          { x: 155.5, z: 110.0 },
          { x: 155.5, z: 135.0 },
          { x: 155.5, z: 110.0 },
          { x: 155.5, z: 80.0 }
        ]
      }),

      // Dona Maria do Parque: Caminho interno do Parque Linear
      this.createHumanoidNpc({
        id: 'dona_maria_parque',
        name: 'DONA MARIA (CAMINHADA)',
        shirtColor: 0x10b981, // Casaquinho verde esmeralda
        skinColor: 0x94603d,
        pantsColor: 0x374151,
        hasHairBun: true,
        hasGlasses: true,
        interactable: false,
        speed: 1.0,
        waypoints: [
          { x: 166.5, z: 68.0 },
          { x: 168.0, z: 92.0 },
          { x: 167.0, z: 122.0 },
          { x: 168.0, z: 92.0 },
          { x: 166.5, z: 68.0 }
        ]
      }),

      // ==========================================
      // 4. TIOS (Comércio & Conversa de Calçada)
      // ==========================================
      // Seu Valdir: Petrônio Oeste (em frente aos sobrados e espetinho)
      this.createHumanoidNpc({
        id: 'seu_valdir',
        name: 'SEU VALDIR',
        shirtColor: 0xd97706, // Polo mostarda
        skinColor: 0x8a5832,
        pantsColor: 0x4b5563,
        hasMustache: true,
        hasGlasses: true,
        hasCap: true,
        capColor: 0x78350f,
        interactable: false,
        speed: 1.1,
        waypoints: [
          { x: 134.5, z: 120.0 },
          { x: 134.5, z: 145.0 },
          { x: 134.5, z: 172.0 },
          { x: 134.5, z: 145.0 },
          { x: 134.5, z: 120.0 }
        ]
      }),

      // Seu Geraldo: Edgar Facó Sul (caminhando com jornal matinal)
      this.createHumanoidNpc({
        id: 'seu_geraldo',
        name: 'SEU GERALDO',
        shirtColor: 0x3b82f6, // Camisa social azul clara
        skinColor: 0x784421,
        pantsColor: 0x1f2937,
        hasMustache: true,
        hasGlasses: true,
        hasBook: true, // Jornal do dia
        interactable: false,
        speed: 1.15,
        waypoints: [
          { x: -28.0, z: 35.5 },
          { x: 0.0, z: 35.5 },
          { x: 28.0, z: 35.5 },
          { x: 0.0, z: 35.5 },
          { x: -28.0, z: 35.5 }
        ]
      }),

      // Seu Osvaldo: Petrônio Sul (calçada do Mercado Pyrituba)
      this.createHumanoidNpc({
        id: 'seu_osvaldo',
        name: 'SEU OSVALDO',
        shirtColor: 0x15803d, // Camisa verde xadrez
        skinColor: 0x9a653f,
        pantsColor: 0x78350f,
        hasMustache: true,
        hasCap: true,
        capColor: 0xca8a04,
        interactable: false,
        speed: 1.1,
        waypoints: [
          { x: 155.0, z: 250.0 },
          { x: 155.0, z: 280.0 },
          { x: 155.0, z: 305.0 },
          { x: 155.0, z: 280.0 },
          { x: 155.0, z: 250.0 }
        ]
      })
    ];

    this.cityPedestrians.forEach(p => this.npcs.push(p));
  }

  // Pastelaria do Beto salon NPCs: Frying, Serving, and Eating Pastéis
  initPastelariaNpcs() {
    this.pastelariaNpcs = [
      // 1. Seu Beto (O Mestre Pasteleiro frying pastéis behind the counter)
      this.createHumanoidNpc({
        id: 'beto_pasteleiro',
        name: 'SEU BETO (MESTRE PASTELEIRO)',
        shirtColor: 0xffffff,
        skinColor: 0x94603d,
        pantsColor: 0x27272a,
        hasChefHat: true,
        hasApron: true,
        apronColor: 0xdc2626, // Red & white pastelaria apron
        hasMustache: true,
        hasTongs: true,
        stationary: true,
        defaultYaw: Math.PI / 2, // Facing East (+X towards salon)
        waypoints: [{ x: 72.0, y: 0.05, z: 43.0 }],
        interactable: false,
        animationMode: 'FRY_PASTEL',
        baseY: 0.05
      }),

      // 2. Marquinhos (Garçom do salão carrying tray with pastéis and caldo de cana)
      this.createHumanoidNpc({
        id: 'marquinhos_garcom',
        name: 'MARQUINHOS (GARÇOM DO SALÃO)',
        shirtColor: 0xdc2626, // Red polo uniform
        skinColor: 0x7c4e2d,
        pantsColor: 0x18181b,
        hasApron: true,
        apronColor: 0x18181b,
        hasPastelPlatter: true,
        interactable: false,
        speed: 1.05,
        animationMode: 'SERVE_PASTEL',
        baseY: 0.05,
        waypoints: [
          { x: 73.8, y: 0.05, z: 41.5 },
          { x: 75.8, y: 0.05, z: 40.0 },
          { x: 75.8, y: 0.05, z: 43.5 },
          { x: 73.8, y: 0.05, z: 41.5 }
        ]
      }),

      // 3. Tio Carlinhos (Cliente na Mesa 1 comendo pastel de 30cm)
      this.createHumanoidNpc({
        id: 'tio_carlinhos_cliente',
        name: 'TIO CARLINHOS (CLIENTE)',
        shirtColor: 0x2563eb, // Blue polo
        skinColor: 0x8a5832,
        pantsColor: 0xd97706, // Khaki
        hasMustache: true,
        hasGlasses: true,
        hasPastelInHands: true,
        isSitting: true,
        stationary: true,
        defaultYaw: 0, // Facing North (+Z towards table)
        waypoints: [{ x: 76.9, y: 0.05, z: 39.55 }],
        interactable: false,
        animationMode: 'EAT_PASTEL',
        baseY: 0.05
      }),

      // 4. Dona Ivone (Cliente na Mesa 2 comendo pastel e caldo de cana)
      this.createHumanoidNpc({
        id: 'dona_ivone_cliente',
        name: 'DONA IVONE (CLIENTE)',
        shirtColor: 0xfacc15, // Yellow blouse
        skinColor: 0xb58055,
        pantsColor: 0x475569,
        hasHairBun: true,
        hasGlasses: true,
        hasPastelInHands: true,
        isSitting: true,
        stationary: true,
        defaultYaw: Math.PI, // Facing South (-Z towards table)
        waypoints: [{ x: 76.9, y: 0.05, z: 45.25 }],
        interactable: false,
        animationMode: 'EAT_PASTEL',
        baseY: 0.05
      }),

      // 5. Luquinhas (Cliente em pé no balcão comendo pastel quente)
      this.createHumanoidNpc({
        id: 'luquinhas_balcao',
        name: 'LUQUINHAS (CLIENTE NO BALCÃO)',
        shirtColor: 0x18181b, // Black tank top
        skinColor: 0xa16843,
        pantsColor: 0x0284c7, // Tactel azul
        hasForwardCap: true,
        capColor: 0xdc2626,
        hasPastelInHands: true,
        stationary: true,
        defaultYaw: -Math.PI / 2, // Facing West (-X towards counter)
        waypoints: [{ x: 73.9, y: 0.05, z: 41.5 }],
        interactable: false,
        animationMode: 'EAT_PASTEL',
        baseY: 0.05
      })
    ];

    this.pastelariaNpcs.forEach(n => this.npcs.push(n));
  }

  // Populate Bar do Tião with authentic boteco patrons (Sinuca players, drunk counter customers, torresmo eater)
  initBarTiaoNpcs() {
    this.barTiaoNpcs = [
      // 1. Baixinho da Sinuca (Aiming cue on felt table)
      this.createHumanoidNpc({
        id: 'baixinho_sinuca',
        name: 'BAIXINHO DA SINUCA',
        shirtColor: 0x15803d, // Green boteco polo
        skinColor: 0x8a5832,
        pantsColor: 0xb45309, // Khaki calça
        hasMustache: true,
        hasForwardCap: true,
        capColor: 0x374151,
        hasSinucaCue: true,
        stationary: true,
        lockYaw: true,
        defaultYaw: Math.PI / 2, // Facing East (+X towards pool table center)
        waypoints: [{ x: 10.2, y: 0.25, z: 42.0 }],
        interactable: false,
        animationMode: 'PLAY_SINUCA',
        baseY: 0.25
      }),

      // 2. Zé do Taco (Opponent standing with vertical cue & cold beer)
      this.createHumanoidNpc({
        id: 'ze_taco',
        name: 'ZÉ DO TACO',
        shirtColor: 0xb91c1c, // Red polo shirt
        skinColor: 0x6e4324,
        pantsColor: 0x1e3a8a, // Blue jeans
        hasCap: true,
        capColor: 0x111111,
        hasVerticalCue: true,
        hasBeerBottle: true,
        bottleColor: 0x78350f,
        stationary: true,
        lockYaw: true,
        defaultYaw: -2.3, // Facing West-Southwest towards pool table
        waypoints: [{ x: 13.8, y: 0.25, z: 41.2 }],
        interactable: false,
        animationMode: 'WATCH_SINUCA',
        baseY: 0.25
      }),

      // 3. Rubão da 51 (Drunk patron leaning on bar counter passionately talking to Seu Tião)
      this.createHumanoidNpc({
        id: 'rubao_pinga',
        name: 'RUBÃO DA 51',
        shirtColor: 0xf59e0b, // Yellow regata
        skinColor: 0x94603d,
        pantsColor: 0x334155, // Tactel bermuda
        hasMustache: true,
        hasShotGlass: true,
        stationary: true,
        lockYaw: true,
        defaultYaw: 0.1, // Facing North-East (+Z towards Seu Tião behind counter)
        waypoints: [{ x: 14.5, y: 0.25, z: 43.7 }],
        interactable: false,
        animationMode: 'DRUNK_TALK',
        baseY: 0.25
      }),

      // 4. Chicão do Litrão (Seated on high barstool laughing with 600ml beer bottle)
      this.createHumanoidNpc({
        id: 'chicao_litrao',
        name: 'CHICÃO DO LITRÃO',
        shirtColor: 0x475569, // Slate tee
        skinColor: 0xa16843,
        pantsColor: 0x1e293b,
        hasBeerBottle: true,
        bottleColor: 0x15803d, // Green 600ml bottle
        isSitting: true,
        stationary: true,
        lockYaw: true,
        defaultYaw: -0.3, // Facing North-West towards Rubão and Seu Tião
        waypoints: [{ x: 15.8, y: 0.25, z: 43.75 }],
        interactable: false,
        animationMode: 'DRUNK_SIT',
        baseY: 0.25
      }),

      // 5. Seu Pedro do Torresmo (Seated at boteco dining table eating crunchy torresmo)
      this.createHumanoidNpc({
        id: 'seu_pedro_torresmo',
        name: 'SEU PEDRO DO TORRESMO',
        shirtColor: 0xf1f5f9, // White regata
        skinColor: 0xb58055,
        pantsColor: 0x3b82f6,
        hasGlasses: true,
        hasMustache: true,
        isSitting: true,
        stationary: true,
        lockYaw: true,
        defaultYaw: Math.PI, // Facing South (-Z towards table & entrance)
        waypoints: [{ x: 8.4, y: 0.25, z: 44.05 }],
        interactable: false,
        animationMode: 'BOTECO_EAT',
        baseY: 0.25
      })
    ];

    this.barTiaoNpcs.forEach(n => this.npcs.push(n));
  }
}
