/**
 * NewsDesk.js
 * In-game dynamic satirical radio breaking news & interactive weather broadcast.
 *
 * Tracks player activity over the last 5 minutes and generates a live debate between
 * two deadpan Brazilian journalists:
 * - Cadu da Bancada (Serious sensationalist studio anchor in the style of Datena / Jornal da Band)
 * - Marcão da Madrugada (Investigative field reporter live on the streets of Pirituba)
 *
 * Concludes with a weather forecast announcement that directly triggers real-time
 * in-game weather transitions (Summer Storm, São Paulo Drizzle, or Scorching Heat).
 */

export class NewsDesk {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.events = [];
    this.maxEventAgeSeconds = 300; // Rolling 5-minute memory window
    this.isPlayingNews = false;
    this.newsTickerEl = null;
    this.weatherCallback = null;

    // Available PT-BR voices in browser
    this.ptVoices = [];
    this.initVoices();
    this.createHudNewsTicker();
  }

  initVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices() || [];
      this.ptVoices = allVoices.filter(v => v.lang.startsWith('pt') || v.lang.includes('BR'));
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  setWeatherCallback(cb) {
    this.weatherCallback = cb;
  }

  // Record an action into the rolling 5-minute history buffer
  recordAction(category, description, meta = {}) {
    const now = Date.now();
    this.events.push({
      time: now,
      category,
      desc: description,
      meta
    });
    // Prune events older than 5 minutes
    const cutoff = now - (this.maxEventAgeSeconds * 1000);
    this.events = this.events.filter(e => e.time >= cutoff);
  }

  createHudNewsTicker() {
    if (typeof document === 'undefined') return;
    let ticker = document.getElementById('radio-news-ticker');
    if (!ticker) {
      ticker = document.createElement('div');
      ticker.id = 'radio-news-ticker';
      ticker.style.cssText = `
        position: fixed;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: 88%;
        max-width: 860px;
        background: rgba(10, 14, 24, 0.94);
        border: 2px solid #ffcc00;
        border-radius: 6px;
        box-shadow: 0 0 16px rgba(255, 204, 0, 0.4);
        padding: 8px 16px;
        display: none;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        font-family: monospace;
        color: #ffffff;
        pointer-events: none;
        transition: opacity 0.3s ease;
      `;
      ticker.innerHTML = `
        <div style="background: #cc0000; color: #fff; font-weight: bold; font-size: 11px; padding: 3px 8px; border-radius: 3px; white-space: nowrap; letter-spacing: 1px; animation: pulse 1s infinite alternate;">
          🔴 PLANTÃO REDE SIMULAÇÃO
        </div>
        <div id="radio-news-speaker" style="color: #ffcc00; font-weight: bold; font-size: 12px; white-space: nowrap;">
          CADU (ESTÚDIO):
        </div>
        <div id="radio-news-text" style="font-size: 13px; color: #f0f0f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          Sintonizando notícias urgentes de Pirituba...
        </div>
      `;
      document.body.appendChild(ticker);
    }
    this.newsTickerEl = ticker;
  }

  showNewsTicker(speakerName, speechText) {
    if (!this.newsTickerEl) return;
    const speakerEl = document.getElementById('radio-news-speaker');
    const textEl = document.getElementById('radio-news-text');
    if (speakerEl) speakerEl.textContent = speakerName.toUpperCase() + ':';
    if (textEl) textEl.textContent = speechText;
    this.newsTickerEl.style.display = 'flex';
  }

  hideNewsTicker() {
    if (this.newsTickerEl) {
      this.newsTickerEl.style.display = 'none';
    }
  }

  // Analyze events from the last 5 minutes and craft a satirical script
  generateNewsScript(gameState) {
    const recent = this.events;
    const kicks = recent.filter(e => e.category === 'KICK');
    const food = recent.filter(e => e.category === 'FOOD');
    const debts = recent.filter(e => e.category === 'DEBT');
    const encounters = recent.filter(e => e.category === 'ENCOUNTER');
    const streetviews = recent.filter(e => e.category === 'STREETVIEW');

    let story = null;

    if (kicks.length >= 2) {
      story = {
        title: 'O Chutador Serial de Latinhas da Edgar Facó',
        cadu1: 'Atenção, ouvintes da Rede Simulação! Um flagrante de desordem pública na Edgar Facó está mobilizando a vizinhança. Marcão, você está ao vivo. O que está acontecendo?',
        marcao1: `Pois é, Cadu! A coisa tá feia! Um elemento descontrolado foi flagrado desferindo chutes violentos em ${kicks.length} objetos no asfalto, incluindo latinhas de cerveja e a bola da molecada!`,
        cadu2: 'É um absurdo, Marcão! A que ponto chegamos? A pessoa não tem um lote pra carpir e fica chutando lixo pela avenida! As autoridades já foram acionadas?',
        marcao2: 'O Seu Tião do bar já ameaçou pegar o cabo de vassoura, Cadu! A CET pede que os motoristas diminuam a velocidade para não atropelar a bola dente-de-leite!'
      };
    } else if (gameState && gameState.fome < 25) {
      story = {
        title: 'Calamidade Nutricional: Bucho Zerado em Pirituba',
        cadu1: 'Urgente! O departamento de saúde comunitária emite alerta de nível vermelho para a região da Paula Ferreira. Marcão, qual é a gravidade da situação?',
        marcao1: 'Gravíssima, Cadu! Um cidadão está perambulando pelo bairro com o bucho em estado de calamidade pública! O estômago do indivíduo está roncando mais alto que a moto dos Correios!',
        cadu2: 'Mas pelo amor de Deus, Marcão! A Padaria Estrela está aberta, tem coxinha na vitrine! Por que o cidadão se recusa a se alimentar?',
        marcao2: 'Fontes informam que ele tá guardando as moedas ou simplesmente esqueceu de mastigar, Cadu! Se não comer um pastel nos próximos minutos, vai desmaiar no meio-fio!'
      };
    } else if (gameState && gameState.debt > 0) {
      const debtReais = (gameState.debt / 100).toFixed(2).replace('.', ',');
      story = {
        title: 'Crise Financeira: Calote Histórico no Bar do Tião',
        cadu1: 'Economia em frangalhos em Pirituba! O rombo financeiro na praça já preocupa os comerciantes locais. Marcão, você tem os números?',
        marcao1: `Exatamente, Cadu! Foi detectada uma dívida colossal de R$ ${debtReais} pendurada na caderneta de fiado do Seu Tião! O caloteiro segue foragido pelas esquinas!`,
        cadu2: 'Inadmissível, Marcão! O Seu Tião trabalha de sol a sol, vendendo cerveja estalando de gelada, pro cidadão tomar fiado e sumir do mapa? Cadê a honra do trabalhador?',
        marcao2: 'O Tião já cortou o fiado de todo o bairro, Cadu! Quem for tomar uma gelada agora, só no dinheiro vivo ou no Pix!'
      };
    } else if (gameState && gameState.perigo >= 50) {
      story = {
        title: 'Operação Policial: Tensão nas Vielas da Zona Oeste',
        cadu1: 'Plantão policial! Viaturas da PM estão em patrulhamento ostensivo pelas artérias de Pirituba. Marcão, o cerco está se fechando?',
        marcao1: 'O clima é tenso, Cadu! A polícia identificou um indivíduo com índice de perigo nas alturas! O helicóptero Águia já sobrevoa a ponte da Paula Ferreira!',
        cadu2: 'A polícia de São Paulo não dorme em serviço, Marcão! Quem tiver com a ginga frouxa e documento vencido, melhor encostar na parede com a mão na cabeça!',
        marcao2: 'Exatamente, Cadu! O conselho aqui é manter a calma e não fazer movimentos bruscos na frente da barca!'
      };
    } else if (streetviews.length > 0) {
      story = {
        title: 'Fenômeno Paranormal: O Homem que Encarava o Satélite',
        cadu1: 'Mistério sem explicação em Pirituba! Moradores relatam um transe coletivo no cruzamento central. Marcão, você presenciou a cena?',
        marcao1: 'Presenciei, Cadu! Um cidadão simplesmente parou no meio da rua, congelou o corpo e começou a encarar o céu em 360 graus, como se estivesse dentro do Google Street View!',
        cadu2: 'Que loucura, Marcão! Será que o processador do cidadão travou na renderização dos prédios? É efeito do calor ou da cachaça?',
        marcao2: 'Dizem que ele estava procurando o carro do satélite na Paula Ferreira, Cadu! Uma cena surreal!'
      };
    } else {
      // General satirical filler news
      story = {
        title: 'Flagrante do Cotidiano: Rotina Agitada em Pirituba',
        cadu1: 'Voltamos com as notícias do trânsito e do cotidiano em Pirituba. Marcão, como está a movimentação das calçadas neste momento?',
        marcao1: 'Muita correria, Cadu! O pessoal descendo do trem da CPTM, a feira livre bombando e os cachorros vira-lata caramelo fazendo a ronda habitual na porta do açougue!',
        cadu2: 'Essa é a verdadeira São Paulo que trabalha e não para, Marcão! Vida que segue na selva de pedra!',
        marcao2: 'Com certeza, Cadu! O pastel tá saindo quentinho e a vida não para de rodar no servidor!'
      };
    }

    // Weather forecast options that will trigger real weather changes
    const weatherOptions = [
      {
        mode: 'STORM',
        text: 'Atenção motoristas na Marginal Tietê e na Paula Ferreira! O radar meteorológico detectou uma tempestade de verão violenta se aproximando! Vai desabar o céu com chuva torrencial e trovoadas nos próximos minutos!'
      },
      {
        mode: 'GAROA',
        text: 'A previsão para as próximas horas em São Paulo é daquela clássica garoa paulistana, névoa baixa e pista molhada na Edgar Facó. Peguem o guarda-chuva porque o clima vai fechar!'
      },
      {
        mode: 'CLEAR',
        text: 'O sol vai abrir com força em Pirituba! Sensação térmica de 36 graus no asfalto quente. O céu limpo promete uma tarde de boteco e cerveja gelada!'
      }
    ];

    // Pick weather
    const selectedWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

    return {
      story,
      weather: selectedWeather
    };
  }

  // Play dialogue sequentially using browser SpeechSynthesis with dual voices
  broadcastBreakingNews(gameState, onComplete) {
    if (this.isPlayingNews) return;
    this.isPlayingNews = true;

    const { story, weather } = this.generateNewsScript(gameState);

    // Dialogue sequence
    const lines = [
      { speaker: 'Cadu (Estúdio)', text: story.cadu1, pitch: 0.88, rate: 1.02 },
      { speaker: 'Marcão (Rua)', text: story.marcao1, pitch: 1.18, rate: 1.10 },
      { speaker: 'Cadu (Estúdio)', text: story.cadu2, pitch: 0.88, rate: 1.02 },
      { speaker: 'Marcão (Rua)', text: story.marcao2, pitch: 1.18, rate: 1.10 },
      { speaker: 'Cadu (Estúdio)', text: 'E agora, Marcão, como fica o tempo nas próximas horas?', pitch: 0.88, rate: 1.04 },
      { speaker: 'Marcão (Previsão)', text: weather.text, pitch: 1.15, rate: 1.08, isWeatherEnd: true }
    ];

    let currentIdx = 0;

    const playNextLine = () => {
      if (currentIdx >= lines.length) {
        this.hideNewsTicker();
        this.isPlayingNews = false;
        // Trigger weather shift in game engine
        if (this.weatherCallback) {
          this.weatherCallback(weather.mode);
        }
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      const item = lines[currentIdx++];
      this.showNewsTicker(item.speaker, item.text);

      // Play walkie-talkie / radio click sound effect via SoundEngine
      if (this.sound && this.sound.playRadioClick) {
        this.sound.playRadioClick();
      }

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Cancel any lingering speech
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = 'pt-BR';
        utterance.pitch = item.pitch;
        utterance.rate = item.rate;

        // Pick specific voice if available
        if (this.ptVoices.length > 0) {
          // If Cadu, pick first male/standard voice; if Marcão, pick second or alternate
          const voiceIdx = item.speaker.includes('Cadu') ? 0 : Math.min(1, this.ptVoices.length - 1);
          utterance.voice = this.ptVoices[voiceIdx];
        }

        utterance.onend = () => {
          setTimeout(playNextLine, 350);
        };

        utterance.onerror = () => {
          setTimeout(playNextLine, 350);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback for browsers without speech synthesis: show text on screen for 4s
        setTimeout(playNextLine, 4000);
      }
    };

    // Begin sequence
    playNextLine();
  }
}
