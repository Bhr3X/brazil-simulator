/**
 * Internationalization (i18n) Engine for Brazil Simulator // Sobrevivência BR
 * Provides complete bilingual support: Portuguese (PT 🇧🇷) and English (EN 🇺🇸).
 * Governs UI, roulette, survival HUD, interactables, NPCs, encounters, and run summaries.
 */

import { EN_ENCOUNTER_TEXTS } from './EncounterTranslations.js';

export const I18N_STORAGE_KEY = 'pirituba_lang';

export const TRANSLATIONS = {
  pt: {
    lang_name: 'Português',
    lang_flag: '🇧🇷',
    lang_tag: 'PT',

    ui: {
      terminal_header: '[ PIRITUBA ENGINE // SP-011 ]',
      terminal_location: '📍 RUA PRINCIPAL (PIRITUBA Z/O)',
      btn_streetview: '<span>🌐 STREET VIEW</span><small style="opacity:0.7">[V]</small>',
      btn_mode: '<span>🖥️ MODO:</span> <strong id="hud-mode">RETRO 3D (TEXTURAS)</strong> <small style="opacity:0.7">[M]</small>',
      btn_visuals: '<span>🎨 VISUAL / ASCII</span><small style="opacity:0.7">[P]</small>',
      btn_camera: '<span id="hud-camera-label">👤 VISÃO: 1ª PESSOA</span><small style="opacity:0.7">[B]</small>',
      btn_camera_1p: '👤 VISÃO: 1ª PESSOA',
      btn_camera_3p: '👤 VISÃO: 3ª PESSOA',
      btn_tour: '<span>🎥 AUTO TOUR</span><small style="opacity:0.7">[U]</small>',
      btn_empty_on: '<span>🚗 TRÂNSITO ATIVO</span><small style="opacity:0.7">[X]</small>',
      btn_empty_off: '<span>🚫 CIDADE VAZIA</span><small style="opacity:0.7">[X]</small>',
      btn_audio_on: '<span>🔊 SOM: LIGADO</span><small style="opacity:0.7">[O]</small>',
      btn_audio_off: '<span>🔇 SOM: MUDO</span><small style="opacity:0.7">[O]</small>',
      btn_radio: '<span>📻 RÁDIO:</span> <strong id="hud-radio">AUTO (ZONAS)</strong> <small style="opacity:0.7">[N]</small>',
      btn_studio: '<span>👾 ESTÚDIO: game.md ↗</span>',
      btn_lang: '<span id="hud-lang-label">🌐 🇧🇷 PT</span><small style="opacity:0.7">[L]</small>',

      // Survival Bar
      stat_time: '⏱️ RUN 15 MIN',
      stat_money: '💵 GRANA',
      stat_fome: '🍗 BUCHO',
      stat_sanidade: '🧠 SANIDADE',
      stat_perigo: '🚨 B.O. / PERIGO',
      stat_debt_warning: '⚠️ DÉBITO BANCO: FALÊNCIA EM',
      stat_tab: 'Fiado:',
      objective_prefix: 'META DO DIA:',

      // Mobile
      orientation_banner: '📱 Gire o celular para o modo <strong>Paisagem (Horizontal)</strong> para melhor jogabilidade 🔄',
      touch_menu: '⚙️ MENU',
      touch_interact: 'INTERAGIR',
      touch_jump: 'PULAR',
      touch_crouch: 'AGACHA',
      touch_cam: '3ªP',
      drawer_title: '⚙️ MENU & AJUSTES',
      drawer_touch_toggle: '📱 Controles Touch:',
      drawer_lang_label: '🌐 Idioma: 🇧🇷 PT',
      drawer_streetview: '🌐 Street View [V]',
      drawer_mode: '🖥️ Modo Visual [M]',
      drawer_visuals: '🎨 Shaders & Cores [P]',
      drawer_camera: '👤 1ª / 3ª Pessoa [B]',
      drawer_radio: '📻 Rádio Pirituba [N]',
      drawer_audio: '🔊 Ligar/Desligar Som [O]',
      drawer_tour: '🎥 Auto Tour [U]',
      drawer_traffic: '🚗 Alternar Trânsito [X]',
      drawer_studio: '👾 Estúdio game.md ↗',
      drawer_on: 'LIGADO',
      drawer_off: 'DESLIGADO',

      // Dialog Modal
      dialog_title_default: 'ENCONTRO BRASILEIRO',
      dialog_close: '✕',
      dialog_close_title: 'Fechar [Q]',

      // Roulette Modal
      roulette_title: '🇧🇷 SOBREVIVÊNCIA BR // ROLETA SOCIAL DE NASCIMENTO',
      roulette_subtitle: 'Você tem exatamente 15 minutos reais (24h de um dia paulistano). Onde você nasceu?',
      roulette_spin_btn: '🎲 GIRAR ROLETA SOCIAL ALEATÓRIA',
      roulette_pill_de: '60% POPULAÇÃO',
      roulette_pill_c: '30% POPULAÇÃO',
      roulette_pill_ab: '10% POPULAÇÃO',
      roulette_select_de: 'ESCOLHER QUEBRADA',
      roulette_select_c: 'ESCOLHER SUBÚRBIO',
      roulette_select_ab: 'ESCOLHER FARIA LIMER',

      // End Screen
      end_title_win: '🏆 VOCÊ SOBREVIVEU A 24 HORAS NO BRASIL!',
      end_desc_win: 'Parabéns! Você completou os 15 minutos de run intacto(a) como <strong>{className}</strong>.<br>Sobreviveu ao trânsito da Edgar Facó, ao temporal de verão, aos boletos e à madrugada na quebrada!',
      end_restart_btn: '🔄 JOGAR NOVA RUN DE 15 MINUTOS',
      end_stat_class: 'Classe Social:',
      end_stat_objective: 'Meta do Dia:',
      end_stat_obj_success: '✅ CUMPRIDA COM SUCESSO!',
      end_stat_obj_fail: '❌ NÃO CONCLUÍDA',
      end_stat_grana: 'Saldo Final:',
      end_stat_debt: 'Dívida / Fiado Pendente:',
      end_stat_fome: 'Bucho / Fome Final:',
      end_stat_sanidade: 'Sanidade Mental:',
      end_stat_perigo: 'Nível de B.O. / Perigo:',
      end_stat_ginga: 'Ginga / Jeitinho Score:',
      end_moments_title: 'Momentos Marcantes do Dia:',
      end_moments_empty: 'Dia tranquilo em Pirituba sem grandes incidentes',

      // Click to Start Overlay
      start_title: 'PIRITUBA // FAVELA SUBURBS',
      start_subtitle: 'MOTOR DE 1ª & 3ª PESSOA EM ASCII & 3D',
      start_prompt: 'CLIQUE AQUI PARA ENTRAR // CLICK TO PLAY',
      start_hint_move: '⌨️ <strong>WASD / Setas</strong>: Mover',
      start_hint_look: '👁️ <strong>Mouse</strong>: Olhar',
      start_hint_cam: '👤 <strong>[B]</strong>: 1ª/3ª Pessoa',
      start_hint_vis: '🎨 <strong>[P]</strong>: Ajustes Visuais',
      start_hint_interact: '💬 <strong>[E]</strong>: Interagir',
      start_hint_modes: '🖥️ <strong>[M]</strong>: Modos ASCII',
      start_credits: 'Desenvolvido por <strong><a href="https://bhr3x.github.io/game.md/" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:none;">game.md</a></strong> • Inspirado no projeto viral <em>"A Walkable ASCII Cyberpunk City in One HTML File"</em>.<br>Explore os becos, o escadão, a laje com caixas d\'água Fortlev, o boteco e a vista para o Pico do Jaraguá.'
    },

    classes: {
      CLASSE_DE: {
        title: 'Muleque de Quebrada',
        badge: 'FAVELA / PERIFERIA',
        subtitle: 'Nascido no alto do morro em Pirituba. Ginga nas alturas, grana no limite.',
        desc: 'Nascido no alto do morro em Pirituba. Ginga no talo, chinelo com prego, celular com tela trincada e Bilhete Único no negativo.',
        meta: 'R$ 14,00 • Laje & Favela',
        dailyObjective: 'Ganhar pelo menos R$ 40 em bicos ou conseguir cesta básica sem B.O.',
        items: [
          { id: 'bu', name: 'Bilhete Único (Negativo)', desc: 'Saldo: -R$ 5,00. Precisa de recarga urgente.' },
          { id: 'chinelo', name: 'Havaianas com Prego', desc: 'Arrebentou a tira, mas foi consertada com arame.' },
          { id: 'celular_trincado', name: 'Motorola Tela Trincada', desc: 'Bateria em 12%. Dá pra mandar WhatsApp.' },
          { id: 'sacola_latinhas', name: 'Sacola com Latinhas de Alumínio', desc: 'Latinhas amassadas catadas na subida do morro. Dá pra vender na Adega do Zé.' }
        ]
      },
      CLASSE_C: {
        title: 'Tiozão CLT do Subúrbio',
        badge: 'CLASSE MÉDIA / TRABALHADOR',
        subtitle: 'Acorda às 05:30. Carnê das Casas Bahia na gaveta e boleto de luz vencendo.',
        desc: 'Acorda às 05:30. Celta 2004 na reserva, boleto de luz vencendo hoje e carnê das Casas Bahia na gaveta.',
        meta: 'R$ 180,00 • Subúrbio Raiz',
        dailyObjective: 'Pagar a conta de luz e voltar pra casa com pão na chapa sem ter o carro riscado.',
        items: [
          { id: 'chave_carro', name: 'Chave do Celta 2004', desc: 'Está estacionado perto do posto, 2 portas na reserva.' },
          { id: 'boleto_enel', name: 'Boleto Enel (Vence Hoje!)', desc: 'R$ 124,50. Se não pagar cortam a luz amanhã.' },
          { id: 'carne', name: 'Carnê Casas Bahia (18/24)', desc: 'Smart TV parcelada. Não atrase.' }
        ]
      },
      CLASSE_AB: {
        title: 'Herdeiro da Faria Lima',
        badge: 'ELITE / FARIA LIMER',
        subtitle: 'Desceu em Pirituba por engano no Waze. Paranoia a 200 km/h, carteira cheia.',
        desc: 'Desceu na Edgar Facó por engano no Waze. iPhone 16 Pro, copo Stanley, cartão black e pânico total de motoboy.',
        meta: 'R$ 3.800,00 • Perdido na Quebrada',
        dailyObjective: 'Sobreviver o dia na rua sem ter o celular levado e conseguir voltar pros Jardins são e salvo.',
        items: [
          { id: 'iphone', name: 'iPhone 16 Pro Max Titânio', desc: 'Cobiçado por 10 entre 10 motoboys.' },
          { id: 'stanley', name: 'Copo Stanley com Matchá', desc: 'Mantém gelado por 18 horas.' },
          { id: 'black_card', name: 'Cartão Black Sem Limite', desc: 'Inútil se o boteco só aceitar dinheiro ou Pix.' }
        ]
      }
    },

    interactables: {
      padaria: { name: 'PADARIA ESTRELA DE PIRITUBA', prompt: 'ENTRAR NA PADOCA E PEDIR PÃO NA CHAPA' },
      bar_sinuca: { name: 'BAR DO TIÃO (MESA DE SINUCA & BALCÃO)', prompt: 'PEDIR NO BALCÃO DO SEU TIÃO OU JOGAR SINUCA' },
      adega: { name: 'ADEGA DO ZÉ (BEBIDAS & LITRÃO)', prompt: 'COMPRAR LITRÃO OU VENDER LATINHAS' },
      flanelinha: { name: 'FLANELINHA NO CRUZAMENTO', prompt: 'CONVERSAR COM O FLANELINHA' },
      posto: { name: 'POSTO PIRITUBA 24H', prompt: 'ABASTECER OU TOMAR ÁGUA NO BEBEDOURO' },
      ponto_bus: { name: 'PONTO DE ÔNIBUS SPTRANS', prompt: 'EMBARCAR NA LINHA 8400-10 TERM. PIRITUBA' },
      banca_jornal: { name: 'BANCA DE JORNAL DO SEU MÁRIO', prompt: 'LER JORNAL OU COMPRAR RASPADINHA DA SORTE' },
      barraca_pastel: { name: 'BARRACA DE PASTEL DA DONA MARIA', prompt: 'PEDIR PASTEL DE FEIRA & CALDO DE CANA' },
      baile_laje: { name: 'BAILE DA LAJE NO ALTO DO ESCADÃO', prompt: 'CURTIR BAILE NA QUEBRADA OU TOMAR COROTE' },
      semaforo_bico: { name: 'SEMÁFORO DA EDGAR FACÓ', prompt: 'VENDER PAÇOCA OU LIMPAR PÁRA-BRISA NO SINAL' },
      banco: { name: 'BANCO PIRITUBA (AGÊNCIA 0086 & CAIXA 24H)', prompt: 'ACESSAR CAIXA ELETRÔNICO DO BANCO' },
      elevador_penthouse: { name: 'ELEVADOR DA COBERTURA (JARAGUÁ TOWER)', prompt: 'PEGAR ELEVADOR (DESCER PARA A PORTARIA / TÉRREO)' },
      elevador_terreo: { name: 'ELEVADOR DA PORTARIA (JARAGUÁ TOWER)', prompt: 'PEGAR ELEVADOR (SUBIR PARA A COBERTURA / PENTHOUSE)' },
      bar_frango: { name: 'O LENDÁRIO BAR FRANGÓ (DESDE 1987)', prompt: 'PEDIR FAMOSA COXINHA COM CATUPIRY & CHOPP ARTESANAL' },
      igreja_matriz: { name: 'PARÓQUIA NOSSA SENHORA DO Ó (1580)', prompt: 'ENTRAR NA IGREJA HISTÓRICA, REZAR OU ACENDER UMA VELA' },
      boteco_sete_barras: { name: 'BOTECO DAS 7 BARRAS (SINUCA & TUBAÍNA)', prompt: 'TOMAR UMA TUBAÍNA GELADA OU JOGAR UMA PARTIDA DE SINUCA' },
      barbearia_antonio: { name: 'BARBEARIA DO SEU ANTÔNIO (NAVALHA & DEGRADÊ)', prompt: 'CORTAR CABELO, FAZER BARBA OU PROSEAR' },
      acougue_boi_ouro: { name: 'AÇOUGUE BOI DE OURO (CORTE & PICANHA)', prompt: 'COMPRAR CARNES NOBRES OU LINGUIÇA CASEIRA' },
      hortifruti_ladeira: { name: 'HORTIFRÚTI DA LADEIRA (FRUTAS & LEGUMES)', prompt: 'COMPRAR FRUTAS FRESCAS OU ÁGUA DE COCO' },
      boteco_ladeira: { name: 'BAR DA LADEIRA (SINUCA & DOMINÓ)', prompt: 'JOGAR DOMINÓ OU PEDIR CERVEJA COM TORRESMO' },
      casa_do_norte: { name: 'CASA DO NORTE ASA BRANCA (QUEIJOS & FARINHA)', prompt: 'PEDIR BAIÃO DE DOIS OU COMPRAR QUEIJO COALHO' },
      loterica_pirituba: { name: 'LOTÉRICA PIRITUBA (CAIXA AQUI & MEGA-SENA)', prompt: 'APOSTAR NA MEGA-SENA OU PAGAR CONTAS' },
      pastelaria_beto: { name: 'PASTELARIA DO BETO (PASTEL GIGANTE & CALDO)', prompt: 'PEDIR PASTEL DE 30CM & CALDO DE CANA' },
      bar_peixe: { name: 'BAR & PETISCARIA CANTINHO DO PEIXE', prompt: 'PEDIR ISCA DE TILÁPIA & CERVEJA TRINCANDO' },
      escola_publica: { name: 'E.E. PROF. LOURENÇO FILHO (ESCOLA ESTADUAL)', prompt: 'FALAR COM A TIA CIDA NO PORTÃO DA ESCOLA' },
      parque_petronio: { name: 'PRAÇA & PARQUE LINEAR PETRÔNIO PORTELA', prompt: 'COMPRAR PIPOCA DO SEU ZICO OU USAR A PRAÇA' },
      espetinho_petronio: { name: 'BAR & ESPETINHO DA PETRÔNIO', prompt: 'PEDIR ESPETINHO COM SEU TONINHO NA BRASA' },
      papelaria_bazar: { name: 'PAPELARIA, BAZAR & AUTOESCOLA PETRÔNIO', prompt: 'RECARREGAR BILHETE ÚNICO OU COMPRAR MATERIAIS' },
      igreja_morro: { name: 'IGREJINHA DO MORRO (PADRE BENTO)', prompt: 'SUBIR A ESCADARIA DA IGREJINHA OU FALAR COM PADRE BENTO' },
      colegio_wellington: { name: 'COLÉGIO WELLINGTON (PROF. MAURÍCIO)', prompt: 'FALAR COM PROF. MAURÍCIO NO PORTÃO OU ENTRAR NA QUADRA' },
      mercado_pyrituba: { name: 'MERCADO MUNICIPAL DE PYRITUBA (SEU BETO)', prompt: 'COMPRAR PASTEL, CALDO DE CANA OU FRUTAS COM SEU BETO' },
      amigos_do_picui: { name: 'RESTAURANTE AMIGOS DO PICUÍ (MESTRE SEVERINO)', prompt: 'SABOREAR CARNE DE SOL & BAIÃO DE DOIS COM MESTRE SEVERINO' },
      farmacia_petronio: { name: 'DROGARIA & FARMÁCIA PETRÔNIO (DRA. CAMILA)', prompt: 'COMPRAR MEDICAMENTOS OU AFERIR PRESSÃO COM DRA. CAMILA' }
    },

    npcs: {
      clodoaldo: { name: 'CLODOALDO DAS BALAS', prompt: 'CONVERSAR COM CLODOALDO (AMBULANTE)' },
      caramelo: { name: 'CARAMELO (CÃO COMUNITÁRIO)', prompt: 'FAZER CARINHO NO CÃO CARAMELO' },
      juninho: { name: 'JUNINHO DA MONARK', prompt: 'FALAR COM JUNINHO DA BIKE' },
      dona_neide: { name: 'DONA NEIDE (TIA DA MARMITA)', prompt: 'FALAR COM DONA NEIDE DA FEIRA' },
      sargento_rocha: { name: 'SARGENTO ROCHA (PMESP)', prompt: 'FALAR COM O SARGENTO ROCHA (PM)' },
      menor_corre: { name: 'MENOR DO CORRE (QUEBRADA)', prompt: 'FALAR COM O MENOR DO CORRE' },
      mestre_bloco: {
        name: 'MESTRE DO BLOCO',
        prompt: 'FALAR COM O MESTRE DO BLOCO',
        closed: '[FECHADO] BLOCO FORA DE HORÁRIO',
        unavailable: 'O mestre já encerrou sua cota de dança neste run.'
      },
      churrasqueiro_campo: {
        name: 'CHURRASQUEIRO DO CAMPINHO',
        prompt: 'FALAR COM O CHURRASQUEIRO',
        closed: '[FECHADO] CAMPINHO FORA DE HORÁRIO',
        unavailable: 'O churrasqueiro já fechou sua vaga na pelada neste run.'
      }
    },

    defeat: {
      fome: {
        cause: 'DESMAIO DE FOME',
        desc: 'Sua fome zerou e você desmaiou de fraqueza no meio-fio. Uma viatura do SAMU te levou pro Hospital Geral de Vila Penteado.'
      },
      sanidade: {
        cause: 'BURNOUT / SURTO URBANO',
        desc: 'Sua sanidade zerou diante do caos de buzinas, boletos e calor. Você surtou, subiu no teto de um ônibus da SPTrans e foi contido.'
      },
      perigo: {
        cause: 'XILINDRÓ / COBRANÇA DO AGIOTA',
        desc: 'Seu medidor de B.O. chegou a 100%. A ROTA te levou detido pro 87º DP de Pirituba ou o agiota te pegou na esquina.'
      },
      falencia_limite: {
        cause: 'FALÊNCIA & EXECUÇÃO DO CPF',
        desc: 'Sua conta estourou o limite de cheque especial do Banco Pirituba (-R$ 150,00). O banco bloqueou seus bens e executou seu CPF no Serasa. Você faliu na quebrada!'
      },
      falencia_tempo: {
        cause: 'FALÊNCIA & PRAZO ESGOTADO',
        desc: 'Você passou mais de 90 segundos com a conta no vermelho sem quitar a dívida no Banco Pirituba. O oficial de justiça confiscou seus pertences!'
      }
    },

    toasts: {
      spawn_intro: '🌟 <strong>VOCÊ NASCEU COMO: {title}</strong><br>{subtitle}',
      storm_start: '⛈️ <strong>TEMPORAL DE VERÃO EM SÃO PAULO!</strong><br>Chuva torrencial e trânsito lento na Edgar Facó.',
      storm_end: '🌤️ <strong>A CHUVA PASSOU!</strong> O céu de São Paulo abriu novamente.',
      caramelo_bark: '🐕 <strong>CARAMELO LATIU!</strong> Cuidado com o carro em alta velocidade!',
      traffic_hit: '🚨 <strong>CUIDADO!</strong> Você quase foi atropelado na pista! Olhe para os dois lados! (-25% Sanidade, +20% Perigo)',
      head_bonk: '💥 <strong>POFT!</strong> Você deu com a cara no muro! A rua era só uma pintura na parede...<br><span style="font-size:11px;color:#fcd34d;">🚧 Desculpe pelo transtorno, estamos em obras!</span>'
    },

    news: {
      bloco_danca: 'Dançou no bloco da Edgar Facó',
      churrasco_prato: 'Comeu prato no churrasco do campinho',
      pelada_campo: 'Jogou pelada no campinho da favela',
      head_bonk: 'Bateu com a cara no muro pintado de obra achando que a rua continuava'
    }
  },

  en: {
    lang_name: 'English',
    lang_flag: '🇺🇸',
    lang_tag: 'EN',

    ui: {
      terminal_header: '[ PIRITUBA ENGINE // SP-011 ]',
      terminal_location: '📍 MAIN STREET (PIRITUBA WEST ZONE)',
      btn_streetview: '<span>🌐 STREET VIEW</span><small style="opacity:0.7">[V]</small>',
      btn_mode: '<span>🖥️ MODE:</span> <strong id="hud-mode">RETRO 3D (TEXTURES)</strong> <small style="opacity:0.7">[M]</small>',
      btn_visuals: '<span>🎨 VISUAL / ASCII</span><small style="opacity:0.7">[P]</small>',
      btn_camera: '<span id="hud-camera-label">👤 VIEW: 1ST PERSON</span><small style="opacity:0.7">[B]</small>',
      btn_camera_1p: '👤 VIEW: 1ST PERSON',
      btn_camera_3p: '👤 VIEW: 3RD PERSON',
      btn_tour: '<span>🎥 AUTO TOUR</span><small style="opacity:0.7">[U]</small>',
      btn_empty_on: '<span>🚗 TRAFFIC ACTIVE</span><small style="opacity:0.7">[X]</small>',
      btn_empty_off: '<span>🚫 EMPTY CITY</span><small style="opacity:0.7">[X]</small>',
      btn_audio_on: '<span>🔊 SOUND: ON</span><small style="opacity:0.7">[O]</small>',
      btn_audio_off: '<span>🔇 SOUND: MUTED</span><small style="opacity:0.7">[O]</small>',
      btn_radio: '<span>📻 RADIO:</span> <strong id="hud-radio">AUTO (ZONES)</strong> <small style="opacity:0.7">[N]</small>',
      btn_studio: '<span>👾 STUDIO: game.md ↗</span>',
      btn_lang: '<span id="hud-lang-label">🌐 🇺🇸 EN</span><small style="opacity:0.7">[L]</small>',

      // Survival Bar
      stat_time: '⏱️ 15 MIN RUN',
      stat_money: '💵 CASH',
      stat_fome: '🍗 HUNGER',
      stat_sanidade: '🧠 SANITY',
      stat_perigo: '🚨 HEAT / DANGER',
      stat_debt_warning: '⚠️ BANK OVERDRAFT: BANKRUPT IN',
      stat_tab: 'Tab:',
      objective_prefix: 'DAILY GOAL:',

      // Mobile
      orientation_banner: '📱 Rotate device to <strong>Landscape (Horizontal)</strong> mode for optimal gameplay 🔄',
      touch_menu: '⚙️ MENU',
      touch_interact: 'INTERACT',
      touch_jump: 'JUMP',
      touch_crouch: 'CROUCH',
      touch_cam: '3RDP',
      drawer_title: '⚙️ SETTINGS & MENU',
      drawer_touch_toggle: '📱 Touch Controls:',
      drawer_lang_label: '🌐 Language: 🇺🇸 EN',
      drawer_streetview: '🌐 Street View [V]',
      drawer_mode: '🖥️ Visual Mode [M]',
      drawer_visuals: '🎨 Shaders & Colors [P]',
      drawer_camera: '👤 1st / 3rd Person [B]',
      drawer_radio: '📻 Radio Pirituba [N]',
      drawer_audio: '🔊 Toggle Sound [O]',
      drawer_tour: '🎥 Auto Tour [U]',
      drawer_traffic: '🚗 Toggle Traffic [X]',
      drawer_studio: '👾 Studio game.md ↗',
      drawer_on: 'ON',
      drawer_off: 'OFF',

      // Dialog Modal
      dialog_title_default: 'BRAZILIAN ENCOUNTER',
      dialog_close: '✕',
      dialog_close_title: 'Close [Q]',

      // Roulette Modal
      roulette_title: '🇺🇸 BRAZIL SURVIVAL // SOCIAL SPAWN ROULETTE',
      roulette_subtitle: 'You have exactly 15 real-world minutes (24h in São Paulo). Where were you born?',
      roulette_spin_btn: '🎲 SPIN RANDOM SOCIAL ROULETTE',
      roulette_pill_de: '60% POPULATION',
      roulette_pill_c: '30% POPULATION',
      roulette_pill_ab: '10% POPULATION',
      roulette_select_de: 'CHOOSE FAVELA',
      roulette_select_c: 'CHOOSE SUBURB',
      roulette_select_ab: 'CHOOSE FARIA LIMER',

      // End Screen
      end_title_win: '🏆 YOU SURVIVED 24 HOURS IN BRAZIL!',
      end_desc_win: 'Congratulations! You completed the 15-minute run intact as <strong>{className}</strong>.<br>You survived Edgar Facó traffic, the summer deluge, overdue bills, and the late-night streets!',
      end_restart_btn: '🔄 PLAY NEW 15-MINUTE RUN',
      end_stat_class: 'Social Class:',
      end_stat_objective: 'Daily Goal:',
      end_stat_obj_success: '✅ COMPLETED WITH SUCCESS!',
      end_stat_obj_fail: '❌ NOT COMPLETED',
      end_stat_grana: 'Final Balance:',
      end_stat_debt: 'Pending Debt / Bar Tab:',
      end_stat_fome: 'Final Hunger / Stomach:',
      end_stat_sanidade: 'Mental Sanity:',
      end_stat_perigo: 'Danger / Heat Level:',
      end_stat_ginga: 'Street Savvy (Ginga) Score:',
      end_moments_title: 'Memorable Moments of the Day:',
      end_moments_empty: 'Quiet day in Pirituba without major incidents',

      // Click to Start Overlay
      start_title: 'PIRITUBA // FAVELA SUBURBS',
      start_subtitle: '1ST & 3RD PERSON 3D & ASCII ENGINE',
      start_prompt: 'CLICK HERE TO ENTER // PLAY',
      start_hint_move: '⌨️ <strong>WASD / Arrows</strong>: Move',
      start_hint_look: '👁️ <strong>Mouse</strong>: Look',
      start_hint_cam: '👤 <strong>[B]</strong>: 1st/3rd Person',
      start_hint_vis: '🎨 <strong>[P]</strong>: Visual Tuner',
      start_hint_interact: '💬 <strong>[E]</strong>: Interact',
      start_hint_modes: '🖥️ <strong>[M]</strong>: ASCII Modes',
      start_credits: 'Developed by <strong><a href="https://bhr3x.github.io/game.md/" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:none;">game.md</a></strong> • Inspired by viral project <em>"A Walkable ASCII Cyberpunk City in One HTML File"</em>.<br>Explore alleys, stairways, rooftop water tanks, corner bars, and the view of Jaraguá Peak.'
    },

    classes: {
      CLASSE_DE: {
        title: 'Favela Hustler',
        badge: 'FAVELA / OUTSKIRTS',
        subtitle: 'Born atop Pirituba\'s hillside. Maximum street savvy, money on the edge.',
        desc: 'Raised on the hilltops of Pirituba. Maxed-out swagger, nail-fixed flip-flops, cracked phone screen, and a negative bus card balance.',
        meta: 'R$ 14.00 • Rooftop & Slums',
        dailyObjective: 'Earn at least R$ 40 doing odd jobs or get a food basket without trouble.',
        items: [
          { id: 'bu', name: 'Bus Pass Card (Negative Balance)', desc: 'Balance: -R$ 5.00. Needs urgent recharge.' },
          { id: 'chinelo', name: 'Flip-Flops Fixed with a Nail', desc: 'Strap snapped, but patched up with wire.' },
          { id: 'celular_trincado', name: 'Cracked-Screen Phone', desc: 'Battery at 12%. Still sends WhatsApp messages.' },
          { id: 'sacola_latinhas', name: 'Bag of Crushed Aluminum Cans', desc: 'Scavenged on the way up the hill. Can be sold at Zé\'s Liquor Store.' }
        ]
      },
      CLASSE_C: {
        title: 'Working-Class Uncle',
        badge: 'MIDDLE CLASS / BLUE COLLAR',
        subtitle: 'Wakes at 05:30. Retail payment book in the drawer, power bill due today.',
        desc: 'Wakes at 5:30 AM. 2004 hatchback on fuel reserve, power bill due today, and endless appliance installments.',
        meta: 'R$ 180.00 • True Suburbs',
        dailyObjective: 'Pay the electric bill and get home with toasted French bread without your car getting scratched.',
        items: [
          { id: 'chave_carro', name: 'Keys to 2004 Hatchback', desc: 'Parked near the gas station, 2 doors, running on fuel fumes.' },
          { id: 'boleto_enel', name: 'Electric Bill (Due Today!)', desc: 'R$ 124.50. If unpaid, power cuts tomorrow.' },
          { id: 'carne', name: 'Department Store Installment Book (18/24)', desc: 'Smart TV on monthly plan. Don\'t fall behind.' }
        ]
      },
      CLASSE_AB: {
        title: 'Faria Lima Heir',
        badge: 'ELITE / FINANCIER',
        subtitle: 'Ended up in Pirituba by mistake on Waze. 200 km/h paranoia, loaded wallet.',
        desc: 'Took a wrong turn onto Edgar Facó via Waze. iPhone 16 Pro, Stanley tumbler, black credit card, and utter panic of motorcycle couriers.',
        meta: 'R$ 3,800.00 • Lost in the Slums',
        dailyObjective: 'Survive the day on the streets without having your phone snatched and make it safely back to the rich district.',
        items: [
          { id: 'iphone', name: 'iPhone 16 Pro Max Titanium', desc: 'Coveted by 10 out of 10 street hustlers.' },
          { id: 'stanley', name: 'Stanley Tumbler with Matcha', desc: 'Keeps drinks icy cold for 18 hours.' },
          { id: 'black_card', name: 'No-Limit Black Credit Card', desc: 'Useless if the corner bar only accepts cash or Pix.' }
        ]
      }
    },

    interactables: {
      padaria: { name: 'ESTRELA BAKERY OF PIRITUBA', prompt: 'ENTER BAKERY & ORDER TOASTED FRENCH BREAD' },
      bar_sinuca: { name: 'TIÃO\'S CORNER PUB (POOL TABLE & BAR)', prompt: 'ORDER AT SEU TIÃO\'S COUNTER OR PLAY POOL' },
      adega: { name: 'ZÉ\'S LIQUOR & BEVERAGE SHOP', prompt: 'BUY 1L BEER BOTTLE OR SELL CRUSHED CANS' },
      flanelinha: { name: 'UNOFFICIAL PARKING VALET', prompt: 'TALK TO THE PARKING HUSTLER' },
      posto: { name: 'PIRITUBA 24H GAS STATION', prompt: 'REFUEL OR DRINK FROM WATER FOUNTAIN' },
      ponto_bus: { name: 'SPTRANS BUS STOP', prompt: 'BOARD BUS ROUTE 8400-10 PIRITUBA TERMINAL' },
      banca_jornal: { name: 'MÁRIO\'S NEWSSTAND', prompt: 'READ NEWSPAPER OR BUY SCRATCH-OFF TICKET' },
      barraca_pastel: { name: 'DONA MARIA\'S STREET FOOD STALL', prompt: 'ORDER CRISPY PASTEL & SUGARCANE JUICE' },
      baile_laje: { name: 'ROOFTOP STREET PARTY ATOP STAIRWAY', prompt: 'ENJOY ROOFTOP PARTY OR SIP CHEAP COCKTAILS' },
      semaforo_bico: { name: 'EDGAR FACÓ TRAFFIC LIGHT', prompt: 'SELL PEANUT CANDY OR WIPE WINDSHIELDS' },
      banco: { name: 'BANCO PIRITUBA (BRANCH 0086 & 24H ATM)', prompt: 'ACCESS BANK 24H ATM TERMINAL' },
      elevador_penthouse: { name: 'PENTHOUSE ELEVATOR (JARAGUÁ TOWER)', prompt: 'TAKE ELEVATOR (GO DOWN TO GROUND FLOOR LOBBY)' },
      elevador_terreo: { name: 'LOBBY ELEVATOR (JARAGUÁ TOWER)', prompt: 'TAKE ELEVATOR (RIDE UP TO 12TH FLOOR PENTHOUSE)' },
      bar_frango: { name: 'THE LEGENDARY BAR FRANGÓ (SINCE 1987)', prompt: 'ORDER FAMOUS CHICKEN COXINHA & CRAFT BEER' },
      igreja_matriz: { name: 'OUR LADY OF Ó HISTORIC CHURCH (1580)', prompt: 'ENTER HISTORIC CHURCH, PRAY OR LIGHT A CANDLE' },
      boteco_sete_barras: { name: 'SETE BARRAS CORNER PUB (SNOOKER & SODA)', prompt: 'DRINK AN ICE-COLD TUBAÍNA OR PLAY SNOOKER' },
      barbearia_antonio: { name: 'SEU ANTÔNIO\'S BARBERSHOP (FADE & SHAVE)', prompt: 'GET A HAIRCUT, SHAVE, OR CHAT' },
      acougue_boi_ouro: { name: 'BOI DE OURO BUTCHER SHOP (PRIME CUTS)', prompt: 'BUY PRIME CUTS OR HANDMADE SAUSAGE' },
      hortifruti_ladeira: { name: 'HILLSIDE FRESH PRODUCE MARKET (FRUITS & GREENS)', prompt: 'BUY FRESH FRUIT OR COCONUT WATER' },
      boteco_ladeira: { name: 'HILLSIDE CORNER BAR (SNOOKER & DOMINOES)', prompt: 'PLAY DOMINOES OR ORDER BEER & TORRESMO' },
      casa_do_norte: { name: 'ASA BRANCA NORTHEASTERN EMPORIUM', prompt: 'ORDER BAIÃO DE DOIS OR BUY COALHO CHEESE' },
      loterica_pirituba: { name: 'PIRITUBA LOTTERY & BANK AGENCY (CAIXA AQUI)', prompt: 'PLAY MEGA-SENA JACKPOT OR PAY BILLS' },
      pastelaria_beto: { name: 'BETO\'S PASTELARIA (GIANT PASTEL & CANE JUICE)', prompt: 'ORDER 30CM PASTEL & SUGARCANE JUICE' },
      bar_peixe: { name: 'CANTINHO DO PEIXE SEAFOOD PUB', prompt: 'ORDER CRISPY TILAPIA TENDERS & COLD BEER' },
      escola_publica: { name: 'PROF. LOURENÇO FILHO PUBLIC SCHOOL', prompt: 'TALK TO TIA CIDA AT THE SCHOOL GATE' },
      parque_petronio: { name: 'PETRÔNIO PORTELA LINEAR PARK & SQUARE', prompt: 'BUY POPCORN FROM SEU ZICO OR WORK OUT IN THE PARK' },
      espetinho_petronio: { name: 'PETRÔNIO STREET BBQ & CORNER PUB', prompt: 'ORDER STREET SKEWERS FROM SEU TONINHO' },
      papelaria_bazar: { name: 'PETRÔNIO STATIONERY, BAZAAR & DRIVING SCHOOL', prompt: 'RECHARGE TRANSIT PASS OR BUY STATIONERY' },
      igreja_morro: { name: 'HILLSIDE CHAPEL (FATHER BENTO)', prompt: 'CLIMB CHAPEL STAIRS OR TALK TO FATHER BENTO' },
      colegio_wellington: { name: 'WELLINGTON COLLEGE (PROF. MAURÍCIO)', prompt: 'TALK TO PROF. MAURÍCIO AT THE GATE OR ENTER COURTS' },
      mercado_pyrituba: { name: 'PYRITUBA MUNICIPAL MARKET (SEU BETO)', prompt: 'BUY PASTEL, CANE JUICE OR FRESH FRUIT FROM SEU BETO' },
      amigos_do_picui: { name: 'AMIGOS DO PICUÍ RESTAURANT (CHEF SEVERINO)', prompt: 'ENJOY SUN-CURED BEEF & BAIÃO DE DOIS WITH CHEF SEVERINO' },
      farmacia_petronio: { name: 'PETRÔNIO PHARMACY & DRUGSTORE (DR. CAMILA)', prompt: 'BUY MEDICATIONS OR CHECK BLOOD PRESSURE WITH DR. CAMILA' }
    },

    npcs: {
      clodoaldo: { name: 'CLODOALDO THE CANDY VENDOR', prompt: 'TALK TO CLODOALDO (STREET VENDOR)' },
      caramelo: { name: 'CARAMELO (COMMUNITY STRAY DOG)', prompt: 'PET THE CARAMELO STRAY DOG' },
      juninho: { name: 'JUNINHO ON HIS BICYCLE', prompt: 'TALK TO JUNINHO (BIKE WHEELIE KID)' },
      dona_neide: { name: 'DONA NEIDE (MEAL BOX LADY)', prompt: 'TALK TO DONA NEIDE FROM THE MARKET' },
      sargento_rocha: { name: 'SERGEANT ROCHA (MILITARY POLICE)', prompt: 'TALK TO SERGEANT ROCHA (POLICE)' },
      menor_corre: { name: 'STREET RUNNER (LOCAL HUSTLER)', prompt: 'TALK TO THE STREET RUNNER' },
      mestre_bloco: {
        name: 'BLOCO MASTER',
        prompt: 'TALK TO THE BLOCO MASTER',
        closed: '[CLOSED] BLOCO OUTSIDE EVENT HOURS',
        unavailable: 'The bloco master already closed your dance slot for this run.'
      },
      churrasqueiro_campo: {
        name: 'CAMPINHO GRILL COOK',
        prompt: 'TALK TO THE GRILL COOK',
        closed: '[CLOSED] CAMPINHO OUTSIDE EVENT HOURS',
        unavailable: 'The grill cook already filled your pelada slot for this run.'
      }
    },

    defeat: {
      fome: {
        cause: 'STARVATION COLLAPSE',
        desc: 'Your hunger hit zero and you collapsed from exhaustion on the curb. An ambulance rushed you to Vila Penteado General Hospital.'
      },
      sanidade: {
        cause: 'BURNOUT / URBAN BREAKDOWN',
        desc: 'Your sanity broke under the chaos of honking horns, overdue bills, and stifling heat. You had a breakdown and climbed atop a public bus.'
      },
      perigo: {
        cause: 'ARREST / LOAN SHARK RETRIBUTION',
        desc: 'Your danger heat level hit 100%. Police tactical units detained you at the 87th Precinct, or local loan sharks caught you at the corner.'
      },
      falencia_limite: {
        cause: 'BANKRUPTCY & ASSET FORFEITURE',
        desc: 'Your bank overdraft exceeded the credit limit at Banco Pirituba (-R$ 150.00). The bank froze your assets and blacklisted your national ID!'
      },
      falencia_tempo: {
        cause: 'BANKRUPTCY & TIME EXPIRED',
        desc: 'You spent over 90 consecutive seconds in negative balance without settling your Banco Pirituba debt. Court bailiffs repossessed your belongings!'
      }
    },

    toasts: {
      spawn_intro: '🌟 <strong>YOU WERE BORN AS: {title}</strong><br>{subtitle}',
      storm_start: '⛈️ <strong>SÃO PAULO SUMMER DELUGE!</strong><br>Torrential rain and crawling traffic on Edgar Facó.',
      storm_end: '🌤️ <strong>THE STORM HAS PASSED!</strong> São Paulo\'s skies have cleared up once again.',
      caramelo_bark: '🐕 <strong>CARAMELO BARKED!</strong> Watch out for the speeding vehicle!',
      traffic_hit: '🚨 <strong>WATCH OUT!</strong> You were almost hit by oncoming traffic! Look both ways! (-25% Sanity, +20% Heat)',
      head_bonk: '💥 <strong>BONK!</strong> You slammed face-first into a solid wall! The road was just a painting...<br><span style="font-size:11px;color:#fcd34d;">🚧 Sorry for the inconvenience, under construction!</span>'
    },

    news: {
      bloco_danca: 'Danced with the carnival bloco on Edgar Facó',
      churrasco_prato: 'Ate a barbecue plate at the favela campinho',
      pelada_campo: 'Played a pickup match on the favela pitch',
      head_bonk: 'Slammed face-first into a painted illusion construction wall thinking the road continued'
    }
  }
};

