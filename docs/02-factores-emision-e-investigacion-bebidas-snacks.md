# Catálogo de factores de emisión (13/13 verificadas) e investigación de bebidas y snacks

En su versión actual, el módulo **Campus CO₂ · Cantina** opera con **13 categorías alimentarias todas verificadas científicamente (`0` categorías `(demo)` pendientes)**, articuladas en una arquitectura limpia de **dos bases institucionales complementarias** alineadas al mismo corte del ciclo de vida: **cuna a comercio minorista** (*cradle-to-retail*).

---

## 1. De "fuente única con huecos `(demo)`" a dos bases complementarias verificadas

En la versión inicial del proyecto (`files/files/app.js` y primer borrador de `Grupo 11 TP3.docx`), el grupo trabajaba exclusivamente con los 8 productos agropecuarios de **Poore y Nemecek (2018)** vía *Our World in Data* (OWID), mientras que las 5 categorías de bebidas envasadas y snacks —que representan la mayor parte de la masa vendida al público en salón— llevaban valores provisorios sin respaldo científico etiquetados como `(demo)`:

| Categoría (`app.js`) | Valor `(demo)` anterior | Estado en borrador original | Valor verificado vigente (`kg CO₂e/kg`) | Base institucional vigente |
| --- | ---: | --- | ---: | --- |
| `bebidas_gaseosas` | `0,60` | Sin fuente (`demo: true`) | **`0,49`** | ADEME Agribalyse v3.2 (`Code_AGB 18018`) |
| `agua` | `0,20` | Sin fuente (`demo: true`) | **`0,32`** | ADEME Agribalyse v3.2 (`Code_AGB 18430`) |
| `jugos_isotonicos` | `0,90` | Sin fuente (`demo: true`) | **`0,73`** *(alt. `0,91`)* | ADEME Agribalyse v3.2 (`Code_AGB 2012` + `18339`) |
| `energizantes` | `1,00` | Sin fuente (`demo: true`) | **`0,68`** | ADEME Agribalyse v3.2 (`Code_AGB 18352`) |
| `snacks` | `2,50` | Sin fuente (`demo: true`) | **`3,47`** *(rango `1,40–7,24`)* | ADEME Agribalyse v3.2 (`4004, 38105, 24030, 31012`) |

Con la incorporación y verificación directa contra la API oficial de ADEME de estos 5 factores, se cerró el `100 %` del catálogo manteniendo el límite exacto *cuna a comercio minorista* y cubriendo el envase primario (PET, aluminio, cartón o film).

---

## 2. Fuente primaria 1: Poore y Nemecek (2018) vía *Our World in Data* (8 categorías básicas)

Los insumos agropecuarios principales siguen respaldados por **Poore, J. y Nemecek, T. (2018)**, *"Reducing food's environmental impacts through producers and consumers"* (*Science*, 360(6392), 987–992), compilación global sobre aproximadamente `38.000` establecimientos en `119` países, difundida en formato abierto por **Our World in Data (OWID)** bajo GWP100 del **IPCC AR5**.

### 2.1 Aclaración sobre las dos series históricas en OWID (`99,48` vs. `60`)
Durante el desarrollo del TP se detectó una discrepancia visible dentro de OWID para carne vacuna de rodeo (`99,48` vs. `60 kg CO₂e/kg`). La revisión contra la documentación y FAQ oficiales de OWID permitió explicarla con precisión:

