/**
 * Procedural Texture Generator for Brazilian Favela / Pirituba Environment
 * Generates all textures in-memory via HTML5 Canvas without any external downloads.
 */

export class TextureGenerator {
  constructor() {
    this.cache = {};
  }

  // Helper to create a canvas
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }

  // Helper to convert canvas to THREE.CanvasTexture
  toThreeTexture(canvas, repeatX = 1, repeatY = 1) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.magFilter = THREE.NearestFilter; // PS1 / Retro crisp look
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  // 1. Brazilian Exposed Red Ceramic Brick (Tijolo Baiano 8-furos)
  createTijoloBaiano(repeatX = 2, repeatY = 2) {
    const key = `tijolo_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    const brickW = 64;
    const brickH = 32;
    const mortarH = 5;
    const mortarW = 4;

    // Mortar background (gray cement)
    ctx.fillStyle = '#6b665f';
    ctx.fillRect(0, 0, 256, 256);

    // Add noise to mortar
    for (let i = 0; i < 4000; i++) {
      const nx = Math.random() * 256;
      const ny = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? '#807a72' : '#524e48';
      ctx.fillRect(nx, ny, 1.5, 1.5);
    }

    // Draw clay bricks
    const rows = 256 / brickH;
    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2 === 0) ? 0 : brickW / 2;
      for (let x = -brickW; x < 256 + brickW; x += brickW) {
        const bx = x + offsetX;
        const by = r * brickH;

        // Base clay color variation (burnt orange, terracotta, red brick)
        const hueVariation = Math.floor(Math.random() * 20 - 10);
        const red = 185 + hueVariation;
        const green = 65 + Math.floor(Math.random() * 15);
        const blue = 35 + Math.floor(Math.random() * 10);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(bx + mortarW / 2, by + mortarH / 2, brickW - mortarW, brickH - mortarH);

        // Brick surface clay texture & grooves
        for (let j = 0; j < 30; j++) {
          ctx.fillStyle = Math.random() > 0.5 ? `rgba(220,90,50,0.3)` : `rgba(120,35,15,0.4)`;
          ctx.fillRect(
            bx + mortarW / 2 + Math.random() * (brickW - mortarW - 2),
            by + mortarH / 2 + Math.random() * (brickH - mortarH - 2),
            Math.random() * 6 + 1,
            Math.random() * 2 + 1
          );
        }

        // Horizontal grooved lines typical of hollow ceramic bricks
        ctx.strokeStyle = `rgba(100, 25, 10, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + mortarW, by + brickH * 0.35);
        ctx.lineTo(bx + brickW - mortarW, by + brickH * 0.35);
        ctx.moveTo(bx + mortarW, by + brickH * 0.65);
        ctx.lineTo(bx + brickW - mortarW, by + brickH * 0.65);
        ctx.stroke();

        // Brick edge shadow & highlight
        ctx.strokeStyle = `rgba(240, 120, 80, 0.4)`;
        ctx.strokeRect(bx + mortarW / 2, by + mortarH / 2, brickW - mortarW - 1, brickH - mortarH - 1);
      }
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 2. Weathered Concrete Plaster / Reboco
  createReboco(colorHex = '#a39c94', repeatX = 2, repeatY = 2) {
    const key = `reboco_${colorHex}_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 256, 256);

    // Concrete grain & grit
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const shade = (Math.random() - 0.5) * 40;
      ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0}, ${shade > 0 ? 255 : 0}, ${shade > 0 ? 255 : 0}, ${Math.abs(shade) / 255})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Weathering stains and damp drips (escorrido de chuva)
    for (let i = 0; i < 8; i++) {
      const sx = Math.random() * 240 + 10;
      const length = Math.random() * 120 + 40;
      const grad = ctx.createLinearGradient(sx, 0, sx, length);
      grad.addColorStop(0, 'rgba(40, 40, 35, 0.4)');
      grad.addColorStop(1, 'rgba(40, 40, 35, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sx - 3, 0, 6, length);
    }

    // Occasional crack in plaster
    ctx.strokeStyle = 'rgba(50, 45, 40, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let cx = Math.random() * 200 + 20;
    let cy = Math.random() * 200 + 20;
    ctx.moveTo(cx, cy);
    for (let seg = 0; seg < 6; seg++) {
      cx += (Math.random() - 0.5) * 30;
      cy += Math.random() * 25 + 5;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 3. Painted Favela House Wall (Turquoise, Yellow, Pink, Light Blue)
  createPaintedWall(baseColor, repeatX = 2, repeatY = 2) {
    const key = `painted_${baseColor}_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Weathered wash
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(x, y, 3, 3);
    }

    // Exposed brick peeling patches (tinta descascada)
    const patchX = Math.random() * 160 + 20;
    const patchY = Math.random() * 160 + 20;
    const patchW = 50 + Math.random() * 40;
    const patchH = 30 + Math.random() * 30;
    ctx.fillStyle = '#b84e2a';
    ctx.fillRect(patchX, patchY, patchW, patchH);
    ctx.strokeStyle = '#6e2b14';
    ctx.lineWidth = 1;
    ctx.strokeRect(patchX, patchY, patchW, patchH);

    // Peeling outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeRect(patchX - 1, patchY - 1, patchW + 2, patchH + 2);

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 4. Iconic São Paulo Sidewalk (Calçada Paulista - Mapa de SP geometric stones)
  createCalcadaPaulista(repeatX = 4, repeatY = 4) {
    const key = `calcada_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Base dark Portuguese stone
    ctx.fillStyle = '#1e1f21';
    ctx.fillRect(0, 0, 256, 256);

    // White stone geometric pattern inspired by the famous São Paulo State silhouette
    ctx.fillStyle = '#e5e3dc';

    // Tile 1: Top-left polygon
    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.lineTo(110, 20);
    ctx.lineTo(125, 70);
    ctx.lineTo(95, 120);
    ctx.lineTo(40, 110);
    ctx.closePath();
    ctx.fill();

    // Tile 2: Center-right polygon
    ctx.beginPath();
    ctx.moveTo(145, 40);
    ctx.lineTo(235, 30);
    ctx.lineTo(240, 110);
    ctx.lineTo(190, 140);
    ctx.lineTo(140, 100);
    ctx.closePath();
    ctx.fill();

    // Tile 3: Bottom polygon
    ctx.beginPath();
    ctx.moveTo(60, 150);
    ctx.lineTo(160, 140);
    ctx.lineTo(210, 210);
    ctx.lineTo(110, 240);
    ctx.lineTo(40, 210);
    ctx.closePath();
    ctx.fill();

    // Add individual stone mosaic texture (pedras portuguesas)
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
      ctx.fillRect(x, y, 2.5, 2.5);
    }

    // Mosaic grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let g = 0; g < 256; g += 8) {
      ctx.beginPath();
      ctx.moveTo(0, g + (Math.random() - 0.5) * 3);
      ctx.lineTo(256, g + (Math.random() - 0.5) * 3);
      ctx.stroke();
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 5. Suburban Asphalt with White Curb & Manhole
  createAsfalto(repeatX = 1, repeatY = 4) {
    const key = `asfalto_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Dark asphalt
    ctx.fillStyle = '#222326';
    ctx.fillRect(0, 0, 256, 256);

    // Grain & gravel
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const bright = Math.random() * 60 + 20;
      ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Yellow dashed center road line
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(124, 20, 8, 90);
    ctx.fillRect(124, 150, 8, 90);

    // Pothole / Remendo de asfalto
    ctx.fillStyle = '#151517';
    ctx.beginPath();
    ctx.ellipse(60, 80, 25, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#33353a';
    ctx.stroke();

    // SABESP Manhole cover (tampa de bueiro)
    ctx.fillStyle = '#3a3a40';
    ctx.beginPath();
    ctx.arc(190, 180, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555560';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#222226';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('SABESP', 174, 183);

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 6. Corrugated Roof (Telha Ondulada de Fibrocimento / Zinco)
  createTelhaOndulada(repeatX = 4, repeatY = 4) {
    const key = `telha_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    ctx.fillStyle = '#7a7d80';
    ctx.fillRect(0, 0, 128, 128);

    // Vertical corrugation waves
    const waveW = 16;
    for (let x = 0; x < 128; x += waveW) {
      const grad = ctx.createLinearGradient(x, 0, x + waveW, 0);
      grad.addColorStop(0, 'rgba(40,40,45,0.6)');
      grad.addColorStop(0.5, 'rgba(230,235,240,0.5)');
      grad.addColorStop(1, 'rgba(40,40,45,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, waveW, 128);
    }

    // Rust and moss patches (ferrugem e limo verde)
    ctx.fillStyle = 'rgba(140, 60, 20, 0.4)';
    ctx.fillRect(20, 40, 30, 50);
    ctx.fillStyle = 'rgba(60, 100, 30, 0.35)';
    ctx.fillRect(70, 20, 40, 40);

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 6.5 Colonial Terracotta Curved Clay Roof Tiles (Telhas Coloniais / Canal)
  createTelhasColoniais(repeatX = 4, repeatY = 4) {
    const key = `telha_colonial_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    // Warm terracotta ceramic base
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 128, 128);

    // Curved clay tile overlapping ridges
    const tileW = 16;
    for (let x = 0; x < 128; x += tileW) {
      const grad = ctx.createLinearGradient(x, 0, x + tileW, 0);
      grad.addColorStop(0, 'rgba(69, 26, 3, 0.7)');
      grad.addColorStop(0.4, 'rgba(217, 119, 6, 0.6)');
      grad.addColorStop(0.8, 'rgba(251, 191, 36, 0.3)');
      grad.addColorStop(1, 'rgba(69, 26, 3, 0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, tileW, 128);
    }

    // Horizontal overlap shadow lines every 24px
    ctx.fillStyle = 'rgba(40, 15, 5, 0.55)';
    for (let y = 24; y < 128; y += 24) {
      ctx.fillRect(0, y, 128, 4);
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 7. Blue Plastic Water Tank (Caixa D'Água 1000L - Fortlev/Tigre style)
  createCaixaDagua() {
    const key = `caixa_dagua`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Vivid industrial Brazilian polyethylene blue
    ctx.fillStyle = '#0a64bd';
    ctx.fillRect(0, 0, 256, 128);

    // Ribbed reinforcement rings
    ctx.strokeStyle = '#053d75';
    ctx.lineWidth = 4;
    for (let y = 20; y < 128; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();

      // Top highlight of rib
      ctx.strokeStyle = '#3892ed';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y - 2);
      ctx.lineTo(256, y - 2);
      ctx.stroke();
      ctx.strokeStyle = '#053d75';
      ctx.lineWidth = 4;
    }

    // Manufacturer logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FORTLEV', 128, 55);
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('1000 L', 128, 72);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 8. Rollup Steel Security Door (Porta de Aço de Comércio)
  createPortaAco(colorHex = '#2f5b88') {
    const key = `porta_aco_${colorHex}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 128, 256);

    // Horizontal corrugated slats
    for (let y = 0; y < 256; y += 8) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, y, 128, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, y + 3, 128, 2);
    }

    // Central padlock handle
    ctx.fillStyle = '#111';
    ctx.fillRect(56, 235, 16, 12);
    ctx.fillStyle = '#e6b800'; // brass padlock
    ctx.fillRect(60, 240, 8, 8);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 9. Storefront Facade: "ADEGA & MERCEARIA DO ZÉ"
  createAdegaSign() {
    const key = `adega_sign`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Yellow and Red banner typical of Brazilian adegas
    ctx.fillStyle = '#f0c200';
    ctx.fillRect(0, 0, 256, 128);

    // Red header band
    ctx.fillStyle = '#d12417';
    ctx.fillRect(0, 0, 256, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADEGA DO ZÉ', 128, 28);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('CERVEJA & GELO 24H', 128, 65);

    ctx.fillStyle = '#c72316';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ACEITAMOS PIX', 128, 88);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('DISK ENTREGA: (11) 98765-4321', 128, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 10. Storefront Facade: "BAR DO TIÃO - PASTEL & SINUCA"
  createBarSign() {
    const key = `bar_sign`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Green and white boteco aesthetic
    ctx.fillStyle = '#0b6623';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 8, 240, 112);

    ctx.fillStyle = '#0b6623';
    ctx.font = 'bold 22px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAR DO TIÃO', 128, 42);

    ctx.fillStyle = '#c91414';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CALDO DE CANA & PASTEL', 128, 70);

    ctx.fillStyle = '#222';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SINUCA • ESPETINHO • TIRA-GOSTO', 128, 98);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 11. São Paulo Pixação Graffiti Wall
  createPixacaoWall(baseColor = '#d9d3c7') {
    const key = `pixacao_${baseColor}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Weathering
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    // Black Sharp Angular São Paulo Pixação Tags
    ctx.strokeStyle = '#0f0f12';
    ctx.lineWidth = 3;
    ctx.lineCap = 'square';

    // Tag 1: "PIRITUBA Z/O"
    this.drawPixacaoWord(ctx, 'PIRITUBA', 15, 60, 22, 50);
    this.drawPixacaoWord(ctx, 'Z/OESTE', 25, 120, 20, 45);

    // Tag 2: "PAZ" and "É NOIS"
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 2.5;
    this.drawPixacaoWord(ctx, 'PAZ', 170, 70, 18, 40);
    this.drawPixacaoWord(ctx, 'E NOIS', 150, 140, 16, 35);

    // Colorful spray paint graffiti stencil
    ctx.fillStyle = 'rgba(230, 40, 80, 0.85)';
    ctx.font = 'bold 24px Impact, sans-serif';
    ctx.fillText('RESPEITA A', 20, 195);
    ctx.fillStyle = 'rgba(30, 180, 220, 0.9)';
    ctx.fillText('QUEBRADA!', 30, 225);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Draw authentic tall, sharp vertical pixação letters
  drawPixacaoWord(ctx, text, startX, startY, charW, charH) {
    let curX = startX;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.beginPath();
      switch (char) {
        case 'P':
          ctx.moveTo(curX, startY + charH);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX + charW, startY);
          ctx.lineTo(curX + charW, startY + charH * 0.5);
          ctx.lineTo(curX, startY + charH * 0.5);
          break;
        case 'I':
          ctx.moveTo(curX + charW * 0.5, startY);
          ctx.lineTo(curX + charW * 0.5, startY + charH);
          break;
        case 'R':
          ctx.moveTo(curX, startY + charH);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX + charW, startY);
          ctx.lineTo(curX + charW, startY + charH * 0.5);
          ctx.lineTo(curX, startY + charH * 0.5);
          ctx.lineTo(curX + charW, startY + charH);
          break;
        case 'T':
          ctx.moveTo(curX, startY);
          ctx.lineTo(curX + charW, startY);
          ctx.moveTo(curX + charW * 0.5, startY);
          ctx.lineTo(curX + charW * 0.5, startY + charH);
          break;
        case 'U':
          ctx.moveTo(curX, startY);
          ctx.lineTo(curX, startY + charH);
          ctx.lineTo(curX + charW, startY + charH);
          ctx.lineTo(curX + charW, startY);
          break;
        case 'B':
          ctx.moveTo(curX, startY + charH);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX + charW, startY);
          ctx.lineTo(curX + charW, startY + charH * 0.5);
          ctx.lineTo(curX, startY + charH * 0.5);
          ctx.lineTo(curX + charW, startY + charH * 0.5);
          ctx.lineTo(curX + charW, startY + charH);
          ctx.lineTo(curX, startY + charH);
          break;
        case 'A':
          ctx.moveTo(curX, startY + charH);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX + charW, startY);
          ctx.lineTo(curX + charW, startY + charH);
          ctx.moveTo(curX, startY + charH * 0.5);
          ctx.lineTo(curX + charW, startY + charH * 0.5);
          break;
        case 'Z':
          ctx.moveTo(curX, startY);
          ctx.lineTo(curX + charW, startY);
          ctx.lineTo(curX, startY + charH);
          ctx.lineTo(curX + charW, startY + charH);
          break;
        case '/':
          ctx.moveTo(curX, startY + charH);
          ctx.lineTo(curX + charW, startY);
          break;
        case 'O':
          ctx.rect(curX, startY, charW, charH);
          break;
        case 'E':
          ctx.moveTo(curX + charW, startY);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX, startY + charH);
          ctx.lineTo(curX + charW, startY + charH);
          ctx.moveTo(curX, startY + charH * 0.5);
          ctx.lineTo(curX + charW * 0.8, startY + charH * 0.5);
          break;
        case 'S':
          ctx.moveTo(curX + charW, startY);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX, startY + charH * 0.5);
          ctx.lineTo(curX + charW, startY + charH * 0.5);
          ctx.lineTo(curX + charW, startY + charH);
          ctx.lineTo(curX, startY + charH);
          break;
        case 'N':
          ctx.moveTo(curX, startY + charH);
          ctx.lineTo(curX, startY);
          ctx.lineTo(curX + charW, startY + charH);
          ctx.lineTo(curX + charW, startY);
          break;
        default:
          break;
      }
      ctx.stroke();
      curX += charW + 6;
    }
  }

  // 12. Brazilian Window with Metal Security Grille (Grade de Ferro)
  createWindowTexture(lit = false) {
    const key = `window_${lit}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    // Wall perimeter
    ctx.fillStyle = '#8b4b2e';
    ctx.fillRect(0, 0, 128, 128);

    // Window frame
    ctx.fillStyle = '#222';
    ctx.fillRect(16, 16, 96, 96);

    // Glass panes (warm tungsten glow or dark reflective glass)
    ctx.fillStyle = lit ? '#ffb347' : '#1b2631';
    ctx.fillRect(20, 20, 88, 88);

    if (lit) {
      // Glow and interior curtain silhouette
      ctx.fillStyle = 'rgba(255, 230, 180, 0.4)';
      ctx.fillRect(24, 24, 80, 80);
      ctx.fillStyle = 'rgba(100, 50, 20, 0.3)';
      ctx.fillRect(20, 20, 25, 88);
      ctx.fillRect(83, 20, 25, 88);
    }

    // Metal grille (grades de ferro brancas ou pretas)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    // Vertical bars
    for (let x = 32; x < 100; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x, 112);
      ctx.stroke();
    }
    // Horizontal cross bars
    ctx.beginPath();
    ctx.moveTo(16, 45);
    ctx.lineTo(112, 45);
    ctx.moveTo(16, 85);
    ctx.lineTo(112, 85);
    ctx.stroke();

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 13. Snooker Table Felt (Feltro da Mesa de Sinuca)
  createSnookerFelt() {
    const key = 'snooker_felt';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Deep classic baize green
    ctx.fillStyle = '#0f612d';
    ctx.fillRect(0, 0, 256, 128);

    // Cloth weave noise
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(30,120,60,0.2)' : 'rgba(10,60,25,0.2)';
      ctx.fillRect(Math.random() * 256, Math.random() * 128, 2, 2);
    }

    // White "D" baulk line and spot
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 10);
    ctx.lineTo(60, 118);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(60, 64, 25, -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();

    // Cue ball spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(60, 64, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pyramid head spot
    ctx.beginPath();
    ctx.arc(180, 64, 3, 0, Math.PI * 2);
    ctx.fill();

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 14. Commercial Beverage Cooler / Freezer (Geladeira Expositora de Cerveja e Refri)
  createBeverageCooler() {
    const key = 'cooler_display';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);

    // Dark interior with cold blueish LED lighting
    ctx.fillStyle = '#101a24';
    ctx.fillRect(0, 0, 128, 256);

    // Glass door frame
    ctx.strokeStyle = '#3a4a58';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 122, 250);

    // 4 Shelves with colorful rows of cans and bottles
    const shelfY = [45, 95, 145, 195];
    const canColors = ['#d12417', '#f0c200', '#0a64bd', '#145e28', '#e5e3dc'];

    shelfY.forEach((sy) => {
      // Wire rack shelf
      ctx.fillStyle = '#5a6b7c';
      ctx.fillRect(8, sy + 22, 112, 3);

      // Rows of canned drinks
      for (let c = 0; c < 7; c++) {
        const cx = 14 + c * 15;
        ctx.fillStyle = canColors[(c + sy) % canColors.length];
        ctx.fillRect(cx, sy, 11, 22);

        // Can highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(cx + 2, sy, 2, 22);
      }
    });

    // Top illuminated brand header
    ctx.fillStyle = '#0a64bd';
    ctx.fillRect(8, 8, 112, 25);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GELADA 0°C', 64, 25);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 15. SPTrans Bus Stop Sign (Placa de Ponto de Ônibus)
  createBusStopSign() {
    const key = 'bus_stop_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    // São Paulo SPTrans red and white banner
    ctx.fillStyle = '#d62828';
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 6, 116, 116);

    // SPTrans circle logo
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.arc(64, 40, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SP', 64, 46);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PIRITUBA', 64, 78);
    ctx.font = 'bold 10px monospace';
    ctx.fillText('LINHA 8000', 64, 95);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('TERM. LAPA', 64, 110);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 16. Orelhão (Public Telephone Keypad & Telesp Decal)
  createOrelhaoDecal() {
    const key = 'orelhao_decal';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    // Dark payphone body
    ctx.fillStyle = '#22262b';
    ctx.fillRect(0, 0, 128, 128);

    // Chrome coin slot & display
    ctx.fillStyle = '#3a854d'; // LCD display
    ctx.fillRect(24, 20, 80, 18);
    ctx.fillStyle = '#a6f7b9';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INSIRA CARTAO', 64, 32);

    // Keypad grid
    ctx.fillStyle = '#888899';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(36 + c * 20, 48 + r * 16, 14, 11);
      }
    }

    // Telesp / Telefônica logo
    ctx.fillStyle = '#0a64bd';
    ctx.beginPath();
    ctx.arc(64, 118, 8, 0, Math.PI * 2);
    ctx.fill();

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 17. Construction Rubble (Entulho da Caçamba)
  createRubbleTexture() {
    const key = 'rubble_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    ctx.fillStyle = '#736d65';
    ctx.fillRect(0, 0, 128, 128);

    // Chunks of brick and broken mortar
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * 128;
      const ry = Math.random() * 128;
      const size = Math.random() * 10 + 3;
      ctx.fillStyle = Math.random() > 0.4 ? '#b84e2a' : '#9e978e';
      ctx.fillRect(rx, ry, size, size * 0.7);
    }

    const texture = this.toThreeTexture(canvas, 2, 2);
    this.cache[key] = texture;
    return texture;
  }

  // 18. Golden-Yellow Blossom Foliage for Brazilian Ipê-Amarelo
  createIpeYellowFoliage() {
    const key = 'ipe_foliage';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    ctx.fillStyle = '#ffd000';
    ctx.fillRect(0, 0, 128, 128);

    // Flower clusters variation
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffea40' : '#e6b800';
      ctx.fillRect(x, y, 3, 3);
    }

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 19. Official São Paulo Blue Street Corner Signs (Placas de Esquina CET)
  createStreetSign(streetName, infoText) {
    const key = `street_sign_${streetName}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);

    // Official dark blue background of São Paulo street plaques
    ctx.fillStyle = '#0a3d75';
    ctx.fillRect(0, 0, 256, 96);

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 88);

    // Street Name (e.g. "AV. GEN. EDGAR FACÓ")
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(streetName, 128, 42);

    // Divider line
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(20, 52, 216, 2);

    // Info line (e.g. "02924-000 • PIRITUBA")
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(infoText || '02924-000 • PIRITUBA', 128, 74);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 20. CET Green Overhead Highway Gantry Sign (Pórtico de Sinalização Verde CET)
  createGantrySign() {
    const key = 'gantry_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);

    // Official CET road green
    ctx.fillStyle = '#0a6332';
    ctx.fillRect(0, 0, 512, 128);

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(5, 5, 502, 118);

    // 3 Destination panels
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Panel 1 (Left): Marginal Tietê / Lapa
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.fillText('⬅ MARGINAL TIETÊ', 90, 48);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('LAPA / CENTRO', 90, 75);

    // Panel 2 (Center): Pirituba / Jaraguá
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.fillText('⬆ PIRITUBA', 256, 48);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PICO DO JARAGUÁ', 256, 75);

    // Panel 3 (Right): Freguesia do Ó
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.fillText('FREGUESIA DO Ó ➡', 422, 48);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('AV. ITABERABA', 422, 75);

    // White vertical separators
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(175, 12, 2, 104);
    ctx.fillRect(340, 12, 2, 104);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 21. SPTrans Bus Corridor Red Asphalt Lane (Faixa Exclusiva de Ônibus)
  createBusLaneTexture(repeatX = 15, repeatY = 1) {
    const key = `bus_lane_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Reddish pigmented asphalt used for SPTrans bus corridors in SP
    ctx.fillStyle = '#802824';
    ctx.fillRect(0, 0, 256, 128);

    // Asphalt noise
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#94312c' : '#691e1b';
      ctx.fillRect(Math.random() * 256, Math.random() * 128, 2, 2);
    }

    // White solid boundary lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 4, 256, 6);
    ctx.fillRect(0, 118, 256, 6);

    // Stenciled white text "ÔNIBUS" in center
    ctx.font = 'bold 36px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ÔNIBUS', 128, 74);

    // Chevron forward arrow
    ctx.beginPath();
    ctx.moveTo(20, 64);
    ctx.lineTo(40, 40);
    ctx.lineTo(40, 54);
    ctx.lineTo(60, 54);
    ctx.lineTo(60, 74);
    ctx.lineTo(40, 74);
    ctx.lineTo(40, 88);
    ctx.closePath();
    ctx.fill();

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 22. SPTrans Bus Body & Destination Banner Texture
  createSPTransBusTexture() {
    const key = 'sptrans_bus_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Silver-grey base body
    ctx.fillStyle = '#cfd3d6';
    ctx.fillRect(0, 0, 256, 128);

    // Iconic red lower stripe (Zona Noroeste / Pirituba SPTrans color standard)
    ctx.fillStyle = '#cc1414';
    ctx.fillRect(0, 75, 256, 53);

    // Digital LED orange destination sign on top
    ctx.fillStyle = '#111111';
    ctx.fillRect(10, 8, 236, 32);
    ctx.fillStyle = '#ff8800'; // Amber LED
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('8400-10 TERM. PIRITUBA', 128, 30);

    // SPTrans circle logo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(45, 102, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc1414';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('SP', 45, 107);

    // Bus fleet number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.fillText('1 2345', 180, 107);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 23. Gas Station Canopy (Posto de Combustíveis Petrobras/Ipiranga)
  createGasStationCanopy() {
    const key = 'gas_station_canopy';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 64);

    // Yellow and green banner (BR / Petrobras)
    ctx.fillStyle = '#00853f';
    ctx.fillRect(0, 0, 256, 64);

    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 48, 256, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POSTO PIRITUBA 24H', 128, 34);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 24. CET Electronic Speed Radar Sign (Radar 50 km/h)
  createRadarSign() {
    const key = 'radar_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);

    // Red speed circle
    ctx.strokeStyle = '#d61111';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(64, 52, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 36px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('50', 64, 65);

    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('km/h', 64, 82);

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#444';
    ctx.fillText('FISCALIZAÇÃO', 64, 104);
    ctx.fillText('ELETRÔNICA', 64, 118);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 25. Classic Brazilian Soccer Ball Texture ("Bola Dente-de-Leite")
  createSoccerBallTexture() {
    const key = 'soccer_ball_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // White base
    ctx.fillStyle = '#f0f3f5';
    ctx.fillRect(0, 0, 256, 128);

    // Classic black pentagons pattern
    ctx.fillStyle = '#1c1e22';
    const pentagons = [
      [64, 40, 22], [192, 40, 22],
      [128, 90, 22], [0, 90, 18], [256, 90, 18]
    ];

    pentagons.forEach(([px, py, r]) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = px + r * Math.cos(angle);
        const y = py + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    });

    // Seam stitching lines
    ctx.strokeStyle = '#a6adb3';
    ctx.lineWidth = 2;
    pentagons.forEach(([px, py, r]) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = px + r * Math.cos(angle);
        const y = py + r * Math.sin(angle);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12 * Math.cos(angle), y + 12 * Math.sin(angle));
      }
      ctx.stroke();
    });

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 26. Brazilian Beer Can Texture (Lata de Cerveja Amarela / Vermelha)
  createBeerCanTexture(color = '#ffcc00') {
    const key = `beer_can_${color}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 64);

    // Can body
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 64);

    // Metallic top & bottom rims
    ctx.fillStyle = '#d6d8db';
    ctx.fillRect(0, 0, 128, 6);
    ctx.fillRect(0, 58, 128, 6);

    // Logo text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(color === '#ffcc00' ? 'SKOL' : 'BRAHMA', 64, 36);

    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('350ml • PURO MALTE', 64, 50);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 17. Banca de Jornal do Seu Mário Texture
  createBancaJornalTexture() {
    const key = `banca_jornal`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);
    // Dark blue / royal blue kiosk body
    ctx.fillStyle = '#0f386b';
    ctx.fillRect(0, 0, 256, 128);

    // Header sign
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(8, 8, 240, 36);

    ctx.fillStyle = '#0f386b';
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BANCA PIRITUBA // SEU MÁRIO', 128, 32);

    // Magazine covers on rack
    const magColors = ['#e63946', '#2a9d8f', '#e76f51', '#f4a261', '#457b9d'];
    magColors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(16 + i * 46, 52, 38, 54);
      ctx.fillStyle = '#fff';
      ctx.fillRect(20 + i * 46, 56, 30, 8);
      ctx.fillStyle = '#111';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(i === 0 ? 'NOTÍCIA' : (i === 1 ? 'MÔNICA' : (i === 2 ? 'RASPE' : 'CRUZADA')), 35 + i * 46, 75);
    });

    // Yellow stickers: "RASPADINHA"
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(16, 110, 224, 12);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('⭐ RASPADINHA DA SORTE • RECARGA BILHETE ÚNICO ⭐', 128, 120);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 18. Barraca de Pastel da Feira Texture
  createPastelSignTexture() {
    const key = `pastel_sign`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);
    // Red and yellow feira aesthetic
    ctx.fillStyle = '#d90429';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(8, 8, 240, 112);

    ctx.fillStyle = '#d90429';
    ctx.font = 'bold 20px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PASTEL DA DONA MARIA', 128, 40);

    ctx.fillStyle = '#111';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('FRITO NA HORA • CROCANTE • VINAGRETE', 128, 68);

    ctx.fillStyle = '#0b6623';
    ctx.font = 'bold 15px "Arial Black", sans-serif';
    ctx.fillText('🥤 CALDO DE CANA GELADO C/ LIMÃO', 128, 98);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 19. Baile da Laje Neon Sign Texture
  createBaileLajeSign() {
    const key = `baile_laje_sign`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, 256, 128);

    // Neon borders
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 116);

    ctx.fillStyle = '#f72585';
    ctx.font = 'bold 22px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAILE DA LAJE', 128, 45);

    ctx.fillStyle = '#7209b7';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PIRITUBA ZONA OESTE // 100% QUEBRADA', 128, 75);

    ctx.fillStyle = '#4cc9f0';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('SOM PESADO • COROTE • RIMA LIVRE', 128, 102);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 48. Atmospheric Sky Dome Gradient Texture with Subtle Stipple Dithering
  createSkyAtmosphereTexture() {
    const key = 'sky_atmosphere';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);

    // Vertical linear gradient: zenith (darker/deeper sky) down to horizon (luminous atmospheric haze)
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#708cb2'); // Zenith / high sky tone
    grad.addColorStop(0.35, '#8daed6'); // Mid-sky
    grad.addColorStop(0.70, '#bed4ec'); // Low atmosphere
    grad.addColorStop(1.0, '#edf4fc'); // Horizon luminous haze

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);

    // Subtle Bayer/stipple dither to break up flat ASCII luminance quantization
    const imgData = ctx.getImageData(0, 0, 128, 256);
    const data = imgData.data;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 128; x++) {
        const idx = (y * 128 + x) * 4;
        const bayer = ((x & 3) ^ ((y & 3) * 2)) * 1.5;
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1) * 6 - 3;
        const offset = (bayer - 6) + noise;
        data[idx] = Math.max(0, Math.min(255, data[idx] + offset));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + offset));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + offset));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    this.cache[key] = texture;
    return texture;
  }

  // 49. Official São Paulo Blue Street Corner Nameplate Sign (Placa de Rua Azul CET)
  createStreetSign(streetName = 'AV. GEN. EDGAR FACÓ', subText = 'PIRITUBA • CEP 02924-000') {
    const key = `street_sign_${streetName}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);

    // Deep blue enamel background
    ctx.fillStyle = '#0b396e';
    ctx.fillRect(0, 0, 256, 96);

    // Crisp white border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 88);

    // Inner thin border
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 240, 80);

    // Street Name
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Arial", sans-serif';
    ctx.fillText(streetName, 128, 44);

    // Subtext (Neighborhood & CEP)
    ctx.fillStyle = '#9bc4f5';
    ctx.font = 'bold 11px "Arial", sans-serif';
    ctx.fillText(subText, 128, 70);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 50. Speed Bump Asphalt with Yellow Reflective Diagonal Stripes (Lombada)
  createLombadaTexture() {
    const key = 'lombada_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);

    // Dark asphalt base
    ctx.fillStyle = '#26292b';
    ctx.fillRect(0, 0, 256, 128);

    // Yellow diagonal safety chevrons
    ctx.fillStyle = '#ffcc00';
    for (let x = -64; x < 320; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 24, 0);
      ctx.lineTo(x - 16, 128);
      ctx.lineTo(x - 40, 128);
      ctx.closePath();
      ctx.fill();
    }

    // Asphalt noise & tire wear marks
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.15)';
      ctx.fillRect(Math.random() * 256, Math.random() * 128, 2, 2);
    }

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 51. Storm Drain Cast Iron Grate (Bueiro de Rua)
  createBueiroTexture() {
    const key = 'bueiro_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    // Dark underground opening
    ctx.fillStyle = '#111315';
    ctx.fillRect(0, 0, 128, 128);

    // Metal frame
    ctx.strokeStyle = '#4a5055';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 120, 120);

    // Cast iron bars
    ctx.fillStyle = '#3a4045';
    for (let y = 14; y < 114; y += 12) {
      ctx.fillRect(8, y, 112, 6);
      ctx.fillStyle = '#5a626a';
      ctx.fillRect(8, y, 112, 1); // Highlight
      ctx.fillStyle = '#3a4045';
    }

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 52. Banco Pirituba Facade & Glowing Signage (Bradesco / Itaú style)
  createBankSignTexture() {
    const key = 'banco_pirituba_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);

    // Red & White metallic gradient banner (Iconic Brazilian Bank aesthetic)
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0.0, '#b80c1e');
    grad.addColorStop(0.7, '#cc001a');
    grad.addColorStop(1.0, '#8c0012');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);

    // White glowing band
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 108, 512, 20);

    // Bank Logo & Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px "Arial Black", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText('BANCO PIRITUBA', 256, 60);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 15px "Arial", sans-serif';
    ctx.fillStyle = '#ffeeee';
    ctx.fillText('AGÊNCIA 0086 • AUTOATENDIMENTO 24 HORAS', 256, 92);

    ctx.fillStyle = '#cc001a';
    ctx.font = 'bold 12px "Arial", sans-serif';
    ctx.fillText('CHEQUE ESPECIAL • CRÉDITO • DEPÓSITO • SAQUES', 256, 122);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 53. Glowing ATM Terminal Screen Texture
  createAtmScreenTexture() {
    const key = 'atm_screen_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // ATM Screen Background (Deep cyan-blue terminal)
    ctx.fillStyle = '#06162b';
    ctx.fillRect(0, 0, 256, 256);

    // Header bar
    ctx.fillStyle = '#0a3568';
    ctx.fillRect(0, 0, 256, 44);

    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('BANCO 24 HORAS // REDE CIRRUS', 128, 28);

    // Screen Content
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ESCOLHA SUA OPERAÇÃO:', 128, 80);

    ctx.textAlign = 'left';
    ctx.font = '12px monospace';
    ctx.fillStyle = '#00ff88';
    ctx.fillText('> [1] SACAR CHEQUE ESPECIAL', 20, 120);
    ctx.fillText('> [2] DEPOSITAR & QUITAR DÍVIDA', 20, 150);
    ctx.fillText('> [3] EXTRATO / CONSULTA SERASA', 20, 180);

    // Warning footer
    ctx.fillStyle = '#ffaa33';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('EVITE FALÊNCIA • LIMITE R$ 150', 20, 225);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 54. Auto Repair Shop "Oficina Mecânica do Beto"
  createOficinaSignTexture() {
    const key = 'oficina_beto_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#1c2229';
    ctx.fillRect(0, 0, 256, 96);
    ctx.strokeStyle = '#f5b800';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 88);

    ctx.fillStyle = '#f5b800';
    ctx.textAlign = 'center';
    ctx.font = 'bold 19px "Arial Black", sans-serif';
    ctx.fillText('AUTO MECÂNICA DO BETO', 128, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Arial", sans-serif';
    ctx.fillText('INJEÇÃO • FREIOS • SUSPENSÃO • BORRACHARIA', 128, 70);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Generic Storefront Banner Sign
  createStoreSign(text, bgColor = '#8a3c20', textColor = '#ffe89e') {
    const key = `store_sign_${text}_${bgColor}_${textColor}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px "Arial Black", Impact, sans-serif';
    ctx.fillText(text, 256, 62);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('PIRITUBA • SÃO PAULO', 256, 95);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 55. Suburban Parquet Wooden Floor (Taco de Madeira Envernizado)
  createParquetTexture(repeatX = 2, repeatY = 2) {
    const key = `parquet_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = '#9e6234';
    ctx.fillRect(0, 0, 256, 256);

    const plankW = 64;
    const plankH = 16;
    for (let y = 0; y < 256; y += plankH) {
      const offsetX = (Math.floor(y / plankH) % 2) * (plankW / 2);
      for (let x = -plankW; x < 256 + plankW; x += plankW) {
        const tone = 0.85 + Math.random() * 0.3;
        const r = Math.min(255, Math.floor(160 * tone));
        const g = Math.min(255, Math.floor(100 * tone));
        const b = Math.min(255, Math.floor(55 * tone));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x + offsetX + 1, y + 1, plankW - 2, plankH - 2);

        ctx.strokeStyle = '#4a2810';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + offsetX, y, plankW, plankH);
      }
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 56. Luxury White Carrara Marble Floor (Mármore Carrara Penthouse)
  createMarbleTexture(repeatX = 2, repeatY = 2) {
    const key = `marble_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = '#f2f4f7';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle natural veins
    ctx.strokeStyle = '#d0d5dc';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      let cx = Math.random() * 256;
      let cy = 0;
      ctx.moveTo(cx, cy);
      while (cy < 256) {
        cx += (Math.random() - 0.5) * 30;
        cy += 20 + Math.random() * 30;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 57. High-Rise Tower Architectural Facade (Vidro & Granito)
  createTowerFacadeTexture(repeatX = 2, repeatY = 8) {
    const key = `tower_facade_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = '#20242b';
    ctx.fillRect(0, 0, 256, 256);

    // Grid of large tinted executive glass windows
    ctx.fillStyle = '#1c3044';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(col * 64 + 6, row * 64 + 6, 52, 48);
        ctx.fillStyle = '#2b4c6b';
        ctx.fillRect(col * 64 + 10, row * 64 + 10, 20, 20); // Reflection gleam
        ctx.fillStyle = '#1c3044';
      }
    }

    // Architectural aluminum mullions
    ctx.strokeStyle = '#a8b0b8';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 256);
      ctx.moveTo(0, i); ctx.lineTo(256, i);
      ctx.stroke();
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 58. Modern Brushed Stainless Steel Elevator Doors
  createElevatorDoorTexture(label = '12') {
    const key = `elevator_door_${label}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    // Brushed steel gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#888e96');
    grad.addColorStop(0.48, '#c2c8d0');
    grad.addColorStop(0.5, '#40444a'); // Center vertical split
    grad.addColorStop(0.52, '#c2c8d0');
    grad.addColorStop(1, '#888e96');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Floor indicator digital display
    ctx.fillStyle = '#11151a';
    ctx.fillRect(88, 15, 80, 36);
    ctx.strokeStyle = '#333b45';
    ctx.lineWidth = 2;
    ctx.strokeRect(88, 15, 80, 36);

    ctx.fillStyle = '#00f5d4';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`▲ ${label} ▲`, 128, 40);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 59. Boteco Satirical AI Beer Brand ("BRAHM.AI // Desce Redonda na Matrix")
  createBeerBrandTexture(brand = 'BRAHM.AI') {
    const key = `beer_brand_${brand}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    // Boteco iconic red background
    ctx.fillStyle = '#c92418';
    ctx.fillRect(0, 0, 256, 256);

    // Outer golden border
    ctx.strokeStyle = '#f5c518';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 236);

    // Inner white oval shield
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(128, 128, 105, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c92418';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Red ribbon banner across center
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(20, 105, 216, 48);

    // Brand Name Typography
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '900 28px "Arial Black", Impact, sans-serif';
    ctx.fillText(brand, 128, 138);

    // Taglines
    ctx.fillStyle = '#b71c1c';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('★ CHOPP DA SIMULAÇÃO ★', 128, 88);
    ctx.fillText('100% MALTE SINTÉTICO', 128, 100);

    ctx.fillStyle = '#f5c518';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DESCE REDONDA NA MATRIX', 128, 172);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('PIRITUBA • SP • 0 BUGS', 128, 190);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 60. Brazilian Padoca Snack Warmer (Estufa de Coxinha, Pastel & Pão de Queijo)
  createPadariaEstufaTexture() {
    const key = 'padaria_estufa';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    // Warm tungsten heated interior glow
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ffe89e');
    grad.addColorStop(0.5, '#f5ba42');
    grad.addColorStop(1, '#b86214');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Metal rack wire grids
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    [64, 128, 192].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(256, y);
      ctx.stroke();
    });

    // Coxinhas (Tear-shaped golden fried snacks)
    ctx.fillStyle = '#b85c0a';
    for (let i = 0; i < 4; i++) {
      const cx = 35 + i * 62;
      const cy = 52;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.quadraticCurveTo(cx + 16, cy + 10, cx, cy + 12);
      ctx.quadraticCurveTo(cx - 16, cy + 10, cx, cy - 20);
      ctx.fill();
    }

    // Pães de Queijo (Golden round puffs)
    ctx.fillStyle = '#e8a938';
    for (let i = 0; i < 5; i++) {
      const px = 26 + i * 50;
      const py = 116;
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pastéis & Empadas
    ctx.fillStyle = '#c77816';
    for (let i = 0; i < 4; i++) {
      const ex = 32 + i * 62;
      const ey = 178;
      ctx.fillRect(ex - 18, ey - 10, 36, 16);
    }

    // Glass reflection gleam across front
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(100, 0); ctx.lineTo(20, 256); ctx.lineTo(0, 256);
    ctx.fill();

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 61. Padaria Blackboard Chalk Menu (Quadro de Preços da Padoca)
  createPadariaMenuBoardTexture() {
    const key = 'padaria_menu_board';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    // Slate blackboard background with dusty chalk smudges
    ctx.fillStyle = '#1c2224';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#8a532d'; // Wooden frame
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 246);

    // Chalk Typography
    ctx.fillStyle = '#fce592';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Comic Sans MS", cursive, sans-serif';
    ctx.fillText('★ PADARIA ESTRELA ★', 128, 35);
    ctx.font = 'italic 11px sans-serif';
    ctx.fillText('Café & Pão Quentinho a Toda Hora', 128, 52);

    ctx.textAlign = 'left';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';

    const items = [
      ['PINGADO C/ LEITE', 'R$ 4,50'],
      ['PÃO NA CHAPA', 'R$ 6,00'],
      ['COXINHA CATUPIRY', 'R$ 8,00'],
      ['MISTO QUENTE', 'R$ 11,00'],
      ['SUCO DE LARANJA', 'R$ 7,50'],
      ['PUDIM DE LEITE', 'R$ 7,00']
    ];

    items.forEach(([name, price], idx) => {
      const y = 82 + idx * 24;
      ctx.fillText(name, 22, y);
      ctx.fillText(price, 175, y);
    });

    // Bottom note
    ctx.fillStyle = '#81e69b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACEITAMOS VR, VA & PIX', 128, 235);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 62. Wooden House Door with Weathered Planks & Metal Knob
  createWoodenHouseDoorTexture() {
    const key = 'wooden_house_door';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);
    // Dark weathered wood
    ctx.fillStyle = '#5c3922';
    ctx.fillRect(0, 0, 128, 256);

    // Vertical plank gaps
    ctx.strokeStyle = '#321c0e';
    ctx.lineWidth = 2;
    for (let x = 32; x < 128; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, 256);
      ctx.stroke();
    }

    // Wood grain lines
    ctx.strokeStyle = '#432815';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const rx = Math.random() * 128;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + (Math.random() - 0.5) * 10, 256);
      ctx.stroke();
    }

    // Horizontal reinforcement battens
    ctx.fillStyle = '#4c2e19';
    ctx.fillRect(6, 20, 116, 22);
    ctx.fillRect(6, 117, 116, 22);
    ctx.fillRect(6, 214, 116, 22);

    // Metal doorknob and keyhole
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(106, 128, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111111';
    ctx.fillRect(104, 138, 4, 8);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 42. Classic Portuguese Cobblestone (Calçada de Pedras Portuguesas - Largo da Matriz)
  createPedraPortuguesa(repeatX = 12, repeatY = 12) {
    const key = `pedra_portuguesa_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Warm stone off-white base
    ctx.fillStyle = '#dcd7cd';
    ctx.fillRect(0, 0, 256, 256);

    // Black wave mosaic bands (Mar Largo / Calçadão Paulista)
    ctx.fillStyle = '#26292b';
    for (let y = 0; y < 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y + 16);
      ctx.bezierCurveTo(64, y - 16, 128, y + 48, 192, y + 16);
      ctx.bezierCurveTo(224, y, 240, y + 8, 256, y + 16);
      ctx.lineTo(256, y + 42);
      ctx.bezierCurveTo(240, y + 34, 224, y + 26, 192, y + 42);
      ctx.bezierCurveTo(128, y + 74, 64, y + 10, 0, y + 42);
      ctx.closePath();
      ctx.fill();
    }

    // Individual mosaic pebble tessellation
    for (let py = 4; py < 256; py += 8) {
      for (let px = 4; px < 256; px += 8) {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 3 + (Math.random() - 0.5) * 2, py - 3 + (Math.random() - 0.5) * 2, 6, 6);
      }
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 43. Historic Colonial Plaster (Casarões Históricos do Largo da Matriz)
  createColonialWall(baseColor = '#e8c96b', repeatX = 2, repeatY = 2) {
    const key = `colonial_wall_${baseColor}_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Rich colonial plaster base (ochre/yellow or pastel)
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Weathered aging & patina
    for (let i = 0; i < 400; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      const size = Math.random() * 6 + 2;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(px, py, size, size);
    }

    // Fine masonry lines and vintage stucco grain
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 44. O Lendário Bar Frangó - Placa Rústica e Fachada
  createFrangoSign() {
    const key = 'sign_frango_bar';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);

    // Deep mahogany wood plank
    ctx.fillStyle = '#2e180d';
    ctx.fillRect(0, 0, 256, 96);

    // Carved gold border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 84);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, 236, 76);

    // "FRANGÓ"
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FRANGÓ', 128, 48);

    // Subtitle
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('BAR & ROTISSERIE • DESDE 1987', 128, 70);

    // Small coxinha & beer icon
    ctx.fillStyle = '#f59e0b';
    ctx.font = '16px monospace';
    ctx.fillText('🍗 🍺', 128, 86);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 45. Igreja Matriz - Altar Colonial e Retábulo
  createMatrizAltar() {
    const key = 'matriz_altar';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Dark carved wood and gold leaf
    ctx.fillStyle = '#3b2010';
    ctx.fillRect(0, 0, 256, 256);

    // Golden baroque arch
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 120, 90, Math.PI, 0);
    ctx.lineTo(218, 256);
    ctx.lineTo(38, 256);
    ctx.closePath();
    ctx.stroke();

    // Sacred cross in gold
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(122, 60, 12, 70);
    ctx.fillRect(100, 80, 56, 12);

    // Candles at altar base
    const candleX = [60, 85, 171, 196];
    candleX.forEach(cx => {
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(cx - 3, 200, 6, 40);
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx, 194, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 46. Igreja Matriz - Vitral Colonial
  createMatrizWindow() {
    const key = 'matriz_window';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);

    // Stone wall surrounding
    ctx.fillStyle = '#e8dcb8';
    ctx.fillRect(0, 0, 128, 256);

    // Arched stained glass window
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(64, 70, 50, Math.PI, 0);
    ctx.lineTo(114, 230);
    ctx.lineTo(14, 230);
    ctx.closePath();
    ctx.fill();

    // Stained glass facets (blue, crimson, amber, emerald)
    const colors = ['#dc2626', '#2563eb', '#f59e0b', '#059669', '#7c3aed'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.fillStyle = colors[(row * 3 + col) % colors.length];
        ctx.globalAlpha = 0.75;
        ctx.fillRect(20 + col * 30, 80 + row * 28, 28, 26);
        ctx.globalAlpha = 1.0;
      }
    }

    // Lead came grid
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 70, 50, Math.PI, 0);
    ctx.lineTo(114, 230);
    ctx.lineTo(14, 230);
    ctx.closePath();
    ctx.stroke();

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Pitch grass (grama batida de campinho)
  createPitchGrass(repeatX = 6, repeatY = 3) {
    const key = `pitch_grass_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = '#3d7a2e';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 9000; i++) {
      const shade = Math.random();
      ctx.fillStyle = shade > 0.55
        ? 'rgba(90, 160, 55, 0.35)'
        : 'rgba(20, 70, 25, 0.35)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 3);
    }

    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = y % 64 === 0 ? 'rgba(55, 110, 40, 0.25)' : 'rgba(70, 140, 50, 0.18)';
      ctx.fillRect(0, y, 256, 16);
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // Beaten dirt around a favela pitch
  createPitchDirt(repeatX = 8, repeatY = 5) {
    const key = `pitch_dirt_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = '#8a6a3d';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 7000; i++) {
      ctx.fillStyle = Math.random() > 0.5
        ? 'rgba(120, 90, 45, 0.4)'
        : 'rgba(60, 42, 22, 0.35)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 2);
    }

    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = 'rgba(50, 35, 18, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // White soccer markings for a 28×14 campinho
  createPitchMarkings() {
    const key = 'pitch_markings';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 256);
    ctx.clearRect(0, 0, 512, 256);
    ctx.strokeStyle = '#f4f4f0';
    ctx.lineWidth = 4;

    ctx.strokeRect(10, 10, 492, 236);
    ctx.beginPath();
    ctx.moveTo(256, 10);
    ctx.lineTo(256, 246);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 128, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f4f4f0';
    ctx.beginPath();
    ctx.arc(256, 128, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeRect(10, 58, 70, 140);
    ctx.strokeRect(432, 58, 70, 140);
    ctx.strokeRect(10, 88, 32, 80);
    ctx.strokeRect(470, 88, 32, 80);

    const texture = this.toThreeTexture(canvas, 1, 1);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache[key] = texture;
    return texture;
  }

  // Logo-free carnival bunting (bandeirinhas)
  createCarnivalBunting() {
    const key = 'carnival_bunting';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 64);
    ctx.clearRect(0, 0, 256, 64);
    const colors = ['#e11d48', '#f59e0b', '#22c55e', '#2563eb', '#f5d90a', '#ec4899'];
    const flags = 8;
    const flagW = 256 / flags;
    for (let i = 0; i < flags; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(i * flagW + 2, 4);
      ctx.lineTo((i + 1) * flagW - 2, 4);
      ctx.lineTo(i * flagW + flagW / 2, 58);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#1f2933';
    ctx.fillRect(0, 0, 256, 5);

    const texture = this.toThreeTexture(canvas, 1, 1);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache[key] = texture;
    return texture;
  }

  // Logo-free carnival streamer / paper roll
  createCarnivalStreamer() {
    const key = 'carnival_streamer';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 32);
    const colors = ['#f43f5e', '#fbbf24', '#22c55e', '#38bdf8'];
    for (let x = 0; x < 256; x += 16) {
      ctx.fillStyle = colors[(x / 16) % colors.length];
      ctx.fillRect(x, 0, 16, 32);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(Math.random() * 256, Math.random() * 32, 3, 2);
    }

    const texture = this.toThreeTexture(canvas, 4, 1);
    this.cache[key] = texture;
    return texture;
  }

  // ---------------------------------------------------------------------------
  // Trompe-l'œil Boundary Illusion Walls & Construction Site Textures
  // ---------------------------------------------------------------------------

  // Realistic forced-perspective painted mural of Av. Edgar Facó / Avenue extending to infinity
  createTrompeLoeilAvenue(facingWest = true) {
    const key = `trompe_loeil_avenue_${facingWest ? 'west' : 'east'}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 512);

    // Sky with sunny smog/haze gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
    skyGrad.addColorStop(0, '#4a90e2');
    skyGrad.addColorStop(0.6, '#8ec5fc');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 512, 240);

    // Fluffy painted clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    [[80, 60, 45], [115, 55, 60], [145, 65, 40], [360, 80, 50], [400, 75, 65], [435, 85, 40]].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Distant mountain / Pico do Jaraguá on the horizon
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(120, 240);
    ctx.lineTo(200, 165);
    ctx.lineTo(230, 178);
    ctx.lineTo(275, 138); // Jaraguá summit
    ctx.lineTo(315, 180);
    ctx.lineTo(420, 240);
    ctx.closePath();
    ctx.fill();

    // Antenna tower on summit
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(275, 138);
    ctx.lineTo(275, 92);
    ctx.stroke();

    // Distant São Paulo skyline towers
    const bldgs = [
      [25, 145, 38, 95, '#6b7280'],
      [70, 125, 32, 115, '#4b5563'],
      [110, 155, 26, 85, '#9ca3af'],
      [335, 135, 34, 105, '#4b5563'],
      [375, 115, 42, 125, '#374151'],
      [425, 150, 32, 90, '#6b7280'],
      [465, 130, 36, 110, '#4b5563']
    ];
    for (const [bx, by, bw, bh, col] of bldgs) {
      ctx.fillStyle = col;
      ctx.fillRect(bx, by, bw, bh);
      // Windows
      ctx.fillStyle = '#cbd5e1';
      for (let wy = by + 6; wy < by + bh - 6; wy += 8) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 6) {
          ctx.fillRect(wx, wy, 2.5, 3.5);
        }
      }
    }

    const vanishX = 256;
    const vanishY = 240;

    // Ground terrain / base asphalt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 240, 512, 272);

    // Roadway perspective polygon
    ctx.fillStyle = '#262930';
    ctx.beginPath();
    ctx.moveTo(vanishX - 26, vanishY);
    ctx.lineTo(vanishX + 26, vanishY);
    ctx.lineTo(472, 512);
    ctx.lineTo(40, 512);
    ctx.closePath();
    ctx.fill();

    // Red SPTrans bus lane in perspective
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(vanishX - 9, vanishY);
    ctx.lineTo(vanishX + 5, vanishY);
    ctx.lineTo(290, 512);
    ctx.lineTo(190, 512);
    ctx.closePath();
    ctx.fill();

    // Yellow dashed center lines
    ctx.fillStyle = '#f59e0b';
    for (let i = 1; i <= 10; i++) {
      const t1 = Math.pow(i / 10, 2.2);
      const t2 = Math.pow((i + 0.55) / 10, 2.2);
      const y1 = vanishY + t1 * (512 - vanishY);
      const y2 = vanishY + t2 * (512 - vanishY);
      const w1 = 1.2 + t1 * 8;
      const w2 = 1.2 + t2 * 8;
      ctx.beginPath();
      ctx.moveTo(vanishX - w1 / 2, y1);
      ctx.lineTo(vanishX + w1 / 2, y1);
      ctx.lineTo(vanishX + w2 / 2, y2);
      ctx.lineTo(vanishX - w2 / 2, y2);
      ctx.closePath();
      ctx.fill();
    }

    // White outer road borders
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(vanishX - 24, vanishY);
    ctx.lineTo(vanishX - 22, vanishY);
    ctx.lineTo(54, 512);
    ctx.lineTo(44, 512);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(vanishX + 22, vanishY);
    ctx.lineTo(vanishX + 24, vanishY);
    ctx.lineTo(468, 512);
    ctx.lineTo(458, 512);
    ctx.closePath();
    ctx.fill();

    // Sidewalks & curbs converging
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, vanishY + 5);
    ctx.lineTo(vanishX - 26, vanishY);
    ctx.lineTo(40, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(512, vanishY + 5);
    ctx.lineTo(vanishX + 26, vanishY);
    ctx.lineTo(472, 512);
    ctx.lineTo(512, 512);
    ctx.closePath();
    ctx.fill();

    // Curb edge highlights
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(vanishX - 26, vanishY);
    ctx.lineTo(vanishX - 24, vanishY);
    ctx.lineTo(44, 512);
    ctx.lineTo(40, 512);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(vanishX + 24, vanishY);
    ctx.lineTo(vanishX + 26, vanishY);
    ctx.lineTo(472, 512);
    ctx.lineTo(468, 512);
    ctx.closePath();
    ctx.fill();

    // Distant traffic: painted red bus & white Fiat Uno
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(vanishX - 6, vanishY - 9, 15, 11);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(vanishX - 6, vanishY - 6, 15, 2.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(vanishX - 5, vanishY - 9, 13, 2.2);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(vanishX + 15, vanishY + 6, 10, 6.5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vanishX + 16, vanishY + 11.5, 2.5, 2);
    ctx.fillRect(vanishX + 22, vanishY + 11.5, 2.5, 2);

    // Light poles along sidewalk converging in perspective
    for (let p = 1; p <= 5; p++) {
      const pt = Math.pow(p / 5, 1.8);
      const py = vanishY + pt * (512 - vanishY);
      const pxL = (vanishX - 26) + (35 - (vanishX - 26)) * pt;
      const pxR = (vanishX + 26) + (477 - (vanishX + 26)) * pt;
      const ph = 18 + pt * 70;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1 + pt * 2.8;
      ctx.beginPath();
      ctx.moveTo(pxL, py);
      ctx.lineTo(pxL, py - ph);
      ctx.lineTo(pxL + 6 + pt * 11, py - ph);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pxR, py);
      ctx.lineTo(pxR, py - ph);
      ctx.lineTo(pxR - (6 + pt * 11), py - ph);
      ctx.stroke();
    }

    // Concrete slab seams revealing the solid wall structure
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 508, 508);
    ctx.beginPath();
    ctx.moveTo(170, 0); ctx.lineTo(170, 512);
    ctx.moveTo(342, 0); ctx.lineTo(342, 512);
    ctx.moveTo(0, 256); ctx.lineTo(512, 256);
    ctx.stroke();

    // Satirical stencil at the bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('🚧 PINTURA HIPER-REALISTA • TROMPE-L\'OEIL PAULISTANO 🚧', 45, 502);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Colonial cobblestone perspective street for Largo da Matriz boundary
  createTrompeLoeilColonialStreet() {
    const key = 'trompe_loeil_colonial_street';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 512);

    // Twilight sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 230);
    sky.addColorStop(0, '#f97316');
    sky.addColorStop(0.5, '#fbbf24');
    sky.addColorStop(1, '#fed7aa');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 512, 230);

    // Historic church dome & colonial roofs on horizon
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(256, 175, 28, Math.PI, 0);
    ctx.lineTo(284, 230);
    ctx.lineTo(228, 230);
    ctx.closePath();
    ctx.fill();

    // Cross on dome
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(256, 147); ctx.lineTo(256, 125);
    ctx.moveTo(250, 134); ctx.lineTo(262, 134);
    ctx.stroke();

    // Colonial sobrados along left and right
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(20, 140, 95, 90);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(397, 130, 95, 100);

    const vanishX = 256;
    const vanishY = 230;

    // Cobblestone ground quad
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.moveTo(vanishX - 22, vanishY);
    ctx.lineTo(vanishX + 22, vanishY);
    ctx.lineTo(460, 512);
    ctx.lineTo(52, 512);
    ctx.closePath();
    ctx.fill();

    // Cobblestone texture lines
    ctx.strokeStyle = '#44403c';
    for (let i = 1; i <= 14; i++) {
      const t = Math.pow(i / 14, 1.9);
      const y = vanishY + t * (512 - vanishY);
      ctx.lineWidth = 0.8 + t * 2.5;
      ctx.beginPath();
      ctx.moveTo(vanishX - (vanishX - 52) * t, y);
      ctx.lineTo(vanishX + (460 - vanishX) * t, y);
      ctx.stroke();
    }

    // Concrete slab boundary lines
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 508, 508);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('🏛️ LARGO DA MATRIZ • CONTINUAÇÃO ILUSÓRIA • FREGUESIA DO Ó', 32, 502);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Favela valley perspective for northern crest / campinho
  createTrompeLoeilFavelaValley() {
    const key = 'trompe_loeil_favela_valley';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 512);

    // Sunny blue sky
    const sky = ctx.createLinearGradient(0, 0, 0, 180);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 512, 180);

    // Jaraguá Mountain in center
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(130, 180);
    ctx.lineTo(256, 70);
    ctx.lineTo(380, 180);
    ctx.closePath();
    ctx.fill();

    // Antenna
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(256, 70);
    ctx.lineTo(256, 25);
    ctx.stroke();

    // Dense favela houses descending down the hillside
    const houseCols = ['#c2410c', '#b45309', '#a16207', '#9a3412', '#7c2d12', '#475569', '#15803d'];
    for (let r = 0; r < 8; r++) {
      const y = 180 + r * 40;
      const h = 30 + r * 5;
      const w = 40 + r * 6;
      for (let x = -20; x < 530; x += w + 6) {
        ctx.fillStyle = houseCols[Math.floor(Math.random() * houseCols.length)];
        ctx.fillRect(x + (r % 2) * 15, y, w, h);

        // Blue water tank
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + (r % 2) * 15 + w * 0.4, y - 6, w * 0.28, 7);

        // Windows
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + (r % 2) * 15 + 8, y + 10, 8, 8);
        ctx.fillRect(x + (r % 2) * 15 + w - 16, y + 10, 8, 8);
      }
    }

    // Concrete slab border
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 508, 508);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('⚽ QUEBRADA INFINITA • MURO PINTADO DO CAMPINHO', 65, 502);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Huge authentic Brazilian public works construction signboard:
  // "DESCULPE PELO TRANSTORNO, ESTAMOS EM OBRAS"
  createObrasSignHuge() {
    const key = 'obras_sign_huge';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(1024, 512);

    // High visibility safety yellow background
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 1024, 512);

    // Inner white border panel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 20, 984, 472);

    // Top and bottom hazard stripes (black & yellow diagonal caution stripes)
    const drawHazardStripe = (startY, height) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, startY, 984, height);
      ctx.fillStyle = '#f59e0b';
      const stripeW = 32;
      for (let x = -height; x < 1024 + height; x += stripeW * 2) {
        ctx.beginPath();
        ctx.moveTo(x, startY + height);
        ctx.lineTo(x + stripeW, startY + height);
        ctx.lineTo(x + stripeW + height, startY);
        ctx.lineTo(x + height, startY);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawHazardStripe(20, 36);
    drawHazardStripe(456, 36);

    // Government Header
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 30px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚧  PREFEITURA DE SÃO PAULO  🚧', 512, 100);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 20px "Arial Black", Arial, sans-serif';
    ctx.fillText('SECRETARIA MUNICIPAL DE INFRAESTRUTURA URBANA E OBRAS', 512, 134);

    // Dividing rule
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(70, 155);
    ctx.lineTo(954, 155);
    ctx.stroke();

    // Main Huge Headline
    ctx.fillStyle = '#dc2626'; // Bold red
    ctx.font = '900 48px "Arial Black", Arial, sans-serif';
    ctx.fillText('DESCULPE PELO TRANSTORNO,', 512, 225);

    ctx.fillStyle = '#0f172a'; // Bold dark slate
    ctx.font = '900 64px "Arial Black", Arial, sans-serif';
    ctx.fillText('ESTAMOS EM OBRAS', 512, 305);

    // Dividing rule
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 335);
    ctx.lineTo(904, 335);
    ctx.stroke();

    // Work specifications & satirical subtext
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('OBRA: DUPLICAÇÃO, PAVIMENTAÇÃO E CONTENÇÃO DA MALHA VIÁRIA', 512, 375);

    ctx.font = '19px Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('TRECHO: PIRITUBA ⇄ FREGUESIA DO Ó • LOTE 042-B', 512, 410);

    ctx.font = 'italic 16px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PRAZO ESTIMADO: INDETERMINADO • TRÂNSITO LOCAL RESTRITO', 512, 440);

    // Weathering / bolt rivets on the corners
    ctx.fillStyle = '#334155';
    [[35, 35], [989, 35], [35, 477], [989, 477]].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Brazilian wooden plywood construction hoarding / tapume wall (Verde/Azul Tapume)
  createTapumeMadeira() {
    const key = 'tapume_madeira';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Industrial green painted plywood base
    ctx.fillStyle = '#1e3a2b';
    ctx.fillRect(0, 0, 256, 256);

    // Vertical plywood panel seams
    ctx.fillStyle = '#14271d';
    for (let x = 64; x < 256; x += 64) {
      ctx.fillRect(x - 2, 0, 4, 256);
    }

    // Wood grain and weathering
    for (let i = 0; i < 2500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#244533' : '#172e21';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 2);
    }

    // Stenciled white text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('OBRAS', 12, 45);
    ctx.fillText('PERIGO', 76, 45);
    ctx.fillText('OBRAS', 140, 45);
    ctx.fillText('OBRAS', 204, 45);

    // Yellow hazard bottom kickplate
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 240, 256, 16);
    ctx.fillStyle = '#0f172a';
    for (let x = -16; x < 256; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 256); ctx.lineTo(x + 12, 256);
      ctx.lineTo(x + 20, 240); ctx.lineTo(x + 8, 240);
      ctx.closePath();
      ctx.fill();
    }

    const texture = this.toThreeTexture(canvas, 2, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Authentic São Paulo Municipal Construction Hoarding / Tapume Metálico da Prefeitura
  createTapumePrefeitura(repeatX = 4, repeatY = 1) {
    const key = `tapume_prefeitura_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 512);

    // Deep municipal navy blue base (padrão oficial PMSP)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical ribbed steel panel seams with 3D beveling
    const panelW = 64;
    for (let x = 0; x < 512; x += panelW) {
      // Dark seam groove
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, 0, 4, 512);

      // Light highlight edge
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 4, 0, 2, 512);

      // Steel corrugated center rib
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x + 24, 0, 16, 512);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(x + 40, 0, 8, 512);

      // Rivets along the panel edges
      for (let y = 16; y < 512; y += 48) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(x + 8, y, 2.5, 0, Math.PI * 2);
        ctx.arc(x + panelW - 8, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(x + 8.5, y + 0.5, 1.5, 0, Math.PI * 2);
        ctx.arc(x + panelW - 7.5, y + 0.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Top hazard chevron stripe (32px)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 32);
    ctx.fillStyle = '#f59e0b';
    for (let x = -32; x < 544; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 32);
      ctx.lineTo(x + 16, 32);
      ctx.lineTo(x + 32, 0);
      ctx.lineTo(x + 16, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Bottom hazard chevron stripe (40px)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 472, 512, 40);
    ctx.fillStyle = '#f59e0b';
    for (let x = -40; x < 544; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + 20, 512);
      ctx.lineTo(x + 40, 472);
      ctx.lineTo(x + 20, 472);
      ctx.closePath();
      ctx.fill();
    }

    // Official Municipal Stencils across the panels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = '900 18px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PREFEITURA DE SÃO PAULO', 256, 80);

    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
    ctx.fillText('SECRETARIA MUNICIPAL DE INFRAESTRUTURA URBANA E OBRAS', 256, 102);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 118, 448, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px "Arial Black", Arial, sans-serif';
    ctx.fillText('🚧 ÁREA RESTRITA • HOMENS TRABALHANDO 🚧', 256, 148);
    ctx.font = 'bold 12px monospace';
    ctx.fillText('USO OBRIGATÓRIO DE CAPACETE • ENTRADA PROIBIDA A ESTRANHOS', 256, 175);

    // Weathering and subtle grit
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // Heavy Concrete New Jersey Traffic Barrier Texture (Barreira de Concreto Zebrada CET)
  createBarreiraNewJersey(repeatX = 1, repeatY = 1) {
    const key = `barreira_new_jersey_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);

    // Concrete base with surface texture
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 256, 256);

    // Concrete speckling & pores
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#cbd5e1' : '#64748b';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    // Bold 45° hazard warning diagonal stripes in center
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 40, 256, 140);
    ctx.fillStyle = '#facc15'; // Safety yellow
    const stripeW = 36;
    for (let x = -140; x < 256 + 140; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 180);
      ctx.lineTo(x + stripeW, 180);
      ctx.lineTo(x + stripeW + 140, 40);
      ctx.lineTo(x + 140, 40);
      ctx.closePath();
      ctx.fill();
    }

    // Lower skirt tire scuffs and road grime
    const grimeGrad = ctx.createLinearGradient(0, 180, 0, 256);
    grimeGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    grimeGrad.addColorStop(0.6, 'rgba(30, 41, 59, 0.45)');
    grimeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    ctx.fillStyle = grimeGrad;
    ctx.fillRect(0, 180, 256, 76);

    // Horizontal seam lines and chamfer shadow
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 38, 256, 4);
    ctx.fillRect(0, 180, 256, 4);

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // Orange safety plastic netting / tela fachadeira
  createTelaLaranjaMesh() {
    const key = 'tela_laranja_mesh';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 128);

    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = '#ea580c'; // Vibrant safety orange

    // Perforated mesh grid
    const cellSize = 16;
    const barWidth = 4;
    for (let x = 0; x < 128; x += cellSize) {
      ctx.fillRect(x, 0, barWidth, 128);
    }
    for (let y = 0; y < 128; y += cellSize) {
      ctx.fillRect(0, y, 128, barWidth);
    }

    const texture = this.toThreeTexture(canvas, 4, 4);
    this.cache[key] = texture;
    return texture;
  }

  // 63. Barbearia do Seu Antônio Sign
  createBarbeariaSign() {
    const key = 'barbearia_antonio_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#0f172a'; // Deep navy blue
    ctx.fillRect(0, 0, 256, 96);

    // Gold decorative border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    // Barber pole stripes left and right
    const drawStripeIcon = (ox) => {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ox, 16, 14, 64);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 4, 16, 6, 64);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(ox + 2, 30, 10, 16);
      ctx.fillRect(ox + 2, 54, 10, 16);
    };
    drawStripeIcon(14);
    drawStripeIcon(228);

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.font = 'bold 17px "Arial Black", Impact, sans-serif';
    ctx.fillText('BARBEARIA SEU ANTÔNIO', 128, 38);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CORTE • BARBA NA NAVALHA • DEGRADÊ', 128, 58);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 10px serif';
    ctx.fillText('Desde 1994 • Tradição da Ladeira', 128, 76);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // Barber pole spiral cylinder texture
  createBarberPoleTexture() {
    const key = 'barber_pole_texture';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 256);

    // Diagonal helical stripes (red and blue)
    const stripeWidth = 24;
    for (let y = -128; y < 384; y += 48) {
      // Red stripe
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y + 64);
      ctx.lineTo(128, y + 64 + stripeWidth);
      ctx.lineTo(0, y + stripeWidth);
      ctx.closePath();
      ctx.fill();

      // Blue stripe
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(0, y + 24);
      ctx.lineTo(128, y + 24 + 64);
      ctx.lineTo(128, y + 24 + 64 + stripeWidth);
      ctx.lineTo(0, y + 24 + stripeWidth);
      ctx.closePath();
      ctx.fill();
    }

    const texture = this.toThreeTexture(canvas, 1, 1);
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[key] = texture;
    return texture;
  }

  // 64. Açougue Boi de Ouro Sign
  createAcougueSign() {
    const key = 'acougue_boi_de_ouro_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#7f1d1d'; // Rich butcher crimson
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#f59e0b'; // Amber border
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Arial Black", Impact, sans-serif';
    ctx.fillText('AÇOUGUE BOI DE OURO', 128, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CARNES NOBRES • PICANHA • LINGUIÇA ARTESANAL', 128, 60);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('ABATE DIÁRIO • CORTE NA HORA', 128, 78);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 65. Hortifrúti da Ladeira Sign
  createHortifrutiSign() {
    const key = 'hortifruti_ladeira_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#14532d'; // Forest green
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#84cc16'; // Lime accent
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Arial Black", Impact, sans-serif';
    ctx.fillText('HORTIFRÚTI DA LADEIRA', 128, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('FRUTAS • VERDURAS • LEGUMES SELECIONADOS', 128, 58);

    ctx.fillStyle = '#a3e635';
    ctx.font = 'italic 10px sans-serif';
    ctx.fillText('Direto do CEAGESP para a sua mesa!', 128, 76);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 66. Bar da Ladeira (Sinuca & Dominó)
  createBotecoLadeiraSign() {
    const key = 'boteco_ladeira_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#0369a1'; // Sky-ocean blue
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Arial Black", Impact, sans-serif';
    ctx.fillText('BAR DA LADEIRA', 128, 38);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('SINUCA • DOMINÓ • CERVEJA ESTUPIDAMENTE GELADA', 128, 60);

    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('TORRESMO CROCANTE & PETISCOS', 128, 78);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 67. Casa do Norte Asa Branca Sign
  createCasaDoNorteSign() {
    const key = 'casa_do_norte_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#78350f'; // Warm terracotta leather
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    ctx.fillStyle = '#fef3c7';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Arial Black", Impact, sans-serif';
    ctx.fillText('CASA DO NORTE ASA BRANCA', 128, 38);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('QUEIJO COALHO • CARNE DE SOL • FARINHAS • CACHAÇAS', 128, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 10px serif';
    ctx.fillText('O verdadeiro sabor do Nordeste em Pirituba', 128, 78);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 68. Lotérica Pirituba Sign
  createLotericaSign() {
    const key = 'loterica_pirituba_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    // Caixa Econômica split background: Blue top, Orange lower accent
    ctx.fillStyle = '#004d9c'; // Caixa blue
    ctx.fillRect(0, 0, 256, 70);
    ctx.fillStyle = '#f37021'; // Caixa orange
    ctx.fillRect(0, 70, 256, 26);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, 250, 90);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 19px "Arial Black", Impact, sans-serif';
    ctx.fillText('LOTÉRICA PIRITUBA', 128, 32);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CAIXA AQUI • MEGA-SENA • LOTOFÁCIL', 128, 52);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PAGUE SUAS CONTAS & BOLETOS AQUI', 128, 86);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 69. Pastelaria do Beto Sign
  createPastelariaBetoSign() {
    const key = 'pastelaria_beto_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#b91c1c'; // Vibrant red
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#facc15'; // Bright yellow
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Arial Black", Impact, sans-serif';
    ctx.fillText('PASTELARIA DO BETO', 128, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('PASTÉIS GIGANTES 30CM • CALDO DE CANA GELADO', 128, 58);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('FRITURA SEQUINHA & NA HORA • VINAGRETE À VONTADE', 128, 76);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 70. Pet Shop Au-Au Pirituba Sign
  createPetShopAuAuSign() {
    const key = 'pet_shop_auau_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#0284c7'; // Sky bright blue
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 248, 88);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Arial Black", sans-serif';
    ctx.fillText('PET SHOP AU-AU PIRITUBA', 128, 36);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🐾 BANHO & TOSA • RAÇÕES • ACESSÓRIOS 🐾', 128, 58);

    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'italic 10px sans-serif';
    ctx.fillText('Cuidando do seu melhor amigo com carinho', 128, 76);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 71. Bar & Petiscaria Cantinho do Peixe
  createBarPeixeSign() {
    const key = 'bar_peixe_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#0f3a5d'; // Deep nautical blue
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 246, 86);

    ctx.fillStyle = '#7dd3fc';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Arial Black", Impact, sans-serif';
    ctx.fillText('CANTINHO DO PEIXE', 128, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('ISCA DE TILÁPIA • CAMARÃO • MANJUBINHA FRITA', 128, 58);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('🐟 CERVEJA DE GARRAFA TRINCANDO NO BALDE 🐟', 128, 76);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 72. Authentic Sobrado Residential Facade Texture
  createSobradoFacade(color = '#d97706', windowTrim = '#1e293b') {
    const key = `sobrado_facade_${color}_${windowTrim}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    // Base stucco painted facade
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);

    // Weathering and grain
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }

    // Two upper floor windows with wrought iron grates
    const drawWindow = (wx, wy, ww, wh) => {
      // Sill / molding
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);

      // Frame
      ctx.fillStyle = windowTrim;
      ctx.fillRect(wx, wy, ww, wh);

      // Glass panes (tinted)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(wx + 4, wy + 4, ww / 2 - 6, wh - 8);
      ctx.fillRect(wx + ww / 2 + 2, wy + 4, ww / 2 - 6, wh - 8);

      // Iron protective grates
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      for (let gy = wy + 10; gy < wy + wh - 6; gy += 12) {
        ctx.beginPath();
        ctx.moveTo(wx, gy); ctx.lineTo(wx + ww, gy);
        ctx.stroke();
      }
      for (let gx = wx + 8; gx < wx + ww; gx += 12) {
        ctx.beginPath();
        ctx.moveTo(gx, wy); ctx.lineTo(gx, wy + wh);
        ctx.stroke();
      }
    };

    drawWindow(32, 40, 72, 90);
    drawWindow(152, 40, 72, 90);

    // Decorative molding band between floors
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 160, 256, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 172, 256, 4);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 73. Colégio Wellington Official Sign
  createColegioWellingtonSign() {
    const key = 'colegio_wellington_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);
    ctx.fillStyle = '#1e3a8a'; // Deep navy blue
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#facc15'; // Gold border
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Arial Black", Impact, sans-serif';
    ctx.fillText('COLÉGIO WELLINGTON', 256, 54);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('EDUCAÇÃO INFANTIL • FUNDAMENTAL • ENSINO MÉDIO', 256, 88);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '14px sans-serif';
    ctx.fillText('TRADIÇÃO EM PIRITUBA • UNIDADE PETRÔNIO PORTELA', 256, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 74. Mercado Municipal de Pyrituba Sign
  createMercadoPyritubaSign() {
    const key = 'mercado_pyrituba_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);
    ctx.fillStyle = '#14532d'; // Dark market green
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#f59e0b'; // Amber border
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px "Arial Black", Impact, sans-serif';
    ctx.fillText('MERCADO MUNICIPAL DE PYRITUBA', 256, 52);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('HORTIFRÚTI • PASTEL & CALDO DE CANA • EMPÓRIO DE MINAS', 256, 86);

    ctx.fillStyle = '#4ade80';
    ctx.font = '14px sans-serif';
    ctx.fillText('PRODUTOS FRESCOS DIRETO DO PRODUTOR • DESDE 1978', 256, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 75. Restaurante Amigos do Picuí Sign
  createAmigosDoPicuiSign() {
    const key = 'amigos_do_picui_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);
    ctx.fillStyle = '#78350f'; // Warm terracotta wood
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#f97316'; // Terracotta orange border
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);

    ctx.fillStyle = '#ffedd5';
    ctx.textAlign = 'center';
    ctx.font = 'bold 34px "Arial Black", Impact, sans-serif';
    ctx.fillText('RESTAURANTE AMIGOS DO PICUÍ', 256, 52);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('CARNE DE SOL DE PICUÍ • BAIÃO DE DOIS • MACAXEIRA', 256, 86);

    ctx.fillStyle = '#fed7aa';
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText('O LEGÍTIMO SABOR DO NORDESTE NA ZONA NORTE', 256, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 76. Drogaria & Farmácia Petrônio Sign
  createFarmaciaPetronioSign() {
    const key = 'farmacia_petronio_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(512, 128);
    ctx.fillStyle = '#ffffff'; // Clean white
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#0284c7'; // Medical blue
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);

    // Green medical cross on left and right
    const drawCross = (cx, cy) => {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(cx - 8, cy - 24, 16, 48);
      ctx.fillRect(cx - 24, cy - 8, 48, 16);
    };
    drawCross(48, 64);
    drawCross(464, 64);

    ctx.fillStyle = '#0369a1';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px "Arial Black", Impact, sans-serif';
    ctx.fillText('DROGARIA & FARMÁCIA PETRÔNIO', 256, 52);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('MEDICAMENTOS • GENÉRICOS • PERFUMARIA', 256, 86);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('AFERIÇÃO DE PRESSÃO • ABERTO TODOS OS DIAS ATÉ ÀS 23H', 256, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 77. Igrejinha do Morro Plaque
  createIgrejinhaMorroSign() {
    const key = 'igrejinha_morro_sign';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 96);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 84);

    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px serif';
    ctx.fillText('CAPELA SÃO FRANCISCO', 128, 38);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('IGREJINHA DO MORRO • PIRITUBA', 128, 60);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 11px sans-serif';
    ctx.fillText('PAZ E BEM A TODOS QUE AQUI SOBEM', 128, 78);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 78. Pastelaria Menu Blackboard
  createPastelariaMenuBoard() {
    const key = 'pastelaria_menu_board';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);
    // Dark slate chalkboard
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 256, 128);

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 248, 120);

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.fillText('🥟 CARDÁPIO DO BETO 🥟', 128, 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CARNE • QUEIJO • PIZZA • PALMITO', 128, 48);
    ctx.fillText('FRANGO C/ CATUPIRY • CALABRESA', 128, 68);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('⭐ ESPECIAL DO BETO 30CM ⭐', 128, 90);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🥤 CALDO DE CANA GELADO C/ LIMÃO', 128, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 79. Pastelaria Checkered Floor Tiles
  createPisoPastelaria(repeatX = 4, repeatY = 4) {
    const key = `piso_pastelaria_${repeatX}_${repeatY}`;
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 256);
    // Light cream & golden checkered tiles
    const tileSize = 64;
    for (let x = 0; x < 256; x += tileSize) {
      for (let y = 0; y < 256; y += tileSize) {
        const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isAlt ? '#fef3c7' : '#f59e0b';
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const texture = this.toThreeTexture(canvas, repeatX, repeatY);
    this.cache[key] = texture;
    return texture;
  }

  // 80. "FIADO SÓ AMANHÃ" Chalkboard Sign for Boteco
  createFiadoSign() {
    const key = 'sign_fiado_tiao';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 128);
    // Dark slate chalkboard
    ctx.fillStyle = '#18241d';
    ctx.fillRect(0, 0, 256, 128);

    // Rustic wooden frame border
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 248, 120);

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 240, 112);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Arial Black", sans-serif';
    ctx.fillText('FIADO', 128, 38);

    ctx.fillStyle = '#ef4444';
    ctx.font = '900 24px "Arial Black", sans-serif';
    ctx.fillText('SÓ AMANHÃ!', 128, 68);

    ctx.fillStyle = '#facc15';
    ctx.font = 'italic bold 13px sans-serif';
    ctx.fillText('(Hoje Não, Amanhã Sim!)', 128, 92);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('— A DIREÇÃO DO SEU TIÃO —', 128, 112);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 81. Boteco Cerveja Estupidamente Gelada Poster
  createCervejaPoster() {
    const key = 'poster_cerveja_gelada';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(128, 256);
    // Amber/gold boteco gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.6, '#b45309');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 120, 248);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CERVEJA', 64, 40);

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 13px "Arial Black", sans-serif';
    ctx.fillText('ESTUPIDAMENTE', 64, 62);
    ctx.font = '900 18px "Arial Black", sans-serif';
    ctx.fillText('GELADA!', 64, 84);

    // Beer glass icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px sans-serif';
    ctx.fillText('🍺', 64, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('LITRÃO 600ml', 64, 168);
    ctx.fillText('TORRESMO', 64, 188);
    ctx.fillText('PORÇÃO R$ 13', 64, 208);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('BAR DO TIÃO', 64, 238);

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }

  // 82. Iconic Brazilian Auto Shop Calendar Poster: "Luma de Oliveira"
  createLumaDeOliveiraPoster() {
    const key = 'poster_luma_de_oliveira';
    if (this.cache[key]) return this.cache[key];

    const { canvas, ctx } = this.createCanvas(256, 512);

    // 1. Deep burgundy/crimson gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#450a0a');
    grad.addColorStop(0.12, '#7f1d1d');
    grad.addColorStop(0.42, '#991b1b');
    grad.addColorStop(0.72, '#450a0a');
    grad.addColorStop(1.0, '#1c0505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // 2. Gold decorative border frame
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 500);

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, 236, 492);

    // Corner rosettes
    [
      [10, 10], [246, 10], [10, 502], [246, 502]
    ].forEach(([cx, cy]) => {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Top Header: Workshop & Sponsor branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px "Arial Black", Impact, sans-serif';
    ctx.fillText('OFICINA & AUTO PEÇAS // BORRACHARIA', 128, 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DISTRIBUIDORA PIRITUBA • SP', 128, 42);

    // Thin gold separator line
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(232, 48);
    ctx.stroke();

    // 4. Main Star Name: "LUMA DE OLIVEIRA"
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 22px "Arial Black", Impact, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('LUMA DE OLIVEIRA', 128, 76);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Subtitle ribbon
    ctx.fillStyle = '#fef9c3';
    ctx.font = 'italic bold 11px sans-serif';
    ctx.fillText('★ RAINHA DO CARNAVAL & MUSA DA OFICINA ★', 128, 92);

    // 5. Centerfold / Portrait Illustration
    const cx = 128;
    const cy = 200;

    // Radiant halo rays behind portrait
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.22)' : 'rgba(234, 179, 8, 0.12)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 110, cy + Math.sin(angle) * 110);
      ctx.stroke();
    }

    // Oval portrait background vignette
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 78, 95, 0, 0, Math.PI * 2);
    ctx.clip();

    // Warm tropical sunset gradient inside oval
    const portraitGrad = ctx.createLinearGradient(cx, cy - 90, cx, cy + 100);
    portraitGrad.addColorStop(0, '#fbbf24');
    portraitGrad.addColorStop(0.5, '#f43f5e');
    portraitGrad.addColorStop(1, '#881337');
    ctx.fillStyle = portraitGrad;
    ctx.fillRect(cx - 85, cy - 95, 170, 200);

    // Shoulders / torso
    ctx.fillStyle = '#ca8a4b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 85, 58, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#b47336';
    ctx.fillRect(cx - 16, cy + 25, 32, 45);

    // Cascading dark brunette hair (back volume)
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 48, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair curls flowing over shoulders
    ctx.beginPath();
    ctx.ellipse(cx - 36, cy + 45, 18, 45, 0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 36, cy + 45, 18, 45, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#ca8a4b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15, 30, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flowing front hair bangs
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 10);
    ctx.quadraticCurveTo(cx, cy - 26, cx + 30, cy - 10);
    ctx.quadraticCurveTo(cx + 20, cy + 10, cx + 28, cy + 35);
    ctx.quadraticCurveTo(cx + 10, cy, cx, cy - 6);
    ctx.quadraticCurveTo(cx - 10, cy, cx - 28, cy + 35);
    ctx.quadraticCurveTo(cx - 20, cy + 10, cx - 30, cy - 10);
    ctx.fill();

    // Feline eyes
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(cx - 12, cy + 12, 7, 3.5, -0.15, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, cy + 12, 7, 3.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 11, cy + 11, 2, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy + 11, 2, 0, Math.PI * 2);
    ctx.fill();

    // Red lips
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 32, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fecaca';
    ctx.fillRect(cx - 2, cy + 31, 4, 1.5);

    // Iconic Black & Gold Collar ("A Famosa Coleira da Luma")
    ctx.fillStyle = '#111111';
    ctx.fillRect(cx - 20, cy + 50, 40, 10);
    ctx.fillStyle = '#facc15';
    for (let s = -14; s <= 14; s += 7) {
      ctx.beginPath();
      ctx.arc(cx + s, cy + 55, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden carnival top
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(cx - 22, cy + 90, 22, 14, 0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 22, cy + 90, 22, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Sparkles
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('✨', cx - 45, cy - 20);
    ctx.fillText('✨', cx + 38, cy + 10);
    ctx.fillText('⭐', cx + 42, cy - 35);

    ctx.restore();

    // Oval gold border around portrait
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 78, 95, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 6. Slogan
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px "Arial Black", sans-serif';
    ctx.fillText('"A PAIXÃO DA MECÂNICA BRASILEIRA"', 128, 322);

    // 7. Workshop Calendar Grid (Calendário 1998)
    const calBoxY = 332;
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(16, calBoxY, 224, 128);

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, calBoxY, 224, 128);

    // Calendar Header
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(16, calBoxY, 224, 22);

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 12px "Arial Black", sans-serif';
    ctx.fillText('★ CALENDÁRIO OFICIAL 1998 ★', 128, calBoxY + 16);

    // 12 Months Grid (4 cols x 3 rows)
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const colW = 54;
    const rowH = 34;
    const startX = 18;
    const startY = calBoxY + 24;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const mIdx = r * 4 + c;
        const mx = startX + c * colW;
        const my = startY + r * rowH;

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(mx, my, colW - 2, rowH - 2);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(months[mIdx], mx + (colW - 2) / 2, my + 9);

        // Simulated day dots
        for (let week = 0; week < 3; week++) {
          const dy = my + 14 + week * 5;
          ctx.fillStyle = '#ef4444'; // Sunday
          ctx.fillRect(mx + 4, dy, 4, 3);

          ctx.fillStyle = '#64748b'; // Weekdays
          for (let d = 1; d < 6; d++) {
            ctx.fillRect(mx + 4 + d * 7.5, dy, 4, 3);
          }
        }
      }
    }

    // 8. Footer Sponsor & Phone
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PNEUS • SUSPENSÃO • FREIOS • ALINHAMENTO', 128, 476);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FONE: (011) 3975-BETO • PIRITUBA / SP', 128, 492);

    // 9. Realistic Pushpins in 4 corners
    [
      [14, 14], [242, 14], [14, 498], [242, 498]
    ].forEach(([px, py]) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(px + 1.5, py + 1.5, 4.5, 0, Math.PI * 2);
      ctx.fill();

      const pinGrad = ctx.createRadialGradient(px - 1, py - 1, 1, px, py, 4);
      pinGrad.addColorStop(0, '#ffffff');
      pinGrad.addColorStop(0.5, '#cbd5e1');
      pinGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = pinGrad;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 10. Grease smudge in corner
    ctx.fillStyle = 'rgba(40, 30, 20, 0.35)';
    ctx.beginPath();
    ctx.ellipse(230, 485, 14, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();

    const texture = this.toThreeTexture(canvas, 1, 1);
    this.cache[key] = texture;
    return texture;
  }
}