TRANSLATIONS.en.encounters = typeof EN_ENCOUNTER_TEXTS !== 'undefined' ? EN_ENCOUNTER_TEXTS : {};

let currentLang = 'pt';
const listeners = [];

/**
 * Initialize language from localStorage or default to 'pt'
 */
export function initLanguage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(I18N_STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') {
        currentLang = saved;
      }
    } catch (e) {
      currentLang = 'pt';
    }
  }
  return currentLang;
}

/**
 * Get active language code ('pt' | 'en')
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Subscribe to language change events
 */
export function onLanguageChange(cb) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

/**
 * Set active language ('pt' or 'en') and trigger reactive DOM updates
 */
export function setLanguage(lang, app = null) {
  if (lang !== 'pt' && lang !== 'en') return;
  currentLang = lang;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(I18N_STORAGE_KEY, lang);
    } catch (e) {}
  }

  // Update DOM elements tagged with data-i18n
  updateDomTranslations();

  // Notify registered callbacks
  for (const cb of listeners) {
    try {
      cb(lang, app);
    } catch (e) {
      console.warn('[i18n] Listener error:', e);
    }
  }

  // Refresh HUD and GameState if active
  if (app && app.game && app.game.state) {
    const cls = getLocalizedClass(app.game.state.classId, lang);
    if (cls) {
      app.game.state.className = cls.title;
      app.game.state.badge = cls.badge;
      app.game.state.dailyObjective = cls.dailyObjective;
    }
    if (app.game.hud) {
      app.game.hud.update(app.game.clock, app.game.state);
    }
  }
}

