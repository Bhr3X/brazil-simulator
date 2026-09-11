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
    this.interactiveDoors = [];
    this.blocoTrioGroup = null;
    this.campinhoGroup = null;

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
    this.buildBancaDeJornal();
    this.buildBarracaDePastel();
    this.buildBaileDaLaje();
    this.buildExpandedStreetsAndDetails();
    this.buildPaulaFerreiraFreguesiaExtension();
    this.buildSeteBarrasSector();
    this.buildEdgarFaccoPetronioPortelaExtension();
    this.buildLargoDaMatrizFreguesia();
    this.buildBlocoEdgarFaccoTrioPlaza();
    this.buildFavelaCampinho();
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
    // Sky hemisphere dome with atmospheric gradient & celestial dither
    const skyGeo = new THREE.SphereGeometry(400, 24, 16);
    const skyTex = this.textures && typeof this.textures.createSkyAtmosphereTexture === 'function'
      ? this.textures.createSkyAtmosphereTexture()
      : null;
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x6bb5ff,
      map: skyTex,
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

    // Favela Hillside Base Ground (rising towards -Z behind Rua Emílio Lessore)
    const hillBaseGeo = new THREE.PlaneGeometry(120, 65);
    const hillBaseMat = new THREE.MeshLambertMaterial({
      map: this.textures.createReboco('#706b63', 10, 8)
    });
    const hillBase = new THREE.Mesh(hillBaseGeo, hillBaseMat);
    hillBase.rotation.x = -Math.PI / 2 + 0.16;
    hillBase.position.set(0, 4.5, -51);
    this.scene.add(hillBase);

    // Slope collider
    this.physics.addSlope(-60, 60, -81, -24, 9.5, 0.25);
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

    // Red plastic boteco tables and red steel chairs branded "BRAHM.AI" outside Bar do Tião
    this.buildBotecoTableSet(6.5, 0.25, 36.5);
    this.buildBotecoTableSet(17.5, 0.25, 36.5);
    this.buildBotecoTableSet(0.5, 0.25, 36.5);

    // 4.3 WALKABLE "PADARIA ESTRELA DE PIRITUBA" (at X = 32, Z = 42)
    this.buildWalkablePadaria(32, 0.25, 42);

    // 4.3b WALKABLE "BANCO PIRITUBA" (at X = 48, Z = 42)
    this.buildWalkableBanco(48, 0.25, 42);

    // 4.4 WALKABLE "BORRACHARIA & LAVA-RÁPIDO DO BETO" (at X = -34, Z = 42)
    this.buildWalkableBorracharia(-34, 0.25, 42);

    // Stack of old tires
    this.buildTireStack(-39.5, 0.25, 37, 4);
    this.buildTireStack(-38.3, 0.25, 37, 3);

    // 4.5 Brazilian Street Furniture (Orelhão, Ponto de Ônibus SPTrans, Caçamba, Ipê-amarelo)
    this.buildStreetFurniture();
  }

  // 5. Favela Hillside Houses (Tiered, stacked brick architecture)
  buildFavelaHillside() {
    const houseConfigs = [
      // Row 1 (Lower hill, along north sidewalk of Emílio Lessore Z = -28 to -35)
      { x: -28, z: -28, w: 8, h: 5.5, d: 7, baseElevation: 0.25, floors: 2, wallType: 'tijolo', laje: true, tank: true, pixacao: true },
      { x: -18, z: -29, w: 7, h: 7.0, d: 8, baseElevation: 0.45, floors: 3, wallType: 'painted', color: '#68b5c2', laje: true, tank: true },
      { x: -9,  z: -28, w: 6, h: 5.0, d: 7, baseElevation: 0.50, floors: 2, wallType: 'reboco', laje: true, clothes: true },

      // Escadão corridor is at X = 0 to 4 (stairs rise between houses)

      { x: 10,  z: -28, w: 7, h: 6.2, d: 8, baseElevation: 0.40, floors: 2, wallType: 'tijolo', laje: true, tank: true },
      { x: 19,  z: -29, w: 8, h: 5.5, d: 7, baseElevation: 0.55, floors: 2, wallType: 'painted', color: '#e8a27d', laje: true, clothes: true },
      { x: 29,  z: -28, w: 8, h: 7.5, d: 8, baseElevation: 0.35, floors: 3, wallType: 'tijolo', laje: true, tank: true, pixacao: true },

      // Row 2 (Mid hill, Z = -38 to -48)
      { x: -32, z: -41, w: 8, h: 6.0, d: 7, baseElevation: 2.2, floors: 2, wallType: 'painted', color: '#90b87d', laje: true },
      { x: -21, z: -42, w: 9, h: 7.5, d: 8, baseElevation: 2.5, floors: 3, wallType: 'tijolo', laje: true, tank: true, clothes: true },
      { x: -10, z: -41, w: 7, h: 6.5, d: 7, baseElevation: 2.8, floors: 2, wallType: 'reboco', laje: true, tank: true },

      { x: 11,  z: -42, w: 8, h: 8.0, d: 8, baseElevation: 2.7, floors: 3, wallType: 'tijolo', laje: true, tank: true, pixacao: true },
      { x: 22,  z: -41, w: 7, h: 5.8, d: 7, baseElevation: 2.5, floors: 2, wallType: 'painted', color: '#d97bc2', laje: true },
      { x: 32,  z: -42, w: 8, h: 7.0, d: 8, baseElevation: 2.3, floors: 3, wallType: 'reboco', laje: true, tank: true, clothes: true },

      // Row 3 (High hill, Z = -52 to -64)
      { x: -28, z: -56, w: 9, h: 6.5, d: 8, baseElevation: 5.0, floors: 2, wallType: 'tijolo', laje: true, tank: true },
      { x: -16, z: -57, w: 8, h: 7.8, d: 8, baseElevation: 5.3, floors: 3, wallType: 'painted', color: '#eed07a', laje: true, clothes: true },
      { x: -7,  z: -55, w: 6, h: 5.5, d: 7, baseElevation: 5.5, floors: 2, wallType: 'tijolo', laje: true, tank: true },

      { x: 9,   z: -55, w: 7, h: 7.2, d: 7, baseElevation: 5.4, floors: 3, wallType: 'reboco', laje: true, tank: true },
      { x: 19,  z: -57, w: 9, h: 6.8, d: 8, baseElevation: 5.2, floors: 2, wallType: 'painted', color: '#5eb3b1', laje: true, pixacao: true },
      { x: 30,  z: -56, w: 8, h: 7.5, d: 8, baseElevation: 4.8, floors: 3, wallType: 'tijolo', laje: true, tank: true },

      // Row 4 (Top Crest / Mirante, Z = -68 to -78)
      { x: -22, z: -71, w: 10, h: 6.0, d: 8, baseElevation: 7.5, floors: 2, wallType: 'tijolo', laje: true, tank: true },
      { x: -10, z: -72, w: 8,  h: 7.0, d: 8, baseElevation: 7.8, floors: 3, wallType: 'painted', color: '#e06e6e', laje: true, clothes: true },
      { x: 1,   z: -73, w: 10, h: 7.5, d: 9, baseElevation: 8.0, floors: 3, wallType: 'tijolo', laje: true, tank: true, isMirante: true },
      { x: 14,  z: -71, w: 9,  h: 6.5, d: 8, baseElevation: 7.6, floors: 2, wallType: 'reboco', laje: true, tank: true },
      { x: 26,  z: -72, w: 9,  h: 7.2, d: 8, baseElevation: 7.4, floors: 3, wallType: 'tijolo', laje: true }
    ];

    houseConfigs.forEach(cfg => this.buildFavelaHouse(cfg));
  }

  // Build an individual walkable favela house with hollow interior, punchable door, residents, animals & furnishings
  buildFavelaHouse(cfg) {
    const { x, z, w, h, d, baseElevation, wallType, color, laje, tank, clothes, pixacao, isMirante } = cfg;
    const posY = baseElevation + h / 2;
    const halfW = w / 2;
    const halfD = d / 2;
    const frontZ = z + halfD; // Front facing South down the hillside
    const backZ = z - halfD;

    // Pick wall material
    let wallMat;
    if (wallType === 'tijolo') {
      wallMat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(2, 3) });
    } else if (wallType === 'reboco') {
      wallMat = new THREE.MeshLambertMaterial({ map: this.textures.createReboco('#9e978e', 2, 2) });
    } else {
      wallMat = new THREE.MeshLambertMaterial({ map: this.textures.createPaintedWall(color || '#5cb0bd', 2, 2) });
    }

    const floorMat = new THREE.MeshLambertMaterial({ color: 0x6e6659 }); // Worn ceramic / cement floor
    const slabMat = new THREE.MeshLambertMaterial({ color: 0x827d75 });

    // 1. Walkable Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.15, d - 0.2), floorMat);
    floor.position.set(x, baseElevation + 0.075, z);
    this.scene.add(floor);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW + 0.2, baseElevation, z - halfD + 0.2),
      new THREE.Vector3(x + halfW - 0.2, baseElevation + 0.25, z + halfD - 0.2),
      'walkable'
    );

    // 2. Ceiling Slab / Laje
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.2, d + 0.3), slabMat);
    ceiling.position.set(x, baseElevation + h, z);
    this.scene.add(ceiling);

    // 3. Perimeter Walls
    // Back wall (North)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), wallMat);
    backWall.position.set(x, posY, backZ + 0.15);
    this.scene.add(backWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, baseElevation, backZ - 0.15),
      new THREE.Vector3(x + halfW, baseElevation + h, backZ + 0.35),
      'solid'
    );

    // Left wall (West)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    leftWall.position.set(x - halfW + 0.15, posY, z);
    this.scene.add(leftWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW - 0.15, baseElevation, backZ),
      new THREE.Vector3(x - halfW + 0.35, baseElevation + h, frontZ),
      'solid'
    );

    // Right wall (East)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    rightWall.position.set(x + halfW - 0.15, posY, z);
    this.scene.add(rightWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - 0.35, baseElevation, backZ),
      new THREE.Vector3(x + halfW + 0.15, baseElevation + h, frontZ),
      'solid'
    );

    // 4. Front Wall with Doorway Opening (Door width 1.3m, height 2.2m)
    const doorW = 1.3;
    const doorH = 2.2;
    const frontWallW = (w - doorW) / 2;

    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(frontWallW, h, 0.3), wallMat);
    fLeft.position.set(x - halfW + frontWallW / 2, posY, frontZ - 0.15);
    this.scene.add(fLeft);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, baseElevation, frontZ - 0.35),
      new THREE.Vector3(x - doorW / 2, baseElevation + h, frontZ + 0.15),
      'solid'
    );

    const fRight = new THREE.Mesh(new THREE.BoxGeometry(frontWallW, h, 0.3), wallMat);
    fRight.position.set(x + halfW - frontWallW / 2, posY, frontZ - 0.15);
    this.scene.add(fRight);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + doorW / 2, baseElevation, frontZ - 0.35),
      new THREE.Vector3(x + halfW, baseElevation + h, frontZ + 0.15),
      'solid'
    );

    // Lintel above doorway
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, h - doorH, 0.3), wallMat);
    lintel.position.set(x, baseElevation + doorH + (h - doorH) / 2, frontZ - 0.15);
    this.scene.add(lintel);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - doorW / 2, baseElevation + doorH, frontZ - 0.35),
      new THREE.Vector3(x + doorW / 2, baseElevation + h, frontZ + 0.15),
      'solid'
    );

    // 5. Interactive Wooden Door (Opens when punched with [E] or hit)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(x - doorW / 2, baseElevation, frontZ - 0.15);

    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.08),
      new THREE.MeshLambertMaterial({ map: this.textures.createWoodenHouseDoorTexture() })
    );
    doorMesh.position.set(doorW / 2, doorH / 2, 0);
    doorPivot.add(doorMesh);
    this.scene.add(doorPivot);

    const doorCollider = this.physics.addBoxCollider(
      new THREE.Vector3(x - doorW / 2, baseElevation, frontZ - 0.3),
      new THREE.Vector3(x + doorW / 2, baseElevation + doorH, frontZ + 0.1),
      'solid'
    );

    const houseNumber = Math.abs(Math.round(x * 3 + z * 7)) % 90 + 10;
    this.interactiveDoors.push({
      id: `favela_house_${Math.round(x)}_${Math.round(z)}`,
      name: `CASA ${houseNumber} DA FAVELA`,
      position: new THREE.Vector3(x, baseElevation + 1.1, frontZ + 0.4),
      maxDist: 2.3,
      doorMesh: doorPivot,
      collider: doorCollider,
      isOpen: false,
      openAngle: -Math.PI / 2
    });

    // 6. Warm Interior Lighting
    const roomLight = new THREE.PointLight(0xffdf99, 1.3, 8);
    roomLight.position.set(x, baseElevation + 2.8, z);
    this.scene.add(roomLight);

    // 7. Interior Furnishings:
    // A. Living Room: Sofa & CRT TV with Crochet Doily
    const sofaMat = new THREE.MeshLambertMaterial({ color: ((Math.abs(Math.round(x)) % 2 === 0) ? 0x6e3c20 : 0x2d543b) });
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.75), sofaMat);
    sofa.position.set(x - halfW + 1.4, baseElevation + 0.2, z);
    this.scene.add(sofa);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 0.2), sofaMat);
    sofaBack.position.set(x - halfW + 1.4, baseElevation + 0.5, z - 0.35);
    this.scene.add(sofaBack);

    // Small TV Rack & CRT TV
    const tvMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const tvRack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0x422615 }));
    tvRack.position.set(x - halfW + 1.4, baseElevation + 0.25, frontZ + 1.0);
    this.scene.add(tvRack);

    const tv = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.45), tvMat);
    tv.position.set(x - halfW + 1.4, baseElevation + 0.75, frontZ + 1.0);
    this.scene.add(tv);

    // Grandmother's white crochet doily on top of TV
    const crochet = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    crochet.rotation.x = -Math.PI / 2;
    crochet.position.set(x - halfW + 1.4, baseElevation + 1.01, frontZ + 1.0);
    this.scene.add(crochet);

    // B. Kitchenette: Botijão de Gás Ultragaz (13kg blue tank) & Fogão
    const gasTankMat = new THREE.MeshLambertMaterial({ color: 0x0055b3 }); // Ultragaz blue
    const gasTank = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 10), gasTankMat);
    gasTank.position.set(x + halfW - 0.8, baseElevation + 0.325, backZ - 0.8);
    this.scene.add(gasTank);

    const stove = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.65), new THREE.MeshLambertMaterial({ color: 0xe8e8e8 }));
    stove.position.set(x + halfW - 1.6, baseElevation + 0.425, backZ - 0.8);
    this.scene.add(stove);

    // Traditional clay water filter (Filtro de Barro São João)
    const clayMat = new THREE.MeshLambertMaterial({ color: 0xa85c35 });
    const filtro = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 8), clayMat);
    filtro.position.set(x + halfW - 0.8, baseElevation + 0.9, backZ - 0.8);
    this.scene.add(filtro);

    // C. Bedroom Area: Wooden Bed with Colorful Colcha
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 2.0), new THREE.MeshLambertMaterial({ color: 0x5a341e }));
    bedFrame.position.set(x + halfW - 1.2, baseElevation + 0.175, z + 0.2);
    this.scene.add(bedFrame);

    const colchaMat = new THREE.MeshLambertMaterial({ color: ((Math.abs(Math.round(z)) % 2 === 0) ? 0xd9435f : 0x3d85c6) });
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 1.9), colchaMat);
    mattress.position.set(x + halfW - 1.2, baseElevation + 0.4, z + 0.2);
    this.scene.add(mattress);

    // 8. Living Resident NPC inside House!
    const shirtCols = [0x1155cc, 0xd95b96, 0x009944, 0xffaa00, 0x772299];
    const chosenShirt = shirtCols[Math.abs(Math.round(x + z)) % shirtCols.length];
    this.buildResidentNpc(
      x - halfW + 1.4,
      baseElevation,
      z,
      chosenShirt,
      0x8d5524,
      0x223344,
      true, // Sitting on sofa
      0
    );

    // 9. Domestic Animals:
    // A. Cat lounging on the laje mureta or windowsill
    if (Math.random() > 0.35) {
      const catColors = [0x111111, 0xdd8833, 0xeeeeee];
      const catCol = catColors[Math.abs(Math.round(x)) % catColors.length];
      this.buildCat(x + halfW * 0.5, baseElevation + h + 0.9, z + halfD * 0.6, catCol, Math.random() * Math.PI);
    }

    // B. Chicken in the side alley / yard
    if (Math.random() > 0.4) {
      this.buildChicken(x + halfW + 0.6, baseElevation, z, Math.random() * Math.PI * 2);
    }

    // C. Papagaio in a hanging birdcage on the front entrance
    if (Math.random() > 0.5) {
      this.buildParrot(x + doorW / 2 + 0.4, baseElevation + 2.0, frontZ + 0.2);
    }

    // 10. Front Windows with Security Grilles
    const windowMat = new THREE.MeshLambertMaterial({ map: this.textures.createWindowTexture(false) });
    const litWindowMat = new THREE.MeshLambertMaterial({ map: this.textures.createWindowTexture(true) });
    this.windowMeshes.push(windowMat, litWindowMat);

    const winGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const winMesh = new THREE.Mesh(winGeo, Math.random() > 0.5 ? litWindowMat : windowMat);
    winMesh.position.set(x + halfW - frontWallW / 2, baseElevation + h * 0.6, frontZ + 0.02);
    this.scene.add(winMesh);

    // Optional Pixação graffiti
    if (pixacao) {
      const pixGeo = new THREE.PlaneGeometry(3.5, 2.5);
      const pixMat = new THREE.MeshLambertMaterial({
        map: this.textures.createPixacaoWall('#cfc8bd'),
        polygonOffset: true,
        polygonOffsetFactor: -1
      });
      const pixMesh = new THREE.Mesh(pixGeo, pixMat);
      pixMesh.position.set(x - halfW + frontWallW / 2, baseElevation + 1.6, frontZ + 0.03);
      this.scene.add(pixMesh);
    }

    // 11. The Rooftop Terrace ("Laje")
    if (laje) {
      const roofY = baseElevation + h;
      const wallThick = 0.2;
      const wallH = 0.85;
      const parapetMat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(1, 1) });

      // Parapets
      const pFront = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, wallThick), parapetMat);
      pFront.position.set(x, roofY + wallH / 2, frontZ);
      this.scene.add(pFront);

      const pBack = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, wallThick), parapetMat);
      pBack.position.set(x, roofY + wallH / 2, backZ);
      this.scene.add(pBack);

      // Exposed vertical rebar pillars
      const rebarMat = new THREE.MeshLambertMaterial({ color: 0x5a2d18 });
      const rebarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
      const corners = [
        [x - halfW + 0.15, backZ + 0.15],
        [x + halfW - 0.15, backZ + 0.15],
        [x - halfW + 0.15, frontZ - 0.15],
        [x + halfW - 0.15, frontZ - 0.15]
      ];
      corners.forEach(([cx, cz]) => {
        const colStub = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.35), slabMat);
        colStub.position.set(cx, roofY + 0.3, cz);
        this.scene.add(colStub);

        for (let r = 0; r < 3; r++) {
          const rebar = new THREE.Mesh(rebarGeo, rebarMat);
          rebar.position.set(cx + (r - 1) * 0.07, roofY + 0.6 + 0.7, cz + (Math.random() - 0.5) * 0.06);
          rebar.rotation.z = (Math.random() - 0.5) * 0.15;
          this.scene.add(rebar);
        }
      });

      // Blue Fortlev Water Tank
      if (tank) {
        this.buildWaterTank(x + halfW * 0.45, roofY + 0.1, z - halfD * 0.4);
      }

      // Churrasqueira on laje
      if (Math.random() > 0.4) {
        this.buildChurrasqueira(x - halfW * 0.4, roofY + 0.1, z - halfD * 0.45);
      }

      // Clothesline with drying laundry
      if (clothes) {
        this.buildClothesline(x - halfW * 0.6, roofY + 1.2, z, x + halfW * 0.6, roofY + 1.2, z);
      }

      // Mirante walkable surface
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
  // Connects Rua Emílio Lessore at Z = -26 to the upper hilltop mirante at Z = -68
  buildEscadaoStairs() {
    const stairX = 2.0; // Central alley
    const stairW = 2.8;
    const startZ = -26.0;
    const endZ = -68.0;
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
      { x: -4,  y: 3.5,  z: -40 },
      { x: 5,   y: 6.5,  z: -56 }
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

  // 11. Boteco Classic Red Plastic Table & Red Steel Chairs Set (Mesa e Cadeiras de Boteco "BRAHM.AI")
  buildBotecoTableSet(x, y, z) {
    const tableRedMat = new THREE.MeshLambertMaterial({ color: 0xc92418 }); // Classic Brazilian boteco red
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x2e3238 }); // Dark tubular steel frame
    const seatRedMat = new THREE.MeshLambertMaterial({ color: 0xc92418 });
    const brandBackMat = new THREE.MeshLambertMaterial({
      map: this.textures.createBeerBrandTexture('BRAHM.AI')
    });

    const setGroup = new THREE.Group();

    // 1. Red Plastic Table Top (1.0m x 1.0m)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 1.0), tableRedMat);
    tableTop.position.set(0, 0.72, 0);
    setGroup.add(tableTop);

    // Table center logo medallion decal on top
    const tableLogo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.42),
      brandBackMat
    );
    tableLogo.rotation.x = -Math.PI / 2;
    tableLogo.position.set(0, 0.746, 0);
    setGroup.add(tableLogo);

    // Table 4 tubular steel legs with rubber caps
    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
    [
      [-0.42, -0.42],
      [0.42, -0.42],
      [-0.42, 0.42],
      [0.42, 0.42]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, steelMat);
      leg.position.set(lx, 0.35, lz);
      setGroup.add(leg);
    });

    // 2. Props on the Table:
    // 600ml Amber Beer Bottle ("Litrão BRAHM.AI")
    const bottleMat = new THREE.MeshLambertMaterial({ color: 0x8a4512 });
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 8), bottleMat);
    bottle.position.set(0.18, 0.72 + 0.14, -0.15);
    setGroup.add(bottle);

    const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.12, 8), bottleMat);
    bottleNeck.position.set(0.18, 0.72 + 0.32, -0.15);
    setGroup.add(bottleNeck);

    // Copo Americano with beer & white foam
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xe8eef5, transparent: true, opacity: 0.55 });
    const copo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.12, 10), glassMat);
    copo.position.set(-0.18, 0.72 + 0.06, 0.15);
    setGroup.add(copo);

    const foam = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0xfffae8 }));
    foam.position.set(-0.18, 0.72 + 0.11, 0.15);
    setGroup.add(foam);

    // Aluminium ashtray with cigarette butts
    const ashMat = new THREE.MeshLambertMaterial({ color: 0xb8c0c8 });
    const ashtray = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.025, 10), ashMat);
    ashtray.position.set(0.15, 0.72 + 0.015, 0.18);
    setGroup.add(ashtray);

    // Red plastic napkin holder (Porta-guardanapos de boteco)
    const napkMat = new THREE.MeshLambertMaterial({ color: 0xb71c1c });
    const napkHolder = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.12), napkMat);
    napkHolder.position.set(-0.2, 0.72 + 0.055, -0.18);
    setGroup.add(napkHolder);

    const napkinPaper = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.09), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    napkinPaper.position.set(-0.2, 0.72 + 0.07, -0.18);
    setGroup.add(napkinPaper);

    // 3. Classic Red Steel Boteco Chairs with "BRAHM.AI" printed on the backrest
    const chairOffsets = [
      { oz: 0.78, ox: 0, rotY: Math.PI },
      { oz: -0.78, ox: 0, rotY: 0 },
      { oz: 0, ox: 0.78, rotY: -Math.PI / 2 },
      { oz: 0, ox: -0.78, rotY: Math.PI / 2 }
    ];

    chairOffsets.forEach(({ ox, oz, rotY }) => {
      const chairGroup = new THREE.Group();
      chairGroup.position.set(ox, 0, oz);
      chairGroup.rotation.y = rotY;

      // Tubular steel frame (Legs)
      const cLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), steelMat);
      cLeg1.position.set(-0.2, 0.225, -0.18);
      chairGroup.add(cLeg1);

      const cLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), steelMat);
      cLeg2.position.set(0.2, 0.225, -0.18);
      chairGroup.add(cLeg2);

      const cLeg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), steelMat);
      cLeg3.position.set(-0.2, 0.225, 0.18);
      chairGroup.add(cLeg3);

      const cLeg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), steelMat);
      cLeg4.position.set(0.2, 0.225, 0.18);
      chairGroup.add(cLeg4);

      // Red curved plastic seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.42), seatRedMat);
      seat.position.set(0, 0.45, 0);
      chairGroup.add(seat);

      // Backrest steel uprights
      const upright1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), steelMat);
      upright1.position.set(-0.18, 0.65, -0.19);
      chairGroup.add(upright1);

      const upright2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), steelMat);
      upright2.position.set(0.18, 0.65, -0.19);
      chairGroup.add(upright2);

      // Red curved backrest with BRAHM.AI branding!
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.03), brandBackMat);
      backrest.position.set(0, 0.74, -0.19);
      chairGroup.add(backrest);

      setGroup.add(chairGroup);
    });

    setGroup.position.set(x, y, z);
    this.scene.add(setGroup);
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

  // Helper: Build Snooker Table (Mesa de Sinuca)
  buildSnookerTable(x, floorY, z) {
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
    this.buildSnookerTable(x, floorY, z);

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

  // 18.2b Walkable "Padaria Estrela de Pirituba" with Glass Estufa, Pão Francês & Pingado Machine
  buildWalkablePadaria(x, y, z) {
    const w = 11.5;
    const h = 4.8;
    const d = 8.5;
    const halfW = w / 2;
    const halfD = d / 2;
    const floorY = y;
    const roofY = y + h;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfaebd7 }); // Warm antique cream
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xede4d3 }); // Clean bakery ceramic tiles
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0x8a847b });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x99ddff, transparent: true, opacity: 0.35 });

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

    // Ceiling / Laje with Water Tank
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), ceilingMat);
    ceiling.position.set(x, roofY, z);
    this.scene.add(ceiling);
    this.buildWaterTank(x + 2.0, roofY + 0.1, z);

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

    // Front Facade with wide double glass door opening (entrance width 4.0m)
    const doorW = 4.0;
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

    // Front Glass Window Panes on pillars
    const winL = new THREE.Mesh(new THREE.PlaneGeometry(sideWallW - 0.6, 2.6), glassMat);
    winL.position.set(x - halfW + sideWallW / 2, floorY + 2.0, z - halfD - 0.16);
    this.scene.add(winL);

    const winR = new THREE.Mesh(new THREE.PlaneGeometry(sideWallW - 0.6, 2.6), glassMat);
    winR.position.set(x + halfW - sideWallW / 2, floorY + 2.0, z - halfD - 0.16);
    this.scene.add(winR);

    // Storefront Overhead Illuminated Banner ("PADARIA ESTRELA DE PIRITUBA")
    const signGeo = new THREE.PlaneGeometry(9.4, 1.8);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.textures.createStoreSign('PADARIA ESTRELA DE PIRITUBA', '#8a3c20', '#ffe89e')
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, floorY + h - 1.05, z - halfD - 0.16);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);

    // Warm Interior Ceiling Light
    const intLight = new THREE.PointLight(0xfffae0, 2.4, 15, 1.2);
    intLight.position.set(x, floorY + 3.6, z);
    this.scene.add(intLight);

    // --- BAKERY COUNTER (BALCÃO DE FÓRMICA EM "L") ---
    const counterH = 1.05;
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x4a2411 });
    const topMat = new THREE.MeshLambertMaterial({ color: 0xeae2cf }); // polished marble/formica

    // Main Counter section
    const mainSection = new THREE.Mesh(new THREE.BoxGeometry(5.2, counterH, 0.85), counterMat);
    mainSection.position.set(x + 1.2, floorY + counterH / 2, z + 1.8);
    this.scene.add(mainSection);

    const mainTop = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 1.0), topMat);
    mainTop.position.set(x + 1.2, floorY + counterH + 0.04, z + 1.8);
    this.scene.add(mainTop);

    // Return Counter Section (L-shape towards back)
    const returnSection = new THREE.Mesh(new THREE.BoxGeometry(0.85, counterH, 2.0), counterMat);
    returnSection.position.set(x + 3.4, floorY + counterH / 2, z + 2.8);
    this.scene.add(returnSection);

    const returnTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 2.1), topMat);
    returnTop.position.set(x + 3.4, floorY + counterH + 0.04, z + 2.8);
    this.scene.add(returnTop);

    // Counter solid physics collider
    this.physics.addBoxCollider(
      new THREE.Vector3(x - 1.5, floorY, z + 1.3),
      new THREE.Vector3(x + 4.0, floorY + counterH + 0.3, z + 3.9),
      'solid'
    );

    // --- 4 ROUND CHROME SWIVEL BARSTOOLS (BANQUETAS DE INOX) ---
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd6dde4 });
    const stoolRedMat = new THREE.MeshLambertMaterial({ color: 0xb71c1c });
    for (let i = 0; i < 4; i++) {
      const sx = x - 1.0 + i * 1.2;
      const sz = z + 0.95;

      const stoolPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), chromeMat);
      stoolPost.position.set(sx, floorY + 0.36, sz);
      this.scene.add(stoolPost);

      const stoolBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), chromeMat);
      stoolBase.position.set(sx, floorY + 0.02, sz);
      this.scene.add(stoolBase);

      const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), stoolRedMat);
      stoolSeat.position.set(sx, floorY + 0.76, sz);
      this.scene.add(stoolSeat);
    }

    // --- ESTUFA AQUECIDA DE SALGADOS (COXINHAS, EMPADAS, PÃO DE QUEIJO) ---
    const estufaMat = new THREE.MeshBasicMaterial({
      map: this.textures.createPadariaEstufaTexture()
    });
    const estufaBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.55), estufaMat);
    estufaBox.position.set(x + 0.2, floorY + counterH + 0.35, z + 1.8);
    this.scene.add(estufaBox);

    // Warm inner tungsten glow of estufa
    const estufaLight = new THREE.PointLight(0xffa834, 1.8, 4);
    estufaLight.position.set(x + 0.2, floorY + counterH + 0.4, z + 1.8);
    this.scene.add(estufaLight);

    // --- COMMERCIAL ESPRESSO & PINGADO MACHINE (MÁQUINA DE CAFÉ INOX) ---
    const coffeeGroup = new THREE.Group();
    const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.55), chromeMat);
    cBody.position.y = 0.325;
    coffeeGroup.add(cBody);

    // Steam wands and pressure gauges
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    dial.rotation.x = Math.PI / 2;
    dial.position.set(-0.2, 0.45, -0.28);
    coffeeGroup.add(dial);

    // Demitasse coffee cups stacked on top
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let c = 0; c < 6; c++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.06, 6), cupMat);
      cup.position.set(-0.25 + (c % 3) * 0.14, 0.68, -0.1 + Math.floor(c / 3) * 0.12);
      coffeeGroup.add(cup);
    }
    coffeeGroup.position.set(x + 2.5, floorY + counterH + 0.08, z + 1.8);
    this.scene.add(coffeeGroup);

    // --- BREAD RACK WITH PÃO FRANCÊS (CESTOS DE PÃO ATRÁS DO BALCÃO) ---
    const rackWoodMat = new THREE.MeshLambertMaterial({ color: 0x6e4726 });
    const breadMat = new THREE.MeshLambertMaterial({ color: 0xd49b45 }); // Golden crust pão francês
    const rack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.4), rackWoodMat);
    rack.position.set(x + 1.2, floorY + 1.6, z + halfD - 0.25);
    this.scene.add(rack);

    // Baskets of baguettes / pães franceses
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const loaf = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), breadMat);
        loaf.rotation.x = Math.PI / 2;
        loaf.position.set(x - 0.4 + col * 0.55, floorY + 1.1 + row * 0.8, z + halfD - 0.45);
        this.scene.add(loaf);
      }
    }

    // --- CHALKBOARD PRICE MENU ON THE WALL ---
    const menuBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.0),
      new THREE.MeshBasicMaterial({ map: this.textures.createPadariaMenuBoardTexture() })
    );
    menuBoard.position.set(x - 2.8, floorY + 2.4, z + halfD - 0.14);
    menuBoard.rotation.y = 0;
    this.scene.add(menuBoard);

    // --- BAKERY ATTENDANT: SEU MANUEL ---
    this.buildResidentNpc(x + 1.4, floorY, z + 2.8, 0xffffff, 0x9c653d, 0x223344, false, Math.PI);
    // Baker white paper hat
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    hat.position.set(x + 1.4, floorY + 1.82, z + 2.8);
    this.scene.add(hat);

    // --- COLLECTIBLE FOOD ITEMS ON THE COUNTER ---
    // 1. Pão na Chapa quentinho
    const paoPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 10), cupMat);
    paoPlate.position.set(x - 0.4, floorY + counterH + 0.06, z + 1.8);
    this.scene.add(paoPlate);
    const pao = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.1), breadMat);
    pao.position.set(x - 0.4, floorY + counterH + 0.09, z + 1.8);
    this.scene.add(pao);

    // 2. Pingado no copo americano
    const pingado = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.11, 8), glassMat);
    pingado.position.set(x - 0.7, floorY + counterH + 0.09, z + 1.8);
    this.scene.add(pingado);
    const pingadoLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.028, 0.09, 8), new THREE.MeshLambertMaterial({ color: 0xb58055 }));
    pingadoLiquid.position.set(x - 0.7, floorY + counterH + 0.08, z + 1.8);
    this.scene.add(pingadoLiquid);
  }

  // 18.2c Walkable "Borracharia & Lava-Rápido do Beto" with Hydraulic Car Lift, Tools & Tires
  buildWalkableBorracharia(x, y, z) {
    const w = 11.5;
    const h = 4.8;
    const d = 8.5;
    const halfW = w / 2;
    const halfD = d / 2;
    const floorY = y;
    const roofY = y + h;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x6e7379 }); // Gritty industrial concrete
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x3d4044 }); // Oil-stained concrete floor
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0x54575b });
    const blueSteelMat = new THREE.MeshLambertMaterial({ color: 0x1a5494 });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), floorMat);
    floor.position.set(x, floorY + 0.05, z);
    this.scene.add(floor);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, 0, z - halfD),
      new THREE.Vector3(x + halfW, floorY + 0.15, z + halfD),
      'walkable'
    );

    // Ceiling / Flat Roof
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), ceilingMat);
    ceiling.position.set(x, roofY, z);
    this.scene.add(ceiling);

    // Perimeter walls:
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

    // Front: Wide open garage bay (no door blocking, steel header with sign)
    const sidePillarW = 1.2;
    const fPillarL = new THREE.Mesh(new THREE.BoxGeometry(sidePillarW, h, 0.3), wallMat);
    fPillarL.position.set(x - halfW + sidePillarW / 2, floorY + h / 2, z - halfD);
    this.scene.add(fPillarL);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, floorY, z - halfD - 0.15),
      new THREE.Vector3(x - halfW + sidePillarW, roofY, z - halfD + 0.15),
      'solid'
    );

    const fPillarR = new THREE.Mesh(new THREE.BoxGeometry(sidePillarW, h, 0.3), wallMat);
    fPillarR.position.set(x + halfW - sidePillarW / 2, floorY + h / 2, z - halfD);
    this.scene.add(fPillarR);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - sidePillarW, floorY, z - halfD - 0.15),
      new THREE.Vector3(x + halfW, roofY, z - halfD + 0.15),
      'solid'
    );

    // Overhead Header Sign ("BORRACHARIA DO BETO & LAVA-RÁPIDO")
    const signGeo = new THREE.PlaneGeometry(9.2, 1.8);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.textures.createStoreSign('BORRACHARIA DO BETO // PNEUS', '#2b2b30', '#f5b800')
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, floorY + h - 1.05, z - halfD - 0.16);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);

    // Fluorescent Industrial Ceiling Light
    const indLight = new THREE.PointLight(0xe8f4ff, 2.2, 14);
    indLight.position.set(x, floorY + 3.8, z);
    this.scene.add(indLight);

    // --- HYDRAULIC 2-POST CAR LIFT (ELEVADOR AUTOMOTIVO) ---
    const liftX = x - 1.5;
    const liftZ = z + 0.5;

    // 2 Blue Steel Vertical Posts
    [-1.6, 1.6].forEach(px => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 0.3), blueSteelMat);
      post.position.set(liftX + px, floorY + 1.9, liftZ);
      this.scene.add(post);

      this.physics.addBoxCollider(
        new THREE.Vector3(liftX + px - 0.25, floorY, liftZ - 0.25),
        new THREE.Vector3(liftX + px + 0.25, floorY + 3.8, liftZ + 0.25),
        'solid'
      );
    });

    // Raised car chassis on the lift
    const carChassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.7, 3.8),
      new THREE.MeshLambertMaterial({ color: 0x8a2323 })
    );
    carChassis.position.set(liftX, floorY + 2.0, liftZ);
    this.scene.add(carChassis);

    // --- HEAVY DUTY WORKBENCH WITH TOOLS ---
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x423122 });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.95, 0.8), benchMat);
    bench.position.set(x + 3.2, floorY + 0.475, z + 2.8);
    this.scene.add(bench);

    this.physics.addBoxCollider(
      new THREE.Vector3(x + 1.5, floorY, z + 2.3),
      new THREE.Vector3(x + 4.9, floorY + 1.2, z + 3.3),
      'solid'
    );

    // Bench vise (Torno de bancada)
    const vise = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.3), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    vise.position.set(x + 2.0, floorY + 1.08, z + 2.8);
    this.scene.add(vise);

    // Metal toolbox & wrenches
    const tbox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.25), new THREE.MeshLambertMaterial({ color: 0xcc2222 }));
    tbox.position.set(x + 3.6, floorY + 1.08, z + 2.8);
    this.scene.add(tbox);

    // Pickups: Chave de Roda on bench
    const wrench = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.35), new THREE.MeshLambertMaterial({ color: 0xd0d5dc }));
    wrench.position.set(x + 2.8, floorY + 0.98, z + 2.8);
    this.scene.add(wrench);

    // --- RED HORIZONTAL AIR COMPRESSOR TANK ---
    const compTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 1.2, 10),
      new THREE.MeshLambertMaterial({ color: 0xb71c1c })
    );
    compTank.rotation.z = Math.PI / 2;
    compTank.position.set(x - 3.8, floorY + 0.45, z + 3.0);
    this.scene.add(compTank);

    // --- TIRES STORED INSIDE ---
    this.buildTireStack(x + 3.8, floorY, z - 1.5, 5);
    this.buildTireStack(x + 3.8, floorY, z - 0.5, 4);

    // --- MECHANIC BETO NPC ---
    this.buildResidentNpc(x + 0.2, floorY, z + 0.8, 0x114488, 0x8a5530, 0x1c2b3a, false, -Math.PI / 4);
  }

  // 18.2d Walkable "Banco Pirituba" with Glass Revolving Entrance, Teller Counters & Security Guard
  buildWalkableBanco(x, y, z) {
    const w = 12.5;
    const h = 5.2;
    const d = 8.5;
    const halfW = w / 2;
    const halfD = d / 2;
    const floorY = y;
    const roofY = y + h;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x222a35 }); // Executive dark corporate slate
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xecf0f5 }); // High-gloss white porcelain tiles
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x99ccff, transparent: true, opacity: 0.45 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd0d6de });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), floorMat);
    floor.position.set(x, floorY + 0.05, z);
    this.scene.add(floor);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, 0, z - halfD),
      new THREE.Vector3(x + halfW, floorY + 0.15, z + halfD),
      'walkable'
    );

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), wallMat);
    ceiling.position.set(x, roofY, z);
    this.scene.add(ceiling);

    // Perimeter walls:
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

    // Front: Left side hosts 24h ATM; Right side hosts Walkable Glass Entrance (3.2m opening)
    const facadeZ = z - halfD;
    const atmSectionW = 6.0;

    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(atmSectionW, h, 0.3), wallMat);
    fLeft.position.set(x - halfW + atmSectionW / 2, floorY + h / 2, facadeZ);
    this.scene.add(fLeft);
    this.physics.addBoxCollider(
      new THREE.Vector3(x - halfW, floorY, facadeZ - 0.2),
      new THREE.Vector3(x - halfW + atmSectionW, roofY, facadeZ + 0.2),
      'solid'
    );

    // 24h ATM Kiosk on the front left wall
    const atmKioskMat = new THREE.MeshLambertMaterial({ color: 0x1a2b3c });
    const atmKiosk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.35), atmKioskMat);
    atmKiosk.position.set(x - 2.5, floorY + 1.5, facadeZ - 0.15);
    this.scene.add(atmKiosk);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.3),
      new THREE.MeshBasicMaterial({ map: this.textures.createAtmScreenTexture() })
    );
    screenMesh.position.set(x - 2.5, floorY + 1.7, facadeZ - 0.34);
    screenMesh.rotation.y = Math.PI;
    this.scene.add(screenMesh);

    const atmLight = new THREE.PointLight(0x00d4ff, 1.8, 8);
    atmLight.position.set(x - 2.5, floorY + 2.2, facadeZ - 0.8);
    this.scene.add(atmLight);

    // Right side pillar
    const rightPillarW = 1.2;
    const fPillarR = new THREE.Mesh(new THREE.BoxGeometry(rightPillarW, h, 0.3), wallMat);
    fPillarR.position.set(x + halfW - rightPillarW / 2, floorY + h / 2, facadeZ);
    this.scene.add(fPillarR);
    this.physics.addBoxCollider(
      new THREE.Vector3(x + halfW - rightPillarW, floorY, facadeZ - 0.2),
      new THREE.Vector3(x + halfW, roofY, facadeZ + 0.2),
      'solid'
    );

    // Illuminated Corporate Signboard ("BANCO PIRITUBA - AGÊNCIA 0086")
    const signGeo = new THREE.PlaneGeometry(w - 1.2, 1.6);
    const signMat = new THREE.MeshBasicMaterial({ map: this.textures.createBankSignTexture() });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, floorY + h - 1.1, facadeZ - 0.16);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);

    // Modern White Clean Interior Ceiling Lighting
    const bankLight = new THREE.PointLight(0xf0f5ff, 2.4, 16);
    bankLight.position.set(x, floorY + 3.8, z);
    this.scene.add(bankLight);

    // --- SECURITY METAL DETECTOR ARCHWAY AT ENTRANCE ---
    const archMat = new THREE.MeshLambertMaterial({ color: 0x4a525d });
    const archL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.4, 0.4), archMat);
    archL.position.set(x + 1.2, floorY + 1.2, facadeZ + 0.6);
    this.scene.add(archL);

    const archR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.4, 0.4), archMat);
    archR.position.set(x + 2.6, floorY + 1.2, facadeZ + 0.6);
    this.scene.add(archR);

    const archTop = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.25, 0.4), archMat);
    archTop.position.set(x + 1.9, floorY + 2.3, facadeZ + 0.6);
    this.scene.add(archTop);

    // Indicator green light on arch
    const greenLed = new THREE.PointLight(0x00ff66, 1.2, 3);
    greenLed.position.set(x + 1.9, floorY + 2.2, facadeZ + 0.6);
    this.scene.add(greenLed);

    // --- QUEUE MANAGEMENT STANCHIONS (FITAS ORGANIZADORAS) ---
    const tapeMat = new THREE.MeshBasicMaterial({ color: 0x0044aa });
    for (let s = 0; s < 3; s++) {
      const sx = x + 0.5;
      const sz = z - 1.2 + s * 1.4;

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8), chromeMat);
      post.position.set(sx, floorY + 0.5, sz);
      this.scene.add(post);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 10), chromeMat);
      base.position.set(sx, floorY + 0.015, sz);
      this.scene.add(base);

      if (s < 2) {
        const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 1.4), tapeMat);
        ribbon.position.set(sx, floorY + 0.88, sz + 0.7);
        this.scene.add(ribbon);
      }
    }

    // --- BANK TELLER COUNTER WITH BULLETPROOF GLASS ---
    const counterW = 4.8;
    const counterH = 1.1;
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x1c2b3d });

    const cBase = new THREE.Mesh(new THREE.BoxGeometry(counterW, counterH, 0.9), counterMat);
    cBase.position.set(x - 2.5, floorY + counterH / 2, z + 2.0);
    this.scene.add(cBase);

    // Bulletproof glass screen
    const bpGlass = new THREE.Mesh(new THREE.BoxGeometry(counterW, 1.4, 0.08), glassMat);
    bpGlass.position.set(x - 2.5, floorY + counterH + 0.7, z + 2.0);
    this.scene.add(bpGlass);

    this.physics.addBoxCollider(
      new THREE.Vector3(x - 5.0, floorY, z + 1.4),
      new THREE.Vector3(x + 0.1, floorY + 2.5, z + 2.6),
      'solid'
    );

    // Teller Attendant behind glass
    this.buildResidentNpc(x - 2.5, floorY, z + 3.0, 0xffffff, 0x9e6840, 0x1a2430, true, 0);

    // --- MANAGER'S DESK WITH COMPUTER MONITOR & CHAIR ---
    const deskMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.78, 1.0), deskMat);
    desk.position.set(x + 3.5, floorY + 0.39, z + 2.2);
    this.scene.add(desk);

    // PC Monitor
    const pcMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.06), pcMat);
    monitor.position.set(x + 3.5, floorY + 1.05, z + 2.2);
    this.scene.add(monitor);

    // Pickups: Maleta de Grana on desk
    const maleta = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.3), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    maleta.position.set(x + 3.0, floorY + 0.85, z + 2.2);
    this.scene.add(maleta);

    // --- SECURITY GUARD SILVA NPC ---
    this.buildResidentNpc(x + 3.2, floorY, z - 0.8, 0x2b384a, 0x7a4d2c, 0x111620, false, -Math.PI / 2);
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.52, 0.32), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    vest.position.set(x + 3.2, floorY + 1.05, z - 0.8);
    this.scene.add(vest);
  }

  // Helper: Low-poly Domestic Cat (Gato Paulistano)
  buildCat(x, y, z, color = 0x222222, rotY = 0) {
    const catGroup = new THREE.Group();
    const catMat = new THREE.MeshLambertMaterial({ color });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.22), catMat);
    body.position.y = 0.12;
    catGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), catMat);
    head.position.set(0.24, 0.2, 0);
    catGroup.add(head);

    // Pointed triangular ears
    const earMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), earMat);
    ear1.position.set(0.24, 0.33, 0.06);
    catGroup.add(ear1);

    const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), earMat);
    ear2.position.set(0.24, 0.33, -0.06);
    catGroup.add(ear2);

    // Curved Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.35, 6), catMat);
    tail.rotation.z = Math.PI / 3;
    tail.position.set(-0.24, 0.22, 0);
    catGroup.add(tail);

    catGroup.position.set(x, y, z);
    catGroup.rotation.y = rotY;
    this.scene.add(catGroup);
    return catGroup;
  }

  // Helper: Low-poly Hen / Chicken (Galinha Caipira)
  buildChicken(x, y, z, rotY = 0) {
    const chkGroup = new THREE.Group();
    const featherMat = new THREE.MeshLambertMaterial({ color: 0xedebe4 });
    const combMat = new THREE.MeshBasicMaterial({ color: 0xcc1111 });
    const beakMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.22), featherMat);
    body.position.y = 0.22;
    chkGroup.add(body);

    // Head & Neck
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.12), featherMat);
    head.position.set(0.16, 0.34, 0);
    chkGroup.add(head);

    // Red Comb on head
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), combMat);
    comb.position.set(0.16, 0.46, 0);
    chkGroup.add(comb);

    // Yellow Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), beakMat);
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.26, 0.33, 0);
    chkGroup.add(beak);

    // Yellow Legs
    const legMat = new THREE.MeshBasicMaterial({ color: 0xdd9900 });
    [-0.05, 0.05].forEach(lz => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 4), legMat);
      leg.position.set(0, 0.075, lz);
      chkGroup.add(leg);
    });

    chkGroup.position.set(x, y, z);
    chkGroup.rotation.y = rotY;
    this.scene.add(chkGroup);
    return chkGroup;
  }

  // Helper: Papagaio Louro in a hanging birdcage
  buildParrot(x, y, z) {
    const cageGroup = new THREE.Group();
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x555555 });

    // Cylindrical wire cage
    const cage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.55, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true })
    );
    cage.position.y = 0.28;
    cageGroup.add(cage);

    // Cage base & dome
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 10), wireMat);
    base.position.y = 0.02;
    cageGroup.add(base);

    // Perch
    const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 4), new THREE.MeshLambertMaterial({ color: 0x8a5524 }));
    perch.rotation.z = Math.PI / 2;
    perch.position.y = 0.25;
    cageGroup.add(perch);

    // Bright Green Brazilian Parrot
    const parrotMat = new THREE.MeshLambertMaterial({ color: 0x00a83a }); // Tropical green
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.08), parrotMat);
    pBody.position.set(0, 0.34, 0);
    cageGroup.add(pBody);

    const pHead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshLambertMaterial({ color: 0xffdd00 })); // Yellow head
    pHead.position.set(0.02, 0.44, 0);
    cageGroup.add(pHead);

    cageGroup.position.set(x, y, z);
    this.scene.add(cageGroup);
    return cageGroup;
  }

  // Helper: Procedural Resident Humanoid NPC inside buildings
  buildResidentNpc(x, y, z, shirtColor = 0x1155cc, skinColor = 0x8d5524, pantsColor = 0x223344, isSitting = false, rotY = 0) {
    const npcGroup = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });

    if (isSitting) {
      // Sitting posture
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.26), shirtMat);
      torso.position.y = 0.72;
      npcGroup.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), skinMat);
      head.position.y = 1.15;
      npcGroup.add(head);

      const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.42), pantsMat);
      thighs.position.set(0, 0.46, 0.18);
      npcGroup.add(thighs);

      const shins = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.16), pantsMat);
      shins.position.set(0, 0.22, 0.36);
      npcGroup.add(shins);
    } else {
      // Standing posture
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.26), shirtMat);
      torso.position.y = 1.05;
      npcGroup.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), skinMat);
      head.position.y = 1.5;
      npcGroup.add(head);

      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.75, 0.24), pantsMat);
      legs.position.y = 0.38;
      npcGroup.add(legs);
    }

    npcGroup.position.set(x, y, z);
    npcGroup.rotation.y = rotY;
    this.scene.add(npcGroup);
    return npcGroup;
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

  // 21. Authentic São Paulo Newsstand (Banca de Jornal do Seu Mário)
  buildBancaDeJornal() {
    const group = new THREE.Group();
    const kioskMat = new THREE.MeshLambertMaterial({ color: 0x0f386b }); // Blue kiosk metal
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
    const awningMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });

    // Main Kiosk Body
    const bodyGeo = new THREE.BoxGeometry(2.4, 2.2, 1.8);
    const body = new THREE.Mesh(bodyGeo, kioskMat);
    body.position.set(7.5, 1.2, 35.8);
    group.add(body);

    // Awning Canopy overhang
    const awningGeo = new THREE.BoxGeometry(2.6, 0.1, 1.2);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.rotation.x = 0.25;
    awning.position.set(7.5, 2.35, 36.4);
    group.add(awning);

    // Front sign board with newspapers and magazines texture
    const signGeo = new THREE.PlaneGeometry(2.0, 1.0);
    const signMat = new THREE.MeshLambertMaterial({
      map: this.textures.createBancaJornalTexture()
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(7.5, 1.4, 36.72);
    group.add(sign);

    this.scene.add(group);
    if (this.physics) {
      this.physics.addStaticBox(7.5, 1.2, 35.8, 2.6, 2.4, 2.0, 'solid');
    }
  }

  // 22. Street Food Stall: Barraca de Pastel & Caldo de Cana da Dona Maria
  buildBarracaDePastel() {
    const group = new THREE.Group();
    const counterMat = new THREE.MeshLambertMaterial({ color: 0xc4c7cc }); // Inox stainless steel
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xffcc00 }); // Yellow canvas
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd90429 });

    // Counter table
    const tableGeo = new THREE.BoxGeometry(2.2, 0.9, 1.2);
    const table = new THREE.Mesh(tableGeo, counterMat);
    table.position.set(-3.5, 0.55, 35.8);
    group.add(table);

    // Striped Canvas Awning Top
    const roofGeo = new THREE.BoxGeometry(2.5, 0.08, 1.5);
    const roof = new THREE.Mesh(roofGeo, awningMat);
    roof.rotation.x = 0.18;
    roof.position.set(-3.5, 2.3, 35.9);
    group.add(roof);

    // Four metal support poles
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    [[-4.5, 35.2], [-4.5, 36.4], [-2.5, 35.2], [-2.5, 36.4]].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(px, 1.3, pz);
      group.add(pole);
    });

    // Big Oil Fryer Cauldron
    const fryerGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.35, 12);
    const fryer = new THREE.Mesh(fryerGeo, counterMat);
    fryer.position.set(-4.0, 1.15, 35.8);
    group.add(fryer);

    // Front sign banner
    const signGeo = new THREE.PlaneGeometry(1.8, 0.85);
    const signMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPastelSignTexture()
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(-3.5, 0.55, 36.42);
    group.add(sign);

    this.scene.add(group);
    if (this.physics) {
      this.physics.addStaticBox(-3.5, 1.0, 35.8, 2.4, 2.2, 1.4, 'solid');
    }
  }

  // 23. Baile da Laje no Alto do Escadão (Paredão de Som & Luz Neon)
  buildBaileDaLaje() {
    const group = new THREE.Group();
    const speakerMat = new THREE.MeshLambertMaterial({ color: 0x111115 });
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

    // Sound Speaker Wall (Paredão de som) in front of crest house facing the escadão
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const spkBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.6), speakerMat);
        spkBox.position.set(-0.8 + col * 0.8, 8.4 + row * 0.8, -67.6);
        group.add(spkBox);

        const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.05, 12), coneMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(-0.8 + col * 0.8, 8.4 + row * 0.8, -67.28);
        group.add(cone);
      }
    }

    // Neon banner above the speaker wall
    const signGeo = new THREE.PlaneGeometry(2.4, 1.1);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.textures.createBaileLajeSign()
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0.0, 10.4, -67.5);
    group.add(sign);

    // Blacklight Purple/Neon Point Light
    const uvLight = new THREE.PointLight(0x9d4edd, 2.5, 14);
    uvLight.position.set(0.0, 10.0, -65.5);
    group.add(uvLight);

    this.scene.add(group);
  }

  // 24. Modern Bank Branch Façade "Banco Pirituba" with 24h ATM Screen
  buildBancoPirituba(x, y, z) {
    const w = 11.5;
    const h = 5.2;
    const d = 8.0;
    const posY = y + h / 2;

    // Outer Granite / Brushed Metal Frame
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x222a35 });
    const bankMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    bankMesh.position.set(x, posY, z);
    this.scene.add(bankMesh);

    // Front Façade (Facing Z = 38 towards south sidewalk)
    const facadeZ = z - d / 2 - 0.02;

    // Large illuminated bank header sign
    const signGeo = new THREE.PlaneGeometry(w - 1.2, 1.6);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.textures.createBankSignTexture()
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(x, y + h - 1.1, facadeZ);
    signMesh.rotation.y = Math.PI;
    this.scene.add(signMesh);

    // Glass storefront window with blue corporate tint
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x113355,
      transparent: true,
      opacity: 0.8
    });
    const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 3.0), glassMat);
    glassMesh.position.set(x - 2.5, y + 1.8, facadeZ);
    glassMesh.rotation.y = Math.PI;
    this.scene.add(glassMesh);

    // Automated Sliding Double Doors (Glass & Chrome frame)
    const doorFrameMat = new THREE.MeshLambertMaterial({ color: 0xc0c8d0 });
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 0.1), doorFrameMat);
    doorFrame.position.set(x + 2.8, y + 1.6, facadeZ + 0.02);
    this.scene.add(doorFrame);

    // 24h ATM Wall Kiosk (Caixa Eletrônico 24 Horas)
    const atmKioskMat = new THREE.MeshLambertMaterial({ color: 0x1a2b3c });
    const atmKiosk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.35), atmKioskMat);
    atmKiosk.position.set(x - 0.5, y + 1.5, facadeZ + 0.15);
    this.scene.add(atmKiosk);

    // ATM Digital Screen (Glowing Terminal with Banking Operations)
    const screenGeo = new THREE.PlaneGeometry(1.6, 1.3);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.textures.createAtmScreenTexture()
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(x - 0.5, y + 1.7, facadeZ - 0.04);
    screenMesh.rotation.y = Math.PI;
    this.scene.add(screenMesh);

    // Keypad and card slot shelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.45), new THREE.MeshLambertMaterial({ color: 0x444f5a }));
    shelf.position.set(x - 0.5, y + 1.0, facadeZ + 0.05);
    this.scene.add(shelf);

    // Security Surveillance Dome Camera
    const cameraBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cameraBase.position.set(x, y + h - 0.2, facadeZ - 0.3);
    this.scene.add(cameraBase);
    const cameraDome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    cameraDome.position.set(x, y + h - 0.26, facadeZ - 0.3);
    this.scene.add(cameraDome);

    // Cyan Neon Under-glow for 24h ATM
    const atmLight = new THREE.PointLight(0x00d4ff, 1.8, 8);
    atmLight.position.set(x - 0.5, y + 2.2, facadeZ - 0.8);
    this.scene.add(atmLight);

    // Solid collision box for the bank building
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, y, z - d / 2),
      new THREE.Vector3(x + w / 2, y + h, z + d / 2),
      'solid'
    );
  }

  // 25. Suburban Mid-Class Residence (Casa do Tiozão CLT on Rua Emílio Lessore)
  buildMidClassHouse(x, y, z) {
    const w = 8.5;
    const h = 5.2;
    const d = 6.0;
    const posY = y + h / 2;

    // Outer walls: Painted suburban warm beige / yellow ochre
    const wallMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPaintedWall('#e8cf8d', 2, 2)
    });
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0xefefef });
    const woodFloorMat = new THREE.MeshLambertMaterial({
      map: this.textures.createParquetTexture(3, 2)
    });

    // South Wall (Back)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), wallMat);
    backWall.position.set(x, posY, z + d / 2 - 0.15);
    this.scene.add(backWall);

    // West Wall (Left)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    leftWall.position.set(x - w / 2 + 0.15, posY, z);
    this.scene.add(leftWall);

    // East Wall (Right)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
    rightWall.position.set(x + w / 2 - 0.15, posY, z);
    this.scene.add(rightWall);

    // North Wall (Front facing Rua Emílio Lessore) - Left piece & Right piece with central open doorway
    const doorW = 1.6;
    const doorH = 2.4;
    const frontWallW = (w - doorW) / 2;

    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(frontWallW, h, 0.3), wallMat);
    frontLeft.position.set(x - doorW / 2 - frontWallW / 2, posY, z - d / 2 + 0.15);
    this.scene.add(frontLeft);

    const frontRight = new THREE.Mesh(new THREE.BoxGeometry(frontWallW, h, 0.3), wallMat);
    frontRight.position.set(x + doorW / 2 + frontWallW / 2, posY, z - d / 2 + 0.15);
    this.scene.add(frontRight);

    // Lintel above front door
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, h - doorH, 0.3), wallMat);
    lintel.position.set(x, y + doorH + (h - doorH) / 2, z - d / 2 + 0.15);
    this.scene.add(lintel);

    // Interior floor (Parquet / Taco de madeira)
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.6, d - 0.6), woodFloorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(x, y + 0.015, z);
    this.scene.add(floorMesh);

    // Ceiling / Flat Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.3, d + 0.4), ceilingMat);
    roof.position.set(x, y + h + 0.15, z);
    this.scene.add(roof);

    // Blue Fortlev water tank on roof
    this.buildWaterTank(x + 1.2, y + h + 0.3, z + 0.5);

    // --- INTERIOR FURNISHINGS ---
    // 1. Brown Faux-Leather Retro Sofa
    const sofaMat = new THREE.MeshLambertMaterial({ color: 0x5a341e });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.85), sofaMat);
    sofaBase.position.set(x - 2.0, y + 0.225, z + 1.2);
    this.scene.add(sofaBase);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.25), sofaMat);
    sofaBack.position.set(x - 2.0, y + 0.55, z + 1.5);
    this.scene.add(sofaBack);

    // 2. Coffee Table with Unpaid Bills (Boleto Enel & Carnê Casas Bahia)
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x3d2716 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.7), tableMat);
    table.position.set(x - 2.0, y + 0.2, z - 0.1);
    this.scene.add(table);

    // Boleto on table
    const paperMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
    const boleto = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), paperMat);
    boleto.rotation.x = -Math.PI / 2;
    boleto.rotation.z = 0.2;
    boleto.position.set(x - 2.2, y + 0.41, z - 0.1);
    this.scene.add(boleto);

    // Carnê booklet
    const carneMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
    const carne = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.28), carneMat);
    carne.position.set(x - 1.7, y + 0.42, z - 0.05);
    this.scene.add(carne);

    // 3. Wooden TV Rack with Vintage CRT Color TV
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x4a2e1b });
    const tvRack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.6), rackMat);
    tvRack.position.set(x + 2.0, y + 0.3, z - 0.1);
    this.scene.add(tvRack);

    // CRT TV Body
    const tvMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const tv = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 0.55), tvMat);
    tv.position.set(x + 2.0, y + 0.925, z - 0.1);
    this.scene.add(tv);

    // CRT Screen with subtle glow
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x5599cc });
    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), screenMat);
    tvScreen.position.set(x + 2.0, y + 0.925, z - 0.38);
    tvScreen.rotation.y = Math.PI;
    this.scene.add(tvScreen);

    // White Crochet Doily on top of TV (Toalhinha de crochê da vovó)
    const crochetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const crochet = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), crochetMat);
    crochet.rotation.x = -Math.PI / 2;
    crochet.position.set(x + 2.0, y + 1.26, z - 0.1);
    this.scene.add(crochet);

    // 4. White Refrigerator in Kitchenette Corner
    const fridgeMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.85), fridgeMat);
    fridge.position.set(x + 2.5, y + 0.9, z + 1.6);
    this.scene.add(fridge);

    // 5. Cozy Warm Overhead Ceiling Light
    const warmLight = new THREE.PointLight(0xffd59e, 1.3, 9);
    warmLight.position.set(x, y + 2.8, z);
    this.scene.add(warmLight);

    // 6. Solid Physics Colliders for Walls & Furnishings
    // Back wall
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, y, z + d / 2 - 0.4),
      new THREE.Vector3(x + w / 2, y + h, z + d / 2 + 0.1),
      'solid'
    );
    // Left wall
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2 - 0.1, y, z - d / 2),
      new THREE.Vector3(x - w / 2 + 0.4, y + h, z + d / 2),
      'solid'
    );
    // Right wall
    this.physics.addBoxCollider(
      new THREE.Vector3(x + w / 2 - 0.4, y, z - d / 2),
      new THREE.Vector3(x + w / 2 + 0.1, y + h, z + d / 2),
      'solid'
    );
    // Front wall Left
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, y, z - d / 2 - 0.1),
      new THREE.Vector3(x - doorW / 2, y + h, z - d / 2 + 0.4),
      'solid'
    );
    // Front wall Right
    this.physics.addBoxCollider(
      new THREE.Vector3(x + doorW / 2, y, z - d / 2 - 0.1),
      new THREE.Vector3(x + w / 2, y + h, z - d / 2 + 0.4),
      'solid'
    );
    // Sofa & TV colliders
    this.physics.addBoxCollider(
      new THREE.Vector3(x - 3.2, y, z + 0.7),
      new THREE.Vector3(x - 0.8, y + 1.2, z + 1.7),
      'solid'
    );
    this.physics.addBoxCollider(
      new THREE.Vector3(x + 1.2, y, z - 0.4),
      new THREE.Vector3(x + 2.8, y + 1.5, z + 0.2),
      'solid'
    );

    // 7. Interactive Front Wooden Door (Opens when punched with [E] or hit)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(x - doorW / 2, y, z - d / 2 + 0.15);

    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.08),
      new THREE.MeshLambertMaterial({ map: this.textures.createWoodenHouseDoorTexture() })
    );
    doorMesh.position.set(doorW / 2, doorH / 2, 0);
    doorPivot.add(doorMesh);
    this.scene.add(doorPivot);

    const doorCollider = this.physics.addBoxCollider(
      new THREE.Vector3(x - doorW / 2, y, z - d / 2 - 0.2),
      new THREE.Vector3(x + doorW / 2, y + doorH, z - d / 2 + 0.3),
      'solid'
    );

    this.interactiveDoors.push({
      id: `mid_class_house_door`,
      name: 'CASA DO TIO WILSON (EMÍLIO LESSORE)',
      position: new THREE.Vector3(x, y + 1.2, z - d / 2 - 0.4),
      maxDist: 2.4,
      doorMesh: doorPivot,
      collider: doorCollider,
      isOpen: false,
      openAngle: Math.PI / 2
    });

    // 8. Resident: Tio Wilson relaxing on the sofa
    this.buildResidentNpc(x - 2.0, y, z + 1.2, 0xd47a24, 0x9e6840, 0x1f2937, true, 0);

    // 9. Domestic Parrot in cage on front porch
    this.buildParrot(x + doorW / 2 + 0.6, y + 2.2, z - d / 2 - 0.3);

    // 10. Domestic Chicken in backyard
    this.buildChicken(x + 2.0, y, z + d / 2 + 1.5, 0.8);
  }

  // 26. High-Rise Luxury Apartment Tower & Penthouse with 180° Glass View of Pico do Jaraguá & Elevator
  buildLuxuryTowerAndPenthouse(x, y, z) {
    const w = 14.0;
    const d = 12.0;
    const h = 36.5;

    // Tower Exterior Facade (Dark granite with glass tiers)
    const facadeMat = new THREE.MeshLambertMaterial({
      map: this.textures.createTowerFacadeTexture(2, 8)
    });
    const marbleFloorMat = new THREE.MeshLambertMaterial({
      map: this.textures.createMarbleTexture(3, 3)
    });
    const graniteFloorMat = new THREE.MeshLambertMaterial({ color: 0x181c22 });
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0x22262e });
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x99ddff,
      transparent: true,
      opacity: 0.32,
      roughness: 0.05
    });
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x15181d });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd8dde4 });

    // -----------------------------------------------------------
    // A. Tower Exterior Shell (Y = 4.0 to 32.0)
    // -----------------------------------------------------------
    const shaftH = 28.0;
    const shaftMesh = new THREE.Mesh(new THREE.BoxGeometry(w, shaftH, d), facadeMat);
    shaftMesh.position.set(x, 4.0 + shaftH / 2, z);
    this.scene.add(shaftMesh);

    // Tower Shaft Colliders (Solid perimeter)
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, 4.0, z - d / 2),
      new THREE.Vector3(x + w / 2, 32.0, z + d / 2),
      'solid'
    );

    // -----------------------------------------------------------
    // B. Ground Floor Luxury Lobby (Y = 0.0 to 4.0)
    // -----------------------------------------------------------
    // Lobby Floor (Polished black granite)
    const lobbyFloor = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), graniteFloorMat);
    lobbyFloor.rotation.x = -Math.PI / 2;
    lobbyFloor.position.set(x, 0.015, z);
    this.scene.add(lobbyFloor);

    // Lobby Ceiling
    const lobbyCeiling = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), ceilingMat);
    lobbyCeiling.rotation.x = Math.PI / 2;
    lobbyCeiling.position.set(x, 3.95, z);
    this.scene.add(lobbyCeiling);

    // Lobby Walls (North, West, East, and South with entrance)
    const lobbyWallMat = new THREE.MeshLambertMaterial({ color: 0x262c35 });
    // North wall
    const lobbyNorth = new THREE.Mesh(new THREE.BoxGeometry(w, 4.0, 0.4), lobbyWallMat);
    lobbyNorth.position.set(x, 2.0, z - d / 2 + 0.2);
    this.scene.add(lobbyNorth);
    // West wall
    const lobbyWest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.0, d), lobbyWallMat);
    lobbyWest.position.set(x - w / 2 + 0.2, 2.0, z);
    this.scene.add(lobbyWest);
    // East wall
    const lobbyEast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.0, d), lobbyWallMat);
    lobbyEast.position.set(x + w / 2 - 0.2, 2.0, z);
    this.scene.add(lobbyEast);
    // South wall (Entrance facing Edgar Facó / sidewalk)
    const entDoorW = 3.0;
    const entSideW = (w - entDoorW) / 2;
    const entLeft = new THREE.Mesh(new THREE.BoxGeometry(entSideW, 4.0, 0.4), lobbyWallMat);
    entLeft.position.set(x - entDoorW / 2 - entSideW / 2, 2.0, z + d / 2 - 0.2);
    this.scene.add(entLeft);
    const entRight = new THREE.Mesh(new THREE.BoxGeometry(entSideW, 4.0, 0.4), lobbyWallMat);
    entRight.position.set(x + entDoorW / 2 + entSideW / 2, 2.0, z + d / 2 - 0.2);
    this.scene.add(entRight);

    // Glass double doors at entrance
    const lobbyGlassDoor = new THREE.Mesh(new THREE.BoxGeometry(entDoorW, 2.8, 0.08), glassMat);
    lobbyGlassDoor.position.set(x, 1.4, z + d / 2 - 0.2);
    this.scene.add(lobbyGlassDoor);

    // Concierge Reception Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.8), chromeMat);
    desk.position.set(x + 3.0, 0.55, z + 2.0);
    this.scene.add(desk);

    // Concierge / Porteiro Seu Valdir behind desk
    this.buildResidentNpc(x + 3.0, 0.0, z + 2.6, 0x1a2430, 0x9e6840, 0x111620, false, 0);

    // Security turnstile
    const turnstile = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.2), chromeMat);
    turnstile.position.set(x, 0.5, z + 3.5);
    this.scene.add(turnstile);

    // Ground Floor Elevator Doors & Frame at X = x - 3.5, Z = z - 2.5
    const elevX = x - 3.5;
    const elevZ = z - 2.5;
    const elevDoorTerreo = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 2.8),
      new THREE.MeshLambertMaterial({ map: this.textures.createElevatorDoorTexture('T') })
    );
    elevDoorTerreo.position.set(elevX, 1.4, elevZ + 0.05);
    this.scene.add(elevDoorTerreo);

    // Blue elevator button glow
    const btnLightTerreo = new THREE.PointLight(0x00f5d4, 1.2, 4);
    btnLightTerreo.position.set(elevX + 1.2, 1.4, elevZ + 0.3);
    this.scene.add(btnLightTerreo);

    // Lobby Colliders
    this.physics.addBoxCollider(new THREE.Vector3(x - w / 2, 0, z - d / 2), new THREE.Vector3(x + w / 2, 4.0, z - d / 2 + 0.5), 'solid');
    this.physics.addBoxCollider(new THREE.Vector3(x - w / 2, 0, z - d / 2), new THREE.Vector3(x - w / 2 + 0.5, 4.0, z + d / 2), 'solid');
    this.physics.addBoxCollider(new THREE.Vector3(x + w / 2 - 0.5, 0, z - d / 2), new THREE.Vector3(x + w / 2, 4.0, z + d / 2), 'solid');
    this.physics.addBoxCollider(new THREE.Vector3(x - w / 2, 0, z + d / 2 - 0.5), new THREE.Vector3(x - entDoorW / 2, 4.0, z + d / 2 + 0.2), 'solid');
    this.physics.addBoxCollider(new THREE.Vector3(x + entDoorW / 2, 0, z + d / 2 - 0.5), new THREE.Vector3(x + w / 2, 4.0, z + d / 2 + 0.2), 'solid');

    // -----------------------------------------------------------
    // C. 12th Floor Luxury Penthouse (Y = 32.0 to 36.5)
    // -----------------------------------------------------------
    const pY = 32.0;
    const pH = 4.5;

    // Marble Floor
    const pentFloor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), marbleFloorMat);
    pentFloor.rotation.x = -Math.PI / 2;
    pentFloor.position.set(x, pY + 0.02, z);
    this.scene.add(pentFloor);

    // Penthouse Ceiling / Rooftop slab
    const pentRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), frameMat);
    pentRoof.position.set(x, pY + pH + 0.2, z);
    this.scene.add(pentRoof);

    // Helipad markings on roof slab
    const heliMat = new THREE.MeshBasicMaterial({ color: 0xf5b800 });
    const heliH = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.0), heliMat);
    heliH.rotation.x = -Math.PI / 2;
    heliH.position.set(x, pY + pH + 0.42, z);
    this.scene.add(heliH);

    // --- 180-DEGREE PANORAMIC GLASS BAY WINDOWS ---
    // 1. Full North Wall Glass (Facing Pico do Jaraguá at Z = z - d/2)
    const glassNorth = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.4, pH - 0.3), glassMat);
    glassNorth.position.set(x, pY + pH / 2, z - d / 2 + 0.05);
    this.scene.add(glassNorth);

    // 2. West Wall Glass (Front Half towards North, Z = z - d/2 to z)
    const glassWest = new THREE.Mesh(new THREE.PlaneGeometry(d / 2, pH - 0.3), glassMat);
    glassWest.rotation.y = Math.PI / 2;
    glassWest.position.set(x - w / 2 + 0.05, pY + pH / 2, z - d / 4);
    this.scene.add(glassWest);

    // 3. East Wall Glass (Front Half towards North, Z = z - d/2 to z)
    const glassEast = new THREE.Mesh(new THREE.PlaneGeometry(d / 2, pH - 0.3), glassMat);
    glassEast.rotation.y = -Math.PI / 2;
    glassEast.position.set(x + w / 2 - 0.05, pY + pH / 2, z - d / 4);
    this.scene.add(glassEast);

    // Minimalist black structural window mullions / frames
    for (let ox = -w / 2 + 2; ox < w / 2; ox += 2.5) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, pH, 0.12), frameMat);
      mullion.position.set(x + ox, pY + pH / 2, z - d / 2 + 0.06);
      this.scene.add(mullion);
    }

    // South Solid Wall of Penthouse (Bedroom / bathroom backing)
    const pentSouth = new THREE.Mesh(new THREE.BoxGeometry(w, pH, 0.4), frameMat);
    pentSouth.position.set(x, pY + pH / 2, z + d / 2 - 0.2);
    this.scene.add(pentSouth);

    // Rear West Wall (Solid)
    const pentRearWest = new THREE.Mesh(new THREE.BoxGeometry(0.4, pH, d / 2), frameMat);
    pentRearWest.position.set(x - w / 2 + 0.2, pY + pH / 2, z + d / 4);
    this.scene.add(pentRearWest);

    // Rear East Wall (Solid)
    const pentRearEast = new THREE.Mesh(new THREE.BoxGeometry(0.4, pH, d / 2), frameMat);
    pentRearEast.position.set(x + w / 2 - 0.2, pY + pH / 2, z + d / 4);
    this.scene.add(pentRearEast);

    // --- PENTHOUSE LUXURY FURNISHINGS ---
    // 1. Italian Designer Charcoal Leather Sectional Sofa
    const pSofaMat = new THREE.MeshLambertMaterial({ color: 0x242830 });
    const pSofa = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 1.4), pSofaMat);
    pSofa.position.set(x + 2.5, pY + 0.25, z + 1.5);
    this.scene.add(pSofa);
    const pSofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 0.35), pSofaMat);
    pSofaBack.position.set(x + 2.5, pY + 0.6, z + 2.1);
    this.scene.add(pSofaBack);

    // 2. Tempered Glass Coffee Table
    const glassTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), glassMat);
    glassTable.position.set(x + 2.5, pY + 0.2, z - 0.2);
    this.scene.add(glassTable);

    // Green Stanley Tumbler on table
    const stanleyMat = new THREE.MeshLambertMaterial({ color: 0x3d6647 });
    const stanley = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.32, 10), stanleyMat);
    stanley.position.set(x + 2.2, pY + 0.56, z - 0.2);
    this.scene.add(stanley);

    // iPhone 16 Pro Max Titanium
    const phoneMat = new THREE.MeshLambertMaterial({ color: 0x8e8d8a });
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.24), phoneMat);
    phone.position.set(x + 2.7, pY + 0.42, z - 0.15);
    this.scene.add(phone);

    // Black Centurion Card
    const cardMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), cardMat);
    card.rotation.x = -Math.PI / 2;
    card.position.set(x + 2.8, pY + 0.42, z - 0.3);
    this.scene.add(card);

    // 3. Marble Kitchen Island / Espresso Bar
    const islandMat = new THREE.MeshLambertMaterial({ map: this.textures.createMarbleTexture(1, 1) });
    const island = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 1.0), islandMat);
    island.position.set(x - 2.0, pY + 0.55, z + 2.5);
    this.scene.add(island);

    // Chrome Italian Espresso Machine
    const espresso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.5), chromeMat);
    espresso.position.set(x - 2.0, pY + 1.38, z + 2.5);
    this.scene.add(espresso);

    // 4. Designer Arc Floor Lamp & Warm Mood Light
    const pentLight = new THREE.PointLight(0xffecd0, 1.4, 14);
    pentLight.position.set(x + 2.0, pY + 3.2, z);
    this.scene.add(pentLight);

    // 5. Penthouse Elevator Doors & Call Panel at X = elevX, Z = elevZ
    const elevDoorPent = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 2.8),
      new THREE.MeshLambertMaterial({ map: this.textures.createElevatorDoorTexture('12') })
    );
    elevDoorPent.position.set(elevX, pY + 1.4, elevZ + 0.05);
    this.scene.add(elevDoorPent);

    // Blue elevator button glow in Penthouse
    const btnLightPent = new THREE.PointLight(0x00f5d4, 1.2, 4);
    btnLightPent.position.set(elevX + 1.2, pY + 1.4, elevZ + 0.3);
    this.scene.add(btnLightPent);

    // --- PENTHOUSE COLLIDERS ---
    // Floor collider
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, pY - 0.2, z - d / 2),
      new THREE.Vector3(x + w / 2, pY + 0.05, z + d / 2),
      'curb'
    );
    // North glass perimeter
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, pY, z - d / 2 - 0.2),
      new THREE.Vector3(x + w / 2, pY + pH, z - d / 2 + 0.3),
      'solid'
    );
    // West glass & solid perimeter
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2 - 0.2, pY, z - d / 2),
      new THREE.Vector3(x - w / 2 + 0.3, pY + pH, z + d / 2),
      'solid'
    );
    // East glass & solid perimeter
    this.physics.addBoxCollider(
      new THREE.Vector3(x + w / 2 - 0.3, pY, z - d / 2),
      new THREE.Vector3(x + w / 2 + 0.2, pY + pH, z + d / 2),
      'solid'
    );
    // South wall perimeter
    this.physics.addBoxCollider(
      new THREE.Vector3(x - w / 2, pY, z + d / 2 - 0.4),
      new THREE.Vector3(x + w / 2, pY + pH, z + d / 2 + 0.2),
      'solid'
    );
  }

  // 27. Expanded Street Grid: Rua Paula Ferreira, Cel. Bento Bicudo, Emílio Lessore & Street View Details
  buildExpandedStreetsAndDetails() {
    const asfaltoMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(12, 4)
    });
    const calcadaMat = new THREE.MeshLambertMaterial({
      map: this.textures.createCalcadaPaulista(16, 2)
    });
    const curbMat = new THREE.MeshLambertMaterial({ color: 0xdedede });

    // -------------------------------------------------------------
    // A. Rua Paula Ferreira Extension (Connecting Edgar Facó to Lessore & Escadão)
    // -------------------------------------------------------------
    const paulaExtGeo = new THREE.PlaneGeometry(10, 34);
    const paulaExt = new THREE.Mesh(paulaExtGeo, asfaltoMat);
    paulaExt.rotation.x = -Math.PI / 2;
    paulaExt.position.set(1.5, 0.012, -9.0);
    this.scene.add(paulaExt);

    // West Sidewalk of Paula Ferreira
    const pfWestWalk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 34), calcadaMat);
    pfWestWalk.position.set(-5.0, 0.125, -9.0);
    this.scene.add(pfWestWalk);
    this.physics.addBoxCollider(
      new THREE.Vector3(-6.5, 0, -26.0),
      new THREE.Vector3(-3.5, 0.25, 8.0),
      'curb'
    );

    // East Sidewalk of Paula Ferreira
    const pfEastWalk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 34), calcadaMat);
    pfEastWalk.position.set(8.0, 0.125, -9.0);
    this.scene.add(pfEastWalk);
    this.physics.addBoxCollider(
      new THREE.Vector3(6.5, 0, -26.0),
      new THREE.Vector3(9.5, 0.25, 8.0),
      'curb'
    );

    // -------------------------------------------------------------
    // B. Rua Coronel Bento Bicudo (1ª Paralela crossing at Z = -4.0)
    // -------------------------------------------------------------
    const bentoRoadGeo = new THREE.PlaneGeometry(88, 9);
    const bentoRoad = new THREE.Mesh(bentoRoadGeo, asfaltoMat);
    bentoRoad.rotation.x = -Math.PI / 2;
    bentoRoad.position.set(10.0, 0.016, -4.0);
    this.scene.add(bentoRoad);

    // North Sidewalk of Bento Bicudo
    const bentoNorthWalk = new THREE.Mesh(new THREE.BoxGeometry(88, 0.25, 3.0), calcadaMat);
    bentoNorthWalk.position.set(10.0, 0.125, -10.0);
    this.scene.add(bentoNorthWalk);
    this.physics.addBoxCollider(
      new THREE.Vector3(-34, 0, -11.5),
      new THREE.Vector3(54, 0.25, -8.5),
      'curb'
    );

    // South Sidewalk of Bento Bicudo
    const bentoSouthWalk = new THREE.Mesh(new THREE.BoxGeometry(88, 0.25, 3.0), calcadaMat);
    bentoSouthWalk.position.set(10.0, 0.125, 2.0);
    this.scene.add(bentoSouthWalk);
    this.physics.addBoxCollider(
      new THREE.Vector3(-34, 0, 0.5),
      new THREE.Vector3(54, 0.25, 3.5),
      'curb'
    );

    // -------------------------------------------------------------
    // C. Rua Emílio Lessore (2ª Paralela crossing at Z = -20.0)
    // -------------------------------------------------------------
    const lessoreRoadGeo = new THREE.PlaneGeometry(88, 9);
    const lessoreRoad = new THREE.Mesh(lessoreRoadGeo, asfaltoMat);
    lessoreRoad.rotation.x = -Math.PI / 2;
    lessoreRoad.position.set(10.0, 0.016, -20.0);
    this.scene.add(lessoreRoad);

    // South Sidewalk of Emílio Lessore
    const lessoreSouthWalk = new THREE.Mesh(new THREE.BoxGeometry(88, 0.25, 3.0), calcadaMat);
    lessoreSouthWalk.position.set(10.0, 0.125, -14.0);
    this.scene.add(lessoreSouthWalk);
    this.physics.addBoxCollider(
      new THREE.Vector3(-34, 0, -15.5),
      new THREE.Vector3(54, 0.25, -12.5),
      'curb'
    );

    // North Sidewalk of Emílio Lessore (Foot of O Escadão da Favela)
    const lessoreNorthWalk = new THREE.Mesh(new THREE.BoxGeometry(88, 0.25, 3.0), calcadaMat);
    lessoreNorthWalk.position.set(10.0, 0.125, -26.0);
    this.scene.add(lessoreNorthWalk);
    this.physics.addBoxCollider(
      new THREE.Vector3(-34, 0, -27.5),
      new THREE.Vector3(54, 0.25, -24.5),
      'curb'
    );

    // -------------------------------------------------------------
    // D. Speed Bumps (Lombadas) with Yellow Reflective Chevrons
    // -------------------------------------------------------------
    const lombadaMat = new THREE.MeshLambertMaterial({
      map: this.textures.createLombadaTexture()
    });

    const addLombada = (lx, lz, width, rotY = 0) => {
      const geo = new THREE.BoxGeometry(width, 0.12, 1.6);
      const m = new THREE.Mesh(geo, lombadaMat);
      m.position.set(lx, 0.06, lz);
      m.rotation.y = rotY;
      this.scene.add(m);
    };

    // On Bento Bicudo
    addLombada(-14.0, -4.0, 8.6, 0);
    addLombada(26.0, -4.0, 8.6, 0);

    // On Emílio Lessore
    addLombada(-14.0, -20.0, 8.6, 0);
    addLombada(26.0, -20.0, 8.6, 0);

    // On Paula Ferreira
    addLombada(1.5, -12.0, 9.6, Math.PI / 2);

    // -------------------------------------------------------------
    // E. Storm Drains (Bueiros / Bocas de Lobo) along curbs
    // -------------------------------------------------------------
    const bueiroMat = new THREE.MeshLambertMaterial({
      map: this.textures.createBueiroTexture()
    });

    const addBueiro = (bx, bz, rotY = 0) => {
      const bMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.55), bueiroMat);
      bMesh.rotation.x = -Math.PI / 2;
      bMesh.rotation.z = rotY;
      bMesh.position.set(bx, 0.13, bz);
      this.scene.add(bMesh);
    };

    addBueiro(4.8, 8.5, 0);
    addBueiro(-3.4, -4.0, Math.PI / 2);
    addBueiro(6.4, -4.0, Math.PI / 2);
    addBueiro(-3.4, -20.0, Math.PI / 2);
    addBueiro(6.4, -20.0, Math.PI / 2);

    // -------------------------------------------------------------
    // F. CET Street Name Signs (Placas Azuis Padrão CET São Paulo)
    // -------------------------------------------------------------
    const addStreetSign = (sx, sz, streetName, subtext, rotY = 0) => {
      const postMat = new THREE.MeshLambertMaterial({ color: 0x888890 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.6, 8), postMat);
      pole.position.set(sx, 1.3, sz);
      this.scene.add(pole);

      const signMat = new THREE.MeshBasicMaterial({
        map: this.textures.createStreetSign(streetName, subtext)
      });
      const signGeo = new THREE.PlaneGeometry(1.0, 0.45);

      // Double-sided sign plate
      const plate = new THREE.Mesh(signGeo, signMat);
      plate.position.set(sx, 2.35, sz);
      plate.rotation.y = rotY;
      this.scene.add(plate);

      const plateBack = new THREE.Mesh(signGeo, signMat);
      plateBack.position.set(sx, 2.35, sz);
      plateBack.rotation.y = rotY + Math.PI;
      this.scene.add(plateBack);
    };

    // 1. Edgar Facó x Paula Ferreira
    addStreetSign(5.2, 7.8, 'Av. Gen. Edgar Facó', '0 - 1500 • Pirituba', 0);
    addStreetSign(4.5, 7.8, 'R. Paula Ferreira', 'Descida Piqueri', Math.PI / 2);

    // 2. Paula Ferreira x Cel. Bento Bicudo
    addStreetSign(6.6, -4.0, 'R. Cel. Bento Bicudo', '1 - 450 • Piqueri', 0);
    addStreetSign(-5.2, -4.0, 'R. Paula Ferreira', '200 - 800 • Pirituba', Math.PI / 2);

    // 3. Paula Ferreira x Emílio Lessore
    addStreetSign(6.6, -20.0, 'R. Emílio Lessore', '1 - 220 • Alto Pirituba', 0);
    addStreetSign(-5.2, -20.0, 'R. Emílio Lessore', 'Acesso Escadão da Paz', 0);

    // -------------------------------------------------------------
    // G. Auto Mecânica do Beto (Oficina on Bento Bicudo at X = 25, Z = -12)
    // -------------------------------------------------------------
    const ofiGeo = new THREE.BoxGeometry(10.0, 4.5, 6.0);
    const ofiMat = new THREE.MeshLambertMaterial({ color: 0x4a4f56 });
    const ofiBuilding = new THREE.Mesh(ofiGeo, ofiMat);
    ofiBuilding.position.set(25.0, 2.25, -12.0);
    this.scene.add(ofiBuilding);

    // Oficina Signboard (Facing south towards Bento Bicudo)
    const ofiSignGeo = new THREE.PlaneGeometry(8.5, 1.8);
    const ofiSignMat = new THREE.MeshBasicMaterial({
      map: this.textures.createOficinaSignTexture()
    });
    const ofiSign = new THREE.Mesh(ofiSignGeo, ofiSignMat);
    ofiSign.position.set(25.0, 3.8, -8.98);
    this.scene.add(ofiSign);

    // Rollup metal shutter
    const ofiDoorGeo = new THREE.PlaneGeometry(5.5, 2.8);
    const ofiDoorMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPortaAco('#c05020')
    });
    const ofiDoor = new THREE.Mesh(ofiDoorGeo, ofiDoorMat);
    ofiDoor.position.set(25.0, 1.4, -8.98);
    this.scene.add(ofiDoor);

    this.physics.addBoxCollider(
      new THREE.Vector3(20.0, 0, -15.0),
      new THREE.Vector3(30.0, 4.5, -9.0),
      'solid'
    );

    // Tire stack outside oficina
    this.buildTireStack(20.5, 0.25, -8.2, 4);

    // -------------------------------------------------------------
    // H. Residential Sobrado Houses along Bento Bicudo and Emílio Lessore
    // -------------------------------------------------------------
    const addSobrado = (sx, sz, w, h, d, wallType = 'tijolo', color = '#5588a3') => {
      const posY = 0.25 + h / 2;
      let mat;
      if (wallType === 'tijolo') {
        mat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(2, 2) });
      } else if (wallType === 'reboco') {
        mat = new THREE.MeshLambertMaterial({ map: this.textures.createReboco('#8f897e', 2, 2) });
      } else {
        mat = new THREE.MeshLambertMaterial({ map: this.textures.createPaintedWall(color, 2, 2) });
      }

      const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      house.position.set(sx, posY, sz);
      this.scene.add(house);

      // Water tank on top
      this.buildWaterTank(sx + 1.0, 0.25 + h, sz);

      // Solid collision box
      this.physics.addBoxCollider(
        new THREE.Vector3(sx - w / 2, 0, sz - d / 2),
        new THREE.Vector3(sx + w / 2, h + 0.5, sz + d / 2),
        'solid'
      );
    };

    // Block between Bento Bicudo and Emílio Lessore (Z = -12.0)
    addSobrado(-20.0, -12.0, 9.0, 5.5, 6.0, 'painted', '#4682b4');
    this.buildMidClassHouse(-8.0, 0.0, -12.0);
    addSobrado(38.0, -12.0, 8.5, 5.5, 6.0, 'reboco');

    // South of Bento Bicudo (Z = 4.5)
    addSobrado(-20.0, 4.5, 9.0, 5.8, 4.5, 'tijolo');
    addSobrado(22.0, 4.5, 8.5, 6.0, 4.5, 'painted', '#c47d4e');
    this.buildLuxuryTowerAndPenthouse(35.0, 0.0, 5.0);

    // -------------------------------------------------------------
    // I. Concrete Utility Poles with Street Lamps along Bento & Lessore
    // -------------------------------------------------------------
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x77777a });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });

    const addLightPole = (px, pz) => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 7.0, 0.25), poleMat);
      pole.position.set(px, 3.5, pz);
      this.scene.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.1), poleMat);
      arm.position.set(px + 0.6, 6.8, pz);
      this.scene.add(arm);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.2), lampMat);
      lamp.position.set(px + 1.2, 6.7, pz);
      this.scene.add(lamp);

      const light = new THREE.PointLight(0xffea88, 1.2, 18);
      light.position.set(px + 1.2, 6.4, pz);
      this.scene.add(light);
    };

    addLightPole(-15.0, -9.5);
    addLightPole(12.0, -9.5);
    addLightPole(38.0, -9.5);
    addLightPole(-15.0, -25.5);
    addLightPole(12.0, -25.5);
    addLightPole(38.0, -25.5);

    // -------------------------------------------------------------
    // J. Boundary Colliders (Keep player inside urban map)
    // -------------------------------------------------------------
    // West Boundary (Northern Favela section)
    this.physics.addBoxCollider(
      new THREE.Vector3(-60.0, 0, -84.0),
      new THREE.Vector3(-34.0, 10, 35.0),
      'solid'
    );
    // East Boundary (Northern section beside Bento Bicudo / Tower)
    this.physics.addBoxCollider(
      new THREE.Vector3(53.5, 0, -84.0),
      new THREE.Vector3(58.0, 10, 0.0),
      'solid'
    );
    // North crest wings stay near z≈-82; only the campinho corridor x -22..22 opens north.
    this.physics.addBoxCollider(
      new THREE.Vector3(-60.0, 0, -88.0),
      new THREE.Vector3(-22.0, 15, -82.0),
      'solid'
    );
    this.physics.addBoxCollider(
      new THREE.Vector3(22.0, 0, -88.0),
      new THREE.Vector3(175.0, 15, -82.0),
      'solid'
    );
    this.physics.addBoxCollider(
      new THREE.Vector3(-60.0, 0, -118.0),
      new THREE.Vector3(175.0, 15, -114.0),
      'solid'
    );
  }

  // =========================================================================
  // 19. Rua Paula Ferreira Extension (Sentido Freguesia do Ó)
  // =========================================================================
  buildPaulaFerreiraFreguesiaExtension() {
    // 19.1 Flat Corridor: Z = 32.0 to 75.0 (Width = 10m, centered at X = 1.5)
    const flatRoadGeo = new THREE.PlaneGeometry(10, 43);
    const roadMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(2, 6)
    });
    const flatRoad = new THREE.Mesh(flatRoadGeo, roadMat);
    flatRoad.rotation.x = -Math.PI / 2;
    flatRoad.position.set(1.5, 0.012, 53.5);
    this.scene.add(flatRoad);

    // Yellow dashed center line
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    for (let z = 33; z <= 74; z += 3.2) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1.8), yellowLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(1.5, 0.018, z);
      this.scene.add(dash);
    }

    // Sidewalks on Flat Corridor (X = -6.0 to -3.5 and X = 6.5 to 9.0)
    const sideTex = this.textures.createCalcadaPaulista(2, 8);
    const sideMat = new THREE.MeshLambertMaterial({ map: sideTex });

    // West sidewalk (Z = 32 to 51.5 and 58.5 to 75 to accommodate Sete Barras cross street)
    const sideW1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 19.5), sideMat);
    sideW1.position.set(-4.75, 0.125, 41.75);
    this.scene.add(sideW1);
    this.physics.addBoxCollider(
      new THREE.Vector3(-6.0, 0, 32.0),
      new THREE.Vector3(-3.5, 0.25, 51.5),
      'curb'
    );

    const sideW2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 16.5), sideMat);
    sideW2.position.set(-4.75, 0.125, 66.75);
    this.scene.add(sideW2);
    this.physics.addBoxCollider(
      new THREE.Vector3(-6.0, 0, 58.5),
      new THREE.Vector3(-3.5, 0.25, 75.0),
      'curb'
    );

    // East sidewalk
    const sideE1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 19.5), sideMat);
    sideE1.position.set(7.75, 0.125, 41.75);
    this.scene.add(sideE1);
    this.physics.addBoxCollider(
      new THREE.Vector3(6.5, 0, 32.0),
      new THREE.Vector3(9.0, 0.25, 51.5),
      'curb'
    );

    const sideE2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 16.5), sideMat);
    sideE2.position.set(7.75, 0.125, 66.75);
    this.scene.add(sideE2);
    this.physics.addBoxCollider(
      new THREE.Vector3(6.5, 0, 58.5),
      new THREE.Vector3(9.0, 0.25, 75.0),
      'curb'
    );

    // Speed Bump (Lombada com faixas amarelas reflexivas) at Z = 45.0
    const lombadaGeo = new THREE.BoxGeometry(10.0, 0.15, 1.4);
    const lombadaMat = new THREE.MeshLambertMaterial({
      map: this.textures.createLombadaTexture()
    });
    const lombada = new THREE.Mesh(lombadaGeo, lombadaMat);
    lombada.position.set(1.5, 0.075, 45.0);
    this.scene.add(lombada);

    // Street Name Signs CET
    const signTex = this.textures.createStreetSign('RUA PAULA FERREIRA', 'FREGUESIA DO Ó • CEP 02915-000');
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });

    const createCornerSign = (px, pz, rotY) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.0, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
      pole.position.set(px, 1.5, pz);
      this.scene.add(pole);

      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.04), signMat);
      plate.position.set(px, 2.7, pz);
      plate.rotation.y = rotY;
      this.scene.add(plate);
    };
    createCornerSign(-4.5, 33.5, 0);
    createCornerSign(-4.5, 54.0, Math.PI / 2);

    // 19.2 The Freguesia Hill Climb ("Aclive da Paula Ferreira"): Z = 75.0 to 155.0
    // Elevation rises smoothly from Y = 0.0 to Y = 8.5 (80m run, 8.5m rise = 10.6% grade)
    const slopeAngle = Math.atan2(8.5, 80.0);
    const slopeHypot = Math.hypot(80.0, 8.5);

    // Sloped asphalt roadway
    const hillRoadGeo = new THREE.PlaneGeometry(10, slopeHypot);
    const hillRoadMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(2, 12)
    });
    const hillRoad = new THREE.Mesh(hillRoadGeo, hillRoadMat);
    hillRoad.rotation.x = -Math.PI / 2 - slopeAngle;
    hillRoad.position.set(1.5, 4.25, 115.0);
    this.scene.add(hillRoad);

    // Yellow double center dividing lines on the slope
    for (let s = -slopeHypot / 2 + 2; s <= slopeHypot / 2 - 2; s += 3.5) {
      [-0.12, 0.12].forEach(offset => {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1.8), yellowLineMat);
        line.rotation.x = -Math.PI / 2 - slopeAngle;
        const zPos = 115.0 + s * Math.cos(slopeAngle);
        const yPos = 4.25 - s * Math.sin(slopeAngle) + 0.02;
        line.position.set(1.5 + offset, yPos, zPos);
        this.scene.add(line);
      });
    }

    // Sloped sidewalks
    const hillSideGeo = new THREE.PlaneGeometry(2.5, slopeHypot);
    const hillSideMat = new THREE.MeshLambertMaterial({
      map: this.textures.createCalcadaPaulista(2, 14)
    });

    const hillSideW = new THREE.Mesh(hillSideGeo, hillSideMat);
    hillSideW.rotation.x = -Math.PI / 2 - slopeAngle;
    hillSideW.position.set(-4.75, 4.375, 115.0);
    this.scene.add(hillSideW);

    const hillSideE = new THREE.Mesh(hillSideGeo, hillSideMat);
    hillSideE.rotation.x = -Math.PI / 2 - slopeAngle;
    hillSideE.position.set(7.75, 4.375, 115.0);
    this.scene.add(hillSideE);

    // Physics Slope Collider for the climb
    this.physics.addSlope(-6.0, 9.0, 75.0, 155.0, 0.0, 8.5);

    // Concrete Retaining Walls (Muros de Arrimo) on the flanks
    const wallMat = new THREE.MeshLambertMaterial({
      map: this.textures.createReboco('#7d776f', 8, 4)
    });

    // West retaining wall
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.0, slopeHypot), wallMat);
    wallW.rotation.x = -slopeAngle;
    wallW.position.set(-6.25, 3.8, 115.0);
    this.scene.add(wallW);

    // East retaining wall with green metal railing
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.0, slopeHypot), wallMat);
    wallE.rotation.x = -slopeAngle;
    wallE.position.set(9.25, 3.8, 115.0);
    this.scene.add(wallE);

    // Metal safety guardrail along the hillside sidewalk
    const railMat = new THREE.MeshLambertMaterial({ color: 0x224422 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, slopeHypot), railMat);
    rail.rotation.x = -slopeAngle;
    rail.position.set(9.0, 5.0, 115.0);
    this.scene.add(rail);

    // Street light poles along the climb
    [85, 105, 125, 145].forEach(pz => {
      const factor = (pz - 75) / 80;
      const py = factor * 8.5;

      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 7.0, 0.25), new THREE.MeshLambertMaterial({ color: 0x666668 }));
      pole.position.set(8.5, py + 3.5, pz);
      this.scene.add(pole);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.25), new THREE.MeshBasicMaterial({ color: 0xffea88 }));
      lamp.position.set(7.5, py + 6.8, pz);
      this.scene.add(lamp);

      const light = new THREE.PointLight(0xffea88, 1.3, 16);
      light.position.set(7.5, py + 6.5, pz);
      this.scene.add(light);
    });
  }

  // =========================================================================
  // 20. Sete Barras Sector (Rua Sete Barras, Oficinas & Boteco)
  // =========================================================================
  buildSeteBarrasSector() {
    // 20.1 Rua Sete Barras roadway at Z = 55.0 (Width = 7m, from X = -35.0 to 35.0)
    const seteRoadMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(8, 2)
    });

    // West wing (X = -35.0 to -3.5)
    const roadW = new THREE.Mesh(new THREE.PlaneGeometry(31.5, 7.0), seteRoadMat);
    roadW.rotation.x = -Math.PI / 2;
    roadW.position.set(-19.25, 0.012, 55.0);
    this.scene.add(roadW);

    // East wing (X = 6.5 to 35.0)
    const roadE = new THREE.Mesh(new THREE.PlaneGeometry(28.5, 7.0), seteRoadMat);
    roadE.rotation.x = -Math.PI / 2;
    roadE.position.set(20.75, 0.012, 55.0);
    this.scene.add(roadE);

    // Sidewalks
    const sideMat = new THREE.MeshLambertMaterial({
      map: this.textures.createCalcadaPaulista(6, 2)
    });

    // North sidewalk West
    const sideNW = new THREE.Mesh(new THREE.BoxGeometry(31.5, 0.25, 2.5), sideMat);
    sideNW.position.set(-19.25, 0.125, 50.25);
    this.scene.add(sideNW);
    this.physics.addBoxCollider(new THREE.Vector3(-35.0, 0, 49.0), new THREE.Vector3(-3.5, 0.25, 51.5), 'curb');

    // South sidewalk West
    const sideSW = new THREE.Mesh(new THREE.BoxGeometry(31.5, 0.25, 2.5), sideMat);
    sideSW.position.set(-19.25, 0.125, 59.75);
    this.scene.add(sideSW);
    this.physics.addBoxCollider(new THREE.Vector3(-35.0, 0, 58.5), new THREE.Vector3(-3.5, 0.25, 61.0), 'curb');

    // North sidewalk East
    const sideNE = new THREE.Mesh(new THREE.BoxGeometry(28.5, 0.25, 2.5), sideMat);
    sideNE.position.set(20.75, 0.125, 50.25);
    this.scene.add(sideNE);
    this.physics.addBoxCollider(new THREE.Vector3(6.5, 0, 49.0), new THREE.Vector3(35.0, 0.25, 51.5), 'curb');

    // South sidewalk East
    const sideSE = new THREE.Mesh(new THREE.BoxGeometry(28.5, 0.25, 2.5), sideMat);
    sideSE.position.set(20.75, 0.125, 59.75);
    this.scene.add(sideSE);
    this.physics.addBoxCollider(new THREE.Vector3(6.5, 0, 58.5), new THREE.Vector3(35.0, 0.25, 61.0), 'curb');

    // Blue CET street sign
    const seteSignTex = this.textures.createStreetSign('RUA SETE BARRAS', 'FREGUESIA DO Ó • CEP 02914-000');
    const sSign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.04), new THREE.MeshBasicMaterial({ map: seteSignTex }));
    sSign.position.set(7.2, 2.7, 54.0);
    this.scene.add(sSign);

    // 20.2 Auto-Elétrica & Mecânica 7 Barras (X = -20.0, Z = 67.0)
    const autoW = 12.0, autoH = 6.2, autoD = 9.0;
    const autoMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPaintedWall('#3a536b', 3, 2)
    });
    const autoBuilding = new THREE.Mesh(new THREE.BoxGeometry(autoW, autoH, autoD), autoMat);
    autoBuilding.position.set(-20.0, autoH / 2 + 0.125, 67.0);
    this.scene.add(autoBuilding);

    // Signboard
    const autoSignMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const autoSign = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.2, 0.1), autoSignMat);
    autoSign.position.set(-20.0, 5.0, 62.45);
    this.scene.add(autoSign);

    // Metal roll-up garage door texture
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x77777d });
    const rollDoor = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.8, 0.1), doorMat);
    rollDoor.position.set(-20.0, 1.9, 62.48);
    this.scene.add(rollDoor);

    // Solid collision box for workshop
    this.physics.addBoxCollider(
      new THREE.Vector3(-26.0, 0, 62.5),
      new THREE.Vector3(-14.0, autoH + 1, 71.5),
      'solid'
    );

    // Tire stack outside
    this.buildTireStack(-24.5, 0.25, 60.5, 4);

    // 20.3 Walkable Boteco das 7 Barras ("Bar da Esquina 7 Barras", X = 20.0, Z = 67.0)
    const botW = 9.0, botH = 4.2, botD = 8.0;
    const botMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPaintedWall('#2e6347', 2, 2)
    });

    // Walkable floor
    const botFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(botW, botD),
      new THREE.MeshLambertMaterial({ color: 0x9c6644 })
    );
    botFloor.rotation.x = -Math.PI / 2;
    botFloor.position.set(20.0, 0.15, 67.0);
    this.scene.add(botFloor);
    this.physics.addBoxCollider(
      new THREE.Vector3(15.5, 0, 63.0),
      new THREE.Vector3(24.5, 0.25, 71.0),
      'walkable'
    );

    // Walls with entrance gap (doorway at X = 19 to 21, Z = 63.0)
    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(botW, botH, 0.3), botMat);
    backWall.position.set(20.0, botH / 2 + 0.15, 71.0);
    this.scene.add(backWall);
    this.physics.addBoxCollider(new THREE.Vector3(15.5, 0, 70.8), new THREE.Vector3(24.5, botH, 71.3), 'solid');

    // West wall
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, botH, botD), botMat);
    westWall.position.set(15.5, botH / 2 + 0.15, 67.0);
    this.scene.add(westWall);
    this.physics.addBoxCollider(new THREE.Vector3(15.3, 0, 63.0), new THREE.Vector3(15.8, botH, 71.0), 'solid');

    // East wall
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, botH, botD), botMat);
    eastWall.position.set(24.5, botH / 2 + 0.15, 67.0);
    this.scene.add(eastWall);
    this.physics.addBoxCollider(new THREE.Vector3(24.2, 0, 63.0), new THREE.Vector3(24.7, botH, 71.0), 'solid');

    // Front wall left
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(3.5, botH, 0.3), botMat);
    frontL.position.set(17.25, botH / 2 + 0.15, 63.0);
    this.scene.add(frontL);
    this.physics.addBoxCollider(new THREE.Vector3(15.5, 0, 62.8), new THREE.Vector3(19.0, botH, 63.3), 'solid');

    // Front wall right
    const frontR = new THREE.Mesh(new THREE.BoxGeometry(3.5, botH, 0.3), botMat);
    frontR.position.set(22.75, botH / 2 + 0.15, 63.0);
    this.scene.add(frontR);
    this.physics.addBoxCollider(new THREE.Vector3(21.0, 0, 62.8), new THREE.Vector3(24.5, botH, 63.3), 'solid');

    // Ceiling / Roof
    const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(botW + 0.4, 0.3, botD + 0.4), new THREE.MeshLambertMaterial({ color: 0x444444 }));
    roofMesh.position.set(20.0, botH + 0.3, 67.0);
    this.scene.add(roofMesh);

    // Warm interior bar light
    const barLight = new THREE.PointLight(0xffb84d, 1.4, 10);
    barLight.position.set(20.0, 3.2, 67.0);
    this.scene.add(barLight);

    // Bar Counter inside Boteco 7 Barras
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.05, 0.8), new THREE.MeshLambertMaterial({ color: 0x5c3317 }));
    counter.position.set(18.0, 0.65, 68.5);
    this.scene.add(counter);
    this.physics.addBoxCollider(new THREE.Vector3(16.3, 0, 68.0), new THREE.Vector3(19.7, 1.2, 69.0), 'solid');

    // Snooker Table inside
    this.buildSnookerTable(22.0, 0.15, 67.5);

    // Boteco tables on sidewalk outside
    this.buildBotecoTableSet(18.0, 0.25, 60.5);
    this.buildBotecoTableSet(23.0, 0.25, 60.5);

    // 20.4 Authentic Paulistano Sobrados
    const addSobradoSete = (sx, sz, w, h, d, color, hasWaterTank = true) => {
      const mat = new THREE.MeshLambertMaterial({ map: this.textures.createPaintedWall(color, 2, 2) });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      b.position.set(sx, h / 2 + 0.125, sz);
      this.scene.add(b);

      if (hasWaterTank) {
        this.buildWaterTank(sx, h + 0.15, sz);
      }

      this.physics.addBoxCollider(
        new THREE.Vector3(sx - w / 2, 0, sz - d / 2),
        new THREE.Vector3(sx + w / 2, h + 0.5, sz + d / 2),
        'solid'
      );
    };

    // North side sobrados
    addSobradoSete(-28.0, 44.5, 9.0, 5.8, 6.0, '#3d7294');
    addSobradoSete(-18.0, 44.5, 8.5, 5.5, 6.0, '#d4a359');
    addSobradoSete(26.0, 44.5, 9.0, 6.0, 6.0, '#a3503d');

    // South side sobrado
    addSobradoSete(30.0, 67.0, 8.5, 6.2, 7.5, '#6a8d73');

    // Boundaries for Sete Barras sector
    this.physics.addBoxCollider(new THREE.Vector3(-42.0, 0, 45.0), new THREE.Vector3(-35.0, 10, 75.0), 'solid'); // West edge
    this.physics.addBoxCollider(new THREE.Vector3(35.0, 0, 45.0), new THREE.Vector3(42.0, 10, 75.0), 'solid');  // East edge
    this.physics.addBoxCollider(new THREE.Vector3(-35.0, 0, 73.0), new THREE.Vector3(-6.0, 10, 78.0), 'solid'); // South flank West
    this.physics.addBoxCollider(new THREE.Vector3(9.0, 0, 73.0), new THREE.Vector3(35.0, 10, 78.0), 'solid');   // South flank East
  }

  // =========================================================================
  // 21. Av. General Edgar Facó Extension to Av. Ministro Petrônio Portela
  // =========================================================================
  buildEdgarFaccoPetronioPortelaExtension() {
    // 21.1 Edgar Facó roadway extension: X = 50.0 to 165.0 (Length = 115m, Width = 24m)
    const roadGeo = new THREE.PlaneGeometry(115, 24);
    const roadMat = new THREE.MeshLambertMaterial({
      map: this.textures.createAsfalto(15, 3)
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(107.5, 0.005, 20.0);
    this.scene.add(road);

    // Dedicated SPTrans Central Bus Lane (Faixa Vermelha)
    const busGeo = new THREE.PlaneGeometry(115, 4.2);
    const busMat = new THREE.MeshLambertMaterial({
      map: this.textures.createBusLaneTexture(15, 1)
    });
    const busLane = new THREE.Mesh(busGeo, busMat);
    busLane.rotation.x = -Math.PI / 2;
    busLane.position.set(107.5, 0.015, 20.0);
    this.scene.add(busLane);

    // North Sidewalk (Z = 2.0 to 8.0)
    const sideMat = new THREE.MeshLambertMaterial({
      map: this.textures.createCalcadaPaulista(24, 2)
    });
    const sideN = new THREE.Mesh(new THREE.BoxGeometry(115, 0.25, 6), sideMat);
    sideN.position.set(107.5, 0.125, 5.0);
    this.scene.add(sideN);
    this.physics.addBoxCollider(new THREE.Vector3(50.0, 0, 2.0), new THREE.Vector3(165.0, 0.25, 8.0), 'curb');

    // South Sidewalk (Z = 32.0 to 38.0)
    const sideS = new THREE.Mesh(new THREE.BoxGeometry(115, 0.25, 6), sideMat);
    sideS.position.set(107.5, 0.125, 35.0);
    this.scene.add(sideS);
    this.physics.addBoxCollider(new THREE.Vector3(50.0, 0, 32.0), new THREE.Vector3(165.0, 0.25, 38.0), 'curb');

    // 21.2 Crossing with Av. Ministro Petrônio Portela at X = 145.0 (Width = 16m)
    const petronioGeo = new THREE.PlaneGeometry(16, 76);
    const petronioRoad = new THREE.Mesh(petronioGeo, roadMat);
    petronioRoad.rotation.x = -Math.PI / 2;
    petronioRoad.position.set(145.0, 0.01, 20.0);
    this.scene.add(petronioRoad);

    // Pedestrian crosswalks at Petrônio Portela
    const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    [136.0, 154.0].forEach(cx => {
      for (let z = 9; z <= 31; z += 1.6) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), crosswalkMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(cx, 0.02, z);
        this.scene.add(stripe);
      }
    });

    // Traffic light semaphore at Petrônio Portela
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x222225 });
    const semPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8), poleMat);
    semPole.position.set(137.0, 3.0, 8.5);
    this.scene.add(semPole);

    const mastArm = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 0.12), poleMat);
    mastArm.position.set(139.2, 5.8, 8.5);
    this.scene.add(mastArm);

    const semBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.4), new THREE.MeshLambertMaterial({ color: 0x18181a }));
    semBox.position.set(141.0, 5.5, 8.5);
    this.scene.add(semBox);

    const greenSignal = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00ff44 }));
    greenSignal.position.set(141.0, 5.1, 8.72);
    this.scene.add(greenSignal);

    // 21.3 Highway Overhead Gantry (Pórtico da CET) at X = 125.0
    const gantryMat = new THREE.MeshLambertMaterial({ color: 0x3d4449 });
    const gPillarL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.5, 0.4), gantryMat);
    gPillarL.position.set(125.0, 3.75, 7.5);
    this.scene.add(gPillarL);

    const gPillarR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.5, 0.4), gantryMat);
    gPillarR.position.set(125.0, 3.75, 32.5);
    this.scene.add(gPillarR);

    const gBeam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 25.4), gantryMat);
    gBeam.position.set(125.0, 7.2, 20.0);
    this.scene.add(gBeam);

    // Highway signs (Green enamel CET boards)
    const signGreenMat = new THREE.MeshLambertMaterial({ color: 0x0c6834 });
    const sign1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 8.5), signGreenMat);
    sign1.position.set(124.9, 7.2, 15.5);
    this.scene.add(sign1);

    const sign2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 8.5), signGreenMat);
    sign2.position.set(124.9, 7.2, 24.5);
    this.scene.add(sign2);

    // 21.4 Posto BR / Petrobras at X = 85.0, Z = 45.0
    const canopyMat = new THREE.MeshLambertMaterial({ color: 0x0e7c3a });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.8, 12.0), canopyMat);
    canopy.position.set(85.0, 5.5, 45.0);
    this.scene.add(canopy);

    // Canopy pillars
    [
      [78.0, 40.0], [92.0, 40.0],
      [78.0, 50.0], [92.0, 50.0]
    ].forEach(([cx, cz]) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xededed }));
      p.position.set(cx, 2.75, cz);
      this.scene.add(p);
    });

    // Fuel pump islands
    const pumpMat = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
    [-4, 4].forEach(offset => {
      const island = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 1.4), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
      island.position.set(85.0 + offset, 0.125, 45.0);
      this.scene.add(island);

      const pump = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.6), pumpMat);
      pump.position.set(85.0 + offset, 1.0, 45.0);
      this.scene.add(pump);
      this.physics.addBoxCollider(
        new THREE.Vector3(85.0 + offset - 1.0, 0, 44.0),
        new THREE.Vector3(85.0 + offset + 1.0, 2.2, 46.0),
        'solid'
      );
    });

    // Convenience store "BR Mania"
    const storeMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPaintedWall('#f4f4f4', 2, 2)
    });
    const store = new THREE.Mesh(new THREE.BoxGeometry(12.0, 4.5, 7.0), storeMat);
    store.position.set(85.0, 2.25, 55.0);
    this.scene.add(store);
    this.physics.addBoxCollider(new THREE.Vector3(79.0, 0, 51.5), new THREE.Vector3(91.0, 5.0, 58.5), 'solid');

    // 21.5 Drogaria / Farmácia São Paulo (X = 115.0, Z = 44.0)
    const pharmMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPaintedWall('#dc2626', 2, 2)
    });
    const pharm = new THREE.Mesh(new THREE.BoxGeometry(12.0, 5.0, 8.0), pharmMat);
    pharm.position.set(115.0, 2.5, 44.0);
    this.scene.add(pharm);
    this.physics.addBoxCollider(new THREE.Vector3(109.0, 0, 40.0), new THREE.Vector3(121.0, 5.5, 48.0), 'solid');

    // Green pharmacy cross
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.1), crossMat);
    cross1.position.set(115.0, 4.2, 39.9);
    this.scene.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.1), crossMat);
    cross2.position.set(115.0, 4.2, 39.9);
    this.scene.add(cross2);

    // 21.6 Auto Peças Pirituba on North Side (X = 88.0, Z = -3.0)
    const autoPecas = new THREE.Mesh(
      new THREE.BoxGeometry(14.0, 5.2, 8.0),
      new THREE.MeshLambertMaterial({ map: this.textures.createPaintedWall('#2563eb', 2, 2) })
    );
    autoPecas.position.set(88.0, 2.6, -3.0);
    this.scene.add(autoPecas);
    this.physics.addBoxCollider(new THREE.Vector3(81.0, 0, -7.0), new THREE.Vector3(95.0, 5.5, 1.0), 'solid');

    // Modern SPTrans Bus Shelter at X = 136.0, Z = 6.2
    const busShelterMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const bRoof = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, 2.0), busShelterMat);
    bRoof.position.set(136.0, 2.6, 6.2);
    this.scene.add(bRoof);

    // Exterior Perimeter Boundaries for Edgar Facó & Petrônio Portela
    this.physics.addBoxCollider(new THREE.Vector3(165.0, 0, -20.0), new THREE.Vector3(175.0, 10, 60.0), 'solid'); // Far East Wall
    this.physics.addBoxCollider(new THREE.Vector3(135.0, 0, -25.0), new THREE.Vector3(155.0, 10, -18.0), 'solid'); // North Petrônio Dead End
    this.physics.addBoxCollider(new THREE.Vector3(135.0, 0, 58.0), new THREE.Vector3(155.0, 10, 65.0), 'solid');  // South Petrônio Dead End
    this.physics.addBoxCollider(new THREE.Vector3(50.0, 0, -15.0), new THREE.Vector3(135.0, 10, -8.0), 'solid');   // North corridor wall
  }

  // =========================================================================
  // 22. Largo da Matriz de Nossa Senhora do Ó (Freguesia do Ó)
  // =========================================================================
  buildLargoDaMatrizFreguesia() {
    // 22.1 Elevated Ground Plateau at Y = 8.5 (X = -35.0 to 38.0, Z = 155.0 to 235.0)
    const plazaW = 73.0, plazaD = 80.0;
    const plazaGeo = new THREE.PlaneGeometry(plazaW, plazaD);
    const plazaMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPedraPortuguesa(12, 14)
    });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.rotation.x = -Math.PI / 2;
    plazaMesh.position.set(1.5, 8.5, 195.0);
    this.scene.add(plazaMesh);

    // Slope / Plateau physical floor collider at Y = 8.5
    this.physics.addSlope(-35.0, 38.0, 155.0, 235.0, 8.5, 8.5);

    // 22.2 Mirante da Matriz Balustrade (Z = 155.2 overlooking the valley)
    const balustradeMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const createBalustradeSection = (minX, maxX) => {
      const len = maxX - minX;
      const midX = (minX + maxX) / 2;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, 0.35), balustradeMat);
      rail.position.set(midX, 8.5 + 0.55, 155.2);
      this.scene.add(rail);
      this.physics.addBoxCollider(
        new THREE.Vector3(minX, 8.5, 154.9),
        new THREE.Vector3(maxX, 10.5, 155.5),
        'solid'
      );
    };
    createBalustradeSection(-35.0, -3.5);
    createBalustradeSection(6.5, 38.0);

    // 22.3 Historic Victorian Coreto (Gazebo) at X = 1.5, Z = 188.0, Y = 8.5
    const coretoBaseGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.9, 8);
    const coretoBaseMat = new THREE.MeshLambertMaterial({ color: 0xd9cca9 });
    const coretoBase = new THREE.Mesh(coretoBaseGeo, coretoBaseMat);
    coretoBase.position.set(1.5, 8.5 + 0.45, 188.0);
    this.scene.add(coretoBase);
    this.physics.addBoxCollider(new THREE.Vector3(-2.8, 8.5, 183.8), new THREE.Vector3(5.8, 9.5, 192.2), 'walkable');

    // 8 Victorian cast-iron pillars
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = 1.5 + Math.cos(angle) * 3.6;
      const pz = 188.0 + Math.sin(angle) * 3.6;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), pillarMat);
      pillar.position.set(px, 8.5 + 0.9 + 1.6, pz);
      this.scene.add(pillar);
    }

    // Octagonal roof
    const roofGeo = new THREE.ConeGeometry(5.0, 2.2, 8);
    const coretoRoofMat = new THREE.MeshLambertMaterial({ color: 0x1f442f });
    const coretoRoof = new THREE.Mesh(roofGeo, coretoRoofMat);
    coretoRoof.position.set(1.5, 8.5 + 0.9 + 3.2 + 1.1, 188.0);
    this.scene.add(coretoRoof);

    // 22.4 Paróquia Nossa Senhora do Ó (Igreja Matriz fundada em 1580, X = -20.0, Z = 202.0, Y = 8.5)
    const chW = 14.0, chH = 11.5, chD = 22.0;
    const churchWallMat = new THREE.MeshLambertMaterial({
      map: this.textures.createColonialWall('#e2c262', 4, 4)
    });

    // Walkable church nave floor
    const naveFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(chW, chD),
      new THREE.MeshLambertMaterial({ color: 0x8a4521 })
    );
    naveFloor.rotation.x = -Math.PI / 2;
    naveFloor.position.set(-20.0, 8.52, 202.0);
    this.scene.add(naveFloor);

    // Church Back Wall (Sanctuary / Altar end)
    const chBack = new THREE.Mesh(new THREE.BoxGeometry(chW, chH, 0.6), churchWallMat);
    chBack.position.set(-20.0, 8.5 + chH / 2, 213.0);
    this.scene.add(chBack);
    this.physics.addBoxCollider(new THREE.Vector3(-27.0, 8.5, 212.7), new THREE.Vector3(-13.0, 8.5 + chH, 213.5), 'solid');

    // Church West Wall with Stained Glass Windows
    const chWest = new THREE.Mesh(new THREE.BoxGeometry(0.6, chH, chD), churchWallMat);
    chWest.position.set(-27.0, 8.5 + chH / 2, 202.0);
    this.scene.add(chWest);
    this.physics.addBoxCollider(new THREE.Vector3(-27.3, 8.5, 191.0), new THREE.Vector3(-26.7, 8.5 + chH, 213.0), 'solid');

    // Church East Wall
    const chEast = new THREE.Mesh(new THREE.BoxGeometry(0.6, chH, chD), churchWallMat);
    chEast.position.set(-13.0, 8.5 + chH / 2, 202.0);
    this.scene.add(chEast);
    this.physics.addBoxCollider(new THREE.Vector3(-13.3, 8.5, 191.0), new THREE.Vector3(-12.7, 8.5 + chH, 213.0), 'solid');

    // Front Wall with grand open church portal (X = -21.5 to -18.5 open)
    const frontLW = new THREE.Mesh(new THREE.BoxGeometry(5.5, chH, 0.6), churchWallMat);
    frontLW.position.set(-24.25, 8.5 + chH / 2, 191.0);
    this.scene.add(frontLW);
    this.physics.addBoxCollider(new THREE.Vector3(-27.0, 8.5, 190.7), new THREE.Vector3(-21.5, 8.5 + chH, 191.5), 'solid');

    const frontRW = new THREE.Mesh(new THREE.BoxGeometry(5.5, chH, 0.6), churchWallMat);
    frontRW.position.set(-15.75, 8.5 + chH / 2, 191.0);
    this.scene.add(frontRW);
    this.physics.addBoxCollider(new THREE.Vector3(-18.5, 8.5, 190.7), new THREE.Vector3(-13.0, 8.5 + chH, 191.5), 'solid');

    // Arched stained glass windows on the facade
    const vitralMat = new THREE.MeshBasicMaterial({ map: this.textures.createMatrizWindow() });
    const vitralFront = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), vitralMat);
    vitralFront.position.set(-20.0, 8.5 + 7.5, 190.65);
    this.scene.add(vitralFront);

    // Church Bell Tower (Torre Sineira de 21m) at X = -12.5, Z = 191.0
    const towerGeo = new THREE.BoxGeometry(4.5, 21.0, 4.5);
    const towerMat = new THREE.MeshLambertMaterial({
      map: this.textures.createColonialWall('#f0ebd8', 2, 6)
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(-12.5, 8.5 + 10.5, 191.0);
    this.scene.add(tower);

    // Tower Dome & Golden Cross
    const domeGeo = new THREE.SphereGeometry(2.3, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(-12.5, 8.5 + 21.0, 191.0);
    this.scene.add(dome);

    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const crossStem = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 0.15), crossMat);
    crossStem.position.set(-12.5, 8.5 + 23.5, 191.0);
    this.scene.add(crossStem);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 0.15), crossMat);
    crossArm.position.set(-12.5, 8.5 + 23.9, 191.0);
    this.scene.add(crossArm);

    // Baroque High Altar (Altar-Mor) at Z = 211.5
    const altarMat = new THREE.MeshBasicMaterial({ map: this.textures.createMatrizAltar() });
    const altar = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.0), altarMat);
    altar.position.set(-20.0, 8.5 + 2.5, 212.5);
    this.scene.add(altar);

    // Divine warm church interior lighting
    const churchLight = new THREE.PointLight(0xffdf88, 1.5, 18);
    churchLight.position.set(-20.0, 8.5 + 5.0, 202.0);
    this.scene.add(churchLight);

    // Church Pews (Bancos de Madeira)
    const pewMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18 });
    for (let z = 196; z <= 208; z += 2.4) {
      [-23.0, -17.0].forEach(px => {
        const pew = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.7, 0.5), pewMat);
        pew.position.set(px, 8.5 + 0.35, z);
        this.scene.add(pew);
      });
    }

    // 22.5 O Lendário Bar Frangó (desde 1987, X = 22.0, Z = 185.0, Y = 8.5)
    const frW = 14.0, frH = 7.5, frD = 15.0;
    const frangoWallMat = new THREE.MeshLambertMaterial({
      map: this.textures.createColonialWall('#d9aa52', 3, 2)
    });

    // Walkable floor
    const frFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(frW, frD),
      new THREE.MeshLambertMaterial({ color: 0x5a2d18 })
    );
    frFloor.rotation.x = -Math.PI / 2;
    frFloor.position.set(22.0, 8.52, 185.0);
    this.scene.add(frFloor);

    // Frangó Building Walls
    // Back wall
    const frBack = new THREE.Mesh(new THREE.BoxGeometry(frW, frH, 0.4), frangoWallMat);
    frBack.position.set(22.0, 8.5 + frH / 2, 192.5);
    this.scene.add(frBack);
    this.physics.addBoxCollider(new THREE.Vector3(15.0, 8.5, 192.3), new THREE.Vector3(29.0, 8.5 + frH, 192.8), 'solid');

    // East wall
    const frEast = new THREE.Mesh(new THREE.BoxGeometry(0.4, frH, frD), frangoWallMat);
    frEast.position.set(29.0, 8.5 + frH / 2, 185.0);
    this.scene.add(frEast);
    this.physics.addBoxCollider(new THREE.Vector3(28.8, 8.5, 177.5), new THREE.Vector3(29.3, 8.5 + frH, 192.5), 'solid');

    // West wall
    const frWest = new THREE.Mesh(new THREE.BoxGeometry(0.4, frH, frD), frangoWallMat);
    frWest.position.set(15.0, 8.5 + frH / 2, 185.0);
    this.scene.add(frWest);
    this.physics.addBoxCollider(new THREE.Vector3(14.7, 8.5, 177.5), new THREE.Vector3(15.2, 8.5 + frH, 192.5), 'solid');

    // Front wall with doorway (Doorway open at X = 19.5 to 22.5)
    const frFrontL = new THREE.Mesh(new THREE.BoxGeometry(4.5, frH, 0.4), frangoWallMat);
    frFrontL.position.set(17.25, 8.5 + frH / 2, 177.5);
    this.scene.add(frFrontL);
    this.physics.addBoxCollider(new THREE.Vector3(15.0, 8.5, 177.3), new THREE.Vector3(19.5, 8.5 + frH, 177.8), 'solid');

    const frFrontR = new THREE.Mesh(new THREE.BoxGeometry(6.5, frH, 0.4), frangoWallMat);
    frFrontR.position.set(25.75, 8.5 + frH / 2, 177.5);
    this.scene.add(frFrontR);
    this.physics.addBoxCollider(new THREE.Vector3(22.5, 8.5, 177.3), new THREE.Vector3(29.0, 8.5 + frH, 177.8), 'solid');

    // Rustic Signboard "FRANGÓ - DESDE 1987"
    const frSignMat = new THREE.MeshBasicMaterial({ map: this.textures.createFrangoSign() });
    const frSign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.6), frSignMat);
    frSign.position.set(21.0, 8.5 + 4.8, 177.25);
    this.scene.add(frSign);

    // Warm Bar Frangó Interior Lighting
    const frLight = new THREE.PointLight(0xffaa44, 1.4, 12);
    frLight.position.set(22.0, 8.5 + 3.2, 183.0);
    this.scene.add(frLight);

    // Oak Bar Counter & Snack Warmer (Estufa de Coxinha com Catupiry)
    const barCounter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 0.9), new THREE.MeshLambertMaterial({ color: 0x3d1e0d }));
    barCounter.position.set(20.5, 8.5 + 0.55, 183.0);
    this.scene.add(barCounter);
    this.physics.addBoxCollider(new THREE.Vector3(18.4, 8.5, 182.5), new THREE.Vector3(22.6, 9.7, 183.5), 'solid');

    // Estufa de coxinha
    const estufaGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.5, 0.5),
      new THREE.MeshLambertMaterial({ color: 0xffd166, transparent: true, opacity: 0.85 })
    );
    estufaGlass.position.set(21.0, 8.5 + 1.35, 183.0);
    this.scene.add(estufaGlass);

    // Veranda / Outdoor Deck with dining tables outside Frangó
    this.buildBotecoTableSet(18.0, 8.5, 173.0);
    this.buildBotecoTableSet(24.0, 8.5, 173.0);
    this.buildBotecoTableSet(18.0, 8.5, 168.0);
    this.buildBotecoTableSet(24.0, 8.5, 168.0);

    // 22.6 Plaza Landscaping: Ipê-amarelo trees and Victorian Park Benches
    this.buildIpeTree(-8.0, 8.5, 175.0);
    this.buildIpeTree(10.0, 8.5, 175.0);
    this.buildIpeTree(-8.0, 8.5, 205.0);
    this.buildIpeTree(10.0, 8.5, 205.0);

    // Park Benches
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x1f3b2b });
    [
      [-4.0, 182.0], [7.0, 182.0],
      [-4.0, 194.0], [7.0, 194.0]
    ].forEach(([bx, bz]) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.6), benchMat);
      bench.position.set(bx, 8.5 + 0.25, bz);
      this.scene.add(bench);
    });

    // Outer boundaries enclosing Largo da Matriz
    this.physics.addBoxCollider(new THREE.Vector3(-42.0, 8.5, 155.0), new THREE.Vector3(-35.0, 18.5, 240.0), 'solid'); // West
    this.physics.addBoxCollider(new THREE.Vector3(38.0, 8.5, 155.0), new THREE.Vector3(46.0, 18.5, 240.0), 'solid');  // East
    this.physics.addBoxCollider(new THREE.Vector3(-42.0, 8.5, 235.0), new THREE.Vector3(46.0, 18.5, 245.0), 'solid'); // South
  }

  // Parked carnival trio plaza on the south flank of Edgar Facó (outside live road z 8..32)
  buildBlocoEdgarFaccoTrioPlaza() {
    const group = new THREE.Group();
    group.name = 'blocoTrioGroup';
    this.blocoTrioGroup = group;

    const plazaMat = new THREE.MeshLambertMaterial({
      map: this.textures.createCalcadaPaulista(8, 4)
    });
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(28, 18), plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(146, 0.03, 43);
    group.add(plaza);

    const truckMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x111113 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0x9aa3ad });
    const speakerMat = new THREE.MeshLambertMaterial({ color: 0x111115 });
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    // Bus-scale trio chassis, east/west, centered near x=146, z=43
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(12.0, 1.1, 2.6), truckMat);
    chassis.position.set(146, 1.15, 43);
    group.add(chassis);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.12, 2.5), chromeMat);
    deck.position.set(146, 1.76, 43);
    group.add(deck);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 2.4), cabinMat);
    cabin.position.set(140.6, 2.55, 43);
    group.add(cabin);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.9, 2.1),
      new THREE.MeshLambertMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.7 })
    );
    glass.position.set(139.35, 2.65, 43);
    group.add(glass);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.12, 2.7), truckMat);
    roof.position.set(146, 3.35, 43);
    group.add(roof);

    [-4.2, 0, 4.2].forEach((ox) => {
      [-1.2, 1.2].forEach((oz) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.32, 10), blackMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(146 + ox, 0.48, 43 + oz);
        group.add(wheel);
      });
    });

    // Speaker wall on the south face, facing the plaza (not the live avenue)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.45), speakerMat);
        box.position.set(143.2 + col * 0.85, 2.15 + row * 0.75, 44.45);
        group.add(box);
        const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.05, 10), coneMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(143.2 + col * 0.85, 2.15 + row * 0.75, 44.72);
        group.add(cone);
      }
    }

    this.physics.addBoxCollider(
      new THREE.Vector3(140.0, 0, 41.6),
      new THREE.Vector3(152.0, 3.5, 44.5),
      'solid'
    );

    const barrierMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const addJersey = (x, z) => {
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 0.38), barrierMat);
      barrier.position.set(x, 0.42, z);
      group.add(barrier);
      this.physics.addBoxCollider(
        new THREE.Vector3(x - 0.9, 0, z - 0.2),
        new THREE.Vector3(x + 0.9, 0.85, z + 0.2),
        'solid'
      );
    };
    // Road-edge barriers stay south of live lane z=32, with pedestrian gaps
    [133.2, 135.2, 141.2, 150.8, 156.8, 158.8].forEach((x) => addJersey(x, 34.25));
    [34.9, 37.2, 48.6, 51.2].forEach((z) => {
      addJersey(132.4, z);
      addJersey(159.6, z);
    });

    const buntingTex = this.textures.createCarnivalBunting();
    const buntingMat = new THREE.MeshBasicMaterial({
      map: buntingTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const streamerMat = new THREE.MeshBasicMaterial({
      map: this.textures.createCarnivalStreamer(),
      side: THREE.DoubleSide
    });

    const poles = [
      [133.5, 51.0], [146.0, 51.4], [158.5, 51.0],
      [133.5, 35.1], [158.5, 35.1]
    ];
    poles.forEach(([px, pz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 4.2, 8), chromeMat);
      pole.position.set(px, 2.1, pz);
      group.add(pole);
    });

    const stringBunting = (x1, z1, x2, z2, y = 3.6) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.55), buntingMat);
      banner.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      banner.rotation.y = -Math.atan2(dz, dx);
      group.add(banner);
    };
    stringBunting(133.5, 51.0, 146.0, 51.4);
    stringBunting(146.0, 51.4, 158.5, 51.0);
    stringBunting(133.5, 35.1, 158.5, 35.1, 3.8);

    const streamer = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 0.18), streamerMat);
    streamer.position.set(146, 3.55, 45.1);
    group.add(streamer);

    const confettiColors = [0xe11d48, 0xf59e0b, 0x22c55e, 0x2563eb, 0xf5d90a];
    for (let i = 0; i < 10; i++) {
      const bit = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22, 0.28),
        new THREE.MeshBasicMaterial({ color: confettiColors[i % confettiColors.length], side: THREE.DoubleSide })
      );
      bit.position.set(138 + (i % 5) * 2.1, 2.4 + (i % 3) * 0.25, 47.2 + (i % 2) * 1.4);
      bit.rotation.y = 0.4;
      group.add(bit);
    }

    this.scene.add(group);
  }

  // Favela crest campinho, churrasco plateau, and walkable connector from the mirante
  buildFavelaCampinho() {
    const group = new THREE.Group();
    group.name = 'campinhoGroup';
    this.campinhoGroup = group;

    const dirtMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPitchDirt(8, 5)
    });
    const grassMat = new THREE.MeshLambertMaterial({
      map: this.textures.createPitchGrass(6, 3)
    });
    const markMat = new THREE.MeshBasicMaterial({
      map: this.textures.createPitchMarkings(),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const wallMat = new THREE.MeshLambertMaterial({
      map: this.textures.createReboco('#7d776f', 6, 3)
    });
    const railMat = new THREE.MeshLambertMaterial({ color: 0x226bb3 });

    // Crest plateau x -20..20, z -111..-87, top y=9.5
    const plateau = new THREE.Mesh(new THREE.BoxGeometry(40, 0.35, 24), dirtMat);
    plateau.position.set(0, 9.325, -99);
    group.add(plateau);
    this.physics.addBoxCollider(
      new THREE.Vector3(-20, 9.35, -111),
      new THREE.Vector3(20, 9.5, -87),
      'walkable'
    );

    // Closed floor: south hill-to-plateau apron, north plateau-to-boundary, and side shoulders
    const southApron = new THREE.Mesh(new THREE.BoxGeometry(44, 0.28, 6.2), dirtMat);
    southApron.position.set(0, 9.36, -84);
    group.add(southApron);
    const northApron = new THREE.Mesh(new THREE.BoxGeometry(44, 0.28, 3.2), dirtMat);
    northApron.position.set(0, 9.36, -112.6);
    group.add(northApron);
    const westShoulder = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 33), dirtMat);
    westShoulder.position.set(-21.1, 9.36, -97.5);
    group.add(westShoulder);
    const eastShoulder = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 33), dirtMat);
    eastShoulder.position.set(21.1, 9.36, -97.5);
    group.add(eastShoulder);
    this.physics.addBoxCollider(
      new THREE.Vector3(-22, 9.35, -114),
      new THREE.Vector3(22, 9.5, -81),
      'walkable'
    );

    // Playing surface exactly 28×14 m at y=9.5
    const pitch = new THREE.Mesh(new THREE.BoxGeometry(28, 0.08, 14), grassMat);
    pitch.position.set(0, 9.54, -99);
    group.add(pitch);
    this.physics.addBoxCollider(
      new THREE.Vector3(-14, 9.42, -106),
      new THREE.Vector3(14, 9.5, -92),
      'walkable'
    );

    const markings = new THREE.Mesh(new THREE.PlaneGeometry(28, 14), markMat);
    markings.rotation.x = -Math.PI / 2;
    markings.position.set(0, 9.59, -99);
    group.add(markings);

    const postMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const netMat = new THREE.MeshLambertMaterial({ color: 0xd1d5db, transparent: true, opacity: 0.35 });
    const addGoal = (x, facing) => {
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.12), postMat);
      postL.position.set(x, 10.5, -99 - 2.0);
      group.add(postL);
      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.12), postMat);
      postR.position.set(x, 10.5, -99 + 2.0);
      group.add(postR);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 4.12), postMat);
      cross.position.set(x, 11.5, -99);
      group.add(cross);
      const net = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 4.0), netMat);
      net.position.set(x + facing * 0.6, 10.45, -99);
      group.add(net);
      this.physics.addBoxCollider(
        new THREE.Vector3(x - 0.15, 9.5, -101.15),
        new THREE.Vector3(x + 0.15, 11.55, -100.85),
        'solid'
      );
      this.physics.addBoxCollider(
        new THREE.Vector3(x - 0.15, 9.5, -97.15),
        new THREE.Vector3(x + 0.15, 11.55, -96.85),
        'solid'
      );
    };
    addGoal(-14, -1);
    addGoal(14, 1);

    // Fixed churrasqueira and simple wood tables off the pitch
    const brickMat = new THREE.MeshLambertMaterial({ map: this.textures.createTijoloBaiano(1, 1) });
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.85), brickMat);
    grill.position.set(-18.0, 10.0, -88.5);
    group.add(grill);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.5, 0.75, 4), new THREE.MeshLambertMaterial({ color: 0x5a2d18 }));
    hood.rotation.y = Math.PI / 4;
    hood.position.set(-18.0, 10.85, -88.5);
    group.add(hood);
    const grate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.6), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    grate.position.set(-18.0, 10.48, -88.5);
    group.add(grate);
    this.physics.addBoxCollider(
      new THREE.Vector3(-18.7, 9.5, -89.1),
      new THREE.Vector3(-17.3, 11.2, -87.9),
      'solid'
    );

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2b });
    [[-17.2, -91.2], [17.4, -88.8], [17.6, -91.4]].forEach(([tx, tz]) => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.7), woodMat);
      table.position.set(tx, 10.22, tz);
      group.add(table);
      [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), woodMat);
        leg.position.set(tx + lx, 9.85, tz + lz);
        group.add(leg);
      });
      this.physics.addBoxCollider(
        new THREE.Vector3(tx - 0.6, 9.5, tz - 0.35),
        new THREE.Vector3(tx + 0.6, 10.3, tz + 0.35),
        'solid'
      );
    });

    // Retaining walls around the plateau; south opening keeps the connector
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(44, 4.2, 1.2), wallMat);
    northWall.position.set(0, 7.6, -116);
    group.add(northWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(1.1, 5.2, 28), wallMat);
    westWall.position.set(-21.4, 7.1, -99);
    group.add(westWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(-22.0, 4.5, -114),
      new THREE.Vector3(-20.8, 12.0, -86.5),
      'solid'
    );

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.1, 5.2, 28), wallMat);
    eastWall.position.set(21.4, 7.1, -99);
    group.add(eastWall);
    this.physics.addBoxCollider(
      new THREE.Vector3(20.8, 4.5, -114),
      new THREE.Vector3(22.0, 12.0, -86.5),
      'solid'
    );

    [[-18.5, -86.4], [18.5, -86.4]].forEach(([wx, wz]) => {
      const southWing = new THREE.Mesh(new THREE.BoxGeometry(7.0, 3.2, 0.8), wallMat);
      southWing.position.set(wx, 8.1, wz);
      group.add(southWing);
      this.physics.addBoxCollider(
        new THREE.Vector3(wx - 3.5, 6.5, wz - 0.4),
        new THREE.Vector3(wx + 3.5, 10.5, wz + 0.4),
        'solid'
      );
    });

    // Crest-height connector: meet the existing hillside (~y=9.5 at z=-81) and stay level to the plateau
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(16, 0.22, 9.2), dirtMat);
    ramp.position.set(0, 9.39, -82.6);
    group.add(ramp);
    this.physics.addSlope(-10, 10, -87, -78, 9.5, 9.5);
    this.physics.addBoxCollider(
      new THREE.Vector3(-8, 9.38, -87),
      new THREE.Vector3(8, 9.5, -78),
      'stair'
    );

    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 9.2), railMat);
    railL.position.set(-6.1, 9.85, -82.6);
    group.add(railL);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 9.2), railMat);
    railR.position.set(6.1, 9.85, -82.6);
    group.add(railR);

    this.scene.add(group);
  }
}

