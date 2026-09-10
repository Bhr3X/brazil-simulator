/**
 * Dynamic Interactive Physics Props
 * Brazilian street items: soccer ball dente-de-leite, beer cans on boteco tables.
 */

export class GameProps {
  constructor(scene, physics, textures, sound) {
    this.scene = scene;
    this.physics = physics;
    this.textures = textures;
    this.sound = sound;

    this.ballBody = null;
    this.canBodies = [];

    this.initSoccerBall();
    this.initBeerCans();
  }

  // 1. Kickable Soccer Ball ("Bola Dente-de-Leite")
  initSoccerBall() {
    const radius = 0.26;
    const ballGeo = new THREE.SphereGeometry(radius, 16, 12);
    const ballTex = this.textures.createSoccerBallTexture();
    const ballMat = new THREE.MeshLambertMaterial({
      map: ballTex
    });

    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    // Placed on street near the sidewalk curb
    ballMesh.position.set(0.0, 0.4, 14.5);
    this.scene.add(ballMesh);

    this.ballBody = this.physics.addDynamicBody({
      id: 'soccer_ball',
      mesh: ballMesh,
      radius: radius,
      mass: 0.45,
      restitution: 0.72, // Bouncy
      friction: 0.982,
      isKickable: true,
      onKick: (body, force) => {
        if (this.sound) this.sound.playKickBall();
      }
    });
  }

  // 2. Knockable Beer Cans on Sidewalk & Boteco Tables
  initBeerCans() {
    const canGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 10);
    const yellowTex = this.textures.createBeerCanTexture('#ffcc00'); // Skol
    const redTex = this.textures.createBeerCanTexture('#cc1414');    // Brahma

    const canConfigs = [
      { x: 6.5, y: 0.95, z: 36.5, tex: yellowTex }, // Boteco table 1
      { x: 17.5, y: 0.95, z: 36.5, tex: redTex },   // Boteco table 2
      { x: -14.0, y: 0.85, z: 37.5, tex: yellowTex } // Outside adega
    ];

    canConfigs.forEach((cfg, idx) => {
      const canMat = new THREE.MeshLambertMaterial({ map: cfg.tex });
      const canMesh = new THREE.Mesh(canGeo, canMat);
      canMesh.position.set(cfg.x, cfg.y, cfg.z);
      this.scene.add(canMesh);

      const body = this.physics.addDynamicBody({
        id: `beer_can_${idx}`,
        mesh: canMesh,
        radius: 0.1,
        mass: 0.15,
        restitution: 0.25,
        friction: 0.94,
        isKickable: true,
        onKick: () => {
          if (this.sound) this.sound.playCanOpen();
        }
      });
      this.canBodies.push(body);
    });
  }
}
