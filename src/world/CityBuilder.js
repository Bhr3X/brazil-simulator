/**
 * CityBuilder: Generates the Brazilian Favela Suburb (Pirituba, São Paulo)
 * Features multi-tiered brick houses, escadão stairs, lajes, caixas d'água,
 * overhead power lines, botecos, pixação, Pico do Jaraguá, and cultural details.
 */

export class CityBuilder {
  constructor(scene, physics, textures) {
    this.scene = scene;
    this.physics = physics;
    this.textures = textures;

    // Interactive / animated elements
    this.streetLights = [];
    this.windowMeshes = [];
    this.kites = [];
    this.beaconLights = [];

    // Lighting fixtures
    this.sunLight = null;
    this.hemiLight = null;
    this.ambientLight = null;
  }

  build() {
    this.setupLighting();
    this.buildSkyAndHorizon();
    this.buildTerrainAndRoads();
    this.buildMainStreetShops();
    this.buildFavelaHillside();
    this.buildEscadaoStairs();
    this.buildPowerGrid();
    this.buildPropsAndDetails();
    this.buildEdgarFaccoCrossing();
    this.buildPicoDoJaragua();
    this.buildStrayDog();
  }

  // 1. Scene Lighting & Atmospherics
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x54483b, 0.45);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(40, 70, 50);
    this.scene.add(this.sunLight);
  }

  // 2. Sky and Distant Backdrop
  buildSkyAndHorizon() {
    // Sky hemisphere dome
    const skyGeo = new THREE.SphereGeometry(400, 24, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x6bb5ff,
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Distant city rolling hills backdrop
    const hillGeo = new THREE.CylinderGeometry(350, 360, 60, 32, 1, true);
    const hillMat = new THREE.MeshBasicMaterial({
      color: 0x4a5f45,
      side: THREE.BackSide
    });
    const hillMesh = new THREE.Mesh(hillGeo, hillMat);
    hillMesh.position.y = 15;
    this.scene.add(hillMesh);
  }

  // 3. Avenida General Edgar Facó & Rua Paula Ferreira Crossing
  buildTerrainAndRoads() {
    // 3.1 Main Arterial Avenue: Avenida General Edgar Facó (Westbound & Eastbound lanes)
    const roadGeo = new THREE.PlaneGeometry(120, 24);
    const roadMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(15, 3)
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, 20);
    this.scene.add(roadMesh);

    // 3.2 Central Dedicated SPTrans Bus Corridor (Faixa Exclusiva de Ônibus - Red Asphalt)
    const busLaneGeo = new THREE.PlaneGeometry(120, 4.2);
    const busLaneMat = new THREE.MeshLambertMaterial({
      map: this.textures.createBusLaneTexture(15, 1)
    });
    const busLane = new THREE.Mesh(busLaneGeo, busLaneMat);
    busLane.rotation.x = -Math.PI / 2;
    busLane.position.set(0, 0.015, 20); // slightly raised over base asphalt
    this.scene.add(busLane);

    // 3.3 Cross Street: Rua Paula Ferreira (Crossing Edgar Facó at X = 0)
    const paulaGeo = new THREE.PlaneGeometry(10, 40);
    const paulaMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(2, 6)
    });
    const paulaStreet = new THREE.Mesh(paulaGeo, paulaMat);
    paulaStreet.rotation.x = -Math.PI / 2;
    paulaStreet.position.set(1.5, 0.01, 20);
    this.scene.add(paulaStreet);

    // 3.4 Pedestrian Crosswalks (Faixas de Pedestre Brancas)
    const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    [-1.5, 4.5].forEach(cx => {
      for (let z = 9; z <= 31; z += 1.6) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), crosswalkMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(cx, 0.02, z);
        this.scene.add(stripe);
      }
    });

    // North Sidewalk (Calçada Paulista)
    const sideNorthGeo = new THREE.BoxGeometry(120, 0.25, 6);
    const sideMat = new THREE.MeshLambertMaterial({
      map: this.textures.createCalcadaPaulista(24, 2)
    });
    const sideNorth = new THREE.Mesh(sideNorthGeo, sideMat);
    sideNorth.position.set(0, 0.125, 5);
    this.scene.add(sideNorth);
    this.physics.addBoxCollider(
      new THREE.Vector3(-60, 0, 2),
      new THREE.Vector3(60, 0.25, 8),
      'curb'
    );

    // South Sidewalk (Calçada Paulista)
    const sideSouth = new THREE.Mesh(sideNorthGeo, sideMat);
    sideSouth.position.set(0, 0.125, 35);
    this.scene.add(sideSouth);
    this.physics.addBoxCollider(
      new THREE.Vector3(-60, 0, 32),
      new THREE.Vector3(60, 0.25, 38),
      'curb'
    );

    // Curbs (Guias de concreto)
    const curbMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const curbGeo = new THREE.BoxGeometry(120, 0.3, 0.2);
    const curbNorth = new THREE.Mesh(curbGeo, curbMat);
    curbNorth.position.set(0, 0.15, 8.1);
    this.scene.add(curbNorth);

    const curbSouth = new THREE.Mesh(curbGeo, curbMat);
    curbSouth.position.set(0, 0.15, 31.9);
    this.scene.add(curbSouth);

    // Favela Hillside Base Ground (rising towards -Z)
    const hillBaseGeo = new THREE.PlaneGeometry(120, 65);
    const hillBaseMat = new THREE.MeshLambertMaterial({
      map: this.textures.createReboco('#706b63', 10, 8)
    });
    const hillBase = new THREE.Mesh(hillBaseGeo, hillBaseMat);
    hillBase.rotation.x = -Math.PI / 2 + 0.16;
    hillBase.position.set(0, 4.5, -25);
    this.scene.add(hillBase);

    // Slope collider
    this.physics.addSlope(-60, 60, -55, 2, 9.5, 0.25);
  }

  // 4. Main Street Fronts & Walkable Interiors (Version 2 Update)
  buildMainStreetShops() {
    // 4.1 WALKABLE "ADEGA DO ZÉ" (at X = -14, Z = 42)
    this.buildWalkableAdega(-14, 0.25, 42);

    // Yellow plastic beer crates stacked outside Adega (Caixas de Skol/Brahma)
    this.buildBeerCrateStack(-19, 0.25, 37.5, '#f5b800', 3, 2);
    this.buildBeerCrateStack(-8.8, 0.25, 37.5, '#c92418', 2, 2);

    // 4.2 WALKABLE "BAR DO TIÃO / BOTECO" WITH SNOOKER TABLE (at X = 12, Z = 42)
    this.buildWalkableBarDoTiao(12, 0.25, 42);

    // Yellow plastic boteco tables and chairs outside Bar do Tião
    this.buildBotecoTableSet(6.5, 0.25, 36.5);
    this.buildBotecoTableSet(17.5, 0.25, 36.5);

    // 4.3 "PADARIA ESTRELA DE PIRITUBA" (at X = 32, Z = 42)
    this.buildShopBuilding({
      x: 32, y: 0.25, z: 42,
      w: 11, h: 5.0, d: 8,
      wallColor: '#fae5be',
      signText: 'PADARIA ESTRELA DE PIRITUBA',
      doorTexture: this.textures.createPortaAco('#8a3c20'),
      laje: true,
      hasWaterTank: true
    });

    // 4.4 "BORRACHARIA & OFICINA" (at X = -34, Z = 42)
    this.buildShopBuilding({
      x: -34, y: 0.25, z: 42,
      w: 11, h: 4.5, d: 8,
      wallColor: '#969696',
      signText: 'BORRACHARIA & LAVA-RÁPIDO',
      doorTexture: this.textures.createPortaAco('#3b3b40'),
      laje: false
    });
    // Stack of old tires
    this.buildTireStack(-39.5, 0.25, 37, 4);
    this.buildTireStack(-38.3, 0.25, 37, 3);

    // 4.5 Brazilian Street Furniture (Orelhão, Ponto de Ônibus SPTrans, Caçamba, Ipê-amarelo)
    this.buildStreetFurniture();
  }

  // 5. Favela Hillside Houses (Tiered, stacked brick architecture)
  buildFavelaHillside() {
    const houseConfigs = [
      // Row 1 (Lower hill, along north sidewalk Z = -1 to -8)
      { x: -28, z: -2, w: 8, h: 5.5, d: 7, baseElevation: 0.25, floors: 2, wallType: 'tijolo', laje: true, tank: true, pixacao: true },
      { x: -18, z: -3, w: 7, h: 7.0, d: 8, baseElevation: 0.45, floors: 3, wallType: 'painted', color: '#68b5c2', laje: true, tank: true },
      { x: -9,  z: -2, w: 6, h: 5.0, d: 7, baseElevation: 0.50, floors: 2, wallType: 'reboco', laje: true, clothes: true },

      // Escadão corridor is at X = 0 to 4 (stairs rise between houses)

      { x: 10,  z: -2, w: 7, h: 6.2, d: 8, baseElevation: 0.40, floors: 2, wallType: 'tijolo', laje: true, tank: true },
      { x: 19,  z: -3, w: 8, h: 5.5, d: 7, baseElevation: 0.55, floors: 2, wallType: 'painted', color: '#e8a27d', laje: true, clothes: true },
      { x: 29,  z: -2, w: 8, h: 7.5, d: 8, baseElevation: 0.35, floors: 3, wallType: 'tijolo', laje: true, tank: true, pixacao: true },

      // Row 2 (Mid hill, Z = -12 to -22)
      { x: -32, z: -15, w: 8, h: 6.0, d: 7, baseElevation: 2.2, floors: 2, wallType: 'painted', color: '#90b87d', laje: true },
      { x: -21, z: -16, w: 9, h: 7.5, d: 8, baseElevation: 2.5, floors: 3, wallType: 'tijolo', laje: true, tank: true, clothes: true },
      { x: -10, z: -15, w: 7, h: 6.5, d: 7, baseElevation: 2.8, floors: 2, wallType: 'reboco', laje: true, tank: true },

      { x: 11,  z: -16, w: 8, h: 8.0, d: 8, baseElevation: 2.7, floors: 3, wallType: 'tijolo', laje: true, tank: true, pixacao: true },
      { x: 22,  z: -15, w: 7, h: 5.8, d: 7, baseElevation: 2.5, floors: 2, wallType: 'painted', color: '#d97bc2', laje: true },
      { x: 32,  z: -16, w: 8, h: 7.0, d: 8, baseElevation: 2.3, floors: 3, wallType: 'reboco', laje: true, tank: true, clothes: true },

      // Row 3 (High hill, Z = -26 to -38)
      { x: -28, z: -30, w: 9, h: 6.5, d: 8, baseElevation: 5.0, floors: 2, wallType: 'tijolo', laje: true, tank: true },
      { x: -16, z: -31, w: 8, h: 7.8, d: 8, baseElevation: 5.3, floors: 3, wallType: 'painted', color: '#eed07a', laje: true, clothes: true },
      { x: -7,  z: -29, w: 6, h: 5.5, d: 7, baseElevation: 5.5, floors: 2, wallType: 'tijolo', laje: true, tank: true },

      { x: 9,   z: -29, w: 7, h: 7.2, d: 7, baseElevation: 5.4, floors: 3, wallType: 'reboco', laje: true, tank: true },
      { x: 19,  z: -31, w: 9, h: 6.8, d: 8, baseElevation: 5.2, floors: 2, wallType: 'painted', color: '#5eb3b1', laje: true, pixacao: true },
      { x: 30,  z: -30, w: 8, h: 7.5, d: 8, baseElevation: 4.8, floors: 3, wallType: 'tijolo', laje: true, tank: true },

      // Row 4 (Top Crest / Mirante, Z = -42 to -52)
      { x: -22, z: -45, w: 10, h: 6.0, d: 8, baseElevation: 7.5, floors: 2, wallType: 'tijolo', laje: true, tank: true },
      { x: -10, z: -46, w: 8,  h: 7.0, d: 8, baseElevation: 7.8, floors: 3, wallType: 'painted', color: '#e06e6e', laje: true, clothes: true },
      { x: 1,   z: -47, w: 10, h: 7.5, d: 9, baseElevation: 8.0, floors: 3, wallType: 'tijolo', laje: true, tank: true, isMirante: true },
      { x: 14,  z: -45, w: 9,  h: 6.5, d: 8, baseElevation: 7.6, floors: 2, wallType: 'reboco', laje: true, tank: true },
      { x: 26,  z: -46, w: 9,  h: 7.2, d: 8, baseElevation: 7.4, floors: 3, wallType: 'tijolo', laje: true }
    ];

    houseConfigs.forEach(cfg => this.buildFavelaHouse(cfg));
  }

  // Build an individual favela house block with laje, rebar, windows, and water tank
  buildFavelaHouse(cfg) {
    const { x, z, w, h, d, baseElevation, wallType, color, laje, tank, clothes, pixacao, isMirante } = cfg;
    const posY = baseElevation + h / 2;

    // Pick wall material
    let wallMat;
    if (wallType === 'tijolo') {
      wallMat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(2, 3) });
    } else if (wallType === 'reboco') {
      wallMat = new THREE.MeshLambertMaterial({ map: this.textures.createReboco('#9e978e', 2, 2) });
    } else {
      wallMat = new THREE.MeshLambertMaterial({ map: this.textures.createPaintedWall(color || '#5cb0bd', 2, 2) });
    }

    const houseGeo = new THREE.BoxGeometry(w, h, d);
    const houseMesh = new THREE.Mesh(houseGeo, wallMat);
    houseMesh.position.set(x, posY, z);
    this.scene.add(houseMesh);

    // Add solid collision box
    const halfW = w / 2;
    const halfD = d / 2;
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, baseElevation, z - halfD),
      new THREE.Vector3(x + halfW, baseElevation + h, z + halfD),
      'solid'
    );

    // Front Windows with Security Grilles (Grades de ferro)
    const windowMat = new THREE.MeshLambertMaterial({ map: this.textures.createWindowTexture(false) });
    const litWindowMat = new THREE.MeshLambertMaterial({ map: this.textures.createWindowTexture(true) });
    this.windowMeshes.push(windowMat, litWindowMat);

    const winGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const numWindows = Math.max(1, Math.floor(w / 3));
    for (let i = 0; i < numWindows; i++) {
      const winX = x - halfW + (i + 1) * (w / (numWindows + 1));
      const winY = baseElevation + h * 0.6;
      const winMesh = new THREE.Mesh(winGeo, Math.random() > 0.5 ? litWindowMat : windowMat);
      winMesh.position.set(winX, winY, z + halfD + 0.02);
      this.scene.add(winMesh);
    }

    // Optional Pixação graffiti on lower wall
    if (pixacao) {
      const pixGeo = new THREE.PlaneGeometry(3.5, 2.5);
      const pixMat = new THREE.MeshLambertMaterial({
        map: this.textures.createPixacaoWall('#cfc8bd'),
        polygonOffset: true,
        polygonOffsetFactor: -1
      });
      const pixMesh = new THREE.Mesh(pixGeo, pixMat);
      pixMesh.position.set(x, baseElevation + 1.6, z + halfD + 0.03);
      this.scene.add(pixMesh);
    }

    // The Rooftop Terrace ("Laje")
    if (laje) {
      const roofY = baseElevation + h;

      // Slab surface
      const slabGeo = new THREE.BoxGeometry(w + 0.3, 0.2, d + 0.3);
      const slabMat = new THREE.MeshLambertMaterial({ color: 0x827d75 });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(x, roofY, z);
      this.scene.add(slabMesh);

      // Low parapet wall (mureta de laje)
      const wallThick = 0.2;
      const wallH = 0.85;
      const parapetMat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(1, 1) });

      // North, South, East, West parapets
      const pFront = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, wallThick), parapetMat);
      pFront.position.set(x, roofY + wallH / 2, z + halfD);
      this.scene.add(pFront);

      const pBack = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, wallThick), parapetMat);
      pBack.position.set(x, roofY + wallH / 2, z - halfD);
      this.scene.add(pBack);

      // Exposed vertical rebar pillars (Pontas de ferro de espera para bater a próxima laje!)
      const rebarMat = new THREE.MeshLambertMaterial({ color: 0x5a2d18 }); // rusty steel
      const rebarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
      const corners = [
        [x - halfW + 0.15, z - halfD + 0.15],
        [x + halfW - 0.15, z - halfD + 0.15],
        [x - halfW + 0.15, z + halfD - 0.15],
        [x + halfW - 0.15, z + halfD - 0.15]
      ];
      corners.forEach(([cx, cz]) => {
        // Concrete column stub
        const colStub = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.35), slabMat);
        colStub.position.set(cx, roofY + 0.3, cz);
        this.scene.add(colStub);

        // 4 steel rebars protruding
        for (let r = 0; r < 3; r++) {
          const rebar = new THREE.Mesh(rebarGeo, rebarMat);
          rebar.position.set(cx + (r - 1) * 0.07, roofY + 0.6 + 0.7, cz + (Math.random() - 0.5) * 0.06);
          rebar.rotation.z = (Math.random() - 0.5) * 0.15; // slightly bent rebar
          this.scene.add(rebar);
        }
      });

      // Blue Water Tank (Caixa D'Água 1000L Fortlev)
      if (tank) {
        this.buildWaterTank(x + halfW * 0.45, roofY + 0.1, z - halfD * 0.4);
      }

      // Brick Barbecue pit on laje (Churrasqueira de alvenaria)
      if (Math.random() > 0.4) {
        this.buildChurrasqueira(x - halfW * 0.4, roofY + 0.1, z - halfD * 0.45);
      }

      // Clothesline with drying laundry (Varal com roupas secando)
      if (clothes) {
        this.buildClothesline(x - halfW * 0.6, roofY + 1.2, z, x + halfW * 0.6, roofY + 1.2, z);
      }

      // Register walkable rooftop surface if it's the Mirante
      if (isMirante) {
        this.physics.addBoxCollider(
          new THREE.Vector3(x - halfW, roofY, z - halfD),
          new THREE.Vector3(x + halfW, roofY + 0.2, z + halfD),
          'walkable'
        );
      }
    }
  }

  // 6. The Famous Concrete Stairs (O Escadão Central)
  // Connects the lower street at Z = 5 to the upper hilltop at Z = -45
  buildEscadaoStairs() {
    const stairX = 2.0; // Central alley
    const stairW = 2.8;
    const startZ = 4.5;
    const endZ = -44;
    const totalSteps = 48;
    const stepDepth = Math.abs(endZ - startZ) / totalSteps;
    const totalRise = 8.2;
    const stepHeight = totalRise / totalSteps;

    const stepMat = new THREE.MeshLambertMaterial({ color: 0x99948d });
    const railingMat = new THREE.MeshLambertMaterial({ color: 0x226bb3 }); // Painted blue pipe railing

    for (let i = 0; i < totalSteps; i++) {
      const stepZ = startZ - i * stepDepth;
      const stepY = i * stepHeight;

      const stepGeo = new THREE.BoxGeometry(stairW, stepHeight * (i + 1), stepDepth);
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(stairX, (stepY + stepHeight) / 2, stepZ);
      this.scene.add(stepMesh);

      // Register step collider for smooth climbing
      this.physics.addBoxCollider(
        new THREE.Vector3(stairX - stairW / 2, stepY, stepZ - stepDepth / 2),
        new THREE.Vector3(stairX + stairW / 2, stepY + stepHeight, stepZ + stepDepth / 2),
        'stair'
      );

      // Railing posts every 4 steps
      if (i % 4 === 0) {
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6);
        const postLeft = new THREE.Mesh(postGeo, railingMat);
        postLeft.position.set(stairX - stairW / 2 + 0.1, stepY + stepHeight + 0.5, stepZ);
        this.scene.add(postLeft);

        const postRight = new THREE.Mesh(postGeo, railingMat);
        postRight.position.set(stairX + stairW / 2 - 0.1, stepY + stepHeight + 0.5, stepZ);
        this.scene.add(postRight);
      }
    }

    // Continuous handrails along both sides of escadão
    const railLength = Math.hypot(Math.abs(endZ - startZ), totalRise);
    const railAngle = Math.atan2(totalRise, Math.abs(endZ - startZ));
    const handrailGeo = new THREE.CylinderGeometry(0.045, 0.045, railLength, 8);

    const handrailLeft = new THREE.Mesh(handrailGeo, railingMat);
    handrailLeft.rotation.x = Math.PI / 2 + railAngle;
    handrailLeft.position.set(stairX - stairW / 2 + 0.1, totalRise / 2 + 1.0, (startZ + endZ) / 2);
    this.scene.add(handrailLeft);

    const handrailRight = new THREE.Mesh(handrailGeo, railingMat);
    handrailRight.rotation.x = Math.PI / 2 + railAngle;
    handrailRight.position.set(stairX + stairW / 2 - 0.1, totalRise / 2 + 1.0, (startZ + endZ) / 2);
    this.scene.add(handrailRight);
  }

  // 7. Overhead Power Grid & Utility Poles (Postes de Luz & Emaranhado de Fios)
  buildPowerGrid() {
    const polePositions = [
      { x: -38, y: 0.25, z: 8.5 },
      { x: -14, y: 0.25, z: 8.5 },
      { x: 14,  y: 0.25, z: 8.5 },
      { x: 38,  y: 0.25, z: 8.5 },
      // Hillside poles
      { x: -4,  y: 2.5,  z: -14 },
      { x: 5,   y: 5.2,  z: -30 }
    ];

    const poleMeshes = [];
    polePositions.forEach((pos, idx) => {
      const pole = this.buildUtilityPole(pos.x, pos.y, pos.z, idx % 2 === 0);
      poleMeshes.push(pole);
    });

    // String thick overhead catenary wires between poles
    const wireMat = new THREE.LineBasicMaterial({ color: 0x111113, linewidth: 2 });
    for (let i = 0; i < polePositions.length - 1; i++) {
      const p1 = polePositions[i];
      const p2 = polePositions[i + 1];

      // Multiple wire catenary droops (3 to 4 wires per span)
      for (let w = 0; w < 4; w++) {
        const wirePoints = [];
        const segments = 16;
        const droop = 0.5 + Math.random() * 0.4;
        const startY = p1.y + 7.8 + (w - 2) * 0.25;
        const endY = p2.y + 7.8 + (w - 2) * 0.25;
        const offsetZ = (w - 1.5) * 0.3;

        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const wx = p1.x + (p2.x - p1.x) * t;
          const wz = p1.z + (p2.z - p1.z) * t + offsetZ;
          // Parabolic catenary sag
          const sag = Math.sin(t * Math.PI) * droop;
          const wy = startY + (endY - startY) * t - sag;
          wirePoints.push(new THREE.Vector3(wx, wy, wz));
        }

        const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePoints);
        const wireLine = new THREE.Line(wireGeo, wireMat);
        this.scene.add(wireLine);
      }
    }

    // A kite caught in the wires near pole #2 (Pipa enroscada no fio!)
    this.buildTangledKite(-12.5, 7.2, 8.5);
  }

  // Utility pole generator
  buildUtilityPole(x, y, z, hasTransformer = false) {
    const poleH = 9.0;
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.28, poleH, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x88837d });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, y + poleH / 2, z);
    this.scene.add(pole);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - 0.3, y, z - 0.3),
      new THREE.Vector3(x + 0.3, y + poleH, z + 0.3),
      'solid'
    );

    // Cross arms (Cruzetas de madeira/concreto para isoladores)
    const armGeo = new THREE.BoxGeometry(1.8, 0.15, 0.15);
    const armMat = new THREE.MeshLambertMaterial({ color: 0x4a3d31 });
    const arm1 = new THREE.Mesh(armGeo, armMat);
    arm1.position.set(x, y + poleH - 0.4, z);
    this.scene.add(arm1);

    // Ceramic insulators (Isoladores de porcelana marrom)
    const insulGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6);
    const insulMat = new THREE.MeshLambertMaterial({ color: 0x5e2b17 });
    [-0.7, -0.25, 0.25, 0.7].forEach(ox => {
      const insul = new THREE.Mesh(insulGeo, insulMat);
      insul.position.set(x + ox, y + poleH - 0.22, z);
      this.scene.add(insul);
    });

    // Street light fixture (Luminária de vapor de sódio amarela)
    const lampArmGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
    const lampArm = new THREE.Mesh(lampArmGeo, armMat);
    lampArm.rotation.z = Math.PI / 3;
    lampArm.position.set(x + 0.7, y + poleH - 1.2, z + 0.6);
    this.scene.add(lampArm);

    const lampHeadGeo = new THREE.BoxGeometry(0.3, 0.15, 0.6);
    const lampHeadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
    lampHead.position.set(x + 1.4, y + poleH - 0.7, z + 0.8);
    this.scene.add(lampHead);

    // Glowing bulb mesh + PointLight
    const bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.set(x + 1.4, y + poleH - 0.8, z + 0.8);
    this.scene.add(bulbMesh);

    const light = new THREE.PointLight(0xffb84d, 1.8, 22, 1.5);
    light.position.set(x + 1.4, y + poleH - 0.9, z + 0.8);
    this.scene.add(light);
    this.streetLights.push({ light, bulbMat });

    // Heavy cylindrical transformer (Transformador de alta tensão)
    if (hasTransformer) {
      const transGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.3, 10);
      const transMat = new THREE.MeshLambertMaterial({ color: 0x525b63 });
      const trans = new THREE.Mesh(transGeo, transMat);
      trans.position.set(x - 0.4, y + poleH - 2.2, z);
      this.scene.add(trans);
    }

    return pole;
  }

  // 8. Brazilian Blue Water Tank (Caixa D'Água 1000L Fortlev)
  buildWaterTank(x, y, z) {
    const tankMat = new THREE.MeshLambertMaterial({ map: this.textures.createCaixaDagua() });

    // Cylindrical ribbed tank body
    const tankGeo = new THREE.CylinderGeometry(0.9, 0.82, 1.4, 16);
    const tankMesh = new THREE.Mesh(tankGeo, tankMat);
    tankMesh.position.set(x, y + 0.7, z);
    this.scene.add(tankMesh);

    // Conical lid
    const lidGeo = new THREE.ConeGeometry(0.95, 0.35, 16);
    const lidMat = new THREE.MeshLambertMaterial({ color: 0x08529c });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.set(x, y + 1.4 + 0.17, z);
    this.scene.add(lidMesh);

    // Wooden or concrete base stand
    const standGeo = new THREE.BoxGeometry(2.0, 0.15, 2.0);
    const standMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
    const standMesh = new THREE.Mesh(standGeo, standMat);
    standMesh.position.set(x, y + 0.075, z);
    this.scene.add(standMesh);
  }

  // 9. Brick Barbecue Pit (Churrasqueira de Alvenaria)
  buildChurrasqueira(x, y, z) {
    const brickMat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(1, 1) });

    // Base body
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.7), brickMat);
    base.position.set(x, y + 0.45, z);
    this.scene.add(base);

    // Chimney hood
    const hoodGeo = new THREE.CylinderGeometry(0.2, 0.45, 0.7, 4);
    const hoodMat = new THREE.MeshLambertMaterial({ color: 0x5a2d18 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(x, y + 0.9 + 0.35, z);
    hood.rotation.y = Math.PI / 4;
    this.scene.add(hood);

    // Grill opening metal grate
    const grate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    grate.position.set(x, y + 0.92, z);
    this.scene.add(grate);
  }

  // 10. Rooftop Clothesline (Varal de Roupas)
  buildClothesline(x1, y1, z1, x2, y2, z2) {
    const ropeMat = new THREE.LineBasicMaterial({ color: 0xdddddd });
    const ropePoints = [
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2 - 0.12, (z1 + z2) / 2),
      new THREE.Vector3(x2, y2, z2)
    ];
    const ropeGeo = new THREE.BufferGeometry().setFromPoints(ropePoints);
    const ropeLine = new THREE.Line(ropeGeo, ropeMat);
    this.scene.add(ropeLine);

    // Hanging laundry shirts and towels
    const clothesColors = [0xffffff, 0x1e88e5, 0xe53935, 0xfdd835, 0x43a047];
    const numClothes = 4;
    for (let i = 0; i < numClothes; i++) {
      const t = (i + 1) / (numClothes + 1);
      const cx = x1 + (x2 - x1) * t;
      const cy = y1 + (y2 - y1) * t - 0.08;
      const cz = z1 + (z2 - z1) * t;

      const clothGeo = new THREE.PlaneGeometry(0.5, 0.6);
      const clothMat = new THREE.MeshLambertMaterial({
        color: clothesColors[i % clothesColors.length],
        side: THREE.DoubleSide
      });
      const clothMesh = new THREE.Mesh(clothGeo, clothMat);
      clothMesh.position.set(cx, cy - 0.3, cz);
      clothMesh.rotation.y = (Math.random() - 0.5) * 0.4;
      this.scene.add(clothMesh);
    }
  }

  // 11. Boteco Yellow Plastic Table & Chairs Set (Mesa Skol/Brahma)
  buildBotecoTableSet(x, y, z) {
    const plasticMat = new THREE.MeshLambertMaterial({ color: 0xf5b800 }); // Iconic Brazilian yellow plastic

    // Table top
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 1.0), plasticMat);
    tableTop.position.set(x, y + 0.72, z);
    this.scene.add(tableTop);

    // Table leg & base
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8), plasticMat);
    leg.position.set(x, y + 0.36, z);
    this.scene.add(leg);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), plasticMat);
    base.position.set(x, y + 0.02, z);
    this.scene.add(base);

    // 2 Chairs
    [-0.8, 0.8].forEach(oz => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), plasticMat);
      seat.position.set(x, y + 0.45, z + oz);
      this.scene.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), plasticMat);
      back.position.set(x, y + 0.68, z + oz + (oz > 0 ? 0.2 : -0.2));
      this.scene.add(back);
    });
  }

  // 12. Plastic Beer Crate Stack (Engradados de Cerveja)
  buildBeerCrateStack(x, y, z, colorHex, countX = 2, countY = 2) {
    const crateMat = new THREE.MeshLambertMaterial({ color: colorHex });
    const crateGeo = new THREE.BoxGeometry(0.65, 0.38, 0.45);

    for (let cy = 0; cy < countY; cy++) {
      for (let cx = 0; cx < countX; cx++) {
        const crate = new THREE.Mesh(crateGeo, crateMat);
        crate.position.set(x + cx * 0.7, y + cy * 0.4 + 0.19, z);
        this.scene.add(crate);
      }
    }
  }

  // 13. Stack of Rubber Tires (Pneus de Borracharia)
  buildTireStack(x, y, z, height = 3) {
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1c });
    const tireGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.24, 12);

    for (let i = 0; i < height; i++) {
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.position.set(x + (Math.random() - 0.5) * 0.05, y + i * 0.25 + 0.12, z);
      this.scene.add(tire);
    }
  }

  // 14. Tangled Brazilian Kite in Power Lines (Pipa com rabiola enroscada)
  buildTangledKite(x, y, z) {
    // Diamond kite frame
    const kiteMat = new THREE.MeshBasicMaterial({ color: 0xee2222, side: THREE.DoubleSide });
    const kiteGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0.5, 0,
      -0.35, 0, 0,
      0, -0.5, 0,
      0, 0.5, 0,
      0, -0.5, 0,
      0.35, 0, 0
    ]);
    kiteGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const kite = new THREE.Mesh(kiteGeo, kiteMat);
    kite.position.set(x, y, z);
    kite.rotation.z = 0.4;
    this.scene.add(kite);

    // Black plastic tail ribbon (Rabiola preta)
    const tailMat = new THREE.LineBasicMaterial({ color: 0x111111 });
    const tailPoints = [];
    let curY = y - 0.5;
    let curX = x;
    for (let i = 0; i < 8; i++) {
      tailPoints.push(new THREE.Vector3(curX, curY, z));
      curY -= 0.2;
      curX += Math.sin(i) * 0.15;
    }
    const tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
    const tail = new THREE.Line(tailGeo, tailMat);
    this.scene.add(tail);
  }

  // 15. Flying Kites in the Afternoon Sky
  buildFlyingKites() {
    const kiteColors = [0x00ccff, 0xffcc00, 0xff0055, 0x00ff66];
    for (let k = 0; k < 3; k++) {
      const kx = (k - 1) * 35 + 10;
      const ky = 45 + k * 8;
      const kz = -30 - k * 20;

      const kiteMat = new THREE.MeshBasicMaterial({ color: kiteColors[k], side: THREE.DoubleSide });
      const kiteGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 1.2, 0,  -0.8, 0, 0,   0, -1.2, 0,
        0, 1.2, 0,   0, -1.2, 0,  0.8, 0, 0
      ]);
      kiteGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const kiteMesh = new THREE.Mesh(kiteGeo, kiteMat);
      kiteMesh.position.set(kx, ky, kz);
      kiteMesh.rotation.x = -0.3;
      kiteMesh.rotation.y = 0.2;
      this.scene.add(kiteMesh);

      this.kites.push({ mesh: kiteMesh, baseY: ky, seed: k });
    }
  }

  // 16. The Iconic Peak of São Paulo: PICO DO JARAGUÁ
  // Visible to the North on the horizon with its transmission towers and red beacons
  buildPicoDoJaragua() {
    const mountainGeo = new THREE.ConeGeometry(80, 120, 16);
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0x2b3d28 });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(30, 40, -190);
    this.scene.add(mountain);

    // Twin broadcast antenna towers on top of Pico do Jaraguá (Torres de transmissão)
    const towerGeo = new THREE.CylinderGeometry(0.3, 0.9, 32, 6);
    const towerMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    const tower1 = new THREE.Mesh(towerGeo, towerMat);
    tower1.position.set(28, 110, -190);
    this.scene.add(tower1);

    const tower2 = new THREE.Mesh(towerGeo, towerMat);
    tower2.position.set(34, 105, -190);
    this.scene.add(tower2);

    // Flashing red aviation warning beacon lights (Luzes vermelhas de sinalização aérea)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const b1 = new THREE.Mesh(bGeo, beaconMat);
    b1.position.set(28, 126, -190);
    this.scene.add(b1);

    const b2 = new THREE.Mesh(bGeo, beaconMat);
    b2.position.set(34, 121, -190);
    this.scene.add(b2);

    this.beaconLights.push(b1, b2);
  }

  // 17. The Legendary Brazilian Yellow Stray Dog: Vira-Lata Caramelo!
  buildStrayDog() {
    const caramelColor = 0xd49b45;
    const dogMat = new THREE.MeshLambertMaterial({ color: caramelColor });

    const dogGroup = new THREE.Group();

    // Body (resting/lying down)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.45), dogMat);
    body.position.set(0, 0.2, 0);
    dogGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.28), dogMat);
    head.position.set(0.48, 0.32, 0);
    dogGroup.add(head);

    // Snout & black nose
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.18), dogMat);
    snout.position.set(0.66, 0.26, 0);
    dogGroup.add(snout);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    nose.position.set(0.79, 0.28, 0);
    dogGroup.add(nose);

    // Floppy ears
    const ear1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.08), dogMat);
    ear1.position.set(0.45, 0.38, 0.16);
    ear1.rotation.x = 0.4;
    dogGroup.add(ear1);

    const ear2 = ear1.clone();
    ear2.position.set(0.45, 0.38, -0.16);
    ear2.rotation.x = -0.4;
    dogGroup.add(ear2);

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6), dogMat);
    tail.rotation.z = -Math.PI / 3;
    tail.position.set(-0.48, 0.25, 0);
    dogGroup.add(tail);

    // Position dog sleeping comfortably on sidewalk near Bar do Tião
    dogGroup.position.set(5.5, 0.25, 36.2);
    dogGroup.rotation.y = 0.5;
    this.scene.add(dogGroup);
  }

  // 18. Parked Vintage Brazilian Car (Fusca)
  buildPropsAndDetails() {
    this.buildFuscaCar(-4.5, 0.0, 16);
    this.buildFlyingKites();
  }

  // Classic stylized VW Beetle (Fusca)
  buildFuscaCar(x, y, z) {
    const fuscaGroup = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3b7dbd }); // Classic blue Fusca
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2430 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // Lower chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.65, 1.8), bodyMat);
    chassis.position.set(0, 0.55, 0);
    fuscaGroup.add(chassis);

    // Rounded cabin roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.75, 1.6), bodyMat);
    cabin.position.set(-0.2, 1.15, 0);
    fuscaGroup.add(cabin);

    // Windshield & rear glass
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 1.4), glassMat);
    windshield.position.set(0.82, 1.1, 0);
    windshield.rotation.z = -0.35;
    fuscaGroup.add(windshield);

    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 1.4), glassMat);
    rearGlass.position.set(-1.22, 1.1, 0);
    rearGlass.rotation.z = 0.35;
    fuscaGroup.add(rearGlass);

    // Rounded curved hood & trunk
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.9, 8), bodyMat);
    hood.rotation.z = Math.PI / 2;
    hood.position.set(1.4, 0.65, 0);
    fuscaGroup.add(hood);

    // Chrome bumpers
    const fCrBumper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 1.9), chromeMat);
    fCrBumper.position.set(2.0, 0.38, 0);
    fuscaGroup.add(fCrBumper);

    const rCrBumper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 1.9), chromeMat);
    rCrBumper.position.set(-2.0, 0.38, 0);
    fuscaGroup.add(rCrBumper);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    wheelGeo.rotateX(Math.PI / 2);
    [
      [1.1, 0.35, 0.95],
      [1.1, 0.35, -0.95],
      [-1.1, 0.35, 0.95],
      [-1.1, 0.35, -0.95]
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, wy, wz);
      fuscaGroup.add(wheel);
    });

    fuscaGroup.position.set(x, y, z);
    this.scene.add(fuscaGroup);

    // Add car collision box
    this.physics.addBoxCollider(
      new THREE.Vector3(x - 2.1, y, z - 1.1),
      new THREE.Vector3(x + 2.1, y + 1.6, z + 1.1),
      'solid'
    );
  }

  // Shop building helper
  buildShopBuilding(cfg) {
    const { x, y, z, w, h, d, wallColor, signTexture, signText, signW, signH, doorTexture, laje } = cfg;
    const posY = y + h / 2;

    const wallMat = new THREE.MeshLambertMaterial({ color: wallColor || 0xd6cbbe });
    const bGeo = new THREE.BoxGeometry(w, h, d);
    const bMesh = new THREE.Mesh(bGeo, wallMat);
    bMesh.position.set(x, posY, z);
    this.scene.add(bMesh);

    // Storefront Banner Sign
    if (signTexture) {
      const signGeo = new THREE.PlaneGeometry(signW || (w - 1), signH || 1.8);
      const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
      const signMesh = new THREE.Mesh(signGeo, signMat);
      signMesh.position.set(x, y + h - 1.2, z - d / 2 - 0.05);
      signMesh.rotation.y = Math.PI;
      this.scene.add(signMesh);
    }

    // Rollup security door (Porta de aço)
    if (doorTexture) {
      const doorGeo = new THREE.PlaneGeometry(w * 0.6, h * 0.65);
      const doorMat = new THREE.MeshLambertMaterial({ map: doorTexture });
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(x, y + (h * 0.65) / 2, z - d / 2 - 0.05);
      doorMesh.rotation.y = Math.PI;
      this.scene.add(doorMesh);
    }

    // Solid collision
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, y, z - d / 2),
      new THREE.Vector3(x + w / 2, y + h, z + d / 2),
      'solid'
    );

    // Laje on top
    if (laje) {
      const roofY = y + h;
      if (cfg.hasWaterTank) {
        this.buildWaterTank(x + 1.5, roofY, z);
      }
    }
  }

  // 18.1 Walkable Bar do Tião with Snooker Table & Bar Counter (Version 2 Update)
  buildWalkableBarDoTiao(x, y, z) {
    const w = 11;
    const h = 4.5;
    const d = 8.5;
    const halfW = w / 2;
    const halfD = d / 2;
    const floorY = y;
    const roofY = y + h;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xd2dbd0 }); // light mint boteco paint
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x544e47 }); // dark ceramic floor
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0x827d75 });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), floorMat);
    floor.position.set(x, floorY + 0.05, z);
    this.scene.add(floor);

    // Register walkable interior floor
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, 0, z - halfD),
      new THREE.Vector3(x + halfW, floorY + 0.15, z + halfD),
      'walkable'
    );

    // Ceiling / Laje
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), ceilingMat);
    ceiling.position.set(x, roofY, z);
    this.scene.add(ceiling);

    // Water tank on top of bar laje
    this.buildWaterTank(x + 2, roofY + 0.1, z);

    // Back wall (Z = z + halfD)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), wallMat);
    backWall.position.set(x, floorY + h / 2, z + halfD);
    this.scene.add(backWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, floorY, z + halfD - 0.2),
      new THREE.Vector3(x + halfW, roofY, z + halfD + 0.2),
      'solid'
    );

    // Left wall (X = x - halfW)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    leftWall.position.set(x - halfW, floorY + h / 2, z);
    this.scene.add(leftWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW - 0.2, floorY, z - halfD),
      new THREE.Vector3(x - halfW + 0.2, roofY, z + halfD),
      'solid'
    );

    // Right wall (X = x + halfW)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    rightWall.position.set(x + halfW, floorY + h / 2, z);
    this.scene.add(rightWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - 0.2, floorY, z - halfD),
      new THREE.Vector3(x + halfW + 0.2, roofY, z + halfD),
      'solid'
    );

    // Front facade with wide central entrance (door opening width 4.2m)
    const doorW = 4.2;
    const sideWallW = (w - doorW) / 2;

    // Front left pillar
    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(sideWallW, h, 0.3), wallMat);
    fLeft.position.set(x - halfW + sideWallW / 2, floorY + h / 2, z - halfD);
    this.scene.add(fLeft);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, floorY, z - halfD - 0.15),
      new THREE.Vector3(x - halfW + sideWallW - 0.1, roofY, z - halfD + 0.15),
      'solid'
    );

    // Front right pillar
    const fRight = new THREE.Mesh(new THREE.BoxGeometry(sideWallW, h, 0.3), wallMat);
    fRight.position.set(x + halfW - sideWallW / 2, floorY + h / 2, z - halfD);
    this.scene.add(fRight);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - sideWallW + 0.1, floorY, z - halfD - 0.15),
      new THREE.Vector3(x + halfW, roofY, z - halfD + 0.15),
      'solid'
    );

    // Storefront Banner overhead ("BAR DO TIÃO")
    const signMat = new THREE.MeshBasicMaterial({ map: this.textures.createBarSign() });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 1.8), signMat);
    sign.position.set(x, floorY + h - 1.1, z - halfD - 0.16);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);

    // Warm tungsten interior pendant light hanging over snooker table
    const intLight = new THREE.PointLight(0xffb84d, 2.2, 14, 1.2);
    intLight.position.set(x, floorY + 3.4, z);
    this.scene.add(intLight);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.25, 8, 1, true),
      new THREE.MeshLambertMaterial({ color: 0x145e28, side: THREE.DoubleSide })
    );
    lampShade.position.set(x, floorY + 3.5, z);
    this.scene.add(lampShade);

    // --- SNOOKER TABLE (MESA DE SINUCA) IN CENTER ---
    const tableW = 2.8;
    const tableD = 1.6;
    const tableH = 0.85;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x3d1d0c });
    const feltMat = new THREE.MeshLambertMaterial({ map: this.textures.createSnookerFelt() });

    // Table body
    const tBody = new THREE.Mesh(new THREE.BoxGeometry(tableW, 0.25, tableD), woodMat);
    tBody.position.set(x, floorY + tableH - 0.125, z);
    this.scene.add(tBody);

    // Playing felt surface
    const felt = new THREE.Mesh(new THREE.PlaneGeometry(tableW - 0.25, tableD - 0.25), feltMat);
    felt.rotation.x = -Math.PI / 2;
    felt.position.set(x, floorY + tableH + 0.005, z);
    this.scene.add(felt);

    // 4 Wooden legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, tableH, 8);
    [
      [tableW * 0.42, tableD * 0.42],
      [-tableW * 0.42, tableD * 0.42],
      [tableW * 0.42, -tableD * 0.42],
      [-tableW * 0.42, -tableD * 0.42]
    ].forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x + ox, floorY + tableH / 2, z + oz);
      this.scene.add(leg);
    });

    // 6 Leather pockets (Caçapas)
    const pocketMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const pGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8);
    [
      [tableW * 0.46, tableD * 0.46],
      [-tableW * 0.46, tableD * 0.46],
      [tableW * 0.46, -tableD * 0.46],
      [-tableW * 0.46, -tableD * 0.46],
      [0, tableD * 0.47],
      [0, -tableD * 0.47]
    ].forEach(([ox, oz]) => {
      const p = new THREE.Mesh(pGeo, pocketMat);
      p.position.set(x + ox, floorY + tableH + 0.01, z + oz);
      this.scene.add(p);
    });

    // Billiard balls on table
    const ballGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const cueBall = new THREE.Mesh(ballGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    cueBall.position.set(x - 0.6, floorY + tableH + 0.04, z + 0.1);
    this.scene.add(cueBall);

    const ballColors = [0xff0000, 0xffcc00, 0x0044ff, 0x000000, 0x880088, 0xff6600];
    ballColors.forEach((col, idx) => {
      const b = new THREE.Mesh(ballGeo, new THREE.MeshBasicMaterial({ color: col }));
      b.position.set(x + 0.4 + (idx % 3) * 0.1, floorY + tableH + 0.04, z - 0.1 + idx * 0.06);
      this.scene.add(b);
    });

    // Snooker table solid collider
    this.physics.addBoxCollider(
      new THREE.Vector3(x - tableW / 2 - 0.1, floorY, z - tableD / 2 - 0.1),
      new THREE.Vector3(x + tableW / 2 + 0.1, floorY + tableH + 0.2, z + tableD / 2 + 0.1),
      'solid'
    );

    // --- BAR COUNTER (BALCÃO DE FÓRMICA COM ESTUFA) ---
    const counterW = 4.0;
    const counterD = 0.8;
    const counterH = 1.05;
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x522f18 });
    const topMat = new THREE.MeshLambertMaterial({ color: 0xd9cca9 }); // marble/formica top

    const counterBase = new THREE.Mesh(new THREE.BoxGeometry(counterW, counterH, counterD), counterMat);
    counterBase.position.set(x + 2.8, floorY + counterH / 2, z + 2.6);
    this.scene.add(counterBase);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(counterW + 0.2, 0.08, counterD + 0.15), topMat);
    counterTop.position.set(x + 2.8, floorY + counterH + 0.04, z + 2.6);
    this.scene.add(counterTop);

    // Snack Warmer on counter (Estufa de Coxinha e Pastel!)
    const warmerMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    const warmerGlass = new THREE.MeshLambertMaterial({ color: 0xffe6aa, transparent: true, opacity: 0.7 });
    const warmer = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.45), warmerGlass);
    warmer.position.set(x + 3.6, floorY + counterH + 0.3, z + 2.6);
    this.scene.add(warmer);

    // Cachaça & Beer Bottles on counter
    const bottleMat = new THREE.MeshBasicMaterial({ color: 0x117722 });
    for (let b = 0; b < 3; b++) {
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 6), bottleMat);
      bottle.position.set(x + 2.0 + b * 0.14, floorY + counterH + 0.21, z + 2.6);
      this.scene.add(bottle);
    }

    // Counter collider
    this.physics.addBoxCollider(
      new THREE.Vector3(x + 2.8 - counterW / 2, floorY, z + 2.6 - counterD / 2),
      new THREE.Vector3(x + 2.8 + counterW / 2, floorY + counterH, z + 2.6 + counterD / 2),
      'solid'
    );
  }

  // 18.2 Walkable Adega do Zé with Illuminated Beverage Coolers (Version 2 Update)
  buildWalkableAdega(x, y, z) {
    const w = 9.5;
    const h = 4.5;
    const d = 8.5;
    const halfW = w / 2;
    const halfD = d / 2;
    const floorY = y;
    const roofY = y + h;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xded2c3 });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x4a4742 });
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0x827d75 });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), floorMat);
    floor.position.set(x, floorY + 0.05, z);
    this.scene.add(floor);

    // Register walkable interior floor
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, 0, z - halfD),
      new THREE.Vector3(x + halfW, floorY + 0.15, z + halfD),
      'walkable'
    );

    // Ceiling / Laje
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), ceilingMat);
    ceiling.position.set(x, roofY, z);
    this.scene.add(ceiling);

    this.buildWaterTank(x + 1.5, roofY + 0.1, z);

    // Perimeter walls
    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), wallMat);
    backWall.position.set(x, floorY + h / 2, z + halfD);
    this.scene.add(backWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, floorY, z + halfD - 0.2),
      new THREE.Vector3(x + halfW, roofY, z + halfD + 0.2),
      'solid'
    );

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    leftWall.position.set(x - halfW, floorY + h / 2, z);
    this.scene.add(leftWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW - 0.2, floorY, z - halfD),
      new THREE.Vector3(x - halfW + 0.2, roofY, z + halfD),
      'solid'
    );

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    rightWall.position.set(x + halfW, floorY + h / 2, z);
    this.scene.add(rightWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - 0.2, floorY, z - halfD),
      new THREE.Vector3(x + halfW + 0.2, roofY, z + halfD),
      'solid'
    );

    // Front facade with door opening (3.6m wide)
    const doorW = 3.6;
    const sideWallW = (w - doorW) / 2;

    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(sideWallW, h, 0.3), wallMat);
    fLeft.position.set(x - halfW + sideWallW / 2, floorY + h / 2, z - halfD);
    this.scene.add(fLeft);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, floorY, z - halfD - 0.15),
      new THREE.Vector3(x - halfW + sideWallW - 0.1, roofY, z - halfD + 0.15),
      'solid'
    );

    const fRight = new THREE.Mesh(new THREE.BoxGeometry(sideWallW, h, 0.3), wallMat);
    fRight.position.set(x + halfW - sideWallW / 2, floorY + h / 2, z - halfD);
    this.scene.add(fRight);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - sideWallW + 0.1, floorY, z - halfD - 0.15),
      new THREE.Vector3(x + halfW, roofY, z - halfD + 0.15),
      'solid'
    );

    // Rollup metal door rolled up halfway
    const shutterMat = new THREE.MeshLambertMaterial({ map: this.textures.createPortaAco('#2b5585') });
    const shutter = new THREE.Mesh(new THREE.PlaneGeometry(doorW, 1.2), shutterMat);
    shutter.position.set(x, floorY + h - 1.2, z - halfD - 0.05);
    shutter.rotation.y = Math.PI;
    this.scene.add(shutter);

    // Adega Banner Sign
    const signMat = new THREE.MeshBasicMaterial({ map: this.textures.createAdegaSign() });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 1.8), signMat);
    sign.position.set(x, floorY + h - 1.1, z - halfD - 0.16);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);

    // Commercial Beverage Coolers (Geladeiras Expositoras de Bebidas)
    const coolerMat = new THREE.MeshLambertMaterial({ map: this.textures.createBeverageCooler() });
    const coolerGeo = new THREE.BoxGeometry(1.6, 2.8, 0.85);

    const cooler1 = new THREE.Mesh(coolerGeo, coolerMat);
    cooler1.position.set(x - 2.6, floorY + 1.4, z + 2.5);
    this.scene.add(cooler1);

    const cooler2 = new THREE.Mesh(coolerGeo, coolerMat);
    cooler2.position.set(x - 0.8, floorY + 1.4, z + 2.5);
    this.scene.add(cooler2);

    // Cool blue interior glow
    const coolLight = new THREE.PointLight(0x00d4ff, 1.8, 10);
    coolLight.position.set(x - 1.7, floorY + 1.8, z + 1.8);
    this.scene.add(coolLight);

    // Coolers collider
    this.physics.addBoxCollider(
      new THREE.Vector3(x - 3.6, floorY, z + 2.0),
      new THREE.Vector3(x + 0.2, floorY + 2.8, z + 3.0),
      'solid'
    );
  }

  // 18.3 Brazilian Street Furniture: Orelhão, Ponto de Ônibus SPTrans, Caçamba, Ipê-Amarelo
  buildStreetFurniture() {
    // 1. Orelhão (Iconic Brazilian Blue Public Payphone)
    this.buildOrelhao(-4.5, 0.25, 35.5);

    // 2. Ponto de Ônibus (SPTrans Bus Shelter)
    this.buildPontoDeOnibus(-24, 0.25, 6.2);

    // 3. Caçamba de Entulho (Yellow Rubble Dumpster)
    this.buildCacambaDeEntulho(22, 0.0, 9.8);

    // 4. Urban Trees: Ipê-Amarelo in sidewalk curbs
    this.buildIpeTree(-32, 0.25, 34.5);
    this.buildIpeTree(28, 0.25, 6.2);
  }

  // Orelhão Payphone Builder
  buildOrelhao(x, y, z) {
    const orelhaoGroup = new THREE.Group();

    // Steel mounting pole
    const postMat = new THREE.MeshLambertMaterial({ color: 0x5a5f66 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), postMat);
    post.position.y = 1.1;
    orelhaoGroup.add(post);

    // Classic blue fiberglass curved shell (Concha acústica azul da Telefônica/Telesp)
    const shellMat = new THREE.MeshLambertMaterial({ color: 0x0a58a6, side: THREE.DoubleSide });
    const shellGeo = new THREE.SphereGeometry(0.55, 12, 12, 0, Math.PI);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(0, 1.75, 0);
    shell.rotation.y = Math.PI / 2;
    shell.rotation.z = Math.PI / 2;
    orelhaoGroup.add(shell);

    // Phone box inside shell
    const phoneMat = new THREE.MeshLambertMaterial({ map: this.textures.createOrelhaoDecal() });
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.2), phoneMat);
    phone.position.set(0, 1.5, 0);
    orelhaoGroup.add(phone);

    orelhaoGroup.position.set(x, y, z);
    this.scene.add(orelhaoGroup);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - 0.4, y, z - 0.4),
      new THREE.Vector3(x + 0.4, y + 2.3, z + 0.4),
      'solid'
    );
  }

  // SPTrans Bus Shelter (Ponto de Ônibus)
  buildPontoDeOnibus(x, y, z) {
    const busGroup = new THREE.Group();
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x222225 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x4a525a });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.6 });

    // 2 Support pillars
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), frameMat);
    p1.position.set(-1.8, 1.4, 0);
    busGroup.add(p1);
    const p2 = p1.clone();
    p2.position.set(1.8, 1.4, 0);
    busGroup.add(p2);

    // Curved cantilever roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.2), roofMat);
    roof.position.set(0, 2.8, 0.4);
    roof.rotation.x = 0.12;
    busGroup.add(roof);

    // Back glass panel
    const glass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.05), glassMat);
    glass.position.set(0, 1.3, -0.1);
    busGroup.add(glass);

    // Wooden / metal bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.45), new THREE.MeshLambertMaterial({ color: 0x6e482b }));
    bench.position.set(0, 0.5, 0.25);
    busGroup.add(bench);

    // SPTrans route sign plate
    const signMat = new THREE.MeshBasicMaterial({ map: this.textures.createBusStopSign() });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.8), signMat);
    sign.position.set(2.0, 2.2, 0.3);
    busGroup.add(sign);

    busGroup.position.set(x, y, z);
    this.scene.add(busGroup);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - 2.1, y, z - 0.4),
      new THREE.Vector3(x + 2.1, y + 2.8, z + 1.2),
      'solid'
    );
  }

  // Caçamba de Entulho (Yellow Construction Dumpster)
  buildCacambaDeEntulho(x, y, z) {
    const group = new THREE.Group();
    const steelMat = new THREE.MeshLambertMaterial({ color: 0xd9a404 }); // Industrial yellow
    const rubbleMat = new THREE.MeshLambertMaterial({ map: this.textures.createRubbleTexture() });

    // Trapezoidal dumpster body
    const baseW = 3.6;
    const baseD = 1.7;
    const height = 1.2;

    const body = new THREE.Mesh(new THREE.BoxGeometry(baseW, height, baseD), steelMat);
    body.position.y = height / 2;
    group.add(body);

    // Rubble heap inside
    const rubble = new THREE.Mesh(new THREE.BoxGeometry(baseW - 0.3, 0.35, baseD - 0.3), rubbleMat);
    rubble.position.y = height + 0.05;
    group.add(rubble);

    // White reflective stripes on sides
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-baseD / 2 - 0.01, baseD / 2 + 0.01].forEach(oz => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(baseW * 0.8, 0.15, 0.02), stripeMat);
      stripe.position.set(0, height * 0.6, oz);
      group.add(stripe);
    });

    group.position.set(x, y, z);
    this.scene.add(group);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - baseW / 2, y, z - baseD / 2),
      new THREE.Vector3(x + baseW / 2, y + height + 0.2, z + baseD / 2),
      'solid'
    );
  }

  // Brazilian Ipê-Amarelo Tree Builder
  buildIpeTree(x, y, z) {
    const treeGroup = new THREE.Group();

    // Sidewalk concrete planter box
    const planterMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
    const planter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 2.0), planterMat);
    planter.position.y = 0.125;
    treeGroup.add(planter);

    const soil = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 1.7), new THREE.MeshLambertMaterial({ color: 0x382c21 }));
    soil.position.y = 0.22;
    treeGroup.add(soil);

    // Curved wood trunk
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2d });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 4.2, 8), trunkMat);
    trunk.position.set(0, 2.1, 0);
    trunk.rotation.z = 0.06;
    treeGroup.add(trunk);

    // Lush Golden-Yellow Blossom Foliage Clusters (Copa Amarela do Ipê)
    const foliageMat = new THREE.MeshLambertMaterial({ map: this.textures.createIpeYellowFoliage() });
    const clusters = [
      [0, 4.6, 0, 1.6],
      [-0.8, 4.2, 0.5, 1.2],
      [0.9, 4.3, -0.4, 1.3],
      [0.2, 5.3, 0.3, 1.4]
    ];

    clusters.forEach(([cx, cy, cz, radius]) => {
      const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), foliageMat);
      sphere.position.set(cx, cy, cz);
      treeGroup.add(sphere);
    });

    treeGroup.position.set(x, y, z);
    this.scene.add(treeGroup);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - 0.4, y, z - 0.4),
      new THREE.Vector3(x + 0.4, y + 4.5, z + 0.4),
      'solid'
    );
  }

  // 19. Avenida General Edgar Facó x Rua Paula Ferreira Crossing Props
  buildEdgarFaccoCrossing() {
    // 19.1 Official São Paulo Blue Corner Street Signs (CET Placas de Esquina)
    const signConfigs = [
      // Southeast corner (Edgar Facó x Paula Ferreira)
      { x: 5.5, y: 0.25, z: 32.5, rotY: 0 },
      // Northwest corner (Edgar Facó x Paula Ferreira)
      { x: -3.5, y: 0.25, z: 7.5, rotY: Math.PI }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0x2b2e33 });
    const signFacoTex = this.textures.createStreetSign('AV. GEN. EDGAR FACÓ', '02924-000 • PIRITUBA');
    const signPaulaTex = this.textures.createStreetSign('R. PAULA FERREIRA', '02916-000 • PIRITUBA');

    signConfigs.forEach(cfg => {
      const signPost = new THREE.Group();

      // Steel pole
      const postMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 8), poleMat);
      postMesh.position.y = 1.7;
      signPost.add(postMesh);

      // Sign 1: Av. Gen. Edgar Facó (Facing North/South traffic)
      const signFacoMat = new THREE.MeshBasicMaterial({ map: signFacoTex });
      const sign1Mesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.04), [
        poleMat, poleMat, poleMat, poleMat, signFacoMat, signFacoMat
      ]);
      sign1Mesh.position.set(0, 3.1, 0);
      signPost.add(sign1Mesh);

      // Sign 2: R. Paula Ferreira (at 90 degrees, facing East/West traffic)
      const signPaulaMat = new THREE.MeshBasicMaterial({ map: signPaulaTex });
      const sign2Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 1.4), [
        signPaulaMat, signPaulaMat, poleMat, poleMat, poleMat, poleMat
      ]);
      sign2Mesh.position.set(0, 2.5, 0);
      signPost.add(sign2Mesh);

      signPost.position.set(cfg.x, cfg.y, cfg.z);
      signPost.rotation.y = cfg.rotY;
      this.scene.add(signPost);

      this.physics.addBoxCollider(
        new THREE.Vector3(cfg.x - 0.2, cfg.y, cfg.z - 0.2),
        new THREE.Vector3(cfg.x + 0.2, cfg.y + 3.4, cfg.z + 0.2),
        'solid'
      );
    });

    // 19.2 CET Green Overhead Highway Gantry Sign (Pórtico CET spanning Edgar Facó)
    const gantrySteelMat = new THREE.MeshLambertMaterial({ color: 0x3d434a });

    // North & South Support Lattice Columns
    const colNorth = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.6, 0.6), gantrySteelMat);
    colNorth.position.set(16, 3.3, 7.5);
    this.scene.add(colNorth);
    this.physics.addBoxCollider(
      new THREE.Vector3(15.6, 0.25, 7.1),
      new THREE.Vector3(16.4, 6.6, 7.9),
      'solid'
    );

    const colSouth = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.6, 0.6), gantrySteelMat);
    colSouth.position.set(16, 3.3, 32.5);
    this.scene.add(colSouth);
    this.physics.addBoxCollider(
      new THREE.Vector3(15.6, 0.25, 32.1),
      new THREE.Vector3(16.4, 6.6, 32.9),
      'solid'
    );

    // Overhead Cross Truss Beam
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 25.6), gantrySteelMat);
    crossBeam.position.set(16, 6.3, 20);
    this.scene.add(crossBeam);

    // Large Green Directional CET Sign Panel
    const gantryTex = this.textures.createGantrySign();
    const gantryPanelMat = new THREE.MeshBasicMaterial({ map: gantryTex });
    const gantryPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.4, 15),
      [gantryPanelMat, gantrySteelMat, gantrySteelMat, gantrySteelMat, gantrySteelMat, gantrySteelMat]
    );
    // Face westbound oncoming traffic (negative X direction)
    gantryPanel.position.set(15.6, 6.2, 20);
    this.scene.add(gantryPanel);

    // Overhead small spot illumination lamps
    [-5, 0, 5].forEach(offsetZ => {
      const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), gantrySteelMat);
      lampArm.position.set(15.1, 7.5, 20 + offsetZ);
      this.scene.add(lampArm);
      const lampFixture = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.12, 0.4),
        new THREE.MeshBasicMaterial({ color: 0xfff4cc })
      );
      lampFixture.position.set(14.7, 7.45, 20 + offsetZ);
      this.scene.add(lampFixture);
    });

    // 19.3 CET Speed Radar Camera Pole (50 km/h)
    const radarPoleMat = new THREE.MeshLambertMaterial({ color: 0x474c52 });

    // Main vertical mast
    const radarPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 6.0, 8), radarPoleMat);
    radarPole.position.set(-16, 3.0, 7.8);
    this.scene.add(radarPole);
    this.physics.addBoxCollider(
      new THREE.Vector3(-16.3, 0.25, 7.5),
      new THREE.Vector3(-15.7, 6.0, 8.1),
      'solid'
    );

    // Cantilever arm extending over north road lanes
    const radarArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 4.5), radarPoleMat);
    radarArm.position.set(-16, 5.8, 10.0);
    this.scene.add(radarArm);

    // High resolution cameras & infrared flash units mounted overhead
    [9.2, 11.5].forEach(cz => {
      const camHousing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.35), new THREE.MeshLambertMaterial({ color: 0x222426 }));
      camHousing.position.set(-16, 5.5, cz);
      this.scene.add(camHousing);

      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      lens.rotation.z = Math.PI / 2;
      lens.position.set(-16.25, 5.5, cz);
      this.scene.add(lens);

      const flashBox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
      flashBox.position.set(-16.2, 5.8, cz);
      this.scene.add(flashBox);
    });

    // Speed Sign: 50 km/h FISCALIZAÇÃO ELETRÔNICA
    const radarSignTex = this.textures.createRadarSign();
    const radarSignMat = new THREE.MeshBasicMaterial({ map: radarSignTex });
    const radarSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.4, 1.4),
      [radarSignMat, radarPoleMat, radarPoleMat, radarPoleMat, radarPoleMat, radarPoleMat]
    );
    radarSign.position.set(-16.2, 3.5, 7.8);
    this.scene.add(radarSign);

    // 19.4 Gas Station Canopy ("Posto Pirituba 24H")
    this.buildGasStation(-45, 0.25, 41);
  }

  // 19.5 Gas Station Architecture & Fuel Pumps
  buildGasStation(x, y, z) {
    const stationGroup = new THREE.Group();

    // Canopy Roof Slab
    const canopyMat = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const canopyFasciaTex = this.textures.createGasStationCanopy();
    const canopyFasciaMat = new THREE.MeshBasicMaterial({ map: canopyFasciaTex });

    const canopyGeo = new THREE.BoxGeometry(18, 1.2, 12);
    const canopyMaterials = [
      canopyFasciaMat, // Front
      canopyFasciaMat, // Back
      canopyMat,       // Top
      canopyMat,       // Bottom
      canopyFasciaMat, // Left
      canopyFasciaMat  // Right
    ];
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMaterials);
    canopyMesh.position.set(0, 5.2, 0);
    stationGroup.add(canopyMesh);

    // Under-canopy fluorescent illumination fixtures
    for (let lx = -6; lx <= 6; lx += 4) {
      for (let lz = -3; lz <= 3; lz += 3) {
        const lightBox = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.08, 0.5),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        lightBox.position.set(lx, 4.58, lz);
        stationGroup.add(lightBox);
      }
    }

    // 4 Support Concrete/Steel Pillars
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const pillarPositions = [
      [-6, -3], [6, -3],
      [-6, 3],  [6, 3]
    ];

    pillarPositions.forEach(([px, pz]) => {
      // Base yellow bumper guard
      const baseGuard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.8, 12),
        new THREE.MeshLambertMaterial({ color: 0xffcc00 })
      );
      baseGuard.position.set(px, 0.4, pz);
      stationGroup.add(baseGuard);

      // Main pillar
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 4.2, 12),
        pillarMat
      );
      pillar.position.set(px, 2.5, pz);
      stationGroup.add(pillar);

      this.physics.addBoxCollider(
        new THREE.Vector3(x + px - 0.5, y, z + pz - 0.5),
        new THREE.Vector3(x + px + 0.5, y + 4.8, z + pz + 0.5),
        'solid'
      );
    });

    // Central Fuel Pump Concrete Island (Ilha de Bombas)
    const islandMat = new THREE.MeshLambertMaterial({ color: 0xd8d8d8 });
    const island = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 2.2), islandMat);
    island.position.set(0, 0.125, 0);
    stationGroup.add(island);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - 6.0, y, z - 1.1),
      new THREE.Vector3(x + 6.0, y + 0.25, z + 1.1),
      'walkable'
    );

    // 2 Modern Fuel Dispensers (Bombas de Gasolina / Etanol / Diesel)
    [-3.0, 3.0].forEach(bx => {
      const pumpGroup = new THREE.Group();

      // Main dispenser cabinet
      const pumpBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.8, 0.6),
        new THREE.MeshLambertMaterial({ color: 0x00853f }) // Petrobras green
      );
      pumpBody.position.y = 0.9;
      pumpGroup.add(pumpBody);

      // Yellow top stripe
      const pumpTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.02, 0.3, 0.62),
        new THREE.MeshLambertMaterial({ color: 0xffcc00 })
      );
      pumpTop.position.y = 1.7;
      pumpGroup.add(pumpTop);

      // Digital display screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.45, 0.64),
        new THREE.MeshBasicMaterial({ color: 0x112211 })
      );
      screen.position.y = 1.25;
      pumpGroup.add(screen);

      // Black rubber hoses & nozzles
      const hoseMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [-0.4, 0.4].forEach(hx => {
        const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), hoseMat);
        hose.position.set(hx, 0.8, 0.32);
        pumpGroup.add(hose);

        const nozzle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), new THREE.MeshLambertMaterial({ color: 0xd61111 }));
        nozzle.position.set(hx, 1.3, 0.32);
        pumpGroup.add(nozzle);
      });

      pumpGroup.position.set(bx, 0.25, 0);
      stationGroup.add(pumpGroup);

      this.physics.addBoxCollider(
        new THREE.Vector3(x + bx - 0.6, y, z - 0.4),
        new THREE.Vector3(x + bx + 0.6, y + 2.0, z + 0.4),
        'solid'
      );
    });

    stationGroup.position.set(x, y, z);
    this.scene.add(stationGroup);
  }

  // 20. Dynamic Time of Day (Dia, Entardecer, Noite)
  setTimeOfDay(mode) {
    // mode: 'DAY' | 'SUNSET' | 'NIGHT'
    if (mode === 'DAY') {
      this.sunLight.intensity = 1.2;
      this.sunLight.color.setHex(0xfffaed);
      this.ambientLight.intensity = 0.65;
      this.ambientLight.color.setHex(0xffffff);
      this.hemiLight.color.setHex(0x87ceeb);
      this.skyMesh.material.color.setHex(0x6bb5ff);
      // Streetlights off
      this.streetLights.forEach(sl => {
        sl.light.intensity = 0;
        sl.bulbMat.color.setHex(0x443322);
      });
    } else if (mode === 'SUNSET') {
      // Golden hour São Paulo sunset
      this.sunLight.intensity = 1.0;
      this.sunLight.color.setHex(0xff7722);
      this.ambientLight.intensity = 0.45;
      this.ambientLight.color.setHex(0xffa873);
      this.hemiLight.color.setHex(0xe87a4a);
      this.skyMesh.material.color.setHex(0xba4848);
      // Streetlights turning on
      this.streetLights.forEach(sl => {
        sl.light.intensity = 1.2;
        sl.bulbMat.color.setHex(0xffb03a);
      });
    } else if (mode === 'NIGHT') {
      // Atmospheric night
      this.sunLight.intensity = 0.08;
      this.sunLight.color.setHex(0x334466);
      this.ambientLight.intensity = 0.15;
      this.ambientLight.color.setHex(0x223355);
      this.hemiLight.color.setHex(0x1a2233);
      this.skyMesh.material.color.setHex(0x060914);
      // Full streetlights on
      this.streetLights.forEach(sl => {
        sl.light.intensity = 2.4;
        sl.bulbMat.color.setHex(0xffaa22);
      });
    }
  }

  // 20. Update loop for animated kites, beacons, etc.
  update(time) {
    // Animate flying kites floating gently
    this.kites.forEach(k => {
      k.mesh.position.y = k.baseY + Math.sin(time * 1.5 + k.seed) * 1.2;
      k.mesh.rotation.z = Math.sin(time * 2.0 + k.seed) * 0.15;
    });

    // Flash aviation beacon lights on Pico do Jaraguá towers
    const beaconOn = Math.floor(time * 1.8) % 2 === 0;
    this.beaconLights.forEach(b => {
      b.visible = beaconOn;
    });
  }
}
