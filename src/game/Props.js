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
    this.campinhoBallBody = null;
    this.ballBodies = [];
    this.canBodies = [];

    this.initSoccerBalls();
    this.initBeerCans();
  }

  createSoccerBall({ id, x, y, z, kickDescription, geometry, material, radius }) {
    const ballMesh = new THREE.Mesh(geometry, material);
    ballMesh.position.set(x, y, z);
    this.scene.add(ballMesh);

    const body = this.physics.addDynamicBody({
      id,
      mesh: ballMesh,
      radius,
      mass: 0.45,
      restitution: 0.72, // Bouncy
      friction: 0.982,
      isKickable: true,
      onKick: () => {
        if (this.sound) {
          this.sound.playKickBall();
          if (this.sound.newsDesk) {
            this.sound.newsDesk.recordAction('KICK', kickDescription);
          }
        }
      }
    });
    this.ballBodies.push(body);
    return body;
  }

  initSoccerBalls() {
    const radius = 0.26;
    const geometry = new THREE.SphereGeometry(radius, 16, 12);
    const material = new THREE.MeshLambertMaterial({
      map: this.textures.createSoccerBallTexture()
    });

    this.ballBody = this.createSoccerBall({
      id: 'soccer_ball',
      x: 0.0,
      y: 0.4,
      z: 14.5,
      kickDescription: 'Chutou a bola dente-de-leite na calçada',
      geometry,
      material,
      radius
    });
    this.campinhoBallBody = this.createSoccerBall({
      id: 'soccer_ball_campinho',
      x: 0,
      y: 9.8,
      z: -99,
      kickDescription: 'Chutou a bola no campinho da favela',
      geometry,
      material,
      radius
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
          if (this.sound) {
            this.sound.playCanOpen();
            if (this.sound.newsDesk) {
              this.sound.newsDesk.recordAction('KICK', 'Derrubou e chutou latinha de cerveja da mesa');
            }
          }
        }
      });
      this.canBodies.push(body);
    });
  }
}