/**
 * Toggle between 'pt' and 'en'
 */
export function toggleLanguage(app = null) {
  const next = currentLang === 'pt' ? 'en' : 'pt';
  setLanguage(next, app);
  return next;
}

/**
 * Get translation value with fallback
 */
export function t(path, fallback = '') {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;
  const parts = path.split('.');
  let curr = dict;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return fallback || path;
    }
  }
  return typeof curr === 'string' ? curr : fallback;
}

/**
 * Get localized class archetype
 */
export function getLocalizedClass(classId, lang = null) {
  const l = lang || currentLang;
  const dict = TRANSLATIONS[l] || TRANSLATIONS.pt;
  return dict.classes[classId] || TRANSLATIONS.pt.classes[classId] || null;
}

/**
 * Get localized interactable anchor info
 */
export function getLocalizedInteractable(anchorId, lang = null) {
  const l = lang || currentLang;
  const dict = TRANSLATIONS[l] || TRANSLATIONS.pt;
  return dict.interactables[anchorId] || TRANSLATIONS.pt.interactables[anchorId] || null;
}

/**
 * Get localized NPC prompt and name
 */
export function getLocalizedNpc(npcId, lang = null) {
  const l = lang || currentLang;
  const dict = TRANSLATIONS[l] || TRANSLATIONS.pt;
  return dict.npcs[npcId] || TRANSLATIONS.pt.npcs[npcId] || null;
}

