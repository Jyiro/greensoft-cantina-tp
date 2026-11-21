# Campus CO₂ · Cantina (Dimensión 11: Alimentación)

Módulo frontend para el registro anual, cálculo trazable y visualización de la huella de carbono generada por las compras de alimentos y bebidas de la cantina universitaria.

Desarrollado para el trabajo práctico **Campus CO₂** — **UTN Facultad Regional Córdoba · Cátedra Green Software · Grupo 11**.

---

## Alcance y metodología

- **Alcance e inventario:** exclusivamente **Alcance 3, Categoría 1** (*bienes y servicios comprados*), etapa de ciclo de vida **cuna a comercio minorista** (*cradle-to-retail*, incluyendo producción, procesamiento, envase primario y transporte hasta el punto de venta).
- **Periodicidad:** **anual**, organizada por año de período y edificio.
- **Fórmula aplicada:**

  ```text
  kg CO₂e = cantidad × peso unitario (kg) × FE (kg CO₂e/kg)
  ```

- **Conversiones de unidades admitidas:**
  - `kg`: valor directo.
  - `g`: dividido por `1.000`.
  - `unidad`: `cantidad × peso unitario (kg)` informado según etiqueta o gramaje estimado.
  - `l` y `ml`: se asume densidad aproximada de `1 kg/l` (`1.000 ml = 1 kg`).
  - **Recetas elaboradas:** se descomponen por ingrediente (`cantidad anual vendida × kg por unidad × FE del ingrediente`) y en los gráficos por categoría cada ingrediente suma en su categoría real.

- **Consumo eléctrico excluido (sin doble conteo):** el relevamiento estimó unos `30.000 kWh/año` en equipamiento de la cantina (14 equipos de frío, cafetera, hornos, microondas y tostadora). Ese consumo pertenece a **Alcance 2 (Dimensión 1: Energía eléctrica)** y se muestra solo de manera informativa en *Resultados* sin sumarse a las emisiones alimentarias.

### Factores de emisión utilizados

El módulo trabaja con **13 categorías verificadas** combinando dos bases institucionales alineadas al mismo corte *cuna a comercio minorista*:

| Fuente | Categorías y factor (`kg CO₂e/kg`) | Criterio / Etapa |
| --- | --- | --- |
| **Poore y Nemecek (2018), vía *Our World in Data*** (8) | Carne vacuna (`99,48`), Café en granos (`28,53`), Queso (`23,88`), Cerdo y fiambres (`12,31`), Pollo (`9,87`), Huevos (`4,67`), Leche (`3,15`), Harinas y pan (`1,57`) | Media actualizada de estudio (cuna a comercio minorista) |
| **ADEME Agribalyse v3.2 (2025)** (5) | Snacks, golosinas y alfajores (`3,47` — mix cantina `Code_AGB 4004, 38105, 24030, 31012`), Jugos e isotónicos (`0,73` — mix 50/50 `Code_AGB 2012, 18339`), Energizantes (`0,68` — `Code_AGB 18352`), Gaseosas y bebidas azucaradas (`0,49` — `Code_AGB 18018`), Agua y aguas saborizadas (`0,32` — `Code_AGB 18430`) | Excluye la etapa de consumo doméstico (`Consommation`) para igualar cuna a comercio minorista con envase primario incluido |

---

## Cómo ejecutar el software

Es una aplicación estática en **HTML, CSS y JavaScript puro**, sin dependencias externas, build ni servidor obligatorio.

### Opción 1: Apertura directa
1. Clonar o descargar este repositorio.
2. Abrir el archivo [`frontend/index.html`](frontend/index.html) directamente en un navegador moderno (Chrome, Edge, Firefox, etc.).

### Opción 2: Servidor estático local
Desde la raíz del repositorio:

```bash
# Con Python 3
python -m http.server 8080 --directory frontend

# O con Node.js
npx serve frontend
```

Luego ingresar en el navegador a la URL local que indique el comando (por ejemplo `http://localhost:8080`).

> Al ejecutarse sin servidor backend configurado (`CONFIG.API_BASE = ""`), el módulo opera en modo **local (sin servidor)** guardando datos en el navegador y simulando el envío de la API. Si se abre sin acceso a internet, las tipografías externas hacen fallback a fuentes del sistema sin afectar la funcionalidad.

---

## Cómo usar el módulo

