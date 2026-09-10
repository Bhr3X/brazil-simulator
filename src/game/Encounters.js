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
  }
};
