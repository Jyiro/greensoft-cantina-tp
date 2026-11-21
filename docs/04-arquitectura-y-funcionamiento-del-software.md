# Arquitectura técnica y funcionamiento completo del software

El módulo frontend de **Campus CO₂ · Dimensión 11 (Alimentación y Cantina)** es una aplicación web estática autocontenida construida para ser auditada en código, ejecutada sin servidor mediante doble clic (`file://`) o servidor HTTP local, capturada directamente para el Anexo A y explicada con claridad en defensa oral y video.

---

## 1. Stack tecnológico y ejecución

- **Tecnología:** HTML5, CSS3 y JavaScript ES5/ES2017 vanilla sin dependencias de terceros, sin bundlers ni paso de compilación (`index.html`, `styles.css`, `app.js`). Todo el código JavaScript está encapsulado en una IIFE bajo `"use strict"` (`frontend/app.js`).
- **Tipografías con degradación offline:** importa `Source Sans 3` (interfaz y tablas con cifras tabulares) y `JetBrains Mono` (fórmulas, trazabilidad y JSON) desde Google Fonts; si se abre completamente sin conexión a internet, degrada limpiamente a fuentes del sistema (`system-ui`, `Segoe UI`, `Roboto`, `Consolas`, `monospace`) sin alterar diseño ni funciones.
- **Compatibilidad `file://`:** no utiliza ES Modules (`import`/`export`, que fallan por CORS al abrir archivos locales en el navegador), incluye respaldo sincrónico de copiado al portapapeles (`copiarConTextarea`) para contextos no seguros y opera íntegramente en memoria/navegador mediante la API simulada cuando `CONFIG.API_BASE` está vacío.
- **Formas de ejecución:**
  1. Abrir directamente [`../frontend/index.html`](../frontend/index.html) en Chrome, Edge o Firefox.
  2. Levantar servidor local estático con `python -m http.server 8080 --directory frontend` o `npx serve frontend`.

---

## 2. Arquitectura de archivos y sistema visual

| Archivo | Tamaño aprox. | Responsabilidad exacta |
| --- | --- | --- |
| `frontend/index.html` | `592` líneas | Cabecera institucional, barra de pasos `1 / 2 / 3`, drawers colapsables (`¿Cómo funciona?` y `Escenarios estimados`), alertas globales, formulario dual Simple/Receta, rail lateral, tablas de Cálculo y paneles de Resultados/API. |
| `frontend/styles.css` | `1.854` líneas | Tokens visuales del sistema *Espacio Blanco Minimalista UTN*, layout de dos columnas (`main-pane` + `side-rail` pegajoso), estados de error, banners contextuales, barras comparativas HTML/CSS sin librerías y diseño responsive (`desktop`, `tablet`, `390 px` móvil). |
| `frontend/app.js` | `1.940` líneas | Configuración (`CONFIG`), catálogo `MOCK_FACTORES` (13), `MOCK_EDIFICIOS` (2), `PLANTILLAS_RECETA` (4), `ESCENARIOS` (3), capa `apiSimulada` / `apiReal`, persistencia `localStorage` + metadatos de origen, motor `aKg` / `calcularSimple` / `calcularReceta`, vista previa en vivo, gráficos, inspector JSON y manejadores de eventos. |
| `frontend/assets/` | `2` PNG | Logos institucionales oficiales obligatorios: `logo-utn-green.png` y `logo-greensoftware.png`. |

### Tokens y decisiones cromáticas esenciales (`styles.css`)
- Fondo principal `#FFFFFF` (`--bg`) combinado con un panel de inspección lateral `#F5F7F6` (`--surface-rail`) separado por filetes finos `#E2E8E4` (`--line`) sin sombras decorativas.
- **Verde UTN `#256B2B` (`--accent`):** reservado exclusivamente a acciones primarias, pestaña activa y barras de **emisiones de CO₂e**.
- **Azul acero `#2B6CB0` (`--mass`):** asignado de forma consistente a la serie de **masa física comprada (kg)** para facilitar el contraste visual inmediato en *Peso físico vs. huella de carbono*.
- **Carmesí `#B91C1C` (`--danger-ink`):** mensajes de validación por campo, alertas críticas de almacenamiento y confirmaciones destructivas en dos pasos.
- **Alineación numérica:** todas las tablas, KPIs y resúmenes numéricos usan formato `es-AR` (coma decimal, punto de miles) y `tabular-nums`.

---

## 3. Estado en memoria, persistencia `localStorage` y manejo de errores

