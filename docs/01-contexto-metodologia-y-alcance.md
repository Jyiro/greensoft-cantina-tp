# Contexto completo, marco metodológico, alcances y relevamiento de campo

Este documento consolida la totalidad del contexto institucional, normativo, metodológico y de relevamiento de campo sobre el cual se diseñó e implementó el módulo **Campus CO₂ · Dimensión 11: Alimentación y Cantina** en la UTN Facultad Regional Córdoba.

---

## 1. Marco del proyecto *Campus CO₂* y definición de producto

### 1.1 Consigna general y propósito
El proyecto integrador **Campus CO₂** de la Cátedra **Green Software** (Ingeniería en Sistemas de Información, UTN Facultad Regional Córdoba) define una metodología común para estimar la huella de carbono institucional de la Facultad dividida en **15 dimensiones** operativas. Al **Grupo 11** le corresponde la **Dimensión 11: Alimentación y Cantina** (`alimentacion-cantina`).

El objetivo del trabajo práctico es doble:
1. **Metodológico:** diseñar un modelo auditable para calcular las emisiones anuales de gases de efecto invernadero (GEI, expresadas en `kg CO₂e` y `t CO₂e`) generadas por los alimentos y bebidas que adquiere la cantina universitaria.
2. **Tecnológico:** construir el módulo frontend encargado de la carga de compras anuales, el cálculo trazable, la visualización comparativa y la integración (mediante contrato REST documentado y capa local simulada) con la futura plataforma central de la cátedra.

### 1.2 Audiencia y criterios de éxito del software
De acuerdo con la definición de producto establecida en `PRODUCT.md`, el módulo atiende a tres perfiles reales con necesidades concretas:

| Perfil usuario | Qué necesita hacer en el sistema | Criterio de éxito |
| --- | --- | --- |
| **Integrantes del Grupo 11** | Demostrar la investigación en defensa oral y video explicativo; obtener capturas limpias para el Anexo A del TP. | Interfaz autoexplicativa con secuencia clara en 3 pasos, guía rápida visible, escenario precargable sin pantalla vacía y trazabilidad inmediata. |
| **Docente y evaluadores de la cátedra** | Auditar fórmula, conversiones a kg, fuentes científicas verificadas, límites entre dimensiones, validaciones y fidelidad al contrato API. | Rigor metodológico visible en cada pantalla: cero métricas inventadas, separación explícita de Alcance 2 eléctrico y contrato REST comprobable en inspector JSON. |
| **Operador o relevador de la facultad** | Cargar compras anuales reales (por factura/remito o receta elaborada), corregir cantidades y exportar resultados por período y edificio. | Formulario tolerante a distintas unidades (`unidad`, `kg`, `g`, `l`, `ml`), descomposición de comidas en ingredientes, validaciones claras y persistencia local resiliente. |

### 1.3 Principios rectores adoptados
1. **Honestidad metodológica ante todo:** declarar explícitamente cada supuesto (densidad líquida, mezclas ponderadas, parámetros estimados de ventas ante ausencia de facturas) y no mezclar emisiones de distintas dimensiones ni categorías de alcance.
2. **Trazabilidad punta a punta:** cualquier persona debe poder reconstruir la cuenta exacta desde el dato ingresado (o desde cada ingrediente de una receta) hasta el total en `kg CO₂e` / `t CO₂e` y el JSON enviado a la API.
3. **Valor inmediato sin pantallas vacías:** al no disponer aún de facturas cerradas del concesionario, el usuario debe poder explorar el relevamiento completo en un clic mediante los 3 escenarios estimados, comprendiendo en pantalla por qué esos datos son estimaciones.
4. **Cero bloat ni controles decorativos:** cada control cumple una tarea real del inventario alimentario; no existen series mensuales ficticias ni equivalencias ambientales arbitrarias (como "cantidad de árboles equivalente") carentes de sustento en la investigación.
5. **Autonomía offline:** apertura directa mediante doble clic (`file://`) o servidor HTTP estático, sin dependencias externas obligatorias ni compilación.

---

## 2. Marco normativo argentino

