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
        label: 'Tentar pagar um cafezinho de R$ 3,00 com nota de R$ 100',
        costLabel: 'Teste de Ginga',
        execute: (state, sound) => {
          const success = state.rng.chance(state.ginga / 100);
          if (success) {
            if (sound) sound.playCoin();
            state.apply({ grana: -300, fome: 15, sanidade: 10, ginga: 5 }, 'Desenrolo na padaria com nota de cem');
            return 'O caixa deu aquela respirada funda, olhou feio, mas foi até o cofre e te deu R$ 97,00 em notas miúdas. Vitória do jeitinho (+5 Ginga)!';
          } else {
            state.apply({ sanidade: -12, ginga: -5 }, 'Bronca do balconista');
            return '"— Brincadeira né patrão? Seis e meia da manhã e você me vem com nota de cem?! Tem Pix não?!" Você saiu de mãos vazias e com a orelha quente (-12% sanidade).';
          }
        }
      },
      {
        id: 'agua_copo',
        label: 'Pedir um copo d água da torneira e olhar a vitrine',
        costLabel: 'Grátis',
        execute: (state) => {
          state.apply({ sanidade: 8 }, 'Copo d água no balcão');
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
        label: 'Desafiar o Seu Tião na Mesa de Sinuca valendo R$ 20,00',
        costLabel: 'Aposta: R$ 20,00',
        costCentavos: 2000,
        disabled: !state.canAfford(2000),
        execute: (state, sound) => {
          if (sound) sound.playSnookerHit();
          const winProb = (state.ginga * 0.6 + 20) / 100;
          const won = state.rng.chance(winProb);

          if (won) {
            if (sound) sound.playCoin();
            state.apply({ grana: 2000, sanidade: 40, ginga: 10 }, 'Vitória épica na sinuca');
            return 'Você encaçapou a bola 8 no canto oposto com efeito reverso! Os véios do bar aplaudiram e o Tião te pagou duas notas de dez contrariado (+R$ 20,00 e +40% Sanidade)!';
          } else {
            state.apply({ grana: -2000, sanidade: -15 }, 'Derrota na sinuca');
            return 'Seu Tião não deu chance: trancou a branca na tabela e limpou a mesa. Perdeu a aposta de R$ 20,00 (-15% sanidade).';
          }
        }
      },
      {
        id: 'caderninho_fiado',
        label: 'Pedir cerveja e pedir pra anotar no caderninho do fiado',
        costLabel: 'Teste de Confiança',
        execute: (state, sound) => {
          if (state.ginga >= 55) {
            if (sound) sound.playCanOpen();
            state.apply({ debt: 1200, sanidade: 25, flags: { temFiado: true } }, 'Anotado no caderninho');
            return 'Seu Tião te encarou por 3 segundos, pegou a caneta Bic azul e anotou R$ 12,00 na página do seu nome. Cerveja liberada na base da palavra (+25% sanidade, +R$ 12,00 em dívida)!';
          } else {
            state.apply({ sanidade: -20, perigo: 10 }, 'Fiado negado');
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
        label: 'Vender sacola de latinhas de alumínio amassadas',
        costLabel: '+R$ 18,00 a R$ 26,00',
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          const ganho = state.rng.int(1800, 2600);
          state.apply({ grana: ganho, sanidade: 15, perigo: -5 }, 'Venda de latinhas na adega');
          return `Zé jogou a sacola na balança mecânica, fez as contas de cabeça e te pagou ${GameState.formatBRL(ganho)} em notas limpas! Dinheiro rápido e honesto (+${GameState.formatBRL(ganho)}).`;
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
        label: 'Pagar R$ 5,00 e garantir a paz',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500),
        execute: (state, sound) => {
          if (sound) sound.playCoin();
          state.apply({ grana: -500, perigo: -15, sanidade: 10 }, 'Pagar flanelinha');
          return '"— Valeu meu patrão! Pode deixar que dessa vaga aqui nem mosquito chega perto!" Vaga protegida e sem dor de cabeça (-R$ 5,00, B.O. -15%).';
        }
      },
      {
        id: 'migue_cartao',
        label: 'O Migué Clássico: "Tô sem moeda, na volta eu te acerto!"',
        costLabel: 'Teste de Ginga (50%)',
        execute: (state) => {
          const colou = state.rng.chance(0.55);
          if (colou) {
            state.apply({ ginga: 10, sanidade: 15 }, 'Migué do flanelinha funcionou');
            return '"— Beleza chefe, confio na sua palavra hein! Vai com Deus!" Você economizou cinco conto na cara de pau (+10 Ginga)!';
          } else {
            state.apply({ perigo: 25, sanidade: -15, flags: { carroRiscado: true } }, 'Flanelinha desconfiado');
            return 'O flanelinha fechou a cara e deu duas batidinhas de chave na lataria: "— É patrão... tomara que nada aconteça com o retrovisor enquanto você tiver fora né..." Seu nível de tensão subiu (+25% Perigo).';
          }
        }
      },
      {
        id: 'peitar_rua',
        label: 'Peitar: "A rua é pública, não vou pagar nada!"',
        costLabel: 'B.O. Garantido',
        execute: (state, sound) => {
          if (sound) sound.playSiren();
          state.apply({ perigo: 35, sanidade: -25, ginga: -10 }, 'Bate-boca com flanelinha');
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
        label: 'Calibrar os 4 pneus (30 libras) e tomar água gelada no bebedouro',
        costLabel: 'Grátis',
        execute: (state) => {
          state.apply({ sanidade: 15 }, 'Calibrar pneus no posto');
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
        label: 'Embarcar passando a catraca com dignidade',
        costLabel: 'R$ 5,00',
        costCentavos: 500,
        disabled: !state.canAfford(500),
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
        label: 'Pular a catraca no vácuo do passageiro da frente',
        costLabel: 'Ginga ou B.O.',
        execute: (state, sound) => {
          const success = state.rng.chance(state.ginga / 100);
          if (success) {
            state.apply({ ginga: 15, sanidade: 15, flags: { pegouOnibus: true } }, 'Pulou a catraca');
            return 'Salto olímpico por cima da borboleta de aço sem encostar nem a havaiana! O cobrador fingiu que nem viu (+15 Ginga)!';
          } else {
            if (sound) sound.playSiren();
            state.apply({ perigo: 35, sanidade: -20 }, 'Pego na catraca');
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
  }
};