/**
 * Get localized defeat cause & desc
 */
export function getLocalizedDefeat(defeatKey, lang = null) {
  const l = lang || currentLang;
  const dict = TRANSLATIONS[l] || TRANSLATIONS.pt;
  return dict.defeat[defeatKey] || TRANSLATIONS.pt.defeat[defeatKey] || null;
}

/**
 * Get localized encounter dialogue content
 */
export function getLocalizedEncounter(encounterId, lang = null) {
  const l = lang || currentLang;
  if (l === 'en' && typeof EN_ENCOUNTER_TEXTS !== 'undefined' && EN_ENCOUNTER_TEXTS[encounterId]) {
    return EN_ENCOUNTER_TEXTS[encounterId];
  }
  return null;
}

/**
 * Update all DOM elements bearing data-i18n attributes
 */
export function updateDomTranslations() {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const trans = t(key);
    if (trans) {
      el.innerHTML = trans;
    }
  });

  // Update language switcher indicators
  const hudLangLabel = document.getElementById('hud-lang-label');
  if (hudLangLabel) {
    hudLangLabel.textContent = currentLang === 'pt' ? '🌐 🇧🇷 PT' : '🌐 🇺🇸 EN';
  }

  const mobileBtnLang = document.getElementById('mobile-btn-lang');
  if (mobileBtnLang) {
    mobileBtnLang.textContent = currentLang === 'pt' ? '🌐 Idioma: 🇧🇷 PT' : '🌐 Language: 🇺🇸 EN';
  }

  // Update roulette segmented buttons active class
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    const bLang = btn.getAttribute('data-lang');
    if (bLang === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update html tag lang attribute
  if (document.documentElement) {
    document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en-US';
  }
}
