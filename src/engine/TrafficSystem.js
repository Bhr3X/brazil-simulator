/**
 * Traffic System for Brazilian Favela Suburb (Version 2 Update)
 * Features pseudo-volumetric cars (Fiat Uno com escada, Gol quadrado, Fusca),
 * Motoboy delivery motorcycle, functioning traffic light semaphores,
 * high-altitude sky traffic (airplanes), and Empty City mode toggle.
 */

export class TrafficSystem {
  constructor(scene, soundEngine, textures = null) {
    this.scene = scene;
    this.sound = soundEngine;
    this.textures = textures;

    this.isEmptyCity = false;
    this.weather = 'CLEAR'; // 'CLEAR' | 'STORM'
    this.trafficGroup = new THREE.Group();
    this.scene.add(this.trafficGroup);

    this.vehicles = [];
    this.trafficLight = null;
    this.airplane = null;

    this.initTrafficLight();
    this.initVehicles();
    this.initAirplane();
  }

  setWeather(mode) {
    this.weather = mode;
  }

  // 1. Functional Traffic Light (Semáforo de Trânsito)
  initTrafficLight() {
    const lightGroup = new THREE.Group();

    // Black metal pole
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x222225 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5.5, 8), poleMat);
    pole.position.y = 2.75;
    lightGroup.add(pole);

    // Semaphore housing box with yellow/black backplate
    const boxMat = new THREE.MeshLambertMaterial({ color: 0x18181a });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.4), boxMat);
    box.position.set(0, 4.4, 0);
    lightGroup.add(box);

    // Backplate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.6, 0.05), boxMat);
    plate.position.set(0, 4.4, 0.22);
    lightGroup.add(plate);

    // 3 Signal Lenses (Red, Yellow, Green)
    const lensGeo = new THREE.SphereGeometry(0.14, 12, 12);

    // Red lens (top)
    const redMat = new THREE.MeshBasicMaterial({ color: 0x440000 });
    const redMesh = new THREE.Mesh(lensGeo, redMat);
    redMesh.position.set(0, 4.8, 0.22);
    lightGroup.add(redMesh);

    // Yellow lens (middle)
    const yelMat = new THREE.MeshBasicMaterial({ color: 0x443300 });
    const yelMesh = new THREE.Mesh(lensGeo, yelMat);
    yelMesh.position.set(0, 4.4, 0.22);
    lightGroup.add(yelMesh);

    // Green lens (bottom)
    const grnMat = new THREE.MeshBasicMaterial({ color: 0x004411 });
    const grnMesh = new THREE.Mesh(lensGeo, grnMat);
    grnMesh.position.set(0, 4.0, 0.22);
    lightGroup.add(grnMesh);

    // Spotlight glow on the road
    const signalLight = new THREE.PointLight(0x00ff44, 1.2, 10);
    signalLight.position.set(0, 3.8, 0.8);
    lightGroup.add(signalLight);

    // Position semaphore at the main intersection curb
    lightGroup.position.set(1.5, 0.25, 8.5);
    lightGroup.rotation.y = Math.PI; // Face incoming traffic
    this.scene.add(lightGroup);

    this.trafficLight = {
      group: lightGroup,
      state: 'GREEN', // 'GREEN', 'YELLOW', 'RED'
      timer: 0,
      redMat, yelMat, grnMat,
      signalLight,
      stopLineX: 4.5
    };
  }

  // 2. Initialize Moving Brazilian Vehicles
  initVehicles() {
    // Lane 1: Westbound (Z = 17.0, moving negative X from 50 to -50)
    // Lane 2: Dedicated Bus Corridor (Z = 20.0, moving negative X from 50 to -50)
    // Lane 3: Eastbound (Z = 23.0, moving positive X from -50 to 50)

    // Vehicle 1: The Legendary Fiat Uno with ladder ("Uno com escada no teto")
    const uno = this.createFiatUno();
    this.vehicles.push({
      mesh: uno.mesh,
      type: 'uno',
      lane: 'west',
      speed: 10.5,
      currentSpeed: 10.5,
      x: 35,
      z: 17.0,
      y: 0.1,
      targetAngle: Math.PI,
      brakeLights: uno.brakeLights,
      headlights: uno.headlights,
      length: 3.8
    });

    // Vehicle 2: Motoboy on Honda CG 160 Titan with pizza delivery box
    const motoboy = this.createMotoboy();
    this.vehicles.push({
      mesh: motoboy.mesh,
      type: 'motoboy',
      lane: 'west',
      speed: 13.5, // Faster, agile
      currentSpeed: 13.5,
      x: 10,
      z: 16.2,
      y: 0.1,
      targetAngle: Math.PI,
      brakeLights: motoboy.brakeLights,
      headlights: motoboy.headlights,
      length: 2.2
    });

    // Vehicle 3: SPTrans City Bus on dedicated central bus corridor (Z = 20.0)
    const bus = this.createSPTransBus();
    this.vehicles.push({
      mesh: bus.mesh,
      type: 'bus',
      lane: 'bus',
      speed: 8.5,
      currentSpeed: 8.5,
      x: 48,
      z: 20.0,
      y: 0.1,
      targetAngle: Math.PI,
      brakeLights: bus.brakeLights,
      headlights: bus.headlights,
      length: 9.5
    });

    // Vehicle 4: Classic 90s VW Gol Quadrado (Red)
    const gol = this.createGolQuadrado();
    this.vehicles.push({
      mesh: gol.mesh,
      type: 'gol',
      lane: 'east',
      speed: 9.5,
      currentSpeed: 9.5,
      x: -25,
      z: 23.0,
      y: 0.1,
      targetAngle: 0,
      brakeLights: gol.brakeLights,
      headlights: gol.headlights,
      length: 3.9
    });

    // Vehicle 5: Yellow Fusca Beetle
    const fusca = this.createFuscaBeetle();
    this.vehicles.push({
      mesh: fusca.mesh,
      type: 'fusca',
      lane: 'east',
      speed: 8.5,
      currentSpeed: 8.5,
      x: 15,
      z: 23.0,
      y: 0.1,
      targetAngle: 0,
      brakeLights: fusca.brakeLights,
      headlights: fusca.headlights,
      length: 3.8
    });

    this.vehicles.forEach(v => this.trafficGroup.add(v.mesh));
  }

  // 3. Build Brazilian Vehicles

  // 3.1 Fiat Uno with Roof Ladder ("Uno da Firma com escada")
  createFiatUno() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f2 }); // Classic white
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1f1f21 }); // Plastic bumpers
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2634 });
    const aluMat = new THREE.MeshLambertMaterial({ color: 0xd6d8db }); // Aluminum ladder

    // Boxy lower body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 1.65), bodyMat);
    body.position.y = 0.55;
    group.add(body);

    // Black plastic bumpers
    const fBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 1.7), blackMat);
    fBumper.position.set(1.8, 0.45, 0);
    group.add(fBumper);
    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 1.7), blackMat);
    rBumper.position.set(-1.8, 0.45, 0);
    group.add(rBumper);

    // Boxy cabin with flat windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 1.55), bodyMat);
    cabin.position.set(-0.2, 1.15, 0);
    group.add(cabin);

    // Windows
    const fGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 1.4), glassMat);
    fGlass.position.set(0.86, 1.15, 0);
    fGlass.rotation.z = -0.28;
    group.add(fGlass);

    const rGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 1.4), glassMat);
    rGlass.position.set(-1.26, 1.15, 0);
    group.add(rGlass);

    // ROOF RACK & EXTENSION LADDER (A famosa escada de telecom do Uno!)
    const rackBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.6), blackMat);
    rackBar1.position.set(0.4, 1.54, 0);
    group.add(rackBar1);
    const rackBar2 = rackBar1.clone();
    rackBar2.position.set(-0.6, 1.54, 0);
    group.add(rackBar2);

    // Aluminum ladder
    const ladderL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.06), aluMat);
    ladderL.position.set(0, 1.62, 0.28);
    group.add(ladderL);
    const ladderR = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.06), aluMat);
    ladderR.position.set(0, 1.62, -0.28);
    group.add(ladderR);

    // Ladder rungs (Degraus da escada)
    for (let i = -1.3; i <= 1.3; i += 0.35) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.56), aluMat);
      rung.position.set(i, 1.62, 0);
      group.add(rung);
    }

    // Wheels
    this.addCarWheels(group, 3.6);

    // Headlights and Brake lights
    const { headlights, brakeLights } = this.addCarLights(group, 1.8, 0.6, 0.65);

    return { mesh: group, headlights, brakeLights };
  }

  // 3.2 Motoboy on Honda CG 160 Titan
  createMotoboy() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xc81414 }); // Classic red Honda
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd4d4d4 });
    const boxMat = new THREE.MeshLambertMaterial({ color: 0xba1a1a }); // Red delivery box

    // Motorcycle chassis & tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.35), frameMat);
    tank.position.set(0.1, 0.75, 0);
    group.add(tank);

    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.3), chromeMat);
    engine.position.set(0.05, 0.45, 0);
    group.add(engine);

    // Chrome exhaust pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 6), chromeMat);
    exhaust.rotation.z = Math.PI / 2 + 0.15;
    exhaust.position.set(-0.3, 0.3, 0.22);
    group.add(exhaust);

    // Two motorcycle wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 12);
    wheelGeo.rotateX(Math.PI / 2);
    const fWheel = new THREE.Mesh(wheelGeo, blackMat);
    fWheel.position.set(0.85, 0.3, 0);
    group.add(fWheel);

    const rWheel = new THREE.Mesh(wheelGeo, blackMat);
    rWheel.position.set(-0.85, 0.3, 0);
    group.add(rWheel);

    // Delivery Box (Baú de Motoqueiro / iFood / Pizza)
    const dBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.55), boxMat);
    dBox.position.set(-0.7, 0.95, 0);
    group.add(dBox);

    // Rider Figure
    const riderSkin = new THREE.MeshLambertMaterial({ color: 0xb5784c });
    const riderClothes = new THREE.MeshLambertMaterial({ color: 0x223344 });
    const vestMat = new THREE.MeshLambertMaterial({ color: 0xd4e813 }); // High-vis yellow vest
    const helmetMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    // Torso with vest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.4), vestMat);
    torso.position.set(-0.15, 1.15, 0);
    torso.rotation.z = -0.2; // leaning slightly forward
    group.add(torso);

    // Helmet & Visor
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), helmetMat);
    helmet.position.set(-0.05, 1.6, 0);
    group.add(helmet);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    visor.position.set(0.1, 1.6, 0);
    group.add(visor);

    // Headlight & Brake light
    const hlGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const hl = new THREE.Mesh(hlGeo, hlMat);
    hl.position.set(0.95, 0.8, 0);
    group.add(hl);

    const blGeo = new THREE.BoxGeometry(0.08, 0.1, 0.15);
    const blMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bl = new THREE.Mesh(blGeo, blMat);
    bl.position.set(-1.05, 0.95, 0);
    group.add(bl);

    return { mesh: group, headlights: [hl], brakeLights: [blMat] };
  }

  // 3.3 VW Gol Quadrado (Boxy Red Hatchback)
  createGolQuadrado() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xb81d1d }); // Brazilian burgundy red
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x222225 });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x192430 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.65, 1.68), bodyMat);
    body.position.y = 0.52;
    group.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.68, 1.56), bodyMat);
    cabin.position.set(-0.2, 1.1, 0);
    group.add(cabin);

    // Bumpers
    const fBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 1.72), blackMat);
    fBumper.position.set(1.85, 0.45, 0);
    group.add(fBumper);
    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 1.72), blackMat);
    rBumper.position.set(-1.85, 0.45, 0);
    group.add(rBumper);

    // Slanted hatchback rear
    const rGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 1.45), glassMat);
    rGlass.position.set(-1.25, 1.1, 0);
    rGlass.rotation.z = 0.45;
    group.add(rGlass);

    this.addCarWheels(group, 3.7);
    const { headlights, brakeLights } = this.addCarLights(group, 1.85, 0.58, 0.65);

    return { mesh: group, headlights, brakeLights };
  }

  // 3.4 Yellow Fusca (Beetle)
  createFuscaBeetle() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe0ad19 }); // Mustard yellow
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2430 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd4d4d4 });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 1.75), bodyMat);
    chassis.position.y = 0.55;
    group.add(chassis);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 1.55), bodyMat);
    cabin.position.set(-0.2, 1.15, 0);
    group.add(cabin);

    // Curved hood
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.9, 8), bodyMat);
    hood.rotation.z = Math.PI / 2;
    hood.position.set(1.3, 0.65, 0);
    group.add(hood);

    this.addCarWheels(group, 3.6);
    const { headlights, brakeLights } = this.addCarLights(group, 1.8, 0.58, 0.6);

    return { mesh: group, headlights, brakeLights };
  }

  // 3.5 SPTrans Municipal City Bus (Articulated / Standard Silver & Red Livery)
  createSPTransBus() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd2d6d9 }); // Silver SPTrans
    const redMat = new THREE.MeshLambertMaterial({ color: 0xcc1414 }); // SPTrans Red Stripe
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x18181a });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1b2838 });

    // Side livery texture if textures generator is available
    const sideLiveryTex = this.textures ? this.textures.createSPTransBusTexture() : null;
    const sideMat = sideLiveryTex ? new THREE.MeshLambertMaterial({ map: sideLiveryTex }) : bodyMat;

    // Main Bus Body Box
    const busMaterials = [
      bodyMat,  // front
      bodyMat,  // rear
      bodyMat,  // roof
      blackMat, // bottom
      sideMat,  // side 1
      sideMat   // side 2
    ];
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(9.4, 2.6, 2.5), busMaterials);
    busBody.position.y = 1.65;
    group.add(busBody);

    // Red Skirting Band (Lower 30% of body)
    const skirtL = new THREE.Mesh(new THREE.BoxGeometry(9.42, 0.7, 0.05), redMat);
    skirtL.position.set(0, 0.75, 1.25);
    group.add(skirtL);
    const skirtR = skirtL.clone();
    skirtR.position.set(0, 0.75, -1.25);
    group.add(skirtR);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 2.3), glassMat);
    windshield.position.set(4.71, 2.0, 0);
    group.add(windshield);

    // Rear Window
    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 2.2), glassMat);
    rearWindow.position.set(-4.71, 2.1, 0);
    group.add(rearWindow);

    // Front Destination LED Display (Letreiro Digital Laranja)
    const letreiroHousing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, 1.8), blackMat);
    letreiroHousing.position.set(4.72, 2.72, 0);
    group.add(letreiroHousing);

    const ledMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    const letreiroScreen = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.25, 1.6), ledMat);
    letreiroScreen.position.set(4.73, 2.72, 0);
    group.add(letreiroScreen);

    // Rooftop AC Unit (Ar Condicionado no teto)
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.4), new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }));
    acUnit.position.set(0.5, 3.05, 0);
    group.add(acUnit);

    // 6 Bus Wheels (Front Single, Rear Dual Axle)
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 14);
    wheelGeo.rotateX(Math.PI / 2);
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x141416 });

    const wheelCoords = [
      [3.0, 0.48, 1.25],   // Front left
      [3.0, 0.48, -1.25],  // Front right
      [-2.4, 0.48, 1.25],  // Rear 1 left
      [-2.4, 0.48, -1.25], // Rear 1 right
      [-3.6, 0.48, 1.25],  // Rear 2 left
      [-3.6, 0.48, -1.25]  // Rear 2 right
    ];
    wheelCoords.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, wy, wz);
      group.add(wheel);

      // White hubcap
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8), bodyMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(wx, wy, wz);
      group.add(cap);
    });

    // Front Headlights & Rear Taillights
    const hlGeo = new THREE.BoxGeometry(0.12, 0.25, 0.35);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfff8dd });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(4.72, 0.8, 0.9);
    group.add(hl1);
    const hl2 = hl1.clone();
    hl2.position.set(4.72, 0.8, -0.9);
    group.add(hl2);

    // Rear vertical taillight strips (Typical Brazilian bus)
    const blGeo = new THREE.BoxGeometry(0.12, 0.6, 0.18);
    const blMat = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
    const bl1 = new THREE.Mesh(blGeo, blMat);
    bl1.position.set(-4.72, 1.2, 1.0);
    group.add(bl1);
    const bl2 = bl1.clone();
    bl2.position.set(-4.72, 1.2, -1.0);
    group.add(bl2);

    return {
      mesh: group,
      headlights: [hl1, hl2],
      brakeLights: [blMat]
    };
  }

  // Wheels helper
  addCarWheels(group, length) {
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 12);
    wheelGeo.rotateX(Math.PI / 2);
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x1c1c1f });

    const halfL = length * 0.32;
    [
      [halfL, 0.34, 0.86],
      [halfL, 0.34, -0.86],
      [-halfL, 0.34, 0.86],
      [-halfL, 0.34, -0.86]
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
    });
  }

  // Lights helper
  addCarLights(group, frontX, lightY, spreadZ) {
    const hlGeo = new THREE.BoxGeometry(0.12, 0.18, 0.25);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfff3cc });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(frontX, lightY, spreadZ);
    group.add(hl1);
    const hl2 = hl1.clone();
    hl2.position.set(frontX, lightY, -spreadZ);
    group.add(hl2);

    const blGeo = new THREE.BoxGeometry(0.12, 0.18, 0.22);
    const blMat = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
    const bl1 = new THREE.Mesh(blGeo, blMat);
    bl1.position.set(-frontX, lightY, spreadZ);
    group.add(bl1);
    const bl2 = bl1.clone();
    bl2.position.set(-frontX, lightY, -spreadZ);
    group.add(bl2);

    return { headlights: [hl1, hl2], brakeLights: [blMat] };
  }

  // 4. High-Altitude Passenger Airplane (Sky Traffic)
  initAirplane() {
    const planeGroup = new THREE.Group();
    const planeMat = new THREE.MeshLambertMaterial({ color: 0xededed });

    // Fuselage
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 12, 10), planeMat);
    fuselage.rotation.z = Math.PI / 2;
    planeGroup.add(fuselage);

    // Wings
    const wingMat = new THREE.MeshLambertMaterial({ color: 0xd8d8d8 });
    const wings = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 14), wingMat);
    wings.position.set(0.5, 0, 0);
    planeGroup.add(wings);

    // Tail fin
    const fin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.12), planeMat);
    fin.position.set(-5.0, 1.0, 0);
    fin.rotation.z = -0.4;
    planeGroup.add(fin);

    // Flashing navigation strobes (Red left wing, Green right wing, White tail)
    const strobeGeo = new THREE.SphereGeometry(0.3, 6, 6);
    const redStrobeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const grnStrobeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const sLeft = new THREE.Mesh(strobeGeo, redStrobeMat);
    sLeft.position.set(0.5, 0, -7.0);
    planeGroup.add(sLeft);

    const sRight = new THREE.Mesh(strobeGeo, grnStrobeMat);
    sRight.position.set(0.5, 0, 7.0);
    planeGroup.add(sRight);

    // High cruising altitude near Pico do Jaraguá
    planeGroup.position.set(-140, 115, -170);
    planeGroup.rotation.y = Math.PI / 2;
    this.scene.add(planeGroup);

    this.airplane = {
      group: planeGroup,
      speed: 18.0,
      strobes: [sLeft, sRight]
    };
  }

  // 5. Toggle Empty City Mode
  setEmptyCity(enabled) {
    this.isEmptyCity = enabled;
    this.trafficGroup.visible = !enabled;
    if (this.airplane) {
      this.airplane.group.visible = !enabled;
    }
  }

  toggleEmptyCity() {
    this.setEmptyCity(!this.isEmptyCity);
    return this.isEmptyCity;
  }

  // 6. Update Traffic Loop
  update(delta, time) {
    if (this.isEmptyCity) return;

    // 6.1 Update Traffic Light State Machine
    const tl = this.trafficLight;
    if (tl) {
      tl.timer += delta;
      if (tl.state === 'GREEN' && tl.timer > 8.0) {
        tl.state = 'YELLOW';
        tl.timer = 0;
        tl.grnMat.color.setHex(0x003311);
        tl.yelMat.color.setHex(0xffcc00);
        tl.signalLight.color.setHex(0xffcc00);
      } else if (tl.state === 'YELLOW' && tl.timer > 2.5) {
        tl.state = 'RED';
        tl.timer = 0;
        tl.yelMat.color.setHex(0x443300);
        tl.redMat.color.setHex(0xff1111);
        tl.signalLight.color.setHex(0xff1111);
      } else if (tl.state === 'RED' && tl.timer > 8.0) {
        tl.state = 'GREEN';
        tl.timer = 0;
        tl.redMat.color.setHex(0x440000);
        tl.grnMat.color.setHex(0x00ff44);
        tl.signalLight.color.setHex(0x00ff44);
      }
    }

    // 6.2 Update Vehicles Movement and Stopping Logic
    const isRedOrYellow = tl && (tl.state === 'RED' || tl.state === 'YELLOW');

    this.vehicles.forEach(v => {
      let targetSpeed = this.weather === 'STORM' ? v.speed * 0.55 : v.speed;
      let braking = false;

      // Traffic light check for westbound & bus corridor traffic approaching intersection
      if ((v.lane === 'west' || v.lane === 'bus') && isRedOrYellow) {
        const distToLight = v.x - tl.stopLineX;
        if (distToLight > 0 && distToLight < 16) {
          targetSpeed = 0; // Stop before stop line
          braking = true;
        }
      }

      // Check distance to vehicle ahead in the same lane
      this.vehicles.forEach(other => {
        if (other === v || other.lane !== v.lane) return;
        const diffX = (v.lane === 'west' || v.lane === 'bus') ? (v.x - other.x) : (other.x - v.x);
        const minGap = (v.length ? v.length * 0.8 + 3.0 : 8.5);
        if (diffX > 0 && diffX < minGap) {
          targetSpeed = Math.min(targetSpeed, other.currentSpeed * 0.7);
          braking = true;
        }
      });

      // Smooth acceleration / deceleration
      v.currentSpeed += (targetSpeed - v.currentSpeed) * Math.min(delta * 4.0, 1);

      // Move along road
      if (v.lane === 'west' || v.lane === 'bus') {
        v.x -= v.currentSpeed * delta;
        // Wrap around when reaching far west
        if (v.x < -58) {
          v.x = 56;
        }
      } else {
        v.x += v.currentSpeed * delta;
        // Wrap around when reaching far east
        if (v.x > 58) {
          v.x = -56;
        }
      }

      v.mesh.position.set(v.x, v.y, v.z);
      v.mesh.rotation.y = v.targetAngle;

      // Update brake light glow
      v.brakeLights.forEach(mat => {
        mat.color.setHex(braking ? 0xff2222 : 0x770000);
      });
    });

    // 6.3 Update Airplane Flight and Strobe Lights
    if (this.airplane) {
      this.airplane.group.position.x += this.airplane.speed * delta;
      if (this.airplane.group.position.x > 180) {
        this.airplane.group.position.x = -180;
      }
      const strobeOn = Math.floor(time * 3.0) % 2 === 0;
      this.airplane.strobes.forEach(s => s.visible = strobeOn);
    }
  }
}