La cabecera incluye el botón **¿Cómo funciona?** con una guía rápida de 3 columnas y el selector **Escenarios estimados**.

### 1. Cargar un escenario estimado del relevamiento (opcional)
Como durante el relevamiento no se contó con facturas cerradas del concesionario, el botón superior **Escenarios estimados** (y la guía inicial cuando no hay registros cargados) ofrece tres estimaciones anuales listas para explorar:

| Escenario | Supuesto de actividad | Solo alimentos básicos | Con bebidas y snacks |
| --- | --- | --- | --- |
| **Mínimo · Actividad baja** | 250 días/año · ~30 sándwiches y 60 cafés/día | `40,8 t CO₂e/año` | `42,6 t CO₂e/año` |
| **Intermedio · Estimación base** | 275 días/año · ~55 sándwiches y 90 cafés/día | `115,3 t CO₂e/año` | `118,0 t CO₂e/año` |
| **Máximo · Actividad alta** | 300 días/año · ~80 sándwiches y 120 cafés/día | `236,1 t CO₂e/año` | `240,2 t CO₂e/año` |

La casilla **Incluir bebidas envasadas y snacks** permite incluir o excluir los ítems envasados de Agribalyse v3.2 al cargar cualquiera de los escenarios.

### 2. Pestaña `1. Carga de datos`
- **Banner contextual:** cuando hay datos en pantalla, explica si provienen de un escenario precargado o de carga manual guardada en `localStorage`, y permite cambiar escenario o vaciar la lista.
- **Compra simple:** seleccioná edificio, año del período, categoría, nombre del producto, cantidad anual, unidad (`unidades`, `kg`, `g`, `litros`, `ml`), peso unitario en kg (solo si elegís `unidades`), fuente del dato y observaciones opcionales.
- **Receta elaborada:** permite cargar productos compuestos eligiendo una de las **4 plantillas del relevamiento** (*Sándwich milanesa de carne*, *Sándwich milanesa de pollo*, *Pizza muzzarella*, *Café con leche*) o armando ingredientes propios con su gramaje en kg por unidad elaborada.
- **Vista previa del cálculo (panel lateral):** muestra en tiempo real la masa equivalente, la fórmula paso a paso, el resumen acumulado y botones directos para avanzar a los Pasos 2 y 3.
- **Registros cargados:** permite buscar por texto, filtrar (`Todos`, `Alimentos básicos (Poore)`, `Bebidas y snacks (Agribalyse)`, `Solo recetas`), expandir el detalle de ingredientes en recetas, editar un registro o eliminarlo con confirmación en dos pasos.

### 3. Pestaña `2. Cálculo paso a paso`
- Explica la fórmula y conversiones vigentes.
- Lista cada registro en **Cuenta paso a paso por registro** conservando exactamente la conversión a kilos, la multiplicación realizada y la fuente del dato.
- Muestra la tabla completa de los **13 factores de emisión**, filtrable entre `Todos (13)`, `Poore y Nemecek (8)` y `Agribalyse v3.2 (5)`.

### 4. Pestaña `3. Resultados y envío`
- **Indicadores clave (KPIs):** total en `kg CO₂e`, total en toneladas (`t CO₂e`), masa total comprada (`kg`), intensidad promedio (`kg CO₂e/kg`) y categoría principal emisora.
- **Peso físico vs. huella de carbono:** compara el porcentaje de kilos físicos frente al porcentaje de emisiones por categoría e incluye un hallazgo automático de concentración.
- **Ranking por categoría:** barras horizontales intercambiables entre `kg CO₂e`, `% CO₂e` y `Masa (kg)`.
- **Comparación entre años:** compara las emisiones acumuladas por período cuando hay más de un año cargado.
- **Envío al sistema central y exportación:**
  - **Simular envío (API):** agrupa los registros por período y edificio y los envía al cliente de API (`POST /resultados`), mostrando el código HTTP (`201`) y el total recalculado.
  - **Ver JSON / Copiar JSON / Descargar JSON:** permite inspeccionar el payload oficial en pantalla, copiarlo al portapapeles o descargarlo como `cantina-co2.json`.
  - **Vaciar registros:** limpia los registros guardados previa confirmación en línea.

---

## Persistencia local e integración con API

