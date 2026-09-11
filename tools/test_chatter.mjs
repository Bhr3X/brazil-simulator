import { FlowMusicPilot } from './flow_pilot.mjs';

const prompt = `Realistic ambient audio and background chatter inside a traditional Brazilian boteco (bar) in São Paulo.
Sounds & Voices: Multiple men chatting and laughing in colloquial Brazilian Portuguese, talking about soccer and neighborhood news, shouting "Desce mais uma gelada!", clinking beer glasses, wooden domino tiles slamming on tables, billiard / sinuca balls clicking, background street noise outside.
Format: Atmospheric environmental chatter and field recording soundscape, natural room reverberation, realistic dialogue without musical accompaniment.`;

async function test() {
  const pilot = new FlowMusicPilot();
  await pilot.connect();
  console.log('Creating new session...');
  await pilot.newSession();
  await new Promise(r => setTimeout(r, 2000));
  console.log('Submitting boteco chatter prompt...');
  await pilot.sendPrompt(prompt);
  console.log('Waiting for Producer (55s)...');
  await pilot.monitor(55);
  pilot.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
