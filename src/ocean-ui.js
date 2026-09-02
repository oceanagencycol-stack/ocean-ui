/* =========================================================================
   OCEAN UI — componentes
   Elementos personalizados nativos. Sin framework, sin build, sin dependencias.
   Se usan como HTML normal: <ocean-isla>, <ocean-dial>, <ocean-tira>...

   Ingeniería inversa de las referencias:
   · isla   → Dynamic Island: un contenedor que cambia de forma y de contenido
              con una sola curva, y donde el texto entra desfasado del contorno.
   · dial   → Knob de smart home: arco SVG con marcas radiales, arrastre angular
              acumulado (sin saltos al cruzar el origen) y detentes con sonido.
   · tira   → display vertical del Knob de Work Louder: relleno que decrece,
              lista con selección tipo píldora, y modos que se suceden.
   · dock   → barra contextual flotante de visionOS / ORRISO.
   ========================================================================= */
(function () {
"use strict";

const M = window.OceanMotion;
const S = window.OceanSound || { reproducir() {}, };
const { Resorte, agregar, util } = M;

const css = (t) => { const s = new CSSStyleSheet(); s.replaceSync(t); return s; };
const soportaHojas = "adoptedStyleSheets" in Document.prototype;

function montarEstilo(raiz, hoja, texto) {
  if (soportaHojas) raiz.adoptedStyleSheets = [hoja];
  else { const st = document.createElement("style"); st.textContent = texto; raiz.appendChild(st); }
}

/* =========================================================== <ocean-isla> ===
   Atributos:
     estado   compacta | media | expandida
     icono    emoji o texto corto del lado izquierdo
     titulo   texto principal
     detalle  texto secundario (solo en media/expandida)
   Métodos: .mostrar({icono,titulo,detalle,estado,durante})
   Eventos: ocean:isla-cambio
*/
const ISLA_CSS = `
:host{display:block;--o-isla-bg:#000;--o-isla-tx:#fff;font-family:var(--o-sans,system-ui)}
.caja{margin-inline:auto;background:var(--o-isla-bg);color:var(--o-isla-tx);
  border-radius:var(--o-r-full,999px);overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 12px 40px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
  will-change:width,height,border-radius}
.fila{display:flex;align-items:center;gap:12px;width:100%;height:100%;
  padding:0 var(--pad,14px);opacity:var(--op,1)}
.ico{flex:none;display:grid;place-items:center;width:26px;height:26px;font-size:19px;line-height:1}
.tx{flex:1;min-width:0;overflow:hidden}
.tit{font-size:.86rem;font-weight:600;letter-spacing:-.01em;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.det{font-size:.72rem;opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.pulso{flex:none;width:8px;height:8px;border-radius:50%;background:var(--o-ok,#34D399)}
.pulso.late{animation:late 1.8s infinite}
@keyframes late{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
@media(prefers-reduced-motion:reduce){.pulso.late{animation:none}}
`;
const ISLA_HOJA = soportaHojas ? css(ISLA_CSS) : null;

class OceanIsla extends HTMLElement {
  static get observedAttributes() { return ["estado", "icono", "titulo", "detalle"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montarEstilo(r, ISLA_HOJA, ISLA_CSS);
    r.innerHTML += `<div class="caja"><div class="fila">
      <div class="ico"></div>
      <div class="tx"><div class="tit"></div><div class="det"></div></div>
      <div class="pulso late"></div></div></div>`;
    this.caja = r.querySelector(".caja");
    this.fila = r.querySelector(".fila");
    this._w = new Resorte({ desde: 132, rigidez: 210, amortiguacion: 24 });
    this._h = new Resorte({ desde: 34, rigidez: 210, amortiguacion: 24 });
    this._r = new Resorte({ desde: 17, rigidez: 210, amortiguacion: 24 });
    this._op = new Resorte({ desde: 0, rigidez: 260, amortiguacion: 30 });
    this._corriendo = false;
    this._tempo = null;
  }
  connectedCallback() {
    this.aplicar(this.getAttribute("estado") || "compacta", true);
    this.pintarContenido();
  }
  attributeChangedCallback(n) {
    if (!this.caja) return;
    if (n === "estado") this.aplicar(this.getAttribute("estado"));
    else this.pintarContenido();
  }
  get medidas() {
    return {
      compacta:  { w: 132, h: 34,  r: 17, op: 0 },
      media:     { w: 300, h: 46,  r: 23, op: 1 },
      expandida: { w: 372, h: 78,  r: 26, op: 1 },
    };
  }
  aplicar(estado, inmediato) {
    const m = this.medidas[estado] || this.medidas.compacta;
    if (inmediato || M.reducido) {
      this._w.saltar(m.w); this._h.saltar(m.h); this._r.saltar(m.r); this._op.saltar(m.op);
      this.pintar();
    } else {
      this._w.a(m.w); this._h.a(m.h); this._r.a(m.r); this._op.a(m.op);
      this.correr();
      S.reproducir("morph");
    }
    this.dispatchEvent(new CustomEvent("ocean:isla-cambio", { bubbles: true, detail: { estado } }));
  }
  correr() {
    if (this._corriendo) return;
    this._corriendo = true;
    agregar(dt => {
      this._w.paso(dt); this._h.paso(dt); this._r.paso(dt); this._op.paso(dt);
      this.pintar();
      if (this._w.quieto && this._h.quieto && this._op.quieto) { this._corriendo = false; return false; }
    });
  }
  pintar() {
    this.caja.style.width = this._w.v.toFixed(1) + "px";
    this.caja.style.height = this._h.v.toFixed(1) + "px";
    this.caja.style.borderRadius = this._r.v.toFixed(1) + "px";
    // el contenido entra después del contorno: eso es lo que da la sensación de material
    this.fila.style.setProperty("--op", util.limitar((this._op.v - 0.25) / 0.75, 0, 1).toFixed(3));
    this.fila.style.setProperty("--pad", (10 + this._op.v * 8).toFixed(1) + "px");
  }
  pintarContenido() {
    const r = this.shadowRoot;
    r.querySelector(".ico").textContent = this.getAttribute("icono") || "";
    r.querySelector(".tit").textContent = this.getAttribute("titulo") || "";
    const d = this.getAttribute("detalle") || "";
    r.querySelector(".det").textContent = d;
    r.querySelector(".det").style.display = d ? "" : "none";
  }
  /** Muestra un aviso y vuelve sola al estado compacto. */
  mostrar({ icono = "", titulo = "", detalle = "", estado = "media", durante = 2600 } = {}) {
    clearTimeout(this._tempo);
    if (icono) this.setAttribute("icono", icono);
    this.setAttribute("titulo", titulo);
    detalle ? this.setAttribute("detalle", detalle) : this.removeAttribute("detalle");
    this.setAttribute("estado", estado);
    if (durante) this._tempo = setTimeout(() => this.setAttribute("estado", "compacta"), durante);
    return this;
  }
}
customElements.define("ocean-isla", OceanIsla);

/* =========================================================== <ocean-dial> ===
   Atributos: valor, min, max, paso, etiqueta, unidad, muescas, color, color2
   Interacción: arrastre angular, rueda, flechas, Inicio/Fin.
   Evento: ocean:cambio {valor}
*/
const DIAL_CSS = `
:host{display:inline-block;--o-dial-tam:210px;--o-dial-grosor:13px;
  --o-dial-color:var(--o-acento,#3B82F6);--o-dial-color2:var(--o-acento-2,#22D3EE);
  --o-dial-pista:rgba(128,128,128,.20);font-family:var(--o-sans,system-ui)}
.env{position:relative;width:var(--o-dial-tam);height:var(--o-dial-tam);
  touch-action:none;cursor:grab;user-select:none}
.env:active{cursor:grabbing}
svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;
  transform:rotate(135deg)}
.pista{fill:none;stroke:var(--o-dial-pista);stroke-linecap:round}
.arco{fill:none;stroke:url(#g);stroke-linecap:round;
  transition:stroke-dashoffset var(--o-t-inst,120ms) linear;
  filter:drop-shadow(0 0 12px color-mix(in srgb, var(--o-dial-color) 45%, transparent))}
.muescas line{stroke:var(--o-dial-pista);stroke-width:2;stroke-linecap:round}
.muescas line.on{stroke:var(--o-dial-color)}
.centro{position:absolute;inset:var(--o-dial-grosor);border-radius:50%;
  display:grid;place-items:center;text-align:center;pointer-events:none}
.val{font-size:calc(var(--o-dial-tam)*.20);font-weight:600;letter-spacing:-.04em;
  font-variant-numeric:tabular-nums;line-height:1;color:var(--o-texto,#0A0E14)}
.uni{font-size:calc(var(--o-dial-tam)*.062);opacity:.5;margin-top:6px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--o-texto,#0A0E14)}
.eti{font-size:calc(var(--o-dial-tam)*.062);opacity:.75;margin-top:2px;color:var(--o-texto,#0A0E14)}
.mango{position:absolute;width:calc(var(--o-dial-grosor) * 1.55);aspect-ratio:1;border-radius:50%;
  background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.34);left:50%;top:50%;
  transform-origin:center;pointer-events:none}
:host(:focus-visible) .env{outline:2px solid var(--o-dial-color);outline-offset:6px;border-radius:50%}
`;
const DIAL_HOJA = soportaHojas ? css(DIAL_CSS) : null;

class OceanDial extends HTMLElement {
  static get observedAttributes() { return ["valor", "min", "max", "etiqueta", "unidad", "color", "color2"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montarEstilo(r, DIAL_HOJA, DIAL_CSS);
    r.innerHTML += `<div class="env">
      <svg viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--o-dial-color)"/>
        <stop offset="1" stop-color="var(--o-dial-color2)"/></linearGradient></defs>
        <circle class="pista" cx="50" cy="50" r="42"/>
        <circle class="arco"  cx="50" cy="50" r="42"/>
        <g class="muescas"></g></svg>
      <div class="mango"></div>
      <div class="centro"><div><div class="val"></div><div class="uni"></div><div class="eti"></div></div></div>
    </div>`;
    this._s = new Resorte({ rigidez: 240, amortiguacion: 26 });
    this._corriendo = false;
    this._ultimaMuesca = null;
  }
  get min()  { return parseFloat(this.getAttribute("min") ?? 0); }
  get max()  { return parseFloat(this.getAttribute("max") ?? 100); }
  get paso() { return parseFloat(this.getAttribute("paso") ?? 1); }
  get valor(){ return parseFloat(this.getAttribute("valor") ?? this.min); }
  set valor(v) {
    const c = util.limitar(Math.round(v / this.paso) * this.paso, this.min, this.max);
    if (c === this.valor) return;
    this.setAttribute("valor", c);
    this.dispatchEvent(new CustomEvent("ocean:cambio", { bubbles: true, detail: { valor: c } }));
  }
  connectedCallback() {
    this.tabIndex = 0;
    this.setAttribute("role", "slider");
    this.dibujarMuescas();
    this._s.saltar(this.norma);
    this.pintar();
    this.conectar();
  }
  attributeChangedCallback(n) {
    if (!this.shadowRoot.querySelector(".arco")) return;
    if (n === "color")  this.style.setProperty("--o-dial-color", this.getAttribute("color"));
    if (n === "color2") this.style.setProperty("--o-dial-color2", this.getAttribute("color2"));
    if (n === "valor") { this._s.a(this.norma); this.correr(); }
    this.pintarTexto();
  }
  get norma() { return (this.valor - this.min) / (this.max - this.min || 1); }

  dibujarMuescas() {
    const n = parseInt(this.getAttribute("muescas") || "0", 10);
    const g = this.shadowRoot.querySelector(".muescas");
    if (!n) { g.innerHTML = ""; return; }
    let out = "";
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * 270 * Math.PI / 180;          // arco de 270°
      const x1 = 50 + Math.cos(a) * 47, y1 = 50 + Math.sin(a) * 47;
      const x2 = 50 + Math.cos(a) * 50.5, y2 = 50 + Math.sin(a) * 50.5;
      out += `<line data-i="${i}" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
    }
    g.innerHTML = out;
  }
  pintar() {
    const p = this._s.v;
    const arco = this.shadowRoot.querySelector(".arco");
    const C = 2 * Math.PI * 42;
    const util270 = C * 0.75;                            // solo usamos 3/4 de la circunferencia
    arco.style.strokeWidth = getComputedStyle(this).getPropertyValue("--o-dial-grosor") || "13";
    this.shadowRoot.querySelector(".pista").style.strokeWidth = arco.style.strokeWidth;
    arco.setAttribute("stroke-dasharray", `${util270} ${C}`);
    arco.setAttribute("stroke-dashoffset", (util270 * (1 - p)).toFixed(2));
    this.shadowRoot.querySelector(".pista").setAttribute("stroke-dasharray", `${util270} ${C}`);

    const ang = 135 + p * 270;
    const radio = `calc(var(--o-dial-tam) / 2 - var(--o-dial-grosor) / 2)`;
    this.shadowRoot.querySelector(".mango").style.transform =
      `translate(-50%,-50%) rotate(${ang}deg) translate(${radio}) rotate(${-ang}deg)`;

    const n = parseInt(this.getAttribute("muescas") || "0", 10);
    if (n) this.shadowRoot.querySelectorAll(".muescas line")
      .forEach(l => l.classList.toggle("on", (+l.dataset.i / n) <= p + 0.001));
    this.pintarTexto();
  }
  pintarTexto() {
    const r = this.shadowRoot;
    if (!r.querySelector(".val")) return;
    r.querySelector(".val").textContent = this.valor;
    r.querySelector(".uni").textContent = this.getAttribute("unidad") || "";
    r.querySelector(".eti").textContent = this.getAttribute("etiqueta") || "";
    this.setAttribute("aria-valuenow", this.valor);
    this.setAttribute("aria-valuemin", this.min);
    this.setAttribute("aria-valuemax", this.max);
    this.setAttribute("aria-label", this.getAttribute("etiqueta") || "dial");
  }
  correr() {
    if (this._corriendo) return;
    this._corriendo = true;
    agregar(dt => {
      this._s.paso(dt); this.pintar();
      if (this._s.quieto) { this._corriendo = false; return false; }
    });
  }
  conectar() {
    const env = this.shadowRoot.querySelector(".env");
    let arrastrando = false, angPrevio = 0, acumulado = 0;

    const angulo = e => {
      const r = env.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      return Math.atan2(dy, dx) * 180 / Math.PI;
    };
    env.addEventListener("pointerdown", e => {
      arrastrando = true; env.setPointerCapture(e.pointerId);
      angPrevio = angulo(e); acumulado = this.norma * 270;
      S.reproducir("toque");
    });
    env.addEventListener("pointermove", e => {
      if (!arrastrando) return;
      const a = angulo(e);
      let d = a - angPrevio;
      if (d > 180) d -= 360; if (d < -180) d += 360;   // sin salto al cruzar el origen
      angPrevio = a;
      acumulado = util.limitar(acumulado + d, 0, 270);
      const nuevo = this.min + (acumulado / 270) * (this.max - this.min);
      const antes = this.valor;
      this.valor = nuevo;
      if (this.valor !== antes) { S.reproducir("muesca"); util.vibrar(4); }
    });
    const soltar = () => { if (arrastrando) { arrastrando = false; S.reproducir("roce"); } };
    env.addEventListener("pointerup", soltar);
    env.addEventListener("pointercancel", soltar);
    const rueda = e => {
      e.preventDefault();
      this.valor = this.valor + (e.deltaY < 0 ? this.paso : -this.paso);
      S.reproducir("muesca");
    };
    env.addEventListener("wheel", rueda, { passive: false });
    this.addEventListener("wheel", rueda, { passive: false });
    this.addEventListener("keydown", e => {
      const g = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (g) { e.preventDefault(); this.valor = this.valor + g * this.paso; S.reproducir("muesca"); }
      if (e.key === "Home") { e.preventDefault(); this.valor = this.min; }
      if (e.key === "End")  { e.preventDefault(); this.valor = this.max; }
    });
  }
}
customElements.define("ocean-dial", OceanDial);

/* =========================================================== <ocean-tira> ===
   El display vertical del Knob. Tres modos:
     modo="nivel"  → relleno proporcional con degradado
     modo="lista"  → opciones con selección tipo píldora (atributo opciones="a,b,c")
     modo="tiempo" → cuenta atrás; el relleno decrece y el número marca el resto
   Métodos: .iniciar(segundos) .detener()
   Evento: ocean:tira-fin
*/
const TIRA_CSS = `
:host{display:inline-block;--o-tira-an:96px;--o-tira-al:300px;
  --o-tira-a:#FF6B1A;--o-tira-b:#FFD9BF;font-family:var(--o-sans,system-ui)}
.env{position:relative;width:var(--o-tira-an);height:var(--o-tira-al);background:#000;
  border-radius:calc(var(--o-tira-an)*.30);overflow:hidden;color:#fff;
  box-shadow:0 16px 46px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.08);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:14px 10px;gap:8px;user-select:none}
.relleno{position:absolute;left:6px;right:6px;bottom:6px;
  background:linear-gradient(180deg,var(--o-tira-a),var(--o-tira-b));
  border-radius:calc(var(--o-tira-an)*.26);will-change:height}
.capa{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;
  align-items:center;gap:8px}
.ico{font-size:26px;line-height:1}
.op{font-size:.88rem;font-weight:500;padding:5px 14px;border-radius:999px;
  transition:background var(--o-t-rapido,220ms) var(--o-ease,ease),color var(--o-t-rapido) ease;
  font-variant-numeric:tabular-nums}
.op[aria-selected=true]{background:var(--o-tira-a);color:#111;font-weight:600}
.num{font-size:1.5rem;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.03em;
  position:absolute;bottom:14px;left:0;right:0;text-align:center;z-index:3;
  text-shadow:0 2px 10px rgba(0,0,0,.5)}
.pie{position:absolute;bottom:12px;left:0;right:0;text-align:center;z-index:3;
  font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;opacity:.55}
`;
const TIRA_HOJA = soportaHojas ? css(TIRA_CSS) : null;

class OceanTira extends HTMLElement {
  static get observedAttributes() { return ["modo", "valor", "opciones", "icono", "pie"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montarEstilo(r, TIRA_HOJA, TIRA_CSS);
    r.innerHTML += `<div class="env"><div class="relleno"></div>
      <div class="capa"><div class="ico"></div><div class="ops"></div></div>
      <div class="num"></div><div class="pie"></div></div>`;
    this._s = new Resorte({ rigidez: 180, amortiguacion: 24 });
    this._corriendo = false; this._t = null; this._resto = 0; this._total = 0;
  }
  connectedCallback() { this.pintarTodo(); }
  attributeChangedCallback() { if (this.shadowRoot.querySelector(".env")) this.pintarTodo(); }
  get modo() { return this.getAttribute("modo") || "nivel"; }

  pintarTodo() {
    const r = this.shadowRoot;
    r.querySelector(".ico").textContent = this.getAttribute("icono") || "";
    r.querySelector(".pie").textContent = this.getAttribute("pie") || "";
    const ops = r.querySelector(".ops");
    if (this.modo === "lista") {
      const lista = (this.getAttribute("opciones") || "").split(",").map(s => s.trim()).filter(Boolean);
      const sel = this.getAttribute("valor");
      ops.innerHTML = lista.map(o =>
        `<div class="op" role="option" aria-selected="${String(o === sel)}">${o}</div>`).join("");
      ops.style.display = "flex"; ops.style.flexDirection = "column";
      ops.style.alignItems = "center"; ops.style.gap = "3px";
      this._s.a(0);
    } else if (this.modo === "nivel") {
      ops.innerHTML = "";
      this._s.a(util.limitar(parseFloat(this.getAttribute("valor") || 0) / 100, 0, 1));
    }
    r.querySelector(".num").textContent =
      (this.modo === "tiempo" && this._total) ? this.formato(this._resto) : "";
    this.correr();
  }
  formato(s) {
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  }
  correr() {
    if (this._corriendo) return;
    this._corriendo = true;
    agregar(dt => {
      this._s.paso(dt);
      const rel = this.shadowRoot.querySelector(".relleno");
      rel.style.height = `calc((100% - 12px) * ${this._s.v.toFixed(4)})`;
      rel.style.opacity = this._s.v > 0.005 ? 1 : 0;
      if (this._s.quieto) { this._corriendo = false; return false; }
    });
  }
  /** Cuenta atrás: el relleno decrece y suena un tic por segundo. */
  iniciar(segundos) {
    this.setAttribute("modo", "tiempo");
    this._total = this._resto = segundos;
    clearInterval(this._t);
    this._s.saltar(1); this.correr();
    S.reproducir("abrir");
    const t0 = performance.now();
    let ultimoSeg = segundos;
    this._t = setInterval(() => {
      this._resto = Math.max(0, this._total - (performance.now() - t0) / 1000);
      this._s.a(this._resto / this._total);
      this.correr();
      this.shadowRoot.querySelector(".num").textContent = this.formato(this._resto);
      const seg = Math.ceil(this._resto);
      if (seg !== ultimoSeg) { ultimoSeg = seg; if (seg > 0 && seg <= 5) S.reproducir("tic"); }
      if (this._resto <= 0) {
        clearInterval(this._t); S.reproducir("bien"); util.vibrar([16, 60, 16]);
        this.dispatchEvent(new CustomEvent("ocean:tira-fin", { bubbles: true }));
      }
    }, 60);
    return this;
  }
  detener() { clearInterval(this._t); this._s.a(0); this.correr(); S.reproducir("cerrar"); return this; }
}
customElements.define("ocean-tira", OceanTira);

/* =========================================================== <ocean-dock> ===
   Barra contextual flotante con indicador que se desliza al elemento activo.
   Hijos: <button data-v="clave">Etiqueta</button>
   Evento: ocean:dock {valor}
*/
const DOCK_CSS = `
:host{display:inline-block;font-family:var(--o-sans,system-ui)}
.env{position:relative;display:flex;gap:2px;padding:5px;border-radius:999px;
  background:rgba(var(--o-glass-tinte,255,255,255), var(--o-glass-op,.10));
  backdrop-filter:blur(var(--o-glass-blur,26px)) saturate(var(--o-glass-sat,1.7));
  -webkit-backdrop-filter:blur(26px) saturate(1.7);
  border:1px solid var(--o-glass-borde,rgba(255,255,255,.22));
  box-shadow:var(--o-e3,0 10px 24px rgba(0,0,0,.10))}
.ind{position:absolute;top:5px;bottom:5px;border-radius:999px;
  background:var(--o-dock-ind,rgba(255,255,255,.92));z-index:0;
  box-shadow:0 2px 10px rgba(0,0,0,.16);will-change:transform,width}
::slotted(button){position:relative;z-index:1;border:0;background:none;cursor:pointer;
  padding:9px 17px;border-radius:999px;font:inherit;font-size:.86rem;font-weight:500;
  color:inherit;opacity:.68;transition:opacity var(--o-t-rapido,220ms) ease,color .2s ease;
  white-space:nowrap}
::slotted(button[aria-pressed=true]){opacity:1;color:var(--o-dock-tx,#0A0E14);font-weight:600}
`;
const DOCK_HOJA = soportaHojas ? css(DOCK_CSS) : null;

class OceanDock extends HTMLElement {
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montarEstilo(r, DOCK_HOJA, DOCK_CSS);
    r.innerHTML += `<div class="env"><div class="ind"></div><slot></slot></div>`;
    this._x = new Resorte({ rigidez: 250, amortiguacion: 26 });
    this._w = new Resorte({ rigidez: 250, amortiguacion: 26 });
    this._corriendo = false;
  }
  connectedCallback() {
    const bs = () => [...this.querySelectorAll("button")];
    this.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      bs().forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      this.mover(b, false);
      S.reproducir("toque");
      this.dispatchEvent(new CustomEvent("ocean:dock", { bubbles: true, detail: { valor: b.dataset.v } }));
    });
    requestAnimationFrame(() => {
      const act = this.querySelector("button[aria-pressed=true]") || bs()[0];
      if (act) { act.setAttribute("aria-pressed", "true"); this.mover(act, true); }
    });
    addEventListener("resize", () => {
      const act = this.querySelector("button[aria-pressed=true]");
      if (act) this.mover(act, true);
    }, { passive: true });
  }
  mover(b, inmediato) {
    const re = this.shadowRoot.querySelector(".env").getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const x = rb.left - re.left, w = rb.width;
    if (inmediato || M.reducido) { this._x.saltar(x); this._w.saltar(w); this.pintar(); }
    else { this._x.a(x); this._w.a(w); this.correr(); }
  }
  pintar() {
    const i = this.shadowRoot.querySelector(".ind");
    i.style.transform = `translateX(${this._x.v.toFixed(2)}px)`;
    i.style.width = this._w.v.toFixed(2) + "px";
  }
  correr() {
    if (this._corriendo) return;
    this._corriendo = true;
    agregar(dt => {
      this._x.paso(dt); this._w.paso(dt); this.pintar();
      if (this._x.quieto && this._w.quieto) { this._corriendo = false; return false; }
    });
  }
}
customElements.define("ocean-dock", OceanDock);

/* ========================================================= <ocean-toggle> === */
const TOG_CSS = `
:host{display:inline-block;font-family:var(--o-sans,system-ui)}
.env{width:56px;height:32px;border-radius:999px;background:rgba(128,128,128,.28);
  position:relative;cursor:pointer;transition:background var(--o-t-medio,380ms) var(--o-ease,ease);
  border:1px solid rgba(255,255,255,.14)}
:host([activo]) .env{background:var(--o-acento,#3B82F6)}
.bola{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;
  box-shadow:0 2px 8px rgba(0,0,0,.28);will-change:transform,width}
:host(:focus-visible) .env{outline:2px solid var(--o-acento,#3B82F6);outline-offset:3px}
`;
const TOG_HOJA = soportaHojas ? css(TOG_CSS) : null;

class OceanToggle extends HTMLElement {
  static get observedAttributes() { return ["activo"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montarEstilo(r, TOG_HOJA, TOG_CSS);
    r.innerHTML += `<div class="env"><div class="bola"></div></div>`;
    this._s = new Resorte({ rigidez: 320, amortiguacion: 24 });
    this._e = new Resorte({ desde: 24, rigidez: 320, amortiguacion: 22 }); // estirón al moverse
    this._corriendo = false;
  }
  connectedCallback() {
    this.tabIndex = 0; this.setAttribute("role", "switch");
    this._s.saltar(this.hasAttribute("activo") ? 1 : 0); this.pintar();
    const alternar = () => {
      this.toggleAttribute("activo");
      S.reproducir(this.hasAttribute("activo") ? "abrir" : "cerrar");
      util.vibrar(6);
      this.dispatchEvent(new CustomEvent("ocean:cambio", { bubbles: true, detail: { activo: this.hasAttribute("activo") } }));
    };
    this.addEventListener("click", alternar);
    this.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); alternar(); } });
  }
  attributeChangedCallback() {
    if (!this.shadowRoot.querySelector(".bola")) return;
    this.setAttribute("aria-checked", String(this.hasAttribute("activo")));
    this._s.a(this.hasAttribute("activo") ? 1 : 0);
    this._e.saltar(31); this._e.a(24);            // la bola se estira y vuelve
    this.correr();
  }
  pintar() {
    const b = this.shadowRoot.querySelector(".bola");
    const ancho = this._e.v;
    b.style.width = ancho.toFixed(1) + "px";
    b.style.transform = `translateX(${(this._s.v * (56 - 6 - ancho)).toFixed(2)}px)`;
  }
  correr() {
    if (this._corriendo) return;
    this._corriendo = true;
    agregar(dt => {
      this._s.paso(dt); this._e.paso(dt); this.pintar();
      if (this._s.quieto && this._e.quieto) { this._corriendo = false; return false; }
    });
  }
}
customElements.define("ocean-toggle", OceanToggle);

/* ======================================================= <ocean-barra> ======
   Deslizador lineal con relleno degradado y sonido ligado al valor.        */
const BARRA_CSS = `
:host{display:block;font-family:var(--o-sans,system-ui);--o-barra-al:8px}
.env{position:relative;height:26px;display:flex;align-items:center;cursor:pointer;touch-action:none}
.pista{position:absolute;left:0;right:0;height:var(--o-barra-al);border-radius:999px;
  background:rgba(128,128,128,.22)}
.relleno{position:absolute;left:0;height:var(--o-barra-al);border-radius:999px;
  background:linear-gradient(90deg,var(--o-acento,#3B82F6),var(--o-acento-2,#22D3EE));will-change:width}
.mango{position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;
  box-shadow:0 2px 10px rgba(0,0,0,.3);will-change:transform;transform:translateX(-50%)}
:host(:focus-visible) .env{outline:2px solid var(--o-acento,#3B82F6);outline-offset:5px;border-radius:999px}
`;
const BARRA_HOJA = soportaHojas ? css(BARRA_CSS) : null;

class OceanBarra extends HTMLElement {
  static get observedAttributes() { return ["valor"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montarEstilo(r, BARRA_HOJA, BARRA_CSS);
    r.innerHTML += `<div class="env"><div class="pista"></div><div class="relleno"></div><div class="mango"></div></div>`;
    this._s = new Resorte({ rigidez: 300, amortiguacion: 28 });
    this._corriendo = false;
  }
  get min() { return parseFloat(this.getAttribute("min") ?? 0); }
  get max() { return parseFloat(this.getAttribute("max") ?? 100); }
  get paso(){ return parseFloat(this.getAttribute("paso") ?? 1); }
  get valor(){ return parseFloat(this.getAttribute("valor") ?? this.min); }
  set valor(v) {
    const c = util.limitar(Math.round(v / this.paso) * this.paso, this.min, this.max);
    if (c === this.valor) return;
    this.setAttribute("valor", c);
    this.dispatchEvent(new CustomEvent("ocean:cambio", { bubbles: true, detail: { valor: c } }));
  }
  connectedCallback() {
    this.tabIndex = 0; this.setAttribute("role", "slider");
    this._s.saltar(this.norma); this.pintar();
    const env = this.shadowRoot.querySelector(".env");
    let arr = false;
    const set = e => {
      const r = env.getBoundingClientRect();
      const antes = this.valor;
      this.valor = this.min + util.limitar((e.clientX - r.left) / r.width, 0, 1) * (this.max - this.min);
      if (this.valor !== antes) S.reproducir("desliz", this.norma);
    };
    env.addEventListener("pointerdown", e => { arr = true; env.setPointerCapture(e.pointerId); set(e); });
    env.addEventListener("pointermove", e => arr && set(e));
    env.addEventListener("pointerup", () => arr = false);
    this.addEventListener("keydown", e => {
      const g = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (g) { e.preventDefault(); this.valor = this.valor + g * this.paso; S.reproducir("muesca"); }
    });
  }
  get norma() { return (this.valor - this.min) / (this.max - this.min || 1); }
  attributeChangedCallback() {
    if (!this.shadowRoot.querySelector(".relleno")) return;
    this.setAttribute("aria-valuenow", this.valor);
    this._s.a(this.norma); this.correr();
  }
  pintar() {
    const p = this._s.v;
    this.shadowRoot.querySelector(".relleno").style.width = (p * 100).toFixed(2) + "%";
    this.shadowRoot.querySelector(".mango").style.left = (p * 100).toFixed(2) + "%";
  }
  correr() {
    if (this._corriendo) return;
    this._corriendo = true;
    agregar(dt => { this._s.paso(dt); this.pintar(); if (this._s.quieto) { this._corriendo = false; return false; } });
  }
}
customElements.define("ocean-barra", OceanBarra);

/* -------------------------------------------------------------------- init */
function iniciar(raiz = document) {
  M.iniciar(raiz);
  if (window.OceanSound) window.OceanSound.conectar(raiz);
}
window.OceanUI = { iniciar, OceanIsla, OceanDial, OceanTira, OceanDock, OceanToggle, OceanBarra };
})();
