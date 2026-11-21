# Documentación técnica y metodológica · Campus CO₂ (Dimensión 11: Alimentación y Cantina)

**Institución:** Universidad Tecnológica Nacional — Facultad Regional Córdoba (UTN FRC)  
**Carrera y cátedra:** Ingeniería en Sistemas de Información · Cátedra Green Software  
**Proyecto marco:** *Campus CO₂* (inventario universitario en 15 dimensiones)  
**Grupo:** Grupo 11 · Dimensión 11: Alimentación y Cantina  
**Estado de referencia:** noviembre de 2026 (prototipo web completo con 13 categorías verificadas, 0 factores `(demo)`, API simulada alineada al contrato y capa UX/UI orientada a auditoría y video explicativo)

---

## Propósito de esta carpeta

La carpeta `docs/` reúne en un único lugar **toda la documentación de contexto, metodología, investigación científica, decisiones de diseño, arquitectura de software, contrato de API y escenarios cuantitativos** producida durante el desarrollo del módulo frontend de la Dimensión 11.

Fue redactada específicamente para cumplir dos objetivos del equipo:

1. **Actualizar el informe escrito (`Grupo 11 TP3.docx`)** con precisión técnica y sin tener que rastrear decisiones en el código fuente o en conversaciones previas. En particular, permite cerrar las secciones que en el borrador original figuraban como pendientes (`(demo)`, diferencias del mock API de la Sec. 7.5, falta de implementación de recetas en Sec. 4.2/10.5, manejo de errores de `localStorage` de Sec. 6.5 y actualización de la matriz de validación de Sec. 16).
2. **Preparar la defensa académica y el video explicativo del sistema**, aportando un recorrido claro de qué hace cada pantalla, por qué aparecen datos precargados, cómo se calcula paso a paso, cómo se evitan superposiciones con otras dimensiones (en especial la electricidad Alcance 2 de la Dimensión 1) y qué hallazgos cuantitativos arroja el relevamiento.

> [!NOTE]
> Este repositorio **no** modifica automáticamente `Grupo 11 TP3.docx` ni la carpeta histórica `files/files/` (prototipo base inicial). Toda la guía de actualización del documento Word está concentrada en [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md).

---

## Guía de documentos en `docs/`

| Archivo | Contenido principal | Cuándo consultarlo |
| --- | --- | --- |
| [`00-indice.md`](00-indice.md) | Mapa general de la documentación, inventario de archivos del proyecto y tabla de correspondencia con `Grupo 11 TP3.docx`. | Punto de entrada para ubicar rápidamente qué documento cubre cada sección del TP. |
| [`01-contexto-metodologia-y-alcance.md`](01-contexto-metodologia-y-alcance.md) | Consigna de *Campus CO₂*, marco normativo argentino, GHG Protocol Alcance 3 Categoría 1, matriz de delimitación con las demás dimensiones, límite *cuna a comercio minorista*, fórmula y conversiones, relevamiento de campo (23-10 y 05-11-2026) y estimación eléctrica informativa excluida (`29.978 kWh/año`). | Al redactar o revisar Introducción, Alcances, Modelo de medición, Relevamiento, Equipamiento eléctrico y Supuestos (Sec. 1–3, 5, 10.2, 11, 12). |
| [`02-factores-emision-e-investigacion-bebidas-snacks.md`](02-factores-emision-e-investigacion-bebidas-snacks.md) | Catálogo completo de las **13 categorías verificadas** (`8` Poore y Nemecek 2018 vía OWID + `5` ADEME Agribalyse v3.2 2025). Comparativa de las 6 bases evaluadas, desglose por etapa y DQR en API ADEME, correcciones aplicadas, análisis de dispersión `5,2×` en snacks y 4 matices metodológicos de defensa. | Al actualizar Factores de emisión, Supuestos de mezclas, Validación y Bibliografía (Sec. 10, 12, 16, 17). |
| [`03-escenarios-relevamiento-y-resultados.md`](03-escenarios-relevamiento-y-resultados.md) | Parámetros y totales exactos línea por línea de los 3 escenarios (`Mínimo`, `Intermedio`, `Máximo`), impacto del reemplazo `(demo)` → Agribalyse v3.2, concentración (`71,9 %` CO₂e con `11,6 %` peso), explicación de la diferencia con la Sec. 13.1 del Word, análisis de sensibilidad y 4 plantillas de recetas elaboradas. | Al actualizar Escenarios, Resultados, Sensibilidad y Recetas (Sec. 10.5, 13.1–13.3). |
| [`04-arquitectura-y-funcionamiento-del-software.md`](04-arquitectura-y-funcionamiento-del-software.md) | Stack vanilla sin dependencias (ejecución offline y `file://`), arquitectura de archivos, persistencia y manejo de errores en `localStorage`, recorrido paso a paso de todas las pantallas y componentes UX/UI (incluyendo guía rápida y ayudas de contexto) y guion sugerido para el video. | Al actualizar Frontend, Cálculo y Visualización (Sec. 6, 8, 9, 14) y al grabar el video explicativo. |
| [`05-modelo-datos-y-api-simulada.md`](05-modelo-datos-y-api-simulada.md) | Diccionario de las 13 entidades actualizado (con `Receta` e `Ingrediente` ya implementados), especificación completa de `GET /factores-emision`, `GET /edificios` y `POST /resultados` con payloads JSON reales, cierre de todas las brechas de la Sec. 7.5 y conexión futura mediante `CONFIG.API_BASE`. | Al actualizar Modelo de datos e Integración con API central (Sec. 4, 7, 14). |
| [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) | Registro completo de decisiones técnicas, metodológicas y UX/UI (D1–D8), matriz sección por sección con los cambios concretos para `Grupo 11 TP3.docx`, checklist de pendientes reales de campo/entrega y texto actualizado para Uso de IA y validación (Sec. 16). | Como lista de control integral antes de cerrar la edición final de `Grupo 11 TP3.docx`. |

