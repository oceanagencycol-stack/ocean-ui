# Ocean UI

Sistema de interfaz de **Ocean Industries**: superficies con profundidad real, movimiento
con física de resorte, componentes nativos del navegador y diseño sonoro sintetizado.

**Cero dependencias. Cero compilación. Tres archivos.**

## Instalar

Copie `src/` a su proyecto y enlace:

```html
<link rel="stylesheet" href="src/ocean.css">
<link rel="stylesheet" href="src/ocean-tipografia.css">
<link rel="stylesheet" href="src/ocean-fondos.css">
<script src="src/ocean-motion.js"></script>
<script src="src/ocean-sound.js"></script>
<script src="src/ocean-ui.js"></script>
<!-- opcionales -->
<script src="src/ocean-live.js"></script>
<script src="src/ocean-auth.js"></script>
<script src="src/ocean-texto.js"></script>
<script>OceanUI.iniciar();</script>
```

Funciona igual en un HTML suelto, en WordPress, en Next.js o dentro de un iframe.

## Qué trae

### Superficies (`ocean.css`)
`.o-glass` con cuatro capas apiladas —desenfoque con saturación, tinte, filo de luz y
grano— más variantes `--fino`, `--grueso` y `--solido`, y `--vivo` para la luz especular
que sigue al puntero. Seis niveles de elevación, radios continuos, rejilla bento y
utilidades de reveal.

### Movimiento (`ocean-motion.js`)
| Pieza | Qué hace |
|---|---|
| `Resorte` | Integrador de Euler semi-implícito. Masa, rigidez y amortiguación reales |
| `reveals` | Entradas por scroll con `IntersectionObserver`, una sola vez |
| `porPalabras` | Titular que entra palabra por palabra con desfase |
| `parallax` | Capas con `data-o-parallax`, un solo listener pasivo |
| `magnetico` | El elemento persigue al puntero y vuelve solo |
| `tilt` | Perspectiva 3D con resorte |
| `contadores` | Cifras que suben con desaceleración cúbica |
| `progreso` | Expone `--o-prog` (0→1) para animaciones dirigidas por scroll |

Todo comparte **un único** `requestAnimationFrame` y **un único** listener de scroll.

### Componentes (`ocean-ui.js`)
| Elemento | Descripción |
|---|---|
| `<ocean-isla>` | Contenedor que cambia de forma y contenido. Tres estados y método `mostrar()` |
| `<ocean-dial>` | Dial radial de 270° con marcas, arrastre angular acumulado y detentes |
| `<ocean-tira>` | Display vertical en tres modos: nivel, lista y cuenta atrás |
| `<ocean-dock>` | Barra contextual con indicador que se desliza |
| `<ocean-toggle>` | Interruptor cuya bola se estira al moverse |
| `<ocean-barra>` | Deslizador con sonido ligado al valor |

Custom Elements con Shadow DOM. Teclado, ARIA y foco visible incluidos.

### Actividades en vivo (`ocean-live.js`)
Lo que está pasando ahora mismo. Se leen de reojo: cada pieza tiene una lectura primaria
de un solo golpe y el texto viene después.

| Elemento | Descripción |
|---|---|
| `<ocean-actividad>` | Cápsula en tres densidades, cuatro tonos y barra de progreso al pie |
| `<ocean-onda>` | Medidor de barras: progreso, onda estática o ecualizador en vivo |
| `<ocean-anillo>` | Anillo de progreso determinado o indeterminado |
| `<ocean-ruta>` | Progreso por etapas con nodos e iconos |
| `<ocean-chispa>` | Trazo de tendencia o ECG que se dibuja con la longitud real de la curva |
| `<ocean-arco>` | Trayectoria en arco con marcador que viaja por la curva |
| `<ocean-franjas>` | Momentos con gradiente y marcador de posición |
| `<ocean-borde>` | Isla anclada al canto de la ventana; entra empujando, no apareciendo |
| `<ocean-rostro>` | Rostro de cinco estados que sigue al puntero |

### Acceso (`ocean-auth.js`)
| Elemento | Descripción |
|---|---|
| `<ocean-acceso>` | Login con máquina de estados, rostro reactivo y medidor de fuerza en cuatro tramos |
| `<ocean-codigo>` | Celdas de verificación que reparten un código pegado del portapapeles |

```js
acceso.verificar = async ({usuario, clave}) => {
  const r = await fetch("/api/login", {method:"POST", body: JSON.stringify({usuario, clave})});
  return r.ok ? {ok:true, mensaje:"Bienvenido"} : {ok:false, mensaje:"Credenciales inválidas"};
};
```

**Seguridad:** si no se asigna `.verificar`, el componente **rechaza el acceso** y avisa
en consola. Un valor por defecto permisivo en un control de acceso es un fallo, no una
comodidad.

### Tipografía (`ocean-tipografia.css` + `ocean-texto.js`)
Escala de diez pasos donde **cada paso trae su propio tracking**, siguiendo la regla
óptica: a mayor tamaño menos aire entre letras, a menor tamaño más, y las mayúsculas
siempre más que las minúsculas.

Seis **voces** cerradas —display, texto y dato ya emparejados— aplicables con
`data-ot-voz="editorial|industrial|boticario|cuaderno|terminal|sistema"`.

Nueve **tratamientos de capa**: fantasma, contorno, marcador, sangrado, apilado,
vertical, degradado, capitular y ajuste al ancho.

