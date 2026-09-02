/* =========================================================================
   OCEAN TEXTO
   Lo que el CSS todavía no puede hacer solo con tipografía.
   ========================================================================= */
(function (global) {
"use strict";

const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
let contador = 0;

/* -------------------------------------------------------------------- arco
   Texto sobre una curva, con SVG y textPath. El truco está en calcular el
   viewBox a partir del radio y el ángulo, no a ojo: si no, el texto se
   recorta o queda con aire de sobra arriba.

   Uso:  <h2 data-ot-arco="180" data-ot-radio="220">Texto en curva</h2>
         o  OceanTexto.arco(el, { grados: 180, radio: 220, abajo: false })
*/
function arco(el, { grados, radio, abajo = false, clase = "" } = {}) {
  const txt = (el.dataset.otTexto || el.textContent || "").trim();
  if (!txt) return el;
  el.dataset.otTexto = txt;

  const g = grados ?? parseFloat(el.dataset.otArco) ?? 140;
  const r = radio ?? parseFloat(el.dataset.otRadio) ?? 200;
  const id = "ot-arco-" + (++contador);

  // El arco se dibuja centrado arriba (o abajo). Se calcula el cuadro real
  // que ocupa la curva para que el SVG no lleve espacio muerto.
  const rad = (g * Math.PI) / 180;
  const mitad = rad / 2;
  const ancho = 2 * r * Math.sin(Math.min(mitad, Math.PI / 2));
  const flecha = r * (1 - Math.cos(Math.min(mitad, Math.PI / 2)));
  const pad = r * 0.28;                      // aire para el cuerpo de la letra
  const W = ancho + pad, H = flecha + pad;

  const x0 = (W - ancho) / 2, x1 = x0 + ancho;
  const y0 = abajo ? pad * 0.35 : H - pad * 0.35;
  const barrido = abajo ? 0 : 1;
  const d = `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0 ${barrido} ${x1.toFixed(2)},${y0.toFixed(2)}`;

  const estilo = getComputedStyle(el);
  el.innerHTML =
    `<svg class="ot-arco-svg ${clase}" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}"
        style="width:100%;height:auto;overflow:visible;display:block" aria-hidden="true">
       <defs><path id="${id}" d="${d}" fill="none"/></defs>
       <text style="font:inherit;fill:currentColor;letter-spacing:inherit">
         <textPath href="#${id}" startOffset="50%" text-anchor="middle">${txt}</textPath>
       </text>
     </svg><span class="o-solo-lectores">${txt}</span>`;
  el.style.lineHeight = estilo.lineHeight;
  return el;
}

/* ------------------------------------------------------------- por letras
   Divide en <span> por letra conservando palabras (para que no se rompa el
   salto de línea) y expone --i por letra y --p (palabra).
   Con esto se animan entradas letra a letra desde CSS.
*/
function porLetras(el, { conservarEspacios = true } = {}) {
  const txt = (el.dataset.otTexto || el.textContent || "");
  el.dataset.otTexto = txt;
  const palabras = txt.split(" ");
  let n = 0;
  el.innerHTML = palabras.map((pal, p) => {
    const letras = [...pal].map(c => `<span class="ot-l" style="--i:${n++}">${c}</span>`).join("");
    return `<span class="ot-p" style="--p:${p};display:inline-block;white-space:nowrap">${letras}</span>`;
  }).join(conservarEspacios ? " " : "");
  el.setAttribute("aria-label", txt);
  el.style.setProperty("--n", n);
  return el;
}

/* ---------------------------------------------------------------- viudas
   Ata la última palabra a la penúltima con un espacio duro. Evita la línea
   huérfana de una sola palabra, que en un titular grande se ve como un error.
   `text-wrap: balance` ayuda pero no lo garantiza en párrafos largos.
*/
function atarViudas(raiz = document, { minPalabras = 4 } = {}) {
  raiz.querySelectorAll("[data-ot-viudas], .ot-d1, .ot-d2, .ot-d3, .ot-portada, .ot-entradilla")
    .forEach(el => {
      if (el.children.length) return;                 // no tocar si hay marcado dentro
      const t = el.textContent.trim();
      const p = t.split(/\s+/);
      if (p.length < minPalabras) return;
      el.textContent = "";
      el.insertAdjacentHTML("beforeend",
        p.slice(0, -1).join(" ") + "\u00A0" + p[p.length - 1]);
    });
}

/* --------------------------------------------------------- tracking óptico
   Aplica la regla real —a más tamaño, menos tracking— a cualquier elemento,
   midiendo su font-size renderizado. Sirve para texto cuyo tamaño no viene
   de la escala (por ejemplo, texto que se ajusta al ancho del contenedor).

   La curva: de +0.08em a 12px hasta -0.05em a 120px, interpolada en log.
*/
function trackingOptico(el) {
  const px = parseFloat(getComputedStyle(el).fontSize);
  const t = Math.min(1, Math.max(0, (Math.log(px) - Math.log(12)) / (Math.log(120) - Math.log(12))));
  const tr = 0.08 + (-0.05 - 0.08) * t;
  el.style.letterSpacing = tr.toFixed(4) + "em";
  return tr;
}

/* ------------------------------------------------------------- ajustar
   Escala el texto hasta que llene el ancho del contenedor. Es el efecto de
   cartel de las referencias de fuente: una palabra ocupando toda la línea.
   Mide una sola vez por cambio de tamaño, no en cada rAF.
*/
function ajustar(el, { min = 12, max = 400, margen = 0.995 } = {}) {
  const padre = el.parentElement;
  if (!padre) return;
  // Se mide en una sola línea: si el texto puede envolverse, scrollWidth nunca
  // excede el contenedor y la búsqueda binaria se queda en el mínimo.
  el.style.whiteSpace = "nowrap";
  el.style.display = "inline-block";
  el.style.maxWidth = "none";
  const medir = () => {
    const cs = getComputedStyle(padre);
    const disponible = padre.clientWidth -
      parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (disponible <= 0) return;
    let lo = min, hi = max;
    for (let i = 0; i < 24; i++) {                    // búsqueda binaria
      const m = (lo + hi) / 2;
      el.style.fontSize = m + "px";
      (el.getBoundingClientRect().width <= disponible * margen) ? (lo = m) : (hi = m);
    }
    el.style.fontSize = lo.toFixed(2) + "px";
    trackingOptico(el);
  };
  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(padre);
  return () => ro.disconnect();
}

/* --------------------------------------------------- eco (texto fantasma)
   Copia el contenido al atributo que lee .ot-fantasma, para no repetirlo
   a mano en el HTML.
*/
function eco(raiz = document) {
  raiz.querySelectorAll(".ot-fantasma:not([data-ot-eco])").forEach(el => {
    el.dataset.otEco = el.textContent.trim();
  });
}

/* ------------------------------------------------------------------- init */
function iniciar(raiz = document) {
  eco(raiz);
  atarViudas(raiz);
  raiz.querySelectorAll("[data-ot-arco]").forEach(el => arco(el));
  raiz.querySelectorAll("[data-ot-letras]").forEach(el => porLetras(el));
  raiz.querySelectorAll("[data-ot-ajustar]").forEach(el => ajustar(el));
  raiz.querySelectorAll("[data-ot-optico]").forEach(el => trackingOptico(el));
}

global.OceanTexto = { arco, porLetras, atarViudas, trackingOptico, ajustar, eco, iniciar, reducido };
})(window);