---

## Mapa de archivos del workspace

El entorno de trabajo separa el repositorio activo de la aplicación web respecto de los archivos de referencia históricos y documentales en el directorio padre:

```text
TPI3-Green/
├── Grupo 11 TP3.docx                         # Informe principal del TP (referencia; el equipo lo edita manualmente)
├── PRODUCT.md                                # Definición de producto, audiencia, restricciones y tono
├── investigacion-para-bebidas-snacks.md      # Investigación y auditoría de factores ADEME Agribalyse v3.2
├── files/files/                              # Prototipo base inicial (referencia histórica intacta)
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── greensoft-cantina-tp/                     # Repositorio Git activo del módulo entregable
    ├── README.md                             # Resumen de uso, ejecución rápida e índice a docs/
    ├── docs/                                 # Documentación integral (esta carpeta)
    │   ├── 00-indice.md
    │   ├── 01-contexto-metodologia-y-alcance.md
    │   ├── 02-factores-emision-e-investigacion-bebidas-snacks.md
    │   ├── 03-escenarios-relevamiento-y-resultados.md
    │   ├── 04-arquitectura-y-funcionamiento-del-software.md
    │   ├── 05-modelo-datos-y-api-simulada.md
    │   └── 06-decisiones-y-guia-actualizacion-tp.md
    └── frontend/                             # Aplicación web final sin dependencias externas
        ├── index.html                        # Estructura en 3 pasos, guía rápida y drawers
        ├── styles.css                        # Sistema visual "Espacio Blanco Minimalista UTN"
        ├── app.js                            # 13 factores, recetas, escenarios, API simulada y gráficos
        └── assets/
            ├── logo-utn-green.png            # Logo institucional UTN FRC · Cátedra Green Software
            └── logo-greensoftware.png        # Logo Green Software
```

---

## Correspondencia rápida con `Grupo 11 TP3.docx`

La siguiente tabla indica exactamente qué documento de `docs/` consultar para actualizar cada sección del trabajo práctico:

