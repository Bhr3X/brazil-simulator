#!/usr/bin/env node

import { FlowMusicPilot } from './flow_pilot.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const MEDIA_DIR = path.join(ROOT, 'Studio MKT', 'media');

export const TRACK_SPECS = [
  {
    id: 'sertanejo',
    styleName: 'Sertanejo Sofrência de Boteco',
    prompt: `Authentic Brazilian Sertanejo Romântico and Modão de Boteco (in the style of classic 90s/2000s Chitãozinho & Xororó and Zezé di Camargo).
Instrumentation: Weeping acoustic accordion (sanfona), traditional 12-string acoustic guitar (viola caipira), acoustic rhythm guitar, emotional dual-harmony male vocals with dramatic vibrato, slow waltz/guarânia tempo (~84 BPM).
Mood: Heartbreaking, melodramatic, alcohol-soaked barroom sorrow, utterly serious and passionate Brazilian sofrência.
Lyrics: Portuguese lyrics about heartbreak in a simulation:

[Intro]
(Solo de sanfona bem chorosa e ponteado de viola caipira)
Garçom, desce mais uma dose aí...
Que hoje o servidor caiu na minha mesa.

[Verso 1]
Eu tô sentado no boteco da memória RAM
Olhando a foto que você tirou no feed
Nosso amor não resistiu ao rollback das seis da manhã
O seu perfil sumiu, ninguém mais me divide...

[Refrão]
E agora eu choro em código binário!
Bebendo cachaça na beira do balcão!
O garçom é um NPC que não entende a minha dor!
Quem foi que deletou esse nosso grande amor?
(Sanfona chora no solo)
Quem foi que desinstalou meu coração?

[Verso 2]
O asfalto lá fora tá piscando sem textura
A chuva cai em linha reta no meu chapéu
Viver nessa simulação sem você é uma tortura
Prefiro dar reboot e ir direto pro céu!

[Refrão]
E agora eu choro em código binário!
Bebendo cachaça na beira do balcão!
O garçom é um NPC que não entende a minha dor!
Quem foi que deletou esse nosso grande amor?
Quem foi que desinstalou meu coração?`
  },
  {
    id: 'forro',
    styleName: 'Forró Pé de Serra / Xote',
    prompt: `Authentic Brazilian Forró Pé de Serra and Xote Nordestino (in the style of Luiz Gonzaga, Dominguinhos, and Falamansa).
Instrumentation: Lively virtuoso accordion (sanfona afinada), traditional zabumba drum with deep syncopated bass, crisp metallic triângulo, rhythmic acoustic nylon guitar, warm charismatic male lead vocal with backing chorus.
Tempo: Joyful, relaxed, swinging dance tempo (~96 BPM).
Mood: Festive, heartwarming, romantic, traditional Northeast Brazil dancehall vibe (CTN / Feira de São Paulo).
Lyrics: Portuguese lyrics about dancing in a glitchy simulation:

[Intro]
(Sanfona puxando o fole com zabumba e triângulo estalando)
Segura o fole, meu compadre!
Que em Pirituba o xote não para nem com tela azul!

[Verso 1]
Pisei no barro da feira e o chão sumiu
Olhei pro céu de repente e o sol subiu
O algoritmo errou a conta do baião
Mas eu puxei a morena pela mão!

[Refrão]
Puxa o fole, sanfoneiro, que o mapa tá sem chão!
Dança um xote agarradinho com o boneco sem feição!
Se o servidor der lag, tu não solta da morena!
Viver nessa Matrix é um amor que vale a pena!
(Triângulo e sanfona aceleram)
Ai, ai, ai, viver nessa Matrix vale a pena!

[Verso 2]
O triângulo tá tinindo em 60 FPS
O coração dispara, a saudade não esquece
Não tem bug nem travada que desfaça esse forró
Até raiar o dia nós arrasta o mocotó!

[Refrão]
Puxa o fole, sanfoneiro, que o mapa tá sem chão!
Dança um xote agarradinho com o boneco sem feição!
Se o servidor der lag, tu não solta da morena!
Viver nessa Matrix é um amor que vale a pena!`
  },
  {
    id: 'carnaval',
    styleName: 'Samba-Enredo de Carnaval',
    prompt: `Epic Brazilian Carnaval Samba-Enredo (in the grand tradition of São Paulo and Rio Sambódromo Samba Schools like Vai-Vai and Mangueira).
Instrumentation: Massive authentic samba school drum battery (bateria pesada com surdos de primeira e segunda, caixas de guerra, repiques, tamborins sincopados, cuíca e agogô), driving virtuoso cavaquinho, powerful raspy parade lead singer (puxador de samba) with a massive crowd chorus singing the refrains.
Tempo: Fast, driving, triumphant samba-enredo tempo (~140 BPM).
Mood: Glorious, majestic, overwhelming carnival celebration, stadium energy.
Lyrics: Poetic Portuguese lyrics comparing the illusion of Carnival to a simulation:

[Intro]
(Alô bateria! Segura o repique! Cavaquinho chora!)
Olha a ilusão passando na avenida!
Explode comunidade!

[Verso 1]
Desperta o sonho na tela pintada
Passa a mulata em wireframe prateada
A fantasia é feita de pura ilusão
O povo canta no compasso do milhão!
Na arquibancada a poeira vai subir
Nenhum programador vai me impedir de sorrir!

[Refrão]
Explode coração! Na avenida do byte!
Minha escola desfila no mapa sem light!
Quem te viu, quem te vê, no render final...
É o Tigre da Ilusão no maior Carnaval!
(Rufam os tambores, surdo bate no peito)
É o Tigre da Ilusão no maior Carnaval!

[Verso 2]
Raiou o sol no horizonte pixelado
Deixo meu pranto na cinza do passado
Se a vida é sonho, eu sou a bateria
Bate tambor até o fim da utopia!

[Refrão]
Explode coração! Na avenida do byte!
Minha escola desfila no mapa sem light!
Quem te viu, quem te vê, no render final...
É o Tigre da Ilusão no maior Carnaval!`
  },
  {
    id: 'partido_alto',
    styleName: 'Samba de Raiz / Partido Alto',
    prompt: `Authentic Brazilian Samba de Raiz and Partido Alto (in the legendary style of Fundo de Quintal, Zeca Pagodinho, and Beth Carvalho).
Instrumentation: Crisp cavaquinho, banjinho com palheta, repique de mão swingado, tantã de marcação no fundo, pandeiro solto, coro de boteco batendo palma na mesa com cerveja gelada.
Tempo: Laid-back, groovy, swinging samba cadence (~98 BPM).
Mood: Witty, warm, unpretentious, friendly backyard barbecue, laughing off life's absurdities with authentic Brazilian malandragem.
Lyrics: Witty Portuguese lyrics about weird NPCs in the neighborhood:

[Intro]
(Palmas ritmadas de mesa de bar, solo malandro de bandolim e cavaquinho)
Olha aí... Esse Zé da esquina tá esquisito hoje, rapaz.
Bota uma cerveja aí na mesa pro homem reiniciar!

[Verso 1]
Olha o vacilo desse tal de NPC
Tá parado na calçada sem saber o que fazer
Perguntei pro camarada onde fica o boteco
Ele travou o pescoço e começou a dar teco-teco!
Ficou repetindo a mesma frase do roteiro
Dizendo que o pastel tava pronto no tabuleiro!

[Refrão]
Deixa o boneco lá, vem pro samba de quintal!
Nesse pagode malandro não tem bug nem sinal!
Toma uma gelada pra curar a conexão
Que a vida é mais bonita batendo na palma da mão!
(Coro) Batendo na palma da mão!

[Verso 2]
O garçom trouxe a conta com três zeros a mais
Disse que a inflação tá no código dos pais
Eu dei uma risada, puxei meu cavaquinho
Paguei em moeda falsa e saí de mansinho!

[Refrão]
Deixa o boneco lá, vem pro samba de quintal!
Nesse pagode malandro não tem bug nem sinal!
Toma uma gelada pra curar a conexão
Que a vida é mais bonita batendo na palma da mão!`
  },
  {
    id: 'axe',
    styleName: 'Axé Music / Micareta Anos 90',
    prompt: `Classic 90s Brazilian Axé Music and Micareta anthem (in the iconic style of Chiclete com Banana, Asa de Águia, and Banda Eva).
Instrumentation: Explosive Salvador Afro-pop percussion (timbales, repiques, surdos de axé), punchy brass section (trumpets and saxophones), bright clean chorus electric guitar riffs, bouncy synth bass, euphoric energetic male lead singer shouting to the crowd.
Tempo: Energetic, driving street carnival tempo (~132 BPM).
Mood: Pure sunshine, ecstatic, 100% joyful party madness, thousands of people jumping behind the sound truck (trio elétrico).
Lyrics: Portuguese lyrics about jumping in the simulation crowd:

[Intro]
(Timbales rufando em alta energia, metais atacam!)
Alô meu trio elétrico!
Pirituba virou Salvador!
Quero ver todo mundo pulando no glitch!
Sai do chão!

[Verso 1]
O sol nasceu mais quente do que devia
A luz bateu na tela em plena alegria
Atrás do caminhão vem a massa a cantar
Não tem tela de loading que vai me segurar!

[Refrão]
Pula, pula no glitch! Quero ver sair do chão!
O trio elétrico sumiu na renderização!
Não tem firewall que segure esse calor!
Balança a poeira, esquece o processador!
(Metais explodem)
Balança a poeira, esquece o processador!

[Verso 2]
Vem no arrastão, pega na cintura
Essa micareta é pura loucura
Se acabar a luz e o jogo reiniciar
Amanhã nós pula tudo de novo no mesmo lugar!

[Refrão]
Pula, pula no glitch! Quero ver sair do chão!
O trio elétrico sumiu na renderização!
Não tem firewall que segure esse calor!
Balança a poeira, esquece o processador!`
  },
  {
    id: 'brega',
    styleName: 'Brega Romântico / Calypso',
    prompt: `Authentic Brazilian Brega Romântico and Brega Pop (in the timeless style of Reginaldo Rossi and Wanderley Andrade).
Instrumentation: Weeping, melodic lead electric guitar soaked in delay and vibrato, vintage 90s arranger keyboard strings and synth-brass, dramatic danceable cabaret/brega drumbeat with 80s snare reverb, deeply passionate and theatrical male vocals.
Tempo: Melodramatic, slow-dance cabaret groove (~92 BPM).
Mood: Heart-wrenching melodrama, smoky night club counter, hopeless romance, unapologetic Brazilian kitsch glory.
Lyrics: Dramatic Portuguese lyrics about a lover who logged out:

[Intro]
(Guitarra brega chorosa solando com muito vibrato e eco)
Garçom... Por favor, meu amigo...
Mais uma garrafa de Dreher na mesa dois.

[Verso 1]
Eu te procurei por todo esse cenário
Passei pelas avenidas desse mundo ordinário
No bar da esquina disseram que você sumiu
Deu logout na minha vida e nem se despediu!

[Refrão]
Garçom, me reinicia que eu não aguento a dor!
Minha morena foi embora e me desinstalou!
Se eu sou só um código jogado ao léu
Por que sinto a lágrima caindo do meu chapéu?
(Solo dramático de guitarra)
Por que essa saudade não cabe no servidor?

[Verso 2]
O copo tá cheio, a cabeça tá tonta
O sistema me cobra uma amarga conta
Você era a luz do meu monitor
E agora sobrou só a sombra do amor!

[Refrão]
Garçom, me reinicia que eu não aguento a dor!
Minha morena foi embora e me desinstalou!
Se eu sou só um código jogado ao léu
Por que sinto a lágrima caindo do meu chapéu?
Por que essa saudade não cabe no servidor?`
  },
  {
    id: 'rap_sp',
    styleName: 'Rap Nacional SP Anos 90',
    prompt: `Classic 90s São Paulo Underground Hip-Hop and Rap Nacional (in the grim, gritty, conscious style of Racionais MC's, Sabotage, and Facção Central).
Instrumentation: Heavy, unhurried boom-bap drum loop (crisp crack of the snare, deep punchy kick at ~86 BPM), dark analog sub-bass, mournful chopped soul piano / Rhodes keyboard chords, vinyl crackle and record scratches.
Vocals: Deep, serious, authoritative, narrative street monologue delivered by a charismatic São Paulo MC with authentic peripheral slang.
Mood: Nocturnal, atmospheric, cinematic, raw street realism, philosophical survival in the concrete jungle of SP.
Lyrics: Portuguese conscious rap lyrics about surviving the simulation:

[Intro]
(Chiado de vinil, sirene de viatura ao longe, piano melancólico)
É... Pirituba, Zona Oeste de São Paulo.
Garoa fina na ponte da Paula Ferreira.
Mais uma noite no labirinto.
Sobreviver aqui não é videogame... Ou será que é?

[Verso 1]
Três horas da manhã, o farol tá piscando amarelo
O asfalto molhado reflete meu rosto singelo
Olho pro céu cinzento, as nuvens parecem coladas
Gente invisível cruzando as mesmas calçadas
Dizem que o destino tá escrito na memória do chip
Mas o sofrimento da quebrada não é script
O irmão que tá caído na esquina não é pixel, não
É sangue, suor, poeira e indignação.

[Refrão]
Quem programou essa selva de concreto e dor?
Esqueceu de botar luz na tela do trabalhador!
Mas nois segue de pé, driblando a ilusão
Sobrevivência pura no peito do irmão!
(Scratch de vinil: "Sobrevivência... no peito do irmão!")

[Verso 2]
A vida não tem save point nem vida infinita
Cada passo em falso a matrix te frita
Eu sigo na fé, com Deus no pensamento
Desviando das armadilhas do procedimento
Pirituba acorda cedo pro trem lotado
Na luta de quem nunca foi formatado!

[Refrão]
Quem programou essa selva de concreto e dor?
Esqueceu de botar luz na tela do trabalhador!
Mas nois segue de pé, driblando a ilusão
Sobrevivência pura no peito do irmão!`
  },
  {
    id: 'chorinho',
    styleName: 'Chorinho Tradicional',
    prompt: `Traditional Brazilian Choro / Chorinho (in the virtuosic heritage of Pixinguinha, Jacob do Bandolim, and Waldir Azevedo).
Instrumentation: Sparkling acoustic cavaquinho, agile virtuosic mandolin (bandolim), 7-string Brazilian nylon acoustic guitar playing rapid counter-melodic basslines (baixarias), sweet wooden transverse flute (flauta doce), and delicate crisp pandeiro.
Tempo: Lively, intricate, jaunty, dancing choro rhythm (~110 BPM).
Mood: Joyful, sophisticated, nostalgic, deeply Brazilian bohemian café culture.
Lyrics: Lighthearted, poetic Portuguese lyrics about a band trapped in musical harmony:

[Intro]
(Fraseio brilhante de bandolim com baixaria do violão de 7 cordas e pandeiro)

[Verso 1]
Ouça o choro do bandolim
Que desce a ladeira em espiral
Não tem começo nem tem fim
Nesse compasso atemporal
O flautista perdeu a partitura
Mas o violão achou a curva!

[Refrão]
Chora cavaquinho no meio do salão!
A melodia é pura ilusão!
Se a nota escapa o pandeiro segura
Viver nesse choro é uma doçura!
(Flauta e bandolim dobram a melodia com pandeiro)
Viver nesse choro é uma doçura!

[Verso 2]
Sete cordas no grave a caminhar
Nem o computador sabe onde vai parar
Toca Pixinguinha pro mundo esquecer
Que a vida é um segundo a renderizar!

[Refrão]
Chora cavaquinho no meio do salão!
A melodia é pura ilusão!
Se a nota escapa o pandeiro segura
Viver nesse choro é uma doçura!`
  },
  {
    id: 'manguebeat',
    styleName: 'Manguebeat / Maracatu Atômico',
    prompt: `Authentic 90s Recife Manguebeat (in the legendary explosive style of Chico Science & Nação Zumbi).
Instrumentation: Thunderous acoustic Maracatu alfaia bass drums (graves pesados batendo o baque virado), driving distorted funk bassline, abrasive funk-rock electric guitar with wah-wah and phaser, traditional agbê shaker, powerful rhythmic chanted vocals (embolada meeting urban rap).
Tempo: Heavy, syncopated, tribal-cybernetic groove (~100 BPM).
Mood: Raw, futuristic, rebellious, high energy, the collision of ancient Brazilian swamp mud with microchips and satellites.
Lyrics: Portuguese lyrics fusing mud and digital circuits:

[Intro]
(Alfaias de maracatu trovejando no peito, guitarra distorcida uivando no wah-wah)
Modernizar o passado é uma evolução musical!
Cadê as notas? O computador entrou na lama!

[Verso 1]
O caranguejo passeia na fiação de cobre
A antena parabólica enfiada no mangue nobre
Da lama ao byte, do byte ao coração
O circuito queimou na beira da estacão!
Um passo à frente e você não está mais no mesmo lugar!
Quem é que vai me renderizar?

[Refrão]
Caranguejo com chip no meio da maré!
O servidor quebra na sola do meu pé!
Baque virado estremece o transistor!
A lama é mais forte que o seu processador!
(Alfaias explodem no baque virado)
Mais forte que o seu processador!

[Verso 2]
Cidade estendida na margem do canal
Homens e máquinas num transe sem igual
Eu finco minha antena no centro do asfalto
Pro meu maracatu voar bem alto!

[Refrão]
Caranguejo com chip no meio da maré!
O servidor quebra na sola do meu pé!
Baque virado estremece o transistor!
A lama é mais forte que o seu processador!`
  },
  {
    id: 'rock_80s',
    styleName: 'Rock Nacional Anos 80',
    prompt: `Classic 80s Brazilian Rock Nacional and Post-Punk (in the iconic style of Titãs, Legião Urbana, Paralamas do Sucesso, and Barão Vermelho).
Instrumentation: Punchy overdrive rhythm guitars, melodic driving electric bass, tight acoustic rock drum kit with gated snare reverb, passionate, cynical and poetic lead male vocals with raw conviction.
Tempo: Energetic, driving post-punk / rock tempo (~126 BPM).
Mood: Urban angst, poetic reflection, rebellious questioning of society and reality on a rainy São Paulo day.
Lyrics: Thoughtful Portuguese rock lyrics about living in a scripted world:

[Intro]
(Riff direto de guitarra com overdrive, baixo marcante e bateria seca)

[Verso 1]
Eu saio na rua e o roteiro tá pronto
O homem de terno contando mais um conto
As lojas abrem no mesmo minuto
Eu tomo meu café em meio ao luto
Eles dizem que amanhã vai melhorar
Mas esqueceram de nos atualizar!

[Refrão]
Aperte o reset, me diga quem sou!
Num mundo inventado que nunca salvou!
Ninguém tem as chaves dessa prisão
Onde o sonho é vendido em prestação!
(Solo direto de guitarra rock)
Em prestação!

[Verso 2]
A televisão repete o mesmo sinal
Um comercial fingindo ser normal
Mas o meu peito ainda bate de verdade
Apesar de toda essa falsidade!

[Refrão]
Aperte o reset, me diga quem sou!
Num mundo inventado que nunca salvou!
Ninguém tem as chaves dessa prisão
Onde o sonho é vendido em prestação!
Onde o sonho é vendido em prestação!`
  }
];

