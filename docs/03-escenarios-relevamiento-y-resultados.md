# Escenarios del relevamiento, recetas elaboradas, sensibilidad y resultados

Como todavía no se cuenta con facturas ni remitos anuales cerrados del concesionario, el grupo formuló **tres escenarios anuales paramétricos** (`Mínimo`, `Intermedio` y `Máximo`) a partir de los productos, porciones y horarios observados en las visitas del `23-10-2026` y `05-11-2026`.

En el módulo web, estos tres escenarios están precargados en `ESCENARIOS` (`frontend/app.js`) y pueden cargarse en un clic desde **Escenarios estimados** o desde la guía de estado vacío, con una casilla para **incluir o excluir las bebidas envasadas y snacks** (`chkBebidasDrawer` / `chkBebidasEmpty`). Esto permite recorrer y explicar todo el flujo sin pantallas vacías.

---

## 1. Parámetros diarios y anuales que originan los escenarios

La tabla siguiente reproduce los supuestos diarios de actividad documentados en la **Sección 13.1** de `Grupo 11 TP3.docx`, junto con los volúmenes anuales de bebidas y snacks añadidos en `frontend/app.js`:

| Parámetro del escenario | Mínimo (actividad baja) | Intermedio (estimación base) | Máximo (actividad alta) |
| --- | ---: | ---: | ---: |
| **Días de apertura al año** | `250` | `275` | `300` |
| **Cafés vendidos por día** | `60` (`15.000/año`) | `90` (`24.750/año`) | `120` (`36.000/año`) |
| **Café molido por taza** | `8 g` | `9 g` | `10 g` |
| **Leche fluida por día** | `5 l` (`1.250 l/año`) | `10 l` (`2.750 l/año`) | `15 l` (`4.500 l/año`) |
| **Sándwiches y milanesas por día** | `30` (`7.500/año`) | `55` (`15.125/año`) | `80` (`24.000/año`) |
| **Carne por sándwich** | `80 g` | `100 g` | `120 g` |
| **Proporción de carne vacuna dentro del total cárnico** | `30 %` | `40 %` | `50 %` |
| **Resto de carnes** *(mitad pollo / mitad cerdo y fiambres)* | `35 %` / `35 %` | `30 %` / `30 %` | `25 %` / `25 %` |
| **Queso por día** *(sándwiches y pizzas)* | `1,50 kg` | `3,75 kg` | `6,00 kg` |
| **Harinas y pan por día** | `5,0 kg` | `12,5 kg` | `20,0 kg` |
| **Gaseosas línea 500 ml (anual, `0,5 kg/u`)** | `4.000 u` (`2.000 kg`) | `6.000 u` (`3.000 kg`) | `9.000 u` (`4.500 kg`) |
| **Agua mineral 500 ml (anual, `0,5 kg/u`)** | `2.500 u` (`1.250 kg`) | `4.000 u` (`2.000 kg`) | `6.000 u` (`3.000 kg`) |
| **Alfajores y snacks 60 g (anual, `0,06 kg/u`)** | `2.000 u` (`120 kg`) | `3.000 u` (`180 kg`) | `4.500 u` (`270 kg`) |

*Verificación rápida de masas anuales de insumos cárnicos (ejemplo Intermedio):* `275 días × 55 sándwiches/día × 0,10 kg/u = 1.512,50 kg` de carne total; `40 %` carne vacuna = **`605,00 kg`**; `30 %` cerdo y fiambres = **`453,75 kg`**; `30 %` pollo = **`453,75 kg`**.

---

## 2. Desglose exacto de resultados en `frontend/app.js` (con 13 factores verificados)

Todos los valores siguientes fueron recalculados exactamente con los 13 factores vigentes de `MOCK_FACTORES` (`99,48` uniforme para carne vacuna y Agribalyse v3.2 para bebidas y snacks):

### 2.1 Resumen comparativo de los tres escenarios

