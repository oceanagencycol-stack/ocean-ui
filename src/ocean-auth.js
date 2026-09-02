/* =========================================================================
   OCEAN AUTH — acceso
   El login es el primer momento del producto y casi siempre el peor tratado.
   Aquí se trata como lo que es: una conversación corta donde el sistema
   responde a cada gesto.

   Máquina de estados explícita: reposo → escribiendo → verificando →
   (correcto | incorrecto) → reposo. Cada transición tiene forma, color y sonido.
   ========================================================================= */
(function () {
"use strict";

const M = window.OceanMotion;
const S = window.OceanSound || { reproducir() {} };
const { Resorte, agregar, util } = M;

const css = t => { const s = new CSSStyleSheet(); s.replaceSync(t); return s; };
const soportaHojas = "adoptedStyleSheets" in Document.prototype;
function montar(raiz, hoja, texto) {
  if (soportaHojas) raiz.adoptedStyleSheets = [hoja];
  else { const st = document.createElement("style"); st.textContent = texto; raiz.appendChild(st); }
}

/* ======================================================== <ocean-acceso> ====
   Formulario de acceso completo con rostro, estados y anuncio por isla.
   Atributos: titulo, subtitulo, boton
   Propiedad: .verificar = async ({usuario, clave}) => boolean | {ok, mensaje}
   Eventos: ocean:acceso-ok, ocean:acceso-error, ocean:acceso-estado
*/
const ACC_CSS = `
:host{display:block;font-family:var(--o-sans,system-ui);
  --oa-acento:var(--o-acento,#3B82F6);--oa-ok:var(--o-ok,#34D399);--oa-err:var(--o-error,#F87171);
  --oa-tx:var(--o-texto,#0A0E14);--oa-tx2:var(--o-texto-2,rgba(10,14,20,.6))}
.env{max-width:400px;margin-inline:auto;text-align:center;position:relative}
.rostro-zona{display:grid;place-items:center;margin-bottom:26px;position:relative}
.aro{position:absolute;width:150px;height:150px;border-radius:32%;
  border:1.5px solid color-mix(in srgb,var(--oa-acento) 40%,transparent);opacity:0;
  transition:opacity var(--o-t-medio,380ms) var(--o-ease,ease)}
:host([estado=verificando]) .aro{opacity:1;animation:pulsar 1.6s ease-in-out infinite}
@keyframes pulsar{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.1);opacity:.2}}
h2{margin:0 0 8px;font-size:1.5rem;font-weight:600;letter-spacing:-.03em;color:var(--oa-tx)}
.sub{margin:0 0 28px;color:var(--oa-tx2);font-size:.94rem}
.campos{display:flex;flex-direction:column;gap:12px;text-align:left}
.campo{position:relative}
.linea{position:relative}
.campo input{width:100%;padding:16px 16px 16px 46px;border-radius:14px;
  border:1.5px solid var(--o-linea-fuerte,rgba(128,128,128,.28));
  background:var(--oa-fondo,rgba(128,128,128,.07));color:var(--oa-tx);
  font-family:inherit;font-size:.97rem;transition:border-color var(--o-t-rapido,220ms) ease,
    background var(--o-t-rapido) ease, box-shadow var(--o-t-rapido) ease}
.campo input::placeholder{color:var(--oa-tx2)}
.campo input:focus{outline:none;border-color:var(--oa-acento);
  box-shadow:0 0 0 4px color-mix(in srgb,var(--oa-acento) 16%,transparent)}
.linea .ico{position:absolute;left:16px;top:50%;transform:translateY(-50%);
  color:var(--oa-tx2);font-size:16px;line-height:1;pointer-events:none;
  transition:color var(--o-t-rapido,220ms) ease}
.linea input:focus + .ico{color:var(--oa-acento)}
.linea .ojo{position:absolute;right:12px;top:50%;transform:translateY(-50%);
  border:0;background:none;cursor:pointer;color:var(--oa-tx2);padding:6px;font-size:15px;
  border-radius:8px}
.linea .ojo:hover{color:var(--oa-tx)}
:host([estado=incorrecto]) .campos{animation:sacudir .44s var(--o-ease-io,ease)}
@keyframes sacudir{0%,100%{transform:translateX(0)}18%{transform:translateX(-9px)}
  42%{transform:translateX(8px)}66%{transform:translateX(-5px)}86%{transform:translateX(3px)}}
:host([estado=incorrecto]) .campo input{border-color:var(--oa-err)}

/* fuerza de la clave: cuatro tramos, no una barra continua */
.fuerza{display:flex;gap:4px;margin-top:11px}
.fuerza i{flex:1;height:3px;border-radius:99px;background:rgba(128,128,128,.24);
  transition:background var(--o-t-medio,380ms) var(--o-ease,ease)}
.fuerza-tx{font-size:.74rem;color:var(--oa-tx2);margin-top:7px;text-align:right;
  min-height:1.1em;transition:color var(--o-t-rapido,220ms) ease}

.boton{width:100%;margin-top:22px;padding:16px 24px;border-radius:14px;border:0;
  background:var(--oa-acento);color:#fff;font:inherit;font-size:.98rem;font-weight:600;
  cursor:pointer;position:relative;overflow:hidden;min-height:54px;
  display:grid;place-items:center;
  transition:background var(--o-t-medio,380ms) var(--o-ease,ease),
             transform var(--o-t-rapido,220ms) var(--o-ease,ease),
             box-shadow var(--o-t-medio) var(--o-ease)}
.boton:hover:not(:disabled){transform:translateY(-2px);
  box-shadow:0 14px 34px color-mix(in srgb,var(--oa-acento) 42%,transparent)}
.boton:active:not(:disabled){transform:translateY(0) scale(.99)}
.boton:disabled{cursor:default;opacity:.9}
:host([estado=verificando]) .boton{background:color-mix(in srgb,var(--oa-acento) 62%,#000)}
:host([estado=correcto]) .boton{background:var(--oa-ok)}
:host([estado=incorrecto]) .boton{background:var(--oa-err)}
.boton .capa{grid-area:1/1;display:flex;align-items:center;justify-content:center;gap:9px;
  transition:opacity var(--o-t-rapido,220ms) var(--o-ease,ease),
             transform var(--o-t-rapido) var(--o-ease)}
.boton .capa[hidden]{display:flex;opacity:0;transform:translateY(8px);pointer-events:none}
.giro{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.35);
  border-top-color:#fff;animation:gir .8s linear infinite}
@keyframes gir{to{transform:rotate(360deg)}}
.marca{width:20px;height:20px}
.marca path{fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:26;stroke-dashoffset:26;animation:trazar .42s var(--o-ease,ease) forwards}
@keyframes trazar{to{stroke-dashoffset:0}}
.mensaje{margin-top:14px;min-height:1.2em;font-size:.86rem;color:var(--oa-tx2);
  transition:color var(--o-t-rapido,220ms) ease}
:host([estado=incorrecto]) .mensaje{color:var(--oa-err)}
:host([estado=correcto]) .mensaje{color:var(--oa-ok)}
.pie{margin-top:18px;font-size:.85rem;color:var(--oa-tx2)}
::slotted(a){color:var(--oa-acento);font-weight:500}
@media(prefers-reduced-motion:reduce){
  :host([estado=incorrecto]) .campos{animation:none}
  :host([estado=verificando]) .aro{animation:none}
  .giro{animation-duration:2.4s}
  .marca path{animation:none;stroke-dashoffset:0}}
`;
const ACC_HOJA = soportaHojas ? css(ACC_CSS) : null;

const FUERZA = [
  { min: 0, eti: "", color: "" },
  { min: 1, eti: "Muy débil", color: "var(--oa-err)" },
  { min: 2, eti: "Débil",     color: "var(--o-alerta,#FBBF24)" },
  { min: 3, eti: "Aceptable", color: "var(--o-alerta,#FBBF24)" },
  { min: 4, eti: "Fuerte",    color: "var(--oa-ok)" },
];

class OceanAcceso extends HTMLElement {
  static get observedAttributes() { return ["estado", "titulo", "subtitulo", "boton"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montar(r, ACC_HOJA, ACC_CSS);
    r.innerHTML += `<div class="env">
      <div class="rostro-zona"><span class="aro"></span>
        <ocean-rostro id="rostro" estado="reposo" tam="104px"></ocean-rostro></div>
      <h2></h2><p class="sub"></p>
      <form class="campos" novalidate>
        <div class="campo"><div class="linea">
          <input id="usuario" type="text" autocomplete="username" placeholder="Correo o usuario" required>
          <span class="ico">◍</span>
        </div></div>
        <div class="campo">
          <div class="linea">
            <input id="clave" type="password" autocomplete="current-password" placeholder="Contraseña" required>
            <span class="ico">◈</span>
            <button type="button" class="ojo" id="verClave" aria-label="Mostrar contraseña">◐</button>
          </div>
          <div class="fuerza"><i></i><i></i><i></i><i></i></div>
          <div class="fuerza-tx"></div>
        </div>
        <button class="boton" type="submit">
          <span class="capa" id="cEtiqueta"></span>
          <span class="capa" id="cGiro" hidden><span class="giro"></span> Verificando</span>
          <span class="capa" id="cOk" hidden>
            <svg class="marca" viewBox="0 0 24 24"><path d="M5 13l4.5 4.5L19 7"/></svg> Bienvenido</span>
        </button>
      </form>
      <p class="mensaje"></p>
      <p class="pie"><slot name="pie"></slot></p>
    </div>`;
  }

  connectedCallback() {
    if (!this.hasAttribute("estado")) this.setAttribute("estado", "reposo");
    this.pintarTextos();
    this.conectar();
  }
  attributeChangedCallback(n) {
    if (!this.shadowRoot.querySelector(".boton")) return;
    if (n === "estado") this.aplicarEstado();
    else this.pintarTextos();
  }
  get rostro() { return this.shadowRoot.querySelector("#rostro"); }
  get estado() { return this.getAttribute("estado"); }
  set estado(v) { this.setAttribute("estado", v); }

  pintarTextos() {
    const r = this.shadowRoot;
    r.querySelector("h2").textContent = this.getAttribute("titulo") || "Iniciar sesión";
    r.querySelector(".sub").textContent = this.getAttribute("subtitulo") || "";
    r.querySelector("#cEtiqueta").textContent = this.getAttribute("boton") || "Entrar";
  }

  aplicarEstado() {
    const e = this.estado, r = this.shadowRoot;
    const capa = (id, on) => { const c = r.querySelector(id); on ? c.removeAttribute("hidden") : c.setAttribute("hidden", ""); };
    capa("#cEtiqueta", e === "reposo" || e === "escribiendo" || e === "incorrecto");
    capa("#cGiro", e === "verificando");
    capa("#cOk", e === "correcto");
    r.querySelector(".boton").disabled = (e === "verificando" || e === "correcto");
    const ROSTRO = { reposo: "reposo", escribiendo: "mirando", verificando: "verificando",
                     correcto: "ok", incorrecto: "error" };
    this.rostro.setAttribute("estado", ROSTRO[e] || "reposo");
    this.dispatchEvent(new CustomEvent("ocean:acceso-estado", { bubbles: true, detail: { estado: e } }));
  }

  mensaje(txt) { this.shadowRoot.querySelector(".mensaje").textContent = txt || ""; }

  /* Fuerza de clave: cuatro criterios independientes, no una fórmula opaca.
     Se muestra en cuatro tramos porque una barra continua invita a
     conformarse con "casi lleno".                                        */
  calcularFuerza(v) {
    let n = 0;
    if (v.length >= 8) n++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) n++;
    if (/\d/.test(v)) n++;
    if (/[^\w\s]/.test(v)) n++;
    if (v.length >= 14) n = Math.min(4, n + 1);
    return v ? Math.max(1, n) : 0;
  }
  pintarFuerza(v) {
    const n = this.calcularFuerza(v);
    const f = FUERZA[n];
    this.shadowRoot.querySelectorAll(".fuerza i").forEach((i, k) => {
      i.style.background = k < n ? f.color : "rgba(128,128,128,.24)";
    });
    const t = this.shadowRoot.querySelector(".fuerza-tx");
    t.textContent = f.eti; t.style.color = f.color || "var(--oa-tx2)";
  }

  conectar() {
    const r = this.shadowRoot;
    const form = r.querySelector("form");
    const usuario = r.querySelector("#usuario");
    const clave = r.querySelector("#clave");

    [usuario, clave].forEach(i => {
      i.addEventListener("focus", () => { if (this.estado === "reposo" || this.estado === "incorrecto") this.estado = "escribiendo"; });
      i.addEventListener("input", () => { if (this.estado === "incorrecto") { this.estado = "escribiendo"; this.mensaje(""); } });
    });
    form.addEventListener("focusout", () => {
      setTimeout(() => {
        if (this.estado === "escribiendo" && !r.activeElement) this.estado = "reposo";
      }, 60);
    });
    // el rostro cierra los ojos mientras se escribe la contraseña
    clave.addEventListener("input", e => {
      this.pintarFuerza(e.target.value);
      if (this.estado === "escribiendo") this.rostro.setAttribute("estado", "verificando");
      clearTimeout(this._tEsc);
      this._tEsc = setTimeout(() => {
        if (this.estado === "escribiendo") this.rostro.setAttribute("estado", "mirando");
      }, 420);
    });
    r.querySelector("#verClave").addEventListener("click", () => {
      const ver = clave.type === "password";
      clave.type = ver ? "text" : "password";
      r.querySelector("#verClave").textContent = ver ? "◑" : "◐";
      r.querySelector("#verClave").setAttribute("aria-label", ver ? "Ocultar contraseña" : "Mostrar contraseña");
      S.reproducir("roce");
    });

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (this.estado === "verificando" || this.estado === "correcto") return;
      if (!usuario.value || !clave.value) {
        this.fallar("Complete los dos campos.");
        return;
      }
      this.estado = "verificando";
      this.mensaje("");
      S.reproducir("paso");
      // Sin verificador no se concede acceso. Un componente de login que
      // acepta por defecto es un agujero, no una comodidad.
      if (typeof this.verificar !== "function") {
        console.error("[ocean-acceso] Falta asignar .verificar — no se concede acceso.");
        this.fallar("Configuración incompleta: no hay verificador asignado.");
        return;
      }
      try {
        const res = await this.verificar({ usuario: usuario.value, clave: clave.value });
        const ok = res === true || (res && res.ok === true);
        if (ok) this.acertar(res && res.mensaje);
        else this.fallar((res && res.mensaje) || "Usuario o contraseña incorrectos.");
      } catch (err) {
        this.fallar("No pudimos conectar. Intente de nuevo.");
      }
    });
  }

  acertar(msg) {
    this.estado = "correcto";
    this.mensaje(msg || "Acceso concedido");
    S.reproducir("bien"); util.vibrar([12, 40, 12]);
    this.dispatchEvent(new CustomEvent("ocean:acceso-ok", { bubbles: true }));
  }
  fallar(msg) {
    this.estado = "incorrecto";
    this.mensaje(msg);
    S.reproducir("mal"); util.vibrar([28, 50, 28]);
    this.dispatchEvent(new CustomEvent("ocean:acceso-error", { bubbles: true, detail: { mensaje: msg } }));
  }
  reiniciar() {
    this.estado = "reposo"; this.mensaje("");
    this.shadowRoot.querySelector(".boton").disabled = false;
    return this;
  }
}
customElements.define("ocean-acceso", OceanAcceso);

