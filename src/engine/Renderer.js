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

export const COLOR_PALETTES = {
  DEFAULT: 'DEFAULT',
  SEPIA: 'SEPIA',
  GAMEBOY: 'GAMEBOY',
  VAPORWAVE: 'VAPORWAVE',
  CYBERPUNK: 'CYBERPUNK',
  NOIR: 'NOIR'
};

export const DEFAULT_VISUAL_PARAMS = {
  density: 1.0,           // 0.6 to 2.4 (scales character grid & font size)
  brightness: 1.0,        // 0.5 to 2.5 (luminance multiplier)
  contrast: 1.0,          // 0.5 to 2.5 (contrast expansion)
  gamma: 1.0,             // 0.6 to 2.2 (shadow lift)
  saturation: 1.0,        // 0.0 to 2.5 (color vibrancy)
  depthScale: 1.0,        // 0.0 to 2.0 (spatial perspective glyph scaling)
  fov: 70,                // 50 to 110 (camera field of view in degrees)
  bloom: 0.0,             // 0.0 to 2.0 (glow intensity on bright highlights)
  bloomThreshold: 0.70,   // threshold above which highlights glow
  fogDensity: 0.8,        // 0.0 to 2.5 (atmospheric fog density multiplier)
  colorPalette: 'DEFAULT', // key in COLOR_PALETTES
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
      ASCII_CYBER: 'ASCII_CYBER',         // Neon cyan/magenta
      ASCII_CYBERPUNK: 'ASCII_CYBER',     // Alias for backwards compatibility
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
    this.camera = new THREE.PerspectiveCamera(this.params.fov || 70, window.innerWidth / window.innerHeight, 0.1, 800);
    this.updateFog();

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
          if (parsed && typeof parsed === 'object') {
            if (typeof parsed.density === 'number' && !isNaN(parsed.density)) {
              this.params.density = Math.max(0.6, Math.min(2.4, parsed.density));
            }
            if (typeof parsed.brightness === 'number' && !isNaN(parsed.brightness)) {
              this.params.brightness = Math.max(0.5, Math.min(2.5, parsed.brightness));
            }
            if (typeof parsed.contrast === 'number' && !isNaN(parsed.contrast)) {
              this.params.contrast = Math.max(0.5, Math.min(2.5, parsed.contrast));
            }
            if (typeof parsed.gamma === 'number' && !isNaN(parsed.gamma)) {
              this.params.gamma = Math.max(0.6, Math.min(2.2, parsed.gamma));
            }
            if (typeof parsed.saturation === 'number' && !isNaN(parsed.saturation)) {
              this.params.saturation = Math.max(0.0, Math.min(2.5, parsed.saturation));
            }
            if (typeof parsed.depthScale === 'number' && !isNaN(parsed.depthScale)) {
              this.params.depthScale = Math.max(0.0, Math.min(2.0, parsed.depthScale));
            }
            if (typeof parsed.edgeEnhance === 'boolean') {
              this.params.edgeEnhance = parsed.edgeEnhance;
            }
            if (typeof parsed.edgeThreshold === 'number' && !isNaN(parsed.edgeThreshold)) {
              this.params.edgeThreshold = Math.max(0.02, Math.min(0.5, parsed.edgeThreshold));
            }
            if (typeof parsed.edgeStrength === 'number' && !isNaN(parsed.edgeStrength)) {
              this.params.edgeStrength = Math.max(0.1, Math.min(3.0, parsed.edgeStrength));
            }
            if (parsed.rampType && ASCII_RAMPS[parsed.rampType]) {
              this.params.rampType = parsed.rampType;
            }
            if (typeof parsed.scanlines === 'boolean') {
              this.params.scanlines = parsed.scanlines;
            }
            if (typeof parsed.fov === 'number' && !isNaN(parsed.fov)) {
              this.params.fov = Math.max(50, Math.min(110, parsed.fov));
            }
            if (typeof parsed.bloom === 'number' && !isNaN(parsed.bloom)) {
              this.params.bloom = Math.max(0.0, Math.min(2.0, parsed.bloom));
            }
            if (typeof parsed.fogDensity === 'number' && !isNaN(parsed.fogDensity)) {
              this.params.fogDensity = Math.max(0.0, Math.min(2.5, parsed.fogDensity));
            }
            if (parsed.colorPalette && COLOR_PALETTES[parsed.colorPalette]) {
              this.params.colorPalette = parsed.colorPalette;
            }
          }
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

    if (this.camera) {
      this.camera.fov = this.params.fov || 70;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

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
    this.baseFontSize = fontSize;
    this.updateDepthFontTiers();
    this.asciiCtx.font = `bold ${fontSize}px "Courier New", monospace`;
    this.asciiCtx.textBaseline = 'top';
  }

  updateDepthFontTiers() {
    const baseSize = this.baseFontSize || Math.max(6, this.charH - 1);
    const depthFactor = typeof this.params.depthScale === 'number' ? this.params.depthScale : 1.0;

    // 6-tier quantization: Tier 0 (<8m) down to Tier 5 (>250m)
    const rawScales = [1.30, 1.10, 0.90, 0.70, 0.50, 0.35];
    this.depthFontTiers = rawScales.map((baseScale) => {
      const effectiveScale = Math.max(0.2, 1.0 + (baseScale - 1.0) * depthFactor);
      const sizePx = Math.max(3, Math.round(baseSize * effectiveScale));
      return {
        scale: effectiveScale,
        font: `bold ${sizePx}px "Courier New", monospace`,
        sizePx
      };
    });
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

    if (newParams.fov !== undefined && this.camera) {
      this.camera.fov = Math.max(50, Math.min(110, this.params.fov));
      this.camera.updateProjectionMatrix();
    }

    if (newParams.fogDensity !== undefined) {
      this.updateFog();
    }

    if (newParams.density !== undefined && newParams.density !== oldDensity) {
      this.updateGridSize();
    } else if (newParams.depthScale !== undefined) {
      this.updateDepthFontTiers();
    }

    this.saveParams();
  }

  updateFog(ambientOrSkyColor) {
    if (!this.scene) return;
    const densityFactor = typeof this.params.fogDensity === 'number' ? this.params.fogDensity : 0.8;
    if (densityFactor <= 0.01) {
      this.scene.fog = null;
    } else {
      const expDensity = 0.0035 * densityFactor;
      if (!this.scene.fog) {
        const initialCol = ambientOrSkyColor || 0x0c1424;
        this.scene.fog = new THREE.FogExp2(initialCol, expDensity);
      } else {
        this.scene.fog.density = expDensity;
        if (ambientOrSkyColor) {
          this.scene.fog.color.copy(ambientOrSkyColor);
        }
      }
    }
  }

  applyColorPalette(red, green, blue, lum) {
    switch (this.params.colorPalette) {
      case 'SEPIA': {
        const gray = red * 0.299 + green * 0.587 + blue * 0.114;
        return [
          Math.min(255, Math.round(gray * 1.18)),
          Math.min(255, Math.round(gray * 0.95)),
          Math.min(255, Math.round(gray * 0.70))
        ];
      }
      case 'GAMEBOY': {
        if (lum < 0.25) return [15, 56, 15];
        if (lum < 0.50) return [48, 98, 48];
        if (lum < 0.75) return [139, 172, 15];
        return [155, 188, 15];
      }
      case 'VAPORWAVE': {
        const rVal = Math.min(255, Math.round(lum * 255));
        const gVal = Math.min(255, Math.round((1.0 - lum) * 160 + lum * 40));
        const bVal = Math.min(255, Math.round((1.0 - lum) * 120 + 135));
        return [rVal, gVal, bVal];
      }
      case 'CYBERPUNK': {
        if (lum < 0.45) {
          const t = lum / 0.45;
          return [Math.round(15 * t), Math.round(90 * t), Math.min(255, Math.round(180 * t + 75))];
        } else {
          const t = (lum - 0.45) / 0.55;
          return [Math.min(255, Math.round(255 * t)), Math.min(255, Math.round(225 * t)), Math.round(40 * (1 - t))];
        }
      }
      case 'NOIR': {
        const bw = Math.min(255, Math.round(lum * 255));
        return [bw, bw, bw];
      }
      default:
        return [red, green, blue];
    }
  }

  resetVisualParams() {
    this.setVisualParams({ ...DEFAULT_VISUAL_PARAMS });
  }

  setRenderMode(modeName) {
    if (this.MODES[modeName]) {
      this.currentMode = this.MODES[modeName];
    } else if (Object.values(this.MODES).includes(modeName)) {
      this.currentMode = modeName;
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
    const modes = ['ASCII_COLOR', 'ASCII_MATRIX', 'ASCII_AMBER', 'ASCII_CYBER', 'RETRO_3D'];
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
    const isCyber = this.currentMode === this.MODES.ASCII_CYBER || this.currentMode === this.MODES.ASCII_CYBERPUNK;

    if (isMatrix) ctx.fillStyle = '#00ff66';
    if (isAmber) ctx.fillStyle = '#ffb300';

    const depthScale = typeof this.params.depthScale === 'number' ? this.params.depthScale : 1.0;
    const pitch = (this.camera && this.camera.rotation) ? this.camera.rotation.x : 0;
    const fov = (this.camera && this.camera.fov) ? (this.camera.fov * Math.PI / 180) : (70 * Math.PI / 180);
    const camY = (this.camera && this.camera.position) ? this.camera.position.y : 1.8;

    let currentFontTier = -1;

    const bloom = typeof this.params.bloom === 'number' ? this.params.bloom : 0.0;
    const bloomThreshold = typeof this.params.bloomThreshold === 'number' ? this.params.bloomThreshold : 0.70;
    let isGlowing = false;

    for (let r = 0; r < rows; r++) {
      let rowTier = 2; // Default mid-distance
      if (depthScale > 0.02) {
        const angleY = ((r + 0.5) / rows - 0.5) * fov;
        const rayAngleDown = -(pitch + angleY);
        if (rayAngleDown > 0.03) {
          const dist = Math.max(1.0, Math.min(300.0, camY / Math.sin(rayAngleDown)));
          if (dist < 7.0) rowTier = 0;
          else if (dist < 18.0) rowTier = 1;
          else if (dist < 42.0) rowTier = 2;
          else if (dist < 90.0) rowTier = 3;
          else if (dist < 180.0) rowTier = 4;
          else rowTier = 5;
        } else {
          // Horizon & sky/distant mountains
          rowTier = 5;
        }
      }

      if (rowTier !== currentFontTier && this.depthFontTiers && this.depthFontTiers[rowTier]) {
        ctx.font = this.depthFontTiers[rowTier].font;
        currentFontTier = rowTier;
      }

      const tierInfo = (this.depthFontTiers && this.depthFontTiers[rowTier]) ? this.depthFontTiers[rowTier] : { scale: 1.0 };
      const scale = tierInfo.scale;
      const glyphW = charW * scale;
      const glyphH = charH * scale;
      const posY = r * charH + (charH - glyphH) * 0.5;
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

        // 3. Non-linear gamma / shadow lift FIRST (lifts shadows before contrast/brightness)
        if (gamma !== 1.0 && lum > 0.0001) {
          lum = Math.pow(lum, 1.0 / gamma);
        }

        // 4. Brightness scaling SECOND
        if (brightness !== 1.0) {
          lum = lum * brightness;
        }

        // 5. Soft S-curve contrast expansion THIRD (centered at 0.35 to preserve dark ambient floor)
        if (contrast !== 1.0) {
          lum = lum < 0.35
            ? 0.35 * Math.pow(lum / 0.35, contrast)
            : 1.0 - 0.65 * Math.pow(Math.max(0, 1.0 - lum) / 0.65, contrast);
        }
        lum = Math.max(0, Math.min(1, lum));

        // Skip dark floor pixels for contrast and speed (0.015 protects night ambient floor ~0.057)
        if (lum < 0.015) continue;

        // 6. Character selection from active ramp
        const rampIdx = Math.min(rampLen - 1, Math.floor(lum * rampLen));
        const char = ramp[rampIdx];
        const posX = c * charW + (charW - glyphW) * 0.5;

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

          // Apply stylized color palette if active
          if (this.params.colorPalette && this.params.colorPalette !== 'DEFAULT') {
            [red, green, blue] = this.applyColorPalette(red, green, blue, lum);
          }

          // Bloom highlight glow
          if (bloom > 0.05 && lum >= bloomThreshold) {
            ctx.shadowBlur = Math.round(bloom * 8);
            ctx.shadowColor = `rgb(${red}, ${green}, ${blue})`;
            isGlowing = true;
          } else if (isGlowing) {
            ctx.shadowBlur = 0;
            isGlowing = false;
          }

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillText(char, posX, posY);
        } else if (isCyber) {
          const cyberColor = (c + r) % 2 === 0 ? '#00f0ff' : '#ff0077';
          if (bloom > 0.05 && lum >= bloomThreshold) {
            ctx.shadowBlur = Math.round(bloom * 8);
            ctx.shadowColor = cyberColor;
            isGlowing = true;
          } else if (isGlowing) {
            ctx.shadowBlur = 0;
            isGlowing = false;
          }
          ctx.fillStyle = cyberColor;
          ctx.fillText(char, posX, posY);
        } else {
          // Matrix or Amber monochrome
          if (bloom > 0.05 && lum >= bloomThreshold) {
            ctx.shadowBlur = Math.round(bloom * 8);
            ctx.shadowColor = isMatrix ? '#00ff66' : '#ffb300';
            isGlowing = true;
          } else if (isGlowing) {
            ctx.shadowBlur = 0;
            isGlowing = false;
          }
          ctx.fillText(char, posX, posY);
        }
      }
    }

    if (isGlowing) {
      ctx.shadowBlur = 0;
      isGlowing = false;
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