| Métrica anual | Escenario Mínimo (`250 d`) | Escenario Intermedio (`275 d` · base) | Escenario Máximo (`300 d`) |
| --- | ---: | ---: | ---: |
| **Masa alimentos básicos (7 ítems Poore)** | `3.595,00 kg` (`51,62 %`) | `8.954,00 kg` (`63,35 %`) | `15.540,00 kg` (`66,67 %`) |
| **Emisiones solo alimentos básicos** | **`40.842,80 kg CO₂e`** (`40,8 t`) | **`115.290,26 kg CO₂e`** (`115,3 t`) | **`236.070,60 kg CO₂e`** (`236,1 t`) |
| **Masa bebidas y snacks (3 ítems Agribalyse)** | `3.370,00 kg` (`48,38 %`) | `5.180,00 kg` (`36,65 %`) | `7.770,00 kg` (`33,33 %`) |
| **Emisiones bebidas y snacks** | **`1.796,40 kg CO₂e`** (`4,21 %`) | **`2.734,60 kg CO₂e`** (`2,32 %`) | **`4.101,90 kg CO₂e`** (`1,71 %`) |
| **Masa total comprada (10 registros)** | **`6.965,00 kg`** | **`14.134,00 kg`** | **`23.310,00 kg`** |
| **Emisión anual total (kg CO₂e)** | **`42.639,20 kg CO₂e`** | **`118.024,86 kg CO₂e`** | **`240.172,50 kg CO₂e`** |
| **Emisión anual total (t CO₂e)** | **`42,639 t`** *(en tarjeta: `42,6 t`)* | **`118,025 t`** *(en tarjeta: `118,0 t`)* | **`240,173 t`** *(en tarjeta: `240,2 t`)* |
| **Intensidad promedio (con bebidas y snacks)** | `6,12 kg CO₂e/kg` | `8,35 kg CO₂e/kg` | `10,30 kg CO₂e/kg` |
| **Intensidad promedio (solo básicos)** | `11,36 kg CO₂e/kg` | `12,88 kg CO₂e/kg` | `15,19 kg CO₂e/kg` |

### 2.2 Tabla línea por línea — Escenario Intermedio (`275 días/año` · Estimación base)

| Categoría | Producto en `app.js` | Cantidad original | Masa (`kg`) | `% masa` | FE (`kg CO₂e/kg`) | Emisión (`kg CO₂e`) | `% CO₂e` |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `carne_vacuna` | Carne vacuna para sándwiches y milanesas | `605 kg` | `605,00` | `4,28 %` | `99,48` | **`60.185,40`** | **`50,99 %`** |
| `queso` | Queso en sándwiches y pizzas | `1.031,25 kg` | `1.031,25` | `7,30 %` | `23,88` | **`24.626,25`** | **`20,87 %`** |
| `leche` | Leche en barra de café | `2.750 l` | `2.750,00` | `19,46 %` | `3,15` | `8.662,50` | `7,34 %` |
| `cafe_granos` | Café en granos molido | `222,75 kg` | `222,75` | `1,58 %` | `28,53` | `6.355,06` | `5,38 %` |
| `cerdo_fiambres` | Cerdo y fiambres en sándwiches | `453,75 kg` | `453,75` | `3,21 %` | `12,31` | `5.585,66` | `4,73 %` |
| `harinas_pan` | Harinas, pan y prepizzas | `3.437,5 kg` | `3.437,50` | `24,32 %` | `1,57` | `5.396,88` | `4,57 %` |
| `pollo` | Pollo en sándwiches y milanesas | `453,75 kg` | `453,75` | `3,21 %` | `9,87` | `4.478,51` | `3,79 %` |
| `bebidas_gaseosas` | Gaseosas línea 500 ml | `6.000 u` (`0,5 kg/u`) | `3.000,00` | `21,23 %` | `0,49` | `1.470,00` | `1,25 %` |
| `agua` | Agua mineral 500 ml | `4.000 u` (`0,5 kg/u`) | `2.000,00` | `14,15 %` | `0,32` | `640,00` | `0,54 %` |
| `snacks` | Alfajores y snacks 60 g | `3.000 u` (`0,06 kg/u`) | `180,00` | `1,27 %` | `3,47` | `624,60` | `0,53 %` |
| **Total Intermedio** | **10 registros** | — | **`14.134,00`** | **`100,0 %`** | **Int.: `8,35`** | **`118.024,86`** | **`100,0 %`** |

### 2.3 Desglose de los escenarios Mínimo (`250 d`) y Máximo (`300 d`)

