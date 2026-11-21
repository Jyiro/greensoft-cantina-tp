# Modelo de datos y contrato de API REST maquetada

Por indicación expresa del docente de la cátedra el **14-11-2026** (*"todo por documentación"* y *"no deben programar la api"*), la plataforma central común de *Campus CO₂* no dispone de un backend desplegado por el grupo. En su lugar, la aplicación define el diccionario de datos, documenta los tres endpoints REST del módulo y los ejecuta localmente mediante una capa simulada (`apiSimulada` en `frontend/app.js`) con idéntica firma que `apiReal`.

*(Nota histórica de alcance: un enlace inicial compartido al principio de la cursada remitía a la `Carbon Aware SDK` —intensidad horaria de CO₂ de redes eléctricas—, la cual no aplica al dominio de alimentación y no forma parte del módulo).*

---

## 1. Modelo de datos (13 entidades) — Estado actualizado frente al borrador del TP

El diseño conceptual de la **Sección 4** de `Grupo 11 TP3.docx` contempla 13 entidades (representadas en el DER del Anexo C). En la versión actual de `frontend/app.js` **se completó la implementación de `Receta`, `Ingrediente` y el vínculo `id_universidad` en `Edificio`**, corrigiendo la brecha que existía en la Sección 4.2 del borrador original:

| Entidad (Sec. 4 del TP) | Estado anterior (`files/files/app.js`, Sec. 4.2) | Estado actual implementado (`frontend/app.js`) |
| --- | --- | --- |
| **Universidad** | No implementada | Identificada por `id_universidad: 1` en edificios y filtro `GET /edificios?id_universidad=...`. |
| **Edificio** | `MOCK_EDIFICIOS` sin `id_universidad` | `MOCK_EDIFICIOS` incluye `id_edificio`, `id_universidad: 1` y `nombre` (`"Cantina principal"`, `"Otro edificio"`). |
| **Periodo** | Entero `periodo` dentro de cada registro | Entero `periodo` (`2000–2100`), clave de agrupación junto con `id_edificio` en `POST /resultados` y soporte de filtro `&anio=` en `GET /factores-emision`. |
| **Dimension** | Constante `"alimentacion-cantina"` | Constante `CONFIG.DIMENSION = "alimentacion-cantina"`, validada en `GET /factores-emision` y `POST /resultados`. |
| **Unidad** | Lista `UNIDADES` (`aKg()`) | Validada en cliente y servidor simulado (`["unidad", "kg", "g", "l", "ml"]`). |
| **FuenteDato** | Selector de texto | Selector persistido y enviado como `fuente_dato` (`Factura o remito`, `Entrevista al concesionario`, `Estimación desde fotos`, `Otra`). |
| **Categoria** | `MOCK_FACTORES` (8 con fuente + 5 `demo`) | `MOCK_FACTORES` completo con **13 categorías verificadas** (`0` `demo`). |
| **Producto** | Texto plano | En simple: `producto`, `categoria`, `peso_unitario_kg`; en receta: `producto`, `tipo: "receta"`, `peso_unitario_kg` derivado de la suma de ingredientes. |
| **Receta / Ingrediente** | **No implementado** | **Completamente implementado:** `tipo: "receta"`, `PLANTILLAS_RECETA` (4 recetas del relevamiento), arreglo `ingredientes[]` con `{ categoria, nombre, kg_por_unidad }`, cálculo por ingrediente y desglose por categoría en resultados. |
| **FactorEmision** | `MOCK_FACTORES` | 13 registros con `id_factor`, `categoria`, `nombre`, `valor`, `unidad_base`, `etapa`, `fuente` y `anio_referencia`. |
| **DatoActividad** | Registro en `cantina_registros_v2` | Registro unificado (`simple` o `receta`) guardado en `cantina_registros_v3` + origen en `cantina_meta_v3`. |
| **ResultadoEmision** | Campos calculados en registro | `masa_kg`, `factor_valor`, `co2e_kg`, `co2e_por_unidad` (en recetas), `ingredientes[]` calculados y `trazabilidad`. |

### Estructura interna de los objetos almacenados en navegador
- **Registro `simple` (`cantina_registros_v3`):**
  `{ id, tipo: "simple", id_edificio, edificio, periodo, categoria, producto, cantidad, unidad, peso_unitario_kg, fuente_dato, observaciones, masa_kg, factor_valor, co2e_kg, trazabilidad }`