En la República Argentina, el trabajo se encuadra en los compromisos nacionales de inventario, adaptación y mitigación frente al cambio climático:

- **Ley 27.520** (publicada en diciembre de 2019): *Ley de Presupuestos Mínimos de Adaptación y Mitigación al Cambio Climático Global*. Establece el marco institucional de políticas públicas climáticas y presupuestos mínimos ambientales.
- **Decreto Reglamentario 1030/2020** (Boletín Oficial, diciembre de 2020): reglamenta la Ley 27.520 y precisa instrumentos de coordinación, inventario nacional de GEI y reporte.
- **Ley 27.270**: aprueba la ratificación argentina del **Acuerdo de París** bajo la Convención Marco de las Naciones Unidas sobre el Cambio Climático.

> **Alcance normativo del TP:** el documento del grupo deja asentado que se enmarca conceptualmente en estos objetivos de mitigación y medición, sin realizar un análisis jurídico sobre obligaciones legales concretas exigibles a la UTN FRC (salvo ampliación solicitada por la cátedra).

---

## 3. Alcance según el GHG Protocol y delimitación entre dimensiones

### 3.1 Clasificación de alcances (GHG Protocol)
El *Corporate Value Chain (Scope 3) Accounting and Reporting Standard* (GHG Protocol, WRI/WBCSD, 2011) clasifica las emisiones organizacionales en tres alcances:

- **Alcance 1:** emisiones directas provenientes de fuentes controladas o propiedad de la organización (por ejemplo, combustión de gas en calderas o cocinas propias, o fugas directas de gases refrigerantes).
- **Alcance 2:** emisiones indirectas asociadas a la generación de la energía eléctrica comprada y consumida en el campus.
- **Alcance 3:** resto de emisiones indirectas ocurridas en la cadena de valor aguas arriba y aguas abajo, incluyendo la producción de bienes adquiridos a terceros.

La compra anual de alimentos y bebidas que realiza la cantina para su venta o elaboración encuadra exactamente en **Alcance 3, Categoría 1: Bienes y servicios comprados** (*Purchased Goods and Services*). Se contabilizan las emisiones acumuladas desde la producción primaria hasta que esos bienes llegan al comercio minorista/cantina.

### 3.2 Matriz completa de delimitación (prevención de doble conteo)
Uno de los pilares del proyecto *Campus CO₂* es evitar que dos grupos sumen dos veces la misma actividad física. La delimitación adoptada por el Grupo 11 es la siguiente:

| Tema / Actividad en la cantina | Dimensión responsable | Alcance | Tratamiento en este módulo |
| --- | --- | --- | --- |
| **Alimentos y bebidas comprados** (insumos, productos elaborados y bebidas envasadas) | **Dimensión 11 (este módulo)** | **Alcance 3 (Cat. 1)** | Se registra, convierte a kg y multiplica por el factor *cuna a comercio minorista*. |
| **Electricidad de heladeras, freezers, máquina de café, hornos, microondas y tostadora** | Dimensión 1 (Energía eléctrica) | Alcance 2 | Se relevaron los equipos en campo y se estimaron ~`30.000 kWh/año` (`29.978 kWh` exactos). **Nunca se suma al total de alimentos**; se muestra aparte solo a título informativo en la pestaña *Resultados*. |
| **Gas o combustibles de cocina** | Dimensión 2 (Gas / combustibles) | Alcance 1 | En las visitas no se observaron equipos o conexiones de gas a la vista; quedó pendiente de confirmación formal con el concesionario. |
| **Gases refrigerantes de equipos de frío** (ej. `R290`, `R600a`) | Dimensión 3 (Refrigerantes) | Alcance 1 (fugitivas) | Se registraron los refrigerantes según fichas comerciales de referencia y queda confirmar cada chapa técnica para pasar el dato al equipo correspondiente. |
| **Insumos y consumibles de servicio** (vasos descartables de telgopor, cajas de pizza, bolsas de papel y plásticas) | Dimensión 14 (Papel, insumos y consumibles) | Alcance 3 | Quedan fuera del cálculo alimentario porque no constituyen alimento ni envase primario de fabricante. |
| **Residuos de comida y envases posconsumo** | Dimensión 12 (Residuos) | Alcance 3 | Excluidos para no duplicar etapa fin de vida; también motivó descartar bases de ciclo de vida *cuna a tumba* (como RIVM). |
| **Consumo de agua de red** | Dimensión 13 (Agua) | Alcance 3 | Excluida de este módulo (aquí solo se mide agua mineral/saborizada *embouteillée* comprada como mercadería). |