async function generateSpec(spec, pilot) {
  console.log(`\n======================================================`);
  console.log(`🎵 Generating: ${spec.styleName} (${spec.id})`);
  console.log(`======================================================`);

  console.log(`[Batch] Opening new session...`);
  await pilot.newSession();
  await new Promise(r => setTimeout(r, 2000));

  console.log(`[Batch] Submitting prompt...`);
  await pilot.sendPrompt(spec.prompt);

  console.log(`[Batch] Waiting for generation to complete (65s)...`);
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

  console.log(`[Batch] Downloading generated track into ${MEDIA_DIR}...`);
  try {
    const res = await pilot.downloadLatestGenerated('MP3', MEDIA_DIR);
    console.log(`[Batch] Downloaded:`, res);
  } catch (err) {
    console.error(`[Batch Error downloading]: ${err.message}`);
  }
}

async function main() {
  const arg = process.argv[2] || '0';
  const endArg = process.argv[3];
  const pilot = new FlowMusicPilot();
  await pilot.connect();

  let indices = [];
  if (arg === 'all') {
    indices = TRACK_SPECS.map((_, i) => i);
  } else if (arg.includes('..')) {
    const [s, e] = arg.split('..').map(Number);
    for (let i = s; i <= e && i < TRACK_SPECS.length; i++) indices.push(i);
  } else if (endArg !== undefined) {
    const s = parseInt(arg, 10);
    const e = parseInt(endArg, 10);
    for (let i = s; i <= e && i < TRACK_SPECS.length; i++) indices.push(i);
  } else {
    const idx = parseInt(arg, 10);
    if (isNaN(idx) || idx < 0 || idx >= TRACK_SPECS.length) {
      console.error(`Invalid track index: ${arg}. Must be 0 to ${TRACK_SPECS.length - 1} or "all"`);
      process.exit(1);
    }
    indices = [idx];
  }

  for (const idx of indices) {
    console.log(`\n>>> Starting track ${idx + 1} of ${TRACK_SPECS.length} [${TRACK_SPECS[idx].id}] <<<`);
    await generateSpec(TRACK_SPECS[idx], pilot);
    console.log(`>>> Sleeping 6s before next session <<<`);
    await new Promise(r => setTimeout(r, 6000));
  }

  pilot.close();
  console.log(`\n[Batch] Finished.`);
}

if (process.argv[1] && process.argv[1].endsWith('batch_music_generator.mjs')) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
