(function () {
  "use strict";

  /* ============ CONFIGURACIÓN ============ */
  var CONFIG = {
    API_BASE: "",
    ENDPOINTS: {
      factores: "/factores-emision",
      edificios: "/edificios",
      resultados: "/resultados"
    },
    DIMENSION: "alimentacion-cantina",
    ALCANCE: 3,
    STORAGE_KEY: "cantina_registros_v3",
    LEGACY_STORAGE_KEY: "cantina_registros_v2",
    META_KEY: "cantina_meta_v3"
  };

  var UNIDADES = ["unidad", "kg", "g", "l", "ml"];

  /* ============ CATÁLOGO DE FACTORES Y EDIFICIOS ============ */
  var FUENTE_POORE = "Poore y Nemecek (2018), via Our World in Data";
  var FUENTE_AGRIBALYSE = "ADEME Agribalyse v3.2 (2025), excl. consumo";
  var ETAPA = "cuna a comercio minorista";

  function fe(id, categoria, nombre, valor, opts) {
    var cfg = opts || {};
    return {
      id_factor: id,
      categoria: categoria,
      nombre: nombre,
      valor: valor,
      unidad_base: "kg CO2e/kg",
      etapa: cfg.etapa || ETAPA,
      fuente: cfg.fuente || FUENTE_POORE,
      anio_referencia: cfg.anio !== undefined ? cfg.anio : 2018
    };
  }

  var MOCK_FACTORES = [
    fe(1, "carne_vacuna", "Carne vacuna", 99.48),
    fe(2, "queso", "Queso", 23.88),
    fe(3, "cafe_granos", "Café en granos", 28.53),
    fe(4, "cerdo_fiambres", "Cerdo y fiambres", 12.31),
    fe(5, "pollo", "Pollo", 9.87),
    fe(6, "huevos", "Huevos", 4.67),
    fe(7, "leche", "Leche", 3.15),
    fe(8, "harinas_pan", "Harinas y pan", 1.57),
    fe(9, "bebidas_gaseosas", "Gaseosas y bebidas azucaradas", 0.49, {
      fuente: FUENTE_AGRIBALYSE + " · Code_AGB 18018 (Cola)",
      anio: 2025
    }),
    fe(10, "agua", "Agua y aguas saborizadas", 0.32, {
      fuente: FUENTE_AGRIBALYSE + " · Code_AGB 18430 (Eau embouteillée)",
      anio: 2025
    }),
    fe(11, "jugos_isotonicos", "Jugos e isotónicos", 0.73, {
      fuente: FUENTE_AGRIBALYSE + " · Mix 50/50 Code_AGB 2012 y 18339",
      anio: 2025
    }),
    fe(12, "energizantes", "Energizantes", 0.68, {
      fuente: FUENTE_AGRIBALYSE + " · Code_AGB 18352 (Boisson énergisante)",
      anio: 2025
    }),
    fe(13, "snacks", "Snacks, golosinas y alfajores", 3.47, {
      fuente: FUENTE_AGRIBALYSE + " · Mix cantina Code_AGB 4004, 38105, 24030 y 31012",
      anio: 2025
    })
  ];

  var MOCK_EDIFICIOS = [
    { id_edificio: 1, id_universidad: 1, nombre: "Cantina principal" },
    { id_edificio: 2, id_universidad: 1, nombre: "Otro edificio" }
  ];

  var PLANTILLAS_RECETA = [
    {
      id: "sandwich_carne",
      label: "Sándwich milanesa de carne",
      nombre: "Sándwich de milanesa de carne",
      cantidad: 6050,
      ingredientes: [
        { categoria: "carne_vacuna", nombre: "Milanesa vacuna", kg_por_unidad: 0.1 },
        { categoria: "queso", nombre: "Queso en fetas", kg_por_unidad: 0.03 },
        { categoria: "harinas_pan", nombre: "Pan baguette", kg_por_unidad: 0.12 }
      ]
    },
    {
      id: "sandwich_pollo",
      label: "Sándwich milanesa de pollo",
      nombre: "Sándwich de milanesa de pollo",
      cantidad: 4537,
      ingredientes: [
        { categoria: "pollo", nombre: "Suprema de pollo", kg_por_unidad: 0.1 },
        { categoria: "queso", nombre: "Queso en fetas", kg_por_unidad: 0.03 },
        { categoria: "harinas_pan", nombre: "Pan baguette", kg_por_unidad: 0.12 }
      ]
    },
    {
      id: "pizza_muzzarella",
      label: "Pizza muzzarella",
      nombre: "Pizza muzzarella entera",
      cantidad: 1800,
      ingredientes: [
        { categoria: "harinas_pan", nombre: "Harina y masa", kg_por_unidad: 0.3 },
        { categoria: "queso", nombre: "Queso muzzarella", kg_por_unidad: 0.25 }
      ]
    },
    {
      id: "cafe_con_leche",
      label: "Café con leche",
      nombre: "Vaso de café con leche",
      cantidad: 24750,
      ingredientes: [
        { categoria: "cafe_granos", nombre: "Café molido", kg_por_unidad: 0.009 },
        { categoria: "leche", nombre: "Leche fluida", kg_por_unidad: 0.11 }
      ]
    }
  ];

  var ESCENARIOS = {
    minimo: {
      etiqueta: "mínimo (250 días/año)",
      items: [
        { categoria: "carne_vacuna", producto: "Carne vacuna para sándwiches y milanesas", cantidad: 180, unidad: "kg" },
        { categoria: "queso", producto: "Queso en sándwiches y pizzas", cantidad: 375, unidad: "kg" },
        { categoria: "leche", producto: "Leche en barra de café", cantidad: 1250, unidad: "l" },
        { categoria: "cafe_granos", producto: "Café en granos molido", cantidad: 120, unidad: "kg" },
        { categoria: "harinas_pan", producto: "Harinas, pan y prepizzas", cantidad: 1250, unidad: "kg" },
        { categoria: "cerdo_fiambres", producto: "Cerdo y fiambres en sándwiches", cantidad: 210, unidad: "kg" },
        { categoria: "pollo", producto: "Pollo en sándwiches y milanesas", cantidad: 210, unidad: "kg" }
      ],
      bebidasSnacks: [
        { categoria: "bebidas_gaseosas", producto: "Gaseosas línea 500 ml", cantidad: 4000, unidad: "unidad", peso: 0.5 },
        { categoria: "agua", producto: "Agua mineral 500 ml", cantidad: 2500, unidad: "unidad", peso: 0.5 },
        { categoria: "snacks", producto: "Alfajores y snacks 60 g", cantidad: 2000, unidad: "unidad", peso: 0.06 }
      ]
    },
    intermedio: {
      etiqueta: "intermedio (275 días/año)",
      items: [
        { categoria: "carne_vacuna", producto: "Carne vacuna para sándwiches y milanesas", cantidad: 605, unidad: "kg" },
        { categoria: "queso", producto: "Queso en sándwiches y pizzas", cantidad: 1031.25, unidad: "kg" },
        { categoria: "leche", producto: "Leche en barra de café", cantidad: 2750, unidad: "l" },
        { categoria: "cafe_granos", producto: "Café en granos molido", cantidad: 222.75, unidad: "kg" },
        { categoria: "harinas_pan", producto: "Harinas, pan y prepizzas", cantidad: 3437.5, unidad: "kg" },
        { categoria: "cerdo_fiambres", producto: "Cerdo y fiambres en sándwiches", cantidad: 453.75, unidad: "kg" },
        { categoria: "pollo", producto: "Pollo en sándwiches y milanesas", cantidad: 453.75, unidad: "kg" }
      ],
      bebidasSnacks: [
        { categoria: "bebidas_gaseosas", producto: "Gaseosas línea 500 ml", cantidad: 6000, unidad: "unidad", peso: 0.5 },
        { categoria: "agua", producto: "Agua mineral 500 ml", cantidad: 4000, unidad: "unidad", peso: 0.5 },
        { categoria: "snacks", producto: "Alfajores y snacks 60 g", cantidad: 3000, unidad: "unidad", peso: 0.06 }
      ]
    },
    maximo: {
      etiqueta: "máximo (300 días/año)",
      items: [
        { categoria: "carne_vacuna", producto: "Carne vacuna para sándwiches y milanesas", cantidad: 1440, unidad: "kg" },
        { categoria: "queso", producto: "Queso en sándwiches y pizzas", cantidad: 1800, unidad: "kg" },
        { categoria: "leche", producto: "Leche en barra de café", cantidad: 4500, unidad: "l" },
        { categoria: "cafe_granos", producto: "Café en granos molido", cantidad: 360, unidad: "kg" },
        { categoria: "harinas_pan", producto: "Harinas, pan y prepizzas", cantidad: 6000, unidad: "kg" },
        { categoria: "cerdo_fiambres", producto: "Cerdo y fiambres en sándwiches", cantidad: 720, unidad: "kg" },
        { categoria: "pollo", producto: "Pollo en sándwiches y milanesas", cantidad: 720, unidad: "kg" }
      ],
      bebidasSnacks: [
        { categoria: "bebidas_gaseosas", producto: "Gaseosas línea 500 ml", cantidad: 9000, unidad: "unidad", peso: 0.5 },
        { categoria: "agua", producto: "Agua mineral 500 ml", cantidad: 6000, unidad: "unidad", peso: 0.5 },
        { categoria: "snacks", producto: "Alfajores y snacks 60 g", cantidad: 4500, unidad: "unidad", peso: 0.06 }
      ]
    }
  };

  /* ============ UTILIDADES ============ */
  var $ = function (id) { return document.getElementById(id); };

  function fmt(n, d) {
    if (d === undefined) d = 2;
    return Number(n).toLocaleString("es-AR", {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function redondear(n, dec) {
    var factor = Math.pow(10, dec);
    return Math.round((Number(n) + Number.EPSILON) * factor) / factor;
  }

  function svgIcon(pathMarkup, size) {
    var s = size || 15;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(s));
    svg.setAttribute("height", String(s));
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.75");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = pathMarkup;
    return svg;
  }

  function crearEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function nombreCat(c) {
    return FACTORES[c] ? FACTORES[c].nombre : c;
  }

  function esFuenteAgribalyse(cat) {
    var f = FACTORES[cat];
    return Boolean(f && String(f.fuente || "").indexOf("Agribalyse") !== -1);
  }

  function mostrarAlertaStorage(msg) {
    var banner = $("storageBanner");
    var texto = $("storageBannerMsg");
    if (!banner || !texto) return;
    texto.textContent = msg;
    banner.hidden = false;
  }

  function limpiarAlertaStorage() {
    var banner = $("storageBanner");
    if (banner) banner.hidden = true;
  }

  /* ============ CAPA DE API SIMULADA Y REAL ============ */
  function crearHttpError(status, msg) {
    var err = new Error("HTTP " + status + " · " + msg);
    err.status = status;
    return err;
  }

  var apiSimulada = {
    async getFactores(params) {
      var opts = params || {};
      var dim = opts.dimension || CONFIG.DIMENSION;
      if (dim !== CONFIG.DIMENSION) {
        throw crearHttpError(400, "dimensión faltante o inválida");
      }
      if (opts.anio !== undefined && opts.anio !== null && opts.anio !== "") {
        var anio = Number(opts.anio);
        if (!Number.isInteger(anio)) {
          throw crearHttpError(400, "el parámetro año debe ser entero");
        }
        if (anio < 2018 || anio > 2100) {
          throw crearHttpError(404, "no existen factores para el año " + anio);
        }
      }
      return MOCK_FACTORES.map(function (f) { return Object.assign({}, f); });
    },

    async getEdificios(params) {
      var opts = params || {};
      if (opts.id_universidad !== undefined && opts.id_universidad !== null && opts.id_universidad !== "") {
        var idUni = Number(opts.id_universidad);
        if (!Number.isInteger(idUni) || idUni <= 0) {
          throw crearHttpError(400, "id_universidad inválido");
        }
        var filtrados = MOCK_EDIFICIOS.filter(function (e) { return e.id_universidad === idUni; });
        if (!filtrados.length) {
          throw crearHttpError(404, "universidad inexistente");
        }
        return filtrados.map(function (e) { return Object.assign({}, e); });
      }
      return MOCK_EDIFICIOS.map(function (e) { return Object.assign({}, e); });
    },

    async postResultados(p) {
      if (!p || typeof p !== "object") {
        throw crearHttpError(400, "cuerpo JSON inválido");
      }
      var errores400 = [];
      if (p.dimension !== CONFIG.DIMENSION) errores400.push("dimension");
      if (p.alcance !== CONFIG.ALCANCE) errores400.push("alcance");
      if (!Number.isInteger(p.periodo) || p.periodo < 2000 || p.periodo > 2100) errores400.push("periodo");
      if (!Array.isArray(p.registros) || !p.registros.length) errores400.push("registros");
      if (errores400.length) {
        throw crearHttpError(400, "validación de campos: " + errores400.join(", "));
      }

      if (!MOCK_EDIFICIOS.some(function (e) { return e.id_edificio === p.id_edificio; })) {
        throw crearHttpError(404, "edificio inexistente (" + p.id_edificio + ")");
      }

      var mapaFactores = {};
      MOCK_FACTORES.forEach(function (f) { mapaFactores[f.categoria] = f; });

      var totalRecalculado = 0;
      p.registros.forEach(function (r, idx) {
        if (r.tipo === "receta") {
          if (!(Number(r.cantidad) > 0)) {
            throw crearHttpError(400, "registros[" + idx + "].cantidad debe ser mayor a 0");
          }
          if (!Array.isArray(r.ingredientes) || !r.ingredientes.length) {
            throw crearHttpError(400, "registros[" + idx + "].ingredientes vacío");
          }
          r.ingredientes.forEach(function (ing, j) {
            if (!(Number(ing.kg_por_unidad) > 0)) {
              throw crearHttpError(400, "registros[" + idx + "].ingredientes[" + j + "].kg_por_unidad inválido");
            }
            var fIng = mapaFactores[ing.categoria];
            if (!fIng) {
              throw crearHttpError(404, "categoría inexistente (" + ing.categoria + ")");
            }
            totalRecalculado += Number(r.cantidad) * Number(ing.kg_por_unidad) * fIng.valor;
          });
        } else {
          if (!UNIDADES.includes(r.unidad)) {
            throw crearHttpError(400, "registros[" + idx + "].unidad inválida");
          }
          if (!(Number(r.cantidad) > 0)) {
            throw crearHttpError(400, "registros[" + idx + "].cantidad debe ser mayor a 0");
          }
          if (r.unidad === "unidad" && !(Number(r.peso_unitario_kg) > 0)) {
            throw crearHttpError(400, "registros[" + idx + "].peso_unitario_kg requerido");
          }
          var fSim = mapaFactores[r.categoria];
          if (!fSim) {
            throw crearHttpError(404, "categoría inexistente (" + r.categoria + ")");
          }
          var masa = aKg(Number(r.cantidad), r.unidad, Number(r.peso_unitario_kg));
          totalRecalculado += masa * fSim.valor;
        }
      });

      return {
        status: 201,
        data: {
          registros_recibidos: p.registros.length,
          total_co2e_kg: redondear(totalRecalculado, 3)
        }
      };
    }
  };

  async function pedir(ruta, opciones) {
    var r = await fetch(CONFIG.API_BASE + ruta, opciones);
    if (!r.ok) {
      throw crearHttpError(r.status, r.statusText || "error de red");
    }
    var data = await r.json();
    return { status: r.status, data: data };
  }

  var apiReal = {
    async getFactores(params) {
      var opts = params || {};
      var qs = "?dimension=" + encodeURIComponent(opts.dimension || CONFIG.DIMENSION);
      if (opts.anio) qs += "&anio=" + encodeURIComponent(opts.anio);
      var res = await pedir(CONFIG.ENDPOINTS.factores + qs);
      return res.data;
    },
    async getEdificios(params) {
      var opts = params || {};
      var qs = opts.id_universidad ? "?id_universidad=" + encodeURIComponent(opts.id_universidad) : "";
      var res = await pedir(CONFIG.ENDPOINTS.edificios + qs);
      return res.data;
    },
    async postResultados(p) {
      return pedir(CONFIG.ENDPOINTS.resultados, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
    }
  };

  var API = function () { return CONFIG.API_BASE ? apiReal : apiSimulada; };

  /* ============ ESTADO DE APLICACIÓN ============ */
  var FACTORES = {};
  var EDIFICIOS = [];
  var registros = [];
  var origenDatos = null;
  var estadoUI = {
    tab: "carga",
    modoCarga: "simple",
    editandoId: null,
    confirmandoBorradoId: null,
    expandidosIds: {},
    filtroTexto: "",
    filtroTipo: "todos",
    filtroFactor: "todos",
    metricaGrafico: "co2e",
    jsonVisible: false,
    ingredientesForm: []
  };

  function guardarRegistros() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(registros));
      limpiarAlertaStorage();
      return true;
    } catch (e) {
      mostrarAlertaStorage("No se pudieron guardar los cambios en el navegador (almacenamiento lleno o restringido). Podés continuar trabajando y descargar el JSON antes de cerrar.");
      return false;
    }
  }

  function guardarMeta() {
    try {
      if (origenDatos) {
        localStorage.setItem(CONFIG.META_KEY, JSON.stringify(origenDatos));
      } else {
        localStorage.removeItem(CONFIG.META_KEY);
      }
    } catch (e) {
      /* Almacenamiento restringido */
    }
  }

  function limpiarMeta() {
    origenDatos = null;
    try {
      localStorage.removeItem(CONFIG.META_KEY);
    } catch (e) {
      /* Ignorar si storage está bloqueado */
    }
  }

  function marcarCambioManualEnOrigen() {
    if (origenDatos && origenDatos.origen === "escenario") {
      origenDatos.modificado = true;
    } else {
      origenDatos = { origen: "manual" };
    }
    guardarMeta();
  }

  function cargarMetaInicial() {
    try {
      var raw = localStorage.getItem(CONFIG.META_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function cargarRegistrosIniciales() {
    try {
      var raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (raw !== null) {
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
      var legacyRaw = localStorage.getItem(CONFIG.LEGACY_STORAGE_KEY);
      if (legacyRaw !== null) {
        var legacy = JSON.parse(legacyRaw);
        return Array.isArray(legacy) ? legacy : [];
      }
      return [];
    } catch (e) {
      mostrarAlertaStorage("No se pudo leer el almacenamiento local del navegador. Se inició una sesión temporal en memoria.");
      return [];
    }
  }

  /* ============ CÁLCULOS Y TRAZABILIDAD ============ */
  function aKg(cantidad, unidad, pesoUnit) {
    switch (unidad) {
      case "unidad": return cantidad * pesoUnit;
      case "kg": return cantidad;
      case "g": return cantidad / 1000;
      case "l": return cantidad;
      case "ml": return cantidad / 1000;
      default: return NaN;
    }
  }

  function calcularSimple(r) {
    var f = FACTORES[r.categoria];
    if (!f) return null;
    var masaKg = aKg(r.cantidad, r.unidad, r.peso_unitario_kg);
    var co2eKg = masaKg * f.valor;
    var trazabilidad = r.unidad === "unidad"
      ? fmt(r.cantidad, 0) + " u × " + fmt(r.peso_unitario_kg, 3) + " kg × " + fmt(f.valor, 2) + " kg CO₂e/kg"
      : fmt(r.cantidad, 2) + " " + r.unidad + " → " + fmt(masaKg, 3) + " kg × " + fmt(f.valor, 2) + " kg CO₂e/kg" +
        (r.unidad === "l" || r.unidad === "ml" ? " (densidad 1 kg/l)" : "");
    return {
      masa_kg: masaKg,
      factor_valor: f.valor,
      co2e_kg: co2eKg,
      trazabilidad: trazabilidad
    };
  }

  function calcularReceta(r) {
    if (!Array.isArray(r.ingredientes) || !r.ingredientes.length) return null;
    var masaPorUnidad = 0;
    var co2ePorUnidad = 0;
    var lineas = [];
    var ingredientesCalculados = [];

    for (var i = 0; i < r.ingredientes.length; i++) {
      var ing = r.ingredientes[i];
      var f = FACTORES[ing.categoria];
      if (!f) return null;
      var kgU = Number(ing.kg_por_unidad);
      var co2U = kgU * f.valor;
      masaPorUnidad += kgU;
      co2ePorUnidad += co2U;
      var masaTotalIng = r.cantidad * kgU;
      var co2TotalIng = r.cantidad * co2U;
      var etiquetaIng = ing.nombre || f.nombre;
      lineas.push(etiquetaIng + " (" + nombreCat(ing.categoria) + "): " +
        fmt(r.cantidad, 0) + " u × " + fmt(kgU, 3) + " kg/u × " + fmt(f.valor, 2) +
        " = " + fmt(co2TotalIng, 2) + " kg CO₂e");
      ingredientesCalculados.push({
        categoria: ing.categoria,
        nombre: etiquetaIng,
        kg_por_unidad: kgU,
        factor_valor: f.valor,
        masa_kg: masaTotalIng,
        co2e_kg: co2TotalIng
      });
    }

    var masaKg = r.cantidad * masaPorUnidad;
    var co2eKg = r.cantidad * co2ePorUnidad;
    return {
      masa_kg: masaKg,
      factor_valor: masaKg > 0 ? co2eKg / masaKg : 0,
      co2e_kg: co2eKg,
      co2e_por_unidad: co2ePorUnidad,
      ingredientes: ingredientesCalculados,
      trazabilidad: fmt(r.cantidad, 0) + " u elaboradas (" + fmt(co2ePorUnidad, 2) + " kg CO₂e/u):\n" + lineas.join("\n")
    };
  }

  function recalcularRegistro(r) {
    if (r.tipo === "receta") {
      var resReceta = calcularReceta(r);
      if (!resReceta) return null;
      return Object.assign({}, r, resReceta, { categoria: "receta_elaborada" });
    }
    var resSimple = calcularSimple(r);
    if (!resSimple) return null;
    return Object.assign({}, r, { tipo: "simple" }, resSimple);
  }

  function desglosarPorCategoria(lista) {
    var mapa = {};
    function sumar(cat, masa, co2e) {
      if (!mapa[cat]) {
        mapa[cat] = {
          categoria: cat,
          nombre: nombreCat(cat),
          masa_kg: 0,
          co2e_kg: 0
        };
      }
      mapa[cat].masa_kg += masa;
      mapa[cat].co2e_kg += co2e;
    }

    lista.forEach(function (r) {
      if (r.tipo === "receta" && Array.isArray(r.ingredientes)) {
        r.ingredientes.forEach(function (ing) {
          sumar(ing.categoria, ing.masa_kg, ing.co2e_kg);
        });
      } else {
        sumar(r.categoria, r.masa_kg, r.co2e_kg);
      }
    });

    return Object.values(mapa).sort(function (a, b) { return b.co2e_kg - a.co2e_kg; });
  }

  /* ============ CONTRATO API POST /resultados ============ */
  function armarPayloads() {
    var grupos = {};
    registros.forEach(function (r) {
      var k = r.periodo + "|" + r.id_edificio;
      if (!grupos[k]) grupos[k] = [];
      grupos[k].push(r);
    });
    return Object.values(grupos).map(function (lista) {
      var totalGrupo = lista.reduce(function (acc, r) { return acc + r.co2e_kg; }, 0);
      return {
        dimension: CONFIG.DIMENSION,
        alcance: CONFIG.ALCANCE,
        periodo: lista[0].periodo,
        id_edificio: lista[0].id_edificio,
        total_co2e_kg: redondear(totalGrupo, 3),
        registros: lista.map(function (r) {
          if (r.tipo === "receta") {
            return {
              tipo: "receta",
              categoria: "receta_elaborada",
              producto: r.producto,
              cantidad: r.cantidad,
              unidad: "unidad",
              peso_unitario_kg: redondear(r.masa_kg / r.cantidad, 4),
              ingredientes: r.ingredientes.map(function (ing) {
                return {
                  categoria: ing.categoria,
                  nombre: ing.nombre,
                  kg_por_unidad: ing.kg_por_unidad,
                  factor_valor: ing.factor_valor,
                  masa_kg: redondear(ing.masa_kg, 4),
                  co2e_kg: redondear(ing.co2e_kg, 4)
                };
              }),
              fuente_dato: r.fuente_dato,
              observaciones: r.observaciones,
              masa_kg: redondear(r.masa_kg, 4),
              factor_valor: redondear(r.factor_valor, 4),
              co2e_kg: redondear(r.co2e_kg, 4),
              trazabilidad: r.trazabilidad
            };
          }
          return {
            tipo: "simple",
            categoria: r.categoria,
            producto: r.producto,
            cantidad: r.cantidad,
            unidad: r.unidad,
            peso_unitario_kg: r.peso_unitario_kg,
            fuente_dato: r.fuente_dato,
            observaciones: r.observaciones,
            masa_kg: redondear(r.masa_kg, 4),
            factor_valor: r.factor_valor,
            co2e_kg: redondear(r.co2e_kg, 4),
            trazabilidad: r.trazabilidad
          };
        })
      };
    });
  }

  /* ============ FORMULARIO DUAL Y VALIDACIONES ============ */
  function setErr(id, texto) {
    var el = $(id);
    var m = document.querySelector('.msg-err[data-for="' + id + '"]');
    if (el) el.classList.toggle("err", Boolean(texto));
    if (m) m.textContent = texto || "";
    return !texto;
  }

  function limpiarErrores() {
    document.querySelectorAll(".err").forEach(function (el) { el.classList.remove("err"); });
    document.querySelectorAll(".msg-err").forEach(function (el) { el.textContent = ""; });
  }

  function actualizarPeso() {
    var u = $("unidad").value;
    var esUnidad = u === "unidad";
    $("pesoBox").hidden = !esUnidad;
    if (!esUnidad) setErr("peso", "");
    var hints = {
      unidad: "Requiere indicar el peso de una unidad en kg.",
      kg: "Valor directo en kilogramos comprados al año.",
      g: "El sistema divide por 1.000 para pasar gramos a kg.",
      l: "Asume densidad similar al agua: 1 litro = 1 kg.",
      ml: "El sistema divide por 1.000 para pasar ml a kg."
    };
    var hintEl = $("unidadHint");
    if (hintEl) hintEl.textContent = hints[u] || "";
  }

  function crearIngredienteVacio(categoria, nombre, kgPorUnidad) {
    return {
      categoria: categoria || "carne_vacuna",
      nombre: nombre || "",
      kg_por_unidad: kgPorUnidad !== undefined ? kgPorUnidad : ""
    };
  }

  function renderIngredientesForm() {
    var cont = $("ingredientesList");
    cont.innerHTML = "";
    if (!estadoUI.ingredientesForm.length) {
      estadoUI.ingredientesForm = [crearIngredienteVacio("carne_vacuna", "", "")];
    }

    estadoUI.ingredientesForm.forEach(function (ing, idx) {
      var row = crearEl("div", "ing-row");

      var sel = document.createElement("select");
      sel.setAttribute("aria-label", "Categoría del ingrediente " + (idx + 1));
      Object.values(FACTORES).forEach(function (f) {
        var opt = document.createElement("option");
        opt.value = f.categoria;
        opt.textContent = f.nombre;
        if (f.categoria === ing.categoria) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () {
        estadoUI.ingredientesForm[idx].categoria = sel.value;
        actualizarSubtotalesIngredientes();
        actualizarPreviewEnVivo();
      });

      var inpNombre = document.createElement("input");
      inpNombre.type = "text";
      inpNombre.placeholder = "Ingrediente (ej.: Milanesa)";
      inpNombre.value = ing.nombre;
      inpNombre.setAttribute("aria-label", "Nombre del ingrediente " + (idx + 1));
      inpNombre.addEventListener("input", function () {
        estadoUI.ingredientesForm[idx].nombre = inpNombre.value;
        actualizarPreviewEnVivo();
      });

      var inpKg = document.createElement("input");
      inpKg.type = "number";
      inpKg.min = "0";
      inpKg.step = "any";
      inpKg.placeholder = "kg / unidad";
      inpKg.value = ing.kg_por_unidad;
      inpKg.setAttribute("aria-label", "Kilogramos por unidad del ingrediente " + (idx + 1));
      inpKg.addEventListener("input", function () {
        estadoUI.ingredientesForm[idx].kg_por_unidad = inpKg.value;
        actualizarSubtotalesIngredientes();
        actualizarPreviewEnVivo();
      });

      var co2Span = crearEl("span", "ing-co2", calcularSubtotalIngredienteTexto(ing));
      co2Span.dataset.ingIdx = String(idx);

      var btnDel = crearEl("button", "icon-btn");
      btnDel.type = "button";
      btnDel.setAttribute("aria-label", "Quitar ingrediente " + (idx + 1));
      btnDel.title = "Quitar ingrediente";
      btnDel.appendChild(svgIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 14));
      btnDel.disabled = estadoUI.ingredientesForm.length <= 1;
      btnDel.addEventListener("click", function () {
        if (estadoUI.ingredientesForm.length <= 1) return;
        estadoUI.ingredientesForm.splice(idx, 1);
        renderIngredientesForm();
        actualizarPreviewEnVivo();
      });

      row.append(sel, inpNombre, inpKg, co2Span, btnDel);
      cont.appendChild(row);
    });
  }

  function calcularSubtotalIngredienteTexto(ing) {
    var f = FACTORES[ing.categoria];
    var kg = Number(ing.kg_por_unidad);
    if (!f || !(kg > 0)) return "–";
    return fmt(kg * f.valor, 2) + " kg CO₂e/u";
  }

  function actualizarSubtotalesIngredientes() {
    document.querySelectorAll(".ing-co2").forEach(function (el) {
      var idx = Number(el.dataset.ingIdx);
      if (estadoUI.ingredientesForm[idx]) {
        el.textContent = calcularSubtotalIngredienteTexto(estadoUI.ingredientesForm[idx]);
      }
    });
  }

  function cambiarModoCarga(modo) {
    estadoUI.modoCarga = modo;
    var esReceta = modo === "receta";
    $("camposSimple").hidden = esReceta;
    $("camposReceta").hidden = !esReceta;
    $("modeSimpleBtn").classList.toggle("active", !esReceta);
    $("modeSimpleBtn").setAttribute("aria-pressed", String(!esReceta));
    $("modeRecetaBtn").classList.toggle("active", esReceta);
    $("modeRecetaBtn").setAttribute("aria-pressed", String(esReceta));
    var ayudaEl = $("modoAyuda");
    if (ayudaEl) {
      ayudaEl.textContent = esReceta
        ? "Usá este modo para comidas que prepara la cantina (ej.: sándwiches o pizzas). Indicás los ingredientes de UNA unidad y las ventas anuales, y el sistema reparte cada ingrediente en su categoría real."
        : "Usá este modo para productos comprados por peso, volumen o envase cerrado (ej.: leche en litros, queso en kg, gaseosas de 500 ml).";
    }
    limpiarErrores();
    if (esReceta) renderIngredientesForm();
    actualizarPreviewEnVivo();
  }

  function aplicarPlantillaReceta(tpl) {
    cambiarModoCarga("receta");
    $("recetaNombre").value = tpl.nombre;
    $("recetaCantidad").value = String(tpl.cantidad);
    estadoUI.ingredientesForm = tpl.ingredientes.map(function (ing) {
      return crearIngredienteVacio(ing.categoria, ing.nombre, ing.kg_por_unidad);
    });
    renderIngredientesForm();
    actualizarPreviewEnVivo();
  }

  function validarFormulario() {
    var ok = true;
    ok = setErr("edificio", $("edificio").value ? "" : "Elegí un edificio.") && ok;
    var anio = Number($("anio").value);
    ok = setErr("anio", Number.isInteger(anio) && anio >= 2000 && anio <= 2100 ? "" : "Ingresá un año entre 2000 y 2100.") && ok;

    if (estadoUI.modoCarga === "simple") {
      ok = setErr("categoria", $("categoria").value ? "" : "Elegí una categoría.") && ok;
      ok = setErr("producto", $("producto").value.trim() ? "" : "Escribí el nombre del producto.") && ok;
      ok = setErr("cantidad", Number($("cantidad").value) > 0 ? "" : "La cantidad debe ser mayor que 0.") && ok;
      if ($("unidad").value === "unidad") {
        ok = setErr("peso", Number($("peso").value) > 0 ? "" : "Indicá el peso por unidad en kg.") && ok;
      } else {
        setErr("peso", "");
      }
    } else {
      ok = setErr("recetaNombre", $("recetaNombre").value.trim() ? "" : "Escribí el nombre del producto elaborado.") && ok;
      ok = setErr("recetaCantidad", Number($("recetaCantidad").value) > 0 ? "" : "Indicá cuántas unidades se vendieron en el año.") && ok;
      var rows = $("ingredientesList").querySelectorAll(".ing-row");
      var ingValidos = true;
      estadoUI.ingredientesForm.forEach(function (ing, idx) {
        var row = rows[idx];
        var sel = row ? row.querySelector("select") : null;
        var inps = row ? row.querySelectorAll("input") : [];
        var catOk = Boolean(ing.categoria && FACTORES[ing.categoria]);
        var nomOk = Boolean(String(ing.nombre || "").trim());
        var kgOk = Number(ing.kg_por_unidad) > 0;
        if (sel) sel.classList.toggle("err", !catOk);
        if (inps[0]) inps[0].classList.toggle("err", !nomOk);
        if (inps[1]) inps[1].classList.toggle("err", !kgOk);
        if (!catOk || !nomOk || !kgOk) ingValidos = false;
      });
      ok = setErr("ingredientes", ingValidos ? "" : "Completá categoría, nombre y kg por unidad mayores a 0 en todos los ingredientes.") && ok;
    }
    return ok;
  }

  function resetearCamposVariables(resetearTodo) {
    limpiarErrores();
    if (estadoUI.editandoId !== null || resetearTodo) {
      estadoUI.editandoId = null;
      $("editBanner").hidden = true;
      $("formHeading").textContent = "Registrar compra anual";
      $("btnGuardar").textContent = "Agregar registro";
    }
    $("producto").value = "";
    $("cantidad").value = "";
    $("peso").value = "";
    $("obs").value = "";
    $("recetaNombre").value = "";
    $("recetaCantidad").value = "";
    if (resetearTodo) {
      $("anio").value = "2026";
      $("categoria").value = "";
      $("unidad").value = "unidad";
      estadoUI.ingredientesForm = [crearIngredienteVacio("carne_vacuna", "", "")];
    } else if (estadoUI.modoCarga === "receta") {
      estadoUI.ingredientesForm = [crearIngredienteVacio("carne_vacuna", "", "")];
    }
    if (estadoUI.modoCarga === "receta") renderIngredientesForm();
    actualizarPeso();
    actualizarPreviewEnVivo();
  }

  function iniciarEdicion(id) {
    var reg = registros.find(function (r) { return r.id === id; });
    if (!reg) return;
    estadoUI.editandoId = id;
    $("editBanner").hidden = false;
    $("editBannerText").textContent = "Editando: " + reg.producto;
    $("formHeading").textContent = "Editar registro anual";
    $("btnGuardar").textContent = "Guardar cambios";

    $("edificio").value = String(reg.id_edificio);
    $("anio").value = String(reg.periodo);
    $("fuente").value = reg.fuente_dato || "Factura o remito";
    if (!$("fuente").value) $("fuente").value = "Otra";
    $("obs").value = reg.observaciones || "";

    if (reg.tipo === "receta") {
      cambiarModoCarga("receta");
      $("recetaNombre").value = reg.producto;
      $("recetaCantidad").value = String(reg.cantidad);
      estadoUI.ingredientesForm = reg.ingredientes.map(function (ing) {
        return crearIngredienteVacio(ing.categoria, ing.nombre, ing.kg_por_unidad);
      });
      renderIngredientesForm();
    } else {
      cambiarModoCarga("simple");
      $("categoria").value = reg.categoria;
      $("producto").value = reg.producto;
      $("cantidad").value = String(reg.cantidad);
      $("unidad").value = reg.unidad;
      actualizarPeso();
      $("peso").value = reg.unidad === "unidad" && reg.peso_unitario_kg ? String(reg.peso_unitario_kg) : "";
    }
    actualizarPreviewEnVivo();
    $("form").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ============ PREVISUALIZACIÓN EN VIVO ============ */
  function actualizarPreviewEnVivo() {
    var badge = $("liveBadge");
    var valorEl = $("liveValor");
    var detalleEl = $("liveDetalle");
    var formulaEl = $("liveFormula");

    if (estadoUI.modoCarga === "simple") {
      var cat = $("categoria").value;
      var cant = Number($("cantidad").value);
      var uni = $("unidad").value;
      var peso = Number($("peso").value);
      var f = FACTORES[cat];

      if (!f) {
        badge.className = "badge neutral";
        badge.textContent = "Sin completar";
        valorEl.textContent = "–";
        detalleEl.textContent = "Elegí una categoría y una cantidad arriba para ver el cálculo al instante antes de guardar el registro.";
        formulaEl.hidden = true;
        return;
      }

      badge.className = "badge verified";
      badge.textContent = esFuenteAgribalyse(cat) ? "Agribalyse v3.2" : "Poore y Nemecek";

      if (!(cant > 0) || (uni === "unidad" && !(peso > 0))) {
        valorEl.textContent = "FE " + fmt(f.valor, 2);
        detalleEl.textContent = f.nombre + " (" + fmt(f.valor, 2) + " " + f.unidad_base + "). Completá cantidad" +
          (uni === "unidad" ? " anual y peso por unidad." : " anual.");
        formulaEl.hidden = true;
        return;
      }

      var calc = calcularSimple({
        categoria: cat,
        cantidad: cant,
        unidad: uni,
        peso_unitario_kg: uni === "unidad" ? peso : null
      });
      valorEl.textContent = fmt(calc.co2e_kg, 2) + " kg CO₂e";
      detalleEl.textContent = "Equivale a " + fmt(calc.masa_kg, 2) + " kg de alimento al año (" + f.etapa + ").";
      formulaEl.textContent = calc.trazabilidad + " = " + fmt(calc.co2e_kg, 2) + " kg CO₂e";
      formulaEl.hidden = false;
      return;
    }

    var cantReceta = Number($("recetaCantidad").value);
    var validos = estadoUI.ingredientesForm.filter(function (ing) {
      return FACTORES[ing.categoria] && Number(ing.kg_por_unidad) > 0;
    });

    if (!validos.length) {
      badge.className = "badge neutral";
      badge.textContent = "Receta";
      valorEl.textContent = "–";
      detalleEl.textContent = "Elegí una plantilla o cargá al menos un ingrediente con su peso en kg por unidad.";
      formulaEl.hidden = true;
      return;
    }

    var sumaCo2U = 0;
    var sumaKgU = 0;
    validos.forEach(function (ing) {
      var fi = FACTORES[ing.categoria];
      var kgU = Number(ing.kg_por_unidad);
      sumaKgU += kgU;
      sumaCo2U += kgU * fi.valor;
    });

    badge.className = "badge recipe";
    badge.textContent = "Receta (" + validos.length + " ing.)";

    if (!(cantReceta > 0)) {
      valorEl.textContent = fmt(sumaCo2U, 2) + " kg/u";
      detalleEl.textContent = validos.length + " ingrediente(s) · " + fmt(sumaKgU, 3) + " kg por unidad. Indicá cuántas unidades se venden al año.";
      formulaEl.hidden = true;
      return;
    }

    var totalRecetaCo2 = cantReceta * sumaCo2U;
    var totalRecetaKg = cantReceta * sumaKgU;
    valorEl.textContent = fmt(totalRecetaCo2, 2) + " kg CO₂e";
    detalleEl.textContent = fmt(cantReceta, 0) + " u × " + fmt(sumaCo2U, 2) + " kg CO₂e/u · Masa anual: " + fmt(totalRecetaKg, 1) + " kg";
    formulaEl.textContent = validos.map(function (ing) {
      var fi = FACTORES[ing.categoria];
      return (ing.nombre || fi.nombre) + ": " + fmt(Number(ing.kg_por_unidad), 3) + " kg/u × " + fmt(fi.valor, 2);
    }).join("\n");
    formulaEl.hidden = false;
  }

  /* ============ DRAWERS Y ESCENARIOS DEL RELEVAMIENTO ============ */
  function calcularTotalEscenario(clave, incluirBebidas) {
    var esc = ESCENARIOS[clave];
    if (!esc) return 0;
    var totalKg = 0;
    function sumarItem(item) {
      var f = FACTORES[item.categoria];
      if (!f) return;
      var masa = aKg(item.cantidad, item.unidad, item.peso || null);
      totalKg += masa * f.valor;
    }
    esc.items.forEach(sumarItem);
    if (incluirBebidas) esc.bebidasSnacks.forEach(sumarItem);
    return totalKg / 1000;
  }

  function actualizarValoresEscenarios() {
    var drawerAbierto = $("drawerEscenario").classList.contains("open");
    var incluirBebidas = drawerAbierto ? $("chkBebidasDrawer").checked : $("chkBebidasEmpty").checked;
    document.querySelectorAll("[data-scenario-val]").forEach(function (el) {
      var clave = el.dataset.scenarioVal;
      var toneladas = calcularTotalEscenario(clave, incluirBebidas);
      el.textContent = fmt(toneladas, 1) + " toneladas de CO₂e/año";
    });
  }

  function aplicarEstadoDrawer(drawerId, btnId, abierto) {
    var drawer = $(drawerId);
    var btn = $(btnId);
    if (!drawer || !btn) return;
    drawer.classList.toggle("open", abierto);
    drawer.setAttribute("aria-hidden", String(!abierto));
    drawer.inert = !abierto;
    btn.setAttribute("aria-expanded", String(abierto));
  }

  function setDrawerAbierto(abierto) {
    if (abierto) aplicarEstadoDrawer("drawerGuia", "btnToggleGuia", false);
    aplicarEstadoDrawer("drawerEscenario", "btnToggleEscenario", abierto);
    if (abierto) actualizarValoresEscenarios();
  }

  function setGuiaAbierta(abierto) {
    if (abierto) aplicarEstadoDrawer("drawerEscenario", "btnToggleEscenario", false);
    aplicarEstadoDrawer("drawerGuia", "btnToggleGuia", abierto);
  }

  function mostrarToastEscenario(msg) {
    var toast = $("scenarioToast");
    $("scenarioToastMsg").textContent = msg;
    toast.hidden = false;
  }

  function ocultarToastEscenario() {
    $("scenarioToast").hidden = true;
  }

  function pulsarFeedbackActualizacion() {
    [$("railTotalT"), $("listaRegistros")].forEach(function (el) {
      if (!el) return;
      el.classList.remove("pulse-updated");
      void el.offsetWidth;
      el.classList.add("pulse-updated");
    });
  }

  function cargarEscenario(clave, incluirBebidas) {
    var esc = ESCENARIOS[clave];
    if (!esc) return;
    var edificio = EDIFICIOS[0] || { id_edificio: 1, nombre: "Cantina principal" };
    var anioActual = Number($("anio").value);
    var periodo = Number.isInteger(anioActual) && anioActual >= 2000 && anioActual <= 2100 ? anioActual : 2026;
    var nuevos = [];
    var baseId = Date.now();

    function crearItem(item, sufijoObs, idx) {
      var reg = recalcularRegistro({
        id: baseId + idx,
        tipo: "simple",
        id_edificio: edificio.id_edificio,
        edificio: edificio.nombre,
        periodo: periodo,
        categoria: item.categoria,
        producto: item.producto,
        cantidad: item.cantidad,
        unidad: item.unidad,
        peso_unitario_kg: item.unidad === "unidad" ? item.peso : null,
        fuente_dato: "Estimación desde fotos",
        observaciones: "Escenario " + esc.etiqueta + sufijoObs
      });
      if (reg) nuevos.push(reg);
    }

    esc.items.forEach(function (it, i) { crearItem(it, " · relevamiento cantina", i); });
    if (incluirBebidas) {
      esc.bebidasSnacks.forEach(function (it, j) { crearItem(it, " · bebidas y snacks (Agribalyse v3.2)", esc.items.length + j); });
    }

    registros = nuevos;
    origenDatos = {
      origen: "escenario",
      clave: clave,
      etiqueta: esc.etiqueta,
      modificado: false
    };
    if (estadoUI.editandoId !== null) {
      resetearCamposVariables(false);
    }
    estadoUI.confirmandoBorradoId = null;
    guardarRegistros();
    guardarMeta();
    render();
    var totalToneladas = nuevos.reduce(function (a, r) { return a + r.co2e_kg; }, 0) / 1000;
    mostrarToastEscenario(
      "Escenario " + esc.etiqueta + " cargado · " + nuevos.length + " registros (" +
      fmt(totalToneladas, 1) + " toneladas de CO₂e/año)"
    );
    pulsarFeedbackActualizacion();
  }

  function vaciarTodosLosRegistros() {
    registros = [];
    limpiarMeta();
    if (estadoUI.editandoId !== null) {
      resetearCamposVariables(true);
    }
    estadoUI.confirmandoBorradoId = null;
    $("borrarConfirmWrap").hidden = true;
    $("borrarWrap").hidden = false;
    $("vaciarCtxConfirmWrap").hidden = true;
    $("vaciarCtxWrap").hidden = false;
    $("resEnvio").textContent = "";
    ocultarToastEscenario();
    guardarRegistros();
    render();
  }

  /* ============ RENDER DE TABLAS Y GRÁFICOS ============ */
  function crearTabla(cols, filas, emptyTexto) {
    var t = document.createElement("table");
    var thead = t.createTHead().insertRow();
    cols.forEach(function (c) {
      var th = document.createElement("th");
      th.textContent = c.t;
      if (c.num) th.className = "num";
      thead.appendChild(th);
    });
    var tbody = t.createTBody();
    if (!filas.length) {
      var trEmpty = tbody.insertRow();
      var tdEmpty = trEmpty.insertCell();
      tdEmpty.colSpan = cols.length;
      tdEmpty.className = "empty-cell";
      tdEmpty.textContent = emptyTexto || "Sin registros.";
      return t;
    }
    filas.forEach(function (f) {
      var tr = tbody.insertRow();
      cols.forEach(function (c, i) {
        var td = tr.insertCell();
        if (c.t) td.setAttribute("data-label", c.t);
        if (c.num) td.className = "num";
        if (c.cls) td.className = (td.className ? td.className + " " : "") + c.cls;
        if (f[i] instanceof Node) td.appendChild(f[i]);
        else td.textContent = f[i];
      });
    });
    return t;
  }

  function renderContextoDatos() {
    var banner = $("datosContextoBanner");
    if (!registros.length) {
      banner.hidden = true;
      $("vaciarCtxConfirmWrap").hidden = true;
      $("vaciarCtxWrap").hidden = false;
      return;
    }

    banner.hidden = false;
    $("vaciarCtxConfirmWrap").hidden = true;
    $("vaciarCtxWrap").hidden = false;

    var titulo = $("datosContextoTitulo");
    var desc = $("datosContextoDesc");
    if (origenDatos && origenDatos.origen === "escenario" && !origenDatos.modificado) {
      titulo.textContent = "Mostrando escenario precargado: " + origenDatos.etiqueta;
      desc.textContent = "Son compras anuales estimadas para probar y explicar el módulo porque todavía no hay facturas reales de la cantina (quedan guardadas en este navegador). Podés editar cualquier fila, sumar compras propias o vaciar la lista.";
    } else if (origenDatos && origenDatos.origen === "escenario" && origenDatos.modificado) {
      titulo.textContent = "Escenario " + origenDatos.etiqueta + " con modificaciones propias";
      desc.textContent = "Partiste de un escenario estimado y ya editaste o agregaste registros en este navegador. Los cálculos y resultados reflejan tu lista actual.";
    } else {
      titulo.textContent = "Trabajando con " + registros.length + " compra(s) guardada(s) en este navegador";
      desc.textContent = "Estas compras quedan guardadas localmente (localStorage) aunque recargues la página. Podés sumar más registros, cargar un escenario estimado o vaciar la lista.";
    }
  }

  function renderRailResumen() {
    var tot = registros.reduce(function (a, r) { return a + r.co2e_kg; }, 0);
    var masa = registros.reduce(function (a, r) { return a + r.masa_kg; }, 0);

    $("railTotalT").textContent = fmt(tot / 1000, 3) + " t CO₂e";
    $("railTotalKg").textContent = fmt(masa, 1) + " kg";
    $("railIntensidad").textContent = masa > 0 ? fmt(tot / masa, 2) + " kg CO₂e/kg" : "–";
    $("railCount").textContent = String(registros.length);

    var nextActions = $("railNextActions");
    if (nextActions) nextActions.hidden = registros.length === 0;

    var badge = $("badgeRegistros");
    badge.textContent = String(registros.length);
    badge.hidden = registros.length === 0;
  }

  function obtenerRegistrosFiltrados() {
    var q = estadoUI.filtroTexto.trim().toLowerCase();
    return registros.filter(function (r) {
      var usaAgri = r.tipo === "receta" && Array.isArray(r.ingredientes)
        ? r.ingredientes.some(function (ing) { return esFuenteAgribalyse(ing.categoria); })
        : esFuenteAgribalyse(r.categoria);
      var usaPoore = r.tipo === "receta" && Array.isArray(r.ingredientes)
        ? r.ingredientes.some(function (ing) { return Boolean(FACTORES[ing.categoria] && !esFuenteAgribalyse(ing.categoria)); })
        : Boolean(FACTORES[r.categoria] && !esFuenteAgribalyse(r.categoria));

      if (estadoUI.filtroTipo === "poore" && !usaPoore) return false;
      if (estadoUI.filtroTipo === "agribalyse" && !usaAgri) return false;
      if (estadoUI.filtroTipo === "recetas" && r.tipo !== "receta") return false;
      if (!q) return true;
      var haystack = [r.producto, r.fuente_dato, r.observaciones, r.edificio,
        r.tipo === "receta" ? "receta elaborada" : nombreCat(r.categoria)].join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function renderLista() {
    $("emptyOnboarding").hidden = registros.length > 0;

    var filtrados = obtenerRegistrosFiltrados();
    var totalTxt = registros.length === 0
      ? "Sin registros cargados"
      : filtrados.length === registros.length
        ? registros.length + " registro(s) en el período"
        : filtrados.length + " de " + registros.length + " registro(s)";
    $("registrosCountLabel").textContent = totalTxt;

    var cont = $("listaRegistros");
    cont.innerHTML = "";
    var wrap = crearEl("div", "table-wrap");

    var filas = filtrados.map(function (r) {
      var catCell = document.createDocumentFragment();
      if (r.tipo === "receta") {
        catCell.appendChild(crearEl("span", "badge recipe", "Receta (" + r.ingredientes.length + ")"));
      } else {
        catCell.appendChild(crearEl("span", "badge neutral", nombreCat(r.categoria)));
      }

      var prodCell = document.createDocumentFragment();
      prodCell.appendChild(crearEl("div", "prod-main", r.producto));
      var sub = r.edificio + " · " + r.fuente_dato + (r.observaciones ? " · " + r.observaciones : "");
      prodCell.appendChild(crearEl("div", "prod-sub", sub));

      if (r.tipo === "receta") {
        var expandido = Boolean(estadoUI.expandidosIds[r.id]);
        var btnExp = crearEl("button", "link-btn", expandido ? "Ocultar ingredientes" : "Ver ingredientes (" + r.ingredientes.length + ")");
        btnExp.type = "button";
        btnExp.addEventListener("click", function () {
          estadoUI.expandidosIds[r.id] = !expandido;
          renderLista();
        });
        prodCell.appendChild(btnExp);

        if (expandido) {
          var box = crearEl("div", "recipe-breakdown");
          r.ingredientes.forEach(function (ing) {
            box.appendChild(crearEl("div", "",
              ing.nombre + " (" + nombreCat(ing.categoria) + "): " +
              fmt(ing.kg_por_unidad, 3) + " kg/u → " + fmt(ing.co2e_kg, 2) + " kg CO₂e"
            ));
          });
          prodCell.appendChild(box);
        }
      }

      var acciones = crearEl("div", "row-actions");
      if (estadoUI.confirmandoBorradoId === r.id) {
        var btnConf = crearEl("button", "btn danger xs", "Confirmar");
        btnConf.type = "button";
        btnConf.addEventListener("click", function () {
          registros = registros.filter(function (x) { return x.id !== r.id; });
          estadoUI.confirmandoBorradoId = null;
          if (estadoUI.editandoId === r.id) resetearCamposVariables(true);
          if (registros.length === 0) limpiarMeta();
          else marcarCambioManualEnOrigen();
          guardarRegistros();
          render();
        });
        var btnCanc = crearEl("button", "btn ghost xs", "Cancelar");
        btnCanc.type = "button";
        btnCanc.addEventListener("click", function () {
          estadoUI.confirmandoBorradoId = null;
          renderLista();
        });
        acciones.append(btnConf, btnCanc);
      } else {
        var btnEd = crearEl("button", "btn sec xs", "Editar");
        btnEd.type = "button";
        btnEd.setAttribute("aria-label", "Editar " + r.producto);
        btnEd.addEventListener("click", function () { iniciarEdicion(r.id); });

        var btnDel = crearEl("button", "btn danger-outline xs", "Eliminar");
        btnDel.type = "button";
        btnDel.setAttribute("aria-label", "Eliminar " + r.producto);
        btnDel.addEventListener("click", function () {
          estadoUI.confirmandoBorradoId = r.id;
          renderLista();
        });
        acciones.append(btnEd, btnDel);
      }

      return [
        String(r.periodo),
        catCell,
        prodCell,
        fmt(r.cantidad, r.tipo === "receta" || r.unidad === "unidad" ? 0 : 2) + " " + (r.tipo === "receta" ? "u" : r.unidad),
        fmt(r.masa_kg, 2),
        crearEl("strong", "", fmt(r.co2e_kg, 2)),
        acciones
      ];
    });

    var msgVacio = registros.length
      ? "Ningún registro coincide con el filtro actual."
      : "Todavía no cargaste compras. Completá el formulario de arriba o cargá un escenario estimado.";

    wrap.appendChild(crearTabla([
      { t: "Año" },
      { t: "Categoría" },
      { t: "Producto" },
      { t: "Cantidad", num: true },
      { t: "Masa (kg)", num: true },
      { t: "kg CO₂e", num: true },
      { t: "Acciones", num: true }
    ], filas, msgVacio));

    cont.appendChild(wrap);
  }

  function renderCalculo() {
    var emptyBar = $("calcEmptyBar");
    var nextBar = $("calcNextBar");
    if (emptyBar) emptyBar.hidden = registros.length > 0;
    if (nextBar) nextBar.hidden = registros.length === 0;

    var c = $("tablaCalculo");
    c.innerHTML = "";
    var filasCalc = registros.map(function (r) {
      return [
        crearEl("strong", "", r.producto),
        r.fuente_dato,
        r.trazabilidad,
        fmt(r.masa_kg, 2),
        crearEl("strong", "", fmt(r.co2e_kg, 2))
      ];
    });

    c.appendChild(crearTabla([
      { t: "Producto" },
      { t: "Fuente del dato" },
      { t: "Cuenta paso a paso", cls: "trace-cell" },
      { t: "Masa (kg)", num: true },
      { t: "kg CO₂e", num: true }
    ], filasCalc, "Sin registros cargados para calcular."));

    var f = $("tablaFactores");
    f.innerHTML = "";
    var factoresLista = Object.values(FACTORES).filter(function (x) {
      if (estadoUI.filtroFactor === "poore") return String(x.fuente || "").indexOf("Agribalyse") === -1;
      if (estadoUI.filtroFactor === "agribalyse") return String(x.fuente || "").indexOf("Agribalyse") !== -1;
      return true;
    });

    var filasFac = factoresLista.map(function (x) {
      return [
        x.nombre,
        fmt(x.valor, 2),
        x.etapa,
        x.fuente,
        x.anio_referencia ? String(x.anio_referencia) : "–"
      ];
    });

    f.appendChild(crearTabla([
      { t: "Categoría" },
      { t: "Factor (kg CO₂e/kg)", num: true },
      { t: "Etapa incluida" },
      { t: "Fuente científica" },
      { t: "Año", num: true }
    ], filasFac, "Sin factores en esta vista."));
  }

  function renderBarras(id, items, claseFill, sufijo, dec) {
    var el = $(id);
    el.innerHTML = "";
    if (!items.length) {
      el.appendChild(crearEl("p", "empty-cell", "Sin datos cargados todavía."));
      return;
    }
    var max = Math.max.apply(null, items.map(function (i) { return i.v; })) || 1;
    items.forEach(function (i) {
      var row = crearEl("div", "bar-row");
      var nombre = crearEl("span", "cmp-label", i.n);
      var track = crearEl("div", "track");
      var fill = crearEl("div", "fill " + (claseFill || ""));
      fill.style.width = Math.max(0, (i.v / max) * 100) + "%";
      track.appendChild(fill);
      var val = crearEl("span", "bar-val", fmt(i.v, dec !== undefined ? dec : 2) + " " + sufijo);
      row.append(nombre, track, val);
      el.appendChild(row);
    });
  }

  function renderBarrasComparadas(id, items) {
    var el = $(id);
    el.innerHTML = "";
    if (!items.length) {
      el.appendChild(crearEl("p", "empty-cell", "Sin datos cargados todavía."));
      return;
    }
    var max = Math.max.apply(null, items.map(function (i) { return Math.max(i.masa, i.em); })) || 1;
    var list = crearEl("div", "cmp-list");

    items.forEach(function (i) {
      var row = crearEl("div", "cmp-row");
      var label = crearEl("span", "cmp-label", i.n);
      var pair = crearEl("div", "cmp-pair");

      [["mass", i.masa], ["em", i.em]].forEach(function (cfg) {
        var line = crearEl("div", "cmp-line");
        var track = crearEl("div", "track");
        var fill = crearEl("div", "fill" + (cfg[0] === "mass" ? " mass" : ""));
        fill.style.width = Math.max(0, (cfg[1] / max) * 100) + "%";
        track.appendChild(fill);
        var val = crearEl("span", "bar-val", fmt(cfg[1], 1) + " %");
        line.append(track, val);
        pair.appendChild(line);
      });

      row.append(label, pair);
      list.appendChild(row);
    });
    el.appendChild(list);
  }

  function renderResultados() {
    var emptyRes = $("resultadosVacio");
    if (emptyRes) emptyRes.hidden = registros.length > 0;

    var tot = registros.reduce(function (a, r) { return a + r.co2e_kg; }, 0);
    var masa = registros.reduce(function (a, r) { return a + r.masa_kg; }, 0);
    var porCategoria = desglosarPorCategoria(registros);

    var kpisEl = $("kpis");
    kpisEl.innerHTML = "";
    var topCat = porCategoria[0];
    var kpiItems = [
      { l: "Total anual en kg", v: fmt(tot, 1) + " kg CO₂e", s: registros.length + " registro(s) en el año" },
      { l: "Total en toneladas", v: fmt(tot / 1000, 3) + " t CO₂e", s: "Equivale a 1 t = 1.000 kg" },
      { l: "Peso físico comprado", v: fmt(masa, 1) + " kg", s: "Alimentos y bebidas" },
      { l: "Intensidad promedio", v: masa ? fmt(tot / masa, 2) + " kg/kg" : "–", s: "kg CO₂e por cada kg comprado" },
      {
        l: "Principal emisor",
        v: topCat ? topCat.nombre : "–",
        s: topCat && tot ? fmt((topCat.co2e_kg / tot) * 100, 1) + " % del total de CO₂e" : "Sin registros"
      }
    ];

    kpiItems.forEach(function (k) {
      var cell = crearEl("div", "kpi-cell");
      cell.append(
        crearEl("div", "kpi-label", k.l),
        crearEl("div", "kpi-val", k.v),
        crearEl("div", "kpi-sub", k.s)
      );
      kpisEl.appendChild(cell);
    });

    var insightEl = $("comparativaInsight");
    if (porCategoria.length >= 2 && tot > 0 && masa > 0) {
      var top2Co2 = ((porCategoria[0].co2e_kg + porCategoria[1].co2e_kg) / tot) * 100;
      var top2Masa = ((porCategoria[0].masa_kg + porCategoria[1].masa_kg) / masa) * 100;
      insightEl.textContent = "Hallazgo clave: " + porCategoria[0].nombre + " y " + porCategoria[1].nombre +
        " concentran el " + fmt(top2Co2, 1) + " % de las emisiones con solo el " +
        fmt(top2Masa, 1) + " % del peso físico comprado.";
      insightEl.hidden = false;
    } else {
      insightEl.hidden = true;
    }

    renderBarrasComparadas("gComparar", porCategoria.map(function (c) {
      return {
        n: c.nombre,
        em: tot ? (c.co2e_kg / tot) * 100 : 0,
        masa: masa ? (c.masa_kg / masa) * 100 : 0
      };
    }));

    var itemsDesglose;
    if (estadoUI.metricaGrafico === "masa") {
      $("subtituloDesglose").textContent = "Ordenado de mayor a menor peso físico comprado";
      itemsDesglose = porCategoria.slice().sort(function (a, b) { return b.masa_kg - a.masa_kg; }).map(function (c) {
        return { n: c.nombre, v: c.masa_kg };
      });
      renderBarras("gDesglose", itemsDesglose, "mass", "kg", 1);
    } else if (estadoUI.metricaGrafico === "pct") {
      $("subtituloDesglose").textContent = "Qué porcentaje de la huella total aporta cada categoría";
      itemsDesglose = porCategoria.map(function (c) {
        return { n: c.nombre, v: tot ? (c.co2e_kg / tot) * 100 : 0 };
      });
      renderBarras("gDesglose", itemsDesglose, "", "%", 1);
    } else {
      $("subtituloDesglose").textContent = "Ordenado de mayor a menor emisión anual";
      itemsDesglose = porCategoria.map(function (c) {
        return { n: c.nombre, v: c.co2e_kg };
      });
      renderBarras("gDesglose", itemsDesglose, "", "kg CO₂e", 1);
    }

    var porAnioMapa = {};
    registros.forEach(function (r) {
      var k = String(r.periodo);
      porAnioMapa[k] = (porAnioMapa[k] || 0) + r.co2e_kg;
    });
    var anios = Object.keys(porAnioMapa).sort().map(function (anio) {
      return { n: anio, v: porAnioMapa[anio] };
    });
    $("hintAnio").textContent = anios.length <= 1
      ? "Mostrando un único año cargado; cargá compras de otro año para compararlos."
      : "Comparativa entre los " + anios.length + " períodos cargados.";
    renderBarras("gAnio", anios, "", "kg CO₂e", 1);

    if (estadoUI.jsonVisible) {
      $("jsonPreview").textContent = JSON.stringify(armarPayloads(), null, 2);
    }
    $("btnBorrar").disabled = registros.length === 0;
    if (registros.length === 0) {
      $("borrarConfirmWrap").hidden = true;
      $("borrarWrap").hidden = false;
    }
  }

  function render() {
    renderContextoDatos();
    renderRailResumen();
    renderLista();
    renderCalculo();
    renderResultados();
  }

  /* ============ ENVÍO A LA API Y EXPORTACIÓN ============ */
  async function enviarResultados() {
    var out = $("resEnvio");
    var payloads = armarPayloads();
    if (!payloads.length) {
      out.className = "api-status err";
      out.textContent = "No hay registros para enviar.";
      return;
    }
    try {
      var totalRecibidos = 0;
      var totalCo2Server = 0;
      var ultimoStatus = 201;
      for (var i = 0; i < payloads.length; i++) {
        var res = await API().postResultados(payloads[i]);
        ultimoStatus = res.status;
        totalRecibidos += res.data.registros_recibidos;
        totalCo2Server += res.data.total_co2e_kg;
      }
      out.className = "api-status ok";
      out.textContent = "HTTP " + ultimoStatus + " · Se recibieron " + totalRecibidos +
        " registro(s) en " + payloads.length + " envío(s) · Total recalculado: " +
        fmt(totalCo2Server, 2) + " kg CO₂e" +
        (CONFIG.API_BASE ? "." : " (simulado en navegador, sin servidor externo).");
    } catch (e) {
      out.className = "api-status err";
      out.textContent = "Error al enviar: " + e.message;
    }
  }

  function copiarConTextarea(texto) {
    var ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return Boolean(ok);
  }

  async function copiarAlPortapapeles(texto) {
    if (window.location.protocol !== "file:" && window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch (e) {
        return copiarConTextarea(texto);
      }
    }
    return copiarConTextarea(texto);
  }

  function descargarJson() {
    var out = $("resEnvio");
    var payloads = armarPayloads();
    if (!payloads.length) {
      out.className = "api-status err";
      out.textContent = "Cargá al menos un registro antes de descargar el JSON.";
      return;
    }
    var blob = new Blob([JSON.stringify(payloads, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cantina-co2.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ============ EVENTOS Y NAVEGACIÓN ============ */
  function cambiarTab(tab) {
    estadoUI.tab = tab;
    document.querySelectorAll('.tab-btn[role="tab"]').forEach(function (btn) {
      var activo = btn.dataset.tab === tab;
      btn.setAttribute("aria-selected", String(activo));
    });
    ["carga", "calculo", "resultados"].forEach(function (t) {
      $("tab-" + t).hidden = t !== tab;
    });
  }

  function irATab(tab) {
    cambiarTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindEventos() {
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab-btn[role="tab"]'));
    tabButtons.forEach(function (btn, idx) {
      btn.addEventListener("click", function () { cambiarTab(btn.dataset.tab); });
      btn.addEventListener("keydown", function (e) {
        var nextIdx = null;
        if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabButtons.length;
        else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
        else if (e.key === "Home") nextIdx = 0;
        else if (e.key === "End") nextIdx = tabButtons.length - 1;
        if (nextIdx !== null) {
          e.preventDefault();
          tabButtons[nextIdx].focus();
          cambiarTab(tabButtons[nextIdx].dataset.tab);
        }
      });
    });

    $("btnToggleGuia").addEventListener("click", function () {
      setGuiaAbierta(!$("drawerGuia").classList.contains("open"));
    });
    $("btnCerrarGuia").addEventListener("click", function () {
      setGuiaAbierta(false);
    });

    $("btnToggleEscenario").addEventListener("click", function () {
      setDrawerAbierto(!$("drawerEscenario").classList.contains("open"));
    });
    $("btnCerrarDrawer").addEventListener("click", function () {
      setDrawerAbierto(false);
    });

    $("btnCambiarEscenarioCtx").addEventListener("click", function () {
      setDrawerAbierto(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $("btnIrCalculo").addEventListener("click", function () { irATab("calculo"); });
    $("btnIrResultados").addEventListener("click", function () { irATab("resultados"); });
    $("btnIrCargaDesdeCalc").addEventListener("click", function () { irATab("carga"); });
    $("btnIrResultadosDesdeCalc").addEventListener("click", function () { irATab("resultados"); });
    $("btnIrCargaDesdeRes").addEventListener("click", function () { irATab("carga"); });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if ($("drawerGuia").classList.contains("open")) {
        setGuiaAbierta(false);
        $("btnToggleGuia").focus();
      } else if ($("drawerEscenario").classList.contains("open")) {
        setDrawerAbierto(false);
        $("btnToggleEscenario").focus();
      }
    });

    $("btnDismissToast").addEventListener("click", ocultarToastEscenario);
    $("btnDismissStorage").addEventListener("click", limpiarAlertaStorage);

    $("chkBebidasDrawer").addEventListener("change", function () {
      $("chkBebidasEmpty").checked = $("chkBebidasDrawer").checked;
      actualizarValoresEscenarios();
    });
    $("chkBebidasEmpty").addEventListener("change", function () {
      $("chkBebidasDrawer").checked = $("chkBebidasEmpty").checked;
      actualizarValoresEscenarios();
    });

    document.querySelectorAll("[data-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var drawerAbierto = $("drawerEscenario").classList.contains("open");
        var incluirBebidas = drawerAbierto
          ? $("chkBebidasDrawer").checked
          : $("chkBebidasEmpty").checked;
        cargarEscenario(btn.dataset.preset, incluirBebidas);
        setDrawerAbierto(false);
      });
    });

    $("modeSimpleBtn").addEventListener("click", function () { cambiarModoCarga("simple"); });
    $("modeRecetaBtn").addEventListener("click", function () { cambiarModoCarga("receta"); });
    $("btnCancelarEdicion").addEventListener("click", function () { resetearCamposVariables(true); });

    $("btnAddIngrediente").addEventListener("click", function () {
      estadoUI.ingredientesForm.push(crearIngredienteVacio("queso", "", ""));
      renderIngredientesForm();
      actualizarPreviewEnVivo();
    });

    ["categoria", "unidad"].forEach(function (id) {
      $(id).addEventListener("change", function () {
        if (id === "unidad") actualizarPeso();
        actualizarPreviewEnVivo();
      });
    });
    ["cantidad", "peso", "recetaCantidad"].forEach(function (id) {
      $(id).addEventListener("input", actualizarPreviewEnVivo);
    });

    $("form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validarFormulario()) return;

      var idEd = Number($("edificio").value);
      var edObj = EDIFICIOS.find(function (x) { return x.id_edificio === idEd; });
      var base = {
        id: estadoUI.editandoId !== null ? estadoUI.editandoId : Date.now(),
        id_edificio: idEd,
        edificio: edObj ? edObj.nombre : "",
        periodo: Number($("anio").value),
        fuente_dato: $("fuente").value,
        observaciones: $("obs").value.trim()
      };

      var nuevo;
      if (estadoUI.modoCarga === "simple") {
        nuevo = recalcularRegistro(Object.assign(base, {
          tipo: "simple",
          categoria: $("categoria").value,
          producto: $("producto").value.trim(),
          cantidad: Number($("cantidad").value),
          unidad: $("unidad").value,
          peso_unitario_kg: $("unidad").value === "unidad" ? Number($("peso").value) : null
        }));
      } else {
        nuevo = recalcularRegistro(Object.assign(base, {
          tipo: "receta",
          producto: $("recetaNombre").value.trim(),
          cantidad: Number($("recetaCantidad").value),
          unidad: "unidad",
          ingredientes: estadoUI.ingredientesForm.map(function (ing) {
            return {
              categoria: ing.categoria,
              nombre: ing.nombre.trim(),
              kg_por_unidad: Number(ing.kg_por_unidad)
            };
          })
        }));
      }

      if (!nuevo) return;
      if (estadoUI.editandoId !== null) {
        registros = registros.map(function (r) { return r.id === estadoUI.editandoId ? nuevo : r; });
      } else {
        registros.push(nuevo);
      }

      marcarCambioManualEnOrigen();
      guardarRegistros();
      resetearCamposVariables(estadoUI.editandoId !== null);
      render();
    });

    $("limpiar").addEventListener("click", function () { resetearCamposVariables(true); });

    $("filtroTexto").addEventListener("input", function () {
      estadoUI.filtroTexto = $("filtroTexto").value;
      renderLista();
    });
    $("filtroTipo").addEventListener("change", function () {
      estadoUI.filtroTipo = $("filtroTipo").value;
      renderLista();
    });

    document.querySelectorAll("[data-factor-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        estadoUI.filtroFactor = btn.dataset.factorFilter;
        document.querySelectorAll("[data-factor-filter]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        renderCalculo();
      });
    });

    document.querySelectorAll("[data-metric]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        estadoUI.metricaGrafico = btn.dataset.metric;
        document.querySelectorAll("[data-metric]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        renderResultados();
      });
    });

    $("btnEnviar").addEventListener("click", enviarResultados);
    $("btnJson").addEventListener("click", descargarJson);

    $("btnToggleJson").addEventListener("click", function () {
      estadoUI.jsonVisible = !estadoUI.jsonVisible;
      $("jsonInspector").hidden = !estadoUI.jsonVisible;
      $("btnToggleJson").setAttribute("aria-expanded", String(estadoUI.jsonVisible));
      $("btnToggleJson").textContent = estadoUI.jsonVisible ? "Ocultar JSON" : "Ver JSON";
      if (estadoUI.jsonVisible) {
        $("jsonPreview").textContent = JSON.stringify(armarPayloads(), null, 2);
      }
    });

    $("btnCopiarJson").addEventListener("click", async function () {
      var btn = $("btnCopiarJson");
      var texto = JSON.stringify(armarPayloads(), null, 2);
      var ok = await copiarAlPortapapeles(texto);
      btn.textContent = ok ? "Copiado" : "No se pudo copiar";
      setTimeout(function () { btn.textContent = "Copiar JSON"; }, 1800);
    });

    $("btnVaciarCtx").addEventListener("click", function () {
      $("vaciarCtxWrap").hidden = true;
      $("vaciarCtxConfirmWrap").hidden = false;
    });
    $("btnVaciarCtxCancel").addEventListener("click", function () {
      $("vaciarCtxConfirmWrap").hidden = true;
      $("vaciarCtxWrap").hidden = false;
    });
    $("btnVaciarCtxConfirm").addEventListener("click", vaciarTodosLosRegistros);

    $("btnBorrar").addEventListener("click", function () {
      $("borrarWrap").hidden = true;
      $("borrarConfirmWrap").hidden = false;
    });
    $("btnBorrarCancel").addEventListener("click", function () {
      $("borrarConfirmWrap").hidden = true;
      $("borrarWrap").hidden = false;
    });
    $("btnBorrarConfirm").addEventListener("click", vaciarTodosLosRegistros);
  }

  /* ============ INICIALIZACIÓN ============ */
  function poblarSelectoresYPlantillas() {
    var selCat = $("categoria");
    selCat.innerHTML = '<option value="">Elegí una categoría</option>';
    Object.values(FACTORES).forEach(function (f) {
      var opt = document.createElement("option");
      opt.value = f.categoria;
      opt.textContent = f.nombre;
      selCat.appendChild(opt);
    });

    var selEd = $("edificio");
    selEd.innerHTML = '<option value="">Elegí un edificio</option>';
    EDIFICIOS.forEach(function (e) {
      var opt = document.createElement("option");
      opt.value = String(e.id_edificio);
      opt.textContent = e.nombre;
      selEd.appendChild(opt);
    });
    if (EDIFICIOS.length) selEd.value = String(EDIFICIOS[0].id_edificio);

    var contTpls = $("recipeTemplates");
    contTpls.innerHTML = "";
    PLANTILLAS_RECETA.forEach(function (tpl) {
      var btn = crearEl("button", "chip-btn", tpl.label);
      btn.type = "button";
      btn.addEventListener("click", function () { aplicarPlantillaReceta(tpl); });
      contTpls.appendChild(btn);
    });
  }

  async function init() {
    var estado = $("estadoApi");
    try {
      var resultados = await Promise.all([
        API().getFactores({ dimension: CONFIG.DIMENSION }),
        API().getEdificios({ id_universidad: 1 })
      ]);
      resultados[0].forEach(function (f) { FACTORES[f.categoria] = f; });
      EDIFICIOS = resultados[1];
      estado.textContent = CONFIG.API_BASE ? "API central conectada" : "Modo local (sin servidor)";
      estado.className = CONFIG.API_BASE ? "status-pill ok" : "status-pill";
    } catch (e) {
      estado.textContent = "Error al leer API (" + e.message + ")";
      estado.className = "status-pill err";
      MOCK_FACTORES.forEach(function (f) { FACTORES[f.categoria] = f; });
      EDIFICIOS = MOCK_EDIFICIOS;
    }

    var btnEnviar = $("btnEnviar");
    if (btnEnviar) {
      btnEnviar.textContent = CONFIG.API_BASE ? "Enviar a la API central" : "Simular envío (API)";
    }

    poblarSelectoresYPlantillas();
    estadoUI.ingredientesForm = [crearIngredienteVacio("carne_vacuna", "", "")];
    var guardados = cargarRegistrosIniciales();
    registros = guardados.map(recalcularRegistro).filter(Boolean);
    origenDatos = registros.length ? cargarMetaInicial() : null;
    if (!registros.length) limpiarMeta();
    setGuiaAbierta(false);
    setDrawerAbierto(false);
    actualizarValoresEscenarios();
    bindEventos();
    actualizarPeso();
    actualizarPreviewEnVivo();
    render();
  }

  init();
})();
