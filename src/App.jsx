import React, { useState, useRef, useEffect } from "react";

const TURNOS = ["A", "B"];
const LINEAS = ["Ensamble", "Desarme"];

const CLIENTES = [
  "Minera Escondida",
  "Minera Radomiro Tomic",
  "Minera El Salvador",
  "Minera Gabriela Mistral",
  "Minera Centinela",
  "Kospo Power Service Ltda.",
  "Minera Antucoya",
  "Minera Spence",
  "Cia. Minera del Pacifico S.A",
  "Empresa Electrica Angamos SPA",
  "Empresa Electrica Cochrane SPA",
  "Codelco division PTMP",
  "Compañía Minera Zaldivar SPA",
  "SCM Minera Lumina Copper",
  "SQM Salar SPA",
  "Minera Ministro Hales",
  "Minera Chuquicamata",
  "Minera Los Pelambres",
  "Mantos Copper",
  "Minera Mantos de Oro",
  "Minera Mantos Verde",
];

const SUPERVISORES = ["Bryan Mendoza", "Richard Williams", "Alexis Nuñez"];

const T = (nombre) => ({ nombre, titulo: false });
const H = (nombre) => ({ nombre, titulo: true });

const TAREAS_DESARME = [
  H("Desarme de Reductor"),
  T("Lavado de equipos con hidrolavadora"),
  T("Drenaje completo de lubricante"),
  T("Run out y run face del equipo"),
  T("Control de juegos axiales de llegada del equipo"),
  T("Desmontaje de acoplamientos y accesorios"),
  T("Desmontaje de tapas laterales"),
  T("Retiro de pernos de unión base y tapa de housing"),
  T("Retiro de tapa housing"),
  T("Retiro de trenes de engranaje"),
  T("Limpieza interior de housing y acoplamiento"),
  T("Desarme de housing y torque de pernos de amarre según especificaciones"),
  T("Retiro de rodamientos"),
  T("Lavado de ejes, piñones, coronas y accesorios"),
  H("Evaluación de Equipos"),
  T("Control dimensional de alojamientos de housing"),
  T("Control dimensional diámetros a ejes en zonas de rodamientos y alojamientos de acoples"),
  T("Control visual a housing, ejes, piñones, coronas, acoplamientos y accesorios"),
  T("END vía tintas penetrantes, housing, ejes, piñones, coronas y acoplamientos"),
  T("END vía UT a ejes"),
  T("Control de deflexión a ejes"),
  T("Run out ejes"),
  T("Concentricidad de la carcasa"),
  T("Chequeo de preservación del equipo"),
  T("Visita de Inspección ITO"),
  T("Verificación de lo evaluado"),
];

const TAREAS_ENSAMBLE = [
  H("Sub Ensamble"),
  T("Granallado de carcasa de reductor"),
  T("Mecanizados"),
  T("Metalizados"),
  T("Fabricaciones"),
  T("Suministro de piezas"),
  T("Componentes liberados"),
  T("Chequeo y limpieza de piezas, componentes y servicios"),
  T("Run out ejes"),
  T("Posicionamiento de housing"),
  T("Armado de cabezal"),
  T("Montaje de rodamientos en ejes"),
  T("Instalación de ejes sobre housing"),
  T("Instalación de espaciadores"),
  T("Aproximación de juegos axiales"),
  H("Ensamble de Equipo"),
  T("Instalación tapa superior en housing, torque de pernos de amarre de acuerdo a especificaciones"),
  T("Montaje de tapas laterales y torque de pernos"),
  T("Juegos axiales por árbol de engrane"),
  T("Instalación de sellos HS - LS"),
  T("Prueba de estanqueidas"),
  T("Inspección final del proceso"),
  T("Inspección de Armado ITO"),
  T("Verificación de juegos axiales y backlash"),
  T("Verificación instalacion de repuestos, ajustes, torques y procedimientos."),
  T("Pruebas de funcionamiento"),
  T("Traslado a banco de prueba y preparación para pruebas dinámicas en vacío"),
  T("Pruebas dinámicas"),
  T("Prueba de estanqueidas"),
  T("Retiro de reductor banco de pruebas"),
  T("Visita Pruebas Dinámicas ITO"),
  T("Validación de pruebas dinámicas"),
  H("Montaje de Accesorios"),
  T("Preparación para montaje de accesorios, drenaje de aceite de pruebas, limpieza"),
  T("Montaje de acoplamiento HS - LS"),
  T("Montaje de accesorios (sist. Enfriamiento, protecciones, válvulas, respirador, etc)"),
  T("Run out y run face del acople"),
  T("Verificar puntos de sensores"),
  H("Pintura y Embalaje"),
  T("Limpieza completa a la superficie y eliminación de rastros de aceite"),
  T("Verificación por boroscopia de limpieza de cañerias"),
  T("Pintura del equipo"),
  T("Embalaje con termocontraible"),
  H("Liberación Sumitomo"),
  T("Liberación final para despacho a cliente"),
  T("Elaboración de Informe de reparación"),
  T("Visita Liberación ITO"),
  T("Liberación y despacho de equipo"),
];

const makeTareas = (linea) =>
  (linea === "Desarme" ? TAREAS_DESARME : TAREAS_ENSAMBLE).map((item) => ({
    id: Math.random(),
    nombre: item.nombre,
    titulo: item.titulo,
    estado: "",
    notaPendiente: "",
  }));

const calcAvance = (tareas) => {
  const aplicables = tareas.filter((t) => !t.titulo && t.estado !== "noaplica");
  if (!aplicables.length) return 0;
  const finalizados = aplicables.filter((t) => t.estado === "finalizado").length;
  return Math.round((finalizados / aplicables.length) * 100);
};

const defaultActividad = () => {
  const linea = "Ensamble";
  return {
    id: Date.now() + Math.random(),
    fecha: new Date().toISOString().split("T")[0],
    linea,
    nroLinea: "",
    turno: "B",
    ran: "",
    unidad: "",
    cliente: "",
    clienteManual: "",
    tecnicos: "",
    supervisor: "",
    supervisorManual: "",
    planificacion: "",
    planificacionManual: "",
    tareas: makeTareas(linea),
    observaciones: "",
    notaTraspaso: "",
    fotos: [],
  };
};

const STORAGE_KEY = "reporte_turno_data";

