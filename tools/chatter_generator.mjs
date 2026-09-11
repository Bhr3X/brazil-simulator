#!/usr/bin/env node

import { FlowMusicPilot } from './flow_pilot.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const AMBIENCE_DIR = path.join(ROOT, 'Studio MKT', 'media', 'ambience');

export const CHATTER_SPECS = [
  {
    id: 'briga_discussao',
    name: 'Discussão de Rua e Bar (Street Argument)',
    prompt: `Dramatic realistic ambient audio of a heated street argument and bar dispute outside a boteco in São Paulo, Brazil.
Sounds & Dialogue: Two aggressive men shouting in colloquial São Paulo Brazilian Portuguese and street slang ("Tá me tirando, mano?!", "Qual é a sua, truta?!", "Cê tá louco, rapaz?!", "Segura ele aí, rapaziada!"), bystanders trying to separate them, wooden chairs scraping on the sidewalk, beer bottles clinking, heavy shuffling footsteps, tense crowd reactions.
Format: Immersive realistic environmental soundscape and field recording, natural street acoustic reverb, no music, pure dramatic spoken confrontation and street tension.`
  },
  {
    id: 'enquadro_policia',
    name: 'Enquadro da Polícia Militar (Police Shouting & Siren)',
    prompt: `Realistic dramatic street audio recording of a São Paulo police traffic stop and street search (Enquadro da Polícia Militar).
Sounds & Dialogue: Stern police officers shouting authoritative commands in Brazilian Portuguese ("Mão na cabeça! Encosta na parede!", "Abre as pernas!", "Fica parado! Não se mexe!"), police cruiser siren whoop (sirene da viatura da PM), crackling police two-way radio dispatch chatter with static bursts, car doors slamming, asphalt footsteps, intense urban tension.
Format: Realistic ambient audio field recording, authentic urban reverberation, no music, pure atmospheric law enforcement dialogue and sirens.`
  },
  {
    id: 'conversa_calcada',
    name: 'Papo de Calçada e Quebrada (Sidewalk Banter)',
    prompt: `Relaxed natural ambient conversation between neighborhood friends hanging out on a sidewalk corner in São Paulo (Pirituba).
Sounds & Dialogue: Young men and women chatting in colloquial São Paulo Portuguese, greeting each other warmly ("E aí, mano, beleza?", "Firmeza total!", "Tranquilo?"), casual laughter, talking about everyday life, bus and train commutes, distant motorcycle engine revving (moto cortando giro ao longe), distant barking dog, birds chirping on telephone wires, footsteps.
Format: Intimate, realistic ambient field recording and pedestrian dialogue, natural urban soundscape without music.`
  },
  {
    id: 'feira_ambulante',
    name: 'Feira Livre e Vendedor Ambulante (Street Vendor)',
    prompt: `Vibrant authentic street recording of a busy São Paulo street market (Feira Livre) and street vendor.
Sounds & Dialogue: Loud, charismatic Brazilian street vendors shouting their products in Portuguese ("Olha a água mineral gelada!", "Três bala por cinco real!", "Pastel de queijo e carne quentinho freguês!"), crowd murmuring, coins jingling, plastic bags rustling, sizzling hot pastel oil, vibrant neighborhood morning atmosphere.
Format: Realistic environmental field recording of Brazilian street commerce and vocal calls, no music.`
  }
];

async function generateChatter(spec, pilot) {
  console.log(`\n======================================================`);
  console.log(`🗣️ Generating: ${spec.name} (${spec.id})`);
  console.log(`======================================================`);

  console.log(`[Chatter] Opening new session via navigate...`);
  await pilot.newSession();
  await new Promise(r => setTimeout(r, 2000));

  console.log(`[Chatter] Submitting prompt...`);
  await pilot.sendPrompt(spec.prompt);

  console.log(`[Chatter] Waiting for generation to complete (65s)...`);
  await pilot.monitor(65);

  // Ensure card is rendered
  for (let i = 0; i < 20; i++) {
    const hasMore = await pilot.evaluate(`
      Array.from(document.querySelectorAll('button')).some(b => b.getAttribute('aria-label')?.includes('More options'))
    `);
    if (hasMore) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  await new Promise(r => setTimeout(r, 2000));

  console.log(`[Chatter] Downloading generated audio into ${AMBIENCE_DIR}...`);
  try {
    const res = await pilot.downloadLatestGenerated('MP3', AMBIENCE_DIR);
    console.log(`[Chatter] Downloaded:`, res);
  } catch (err) {
    console.error(`[Chatter Error downloading]: ${err.message}`);
  }
}

async function main() {
  const arg = process.argv[2] || 'all';
  const pilot = new FlowMusicPilot();
  await pilot.connect();

  let indices = [];
  if (arg === 'all') {
    indices = CHATTER_SPECS.map((_, i) => i);
  } else {
    const idx = parseInt(arg, 10);
    indices = [idx];
  }

  for (const idx of indices) {
    console.log(`\n>>> Starting Chatter ${idx + 1} of ${CHATTER_SPECS.length} [${CHATTER_SPECS[idx].id}] <<<`);
    await generateChatter(CHATTER_SPECS[idx], pilot);
    console.log(`>>> Sleeping 6s before next session <<<`);
    await new Promise(r => setTimeout(r, 6000));
  }

  pilot.close();
  console.log(`\n[Chatter] All chatter generation finished.`);
}

if (process.argv[1] && process.argv[1].endsWith('chatter_generator.mjs')) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