```js
OceanTexto.arco(el, {grados:150, radio:230});   // texto sobre curva con textPath
OceanTexto.porLetras(el);                        // divide en <span> con --i por letra
OceanTexto.trackingOptico(el);                   // la regla, sobre cualquier tamaño
OceanTexto.ajustar(el);                          // llena el ancho por búsqueda binaria
OceanTexto.atarViudas();                         // impide la última palabra huérfana
```

Donde la fuente trae eje `opsz`, `font-optical-sizing: auto` hace que el navegador
redibuje la letra según el cuerpo. Un titular no es texto grande: es otro dibujo.

### Fondos (`ocean-fondos.css`)
Doce superficies generadas por código —gradientes, SVG en línea y filtros—. Ni una
imagen, cero peticiones de red.

`of-grano` · `of-papel` · `of-malla` · `of-aurora` · `of-reticula` · `of-puntos` ·
`of-rayado` · `of-halo` · `of-vineta` · `of-cono`, más cuatro recetas apiladas:
`of-noche`, `of-taller`, `of-campo`, `of-brasa`.

### Escena (`ocean-escena.js` + `ocean-escena.css`)
Las técnicas que se repiten en 23 sitios premiados de Awwwards 2024–2026, reconstruidas
sin dependencias.

| Técnica | Se activa con | Frecuencia en la élite |
|---|---|---|
| Split por líneas reales | `data-o-lineas` | 8 / 23 |
| Tema que muta por sección | `data-o-tema-bg` + `data-o-tema-fg` | Lando Norris, Terminal |
| Escena por scroll (sticky) | `data-o-escena="280"` → expone `--o-esc-prog` | Son Daven, Aardvark |
| Secuencia de imágenes en canvas | `data-o-secuencia="f-{n}.webp"` | Aardvark, Oryzo |
| Cortina de transición | `data-o-cortina` en enlaces | HOBRO, Squarespace |
| Cursor con `mix-blend-mode` | `OceanEscena.cursor()` | 8 / 23 |
| Preloader con identidad | `OceanEscena.preloader({marca})` | 15 / 23 |
| Marquee | `data-o-marquee="34s"` | 6 / 23 |
| View Transitions con fallback | `data-o-transicion` | 6 / 23 |

**La regla que ninguna técnica reemplaza:** una firma por producto, el resto quieto.
Ocho de los 23 premiados usan cinco o más a la vez y se vuelven indistinguibles.

### Sonido (`ocean-sound.js`)
Doce sonidos sintetizados con osciladores y ruido filtrado: `roce`, `toque`, `muesca`,
`abrir`, `cerrar`, `bien`, `mal`, `aviso`, `paso`, `morph`, `desliz`, `tic`, `himno`.

```html
<button data-o-sonido="toque" data-o-roce>Suena al pulsar y al pasar</button>
```
```js
OceanSound.reproducir("bien");
OceanSound.alternar();     // encender / apagar, se recuerda
OceanSound.volumen(0.4);
```

Arranca solo tras un gesto real del usuario, recuerda la preferencia y viene apagado si el
sistema pide movimiento reducido.

## Accesibilidad

- Respeta `prefers-reduced-motion`: las animaciones se desactivan y el sonido no arranca solo.
- Respeta `forced-colors`: el vidrio desaparece y la estructura se mantiene.
- Todos los controles funcionan con teclado y exponen rol y valor ARIA.
- El estado inicial de los reveals está en CSS, no en JS: si el JavaScript falla, la página
  se ve completa igual.

## Garantías

Verificado en las cuatro páginas, en escritorio y a 390 px:

- **La página se ve completa sin JavaScript.** Los estados iniciales viven detrás de
  `html.o-js`. De 23 sitios premiados, 3 muestran página vacía sin JS.
- **Cero elementos sin revelar tras un salto de scroll.** Red de seguridad para el caso
  en que IntersectionObserver reporta ratio 0 → 0.
- **Cero fugas.** 600 componentes montados y desmontados en bucle sin supervivientes.
  Un solo `requestAnimationFrame` compartido, que se pausa con la pestaña oculta.
- **Cero `id` duplicados**, denunciados en consola fuera de producción.
- **`prefers-reduced-motion` con estado final = estado inicial**: nada oculto, nada
  moviéndose.

## Documentación

- [`docs/ANATOMIA.md`](docs/ANATOMIA.md) — ingeniería inversa de cada referencia y el
  porqué de cada decisión, incluidos los fallos encontrados construyéndola.
- [`docs/AUTO-JURADO.md`](docs/AUTO-JURADO.md) — checklist con la ponderación oficial de
  Awwwards y los umbrales Ocean. Si Usability o Accessibility quedan bajo 8, no se entrega.
- [`SKILL.md`](SKILL.md) — para que Cowork y Claude Code usen la biblioteca sin
  reaprenderla en cada sesión.

## Demostración

- `index.html` — núcleo: laboratorio de resortes en vivo, los seis componentes base y el
  catálogo de sonidos.
- `live.html` — actividades en vivo, medidores, isla de borde y el sistema de acceso
  completo con registro de estados.
- `tipografia.html` — escala con su tracking, las seis voces intercambiables, los nueve
  tratamientos de capa y los doce fondos.
- `escena.html` — split por líneas, tema que muta, escena sticky de 280 svh, cortina,
  preloader y cursor.

---

**Ocean Industries** · Cali · Bogotá · Miami