1. **Serie base actual (`99,48 kg CO₂e/kg`):** corresponde a la **media** del estudio (*rodeo de carne / beef herd*) e incluye pérdidas de cadena. La FAQ de OWID cita explícitamente al paper con `99,5 kg CO₂e/kg`, coincidiendo con este valor redondeado.
2. **Gráfico antiguo de desglose (`60 kg CO₂e/kg`):** correspondía a la **mediana** de un gráfico viejo que excluía pérdidas en la cadena de suministro. OWID actualizó dicho gráfico el **15 de junio de 2022** para incluir pérdidas y usar la media, igualando ambas series.
3. **Corrección aplicada:** la v2 temprana del TP atribuía erróneamente la diferencia a un "ajuste por desperdicio" externo. El valor `60` **no es una alternativa metodológica válida** para la serie actual y en la aplicación web se emplea exclusivamente `99,48` como base uniforme, reservando la serie de límites inferiores (`60`, `21`, `17`, etc.) solo como nota histórica de sensibilidad.

### 2.2 Tabla de factores de Poore y Nemecek (2018) implementados en `app.js`

| Código (`app.js`) | `id_factor` | Categoría | Valor base (`kg CO₂e/kg`) | Cota histórica inferior (sensibilidad) | Unidad reportada originalmente en el paper | Estado de contraste (Sec. 16 TP) |
| --- | ---: | --- | ---: | ---: | --- | --- |
| `carne_vacuna` | `1` | Carne vacuna | **`99,48`** | `60` | Rodeo de carne | FAQ OWID cita `99,5` (coincide); falta tabla suplementaria por unidad |
| `cafe_granos` | `3` | Café en granos | **`28,53`** | `17` | Por porción | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |
| `queso` | `2` | Queso | **`23,88`** | `21` | Por `100 g` proteína | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |
| `cerdo_fiambres` | `4` | Cerdo y fiambres | **`12,31`** | `7` | Por `100 g` proteína | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |
| `pollo` | `5` | Pollo | **`9,87`** | `6` | Por `100 g` proteína | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |
| `huevos` | `6` | Huevos | **`4,67`** | `4,5` | Por `100 g` proteína | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |
| `leche` | `7` | Leche | **`3,15`** | `3` | Por litro | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |
| `harinas_pan` | `8` | Harinas y pan | **`1,57`** | `1,4` | Por `1.000 kcal` | Serie OWID por kg verificada; pendiente contraste unitario contra suplemento |

*(Nota metodológica: el año de referencia guardado en `MOCK_FACTORES` para las 8 entradas es `anio_referencia: 2018` y la etapa es `"cuna a comercio minorista"`.)*

---

## 3. Fuente secundaria 2: Investigación de bebidas y snacks — ADEME Agribalyse v3.2

### 3.1 Criterios de selección y comparativa de seis bases públicas internacionales
Para cubrir gaseosas, agua embotellada, jugos/isotónicos, energizantes y snacks sin romper el modelo `masa_kg × FE` ni el límite *cuna a comercio minorista*, se evaluaron **seis fuentes públicas abiertas** bajo cuatro requisitos: unidad en `kg CO₂e/kg`, compatibilidad con el corte hasta comercio minorista, inclusión explícita del envase primario (PET/lata/cartón) y trazabilidad abierta:

| Base de datos / Fuente | Límite de ciclo de vida | Envase incluido | Unidad y métrica | Acceso y cobertura de las 5 categorías | Decisión metodológica |
| --- | --- | --- | --- | --- | --- |
| **ADEME Agribalyse v3.2** (Francia, actualización 2025) | Desagregado en 6 etapas; al excluir `Consommation` equivale exactamente a *cuna a comercio minorista* | Sí (PET, cartón, aluminio, film), explícito en la etapa `Emballage` | `kg CO₂e/kg` · PEF EF 3.1 (GWP100) | Abierto (`data.ademe.fr`, `agribalyse.ademe.fr`, `impactco2.fr`); cubre las 5 categorías con desglose por etapa y puntaje de calidad DQR | **Seleccionada como fuente secundaria única.** Permite recortar en comercio minorista sin doble conteo y auditar cada etapa. |
| **DEFRA / DESNZ** (Reino Unido, 2023–2026) | Cuna a compra del consumidor (modelo económico insumo-producto) | Implícito en gasto sectorial | `kg CO₂e / £` gastada (COICOP, ej. `1.2.2`) | Abierto, pero para alimentos y bebidas publica multiplicadores monetarios y no factores físicos por masa | **Descartada.** Incompatible con `masa_kg × FE` y distorsionada por precios y tipo de cambio británicos. |
| **CONCITO Big Climate Database** (v1.0–1.2, Dinamarca) | Cuna a comercio minorista, pero suma fin de vida y créditos de reciclaje del envase | Sí (producción + posconsumo del envase) | `kg CO₂e/kg` · IPCC AR5 + iLUC | Abierto (CC-BY, ~500 ítems); modela gaseosas y energizantes tomando referencias de Amienyo et al. | **Solo contraste externo.** Aplica ACV consecuencial (proveedores marginales + iLUC), incompatible con el enfoque atribucional del inventario. |
| **RIVM Food Database** (v2.1–3.0, Países Bajos) | Cuna a tumba (incluye conservación, preparación y residuos domésticos) | Sí | `kg CO₂e/kg` · LCA Blonk/RIVM | Abierto (~411 alimentos), orientado a dieta consumida en el hogar | **Descartada.** Excede el límite del TP y superpone etapa residuos (Dimensión 12). |
| **SU-EATABLE LIFE** (Petersson et al., 2021) | Cuna a centro de distribución regional (excluye comercio minorista) | Parcial, según los estudios compilados | `kg CO₂e/kg` · compilación europea | Abierto (`Scientific Data` / Figshare), enfocado en *commodities* y básicos | **Secundaria.** Menor cobertura en bebidas ultraprocesadas y corte previo al minorista. |
| **International EPD® System (ISO 14025)** y **Amienyo et al. (2013)** | EPD: cuna a tumba por módulos (`Upstream`, `Core`, `Downstream`); Amienyo: cuna a tumba | Sí, con gramaje exacto de preforma PET o lata | `kg CO₂e/L` (ISO 14025 / CML 2001) | Disperso por marca comercial y formato; sólido en agua mineral (Fonteviva) y carbonatadas (Amienyo) | **Usada como validación cruzada** del peso del envase primario, no como catálogo único para 5 rubros heterogéneos. |

### 3.2 Auditoría directa contra la API oficial de ADEME y desglose por etapas
Todos los factores incorporados al módulo fueron verificados directamente contra el conjunto de datos oficial **`agribalyse-31-detail-par-etape`** en `data.ademe.fr` (etiquetado **`AGRIBALYSE® v3.2`**, fecha de actualización en catálogo septiembre de 2025) y contrastados con la interfaz oficial `impactco2.fr`.

La tabla de desglose de Agribalyse divide cada producto en **6 etapas** medidas en `kg CO₂e/kg` de alimento:
1. `Agriculture` (producción agrícola de azúcar, concentrados, cacao, papa, maíz, lácteos o captación).
2. `Transformation` (procesamiento y embotellado/elaboración industrial).
3. `Emballage` (fabricación del envase primario: PET, lata de aluminio, film o cartón).
4. `Transport` (logística de materias primas y distribución hasta plataforma/comercio).
5. `Supermarché et distribution` (almacenamiento, frío y operación minorista).
6. `Consommation` (refrigeración y consumo en el hogar) — **excluida sistemáticamente** en este módulo para igualar el corte *cuna a comercio minorista*.

#### Tabla verificada de etapas y DQR (todos en `kg CO₂e/kg`)