- **Almacenamiento en el navegador:** los registros se persisten automáticamente en `localStorage` bajo la clave `cantina_registros_v3` (con lectura retrocompatible de `cantina_registros_v2`) y su metadata de origen en `cantina_meta_v3`. Si el almacenamiento del navegador está bloqueado o lleno, se muestra un aviso visible permitiendo seguir operando en memoria y descargar el JSON.
- **Contrato con API central:** `frontend/app.js` implementa una interfaz compatible con la arquitectura común definida para el proyecto:
  - `GET /factores-emision?dimension=alimentacion-cantina` (opcional `&anio=...`)
  - `GET /edificios?id_universidad=1`
  - `POST /resultados` (payload agrupado por `periodo` e `id_edificio`, con validación y recálculo del lado servidor en la API simulada).
- **Conectar un backend real:** editar `CONFIG.API_BASE` en [`frontend/app.js`](frontend/app.js) colocando la URL base del servidor (por ejemplo `"http://localhost:3000/api"`). Cuando `API_BASE` está vacío, se utiliza la API simulada local sin requerir backend activo.

---

## Documentación detallada

La carpeta [`docs/`](docs/00-indice.md) reúne toda la documentación técnica, metodológica y de relevamiento del proyecto, pensada para auditar el sistema, preparar el video explicativo y actualizar el informe escrito (`Grupo 11 TP3.docx`):

- [`docs/00-indice.md`](docs/00-indice.md) — Índice general y tabla de correspondencia con cada sección del TP.
- [`docs/01-contexto-metodologia-y-alcance.md`](docs/01-contexto-metodologia-y-alcance.md) — Consigna *Campus CO₂*, marco normativo, GHG Protocol Alcance 3 Cat. 1, delimitación de dimensiones, relevamiento de campo e inventario eléctrico informativo (`~30.000 kWh/año` excluidos).
- [`docs/02-factores-emision-e-investigacion-bebidas-snacks.md`](docs/02-factores-emision-e-investigacion-bebidas-snacks.md) — Catálogo verificado de las 13 categorías (`8` Poore y Nemecek 2018 + `5` ADEME Agribalyse v3.2), comparativa de 6 bases, desglose por etapa y matices metodológicos.
- [`docs/03-escenarios-relevamiento-y-resultados.md`](docs/03-escenarios-relevamiento-y-resultados.md) — Escenarios `Mínimo`, `Intermedio` y `Máximo`, 4 plantillas de recetas, análisis de sensibilidad y conciliación con la Sec. 13.1 del Word.
- [`docs/04-arquitectura-y-funcionamiento-del-software.md`](docs/04-arquitectura-y-funcionamiento-del-software.md) — Stack sin dependencias (`file://`), persistencia, recorrido completo de las 3 pestañas y guion sugerido para el video.
- [`docs/05-modelo-datos-y-api-simulada.md`](docs/05-modelo-datos-y-api-simulada.md) — Modelo de datos actualizado (incluyendo `Receta` e `Ingrediente`), endpoints `GET`/`POST`, payloads JSON y cierre de brechas de la Sec. 7.5.
- [`docs/06-decisiones-y-guia-actualizacion-tp.md`](docs/06-decisiones-y-guia-actualizacion-tp.md) — Registro de decisiones (D1–D8), guía sección por sección para actualizar el Word y checklist de pendientes de campo/entrega.

---

## Estructura del proyecto

```text
greensoft-cantina-tp/
├── README.md
├── docs/                            # Documentación técnica, metodológica y guía de actualización del TP
│   ├── 00-indice.md
│   ├── 01-contexto-metodologia-y-alcance.md
│   ├── 02-factores-emision-e-investigacion-bebidas-snacks.md
│   ├── 03-escenarios-relevamiento-y-resultados.md
│   ├── 04-arquitectura-y-funcionamiento-del-software.md
│   ├── 05-modelo-datos-y-api-simulada.md
│   └── 06-decisiones-y-guia-actualizacion-tp.md
└── frontend/
    ├── index.html                   # Estructura de las 3 vistas, guía rápida, formulario dual y escenarios
    ├── styles.css                   # Estilos, diseño responsive y estados visuales
    ├── app.js                       # Factores de emisión, cálculos, recetas, API simulada y exportación
    └── assets/
        ├── logo-utn-green.png       # Logo UTN FRC · Cátedra Green Software
        └── logo-greensoftware.png   # Logo Green Software
```