### 3.1 Claves almacenadas en el navegador
- `cantina_registros_v3` (`CONFIG.STORAGE_KEY`): arreglo JSON con los registros cargados por el usuario o precargados desde un escenario.
- `cantina_registros_v2` (`CONFIG.LEGACY_STORAGE_KEY`): migración retrocompatible en lectura; si existían datos de la versión anterior al abrir la app por primera vez, se cargan, se recalculan contra el catálogo actual con `recalcularRegistro()` y al guardar quedan bajo la clave `v3`.
- `cantina_meta_v3` (`CONFIG.META_KEY`): guarda la procedencia de los datos actuales (`origenDatos`) para poder explicárselo al usuario en pantalla:
  - `{ origen: "escenario", clave, etiqueta, modificado: false }`: escenario cargado sin modificaciones posteriores.
  - `{ origen: "escenario", clave, etiqueta, modificado: true }`: el usuario partió de un escenario y luego agregó, editó o eliminó registros.
  - `{ origen: "manual" }`: registros cargados manualmente desde cero.

### 3.2 Resolución de errores de almacenamiento (cierre de Sec. 6.5 del TP)
En el prototipo inicial (`files/files/app.js`), un fallo de `localStorage` (navegación privada restrictiva o cuota llena) era silenciado en un bloque `catch (e) {}` vacío. En `frontend/app.js`:
- `guardarRegistros()` captura excepciones y llama a `mostrarAlertaStorage(...)`, haciendo visible `#storageBanner` (`role="alert"`) en la parte superior con el aviso explícito de que el guardado falló y la recomendación de continuar en memoria y **descargar el JSON antes de cerrar**.
- `cargarRegistrosIniciales()` también alerta mediante `#storageBanner` si el navegador bloquea la lectura del almacenamiento local o si el JSON guardado estuviera corrupto.

---

## 4. Recorrido detallado de la interfaz y cómo funciona cada parte

La UX fue reestructurada siguiendo principios de claridad y onboarding (`clarify` + `onboard`) para que cualquier usuario —y cualquier espectador de un video explicativo— comprenda de inmediato qué mide el sistema, por qué hay datos precargados y qué hace cada pestaña.

