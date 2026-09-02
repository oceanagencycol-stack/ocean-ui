# Anatomía — ingeniería inversa de las referencias

Este documento explica **qué hace que cada referencia se sienta cara**, y cómo está
resuelto en Ocean UI. No es una lista de efectos: es el porqué de cada decisión.

---

## 1. Dynamic Island (iPhone) → `<ocean-isla>`

### Qué se ve
Una píldora negra que cambia de tamaño y de contenido según lo que pasa en el sistema.

### Qué la hace sentir material

**El contorno y el contenido no se mueven juntos.** Es el detalle que casi nadie copia.
El contorno arranca primero; el texto y los iconos entran unos milisegundos después,
con su propia opacidad. Si ambos se animan al mismo tiempo, el resultado parece una caja
que se estira. Con el desfase, parece un material que se abre y deja ver lo que hay dentro.

```js
// el contenido persigue una opacidad recortada respecto al contorno
this.fila.style.setProperty("--op",
  util.limitar((this._op.v - 0.25) / 0.75, 0, 1));
```

**Ancho, alto y radio son tres resortes independientes.** Con una sola transición CSS,
el radio y el ancho llegan a destino a la vez y el resultado se lee rígido. Con resortes
separados, el radio se asienta antes que el ancho y aparece esa sensación de tensión
superficial.

**No hay estados intermedios prohibidos.** Si el estado cambia a mitad de la animación,
el resorte redirige desde donde va, sin salto. Una transición CSS reiniciaría desde el
valor calculado y produciría un tirón.

### Cómo se usa
```html
<ocean-isla id="isla" estado="compacta" icono="●" titulo="Ocean"></ocean-isla>
<script>
  isla.mostrar({ icono:"✓", titulo:"Pedido enviado", detalle:"Llega el martes" });
</script>
```

---

## 2. Knob de Work Louder → `<ocean-tira>`

### Qué se ve
Un display OLED vertical embutido en un teclado. Tres comportamientos: lista de opciones
con selección tipo píldora, temporizador cuyo relleno decrece, y nivel.

### Qué lo hace sentir un objeto físico

**El relleno es la información, no un adorno.** En el temporizador, el número de abajo y
la altura del bloque naranja dicen lo mismo por dos vías. Eso es lo que permite leer el
estado de reojo, sin enfocar. Un aro de progreso alrededor de un número sería redundante;
un bloque que ocupa el objeto entero es legible a un metro de distancia.

**El fondo negro no es estilo: es la pantalla apagada.** Los píxeles OLED que no están
encendidos son negro real. Por eso el contenedor es `#000` puro y no un gris oscuro —
un gris delata que es una simulación.

**La selección es una píldora sólida, no un borde.** En un display de baja resolución
un borde de 1 px se pierde. El relleno sólido con texto invertido se lee siempre.

**El tic de los últimos cinco segundos.** Solo suena al final, no durante todo el conteo.
Un tic continuo cansa; un tic que aparece cuando falta poco comunica urgencia.

### Cómo se usa
```html
<ocean-tira modo="lista" opciones="5,10,15,30,60" valor="10"></ocean-tira>
<ocean-tira id="t" modo="tiempo"></ocean-tira>
<script> t.iniciar(600); </script>
```

---

## 3. Panel de casa inteligente (visionOS) → `.o-glass` + `<ocean-dock>`

### Qué se ve
Paneles translúcidos flotando sobre una sala real, con una barra de pestañas arriba.

### Qué hace que el vidrio no parezca plástico

Un solo `backdrop-filter: blur()` produce una superficie lechosa y plana. El vidrio real
hace cuatro cosas a la vez, y Ocean las apila:

| Capa | Qué aporta | Cómo |
|---|---|---|
| 1 | El vidrio **concentra** el color de lo que hay detrás | `blur()` **más** `saturate(1.7)` |
| 2 | Tinte propio del material | `background: rgba(255,255,255,.10)` |
| 3 | El **canto** del cristal atrapa luz | `inset 0 1px 0 rgba(255,255,255,.55)` arriba y sombra interior abajo |
| 4 | Ningún material real es perfectamente liso | grano SVG al 3,5 % en `overlay` |

Sin la capa 3 el panel parece un rectángulo recortado. Sin la 4, parece plástico.
Sin la saturación, el fondo se ve gris y muerto.

**La luz especular que sigue al puntero** (`.o-glass--vivo`) es lo que convierte una
superficie estática en un objeto. Es un `radial-gradient` cuya posición se actualiza con
dos variables CSS. No cuesta nada y cambia por completo la percepción.

**El indicador del dock se desliza, no parpadea.** Un fondo que aparece y desaparece en
el botón activo se lee como cambio de estado. Un indicador único que viaja entre botones
se lee como un objeto que se mueve, y de paso comunica la relación espacial entre pestañas.

---

## 4. App de casa inteligente con dial → `<ocean-dial>`

### Qué se ve
Un aro de temperatura con marcas radiales, degradado de frío a cálido y número grande al centro.

