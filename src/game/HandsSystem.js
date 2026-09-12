/**
 * HandsSystem.js
 * First-Person FPS Hands & Dual-Wield Item System for Brazil Simulator.
 *
 * Coordinates:
 * - FPS 3D Viewmodel attached to camera (left and right arms/hands with procedural meshes)
 * - Dual-wielding: Left Hand [Q] and Right Hand [E]
 * - Bare-hand punches (left jab on Q, right cross on E with whoosh & hit detection)
 * - Contextual item actions on Q/E (iPhone crypto/alerts, Bilhete Único bus pass, Fake JBL funk beat, Beer, Pastel)
 * - Ground item dropping on [Z] (left hand) and [C] (right hand) with 3D physical pickups and beacons
 * - Item loss mechanics (robbery by thugs/Dois Caras numa Moto, police confiscation by Sargento Rocha)
 * - Starting loadout by social class (Faria Limer: iPhone, CLT: Cartão de Ônibus, Quebrada: Fake JBL)
 */

export const ITEM_TYPES = {
  IPHONE: {
    id: 'IPHONE',
    name: 'iPhone 16 Pro',
    icon: '📱',
    desc: 'Titânio grafite, tela OLED brilhante e app do banco aberto',
    isValuable: true,
    actionLabel: 'Checar Carteira / Notificação',
    use: (gameState, sound) => {
      if (sound && sound.playPhoneChirp) sound.playPhoneChirp();
      const gain = Math.floor(Math.random() * 60) + 20; // R$ 20 to R$ 80
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ grana: gain * 100, sanidade: 15 }, 'Dividendos do FII no iPhone');
      }
      return `📱 <strong>NOTIFICAÇÃO DO IPHONE:</strong> Dividendos do FII caíram na conta! (+R$ ${gain.toFixed(2)}, +15 Sanidade)`;
    }
  },
  CARTAO_ONIBUS: {
    id: 'CARTAO_ONIBUS',
    name: 'Bilhete Único SPTrans',
    icon: '💳',
    desc: 'Cartão de transporte recarregado com passe e integração',
    isValuable: false,
    actionLabel: 'Aproximar no Validador / Saldo',
    use: (gameState, sound) => {
      if (sound && sound.playCoin) sound.playCoin();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ sanidade: 12 }, 'Consultou saldo do Bilhete Único');
      }
      return `💳 <strong>BILHETE ÚNICO SPTRANS:</strong> 'Pi-pi-pi!' Saldo consultado: Integração de 3 horas liberada (+12 Sanidade)`;
    }
  },
  JBL_SOUNDBOX: {
    id: 'JBL_SOUNDBOX',
    name: 'Caixinha Fake JBL',
    icon: '🔊',
    desc: 'Caixinha Bluetooth pirata que toca funk no talo com graves estourando',
    isValuable: false,
    actionLabel: 'Tocar Gravão no Paredão',
    use: (gameState, sound) => {
      if (sound && sound.playJblSnippet) sound.playJblSnippet();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ sanidade: 20, perigo: 10 }, 'Tocou gravão no paredão');
      }
      return `🔊 <strong>CAIXINHA BLUETOOTH:</strong> 'DJ toca o beat!' Tamborzão 130 BPM estalando na calçada! (+20 Sanidade, +10 Perigo)`;
    }
  },
  CERVEJA_LATA: {
    id: 'CERVEJA_LATA',
    name: 'Lata de Skol Gelada',
    icon: '🍺',
    desc: 'Lata 350ml trincando de gelada, direto do boteco',
    isValuable: false,
    consumable: true,
    actionLabel: 'Tomar Gole Refrescante',
    use: (gameState, sound) => {
      if (sound && sound.playDrinkGulp) sound.playDrinkGulp();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ sanidade: 25, fome: 10, perigo: -10 }, 'Tomou gole de cerveja');
      }
      return `🍺 <strong>CERVEJA GELADA:</strong> Gole refrescante de cerveja trincando! (+25 Sanidade, +10 Bucho, -10 Perigo)`;
    }
  },
  PAO_NA_CHAPA: {
    id: 'PAO_NA_CHAPA',
    name: 'Pão na Chapa Quentinho',
    icon: '🥖',
    desc: 'Pão francês tostado na chapa com crosta de manteiga derretida',
    isValuable: false,
    consumable: true,
    actionLabel: 'Comer Pão na Chapa',
    use: (gameState, sound) => {
      if (sound && sound.playFoodBite) sound.playFoodBite();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ fome: 35, sanidade: 15 }, 'Comeu pão na chapa quentinho');
      }
      return `🥖 <strong>PÃO NA CHAPA:</strong> Casquinha crocante com manteiga na chapa da padaria! (+35 Bucho, +15 Sanidade)`;
    }
  },
  PASTEL_FEIRA: {
    id: 'PASTEL_FEIRA',
    name: 'Pastel de Carne com Queijo',
    icon: '🥟',
    desc: 'Pastel de feira frito na hora, estalando de crocante',
    isValuable: false,
    consumable: true,
    actionLabel: 'Comer Pastel Crocante',
    use: (gameState, sound) => {
      if (sound && sound.playFoodBite) sound.playFoodBite();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ fome: 40, sanidade: 15 }, 'Comeu pastel de feira');
      }
      return `🥟 <strong>PASTEL DE FEIRA:</strong> Massa crocante sequinha e recheio fumegante! (+40 Bucho, +15 Sanidade)`;
    }
  },
  GARRAFA_AGUA: {
    id: 'GARRAFA_AGUA',
    name: 'Garrafa d\'Água Mineral',
    icon: '💧',
    desc: 'Água mineral cristalina 500ml',
    isValuable: false,
    consumable: true,
    actionLabel: 'Beber Água Mineral',
    use: (gameState, sound) => {
      if (sound && sound.playDrinkGulp) sound.playDrinkGulp();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ fome: 15, sanidade: 15, perigo: -15 }, 'Bebeu água mineral');
      }
      return `💧 <strong>ÁGUA MINERAL:</strong> Hidratação pura sob o calor paulistano! (+15 Bucho, +15 Sanidade, -15 Perigo)`;
    }
  },
  GUARDA_CHUVA: {
    id: 'GUARDA_CHUVA',
    name: 'Guarda-Chuva de Camelô',
    icon: '☂️',
    desc: 'Guarda-chuva retrátil contra o temporal paulistano',
    isValuable: false,
    actionLabel: 'Abrir / Proteger da Chuva',
    use: (gameState, sound) => {
      if (sound && sound.playCoin) sound.playCoin();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ sanidade: 10 }, 'Abriu guarda-chuva');
      }
      return `☂️ <strong>GUARDA-CHUVA:</strong> Armado contra o sereno e o temporal de Pirituba! (+10 Sanidade)`;
    }
  },
  COXINHA: {
    id: 'COXINHA',
    name: 'Coxinha com Catupiry',
    icon: '🍗',
    desc: 'Coxinha dourada crocante com recheio cremoso de frango desfiado',
    isValuable: false,
    consumable: true,
    actionLabel: 'Comer Coxinha Quentinha',
    use: (gameState, sound) => {
      if (sound && sound.playFoodBite) sound.playFoodBite();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ fome: 35, sanidade: 15 }, 'Comeu coxinha quentinha');
      }
      return `🍗 <strong>COXINHA DA PADOCA:</strong> Casquinha crocante e catupiry cremoso! (+35 Bucho, +15 Sanidade)`;
    }
  },
  CAFE_PINGADO: {
    id: 'CAFE_PINGADO',
    name: 'Café Pingado no Copo',
    icon: '☕',
    desc: 'Café com leite bem tirado no copo americano com espuma cremosa',
    isValuable: false,
    consumable: true,
    actionLabel: 'Tomar Café Pingado',
    use: (gameState, sound) => {
      if (sound && sound.playDrinkGulp) sound.playDrinkGulp();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ sanidade: 25, fome: 15 }, 'Tomou café pingado quentinho');
      }
      return `☕ <strong>CAFÉ PINGADO:</strong> Cafezinho fumegante direto do balcão! (+25 Sanidade, +15 Bucho)`;
    }
  },
  COROTE: {
    id: 'COROTE',
    name: 'Corote Sabores 500ml',
    icon: '🍾',
    desc: 'Garrafinha clássica de coquetel alcóolico da quebrada',
    isValuable: false,
    consumable: true,
    actionLabel: 'Tomar Gole de Corote',
    use: (gameState, sound) => {
      if (sound && sound.playDrinkGulp) sound.playDrinkGulp();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ sanidade: 30, perigo: 15 }, 'Tomou gole de Corote');
      }
      return `🍾 <strong>COROTE:</strong> 'Desce rasgando e alegra a mente!' (+30 Sanidade, +15 Perigo)`;
    }
  },
  MARMITA: {
    id: 'MARMITA',
    name: 'Marmitex de Feijoada Completa',
    icon: '🍲',
    desc: 'Arroz, feijão preto, farofa, couve e vinagrete em marmita de alumínio',
    isValuable: false,
    consumable: true,
    actionLabel: 'Almoçar Marmitex',
    use: (gameState, sound) => {
      if (sound && sound.playFoodBite) sound.playFoodBite();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ fome: 60, sanidade: 20 }, 'Comeu marmitex caprichado');
      }
      return `🍲 <strong>MARMITEX COMPLETO:</strong> Bucho cheio e alma confortada! (+60 Bucho, +20 Sanidade)`;
    }
  },
  CHAVE_RODA: {
    id: 'CHAVE_RODA',
    name: 'Chave de Roda Cruz',
    icon: '🔧',
    desc: 'Ferramenta de aço forjado pesada da borracharia',
    isValuable: true,
    actionLabel: 'Brandir Chave de Roda',
    use: (gameState, sound) => {
      if (sound && sound.playPunchHit) sound.playPunchHit();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ perigo: -15, sanidade: 10 }, 'Exibiu chave de roda pesada');
      }
      return `🔧 <strong>CHAVE DE RODA:</strong> 'Respeita o mecânico!' Ferramenta pesada nas mãos (-15 Perigo, +10 Sanidade)`;
    }
  },
  LATA_OLEO: {
    id: 'LATA_OLEO',
    name: 'Óleo de Motor 20W50',
    icon: '🛢️',
    desc: 'Lata de óleo lubrificante de motor',
    isValuable: false,
    actionLabel: 'Verificar Nível do Óleo',
    use: (gameState, sound) => {
      if (sound && sound.playCoin) sound.playCoin();
      return `🛢️ <strong>LATA DE ÓLEO:</strong> Motor lubrificado e sem bater pino!`;
    }
  },
  MALETA_GRANA: {
    id: 'MALETA_GRANA',
    name: 'Maleta Executiva com Notas',
    icon: '💼',
    desc: 'Maleta de couro recheada de cédulas de R$ 100 e R$ 200',
    isValuable: true,
    actionLabel: 'Contar Cédulas da Maleta',
    use: (gameState, sound) => {
      if (sound && sound.playCoin) sound.playCoin();
      if (gameState && typeof gameState.apply === 'function') {
        gameState.apply({ grana: 50000, sanidade: 40 }, 'Pegou bolada da maleta');
      }
      return `💼 <strong>MALETA DE DINHEIRO:</strong> Bolada de R$ 500,00 contada na mão! (+R$ 500,00, +40 Sanidade)`;
    }
  }
};