/* ========================================================= <ocean-codigo> ===
   Celdas de código de verificación. Pega desde el portapapeles, borra hacia
   atrás correctamente y avanza sola. El detalle que casi nadie implementa:
   al pegar un código de 6 dígitos, se reparte entre las celdas.
   Atributos: largo, estado (reposo|correcto|incorrecto)
   Evento: ocean:codigo {valor, completo}
*/
const COD_CSS = `
:host{display:block;font-family:var(--o-sans,system-ui);
  --oc-acento:var(--o-acento,#3B82F6);--oc-ok:var(--o-ok,#34D399);--oc-err:var(--o-error,#F87171)}
.env{display:flex;gap:10px;justify-content:center}
input{width:52px;height:64px;text-align:center;font-size:1.5rem;font-weight:600;
  font-variant-numeric:tabular-nums;border-radius:14px;
  border:1.5px solid var(--o-linea-fuerte,rgba(128,128,128,.28));
  background:rgba(128,128,128,.07);color:var(--o-texto,#0A0E14);
  transition:border-color var(--o-t-rapido,220ms) ease, box-shadow var(--o-t-rapido) ease,
             transform var(--o-t-rapido) var(--o-ease-resorte,ease), background .2s}
input:focus{outline:none;border-color:var(--oc-acento);
  box-shadow:0 0 0 4px color-mix(in srgb,var(--oc-acento) 16%,transparent)}
input.lleno{border-color:var(--oc-acento);transform:scale(1.05)}
:host([estado=correcto]) input{border-color:var(--oc-ok);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--oc-ok) 20%,transparent)}
:host([estado=incorrecto]) .env{animation:sac .42s var(--o-ease-io,ease)}
:host([estado=incorrecto]) input{border-color:var(--oc-err)}
@keyframes sac{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}
  50%{transform:translateX(7px)}80%{transform:translateX(-4px)}}
@media(max-width:420px){input{width:44px;height:56px;font-size:1.25rem}}
@media(prefers-reduced-motion:reduce){:host([estado=incorrecto]) .env{animation:none}
  input.lleno{transform:none}}
`;
const COD_HOJA = soportaHojas ? css(COD_CSS) : null;

