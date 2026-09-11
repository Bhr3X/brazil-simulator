import { FlowMusicPilot } from './flow_pilot.mjs';

const prompt = `Short professional Brazilian FM radio station ID sweeper and jingle (Vinheta de rádio).
Voice & Sound: Deep, smooth, velvety radio announcer voice in Portuguese with classic radio reverb and elegant synth chime: "Alfa FM Pirituba... cento e quatro ponto sete megabytes. A primeira a carregar as texturas da sua mente."
Duration: Short 5 to 10 seconds station identification jingle.`;

async function test() {
  const pilot = new FlowMusicPilot();
  await pilot.connect();
  console.log('Creating new session for vinheta...');
  await pilot.newSession();
  await new Promise(r => setTimeout(r, 2000));
  console.log('Submitting vinheta prompt...');
  await pilot.sendPrompt(prompt);
  console.log('Waiting for Producer (45s)...');
  await pilot.monitor(45);
  pilot.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