export class HandsSystem {
  constructor(scene, camera, soundEngine, gameState) {
    this.scene = scene;
    this.camera = camera;
    this.sound = soundEngine;
    this.state = gameState;

    // Hand Slots (null = bare hands)
    this.leftHand = null;
    this.rightHand = null;

    // Ground pickups in the world
    this.groundPickups = [];

    // Punch animation state
    this.leftPunchTime = 0;
    this.rightPunchTime = 0;
    this.punchDuration = 0.22;
    this.isLeftPunching = false;
    this.isRightPunching = false;

    // Sway / bobbing state
    this.bobTime = 0;
    this.walkSwayX = 0;
    this.walkSwayY = 0;

    // Notification callback for HUD toasts
    this.onToast = null;

    // Ensure camera is in the scene so child viewmodel renders
    if (this.scene && this.camera && !this.camera.parent) {
      this.scene.add(this.camera);
    }

    // 3D FPS Viewmodel Hierarchy
    this.viewmodel = new THREE.Group();
    this.viewmodel.name = 'fps_viewmodel';
    this.camera.add(this.viewmodel);

    // Initial positioning in front of camera
    this.viewmodel.position.set(0, -0.34, -0.52);

    this.createViewmodelArms();
    this.initDefaultGroundPickups();
  }

