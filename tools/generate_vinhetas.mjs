#!/usr/bin/env node

import { FlowMusicPilot } from './flow_pilot.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const VINHETAS_DIR = path.join(ROOT, 'Studio MKT', 'media', 'vinhetas');

const SPECS = [
  {
    id: 'plantao_urgente',
    name: 'Plantão de Notícias Urgente',
    prompt: `Dramatic Brazilian radio breaking news opening stinger and vinheta (Plantão Urgente de Rádio).
Sounds & Music: Intense urgent brass fanfare, fast rolling timpani and snare drums, electronic radio alert beeps, dramatic Brazilian news anchor voice: "Atenção! Repita! Plantão de Notícias da Rede Simulação em Pirituba!"
Duration: Short 5 to 8 seconds breaking news intro stinger.`
  },
  {
    id: 'previsao_tempo',
    name: 'Previsão do Tempo',
    prompt: `Catchy Brazilian FM radio weather forecast jingle and station sweeper (Vinheta de Previsão do Tempo).
Sounds & Music: Light acoustic guitar strum, airy synth chime, upbeat morning radio jingle with smooth voice: "Previsão do tempo na Rádio Simulação... O clima no seu servidor!"
Duration: Short 5 to 8 seconds weather intro jingle.`
  },
  {
    id: 'transmatrix_fm',
    name: 'TransMatrix FM 99.7',
    prompt: `High-energy Brazilian FM radio station ID and sweeper (Vinheta Transamérica / Jovem Pan style).
Sounds & Music: Punchy electric guitar power chord, energetic whoosh sound effect, powerful enthusiastic radio DJ voice: "TransMatrix FM! Conectando o seu processador no volume máximo!"
Duration: Short 5 to 8 seconds radio sweeper.`
  }
];

async function main() {
  const pilot = new FlowMusicPilot();
  await pilot.connect();

  for (let i = 0; i < SPECS.length; i++) {
    const spec = SPECS[i];
    console.log(`\n======================================================`);
    console.log(`📻 Generating Vinheta: ${spec.name} (${spec.id})`);
    console.log(`======================================================`);

    await pilot.newSession();
    await new Promise(r => setTimeout(r, 2000));

    await pilot.sendPrompt(spec.prompt);
    console.log(`[Vinheta] Waiting 50s for generation...`);
    await pilot.monitor(50);

    // Download latest
    try {
      const res = await pilot.downloadLatestGenerated('MP3', VINHETAS_DIR);
      console.log(`[Vinheta] Downloaded:`, res);
    } catch (e) {
      console.error(`[Vinheta Download Error]: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 5000));
  }

  pilot.close();
  console.log(`\n[Vinhetas] All vinhetas generated.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
