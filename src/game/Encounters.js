/**
 * Brazilian Encounters Scripts & Decision Trees
 * Invariant I5: Actions and prompts share single evaluation predicates.
 * All outcomes affect GameState atomically via apply(deltas, reason).
 */

import { GameState } from './GameState.js';

export const BRAZILIAN_ENCOUNTERS = {
  PADARIA_ESTRELA: {
    id: 'PADARIA_ESTRELA',
    title: '🥖 PADARIA ESTRELA DE PIRITUBA',
    getIntroText: (state) => `
      O aroma de pão francês quentinho e café coado invade a calçada.<br>
      O balconista de avental branco manchado de café pergunta com voz rouca:<br>
      <em>"— Fala chefe, vai ser o de sempre na chapa?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'pingado_pao',
        label: 'Pingado no copo americano + Pão na chapa crocante',
        costLabel: 'R$ 7,50',
        costCentavos: 750,
        disabled: !state.canAfford(750),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -750, fome: 30, sanidade: 18 }, 'Café da manhã na Padaria Estrela');
          return 'O pão na chapa veio com aquela crosta estalando de manteiga derretida e o pingado desceu redondo. Bucho cheio (+30%) e Sanidade renovada (+18%).';
        }
      },
      {
        id: 'coxinha_estufa',
        label: 'Coxinha de frango com catupiry da estufa + Caldo de cana',
        costLabel: 'R$ 11,00',
        costCentavos: 1100,
        disabled: !state.canAfford(1100),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          const hasAzia = state.rng.chance(0.25);
          state.apply({
            grana: -1100,
            fome: 45,
            sanidade: hasAzia ? -10 : 15
          }, 'Coxinha com caldo de cana');

          return hasAzia
            ? 'A coxinha estava dourada, mas a gordura pesou na digestão. Ganhou 45% de bucho, mas bateu aquela queimação paulistana (-10% sanidade).'
            : 'Coxinha crocante, recheio farto e caldo de cana trincando de gelado com limão! Bucho quase cheio (+45%).';
        }
      },
      {
        id: 'nota_100',
        label: state.flags.tentouNota100
          ? 'Pagar com nota de R$ 100 (O caixa já te avisou que está sem troco hoje)'
          : 'Tentar pagar um cafezinho de R$ 3,00 com nota de R$ 100',
        costLabel: 'Teste de Ginga (1x por dia)',
        disabled: Boolean(state.flags.tentouNota100) || !state.canAfford(300),
        execute: (state, sound) => {
          const success = state.rng.chance(state.ginga / 100);
          if (success) {
            if (sound) sound.playCoin();
            state.apply({ grana: -300, fome: 15, sanidade: 10, ginga: 5, flags: { tentouNota100: true } }, 'Desenrolo na padaria com nota de cem');
            return 'O caixa deu aquela respirada funda, olhou feio, mas foi até o cofre e te deu R$ 97,00 em notas miúdas. Vitória do jeitinho (+5 Ginga)!';
          } else {
            state.apply({ sanidade: -12, ginga: -5, flags: { tentouNota100: true } }, 'Bronca do balconista');
            return '"— Brincadeira né patrão? Seis e meia da manhã e você me vem com nota de cem?! Tem Pix não?!" Você saiu de mãos vazias e com a orelha quente (-12% sanidade).';
          }
        }
      },
      {
        id: 'agua_copo',
        label: state.flags.aguaPadaria
          ? 'Pedir um copo d água da torneira (Já tomou seu copo de água hoje)'
          : 'Pedir um copo d água da torneira e olhar a vitrine',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.aguaPadaria),
        execute: (state) => {
          state.apply({ sanidade: 8, flags: { aguaPadaria: true } }, 'Copo d água no balcão');
          return 'O balconista te estendeu um copo descartável com água gelada. Deu uma refrescada nas ideias (+8% sanidade).';
        }
      },
      {
        id: 'pagar_boleto_enel',
        label: 'Pagar conta de luz Enel no Caixa Aqui da Padaria',
        costLabel: 'R$ 124,50',
        costCentavos: 12450,
        disabled: !state.canAfford(12450) || state.flags.boletoPago || !state.hasItem('boleto_enel'),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: -12450,
            sanidade: 35,
            removeInventoryId: 'boleto_enel',
            flags: { boletoPago: true }
          }, 'Pagamento da conta de luz Enel');
          return 'Comprovante autenticado no papel térmico! Alívio imenso: meta do dia cumprida com sucesso (+35% Sanidade)!';
        }
      },
      {
        id: 'fornada_cinco_manha',
        label: (() => {
          const isDawnFornada = state.currentHour >= 5.0 && state.currentHour < 6.0 && ((state.elapsedSeconds || 0) >= 700);
          if (!isDawnFornada) {
            return 'Primeira Fornada das 05h (Disponível exclusivamente na madrugada das 05:00 às 06:00)';
          }
          return state.flags.primeiraFornada
            ? 'Primeira Fornada das 05h (Cota aproveitada — fornada de amanhã às 5h)'
            : '🌅 Primeira Fornada do Dia (Pão Francês Quentinho das 05h) — R$ 5,00';
        })(),
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: (() => {
          const isDawnFornada = state.currentHour >= 5.0 && state.currentHour < 6.0 && ((state.elapsedSeconds || 0) >= 700);
          return !state.canAfford(500) || !isDawnFornada || Boolean(state.flags.primeiraFornada);
        })(),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -500, fome: 35, sanidade: 25, flags: { primeiraFornada: true } }, 'Primeira fornada das 5h');
          return '🌅 O padeiro tirou a assadeira de pão francês estalando de quente do forno a lenha! Cheiro de vitória, casquinha dourada crocante. Você sobreviveu à madrugada de Pirituba (+35% bucho, +25% Sanidade)!';
        }
      }
    ]
  },

  BAR_DO_TIAO: {
    id: 'BAR_DO_TIAO',
    title: '🍺 BAR DO TIÃO (BOTECO & SINUCA)',
    getIntroText: (state) => `
      O balcão de fórmica verde, o rádio chiando pagode antigo e o barulho de bolas de sinuca colidindo.<br>
      Seu Tião te cumprimenta com um pano de prato no ombro:<br>
      <em>"— Fala guerreiro! Mesa 1 tá livre e a cerveja tá no ponto da geleira. Vai mandar o quê?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Dívida/Fiado: ${state.formattedDebt}</small>
    `,
    getOptions: (state) => [
      {
        id: 'cerveja_600',
        label: 'Cerveja 600ml no copo americano com porção de torresmo',
        costLabel: 'R$ 13,00',
        costCentavos: 1300,
        disabled: !state.canAfford(1300),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playCanOpen(); }
          state.apply({ grana: -1300, sanidade: 35, fome: 15 }, 'Cerveja e torresmo no Tião');
          return 'Cerveja descendo redonda, espuma branca e torresmo crocante com limão cravo. Alívio total na alma (+35% Sanidade).';
        }
      },
      {
        id: 'desafio_sinuca',
        label: state.flags.sinucaWins >= 2
          ? 'Desafiar o Seu Tião na Sinuca (Tião recusou: "Vai quebrar a banca do bar?!")'
          : 'Desafiar o Seu Tião na Mesa de Sinuca valendo R$ 20,00',
        costLabel: 'Aposta: R$ 20,00',
        costCentavos: 2000,
        disabled: !state.canAfford(2000) || (state.flags.sinucaWins >= 2),
        execute: (state, sound) => {
          if (sound) sound.playSnookerHit();
          const winProb = (state.ginga * 0.5 + 20) / 100;
          const won = state.rng.chance(winProb);

          if (won) {
            if (sound) sound.playCoin();
            const wins = (state.flags.sinucaWins || 0) + 1;
            state.apply({
              grana: 2000,
              sanidade: 35,
              ginga: 8,
              flags: { sinucaWins: wins }
            }, 'Vitória na sinuca do Tião');
            return wins >= 2
              ? 'Você limpou a mesa com efeito! Seu Tião bateu o taco no chão: "— Chega garoto, duas vitórias seguidas! Vai quebrar a banca do bar? Vai gastar essa grana lá fora!" (+R$ 20,00).'
              : 'Você encaçapou a bola 8 no canto oposto! Os véios do bar aplaudiram e o Tião te pagou duas notas de dez contrariado (+R$ 20,00).';
          } else {
            state.apply({ grana: -2000, sanidade: -15 }, 'Derrota na sinuca');
            return 'Seu Tião não deu chance: trancou a branca na tabela e limpou a mesa. Perdeu a aposta de R$ 20,00 (-15% sanidade).';
          }
        }
      },
      {
        id: 'aposta_jogo_bicho',
        label: (state.flags.bichoBets >= 2)
          ? 'Apostar no Jogo do Bicho (Limite de 2 apostas por run atingido)'
          : 'Apostar R$ 5,00 no Jogo do Bicho (Grupo 17 Macaco / Grupo 13 Galo)',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500) || (state.flags.bichoBets >= 2),
        execute: (state, sound) => {
          const bets = (state.flags.bichoBets || 0) + 1;
          const sorteado = state.rng.int(1, 25);
          const escolheuMacaco = state.rng.chance(0.5);
          const grupoEscolhido = escolheuMacaco ? 17 : 13;
          const nomeBicho = escolheuMacaco ? 'MACACO (Gr. 17)' : 'GALO (Gr. 13)';

          if (sorteado === grupoEscolhido) {
            if (sound) sound.playCoin();
            state.apply({
              grana: 8500,
              sanidade: 45,
              ginga: 15,
              flags: { bichoBets: bets, ganhouBicho: true }
            }, 'Prêmio no Jogo do Bicho');
            return `🎉 DEU NA CABEÇA! O resultado das 18h cantou no rádio: DEU ${nomeBicho}! Seu Tião abriu a gaveta de madeira e te pagou R$ 90,00 em notas limpas! Alívio histórico (+R$ 85,00 líquidos, +45% Sanidade)!`;
          } else if (Math.abs(sorteado - grupoEscolhido) <= 2) {
            if (sound) sound.playCoin();
            state.apply({
              grana: 500,
              sanidade: 15,
              flags: { bichoBets: bets }
            }, 'Consolação no Jogo do Bicho');
            return `Deu Grupo ${sorteado}! Bateu na trave, mas sua aposta tava cercada pelos cinco: salvou R$ 10,00 no bolso (+R$ 5,00 de lucro).`;
          } else {
            state.apply({
              grana: -500,
              sanidade: -10,
              flags: { bichoBets: bets }
            }, 'Aposta perdida no Jogo do Bicho');
            return `O radinho chiou o resultado das 18h: deu Grupo ${sorteado}. Não foi dessa vez, mas a esperança do brasileiro é a última que morre (-R$ 5,00).`;
          }
        }
      },
      {
        id: 'caderninho_fiado',
        label: state.flags.temFiado
          ? 'Pedir cerveja no fiado (Limite de fiado atingido por hoje no Seu Tião)'
          : 'Pedir cerveja e pedir pra anotar no caderninho do fiado',
        costLabel: 'Teste de Confiança (1x por dia)',
        disabled: Boolean(state.flags.temFiado),
        execute: (state, sound) => {
          if (state.ginga >= 55) {
            if (sound) sound.playCanOpen();
            state.apply({ debt: 1200, sanidade: 25, flags: { temFiado: true } }, 'Anotado no caderninho');
            return 'Seu Tião te encarou por 3 segundos, pegou a caneta Bic azul e anotou R$ 12,00 na página do seu nome. Cerveja liberada na base da palavra (+25% sanidade, +R$ 12,00 em dívida)!';
          } else {
            state.apply({ sanidade: -20, perigo: 10, flags: { temFiado: true } }, 'Fiado negado');
            return '"— Fiado só pra maiores de 90 anos acompanhados dos pais!" Seu Tião apontou pra placa clássica na parede. Todos no boteco riram da sua cara (-20% sanidade).';
          }
        }
      },
      {
        id: 'ovo_conserva',
        label: 'Comer o misterioso ovo rosa no pote de conserva de vinagre',
        costLabel: 'R$ 2,50',
        costCentavos: 250,
        disabled: !state.canAfford(250),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          const passed = state.rng.chance(0.7);
          state.apply({
            grana: -250,
            fome: 25,
            sanidade: passed ? 10 : -25
          }, 'Ovo de boteco');

          return passed
            ? 'Ovo de conserva clássico com sal e pimenta cumari. Despertou até a alma (+25% bucho)!'
            : 'O vinagre tava curtido desde 2018. Seu estômago protestou na hora (-25% sanidade).';
        }
      }
    ]
  },

  ADEGA_DO_ZE: {
    id: 'ADEGA_DO_ZE',
    title: '🍾 ADEGA DO ZÉ (BEBIDAS & RECICLÁVEIS)',
    getIntroText: (state) => `
      Pilhas de caixas amarelas de cerveja e fardos de refrigerante até o teto.<br>
      Zé da Adega tá conferindo notas no balcão de vidro:<br>
      <em>"— E aí meu bom! Chegou Corote novo de Canelinha e litrão trincando. Tem lata de alumínio aí pra vender?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana}</small>
    `,
    getOptions: (state) => [
      {
        id: 'litrao_skol',
        label: 'Comprar Litrão de Cerveja 1L no casco',
        costLabel: 'R$ 8,50',
        costCentavos: 850,
        disabled: !state.canAfford(850),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playCanOpen(); }
          state.apply({ grana: -850, sanidade: 30 }, 'Litrão na Adega do Zé');
          return 'Litrão gelado com rótulo descascando de gelo. Mais de meio litro de pura paz suburbana (+30% sanidade).';
        }
      },
      {
        id: 'vender_latinhas',
        label: !state.hasItem('sacola_latinhas')
          ? 'Vender latinhas de alumínio (Sem latinhas no inventário — pegue sua sacola)'
          : ((state.flags.latinhasVendidas || 0) >= 1
            ? 'Vender latinhas de alumínio (Cota de reciclagem da adega esgotada hoje)'
            : 'Vender sacola de latinhas de alumínio amassadas'),
        costLabel: '+R$ 18,00 a R$ 24,00',
        disabled: !state.hasItem('sacola_latinhas') || ((state.flags.latinhasVendidas || 0) >= 1),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const ganho = state.rng.int(1800, 2400);
          const bicoGain = (state.flags.totalBicoGain || 0) + ganho;
          state.apply({
            grana: ganho,
            sanidade: 15,
            perigo: -5,
            removeInventoryId: 'sacola_latinhas',
            flags: { latinhasVendidas: 1, totalBicoGain: bicoGain }
          }, 'Venda de latinhas na adega');
          return `Zé jogou a sacola na balança mecânica, fez as contas de cabeça e te pagou ${GameState.formatBRL(ganho)} em notas limpas! Dinheiro do corre (+${GameState.formatBRL(ganho)}).`;
        }
      },
      {
        id: 'corote_canelinha',
        label: 'Comprar Corote de Canelinha 500ml',
        costLabel: 'R$ 4,50',
        costCentavos: 450,
        disabled: !state.canAfford(450),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playCanOpen(); }
          state.apply({ grana: -450, sanidade: 40, ginga: -10 }, 'Corote Canelinha');
          return 'Gole de fogo que aquece o peito e apaga as preocupações urbanas (+40% Sanidade, mas reflexos ligeiramente lentos).';
        }
      }
    ]
  },

  FLANELINHA: {
    id: 'FLANELINHA',
    title: '🚗 O FLANELINHA NO CRUZAMENTO',
    getIntroText: (state) => `
      Um rapaz com um pano de chão no ombro e um chaveiro tilintando se aproxima do seu lado com sorriso amarelo:<br>
      <em>"— E aí chefia! Vai cuidar da máquina aí? Aquela fortalecida pro café das crianças, sabe como é né? Segurança total!"</em><br>
      <small style="color:#ffcc00">Seu B.O. / Perigo: ${state.perigo}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'pagar_cinco',
        label: state.flags.flanelinhaResolvido
          ? 'Pagar flanelinha (Vaga já assegurada e carro sob vigilância)'
          : 'Pagar R$ 5,00 e garantir a paz',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500) || Boolean(state.flags.flanelinhaResolvido),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -500, perigo: -15, sanidade: 10, flags: { flanelinhaResolvido: true } }, 'Pagar flanelinha');
          return '"— Valeu meu patrão! Pode deixar que dessa vaga aqui nem mosquito chega perto!" Vaga protegida e sem dor de cabeça (-R$ 5,00, B.O. -15%).';
        }
      },
      {
        id: 'migue_cartao',
        label: state.flags.flanelinhaResolvido
          ? 'Migué do flanelinha (Situação já resolvida com o flanelinha)'
          : 'O Migué Clássico: "Tô sem moeda, na volta eu te acerto!"',
        costLabel: 'Teste de Ginga (50%)',
        disabled: Boolean(state.flags.flanelinhaResolvido),
        execute: (state) => {
          const colou = state.rng.chance(0.55);
          if (colou) {
            state.apply({ ginga: 10, sanidade: 15, flags: { flanelinhaResolvido: true } }, 'Migué do flanelinha funcionou');
            return '"— Beleza chefe, confio na sua palavra hein! Vai com Deus!" Você economizou cinco conto na cara de pau (+10 Ginga)!';
          } else {
            state.apply({ perigo: 25, sanidade: -15, flags: { carroRiscado: true, flanelinhaResolvido: true } }, 'Flanelinha desconfiado');
            return 'O flanelinha fechou a cara e deu duas batidinhas de chave na lataria: "— É patrão... tomara que nada aconteça com o retrovisor enquanto você tiver fora né..." Seu nível de tensão subiu (+25% Perigo).';
          }
        }
      },
      {
        id: 'peitar_rua',
        label: state.flags.flanelinhaResolvido
          ? 'Bate-boca na rua (Situação já resolvida)'
          : 'Peitar: "A rua é pública, não vou pagar nada!"',
        costLabel: 'B.O. Garantido',
        disabled: Boolean(state.flags.flanelinhaResolvido),
        execute: (state, sound) => {
          if (sound) sound.playSiren();
          state.apply({ perigo: 35, sanidade: -25, ginga: -10, flags: { flanelinhaResolvido: true } }, 'Bate-boca com flanelinha');
          return 'Começou um bate-boca generalizado no semáforo. Um taxista buzinou, outros flanelinhas se aproximaram e uma viatura da PM virou a esquina da Edgar Facó com a sirene ligada (+35% B.O., -25% Sanidade)!';
        }
      }
    ]
  },

  POSTO_PIRITUBA: {
    id: 'POSTO_PIRITUBA',
    title: '⛽ POSTO PIRITUBA 24H',
    getIntroText: (state) => `
      O frentista de macacão verde segura o bico da bomba e te pergunta:<br>
      <em>"— Completa com a aditivada chefe? Ou vai dar só aquele chorinho pra não empurrar?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana}</small>
    `,
    getOptions: (state) => [
      {
        id: 'abastecer_30',
        label: 'Colocar R$ 30,00 de Etanol comum',
        costLabel: 'R$ 30,00',
        costCentavos: 3000,
        disabled: !state.canAfford(3000),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -3000, sanidade: 20, flags: { abastecido: true } }, 'Abastecido no posto');
          return 'Ponteiro do combustível subiu, motorista prevenido. O frentista ainda passou uma água no para-brisa (+20% sanidade).';
        }
      },
      {
        id: 'calibrar_agua',
        label: state.flags.calibrouPneu
          ? 'Calibrar pneus / água do posto (Pneus já calibrados em 30 libras e garrafa cheia)'
          : 'Calibrar os 4 pneus (30 libras) e tomar água gelada no bebedouro',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.calibrouPneu),
        execute: (state) => {
          state.apply({ sanidade: 15, flags: { calibrouPneu: true } }, 'Calibrar pneus no posto');
          return 'O ar comprimido apitou nos 4 pneus e a água do bebedouro tava tinindo de gelada. Parada técnica 100% gratuita (+15% sanidade).';
        }
      },
      {
        id: 'fandangos_refri',
        label: 'Comprar Fandangos de Presunto + Lata de Guaraná na loja de conveniência',
        costLabel: 'R$ 12,50',
        costCentavos: 1250,
        disabled: !state.canAfford(1250),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playCanOpen(); sound.playBite(); }
          state.apply({ grana: -1250, fome: 35, sanidade: 20 }, 'Lanche na conveniência');
          return 'Sal e gordura de alta qualidade, ar condicionado trincando na conveniência. Bucho abastecido (+35%) e mente tranquila (+20%).';
        }
      }
    ]
  },

  PONTO_ONIBUS: {
    id: 'PONTO_ONIBUS',
    title: '🚏 PONTO DE ÔNIBUS SPTRANS',
    getIntroText: (state) => `
      A linha 8400-10 Term. Pirituba / Term. Lapa apontou no corredor exclusivo.<br>
      O motorista encosta no meio-fio e abre as duas portas com aquele chiado pneumático.<br>
      <small style="color:#ffcc00">Tarifa SPTrans: R$ 5,00 | Seu Saldo: ${state.formattedGrana}</small>
    `,
    getOptions: (state) => [
      {
        id: 'pagar_onibus',
        label: state.flags.pegouOnibus
          ? 'Embarcar no ônibus (Viagem de ônibus já realizada hoje)'
          : 'Embarcar passando a catraca com dignidade',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500) || Boolean(state.flags.pegouOnibus),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: -500,
            sanidade: 15,
            flags: { pegouOnibus: true }
          }, 'Viagem de ônibus 8400-10');
          return 'Catraca liberada! Conseguiu um lugar na janela, vento no rosto pela Edgar Facó rumo ao terminal (+15% sanidade, meta de transporte cumprida).';
        }
      },
      {
        id: 'pular_catraca',
        label: state.flags.pegouOnibus
          ? 'Pular a catraca (Viagem de ônibus já realizada hoje)'
          : 'Pular a catraca no vácuo do passageiro da frente',
        costLabel: 'Ginga ou B.O.',
        disabled: Boolean(state.flags.pegouOnibus),
        execute: (state, sound) => {
          const success = state.rng.chance(state.ginga / 100);
          if (success) {
            state.apply({ ginga: 15, sanidade: 15, flags: { pegouOnibus: true } }, 'Pulou a catraca');
            return 'Salto olímpico por cima da borboleta de aço sem encostar nem a havaiana! O cobrador fingiu que nem viu (+15 Ginga)!';
          } else {
            if (sound) sound.playSiren();
            state.apply({ perigo: 35, sanidade: -20, flags: { pegouOnibus: true } }, 'Pego na catraca');
            return 'A fivela da calça prendeu na catraca! O motorista parou o ônibus e os passageiros gritaram em coro: "— PAGA O BUSÃO CALOTEIRO!" Você foi convidado a descer a pé (-20% sanidade, +35% Perigo).';
          }
        }
      }
    ]
  },

  DOIS_CARAS_MOTO: {
    id: 'DOIS_CARAS_MOTO',
    title: '🚨 PERIGO: "DOIS CARAS NUMA MOTO"!',
    getIntroText: (state) => `
      Um barulho estalado de escape de Honda CG 160 Titan corta a noite.<br>
      A moto sobe a calçada devagar, garupa com a mão por baixo da blusa de moletom te encarando fixo...<br>
      <strong style="color:#ff3333">TENSÃO MÁXIMA! ESCOLHA RÁPIDO:</strong>
    `,
    getOptions: (state) => [
      {
        id: 'entrar_padoca',
        label: 'Correr pra dentro do primeiro comércio aberto',
        execute: (state) => {
          state.apply({ sanidade: -15, perigo: -10 }, 'Fugiu pro comércio');
          return 'Você deu um salto pra dentro do boteco do Tião e pediu uma água fingindo naturalidade. A moto acelerou e seguiu reto. Passou raspando (-15% sanidade do susto)!';
        }
      },
      {
        id: 'dar_celular_falso',
        label: 'Entregar o celular com tela trincada sem hesitar',
        disabled: !state.inventory.some(i => i.id === 'celular_trincado'),
        execute: (state) => {
          state.apply({
            removeInventoryId: 'celular_trincado',
            sanidade: -20,
            perigo: -20
          }, 'Entregou celular falso');
          return '"— Perdeu, perdeu!" O garupa puxou o celular trincado da sua mão e a moto sumiu na Edgar Facó. O seu aparelho de valor ficou salvo na meia. Sobrevivência pura!';
        }
      },
      {
        id: 'orelhao_disfarce',
        label: 'Fingir que está discutindo aos berros no Orelhão azul',
        costLabel: 'Teste de Ator / Ginga',
        execute: (state) => {
          const success = state.rng.chance(state.ginga / 100);
          if (success) {
            state.apply({ ginga: 20, sanidade: 10 }, 'Disfarce no Orelhão');
            return '"— Alô mãe?! Já tô na delegacia com o tio Mauro da Civil!" A moto deu meia volta e arrancou pro outro lado. Oscar de atuação (+20 Ginga)!';
          } else {
            state.apply({ grana: -Math.min(state.grana, 5000), sanidade: -30, perigo: 20 }, 'Assalto consumado');
            return 'O orelhão tava sem fone. Eles perceberam na hora e levaram o troco do seu bolso. Prejuízo financeiro e moral (-30% sanidade).';
          }
        }
      }
    ]
  },

  BANCA_JORNAL: {
    id: 'BANCA_JORNAL',
    title: '📰 BANCA DE JORNAL DO SEU MÁRIO',
    getIntroText: (state) => `
      Jornais do dia pendurados com pregadores de madeira balançando na brisa.<br>
      Seu Mário tá arrumando os gibis da Turma da Mônica e as revistas de palavras cruzadas:<br>
      <em>"— Bom dia chefia! Tem jornal Agora São Paulo, Almanaque histórico e a Raspadinha Premiada da Sorte!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Raspadinhas jogadas: ${state.flags.raspadinhaBets || 0}/2</small>
    `,
    getOptions: (state) => [
      {
        id: 'raspadinha_sorte',
        label: (state.flags.raspadinhaBets >= 2)
          ? 'Comprar Raspadinha da Sorte (Limite de 2 cartelas por run atingido)'
          : 'Comprar Raspadinha da Sorte da Loterias Caixa (R$ 3,00)',
        costLabel: 'R$ 3,00',
        costCentavos: 300,
        disabled: !state.canAfford(300) || (state.flags.raspadinhaBets >= 2),
        execute: (state, sound) => {
          const bets = (state.flags.raspadinhaBets || 0) + 1;
          const ganhou = state.rng.chance(0.38);
          if (ganhou) {
            if (sound) sound.playCoin();
            const premio = state.rng.chance(0.2) ? 4000 : 1500;
            const premioReais = (premio / 100).toFixed(2).replace('.', ',');
            state.apply({
              grana: premio - 300,
              sanidade: 30,
              ginga: 8,
              flags: { raspadinhaBets: bets, ganhouRaspadinha: true }
            }, 'Prêmio na Raspadinha');
            return `✨ RASPOU E ACHOU TRÊS TREVOS! Seu Mário arregalou o olho atrás dos óculos: "— Olha aí garoto, tirou a sorte grande!" Ganhou R$ ${premioReais} na hora (+30% Sanidade)!`;
          } else {
            state.apply({
              grana: -300,
              sanidade: -8,
              flags: { raspadinhaBets: bets }
            }, 'Raspadinha sem prêmio');
            return 'Você raspou com a moeda de 50 centavos até o final... dois trevos e uma ferradura. Quase! Mas valeu a adrenalina (-R$ 3,00, -8% Sanidade).';
          }
        }
      },
      {
        id: 'comprar_almanaque',
        label: 'Comprar Almanaque Histórico de Pirituba (R$ 8,00)',
        costLabel: 'R$ 8,00',
        costCentavos: 800,
        disabled: !state.canAfford(800) || state.inventory.some(i => i.id === 'almanaque_pirituba'),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: -800,
            ginga: 15,
            sanidade: 20,
            addInventory: { id: 'almanaque_pirituba', name: 'Almanaque Histórico de Pirituba' }
          }, 'Comprou Almanaque de Pirituba');
          return 'Você folheia a história do bairro: a construção da Estação Pirituba em 1885, as fábricas de cerâmica e as lendas da Edgar Facó. Malemolência e conhecimento local ampliados (+15 Ginga, +20% Sanidade)!';
        }
      },
      {
        id: 'fofoca_bairro',
        label: state.flags.fofocaBanca
          ? 'Bater papo com Seu Mário (Seu Mário já te contou as novidades do bairro hoje)'
          : 'Bater papo com o Seu Mário sobre o trânsito e o clima',
        costLabel: 'Papo Grátis (1x por dia)',
        disabled: Boolean(state.flags.fofocaBanca),
        execute: (state) => {
          state.apply({ sanidade: 12, flags: { fofocaBanca: true } }, 'Papo com Seu Mário');
          return 'Seu Mário ajeitou a viseira verde: "— Rapaz, o calor tá de rachar a mamona na Edgar Facó. Lá pras 16h desaba aquele temporal clássico de São Paulo. Se cuida no asfalto!" (+12% Sanidade).';
        }
      }
    ]
  },

  PASTEL_FEIRA: {
    id: 'PASTEL_FEIRA',
    title: '🥟 BARRACA DE PASTEL DA DONA MARIA',
    getIntroText: (state) => `
      O cheiro inconfundível de massa fresca dourando no tacho de óleo fervente.<br>
      Dona Maria de avental branco e touca corta a massa com o rolo dentado com rapidez cirúrgica:<br>
      <em>"— Saiu de carne com azeitona e de queijo puxando agora, meu anjo! Vai querer com garapa e limão?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana}</small>
    `,
    getOptions: (state) => [
      {
        id: 'combo_pastel_garapa',
        label: 'Combo da Feira: Pastel de Carne com Queijo + Caldo de Cana Gelado (R$ 12,00)',
        costLabel: 'R$ 12,00',
        costCentavos: 1200,
        disabled: !state.canAfford(1200),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playSizzle(); sound.playGulp(); }
          state.apply({
            grana: -1200,
            fome: 55,
            sanidade: 35,
            flags: { comeuPastel: true }
          }, 'Combo Pastel e Caldo de Cana');
          return 'Massa estalando de crocante com vapor quente subindo e queijo esticando! O caldo de cana verde com limão desceu trincando. Felicidade paulistana absoluta (+55% Bucho, +35% Sanidade)!';
        }
      },
      {
        id: 'pastel_simples',
        label: 'Pastel Tradicional de Carne com Vinagrete (R$ 6,50)',
        costLabel: 'R$ 6,50',
        costCentavos: 650,
        disabled: !state.canAfford(650),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playSizzle(); sound.playBite(); }
          state.apply({
            grana: -650,
            fome: 30,
            sanidade: 18,
            flags: { comeuPastel: true }
          }, 'Pastel Tradicional');
          return 'Você abre o pastel no meio, joga duas colheres cheias de vinagrete bem temperado com pimenta biquinho. Mordida perfeita (+30% Bucho, +18% Sanidade)!';
        }
      },
      {
        id: 'xepa_conversa',
        label: state.flags.xepaConversa
          ? 'Aprender segredo da massa (Dona Maria já te ensinou o segredo da cachaça hoje)'
          : 'Aprender o segredo da massa crocante com a Dona Maria',
        costLabel: 'Respeito (1x por dia)',
        disabled: Boolean(state.flags.xepaConversa),
        execute: (state) => {
          state.apply({ ginga: 10, sanidade: 10, flags: { xepaConversa: true } }, 'Dicas de culinária na feira');
          return 'Dona Maria sorriu: "— O segredo, meu filho, é uma dose de cachaça branca na massa pra ficar cheia de bolha crocante!" Sabedoria popular transmitida (+10 Ginga, +10% Sanidade).';
        }
      }
    ]
  },

  SEMAFORO_BICO: {
    id: 'SEMAFORO_BICO',
    title: '🚦 SEMÁFORO DA EDGAR FACÓ (BICO NO SINAL)',
    getIntroText: (state) => `
      O sinal vermelho fechou o fluxo da Edgar Facó! Os carros frearam e o asfalto tá borbulhando no calor.<br>
      Os motoristas tão entediados no volante olhando pro celular e pro retrovisor.<br>
      <strong style="color:#00ffcc">É A SUA JANELA DE 30 SEGUNDOS PRA FAZER O CORRE!</strong><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Vendas de Balas: ${state.flags.bicoSemaforoVendas || 0}/2 | Pára-brisa: ${state.flags.bicoParabrisa || 0}/2</small>
    `,
    getOptions: (state) => [
      {
        id: 'vender_balas',
        label: (state.flags.bicoSemaforoVendas >= 2)
          ? 'Vender paçoca e balas (Cota diária de 2 vendas atingida — outros ambulantes pediram espaço)'
          : 'Vender paçoca e balas de goma entre as janelas dos carros',
        costLabel: 'Corre no Asfalto',
        disabled: (state.flags.bicoSemaforoVendas >= 2),
        execute: (state, sound) => {
          const successChance = 0.5 + (state.ginga / 300);
          const passed = state.rng.chance(successChance);
          if (passed) {
            if (sound) { sound.playCoin(); sound.playTrafficHonk(); }
            const ganho = state.rng.int(800, 1400);
            const ganhoReais = (ganho / 100).toFixed(2).replace('.', ',');
            const vendas = (state.flags.bicoSemaforoVendas || 0) + 1;
            const bicoGain = (state.flags.totalBicoGain || 0) + ganho;
            state.apply({
              grana: ganho,
              ginga: 3,
              fome: -10,
              flags: { bicoSemaforoVendas: vendas, totalBicoGain: bicoGain }
            }, 'Venda de balas no semáforo');
            return `Você ofereceu com aquele sorriso humilde e malemolência de cria. Um motorista comprou dois pacotes! Ganhou R$ ${ganhoReais} limpos (+3 Ginga, -10% energia)!`;
          } else {
            if (sound) sound.playTrafficHonk();
            state.apply({ sanidade: -10, fome: -8 }, 'Recusa no semáforo');
            return 'Os vidros filmados subiram rápido com o botão elétrico. Um motorista estressado meteu a mão na buzina: "— SAI DA FRENTE QUE VAI ABRIR!" (-10% Sanidade).';
          }
        }
      },
      {
        id: 'limpar_parabrisa',
        label: (state.flags.bicoParabrisa >= 2)
          ? 'Oferecer rodo no pára-brisa (Cota de 2 limpezas atingida — água com sabão acabou)'
          : 'Oferecer rodo com espuma no pára-brisa de uma picape',
        costLabel: 'Rodo & Detergente',
        disabled: (state.flags.bicoParabrisa >= 2),
        execute: (state, sound) => {
          const passed = state.rng.chance(0.60);
          if (passed) {
            if (sound) sound.playCoin();
            const limpezas = (state.flags.bicoParabrisa || 0) + 1;
            const bicoGain = (state.flags.totalBicoGain || 0) + 400;
            state.apply({
              grana: 400,
              ginga: 2,
              fome: -8,
              flags: { bicoParabrisa: limpezas, totalBicoGain: bicoGain }
            }, 'Limpou pára-brisa');
            return 'Espuma rápida no vidro, rodo de borracha puxando a sujeira sem riscar. O motorista baixou dois dedos da janela e te entregou R$ 4,00 em moedas (+R$ 4,00, +2 Ginga)!';
          } else {
            state.apply({ sanidade: -12, perigo: 8 }, 'Esguicho no rosto');
            return 'O dono do carro ligou o esguicho e o limpador no modo rápido pra te afastar, espirrando água com sabão na sua roupa. Constrangimento no asfalto (-12% Sanidade, +8% Perigo).';
          }
        }
      },
      {
        id: 'sair_canteiro',
        label: 'Voltar com segurança pra calçada antes do sinal abrir',
        costLabel: 'Segurança',
        execute: () => 'Você recuou até a guia com calma, esperando o trânsito pesado fluir sem risco de atropelamento.'
      }
    ]
  },

  BAILE_LAJE: {
    id: 'BAILE_LAJE',
    title: '🔊 BAILE DA LAJE NO ALTO DO ESCADÃO',
    getIntroText: (state) => `
      O paredão de som estremece as caixas d'água de amianto e as lajes vizinhas.<br>
      Luz estroboscópica cortando a serração da madrugada e a fumaça de narguilé.<br>
      A quebrada tá em peso reunida curtindo o funk consciente de São Paulo com vista total pro Jaraguá!<br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Sanidade: ${state.sanidade}% | Perigo: ${state.perigo}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'copao_whisky',
        label: 'Pegar Copão de Whisky com Energético Tropical no cooler (R$ 15,00)',
        costLabel: 'R$ 15,00',
        costCentavos: 1500,
        disabled: !state.canAfford(1500),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playGulp(); }
          state.apply({
            grana: -1500,
            sanidade: 45,
            ginga: 15,
            perigo: 15,
            fome: -10,
            flags: { curtiuBaile: true }
          }, 'Copão no Baile da Laje');
          return 'Gelo de coco derretendo no copo de 700ml, batida no peito e euforia coletiva. A energia da madrugada te renovou por completo (+45% Sanidade, +15 Ginga, +15% Perigo pela adrenalina)!';
        }
      },
      {
        id: 'dancar_passinho',
        label: state.flags.mandouPassinho
          ? 'Passinho dos Crias (Você já deu seu show no passinho por hoje)'
          : 'Entrar no círculo da laje e lançar o Passinho dos Crias',
        costLabel: 'Ritmo & Malemolência (1x por dia)',
        disabled: Boolean(state.flags.mandouPassinho),
        execute: (state) => {
          const mandouBem = state.ginga >= 35 || state.rng.chance(0.65);
          if (mandouBem) {
            state.apply({
              ginga: 25,
              sanidade: 25,
              flags: { mandouPassinho: true }
            }, 'Show no passinho do baile');
            return 'Perna direita cruzando, rodopio no ar e travada seca no bumbo da música! A galera gritou e bateu palma na lata de cerveja. Você ganhou moral total na comunidade (+25 Ginga, +25% Sanidade)!';
          } else {
            state.apply({ sanidade: -15, ginga: -5, flags: { mandouPassinho: true } }, 'Tropeço no baile');
            return 'Você tentou mandar o passo de ponta de pé, escorregou no piso molhado de gelo e caiu sentado. Riram com respeito, mas ardeu a moral (-15% Sanidade).';
          }
        }
      },
      {
        id: 'desenrolo_crias',
        label: state.flags.desenroloBaile
          ? 'Trocar ideia com a disciplina da laje (Papo reto já dado: respeito mútuo garantido)'
          : 'Trocar ideia com a disciplina da laje e mostrar humildade',
        costLabel: 'Humildade & Postura (1x por dia)',
        disabled: Boolean(state.flags.desenroloBaile),
        execute: (state) => {
          if (state.ginga >= 45) {
            state.apply({ perigo: -25, sanidade: 15, flags: { desenroloBaile: true } }, 'Respeito na laje');
            return 'Cumprimentou com aperto de mão firme e olho no olho: "— Salve família, respeito e paz pro morro!" A rapaziada assentiu: "— Tmj parceiro, tá seguro aqui." (-25% Perigo, +15% Sanidade)!';
          } else {
            state.apply({ perigo: 10, sanidade: -10, flags: { desenroloBaile: true } }, 'Gafes na conversa');
            return 'Você falou alto demais e usou gíria errada. Os caras te olharam de cara feia: "— Fala baixo, irmão." Clima pesou um pouco (+10% Perigo).';
          }
        }
      }
    ]
  },

  BLITZ_PM: {
    id: 'BLITZ_PM',
    title: '🚔 BLITZ DA POLÍCIA MILITAR NA PAULA FERREIRA',
    getIntroText: (state) => `
      Giroflex vermelho e azul rodando e iluminando a fachada das casas na calada da noite.<br>
      Duas viaturas Hilux da PM atravessadas na pista, cones fosforescentes e dois policiais armados de fuzil fazendo triagem:<br>
      <em>"— PAROU AÍ CIDADÃO! Mão na cabeça e encosta na parede devagar!"</em><br>
      <strong style="color:#ff3333">SITUAÇÃO DE ALTO PERIGO! ESCOLHA SUA ATITUDE:</strong>
    `,
    getOptions: (state) => [
      {
        id: 'apresentar_documento',
        label: 'Manter a calma, colocar as mãos visíveis e apresentar o RG',
        costLabel: 'Cidadão Frio',
        execute: (state, sound) => {
          if (state.perigo >= 65) {
            state.apply({ sanidade: -30, perigo: -15, grana: -Math.min(state.grana, 1000) }, 'Revista minuciosa na blitz');
            return 'Por você estar muito agitado, os policiais fizeram uma revista completa: bolsos virados do avesso, tênis tirado no asfalto frio. Nada ilegal, mas o esculacho e a humilhação doeram fundo (-30% Sanidade).';
          } else {
            state.apply({ perigo: -40, sanidade: -10 }, 'Liberado na blitz');
            return 'O sargento pegou seu RG, consultou a placa no COPOM pelo rádio: "— Sem pendências. Cuidado com o horário aqui na Paula Ferreira, rapaz. Pode circular." (-40% Perigo, alívio imenso)!';
          }
        }
      },
      {
        id: 'desenrolo_ginga',
        label: 'Mandar o papo respeitoso de morador: "Boa noite sargento, sou nascido e criado aqui em Pirituba!"',
        costLabel: 'Ginga & Fala Mansa (Requer Ginga 55)',
        execute: (state) => {
          if (state.ginga >= 55) {
            state.apply({ ginga: 20, perigo: -50, sanidade: 15 }, 'Desenrolo bem sucedido na blitz');
            return 'Sua postura tranquila e vocabulário correto quebraram a desconfiança na hora. O cabo sorriu: "— Morador da área? Conhece o Seu Tião do bar? Vai na paz e direto pra casa." (+20 Ginga, -50% Perigo)!';
          } else {
            state.apply({ sanidade: -35, perigo: 25 }, 'Engasgou com a polícia');
            return 'Você gaguejou e tremeu a voz. O PM fechou a cara na hora: "— Tá tremendo por quê? Tem coisa errada aí?!" Encostou você na viatura e deu uma bronca inesquecível (-35% Sanidade, +25% Perigo).';
          }
        }
      },
      {
        id: 'viela_atalho',
        label: 'Recuar silenciosamente pela entrada do Beco do Sossego antes de ser visto',
        costLabel: 'Fuga Furtiva',
        execute: (state, sound) => {
          const success = state.rng.chance(0.6);
          if (success) {
            state.apply({ perigo: -20, ginga: 15 }, 'Fuga furtiva pelo beco');
            return 'Você deu dois passos de costas e dobrou a esquina do muro grafitado. Em três passadas sumiu na penumbra do Beco do Sossego. Os PMs nem notaram (+15 Ginga, -20% Perigo)!';
          } else {
            if (sound) sound.playSiren();
            state.apply({ perigo: 45, sanidade: -30 }, 'Tentativa de fuga frustrada');
            return 'Um apito agudo cortou o ar: "— PARADO AÍ! VOLTA AQUI JÁ!" Você teve que correr como se a vida dependesse disso, pulando poças até despistar viatura na avenida (+45% Perigo, -30% Sanidade).';
          }
        }
      }
    ]
  },

  NPC_BALEIRO: {
    id: 'NPC_BALEIRO',
    title: '🍬 CLODOALDO DAS BALAS // AMBULANTE DA EDGAR FACÓ',
    getIntroText: (state) => `
      Clodoaldo caminha firme com sua caixa de isopor azul e branca no peito e boné virado pra trás.<br>
      <em>"— Ó a paçoca! Três é dez! Halls preto, dropes de menta e energético trincando de gelado! E aí guerreiro, vai levar o que hoje?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Fome: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'comprar_pacoca',
        label: 'Comprar Kit Paçoca & Halls Preto (Energia rápida)',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -500, fome: 25, ginga: 5 }, 'Comprou paçocas do Clodoaldo');
          return 'Você mastiga a paçoca esfarelenta e joga um Halls preto na boca. O açúcar no sangue sobe na hora! (+25% Fome, +5 Ginga).';
        }
      },
      {
        id: 'comprar_energetico',
        label: 'Comprar Energético Furacão 500ml geladinho',
        costLabel: 'R$ 8,00',
        costCentavos: 800,
        disabled: !state.canAfford(800),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -800, sanidade: 30, fome: 5 }, 'Tomou energético do ambulante');
          return 'Gole gelado estalando no peito! A taurina e o gás dão um reset mental imediato (+30% Sanidade).';
        }
      },
      {
        id: 'bico_fardo',
        label: (state.flags.bicoFardoCount || 0) >= 2
          ? 'Ajudar a descarregar fardo (Bicos encerrados por hoje)'
          : 'Ajudar Clodoaldo a descarregar um fardo de refrigerante na esquina',
        costLabel: '+R$ 10,00 | -8% Fome',
        disabled: (state.flags.bicoFardoCount || 0) >= 2 || state.fome < 10,
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const count = (state.flags.bicoFardoCount || 0) + 1;
          state.apply({
            grana: 1000,
            fome: -8,
            ginga: 8,
            flags: { bicoFardoCount: count }
          }, 'Bico com ambulante Clodoaldo');
          return 'Força no muque! Em três minutos o fardo de latas tá empilhado no carrinho. Clodoaldo saca uma nota de dez amassada: "— Valeu parceiro, salvou meu corre!" (+R$ 10,00, +8 Ginga, -8% Fome).';
        }
      },
      {
        id: 'conversar_ambulante',
        label: 'Trocar uma ideia sobre o movimento da avenida',
        costLabel: 'Papo reto',
        execute: (state) => {
          state.apply({ sanidade: 10 }, 'Trocou ideia com o ambulante');
          return 'Clodoaldo dá a visão: "— Fica esperto ali perto do semáforo depois das seis, a motoquinha anda rondando. Se precisar de rango forte, procura a Dona Neide perto da feira!" (+10% Sanidade).';
        }
      }
    ]
  },

  NPC_CARAMELO: {
    id: 'NPC_CARAMELO',
    title: '🐕 CARAMELO DE PIRITUBA // O CÃO COMUNITÁRIO',
    getIntroText: (state) => `
      O lendário vira-lata Caramelo se aproxima trotando alegremente pela calçada, com as orelhas em pé e o rabo abanando freneticamente.<br>
      Ele solta um latidinho amigável e encosta a cabeça na sua perna, pedindo carinho e atenção.<br>
      <small style="color:#00ff88">★ O Guardião Espiritual das Ruas de Pirituba ★</small>
    `,
    getOptions: (state) => [
      {
        id: 'carinho_caramelo',
        label: 'Fazer aquele carinho caprichado atrás das orelhas',
        costLabel: 'Puro Afeto',
        execute: (state, sound) => {
          if (sound && sound.playDogBark) sound.playDogBark();
          state.apply({ sanidade: 20, perigo: -10 }, 'Carinho no cão caramelo');
          return 'O Caramelo fecha os olhos, dá uma lambida na sua mão e bate as patinhas de felicidade. A ansiedade da cidade grande simplesmente evapora (+20% Sanidade, -10% Perigo)!';
        }
      },
      {
        id: 'alimentar_caramelo',
        label: state.flags.carameloCompanheiro
          ? 'Caramelo já é seu fiel guardião na rua!'
          : 'Dividir um naco de pastel / salgado com o Caramelo',
        costLabel: 'R$ 4,00 (Comprar coxinha de petisco)',
        costCentavos: 400,
        disabled: !state.canAfford(400) || Boolean(state.flags.carameloCompanheiro),
        execute: (state, sound) => {
          if (sound) {
            sound.playCoin();
            if (sound.playDogBark) sound.playDogBark();
          }
          state.apply({
            grana: -400,
            sanidade: 25,
            perigo: -20,
            flags: { carameloCompanheiro: true }
          }, 'Alimentou o Caramelo');
          return 'O Caramelo devora a coxinha com entusiasmo canino lendário e começa a latir com alegria! Ele agora é seu protetor oficial de Pirituba, diminuindo o Perigo da rua (-20% Perigo, +25% Sanidade)!';
        }
      },
      {
        id: 'seguir_faro',
        label: state.flags.faroCaramelo
          ? 'Seguir o faro do cão (Já farejou achados hoje)'
          : 'Seguir o Caramelo farejando o pé de uma árvore',
        costLabel: 'Faro de Ouro',
        disabled: Boolean(state.flags.faroCaramelo),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: 850,
            sanidade: 10,
            flags: { faroCaramelo: true }
          }, 'Achado com o faro do Caramelo');
          return 'O Caramelo cava rapidinho na terra do canteiro e puxa com a pata uma nota de R$ 5 e um punhado de moedas perdidas por alguém! (+R$ 8,50, +10% Sanidade).';
        }
      }
    ]
  },

  NPC_BIKE: {
    id: 'NPC_BIKE',
    title: '🚲 JUNINHO DA MONARK // O MOLEQUE DO GRAU',
    getIntroText: (state) => `
      Juninho freia sua Monark vermelha no meio-fio com uma puxada rápida de guidão.<br>
      <em>"— E aí meu parceiro! Firmeza total? Se precisar de carona no cano da bike ou de um corre na quebrada, só dar o toque!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Ginga: ${state.ginga}</small>
    `,
    getOptions: (state) => [
      {
        id: 'carona_padaria',
        label: 'Pedir carona no cano até a Padaria Estrela',
        costLabel: 'R$ 3,00',
        costCentavos: 300,
        disabled: !state.canAfford(300),
        execute: (state, sound) => {
          if (sound) {
            sound.playCoin();
            if (sound.playBikeBell) sound.playBikeBell();
          }
          state.apply({ grana: -300, ginga: 5 }, 'Carona de bike até a Padaria');
          if (typeof window !== 'undefined' && window.app && window.app.controls) {
            window.app.controls.teleport(28.0, 1.2, 36.5);
          }
          return 'Você subiu no cano e o Juninho desceu a Paula Ferreira no embalo, cantando campainha! Chegou na Padaria Estrela num piscar de olhos (+5 Ginga).';
        }
      },
      {
        id: 'carona_posto',
        label: 'Pedir carona no cano até o Posto Pirituba 24h',
        costLabel: 'R$ 3,00',
        costCentavos: 300,
        disabled: !state.canAfford(300),
        execute: (state, sound) => {
          if (sound) {
            sound.playCoin();
            if (sound.playBikeBell) sound.playBikeBell();
          }
          state.apply({ grana: -300, ginga: 5 }, 'Carona de bike até o Posto');
          if (typeof window !== 'undefined' && window.app && window.app.controls) {
            window.app.controls.teleport(-40.0, 1.2, 38.0);
          }
          return 'Vento na cara e pedalada firme! O Juninho cortou o trânsito da Edgar Facó e te deixou na porta do Posto Pirituba (+5 Ginga).';
        }
      },
      {
        id: 'bico_marmita',
        label: state.flags.correBike
          ? 'Bico de entrega (Entrega já finalizada hoje)'
          : 'Pegar encomenda de marmita para entregar no ponto de ônibus',
        costLabel: '+R$ 20,00 | -10% Fome',
        disabled: Boolean(state.flags.correBike) || state.fome < 15,
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: 2000,
            fome: -10,
            ginga: 12,
            flags: { correBike: true }
          }, 'Bico de entrega expressa');
          return 'Você pegou a sacola térmica e correu rapidinho até o ponto de ônibus. Entrega feita a tempo e pagamento na mão! (+R$ 20,00, +12 Ginga, -10% Fome).';
        }
      },
      {
        id: 'desafio_grau',
        label: 'Aprender manobra de empinar bike (Trocar ideia)',
        costLabel: 'Ginga & Resenha',
        execute: (state, sound) => {
          if (sound && sound.playBikeBell) sound.playBikeBell();
          state.apply({ ginga: 10, sanidade: 10 }, 'Resenha com Juninho');
          return 'Juninho puxa o guidão no grau perfeito de uma roda só: "— O segredo tá no freio traseiro e no equilíbrio do quadril, parça!" (+10 Ginga, +10% Sanidade).';
        }
      }
    ]
  },

  NPC_DONA_NEIDE: {
    id: 'NPC_DONA_NEIDE',
    title: '🥘 DONA NEIDE // A TIA DA MARMITA E DA FEIRA',
    getIntroText: (state) => `
      Dona Neide sobe a calçada com passos calmos, avental florido e sacolas de feira cheirosas de cheiro-verde e banana-da-terra.<br>
      <em>"— Ô meu filho! Que bom te ver por aqui. Você tá com uma cara de quem tá na correria desde cedo. Quer uma forragem nessa barriga ou uma bênção de mãe?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Fome: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'comprar_marmita',
        label: state.fome <= 20
          ? 'Aceitar marmita caseira (Dona Neide dá de presente para quem tá faminto!)'
          : 'Comprar Marmita Caseira da Dona Neide (Arroz, feijão, bife e farofa)',
        costLabel: state.fome <= 20 ? 'GRÁTIS (Solidariedade)' : 'R$ 14,00',
        costCentavos: state.fome <= 20 ? 0 : 1400,
        disabled: state.fome > 20 && !state.canAfford(1400),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const cost = state.fome <= 20 ? 0 : -1400;
          state.apply({
            grana: cost,
            fome: 50,
            sanidade: 25
          }, 'Marmita caseira da Dona Neide');
          return state.fome <= 20
            ? 'Dona Neide toca no seu ombro com compaixão: "— Come tudo, meu filho! Ninguém anda nesse asfalto de barriga vazia não." Você devora a comida caseira e recupera as forças na hora (+50% Fome, +25% Sanidade, Grátis)!'
            : 'Marmita de isopor caprichada, feijão fresquinho com tempero caseiro e bife suculento. Você almoça sentado no meio-fio como um rei (+50% Fome, +25% Sanidade).';
        }
      },
      {
        id: 'ajudar_sacolas',
        label: state.flags.ajudouDonaNeide
          ? 'Ajudar com as sacolas (Já ajudou a Dona Neide hoje)'
          : 'Ajudar a carregar as sacolas pesadas da feira até a viela',
        costLabel: '+R$ 10,00 pro café | +Bolo de Fubá',
        disabled: Boolean(state.flags.ajudouDonaNeide) || state.fome < 10,
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: 1000,
            fome: 15,
            ginga: 12,
            sanidade: 15,
            flags: { ajudouDonaNeide: true }
          }, 'Ajudou a Dona Neide com as sacolas');
          return 'Você pega as duas sacolas pesadas e acompanha Dona Neide até a esquina. Ela sorri agradecida e coloca uma nota de dez no seu bolso e um pedaço quentinho de bolo de fubá embrulhado no guardanapo (+R$ 10,00, +15% Fome, +12 Ginga, +15% Sanidade)!';
        }
      },
      {
        id: 'fofoca_bairro',
        label: 'Ouvir conselhos de mãe e fofocas quentes da vizinhança',
        costLabel: 'Papo Acolhedor',
        deltas: { sanidade: 20, perigo: -15 },
        execute: (state) => {
          state.apply({ sanidade: 20, perigo: -15 }, 'Conselho de mãe da Dona Neide');
          return 'Dona Neide conta tudo: "— Fica atento, meu anjo: de tarde arma temporal daquele jeito, o céu fica preto! E não deixa dinheiro fácil à mostra na avenida. Toma juízo e vai com Deus!" (+20% Sanidade, -15% Perigo).';
        }
      }
    ]
  },

  // 14. Banco Pirituba (Autoatendimento 24h & Cheque Especial)
  BANCO_PIRITUBA: {
    id: 'BANCO_PIRITUBA',
    title: '🏧 BANCO PIRITUBA // REDE 24 HORAS',
    getIntroText: (state) => {
      const isNegative = state.grana < 0;
      const statusText = isNegative
        ? `<strong style="color:#ff3344">⚠️ SALDO NEGATIVADO: ${state.formattedGrana} (LIMITE: -R$ 150,00) • PRAZO SERASA: ${Math.max(0, Math.ceil(90 - (state.bankruptTimer || 0)))}s</strong>`
        : `<span style="color:#00ff88">Saldo Disponível: ${state.formattedGrana} • Situação Cadastral: REGULAR</span>`;
      return `
        A tela do terminal eletrônico emite um brilho azul estéril na penumbra.<br>
        O teclado emborrachado está gasto pelos milhares de dedos paulistanos.<br>
        <em>"Banco Pirituba: Conectando você ao seu dinheiro (ou às suas dívidas)."</em><br>
        <small>${statusText}</small>
      `;
    },
    getOptions: (state) => [
      {
        id: 'saque_cheque_especial',
        label: state.grana <= -10000
          ? 'Cheque Especial Bloqueado (Limite de crédito quase estourado)'
          : 'Contratar Cheque Especial Emergencial (Crédito imediato, juros pesados)',
        costLabel: 'Cheque Especial (-R$ 50,00 na conta)',
        costCentavos: 5000,
        disabled: state.grana <= -10000,
        deltas: { grana: -5000, allowNegative: true, sanidade: -8 },
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -5000, allowNegative: true, sanidade: -8 }, 'Saque emergencial no Cheque Especial');
          return 'As notas saem estalando do compartimento inferior. O alívio é imediato, mas seu saldo caiu no vermelho! Quite a dívida antes de 90 segundos ou seu CPF será executado e você perderá a run!';
        }
      },
      {
        id: 'quitar_divida_banco',
        label: state.grana >= 0
          ? 'Depósito Bancário em Dinheiro (Saldo já está positivo)'
          : 'Depositar Dinheiro e Abater Cheque Especial',
        costLabel: state.grana >= 0 ? 'Depósito Poupanca' : 'Amortizar Saldo',
        gainCentavos: 5000,
        deltas: { grana: 5000, sanidade: 15 },
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: 5000, sanidade: 15 }, 'Amortização de dívida bancária');
          return 'Você insere o envelope de depósito no terminal. A compensação imediata alivia sua conta e afasta o fantasma do Serasa e da falência (+15% Sanidade)!';
        }
      },
      {
        id: 'consulta_extrato_serasa',
        label: 'Consultar Extrato Detalhado & Score do Serasa',
        costLabel: 'Grátis',
        deltas: { sanidade: 5 },
        execute: (state) => {
          state.apply({ sanidade: 5 }, 'Consulta de extrato bancário');
          const isNegative = state.grana < 0;
          if (isNegative) {
            const timeLeft = Math.max(0, Math.ceil(90 - (state.bankruptTimer || 0)));
            return `AVISO GRAVE DO BANCO PIRITUBA: Sua conta está em ${state.formattedGrana}. Você possui exatamente ${timeLeft} segundos restantes antes de uma execução judicial de bens que encerrará sua jornada!`;
          } else {
            return `EXTRATO CONSOLIDADO: Saldo positivo de ${state.formattedGrana}. Seu Score de crédito está favorável e não há pendências ativas no SPC/Serasa. Siga em frente (+5% Sanidade).`;
          }
        }
      }
    ]
  },

  // 15. Polícia Militar de SP (Sargento Rocha)
  NPC_POLICIA: {
    id: 'NPC_POLICIA',
    title: '👮 SARGENTO ROCHA // POLÍCIA MILITAR DE SÃO PAULO',
    getIntroText: (state) => {
      const isHighPerigo = state.perigo >= 45;
      const statusNote = isHighPerigo
        ? `<strong style="color:#ff3344">⚠️ SEU PERIGO ESTÁ ALTO (${state.perigo}%)! O SARGENTO ESTÁ COM A MÃO NO COLDRE!</strong>`
        : `<span style="color:#00ff88">Nível de Perigo: ${state.perigo}% • Ronda Ostensiva em Pirituba</span>`;
      return `
        A farda cinza bandeirante e a viatura Duster com giroflex desligado na calçada impõem respeito.<br>
        O Sargento Rocha te mede de cima a baixo com olhos experientes:<br>
        <em>"— Alguma novidade na área, cidadão? O 49º Batalhão não tolera desordem."</em><br>
        <small>${statusNote}</small>
      `;
    },
    getOptions: (state) => [
      {
        id: 'cumprimentar_pm',
        label: state.perigo >= 45
          ? 'Tentar conversar amigavelmente (Seu nível de perigo está muito alto!)'
          : 'Cumprimentar respeitosamente e desejar bom patrulhamento',
        costLabel: 'Cidadão Exemplar',
        disabled: state.perigo >= 45,
        deltas: { sanidade: 16, perigo: -12 },
        execute: (state) => {
          state.apply({ sanidade: 16, perigo: -12 }, 'Cumprimentou o Sargento da PM');
          return 'O Sargento bate continência curta com a mão na boina: "— Boa tarde, cidadão de bem. Se ver qualquer elemento suspeito na Paula Ferreira, dê o toque na viatura." (+16% Sanidade, -12% Perigo).';
        }
      },
      {
        id: 'caguetar_malandro',
        label: state.flags.caguetouMalandro
          ? 'Denunciar o crime local (Você já delatou o movimento hoje)'
          : 'Caguetar o Menor do Corre e denunciar o ponto de tráfico da Bento Bicudo',
        costLabel: '+R$ 40,00 Recompensa | Marca de X-9',
        gainCentavos: 4000,
        disabled: Boolean(state.flags.caguetouMalandro),
        deltas: { grana: 4000, perigo: -25, setFlags: { caguetouMalandro: true } },
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: 4000,
            perigo: -25,
            setFlags: { caguetouMalandro: true }
          }, 'Delatou o corre pro Sargento Rocha');
          return 'O PM puxa um bloquinho e anota a localização exata da viela: "— Boa, parceiro. Informação de primeira linha. Toma aqui R$ 40,00 da nossa caixinha de gratificação." Você se afasta com o bolso cheio, mas sente que virou X-9 na quebrada...';
        }
      },
      {
        id: 'enquadro_suborno',
        label: state.perigo < 45
          ? 'Acertar pendências / Pagar o café da ronda (Disponível apenas em B.O. alto)'
          : 'Pagar o "Café da Viatura" (Propina de R$ 35,00 para evitar o camburão)',
        costLabel: 'Propina R$ 35,00',
        costCentavos: 3500,
        disabled: state.perigo < 45,
        deltas: { grana: -3500, allowNegative: true, perigo: -35, sanidade: -12 },
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: -3500,
            allowNegative: true,
            perigo: -35,
            sanidade: -12
          }, 'Pagou café da viatura do PM');
          return 'O sargento recolhe a nota discretamente pelo vão do cinto de guarnição: "— Vai andando devagar e não olha pra trás. Se eu te trombar de novo hoje, vai pro 33º DP!" (-R$ 35,00, -35% Perigo, -12% Sanidade).';
        }
      },
      {
        id: 'enquadro_revista',
        label: 'Submeter-se ao enquadro: "Mão na cabeça e abre as pernas!"',
        costLabel: 'Revista Policial',
        deltas: { sanidade: -20, perigo: -15 },
        execute: (state) => {
          state.apply({ sanidade: -20, perigo: -15 }, 'Passou pelo enquadro da PMESP');
          return 'O sargento revista seus bolsos, checa seu documento pelo rádio da viatura e dá dois tapas no seu ombro: "— Nada consta no Copom. Segue seu rumo, mas fica esperto." Humilhação da blitz (-20% Sanidade, -15% Perigo).';
        }
      }
    ]
  },

  // 16. Menor do Corre (Malandro da Quebrada)
  NPC_MALANDRO: {
    id: 'NPC_MALANDRO',
    title: '🧢 MENOR DO CORRE // MALANDRAGEM DE PIRITUBA',
    getIntroText: (state) => {
      if (state.flags.caguetouMalandro) {
        return `
          <strong style="color:#ff2233">🚨 O MENOR TE ENCARA COM ÓDIO PURO!</strong><br>
          A notícia correu rápido pelo rádio pirata: você foi visto de papinho com o Sargento da PM!<br>
          <em>"— Falou com os 'homi' né, comédia?! X-9 na quebrada não tem vez não!"</em><br>
          <small style="color:#ffcc00">Perigo: ${state.perigo}% | Saldo: ${state.formattedGrana}</small>
        `;
      }
      return `
        De bermuda tactel, corrente e chinelo no asfalto quente da Cel. Bento Bicudo.<br>
        O Menor do Corre acompanha o movimento da esquina mascando chiclete:<br>
        <em>"— Salve, parça! Tá na atividade ou tá moscando no pedaço?"</em><br>
        <small style="color:#00ff88">Ginga: ${state.ginga}% | Saldo: ${state.formattedGrana} | Perigo: ${state.perigo}%</small>
      `;
    },
    getOptions: (state) => {
      // Branch 1: If player snitched to police (Retribution / Cobrança)
      if (state.flags.caguetouMalandro) {
        return [
          {
            id: 'cobranca_pedagio',
            label: 'Pagar pedágio de resgate da vida (R$ 50,00)',
            costLabel: 'R$ 50,00 Resgate X-9',
            costCentavos: 5000,
            deltas: { grana: -5000, allowNegative: true, sanidade: -25, perigo: 10, setFlags: { caguetouMalandro: false } },
            execute: (state, sound) => {
              if (sound) sound.playCoin();
              state.apply({
                grana: -5000,
                allowNegative: true,
                sanidade: -25,
                perigo: 10,
                setFlags: { caguetouMalandro: false }
              }, 'Pagou pedágio de X-9 pro malandro');
              return 'O menor arranca o dinheiro da sua mão com truculência: "— Tá pago o vacilo. Mas se abrir o bico de novo pro Sargento, vai sumir do mapa!" Seu bolso chora e sua conta pode ter ido pro negativo (-R$ 50,00, -25% Sanidade).';
            }
          },
          {
            id: 'cobranca_apanhar',
            label: 'Enfrentar o malandro na marra e levar uma surra da quebrada',
            costLabel: 'Violência Urbana',
            deltas: { fome: -30, sanidade: -35, perigo: 20, setFlags: { caguetouMalandro: false } },
            execute: (state) => {
              state.apply({
                fome: -30,
                sanidade: -35,
                perigo: 20,
                setFlags: { caguetouMalandro: false }
              }, 'Levou surra de cobrança na viela');
              return 'Dois comparsas brotam do beco da Bento Bicudo. Você leva um sacode, cai no asfalto com a roupa rasgada e o corpo moído de dor (-30% Fome, -35% Sanidade, +20% Perigo)!';
            }
          }
        ];
      }

      // Branch 2: Normal street interactions
      return [
        {
          id: 'salve_quebrada',
          label: 'Mandar um salve de respeito e trocar idéia tranquila',
          costLabel: 'Salve da Quebrada',
          deltas: { sanidade: 14, ginga: 10 },
          execute: (state) => {
            state.apply({ sanidade: 14, ginga: 10 }, 'Trocou idéia com o Menor do Corre');
            return 'Vocês batem as mãos no cumprimento tradicional da Z/O: "— Firmeza total, truta. Na humildade se vai longe." (+14% Sanidade, +10 Ginga).';
          }
        },
        {
          id: 'fazer_corre_crime',
          label: 'Fazer um "Corre do Crime" (Entregar pacote sigiloso na Rua Emílio Lessore)',
          costLabel: '+R$ 75,00 Grana Rápida | +35% B.O.',
          gainCentavos: 7500,
          deltas: { grana: 7500, perigo: 35, ginga: 18 },
          execute: (state, sound) => {
            if (sound) sound.playCoin();
            state.apply({ grana: 7500, perigo: 35, ginga: 18 }, 'Fez o corre do crime na quebrada');
            return 'Você enfia o pacote selado no cós da calça e sobe correndo até o topo da Emílio Lessore. A entrega é rápida e você volta com R$ 75,00 quentinho no bolso (+$$$$$), mas seu Perigo disparou (+35% Perigo, +18 Ginga)!';
          }
        },
        {
          id: 'assalto_mao_armada',
          label: state.perigo < 45
            ? 'Comprar um cigarro avulso no maço'
            : 'Mão armada do malandro: "Passa a carteira e o celular logo!"',
          costLabel: state.perigo < 45 ? 'R$ 2,00' : 'Assalto (-R$ 25,00)',
          costCentavos: state.perigo < 45 ? 200 : 2500,
          deltas: state.perigo < 45
            ? { grana: -200, sanidade: 10 }
            : { grana: -2500, allowNegative: true, sanidade: -20 },
          execute: (state, sound) => {
            if (state.perigo < 45) {
              if (sound) sound.playCoin();
              state.apply({ grana: -200, sanidade: 10 }, 'Comprou cigarro avulso');
              return 'Você solta uma fumaça na esquina olhando os carros da Edgar Facó passarem (-R$ 2,00, +10% Sanidade).';
            } else {
              if (sound) sound.playCoin();
              state.apply({ grana: -2500, allowNegative: true, sanidade: -20 }, 'Assaltado pelo malandro da esquina');
              return 'O moleque exibe o cabo cromado por baixo da camisa e te revista na parede: "— Perdeu, comédia! Passa o cascalho!" Ele leva R$ 25,00 do seu bolso (-R$ 25,00, -20% Sanidade). Se faltou grana, sua conta afunda!';
            }
          }
        }
      ];
    }
  },

  ELEVADOR_PENTHOUSE: {
    id: 'ELEVADOR_PENTHOUSE',
    title: '🛗 ELEVADOR DA COBERTURA (JARAGUÁ TOWER)',
    getIntroText: (state) => `
      O display touchscreen de cristal líquido do elevador privativo brilha em ciano.<br>
      Atrás de você, a vista panorâmica de 180° do Pico do Jaraguá domina a sala.<br>
      O saguão principal e a portaria do edifício estão 12 andares abaixo.<br>
      <small style="color:#00f5d4">Cobertura Triplex • 12º Andar • Jaraguá Tower</small>
    `,
    getOptions: (state) => [
      {
        id: 'descer_terreo',
        label: 'Descer para a portaria (Térreo / Acesso à Rua)',
        costLabel: 'Descer 12 Andares (Grátis)',
        execute: (state, sound) => {
          if (sound && sound.playElevatorChime) sound.playElevatorChime();
          else if (sound && sound.playCoin) sound.playCoin();
          if (typeof window !== 'undefined' && window.app && window.app.controls) {
            window.app.controls.teleport(34.0, 0.25, 4.5);
            window.app.controls.yaw = 0;
          }
          return 'O elevador panorâmico desce suavemente pelos 12 andares até o saguão principal. As portas de aço escovado se abrem na portaria térrea pronta para você explorar Pirituba!';
        }
      },
      {
        id: 'ficar_cobertura',
        label: 'Ficar na cobertura apreciando a vista do Pico do Jaraguá',
        costLabel: '+10% Sanidade (Relaxar)',
        deltas: { sanidade: 10 },
        execute: (state, sound) => {
          state.apply({ sanidade: 10 }, 'Apreciou a vista panorâmica do Jaraguá');
          return 'Você respira fundo olhando o contorno verdejante do morro no horizonte e os carros em miniatura na Edgar Facó. Uma brisa revigorante renova seu espírito (+10% Sanidade).';
        }
      }
    ]
  },

  ELEVADOR_TERREO: {
    id: 'ELEVADOR_TERREO',
    title: '🛗 ELEVADOR DA PORTARIA (JARAGUÁ TOWER)',
    getIntroText: (state) => `
      O elevador de alta velocidade com portas de aço escovado aguarda no saguão social.<br>
      O porteiro acena cordialmente do balcão de granito preto.<br>
      O botão de chamada iluminado em azul dá acesso direto à Cobertura Triplex.<br>
      <small style="color:#00f5d4">Portaria Social • Saguão Térreo • Jaraguá Tower</small>
    `,
    getOptions: (state) => [
      {
        id: 'subir_penthouse',
        label: 'Subir para a Cobertura (Penthouse 12º Andar - Vista Jaraguá)',
        costLabel: 'Subir 12 Andares (Grátis)',
        execute: (state, sound) => {
          if (sound && sound.playElevatorChime) sound.playElevatorChime();
          else if (sound && sound.playCoin) sound.playCoin();
          if (typeof window !== 'undefined' && window.app && window.app.controls) {
            window.app.controls.teleport(37.0, 32.25, 3.5);
            window.app.controls.yaw = Math.PI;
          }
          return 'As portas se fecham com um bip suave e o elevador sobe em segundos até o 12º andar. A vista espetacular de 180 graus do Pico do Jaraguá se descortina através das paredes de vidro!';
        }
      },
      {
        id: 'sair_rua',
        label: 'Sair para as ruas de Pirituba',
        costLabel: 'Portão Principal',
        execute: (state, sound) => {
          if (typeof window !== 'undefined' && window.app && window.app.controls) {
            window.app.controls.teleport(35.0, 0.25, 12.5);
          }
          return 'Você atravessa a porta de vidro giratória e pisa na calçada de Pirituba, sentindo o calor do asfalto paulistano!';
        }
      }
    ]
  },

  BAR_FRANGO: {
    id: 'BAR_FRANGO',
    title: '🍗 O LENDÁRIO BAR FRANGÓ (DESDE 1987)',
    getIntroText: (state) => `
      O aroma irresistível de coxinhas douradas crocantes com Catupiry frita na hora perfuma o casarão colonial.<br>
      A lousa ostenta mais de 400 rótulos de cervejas artesanais paulistanas e do mundo.<br>
      O garçom de colete clássico sorri do balcão de madeira nobre:<br>
      <em>"— Bem-vindo à Freguesia! Vai querer a premiada de frango com catupiry ou o chopp da casa?"</em><br>
      <small style="color:#ffcc00">Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'coxinha_frango',
        label: 'Porção da famosa Coxinha de Frango com Catupiry autêntica',
        costLabel: 'R$ 14,00',
        costCentavos: 1400,
        disabled: !state.canAfford(1400),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1400, fome: 50, sanidade: 35 }, 'Saboreou a lendária coxinha do Frangó');
          return 'A massa finíssima crocante e o recheio cremoso e fumegante de peito de frango desfiado com Catupiry legítimo explodem na boca! Bucho satisfeito (+50%) e Sanidade renovada (+35%). Uma obra de arte gastronômica!';
        }
      },
      {
        id: 'chopp_artesanal',
        label: 'Tulipa de Chopp Artesanal Paulistânia estupidamente gelada',
        costLabel: 'R$ 16,00',
        costCentavos: 1600,
        disabled: !state.canAfford(1600),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBeerOpen ? sound.playBeerOpen() : sound.playGulp(); }
          state.apply({ grana: -1600, sanidade: 30, ginga: 8 }, 'Tomou Chopp Artesanal no Frangó');
          return 'O colarinho denso e cremoso desce suave e refrescante. Sentado na varanda do Frangó com vista para a Praça da Matriz, o estresse paulistano evapora (+30% Sanidade, +8 Ginga).';
        }
      },
      {
        id: 'conversa_garcom',
        label: 'Conversar com o garçom sobre a história centenária do Largo da Matriz',
        costLabel: 'Trocar Ideia (Grátis)',
        execute: (state, sound) => {
          state.apply({ sanidade: 12 }, 'Conversou sobre a história da Freguesia');
          return 'O veterano da casa conta histórias de 1987, de quando o bairro ainda preservava ares de interior caipira. Uma boa prosa revigora o ânimo (+12% Sanidade).';
        }
      }
    ]
  },

  IGREJA_MATRIZ: {
    id: 'IGREJA_MATRIZ',
    title: '⛪ PARÓQUIA NOSSA SENHORA DO Ó (1580)',
    getIntroText: (state) => `
      A paz e o silêncio reverente preenchem a nave histórica construída há mais de 400 anos.<br>
      A luz do sol matutino filtra-se através dos vitrais coloridos, banhando os bancos de jacarandá e o altar barroco dourado.<br>
      O aroma suave de cera e incenso acolhe quem busca um refúgio da agitação urbana.<br>
      <small style="color:#00f5d4">Patrimônio Histórico de São Paulo • Fundada em 1580</small>
    `,
    getOptions: (state) => [
      {
        id: 'acender_vela',
        label: 'Acender uma vela votiva no velário e pedir proteção',
        costLabel: 'R$ 2,00 (Oferta)',
        costCentavos: 200,
        disabled: !state.canAfford(200),
        execute: (state, sound) => {
          if (sound && sound.playCoin) sound.playCoin();
          state.apply({ grana: -200, sanidade: 30, perigo: -25 }, 'Acendeu vela na Matriz do Ó');
          return 'A chama amarela tremula no castiçal de ferro. Você fecha os olhos e sente uma profunda serenidade. Toda a perseguição e tensão do dia se dissolvem (+30% Sanidade, -25% Perigo).';
        }
      },
      {
        id: 'oracao_silenciosa',
        label: 'Sentar no banco de madeira para uma oração e momento de paz',
        costLabel: 'Momento de Paz (Grátis)',
        execute: (state, sound) => {
          state.apply({ sanidade: 20 }, 'Oração silenciosa na Matriz');
          return 'O eco distante dos sinos de bronze e o frescor da pedra colonial acalmam sua respiração. Sua mente se clareia (+20% Sanidade).';
        }
      },
      {
        id: 'contemplar_altar',
        label: 'Contemplar o retábulo e a arquitetura barroca colonial',
        costLabel: 'Contemplação (Grátis)',
        execute: (state, sound) => {
          state.apply({ sanidade: 15, ginga: 5 }, 'Contemplou arte sacra histórica');
          return 'Os entalhes em folha de ouro e a imagem barroca de Nossa Senhora da Esperança revelam séculos de história paulistana (+15% Sanidade, +5 Ginga).';
        }
      }
    ]
  },

  BOTECO_SETE_BARRAS: {
    id: 'BOTECO_SETE_BARRAS',
    title: '🍺 BOTECO DAS 7 BARRAS',
    getIntroText: (state) => `
      O bar raiz da Rua Sete Barras está a todo vapor.<br>
      Um rádio de pilha sintonizado no futebol transmite o lance enquanto bolas de sinuca estalam na mesa verde.<br>
      O dono do boteco bate com um abridor na garrafa de Tubaína:<br>
      <em>"— Chega mais campeão! Vai uma Tubaína retrô trincando ou vai arriscar um jogo na sinuca?"</em><br>
      <small style="color:#ffcc00">Saldo: ${state.formattedGrana} | Bucho: ${state.fome}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'tubaina_pastel',
        label: 'Tubaína Retrô em garrafa de vidro 600ml + Pastel de carne',
        costLabel: 'R$ 7,00',
        costCentavos: 700,
        disabled: !state.canAfford(700),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -700, fome: 35, sanidade: 20 }, 'Tubaína com pastel no Boteco 7 Barras');
          return 'O sabor clássico de tutti-frutti com gás na medida e o pastel frito na hora deram aquela energia que faltava (+35% Bucho, +20% Sanidade)!';
        }
      },
      {
        id: 'partida_sinuca',
        label: 'Jogar uma partida de sinuca valendo aposta (Ficha R$ 5,00)',
        costLabel: 'R$ 5,00 (Aposta)',
        costCentavos: 500,
        disabled: !state.canAfford(500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const win = state.rng.chance(0.65 + (state.ginga / 300));
          if (win) {
            state.apply({ grana: 1500, sanidade: 18, ginga: 10 }, 'Ganhou aposta na sinuca das 7 Barras');
            return 'Você encaçapou a bola 8 no canto com uma tacada de efeito com três tabelas! A galera bateu palma e você faturou R$ 15,00 limpos (+10 Ginga)!';
          } else {
            state.apply({ grana: -500, sanidade: -5, ginga: 4 }, 'Perdeu ficha na sinuca');
            return 'A bola branca deu azar e caiu junto na caçapa do meio. Perdeu a aposta de R$ 5,00, mas ganhou respeito da rapaziada (+4 Ginga).';
          }
        }
      },
      {
        id: 'papo_mecanica',
        label: 'Puxar assunto sobre mecânica de carros e o trânsito da Edgar Facó',
        costLabel: 'Papo Furado (Grátis)',
        execute: (state, sound) => {
          state.apply({ sanidade: 10 }, 'Conversou sobre motores no boteco');
          return 'O papo rolou solto sobre carburador de Uno, troca de óleo e os radares novos da Petrônio Portela (+10% Sanidade).';
        }
      }
    ]
  },

  BLOCO_CARNAVAL: {
    id: 'BLOCO_CARNAVAL',
    title: '🥁 BLOCO DA EDGAR FACÓ',
    getIntroText: (state) => `
      O mestre do bloco segura o apito ao lado do trio estacionado, com o couro do surdo ainda quente.<br>
      Folia no asfalto, confete no chão e o cortejo preso no horário do evento.<br>
      <em>"— Entra na roda, guerreiro! Hoje a Edgar Facó é passarela!"</em><br>
      <small style="color:#ffcc00">Saldo: ${state.formattedGrana} | Sanidade: ${state.sanidade}% | Ginga: ${state.ginga}</small>
    `,
    getOptions: (state) => [
      {
        id: 'dancar_bloco',
        label: state.flags.dancouBloco
          ? 'Dançar no bloco (Você já mandou seu passo neste run)'
          : 'Entrar na roda e dançar no bloco até o apito',
        costLabel: 'Ritmo do cortejo (1x por run)',
        disabled: Boolean(state.flags.dancouBloco),
        execute: (state) => {
          if (state.flags.dancouBloco) {
            return 'O mestre aponta o apito: a cota de dança deste run já foi. O trio segue sem te puxar de novo.';
          }
          const mandouBem = state.rng.chance(0.65);
          if (mandouBem) {
            state.apply({
              ginga: 15,
              sanidade: 20,
              flags: { dancouBloco: true }
            }, 'news.bloco_danca');
            return 'O surdo marcou o passo, o apito fechou a frase e a roda abriu pra você. Cortejo inteiro respondeu (+15 Ginga, +20% Sanidade)!';
          }
          state.apply({
            sanidade: -8,
            ginga: 5,
            flags: { dancouBloco: true }
          }, 'news.bloco_danca');
          return 'O pé escorregou no confete e o apito riu alto. A roda segurou você de pé, mas a moral esfriou (-8% Sanidade, +5 Ginga).';
        }
      }
    ]
  },

  CHURRASCO_CAMPO: {
    id: 'CHURRASCO_CAMPO',
    title: '🍖 CHURRASCO DO CAMPINHO',
    getIntroText: (state) => `
      O churrasqueiro vira a grelha ao lado da churrasqueira de tijolo, fumaça subindo no platô da favela.<br>
      No campo, a pelada segue sem atrapalhar o fogo nem o acesso da ladeira.<br>
      <em>"— Prato feito na brasa ou entra na pelada, chefia?"</em><br>
      <small style="color:#ffcc00">Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'prato_churrasco',
        label: state.canAfford(1800)
          ? 'Pedir o prato do campinho (picanha na brasa, farofa e vinagrete)'
          : 'Pedir o prato do campinho (Sem grana: R$ 18,00 na brasa)',
        costLabel: 'R$ 18,00',
        costCentavos: 1800,
        disabled: !state.canAfford(1800),
        execute: (state, sound) => {
          if (!state.canAfford(1800)) {
            return 'O churrasqueiro cobre a grelha: sem os R$ 18,00 o prato não sai. Nada foi cobrado e o fogo segue no mesmo ponto.';
          }
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({
            grana: -1800,
            fome: 40,
            sanidade: 22
          }, 'news.churrasco_prato');
          return 'Prato quente, farofa úmida e vinagrete no ponto. O bucho agradece e a cabeça esfria (-R$ 18,00, +40% Bucho, +22% Sanidade).';
        }
      },
      {
        id: 'pelada_campo',
        label: state.flags.jogouPelada
          ? 'Entrar na pelada (Você já jogou sua partida neste run)'
          : 'Pedir pra entrar na pelada do campinho',
        costLabel: 'Uma partida (1x por run)',
        disabled: Boolean(state.flags.jogouPelada),
        execute: (state) => {
          if (state.flags.jogouPelada) {
            return 'Os craques apontam o banco: a vaga da pelada deste run já foi. O campo segue sem te recolocar.';
          }
          const ganhou = state.rng.chance(0.55);
          if (ganhou) {
            state.apply({
              ginga: 18,
              sanidade: 12,
              fome: -6,
              flags: { jogouPelada: true }
            }, 'news.pelada_campo');
            return 'Você recebeu na meia, cruzou rasteiro e a galera gritou gol no platô (+18 Ginga, +12% Sanidade, -6% Bucho)!';
          }
          state.apply({
            ginga: 8,
            fome: -10,
            sanidade: 6,
            flags: { jogouPelada: true }
          }, 'news.pelada_campo');
          return 'A bola escapou no toco e você correu atrás até o fim. Perdeu o lance, mas suou a camisa (+8 Ginga, +6% Sanidade, -10% Bucho).';
        }
      }
    ]
  },

  BARBEARIA_ACLIVE: {
    id: 'BARBEARIA_ACLIVE',
    title: '💈 BARBEARIA DO SEU ANTÔNIO',
    getIntroText: (state) => `
      O cheiro inconfundível de loção pós-barba mentolada e talco perfumado enche o salão.<br>
      Seu Antônio afia o navalhete no couro de boi e aponta para a cadeira giratória:<br>
      <em>"— Entra aí meu chapa! Barba, cabelo ou só dar um tapa no visual?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Ginga: ${state.ginga} | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'corte_degrade',
        label: 'Corte na régua degradê + Barba desenhada na navalha com toalha quente',
        costLabel: 'R$ 35,00',
        costCentavos: 3500,
        disabled: !state.canAfford(3500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -3500, sanidade: 28, ginga: 20 }, 'Corte na régua do Seu Antônio');
          return 'Cabelo disfarçado no capricho e barba alinhada no navalhete com toalha quente aromática. Autoestima lá em cima (+28% Sanidade, +20 Ginga)!';
        }
      },
      {
        id: 'papo_futebol',
        label: state.flags.falouSeuAntonio
          ? 'Conversar com Seu Antônio (Já resenhou com ele hoje)'
          : 'Bater papo sobre o Brasileirão e os causos da ladeira',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.falouSeuAntonio),
        execute: (state) => {
          state.apply({ sanidade: 12, ginga: 5, flags: { falouSeuAntonio: true } }, 'Resenha na barbearia');
          return 'Seu Antônio lembrou da final de 94, cornetou o técnico do time e te deu um conselho de ouro sobre a vizinhança (+12% Sanidade, +5 Ginga).';
        }
      },
      {
        id: 'comprar_pomada',
        label: 'Comprar pomada modeladora de efeito seco',
        costLabel: 'R$ 15,00',
        costCentavos: 1500,
        disabled: !state.canAfford(1500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -1500, ginga: 15, sanidade: 10 }, 'Pomada modeladora');
          return 'Penteado travado que resiste à garoa e ao vento da Paula Ferreira! Visual blindado (+15 Ginga, +10% Sanidade).';
        }
      }
    ]
  },

  ACOUQUE_BOI_DE_OURO: {
    id: 'ACOUQUE_BOI_DE_OURO',
    title: '🥩 AÇOUGUE BOI DE OURO',
    getIntroText: (state) => `
      Ganchos de inox com peças de carne fresca, aroma de corte fresco e o som rítmico do cutelo na tábua.<br>
      O açougueiro de avental plástico cumprimenta com um aceno vigoroso:<br>
      <em>"— Bom dia patrão! Hoje a picanha e a linguiça campeira estão daquele jeito, primeira linha!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'comprar_linguica',
        label: 'Comprar 1kg de linguiça campeira artesanal temperada',
        costLabel: 'R$ 22,00',
        costCentavos: 2200,
        disabled: !state.canAfford(2200),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -2200, fome: 40, sanidade: 15 }, 'Linguiça campeira artesanal');
          return 'Linguiça suculenta grelhada no ponto com ervas finas e pimenta suave. O bucho agradece e a fome foi embora (+40% Bucho, +15% Sanidade).';
        }
      },
      {
        id: 'comprar_carne_churrasco',
        label: 'Comprar pedaço nobre de picanha maturada',
        costLabel: 'R$ 45,00',
        costCentavos: 4500,
        disabled: !state.canAfford(4500),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -4500, fome: 55, sanidade: 28, ginga: 10 }, 'Picanha maturada');
          return 'Carne macia com aquela capa de gordura dourada no sal grosso. Almoço de rei em plena subida da Freguesia (+55% Bucho, +28% Sanidade, +10 Ginga)!';
        }
      },
      {
        id: 'pedir_osso_sopa',
        label: state.flags.pegouOssoAcougue
          ? 'Pedir ossinho de boi pro cachorro / sopa (Cota do dia já retirada)'
          : 'Pedir um ossinho de boi com tutano para o caldo',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.pegouOssoAcougue),
        execute: (state) => {
          state.apply({ sanidade: 8, fome: 5, flags: { pegouOssoAcougue: true } }, 'Osso com tutano');
          return 'O açougueiro embrulhou com carinho um osso recheado de tutano: "— Faz um caldão reforçado que levanta defunto!" (+8% Sanidade, +5% Bucho).';
        }
      }
    ]
  },

  HORTIFRUTI_PAULA_FERREIRA: {
    id: 'HORTIFRUTI_PAULA_FERREIRA',
    title: '🍎 HORTIFRÚTI DA LADEIRA',
    getIntroText: (state) => `
      Caixotes de madeira transbordando frutas coloridas, cheiro verde de coentro e laranjas recém-chegadas do CEAGESP.<br>
      A dona da banca borrifa água fresca nas verduras e sorri calorosa:<br>
      <em>"— Olá freguês! Fruta doce, verdura fresquinha e água de coco gelada pra hidratar na ladeira!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'duzia_banana',
        label: 'Comprar uma dúzia de bananas-prata maduras',
        costLabel: 'R$ 8,00',
        costCentavos: 800,
        disabled: !state.canAfford(800),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -800, fome: 25, sanidade: 12 }, 'Bananas do CEAGESP');
          return 'Bananas doces e ricas em potássio para encarar a subida íngreme sem cãibra (+25% Bucho, +12% Sanidade).';
        }
      },
      {
        id: 'agua_coco',
        label: 'Tomar uma água de coco gelada furada na hora',
        costLabel: 'R$ 7,00',
        costCentavos: 700,
        disabled: !state.canAfford(700),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -700, fome: 15, sanidade: 22 }, 'Água de coco da ladeira');
          return 'Água de coco doce e trincando de gelada com canudinho biodegradável. Hidratação pura sob o sol de Pirituba (+15% Bucho, +22% Sanidade)!';
        }
      },
      {
        id: 'escolher_laranja',
        label: state.flags.provouFrutaLadeira
          ? 'Experimentar gomo de fruta na banca (Já provou hoje)'
          : 'Aceitar um gomo de tangerina ponkã cortado na faca',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.provouFrutaLadeira),
        execute: (state) => {
          state.apply({ sanidade: 6, fome: 5, flags: { provouFrutaLadeira: true } }, 'Gomo de tangerina');
          return 'A dona te oferece um gomo no capricho: "— Doce feito mel, freguês!" Refrescou a garganta e alegrou o dia (+6% Sanidade, +5% Bucho).';
        }
      }
    ]
  },

  BOTECO_LADEIRA: {
    id: 'BOTECO_LADEIRA',
    title: '🍻 BAR DA LADEIRA (SINUCA & DOMINÓ)',
    getIntroText: (state) => `
      As pedras de dominó estalam com força nas mesinhas de madeira sob o toldo amarelo.<br>
      Aposentados de chapéu de palha dão risada alta enquanto uma garrafa de cerveja sua no balde de gelo:<br>
      <em>"— Quem é o próximo pra tomar um coro no dominó? Senta aí freguês!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Ginga: ${state.ginga} | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'partida_domino',
        label: state.flags.jogouDominoLadeira
          ? 'Jogar partida de dominó apostada (Já jogou seu desafio nesta rodada)'
          : 'Desafiar os veteranos no dominó (Aposta R$ 5,00)',
        costLabel: 'Aposta R$ 5,00 (1x por run)',
        costCentavos: 500,
        disabled: Boolean(state.flags.jogouDominoLadeira) || !state.canAfford(500),
        execute: (state, sound) => {
          const vitoria = state.rng.chance(Math.min(0.85, 0.40 + (state.ginga / 200)));
          if (vitoria) {
            if (sound) sound.playCoin();
            state.apply({
              grana: 1500,
              ginga: 16,
              sanidade: 18,
              flags: { jogouDominoLadeira: true }
            }, 'Vitória no dominó da ladeira');
            return '— BUCHA DE SENA NA CABEÇA! Você bateu de primeira fechando o jogo. Os velhinhos aplaudiram e passaram R$ 15,00 (+R$ 15,00, +16 Ginga, +18% Sanidade)!';
          } else {
            state.apply({
              grana: -500,
              ginga: 5,
              sanidade: 6,
              flags: { jogouDominoLadeira: true }
            }, 'Derrota honrosa no dominó');
            return 'O Seu Ditinho bateu na ponta com um carretão invisível! Você perdeu R$ 5,00, mas ganhou o respeito da mesa (+5 Ginga, +6% Sanidade).';
          }
        }
      },
      {
        id: 'cerveja_torresmo',
        label: 'Cerveja 600ml gelada de garrafa + Porção de torresmo crocante',
        costLabel: 'R$ 16,00',
        costCentavos: 1600,
        disabled: !state.canAfford(1600),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1600, fome: 32, sanidade: 24 }, 'Cerveja e torresmo da ladeira');
          return 'Copo lagoinha cheio de colarinho branco e torresmo que estala a cada mordida. O cansaço da subida sumiu no ato (+32% Bucho, +24% Sanidade).';
        }
      },
      {
        id: 'prosa_balcao',
        label: state.flags.prosaLadeira
          ? 'Ouvir conselhos no balcão (Já conversou hoje)'
          : 'Tomar uma água mineral com gás e ouvir os causos antigos de Pirituba',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.prosaLadeira),
        execute: (state) => {
          state.apply({ sanidade: 10, flags: { prosaLadeira: true } }, 'Prosa no balcão da ladeira');
          return 'O dono do bar conta quando a Paula Ferreira era estrada de terra batida e bondinho subia até a igreja. Nostalgia pura (+10% Sanidade).';
        }
      }
    ]
  },

  CASA_DO_NORTE: {
    id: 'CASA_DO_NORTE',
    title: '☀️ CASA DO NORTE ASA BRANCA',
    getIntroText: (state) => `
      O aroma inebriante de carne de sol assada na manteiga de garrafa e queijo coalho na brasa invade o ar.<br>
      Música de Luiz Gonzaga ecoa suave de uma caixinha de som enquanto o dono te recebe de braços abertos:<br>
      <em>"— Ô cabra bom! Aqui tem sustança pra aguentar qualquer tranco em São Paulo!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'baiao_dois',
        label: 'Prato comercial farto de Baião de Dois com carne de sol e queijo coalho',
        costLabel: 'R$ 26,00',
        costCentavos: 2600,
        disabled: !state.canAfford(2600),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -2600, fome: 60, sanidade: 30 }, 'Baião de Dois da Casa do Norte');
          return 'Feijão fradinho, arroz soltinho, pedaços generosos de carne de sol e nata. Sustança pesada que enche o bucho por horas (+60% Bucho, +30% Sanidade)!';
        }
      },
      {
        id: 'queijo_coalho',
        label: 'Espeto de queijo coalho tostado com melaço de cana de rapadura',
        costLabel: 'R$ 12,00',
        costCentavos: 1200,
        disabled: !state.canAfford(1200),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1200, fome: 30, sanidade: 18 }, 'Queijo coalho com melaço');
          return 'Queijo dourado estalando com crostinha crocante e o toque adocicado do melaço artesanal (+30% Bucho, +18% Sanidade).';
        }
      },
      {
        id: 'dose_cachaca_artesanal',
        label: 'Dose de cachaça de alambique curtida na casca de jatobá',
        costLabel: 'R$ 6,00',
        costCentavos: 600,
        disabled: !state.canAfford(600),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -600, ginga: 15, sanidade: 10, fome: -5 }, 'Cachaça curtida no jatobá');
          return 'Desceu queimando a garganta e esquentando a alma. O passo ficou mais leve e o gingado afiado (+15 Ginga, +10% Sanidade, -5% Bucho)!';
        }
      }
    ]
  },

  LOTERICA_PIRITUBA: {
    id: 'LOTERICA_PIRITUBA',
    title: '🍀 LOTÉRICA PIRITUBA',
    getIntroText: (state) => `
      Guichês blindados com avisos da Caixa, cartazes da Mega-Sena acumulada e o barulho de impressoras térmicas.<br>
      A atendente atende no interfone do vidro:<br>
      <em>"— Próximo! Vai ser aposta da sorte ou pagamento de contas no Caixa Aqui?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Ginga: ${state.ginga} | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'aposta_mega_sena',
        label: 'Fazer uma fezinha na Mega-Sena (Volante simples de 6 dezenas)',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const sorteGrande = state.rng.chance(0.015);
          const sorteMedia = !sorteGrande && state.rng.chance(0.15);

          if (sorteGrande) {
            state.apply({ grana: 50000, sanidade: 50, ginga: 35 }, 'ACERTOU NA MEGA-SENA!');
            return '🎉 INACREDITÁVEL! SUA APOSTA BATEU NA QUADRA PREMIADA! Você recebeu R$ 500,00 na hora no guichê (+R$ 500,00, +50% Sanidade, +35 Ginga)!';
          } else if (sorteMedia) {
            state.apply({ grana: 4500, sanidade: 22, ginga: 15 }, 'Acerto na raspadinha/loto');
            return '🍀 O bilhete rendeu um prêmio surpresa de R$ 50,00! A atendente te pagou em dinheiro vivo (+R$ 50,00, +22% Sanidade, +15 Ginga)!';
          } else {
            state.apply({ grana: -500, sanidade: 10 }, 'Aposta Mega-Sena');
            return 'Comprovante verde no bolso. A esperança de ficar milionário renova as energias do trabalhador paulistano (+10% Sanidade).';
          }
        }
      },
      {
        id: 'pagar_conta_luz',
        label: state.flags.boletoPago
          ? 'Pagar conta de luz Enel (Boleto do dia já quitado com sucesso)'
          : (!state.hasItem('boleto_enel')
            ? 'Pagar conta de luz da Enel (Sem boleto na carteira)'
            : 'Pagar conta de luz da Enel (Meta do dia)'),
        costLabel: 'R$ 124,50',
        costCentavos: 12450,
        disabled: Boolean(state.flags.boletoPago) || !state.canAfford(12450) || !state.hasItem('boleto_enel'),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({
            grana: -12450,
            sanidade: 35,
            removeInventoryId: 'boleto_enel',
            flags: { boletoPago: true }
          }, 'Pagamento da conta de luz na Lotérica');
          return 'Boleto autenticado no guichê com carimbo mecânico! Nome limpo e energia garantida (+35% Sanidade)!';
        }
      },
      {
        id: 'raspadinha_dinheiro',
        label: 'Comprar Raspadinha Instantânea da Caixa',
        costLabel: 'R$ 3,00',
        costCentavos: 300,
        disabled: !state.canAfford(300),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const ganhou = state.rng.chance(0.40);
          if (ganhou) {
            state.apply({ grana: 700, sanidade: 15, ginga: 10 }, 'Prêmio na Raspadinha');
            return 'Raspou a moeda e achou três trevos dourados! Ganhou R$ 10,00 no ato (+R$ 7,00 líquido, +15% Sanidade, +10 Ginga)!';
          } else {
            state.apply({ grana: -300, sanidade: -3 }, 'Raspadinha sem prêmio');
            return 'Bateu na trave: dois números iguais e um diferente. Fica pra próxima (-R$ 3,00, -3% Sanidade).';
          }
        }
      }
    ]
  },

  PASTELARIA_BETO: {
    id: 'PASTELARIA_BETO',
    title: '🥟 PASTELARIA DO BETO',
    getIntroText: (state) => `
      O barulho borbulhante do tacho de óleo quente e o vapor doce da cana moída no engenho elétrico.<br>
      Seu Beto escorre um pastel dourado e estalando com a escumadeira inox:<br>
      <em>"— Saiu agora, sequinho e crocante! Vai querer de carne com ovo ou queijo especial?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'pastel_especial_30cm',
        label: 'Pastel Especial de 30cm (Carne moída, queijo, ovo e azeitona) + Copo de Garapa 500ml',
        costLabel: 'R$ 15,00',
        costCentavos: 1500,
        disabled: !state.canAfford(1500),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1500, fome: 55, sanidade: 25 }, 'Pastel de 30cm com caldo de cana');
          return 'Massa folhada cheia de bolhas crocantes, queijo esticando e caldo de cana com limão trincando de gelado. Bucho lotado (+55% Bucho, +25% Sanidade)!';
        }
      },
      {
        id: 'pastel_palmito',
        label: 'Pastel vegetariano de palmito pupunha cremoso',
        costLabel: 'R$ 10,00',
        costCentavos: 1000,
        disabled: !state.canAfford(1000),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1000, fome: 35, sanidade: 16 }, 'Pastel de palmito cremoso');
          return 'Recheio cremoso e farto, massa levinha e crocante. Clássico paulistano aprovado (+35% Bucho, +16% Sanidade).';
        }
      },
      {
        id: 'vinagrete_extra',
        label: state.flags.vinagreteBeto
          ? 'Caprichar no pote de vinagrete e pimenta (Já temperou hoje)'
          : 'Temperar o pastel com o vinagrete caseiro e molho de pimenta da casa',
        costLabel: 'Grátis (1x por dia)',
        disabled: Boolean(state.flags.vinagreteBeto),
        execute: (state) => {
          state.apply({ sanidade: 6, ginga: 4, flags: { vinagreteBeto: true } }, 'Vinagrete com pimenta');
          return 'Colherada farta de vinagrete ácido com pimenta malagueta caseira. Deu aquele toque de mestre no lanche (+6% Sanidade, +4 Ginga).';
        }
      }
    ]
  },

  BAR_DO_PEIXE: {
    id: 'BAR_DO_PEIXE',
    title: '🐟 BAR & PETISCARIA CANTINHO DO PEIXE',
    getIntroText: (state) => `
      As mesas externas sob guarda-sóis azuis servem travessas de peixe frito estalando e limão cortado em quatro.<br>
      O garçom de bandeja equilibrada no ombro sorri na calçada:<br>
      <em>"— Fala patrão! Isca de tilápia com molho tártaro ou manjubinha frita com cerveja trincando?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'isca_tilapia',
        label: 'Porção farta de isca de tilápia crocante com molho tártaro e limão taiti',
        costLabel: 'R$ 32,00',
        costCentavos: 3200,
        disabled: !state.canAfford(3200),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -3200, fome: 50, sanidade: 28 }, 'Isca de tilápia crocante');
          return 'Peixe fresco, empanado fininho e crocante com gotas de limão e molho tártaro cremoso. Almoço de respeito (+50% Bucho, +28% Sanidade)!';
        }
      },
      {
        id: 'lambari_cerveja',
        label: 'Porção de manjubinha frita + Cerveja 600ml estupidamente gelada no balde',
        costLabel: 'R$ 24,00',
        costCentavos: 2400,
        disabled: !state.canAfford(2400),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -2400, fome: 40, sanidade: 24 }, 'Manjubinha e cerveja trincando');
          return 'Petisco clássico de boteco paulistano acompanhado de cerveja com aquela garoa de gelo no vidro (+40% Bucho, +24% Sanidade).';
        }
      },
      {
        id: 'pedir_caldo_peixe',
        label: 'Caldinho de peixe quente temperado no copinho com cebolinha',
        costLabel: 'R$ 8,00',
        costCentavos: 800,
        disabled: !state.canAfford(800),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -800, fome: 22, sanidade: 16 }, 'Caldinho de peixe');
          return 'Caldo fumegante com cheiro-verde e pimentinha que assenta o estômago e revigora as forças (+22% Bucho, +16% Sanidade).';
        }
      }
    ]
  },

  ESCOLA_PUBLICA: {
    id: 'ESCOLA_PUBLICA',
    title: '🏫 E.E. PROF. LOURENÇO FILHO (ESCOLA ESTADUAL)',
    getIntroText: (state) => `
      Tia Cida, inspetora de longa data com seu avental azul e molho de chaves na cintura, te encara no portão:<br>
      <em>"— Olha só quem apareceu! Você estudou aqui, né? Ou veio matar aula de novo na praça?"</em><br>
      O cheiro inconfundível de merenda escolar invade a calçada e o som de uma bola de futsal quicando na quadra ecoa pelo pátio.<br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'pedir_merenda',
        label: 'Pedir prato de merenda escolar (arroz doce com canela & biscoito de polvilho)',
        costLabel: 'Grátis (Merenda Escolar)',
        disabled: Boolean(state.flags.merendaHoje),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ fome: 35, sanidade: 20, flags: { merendaHoje: true } }, 'Merenda da Tia Cida');
          return 'Tia Cida te serve com carinho um prato fundo de arroz doce quentinho com canela polvilhada. Lembrança doce da infância em Pirituba (+35% Bucho, +20% Sanidade)!';
        }
      },
      {
        id: 'pelada_quadra',
        label: 'Entrar na quadra poliesportiva e jogar uma pelada de futsal com a molecada',
        costLabel: '+10 Ginga (Gasto de Energia)',
        execute: (state, sound) => {
          if (sound) {
            if (typeof sound.playKickBall === 'function') sound.playKickBall();
            else if (typeof sound.playKick === 'function') sound.playKick();
          }
          state.apply({ ginga: 10, sanidade: 16, fome: -10 }, 'Pelada na quadra da escola');
          return 'Você correu na quadra de cimento áspero, driblou dois moleques e mandou um golaço de bico no ângulo! O recreio inteiro aplaudiu (+10 Ginga, +16% Sanidade, -10% Bucho).';
        }
      },
      {
        id: 'lembranca_boletim',
        label: 'Conversar com a Tia Cida e lembrar das histórias do antigo boletim escolar',
        costLabel: '+12% Sanidade (Nostalgia)',
        execute: (state) => {
          state.apply({ sanidade: 12, ginga: 4 }, 'Papo com a inspetora Tia Cida');
          return 'Tia Cida dá risada lembrando de quando você escondia o boletim da sua mãe no forro do telhado: "— Você dava trabalho, mas tinha coração bom!" (+12% Sanidade, +4 Ginga).';
        }
      }
    ]
  },

  PARQUE_PETRONIO: {
    id: 'PARQUE_PETRONIO',
    title: '🌳 PRAÇA & PARQUE LINEAR PETRÔNIO PORTELA',
    getIntroText: (state) => `
      Os Ipês amarelos derramam flores douradas na calçada de pedra. O vento fresco balança as folhas enquanto aposentados se exercitam na academia ao ar livre.<br>
      Seu Zico sorri ao lado do seu carrinho de pipoca com sombrinha listrada:<br>
      <em>"— Pipoca quentinha com bacon crocante e queijo ralado, chefia! Vai um saco caprichado?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'pipoca_bacon',
        label: 'Comprar saquinho grande de pipoca com cubos de bacon crocante e queijo ralado',
        costLabel: 'R$ 6,00',
        costCentavos: 600,
        disabled: !state.canAfford(600),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -600, fome: 30, sanidade: 22 }, 'Pipoca com bacon do Seu Zico');
          return 'Pipoca salgadinha estalando de fresca com cubinhos de bacon dourado e queijo parmesão. O aroma clássico das praças paulistanas (+30% Bucho, +22% Sanidade)!';
        }
      },
      {
        id: 'academia_ar_livre',
        label: 'Fazer uma série completa no simulador de caminhada e barras da academia da prefeitura',
        costLabel: '+20% Sanidade (Exercício Grátis)',
        execute: (state) => {
          state.apply({ sanidade: 20, ginga: 8, fome: -8 }, 'Academia ao ar livre');
          return 'Você faz 15 minutos no aparelho de caminhada amarelo e alonga as costas na barra. O sangue circula e o cansaço mental vai embora (+20% Sanidade, +8 Ginga, -8% Bucho).';
        }
      },
      {
        id: 'descanso_ipe',
        label: 'Sentar no banco de madeira sob a copa florida do Ipê amarelo para respirar',
        costLabel: '+15% Sanidade (Paz de Espírito)',
        execute: (state) => {
          state.apply({ sanidade: 15 }, 'Descanso na sombra do Ipê');
          return 'Você senta no banco de praça ouvindo o canto dos sabiás entre as flores amarelas. Um momento raro de calma e serenidade na correria de São Paulo (+15% Sanidade).';
        }
      }
    ]
  },

  ESPETINHO_PETRONIO: {
    id: 'ESPETINHO_PETRONIO',
    title: '🍢 BAR & ESPETINHO DA PETRÔNIO',
    getIntroText: (state) => `
      A fumaça perfumada de carvão vegetal com gordura chiando na brasa atrai a vizinhança para as mesas amarelas na calçada.<br>
      Seu Toninho, de pinça longa e pano de prato no ombro, vira os espetos com maestria:<br>
      <em>"— Saiu carne no capricho, queijo coalho com melaço e frango com bacon! Chopp gelado trincando saindo na bica!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'combo_espetinho',
        label: 'Combo de 2 espetinhos artesanais com farofa crocante, vinagrete caseiro e pão de alho',
        costLabel: 'R$ 16,00',
        costCentavos: 1600,
        disabled: !state.canAfford(1600),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1600, fome: 50, sanidade: 25 }, 'Combo de espetinhos com farofa');
          return 'Carne macia e suculenta assada na brasa, farofinha temperada e vinagrete fresquinho. Refeição completa de boteco (+50% Bucho, +25% Sanidade)!';
        }
      },
      {
        id: 'chopp_artesanal',
        label: 'Caneca de chopp gelado com colarinho cremoso servido na mesa da calçada',
        costLabel: 'R$ 9,00',
        costCentavos: 900,
        disabled: !state.canAfford(900),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -900, sanidade: 26, ginga: 6, fome: 6 }, 'Chopp gelado no espetinho');
          return 'Chopp leve e refrescante descendo redondo enquanto a brisa da noite sopra pela Petrônio Portela (+26% Sanidade, +6 Ginga).';
        }
      },
      {
        id: 'queijo_coalho',
        label: 'Espetinho de queijo coalho dourado com orégano e fio de melado',
        costLabel: 'R$ 8,00',
        costCentavos: 800,
        disabled: !state.canAfford(800),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -800, fome: 26, sanidade: 18 }, 'Queijo coalho com melaço');
          return 'Queijo com casquinha tostada e recheio puxento doce e salgado. Delícia nordestina tradicional (+26% Bucho, +18% Sanidade).';
        }
      }
    ]
  },

  PAPELARIA_BAZAR: {
    id: 'PAPELARIA_BAZAR',
    title: '📚 PAPELARIA, BAZAR & AUTOESCOLA PETRÔNIO',
    getIntroText: (state) => `
      Cadernos espirais coloridos, mochilas escolares e cartolinas preenchem a vitrine da Papelaria Pirituba.<br>
      Ao lado, a placa iluminada da Autoescola Petrônio exibe o Fiat Uno com teto de autoescola estacionado.<br>
      A atendente no balcão de vidro te cumprimenta com um sorriso:<br>
      <em>"— Boa tarde! Precisa tirar xerox, materiais ou recarregar o Bilhete Único?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'recarga_bilhete',
        label: 'Recarregar R$ 20,00 no Bilhete Único para transporte público SPTrans',
        costLabel: 'R$ 20,00',
        costCentavos: 2000,
        disabled: !state.canAfford(2000) || Boolean(state.flags.bilheteRecarregado),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -2000, sanidade: 15, flags: { bilheteRecarregado: true } }, 'Recarga Bilhete Único');
          return 'Cartão encostado na máquina, bipe sonoro de confirmação e saldo liberado para pegar qualquer ônibus municipal sem perrengue (+15% Sanidade, Bilhete Carregado)!';
        }
      },
      {
        id: 'comprar_material',
        label: 'Comprar caneta Bic azul, bloquinho de notas e balas de canela no caixa',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -500, sanidade: 12, ginga: 4 }, 'Materiais e balas de canela');
          return 'Caneta nova para assinar documentos e o bloquinho de anotações no bolso. Dá uma sensação profissional de organização (+12% Sanidade, +4 Ginga).';
        }
      },
      {
        id: 'tirar_xerox',
        label: 'Tirar xerox de documentos e comprovante de residência no balcão',
        costLabel: 'R$ 2,00',
        costCentavos: 200,
        disabled: !state.canAfford(200),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -200, sanidade: 8 }, 'Xerox de documentos');
          return 'Luz verde da máquina correndo no vidro e folha quente saindo na bandeja. Burocracia paulistana resolvida rápido (+8% Sanidade).';
        }
      }
    ]
  },

  IGREJA_DO_MORRO: {
    id: 'IGREJA_DO_MORRO',
    title: '⛪ IGREJINHA DO MORRO // PADRE BENTO',
    getIntroText: (state) => `
      A brisa suave sopra no alto do morro enquanto o sino de bronze repica no campanário.<br>
      A vista panorâmica descortina toda a extensão da Av. Petrônio Portela e as colinas de Pirituba.<br>
      O Padre Bento, de batina preta e olhar acolhedor, te recebe com a mão estendida:<br>
      <em>"— A paz de Cristo, meu filho! Seja bem-vindo à nossa capela. O que traz ao seu coração hoje?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'acender_vela_bencao',
        label: 'Acender uma vela votiva no altar e receber a bênção solene do Padre Bento',
        costLabel: 'R$ 3,00',
        costCentavos: 300,
        disabled: !state.canAfford(300),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -300, sanidade: 28, perigo: -15 }, 'Bênção do Padre Bento');
          return 'O Padre traça o sinal da cruz na sua testa e profere palavras de conforto e serenidade. A chama da vela bruxuleia no altar de pedra (+28% Sanidade, -15% Perigo).';
        }
      },
      {
        id: 'admirar_mirante',
        label: 'Apreciar o horizonte do mirante da igrejinha e respirar o ar puro do morro',
        costLabel: '+20% Sanidade (Grátis)',
        execute: (state, sound) => {
          state.apply({ sanidade: 20, ginga: 4 }, 'Mirante da igrejinha do morro');
          return 'Debruçado no parapeito de ferro colonial, você observa o trânsito lá embaixo e as árvores floridas balançando ao vento. Paz de espírito revigorante (+20% Sanidade, +4 Ginga).';
        }
      },
      {
        id: 'doacao_paroquia',
        label: 'Fazer uma contribuição de R$ 10,00 para as obras sociais e sopa comunitária da paróquia',
        costLabel: 'R$ 10,00',
        costCentavos: 1000,
        disabled: !state.canAfford(1000),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -1000, sanidade: 35, ginga: 10 }, 'Doação para paróquia');
          return 'Você deposita a cédula no cofre de madeira. O Padre Bento agradece comovido: "— Que Deus multiplique em sua vida!" O coração se enche de luz (+35% Sanidade, +10 Ginga).';
        }
      }
    ]
  },

  COLEGIO_WELLINGTON: {
    id: 'COLEGIO_WELLINGTON',
    title: '🏫 COLÉGIO WELLINGTON // PROF. MAURÍCIO',
    getIntroText: (state) => `
      O sinal da escola ecoa pelo pátio moderno e o burburinho animado dos estudantes invade a portaria.<br>
      Na quadra de esportes, o som da bola quicando e gritos de incentivo marcam o intervalo.<br>
      O Professor Maurício, com crachá no peito e livros didáticos sob o braço, cumprimenta na entrada:<br>
      <em>"— Bom dia, jovem! Veio se informar sobre as matrículas, o simulado do Enem ou bater uma bola?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'conversa_professor',
        label: 'Conversar com o Professor Maurício sobre atualidades e dicas de redação',
        costLabel: '+18% Sanidade (Ideias & Cultura)',
        execute: (state, sound) => {
          state.apply({ sanidade: 18, ginga: 8 }, 'Dicas de estudo com Prof. Maurício');
          return 'O professor compartilha análises brilhantes sobre literatura brasileira e pensamento crítico. Conhecimento que expande horizontes (+18% Sanidade, +8 Ginga).';
        }
      },
      {
        id: 'bater_bola_quadra',
        label: 'Entrar na quadra poliesportiva para um bate-bola rápido de futsal com a turma',
        costLabel: '+22% Sanidade / -10% Bucho',
        execute: (state, sound) => {
          state.apply({ sanidade: 22, ginga: 12, fome: -10 }, 'Bate-bola no Wellington');
          return 'Dribles rápidos na quadra de cimento azul, tabelinha na ala e chute no ângulo! O suor limpa a cabeça e traz de volta a alegria dos tempos de escola (+22% Sanidade, +12 Ginga, -10% Bucho).';
        }
      },
      {
        id: 'salgado_cantina',
        label: 'Comprar esfiha folhada de carne e um suco de uva integral gelado na cantina',
        costLabel: 'R$ 8,00',
        costCentavos: 800,
        disabled: !state.canAfford(800),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -800, fome: 32, sanidade: 16 }, 'Lanche da cantina do Wellington');
          return 'Esfiha quentinha com massa folhada dourada e recheio temperado com hortelã, acompanhado de suco gelado. Clássico recreio escolar (+32% Bucho, +16% Sanidade).';
        }
      }
    ]
  },

  MERCADO_PYRITUBA: {
    id: 'MERCADO_PYRITUBA',
    title: '🛒 MERCADO MUNICIPAL DE PYRITUBA // SEU BETO',
    getIntroText: (state) => `
      O galpão coberto vibra com o colorido de caixas de frutas, queijos da Canastra e temperos nordestinos.<br>
      No corredor central, o chiado de óleo borbulhante anuncia os tradicionais pastéis de feira com caldo de cana.<br>
      Seu Beto, de avental listrado e boné de feirante, ajeita um cacho de bananas-ouro e grita animado:<br>
      <em>"— Olha a fruta fresquinha, freguês! Pastel sequinho na hora e o melhor queijo coalho da Petrônio!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'pastel_caldo_mercado',
        label: 'Pedir pastel crocante de carne seca com queijo coalho e copo de caldo de cana gelado com limão',
        costLabel: 'R$ 13,00',
        costCentavos: 1300,
        disabled: !state.canAfford(1300),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1300, fome: 48, sanidade: 24 }, 'Pastel de carne seca e caldo de cana');
          return 'Massa estaladiça com bolhas douradas, recheio farto de carne desfiada suculenta e caldo de cana geladinho que lava a alma (+48% Bucho, +24% Sanidade)!';
        }
      },
      {
        id: 'cesta_frutas',
        label: 'Comprar uma cesta sortida de frutas frescas da época (bananas-ouro, laranjas-pera e mamão papaia)',
        costLabel: 'R$ 10,00',
        costCentavos: 1000,
        disabled: !state.canAfford(1000),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1000, fome: 35, sanidade: 20 }, 'Cesta de frutas do Seu Beto');
          return 'Frutas doces, cheirosas e cheias de vitaminas direto da roça. Nutrição de primeira para aguentar o dia a dia (+35% Bucho, +20% Sanidade).';
        }
      },
      {
        id: 'queijo_manteiga',
        label: 'Comprar uma peça de queijo meia cura artesanal e uma garrafa de manteiga de garrafa pura',
        costLabel: 'R$ 18,00',
        costCentavos: 1800,
        disabled: !state.canAfford(1800),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -1800, sanidade: 28, ginga: 10, fome: 20 }, 'Queijo da Canastra e manteiga de garrafa');
          return 'Iguarias da mais alta tradição empacotadas no papel pardo. Sabor autêntico que alegra a despensa e o paladar (+28% Sanidade, +20% Bucho, +10 Ginga).';
        }
      }
    ]
  },

  RESTAURANTE_AMIGOS_DO_PICUI: {
    id: 'RESTAURANTE_AMIGOS_DO_PICUI',
    title: '🥩 RESTAURANTE AMIGOS DO PICUÍ // MESTRE SEVERINO',
    getIntroText: (state) => `
      O aroma inconfundível de carne de sol grelhada na manteiga de garrafa e alho perfuma a varanda colonial.<br>
      Mesas de madeira maciça com toalhas xadrez acolhem famílias saboreando generosas travessas de barro fumegantes.<br>
      O chef Mestre Severino, de dólmã branco e lenço vermelho no pescoço, surge com uma chapa chiando alto:<br>
      <em>"— Ô de casa! Aqui é o verdadeiro sabor de Picuí na Paraíba! Carne curada no ponto, macaxeira na brasa e baião caprichado!"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'chapa_carne_sol',
        label: 'Pedir a Famosa Chapa de Carne de Sol do Picuí com baião de dois, macaxeira dourada, queijo coalho e paçoca',
        costLabel: 'R$ 38,00',
        costCentavos: 3800,
        disabled: !state.canAfford(3800),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -3800, fome: 70, sanidade: 45, perigo: -20 }, 'Banquete Carne de Sol do Picuí');
          return 'Um verdadeiro banquete dos deuses sertanejos! A carne desmancha na boca com o fio de manteiga dourada e o baião cremoso com nata. Você atinge o nirvana gastronômico (+70% Bucho, +45% Sanidade, -20% Perigo)!';
        }
      },
      {
        id: 'cachaca_torresmo',
        label: 'Tomar uma dose de cachaça artesanal de umburana com porçãozinha de torresmo crocante e limão cravo',
        costLabel: 'R$ 12,00',
        costCentavos: 1200,
        disabled: !state.canAfford(1200),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1200, sanidade: 26, ginga: 16, fome: 15 }, 'Cachaça de umburana e torresmo');
          return 'Cachaça aveludada e aromática aquecendo o peito, acompanhada de torresmo sequinho que estala nos dentes (+26% Sanidade, +16 Ginga, +15% Bucho).';
        }
      },
      {
        id: 'porcao_macaxeira',
        label: 'Pedir porção de macaxeira cozida e frita na manteiga de garrafa com queijo gratinado',
        costLabel: 'R$ 16,00',
        costCentavos: 1600,
        disabled: !state.canAfford(1600),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -1600, fome: 38, sanidade: 22 }, 'Macaxeira gratinada na manteiga');
          return 'Mandioca macia por dentro e crocante por fora coberta com queijo tostado. Conforto e sabor sem igual (+38% Bucho, +22% Sanidade).';
        }
      }
    ]
  },

  FARMACIA_PETRONIO: {
    id: 'FARMACIA_PETRONIO',
    title: '💊 DROGARIA & FARMÁCIA PETRÔNIO // DRA. CAMILA',
    getIntroText: (state) => `
      O ambiente impecável, refrigerado e iluminado traz alívio imediato contra o calor da avenida.<br>
      As prateleiras exibem medicamentos organizados, produtos de cuidados pessoais, vitaminas e fraldas.<br>
      A farmacêutica Dra. Camila, de jaleco branco engomado e crachá profissional, te atende gentilmente no balcão:<br>
      <em>"— Olá! Como posso te ajudar? Precisa de algum medicamento, primeiros socorros ou gostaria de aferir a pressão?"</em><br>
      <small style="color:#ffcc00">Seu Saldo: ${state.formattedGrana} | Bucho: ${state.fome}% | Sanidade: ${state.sanidade}%</small>
    `,
    getOptions: (state) => [
      {
        id: 'kit_antiacido_remedios',
        label: 'Comprar envelope de antiácido efervescente e cartela de analgésico para dor de cabeça',
        costLabel: 'R$ 9,00',
        costCentavos: 900,
        disabled: !state.canAfford(900),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -900, sanidade: 30, perigo: -10 }, 'Antiácido e analgésico na farmácia');
          return 'O efervescente borbulha no copinho d água e desce limpando a queimação do estômago. O analgésico alivia as têmporas e revigora seu foco (+30% Sanidade, -10% Perigo).';
        }
      },
      {
        id: 'aferir_pressao',
        label: 'Aferir a pressão arterial e batimentos cardíacos no consultório com a Dra. Camila',
        costLabel: 'R$ 3,00',
        costCentavos: 300,
        disabled: !state.canAfford(300),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -300, sanidade: 18, ginga: 4 }, 'Aferição de pressão arterial');
          return 'A braçadeira infla suavemente enquanto o manômetro mede seus batimentos: "— 12 por 8, coração de atleta!", sorri a farmacêutica. Alívio de saber que a saúde está em dia (+18% Sanidade, +4 Ginga).';
        }
      },
      {
        id: 'barra_cereal_isotonico',
        label: 'Comprar garrafa de isotônico gelado de frutas cítricas e barra de cereais com castanhas',
        costLabel: 'R$ 7,00',
        costCentavos: 700,
        disabled: !state.canAfford(700),
        execute: (state, sound) => {
          if (sound) { sound.playCoin(); sound.playBite(); }
          state.apply({ grana: -700, fome: 24, sanidade: 18 }, 'Isotônico e barra de cereal');
          return 'Hidratação rápida com eletrólitos e energia imediata das castanhas para seguir caminhando pelas ruas de São Paulo (+24% Bucho, +18% Sanidade).';
        }
      }
    ]
  }
};

