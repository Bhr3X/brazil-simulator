/**
 * Dual Rendering Engine: Real-Time ASCII Rasterizer & Retro 3D Viewport
 * Faithful to "A Walkable ASCII Cyberpunk City in One HTML File"
 * Enhanced with Real-Time Density, Brightness, Contrast, Gamma, Edge Detection & Character Sets
 */

export const ASCII_RAMPS = {
  DETAILED: ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  BLOCKS: ' ░▒▓█',
  CONTRAST: ' .:-=+*#%@',
  MINIMAL: ' .:*#@',
  MATRIX: ' 0123456789ABCDEF!#*+=-',
  SHARPLINE: ' .·-—~=+*#%@'
};

export const DEFAULT_VISUAL_PARAMS = {
  density: 1.0,           // 0.6 to 2.4 (scales character grid & font size)
  brightness: 1.25,       // 0.5 to 2.5 (luminance multiplier)
  contrast: 1.2,          // 0.5 to 2.5 (contrast expansion)
  gamma: 1.25,            // 0.6 to 2.2 (shadow lift)
  saturation: 1.25,       // 0.0 to 2.5 (color vibrancy)
  edgeEnhance: true,      // 2D spatial gradient edge outline detection
  edgeThreshold: 0.10,    // sensitivity
  edgeStrength: 1.2,      // outline brightness boost
  rampType: 'DETAILED',   // key in ASCII_RAMPS
  scanlines: false        // CRT scanlines
};

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

    // Visual Parameters
    this.params = { ...DEFAULT_VISUAL_PARAMS };
    this.loadSavedParams();

    // ASCII Ramp: from darkest to brightest
    this.asciiRamp = ASCII_RAMPS[this.params.rampType] || ASCII_RAMPS.DETAILED;
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

    this.updateGridSize();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  loadSavedParams() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('brazil_sim_visual_params');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(this.params, parsed);
        }
      }
    } catch (e) {}
  }

  saveParams() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('brazil_sim_visual_params', JSON.stringify(this.params));
      }
    } catch (e) {}
  }

  updateGridSize() {
    const width = window.innerWidth || 800;
    const height = window.innerHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (this.webglRenderer && this.webglRenderer.setSize) {
      this.webglRenderer.setSize(width, height);
    }

    // Density factor: scales from 0.6x (chunky retro) to 2.4x (ultra-sharp micro-ASCII)
    const densityFactor = Math.max(0.6, Math.min(2.4, this.params.density || 1.0));
    this.charW = Math.max(3, Math.round(8 / densityFactor));
    this.charH = Math.max(5, Math.round(13 / densityFactor));

    this.asciiCols = Math.max(50, Math.floor(width / this.charW));
    this.asciiRows = Math.max(30, Math.floor(height / this.charH));

    this.sampleCanvas.width = this.asciiCols;
    this.sampleCanvas.height = this.asciiRows;

    this.asciiCanvas.width = width;
    this.asciiCanvas.height = height;

    const fontSize = Math.max(6, this.charH - 1);
    this.asciiCtx.font = `bold ${fontSize}px "Courier New", monospace`;
    this.asciiCtx.textBaseline = 'top';
  }

  onWindowResize() {
    this.updateGridSize();
  }

  setVisualParams(newParams = {}) {
    const oldDensity = this.params.density;
    Object.assign(this.params, newParams);

    if (newParams.rampType && ASCII_RAMPS[newParams.rampType]) {
      this.asciiRamp = ASCII_RAMPS[newParams.rampType];
      this.rampLength = this.asciiRamp.length;
    }

    if (newParams.density !== undefined && newParams.density !== oldDensity) {
      this.updateGridSize();
    }

    this.saveParams();
  }

  resetVisualParams() {
    this.setVisualParams({ ...DEFAULT_VISUAL_PARAMS });
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
    if (this.webglRenderer && this.webglRenderer.render) {
      this.webglRenderer.render(this.scene, this.camera);
    }

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

    // Visual Parameters
    const brightness = this.params.brightness;
    const contrast = this.params.contrast;
    const gamma = this.params.gamma;
    const saturation = this.params.saturation;
    const edgeEnhance = this.params.edgeEnhance;
    const edgeThreshold = this.params.edgeThreshold;
    const edgeStrength = this.params.edgeStrength;
    const ramp = this.asciiRamp;
    const rampLen = this.rampLength;

    // Configure mode coloring
    const isColor = this.currentMode === this.MODES.ASCII_COLOR;
    const isMatrix = this.currentMode === this.MODES.ASCII_MATRIX;
    const isAmber = this.currentMode === this.MODES.ASCII_AMBER;
    const isCyber = this.currentMode === this.MODES.ASCII_CYBERPUNK;

    if (isMatrix) ctx.fillStyle = '#00ff66';
    if (isAmber) ctx.fillStyle = '#ffb300';

    for (let r = 0; r < rows; r++) {
      const posY = r * charH;
      const rowOffset = r * cols * 4;

      for (let c = 0; c < cols; c++) {
        const pixelIndex = rowOffset + c * 4;
        let red = data[pixelIndex];
        let green = data[pixelIndex + 1];
        let blue = data[pixelIndex + 2];

        // 1. Raw relative perceptual luminance
        let lum = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;

        // 2. Spatial gradient edge enhancement (detect silhouette contours)
        if (edgeEnhance && c < cols - 1 && r < rows - 1) {
          const lumRight = (data[pixelIndex + 4] * 0.299 + data[pixelIndex + 5] * 0.587 + data[pixelIndex + 6] * 0.114) / 255;
          const lumDown = (data[pixelIndex + cols * 4] * 0.299 + data[pixelIndex + cols * 4 + 1] * 0.587 + data[pixelIndex + cols * 4 + 2] * 0.114) / 255;
          const delta = Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
          if (delta > edgeThreshold) {
            lum = Math.min(1.0, lum + delta * edgeStrength);
          }
        }

        // 3. Dynamic contrast expansion around 0.5 midpoint
        if (contrast !== 1.0) {
          lum = (lum - 0.5) * contrast + 0.5;
          lum = Math.max(0, Math.min(1, lum));
        }

        // 4. Brightness scaling
        if (brightness !== 1.0) {
          lum = lum * brightness;
          lum = Math.max(0, Math.min(1, lum));
        }

        // 5. Non-linear gamma / shadow lift
        if (gamma !== 1.0 && lum > 0.001) {
          lum = Math.pow(lum, 1.0 / gamma);
          lum = Math.max(0, Math.min(1, lum));
        }

        // Skip dark floor pixels for contrast and speed
        if (lum < 0.035) continue;

        // 6. Character selection from active ramp
        const rampIdx = Math.min(rampLen - 1, Math.floor(lum * rampLen));
        const char = ramp[rampIdx];
        const posX = c * charW;

        if (isColor) {
          // Saturation and brightness adjustments on RGB
          if (saturation !== 1.0) {
            const gray = red * 0.299 + green * 0.587 + blue * 0.114;
            red = Math.min(255, Math.max(0, Math.round(gray + (red - gray) * saturation)));
            green = Math.min(255, Math.max(0, Math.round(gray + (green - gray) * saturation)));
            blue = Math.min(255, Math.max(0, Math.round(gray + (blue - gray) * saturation)));
          }
          if (brightness !== 1.0) {
            red = Math.min(255, Math.round(red * brightness));
            green = Math.min(255, Math.round(green * brightness));
            blue = Math.min(255, Math.round(blue * brightness));
          }
          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillText(char, posX, posY);
        } else if (isCyber) {
          const cyberColor = (c + r) % 2 === 0 ? '#00f0ff' : '#ff0077';
          ctx.fillStyle = cyberColor;
          ctx.fillText(char, posX, posY);
        } else {
          // Matrix or Amber monochrome
          ctx.fillText(char, posX, posY);
        }
      }
    }

    // 7. Optional CRT Scanlines overlay
    if (this.params.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < this.asciiCanvas.height; y += 3) {
        ctx.fillRect(0, y, this.asciiCanvas.width, 1);
      }
    }
  }
}