### Los tres problemas que casi todos los diales resuelven mal

**a) El salto al cruzar el origen.** Si se calcula el valor con `atan2` directo, al pasar
por el punto donde el ángulo salta de 180° a −180° el dial da un brinco de extremo a extremo.
La solución es acumular deltas y normalizar cada uno al rango ±180°:

```js
let d = anguloActual - anguloPrevio;
if (d >  180) d -= 360;
if (d < -180) d += 360;
acumulado = limitar(acumulado + d, 0, 270);
```

**b) El arco de 270°, no de 360°.** Un aro completo no tiene principio ni fin visible: el
usuario no sabe dónde está el mínimo. Con 270° y una abertura abajo, el recorrido se lee
de un vistazo. Se consigue rotando el SVG 135° y dibujando solo tres cuartos de la
circunferencia con `stroke-dasharray`.

**c) Las marcas deben responder.** Las marcas que ya pasó el valor se pintan del color del
acento; las demás quedan en gris. Sin eso son decoración; con eso son una escala.

**El detente.** Cada vez que el valor cambia de paso suena una muesca y vibra 4 ms.
Es lo que convierte un arrastre continuo en un control con clics, como un potenciómetro real.

---

## 5. Canvas de IA (ORRISO) → sistema de superficies flotantes

### Qué se ve
Un lienzo con tarjetas, píldoras de herramienta y un panel de conversación, todo flotando
sobre un fondo neutro con desenfoque.

### La lección de composición

**La jerarquía se construye con desenfoque, no con tamaño.** Lo que está en foco tiene
sombra profunda y borde nítido; lo secundario tiene menos opacidad y menos contraste de
borde. Los seis niveles de elevación de Ocean (`--o-e1` a `--o-e5`) existen justamente para
no improvisar sombras.

**Las barras contextuales aparecen cerca de lo que afectan**, no en un panel lateral fijo.
Eso reduce el recorrido del puntero y hace que la herramienta se sienta parte del objeto.

**El color solo aparece donde hay que decidir.** El resto del lienzo es neutro. Las
tarjetas de agente son lo único saturado en toda la composición, y por eso se ven primero.

---

## 6. Sonido — lo que ninguna referencia visual muestra

Las cinco referencias son imágenes, así que el sonido hubo que diseñarlo desde cero.
Los principios que se aplicaron:

**Nada de archivos.** Doce sonidos sintetizados pesan menos que un solo MP3 corto y suenan
igual con mala conexión. Se generan con osciladores y ruido filtrado sobre un bus con
compresor.

**Cada sonido tiene una intención distinta.** Confirmación es una tercera mayor ascendente;
error es una segunda menor descendente. No se parecen por accidente: se diseñaron como
pares opuestos.

**El transitorio importa más que el tono.** Un clic convincente es 35 ms de ruido filtrado
en banda estrecha **más** un cuerpo tonal corto. Solo el tono suena a juguete; solo el ruido
suena a estática.

**Volumen inversamente proporcional a la frecuencia de uso.** El roce del puntero está al
5 % porque ocurre cientos de veces; la confirmación está al 20 % porque ocurre una vez.

**Respeta al usuario.** Arranca solo tras un gesto real, recuerda si se apagó, y viene
apagado de fábrica si el sistema pide movimiento reducido.

---

## Lo que se decidió NO copiar

- **Sombras pesadas y biseles.** Envejecen mal y hacen la interfaz lenta de leer.
- **Movimiento continuo de fondo sin propósito.** Los orbes del showcase son lentos y
  desenfocados a propósito; si compiten con el contenido, sobran.
- **Glassmorphism en todo.** El vidrio funciona porque hay superficies que no lo son.
  Si todo flota, nada flota.
- **Animar en cada scroll.** Los reveals ocurren una sola vez, y `IntersectionObserver`
  deja de observar el elemento después. Repetir la animación al volver a subir marea.

---

*Ocean Industries · septiembre de 2026*

---

# Parte II — Actividades en vivo y acceso

Segunda tanda de referencias: Live Activities de iOS, la isla del borde lateral y
las cápsulas compactas del sistema.

---

## 7. Live Activities → `<ocean-actividad>`

### La regla que las gobierna
**Una actividad en vivo no se mira: se percibe.** El usuario está haciendo otra cosa.
Por eso cada pieza necesita una lectura primaria de un solo golpe —una forma, un color,
una altura— y el texto siempre es secundario.

### Por qué el negro es `#000` puro
En una pantalla OLED el píxel negro está apagado. La cápsula deja de parecer un
rectángulo pintado y parece un recorte en el cristal. Un `#111` delata la simulación al
instante. Es una decisión de material, no de estilo.

### Tres densidades, un componente
- **Mínima**: solo importa que algo ocurre. Un punto y dos palabras.
- **Compacta**: hay un dato que leer.
- **Expandida**: hay que decidir algo.

La transición entre densidades usa la curva de *morphing*, no la de salida: el contenedor
debe sentirse elástico, no deslizante.