- **Registro `receta` (`cantina_registros_v3`):**
  `{ id, tipo: "receta", categoria: "receta_elaborada", id_edificio, edificio, periodo, producto, cantidad, unidad: "unidad", ingredientes: [{ categoria, nombre, kg_por_unidad, factor_valor, masa_kg, co2e_kg }], fuente_dato, observaciones, masa_kg, factor_valor, co2e_kg, co2e_por_unidad, trazabilidad }`

---

## 2. Contrato REST documentado y maquetado (`apiSimulada` / `apiReal`)

El vocabulario del contrato respeta estrictamente el diccionario en `snake_case` minúsculas y códigos de unidad estándar (`unidad`, `kg`, `g`, `l`, `ml`).

### 2.1 `GET /factores-emision`
Obtiene el catálogo oficial de factores de emisión para la dimensión.

- **Parámetros query:**
  - `dimension` (obligatorio): debe valer `"alimentacion-cantina"`.
  - `anio` (opcional): número entero entre `2018` y `2100`.
- **Respuestas HTTP simuladas y esperadas:**
  - `200 OK`: arreglo JSON con los 13 factores verificados (ejemplo representativo):
```json
[
  {
    "id_factor": 1,
    "categoria": "carne_vacuna",
    "nombre": "Carne vacuna",
    "valor": 99.48,
    "unidad_base": "kg CO2e/kg",
    "etapa": "cuna a comercio minorista",
    "fuente": "Poore y Nemecek (2018), via Our World in Data",
    "anio_referencia": 2018
  },
  {
    "id_factor": 9,
    "categoria": "bebidas_gaseosas",
    "nombre": "Gaseosas y bebidas azucaradas",
    "valor": 0.49,
    "unidad_base": "kg CO2e/kg",
    "etapa": "cuna a comercio minorista",
    "fuente": "ADEME Agribalyse v3.2 (2025), excl. consumo · Code_AGB 18018 (Cola)",
    "anio_referencia": 2025
  }
]
```
  - `400 Bad Request`: `dimension` faltante/distinta de `"alimentacion-cantina"`, o parámetro `anio` no entero (`!Number.isInteger(anio)`).
  - `404 Not Found`: `anio < 2018 || anio > 2100`.
  - `500 Internal Server Error`: error inesperado de servidor (en backend real).

---

### 2.2 `GET /edificios`
Obtiene la lista de edificios habilitados para poblar el selector `#edificio`.

- **Parámetros query:**
  - `id_universidad` (opcional): entero positivo (`> 0`).
- **Respuestas HTTP simuladas y esperadas:**
  - `200 OK`:
```json
[
  { "id_edificio": 1, "id_universidad": 1, "nombre": "Cantina principal" },
  { "id_edificio": 2, "id_universidad": 1, "nombre": "Otro edificio" }
]
```
  - `400 Bad Request`: `id_universidad` informado pero no entero o `<= 0`.
  - `404 Not Found`: `id_universidad` válido sin edificios asociados en catálogo.
  - `500 Internal Server Error`: error inesperado de servidor (en backend real).

---

### 2.3 `POST /resultados`
Recibe los datos de actividad anual y cálculos agrupados por combinación `(periodo, id_edificio)` (generados mediante `armarPayloads()`).