| Categoría / Subcomponente | `Code_AGB` | Producto oficial en ADEME Agribalyse v3.2 | `DQR` | Agric. | Transf. | Envase (`Emballage`) | Transp. | Distrib. (`Supermarché`) | Consumo *(excl.)* | **Suma cuna-minorista** | Total c/ consumo |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Gaseosas (`0,49`)** | `18018` | *Cola, sucré* | `1,90` | `0,0902` | `0,0130` | `0,1380` (`28,4 %`) | `0,2090` (`43,0 %`) | `0,0363` | `0,00683` | **`0,4865`** | `0,4933` |
| **Agua (`0,32`)** | `18430` | *Eau embouteillée de source* | `1,66` | `0,00106` | `0,0000` | `0,1870` (`58,5 %`) | `0,1160` (`36,3 %`) | `0,0157` | `0,000975` | **`0,3198`** | `0,3207` |
| **Jugos/Isot. · componente 1** | `2012` | *Jus d'orange, à base de concentré* | `2,82` | — | — | — | — | — | `0,0000` | **`0,9056`** | `0,9056` |
| **Jugos/Isot. · componente 2** | `18339` | *Boisson plate aux fruits (10–50 % jus), sucrée* | `2,72` | `34,0 %` (`~0,190`*) | — | `24,7 %` (`~0,138`*) | `34,9 %` (`~0,195`*) | `6,5 %` (`~0,036`*) | `0,00683` | **`0,5595`** | `0,5664` |
| **Energizantes (`0,68`)** | `18352` | *Boisson énergisante, sucrée* *(y `18353` sin azúcar, DQR `1,98`)* | `2,06` | `0,0808` (`11,9 %`) | `0,000295` (`0,04 %`) | **`0,3630` (`53,6 %`)** | `0,1970` (`29,1 %`) | `0,0363` (`5,4 %`) | `0,00683` | **`0,6774`** | `0,6842` |
| **Snacks · 30 % papas fritas** | `4004` | *Chips de pommes de terre, standard* | `1,77` | — | — | — | — | — | `0,0000` | **`1,3969`** | `1,3969` |
| **Snacks · 20 % tortilla chips/nachos** | `38105` | *Chips de maïs ou tortilla chips* | `1,77` | — | — | — | — | — | `0,0000` | **`2,3359`** | `2,3359` |
| **Snacks · 25 % galletitas c/ leche** | `24030` | *Biscuit sec au lait* | `1,42` | — | — | — | — | — | `0,0000` | **`3,0839`** | `3,0839` |
| **Snacks · 25 % barras choc./alfajores** | `31000` / `31012` | *Barre chocolatée biscuitée* / *au lait* | `2,26` | — | — | — | — | — | `0,0000` | **`7,2449`** | `7,2449` |

*(Nota sobre `DQR`: Data Quality Rating europeo del PEF; valores menores a `3,0` indican confiabilidad sólida. Todas las entradas seleccionadas tienen DQR entre `1,42` y `2,82`. Para `Code_AGB 18339`, los valores entre paréntesis con `*` están derivados a partir de las participaciones porcentuales de etapa publicadas en `investigacion-para-bebidas-snacks.md` (`34,0 %` agricultura, `24,7 %` envase, `34,9 %` transporte y `6,5 %` distribución sobre `0,5595 kg CO₂e/kg`). Para `Code_AGB 2011` — *Jus multifruit* — se verificó `0,7966`, y para `Code_AGB 24000` — *Biscuit sec, sans précision* — `3,5859` con DQR `1,26`.)*

### 3.3 Correcciones aplicadas durante la auditoría de códigos ADEME
Al contrastar las primeras estimaciones bibliográficas contra la API viva de `data.ademe.fr`, el proceso de validación detectó y corrigió cuatro puntos exactos (ya reflejados tanto en `investigacion-para-bebidas-snacks.md` como en `frontend/app.js`):