| Categoría | Mínimo · Masa (`kg` / `%`) | Mínimo · `kg CO₂e` (`%`) | Máximo · Masa (`kg` / `%`) | Máximo · `kg CO₂e` (`%`) |
| --- | ---: | ---: | ---: | ---: |
| `carne_vacuna` | `180,00` (`2,58 %`) | **`17.906,40` (`42,00 %`)** | `1.440,00` (`6,18 %`) | **`143.251,20` (`59,65 %`)** |
| `queso` | `375,00` (`5,38 %`) | **`8.955,00` (`21,00 %`)** | `1.800,00` (`7,72 %`) | **`42.984,00` (`17,90 %`)** |
| `leche` | `1.250,00` (`17,95 %`) | `3.937,50` (`9,23 %`) | `4.500,00` (`19,31 %`) | `14.175,00` (`5,90 %`) |
| `cafe_granos` | `120,00` (`1,72 %`) | `3.423,60` (`8,03 %`) | `360,00` (`1,54 %`) | `10.270,80` (`4,28 %`) |
| `cerdo_fiambres` | `210,00` (`3,02 %`) | `2.585,10` (`6,06 %`) | `720,00` (`3,09 %`) | `8.863,20` (`3,69 %`) |
| `pollo` | `210,00` (`3,02 %`) | `2.072,70` (`4,86 %`) | `720,00` (`3,09 %`) | `7.106,40` (`2,96 %`) |
| `harinas_pan` | `1.250,00` (`17,95 %`) | `1.962,50` (`4,60 %`) | `6.000,00` (`25,74 %`) | `9.420,00` (`3,92 %`) |
| `bebidas_gaseosas` | `2.000,00` (`28,72 %`) | `980,00` (`2,30 %`) | `4.500,00` (`19,31 %`) | `2.205,00` (`0,92 %`) |
| `snacks` | `120,00` (`1,72 %`) | `416,40` (`0,98 %`) | `270,00` (`1,16 %`) | `936,90` (`0,39 %`) |
| `agua` | `1.250,00` (`17,95 %`) | `400,00` (`0,94 %`) | `3.000,00` (`12,87 %`) | `960,00` (`0,40 %`) |
| **Total** | **`6.965,00` (`100 %`)** | **`42.639,20` (`100 %`)** | **`23.310,00` (`100 %`)** | **`240.172,50` (`100 %`)** |

---

## 3. Hallazgo central del relevamiento: peso físico vs. huella de carbono

El módulo muestra en **Paso 3 · Resultados y envío** una conclusión contraintuitiva fundamental para la toma de decisiones ambientales de la facultad: **los productos de mayor volumen físico vendido en el mostrador no son los que determinan la huella de carbono de la cantina**.

- **Concentración en el escenario Intermedio:** `Carne vacuna` (`50,99 %` de las emisiones con `4,28 %` de la masa) y `Queso` (`20,87 %` de las emisiones con `7,30 %` de la masa) explican juntos **`71,9 %` (`71,86 %`) de las emisiones totales con apenas `11,6 %` (`11,58 %`) del peso físico comprado**.
  - En el escenario **Mínimo**, carne vacuna + queso concentran **`63,00 %`** de las emisiones con **`7,96 %`** de la masa.
  - En el escenario **Máximo**, concentran **`77,55 %`** de las emisiones con **`13,90 %`** de la masa.
- **Contraste con las bebidas envasadas y snacks:** aportan entre **`33,3 %` y `48,4 %` de la masa total comprada**, pero representan apenas entre **`1,71 %` y `4,21 %` de las emisiones anuales** (en el intermedio, `5.180 kg` — `36,65 %` del peso — generan `2.734,60 kg CO₂e` — `2,32 %` de la huella).

---

## 4. Impacto de reemplazar los antiguos factores `(demo)` por ADEME Agribalyse v3.2

Al sustituir las estimaciones provisorias originales (`gaseosas: 0,60 → 0,49`, `agua: 0,20 → 0,32`, `snacks: 2,50 → 3,47`), los cambios individuales se compensan en gran medida a nivel agregado:

| Escenario | Bebidas/snacks con `(demo)` (`kg CO₂e`) | Bebidas/snacks con Agribalyse v3.2 (`kg CO₂e`) | Total anterior (`t CO₂e`) | Total nuevo (`t CO₂e`) | Variación neta |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Mínimo** | `1.750,00` | **`1.796,40`** | `42,593` | **`42,639`** | `+46,40 kg` (`+0,11 %`) |
| **Intermedio** | `2.650,00` | **`2.734,60`** | `117,940` | **`118,025`** | `+84,60 kg` (`+0,07 %`) |
| **Máximo** | `3.975,00` | **`4.101,90`** | `240,046` | **`240,173`** | `+126,90 kg` (`+0,05 %`) |