---

## 4. Límite del ciclo de vida: "Cuna a comercio minorista" (*cradle-to-retail*)

### 4.1 Definición adoptada y aclaración sobre terminología OWID
Tras contrastar el manuscrito aceptado de Poore y Nemecek (2018), el límite del sistema utilizado abarca desde la fabricación de insumos agropecuarios y producción primaria hasta el comercio minorista (**cuna a comercio minorista** / *cradle-to-retail*). Incluye:
- Producción primaria / agrícola-ganadera y cambio de uso del suelo.
- Procesamiento industrial y transformación.
- **Envase primario del alimento o bebida** (botella PET, lata de aluminio, cartón, film o bolsa de fabricante).
- Transporte y logística hasta el punto de venta minorista (más distribución minorista en Agribalyse).

Quedan **excluidos** del factor: el transporte desde la cantina/comercio hasta el hogar del consumidor, la refrigeración o cocción dentro de la cantina o el hogar (`Consommation`), y la disposición final del residuo.

> **Matiz bibliográfico resuelto:** las preguntas frecuentes (FAQ) de *Our World in Data* (OWID) mencionan coloquialmente "cuna a puerta de fábrica" (*cradle-to-gate*) al resumir la base, pero la revisión directa del manuscrito de Poore y Nemecek (2018) confirma que el límite real incluye hasta el comercio minorista. Se adoptó la definición de la fuente primaria (**cuna a comercio minorista**) para todo el sistema.

### 4.2 Implicancias metodológicas concretas
1. **No se suma aparte el envase primario:** una botella de gaseosa o una lata de energizante ya incorpora el impacto de fabricar el PET o el aluminio dentro de su `kg CO₂e/kg`. Sumarlo nuevamente en otra categoría implicaría doble conteo.
2. **Coherencia al incorporar bebidas y snacks:** al buscar factores secundarios en ADEME Agribalyse v3.2, se restó explícitamente la sexta etapa (`Consommation`) justamente para alinear el límite al mismo corte *cuna a comercio minorista*.
3. **Exclusión del dato local INTA por incompatibilidad de límite:** una nota periodística basada en un estudio del INTA sobre carne vacuna argentina sugería valores cercanos a `31 kg CO₂e/kg` hasta la salida del establecimiento ganadero (*cradle-to-farm gate*). Como ese corte excluye faena, frío industrial, envase, pérdidas y transporte hasta comercio minorista, no puede mezclarse en el cálculo con los demás alimentos de Poore y Nemecek (2018). Se mantiene únicamente como referencia contextual sobre posible brecha entre ganadería argentina y promedio mundial.
4. **Métrica temporal GWP100:** la serie base de Poore y Nemecek (2018) vía OWID utiliza potencial de calentamiento global a 100 años del Quinto Informe del IPCC (**AR5**), mientras que Agribalyse v3.2 utiliza **PEF EF 3.1**. Queda como verificación de cierre confirmar con la cátedra el horizonte oficial de la plataforma central.

---

## 5. Modelo de medición, fórmulas y reglas de conversión

### 5.1 Diferencia conceptual frente a dimensiones energéticas
A diferencia de Dimensión 1 (Energía eléctrica), donde la ecuación física es `potencia × tiempo × FE`, en alimentación **no intervienen potencia ni horas de uso**. El dato de actividad es la **masa física comprada durante un año calendario completo** de cada producto o ingrediente.

### 5.2 Ecuaciones del sistema
Para cada compra anual registrada en una categoría $i$:

$$\text{Masa (kg)}_i = \text{convertir\_a\_kg}(\text{cantidad}_i,\ \text{unidad}_i,\ \text{peso\_unitario\_kg}_i)$$