- **Ejemplo real de Request JSON (incluyendo un ítem `simple` y un ítem `receta`):**
```json
{
  "dimension": "alimentacion-cantina",
  "alcance": 3,
  "periodo": 2026,
  "id_edificio": 1,
  "total_co2e_kg": 1109.78,
  "registros": [
    {
      "tipo": "simple",
      "categoria": "bebidas_gaseosas",
      "producto": "Gaseosas línea 500 ml",
      "cantidad": 100,
      "unidad": "unidad",
      "peso_unitario_kg": 0.5,
      "fuente_dato": "Factura o remito",
      "observaciones": "",
      "masa_kg": 50,
      "factor_valor": 0.49,
      "co2e_kg": 24.5,
      "trazabilidad": "100 u × 0,500 kg × 0,49 kg CO₂e/kg"
    },
    {
      "tipo": "receta",
      "categoria": "receta_elaborada",
      "producto": "Sándwich de milanesa de carne",
      "cantidad": 100,
      "unidad": "unidad",
      "peso_unitario_kg": 0.25,
      "ingredientes": [
        {
          "categoria": "carne_vacuna",
          "nombre": "Milanesa vacuna",
          "kg_por_unidad": 0.1,
          "factor_valor": 99.48,
          "masa_kg": 10,
          "co2e_kg": 994.8
        },
        {
          "categoria": "queso",
          "nombre": "Queso en fetas",
          "kg_por_unidad": 0.03,
          "factor_valor": 23.88,
          "masa_kg": 3,
          "co2e_kg": 71.64
        },
        {
          "categoria": "harinas_pan",
          "nombre": "Pan baguette",
          "kg_por_unidad": 0.12,
          "factor_valor": 1.57,
          "masa_kg": 12,
          "co2e_kg": 18.84
        }
      ],
      "fuente_dato": "Entrevista al concesionario",
      "observaciones": "",
      "masa_kg": 25,
      "factor_valor": 43.4112,
      "co2e_kg": 1085.28,
      "trazabilidad": "100 u elaboradas (10,85 kg CO₂e/u):\nMilanesa vacuna (Carne vacuna): 100 u × 0,100 kg/u × 99,48 = 994,80 kg CO₂e\nQueso en fetas (Queso): 100 u × 0,030 kg/u × 23,88 = 71,64 kg CO₂e\nPan baguette (Harinas y pan): 100 u × 0,120 kg/u × 1,57 = 18,84 kg CO₂e"
    }
  ]
}
```
*(Nota: el ejemplo ilustra el payload real generado por `armarPayloads()` para esos dos ítems: `24,50 + 1.085,28 = 1.109,78 kg CO₂e`; si un cliente alterara `total_co2e_kg`, la API simulada recalcula siempre desde el servidor y devuelve el total real.)*

- **Reglas de validación del lado servidor (`apiSimulada.postResultados`):**
  - **`400 Bad Request`:** cuerpo JSON inválido; `dimension !== "alimentacion-cantina"`; `alcance !== 3`; `!Number.isInteger(periodo)` o fuera de `2000–2100`; `registros` no es arreglo no vacío; para registros `simple`: `unidad` fuera de `UNIDADES`, `cantidad <= 0`, o falta `peso_unitario_kg > 0` con `unidad === "unidad"`; para registros `receta`: `cantidad <= 0`, `ingredientes` vacío o algún ingrediente con `kg_por_unidad <= 0`.
  - **`404 Not Found`:** `id_edificio` inexistente en `MOCK_EDIFICIOS`; o `categoria` inexistente en `MOCK_FACTORES` (ya sea en compra simple o dentro de algún ingrediente de receta).
- **Recálculo server-side y respuesta `201 Created`:**
  En lugar de aceptar ciegamente `p.total_co2e_kg`, `apiSimulada.postResultados` recalcula desde cero cada registro usando los factores oficiales de `MOCK_FACTORES` y `aKg()`, redondeando a `3` decimales (`redondear(totalRecalculado, 3)`):
```json
{
  "status": 201,
  "data": {
    "registros_recibidos": 2,
    "total_co2e_kg": 1109.78
  }
}
```
  En la interfaz, el botón **Simular envío (API)** muestra en `#resEnvio` el código HTTP `201`, la cantidad de registros, envíos agrupados y el `total recalculado` devuelto por el servidor simulado.

---

## 3. Correspondencia actualizada Formulario ↔ Contrato ↔ Diccionario

| Campo en interfaz | Campo en JSON (`POST /resultados`) | Entidad del diccionario (Sec. 4) |
| --- | --- | --- |
| Edificio (`#edificio`) | `id_edificio` (nivel raíz de grupo) | `Edificio` |
| Año del período (`#anio`) | `periodo` (nivel raíz de grupo) | `Periodo` |
| Tipo de carga (`simple` / `receta`) | `tipo`, `ingredientes[]` (`kg_por_unidad`) | `Producto` (`es_elaborado`) · `Receta` · `Ingrediente` |
| Categoría (`#categoria` o ingrediente) | `categoria` (o `"receta_elaborada"`) | `Categoria` |
| Producto (`#producto` / `#recetaNombre`) | `producto` | `Producto` |
| Cantidad anual (`#cantidad` / `#recetaCantidad`) | `cantidad` | `DatoActividad` |
| Unidad (`#unidad`) | `unidad` (`"unidad"` fijo en recetas) | `Unidad` |
| Peso por unidad (`#peso` / suma ingredientes) | `peso_unitario_kg` | `Producto` |
| Fuente del dato (`#fuente`) | `fuente_dato` | `FuenteDato` |
| Observaciones (`#obs`) | `observaciones` | `DatoActividad` |
| Cálculos automáticos | `masa_kg`, `factor_valor`, `co2e_kg`, `trazabilidad` | `ResultadoEmision` |
| Dimensión y alcance fijos | `dimension: "alimentacion-cantina"`, `alcance: 3` | `Dimension` · `ResultadoEmision` |