1. **Corrección de código en barras chocolatadas (`31067` → `31000` / `31012`):** en una referencia preliminar figuraba el código `31067`, pero en la tabla oficial de ADEME `Code_AGB 31067` corresponde a *Mélasse de canne* (melaza de caña, `1,0419 kg CO₂e/kg`). Los códigos oficiales para barras chocolatadas con galleta/leche equivalentes a alfajores son **`31000`** (*Barre chocolatée biscuitée*) y **`31012`** (*Barres ou confiserie chocolatées au lait*), ambos en **`7,2449 kg CO₂e/kg`** (`DQR = 2,26`, `Consommation = 0`).
2. **Confirmación exacta de tortilla chips/nachos (`38105`):** verificado exactamente en **`2,3359` → `2,34 kg CO₂e/kg`** (`DQR = 1,77`, `Consommation = 0`).
3. **Confirmación directa de energizantes (`18352` y `18353`):** en borrador previo se había dudado sobre si `energizantes` requería contraste extra; la consulta directa de `Code_AGB 18352` arrojó exactamente `0,6774` sin consumo (`0,6842` con consumo, `DQR = 2,06`), donde la lata de aluminio aporta el `53,6 %` (`0,3630`). El valor se fijó en **`0,68 kg CO₂e/kg`** (`demo: false`), idéntico al de la versión sin azúcar (`18353`, `DQR = 1,98`).
4. **Cierre matemático de los mix ponderados:**
   - **Jugos e isotónicos (`50/50`):** $(0,9056 + 0,5595) / 2 = 0,73255 \rightarrow \mathbf{0,73\ kg\ CO_2e/kg}$. *(Alternativa directa sin ponderación si la cátedra lo pidiera: usar `0,91`, cota superior del jugo de naranja a base de concentrado `Code_AGB 2012`.)*
   - **Snacks, golosinas y alfajores (mix cantina):** $(0,30 \times 1,3969) + (0,20 \times 2,3359) + (0,25 \times 3,0839) + (0,25 \times 7,2449) = 0,41907 + 0,46718 + 0,770975 + 1,811225 = \mathbf{3,46845 \rightarrow 3,47\ kg\ CO_2e/kg}$.

### 3.4 Dispersión `5,2×` en snacks y recomendaciones futuras
El relevamiento en la cantina observó juntos productos muy disímiles bajo el rubro `snacks`: papas fritas en bolsa, nachos, galletitas, alfajores y barras proteicas. Como muestra la tabla anterior, entre las papas fritas (`1,40`) y un alfajor o barra chocolatada (`7,24`) existe una **brecha de 5,2 veces** por kilogramo, impulsada principalmente por la huella de leche y cacao del baño de chocolate.

El grupo mantuvo un único código `snacks` (`3,47`) para preservar intacta la estructura de **13 categorías** del contrato API sin romper compatibilidad. Si en una futura visita se consiguieran facturas desglosadas por familia de golosinas, se documentan dos opciones listas: adoptar `3,08` (*Biscuit sec au lait*, entrada única directa) o desdoblar la categoría en `snacks_salados` (`1,40`) y `golosinas_alfajores` (`5,42` promedio o `7,24`).

### 3.5 Análisis por categoría y validación cruzada externa
- **Gaseosas (`bebidas_gaseosas → 0,49`):** Envase (`28,4 %`) y transporte (`43,0 %`) explican `71,4 %` de la huella hasta comercio minorista (`DQR = 1,90`). Coincide con `impactco2.fr` (*Soda*, act. 15/01/2025) y resulta conservador frente a Amienyo et al. (2013) en Reino Unido (`0,293 kg CO₂e/L` en PET `0,5 L` y `0,312` en lata `0,33 L`), ya que ese estudio descuenta créditos de reciclaje posconsumo fuera de nuestro límite.
- **Agua (`agua → 0,32`):** El antiguo `(demo)` `0,20` subestimaba en `−37,5 %` respecto del dato oficial (`+60 %` de ajuste al subir a `0,32`). La captación pesa apenas `0,3 %` (`0,00106`), mientras envase PET (`58,5 %`) y logística (`36,3 %`) suman `~95 %` del impacto minorista. Contrastado con la **EPD Fonteviva `S-P-05806`** (ISO 14025, verificada por DNV, PET `0,5 L` con `27 g/L` de preforma: `0,232 kg CO₂e/L` cuna a tumba: `0,0885` materias primas/envase + `0,0378` embotellado + `0,105` distribución y fin de vida). **Aclaración operativa:** `0,32` aplica a agua mineral sin saborizar; las aguas saborizadas azucaradas se asemejan a `Code_AGB 18339` (`0,56 kg CO₂e/kg`) y conviene cargarlas en gaseosas o jugos.
- **Jugos e isotónicos (`jugos_isotonicos → 0,73`):** Combina un jugo concentrado con mayor carga agrícola (`0,9056`) y una bebida frutal/isotónica (`0,5595`). El peso de `1 l = 1 kg` sigue siendo un supuesto conservador explícito.
- **Energizantes (`energizantes → 0,68`):** A diferencia de la distribución promedio de envases en gaseosas (`0,49`), aquí domina la **lata de aluminio (`53,6 %`, `0,3630`)**. Contrastado con Amienyo et al. (2013) para lata `0,33 L` (`0,312`, con `79 %` atribuido al envase tras créditos de reciclaje) y con el rango en *Open Food Facts* (`0,57–1,37` según mapeos manuales).