$$\text{Emisiones (kg CO}_2\text{e)}_i = \text{Masa (kg)}_i \times \text{FE}_{\text{categoría}}(i)$$

Para productos elaborados en la cocina (**Receta** con ingredientes $j = 1 \dots m$):

$$\text{Masa por unidad (kg)} = \sum_{j=1}^{m} \text{kg\_por\_unidad}_j \qquad \text{Emisiones por unidad (kg CO}_2\text{e/u)} = \sum_{j=1}^{m} \left(\text{kg\_por\_unidad}_j \times \text{FE}_j\right)$$

$$\text{Emisiones de la receta (kg CO}_2\text{e)} = \text{cantidad\_anual\_unidades} \times \sum_{j=1}^{m} \left(\text{kg\_por\_unidad}_j \times \text{FE}_j\right)$$

Huella anual total del inventario cargado:

$$\text{Huella total (kg CO}_2\text{e)} = \sum_{i} \text{Emisiones}_i \qquad \text{Huella total (t CO}_2\text{e)} = \frac{\text{Huella total (kg CO}_2\text{e)}}{1.000}$$

### 5.3 Variables del modelo y conversiones admitidas

| Variable | Qué representa | Unidad / Valores admitidos |
| --- | --- | --- |
| **Cantidad anual** | Volumen o unidades compradas (o elaboradas vendidas) en todo el año | Numérico `> 0` (`unidad`, `kg`, `g`, `l`, `ml`) |
| **Peso por unidad** | Peso neto unitario del envase según etiqueta o estimación. Obligatorio **solo** cuando la unidad es `unidad`. | `kg` (`> 0`) |
| **Categoría** | Grupo alimentario que determina el Factor de Emisión aplicable | 13 códigos estandarizados (o `receta_elaborada` con sus ingredientes) |
| **Factor de emisión (FE)** | Emisiones de ciclo de vida por kg de alimento (`cuna a comercio minorista`) | `kg CO₂e/kg` |
| **Edificio** | Dependencia física donde opera la cantina relevada | Entero `id_edificio` (`Cantina principal`, `Otro edificio`) |
| **Período** | Año calendario del inventario (strictamente **anual**; no se fabrican series mensuales) | Entero `2000–2100` |
| **Fuente del dato** | Trazabilidad documental del volumen informado | `Factura o remito`, `Entrevista al concesionario`, `Estimación desde fotos`, `Otra` |

Reglas exactas implementadas en `aKg()` (`frontend/app.js`):
- `unidad`: `cantidad × peso_unitario_kg` (ej.: `4.000` botellas de `500 ml` con `peso_unitario_kg = 0,5` → `2.000 kg`; `3.000` alfajores de `60 g` con `peso_unitario_kg = 0,06` → `180 kg`).
- `kg`: valor directo sin conversión (`cantidad`).
- `g`: `cantidad / 1.000`.
- `l` (litros): valor directo asumiendo **densidad aproximada de `1 kg/l`** (supuesto explícito del grupo para bebidas acuosas y leche).
- `ml` (mililitros): `cantidad / 1.000` (aplica también densidad `1 kg/l`).

---

## 6. Relevamiento de campo realizado en la cantina de la UTN FRC

### 6.1 Información requerida y responsables de origen

| Información requerida | Dónde se encuentra | Fuente / Responsable |
| --- | --- | --- |
| Cantidades compradas anuales por producto | Facturas y remitos de proveedores | Concesionario de la cantina *(pendiente)* |
| Frecuencia de reposición y días de apertura reales | Experiencia operativa diaria | Concesionario / encargados *(pendiente confirmar)* |
| Recetas exactas de comida elaborada | Cocina del local | Personal de cocina *(estimado en 4 plantillas)* |
| Gramajes y formatos de envases comerciales | Etiquetas impresas en los productos | Relevado por Grupo 11 mediante fotografías |
| Equipos instalados, potencias y consumo eléctrico | Chapas técnicas y medidor eléctrico del local | Relevado por Grupo 11 mediante fotografías (parcial) |