export default function ReporteTurno() {
  const [step, setStep] = useState("form");
  const [actividadAbierta, setActividadAbierta] = useState(null);
  const [seccionesColapsadas, setSeccionesColapsadas] = useState({});
  const [actividades, setActividades] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [defaultActividad()];
      const data = JSON.parse(saved);
      // Migrar: si estado es "pendiente" y no tiene nota, resetear a ""
      return data.map(a => ({
        ...a,
        tareas: a.tareas.map(t => ({
          ...t,
          estado: t.estado === "pendiente" && !t.notaPendiente ? "" : t.estado
        }))
      }));
    } catch {
      return [defaultActividad()];
    }
  });
  const cameraRefs = useRef({});
  const galleryRefs = useRef({});
  const importRef = useRef();

  // ── Entrega de turno ──────────────────────────────────────────────────────
  const [nombreSaliente, setNombreSaliente] = useState("");
  const [nombreEntrante, setNombreEntrante] = useState("");
  const [entregaHecha, setEntregaHecha] = useState(null);
  const [ranAbierto, setRanAbierto] = useState(null);

  // ── App instalable en el celular (PWA) ────────────────────────────────────
  const [instalador, setInstalador] = useState(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e) => { e.preventDefault(); setInstalador(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const instalarApp = async () => {
    if (!instalador) return;
    instalador.prompt();
    await instalador.userChoice;
    setInstalador(null);
  };

  useEffect(() => {
    try {
      const sinFotos = actividades.map((a) => ({ ...a, fotos: [] }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sinFotos));
    } catch {}
  }, [actividades]);

  const toggleSeccion = (actId, secNombre) => {
    const key = actId + ":" + secNombre;
    setSeccionesColapsadas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addActividad = () => {
    const nueva = defaultActividad();
    setActividades((p) => [...p, nueva]);
    setActividadAbierta(nueva.id);
  };
  const removeActividad = (id) => setActividades((p) => p.filter((a) => a.id !== id));
  const moverActividad = (id, dir) => {
    setActividades((p) => {
      const idx = p.findIndex((a) => a.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= p.length) return p;
      const arr = [...p];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };
  const updateActividad = (id, field, value) =>
    setActividades((p) => p.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  const cambiarLinea = (id, linea) =>
    setActividades((p) =>
      p.map((a) => (a.id === id ? { ...a, linea, tareas: makeTareas(linea) } : a))
    );

  const updateTarea = (actId, tareaId, campo, valor) =>
    setActividades((p) =>
      p.map((a) =>
        a.id === actId
          ? { ...a, tareas: a.tareas.map((t) => (t.id === tareaId ? { ...t, [campo]: valor } : t)) }
          : a
      )
    );

  const comprimirImagen = (file, maxW = 1200, quality = 0.65) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  const handleFotos = (id, files) => {
    Array.from(files).forEach(async (file) => {
      const dataUrl = await comprimirImagen(file);
      setActividades((p) =>
        p.map((a) =>
          a.id === id ? { ...a, fotos: [...(a.fotos || []), { dataUrl, name: file.name }] } : a
        )
      );
    });
  };
  const removeFoto = (actId, idx) =>
    setActividades((p) =>
      p.map((a) => (a.id === actId ? { ...a, fotos: a.fotos.filter((_, i) => i !== idx) } : a))
    );

  const limpiarTodo = () => {
    if (confirm("¿Limpiar todo y comenzar un nuevo reporte?")) {
      localStorage.removeItem(STORAGE_KEY);
      setActividades([defaultActividad()]);
      setStep("form");
    }
  };

  const exportarJSON = () => {
    const datos = actividades.map((a) => ({ ...a, fotos: [] }));
    const json = JSON.stringify(datos, null, 2);
    const fecha = new Date().toLocaleDateString("es-CL").replace(/\//g, "-");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-turno-${fecha}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const datos = JSON.parse(ev.target.result);
        if (Array.isArray(datos)) {
          setActividades(datos);
          setStep("form");
          alert("✅ Reporte cargado correctamente");
        } else if (datos?.tipo === "entrega-turno" && Array.isArray(datos.actividades)) {
          setActividades(datos.actividades);
          setNombreSaliente(datos.entrega || "");
              setStep("form");
          const de = datos.entrega ? ` de ${datos.entrega}` : "";
          alert(`✅ Entrega de turno${de} cargada.\n\nRevisa los pendientes y firma la recepción en "Entrega de turno".`);
        } else {
          alert("❌ Archivo inválido");
        }
      } catch {
        alert("❌ Error al leer el archivo");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Compartir la entrega (WhatsApp, correo, etc.) ────────────────────────
  // En vez de un servidor, la entrega viaja como archivo por donde el
  // equipo ya se comunica. El turno entrante lo abre con el botón 📂.
  const compartirEntrega = async () => {
    const datos = actividades.map((a) => ({ ...a, fotos: [] }));
    const paquete = {
      tipo: "entrega-turno",
      generado: new Date().toISOString(),
      entrega: nombreSaliente || null,
      recibe: nombreEntrante || null,
      actividades: datos,
    };
    const fecha = new Date().toLocaleDateString("es-CL").replace(/\//g, "-");
    const nombreArchivo = `entrega-turno-${fecha}.json`;
    const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
    const file = new File([blob], nombreArchivo, { type: "application/json" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Entrega de turno" });
        return;
      } catch {
        return; // el usuario canceló
      }
    }
    // Si el celular no permite compartir archivos, se descarga igual.
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF: ACTA DE ENTREGA DE TURNO ─────────────────────────────────────────
  const handleExportPDF = () => {
    const esc = (t) => String(t ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

    const datos = actividades.map((a, i) => {
      const avance = calcAvance(a.tareas);
      const reales = a.tareas.filter((t) => !t.titulo);
      return {
        i,
        a,
        avance,
        cliente: a.cliente === "__manual__" ? a.clienteManual : a.cliente,
        supervisor: a.supervisor === "__manual__" ? a.supervisorManual : a.supervisor,
        planificacion: a.planificacion === "__manual__" ? a.planificacionManual : a.planificacion,
        pend: reales.filter((t) => t.estado === "pendiente"),
        fin: reales.filter((t) => t.estado === "finalizado"),
        na: reales.filter((t) => t.estado === "noaplica"),
        sin: reales.filter((t) => !t.estado),
      };
    });

    const totalPend = datos.reduce((n, d) => n + d.pend.length, 0);
    const avgAvance = datos.length ? Math.round(datos.reduce((n, d) => n + d.avance, 0) / datos.length) : 0;
    const p0 = datos[0]?.a || {};
    const fechaTurno = p0.fecha
      ? new Date(p0.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("es-CL");
    const emitido = new Date().toLocaleString("es-CL");
    const folio = `ET-${(p0.fecha || "").replace(/-/g, "")}-T${p0.turno || ""}`;

    // Código de verificación: se deriva del contenido del acta. Si algún dato
    // cambia después de emitido, el código ya no corresponde.
    const huella = JSON.stringify(datos.map((d) => [d.a.ran, d.avance, d.pend.map((t) => t.nombre + t.notaPendiente), d.a.notaTraspaso]));
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let k = 0; k < huella.length; k++) {
      h1 = (h1 ^ huella.charCodeAt(k)) >>> 0;
      h1 = (h1 * 0x01000193) >>> 0;
      h2 = (h2 + huella.charCodeAt(k) * (k + 7)) >>> 0;
    }
    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const trozo = (n) => { let r = ""; for (let k = 0; k < 4; k++) { r += alfabeto[n % 32]; n = Math.floor(n / 32); } return r; };
    const codigo = `${trozo(h1)}-${trozo(h2)}`;

    const barra = (pct) => {
      const col = pct === 100 ? "#1B7A4B" : pct >= 60 ? "#C9822E" : "#B3261E";
      return `<div style="display:flex;align-items:center;gap:5px;">
        <div style="flex:1;background:#E2E8F0;border-radius:99px;height:5px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${col};border-radius:99px;"></div>
        </div>
        <span style="font-size:9px;font-weight:800;color:${col};min-width:26px;text-align:right;">${pct}%</span>
      </div>`;
    };

    // ── HOJA 1: ACTA ─────────────────────────────────────────────────────────
    const filasResumen = datos.map((d) => `
      <tr>
        <td style="padding:5px 7px;border-bottom:1px solid #E8EBEE;font-family:monospace;font-weight:700;font-size:10px;">${esc(d.a.ran || "—")}</td>
        <td style="padding:5px 7px;border-bottom:1px solid #E8EBEE;">
          <span style="font-size:8px;font-weight:800;color:#fff;background:${d.a.linea === "Ensamble" ? "#2F6E8F" : "#A15A32"};border-radius:3px;padding:1px 5px;">${d.a.linea === "Ensamble" ? "ENS" : "DES"}</span>
        </td>
        <td style="padding:5px 7px;border-bottom:1px solid #E8EBEE;font-size:10px;">${esc(d.a.unidad || "—")}</td>
        <td style="padding:5px 7px;border-bottom:1px solid #E8EBEE;font-size:9px;color:#4B5560;">${esc(d.cliente || "—")}</td>
        <td style="padding:5px 7px;border-bottom:1px solid #E8EBEE;width:90px;">${barra(d.avance)}</td>
        <td style="padding:5px 7px;border-bottom:1px solid #E8EBEE;text-align:center;">
          ${d.pend.length
            ? `<span style="background:#FDF0DC;color:#8A5A1E;font-weight:800;font-size:10px;border-radius:9px;padding:1px 7px;">${d.pend.length}</span>`
            : `<span style="color:#1B7A4B;font-weight:800;font-size:10px;">✓</span>`}
        </td>
      </tr>`).join("");

    const acta = `
      <div style="border:1.5px solid #141A21;border-radius:6px;overflow:hidden;">
        <div style="background:#141A21;padding:12px 16px;display:flex;justify-content:space-between;align-items:flex-end;">
          <div>
            <div style="color:#E0A245;font-size:9px;font-weight:800;letter-spacing:0.16em;">SM CYCLO DE CHILE LTDA. · SMAN ANTOFAGASTA</div>
            <div style="color:#fff;font-size:17px;font-weight:800;letter-spacing:-0.3px;margin-top:2px;">ACTA DE ENTREGA DE TURNO</div>
          </div>
          <div style="text-align:right;color:#94A3B8;font-size:9px;font-family:monospace;">
            <div>FOLIO ${esc(folio)}</div>
            <div>${esc(emitido)}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#E2E8F0;">
          ${[["FECHA DEL TURNO", fechaTurno], ["TURNO", p0.turno ? "Turno " + p0.turno : "—"],
             ["SUPERVISOR", datos[0]?.supervisor || "—"], ["PLANIFICACIÓN", datos[0]?.planificacion || "—"]]
            .map(([k, v]) => `<div style="background:#F8FAFC;padding:6px 9px;">
              <div style="font-size:7px;font-weight:800;color:#64748B;letter-spacing:0.08em;">${k}</div>
              <div style="font-size:10px;font-weight:700;color:#141A21;margin-top:1px;">${esc(v)}</div>
            </div>`).join("")}
        </div>

        <div style="padding:12px 16px;">
          <div style="display:flex;gap:10px;margin-bottom:12px;">
            <div style="flex:1;border:1px solid #E2E8F0;border-radius:5px;padding:8px 10px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#141A21;">${datos.length}</div>
              <div style="font-size:8px;font-weight:700;color:#64748B;letter-spacing:0.06em;">EQUIPOS EN TURNO</div>
            </div>
            <div style="flex:1;border:1.5px solid #E0A245;background:#FFF8ED;border-radius:5px;padding:8px 10px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#8A5A1E;">${totalPend}</div>
              <div style="font-size:8px;font-weight:800;color:#8A5A1E;letter-spacing:0.06em;">TAREAS PENDIENTES</div>
            </div>
            <div style="flex:1;border:1px solid #E2E8F0;border-radius:5px;padding:8px 10px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#141A21;">${avgAvance}%</div>
              <div style="font-size:8px;font-weight:700;color:#64748B;letter-spacing:0.06em;">AVANCE PROMEDIO</div>
            </div>
          </div>

          <div style="font-size:8px;font-weight:800;color:#64748B;letter-spacing:0.09em;margin-bottom:5px;">DETALLE DE EQUIPOS</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#F1F5F9;">
                ${["RAN", "LÍNEA", "EQUIPO / UNIDAD", "CLIENTE", "AVANCE", "PEND."].map((h, k) =>
                  `<th style="padding:5px 7px;text-align:${k === 4 || k === 5 ? "center" : "left"};font-size:7.5px;font-weight:800;color:#4B5560;letter-spacing:0.07em;border-bottom:1.5px solid #CBD5E1;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>${filasResumen}</tbody>
          </table>
        </div>

        <div style="border-top:1.5px solid #141A21;padding:11px 16px;background:#F8FAFC;">
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:16px;align-items:end;">
            <div>
              <div style="font-size:7.5px;font-weight:800;color:#64748B;letter-spacing:0.08em;">EMITIDO POR</div>
              <div style="font-size:11px;font-weight:700;color:#141A21;">${esc(nombreSaliente) || "—"}</div>
              <div style="font-size:8px;color:#64748B;">Planificación y Control de Producción · SMAN Antofagasta</div>
            </div>
            <div>
              <div style="font-size:7.5px;font-weight:800;color:#64748B;letter-spacing:0.08em;">DIRIGIDO A</div>
              <div style="font-size:11px;font-weight:700;color:#141A21;">${esc(nombreEntrante) || "—"}</div>
              <div style="font-size:8px;color:#64748B;">Turno entrante</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:7.5px;font-weight:800;color:#64748B;letter-spacing:0.08em;">CÓDIGO DE VERIFICACIÓN</div>
              <div style="font-family:monospace;font-size:13px;font-weight:800;color:#141A21;letter-spacing:0.08em;">${codigo}</div>
              <div style="font-size:7.5px;color:#64748B;">Emitido ${esc(emitido)}</div>
            </div>
          </div>
          <div style="font-size:7.5px;color:#8A93A0;margin-top:8px;line-height:1.4;">
            Documento generado automáticamente desde el sistema de Reporte de Turno. El código de verificación se calcula a partir del contenido del acta; cualquier modificación posterior invalida su correspondencia.
          </div>
        </div>
      </div>`;

    // ── HOJA 2: PENDIENTES CONSOLIDADOS ──────────────────────────────────────
    const conPend = datos.filter((d) => d.pend.length || d.a.notaTraspaso);
    const hojaPendientes = `
      <div style="break-before:page;page-break-before:always;">
        <div style="background:#141A21;padding:9px 14px;border-radius:5px 5px 0 0;display:flex;justify-content:space-between;align-items:center;">
          <div style="color:#fff;font-size:13px;font-weight:800;">PENDIENTES PARA EL TURNO ENTRANTE</div>
          <div style="color:#E0A245;font-size:11px;font-weight:800;">${totalPend} tarea${totalPend !== 1 ? "s" : ""}</div>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:none;border-radius:0 0 5px 5px;padding:10px 14px;">
        ${conPend.length === 0
          ? `<div style="font-size:11px;color:#1B7A4B;font-weight:700;padding:8px 0;">Sin tareas pendientes. Todos los equipos quedan al día.</div>`
          : conPend.map((d) => `
            <div style="margin-bottom:11px;break-inside:avoid;">
              <div style="display:flex;align-items:center;gap:6px;border-bottom:1.5px solid #141A21;padding-bottom:3px;margin-bottom:5px;">
                <span style="font-size:8px;font-weight:800;color:#fff;background:${d.a.linea === "Ensamble" ? "#2F6E8F" : "#A15A32"};border-radius:3px;padding:1px 5px;">${d.a.linea === "Ensamble" ? "ENS" : "DES"}</span>
                <span style="font-family:monospace;font-size:12px;font-weight:800;">RAN ${esc(d.a.ran || "—")}</span>
                <span style="font-size:10px;color:#4B5560;">${esc(d.a.unidad || "")}</span>
                <span style="margin-left:auto;font-size:9px;font-weight:800;color:#8A5A1E;">${d.pend.length} pend. · ${d.avance}%</span>
              </div>
              ${d.pend.map((t) => `
                <div style="background:#FFF8ED;border-left:3px solid #E0A245;padding:4px 8px;margin-bottom:3px;">
                  <div style="font-size:10.5px;color:#141A21;font-weight:600;">${esc(t.nombre)}</div>
                  ${t.notaPendiente ? `<div style="font-size:9.5px;color:#8A5A1E;font-style:italic;">${esc(t.notaPendiente)}</div>` : ""}
                </div>`).join("")}
              ${d.a.notaTraspaso ? `
                <div style="background:#F1F5F9;border-left:3px solid #141A21;padding:5px 8px;margin-top:4px;">
                  <div style="font-size:7.5px;font-weight:800;color:#64748B;letter-spacing:0.07em;">INSTRUCCIÓN</div>
                  <div style="font-size:10px;color:#141A21;font-weight:600;">${esc(d.a.notaTraspaso)}</div>
                </div>` : ""}
            </div>`).join("")}
        </div>
      </div>`;

    // ── HOJAS 3+: DETALLE POR EQUIPO ─────────────────────────────────────────
    const compacto = (lista, titulo, color) => lista.length ? `
      <div style="margin-top:7px;">
        <div style="font-size:7.5px;font-weight:800;color:${color};letter-spacing:0.07em;margin-bottom:2px;">${titulo} (${lista.length})</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 9px;">
          ${lista.map((t) => `<div style="font-size:8px;color:#6B7580;line-height:1.35;">· ${esc(t.nombre)}</div>`).join("")}
        </div>
      </div>` : "";

    const hojasDetalle = datos.map((d) => `
      <div style="break-before:page;page-break-before:always;">
        <div style="background:#141A21;padding:9px 14px;border-radius:5px 5px 0 0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="color:#fff;font-size:13px;font-weight:800;font-family:monospace;">RAN ${esc(d.a.ran || "—")}</div>
            <div style="color:#94A3B8;font-size:9px;">${esc(d.a.unidad || "")}${d.cliente ? " · " + esc(d.cliente) : ""}</div>
          </div>
          <div style="text-align:right;">
            <div style="color:#E0A245;font-size:9px;font-weight:800;">${d.a.linea.toUpperCase()}${d.a.nroLinea ? " N°" + esc(d.a.nroLinea) : ""}</div>
            <div style="color:#fff;font-size:15px;font-weight:800;">${d.avance}%</div>
          </div>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:none;border-radius:0 0 5px 5px;padding:9px 14px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:8px;">
            ${[["TÉCNICOS", d.a.tecnicos], ["SUPERVISOR", d.supervisor], ["TURNO", d.a.turno ? "Turno " + d.a.turno : ""]]
              .filter(([, v]) => v).map(([k, v]) => `<div>
                <div style="font-size:7px;font-weight:800;color:#64748B;">${k}</div>
                <div style="font-size:9.5px;font-weight:600;color:#141A21;">${esc(v)}</div>
              </div>`).join("")}
          </div>

          ${d.pend.length ? `
            <div style="border:1.5px solid #E0A245;background:#FFF8ED;border-radius:5px;padding:7px 9px;">
              <div style="font-size:8.5px;font-weight:800;color:#8A5A1E;letter-spacing:0.07em;margin-bottom:4px;">⚠ PENDIENTE — ${d.pend.length} TAREA${d.pend.length !== 1 ? "S" : ""}</div>
              ${d.pend.map((t) => `
                <div style="padding:2px 0;border-bottom:1px solid #F0DCC0;">
                  <span style="font-size:10.5px;font-weight:600;color:#141A21;">${esc(t.nombre)}</span>
                  ${t.notaPendiente ? `<span style="font-size:9.5px;color:#8A5A1E;font-style:italic;"> — ${esc(t.notaPendiente)}</span>` : ""}
                </div>`).join("")}
            </div>` : `
            <div style="border:1px solid #1B7A4B;background:#DCF2E5;border-radius:5px;padding:6px 9px;font-size:10px;font-weight:700;color:#1B7A4B;">
              ✓ Sin tareas pendientes en este equipo
            </div>`}

          ${d.a.notaTraspaso ? `
            <div style="background:#F1F5F9;border-left:3px solid #141A21;padding:5px 9px;margin-top:6px;">
              <div style="font-size:7.5px;font-weight:800;color:#64748B;letter-spacing:0.07em;">INSTRUCCIÓN PARA EL TURNO ENTRANTE</div>
              <div style="font-size:10px;color:#141A21;font-weight:600;">${esc(d.a.notaTraspaso)}</div>
            </div>` : ""}

          ${d.a.observaciones ? `
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:5px;padding:5px 9px;margin-top:6px;font-size:9.5px;color:#4B5560;">
              <strong style="font-size:7.5px;color:#64748B;">OBSERVACIONES</strong><br/>${esc(d.a.observaciones)}
            </div>` : ""}

          ${compacto(d.fin, "EJECUTADO Y CONFORME", "#1B7A4B")}
          ${compacto(d.sin, "NO INICIADO", "#8A5A1E")}
          ${compacto(d.na, "NO APLICA", "#94A3B8")}

          ${d.a.fotos?.length ? `
            <div style="margin-top:8px;">
              <div style="font-size:7.5px;font-weight:800;color:#64748B;letter-spacing:0.07em;margin-bottom:3px;">REGISTRO FOTOGRÁFICO</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;">
                ${d.a.fotos.slice(0, 6).map((f) => `<img src="${f.dataUrl}" style="width:100%;height:74px;object-fit:cover;border-radius:3px;border:1px solid #E2E8F0;" />`).join("")}
              </div>
            </div>` : ""}
        </div>
      </div>`).join("");

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Acta de Entrega de Turno — ${esc(folio)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#fff;font-family:'Segoe UI',system-ui,sans-serif;color:#141A21;}
  @page{margin:11mm;size:letter;}
  @media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  table{border-collapse:collapse;}
</style></head>
<body>
  ${acta}
  ${hojaPendientes}
  ${hojasDetalle}
  <script>window.onload=()=>{window.print();}<\/script>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };


  // ── PREVIEW ────────────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <div style={S.root}>
        <div style={S.container}>
          <div style={S.topBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>📋</div>
              <div>
                <div style={S.topBarTitle}>Resumen del Reporte</div>
                <div style={S.topBarSub}>{actividades.length} actividad{actividades.length !== 1 ? "es" : ""} registrada{actividades.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>

          <div style={S.shareBar}>
            <button style={{ ...S.shareBtn, background: "#141A21", color: "#fff", border: "none" }} onClick={handleExportPDF}>
              📄 Exportar PDF
            </button>
            <button style={S.shareBtn} onClick={() => setStep("entrega")}>← Volver a entrega</button>
          </div>

          <button style={{ ...S.btnPrimary, background: "#C9822E", marginBottom: 20 }} onClick={() => setStep("entrega")}>
            🤝 Entregar turno →
          </button>

          {actividades.map((a, i) => {
            const avance = calcAvance(a.tareas);
            const fecha = new Date(a.fecha + "T12:00:00").toLocaleDateString("es-CL", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            });
            const clienteLabel = a.cliente === "__manual__" ? a.clienteManual : a.cliente;
            const supervisorLabel = a.supervisor === "__manual__" ? a.supervisorManual : a.supervisor;
            const planificacionLabel = a.planificacion === "__manual__" ? a.planificacionManual : a.planificacion;
            const nroLinea = a.nroLinea ? ` N°${a.nroLinea}` : "";
            return (
              <div key={a.id} style={S.previewCard}>
                <div style={S.previewCardTopBar}>
                  <div style={{ fontSize: 18 }}>📋</div>
                  <div>
                    <div style={S.previewCardBarTitle}>Turno {a.turno} — {a.linea}{nroLinea} — Actividad {i + 1}</div>
                    <div style={S.previewCardBarSub}>{fecha}</div>
                  </div>
                </div>
                <div style={S.previewCardMeta}>
                  {a.ran && <span style={{ ...S.metaChip, background: "#FDF0DC", color: "#8A5A1E" }}>📋 RAN: {a.ran}</span>}
                  {a.unidad && <span style={{ ...S.metaChip, background: "#EFF6FF", color: "#1D4ED8" }}>🔧 {a.unidad}</span>}
                  {clienteLabel && <span style={{ ...S.metaChip, background: "#F3E8FF", color: "#6B21A8" }}>🏢 {clienteLabel}</span>}
                  {a.tecnicos && <span style={{ ...S.metaChip, background: "#F0FDF4", color: "#166534" }}>👷 {a.tecnicos}</span>}
                  {supervisorLabel && <span style={{ ...S.metaChip, background: "#F8FAFC", color: "#334155" }}>👤 {supervisorLabel}</span>}
                  {planificacionLabel && <span style={{ ...S.metaChip, background: "#FFF7ED", color: "#9A3412" }}>📋 Plan: {planificacionLabel}</span>}
                </div>
                <div style={S.previewCardBody}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={S.previewLabel}>AVANCE</span>
                    <div style={{ flex: 1, background: "#E2E8F0", borderRadius: 99, height: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${avance}%`, background: avance === 100 ? "#1B7A4B" : avance >= 60 ? "#C9822E" : "#B3261E" }} />
                    </div>
                    <span style={S.avancePct}>{avance}%</span>
                  </div>
                  <div style={S.previewLabel}>TAREAS</div>
                  {a.tareas.map((t) => (
                    t.titulo ? (
                      <div key={t.id} style={S.tareaHeader}>{t.nombre}</div>
                    ) : (
                    <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: "1px solid #F1F5F9" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, flexShrink: 0, marginTop: 1,
                        background: t.estado === "finalizado" ? "#DCF2E5" : t.estado === "noaplica" ? "#F1F5F9" : "#FDF0DC",
                        color: t.estado === "finalizado" ? "#1B7A4B" : t.estado === "noaplica" ? "#94A3B8" : "#8A5A1E",
                      }}>
                        {t.estado === "finalizado" ? "✅" : t.estado === "noaplica" ? "N/A" : "⏳"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: t.estado === "noaplica" ? "#94A3B8" : "#141A21" }}>{t.nombre}</span>
                        {t.notaPendiente && <div style={{ fontSize: 12, color: "#8A5A1E", marginTop: 2 }}>{t.notaPendiente}</div>}
                      </div>
                    </div>
                    )
                  ))}
                  {a.observaciones && <div style={{ ...S.obsBox, marginTop: 12 }}>📝 {a.observaciones}</div>}
                  {a.fotos?.length > 0 && (
                    <div style={S.fotoPreviewGrid}>
                      {a.fotos.map((f, fi) => (
                        <div key={fi} style={S.fotoPreviewWrap}>
                          <img src={f.dataUrl} alt={f.name} style={S.fotoPreviewImg} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── ENTREGA DE TURNO ───────────────────────────────────────────────────────
  if (step === "entrega") {
    // Cada actividad = un RAN. La entrega se arma POR RAN, no en una lista general.
    const resumen = actividades.map((a, i) => {
      const avance = calcAvance(a.tareas);
      const pend = a.tareas.filter((t) => !t.titulo && t.estado === "pendiente");
      return {
        idx: i,
        act: a,
        avance,
        pend,
        cliente: a.cliente === "__manual__" ? a.clienteManual : a.cliente,
      };
    });
    const totalPendientes = resumen.reduce((n, r) => n + r.pend.length, 0);
    const avancePromedio = resumen.length
      ? Math.round(resumen.reduce((n, r) => n + r.avance, 0) / resumen.length)
      : 0;

    return (
      <div style={S.root}>
        <div style={S.container}>
          <div style={S.topBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 26 }}>🤝</div>
              <div>
                <div style={S.topBarTitle}>Entrega de Turno</div>
                <div style={S.topBarSub}>
                  {resumen.length} RAN · {totalPendientes} pendiente{totalPendientes !== 1 ? "s" : ""} · {avancePromedio}% avance
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button style={{ ...S.shareBtn, flex: 1 }} onClick={() => setStep("form")}>← Editar actividades</button>
            <button style={{ ...S.shareBtn, flex: 1 }} onClick={() => setStep("preview")}>Ver detalle completo</button>
          </div>

          {/* ── TABLA RESUMEN: los 10 RAN de un vistazo ── */}
          <div style={S.section}>
            <div style={S.sectionLabel}>EQUIPOS EN ESTE TURNO</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: "0", fontSize: 12 }}>
              <div style={S.thEntrega}>RAN</div>
              <div style={S.thEntrega}>Equipo</div>
              <div style={{ ...S.thEntrega, textAlign: "center" }}>Av.</div>
              <div style={{ ...S.thEntrega, textAlign: "center" }}>Pend.</div>
              {resumen.map((r) => (
                <React.Fragment key={r.act.id}>
                  <div style={S.tdEntrega}>
                    <span className="mono" style={{ fontWeight: 700 }}>{r.act.ran || "—"}</span>
                  </div>
                  <div style={S.tdEntrega}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: r.act.linea === "Ensamble" ? "#2F6E8F" : "#A15A32", borderRadius: 3, padding: "1px 5px", marginRight: 5 }}>
                      {r.act.linea === "Ensamble" ? "ENS" : "DES"}
                    </span>
                    {r.act.unidad || "—"}
                  </div>
                  <div style={{ ...S.tdEntrega, textAlign: "center", fontWeight: 800, color: r.avance === 100 ? "#1B7A4B" : r.avance >= 60 ? "#C9822E" : "#B3261E" }}>
                    {r.avance}%
                  </div>
                  <div style={{ ...S.tdEntrega, textAlign: "center" }}>
                    {r.pend.length > 0 ? (
                      <span style={{ background: "#FDF0DC", color: "#8A5A1E", fontWeight: 800, borderRadius: 10, padding: "1px 7px" }}>{r.pend.length}</span>
                    ) : (
                      <span style={{ color: "#1B7A4B", fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── DETALLE POR RAN ── */}
          <div style={{ ...S.sectionLabel, marginBottom: 8, marginTop: 4 }}>DETALLE POR EQUIPO</div>

          {resumen.map((r) => {
            const abierto = ranAbierto === r.act.id;
            const lineaColor = r.act.linea === "Ensamble" ? "#2F6E8F" : "#A15A32";
            return (
              <div key={r.act.id} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                <div
                  onClick={() => setRanAbierto(abierto ? null : r.act.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer", background: abierto ? "#F1F5F9" : "#fff", userSelect: "none" }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: lineaColor, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>
                    {r.act.linea === "Ensamble" ? "ENS" : "DES"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#141A21" }}>
                      RAN {r.act.ran || "sin N°"}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.act.unidad || "—"}{r.cliente ? ` · ${r.cliente}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {r.pend.length > 0 ? (
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#8A5A1E" }}>{r.pend.length} pend.</div>
                    ) : (
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#1B7A4B" }}>✓ al día</div>
                    )}
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{r.avance}%</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#94A3B8" }}>{abierto ? "▼" : "▶"}</span>
                </div>

                {abierto && (
                  <div style={{ padding: "10px 12px", borderTop: "1px solid #E2E8F0" }}>
                    {r.pend.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#1B7A4B", fontWeight: 600, marginBottom: 10 }}>
                        Sin tareas pendientes en este equipo.
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#8A5A1E", marginBottom: 6, letterSpacing: "0.05em" }}>
                          PENDIENTE EN ESTE RAN
                        </div>
                        {r.pend.map((t) => (
                          <div key={t.id} style={{ background: "#FFF8ED", border: "1px solid #E0A245", borderRadius: 6, padding: "6px 9px", marginBottom: 5 }}>
                            <div style={{ fontSize: 12, color: "#141A21" }}>{t.nombre}</div>
                            {t.notaPendiente && (
                              <div style={{ fontSize: 11, color: "#8A5A1E", fontStyle: "italic", marginTop: 2 }}>— {t.notaPendiente}</div>
                            )}
                          </div>
                        ))}
                      </>
                    )}

                    <label style={{ ...S.label, marginTop: 8 }}>Instrucción para el turno entrante</label>
                    <textarea
                      style={{ ...S.textarea, minHeight: 56, fontSize: 13 }}
                      placeholder="Qué debe hacer el próximo turno con este equipo..."
                      value={r.act.notaTraspaso || ""}
                      onChange={(e) => updateActividad(r.act.id, "notaTraspaso", e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* ── EMISIÓN ── */}
          <div style={{ ...S.section, marginTop: 16 }}>
            <div style={S.sectionLabel}>EMISIÓN DEL ACTA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.label}>Emitido por</label>
                <input style={S.input} placeholder="Nombre de quien emite"
                  value={nombreSaliente} onChange={(e) => setNombreSaliente(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Dirigido a</label>
                <input style={S.input} placeholder="Supervisor / turno entrante"
                  value={nombreEntrante} onChange={(e) => setNombreEntrante(e.target.value)} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>
              Estos datos y el código de verificación quedan impresos al pie del acta.
            </div>
          </div>

          {entregaHecha && (
            <div style={{ background: "#DCF2E5", border: "1px solid #1B7A4B", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#1B7A4B", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
              ✓ Entrega registrada — {entregaHecha}
            </div>
          )}

          <button
            style={{ ...S.btnPrimary, background: "#C9822E", marginBottom: 10 }}
            onClick={() => {
              setEntregaHecha(new Date().toLocaleString("es-CL"));
              compartirEntrega();
            }}
          >
            📤 Enviar entrega al turno entrante
          </button>
          <button style={{ ...S.shareBtn, width: "100%" }} onClick={handleExportPDF}>
            📄 Exportar PDF del acta
          </button>
          <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            El archivo se envía por WhatsApp o correo. Quien recibe lo abre con el botón 📂 de la pantalla principal.
          </div>
        </div>
      </div>
    );
  }


  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <div style={S.container}>
        <div style={S.topBar}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 26 }}>📋</div>
              <div>
                <div style={S.topBarTitle}>Reporte de Turno</div>
                <div style={S.topBarSub}>Informe diario de actividades</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="file" accept=".json" style={{ display: "none" }} ref={importRef} onChange={importarJSON} />
              {instalador && (
                <button onClick={instalarApp} style={{ ...S.clearBtn, background: "#C9822E", border: "none", color: "#141A21", fontWeight: 700 }} title="Instalar como app">⬇️ Instalar</button>
              )}
              <button onClick={exportarJSON} style={S.clearBtn} title="Guardar como archivo">💾</button>
              <button onClick={() => importRef.current?.click()} style={S.clearBtn} title="Cargar archivo">📂</button>
              <button onClick={limpiarTodo} style={S.clearBtn} title="Nuevo reporte">🗑</button>
            </div>
          </div>
        </div>

        {actividades.map((a, i) => {
          const avance = calcAvance(a.tareas);
          const abierta = actividadAbierta === a.id;
          const clienteLabel = a.cliente === "__manual__" ? a.clienteManual : a.cliente;
          const nroLinea = a.nroLinea ? ` N°${a.nroLinea}` : "";
          const lineaColor = a.linea === "Ensamble" ? "#2F6E8F" : "#A15A32";
          const avanceColor = avance === 100 ? "#1B7A4B" : avance >= 60 ? "#C9822E" : "#B3261E";
          return (
            <div key={a.id} style={{ background:"#fff", borderRadius:10, marginBottom:6, border:"1px solid #E2E8F0", overflow:"hidden" }}>

              {/* ── CABECERA ── */}
              <div style={{ display:"flex", alignItems:"stretch" }}>
                <div style={{ display:"flex", flexDirection:"column", borderRight:"1px solid #E2E8F0", flexShrink:0 }}>
                  <button disabled={i===0} onClick={()=>moverActividad(a.id,-1)} style={{ flex:1, width:28, border:"none", background:"transparent", cursor:i===0?"default":"pointer", color:i===0?"#CBD5E1":"#64748B", fontSize:13, borderBottom:"1px solid #E2E8F0" }}>▲</button>
                  <button disabled={i===actividades.length-1} onClick={()=>moverActividad(a.id,1)} style={{ flex:1, width:28, border:"none", background:"transparent", cursor:i===actividades.length-1?"default":"pointer", color:i===actividades.length-1?"#CBD5E1":"#64748B", fontSize:13 }}>▼</button>
                </div>
                <div onClick={()=>setActividadAbierta(abierta?null:a.id)} style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"9px 11px", cursor:"pointer", background:abierta?"#F1F5F9":"#fff", userSelect:"none", minWidth:0 }}>
                  <div style={{ background:abierta?"#141A21":"#E2E8F0", color:abierta?"#fff":"#64748B", borderRadius:5, width:22, height:22, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{i+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:lineaColor, borderRadius:4, padding:"1px 6px", flexShrink:0 }}>{a.linea}{nroLinea}</span>
                      {a.ran && <span style={{ fontSize:12, fontWeight:700, color:"#141A21" }}>RAN {a.ran}</span>}
                      {a.unidad && <span style={{ fontSize:11, color:"#64748B" }}>· {a.unidad}</span>}
                    </div>
                    {clienteLabel && <div style={{ fontSize:10, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{clienteLabel}</div>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2, flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:800, color:avanceColor }}>{avance}%</span>
                    <div style={{ width:44, background:"#E2E8F0", borderRadius:99, height:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${avance}%`, background:avanceColor }} />
                    </div>
                  </div>
                  <div style={{ fontSize:10, color:"#94A3B8", flexShrink:0, transform:abierta?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</div>
                </div>
              </div>

              {/* ── CUERPO ── */}
              {abierta && (<div style={{ padding:"12px 11px", borderTop:"1px solid #E2E8F0" }}>
              <div style={S.sectionLabel}>ENCABEZADO</div>

              {/* Fila 1: Fecha + Línea + Turno + N°Línea */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 56px", gap:6, marginBottom:6 }}>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  <label style={S.label}>Fecha</label>
                  <input type="date" style={{ ...S.input, flex:1 }} value={a.fecha}
                    onChange={e => updateActividad(a.id,"fecha",e.target.value)} />
                </div>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  <label style={S.label}>Línea</label>
                  <div style={{ display:"flex", gap:4, flex:1 }}>
                    {LINEAS.map(l => (
                      <button key={l} onClick={() => cambiarLinea(a.id,l)} style={{
                        flex:1, border:"1.5px solid", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                        background: a.linea===l?(l==="Ensamble"?"#2F6E8F":"#A15A32"):"#F8FAFC",
                        color: a.linea===l?"#fff":"#64748B",
                        borderColor: a.linea===l?(l==="Ensamble"?"#2F6E8F":"#A15A32"):"#E2E8F0",
                      }}>{l==="Ensamble"?"Ens.":"Des."}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  <label style={S.label}>Turno</label>
                  <div style={{ display:"flex", gap:4, flex:1 }}>
                    {TURNOS.map(t => (
                      <button key={t} onClick={() => updateActividad(a.id,"turno",t)} style={{
                        flex:1, border:"1.5px solid", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer",
                        background: a.turno===t?"#141A21":"#F8FAFC",
                        color: a.turno===t?"#fff":"#64748B",
                        borderColor: a.turno===t?"#141A21":"#E2E8F0",
                      }}>T{t}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  <label style={S.label}>N°</label>
                  <input type="number" style={{ ...S.input, flex:1 }} placeholder="3"
                    value={a.nroLinea} onChange={e => updateActividad(a.id,"nroLinea",e.target.value)} />
                </div>
              </div>

              {/* Fila 2: RAN + Unidad + Cliente */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:6 }}>
                <div>
                  <label style={S.label}>RAN</label>
                  <input style={S.input} placeholder="N° orden" value={a.ran}
                    onChange={e => updateActividad(a.id,"ran",e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Unidad / Equipo</label>
                  <input style={S.input} placeholder="Reductor #4" value={a.unidad}
                    onChange={e => updateActividad(a.id,"unidad",e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Cliente</label>
                  <select style={S.select} value={a.cliente}
                    onChange={e => updateActividad(a.id,"cliente",e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__manual__">Otro</option>
                  </select>
                </div>
              </div>
              {a.cliente === "__manual__" && (
                <input style={{ ...S.input, marginBottom:6 }} placeholder="Nombre del cliente"
                  value={a.clienteManual} onChange={e => updateActividad(a.id,"clienteManual",e.target.value)} />
              )}

              {/* Fila 3: Técnicos + Supervisor + Planificación */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:6 }}>
                <div>
                  <label style={S.label}>Técnicos</label>
                  <input style={S.input} placeholder="José, Pedro..." value={a.tecnicos}
                    onChange={e => updateActividad(a.id,"tecnicos",e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Supervisor</label>
                  <select style={S.select} value={a.supervisor}
                    onChange={e => updateActividad(a.id,"supervisor",e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {SUPERVISORES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__manual__">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Planificación</label>
                  <select style={S.select} value={a.planificacion}
                    onChange={e => updateActividad(a.id,"planificacion",e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    <option value="Luis Cortés">Luis Cortés</option>
                    <option value="__manual__">Otro</option>
                  </select>
                </div>
              </div>
              {a.supervisor === "__manual__" && (
                <input style={{ ...S.input, marginBottom:6 }} placeholder="Nombre supervisor"
                  value={a.supervisorManual} onChange={e => updateActividad(a.id,"supervisorManual",e.target.value)} />
              )}
              {a.planificacion === "__manual__" && (
                <input style={{ ...S.input, marginBottom:6 }} placeholder="Nombre planificación"
                  value={a.planificacionManual} onChange={e => updateActividad(a.id,"planificacionManual",e.target.value)} />
              )}

              <div style={S.divider} />

              {/* TAREAS */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={S.sectionLabel}>ACTIVIDADES DEL TURNO</div>
                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: avance === 100 ? "#1B7A4B" : avance >= 60 ? "#C9822E" : "#64748B"
                }}>
                  {avance}%
                </div>
              </div>

              <div style={{ background: "#E2E8F0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 14 }}>
                <div style={{
                  height: "100%", borderRadius: 99, transition: "width 0.3s",
                  width: `${avance}%`,
                  background: avance === 100 ? "#1B7A4B" : avance >= 60 ? "#C9822E" : "#B3261E"
                }} />
              </div>

              {(() => {
                let seccionActual = null;
                return a.tareas.map((t) => {
                  if (t.titulo) {
                    seccionActual = t.nombre;
                    const key = a.id + ":" + t.nombre;
                    const colapsada = seccionesColapsadas[key];
                    return (
                      <div key={t.id}
                        onClick={() => toggleSeccion(a.id, t.nombre)}
                        style={{ ...S.tareaHeader, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span>{t.nombre}</span>
                        <span style={{ fontSize:10 }}>{colapsada ? "▶" : "▼"}</span>
                      </div>
                    );
                  }
                  const key = a.id + ":" + seccionActual;
                  if (seccionesColapsadas[key]) return null;
                  return (
                <div key={t.id} style={{ padding:"4px 0", borderBottom:"1px solid #F1F5F9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ flex:1, fontSize:12, color:"#141A21", lineHeight:1.3 }}>{t.nombre}</span>
                    <div style={{ display:"flex", gap:3, flexShrink:0 }}>
                      {[
                        { val:"finalizado", label:"✓",   colorOn:"#1B7A4B", bgOn:"#DCF2E5" },
                        { val:"noaplica",   label:"N/A", colorOn:"#94A3B8", bgOn:"#F1F5F9" },
                        { val:"pendiente",  label:"⏳",  colorOn:"#C9822E", bgOn:"#FDF0DC" },
                      ].map(op => (
                        <button key={op.val}
                          style={{
                            padding:"3px 7px", borderRadius:5, border:"1.5px solid",
                            fontSize:10, fontWeight:700, cursor:"pointer",
                            background: t.estado===op.val?op.bgOn:"#F8FAFC",
                            color: t.estado===op.val?op.colorOn:"#CBD5E1",
                            borderColor: t.estado===op.val?op.colorOn:"#E2E8F0",
                          }}
                          onClick={() => {
                          const nuevoEstado = t.estado === op.val ? "" : op.val;
                          updateTarea(a.id,t.id,"estado",nuevoEstado);
                          if (nuevoEstado !== "pendiente") updateTarea(a.id,t.id,"notaPendiente","");
                        }}>
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {t.estado === "pendiente" && (
                    <input
                      style={{ width:"100%", marginTop:4, padding:"5px 8px", border:"1px solid #E0A245", borderRadius:5, fontSize:11, color:"#8A5A1E", background:"#FFF8ED", boxSizing:"border-box", outline:"none" }}
                      placeholder="Detalle del pendiente..."
                      value={t.notaPendiente}
                      onChange={e => updateTarea(a.id,t.id,"notaPendiente",e.target.value)} />
                  )}
                </div>
                );
                });
              })()}

              <div style={S.divider} />

              <div style={S.fieldGroup}>
                <label style={S.label}>Observaciones</label>
                <textarea style={S.textarea} placeholder="Notas adicionales, alertas..."
                  value={a.observaciones}
                  onChange={e => updateActividad(a.id, "observaciones", e.target.value)} />
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>📷 Fotos evidencia</label>
                <input type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }}
                  ref={el => cameraRefs.current[a.id] = el}
                  onChange={e => { handleFotos(a.id, e.target.files); e.target.value = ""; }} />
                <input type="file" accept="image/*" multiple style={{ display: "none" }}
                  ref={el => galleryRefs.current[a.id] = el}
                  onChange={e => { handleFotos(a.id, e.target.files); e.target.value = ""; }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...S.fotoBtn, flex: 1 }} onClick={() => cameraRefs.current[a.id]?.click()}>📷 Tomar foto</button>
                  <button style={{ ...S.fotoBtn, flex: 1 }} onClick={() => galleryRefs.current[a.id]?.click()}>🖼️ Galería</button>
                </div>
                {a.fotos?.length > 0 && (
                  <div style={S.fotoGrid}>
                    {a.fotos.map((f, fi) => (
                      <div key={fi} style={S.fotoThumbWrap}>
                        <img src={f.dataUrl} alt={f.name} style={S.fotoThumb} />
                        <button style={S.fotoRemove} onClick={() => removeFoto(a.id, fi)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {actividades.length > 1 && (
                  <button style={{ width:"100%", marginTop:6, padding:"8px", background:"none", border:"1px solid #FCA5A5", color:"#B3261E", fontSize:12, fontWeight:600, cursor:"pointer", borderRadius:6 }}
                    onClick={()=>removeActividad(a.id)}>✕ Eliminar esta actividad</button>
                )}
              </div>
              </div>)}
            </div>
          );
        })}

        <button style={S.addBtn} onClick={addActividad}>+ Agregar actividad</button>
        <button style={S.btnPrimary} onClick={() => setStep("entrega")}>
          Entregar turno →
        </button>
      </div>
    </div>
  );
}

const S = {
  thEntrega: { fontSize: 10, fontWeight: 800, color: "#64748B", letterSpacing: "0.05em", padding: "6px 8px", borderBottom: "1.5px solid #CBD5E1", textTransform: "uppercase" },
  tdEntrega: { fontSize: 12, color: "#141A21", padding: "7px 8px", borderBottom: "1px solid #F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  root: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 40 },
  container: { maxWidth: 680, margin: "0 auto", padding: "0 16px" },
  topBar: { background: "#141A21", margin: "0 -16px 24px", padding: "18px 20px" },
  topBarTitle: { color: "#F1F5F9", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" },
  topBarSub: { color: "#94A3B8", fontSize: 13, marginTop: 1 },
  clearBtn: { background: "none", border: "1px solid #475569", color: "#94A3B8", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  section: { background: "#fff", borderRadius: 12, padding: "20px 18px", marginBottom: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 12 },
  divider: { height: 1, background: "#E2E8F0", margin: "16px 0 18px" },
  row2: { display: "flex", gap: 12 },
  fieldGroup: { flex: 1, marginBottom: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 },
  input: { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#141A21", background: "#F8FAFC", boxSizing: "border-box", outline: "none" },
  textarea: { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#141A21", background: "#F8FAFC", boxSizing: "border-box", minHeight: 72, resize: "vertical", outline: "none", fontFamily: "inherit" },
  select: { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#141A21", background: "#F8FAFC", boxSizing: "border-box" },
  actCardNum: { background: "#141A21", color: "#fff", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  removeBtn: { background: "none", border: "1px solid #FCA5A5", color: "#B3261E", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 10px", borderRadius: 6 },
  tareaItem: { marginBottom: 6, padding: "8px 10px", background: "#FAFAFA", borderRadius: 8, border: "1px solid #F1F5F9" },
  tareaHeader: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "#141A21", background: "#E2E8F0", padding: "6px 10px", borderRadius: 6, marginBottom: 6, marginTop: 10, textTransform: "uppercase" },
  addBtn: { width: "100%", padding: "13px", border: "2px dashed #CBD5E1", borderRadius: 10, background: "none", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12 },
  btnPrimary: { width: "100%", padding: "14px", background: "#141A21", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" },
  shareBar: { display: "flex", gap: 8, margin: "16px 0 20px" },
  shareBtn: { flex: 1, padding: "11px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#141A21", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  previewCard: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 20, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  previewCardTopBar: { background: "#141A21", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 },
  previewCardBarTitle: { color: "#F1F5F9", fontWeight: 700, fontSize: 15 },
  previewCardBarSub: { color: "#94A3B8", fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  previewCardMeta: { display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" },
  previewCardBody: { padding: "14px 16px" },
  metaChip: { borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 },
  previewLabel: { fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6, letterSpacing: "0.04em" },
  avancePct: { fontSize: 13, fontWeight: 700, color: "#141A21", minWidth: 38, textAlign: "right" },
  obsBox: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569" },
  fotoPreviewGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  fotoPreviewWrap: { width: 90, height: 90 },
  fotoPreviewImg: { width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #E2E8F0" },
  fotoBtn: { padding: "9px 12px", border: "1.5px dashed #94A3B8", borderRadius: 8, background: "#F8FAFC", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  fotoGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  fotoThumbWrap: { position: "relative", width: 80, height: 80 },
  fotoThumb: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1.5px solid #E2E8F0" },
  fotoRemove: { position: "absolute", top: -6, right: -6, background: "#B3261E", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};