En el escenario Intermedio, la baja de `-330,00 kg CO₂e` en gaseosas (`3.000 kg × −0,11`) compensa gran parte de las subas de `+240,00 kg` en agua mineral (`2.000 kg × +0,12`) y `+174,60 kg` en snacks (`180 kg × +0,97`), dejando un ajuste neto de `+84,60 kg CO₂e` (`+0,07 %`).

---

## 5. Diferencia numérica entre la Sección 13.1 de `Grupo 11 TP3.docx` y la app web (`app.js`)

Al comparar las cifras del borrador Word original contra el prototipo web para los **7 alimentos básicos**, surge una diferencia esperada en `Mínimo` e `Intermedio` que conviene explicar claramente en la Sección 13.1 del informe:

| Escenario | Solo básicos en `Grupo 11 TP3.docx` Sec. 13.1 (`kg CO₂e`) | Criterio de FE usado en la tabla del Word | Solo básicos en `app.js` (`kg CO₂e`) | Criterio de FE usado en `app.js` |
| --- | ---: | --- | ---: | --- |
| **Mínimo** | `28.945` (`28,9 t`) | Límite inferior histórico (`carne = 60`, `queso = 21`, etc.) | **`40.842,80`** (`40,8 t`) | Serie base actual uniforme (`carne = 99,48`, `queso = 23,88`, etc.) |
| **Intermedio** | `97.997` (`98,0 t`) | Promedio entre ambas series (`carne = 79,74`, `queso = 22,44`, etc.) | **`115.290,26`** (`115,3 t`) | Serie base actual uniforme (`carne = 99,48`, `queso = 23,88`, etc.) |
| **Máximo** | `236.071` (`236,1 t`) | Serie base actual (`carne = 99,48`, etc.) | **`236.070,60`** (`236,1 t`) | Serie base actual uniforme (`carne = 99,48`, `queso = 23,88`, etc.) |

**Por qué difieren y cómo alinearlos:**
- Como se demostró en la **Sección 10.3** del TP, OWID confirmó que `60` provenía de una mediana antigua sin pérdidas actualizada en junio de 2022, por lo que no corresponde promediarla con `99,48` ni variar el factor entre escenarios.
- `frontend/app.js` implementa el criterio metodológicamente consistente: **un único catálogo oficial por categoría en los 3 escenarios** (variando únicamente los niveles de actividad comprada en la cantina), motivo por el cual el escenario Máximo coincide exactamente (`236.070,60 kg` vs. `236.071 kg` redondeados) y Mínimo/Intermedio aumentan a `40,8 t` y `115,3 t` básicos (`42,6 t` y `118,0 t` incluyendo bebidas y snacks).
- **Recomendación para `Grupo 11 TP3.docx`:** actualizar la tabla de la Sección 13.1 usando la serie base única (`40.843 / 115.290 / 236.071 kg` básicos + `1.796 / 2.735 / 4.102 kg` bebidas y snacks = **`42.639 / 118.025 / 240.173 kg`**) y mantener las cotas inferiores antiguas únicamente en la columna de análisis de sensibilidad sobre el FE.

---

## 6. Análisis de sensibilidad

### 6.1 Sensibilidad paramétrica de los alimentos básicos (Sec. 13.2 del TP)
Variando un parámetro por vez desde su valor mínimo hasta su valor máximo respecto del punto intermedio histórico de `98,0 t` del Word:

| Parámetro variado (mín → máx) | Mínimo (`t CO₂e`) | Máximo (`t CO₂e`) | Amplitud (`t CO₂e`) | Prioridad de relevamiento |
| --- | ---: | ---: | ---: | --- |
| **Sándwiches y milanesas por día** (`30 → 80`) | `72,4` | `123,6` | **`51,1`** | Crítica: contar ventas reales por turno |
| **Queso por día** (`1,5 → 6,0 kg`) | `84,1` | `111,9` | **`27,8`** | Crítica: facturas de lácteos/quesería |
| **Factor de carne vacuna** (`60 → 99,48`) | `86,1` | `109,9` | **`23,9`** | Resuelto usando serie base (`99,48`); posible brecha local INTA aparte |
| **Gramos de carne por sándwich** (`80 → 120 g`) | `86,8` | `109,2` | **`22,5`** | Alta: pesar porción en cocina |
| **Proporción de carne vacuna** (`30 % → 50 %`) | `87,3` | `108,7` | **`21,5`** | Alta: diferenciar milanesas vacuna vs. pollo/cerdo |
| **Días de apertura anuales** (`250 → 300 d`) | `89,1` | `106,9` | **`17,8`** | Media: confirmar calendario con concesionario |
| **Leche por día** (`5 → 15 l`) | `93,8` | `102,2` | `8,5` | Baja |
| **Harinas y pan por día** (`5 → 20 kg`) | `94,9` | `101,1` | `6,1` | Baja |