class OceanCodigo extends HTMLElement {
  static get observedAttributes() { return ["largo", "estado"]; }
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    montar(r, COD_HOJA, COD_CSS);
    r.innerHTML += `<div class="env"></div>`;
  }
  get largo() { return parseInt(this.getAttribute("largo") || "6", 10); }
  get valor() { return [...this.shadowRoot.querySelectorAll("input")].map(i => i.value).join(""); }
  connectedCallback() { this.construir(); }
  attributeChangedCallback(n) { if (n === "largo" && this.shadowRoot.querySelector(".env")) this.construir(); }

  construir() {
    const env = this.shadowRoot.querySelector(".env");
    env.innerHTML = Array.from({ length: this.largo }, (_, i) =>
      `<input type="text" inputmode="numeric" maxlength="1" aria-label="Dígito ${i + 1}"
        autocomplete="${i === 0 ? "one-time-code" : "off"}">`).join("");
    const ins = [...env.querySelectorAll("input")];

    ins.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
        inp.classList.toggle("lleno", !!inp.value);
        if (inp.value) { S.reproducir("muesca"); if (i < ins.length - 1) ins[i + 1].focus(); }
        this.emitir();
      });
      inp.addEventListener("keydown", e => {
        if (e.key === "Backspace" && !inp.value && i > 0) { ins[i - 1].focus(); ins[i - 1].value = ""; ins[i - 1].classList.remove("lleno"); this.emitir(); e.preventDefault(); }
        if (e.key === "ArrowLeft"  && i > 0) ins[i - 1].focus();
        if (e.key === "ArrowRight" && i < ins.length - 1) ins[i + 1].focus();
      });
      // pegar un código completo lo reparte entre las celdas
      inp.addEventListener("paste", e => {
        e.preventDefault();
        const txt = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, ins.length);
        txt.split("").forEach((c, k) => {
          if (ins[i + k]) { ins[i + k].value = c; ins[i + k].classList.add("lleno"); }
        });
        ins[Math.min(ins.length - 1, i + txt.length)].focus();
        S.reproducir("toque");
        this.emitir();
      });
      inp.addEventListener("focus", () => inp.select());
    });
  }
  emitir() {
    const v = this.valor, completo = v.length === this.largo;
    if (completo) S.reproducir("aviso");
    this.dispatchEvent(new CustomEvent("ocean:codigo", { bubbles: true, detail: { valor: v, completo } }));
  }
  limpiar() {
    this.shadowRoot.querySelectorAll("input").forEach(i => { i.value = ""; i.classList.remove("lleno"); });
    this.shadowRoot.querySelector("input").focus();
    return this;
  }
  acertar() { this.setAttribute("estado", "correcto"); S.reproducir("bien"); return this; }
  fallar()  { this.setAttribute("estado", "incorrecto"); S.reproducir("mal"); util.vibrar([26, 44, 26]);
              setTimeout(() => { this.removeAttribute("estado"); this.limpiar(); }, 700); return this; }
}
customElements.define("ocean-codigo", OceanCodigo);

window.OceanAuth = { OceanAcceso, OceanCodigo };
})();
