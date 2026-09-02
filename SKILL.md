---
name: ocean-ui
description: Sistema de interfaz de Ocean Industries (CEO Juan Manuel Cuero Bravo) — vidrio con profundidad real, física de resorte, componentes nativos, actividades en vivo, acceso con máquina de estados, tipografía con tracking óptico, fondos generados por código, sonido sintetizado y la puesta en escena de Awwwards (split por líneas, tema por sección, cortinas, preloader, escenas por scroll, secuencias) sin dependencias. Úsala SIEMPRE que haya que construir o pulir una interfaz web de Ocean o de un cliente — landing, demo, dashboard, login, catálogo, hero, animaciones de scroll — o cuando pidan "que se vea premium", "nivel Awwwards", "animaciones inmersivas", "glass", "isla dinámica", "login con estados", "fuentes bien escogidas", "fondos únicos", "sonido en la web". Enruta a los archivos del repo oceanagencycol-stack/ocean-ui, aplica el checklist de auto-jurado antes de entregar y respeta la regla de una firma por producto. Español siempre.
---

# Ocean UI — cómo se usa

Biblioteca en `oceanagencycol-stack/ocean-ui`. Cero dependencias, cero compilación:
se copia `src/` al proyecto y se enlaza. Funciona igual en HTML suelto, WordPress,
Next.js o dentro de un iframe.

## Qué archivo para qué

| Necesidad | Archivo | Se activa con |
|---|---|---|
| Vidrio, elevación, reveals, bento | `ocean.css` | clases `.o-glass`, `.o-rv`, `.o-bento` |
| Resortes, parallax, magnético, tilt, contadores | `ocean-motion.js` | `OceanMotion.iniciar()` + `data-o-*` |
| Isla, dial, tira, dock, toggle, barra | `ocean-ui.js` | `<ocean-isla>`, `<ocean-dial>`… |
| Cápsulas en vivo, medidores, anillos, rutas, rostro, borde | `ocean-live.js` | `<ocean-actividad>`, `<ocean-onda>`… |
| Login con estados y código de verificación | `ocean-auth.js` | `<ocean-acceso>`, `<ocean-codigo>` |
| Escala, voces, tratamientos de capa | `ocean-tipografia.css` + `ocean-texto.js` | `data-ot-voz`, `.ot-d1`, `.ot-marca`… |
| Fondos generados | `ocean-fondos.css` | `.of-noche`, `.of-malla`, `.of-grano`… |
| Split por líneas, tema por sección, cortinas, cursor, preloader, escena sticky, secuencia | `ocean-escena.js` + `ocean-escena.css` | `data-o-lineas`, `data-o-tema-bg`, `data-o-escena`… |
| Sonido | `ocean-sound.js` | `data-o-sonido`, `OceanSound.reproducir()` |

Carga mínima: `ocean.css` + `ocean-motion.js` + `OceanMotion.iniciar()`. El resto es
opcional y se suma según lo que el producto necesite.

## Las reglas que no se negocian

1. **Una firma por producto, el resto quieto.** Ocho de 23 premiados usan cinco o más
   efectos a la vez y son indistinguibles. Elegir la técnica ligada al material del
   sujeto (el calibre del polvo en Sencia, el kit de consumo en CA) y quitar lo demás.
2. **La página se ve completa sin JavaScript.** Los estados iniciales de los reveals
   solo existen con `html.o-js`. Nunca añadir `opacity:0` fuera de esa clase.
3. **`prefers-reduced-motion` con estado final = inicial.** Nada oculto, nada moviéndose.
4. **Un solo `requestAnimationFrame` y un solo listener de scroll.** Registrar tareas
   con `OceanMotion.agregar(fn)`, no abrir bucles propios.
5. **Cero `id` duplicados.** `OceanMotion.iniciar()` los denuncia en consola. Costaron un
   fallo de seguridad en el login: `querySelector` devolvía la sección, no el componente.
6. **`<ocean-acceso>` sin `.verificar` rechaza el acceso.** Nunca poner un fallback
   permisivo en un control de acceso.
7. **Sonido apagado por defecto** si el sistema pide movimiento reducido; control
   siempre visible; arranca solo tras un gesto real.
8. **El clip-path va en el hijo, se observa el padre.** Chrome calcula
   IntersectionObserver después del clip. `.o-rv--clip` ya lo hace bien; no reescribirlo.

## Flujo de trabajo

1. Leer `docs/ANATOMIA.md` para el *porqué* de la técnica que se va a usar.
2. Aplicar `data-ot-voz` según el producto: `editorial` (marca y contenido),
   `industrial` (producto y B2B), `boticario` (cosmética, alimentos), `cuaderno`
   (calidez), `terminal` (paneles internos).
3. Marcar el HTML con los atributos; no escribir animaciones a mano.
4. Verificar con Playwright: cero errores JS, cero imágenes rotas, cero desbordamiento
   a 390 px, reveals revelados tras un salto al final de la página.
5. Correr `docs/AUTO-JURADO.md`. Si Usability o Accessibility quedan bajo 8, no se entrega.

## Diales por producto Ocean

| Producto | Voz | Firma sugerida | Motion máx. |
|---|---|---|---|
| METIQ | editorial + `terminal` en datos | tema que muta al cambiar de mercado, contadores solo en cifras de impacto | 7 |
| FATHOM Club | boticario | preloader con identidad + escenas por capítulo + sonido opt-in | 10 |
| Naidikó | boticario | secuencia de imágenes del producto (no 3D), calculadora de pedido mínimo | 6 |
| Marca Ocean | editorial | el agente de WhatsApp vivo dentro del sitio | 8 |
| Landings de cliente | industrial | una herramienta útil por landing (calculadora, grader), no un efecto | 5 |
| Ocean Agents / LoyaltyOS | industrial | el agente respondiendo en vivo en la landing | 7 |

## Cuando algo no funciona

- Reveal que no aparece → ¿tiene `clip-path` el propio elemento observado? Mover al hijo.
- Contenido invisible tras navegar con ancla → la red de seguridad (`barrer`) ya lo
  cubre; verificar que se llamó `OceanMotion.iniciar()`.
- Contorno de texto invisible → `currentColor` con `color:transparent` hereda el
  transparente; usar `--contorno-color`.
- Logo con caja negra → colisión de clase (`.oscuro` global); prefijar las clases del
  componente.
- Tema por sección que no vuelve → la sección es más alta que el viewport; el disparo va
  por línea central (`rootMargin:-50%`), ya corregido.
