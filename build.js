const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function cleanModule(code) {
  return code
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s*\{[^}]*\};?\r?\n?/g, '')
    .replace(/import\s+[^;]+;\r?\n?/g, '');
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function bundle() {
  const threeJs = read('libs/three.min.js');
  const css = read('style.css');

  // Modular code in strict dependency order:
  // 1. Core Utilities & Audio
  const rng = cleanModule(read('src/game/Rng.js'));
  const textures = cleanModule(read('src/world/Textures.js'));
  const physics = cleanModule(read('src/engine/Physics.js'));
  const music = cleanModule(read('src/audio/BrazilianMusic.js'));
  const audio = cleanModule(read('src/audio/SoundEngine.js'));
  const zones = cleanModule(read('src/world/Zones.js'));

  // 2. Engine & Controls
  const controls = cleanModule(read('src/engine/Controls.js'));
  const touch = cleanModule(read('src/engine/TouchControls.js'));
  const renderer = cleanModule(read('src/engine/Renderer.js'));
  const traffic = cleanModule(read('src/engine/TrafficSystem.js'));
  const city = cleanModule(read('src/world/CityBuilder.js'));

  // 3. Game State & Roguelite Logic
  const classes = cleanModule(read('src/game/Classes.js'));
  const clock = cleanModule(read('src/game/RunClock.js'));
  const state = cleanModule(read('src/game/GameState.js'));
  const dayCycle = cleanModule(read('src/game/DayCycle.js'));
  const props = cleanModule(read('src/game/Props.js'));
  const dialog = cleanModule(read('src/game/Dialog.js'));
  const encounters = cleanModule(read('src/game/Encounters.js'));
  const npcs = cleanModule(read('src/game/NpcSystem.js'));
  const interactables = cleanModule(read('src/game/Interactables.js'));
  const hud = cleanModule(read('src/game/HudGame.js'));
  const gameManager = cleanModule(read('src/game/GameManager.js'));

  // 4. Main Application Entry Point
  const main = cleanModule(read('src/main.js'));

  // Extract HTML body content from index.html (everything between <body> and <script type="module">)
  const indexHtml = read('index.html');
  const bodyMatch = indexHtml.match(/<body>([\s\S]*?)<script type="module"/);
  if (!bodyMatch) {
    throw new Error('Could not parse index.html body content');
  }
  const bodyMarkup = bodyMatch[1].trim();

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brazil Simulator: Sobrevivência SP // Pirituba 3D & ASCII</title>
  <style>
${css}
  </style>
  <script>
${threeJs}
  </script>
</head>
<body>
${bodyMarkup}

  <script>
${rng}
${textures}
${physics}
${music}
${audio}
${zones}
${controls}
${touch}
${renderer}
${traffic}
${city}
${classes}
${clock}
${state}
${dayCycle}
${props}
${dialog}
${encounters}
${npcs}
${interactables}
${hud}
${gameManager}
${main}
  </script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, 'pirituba_standalone.html'), html, 'utf8');
  const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`Successfully generated pirituba_standalone.html (${sizeKb} KB)`);
}

if (require.main === module) {
  bundle();
}

module.exports = { bundle };
