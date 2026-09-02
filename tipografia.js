/* Showcase del sistema tipográfico de Ocean UI. */
(() => {
"use strict";
const $ = s => document.querySelector(s);

/* ---------------------------------------------------------------- escala */
const PASOS = [
  ["--ot-8", "ot-cartel",   "-0.050 em", "Cartel"],
  ["--ot-7", "ot-portada",  "-0.042 em", "Portada"],
  ["--ot-6", "ot-d1",       "-0.036 em", "Titular"],
  ["--ot-5", "ot-d2",       "-0.028 em", "Sección"],
  ["--ot-4", "ot-d3",       "-0.018 em", "Subtítulo"],
  ["--ot-3", "ot-entradilla","-0.008 em","Entradilla"],
  ["--ot-2", "ot-cuerpo",   "0",         "Cuerpo"],
  ["--ot-1", "ot-ui",       "+0.010 em", "Interfaz"],
  ["--ot-0", "ot-pie",      "+0.060 em", "Pie"],
  ["--ot-00","ot-etiqueta", "+0.100 em", "Etiqueta"],
];
$("#tablaEscala").innerHTML = PASOS.map(([v, c, tr, n]) => `
  <div class="esc-fila">
    <div class="m ot-dato">${v}<br><span style="opacity:.6">${tr}</span></div>
    <div class="t ${c}" style="max-width:none">${n} · Materia y no decoración</div>
  </div>`).join("");

/* ----------------------------------------------------------------- voces */
const VOCES = [
  ["editorial", "Editorial", "Bricolage Grotesque + Instrument Sans + JetBrains Mono",
   "Grotesca con carácter para display y humanista para leer. Bricolage trae opsz 12–96: el titular y el cuerpo son dibujos distintos de la misma letra."],
  ["industrial", "Industrial", "Archivo + Martian Mono",
   "Sans geométrica ancha, muy legible, con el dato en mono condensada. Para producto y venta entre empresas."],
  ["boticario", "Boticario", "Fraunces + Instrument Sans",
   "Serif de contraste alto. Los ejes SOFT y WONK de Fraunces activan alternates irregulares: son los remates y las colas de las referencias vintage."],
  ["cuaderno", "Cuaderno", "Schibsted Grotesk + Caveat",
   "Manuscrita solo para el acento, grotesca limpia para el resto. El acento a mano nunca lleva más de seis palabras."],
  ["terminal", "Terminal", "Recursive",
   "Todo monoespaciado, para paneles y herramientas internas. El eje CASL va de geométrico a manuscrito sin cambiar de fuente."],
  ["sistema", "Sistema", "system-ui",
   "Sin descargar nada. La red de respaldo cuando el peso importa más que el carácter."],
];
let vozActiva = "editorial";

function pintarVoces() {
  $("#listaVoces").innerHTML = VOCES.map(([id, n]) =>
    `<button data-v="${id}" aria-pressed="${id === vozActiva}">${n}</button>`).join("");
  $("#listaVoces").querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => { vozActiva = b.dataset.v; pintarVoces(); pintarMuestra(); }));
}

function pintarMuestra() {
  const [id, nombre, familias, desc] = VOCES.find(v => v[0] === vozActiva);
  const m = $("#muestraVoz");
  m.setAttribute("data-ot-voz", id);
  m.innerHTML = `
    <span class="ot-etiqueta etq">${familias}</span>
    <h3 class="ot-d1" style="margin:18px 0 14px">${nombre}: la forma sigue a la voz.</h3>
    <p class="ot-entradilla" style="color:rgba(237,241,246,.62);margin-bottom:22px">${desc}</p>
    <p class="ot-cuerpo" style="color:rgba(237,241,246,.78)">Cada voz define tres familias emparejadas: una para display, una para leer y una para el dato. Se aplica con <code>data-ot-voz="${id}"</code> en cualquier contenedor, y todo lo que hay dentro lo hereda.</p>
    <div style="display:flex;gap:22px;flex-wrap:wrap;margin-top:24px;align-items:baseline">
      <span class="ot-cifra" style="font-size:clamp(2rem,4vw,3.4rem)">2026</span>
      <span class="ot-dato" style="opacity:.65">ABCDEFGHIJ · abcdefghij · 0123456789</span>
    </div>
    ${id === "cuaderno" ? `<p class="ot-mano" style="font-size:1.9rem;margin-top:20px;color:#22D3EE">y el acento va a mano</p>` : ""}`;
  OceanTexto.eco(m);
  OceanTexto.atarViudas(m);
}
pintarVoces(); pintarMuestra();

/* ---------------------------------------------------------------- fondos */
// El cuarto valor marca los fondos claros: el texto encima cambia de color.
// Un fondo generado no sirve de nada si vuelve ilegible lo que lleva encima.
const FONDOS = [
  ["of-malla", "Malla", "Cuatro focos de color desenfocados"],
  ["of-aurora", "Aurora", "La malla, respirando"],
  ["of-reticula", "Retícula", "Cuadrícula con maestras cada cinco"],
  ["of-puntos", "Puntos", "Más ligera que la cuadrícula"],
  ["of-papel of-grano", "Papel", "Fibra por ruido de baja frecuencia", true],
  ["of-cono", "Cono", "Degradado cónico girando"],
  ["of-noche", "Noche", "Receta: malla + grano + viñeta"],
  ["of-campo", "Campo", "Receta: verde profundo con halo lima"],
  ["of-brasa", "Brasa", "Receta: negro cálido con foco naranja"],
  ["of-taller", "Taller", "Receta: papel claro con retícula tenue", true],
  ["of-malla of-malla--salvia", "Salvia", "La malla con paleta clara", true],
  ["of-malla of-malla--brasa of-grano", "Ascua", "Malla brasa con grano fuerte"],
];
$("#listaFondos").innerHTML = FONDOS.map(([c, n, d, claro]) => `
  <div class="fondo-demo ${c}" ${claro ? 'style="color:#141A22"' : ""}>
    <div style="text-align:center;padding:14px">
      <div class="ot-d3" style="margin-bottom:6px">${n}</div>
      <span style="opacity:${claro ? ".8" : ".7"}">${d}</span>
    </div>
  </div>`).join("");

/* --------------------------------------------- demostración de la regla */
const TAMANOS = [13, 20, 32, 52, 84];
$("#reglaDemo").innerHTML = TAMANOS.map(px => `
  <div style="display:flex;align-items:baseline;gap:18px;padding:10px 0;
              border-bottom:1px solid rgba(255,255,255,.06);flex-wrap:wrap">
    <span class="ot-dato" style="flex:none;width:120px;opacity:.55">${px} px</span>
    <span class="reg" data-px="${px}" style="font-size:${px}px;font-family:var(--ot-display);
      font-weight:700;line-height:1.05;flex:1;min-width:0">Materia</span>
    <span class="ot-dato reg-tr" style="flex:none;opacity:.55"></span>
  </div>`).join("");
document.querySelectorAll(".reg").forEach(el => {
  const tr = OceanTexto.trackingOptico(el);
  el.parentElement.querySelector(".reg-tr").textContent =
    (tr >= 0 ? "+" : "") + tr.toFixed(3) + " em";
});

/* ------------------------------------------------------------------ init */
OceanTexto.iniciar();
if (window.OceanMotion) OceanMotion.iniciar();
})();
