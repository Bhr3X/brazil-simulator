/**
 * Data-Driven World Zones Table
 * Provides authoritative spatial boundaries, display names, and operating hours.
 */

export const WORLD_ZONES = [
  {
    id: 'BAR_DO_TIAO',
    name: 'BAR DO TIÃO (SINUCA & BALCÃO)',
    min: { x: 6.0, y: 0.0, z: 37.5 },
    max: { x: 18.0, y: 6.0, z: 47.0 },
    openHour: 16.0,
    closeHour: 2.0, // overnight
    description: 'Botecão clássico. Mesa de sinuca no centro, salgados na estufa e cerveja trincando.'
  },
  {
    id: 'ADEGA_DO_ZE',
    name: 'ADEGA DO ZÉ (BEBIDAS & FREEZER)',
    min: { x: -19.5, y: 0.0, z: 37.5 },
    max: { x: -8.5, y: 6.0, z: 47.0 },
    openHour: 8.0,
    closeHour: 24.0,
    description: 'Venda de bebidas no atacado e varejo. Cerveja barata, fardos de refrigerante e recicláveis.'
  },
  {
    id: 'PADARIA_ESTRELA',
    name: 'PADARIA ESTRELA DE PIRITUBA',
    min: { x: 26.0, y: 0.0, z: 36.5 },
    max: { x: 38.0, y: 6.0, z: 47.0 },
    openHour: 5.0,
    closeHour: 20.0,
    description: 'Café pingado no copo americano, pão na chapa com crosta de manteiga e sonho de creme.'
  },
  {
    id: 'POSTO_PIRITUBA',
    name: 'POSTO PIRITUBA 24H (BR / PETROBRAS)',
    min: { x: -55.0, y: 0.0, z: 34.0 },
    max: { x: -35.0, y: 7.0, z: 48.0 },
    openHour: 0.0,
    closeHour: 24.0, // 24 hours
    description: 'Posto de combustíveis 24h. Bebedouro gratuito, calibrador de pneu e loja de conveniência.'
  },
  {
    id: 'PONTO_ONIBUS_SPTRANS',
    name: 'PONTO DE ÔNIBUS SPTRANS (NORTE)',
    min: { x: -27.0, y: 0.0, z: 4.5 },
    max: { x: -21.0, y: 4.0, z: 8.0 },
    openHour: 4.0,
    closeHour: 24.0,
    description: 'Parada da linha 8400-10 Term. Pirituba / Term. Lapa.'
  },
  {
    id: 'CRUZAMENTO_EDGAR_FACCO',
    name: 'CRUZAMENTO: AV. GEN. EDGAR FACÓ X R. PAULA FERREIRA',
    min: { x: -5.0, y: 0.0, z: 7.0 },
    max: { x: 7.0, y: 8.0, z: 33.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Interseção arterial movimentada com semáforo, faixas de pedestre e placas de esquina CET.'
  },
  {
    id: 'PORTICO_CET',
    name: 'PÓRTICO CET: MARGINAL TIETÊ / PIRITUBA',
    min: { x: 13.0, y: 0.0, z: 7.0 },
    max: { x: 19.0, y: 8.0, z: 33.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Pórtico rodoviário verde da CET cruzando a avenida.'
  },
  {
    id: 'RADAR_50KM',
    name: 'RADAR 50 KM/H (FISCALIZAÇÃO ELETRÔNICA)',
    min: { x: -19.0, y: 0.0, z: 6.0 },
    max: { x: -13.0, y: 7.0, z: 12.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Radar de velocidade operado pela CET com câmeras infravermelhas.'
  },
  {
    id: 'CRUZAMENTO_PETRONIO_PORTELA',
    name: 'CRUZAMENTO: EDGAR FACÓ X AV. MIN. PETRÔNIO PORTELA',
    min: { x: 125.0, y: 0.0, z: 6.0 },
    max: { x: 165.0, y: 8.0, z: 34.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Movimentada bifurcação arterial da Zona Noroeste, com tráfego intenso em direção à Ponte do Piqueri e Marginal Tietê.'
  },
  {
    id: 'BLOCO_EDGAR_FACCO',
    name: 'BLOCO DE CARNAVAL (AV. GEN. EDGAR FACÓ)',
    min: { x: 132.0, y: 0.0, z: 34.0 },
    max: { x: 160.0, y: 8.0, z: 52.0 },
    openHour: 10.0,
    closeHour: 16.0,
    description: 'Praça do trio elétrico estacionado no flanco sul da Edgar Facó, fora da via expressa.'
  },
  {
    id: 'CAMPINHO_CHURRASCO',
    name: 'CAMPINHO DO CHURRASCO (CREST DA FAVELA)',
    min: { x: -22.0, y: 8.5, z: -112.0 },
    max: { x: 22.0, y: 15.0, z: -86.0 },
    openHour: 11.0,
    closeHour: 20.0,
    description: 'Platô de terra e grama no alto da favela, com campo 28×14 e churrasqueira fixa.'
  },
  {
    id: 'CORREDOR_BUS',
    name: 'CORREDOR CENTRAL SPTRANS (FAIXA EXCLUSIVA)',
    min: { x: -60.0, y: 0.0, z: 17.8 },
    max: { x: 165.0, y: 4.0, z: 22.2 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Faixa exclusiva central de asfalto vermelho para ônibus municipais.'
  },
  {
    id: 'AV_EDGAR_FACCO',
    name: 'AVENIDA GENERAL EDGAR FACÓ',
    min: { x: -60.0, y: 0.0, z: 8.0 },
    max: { x: 165.0, y: 4.0, z: 32.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Principal via expressa ligando a Marginal Tietê a Pirituba.'
  },
  {
    id: 'LAJE_MIRANTE',
    name: 'LAJE DO MIRANTE (VISTA PICO DO JARAGUÁ)',
    min: { x: -15.0, y: 6.5, z: -78.0 },
    max: { x: 15.0, y: 18.0, z: -65.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Rooftop com vista panorâmica para a favela, caixas d água Fortlev e antenas do Jaraguá.'
  },
  {
    id: 'ESCADAO_CENTRAL',
    name: 'ESCADÃO CENTRAL DA PAZ',
    min: { x: -1.0, y: 0.0, z: -70.0 },
    max: { x: 5.0, y: 10.0, z: -25.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Escadaria de concreto com corrimão de ferro subindo o morro.'
  },
  {
    id: 'BECO_DO_SOSSEGO',
    name: 'BECO DO SOSSEGO (VIELA BAIXA)',
    min: { x: -40.0, y: 0.0, z: -55.0 },
    max: { x: -2.0, y: 8.0, z: -25.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Viela estreita entre as casas de alvenaria e muros com pixação.'
  },
  {
    id: 'BANCA_JORNAL',
    name: 'BANCA DE JORNAL DO SEU MÁRIO',
    min: { x: 5.0, y: 0.0, z: 33.5 },
    max: { x: 10.0, y: 5.0, z: 38.5 },
    openHour: 6.0,
    closeHour: 20.0,
    description: 'Banca clássica de esquina. Jornais pendurados, revistinhas da Mônica e raspadinha premiada.'
  },
  {
    id: 'BARRACA_PASTEL',
    name: 'BARRACA DE PASTEL DA DONA MARIA (FEIRA LIVRE)',
    min: { x: -6.0, y: 0.0, z: 33.5 },
    max: { x: -1.0, y: 5.0, z: 38.5 },
    openHour: 6.5,
    closeHour: 14.0, // Feira matutina
    description: 'Pastel frito na hora estalando, garapa gelada com limão e pote de vinagrete farto.'
  },
  {
    id: 'BAILE_LAJE',
    name: 'BAILE DA LAJE (ALTO DO ESCADÃO)',
    min: { x: -10.0, y: 6.0, z: -74.0 },
    max: { x: 10.0, y: 15.0, z: -60.0 },
    openHour: 1.5,
    closeHour: 5.5, // Madrugada quebrada
    description: 'Festa na laje da comunidade. Iluminação neon, som ecoando e ponto de encontro da madrugada.'
  },
  {
    id: 'SEMAFORO_BICO',
    name: 'SEMÁFORO DA EDGAR FACÓ (ESQUINA & FAIXA DE PEDESTRES)',
    min: { x: -2.0, y: 0.0, z: 6.0 },
    max: { x: 5.0, y: 4.0, z: 12.0 },
    openHour: 7.0,
    closeHour: 22.0,
    description: 'Esquina arterial no semáforo da Edgar Facó. Ponto de venda de paçoca e malabares no sinal fechado.'
  },
  {
    id: 'FLANELINHA_PAULA_FERREIRA',
    name: 'FLANELINHA (VAGAS DA RUA PAULA FERREIRA)',
    min: { x: 1.0, y: 0.0, z: 28.0 },
    max: { x: 8.0, y: 5.0, z: 36.0 },
    openHour: 7.0,
    closeHour: 21.0,
    description: 'Ponto de parada e vagas de estacionamento da Rua Paula Ferreira vigiadas pelo flanelinha.'
  },
  {
    id: 'BANCO_PIRITUBA',
    name: 'BANCO PIRITUBA (AGÊNCIA 0086 & CAIXA 24H)',
    min: { x: 42.0, y: 0.0, z: 36.0 },
    max: { x: 55.0, y: 7.0, z: 47.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Terminal de autoatendimento bancário 24h. Saque, cheque especial, extrato Serasa e quitação de dívidas.'
  },
  {
    id: 'RUA_BENTO_BICUDO',
    name: 'RUA CORONEL BENTO BICUDO (1ª PARALELA)',
    min: { x: -35.0, y: 0.0, z: -11.5 },
    max: { x: 55.0, y: 8.0, z: 3.5 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Rua residencial com sobrados paulistanos, oficinas mecânicas, lombadas e fiação elétrica densa.'
  },
  {
    id: 'RUA_EMILIO_LESSORE',
    name: 'RUA EMÍLIO LESSORE (2ª PARALELA - ALTO)',
    min: { x: -35.0, y: 0.0, z: -27.5 },
    max: { x: 55.0, y: 8.0, z: -12.5 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Rua elevada paralela no topo da encosta. Vielas estreitas, calçadas de mosaico e vista dos morros.'
  },
  {
    id: 'AUTO_MECANICA_BETO',
    name: 'AUTO MECÂNICA DO BETO (CORONEL BENTO BICUDO)',
    min: { x: 18.0, y: 0.0, z: -16.0 },
    max: { x: 32.0, y: 6.0, z: -8.0 },
    openHour: 7.5,
    closeHour: 19.5,
    description: 'Oficina mecânica tradicional de bairro. Peças usadas, troca de pneus, cheiro de graxa e rádio de pilha ligado.'
  },
  {
    id: 'CASA_CLASSE_C',
    name: 'CASA DO TIOZÃO CLT (RUA EMÍLIO LESSORE)',
    min: { x: -12.5, y: 0.0, z: -15.5 },
    max: { x: -3.5, y: 6.0, z: -8.5 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Sobrado aconchegante da classe trabalhadora. Sofá de curvim, TV com toalhinha de crochê e carnês na mesa.'
  },
  {
    id: 'EDIFICIO_PENTHOUSE',
    name: 'COBERTURA DO EDIFÍCIO (VISTA 180° JARAGUÁ)',
    min: { x: 27.5, y: 31.5, z: -1.5 },
    max: { x: 42.5, y: 40.0, z: 11.5 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Cobertura duplex de alto padrão no 12º andar. Janelas panorâmicas de vidro 180 graus com vista deslumbrante do Pico do Jaraguá.'
  },
  {
    id: 'EDIFICIO_PORTARIA',
    name: 'PORTARIA DO EDIFÍCIO JARAGUÁ TOWER',
    min: { x: 27.5, y: 0.0, z: -1.5 },
    max: { x: 42.5, y: 5.0, z: 11.5 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Saguão principal e portaria do edifício residencial de luxo com elevador de alta velocidade para a cobertura.'
  },
  {
    id: 'LARGO_DA_MATRIZ',
    name: 'LARGO DA MATRIZ DE NOSSA SENHORA DO Ó',
    min: { x: -35.0, y: 7.0, z: 155.0 },
    max: { x: 38.0, y: 16.0, z: 235.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Praça histórica fundada em 1580 no alto da colina da Freguesia do Ó. Calçadão de pedras portuguesas, coreto, casarões coloniais e botecos tradicionais.'
  },
  {
    id: 'BAR_FRANGO',
    name: 'O LENDÁRIO BAR FRANGÓ (DESDE 1987)',
    min: { x: 12.0, y: 8.0, z: 172.0 },
    max: { x: 32.0, y: 15.0, z: 198.0 },
    openHour: 11.0,
    closeHour: 24.0,
    description: 'Templo gastronômico da Zona Noroeste. Famoso pelas coxinhas crocantes de frango com catupiry, lousa de cervejas artesanais e mesas de madeira sob a varanda colonial.'
  },
  {
    id: 'IGREJA_MATRIZ_O',
    name: 'PARÓQUIA NOSSA SENHORA DO Ó (1580)',
    min: { x: -30.0, y: 8.0, z: 180.0 },
    max: { x: -6.0, y: 24.0, z: 220.0 },
    openHour: 6.0,
    closeHour: 20.0,
    description: 'Patrimônio histórico e colonial de São Paulo. Fachada amarela e branca, torre sineira com sino de bronze e santuário colonial acolhedor.'
  },
  {
    id: 'RUA_SETE_BARRAS',
    name: 'RUA SETE BARRAS (7 BARRAS)',
    min: { x: -45.0, y: 0.0, z: 46.0 },
    max: { x: 35.0, y: 6.0, z: 78.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Tradicional enclave de sobrados paulistanos, oficinas mecânicas, serralherias e comércio de bairro entre a Edgar Facó e a Freguesia.'
  },
  {
    id: 'BARBEARIA_ACLIVE',
    name: 'BARBEARIA DO SEU ANTÔNIO (NAVALHA & DEGRADÊ)',
    min: { x: -14.0, y: 0.0, z: 80.0 },
    max: { x: -5.0, y: 7.0, z: 94.0 },
    openHour: 8.0,
    closeHour: 20.0,
    description: 'Barbearia clássica de bairro na ladeira. Toalha quente, navalhete afiado, pós-barba mentolado e conversa fiada de futebol.'
  },
  {
    id: 'ACOUQUE_BOI_DE_OURO',
    name: 'AÇOUGUE BOI DE OURO (CORTE & PICANHA)',
    min: { x: -14.0, y: 1.0, z: 98.0 },
    max: { x: -5.0, y: 8.0, z: 112.0 },
    openHour: 7.0,
    closeHour: 19.0,
    description: 'Açougue tradicional de bairro. Ganchos de carne, balcão refrigerado inox, moedor barulhento e cortes frescos.'
  },
  {
    id: 'HORTIFRUTI_PAULA_FERREIRA',
    name: 'HORTIFRÚTI DA LADEIRA (FRUTAS & VERDURAS)',
    min: { x: 7.0, y: 0.0, z: 80.0 },
    max: { x: 16.0, y: 7.0, z: 94.0 },
    openHour: 7.0,
    closeHour: 19.5,
    description: 'Banca de legumes e hortaliças frescas. Caixotes de madeira inclinados na calçada com bananas, laranjas e cheiro de coentro fresco.'
  },
  {
    id: 'BOTECO_LADEIRA',
    name: 'BAR DA LADEIRA (SINUCA & DOMINÓ)',
    min: { x: 7.0, y: 3.0, z: 118.0 },
    max: { x: 16.0, y: 10.0, z: 132.0 },
    openHour: 10.0,
    closeHour: 23.5,
    description: 'Ponto de encontro dos aposentados na subida. Mesinhas de plástico na calçada com partidas acirradas de dominó e torresmo crocante.'
  },
  {
    id: 'CASA_DO_NORTE',
    name: 'CASA DO NORTE ASA BRANCA (QUEIJOS & FARINHA)',
    min: { x: -34.0, y: 0.0, z: 36.0 },
    max: { x: -20.0, y: 7.0, z: 47.0 },
    openHour: 9.0,
    closeHour: 22.0,
    description: 'Empório e restaurante nordestino tradicional na Edgar Facó. Queijo coalho assado, carne de sol, farinha de mandioca e cachaça da boa.'
  },
  {
    id: 'LOTERICA_PIRITUBA',
    name: 'LOTÉRICA PIRITUBA (CAIXA AQUI & MEGA-SENA)',
    min: { x: 57.0, y: 0.0, z: 36.0 },
    max: { x: 68.0, y: 7.0, z: 47.0 },
    openHour: 8.0,
    closeHour: 18.0,
    description: 'Agência lotérica oficial da Caixa. Fila organizada com fitas amarelas, volantes de apostas da Mega-Sena e pagamento de contas com boleto.'
  },
  {
    id: 'PASTELARIA_BETO',
    name: 'PASTELARIA DO BETO (PASTEL GIGANTE & CALDO DE CANA)',
    min: { x: 69.0, y: 0.0, z: 36.0 },
    max: { x: 80.0, y: 7.0, z: 47.0 },
    openHour: 6.0,
    closeHour: 22.0,
    description: 'Pastelaria tradicional com engenho elétrico de caldo de cana, pastéis dourados sequinhos de 30cm e potes de molho vinagrete e pimenta.'
  },
  {
    id: 'BAR_DO_PEIXE',
    name: 'BAR & PETISCARIA CANTINHO DO PEIXE',
    min: { x: 96.0, y: 0.0, z: -8.0 },
    max: { x: 112.0, y: 7.0, z: 2.0 },
    openHour: 11.0,
    closeHour: 23.5,
    description: 'Bar especializado em porções e petiscos na margem da Edgar Facó. Isca de peixe frita, lambari crocante, limão taiti e cerveja estupidamente gelada.'
  },
  {
    id: 'PAULA_FERREIRA_FREGUESIA',
    name: 'RUA PAULA FERREIRA (SUBIDA DA FREGUESIA)',
    min: { x: -8.0, y: 0.0, z: 32.0 },
    max: { x: 12.0, y: 12.0, z: 160.0 },
    openHour: 0.0,
    closeHour: 24.0,
    description: 'Subida íngreme e charmosa que atravessa a Edgar Facó e conecta Pirituba ao coração histórico da Freguesia do Ó.'
  },
  {
    id: 'ESCOLA_LOURENCO_FILHO',
    name: 'E.E. PROF. LOURENÇO FILHO (ESCOLA ESTADUAL)',
    min: { x: 105.0, y: 0.0, z: 64.0 },
    max: { x: 137.0, y: 8.0, z: 110.0 },
    openHour: 7.0,
    closeHour: 22.5,
    description: 'Escola Estadual clássica de Pirituba. Portão de ferro, catraca, sirene, quadra poliesportiva e merenda escolar.'
  },
  {
    id: 'PARQUE_PETRONIO',
    name: 'PRAÇA & PARQUE LINEAR PETRÔNIO PORTELA',
    min: { x: 153.0, y: 0.0, z: 64.0 },
    max: { x: 205.0, y: 8.0, z: 126.0 },
    openHour: 6.0,
    closeHour: 22.0,
    description: 'Área verde arborizada com Ipês floridos, pista de cooper, academia da terceira idade (ATI) e carrinho de pipoca do Seu Zico.'
  },
  {
    id: 'ESPETINHO_PETRONIO',
    name: 'BAR & ESPETINHO DA PETRÔNIO',
    min: { x: 114.0, y: 0.0, z: 116.0 },
    max: { x: 137.0, y: 6.0, z: 148.0 },
    openHour: 16.0,
    closeHour: 2.0,
    description: 'Boteco de esquina na Petrônio Portela com churrasqueira a carvão, espetinhos no capricho, farofa, vinagrete e chopp gelado.'
  },
  {
    id: 'PAPELARIA_BAZAR',
    name: 'PAPELARIA, BAZAR & AUTOESCOLA PETRÔNIO',
    min: { x: 153.0, y: 0.0, z: 132.0 },
    max: { x: 185.0, y: 8.0, z: 172.0 },
    openHour: 8.0,
    closeHour: 19.0,
    description: 'Centro comercial com Papelaria Pirituba (cópias, xerox, materiais) e Autoescola Petrônio (CFC A/B).'
  },
  {
    id: 'IGREJA_DO_MORRO',
    name: 'IGREJINHA DO MORRO & PRAÇA PANORÂMICA',
    min: { x: 153.0, y: 0.0, z: 182.0 },
    max: { x: 195.0, y: 15.0, z: 226.0 },
    openHour: 6.0,
    closeHour: 20.0,
    description: 'Capela histórica no alto do morro com vista panorâmica para Pirituba, escadaria de pedra e sino colonial.'
  },
  {
    id: 'COLEGIO_WELLINGTON',
    name: 'COLÉGIO WELLINGTON (PETRÔNIO PORTELA)',
    min: { x: 153.0, y: 0.0, z: 227.0 },
    max: { x: 195.0, y: 12.0, z: 265.0 },
    openHour: 7.0,
    closeHour: 19.0,
    description: 'Tradicional colégio da Av. Petrônio Portela com ensino fundamental, médio e quadra poliesportiva.'
  },
  {
    id: 'MERCADO_PYRITUBA',
    name: 'MERCADO MUNICIPAL DE PYRITUBA',
    min: { x: 153.0, y: 0.0, z: 266.0 },
    max: { x: 195.0, y: 10.0, z: 300.0 },
    openHour: 6.0,
    closeHour: 20.0,
    description: 'Mercado Municipal de Pyrituba com hortifrúti fresco, banca de queijos artesanais de Minas e barraca de pastel com caldo de cana.'
  },
  {
    id: 'RESTAURANTE_AMIGOS_DO_PICUI',
    name: 'RESTAURANTE AMIGOS DO PICUÍ (CARNE DE SOL)',
    min: { x: 153.0, y: 0.0, z: 301.0 },
    max: { x: 195.0, y: 10.0, z: 335.0 },
    openHour: 11.5,
    closeHour: 23.5,
    description: 'Famoso restaurante nordestino da região. Especialidade em carne de sol de Picuí na chapa com baião de dois, macaxeira e manteiga de garrafa.'
  },
  {
    id: 'FARMACIA_PETRONIO',
    name: 'DROGARIA & FARMÁCIA PETRÔNIO',
    min: { x: 110.0, y: 0.0, z: 205.0 },
    max: { x: 137.0, y: 8.0, z: 232.0 },
    openHour: 7.0,
    closeHour: 23.0,
    description: 'Drogaria completa na Petrônio Portela com remédios de referência e genéricos, perfumaria e aferição de pressão arterial.'
  }
];

export class ZoneManager {
  // Find which zone a 3D coordinate is in
  static getZoneAt(pos) {
    for (const zone of WORLD_ZONES) {
      if (
        pos.x >= zone.min.x && pos.x <= zone.max.x &&
        pos.y >= zone.min.y && pos.y <= zone.max.y &&
        pos.z >= zone.min.z && pos.z <= zone.max.z
      ) {
        return zone;
      }
    }
    return {
      id: 'RUA_PIRITUBA',
      name: 'RUA DE PIRITUBA (ZONA OESTE)',
      openHour: 0,
      closeHour: 24
    };
  }

  // Check if a zone is currently open given current in-game hour
  static isZoneOpen(zone, hour) {
    if (!zone || (zone.openHour === 0 && zone.closeHour === 24)) return true;
    if (zone.openHour < zone.closeHour) {
      return hour >= zone.openHour && hour < zone.closeHour;
    }
    // Crosses midnight (e.g. 16:00 to 02:00)
    return hour >= zone.openHour || hour < zone.closeHour;
  }
}