### La barra al pie
El progreso va como una línea de 2,5 px pegada al borde inferior, no como un anillo ni una
barra dentro del contenido. Así no roba espacio y se lee incluso con la cápsula tapada a
medias.

---

## 8. Medidores → `<ocean-onda>`, `<ocean-anillo>`, `<ocean-chispa>`, `<ocean-arco>`

### El medidor de barras (`ocean-onda`)
Las alturas son **deterministas**, no aleatorias: suma de dos senos desfasados.

```js
altura(i) {
  const x = i / this.n;
  return 0.3 + 0.45*Math.abs(Math.sin(x*11.2)) + 0.25*Math.abs(Math.sin(x*4.1+1.7));
}
```

Con `Math.random()` la onda cambia en cada carga y el componente se siente inestable.
Con dos senos desfasados se ve orgánica y siempre igual.

### El arco (`ocean-arco`)
El marcador viaja por la curva real con `getPointAtLength()`, no con trigonometría
aproximada. Es la diferencia entre un punto que sigue el trazo y uno que flota cerca.

```js
const pt = path.getPointAtLength(L * v);
m.setAttribute("cx", pt.x); m.setAttribute("cy", pt.y);
```

### El trazo ECG (`ocean-chispa`)
La animación de dibujo necesita la longitud real del `<path>`, que solo se conoce tras
el render:

```js
requestAnimationFrame(() => {
  this.style.setProperty("--L", path.getTotalLength());
});
```

Si se pone un `stroke-dasharray` fijo, el trazo se corta o queda con hueco.

---

## 9. Isla del borde → `<ocean-borde>`

La referencia muestra un panel vertical anclado al canto del dispositivo, no flotando en
el centro. Sirve para lo que ocurre **sin que el usuario lo pidió**: volumen, modo
silencio, estado de conexión.

**Entra empujando, no apareciendo.** Un fundido comunica "esto estaba aquí y no lo veías".
Un empujón lateral comunica "esto acaba de llegar desde fuera". El resorte hace el resto.

**Radio asimétrico**: esquinas redondeadas solo del lado interior. Del lado del borde es
recto, porque el objeto está cortado por el canto de la pantalla.

---

## 10. El acceso → `<ocean-acceso>` y `<ocean-codigo>`

El login es el primer momento del producto y casi siempre el peor tratado.

### Máquina de estados explícita
`reposo → escribiendo → verificando → (correcto | incorrecto) → reposo`

Cada transición tiene **forma, color y sonido**. No hay estados implícitos ni banderas
booleanas sueltas: el atributo `estado` es la única fuente de verdad y el CSS reacciona
a él con `:host([estado=...])`.

### El rostro
Cinco geometrías, una por estado. Los ojos siguen al puntero en `mirando` y **se cierran
mientras se escribe la contraseña** — el gesto de "no estoy viendo lo que escribes".
En `ok` los ojos se entrecierran y la boca se curva; en `error` los ojos se abren y la
boca baja. Es la diferencia entre un formulario y algo que responde.

### La fuerza de la clave en cuatro tramos, no en barra continua
Una barra continua invita a conformarse con "casi llena". Cuatro tramos discretos
comunican cuatro criterios independientes: longitud, mayúsculas y minúsculas, dígito,
símbolo.

### El código que se pega solo
`<ocean-codigo>` reparte un código de 6 dígitos entre las celdas al pegarlo. Es el
detalle que casi nadie implementa y el que más fricción quita: el usuario copia el SMS
y pega una sola vez.

### Un bug de seguridad encontrado durante la construcción

La primera versión del componente tenía este fallback:

```js
const res = await (this.verificar
  ? this.verificar({usuario, clave})
  : new Promise(ok => setTimeout(() => ok(clave.length >= 4), 1500)));
```

Es decir: **si nadie asignaba `.verificar`, el login aceptaba cualquier clave de cuatro
caracteres.** Pensado como comodidad para la demo, era un agujero: bastaba olvidar la
asignación en producción para dejar la puerta abierta.

Se descubrió porque en el showcase había un `id` duplicado —`<section id="acceso">` y
`<ocean-acceso id="acceso">`—, así que `document.querySelector("#acceso")` devolvía la
sección y `acceso.verificar = ...` se asignaba al elemento equivocado. El componente caía
al fallback y concedía acceso con una clave incorrecta.

**Corrección:** sin verificador no se concede acceso. Se rechaza, se avisa en consola y
se muestra un mensaje de configuración incompleta.

```js
if (typeof this.verificar !== "function") {
  console.error("[ocean-acceso] Falta asignar .verificar — no se concede acceso.");
  this.fallar("Configuración incompleta: no hay verificador asignado.");
  return;
}
```

La lección vale más que el componente: **un valor por defecto permisivo en un control de
acceso es un fallo de seguridad, no una comodidad.** Y los `id` duplicados en HTML no dan
error: producen comportamientos silenciosos y muy difíciles de rastrear.

---

*Ocean Industries · septiembre de 2026*