| Sección de `Grupo 11 TP3.docx` | Estado respecto al prototipo actual | Documentos de `docs/` a consultar |
| --- | --- | --- |
| **Carátula y encabezados** | Pendiente de datos del equipo (integrantes, legajos, docente y carátula oficial). | [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) |
| **Sec. 1. Introducción y marco normativo** | Vigente; el módulo pasó a contar con factores verificados completos. | [`01-contexto-metodologia-y-alcance.md`](01-contexto-metodologia-y-alcance.md) |
| **Sec. 2. Alcance de la dimensión** | Vigente; delimitación intacta con Alcance 3 Cat. 1. | [`01-contexto-metodologia-y-alcance.md`](01-contexto-metodologia-y-alcance.md) |
| **Sec. 3. Modelo de medición** | Vigente; conversiones, densidad `1 kg/l` y fórmula reflejadas en el código. | [`01-contexto-metodologia-y-alcance.md`](01-contexto-metodologia-y-alcance.md) |
| **Sec. 4. Modelo de datos y diccionario** | **Desactualizada en Sec. 4.2:** `Receta` e `Ingrediente` ya están implementadas y `Edificio` incluye `id_universidad`. | [`05-modelo-datos-y-api-simulada.md`](05-modelo-datos-y-api-simulada.md) |
| **Sec. 5. Relevamiento realizado** | Vigente (visitas 23-10 y 05-11-2026); siguen faltando facturas y recetas exactas de cocina. | [`01-contexto-metodologia-y-alcance.md`](01-contexto-metodologia-y-alcance.md) · [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) |
| **Sec. 6. Módulo de carga (frontend)** | **Desactualizada:** hoy soporta formulario dual Simple/Receta, 4 plantillas, guía rápida, escenarios, filtros, edición, borrado 2 pasos y manejo visible de errores en `cantina_registros_v3`. | [`04-arquitectura-y-funcionamiento-del-software.md`](04-arquitectura-y-funcionamiento-del-software.md) |
| **Sec. 7. Integración con la API central** | **Desactualizada en 7.3 y 7.5:** se resolvieron las 6 brechas del mock (filtros, HTTP `201`/`400`/`404`, recálculo server-side y payload de recetas). | [`05-modelo-datos-y-api-simulada.md`](05-modelo-datos-y-api-simulada.md) |
| **Sec. 8. Módulo de cálculo y trazabilidad** | **Ampliada:** ahora soporta `calcularReceta()` con desglose por ingrediente y tabla filtrable de los 13 factores. | [`04-arquitectura-y-funcionamiento-del-software.md`](04-arquitectura-y-funcionamiento-del-software.md) |
| **Sec. 9. Módulo de visualización** | **Desactualizada:** ya no existe recuadro rojo de aviso `(demo)` ni etiquetas `(demo)`; se incorporó insight automático Top 2 y selector unificado `kg CO₂e / % CO₂e / Masa (kg)`. | [`04-arquitectura-y-funcionamiento-del-software.md`](04-arquitectura-y-funcionamiento-del-software.md) |
| **Sec. 10. Factores de emisión y fuentes** | **Desactualizada:** pasó de "fuente única" a 2 bases complementarias (`Poore y Nemecek 2018` + `ADEME Agribalyse v3.2`); 13/13 categorías cubiertas. | [`02-factores-emision-e-investigacion-bebidas-snacks.md`](02-factores-emision-e-investigacion-bebidas-snacks.md) |
| **Sec. 11. Equipamiento eléctrico (informativo)** | Vigente (`29.978 kWh/año ≈ 30.000 kWh/año`), solo se muestra como nota informativa separada. | [`01-contexto-metodologia-y-alcance.md`](01-contexto-metodologia-y-alcance.md) · [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) |
| **Sec. 12. Supuestos metodológicos** | **Ampliar:** agregar exclusión de `Consommation` en Agribalyse, sesgo eléctrico Francia vs. Argentina, mezclas declaradas (`3,47` en snacks y `0,73` en jugos) y formato individual de envases. | [`02-factores-emision-e-investigacion-bebidas-snacks.md`](02-factores-emision-e-investigacion-bebidas-snacks.md) |
| **Sec. 13. Resultados del relevamiento** | **Actualizar:** incorporar totales con bebidas y snacks (`42,639 / 118,025 / 240,173 t CO₂e`) y aclarar diferencia de serie en 13.1 frente a `app.js` (`40,8 / 115,3 / 236,1 t` básicos). | [`03-escenarios-relevamiento-y-resultados.md`](03-escenarios-relevamiento-y-resultados.md) |
| **Sec. 14. Arquitectura del sistema** | Vigente con mejoras: `localStorage` migrado a `cantina_registros_v3` + `cantina_meta_v3`, y API simulada equivalente al contrato. | [`04-arquitectura-y-funcionamiento-del-software.md`](04-arquitectura-y-funcionamiento-del-software.md) · [`05-modelo-datos-y-api-simulada.md`](05-modelo-datos-y-api-simulada.md) |
| **Sec. 15. Conclusiones preliminares** | **Actualizar:** varios "próximos pasos" originales (factores bebidas/snacks, `Receta`/`Ingrediente`, brechas de Sec. 7.5, manejo `localStorage`) ya fueron ejecutados. | [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) |
| **Sec. 16. Uso de IA y validación** | **Actualizar:** marcar bebidas/snacks como verificados contra API ADEME y reflejar controles automatizados + verificación en navegador. | [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) |
| **Sec. 17. Referencias bibliográficas** | **Ampliar:** sumar ADEME Agribalyse v3.2 (`data.ademe.fr`, `agribalyse.ademe.fr`, `impactco2.fr`), Amienyo et al. (2013) y EPD Fonteviva `S-P-05806`. | [`02-factores-emision-e-investigacion-bebidas-snacks.md`](02-factores-emision-e-investigacion-bebidas-snacks.md) |
| **Sec. 18. Anexos (A–E)** | Anexo C (DER) vigente; Anexos A (capturas nuevas), B (fotos difuminadas), D (visita de cierre) y E (captura mensaje docente) requieren material del equipo. | [`06-decisiones-y-guia-actualizacion-tp.md`](06-decisiones-y-guia-actualizacion-tp.md) |