### 6.2 Cronología de visitas y condiciones operativas
- **Primera visita (23-10-2026):** relevamiento fotográfico de heladeras exhibidoras, mostradores y oferta expuesta al público en el salón de ventas.
- **Segunda visita (05-11-2026):** relevamiento fotográfico de la cocina, el depósito, la barra de café, el tablero eléctrico y el medidor eléctrico propio.
- **Horario observado de atención:** `8:00 a 22:30 hs` (`14,5 horas por día`).
- **Resguardo de privacidad:** en varias fotografías figuran trabajadores y clientes; para su inclusión en el **Anexo B** de `Grupo 11 TP3.docx` se deben difuminar los rostros.

### 6.3 Oferta alimentaria e insumos relevados en campo
- **Bebidas envasadas** (principal volumen de ventas visible): gaseosas línea Coca-Cola (`Coca-Cola`, `Fanta`, `Sprite`), aguas minerales y aguas saborizadas, jugos, isotónicos y energizantes (`Monster`, `Red Bull`).
- **Lácteos:** leche en cartón y yogures.
- **Comida elaborada en cantina:** sándwiches y baguettes (milanesa de carne, milanesa de pollo, ternera, bondiola, jamón y verdura), tortuguitas/tartuguitas, tortas y pizzas (incluyendo formato para llevar).
- **Snacks y golosinas:** papas fritas en bolsa, nachos, galletitas, alfajores y barras proteicas.
- **Cafetería:** café en granos molido en el propio local mediante molino dedicado.
- **Insumos de cocina observados en heladera:** masa o prepizzas, queso en bolsas y otros ingredientes base.
- **Consumibles descartables (derivados a Dimensión 14):** vasos descartables de telgopor, cajas de pizza, bolsas de papel y bolsas plásticas.

### 6.4 Limitaciones vigentes del relevamiento
El trabajo declara explícitamente cinco restricciones de calidad de datos de entrada:
1. Las fotografías capturan el inventario exhibido en un instante dado, no el flujo real de compras a lo largo de un año completo.
2. Todavía no se obtuvieron facturas ni remitos de proveedores; por eso los totales anuales del relevamiento se trabajan mediante **3 escenarios paramétricos** (`Mínimo`, `Intermedio`, `Máximo`).
3. No se tuvo acceso a precios de compra (no usados por la fórmula de masa, aunque relevantes si se evaluara gasto) ni a las recetas pesadas exactas de cocina.
4. Algunos gramajes en envases o etiquetas no resultan legibles con nitidez en las fotos tomadas.
5. Varios modelos y potencias de equipamiento son aproximados a partir de fichas comerciales de gama media, pendientes de lectura directa en chapa.

---

## 7. Equipamiento relevado y consumo eléctrico informativo (excluido del inventario de alimentos)

Aunque la electricidad no pertenece a la Dimensión 11, el Grupo 11 relevó los equipos eléctricos de la cantina para aportar el dato base al equipo de **Dimensión 1 (Energía eléctrica · Alcance 2)** y demostrar la separación de alcances dentro de la interfaz del sistema.

### 7.1 Decisiones y criterios de estimación eléctrica
- **Heladeras exhibidoras:** en salón se observan vitrinas con gráfica de Coca-Cola, Yeti, Briket e Inelro; como simplificación uniforme se adoptó el modelo **Inelro MT-450** (`437 L`, `380 W`, refrigerante `R290` según ficha comercial).
- **Freezers horizontales:** modelo de referencia **Inelro FIH-350** (`280 L`, `135 W`, `1,3 A`, clase `A++`, refrigerante inflamable `R600a` según manual técnico del fabricante).
- **Equipos de cocción y café:** se adoptó gama media dentro de rangos de catálogos (`2.600–3.600 W` → `3,0 kW` para espresso 2 grupos; `1.200–2.200 W` → `1,7 kW` horno eléctrico Peabody; `900–1.500 W` → `1,2 kW` microondas).
- **Exclusión de equipos inactivos:** dos microondas chicos de color blanco observados desenchufados no fueron contabilizados; permanecen activos un Whirlpool y un Zenith. La tostadora figura como "Standard" o "Speedy" (a verificar en chapa).
- **Régimen de días:** equipos de frío encendidos **`365` días/año** las `24` horas con factor de uso del compresor del `50 %`; equipos de cocina y café calculados sobre **`275` días de apertura/año** (punto intermedio de `250–300`).