  // Equips starting loadout based on character class archetype
  equipStartingLoadout(classKey) {
    if (classKey === 'CLASSE_AB') {
      // Faria Limer: iPhone in right hand, bare left hand
      this.leftHand = null;
      this.rightHand = 'IPHONE';
    } else if (classKey === 'CLASSE_C') {
      // CLT: Cartão de Ônibus in right hand, bare left hand
      this.leftHand = null;
      this.rightHand = 'CARTAO_ONIBUS';
    } else {
      // Quebrada (CLASSE_DE): Fake JBL soundbox in right hand, bare left hand
      this.leftHand = null;
      this.rightHand = 'JBL_SOUNDBOX';
    }
    this.updateHeldItemMeshes();
  }

  // Construct articulated FPS left and right arms
  createViewmodelArms() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xa26b47 });
    const sleeveMat = new THREE.MeshLambertMaterial({ color: 0x224488 });
    const watchMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    this.skinMat = skinMat;
    this.sleeveMat = sleeveMat;

    // --- LEFT ARM ---
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.25, 0, 0);

    // Left Sleeve / Shoulder base
    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.22, 8), sleeveMat);
    leftSleeve.rotation.x = Math.PI / 3;
    leftSleeve.position.set(0, -0.06, 0.08);
    this.leftSleeve = leftSleeve;
    this.leftArmGroup.add(leftSleeve);

    // Left Forearm
    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.26, 8), skinMat);
    leftForearm.rotation.x = Math.PI / 4;
    leftForearm.position.set(0, -0.02, 0.24);
    this.leftArmGroup.add(leftForearm);

    // Left Hand / Knuckles
    this.leftHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.12), skinMat);
    this.leftHandMesh.position.set(0, 0.06, 0.36);
    this.leftArmGroup.add(this.leftHandMesh);

    // Left Item Anchor
    this.leftItemAnchor = new THREE.Group();
    this.leftItemAnchor.position.set(0, 0.06, 0.38);
    this.leftArmGroup.add(this.leftItemAnchor);

    this.viewmodel.add(this.leftArmGroup);

    // --- RIGHT ARM ---
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.25, 0, 0);

    // Right Sleeve
    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.22, 8), sleeveMat);
    rightSleeve.rotation.x = Math.PI / 3;
    rightSleeve.position.set(0, -0.06, 0.08);
    this.rightArmGroup.add(rightSleeve);

    // Right Forearm with Casio / Apple Watch
    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.26, 8), skinMat);
    rightForearm.rotation.x = Math.PI / 4;
    rightForearm.position.set(0, -0.02, 0.24);
    this.rightArmGroup.add(rightForearm);

    // Watch band
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.04, 8), watchMat);
    watch.rotation.x = Math.PI / 4;
    watch.position.set(0, 0.01, 0.28);
    this.rightArmGroup.add(watch);

    // Right Hand / Knuckles
    this.rightHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.12), skinMat);
    this.rightHandMesh.position.set(0, 0.06, 0.36);
    this.rightArmGroup.add(this.rightHandMesh);

    // Right Item Anchor
    this.rightItemAnchor = new THREE.Group();
    this.rightSleeve = rightSleeve;
    this.viewmodel.add(this.rightArmGroup);

    if (window.app?.customizer?.currentConfig) {
      this.setCustomization(window.app.customizer.currentConfig);
    }

    this.updateHeldItemMeshes();
  }

  setCustomization(config) {
    if (!config) return;
    const cat = window.app?.customizer;
    if (!cat) return;

    const skinObj = cat.getItem('skinTones', config.skinTone);
    if (skinObj && this.skinMat) {
      this.skinMat.color.setHex(skinObj.color);
    }

    const shirtObj = cat.getItem('shirts', config.shirt);
    if (shirtObj && this.sleeveMat) {
      if (shirtObj.isBare) {
        // Sem Camisa: sleeves become bare skin matching skin tone
        if (skinObj) this.sleeveMat.color.setHex(skinObj.color);
      } else {
        this.sleeveMat.color.setHex(shirtObj.color || 0x224488);
      }
    }
  }

  // Create procedural 3D mesh representation of an item for the viewmodel
  createItemModel(itemKey) {
    const group = new THREE.Group();

    if (itemKey === 'IPHONE') {
      // Sleek titanium dark body
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x1a1a20 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.012), bodyMat);
      group.add(body);

      // Glowing OLED Screen
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x3388ff });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.082, 0.165), screenMat);
      screen.position.z = 0.007;
      group.add(screen);

      // Triple Camera bump on back
      const camMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
      const camBump = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.038, 0.006), camMat);
      camBump.position.set(-0.02, 0.06, -0.008);
      group.add(camBump);

      group.rotation.x = -Math.PI / 6;
    } else if (itemKey === 'CARTAO_ONIBUS') {
      // SPTrans Bilhete Único card (Yellow & Red)
      const cardMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.075, 0.004), cardMat);
      group.add(card);

      // Red header stripe
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdd2222 });
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.024), stripeMat);
      stripe.position.set(0, 0.022, 0.003);
      group.add(stripe);

      // Magnetic chip
      const chipMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
      const chip = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.016), chipMat);
      chip.position.set(-0.03, -0.01, 0.003);
      group.add(chip);

      group.rotation.x = -Math.PI / 8;
    } else if (itemKey === 'JBL_SOUNDBOX') {
      // Cylindrical portable speaker (Electric Blue)
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x0077dd });
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 12), bodyMat);
      cylinder.rotation.z = Math.PI / 2;
      group.add(cylinder);

      // Front acoustic mesh grille (Dark Gray)
      const grilleMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.12, 12), grilleMat);
      grille.rotation.z = Math.PI / 2;
      group.add(grille);

      // Glowing LED power ring
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
      const ledRing = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.004, 6, 16), ledMat);
      ledRing.rotation.y = Math.PI / 2;
      ledRing.position.x = 0.081;
      group.add(ledRing);

      group.rotation.x = -Math.PI / 10;
    } else if (itemKey === 'CERVEJA_LATA') {
      // 350ml Can (Skol Yellow)
      const canMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.13, 12), canMat);
      group.add(can);

      // Aluminum top rim
      const rimMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 12), rimMat);
      rim.position.y = 0.068;
      group.add(rim);

      group.rotation.x = -Math.PI / 10;
    } else if (itemKey === 'PAO_NA_CHAPA' || itemKey === 'PASTEL_FEIRA') {
      // Golden fried / toasted snack
      const snackColor = itemKey === 'PAO_NA_CHAPA' ? 0xd49b55 : 0xe8a735;
      const snackMat = new THREE.MeshLambertMaterial({ color: snackColor });
      const snack = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.09), snackMat);
      group.add(snack);

      // Greasy bakery paper wrapper
      const paperMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.05), paperMat);
      paper.position.set(0, -0.01, -0.025);
      group.add(paper);
    } else if (itemKey === 'GARRAFA_AGUA') {
      // Clear blue water bottle
      const bottleMat = new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.85 });
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.18, 12), bottleMat);
      group.add(bottle);

      // Blue cap
      const capMat = new THREE.MeshBasicMaterial({ color: 0x0044aa });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 8), capMat);
      cap.position.y = 0.10;
      group.add(cap);
    } else if (itemKey === 'GUARDA_CHUVA') {
      // Black folded umbrella handle & canopy
      const handleMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const umbrella = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.28, 8), handleMat);
      group.add(umbrella);
    }

    return group;
  }

  // Refresh held 3D models in hand anchors
  updateHeldItemMeshes() {
    // Clear existing children in anchors
    while (this.leftItemAnchor.children.length > 0) {
      this.leftItemAnchor.remove(this.leftItemAnchor.children[0]);
    }
    while (this.rightItemAnchor.children.length > 0) {
      this.rightItemAnchor.remove(this.rightItemAnchor.children[0]);
    }

    // Attach left item if any
    if (this.leftHand && ITEM_TYPES[this.leftHand]) {
      const leftModel = this.createItemModel(this.leftHand);
      this.leftItemAnchor.add(leftModel);
      this.leftHandMesh.scale.set(0.85, 0.85, 0.85); // Clenched around item
    } else {
      this.leftHandMesh.scale.set(1.0, 1.0, 1.0); // Bare fist
    }

    // Attach right item if any
    if (this.rightHand && ITEM_TYPES[this.rightHand]) {
      const rightModel = this.createItemModel(this.rightHand);
      this.rightItemAnchor.add(rightModel);
      this.rightHandMesh.scale.set(0.85, 0.85, 0.85); // Clenched around item
    } else {
      this.rightHandMesh.scale.set(1.0, 1.0, 1.0); // Bare fist
    }
  }

  // Action triggered by [Q] (Left Hand)
  useLeftHand(passedState = null) {
    const activeState = passedState || this.state || window.app?.game?.state;
    if (this.leftHand && ITEM_TYPES[this.leftHand]) {
      const item = ITEM_TYPES[this.leftHand];
      let msg = item.use ? item.use(activeState, this.sound) : null;
      if (activeState?.lastDiminishing?.isDiminished) {
        const dim = activeState.lastDiminishing;
        if (dim.isExhausted) {
          msg = `⚠️ <strong>${item.name}:</strong> Efeito esgotado pela repetição contínua! (0% de efeito)`;
        } else if (msg) {
          msg += `<div style="margin-top:3px;font-size:10px;color:#ffcc00;font-weight:bold;">⚠️ Ação repetitiva: rendimento reduzido (${Math.round(dim.mult * 100)}% de efeito)</div>`;
        }
      }
      if (this.onToast && msg) this.onToast(msg, 2600);
      else if (window.app?.game?.hud?.showToast && msg) window.app.game.hud.showToast(msg, 2600);

      // If consumable (beer, food, water), clear slot after use
      if (item.consumable) {
        this.leftHand = null;
        this.updateHeldItemMeshes();
      }
      return msg;
    } else {
      // Bare hand -> Left Jab Punch!
      this.triggerPunch('left');
      return null;
    }
  }

  // Action triggered by [E] (Right Hand)
  useRightHand(passedState = null) {
    const activeState = passedState || this.state || window.app?.game?.state;
    if (this.rightHand && ITEM_TYPES[this.rightHand]) {
      const item = ITEM_TYPES[this.rightHand];
      let msg = item.use ? item.use(activeState, this.sound) : null;
      if (activeState?.lastDiminishing?.isDiminished) {
        const dim = activeState.lastDiminishing;
        if (dim.isExhausted) {
          msg = `⚠️ <strong>${item.name}:</strong> Efeito esgotado pela repetição contínua! (0% de efeito)`;
        } else if (msg) {
          msg += `<div style="margin-top:3px;font-size:10px;color:#ffcc00;font-weight:bold;">⚠️ Ação repetitiva: rendimento reduzido (${Math.round(dim.mult * 100)}% de efeito)</div>`;
        }
      }
      if (this.onToast && msg) this.onToast(msg, 2600);
      else if (window.app?.game?.hud?.showToast && msg) window.app.game.hud.showToast(msg, 2600);

      // If consumable, clear slot after use
      if (item.consumable) {
        this.rightHand = null;
        this.updateHeldItemMeshes();
      }
      return msg;
    } else {
      // Bare hand -> Right Cross Punch!
      this.triggerPunch('right');
      return null;
    }
  }

  // Discard / throw Left Hand item on the ground with [Z]
  dropLeftHand(playerPos = null, cameraDirection = null) {
    const pos = playerPos || window.app?.controls?.position || new THREE.Vector3();
    const dir = cameraDirection || window.app?.controls?.getForwardVector?.() || new THREE.Vector3(0, 0, -1);
    const toast = this.onToast || ((msg, d) => window.app?.game?.hud?.showToast?.(msg, d));

    if (!this.leftHand) {
      toast('⚠️ <strong>MÃO ESQUERDA VAZIA:</strong> Nada para soltar. Pressione [Q] para Soco!', 2500);
      return false;
    }

    const itemKey = this.leftHand;
    const itemDef = ITEM_TYPES[itemKey];
    this.leftHand = null;
    this.updateHeldItemMeshes();

    // Spawn 1m in front of player on ground
    const dropX = pos.x + (dir?.x || 0) * 1.2;
    const dropY = (pos.y !== undefined ? pos.y : 0) + 0.15;
    const dropZ = pos.z + (dir?.z || -1) * 1.2;
    this.spawnGroundItem(itemKey, dropX, dropY, dropZ);

    if (this.sound && this.sound.playItemDrop) this.sound.playItemDrop();
    toast(`🗑️ <strong>ITEM LARGADO:</strong> ${itemDef.name} jogado no chão. [Mão Esquerda Livre - Q para Soco]`, 3500);
    return true;
  }

  // Discard / throw Right Hand item on the ground with [C]
  dropRightHand(playerPos = null, cameraDirection = null) {
    const pos = playerPos || window.app?.controls?.position || new THREE.Vector3();
    const dir = cameraDirection || window.app?.controls?.getForwardVector?.() || new THREE.Vector3(0, 0, -1);
    const toast = this.onToast || ((msg, d) => window.app?.game?.hud?.showToast?.(msg, d));

    if (!this.rightHand) {
      toast('⚠️ <strong>MÃO DIREITA VAZIA:</strong> Nada para soltar. Pressione [E] para Soco!', 2500);
      return false;
    }

    const itemKey = this.rightHand;
    const itemDef = ITEM_TYPES[itemKey];
    this.rightHand = null;
    this.updateHeldItemMeshes();

    // Spawn 1m in front of player on ground
    const dropX = pos.x + (dir?.x || 0) * 1.2;
    const dropY = (pos.y !== undefined ? pos.y : 0) + 0.15;
    const dropZ = pos.z + (dir?.z || -1) * 1.2;
    this.spawnGroundItem(itemKey, dropX, dropY, dropZ);

    if (this.sound && this.sound.playItemDrop) this.sound.playItemDrop();
    toast(`🗑️ <strong>ITEM LARGADO:</strong> ${itemDef.name} jogado no chão. [Mão Direita Livre - E para Soco]`, 3500);
    return true;
  }

  // Trigger punch animation and punch sound
  triggerPunch(side = 'left') {
    if (side === 'left') {
      if (this.isLeftPunching) return;
      this.isLeftPunching = true;
      this.leftPunchTime = 0;
    } else {
      if (this.isRightPunching) return;
      this.isRightPunching = true;
      this.rightPunchTime = 0;
    }

    if (this.sound && this.sound.playPunchWhoosh) {
      this.sound.playPunchWhoosh();
    }

    // Hit detection for nearby objects, vehicles, and NPCs
    this.checkPunchHit(side);
  }

  // Check if punch connects with a nearby entity
  checkPunchHit(side) {
    if (!this.scene) return;

    // Check hit against nearby doors, roaming NPCs, or colliders within 2.4m
    const raycaster = new THREE.Raycaster();
    const center = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(center, this.camera);
    raycaster.far = 2.4;

    // 1. Check if punch connects with an interactive closed door
    const interactables = window.app?.game?.interactables;
    if (interactables && interactables.doors) {
      for (const door of interactables.doors) {
        if (!door.isOpen && door.doorMesh) {
          const doorHits = raycaster.intersectObject(door.doorMesh, true);
          if (doorHits && doorHits.length > 0 && doorHits[0].distance <= 2.4) {
            interactables.triggerDoor(door);
            return;
          }
        }
      }
    }

    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (intersects && intersects.length > 0) {
      const hit = intersects.find(i => i.distance <= 2.2 && !i.object.name?.includes('viewmodel'));
      if (hit) {
        if (this.sound && this.sound.playPunchHit) {
          this.sound.playPunchHit();
        }
        if (this.onToast) {
          const punchName = side === 'left' ? 'JAB DE ESQUERDA' : 'DIRETO DE DIREITA';
          this.onToast(`👊 <strong>${punchName}!</strong> Golpe desferido no alvo!`, 2000);
        }
      }
    }
  }

  // Spawns a physical 3D ground pickup with subtle bobbing and visual beacon
  spawnGroundItem(itemKey, x, y, z) {
    if (!ITEM_TYPES[itemKey]) return null;
    const itemDef = ITEM_TYPES[itemKey];

    const pickupGroup = new THREE.Group();
    pickupGroup.position.set(x, y, z);

    // 3D item model
    const itemModel = this.createItemModel(itemKey);
    itemModel.scale.set(1.4, 1.4, 1.4);
    pickupGroup.add(itemModel);

    // Subtle beacon ring on the ground
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.6 });
    const beacon = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.24, 16), beaconMat);
    beacon.rotation.x = -Math.PI / 2;
    beacon.position.y = 0.02;
    pickupGroup.add(beacon);

    this.scene.add(pickupGroup);

    const pickup = {
      id: `pickup_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      itemKey,
      itemDef,
      mesh: pickupGroup,
      position: new THREE.Vector3(x, y, z),
      initialY: y,
      bobOffset: Math.random() * Math.PI * 2
    };

    this.groundPickups.push(pickup);
    return pickup;
  }

  // Pick up a ground item into an available hand slot
  pickupGroundItem(pickup) {
    let targetHand = null;
    if (!this.leftHand) {
      targetHand = 'left';
      this.leftHand = pickup.itemKey;
    } else if (!this.rightHand) {
      targetHand = 'right';
      this.rightHand = pickup.itemKey;
    } else {
      // Both hands full!
      if (this.onToast) {
        this.onToast(`⚠️ <strong>MÃOS CHEIAS:</strong> Solte um item com [Z] ou [C] para pegar ${pickup.itemDef.name}!`, 3000);
      }
      return false;
    }

    // Remove from scene and pickups array
    if (pickup.mesh && pickup.mesh.parent) {
      pickup.mesh.parent.remove(pickup.mesh);
    }
    const idx = this.groundPickups.indexOf(pickup);
    if (idx !== -1) {
      this.groundPickups.splice(idx, 1);
    }

    this.updateHeldItemMeshes();
    if (this.sound && this.sound.playItemPickup) this.sound.playItemPickup();
    if (this.onToast) {
      const handLabel = targetHand === 'left' ? 'MÃO ESQUERDA [Q]' : 'MÃO DIREITA [E]';
      this.onToast(`🎒 <strong>ITEM COLETADO:</strong> ${pickup.itemDef.name} equipado na ${handLabel}!`, 3500);
    }
    return true;
  }

  // Item Robbery Mechanic: thug snatches a held item
  robItem() {
    let stolenKey = null;
    let stolenHand = null;

    if (this.rightHand && ITEM_TYPES[this.rightHand]?.isValuable) {
      stolenKey = this.rightHand;
      stolenHand = 'MÃO DIREITA';
      this.rightHand = null;
    } else if (this.leftHand && ITEM_TYPES[this.leftHand]?.isValuable) {
      stolenKey = this.leftHand;
      stolenHand = 'MÃO ESQUERDA';
      this.leftHand = null;
    } else if (this.rightHand) {
      stolenKey = this.rightHand;
      stolenHand = 'MÃO DIREITA';
      this.rightHand = null;
    } else if (this.leftHand) {
      stolenKey = this.leftHand;
      stolenHand = 'MÃO ESQUERDA';
      this.leftHand = null;
    }

    if (stolenKey) {
      this.updateHeldItemMeshes();
      const itemDef = ITEM_TYPES[stolenKey];
      if (this.onToast) {
        this.onToast(`🚨 <strong>PERDEU, PERDEU!</strong> O malandro arrancou seu ${itemDef.name} da sua ${stolenHand}!`, 4500);
      }
      return itemDef;
    }
    return null;
  }

  // Police Confiscation Mechanic: police seizes illegal/suspicious items
  confiscateItem(predicate = null) {
    const shouldConfiscate = (k) => {
      if (!k) return false;
      if (predicate) return predicate(k);
      return k === 'JBL_SOUNDBOX' || k === 'IPHONE'; // Thinks it's stolen / disturbance of peace
    };

    let confiscated = [];
    if (shouldConfiscate(this.rightHand)) {
      confiscated.push(ITEM_TYPES[this.rightHand]);
      this.rightHand = null;
    }
    if (shouldConfiscate(this.leftHand)) {
      confiscated.push(ITEM_TYPES[this.leftHand]);
      this.leftHand = null;
    }

    if (confiscated.length > 0) {
      this.updateHeldItemMeshes();
      if (this.onToast) {
        const names = confiscated.map(c => c.name).join(' e ');
        this.onToast(`👮 <strong>APREENSÃO POLICIAL:</strong> O Sargento apreendeu seu ${names}!`, 4500);
      }
      return confiscated;
    }
    return null;
  }

  // Initialize scattered street items across Pirituba
  initDefaultGroundPickups() {
    // 1. Skol Can outside Bar do Tião
    this.spawnGroundItem('CERVEJA_LATA', 13.5, 0.25, 39.5);

    // 2. Skol Can near Adega do Zé
    this.spawnGroundItem('CERVEJA_LATA', -15.2, 0.25, 36.5);

    // 3. Pão na Chapa outside Padaria Estrela
    this.spawnGroundItem('PAO_NA_CHAPA', 30.5, 0.25, 36.0);

    // 4. Pastel de Feira at Barraca de Pastel
    this.spawnGroundItem('PASTEL_FEIRA', -4.5, 0.25, 34.5);

    // 5. Garrafa d'Água at Posto Pirituba
    this.spawnGroundItem('GARRAFA_AGUA', -40.5, 0.25, 39.5);

    // 6. Guarda-Chuva at Ponto de Ônibus
    this.spawnGroundItem('GUARDA_CHUVA', -22.5, 0.25, 8.5);

    // 7. Extra iPhone inside the Penthouse coffee table
    this.spawnGroundItem('IPHONE', 37.5, 32.45, 4.8);
  }

  // Frame update: animate viewmodel, punch kinematics, and ground pickups
  update(delta, playerPos, isMoving, isSprinting, isThirdPerson) {
    // 1. Visibility toggle between 1st Person and 3rd Person
    this.viewmodel.visible = !isThirdPerson;
    if (isThirdPerson) return;

    this.bobTime += delta * (isSprinting ? 14.0 : isMoving ? 9.0 : 2.5);

    // 2. Natural sway and breathing bobbing
    const swayX = isMoving ? Math.sin(this.bobTime * 0.5) * 0.025 : Math.sin(this.bobTime * 0.5) * 0.006;
    const swayY = isMoving ? Math.abs(Math.sin(this.bobTime)) * 0.022 : Math.sin(this.bobTime) * 0.005;

    // 3. Left Hand Punch Kinematics
    let leftPunchZ = 0;
    let leftPunchY = 0;
    let leftPunchRotX = 0;

    if (this.isLeftPunching) {
      this.leftPunchTime += delta;
      const progress = this.leftPunchTime / this.punchDuration;
      if (progress >= 1.0) {
        this.isLeftPunching = false;
        this.leftPunchTime = 0;
      } else {
        // Bell curve punch thrust
        const punchCurve = Math.sin(progress * Math.PI);
        leftPunchZ = punchCurve * 0.32;
        leftPunchY = punchCurve * 0.08;
        leftPunchRotX = -punchCurve * 0.45;
      }
    }

    // 4. Right Hand Punch Kinematics
    let rightPunchZ = 0;
    let rightPunchY = 0;
    let rightPunchRotX = 0;

    if (this.isRightPunching) {
      this.rightPunchTime += delta;
      const progress = this.rightPunchTime / this.punchDuration;
      if (progress >= 1.0) {
        this.isRightPunching = false;
        this.rightPunchTime = 0;
      } else {
        const punchCurve = Math.sin(progress * Math.PI);
        rightPunchZ = punchCurve * 0.32;
        rightPunchY = punchCurve * 0.08;
        rightPunchRotX = -punchCurve * 0.45;
      }
    }

    // Apply kinematics to Left Arm
    this.leftArmGroup.position.set(
      -0.25 + swayX * 0.5,
      -swayY + leftPunchY,
      leftPunchZ
    );
    this.leftArmGroup.rotation.x = leftPunchRotX;

    // Apply kinematics to Right Arm
    this.rightArmGroup.position.set(
      0.25 + swayX * 0.5,
      -swayY + rightPunchY,
      rightPunchZ
    );
    this.rightArmGroup.rotation.x = rightPunchRotX;

    // 5. Update Ground Pickups (rotation, bobbing, proximity pickup)
    const pickupTime = performance.now() * 0.002;
    for (let i = this.groundPickups.length - 1; i >= 0; i--) {
      const p = this.groundPickups[i];
      p.mesh.rotation.y += delta * 1.6;
      p.mesh.position.y = p.initialY + Math.sin(pickupTime + p.bobOffset) * 0.04;

      // Proximity check to player
      if (playerPos) {
        const dist = p.position.distanceTo(playerPos);
        if (dist < 1.35) {
          // Automatically pick up if player has an empty hand!
          if (!this.leftHand || !this.rightHand) {
            this.pickupGroundItem(p);
          }
        }
      }
    }
  }

  // Get status string of held items for HUD
  getHandStatus() {
    return {
      left: this.leftHand ? ITEM_TYPES[this.leftHand] : null,
      right: this.rightHand ? ITEM_TYPES[this.rightHand] : null
    };
  }
}