---

## 4. Cuatro matices metodológicos clave para defender ante la cátedra

Al integrar Poore y Nemecek (2018) con ADEME Agribalyse v3.2, el grupo documenta explícitamente cuatro salvedades técnicas de rigor académico (listas para incorporar en la **Sección 12** del informe):

1. **Consistencia estricta del límite de sistema (sin doble conteo):** Agribalyse llega por defecto hasta el plato del consumidor (*cradle-to-consumption*). Al restar sistemáticamente la etapa `Consommation` (`0,7 %–1,4 %` en bebidas frías y `0 %` en snacks), la frontera empata exactamente con el corte *cuna a comercio minorista* de Poore y Nemecek. De ese modo, el envase primario queda dentro del inventario alimentario, mientras las heladeras propias de la cantina permanecen exclusivamente en Dimensión 1 (~`30.000 kWh/año`) y los descartes van a Dimensión 12.
2. **Sesgo geográfico por matriz eléctrica (Francia vs. Argentina):** Agribalyse modela procesos industriales y refrigeración minorista con la matriz francesa, fuertemente nuclear y baja en emisiones (`~0,0519 kg CO₂e/kWh` en 2024 según ADEME). En contraste, la red eléctrica argentina (Secretaría de Energía / CAMMESA 2021–2023) oscila entre `0,386` y `0,466 kg CO₂/kWh` (punto medio `~0,426`; brecha aproximada de `0,374 kg CO₂e/kWh`). A modo de orden de magnitud de sensibilidad, si las etapas eléctricas de embotellado y frío minorista demandaran entre `0,05` y `0,15 kWh/L`, esa diferencia de matriz representaría una subestimación acotada del orden de `+0,02` a `+0,06 kg CO₂e/L` (muy por debajo del peso del PET/aluminio y del transporte carretero). Se declara como limitación geográfica en lugar de aplicar factores de corrección *ad hoc* sin respaldo peer-reviewed.
3. **Diferencia menor de métrica GWP100 (`IPCC AR5` vs. `PEF EF 3.1`):** Poore y Nemecek (2018) reportan bajo AR5 y Agribalyse v3.2 bajo PEF EF 3.1. Las discrepancias relevantes entre ambas métricas ocurren sobre el metano biogénico (carne bovina y lácteos, que siguen íntegramente en Poore y Nemecek), mientras en bebidas envasadas y snacks —dominados por CO₂ fósil de envases y flete— el impacto relativo es marginal.
4. **Sensibilidad al tamaño y material del envase:** los promedios de Agribalyse reflejan la mezcla francesa de formatos. Amienyo et al. (2013) midieron que una misma gaseosa emite `0,151 kg CO₂e/L` en botella PET familiar de `2 L`, frente a `0,293` en PET individual de `0,5 L`, `0,312` en lata de aluminio de `0,33 L` y `0,555` en vidrio descartable. Como en la cantina de la UTN FRC predominan envases individuales (`500 ml` PET y latas de `250–473 ml`), los factores adoptados (`0,32`, `0,49` y `0,68`) representan una calibración razonable y no optimista.

