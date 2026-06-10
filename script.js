// ============================================================
//  AGRINHO 2026 — Agro forte, futuro sustentável
//  Subcategoria 3 — HTML, CSS e JavaScript
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");


// ── Detecção de dispositivo ───────────────────────────────
let isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

const W = 640;
const H = 480;




// ── Botões virtuais (mobile) ──────────────────────────────
const botoesVirtuais = {
  esquerda:  false,
  direita:   false,
  pular:     false,
  interagir: false,
   mentor:    false,  // 4 para interagir com o mentor na fase 1

};

// ── Estado global ──────────────────────────────────────────
let estado          = "MENU";
let opacidadeLogo   = 0;
let opacidadeTexto  = 0;
let frameCount      = 0;
let lastTime        = 0;

// ── Assets ────────────────────────────────────────────────
const imgs  = {};
const snds  = {};
let   video1 = null;
let   fonteCarregada = false;
// Flag para garantir que a fonte foi de fato renderizada pelo canvas
let   fonteNome = "serif";

// ── Pálpebras / transição ──────────────────────────────────
let aPalpebras  = 0;
let vPalpebras  = false;

// ── Fade genérico entre fases ─────────────────────────────
let transicaoAlfa    = 0;
let transicaoFase2   = false;
let transicaoFase2P2 = false;

// ── Fase 1 — blocos de solo ───────────────────────────────
const BLOCO_W = 64;
const BLOCO_H = 90;
const BLOCO_Y = 390;
const NUM_BLOCOS = 10;
const TEMPO_PALHADA_PARA_PLANTADO   = 600;
const TEMPO_PLANTADO_PARA_CRESCENDO = 900;
const TEMPO_CRESCENDO_PARA_PRONTO   = 400;

let blocos      = [];
let blocoSeeds  = [];
let blocoAtual  = null;
let contadorMilho = 0;
let particulas  = [];

// Caixa de dica
let caixaDicaAtiva  = false;
let caixaDicaFase   = 1;
let caixaDicaTimer  = 0;
let caixaDicaAlfaIn = 0;
const CAIXA_DICA_TROCA = 600;
const CAIXA_DICA_FIM   = 1200;
const TEXTO_DICA1 =
  "A palhada cobre e protege o solo,\nreduzindo a evaporação da água,\ncontrolando ervas daninhas e\nmantendo o solo fértil por mais tempo.";
const TEXTO_DICA2 =
  "Com palhada: solo úmido, vida\npreservada e menos insumos.\nSem ela: erosão, ressecamento\ne dependência de agrotóxicos.";

// ── Sun / Flash ────────────────────────────────────────────
let sunAtivo    = false;
let sunProgresso = 0;
let sunDuracao  = 60;
let sunEspera   = 30;
let sunFase     = "IDLE";
let flashAlfa   = 0;

// ── Kadu ──────────────────────────────────────────────────
const KADU_W   = 40;
const KADU_H   = 80;
const SOLO_Y_FASE2 = 450;
let kaduX      = 100;
let kaduY      = 310;
let soloY      = 390;
let kaduVel    = 4;
let kaduD      = "DIREITA";
let kaduF      = 0;
let kaduFPulo  = 0;
let kaduVelY   = 0;
let gravidade  = 0.6;
let noChao     = true;

// ── NPC Mentor ────────────────────────────────────────────
let npcX        = 450;
let npcY        = 260;
let conversando = false;
let perto       = false;
let npcF        = 0;
let npcOffsets  = [0, 0, 0, 0, 0];

// ── Cutscene de vídeo ─────────────────────────────────────
let corteFime       = 0;
let corteAlvo       = 90;
let estadoCutVideo  = "IDLE";
let esperandoTimer  = 0;
let zoomProgresso   = 0;
let zoomDuracao     = 180;
let textoVideoTimer = 0;

// ── Câmera ────────────────────────────────────────────────
let camX             = 0;
const MUNDO_W = NUM_BLOCOS * BLOCO_W;
const CAM_MARGEM_DIR = 400;
const CAM_MARGEM_ESQ = 200;

// ── Fase 2 — resíduos ─────────────────────────────────────
let residuos          = [];
let inventario        = [];
let poluicao          = 0;
let residuoSpawnTimer = 0;
let faseInicioF2      = 0;
const RESIDUO_SPAWN_INTERVALO = 180;
const RESIDUO_TEMPO_MAX       = 600;

const TIPOS_RESIDUO = [
  { nome: "Garrafa", cor: [100, 180, 255], corB: [50,  120, 220] },
  { nome: "Pilha",   cor: [255, 220, 50],  corB: [200, 160, 20 ] },
  { nome: "Lata",    cor: [200, 200, 200], corB: [140, 140, 140] },
  { nome: "Oleo",    cor: [180, 80,  180], corB: [120, 30,  120] },
];

const SPAWN_PONTOS = [
  { x: 60,  y: 115 }, { x: 60,  y: 281 }, { x: 200, y: 145 },
  { x: 320, y: 278 }, { x: 600, y: 277 }, { x: 800, y: 144 },
  { x: 430, y: 357 }, { x: 110, y: 346 },
];

// ── Fase 2 P2 — descarte ──────────────────────────────────
const LIXEIRAS = [
  { nome: "Garrafa", cor: [220, 50,  50 ], x: 345, y: 320, w: 50, h: 60 },
  { nome: "Lata",    cor: [255, 200, 0  ], x: 420, y: 320, w: 50, h: 60 },
  { nome: "Pilha",   cor: [100, 100, 200], x: 500, y: 320, w: 50, h: 60 },
  { nome: "Oleo",    cor: [180, 80,  180], x: 577, y: 320, w: 50, h: 60 },
];

let dialogoF2P2Timer     = 0;
let dialogoF2P2Alfa      = 0;
let dialogoF2P2Index     = 0;
let dialogoF2P2Encerrado = false;
let inventarioAberto     = false;
let itemArrastando       = null;
let arrastarX            = 0;
let arrastarY            = 0;
let imagemFundoAtual     = "inicial";
let imagemErroAtiva      = false;
let imagemErroTimer      = 0;
const IMAGEM_ERRO_DURACAO = 120;
let descartesCertos      = 0;
let dialogoErroAtivo     = false;
let dialogoErroAlfa      = 0;
let dialogoErroTexto     = "";

const DIALOGO_DELAY = 120;
const FALAS_F2P2 = [
  "Kadu, você coletou os resíduos!\nAgora é hora de descartá-los corretamente.",
  "Cada resíduo tem um destino certo:\nGarrafa → Lixeira Vermelha\nLata → Lixeira Amarela",
  "Pilha e Óleo precisam de atenção!\nNão vão na lixeira comum — use os\npostos de coleta especiais.",
  "Descartar errado polui o meio ambiente.\nFaça a escolha certa!"
];

// ── Final ──────────────────────────────────────────────────
let faseFinalAtiva      = false;
let faseFinalTextoAlfa  = 0;

// ── Plataformas Fase 2 ────────────────────────────────────
const plataformasF2 = [
  { x: 0,   y: 125, w: 150, h: 10 },
  { x: 0,   y: 291, w: 146, h: 10 },
  { x: 155, y: 155, w: 107, h: 10 },
  { x: 263, y: 288, w: 134, h: 10 },
  { x: 489, y: 287, w: 526, h: 10 },
  { x: 679, y: 154, w: 337, h: 10 },
  { x: 408, y: 367, w: 49,  h: 10 },
  { x: 85,  y: 356, w: 51,  h: 10 },
];

// ── Variáveis de tempo / fase 1 ───────────────────────────
let TI   = 0;
let tf1  = 100;
let ttf1 = 30;

// ── Teclas ────────────────────────────────────────────────
const keys = {};
document.addEventListener("keydown", e => {
  keys[e.key]     = true;
  keys[e.code]    = true;
  keys[e.keyCode] = true;
  handleKeyPressed(e);
});
document.addEventListener("keyup", e => {
  keys[e.key]     = false;
  keys[e.code]    = false;
  keys[e.keyCode] = false;
});
canvas.addEventListener("mousedown",  handleMousePressed);
canvas.addEventListener("mousemove",  handleMouseDragged);
canvas.addEventListener("mouseup",    handleMouseReleased);