---

## 4. Cierre de las 6 brechas documentadas en la Sección 7.5 del Word

La Sección 7.5 de `Grupo 11 TP3.docx` listaba 6 inconsistencias entre el contrato REST propuesto y el prototipo base (`files/files/app.js`). **Todas quedaron resueltas en `frontend/app.js`:**

| Punto (Sec. 7.5 del Word) | Brecha en el prototipo antiguo (`files/files/app.js`) | Estado actual resuelto (`frontend/app.js`) |
| --- | --- | --- |
| **1. `GET /factores-emision`** | Devolvía siempre los 13 factores ignorando `anio`; `apiReal` no enviaba `anio`. | **Cerrado:** `apiSimulada.getFactores` valida `dimension` (`400`) y `anio` (`400`/`404`), y `apiReal.getFactores` serializa `dimension` y `anio` en query string. |
| **2. Factores de bebidas y snacks** | Eran 5 categorías con `demo: true`, `fuente: "Demo (pendiente)"`, `etapa: "sin dato"`, `anio_referencia: null`. | **Cerrado:** 5 factores verificados contra **ADEME Agribalyse v3.2 (2025)** (`0,49`, `0,32`, `0,73`, `0,68`, `3,47`), todos con `etapa: "cuna a comercio minorista"`, `anio_referencia: 2025` y sin propiedad `demo`. |
| **3. `GET /edificios`** | Ignoraba `id_universidad` y sus objetos carecían de ese campo. | **Cerrado:** `MOCK_EDIFICIOS` incorpora `id_universidad: 1`; `apiSimulada.getEdificios` valida entero (`400`), filtra por universidad (`404` si vacía) y `apiReal` envía `?id_universidad=...`. |
| **4. `POST /resultados`, estado HTTP** | No devolvía objeto HTTP con `status: 201` ni distinguía errores estructurados. | **Cerrado:** devuelve `{ status: 201, data: ... }` y lanza errores con `.status` (`400` / `404`) mediante `crearHttpError()`, replicando la firma `{ status, data }` de `apiReal`. |
| **5. `POST /resultados`, edificio o categoría inexistente** | Reportaba edificio o categoría inexistente como error `400 validación: ...`. | **Cerrado:** valida y retorna **`HTTP 404`** tanto ante `id_edificio` inexistente como ante cualquier `categoria` ausente (en compra simple o en cualquier ingrediente de receta). |
| **6. `POST /resultados`, cálculo de `total_co2e_kg`** | Aceptaba `p.total_co2e_kg` enviado por el cliente sin verificarlo. | **Cerrado:** `apiSimulada.postResultados` recalcula ítem por ítem en el servidor simulado con `MOCK_FACTORES` y `aKg()`, devolviendo el `total_co2e_kg` recalculado. |

---

## 5. Cómo conectar el frontend a un backend real en el futuro

La arquitectura desacoplada por conmutador permite pasar a la API central sin modificar la interfaz, las tablas ni el motor gráfico:

1. Editar [`../frontend/app.js`](../frontend/app.js) en la línea 6 y asignar la URL base real:
   ```javascript
   var CONFIG = {
     API_BASE: "https://api-campus-co2.ejemplo.edu.ar",
     ENDPOINTS: {
       factores: "/factores-emision",
       edificios: "/edificios",
       resultados: "/resultados"
     },
     ...
   };
   ```
2. Al recargar la aplicación, `init()` detecta `CONFIG.API_BASE` no vacío, consulta automáticamente `apiReal.getFactores()` y `apiReal.getEdificios()`, cambia el indicador de cabecera a `"API central conectada"` y el botón de envío pasa de `"Simular envío (API)"` a `"Enviar a la API central"`.
3. **Fallback resiliente ante falla de red:** si el servidor externo falla o rechaza la conexión al iniciar, `init()` informa el error en `#estadoApi` y carga `MOCK_FACTORES` y `MOCK_EDIFICIOS` como respaldo para no bloquear el formulario ni la auditoría de registros locales guardados.