*(Todos los demás parámetros individuales —café y factores de queso, cerdo, pollo, pan, leche— mueven el total anual en menos de `3,5 t CO₂e`.)*

### 6.2 Sensibilidad extrema de la dispersión `5,2×` en snacks
Si en el escenario Intermedio los `180 kg/año` de *"Alfajores y snacks 60 g"* correspondieran `100 %` a barras chocolatadas o alfajores bañados en chocolate (`7,24 kg CO₂e/kg`, `Code_AGB 31000/31012`) en lugar del mix ponderado (`3,47`):
- La fila de snacks pasaría de `624,60 kg` a **`1.303,20 kg CO₂e`** (`+678,60 kg CO₂e`).
- El subconjunto bebidas + snacks subiría de `2.734,60 kg` (`2,32 %`) a `3.413,20 kg CO₂e` (**`2,88 %`** de `118.703,46 kg CO₂e`).
- Carne vacuna y queso seguirían concentrando **más del `71 %`** de las emisiones totales (`71,45 %`).

---

## 7. Plantillas de recetas elaboradas implementadas (`PLANTILLAS_RECETA`)

Para demostrar el modo **Receta elaborada** alineado con las cantidades del escenario Intermedio (cuando el usuario prefiere cargar ventas de mostrador en lugar de insumos crudos totales), `frontend/app.js` provee 4 plantillas editables en 1 clic:

| ID plantilla (`app.js`) | Producto elaborado | Ventas anuales | Ingredientes (`kg/u` · categoría) | Masa por unidad (`kg/u`) | Emisión por unidad (`kg CO₂e/u`) | FE efectivo (`kg CO₂e/kg`) | Masa total (`kg`) | Emisión anual (`kg CO₂e`) |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| `sandwich_carne` | Sándwich de milanesa de carne | `6.050 u` | Milanesa vacuna (`0,10` · `carne_vacuna`), Queso en fetas (`0,03` · `queso`), Pan baguette (`0,12` · `harinas_pan`) | `0,250` | **`10,8528`** | `43,41` | `1.512,50` | **`65.659,44`** |
| `sandwich_pollo` | Sándwich de milanesa de pollo | `4.537 u` | Suprema de pollo (`0,10` · `pollo`), Queso en fetas (`0,03` · `queso`), Pan baguette (`0,12` · `harinas_pan`) | `0,250` | **`1,8918`** | `7,57` | `1.134,25` | **`8.583,10`** |
| `pizza_muzzarella` | Pizza muzzarella entera | `1.800 u` | Harina y masa (`0,30` · `harinas_pan`), Queso muzzarella (`0,25` · `queso`) | `0,550` | **`6,4410`** | `11,71` | `990,00` | **`11.593,80`** |
| `cafe_con_leche` | Vaso de café con leche | `24.750 u` | Café molido (`0,009` · `cafe_granos`), Leche fluida (`0,11` · `leche`) | `0,119` | **`0,6033`** | `5,07` | `2.945,25` | **`14.930,93`** |

> **Consistencia contra el escenario Intermedio:** `6.050 u × 0,10 kg/u = 605 kg` de carne vacuna y `4.537 u × 0,10 kg/u = 453,7 kg` de pollo (coincidentes con el reparto del relevamiento); en `cafe_con_leche`, `24.750 u × 0,009 kg/u = 222,75 kg` de café en granos y `24.750 u × 0,11 kg/u = 2.722,50 kg` de leche (~`2.750 l`). Al cargar una receta en el sistema, el panel **Resultados** descompone automáticamente cada ingrediente dentro de su categoría alimentaria real mediante `desglosarPorCategoria()`.
