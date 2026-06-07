import { useState, useRef, useEffect } from "react";

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
    estado: "pendiente",
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
    fotos: [],
  };
};

const STORAGE_KEY = "reporte_turno_data";

export default function ReporteTurno() {
  const [step, setStep] = useState("form");
  const [actividades, setActividades] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [defaultActividad()];
    } catch {
      return [defaultActividad()];
    }
  });
  const cameraRefs = useRef({});
  const galleryRefs = useRef({});
  const importRef = useRef();

  useEffect(() => {
    try {
      const sinFotos = actividades.map((a) => ({ ...a, fotos: [] }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sinFotos));
    } catch {}
  }, [actividades]);

  const addActividad = () => setActividades((p) => [...p, defaultActividad()]);
  const removeActividad = (id) => setActividades((p) => p.filter((a) => a.id !== id));
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

  // ── PDF ────────────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const actividadesHTML = actividades.map((a, i) => {
      const avance = calcAvance(a.tareas);
      const fecha = new Date(a.fecha + "T12:00:00").toLocaleDateString("es-CL", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      const clienteLabel = a.cliente === "__manual__" ? a.clienteManual : a.cliente;
      const supervisorLabel = a.supervisor === "__manual__" ? a.supervisorManual : a.supervisor;
      const planificacionLabel = a.planificacion === "__manual__" ? a.planificacionManual : a.planificacion;
      const nroLinea = a.nroLinea ? ` N°${a.nroLinea}` : "";

      const tareasFinalizadas = a.tareas.filter((t) => !t.titulo && t.estado === "finalizado");
      const tareasPendientesConNota = a.tareas.filter((t) => !t.titulo && t.estado === "pendiente" && t.notaPendiente);
      const tareasPendientesSinNota = a.tareas.filter((t) => !t.titulo && t.estado === "pendiente" && !t.notaPendiente);
      const tareasNoAplica = a.tareas.filter((t) => !t.titulo && t.estado === "noaplica");

      const renderTareasPDF = (lista, titulo, color, resaltar = false) =>
        lista.length
          ? `<div style="margin-bottom:7px;">
              <div style="font-size:8px;font-weight:700;color:${color};margin-bottom:3px;">${titulo}</div>
              <div style="${resaltar ? "background:#FFFBEB;border:1px solid #FCD34D;border-radius:6px;padding:5px 7px;" : ""}display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px 8px;">
                ${lista.map((t) => `
                  <div style="font-size:${resaltar ? "10px" : "9px"};font-weight:${resaltar ? "600" : "400"};color:${resaltar ? "#92400E" : "#1E293B"};padding:${resaltar ? "2px 0" : "1px 0"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${resaltar ? "⚠️" : "·"} ${t.nombre}${t.notaPendiente ? ` <span style="color:#B45309;font-style:italic;">— ${t.notaPendiente}</span>` : ""}
                  </div>`).join("")}
              </div>
            </div>` : "";

      const renderPendientesSinNotaPDF = (lista) =>
        lista.length
          ? `<div style="margin-bottom:7px;">
              <div style="font-size:8px;font-weight:700;color:#64748B;margin-bottom:3px;">🕐 PENDIENTE</div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px 8px;">
                ${lista.map((t) => `
                  <div style="font-size:9px;color:#64748B;padding:1px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    · ${t.nombre}
                  </div>`).join("")}
              </div>
            </div>` : "";

      const fotosHTML = a.fotos?.length
        ? `<div style="margin-top:8px;">
            <div style="font-size:8px;font-weight:700;color:#64748B;margin-bottom:4px;">FOTOS DE EVIDENCIA</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
              ${a.fotos.slice(0,6).map((f) => `<img src="${f.dataUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;border:1px solid #E2E8F0;" />`).join("")}
            </div>
          </div>` : "";

      const esUltima = i === actividades.length - 1;

      const breakStyle = i === 0 ? "" : "break-before:page;page-break-before:always;";
      return `
        <div style="border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;${breakStyle}">
          <div style="background:#1E293B;padding:10px 14px;display:flex;align-items:center;gap:10px;">
            <div style="font-size:16px;">⚙️</div>
            <div>
              <div style="color:#F1F5F9;font-weight:800;font-size:13px;">Turno ${a.turno} — ${a.linea}${nroLinea} — Actividad ${i + 1}</div>
              <div style="color:#94A3B8;font-size:9px;text-transform:capitalize;margin-top:1px;">${fecha}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#E2E8F0;">
            ${a.ran ? `<div style="background:#FEF9C3;padding:5px 8px;"><div style="font-size:7px;font-weight:700;color:#92400E;">RAN</div><div style="font-size:10px;font-weight:600;color:#78350F;">${a.ran}</div></div>` : ""}
            ${a.unidad ? `<div style="background:#EFF6FF;padding:5px 8px;"><div style="font-size:7px;font-weight:700;color:#1D4ED8;">UNIDAD / EQUIPO</div><div style="font-size:10px;font-weight:600;color:#1E40AF;">${a.unidad}</div></div>` : ""}
            ${clienteLabel ? `<div style="background:#F3E8FF;padding:5px 8px;"><div style="font-size:7px;font-weight:700;color:#6B21A8;">CLIENTE</div><div style="font-size:10px;font-weight:600;color:#581C87;">${clienteLabel}</div></div>` : ""}
            ${a.tecnicos ? `<div style="background:#F0FDF4;padding:5px 8px;"><div style="font-size:7px;font-weight:700;color:#166534;">TÉCNICOS</div><div style="font-size:10px;font-weight:600;color:#14532D;">${a.tecnicos}</div></div>` : ""}
            ${supervisorLabel ? `<div style="background:#F8FAFC;padding:5px 8px;"><div style="font-size:7px;font-weight:700;color:#475569;">SUPERVISOR</div><div style="font-size:10px;font-weight:600;color:#1E293B;">${supervisorLabel}</div></div>` : ""}
            ${planificacionLabel ? `<div style="background:#FFF7ED;padding:5px 8px;"><div style="font-size:7px;font-weight:700;color:#9A3412;">PLANIFICACIÓN</div><div style="font-size:10px;font-weight:600;color:#7C2D12;">${planificacionLabel}</div></div>` : ""}
          </div>
          <div style="padding:10px 14px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="font-size:8px;font-weight:700;color:#64748B;min-width:45px;">AVANCE</div>
              <div style="flex:1;background:#E2E8F0;border-radius:99px;height:7px;overflow:hidden;">
                <div style="height:100%;border-radius:99px;width:${avance}%;background:${avance === 100 ? "#10B981" : avance >= 60 ? "#F59E0B" : "#EF4444"};"></div>
              </div>
              <span style="font-size:12px;font-weight:800;color:#1E293B;min-width:34px;text-align:right;">${avance}%</span>
            </div>
            ${renderTareasPDF(tareasFinalizadas, "✅ FINALIZADO", "#166534")}
            ${renderTareasPDF(tareasPendientesConNota, "⏳ PENDIENTE CON NOTA", "#B45309", true)}
            ${renderPendientesSinNotaPDF(tareasPendientesSinNota)}
            ${renderTareasPDF(tareasNoAplica, "— NO APLICA", "#94A3B8")}
            ${a.observaciones ? `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:5px 8px;font-size:9px;color:#475569;margin-top:6px;">📝 ${a.observaciones}</div>` : ""}
            ${fotosHTML}
          </div>
        </div>`;
    }).join("");

    const fechaEncabezado = new Date().toLocaleDateString("es-CL", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Diario SMAN</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; background: white; font-family: 'Segoe UI', system-ui, sans-serif; color: #1E293B; }
  @page { margin: 10mm; size: letter; }
  @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  .actividad { page-break-before: always; }
  .actividad:first-child { page-break-before: avoid; }
</style>
</head>
<body>
  <div style="background:#1E293B;padding:12px 16px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="font-size:20px;">⚙️</div>
      <div>
        <div style="color:#F1F5F9;font-weight:800;font-size:15px;">Reporte Diario SMAN</div>
        <div style="color:#94A3B8;font-size:10px;">SM Cyclo Chile</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="color:#F1F5F9;font-size:10px;text-transform:capitalize;">${fechaEncabezado}</div>

    </div>
  </div>
  <div style="height:3px;background:#0EA5E9;margin-bottom:12px;"></div>
  ${actividadesHTML}
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;
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
              <div style={{ fontSize: 26 }}>⚙️</div>
              <div>
                <div style={S.topBarTitle}>Resumen del Reporte</div>
                <div style={S.topBarSub}>{actividades.length} actividad{actividades.length !== 1 ? "es" : ""} registrada{actividades.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>

          <div style={S.shareBar}>
            <button style={{ ...S.shareBtn, background: "#1E293B", color: "#fff", border: "none" }} onClick={handleExportPDF}>
              📄 Exportar PDF
            </button>
            <button style={S.shareBtn} onClick={() => setStep("form")}>← Editar</button>
          </div>

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
                  <div style={{ fontSize: 20 }}>⚙️</div>
                  <div>
                    <div style={S.previewCardBarTitle}>Turno {a.turno} — {a.linea}{nroLinea} — Actividad {i + 1}</div>
                    <div style={S.previewCardBarSub}>{fecha}</div>
                  </div>
                </div>
                <div style={S.previewCardMeta}>
                  {a.ran && <span style={{ ...S.metaChip, background: "#FEF3C7", color: "#92400E" }}>📋 RAN: {a.ran}</span>}
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
                      <div style={{ height: "100%", borderRadius: 99, width: `${avance}%`, background: avance === 100 ? "#10B981" : avance >= 60 ? "#F59E0B" : "#EF4444" }} />
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
                        background: t.estado === "finalizado" ? "#D1FAE5" : t.estado === "noaplica" ? "#F1F5F9" : "#FEF3C7",
                        color: t.estado === "finalizado" ? "#065F46" : t.estado === "noaplica" ? "#94A3B8" : "#92400E",
                      }}>
                        {t.estado === "finalizado" ? "✅" : t.estado === "noaplica" ? "N/A" : "⏳"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: t.estado === "noaplica" ? "#94A3B8" : "#1E293B" }}>{t.nombre}</span>
                        {t.notaPendiente && <div style={{ fontSize: 12, color: "#B45309", marginTop: 2 }}>{t.notaPendiente}</div>}
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

  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <div style={S.container}>
        <div style={S.topBar}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28 }}>⚙️</div>
              <div>
                <div style={S.topBarTitle}>Reporte de Turno</div>
                <div style={S.topBarSub}>Informe diario de actividades</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="file" accept=".json" style={{ display: "none" }} ref={importRef} onChange={importarJSON} />
              <button onClick={exportarJSON} style={S.clearBtn} title="Guardar como archivo">💾</button>
              <button onClick={() => importRef.current?.click()} style={S.clearBtn} title="Cargar archivo">📂</button>
              <button onClick={limpiarTodo} style={S.clearBtn} title="Nuevo reporte">🗑</button>
            </div>
          </div>
        </div>

        {actividades.map((a, i) => {
          const avance = calcAvance(a.tareas);
          return (
            <div key={a.id} style={S.section}>
              {/* Título */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={S.actCardNum}>#{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "#1E293B" }}>Actividad {i + 1}</div>
                {actividades.length > 1 && (
                  <button style={S.removeBtn} onClick={() => removeActividad(a.id)}>✕ Eliminar</button>
                )}
              </div>

              <div style={S.sectionLabel}>ENCABEZADO</div>

              {/* Fecha sola */}
              <div style={S.fieldGroup}>
                <label style={S.label}>Fecha</label>
                <input type="date" style={S.input} value={a.fecha}
                  onChange={e => updateActividad(a.id, "fecha", e.target.value)} />
              </div>

              {/* Línea + Turno */}
              <div style={S.row2}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Línea</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {LINEAS.map(l => (
                      <button key={l}
                        style={{
                          flex: 1, padding: "9px 4px", border: "1.5px solid #E2E8F0", borderRadius: 8,
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          background: a.linea === l ? (l === "Ensamble" ? "#0EA5E9" : "#8B5CF6") : "#F8FAFC",
                          color: a.linea === l ? "#fff" : "#64748B",
                          borderColor: a.linea === l ? (l === "Ensamble" ? "#0EA5E9" : "#8B5CF6") : "#E2E8F0",
                        }}
                        onClick={() => cambiarLinea(a.id, l)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Turno</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {TURNOS.map(t => (
                      <button key={t}
                        style={{
                          flex: 1, padding: "9px 4px", border: "1.5px solid #E2E8F0", borderRadius: 8,
                          fontSize: 13, fontWeight: 700, cursor: "pointer",
                          background: a.turno === t ? "#1E293B" : "#F8FAFC",
                          color: a.turno === t ? "#fff" : "#64748B",
                          borderColor: a.turno === t ? "#1E293B" : "#E2E8F0",
                        }}
                        onClick={() => updateActividad(a.id, "turno", t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* N° Línea */}
              <div style={{ ...S.fieldGroup, maxWidth: 180, marginBottom: 12 }}>
                <label style={S.label}>N° Línea</label>
                <input type="number" style={S.input} placeholder="Ej: 3"
                  value={a.nroLinea}
                  onChange={e => updateActividad(a.id, "nroLinea", e.target.value)} />
              </div>

              <div style={S.row2}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>RAN</label>
                  <input style={S.input} placeholder="Número de orden" value={a.ran}
                    onChange={e => updateActividad(a.id, "ran", e.target.value)} />
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Unidad / Equipo</label>
                  <input style={S.input} placeholder="Ej: Reductor #4" value={a.unidad}
                    onChange={e => updateActividad(a.id, "unidad", e.target.value)} />
                </div>
              </div>

              {/* Cliente */}
              <div style={S.fieldGroup}>
                <label style={S.label}>Cliente</label>
                <select style={S.select} value={a.cliente}
                  onChange={e => updateActividad(a.id, "cliente", e.target.value)}>
                  <option value="">— Seleccionar cliente —</option>
                  {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__manual__">Otro (escribir)</option>
                </select>
                {a.cliente === "__manual__" && (
                  <input style={{ ...S.input, marginTop: 6 }} placeholder="Nombre del cliente"
                    value={a.clienteManual}
                    onChange={e => updateActividad(a.id, "clienteManual", e.target.value)} />
                )}
              </div>

              <div style={S.row2}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Técnicos asignados</label>
                  <input style={S.input} placeholder="Ej: José, Alejandro, Francis" value={a.tecnicos}
                    onChange={e => updateActividad(a.id, "tecnicos", e.target.value)} />
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Supervisor</label>
                  <select style={S.select} value={a.supervisor}
                    onChange={e => updateActividad(a.id, "supervisor", e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {SUPERVISORES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__manual__">Otro (escribir)</option>
                  </select>
                  {a.supervisor === "__manual__" && (
                    <input style={{ ...S.input, marginTop: 6 }} placeholder="Nombre del supervisor"
                      value={a.supervisorManual}
                      onChange={e => updateActividad(a.id, "supervisorManual", e.target.value)} />
                  )}
                </div>
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Planificación</label>
                <select style={S.select} value={a.planificacion}
                  onChange={e => updateActividad(a.id, "planificacion", e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  <option value="Luis Cortés">Luis Cortés</option>
                  <option value="__manual__">Otro (escribir)</option>
                </select>
                {a.planificacion === "__manual__" && (
                  <input style={{ ...S.input, marginTop: 6 }} placeholder="Nombre"
                    value={a.planificacionManual}
                    onChange={e => updateActividad(a.id, "planificacionManual", e.target.value)} />
                )}
              </div>

              <div style={S.divider} />

              {/* TAREAS */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={S.sectionLabel}>ACTIVIDADES DEL TURNO</div>
                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: avance === 100 ? "#10B981" : avance >= 60 ? "#F59E0B" : "#64748B"
                }}>
                  {avance}%
                </div>
              </div>

              <div style={{ background: "#E2E8F0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 14 }}>
                <div style={{
                  height: "100%", borderRadius: 99, transition: "width 0.3s",
                  width: `${avance}%`,
                  background: avance === 100 ? "#10B981" : avance >= 60 ? "#F59E0B" : "#EF4444"
                }} />
              </div>

              {a.tareas.map((t) => (
                t.titulo ? (
                  <div key={t.id} style={S.tareaHeader}>
                    {t.nombre}
                  </div>
                ) : (
                <div key={t.id} style={S.tareaItem}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13, color: "#1E293B", lineHeight: 1.5, paddingTop: 2 }}>{t.nombre}</span>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {[
                        { val: "finalizado", label: "✓", colorOn: "#10B981", bgOn: "#D1FAE5" },
                        { val: "noaplica",   label: "N/A", colorOn: "#94A3B8", bgOn: "#F1F5F9" },
                        { val: "pendiente",  label: "⏳", colorOn: "#F59E0B", bgOn: "#FEF3C7" },
                      ].map(op => (
                        <button key={op.val}
                          style={{
                            padding: "4px 8px", borderRadius: 6, border: "1.5px solid",
                            fontSize: 11, fontWeight: 700, cursor: "pointer",
                            background: t.estado === op.val ? op.bgOn : "#F8FAFC",
                            color: t.estado === op.val ? op.colorOn : "#CBD5E1",
                            borderColor: t.estado === op.val ? op.colorOn : "#E2E8F0",
                          }}
                          onClick={() => updateTarea(a.id, t.id, "estado", op.val)}>
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {t.estado === "pendiente" && (
                    <input style={{ ...S.input, marginTop: 6, fontSize: 13 }}
                      placeholder="Detalle del pendiente..."
                      value={t.notaPendiente}
                      onChange={e => updateTarea(a.id, t.id, "notaPendiente", e.target.value)} />
                  )}
                </div>
                )
              ))}

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
              </div>
            </div>
          );
        })}

        <button style={S.addBtn} onClick={addActividad}>+ Agregar actividad</button>
        <button style={S.btnPrimary} onClick={() => setStep("preview")}>
          Ver resumen del reporte →
        </button>
      </div>
    </div>
  );
}

const S = {
  root: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 40 },
  container: { maxWidth: 680, margin: "0 auto", padding: "0 16px" },
  topBar: { background: "#1E293B", margin: "0 -16px 24px", padding: "18px 20px" },
  topBarTitle: { color: "#F1F5F9", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" },
  topBarSub: { color: "#94A3B8", fontSize: 13, marginTop: 1 },
  clearBtn: { background: "none", border: "1px solid #475569", color: "#94A3B8", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  section: { background: "#fff", borderRadius: 12, padding: "20px 18px", marginBottom: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 12 },
  divider: { height: 1, background: "#E2E8F0", margin: "16px 0 18px" },
  row2: { display: "flex", gap: 12 },
  fieldGroup: { flex: 1, marginBottom: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 },
  input: { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B", background: "#F8FAFC", boxSizing: "border-box", outline: "none" },
  textarea: { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B", background: "#F8FAFC", boxSizing: "border-box", minHeight: 72, resize: "vertical", outline: "none", fontFamily: "inherit" },
  select: { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B", background: "#F8FAFC", boxSizing: "border-box" },
  actCardNum: { background: "#1E293B", color: "#fff", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  removeBtn: { background: "none", border: "1px solid #FCA5A5", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 10px", borderRadius: 6 },
  tareaItem: { marginBottom: 6, padding: "8px 10px", background: "#FAFAFA", borderRadius: 8, border: "1px solid #F1F5F9" },
  tareaHeader: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "#1E293B", background: "#E2E8F0", padding: "6px 10px", borderRadius: 6, marginBottom: 6, marginTop: 10, textTransform: "uppercase" },
  addBtn: { width: "100%", padding: "13px", border: "2px dashed #CBD5E1", borderRadius: 10, background: "none", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12 },
  btnPrimary: { width: "100%", padding: "14px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" },
  shareBar: { display: "flex", gap: 8, margin: "16px 0 20px" },
  shareBtn: { flex: 1, padding: "11px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#1E293B", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  previewCard: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 20, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  previewCardTopBar: { background: "#1E293B", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 },
  previewCardBarTitle: { color: "#F1F5F9", fontWeight: 700, fontSize: 15 },
  previewCardBarSub: { color: "#94A3B8", fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  previewCardMeta: { display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" },
  previewCardBody: { padding: "14px 16px" },
  metaChip: { borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 },
  previewLabel: { fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6, letterSpacing: "0.04em" },
  avancePct: { fontSize: 13, fontWeight: 700, color: "#1E293B", minWidth: 38, textAlign: "right" },
  obsBox: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569" },
  fotoPreviewGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  fotoPreviewWrap: { width: 90, height: 90 },
  fotoPreviewImg: { width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #E2E8F0" },
  fotoBtn: { padding: "9px 12px", border: "1.5px dashed #94A3B8", borderRadius: 8, background: "#F8FAFC", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  fotoGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  fotoThumbWrap: { position: "relative", width: 80, height: 80 },
  fotoThumb: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1.5px solid #E2E8F0" },
  fotoRemove: { position: "absolute", top: -6, right: -6, background: "#EF4444", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};