### 7.2 Inventario eléctrico por equipo (`29.978 kWh/año ≈ 30.000 kWh/año`)

| Equipo | Cant. | Referencia | Potencia (`kW`) | Factor / Régimen diario | `kWh/día` por unidad | `kWh/año` total |
| --- | ---: | --- | ---: | --- | ---: | ---: |
| Vitrina / heladera exhibidora | 10 | Inelro MT-450 (`437 L`) | `0,380` | `50 %` (`24 h`, `365 d`) | `4,56` | **`16.644`** |
| Freezer horizontal | 2 | Inelro FIH-350 (`280 L`) | `0,135` | `50 %` (`24 h`, `365 d`) | `1,62` | **`1.183`** |
| Frigobar bajo mesada | 2 | Supuesto | `0,080` | `50 %` (`24 h`, `365 d`) | `0,96` | **`701`** |
| Máquina café espresso 2 grupos (Mónaco) | 1 | Gama media | `3,000` | `35 %` (`14,5 h`, `275 d`) | `15,20` | **`4.187`** |
| Molino de café | 1 | Supuesto | `0,350` | `10 %` (`14,5 h`, `275 d`) | `0,51` | **`140`** |
| Horno eléctrico (Peabody) | 1 | Punto medio rango | `1,700` | `100 %` durante `3 h/día` (`275 d`) | `5,10` | **`1.403`** |
| Horno de convección (Arianna) | 1 | Supuesto | `3,000` | `100 %` durante `4 h/día` (`275 d`) | `12,00` | **`3.300`** |
| Microondas (Whirlpool y Zenith) | 2 | Punto medio rango | `1,200` | `100 %` durante `2 h/día` (`275 d`) | `2,40` | **`1.320`** |
| Tostadora | 1 | Supuesto | `2,000` | `100 %` durante `2 h/día` (`275 d`) | `4,00` | **`1.100`** |
| **Total tabla (redondeado en UI)** | **21** | — | — | `365 d` frío · `275 d` cocina | — | **`29.978` (`≈ 30.000`)** |

*Nota de verificación matemática:* `10×4,56×365 = 16.644`; `2×1,62×365 = 1.182,6 → 1.183`; `2×0,96×365 = 700,8 → 701`; `1×3,0×0,35×14,5×275 = 4.186,875 → 4.187`; `1×0,35×0,10×14,5×275 = 139,56 → 140`; `1×5,1×275 = 1.402,5 → 1.403`; `1×12×275 = 3.300`; `2×2,4×275 = 1.320`; `1×4×275 = 1.100`. La suma exacta de la tabla de la Sección 11.2 da **`29.978 kWh/año`**.

### 7.3 Cómo validar y convertir este anexo eléctrico en la Dimensión 1
- **Microondas:** verificar si la potencia leída en la chapa corresponde a consumo de red o potencia útil de microondas (si fuese de salida, la potencia absorbida sería mayor).
- **Etiquetas de eficiencia energética:** en el freezer de cocina se distinguió categoría `A+`, pero la cifra anual exacta (`kWh/año`) no alcanzó a leerse; fotografiar de cerca brinda un dato más preciso que `potencia × factor de uso`.
- **Lectura del medidor eléctrico propio:** la cantina cuenta con medidor en caja transparente y un circuito identificado como `"Heladeras"` en el tablero. Tomar dos lecturas separadas por varios días permitiría validar el consumo real diario si dicho medidor aísla exclusivamente a la cantina.
- **Factor de red eléctrica argentina:** los datos oficiales publicados por la Secretaría de Energía llegan hasta 2023 (`0,386–0,466 kg CO₂/kWh` según serie reciente 2021–2023); corresponde consultar a la cátedra qué factor único aplicará Dimensión 1 para el período `2026`.
