# Ocean UI

Sistema de interfaz de **Ocean Industries**: superficies con profundidad real, movimiento
con física de resorte, componentes nativos del navegador y diseño sonoro sintetizado.

**Cero dependencias. Cero compilación. Tres archivos.**

## Instalar

Copie `src/` a su proyecto y enlace:

```html
<link rel="stylesheet" href="src/ocean.css">
<script src="src/ocean-motion.js"></script>
<script src="src/ocean-sound.js"></script>
<script src="src/ocean-ui.js"></script>
<!-- opcionales -->
<script src="src/ocean-live.js"></script>
<script src="src/ocean-auth.js"></script>
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

## Documentación

[`docs/ANATOMIA.md`](docs/ANATOMIA.md) — ingeniería inversa de las referencias que
originaron cada componente y el porqué de cada decisión.

## Demostración

- `index.html` — núcleo: laboratorio de resortes en vivo, los seis componentes base y el
  catálogo de sonidos.
- `live.html` — actividades en vivo, medidores, isla de borde y el sistema de acceso
  completo con registro de estados.

---

**Ocean Industries** · Cali · Bogotá · Miami
