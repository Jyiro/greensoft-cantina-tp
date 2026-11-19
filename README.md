# Campus CO₂ · Cantina (Dimensión 11: Alimentación)

Módulo frontend para el registro anual, cálculo trazable y visualización de la huella de carbono generada por las compras de alimentos y bebidas de la cantina universitaria.

Desarrollado para el trabajo práctico **Campus CO₂** — **UTN Facultad Regional Córdoba · Cátedra Green Software · Grupo 11**.

---

## Alcance y metodología

- **Alcance e inventario:** exclusivamente **Alcance 3, Categoría 1** (*bienes y servicios comprados*), etapa de ciclo de vida **cuna a comercio minorista** (*cradle-to-retail*, incluyendo producción, procesamiento, envase y transporte hasta el punto de venta).
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

- **Consumo eléctrico excluido (sin doble conteo):** el relevamiento relevó un consumo estimado de ~`30.000 kWh/año` en equipamiento de la cantina (14 equipos de frío, cafetera, hornos, microondas y tostadora). Ese consumo pertenece a **Alcance 2 (Dimensión 1: Energía eléctrica)** y se muestra solo de manera informativa en *Resultados* sin sumarse a las emisiones alimentarias.

### Factores de emisión utilizados

El módulo trabaja con **13 categorías**, diferenciando explícitamente entre factores con respaldo bibliográfico y valores provisorios de demostración:

| Estado | Categorías | Fuente |
| --- | --- | --- |
| **Verificados (8)** | Carne vacuna (`99,48`), Café en granos (`28,53`), Queso (`23,88`), Cerdo y fiambres (`12,31`), Pollo (`9,87`), Huevos (`4,67`), Leche (`3,15`), Harinas y pan (`1,57`) `kg CO₂e/kg` | Poore y Nemecek (2018), vía *Our World in Data* (media, cuna a comercio minorista) |
| **Demo sin fuente (5)** | Snacks, golosinas y alfajores (`2,50`), Energizantes (`1,00`), Jugos e isotónicos (`0,90`), Gaseosas y bebidas azucaradas (`0,60`), Agua y aguas saborizadas (`0,20`) `kg CO₂e/kg` | Valores orientativos de demostración pendientes de factor validado |

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

> Al ejecutarse sin servidor backend configurado (`CONFIG.API_BASE = ""`), el módulo opera en modo **API simulada** dentro del navegador. Si se abre sin acceso a internet, las tipografías externas hacen fallback a fuentes del sistema sin afectar la funcionalidad.

---

## Cómo usar el módulo

### 1. Cargar un escenario del relevamiento (opcional)
Como durante el relevamiento no se contó con facturas cerradas del concesionario, el botón superior **Escenario del relevamiento** (y la guía inicial cuando no hay registros cargados) ofrece tres estimaciones anuales listas para explorar:

| Escenario | Supuesto de actividad | Total sin `(demo)` | Total con `(demo)` |
| --- | --- | --- | --- |
| **Mínimo · Actividad baja** | 250 días/año · ~30 sándwiches y 60 cafés/día | `40,8 t CO₂e/año` | `42,6 t CO₂e/año` |
| **Intermedio · Estimación base** | 275 días/año · ~55 sándwiches y 90 cafés/día | `115,3 t CO₂e/año` | `117,9 t CO₂e/año` |
| **Máximo · Actividad alta** | 300 días/año · ~80 sándwiches y 120 cafés/día | `236,1 t CO₂e/año` | `240,0 t CO₂e/año` |

La casilla **Incluir bebidas y snacks (demo)** permite incluir o excluir los ítems marcados `(demo)` al cargar cualquiera de los escenarios.

