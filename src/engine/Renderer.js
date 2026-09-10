/**
 * Dual Rendering Engine: Real-Time ASCII Rasterizer & Retro 3D Viewport
 * Faithful to "A Walkable ASCII Cyberpunk City in One HTML File"
 */

export class CityRenderer {
  constructor(container) {
    this.container = container;

    // Available render modes
    this.MODES = {
      ASCII_COLOR: 'ASCII_COLOR',         // True color ASCII (favela vibrant)
      ASCII_MATRIX: 'ASCII_MATRIX',       // Matrix green phosphor
      ASCII_AMBER: 'ASCII_AMBER',         // 1980s Amber terminal
      ASCII_CYBERPUNK: 'ASCII_CYBER',     // Neon cyan/magenta
      RETRO_3D: 'RETRO_3D'                // Low-poly textured 3D view
    };

    this.currentMode = this.MODES.ASCII_COLOR;

    // ASCII Ramp: from darkest to brightest
    this.asciiRamp = ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
    this.rampLength = this.asciiRamp.length;

    // Offscreen small 3D target for ASCII downsampling
    this.asciiCols = 160;
    this.asciiRows = 85;

    // Three.js Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 800);

    // 1. WebGL Canvas for 3D rendering
    this.webglCanvas = document.createElement('canvas');
    this.container.appendChild(this.webglCanvas);

    try {
      this.webglRenderer = new THREE.WebGLRenderer({
        canvas: this.webglCanvas,
        antialias: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
    } catch (e) {
      console.warn('Initial WebGLRenderer failed, trying default fallback:', e);
      try {
        this.webglRenderer = new THREE.WebGLRenderer({
          canvas: this.webglCanvas
        });
      } catch (err2) {
        console.warn('WebGL not available in environment (headless/no GPU). Using mock renderer:', err2);
        this.webglRenderer = {
          domElement: this.webglCanvas,
          setSize: () => {},
          setPixelRatio: () => {},
          shadowMap: { enabled: false },
          render: () => {},
          dispose: () => {}
        };
      }
    }

    this.webglRenderer.setSize(window.innerWidth || 800, window.innerHeight || 600);
    this.webglRenderer.setPixelRatio(1);
    this.webglRenderer.shadowMap.enabled = false; // Fast & retro

    // 2. Offscreen sampling canvas for reading pixels fast
    this.sampleCanvas = document.createElement('canvas');
    this.sampleCanvas.width = this.asciiCols;
    this.sampleCanvas.height = this.asciiRows;
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

    // 3. Display Canvas for ASCII presentation
    this.asciiCanvas = document.createElement('canvas');
    this.asciiCtx = this.asciiCanvas.getContext('2d');

    // Font parameters for ASCII grid
    this.charW = 8;
    this.charH = 13;

    this.container.appendChild(this.asciiCanvas);

    this.webglCanvas.style.position = 'absolute';
    this.webglCanvas.style.top = '0';
    this.webglCanvas.style.left = '0';
    this.webglCanvas.style.width = '100%';
    this.webglCanvas.style.height = '100%';
    this.webglCanvas.style.display = 'none';

    this.asciiCanvas.style.position = 'absolute';
    this.asciiCanvas.style.top = '0';
    this.asciiCanvas.style.left = '0';
    this.asciiCanvas.style.width = '100%';
    this.asciiCanvas.style.height = '100%';
    this.asciiCanvas.style.display = 'block';

    this.onWindowResize();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.webglRenderer.setSize(width, height);

    // Compute optimal ASCII column and row count to fill window
    this.charW = 8;
    this.charH = 13;
    this.asciiCols = Math.max(80, Math.floor(width / this.charW));
    this.asciiRows = Math.max(45, Math.floor(height / this.charH));

    this.sampleCanvas.width = this.asciiCols;
    this.sampleCanvas.height = this.asciiRows;

    this.asciiCanvas.width = width;
    this.asciiCanvas.height = height;
    this.asciiCtx.font = `bold ${this.charH - 1}px "Courier New", monospace`;
    this.asciiCtx.textBaseline = 'top';
  }

  setRenderMode(modeName) {
    if (this.MODES[modeName]) {
      this.currentMode = this.MODES[modeName];
    }
    if (this.currentMode === this.MODES.RETRO_3D) {
      this.webglCanvas.style.display = 'block';
      this.asciiCanvas.style.display = 'none';
    } else {
      this.webglCanvas.style.display = 'none';
      this.asciiCanvas.style.display = 'block';
    }
  }

  cycleRenderMode() {
    const modes = Object.values(this.MODES);
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setRenderMode(modes[nextIndex]);
    return modes[nextIndex];
  }

  render() {
    // 1. Render the 3D scene with Three.js
    this.webglRenderer.render(this.scene, this.camera);

    // If in pure 3D mode, the WebGL canvas is directly visible
    if (this.currentMode === this.MODES.RETRO_3D) {
      return;
    }

    // 2. Downsample WebGL output onto sample canvas
    this.sampleCtx.drawImage(
      this.webglCanvas,
      0, 0, this.webglCanvas.width, this.webglCanvas.height,
      0, 0, this.asciiCols, this.asciiRows
    );

    const imgData = this.sampleCtx.getImageData(0, 0, this.asciiCols, this.asciiRows);
    const data = imgData.data;

    // 3. Clear display canvas
    const ctx = this.asciiCtx;
    ctx.fillStyle = '#06070a';
    ctx.fillRect(0, 0, this.asciiCanvas.width, this.asciiCanvas.height);

    const cols = this.asciiCols;
    const rows = this.asciiRows;
    const charW = this.charW;
    const charH = this.charH;

    // Configure mode coloring
    const isColor = this.currentMode === this.MODES.ASCII_COLOR;
    const isMatrix = this.currentMode === this.MODES.ASCII_MATRIX;
    const isAmber = this.currentMode === this.MODES.ASCII_AMBER;
    const isCyber = this.currentMode === this.MODES.ASCII_CYBERPUNK;

    if (isMatrix) ctx.fillStyle = '#00ff66';
    if (isAmber) ctx.fillStyle = '#ffb300';

    let pixelIndex = 0;
    for (let r = 0; r < rows; r++) {
      const posY = r * charH;

      for (let c = 0; c < cols; c++) {
        const red = data[pixelIndex];
        const green = data[pixelIndex + 1];
        const blue = data[pixelIndex + 2];
        pixelIndex += 4;

        // Relative perceptual luminance
        const lum = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
        if (lum < 0.05) continue; // Skip dark pixels for contrast

        // Character selection based on brightness
        const rampIdx = Math.min(this.rampLength - 1, Math.floor(lum * this.rampLength));
        const char = this.asciiRamp[rampIdx];
        const posX = c * charW;

        if (isColor) {
          // Boost saturation slightly for ASCII vibrancy
          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillText(char, posX, posY);
        } else if (isCyber) {
          // Neon Cyan / Magenta duo
          const cyberColor = (c + r) % 2 === 0 ? '#00f0ff' : '#ff0077';
          ctx.fillStyle = cyberColor;
          ctx.fillText(char, posX, posY);
        } else {
          // Matrix or Amber monochrome
          ctx.fillText(char, posX, posY);
        }
      }
    }
  }
}