### 4.1 Cabecera global, guía rápida y selector de escenarios
1. **Identidad y estado de conexión (`#estadoApi`):** muestra ambos logos oficiales, el título y un subtítulo llano en Alcance 3 (`"Calcula cuánto CO₂e generan al año los alimentos y bebidas que compra la cantina (Alcance 3)"`). A la derecha, `#estadoApi` indica `"Modo local (sin servidor)"` con tooltip explicativo (o `"API central conectada"` si se configura `CONFIG.API_BASE`).
2. **Navegación en 3 pasos secuenciales:**
   - `1. Carga de datos` (con contador dinámico `#badgeRegistros`)
   - `2. Cálculo paso a paso`
   - `3. Resultados y envío`
   - Soporta teclado completo ARIA `role="tablist"` (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
3. **Drawer `¿Cómo funciona?` (`#drawerGuia`):** panel desplegable en 3 columnas que responde en lenguaje directo: (a) *Qué mide este sistema*, (b) *Cómo se usa en 3 pasos*, y (c) *Por qué pueden verse datos cargados*.
4. **Drawer `Escenarios estimados` (`#drawerEscenario`):** permite precargar en un clic los escenarios `Mínimo`, `Intermedio (estimación base)` o `Máximo`, con el checkbox sincronizado **Incluir bebidas envasadas y snacks** (recalcula al instante las toneladas mostradas en las tarjetas: `40,8 / 115,3 / 236,1 t` sin bebidas vs. `42,6 / 118,0 / 240,2 t` con ellas).
5. **Comportamiento accesible de drawers:** `#drawerGuia` y `#drawerEscenario` son mutuamente excluyentes, aplican `inert` cuando están cerrados y se cierran presionando `Escape` devolviendo el foco al botón disparador.

### 4.2 Pestaña `1. Carga de datos`
- **Introducción operativa (`.tab-intro`):** contextualiza el propósito del paso antes de entrar en campos.
- **Banner contextual de origen (`#datosContextoBanner`):** cuando ya hay registros cargados, explica en todo momento de dónde salieron (escenario precargado sin cambios, escenario editado o carga manual persistida en `localStorage`), e incluye botones rápidos **Cambiar escenario** y **Vaciar lista** (con confirmación en dos pasos).
- **Guía de estado vacío (`#emptyOnboarding`):** cuando la lista está vacía (`registros.length === 0`), muestra en el propio flujo las tres tarjetas de escenario estimado para no enfrentar al usuario con una pantalla vacía.
- **Formulario dual (`Compra simple` vs. `Receta elaborada`):**
  - El texto dinámico `#modoAyuda` cambia al alternar el selector segmentado explicando cuándo usar cada modo.
  - Todos los campos tienen pista descriptiva inferior (`.hint`), incluyendo un mensaje dinámico `#unidadHint` al elegir `unidades`, `kg`, `g`, `litros` o `ml`, y mostrando el campo **Peso por unidad (kg)** (`#pesoBox`) únicamente cuando la unidad es `unidad`.
  - En modo **Receta elaborada**, ofrece las **4 plantillas editables del relevamiento** (`Sándwich milanesa de carne`, `Sándwich milanesa de pollo`, `Pizza muzzarella`, `Café con leche`) y una grilla dinámica de ingredientes con subtotal unitario calculado en vivo (`kg CO₂e/u`).
  - Al guardar una compra simple nueva, se limpian `producto`, `cantidad`, `peso` y `observaciones`, conservando `edificio`, `anio`, `categoria`, `unidad` y `fuente` para agilizar cargas repetitivas por lote. En modo edición (`iniciarEdicion()`), muestra `#editBanner` con `Cancelar edición`.
- **Rail lateral fijo (`Vista previa del cálculo` + `Resumen acumulado`):**
  - Calcula en tiempo real mientras el usuario escribe, antes de guardar: muestra la etiqueta de fuente (`Poore y Nemecek`, `Agribalyse v3.2` o `Receta (N ing.)`), los `kg CO₂e`, la masa anual equivalente y la fórmula exacta desarrollada (`#liveFormula`).
  - El bloque `Resumen acumulado` muestra Total anual (`t CO₂e`), Masa comprada (`kg`), Intensidad promedio (`kg CO₂e/kg`), Registros cargados y botones directos **Paso 2: Ver cálculo paso a paso** y **Paso 3: Ver resultados y gráficos**.
  - El bloque inferior **Fuentes científicas de los factores** resume de forma clara la convivencia de Poore y Nemecek (2018) + ADEME Agribalyse v3.2 (2025).
- **Tabla `Registros cargados`:** buscador de texto libre (`#filtroTexto`), filtro por fuente/tipo (`Todos`, `Alimentos básicos (Poore)`, `Bebidas y snacks (Agribalyse)`, `Solo recetas`), despliegue colapsable de ingredientes en recetas (`Ver ingredientes (N)`), botón `Editar` y botón `Eliminar` con confirmación en línea `Confirmar / Cancelar`.

### 4.3 Pestaña `2. Cálculo paso a paso`
- **Banner de fórmula:** exhibe la ecuación general `kg CO₂e = cantidad × peso unitario (kg) × FE (kg CO₂e/kg)` y el resumen de conversiones (`1 kg = 1.000 g`, `1 litro = 1 kg`, suma por ingrediente en recetas).
- **Tabla `Cuenta paso a paso por registro` (`#tablaCalculo`):** muestra para cada ítem la traza textual exacta de conversión y multiplicación (`calcularSimple()` en una línea o `calcularReceta()` desglosada ingrediente por ingrediente). Los cálculos internos no aplican redondeo intermedio; las tablas formatean a 2 decimales (`es-AR`) y el payload JSON redondea masas/factores por ítem a 4 decimales y el total por envío a 3 decimales.
- **Tabla `Factores de emisión aplicados (13 categorías)` (`#tablaFactores`):** muestra categoría, factor (`kg CO₂e/kg`), etapa cubierta (*cuna a comercio minorista*), fuente científica exacta (incluyendo `Code_AGB` de ADEME) y año de referencia, con filtro segmentado `Todos (13)`, `Poore y Nemecek (8)` y `Agribalyse v3.2 (5)`, más la nota histórica sobre las medianas antiguas de OWID (`60`).
- **Ayudas de flujo:** si no hay datos cargados muestra `#calcEmptyBar` con botón al Paso 1; si hay datos muestra `#calcNextBar` para avanzar al Paso 3.

### 4.4 Pestaña `3. Resultados y envío`
- **Tira de 5 KPIs (`#kpis`):** Total anual (`kg CO₂e`), Total en toneladas (`t CO₂e`), Peso físico comprado (`kg`), Intensidad promedio (`kg/kg`) y Principal emisor (`categoría` y `% del total`).
- **Gráfico principal — `Peso físico vs. huella de carbono` (`#gComparar`):** barras pareadas por categoría comparando `% del peso (kg)` en azul frente a `% emisiones (CO₂e)` en verde, acompañado de `#comparativaInsight` (enunciado automático calculado con las 2 categorías líderes). En este gráfico, **las recetas elaboradas no aparecen como una barra aislada opaca**: `desglosarPorCategoria()` reparte cada ingrediente en su categoría alimentaria real (`carne_vacuna`, `queso`, `harinas_pan`, etc.).
- **Gráfico `Ranking por categoría` (`#gDesglose`):** un único contenedor controlado por selector segmentado (`kg CO₂e`, `% CO₂e`, `Masa (kg)`) para evitar duplicar tres gráficos repetidos en pantalla.
- **Gráfico `Comparación entre años` (`#gAnio`):** agrupa por período (`2026` u otros años cargados). Cuando existe un único período cargado lo informa explícitamente en `#hintAnio` sin inventar barras históricas o mensuales.
- **Nota de delimitación eléctrica (`.scope-panel`):** explica explícitamente por qué los ~`30.000 kWh/año` de heladeras, café, hornos, microondas y tostadora pertenecen a Dimensión 1 (Alcance 2) y no se suman al total alimentario.
- **Envío al sistema central y exportación (`.api-panel`):**
  - `Simular envío (API)` (o `Enviar a la API central` si `CONFIG.API_BASE` tiene URL): agrupa por `periodo | id_edificio`, invoca `POST /resultados`, valida campos y códigos `400`/`404`, recalcula `total_co2e_kg` desde el servidor simulado y reporta HTTP `201`.
  - `Ver JSON` / `Ocultar JSON`: inspecciona en `#jsonInspector` el arreglo exacto de payloads.
  - `Copiar JSON`: copia al portapapeles usando `navigator.clipboard.writeText` en orígenes seguros HTTP/HTTPS o el fallback sincrónico `copiarConTextarea()` en `file://`.
  - `Descargar JSON`: genera y descarga `cantina-co2.json`.
  - `Vaciar registros`: protegido con confirmación en dos pasos y deshabilitado cuando no hay filas.

---

## 5. Guion sugerido para el video explicativo de Grupo 11 (4–5 min)

Para demostrar el sistema con total naturalidad y claridad frente a la cátedra:

1. **Presentación e idea central (30 s):** mostrar la cabecera (`¿Cómo funciona?` desplegado brevemente). Explicar que mide **Alcance 3 Categoría 1** de la cantina UTN FRC: emisiones de ciclo de vida de los alimentos y bebidas comprados al año, *cuna a comercio minorista*.
2. **Por qué hay datos cargados o cómo cargar un escenario (45 s):** si ya está cargado el escenario Intermedio, señalar el **banner contextual** que explica que son estimaciones del relevamiento guardadas localmente porque no hay facturas cerradas; abrir **Escenarios estimados**, mostrar las 3 escalas (`Mínimo / Intermedio / Máximo`) y el toggle de bebidas/snacks de Agribalyse v3.2.
3. **Alta en tiempo real y Recetas elaboradas (60 s):** en **Paso 1**, mostrar el formulario `Compra simple` (ej. probar escribir `100` `unidades` de `0,5 kg` y señalar la **Vista previa del cálculo** lateral actualizándose al instante); luego cambiar a `Receta elaborada`, hacer clic en la plantilla **Sándwich milanesa de carne** y explicar cómo descompone milanesa, queso y pan por unidad vendida.
4. **Auditoría y fuentes científicas (45 s):** pasar al **Paso 2 (`2. Cálculo paso a paso`)**, mostrar la fórmula, una fila con su traza paso a paso y filtrar la tabla inferior entre `Poore y Nemecek (8)` y `Agribalyse v3.2 (5)` explicando el cierre de bebidas y snacks sin envases duplicados.
5. **Hallazgo principal y separación eléctrica (60 s):** pasar al **Paso 3 (`3. Resultados y envío`)**, leer los KPIs (`118,025 t CO₂e/año`), destacar en **Peso físico vs. huella de carbono** la concentración Top 2 (`~71,9 %` CO₂e con `~11,6 %` peso frente a bebidas con `~36,7 %` masa y `~2,3 %` CO₂e), y señalar el recuadro **Por qué no se suma la electricidad** (`~30.000 kWh/año`, Alcance 2, Dimensión 1).
6. **Contrato REST y cierre (30 s):** hacer clic en **Simular envío (API)** mostrando `HTTP 201` y el total recalculado, abrir **Ver JSON** para mostrar el payload estructurado compatible con `CONFIG.API_BASE`.
