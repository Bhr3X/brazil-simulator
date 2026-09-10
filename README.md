# Brazil Simulator // Sobrevivência BR (Pirituba, SP)

> **Um simulador de sobrevivência imersivo 3D / ASCII na quebrada paulistana.**  
> Ambientado no clássico cruzamento da **Avenida General Edgar Facó com a Rua Paula Ferreira** em Pirituba, São Paulo.

[![Play Online](https://img.shields.io/badge/🎮_JOGAR_ONLINE-GitHub_Pages-brightgreen?style=for-the-badge)](https://bhr3x.github.io/brazil-simulator/)
[![Standalone Bundle](https://img.shields.io/badge/📦_VERSÃO_STANDALONE-Single_File_HTML-blue?style=for-the-badge)](https://bhr3x.github.io/brazil-simulator/pirituba_standalone.html)

---

## 🎮 Como Jogar Diretamente no Navegador

* **Versão Principal (ESM)**: **[https://bhr3x.github.io/brazil-simulator/](https://bhr3x.github.io/brazil-simulator/)**
* **Versão Standalone (Arquivo Único)**: **[https://bhr3x.github.io/brazil-simulator/pirituba_standalone.html](https://bhr3x.github.io/brazil-simulator/pirituba_standalone.html)**

Compatível com desktop e navegadores modernos (Chrome, Firefox, Edge, Safari). Não requer instalação.

---

## 🌆 O Jogo

Você começa rodando a **Roleta Social**, nascendo aleatoriamente em uma das três realidades econômicas do Brasil:
1. **Classe D/E (Guerreiro da Quebrada)**: Começa com R$ 12,00 no bolso e o boleto da Enel de R$ 124,50 vencendo hoje. Precisa fazer bicos no semáforo, catar latinhas e desenrolar com ginga para não passar fome nem ser despejado.
2. **Classe C (Trabalhador CLT)**: Começa com R$ 180,00 e a meta de pagar o consórcio do Celta (R$ 250,00). Deve equilibrar café da manhã na padoca, almoço de pastel na feira e cerveja com sinuca no Tião sem perder a sanidade.
3. **Classe A/B (Faria Limer Perdido na Edgar Facó)**: Começa com R$ 4.500,00 na conta, mas 100% de Perigo inicial. Celular no bolso, medo constante de ser enquadrado, precisa sobreviver 24h na periferia e voltar ileso para o condomínio.

### ⏱️ O Ciclo de Sobrevivência de 15 Minutos (900 Segundos)
A simulação dura **15 minutos reais** (900 segundos), mapeados em **24 horas in-game** (das 06:00 da manhã às 06:00 do dia seguinte):
* **06:00 – 14:00 (Fase 1 - Manhã de Trampo & Feira Livre)**: Pingado e pão na chapa na Padaria Estrela, pastel de feira com caldo de cana, almanaque na banca do Seu Mário, bicos de paçoca no semáforo.
* **14:00 – 17:30 (Fase 2 - Tarde Quente & Temporal de Verão)**: Feira recolhe. Às 16:00 desaba a tradicional **chuva de verão de SP**, com trovões procedurais e asfalto molhado.
* **17:30 – 21:30 (Fase 3 - Rush Hour, Boteco & Dois Caras numa Moto)**: Cerveja trincando e sinuca no Bar do Tião. Entre 18:30 e 21:30, os temidos **Dois Caras numa Moto** interceptam você na calçada — você tem celular falso?
* **21:30 – 01:30 (Fase 4 - Noite Boêmia & Adega do Zé)**: Paradas diurnas fecham; o ponto migra para a Adega 24h e Posto Pirituba.
* **01:30 – 06:00 (Fase 5 - Madrugada na Quebrada, Baile da Laje & Blitz)**: Som pesado de funk mandelão no Mirante da Laje, enquadro da PM na Paula Ferreira, e a consagração com a **Primeira Fornada das 05h** da Padaria Estrela.

---

## 🎶 Trilha Sonora Procedural Brasileira (Web Audio 100%)
Zero arquivos de áudio externos. Síntese procedural em tempo real:
* **MPB / Bossa Nova (82 BPM)**: Violão de nylon sintetizado com batida de João Gilberto, baixo acústico e ganzá.
* **Pagode Raiz / Samba de Roda (102 BPM)**: Cavaquinho com palhetada sincopada, surdo de marcação duplo, pandeiro e tamborim.
* **Baile Funk Mandelão (130 BPM)**: Beat VoltMix 16-step, sub-bass 808 com pitch dive profundo e staccato synth.
* **Rádio Pirituba FM**: Troque de estação a qualquer momento com a tecla `[N]`.

---

## 🎨 Ajustes Visuais & Parâmetros em Tempo Real
Pressione `[P]` a qualquer momento para abrir o painel de nitidez:
* **Densidade de Caracteres (`[` / `]`)**: De retrô blocudo (0.6x) até micro-ASCII ultra nítido estilo pixel art (2.4x).
* **Brilho (`-` / `+`) & Contraste Dinâmico**: Curva S suave que preserva o piso de leitura noturna.
* **Clareamento de Sombras (Gamma)**: Enxergue becos escuros sem estourar as luzes.
* **Realce de Bordas (Edge Detection)**: Detecção de gradiente 2D destacando silhuetas de prédios, carros e postes.
* **Conjuntos de Caracteres**: Completo, Blocos 3D, Alto Contraste, Minimalista, Cyber Matrix, Linhas.
* **Modo 3D Real (`[M]`)**: Alterne instantaneamente entre ASCII e 3D texturizado retrô.

---

## ⌨️ Controles

| Tecla | Ação |
|---|---|
| `W`, `A`, `S`, `D` | Movimentação (Frente, Esquerda, Trás, Direita) |
| `Mouse` ou `Setas` | Rotação completa da câmera (Olhar para cima, baixo, girar) |
| `Shift` | Correr / Sprint |
| `Ctrl` ou `C` | Agachar (Crouch) |
| `Espaço` | Pular |
| `E` | Interagir com pessoas e pontos da quebrada |
| `B` ou `F5` | Alternar Visão: 1ª Pessoa / 3ª Pessoa (com avatar brasileiro animado) |
| `Scroll do Mouse` | Zoom suave de câmera (transição automática 1ª e 3ª Pessoa) |
| `P` | Abrir / Fechar Painel de Parâmetros Visuais & Nitidez |
| `[` / `]` | Diminuir / Aumentar Densidade de Caracteres no jogo |
| `-` / `+` (ou `=`) | Diminuir / Aumentar Brilho em tempo real |
| `M` | Alternar Modo Visual (ASCII Color, Matrix, Amber, Cyberpunk, 3D Real) |
| `N` | Sintonizar Rádio Pirituba FM (Auto, MPB, Pagode, Funk, Desligar) |
| `O` | Ligar / Desligar Som |
| `V` | Abrir / Fechar Google Street View real do cruzamento |
| `U` | Ativar / Desativar Câmera de Tour Automático |
| `X` | Alternar Trânsito da Cidade (Vazia / Ativa) |
| `ESC` | Fechar modais / Liberar mouse |

---

## 🛠️ Arquitetura & Governança de Código
* **Dual-Build Parity (I1)**: O projeto mantém estrita paridade entre o código modular (`index.html` + `src/`) e a distribuição empacotada em arquivo único (`pirituba_standalone.html`), gerada via `node build.js`.
* **Suíte de Testes Automatizada**: Executada via Headless Chrome CDP (`node tests/qa_cdp.mjs`), garantindo 0 erros de console e 100% de conformidade com todos os invariantes arquiteturais (I1 a I13).
