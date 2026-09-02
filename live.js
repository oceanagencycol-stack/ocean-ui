/* Showcase del módulo Live de Ocean UI. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

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

/* ------------------------------------------------------------- densidades */
const mD = $("#mDensidad");
function pintarDensidad(d) {
  mD.innerHTML = `<ocean-actividad densidad="${d}" icono="◈" principal="Valeria respondió"
    secundario="Lead nuevo · Conjunto residencial, 8 sedes" tono="acento" vivo></ocean-actividad>`;
  OceanSound.reproducir("morph");
}
pintarDensidad("compacta");
$$("[data-dens]").forEach(b => b.addEventListener("click", () => pintarDensidad(b.dataset.dens)));

/* -------------------------------------------------------------------- ruta */
$("#rutaGo").addEventListener("click", () => $("#ruta").avanzar());
$("#rutaReset").addEventListener("click", () => {
  $("#ruta").setAttribute("actual", "0"); OceanSound.reproducir("cerrar");
});

/* ---------------------------------------------------------------- espresso */
const onda = $("#ondaEsp"), tiempo = $("#espTiempo");
let espT = null;
$("#espGo").addEventListener("click", () => {
  clearInterval(espT);
  const TOTAL = 27;
  let t = TOTAL;
  OceanSound.reproducir("abrir");
  espT = setInterval(() => {
    t -= 0.1;
    onda.setAttribute("valor", ((TOTAL - t) / TOTAL * 100).toFixed(0));
    tiempo.textContent = Math.max(0, t).toFixed(0) + "s";
    if (t <= 5 && Math.abs(t % 1) < 0.1) OceanSound.reproducir("tic");
    if (t <= 0) { clearInterval(espT); OceanSound.reproducir("bien"); tiempo.textContent = "listo"; }
  }, 100);
});

/* -------------------------------------------------------------------- arco */
const arco = $("#arco");
let av = 4, adir = 1;
setInterval(() => {
  if (document.hidden) return;
  av += adir * 2;
  if (av >= 96 || av <= 4) adir *= -1;
  arco.setAttribute("valor", av);
  arco.setAttribute("detalle", av < 50 ? `en ${Math.round((50 - av) / 3)} min` : "sobre el horizonte");
}, 260);

/* ----------------------------------------------------------------- franjas */
$("#franjas").setAttribute("momentos", JSON.stringify([
  { eti: "Ahora",   hora: "5:50 PM", de: "#6BA8FF", a: "#F0B27A", activo: true, pos: 34 },
  { eti: "Ocaso",   hora: "en 57 m", de: "#F0B27A", a: "#E8734A" },
  { eti: "Crepúsculo", hora: "8:12", de: "#7C5CFF", a: "#141A33" },
]));

/* ---------------------------------------------------------- isla de borde */
const borde = $("#islaBorde"), bc = $("#bordeContenido");
let vol = 62;
function pintarVolumen() {
  bc.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
    <div style="width:34px;height:120px;border-radius:18px;background:rgba(255,255,255,.16);
                position:relative;overflow:hidden">
      <div style="position:absolute;left:0;right:0;bottom:0;height:${vol}%;background:#fff;
                  border-radius:16px;transition:height .3s cubic-bezier(.16,1,.3,1)"></div>
    </div>
    <span style="font-size:17px">🔊</span></div>`;
}
const MODOS = [
  { i: "🔕", t: "SILENCIO", c: "#F87171" },
  { i: "🌙", t: "TRABAJO",  c: "#7C5CFF" },
  { i: "📶", t: "CONECTADO",c: "#34D399" },
];
let iModo = 0;
function pintarModo() {
  const m = MODOS[iModo % MODOS.length];
  bc.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
    <span style="font-size:20px">${m.i}</span>
    <span style="writing-mode:vertical-rl;font-family:var(--mono);font-size:.6rem;
                 letter-spacing:.16em;color:${m.c}">${m.t}</span></div>`;
}
$("#bordeVol").addEventListener("click", () => {
  vol = Math.min(100, vol + 12); if (vol >= 100) vol = 28;
  pintarVolumen(); borde.destello(2000); OceanSound.reproducir("desliz", vol / 100);
});
$("#bordeModo").addEventListener("click", () => {
  iModo++; pintarModo(); borde.destello(2200);
});
$("#bordeFijo").addEventListener("click", () => {
  if (borde.hasAttribute("abierto")) borde.cerrar();
  else { pintarModo(); borde.abrir(); }
});
pintarModo();

/* ------------------------------------------------------------------ acceso */
const acceso = $("#formAcceso"), registro = $("#registro");
function log(txt, clase = "") {
  const d = document.createElement("div");
  d.className = clase;
  d.textContent = `${new Date().toLocaleTimeString("es-CO", { hour12: false })}  ${txt}`;
  registro.prepend(d);
  while (registro.children.length > 14) registro.lastChild.remove();
}
// verificación de ejemplo: en producción esto llama a la API real
acceso.verificar = ({ usuario, clave }) =>
  new Promise(ok => setTimeout(() => {
    if (!usuario.includes("@") && usuario.length < 3) return ok({ ok: false, mensaje: "Usuario no válido." });
    ok(clave.toLowerCase() === "ocean"
      ? { ok: true, mensaje: `Bienvenido, ${usuario.split("@")[0]}` }
      : { ok: false, mensaje: "Usuario o contraseña incorrectos." });
  }, 1400));

acceso.addEventListener("ocean:acceso-estado", e => log("estado → " + e.detail.estado));
acceso.addEventListener("ocean:acceso-ok", () => log("acceso concedido", "ok"));
acceso.addEventListener("ocean:acceso-error", e => log("rechazado: " + e.detail.mensaje, "err"));
log("sistema listo");

$("#probOk").addEventListener("click", () => acceso.acertar("Acceso concedido"));
$("#probErr").addEventListener("click", () => acceso.fallar("Usuario o contraseña incorrectos."));
$("#probReset").addEventListener("click", () => acceso.reiniciar());

/* ------------------------------------------------------------------ código */
const cod = $("#codigo"), codMsg = $("#codMsg"), rostro2 = $("#rostro2");
cod.addEventListener("ocean:codigo", e => {
  if (!e.detail.completo) {
    codMsg.textContent = `${e.detail.valor.length} de 6`;
    rostro2.setAttribute("estado", "mirando");
    return;
  }
  codMsg.textContent = "Verificando";
  rostro2.setAttribute("estado", "verificando");
  setTimeout(() => {
    if (e.detail.valor === "123456") {
      cod.acertar(); rostro2.setAttribute("estado", "ok"); codMsg.textContent = "Código correcto";
    } else {
      cod.fallar(); rostro2.setAttribute("estado", "error"); codMsg.textContent = "Código incorrecto · pruebe 123456";
      setTimeout(() => rostro2.setAttribute("estado", "reposo"), 1400);
    }
  }, 900);
});
})();
