/* Showcase de Ocean UI — conecta los ejemplos de la página. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const { Resorte, agregar } = OceanMotion;

OceanUI.iniciar();

/* ------------------------------------------------------------ botón de sonido */
const bs = $("#botonSonido"), es = $("#etiquetaSonido");
function pintarSonido() {
  const on = OceanSound.encendido;
  bs.setAttribute("aria-pressed", String(on));
  es.textContent = on ? "Sonido activo" : "Sonido apagado";
}
bs.addEventListener("click", () => { OceanSound.alternar(); pintarSonido(); });
pintarSonido();

/* ---------------------------------------------------------------------- isla */
const isla = $("#isla");
let islaUsada = false;
document.querySelectorAll("[data-isla]").forEach(b =>
  b.addEventListener("click", () => { islaUsada = true; isla.setAttribute("estado", b.dataset.isla); }));

const AVISOS = [
  { icono: "✓", titulo: "Pedido confirmado", detalle: "Llega el martes 9 de septiembre", sonido: "bien" },
  { icono: "◔", titulo: "Sincronizando", detalle: "412 registros pendientes", sonido: "aviso" },
  { icono: "◈", titulo: "Nuevo lead", detalle: "Conjunto residencial · 8 sedes", sonido: "abrir" },
  { icono: "⚠", titulo: "Stock bajo", detalle: "Rollo 65×90 negro · 12 unidades", sonido: "mal" },
];
let iAviso = 0;
$("#islaAviso").addEventListener("click", () => {
  islaUsada = true;
  const a = AVISOS[iAviso++ % AVISOS.length];
  isla.mostrar({ ...a, estado: "expandida", durante: 3200 });
  OceanSound.reproducir(a.sonido);
});

/* -------------------------------------------------------- laboratorio de resortes */
const bloque = $("#bloque"), pista = $("#pista");
let rig = 170, amo = 22;
const sx = new Resorte({ desde: 0, rigidez: rig, amortiguacion: amo });
let corriendo = false;
function correr() {
  if (corriendo) return;
  corriendo = true;
  agregar(dt => {
    sx.paso(dt);
    bloque.style.transform = `translateX(${sx.v.toFixed(2)}px)`;
    if (sx.quieto) { corriendo = false; return false; }
  });
}
function tope() { return Math.max(0, pista.clientWidth - bloque.offsetWidth - 8); }
pista.addEventListener("click", e => {
  const r = pista.getBoundingClientRect();
  sx.a(OceanMotion.util.limitar(e.clientX - r.left - bloque.offsetWidth / 2, 0, tope()));
  correr(); OceanSound.reproducir("toque");
});
function aplicarResorte() {
  sx.k = rig; sx.c = amo;
  $("#vRig").textContent = rig; $("#vAmo").textContent = amo;
  // lanza el bloque al lado contrario para que el cambio se sienta
  sx.a(sx.destino > tope() / 2 ? 4 : tope());
  correr();
}
$("#rig").addEventListener("ocean:cambio", e => { rig = e.detail.valor; aplicarResorte(); });
$("#amo").addEventListener("ocean:cambio", e => { amo = e.detail.valor; aplicarResorte(); });
document.querySelectorAll("[data-pre]").forEach(b => b.addEventListener("click", () => {
  const [k, c] = b.dataset.pre.split(",").map(Number);
  $("#rig").setAttribute("valor", k); $("#amo").setAttribute("valor", c);
  rig = k; amo = c; aplicarResorte(); OceanSound.reproducir("muesca");
}));
addEventListener("load", () => { sx.saltar(4); bloque.style.transform = "translateX(4px)"; });

/* -------------------------------------------------------------------- dial */
$("#dial").addEventListener("ocean:cambio", e => {
  const v = e.detail.valor;
  // el color del dial acompaña a la temperatura: frío → cálido
  const t = (v - 16) / 14;
  const frio = [92, 140, 255], calido = [255, 138, 76];
  const mez = frio.map((c, i) => Math.round(c + (calido[i] - c) * t));
  $("#dial").setAttribute("color2", `rgb(${mez.join(",")})`);
});

