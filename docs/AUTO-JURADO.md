# Auto-jurado — checklist Awwwards-grade para Ocean

Se corre **antes de entregar**, sobre la página real desplegada, no sobre el diseño.
Puntuar cada eje del 1 al 10 como lo haría el jurado. Ponderación oficial del score:
**Design 40 % · Usability 30 % · Creativity 20 % · Content 10 %**. El Developer Award
se evalúa aparte en seis ejes.

## Los umbrales Ocean

Salen de 31 fichas oficiales 2024–2026. La élite promedia **Creativity 7.92** y
**Accessibility 6.86** — nadie en el top hace accesibilidad bien. Ocean apunta a la
creatividad de un Site of the Month **con** la accesibilidad, el peso y el SEO que ellos
no tienen.

| Eje | Élite (promedio) | Umbral Ocean |
|---|---|---|
| Design | 7.9 | ≥ 8 |
| Usability | 7.36 (la más baja en 28 de 31) | **≥ 8** |
| Creativity | 7.92 | ≥ 7.5 |
| Content | 7.9 | ≥ 7.5 |
| Dev · Accessibility | 6.86 (nunca pasa de 7.4) | **≥ 8** |
| Dev · Animations | 8.39 | ≥ 8 |
| Dev · WPO | 7.6 | ≥ 8 |
| Dev · Semantics/SEO | 7.2 | ≥ 8 |

---

## Design (40 %)

- [ ] La idea rectora está escrita en una frase y es visible en el héroe.
- [ ] La tipografía se eligió **después** de la idea y se probó con el titular real.
- [ ] Display con `line-height` 0.85–1.0 y tracking −0.02 a −0.05 em; cuerpo con la
      medida entre 46 y 78 caracteres. Lo garantiza `ocean-tipografia.css`.
- [ ] Oscuro y claro con tinte, no negro y blanco puros (salvo cápsulas OLED).
- [ ] **Un** acento, con su par `on-color` declarado (`--o-sobre-acento`).
- [ ] Una firma memorable y el resto quieto. Prueba del teléfono: ¿qué recuerda alguien
      que la vio 10 segundos en un móvil?

## Usability (30 %)

- [ ] El contenido está completo **sin JavaScript**. Los reveals solo aplican con
      `html.o-js`; sin script la página se ve entera.
- [ ] Navegación por teclado con foco visible (`:focus-visible` con el acento).
- [ ] `prefers-reduced-motion` respetado, con **estado final = estado inicial**: nada
      queda oculto, nada sigue moviéndose.
- [ ] Todo lo que depende del cursor va detrás de `(hover: hover) and (pointer: fine)`:
      magnético, tilt, cursor propio.
- [ ] Móvil primero: en Colombia el tráfico de WhatsApp llega en móvil. Captura de
      pantalla a 390 px revisada.
- [ ] Estados vacío, error y límite diseñados en la voz del producto.
- [ ] Dial de motion ≤ 7 en producto; 10 solo en piezas de marca.

## Creativity (20 %)

- [ ] El héroe es una tesis **del mundo del sujeto**, no "número grande + gradiente".
- [ ] La técnica firma está ligada al material del sujeto (el polvo y su calibre en
      Sencia; el kit de consumo en CA), no importada de otro sitio.
- [ ] No hay más de dos de estas a la vez: preloader, Lenis, split, marquee, cursor,
      grain, magnético, parallax. Con cinco o más el sitio es una plantilla Awwwards.

## Content (10 %)

- [ ] H1 declarativo, único.
- [ ] Cada CTA dice **lo que pasa**: "Cotizar para mi empresa", "Quiero distribuir".
      Nunca "Enviar", "Submit" ni "Más info".
- [ ] FAQ real, testimonio con nombre y cargo — o ninguno. Nunca Lorem ipsum.
- [ ] Bloque GEO/FAQ semántico en el DOM y `schema.org` (`Organization` /
      `LocalBusiness` / `Product`).

## Developer Award

**Semantics** — [ ] H1 único · [ ] jerarquía real de encabezados · [ ] `<main>`,
`<nav>`, `<footer>` · [ ] `aria` donde aporta y no donde estorba · [ ] **cero `id`
duplicados** (`OceanMotion.iniciar()` los denuncia en consola).

**Animations** — [ ] una secuencia de entrada orquestada · [ ] easings del canon
(easeOutExpo por defecto, Material solo en micro-estados) · [ ] duraciones tokenizadas
(`--o-t-*`), no números sueltos · [ ] `will-change` solo `transform`/`opacity`.

**Accessibility** — [ ] contraste AA en texto y controles · [ ] `tabular-nums` en
cifras · [ ] `font-feature-settings: "case"` en botones en mayúsculas · [ ] sonido
apagado por defecto si el sistema pide movimiento reducido, con control visible.

**WPO** — [ ] HTML < 300 KB · [ ] JS inicial < 200 KB · [ ] `aspect-ratio` en todo
media (CLS cero) · [ ] fuentes con `font-display: swap` y fallback métrico ·
[ ] `preload="none"` en video fuera del héroe · [ ] LCP < 2.5 s en móvil con datos de
campo.

**Responsive** — [ ] `svh`/`dvh` en héroes y overlays · [ ] sin desbordamiento
horizontal a 390 px (verificar `scrollWidth`) · [ ] capturas desktop y móvil revisadas
por una persona.

**Markup** — [ ] `theme-color` alineado al fondo y actualizado si el tema muta ·
[ ] `og:image` propia · [ ] favicon · [ ] `::selection` con el acento.

---

## Cómo se puntúa

Sumar Design×0.4 + Usability×0.3 + Creativity×0.2 + Content×0.1. Un SOTD arranca en
~7.2; un Site of the Month está en 7.6–8.0. Si Usability o Accessibility quedan por
debajo de 8, **no se entrega**: es justamente donde Ocean se diferencia.

*Fuente: 31 fichas oficiales de Awwwards (SOTY 2024–2025, SOTM 2024–jul 2026, SOTD sep
2026) y el código de 23 de esos sitios, barrido el 2 de septiembre de 2026.*