// ── Helpers matemáticos ───────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function dist2(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }
function constrain(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function mapRange(v, in1, in2, out1, out2) { return out1 + (out2 - out1) * ((v - in1) / (in2 - in1)); }
function randSeed(seed) {
  let s = seed;
  return function () { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}


// ── helper: converte coordenada do cliente para coordenada do canvas ──
function clientParaCanvas(clientX, clientY) {
  const rect   = canvas.getBoundingClientRect();
  const escX   = W / rect.width;
  const escY   = H / rect.height;
  return {
    x: (clientX - rect.left) * escX,
    y: (clientY - rect.top)  * escY
  };
}

function handleTouchAtivado(e) {
  e.preventDefault();
  isTouchDevice = true;
  pegarToquesAtivos(e);

  if (e.type === "touchstart") {
    if (botoesVirtuais.mentor && estado === "FASE1" && perto) {
      estado = "CUTVIDEO"; estadoCutVideo = "FECHANDO"; corteFime = 0;
      return;
    }
    if (botoesVirtuais.interagir) {
      if (estado === "FASE1REAL") interagirBloco();
      if (estado === "FASE2") {
        for (const r of residuos) {
          if (r.coletado) continue;
          if (dist2(kaduX + 32, kaduY + 40, r.x, r.y) < 90) {
            r.coletado = true; inventario.push(r.tipo);
          }
        }
      }
      return;
    }

    // Toque vira clique — usa coordenada JÁ convertida para o canvas
    if (e.touches.length > 0) {
      const pos = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
      // handleMousePressed espera clientX/Y brutos e faz a conversão internamente,
      // então passamos os valores originais do toque
      handleMousePressed({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }

  if (e.type === "touchmove" && e.touches.length > 0) {
    // Arrasto de item na FASE2P2 — atualiza posição do item sendo arrastado
    if (estado === "FASE2P2" && itemArrastando) {
      const pos = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
      arrastarX = pos.x;
      arrastarY = pos.y;
      // não chama handleMouseDragged para evitar reconversão dupla
    }
  }
}

function handleTouchEncerrado(e) {
  e.preventDefault();

  // Solta o item — usa changedTouches (único dedo que levantou)
  if (estado === "FASE2P2" && itemArrastando && e.changedTouches.length > 0) {
    const pos = clientParaCanvas(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    // Injeta coordenadas já convertidas diretamente nas variáveis,
    // depois chama a lógica de soltar manualmente (evita reconversão)
    const mx = pos.x;
    const my = pos.y;
    const idx = inventario.findIndex(it => it.nome === itemArrastando.nome);

    for (const lx of LIXEIRAS) {
      if (dist2(mx, my, lx.x, lx.y) < 60) { // raio maior para facilitar no touch
        if (itemArrastando.nome === lx.nome) {
          if (idx !== -1) inventario.splice(idx, 1);
          poluicao = Math.max(0, poluicao - 5);
          descartesCertos++;
          const mapaImagem = { Garrafa: "garrafa", Lata: "lata", Pilha: "pilha", Oleo: "oleo" };
          imagemFundoAtual = mapaImagem[lx.nome] || "inicial";
        } else {
          poluicao = Math.min(100, poluicao + 10);
          imagemErroAtiva = true; imagemErroTimer = 0;
          dialogoErroAtivo = true; dialogoErroAlfa = 0;
          if (itemArrastando.nome === "Garrafa")
            dialogoErroTexto = "Cuidado! Garrafas são resíduos recicláveis.\nElas devem ir na lixeira VERMELHA,\nnão com outros materiais!";
          else if (itemArrastando.nome === "Pilha")
            dialogoErroTexto = "Atenção! Pilhas contêm metais pesados\nque contaminam o solo e a água.\nLeve-as a um posto de coleta especial!";
          else if (itemArrastando.nome === "Lata")
            dialogoErroTexto = "Ops! Latas são recicláveis e devem\nir na lixeira AMARELA.\nDescartar errado polui o meio ambiente!";
          else if (itemArrastando.nome === "Oleo")
            dialogoErroTexto = "Cuidado! O óleo usado não pode ir\nna lixeira comum — ele contamina\na água. Use o posto de coleta de óleo!";
        }
        break;
      }
    }
    itemArrastando = null; arrastarX = 0; arrastarY = 0;
    return; // não atualiza botões virtuais após soltar item
  }

  pegarToquesAtivos(e); // só atualiza botões se não estava arrastando
}


function desenharBotoesVirtuais() {
  if (!isTouchDevice) return;
  const estados = ["MENU", "JOGO", "CUTVIDEO", "FASE2P2"];
  const semBotoes = estados.includes(estado);

  function botao(x, y, label, ativo, corFundo, corBorda) {
    const r = 34;
    ctx.save();

    // Sombra simulada (círculo escuro levemente deslocado)
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x + 2, y + 3, r, 0, Math.PI * 2); ctx.fill();

    // Fundo do botão
    ctx.globalAlpha = ativo ? 1.0 : 0.78;
    ctx.fillStyle = ativo ? "#fff" : (corFundo || "rgba(20,20,20,0.82)");
    ctx.strokeStyle = ativo ? "#fff" : (corBorda || "rgba(255,255,255,0.55)");
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Texto / ícone
    ctx.globalAlpha = 1;
    ctx.fillStyle = ativo ? "#222" : "#fff";
    const fontSize = label.length === 1 ? 22 : label.length <= 2 ? 18 : 13;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 1);

    ctx.restore();
  }

  if (!semBotoes) {
    // Esquerda — azul
    botao(55, H - 70, "◀", botoesVirtuais.esquerda, "rgba(20,80,180,0.85)", "#5599ff");
    // Direita — azul
    botao(160, H - 70, "▶", botoesVirtuais.direita, "rgba(20,80,180,0.85)", "#5599ff");
    // Pular — verde
    botao(W - 65, H - 140, "▲", botoesVirtuais.pular, "rgba(20,140,60,0.85)", "#44dd88");
    // Ação — laranja
    botao(W - 65, H - 60, "E", botoesVirtuais.interagir, "rgba(180,90,10,0.88)", "#ffaa33");
  }

  // Falar — só na FASE1 perto do NPC — dourado
  if (perto && estado === "FASE1") {
    botao(W / 2, H - 70, "▲NPC", botoesVirtuais.mentor, "rgba(160,120,0,0.88)", "#ffdd22");
  }
}


// ── Touch — botões virtuais ───────────────────────────────
function pegarToquesAtivos(e) {
  const rect = canvas.getBoundingClientRect();
  const escalaX = W / rect.width;
  const escalaY = H / rect.height;

  botoesVirtuais.esquerda  = false;
  botoesVirtuais.direita   = false;
  botoesVirtuais.pular     = false;
  botoesVirtuais.interagir = false;
  botoesVirtuais.mentor    = false;

  for (const toque of e.touches) {
    const tx = (toque.clientX - rect.left) * escalaX;
    const ty = (toque.clientY - rect.top)  * escalaY;

    if (dist2(tx, ty, 55,    H - 70)  < 50) botoesVirtuais.esquerda  = true;
    if (dist2(tx, ty, 160,   H - 70)  < 50) botoesVirtuais.direita   = true;
    if (dist2(tx, ty, W - 65, H - 140) < 50) botoesVirtuais.pular    = true;
    if (dist2(tx, ty, W - 65, H - 60)  < 50) botoesVirtuais.interagir = true;
    if (dist2(tx, ty, W / 2,  H - 70)  < 50) botoesVirtuais.mentor   = true;
  }
}

if (isTouchDevice) {
  canvas.addEventListener("touchstart", handleTouchAtivado, { passive: false });
  canvas.addEventListener("touchmove", handleTouchAtivado, { passive: false });
  canvas.addEventListener("touchend", handleTouchEncerrado, { passive: false });
}



// ── Carregamento de assets ────────────────────────────────
function carregarImagem(chave, src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => { imgs[chave] = img; resolve(); };
    img.onerror = () => { console.warn("Imagem não encontrada:", src); imgs[chave] = null; resolve(); };
    img.src = src;
  });
}

function carregarSom(chave, src) {
  return new Promise(resolve => {
    const a = new Audio(src);
    snds[chave] = a;
    a.addEventListener("canplaythrough", () => resolve(), { once: true });
    a.onerror = () => { console.warn("Som não encontrado:", src); resolve(); };
    a.load();
    // Timeout para não travar se o navegador não disparar o evento
    setTimeout(resolve, 3000);
  });
}

function tocarSom(chave, loop) {
  if (!snds[chave]) return;
  try {
    snds[chave].currentTime = 0;
    snds[chave].loop = !!loop;
    snds[chave].play().catch(e => console.warn("Autoplay bloqueado:", e));
  } catch (e) {}
}

function pararSom(chave) {
  if (!snds[chave]) return;
  try { snds[chave].pause(); snds[chave].currentTime = 0; } catch (e) {}
}

// ── CORREÇÃO 1: Fonte — carrega via FontFace API e marca como pronta ──
async function carregarFonte() {
  // Injeta @font-face via <style> como fallback universal
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @font-face {
      font-family: 'Alkhemikal';
      src: url('imagens/videos/fonte/Alkhemikal.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
  document.head.appendChild(styleTag);

  // Tenta carregar via FontFace API (mais confiável para canvas)
  try {
    const ff = new FontFace("Alkhemikal", "url(imagens/videos/fonte/Alkhemikal.ttf)");
    const fontCarregada = await ff.load();
    document.fonts.add(fontCarregada);
    fonteNome = "Alkhemikal";
    fonteCarregada = true;
    console.log("Fonte Alkhemikal carregada com sucesso.");
  } catch (e) {
    console.warn("FontFace API falhou, usando fallback @font-face:", e);
    // Aguarda o @font-face injetado acima estar disponível
    try {
      await document.fonts.ready;
      // Verifica se a fonte foi registrada
      const ok = document.fonts.check("16px Alkhemikal");
      if (ok) {
        fonteNome = "Alkhemikal";
        fonteCarregada = true;
        console.log("Fonte carregada via @font-face.");
      } else {
        console.warn("Fonte não disponível, usando serif.");
        fonteNome = "serif";
        fonteCarregada = true;
      }
    } catch (e2) {
      fonteNome = "serif";
      fonteCarregada = true;
    }
  }
}

async function preload() {
  // Carrega fonte primeiro — essencial para o canvas
  await carregarFonte();

  // Imagens — fundo do menu agora é telainicial.jpeg
  await Promise.all([
    carregarImagem("logo",       "imagens/agrinho.logo.png"),
    carregarImagem("fundo",      "imagens/telainicial.jpeg"),
    carregarImagem("ff1",        "imagens/Palhada.image.png"),
    carregarImagem("kadu",       "imagens/walk3.png"),
    carregarImagem("jump",       "imagens/jump1.png"),
    carregarImagem("solo",       "imagens/solo11.png"),
    carregarImagem("mentor",     "imagens/campa (2).png"),
    carregarImagem("sun",        "imagens/sun.png"),
    carregarImagem("seta",       "imagens/seta.png"),
    carregarImagem("iconmentor", "imagens/iconmentor.png"),
    carregarImagem("ff2",        "imagens/fase2.jpeg"),
    carregarImagem("ff2p2",      "imagens/fase2Kadu4.jpg"),
    carregarImagem("fase2k1",    "imagens/fase2Kadu1.jpeg"),
    carregarImagem("descGarr",   "imagens/fase2Kadu5.png"),
    carregarImagem("descPilha",  "imagens/fase2Kadu3.jpeg"),
    carregarImagem("descLata",   "imagens/fase2Kadu6.png"),
    carregarImagem("descOleo",   "imagens/fase2Kadu2.jpeg"),
  ]);

  // Sons — inicio.mp3 toca no menu, ending.mp3 toca após o primeiro clique
  await Promise.all([
    carregarSom("musica", "audios/inicio.mp3"),
    carregarSom("stj",    "audios/ending.mp3"),
    carregarSom("f1M",    "audios/metroSound.mp3"),
  ]);

  // Vídeo
  video1 = document.createElement("video");
  video1.src     = "imagens/videos/VIDEO1.mp4";
  video1.volume  = 0;
  video1.preload = "auto";

  inicializarBlocos();

  // inicio.mp3 começa a tocar assim que a página carrega.
  // Navegadores modernos só permitem autoplay após interação do usuário,
  // então tentamos aqui e, se bloqueado, tocamos no primeiro clique.
  if (snds["musica"]) {
    snds["musica"].loop   = true;
    snds["musica"].volume = 1;
    snds["musica"].play().catch(() => {
      // Bloqueado pelo navegador — vai tocar no primeiro clique (handleMousePressed)
      console.info("Autoplay bloqueado. Música será iniciada no primeiro clique.");
    });
  }

  requestAnimationFrame(loop);
}

// ── Loop principal ────────────────────────────────────────
function loop(timestamp) {
  requestAnimationFrame(loop);
  lastTime = timestamp;
  frameCount++;
  ctx.clearRect(0, 0, W, H);
  draw();
}

// ── Fonte helper ──────────────────────────────────────────
function fonte(tamanho) {
  return `${Math.round(tamanho)}px ${fonteNome}`;
}

// ── Desenhar imagem com fallback ──────────────────────────
function drawImg(chave, x, y, w, h, sx, sy, sw, sh) {
  const img = imgs[chave];
  if (!img) return;
  try {
    if (sx !== undefined) ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    else if (w !== undefined) ctx.drawImage(img, x, y, w, h);
    else ctx.drawImage(img, x, y);
  } catch (e) {}
}

// ── Inicializar blocos ────────────────────────────────────
function inicializarBlocos() {
  blocos     = [];
  blocoSeeds = [];
  camX       = 0;
  for (let i = 0; i < NUM_BLOCOS; i++) {
    blocos.push({
      x: i * BLOCO_W, y: BLOCO_Y,
      w: BLOCO_W, h: BLOCO_H,
      estado: "normal", timer: 0, interagido: false
    });
    blocoSeeds.push(Math.floor(Math.random() * 10000));
  }
}

// ── Spawn resíduo ─────────────────────────────────────────
function spawnResiduo() {
  if (residuos.length >= 6) return;
  const ponto = SPAWN_PONTOS[Math.floor(Math.random() * SPAWN_PONTOS.length)];
  const tipo  = TIPOS_RESIDUO[Math.floor(Math.random() * TIPOS_RESIDUO.length)];
  residuos.push({ x: ponto.x, y: ponto.y, tipo, timer: 0, coletado: false });
}

// ═══════════════════════════════════════════════════════════
//  DRAW PRINCIPAL
// ═══════════════════════════════════════════════════════════

window.addEventListener('touchstart', () => { isTouchDevice = true; }, { once: true });

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  if      (estado === "MENU")      drawMenu();
  else if (estado === "JOGO")      drawJogo();
  else if (estado === "CUTSCENE")  drawCutscene();
  else if (estado === "FASE1")     drawFase1();
  else if (estado === "CUTVIDEO")  drawCutVideo();
  else if (estado === "FASE1REAL") drawFase1Real();
  else if (estado === "FASE2")     drawFase2();
  else if (estado === "FASE2P2")   drawFase2P2();
  desenharBotoesVirtuais();
}

// ── MENU ──────────────────────────────────────────────────
function drawMenu() {
  drawImg("fundo", 0, 0, W, H);

  if (opacidadeLogo  < 70)  opacidadeLogo  += 1;
  if (opacidadeTexto < 255) opacidadeTexto += 2;

  // Logo
  ctx.save();
  ctx.globalAlpha = opacidadeLogo / 255;
  drawImg("logo", 45, 350, 110, 100);
  ctx.restore();

  // Textos
  ctx.save();
  ctx.globalAlpha  = opacidadeTexto / 255;
  ctx.fillStyle    = "#fff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  ctx.font = fonte(70);
  ctx.fillText("Começar jogo", W / 2, H / 2 - 70);

  ctx.font = fonte(22);
  wrapText(ctx,
    "Agro forte, futuro sustentável: equilíbrio entre produção e meio ambiente.",
    W / 2, H / 2 - 170, 540, 28);
  ctx.restore();

  // Pálpebras
  if (vPalpebras) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, aPalpebras);
    ctx.fillRect(0, H - aPalpebras, W, aPalpebras);

    if (aPalpebras < H / 2) {
      aPalpebras += 10;
    } else {
      estado       = "JOGO";
      vPalpebras   = false;
      aPalpebras   = 0;
      // Para inicio.mp3 e começa ending.mp3 (tela de história/intro)
      pararSom("musica");
      tocarSom("stj", false);
      opacidadeTexto = 0;
    }
  }
}

// ── JOGO (tela de introdução) ─────────────────────────────
function drawJogo() {
  if (opacidadeTexto < 255) opacidadeTexto += 4;
  ctx.save();
  ctx.globalAlpha  = opacidadeTexto / 255;
  ctx.fillStyle    = "#fff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.font = fonte(20);
  wrapText(ctx,
    "Em 2026, sua missão como o jovem produtor Kadu é cultivar a safra do Milho para conquistar a Certificação Sustentável. Enfrente desafios reais do campo e proteja seus recursos naturais, provando que a agricultura sustentável é o único caminho para unir produtividade hoje e solo fértil amanhã. O equilíbrio do Vale Verde está em suas mãos!",
    W / 2, H / 2, 540, 28);
  ctx.restore();
}

// ── CUTSCENE (NPC + Kadu se encontram) ───────────────────
function drawCutscene() {
  drawImg("ff1",  0, 0, W, H);
  drawImg("solo", 0, 300, W, 180, 0, 0, 612, 340);
  drawNPC();
  movimentK();
  drawKadu();

  const distancia = dist2(kaduX + 32, kaduY + 40, npcX + 37, npcY + 90);
  if (distancia < 120) conversando = true;

  if (conversando) {
    kaduD = kaduX < npcX ? "DIREITA" : "ESQUERDA";
    ctx.fillStyle   = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth   = 2;
    roundRect(ctx, 100, 120, 440, 100, 10);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(npcX + 35, 220); ctx.lineTo(npcX + 45, 220); ctx.lineTo(npcX + 40, 235);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle    = "#000";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.font = fonte(18);
    wrapText(ctx,
      "Olá Kadu! Para proteger nossa plantação de milho,\nprecisamos cuidar do solo primeiro. Você está pronto?\n(Clique com o mouse para iniciar)",
      W / 2, 170, 420, 22);
  }
}

// ── FASE 1 (NPC + mapa, espera tecla 4) ──────────────────
function drawFase1() {
  drawImg("ff1",  0, 0, W, H);
  drawImg("solo", 0, 300, W, 180, 0, 0, 612, 340);
  drawNPC();

  const distancia = dist2(kaduX + 32, kaduY + 40, npcX + 37, npcY + 90);
  perto = distancia < 120;

  movimentK();
  drawKadu();

  if (perto) {
    ctx.fillStyle   = "#ffdc32";
    ctx.strokeStyle = "#000";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(npcX + 37, npcY - 30, 18, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle    = "#000";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.font = fonte(18);
    ctx.fillText("4", npcX + 37, npcY - 30);
    ctx.font = fonte(13);
    ctx.fillText("Pressione 4 para interagir", npcX + 37, npcY - 55);
  }
}

// ── CUTVIDEO ──────────────────────────────────────────────
function drawCutVideo() {
  if (["FECHANDO", "ESPERANDO", "ZOOM"].includes(estadoCutVideo)) {
    drawImg("ff1",  0, 0, W, H);
    drawImg("solo", 0, 300, W, 180, 0, 0, 612, 340);
    drawKadu();
    drawNPC();
  }

  if (estadoCutVideo === "ZOOM") {
    const t      = zoomProgresso / zoomDuracao;
    const ease   = 1 - Math.pow(1 - t, 3);
    const escala = 1 + ease * 3.5;

    // Lado esquerdo — Kadu
    ctx.save();
    ctx.beginPath(); ctx.rect(0, corteAlvo, W / 2, H - corteAlvo * 2); ctx.clip();
    const kCX = 430, kCY = 342;
    ctx.translate(kCX, kCY); ctx.scale(escala, escala); ctx.translate(-kCX, -kCY);
    drawImg("ff1", 0, 0, W, H);
    drawImg("solo", 0, 300, W, 180, 0, 0, 612, 340);
    drawKadu();
    ctx.restore();

    // Lado direito — NPC
    ctx.save();
    ctx.beginPath(); ctx.rect(W / 2, corteAlvo, W / 2, H - corteAlvo * 2); ctx.clip();
    const nCX = 482, nCY = 355;
    ctx.translate(nCX, nCY); ctx.scale(escala, escala); ctx.translate(-nCX, -nCY);
    drawImg("ff1", 0, 0, W, H);
    drawImg("solo", 0, 300, W, 180, 0, 0, 612, 340);
    drawNPC();
    ctx.restore();

    ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2, corteAlvo); ctx.lineTo(W / 2, H - corteAlvo);
    ctx.stroke();

    zoomProgresso++;
    if (zoomProgresso >= zoomDuracao) {
      estadoCutVideo      = "VIDEO";
      textoVideoTimer     = 0;
      video1.playbackRate = 0.6;
      video1.play();
      video1.onended = () => { estadoCutVideo = "ENCERRANDO"; };
    }
  }

  // Máquina de estados da cutscene
  if (estadoCutVideo === "FECHANDO") {
    if (corteFime < corteAlvo) { corteFime += 2; }
    else { corteFime = corteAlvo; estadoCutVideo = "ESPERANDO"; esperandoTimer = 0; }
  } else if (estadoCutVideo === "ESPERANDO") {
    esperandoTimer++;
    if (esperandoTimer > 20) { estadoCutVideo = "ZOOM"; zoomProgresso = 0; }
  } else if (estadoCutVideo === "ENCERRANDO") {
    if (corteFime < H / 2) {
      corteFime += 3;
    } else {
      estadoCutVideo = "IDLE"; corteFime = 0;
      estado   = "FASE1REAL";
      sunFase  = "ABRINDO"; sunProgresso = 0; sunAtivo = true; flashAlfa = 255;
      TI       = Date.now(); tf1 = 100; ttf1 = 30; opacidadeTexto = 0;
      inicializarBlocos();
    }
  }

  // Vídeo
  if (estadoCutVideo === "VIDEO" || estadoCutVideo === "ENCERRANDO") {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    const alturaUtil = H - corteFime * 2;
    if (alturaUtil > 0 && video1) ctx.drawImage(video1, 0, corteFime, W, alturaUtil);
  }

  // Barras cinematic — ANTES das legendas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, corteFime);
  ctx.fillRect(0, H - corteFime, W, corteFime);

  // Legendas — DEPOIS das barras, para ficarem por cima
  if (estadoCutVideo === "VIDEO") {
    textoVideoTimer++;

    // Legenda 1
    if (textoVideoTimer <= 240) {
      let alfa = 1;
      if (textoVideoTimer > 180) alfa = mapRange(textoVideoTimer, 180, 240, 1, 0);
      ctx.save();
      ctx.globalAlpha  = Math.max(0, alfa);
      ctx.fillStyle    = "#fff";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = fonte(24);
      ctx.shadowColor  = "rgba(0,0,0,0.9)";
      ctx.shadowBlur   = 6;
      wrapText(ctx,
        "Sua primeira missão é colocar palhada para proteger\no solo dos riscos de erosão e ressecamento!",
        W / 2, H - corteAlvo + 8, 580, 28);
      ctx.restore();
    }

    // Legenda 2
    if (textoVideoTimer > 480) {
      let alfa2 = textoVideoTimer < 510 ? mapRange(textoVideoTimer, 480, 510, 0, 1) : 1;
      ctx.save();
      ctx.globalAlpha  = alfa2;
      ctx.fillStyle    = "#fff";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = fonte(24);
      ctx.shadowColor  = "rgba(0,0,0,0.9)";
      ctx.shadowBlur   = 6;
      ctx.fillText("Então vamos lá!", W / 2, H - corteAlvo + 20);
      ctx.restore();
    }
  }
}
// ── FASE 1 REAL ───────────────────────────────────────────
function drawFase1Real() {
    const kaduTela = kaduX - camX;
  if (kaduTela > CAM_MARGEM_DIR) camX = kaduX - CAM_MARGEM_DIR;
  if (kaduTela < CAM_MARGEM_ESQ) camX = kaduX - CAM_MARGEM_ESQ;
  camX = constrain(camX, 0, MUNDO_W - W);
  drawImg("ff1", 0, 0, W, H);
  atualizarBlocos();
  desenharBlocos();

  const segundos = Math.floor((Date.now() - TI) / 1000);
  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(20);
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Tempo: " + segundos + "s", 20, 20);

  if (opacidadeTexto < 255) {
    opacidadeTexto += 5;
    if (tf1 > 30)  { tf1 -= 4; ttf1 -= 0.3; }
  }
  ctx.save();
  ctx.globalAlpha  = opacidadeTexto / 255;
  ctx.fillStyle    = "#fff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.font = fonte(Math.max(20, ttf1));
  ctx.fillText("Fase 01", 300, tf1);
  ctx.restore();

  movimentK();
  drawKadu();
  desenharHUDBlocos();
  atualizarParticulas();
  desenharSunEFlash();
  desenharContadorMilho();
  desenharCaixaDica();

  if (contadorMilho >= 15) {
    const oscilaX = Math.sin(frameCount * 0.12) * 5;
    ctx.save(); ctx.globalAlpha = 0.9;
    drawImg("seta", 550 + oscilaX - 32, 230 - 32, 64, 64);
    ctx.restore();
  }

  if (contadorMilho >= 15 && kaduX >= MUNDO_W - 100 && !transicaoFase2) {
    transicaoFase2 = true; transicaoAlfa = 0;
  }
  if (transicaoFase2) {
    transicaoAlfa += 5;
    ctx.fillStyle = `rgba(0,0,0,${transicaoAlfa / 255})`;
    ctx.fillRect(0, 0, W, H);
    if (transicaoAlfa >= 255) {
      estado         = "FASE2";
      faseInicioF2   = frameCount;
      transicaoFase2 = false;
      kaduX = 100; kaduY = SOLO_Y_FASE2 - KADU_H; kaduVelY = 0; noChao = true; camX = 0;
      opacidadeTexto = 0;
      residuos = []; inventario = []; poluicao = 0;
    }
  }
}

// ── FASE 2 ────────────────────────────────────────────────
function drawFase2() {
  if (!transicaoFase2P2 && transicaoAlfa > 0) transicaoAlfa -= 5;

  const imgFf2   = imgs["ff2"];
  const mundoF2W = imgFf2 ? imgFf2.width : 1024;

  const kaduTela = kaduX - camX;
  if (kaduTela > CAM_MARGEM_DIR) camX = kaduX - CAM_MARGEM_DIR;
  if (kaduTela < CAM_MARGEM_ESQ) camX = kaduX - CAM_MARGEM_ESQ;
  camX = constrain(camX, 0, mundoF2W - W);

  ctx.save();
  ctx.translate(-camX, 0);
  drawImg("ff2", 0, 0, mundoF2W, H);
  movimentK();
  drawKadu();
  desenharResiduos();
  ctx.restore();

  residuoSpawnTimer++;
  if (residuoSpawnTimer >= RESIDUO_SPAWN_INTERVALO && frameCount - faseInicioF2 < 3600) {
    residuoSpawnTimer = 0;
    spawnResiduo();
  }

  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(20);
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Fase 02 - Triagem de Resíduos", 20, 20);
  desenharHUDF2();
  desenharContadorMilho();

  if (frameCount - faseInicioF2 >= 2100 && poluicao < 100) {
    const oscilaX2 = Math.sin(frameCount * 0.12) * 5;
    ctx.save(); ctx.globalAlpha = 0.9;
    drawImg("seta", 550 + oscilaX2 - 32, 230 - 32, 64, 64);
    ctx.restore();

    if (kaduX >= mundoF2W - 65 && !transicaoFase2P2) {
      transicaoFase2P2 = true; transicaoAlfa = 0;
    }
  }

  if (transicaoFase2P2) {
    transicaoAlfa += 2;
    ctx.fillStyle = `rgba(0,0,0,${transicaoAlfa / 255})`;
    ctx.fillRect(0, 0, W, H);
    if (transicaoAlfa >= 255) {
      estado           = "FASE2P2";
      transicaoFase2P2 = false;
      kaduX = 100; kaduY = SOLO_Y_FASE2 - KADU_H; kaduVelY = 0; noChao = true; camX = 0;
      transicaoAlfa    = 0;
      dialogoF2P2Timer = 0; dialogoF2P2Alfa = 0;
      dialogoF2P2Index = 0; dialogoF2P2Encerrado = false;
      inventarioAberto = false;
    }
  }

  if (transicaoAlfa > 0) {
    ctx.fillStyle = `rgba(0,0,0,${transicaoAlfa / 255})`;
    ctx.fillRect(0, 0, W, H);
  }
}  


// ── FASE 2 P2 ─────────────────────────────────────────────
function drawFase2P2() {
  if (transicaoAlfa > 0) transicaoAlfa -= 5;

  if (imagemErroAtiva) {
    drawImg("fase2k1", 0, 0, W, H);
    imagemErroTimer++;
    if (imagemErroTimer >= IMAGEM_ERRO_DURACAO) { imagemErroAtiva = false; imagemErroTimer = 0; }
  } else if (imagemFundoAtual === "garrafa") { drawImg("descGarr",  0, 0, W, H); }
  else if   (imagemFundoAtual === "lata")    { drawImg("descLata",  0, 0, W, H); }
  else if   (imagemFundoAtual === "pilha")   { drawImg("descPilha", 0, 0, W, H); }
  else if   (imagemFundoAtual === "oleo")    { drawImg("descOleo",  0, 0, W, H); }
  else                                        { drawImg("ff2p2",    0, 0, W, H); }

  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(20);
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Fase 02 - Parte 2", 20, 20);

  desenharDialogoF2P2();
  desenharInventarioDescarte();
  // CORREÇÃO 5: desenharLixeiras() agora é chamada (estava definida mas nunca usada)
  desenharLixeiras();
  desenharDialogoErro();

  if (dialogoF2P2Encerrado && inventario.length === 0 && !faseFinalAtiva) {
    faseFinalAtiva     = true;
    aPalpebras         = 0;
    faseFinalTextoAlfa = 0;
  }

  if (faseFinalAtiva) {
    if (aPalpebras < H / 2) aPalpebras += 4;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, aPalpebras);
    ctx.fillRect(0, H - aPalpebras, W, aPalpebras);

    if (aPalpebras >= H / 2) {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      if (faseFinalTextoAlfa < 255) faseFinalTextoAlfa += 2;

      ctx.save();
      ctx.globalAlpha  = faseFinalTextoAlfa / 255;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#ffdc50"; ctx.font = fonte(36);
      ctx.fillText("Parabéns, Kadu!", W / 2, H / 2 - 80);

      ctx.fillStyle = "#fff"; ctx.font = fonte(17);
      wrapText(ctx,
        "Você descartou todos os resíduos corretamente\ne provou que a agricultura sustentável\ncomeça com pequenas escolhas conscientes.\n\nO Vale Verde agradece!",
        W / 2, H / 2 + 10, 560, 26);

      const pulso = Math.sin(frameCount * 0.05) * 0.3 + 0.7;
      ctx.globalAlpha  = (faseFinalTextoAlfa / 255) * pulso;
      ctx.fillStyle    = "#ffdc50";
      ctx.font         = fonte(14);
      ctx.fillText("Obrigado por jogar Agrinho!", W / 2, H / 2 + 180);
      ctx.restore();
    }
  }

  if (transicaoAlfa > 0) {
    ctx.fillStyle = `rgba(0,0,0,${transicaoAlfa / 255})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ═══════════════════════════════════════════════════════════
//  DESENHO DE PERSONAGENS
// ═══════════════════════════════════════════════════════════
function drawKadu() {
  const telaX = kaduX;
  if (noChao) {
    let xCorte;
    if (kaduD === "DIREITA") xCorte = kaduF * 126;
    else                     xCorte = (4 + kaduF) * 126;
   drawImg("kadu", telaX, kaduY, 65, 80, xCorte, 0, 126, 248);
  } else {
    const largFramePulo = 1007 / 8;
    let xCorte;
    if (kaduD === "ESQUERDA") xCorte = kaduFPulo * largFramePulo;
    else                      xCorte = (4 + kaduFPulo) * largFramePulo;
   drawImg("jump", telaX - 25, kaduY - 40, 130, 160, xCorte, 0, largFramePulo, 248);
  }
}

function drawNPC() {
  const img = imgs["mentor"];
  if (!img) return;
  const margemEsquerda = 24.8;
  const margemDireita  = 81.9;
  const larguraUtil    = img.width - margemEsquerda - margemDireita;
  const largFrame      = larguraUtil / 5;
  const npcCorteX      = margemEsquerda + npcOffsets[0];
  drawImg("mentor", npcX, npcY, 75, 180, npcCorteX, 0, largFrame, img.height);
  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(14);
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Mentor", npcX + 37, npcY - 10);
}

// ═══════════════════════════════════════════════════════════
//  BLOCOS DE SOLO
// ═══════════════════════════════════════════════════════════
function desenharBlocos() {
  for (let i = 0; i < blocos.length; i++) {
    const b   = blocos[i];
    const rng = randSeed(blocoSeeds[i]);
    const x   = b.x - camX;
    if (x + BLOCO_W < 0 || x > W) continue;
    if      (b.estado === "normal")    desenharBlocoNormal(ctx, b, x, rng);
    else if (b.estado === "palhada")   desenharBlocoPalhada(ctx, b, x, rng);
    else if (b.estado === "plantado")  desenharBlocoPlantado(ctx, b, x, rng);
    else if (b.estado === "crescendo") desenharBlocoCrescendo(ctx, b, x, rng);
    else if (b.estado === "pronto")    desenharBlocoPronto(ctx, b, x, rng);
  }
}

function desenharBlocoNormal(c, b, x, rng) {
  c.fillStyle = "#a0642d"; c.fillRect(x, b.y, b.w, 20);
  c.fillStyle = "#8b5223"; c.fillRect(x, b.y + 20, b.w, 40);
  c.fillStyle = "#643a16"; c.fillRect(x, b.y + 60, b.w, H - (b.y + 60));
  c.fillStyle = "#6e4421";
  for (let k = 0; k < 6; k++) {
    c.beginPath();
    c.ellipse(x + rng() * (b.w - 8) + 4, b.y + rng() * 47 + 8, rng() * 2.5 + 1.5, rng() * 1.5 + 1, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.strokeStyle = "rgba(88,50,15,0.8)"; c.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    const sx = x + rng() * (b.w - 10) + 5;
    const sy = b.y + rng() * 10 + 2;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + rng() * 14 - 7, sy + rng() * 9 + 5); c.stroke();
  }
  c.fillStyle = "#829b32"; c.fillRect(x, b.y - 4, b.w, 6);
  c.fillStyle = "#648223"; c.fillRect(x, b.y, b.w, 3);
  c.fillStyle = "rgba(80,45,12,0.6)"; c.fillRect(x + b.w - 2, b.y, 2, H - b.y);
}

function desenharBlocoPalhada(c, b, x, rng) {
  c.fillStyle = "#784b1c"; c.fillRect(x, b.y, b.w, 30);
  c.fillStyle = "#643a14"; c.fillRect(x, b.y + 30, b.w, H - (b.y + 30));
  c.fillStyle = "rgba(185,145,58,0.9)"; c.fillRect(x + 1, b.y - 2, b.w - 2, 20);
  c.strokeStyle = "#d2a848"; c.lineWidth = 1.5;
  for (let k = 0; k < 20; k++) {
    const px = x + rng() * (b.w - 4) + 2;
    const py = b.y + rng() * 16 - 2;
    const ang = rng() * 1.2 - 0.6;
    const len = rng() * 12 + 10;
    c.beginPath(); c.moveTo(px, py);
    c.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len * 0.3); c.stroke();
  }
  const prog = b.timer / TEMPO_PALHADA_PARA_PLANTADO;
  c.fillStyle = "rgba(80,170,60,0.55)";
  c.beginPath(); c.roundRect(x + 3, b.y + 18, (b.w - 6) * prog, 5, 2); c.fill();
  c.fillStyle = "#738e2a"; c.fillRect(x, b.y - 4, b.w, 4);
  c.fillStyle = "rgba(80,45,12,0.5)"; c.fillRect(x + b.w - 2, b.y, 2, H - b.y);
}

function desenharBlocoPlantado(c, b, x, rng) {
  c.fillStyle = "#694116"; c.fillRect(x, b.y, b.w, 35);
  c.fillStyle = "#4e2e0e"; c.fillRect(x, b.y + 35, b.w, H - (b.y + 35));
  const cx2 = x + b.w / 2;
  const top = b.y - 26;
  c.strokeStyle = "#378226"; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(cx2, b.y); c.lineTo(cx2, top); c.stroke();
  c.fillStyle = "#4ba530";
  c.beginPath(); c.moveTo(cx2, top + 4);
  c.bezierCurveTo(cx2 - 12, top - 4, cx2 - 16, top + 8, cx2, top + 10); c.fill();
  c.beginPath(); c.moveTo(cx2, top + 4);
  c.bezierCurveTo(cx2 + 12, top - 4, cx2 + 16, top + 8, cx2, top + 10); c.fill();
  c.fillStyle = "#5f821f"; c.fillRect(x, b.y - 4, b.w, 4);
}

function desenharBlocoCrescendo(c, b, x, rng) {
  c.fillStyle = "#5c3912"; c.fillRect(x, b.y, b.w, 40);
  c.fillStyle = "#41260a"; c.fillRect(x, b.y + 40, b.w, H - (b.y + 40));
  const cx2 = x + b.w / 2;
  const top = b.y - 58;
  c.strokeStyle = "#307620"; c.lineWidth = 3.5;
  c.beginPath(); c.moveTo(cx2, b.y);
  c.bezierCurveTo(cx2 + 5, b.y - 17, cx2 - 5, b.y - 40, cx2, top); c.stroke();
  const fds = [{ dy: -16, l: -1, a: -0.45 }, { dy: -32, l: 1, a: 0.38 }, { dy: -48, l: -1, a: -0.30 }];
  for (const f of fds) {
    c.save();
    c.translate(cx2 + f.l * 3, b.y + f.dy); c.rotate(f.a * f.l);
    c.fillStyle = "#419b26";
    c.beginPath(); c.ellipse(f.l * 14, -5, 14, 5, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  c.fillStyle = "#b99830"; c.beginPath(); c.roundRect(cx2 - 5, top - 16, 10, 18, 4); c.fill();
}

function desenharBlocoPronto(c, b, x, rng) {
  c.fillStyle = "#503210"; c.fillRect(x, b.y, b.w, 45);
  c.fillStyle = "#372008"; c.fillRect(x, b.y + 45, b.w, H - (b.y + 45));
  const cx2 = x + b.w / 2;
  const top = b.y - 75;
  c.strokeStyle = "#2a6c19"; c.lineWidth = 4.5;
  c.beginPath(); c.moveTo(cx2, b.y);
  c.bezierCurveTo(cx2 + 6, b.y - 22, cx2 - 6, b.y - 49, cx2, top); c.stroke();
  const fds2 = [{ dy: -18, l: -1, a: -0.52 }, { dy: -36, l: 1, a: 0.45 }, { dy: -54, l: -1, a: -0.38 }, { dy: -68, l: 1, a: 0.28 }];
  for (const f of fds2) {
    c.save();
    c.translate(cx2 + f.l * 4, b.y + f.dy); c.rotate(f.a * f.l);
    c.fillStyle = "#348e1e";
    c.beginPath(); c.ellipse(f.l * 18, -7, 18, 6.5, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  c.fillStyle = "rgba(95,138,48,0.78)";
  c.beginPath(); c.ellipse(cx2, top + 14, 10, 17, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#d7aa26"; c.beginPath(); c.roundRect(cx2 - 7, top, 14, 30, 5); c.fill();
  c.fillStyle = "#f5cd37";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      c.beginPath();
      c.ellipse(cx2 - 3 + col * 7, top + 4 + row * 5.5, 2.25, 1.75, 0, 0, Math.PI * 2); c.fill();
    }
  }
  const pulse = (Math.sin(frameCount * 0.09) + 1) * 0.5;
  c.fillStyle = `rgba(255,215,50,${0.1 + pulse * 0.2})`;
  c.beginPath(); c.arc(cx2, top - 4, 23 + pulse * 4, 0, Math.PI * 2); c.fill();
}

// ── Atualizar blocos ──────────────────────────────────────
function atualizarBlocos() {
  for (const b of blocos) {
    b.interagido = false;
    if      (b.estado === "palhada"   && ++b.timer >= TEMPO_PALHADA_PARA_PLANTADO)   { b.estado = "plantado";  b.timer = 0; }
    else if (b.estado === "plantado"  && ++b.timer >= TEMPO_PLANTADO_PARA_CRESCENDO) { b.estado = "crescendo"; b.timer = 0; }
    else if (b.estado === "crescendo" && ++b.timer >= TEMPO_CRESCENDO_PARA_PRONTO)   { b.estado = "pronto";    b.timer = 0; }
  }
}

// ── Colisão ───────────────────────────────────────────────
function colisaoBlocos() {
  noChao    = false;
  blocoAtual = null;

  if (estado === "FASE2") {
    colisaoPlataformasF2();
  } else {
    for (const b of blocos) {
      const kaduPeX1 = kaduX + (65 - KADU_W) / 2;
      const kaduPeX2 = kaduPeX1 + KADU_W;
      const kaduPeY  = kaduY + KADU_H;
      const dentroDX = kaduPeX2 > b.x && kaduPeX1 < b.x + b.w;
      const caindo   = kaduVelY >= 0 && kaduPeY >= b.y && kaduPeY <= b.y + 12;
      if (dentroDX && caindo) {
        kaduY = b.y - KADU_H; kaduVelY = 0; noChao = true; blocoAtual = b; break;
      }
    }
  }

  const chaoAtual = (estado === "FASE2") ? SOLO_Y_FASE2 : soloY;
  if (!noChao && kaduY + KADU_H >= chaoAtual) {
    kaduY = chaoAtual - KADU_H; kaduVelY = 0; noChao = true;
  }
  
}

function colisaoPlataformasF2() {
  for (const p of plataformasF2) {
    const kaduPeX1 = kaduX + (65 - KADU_W) / 2;
    const kaduPeX2 = kaduPeX1 + KADU_W;
    const kaduPeY  = kaduY + KADU_H;
    const dentroDX = kaduPeX2 > p.x && kaduPeX1 < p.x + p.w;
    const caindo   = kaduVelY >= 0 && kaduPeY >= p.y && kaduPeY <= p.y + p.h + 16;
    if (dentroDX && caindo) {
      kaduY = p.y - KADU_H; kaduVelY = 0; noChao = true; return;
    }
  }
}

// ── Interagir bloco ───────────────────────────────────────
function interagirBloco() {
  if (!blocoAtual || blocoAtual.interagido) return;
  if (blocoAtual.estado === "normal") {
    blocoAtual.estado = "palhada"; blocoAtual.timer = 0; blocoAtual.interagido = true;
  } else if (blocoAtual.estado === "pronto") {
    const cx2 = blocoAtual.x + blocoAtual.w / 2;
    const cy2 = blocoAtual.y - 80;
    particulas.push({ x: cx2, y: cy2, alfa: 255, vel: -2 });
    blocoAtual.estado = "normal"; blocoAtual.timer = 0; blocoAtual.interagido = true;
    contadorMilho++;
    if (contadorMilho === 10) {
      caixaDicaAtiva = true; caixaDicaFase = 1; caixaDicaTimer = 0; caixaDicaAlfaIn = 0;
    }
  }
}

// ── Partículas +1 ─────────────────────────────────────────
function atualizarParticulas() {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.y    += p.vel;
    p.alfa -= 4;
    if (p.alfa <= 0) { particulas.splice(i, 1); continue; }
    ctx.font         = fonte(18);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = `rgba(0,0,0,${p.alfa * 0.5 / 255})`;
    ctx.fillText("+1", (p.x - camX) + 1, p.y + 1);
    ctx.fillStyle = `rgba(255,220,50,${p.alfa / 255})`;
    ctx.fillText("+1", p.x - camX, p.y);
  }
}

// ── Contador de milho ─────────────────────────────────────
function desenharContadorMilho() {
  if (estado === "FASE2") return;
  ctx.fillStyle = "rgba(0,0,0,0.63)";
  ctx.beginPath(); ctx.roundRect(10, 60, 110, 40, 10); ctx.fill();
  ctx.strokeStyle = "#d7aa26"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(10, 60, 110, 40, 10); ctx.stroke();
  ctx.fillStyle    = "#f5cd37";
  ctx.font         = fonte(20);
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("🌽 x " + contadorMilho, 28, 81);
}

// ── HUD blocos ────────────────────────────────────────────
function desenharHUDBlocos() {
  if (!blocoAtual) return;
  let label = "";
  let progresso = 0;
  if      (blocoAtual.estado === "normal")    label = "Pressione E: colocar palhada";
  else if (blocoAtual.estado === "palhada")   { label = "Palhada — aguardando...";      progresso = blocoAtual.timer / TEMPO_PALHADA_PARA_PLANTADO; }
  else if (blocoAtual.estado === "plantado")  { label = "Milho plantado — crescendo..."; progresso = blocoAtual.timer / TEMPO_PLANTADO_PARA_CRESCENDO; }
  else if (blocoAtual.estado === "crescendo") { label = "Crescendo...";                  progresso = blocoAtual.timer / TEMPO_CRESCENDO_PARA_PRONTO; }
  else if (blocoAtual.estado === "pronto")    { label = "Pressione E para colher!";      progresso = 1; }

  const hx = kaduX - camX;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath(); ctx.roundRect(hx - 60, kaduY - 50, 180, 22, 6); ctx.fill();
  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(11);
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, hx + 32, kaduY - 39);

  if (progresso > 0) {
    ctx.fillStyle = "#3c3c3c"; ctx.beginPath(); ctx.roundRect(hx - 20, kaduY - 22, 100, 8, 4); ctx.fill();
    ctx.fillStyle = "#50c850"; ctx.beginPath(); ctx.roundRect(hx - 20, kaduY - 22, 100 * progresso, 8, 4); ctx.fill();
  }
}

// ── Caixa de dica ─────────────────────────────────────────
function desenharCaixaDica() {
  if (!caixaDicaAtiva) return;
  caixaDicaTimer++;
  if (caixaDicaAlfaIn < 255) caixaDicaAlfaIn = Math.min(255, caixaDicaAlfaIn + 12);
  if (caixaDicaTimer === CAIXA_DICA_TROCA) { caixaDicaFase = 2; caixaDicaAlfaIn = 0; }
  if (caixaDicaTimer >= CAIXA_DICA_FIM)    { caixaDicaAtiva = false; return; }

  let alfaGlobal = caixaDicaAlfaIn;
  const framesDaFase  = caixaDicaFase === 1 ? caixaDicaTimer : caixaDicaTimer - CAIXA_DICA_TROCA;
  const framesFimFase = caixaDicaFase === 1 ? CAIXA_DICA_TROCA : CAIXA_DICA_FIM - CAIXA_DICA_TROCA;
  if (framesDaFase > framesFimFase - 40) {
    alfaGlobal = Math.min(alfaGlobal, mapRange(framesDaFase, framesFimFase - 40, framesFimFase, 255, 0));
  }

  const a  = alfaGlobal / 255;
  const bW = 280, bH = 180, bX = W - bW - 10, bY = 10;

  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.roundRect(bX + 4, bY + 4, bW, bH, 14); ctx.fill();
  ctx.fillStyle = "#fffce4"; ctx.strokeStyle = "#dc8228"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e1781e";
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, 32, [12, 12, 0, 0]); ctx.fill();
  desenharAvatarMentor(ctx, bX + 10 + 20, bY + 16, 40, alfaGlobal);
  ctx.fillStyle    = "#fff8e1";
  ctx.font         = fonte(13);
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Mentor", bX + 56, bY + 16);
  const textoAtual = caixaDicaFase === 1 ? TEXTO_DICA1 : TEXTO_DICA2;
  ctx.fillStyle    = "#46290a";
  ctx.font         = fonte(14);
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, textoAtual, bX + 12, bY + 38, bW - 20, 20);
  ctx.restore();
}

// ── Sun e Flash ───────────────────────────────────────────
function desenharSunEFlash() {
  if (flashAlfa > 0) {
    ctx.fillStyle = `rgba(255,220,0,${flashAlfa / 255})`;
    ctx.fillRect(0, 0, W, H);
    flashAlfa -= 8;
    if (flashAlfa < 0) flashAlfa = 0;
  }
  if (sunFase === "IDLE") return;

  let angulo = 0;
  if (sunFase === "ABRINDO") {
    const t = sunProgresso / sunDuracao;
    angulo = lerp(-Math.PI / 2, 0, 1 - Math.pow(1 - t, 3));
    sunProgresso++;
    if (sunProgresso >= sunDuracao) { sunFase = "ABERTO"; sunProgresso = 0; }
  } else if (sunFase === "ABERTO") {
    angulo = 0; sunProgresso++;
    if (sunProgresso >= sunEspera) { sunFase = "FECHANDO"; sunProgresso = 0; }
  } else if (sunFase === "FECHANDO") {
    const t = sunProgresso / sunDuracao;
    angulo = lerp(0, -Math.PI / 2, Math.pow(t, 3));
    sunProgresso++;
    if (sunProgresso >= sunDuracao) { sunFase = "IDLE"; sunAtivo = false; }
  }

  ctx.save();
  ctx.translate(W, 0); ctx.rotate(angulo);
  drawImg("sun", -(45 + 15), 45 + 15, 90, 90);
  ctx.restore();
}

// ── Resíduos (Fase 2) ─────────────────────────────────────
function desenharResiduos() {
  for (const r of residuos) {
    if (r.coletado) continue;
    r.timer++;
    const progTempo = 1 - r.timer / RESIDUO_TEMPO_MAX;
    const barW = 32;
    ctx.fillStyle = "rgba(60,60,60,0.7)";
    ctx.beginPath(); ctx.roundRect(r.x - barW / 2, r.y - 28, barW, 5, 3); ctx.fill();
    ctx.fillStyle = progTempo > 0.4 ? "#50c850" : "#dc3c3c";
    ctx.beginPath(); ctx.roundRect(r.x - barW / 2, r.y - 28, barW * progTempo, 5, 3); ctx.fill();

    const brilho = (Math.sin(frameCount * 0.08) + 1) * 0.5;
    const aura   = 28 + brilho * 10;
    ctx.fillStyle = `rgba(${r.tipo.cor.join(",")},${(40 + brilho * 50) / 255})`;
    ctx.beginPath(); ctx.arc(r.x, r.y - 8, (aura + 14) / 2, 0, Math.PI * 2); ctx.fill();

    const flutua = Math.sin(frameCount * 0.06 + r.x) * 4;
    ctx.save(); ctx.translate(r.x, r.y - 8 + flutua);
    desenharItemResiduo(ctx, r.tipo.nome, r.tipo.cor, r.tipo.corB);
    ctx.restore();

    ctx.fillStyle    = "#fff5b4";
    ctx.font         = fonte(10);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(r.tipo.nome, r.x, r.y - 22 + flutua);

    if (r.timer >= RESIDUO_TEMPO_MAX) {
      r.coletado = true;
      poluicao = Math.min(100, poluicao + 15);
    }
  }
  residuos = residuos.filter(r => !r.coletado);
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
}

function desenharItemResiduo(c, nome, cor, corB) {
  c.fillStyle = `rgba(${cor.join(",")},0.78)`;
  if (nome === "Garrafa") {
    c.beginPath(); c.roundRect(-5, -4, 10, 14, 3); c.fill();
    c.beginPath(); c.roundRect(-3, -10, 6, 7, 2);  c.fill();
  } else if (nome === "Pilha") {
    c.fillStyle = `rgb(${corB.join(",")})`; c.beginPath(); c.roundRect(-6, -8, 12, 16, 2); c.fill();
    c.fillStyle = `rgb(${cor.join(",")})`;  c.fillRect(-4, -6, 8, 8);
    c.fillStyle = "#505050"; c.beginPath(); c.roundRect(-2, -11, 4, 4, 1); c.fill();
  } else if (nome === "Lata") {
    c.fillStyle = `rgb(${cor.join(",")})`;
    c.beginPath(); c.ellipse(0, -6, 6, 2.5, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(-6, -6, 12, 14);
    c.beginPath(); c.ellipse(0, 8, 6, 2.5, 0, 0, Math.PI * 2); c.fill();
  } else if (nome === "Oleo") {
    c.fillStyle = `rgb(${corB.join(",")})`; c.beginPath(); c.roundRect(-5, 0, 10, 10, 2); c.fill();
    c.beginPath(); c.roundRect(-3, -8, 6, 9, 2); c.fill();
    c.fillStyle = `rgba(${cor.join(",")},0.7)`;
    c.beginPath(); c.ellipse(0, -10, 2.5, 3, 0, 0, Math.PI * 2); c.fill();
  }
}

// ── HUD Fase 2 ────────────────────────────────────────────
function desenharHUDF2() {
  const barX = W - 160, barY = 55, barW2 = 140, barH2 = 16;
  ctx.fillStyle = "rgba(0,0,0,0.63)";
  ctx.beginPath(); ctx.roundRect(barX - 5, barY - 18, barW2 + 10, barH2 + 24, 8); ctx.fill();
  ctx.fillStyle    = "#c8c8c8";
  ctx.font         = fonte(11);
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Poluição", barX, barY - 8);
  ctx.fillStyle = "#323232"; ctx.beginPath(); ctx.roundRect(barX, barY, barW2, barH2, 6); ctx.fill();
  const corPol = poluicao < 50 ? "#50c850" : poluicao < 75 ? "#f0b414" : "#dc3232";
  ctx.fillStyle = corPol;
  ctx.beginPath(); ctx.roundRect(barX, barY, barW2 * (poluicao / 100), barH2, 6); ctx.fill();
  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(10);
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.floor(poluicao) + "%", barX + barW2 / 2, barY + barH2 / 2);

  // Inventário rápido na fase 2
  if (inventario.length > 0) {
    const grupos = {};
    for (const it of inventario) {
      if (!grupos[it.nome]) grupos[it.nome] = { tipo: it, qtd: 0 };
      grupos[it.nome].qtd++;
    }
    const chaves  = Object.keys(grupos);
    const slotW   = 70;
    const totalW  = chaves.length * slotW + 10;
    ctx.fillStyle = "rgba(0,0,0,0.63)";
    ctx.beginPath(); ctx.roundRect(10, H - 50, totalW, 38, 8); ctx.fill();
    for (let i = 0; i < chaves.length; i++) {
      const g  = grupos[chaves[i]];
      const ix = 26 + i * slotW;
      const iy = H - 31;
      ctx.fillStyle = `rgba(${g.tipo.cor.join(",")},0.7)`;
      ctx.beginPath(); ctx.arc(ix, iy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle    = "#fff";
      ctx.font         = fonte(9);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.tipo.nome.substring(0, 3), ix, iy);
      ctx.fillStyle = "#ffdc50"; ctx.font = fonte(11);
      ctx.fillText("x" + g.qtd, ix + 18, iy);
    }
  }

  if (poluicao >= 100) {
    ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle    = "#dc3232";
    ctx.font         = fonte(36);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Poluição crítica!", W / 2, H / 2 - 20);
    ctx.fillStyle = "#fff"; ctx.font = fonte(16);
    ctx.fillText("O meio ambiente foi contaminado.", W / 2, H / 2 + 20);
  }
}

// ── Lixeiras (destaque ao arrastar) ──────────────────────
function desenharLixeiras() {
  // Lixeiras são invisíveis — apenas áreas de drop lógicas (sem nenhum visual)
}

// ── Inventário descarte ───────────────────────────────────
function desenharInventarioDescarte() {
  if (!inventarioAberto) return;
  const iW = 320, iH = 220, iX = W - iW - 20, iY = 60;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath(); ctx.roundRect(iX, iY, iW, iH, 12); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.31)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(iX, iY, iW, iH, 12); ctx.stroke();
  ctx.fillStyle    = "#ffdc64";
  ctx.font         = fonte(15);
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Resíduos Coletados", iX + iW / 2, iY + 20);
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(iX + 10, iY + 35); ctx.lineTo(iX + iW - 10, iY + 35); ctx.stroke();

  const grupos = {};
  for (const it of inventario) {
    if (!grupos[it.nome]) grupos[it.nome] = { tipo: it, qtd: 0 };
    grupos[it.nome].qtd++;
  }
  const chaves = Object.keys(grupos);
  for (let i = 0; i < chaves.length; i++) {
    const g  = grupos[chaves[i]];
    const gx = iX + 40 + i * 75;
    const gy = iY + 100;
    if (itemArrastando && itemArrastando.nome === chaves[i]) continue;
    ctx.fillStyle = `rgba(${g.tipo.cor.join(",")},0.78)`;
    ctx.beginPath(); ctx.arc(gx, gy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle    = "#fff";
    ctx.font         = fonte(10);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(g.tipo.nome, gx, gy + 28);
    ctx.fillStyle = "#ffdc50"; ctx.font = fonte(12);
    ctx.fillText("x" + g.qtd, gx, gy - 28);
  }

  if (itemArrastando) {
    ctx.fillStyle = `rgba(${itemArrastando.cor.join(",")},0.86)`;
    ctx.beginPath(); ctx.arc(arrastarX, arrastarY, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle    = "#fff";
    ctx.font         = fonte(10);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(itemArrastando.nome, arrastarX, arrastarY + 30);
  }
}

// ── Diálogo F2P2 ──────────────────────────────────────────
function desenharDialogoF2P2() {
  if (dialogoF2P2Encerrado) return;
  dialogoF2P2Timer++;
  if (dialogoF2P2Timer < DIALOGO_DELAY) return;
  if (dialogoF2P2Alfa < 220) dialogoF2P2Alfa = Math.min(220, dialogoF2P2Alfa + 8);
  const a  = dialogoF2P2Alfa / 255;
  const bH = 130, bY = H - bH - 10, bX = 10, bW = W - 20;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 10); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 10); ctx.stroke();
  desenharAvatarMentor(ctx, bX + 30, bY + 20, 36, dialogoF2P2Alfa);
  ctx.fillStyle    = "#ffdc64";
  ctx.font         = fonte(13);
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Mentor", bX + 52, bY + 20);
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bX + 10, bY + 36); ctx.lineTo(bX + bW - 10, bY + 36); ctx.stroke();
  ctx.fillStyle    = "#fff";
  ctx.font         = fonte(16);
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, FALAS_F2P2[dialogoF2P2Index], bX + 16, bY + 44, bW - 32, 22);
  const pisca = (Math.sin(frameCount * 0.15) + 1) * 0.5;
  ctx.globalAlpha = a * pisca;
  ctx.fillStyle    = "#ffdc64";
  ctx.font         = fonte(12);
  ctx.textAlign    = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("Clique para continuar ▶", bX + bW - 10, bY + bH - 8);
  ctx.restore();
}

// ── Diálogo de erro ───────────────────────────────────────
function desenharDialogoErro() {
  if (!dialogoErroAtivo) return;
  if (dialogoErroAlfa < 220) dialogoErroAlfa = Math.min(220, dialogoErroAlfa + 8);
  const a  = dialogoErroAlfa / 255;
  const bH = 130, bY = H - bH - 10, bX = 10, bW = W - 20;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 10); ctx.fill();
  ctx.strokeStyle = "rgba(220,50,50,0.6)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 10); ctx.stroke();
  desenharAvatarMentor(ctx, bX + 30, bY + 20, 36, dialogoErroAlfa, true);
  ctx.fillStyle    = "#ffb4b4";
  ctx.font         = fonte(13);
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Mentor", bX + 52, bY + 20);
  ctx.strokeStyle = "rgba(220,50,50,0.3)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bX + 10, bY + 36); ctx.lineTo(bX + bW - 10, bY + 36); ctx.stroke();
  ctx.fillStyle    = "#ffdcdc";
  ctx.font         = fonte(15);
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, dialogoErroTexto, bX + 16, bY + 44, bW - 32, 22);
  const pisca = (Math.sin(frameCount * 0.15) + 1) * 0.5;
  ctx.globalAlpha = a * pisca;
  ctx.fillStyle    = "#ffb4b4";
  ctx.font         = fonte(12);
  ctx.textAlign    = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("Clique para continuar ▶", bX + bW - 10, bY + bH - 8);
  ctx.restore();
}

// ── Avatar mentor (círculo com ícone) ─────────────────────
function desenharAvatarMentor(c, cx2, cy2, r, alfa, erro) {
  c.save();
  c.globalAlpha = alfa / 255;
  c.fillStyle   = erro ? "#dc3232" : "#e1781e";
  c.beginPath(); c.arc(cx2, cy2, r / 2 + 3, 0, Math.PI * 2); c.fill();
  if (imgs["iconmentor"]) {
    c.save();
    c.beginPath(); c.arc(cx2, cy2, r / 2, 0, Math.PI * 2); c.clip();
    c.drawImage(imgs["iconmentor"], cx2 - r / 2, cy2 - r / 2, r, r);
    c.restore();
  }
  c.restore();
}

// ═══════════════════════════════════════════════════════════
//  MOVIMENTAÇÃO DO KADU
// ═══════════════════════════════════════════════════════════
function movimentK() {
  let andando = false;
  if (conversando && estado === "CUTSCENE") { kaduF = 0; return; }
  if (estado === "FASE2" && poluicao >= 100) { kaduF = 0; return; }

  const moverEsq = keys["ArrowLeft"]  || keys["a"] || keys["A"] || botoesVirtuais.esquerda;
  const moverDir = keys["ArrowRight"] || keys["d"] || keys["D"] || botoesVirtuais.direita;
  const pular    = keys["ArrowUp"]    || keys[" "] || botoesVirtuais.pular;

  if (moverEsq) {
    kaduX = Math.max(kaduX - kaduVel, 0);
    if (kaduD !== "ESQUERDA") { kaduD = "ESQUERDA"; kaduF = 0; }
    andando = true;
  }
if (moverDir) {
  if (estado === "FASE2") {
    kaduX += kaduVel;
  } else {
    kaduX = Math.min(kaduX + kaduVel, MUNDO_W - 65);
  }

  if (kaduD !== "DIREITA") {
    kaduD = "DIREITA";
    kaduF = 0;
  }

  andando = true;
}

  if (pular && noChao &&
      (estado === "FASE1" || estado === "FASE1REAL" || estado === "FASE2")) {
    kaduVelY = -12; noChao = false;
  }

  if (!noChao) {
    kaduVelY += gravidade;
    kaduY    += kaduVelY;
    if      (kaduVelY < -6)                  kaduFPulo = 0;
    else if (kaduVelY >= -6 && kaduVelY < 0) kaduFPulo = 1;
    else if (kaduVelY >= 0  && kaduVelY < 6) kaduFPulo = 2;
    else                                     kaduFPulo = 3;
  } else {
    kaduFPulo = 0;
  }

  if (estado === "FASE1REAL" || estado === "FASE2") {
    colisaoBlocos();
  } else {
    if (kaduY + KADU_H >= soloY) {
      kaduY = soloY - KADU_H; kaduVelY = 0; noChao = true;
    }
  }
   const limiteEsq = 0;
  const limiteDir = (estado === "FASE1REAL") ? MUNDO_W - 65
                  : (estado === "FASE2")     ? (imgs["ff2"] ? imgs["ff2"].width : 1024) - 65
                  : W - 65;
                 
                  if (kaduX < limiteEsq) kaduX = limiteEsq;
if (kaduX > limiteDir) kaduX = limiteDir;

  if (andando && noChao) {
    if (frameCount % 12 === 0) kaduF = (kaduF + 1) % 4;
  } else if (!andando && noChao) {
    kaduF = 0;
  }
}

// ═══════════════════════════════════════════════════════════
//  EVENTOS DE INPUT
// ═══════════════════════════════════════════════════════════
function handleKeyPressed(e) {
  if (estado === "FASE1" && e.key === "4" && perto) {
    estado = "CUTVIDEO"; estadoCutVideo = "FECHANDO"; corteFime = 0;
  }
  if (estado === "FASE1REAL" && (e.key === "e" || e.key === "E")) {
    interagirBloco();
  }
  if (estado === "FASE2" && (e.key === "e" || e.key === "E")) {
    for (const r of residuos) {
      if (r.coletado) continue;
      if (dist2(kaduX + 32, kaduY + 40, r.x, r.y) < 90) {
        r.coletado = true;
        inventario.push(r.tipo);
      }
    }
  }
}

function handleMousePressed(e) {
   const rect = canvas.getBoundingClientRect();
  const mx   = (e.clientX - rect.left) * (W / rect.width);   // coordenada do canvas
  const my   = (e.clientY - rect.top)  * (H / rect.height);  // coordenada do canvas

  if (estado === "MENU") {
    vPalpebras = true;
    // Se o autoplay foi bloqueado, o clique desbloqueia e inicia inicio.mp3
    if (snds["musica"] && snds["musica"].paused) {
      snds["musica"].loop = true;
      snds["musica"].play().catch(() => {});
    }
    // inicio.mp3 já vai parar nas pálpebras (drawMenu), mas também dispara ending.mp3 aqui
    // para garantir que o AudioContext está desbloqueado para os próximos sons
  } else if (estado === "JOGO" && opacidadeTexto >= 150) {
    estado = "CUTSCENE";
    pararSom("stj");
    tocarSom("f1M", true);
    opacidadeTexto = 0;
  } else if (estado === "CUTSCENE" && conversando) {
    estado = "FASE1"; conversando = false; npcF = 0; opacidadeTexto = 0;
  } else if (estado === "FASE2P2" && !dialogoF2P2Encerrado && dialogoF2P2Timer >= DIALOGO_DELAY) {
    dialogoF2P2Index++;
    dialogoF2P2Alfa = 0;
    if (dialogoF2P2Index >= FALAS_F2P2.length) {
      dialogoF2P2Encerrado = true;
      inventarioAberto     = true;
    }
  } else if (estado === "FASE2P2" && inventarioAberto) {
    if (dialogoErroAtivo) {
      dialogoErroAtivo = false; imagemErroAtiva = false; dialogoErroAlfa = 0; return;
    }
    if (!itemArrastando) {
      const grupos = {};
      for (const it of inventario) {
        if (!grupos[it.nome]) grupos[it.nome] = { tipo: it, qtd: 0 };
        grupos[it.nome].qtd++;
      }
      const chaves = Object.keys(grupos);
      const iX     = W - 320 - 20;
      const iY     = 60;
      for (let i = 0; i < chaves.length; i++) {
        const gx = iX + 40 + i * 75;
        const gy = iY + 100;
        if (dist2(mx, my, gx, gy) < 22) {
          itemArrastando = grupos[chaves[i]].tipo;
          arrastarX = mx; arrastarY = my; return;
        }
      }
    }
  }
}
function handleMouseDragged(e) {
  if (estado !== "FASE2P2" || !inventarioAberto || !itemArrastando) return;
  const rect = canvas.getBoundingClientRect();
  arrastarX  = (e.clientX - rect.left) * (W / rect.width);
  arrastarY  = (e.clientY - rect.top)  * (H / rect.height);
}

function handleMouseReleased(e) {
  if (estado !== "FASE2P2" || !itemArrastando) return;
  const rect = canvas.getBoundingClientRect();
  const mx   = (e.clientX - rect.left) * (W / rect.width);
  const my   = (e.clientY - rect.top)  * (H / rect.height);
  const idx  = inventario.findIndex(it => it.nome === itemArrastando.nome);

  for (const lx of LIXEIRAS) {
    if (dist2(mx, my, lx.x, lx.y) < 40) {
      if (itemArrastando.nome === lx.nome) {
        if (idx !== -1) inventario.splice(idx, 1);
        poluicao = Math.max(0, poluicao - 5);
        descartesCertos++;
        const mapaImagem = { Garrafa: "garrafa", Lata: "lata", Pilha: "pilha", Oleo: "oleo" };
        imagemFundoAtual = mapaImagem[lx.nome] || "inicial";
      } else {
        poluicao = Math.min(100, poluicao + 10);
        imagemErroAtiva = true; imagemErroTimer = 0;
        dialogoErroAtivo = true; dialogoErroAlfa = 0;
        if (itemArrastando.nome === "Garrafa")
          dialogoErroTexto = "Cuidado! Garrafas são resíduos recicláveis.\nElas devem ir na lixeira VERMELHA,\nnão com outros materiais!";
        else if (itemArrastando.nome === "Pilha")
          dialogoErroTexto = "Atenção! Pilhas contêm metais pesados\nque contaminam o solo e a água.\nLeve-as a um posto de coleta especial!";
        else if (itemArrastando.nome === "Lata")
          dialogoErroTexto = "Ops! Latas são recicláveis e devem\nir na lixeira AMARELA.\nDescartar errado polui o meio ambiente!";
        else if (itemArrastando.nome === "Oleo")
          dialogoErroTexto = "Cuidado! O óleo usado não pode ir\nna lixeira comum — ele contamina\na água. Use o posto de coleta de óleo!";
      }
      break;
    }
  }
  itemArrastando = null;
  arrastarX = 0; arrastarY = 0;
}

// ═══════════════════════════════════════════════════════════
//  UTILITÁRIOS DE DESENHO
// ═══════════════════════════════════════════════════════════

// Quebra texto em múltiplas linhas (respeita \n e largura máxima)
// CORREÇÃO 8: para textAlign "center", ajusta X corretamente
function wrapText(c, texto, x, y, maxW, lineH) {
  const align  = c.textAlign;
  const base   = c.textBaseline;
  const linhas = texto.split("\n");
  let ly = y;

  for (const linha of linhas) {
    if (linha.trim() === "") { ly += lineH; continue; }
    const palavras = linha.split(" ");
    let atual = "";
    for (const p of palavras) {
      const teste = atual ? atual + " " + p : p;
      if (c.measureText(teste).width > maxW && atual) {
        // Centraliza em relação ao ponto x se align for center
        const drawX = align === "center" ? x : x;
        c.fillText(atual, drawX, ly);
        atual = p;
        ly += lineH;
      } else {
        atual = teste;
      }
    }
    if (atual) {
      c.fillText(atual, x, ly);
      ly += lineH;
    }
  }
}

// Rect arredondado compatível (fallback se roundRect não existir)
function roundRect(c, x, y, w, h, r) {
  if (c.roundRect) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  else {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);  c.quadraticCurveTo(x + w, y,     x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);  c.quadraticCurveTo(x, y + h,     x, y + h - r);
    c.lineTo(x, y + r);      c.quadraticCurveTo(x, y,         x + r, y);
    c.closePath();
  }
}

// ═══════════════════════════════════════════════════════════
//  INICIALIZAÇÃO — chamada pelo botão no index.html
// ═══════════════════════════════════════════════════════════
// preload() é chamada externamente pelo ind