### 2. Pestaña `Carga de datos`
- **Compra simple:** seleccioná edificio, año del período, categoría, nombre del producto, cantidad anual, unidad (`unidades`, `kg`, `g`, `litros`, `ml`), peso unitario en kg (solo si elegís `unidades`), fuente del dato y observaciones opcionales.
- **Receta elaborada:** permite cargar productos compuestos eligiendo una de las **4 plantillas del relevamiento** (*Sándwich milanesa de carne*, *Sándwich milanesa de pollo*, *Pizza muzzarella*, *Café con leche*) o armando ingredientes propios con su gramaje en kg por unidad elaborada.
- **Cálculo estimado (panel lateral):** muestra en tiempo real la masa equivalente, la fórmula paso a paso y el acumulado del período antes de guardar.
- **Registros cargados:** permite buscar por texto, filtrar (`Todos`, `Verificados`, `Solo (demo)`, `Solo recetas`), expandir el detalle de ingredientes en recetas, editar un registro o eliminarlo con confirmación en dos pasos.

### 3. Pestaña `Cálculo y trazabilidad`
- Resume la fórmula y conversiones vigentes.
- Lista cada registro en **Detalle por registro** conservando exactamente la operación realizada y la fuente del dato.
- Muestra la tabla completa de los **13 factores de emisión**, filtrable entre `Todos (13)`, `Verificados (8)` y `Demo (5)`.

### 4. Pestaña `Resultados`
- **Aviso de transparencia `(demo)`:** cuando existen ítems con factores de demostración, separa el aporte `(demo)` del subtotal verificado.
- **Indicadores clave (KPIs):** total en `kg CO₂e`, total en toneladas (`t CO₂e`), masa total comprada (`kg`), intensidad promedio (`kg CO₂e/kg`) y categoría principal emisora.
- **Masa comprada vs. emisiones:** compara el porcentaje de peso físico frente al porcentaje de emisiones por categoría e incluye una lectura automática de concentración.
- **Desglose por categoría:** barras horizontales intercambiables entre `kg CO₂e`, `% CO₂e` y `Masa (kg)`.
- **Evolución por año:** compara las emisiones acumuladas por período cuando hay más de un año cargado.
- **Envío y exportación de datos:**
  - **Enviar datos y cálculos:** agrupa los registros por período y edificio y los envía al cliente de API (`POST /resultados`), mostrando el código HTTP (`201`) y el total recalculado.
  - **Ver JSON / Copiar JSON / Descargar JSON:** permite inspeccionar el payload oficial en pantalla, copiarlo al portapapeles o descargarlo como `cantina-co2.json`.
  - **Borrar registros:** limpia los registros guardados previa confirmación en línea.

---

## Persistencia local e integración con API

- **Almacenamiento en el navegador:** los registros se persisten automáticamente en `localStorage` bajo la clave `cantina_registros_v3` (con lectura retrocompatible de `cantina_registros_v2`). Si el almacenamiento del navegador está bloqueado o lleno, se muestra un aviso visible permitiendo seguir operando en memoria y descargar el JSON.
- **Contrato con API central:** `frontend/app.js` implementa una interfaz compatible con la arquitectura común definida para el proyecto:
  - `GET /factores-emision?dimension=alimentacion-cantina` (opcional `&anio=...`)
  - `GET /edificios?id_universidad=1`
  - `POST /resultados` (payload agrupado por `periodo` e `id_edificio`, con validación y recálculo del lado servidor en la API simulada).
- **Conectar un backend real:** editar `CONFIG.API_BASE` en [`frontend/app.js`](frontend/app.js) colocando la URL base del servidor (por ejemplo `"http://localhost:3000/api"`). Cuando `API_BASE` está vacío, se utiliza la API simulada local sin requerir backend activo.

---

## Estructura del proyecto

```text
greensoft-cantina-tp/
├── README.md
└── frontend/
    ├── index.html                   # Estructura de las 3 vistas, formulario dual y panel de escenarios
    ├── styles.css                   # Estilos, diseño responsive y estados visuales
    ├── app.js                       # Factores de emisión, cálculos, recetas, API simulada y exportación
    └── assets/
        ├── logo-utn-green.png       # Logo UTN FRC · Cátedra Green Software
        └── logo-greensoftware.png   # Logo Green Software
```
