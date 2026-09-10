/**
 * DayCycle: Continuous 24-Hour Solar & Atmospheric Lighting
 * Keyframe interpolation ensuring ASCII and 3D readability 24/7.
 */

export class DayCycle {
  constructor(cityBuilder) {
    this.city = cityBuilder;

    // Keyframes: hour, sunColor, sunIntensity, ambientColor, ambientIntensity, skyColor, streetlights
    this.keyframes = [
      { hour: 5.0,  sunCol: 0x664433, sunInt: 0.15, ambCol: 0x223344, ambInt: 0.28, skyCol: 0x0c1424, lights: true },
      { hour: 6.2,  sunCol: 0xffaa55, sunInt: 0.85, ambCol: 0x556677, ambInt: 0.45, skyCol: 0x5588cc, lights: false },
      { hour: 12.0, sunCol: 0xfffaed, sunInt: 1.25, ambCol: 0xffffff, ambInt: 0.65, skyCol: 0x6bb5ff, lights: false },
      { hour: 17.5, sunCol: 0xff7722, sunInt: 1.05, ambCol: 0xffa873, ambInt: 0.50, skyCol: 0xba4848, lights: false },
      { hour: 19.0, sunCol: 0xaa4422, sunInt: 0.40, ambCol: 0x443355, ambInt: 0.35, skyCol: 0x2b1b3d, lights: true },
      { hour: 23.5, sunCol: 0x223355, sunInt: 0.10, ambCol: 0x223355, ambInt: 0.30, skyCol: 0x060914, lights: true },
      { hour: 29.0, sunCol: 0x664433, sunInt: 0.15, ambCol: 0x223344, ambInt: 0.28, skyCol: 0x0c1424, lights: true } // wraps
    ];
  }

  update(inGameHour) {
    if (!this.city || !this.city.sunLight) return;

    let h = inGameHour % 24.0;
    if (h < 5.0) h += 24.0; // wrap night

    // Find bounding keyframes
    let k1 = this.keyframes[0];
    let k2 = this.keyframes[1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (h >= this.keyframes[i].hour && h <= this.keyframes[i + 1].hour) {
        k1 = this.keyframes[i];
        k2 = this.keyframes[i + 1];
        break;
      }
    }

    const t = (h - k1.hour) / (k2.hour - k1.hour || 1.0);

    // Lerp colors & intensities
    const sunColor = new THREE.Color(k1.sunCol).lerp(new THREE.Color(k2.sunCol), t);
    const ambColor = new THREE.Color(k1.ambCol).lerp(new THREE.Color(k2.ambCol), t);
    const skyColor = new THREE.Color(k1.skyCol).lerp(new THREE.Color(k2.skyCol), t);

    const sunIntensity = k1.sunInt + (k2.sunInt - k1.sunInt) * t;
    const ambIntensity = k1.ambInt + (k2.ambInt - k1.ambInt) * t;

    this.city.sunLight.color.copy(sunColor);
    this.city.sunLight.intensity = sunIntensity;

    this.city.ambientLight.color.copy(ambColor);
    this.city.ambientLight.intensity = Math.max(0.28, ambIntensity); // Enforce night floor for ASCII readability

    if (this.city.skyMesh && this.city.skyMesh.material) {
      this.city.skyMesh.material.color.copy(skyColor);
    }

    // Streetlights on/off
    const lightsOn = (h >= 18.5 || h < 6.0);
    this.city.streetLights.forEach(sl => {
      sl.light.intensity = lightsOn ? 2.2 : 0;
      sl.bulbMat.color.setHex(lightsOn ? 0xffaa22 : 0x443322);
    });
  }
}