---

## 5. Catálogo completo implementado en `frontend/app.js` (`MOCK_FACTORES`)

| `id_factor` | `categoria` | `nombre` | `valor` (`kg CO₂e/kg`) | `etapa` | `anio_referencia` | `fuente` (exacta en `app.js`) |
| ---: | --- | --- | ---: | --- | ---: | --- |
| `1` | `carne_vacuna` | Carne vacuna | `99,48` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `2` | `queso` | Queso | `23,88` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `3` | `cafe_granos` | Café en granos | `28,53` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `4` | `cerdo_fiambres` | Cerdo y fiambres | `12,31` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `5` | `pollo` | Pollo | `9,87` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `6` | `huevos` | Huevos | `4,67` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `7` | `leche` | Leche | `3,15` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `8` | `harinas_pan` | Harinas y pan | `1,57` | cuna a comercio minorista | `2018` | Poore y Nemecek (2018), via Our World in Data |
| `9` | `bebidas_gaseosas` | Gaseosas y bebidas azucaradas | `0,49` | cuna a comercio minorista | `2025` | ADEME Agribalyse v3.2 (2025), excl. consumo · Code_AGB 18018 (Cola) |
| `10` | `agua` | Agua y aguas saborizadas | `0,32` | cuna a comercio minorista | `2025` | ADEME Agribalyse v3.2 (2025), excl. consumo · Code_AGB 18430 (Eau embouteillée) |
| `11` | `jugos_isotonicos` | Jugos e isotónicos | `0,73` | cuna a comercio minorista | `2025` | ADEME Agribalyse v3.2 (2025), excl. consumo · Mix 50/50 Code_AGB 2012 y 18339 |
| `12` | `energizantes` | Energizantes | `0,68` | cuna a comercio minorista | `2025` | ADEME Agribalyse v3.2 (2025), excl. consumo · Code_AGB 18352 (Boisson énergisante) |
| `13` | `snacks` | Snacks, golosinas y alfajores | `3,47` | cuna a comercio minorista | `2025` | ADEME Agribalyse v3.2 (2025), excl. consumo · Mix cantina Code_AGB 4004, 38105, 24030 y 31012 |

---

## 6. Referencias bibliográficas listas para incorporar en la Sección 17 de `Grupo 11 TP3.docx`

- **ADEME.** (2025). *Base de données AGRIBALYSE® v3.2 — Synthèse et détail par étape* (`agribalyse-31-detail-par-etape`). Agence de la Transition Écologique, Francia. https://data.ademe.fr/datasets/agribalyse-31-detail-par-etape · Portal metodológico: https://agribalyse.ademe.fr/ · Calculadora oficial: https://impactco2.fr/
- **Amienyo, D., Gujba, H., Stichnothe, H., y Azapagic, A.** (2013). Life cycle environmental impacts of carbonated soft drinks. *The International Journal of Life Cycle Assessment*, 18(1), 77–92. https://doi.org/10.1007/s11367-012-0459-y
- **The International EPD® System.** (2022–2024). *Acqua Minerale Fonteviva in PET bottle 0.5 L* (Declaración Ambiental de Producto `S-P-05806`, ISO 14025, verificada por DNV).
- **Poore, J., y Nemecek, T.** (2018). Reducing food's environmental impacts through producers and consumers. *Science*, 360(6392), 987–992. https://doi.org/10.1126/science.aaq0216
- **Our World in Data.** *Environmental Impacts of Food Production* & *FAQs on the environmental impacts of food*. https://ourworldindata.org/environmental-impacts-of-food · https://ourworldindata.org/faqs-environmental-impacts-food