/* -------------------------------------------------------------------- tiras */
const tiraNivel = $("#tiraNivel"), tiraLista = $("#tiraLista"), tiraTiempo = $("#tiraTiempo");
$("#tiraGo").addEventListener("click", () => tiraTiempo.iniciar(15));
$("#tiraStop").addEventListener("click", () => tiraTiempo.detener());
tiraTiempo.addEventListener("ocean:tira-fin", () =>
  isla.mostrar({ icono: "⏱", titulo: "Temporizador terminado", detalle: "15 segundos", estado: "expandida" }));

// la lista rota sola para mostrar la selección tipo píldora
const OPS = ["5", "10", "15", "30", "60"];
let iOp = 1;
setInterval(() => {
  if (document.hidden) return;
  iOp = (iOp + 1) % OPS.length;
  tiraLista.setAttribute("valor", OPS[iOp]);
}, 2200);

// el nivel respira
let dir = 1, nivel = 72;
setInterval(() => {
  if (document.hidden) return;
  nivel += dir * 6;
  if (nivel >= 92 || nivel <= 34) dir *= -1;
  tiraNivel.setAttribute("valor", nivel);
}, 900);

/* -------------------------------------------------------------------- dock */
$("#dock").addEventListener("ocean:dock", e => { $("#dockSalida").textContent = e.detail.valor; });

/* --------------------------------------------------------------- controles */
$("#brillo").addEventListener("ocean:cambio", e => { $("#vBrillo").textContent = e.detail.valor; });
$("#tg1").addEventListener("ocean:cambio", e =>
  isla.mostrar({ icono: e.detail.activo ? "☾" : "☀", titulo: e.detail.activo ? "Modo nocturno" : "Modo diurno", durante: 1800 }));

/* --------------------------------------------------------- catálogo de sonidos */
const CATALOGO = [
  ["roce",   "Roce",          "Al pasar el puntero. Casi subliminal."],
  ["toque",  "Toque",         "Clic mecánico: transitorio corto más cuerpo."],
  ["muesca", "Muesca",        "El detente de un potenciómetro."],
  ["abrir",  "Abrir",         "Barrido ascendente: algo se despliega."],
  ["cerrar", "Cerrar",        "El mismo gesto al revés."],
  ["bien",   "Confirmación",  "Tercera mayor ascendente, breve."],
  ["mal",    "Error",         "Segunda menor descendente, sin estridencia."],
  ["aviso",  "Aviso",         "Dos golpes iguales."],
  ["paso",   "Transición",    "Ruido filtrado que barre entre vistas."],
  ["morph",  "Morphing",      "Cuerpo grave con inflexión. Acompaña a la isla."],
  ["tic",    "Tic",           "Marca de segundo en cuenta atrás."],
  ["himno",  "Bienvenida",    "Acorde de cuatro notas en estéreo."],
];
$("#sonidos").innerHTML = CATALOGO.map(([k, n, d]) =>
  `<button class="snd o-rv" data-s="${k}"><b>${n}</b><span>${d}</span></button>`).join("");
$("#sonidos").addEventListener("click", e => {
  const b = e.target.closest("[data-s]");
  if (!b) return;
  if (!OceanSound.encendido) { OceanSound.alternar(true); pintarSonido(); }
  OceanSound.reproducir(b.dataset.s);
});
OceanMotion.reveals($("#sonidos"));

/* saludo al cargar, solo si el sonido ya estaba encendido de una visita previa */
addEventListener("pointerdown", function primera() {
  removeEventListener("pointerdown", primera);
  setTimeout(() => {
    if (OceanSound.encendido) OceanSound.reproducir("himno");
    if (!islaUsada) isla.mostrar({ icono: "◈", titulo: "Ocean UI", detalle: "Sistema cargado", estado: "media", durante: 2400 });
  }, 260);
}, { once: true });
})();
