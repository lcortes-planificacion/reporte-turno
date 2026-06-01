import { useState, useRef } from 'react';

const TURNOS = ['A', 'B', 'C'];
const ESTADOS = [
  { label: 'En Proceso', color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Completado', color: '#10B981', bg: '#D1FAE5' },
  { label: 'Bloqueado', color: '#EF4444', bg: '#FEE2E2' },
  { label: 'Pendiente', color: '#6B7280', bg: '#F3F4F6' },
];

const defaultActividad = () => ({
  id: Date.now() + Math.random(),
  // Encabezado propio
  fecha: new Date().toISOString().split('T')[0],
  turno: 'B',
  ran: '',
  unidad: '',
  cliente: '',
  tecnicos: '',
  supervisor: '',
  // Actividad
  tareasRealizadas: [{ id: Date.now() + Math.random(), texto: '' }],
  tareasPendientes: '',
  avance: 100,
  estado: 'Completado',
  observaciones: '',
  fotos: [],
});

const estadoObj = (label) =>
  ESTADOS.find((e) => e.label === label) || ESTADOS[3];

export default function ReporteTurno() {
  const [step, setStep] = useState('form');
  const [actividades, setActividades] = useState([defaultActividad()]);
  const cameraRefs = useRef({});
  const galleryRefs = useRef({});

  const addActividad = () => setActividades((p) => [...p, defaultActividad()]);
  const removeActividad = (id) =>
    setActividades((p) => p.filter((a) => a.id !== id));
  const updateActividad = (id, field, value) =>
    setActividades((p) =>
      p.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );

  const addTarea = (actId) =>
    setActividades((p) =>
      p.map((a) =>
        a.id === actId
          ? {
              ...a,
              tareasRealizadas: [
                ...a.tareasRealizadas,
                { id: Date.now() + Math.random(), texto: '' },
              ],
            }
          : a
      )
    );
  const updateTarea = (actId, tareaId, texto) =>
    setActividades((p) =>
      p.map((a) =>
        a.id === actId
          ? {
              ...a,
              tareasRealizadas: a.tareasRealizadas.map((t) =>
                t.id === tareaId ? { ...t, texto } : t
              ),
            }
          : a
      )
    );
  const removeTarea = (actId, tareaId) =>
    setActividades((p) =>
      p.map((a) =>
        a.id === actId
          ? {
              ...a,
              tareasRealizadas: a.tareasRealizadas.filter(
                (t) => t.id !== tareaId
              ),
            }
          : a
      )
    );

  const handleFotos = (id, files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setActividades((p) =>
          p.map((a) =>
            a.id === id
              ? {
                  ...a,
                  fotos: [
                    ...(a.fotos || []),
                    { dataUrl: e.target.result, name: file.name },
                  ],
                }
              : a
          )
        );
      reader.readAsDataURL(file);
    });
  };
  const removeFoto = (actId, idx) =>
    setActividades((p) =>
      p.map((a) =>
        a.id === actId
          ? { ...a, fotos: a.fotos.filter((_, i) => i !== idx) }
          : a
      )
    );

  // ── PDF ──────────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const actividadesHTML = actividades
      .map((a, i) => {
        const est = estadoObj(a.estado);
        const tareasOk = a.tareasRealizadas.filter((t) => t.texto.trim());
        const fecha = new Date(a.fecha + 'T12:00:00').toLocaleDateString(
          'es-CL',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        );
        const fotosHTML = a.fotos?.length
          ? `
        <div style="margin-top:12px;">
          <div style="font-size:11px;font-weight:700;color:#64748B;margin-bottom:6px;">FOTOS DE EVIDENCIA</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${a.fotos
              .map(
                (f) =>
                  `<img src="${f.dataUrl}" style="width:160px;height:120px;object-fit:cover;border-radius:6px;border:1px solid #E2E8F0;" />`
              )
              .join('')}
          </div>
        </div>`
          : '';

        return `
        <div style="border:1px solid #E2E8F0;border-radius:12px;margin-bottom:24px;overflow:hidden;page-break-inside:avoid;">
          
          <!-- Encabezado de actividad -->
          <div style="background:#1E293B;padding:16px 20px;display:flex;align-items:center;gap:14px;">
            <div style="font-size:24px;">⚙️</div>
            <div>
              <div style="color:#F1F5F9;font-weight:800;font-size:16px;">Reporte de Turno ${
                a.turno
              } — Actividad ${i + 1}</div>
              <div style="color:#94A3B8;font-size:12px;text-transform:capitalize;margin-top:2px;">${fecha}</div>
            </div>
          </div>

          <!-- Datos del encabezado -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#E2E8F0;">
            ${
              a.ran
                ? `<div style="background:#FEF9C3;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#92400E;">RAN</div><div style="font-size:13px;font-weight:600;color:#78350F;">${a.ran}</div></div>`
                : ''
            }
            ${
              a.unidad
                ? `<div style="background:#EFF6FF;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#1D4ED8;">UNIDAD / EQUIPO</div><div style="font-size:13px;font-weight:600;color:#1E40AF;">${a.unidad}</div></div>`
                : ''
            }
            ${
              a.cliente
                ? `<div style="background:#F3E8FF;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#6B21A8;">CLIENTE</div><div style="font-size:13px;font-weight:600;color:#581C87;">${a.cliente}</div></div>`
                : ''
            }
            ${
              a.tecnicos
                ? `<div style="background:#F0FDF4;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#166534;">TÉCNICOS</div><div style="font-size:13px;font-weight:600;color:#14532D;">${a.tecnicos}</div></div>`
                : ''
            }
            ${
              a.supervisor
                ? `<div style="background:#F8FAFC;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#475569;">SUPERVISOR</div><div style="font-size:13px;font-weight:600;color:#1E293B;">${a.supervisor}</div></div>`
                : ''
            }
          </div>

          <!-- Contenido actividad -->
          <div style="padding:16px 20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div style="font-size:11px;font-weight:700;color:#64748B;letter-spacing:0.06em;">ACTIVIDAD DEL TURNO</div>
              <span style="background:${est.bg};color:${
          est.color
        };border-radius:20px;padding:3px 12px;font-size:12px;font-weight:700;">${
          a.estado
        }</span>
            </div>

            ${
              tareasOk.length
                ? `
              <div style="margin-bottom:12px;">
                <div style="font-size:11px;font-weight:700;color:#64748B;margin-bottom:6px;">TAREAS REALIZADAS</div>
                ${tareasOk
                  .map(
                    (t, ti) => `
                  <div style="display:flex;gap:8px;margin-bottom:6px;align-items:flex-start;">
                    <span style="background:#E2E8F0;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#475569;flex-shrink:0;">${
                      ti + 1
                    }</span>
                    <span style="font-size:13px;color:#1E293B;line-height:1.4;">${
                      t.texto
                    }</span>
                  </div>`
                  )
                  .join('')}
              </div>`
                : ''
            }

            ${
              a.tareasPendientes
                ? `
              <div style="margin-bottom:12px;">
                <div style="font-size:11px;font-weight:700;color:#64748B;margin-bottom:4px;">PENDIENTES</div>
                <div style="font-size:13px;color:#B45309;background:#FFFBEB;border-radius:6px;padding:8px 12px;">${a.tareasPendientes}</div>
              </div>`
                : ''
            }

            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
              <div style="font-size:11px;font-weight:700;color:#64748B;min-width:70px;">AVANCE</div>
              <div style="flex:1;background:#E2E8F0;border-radius:99px;height:10px;overflow:hidden;">
                <div style="height:100%;border-radius:99px;width:${
                  a.avance
                }%;background:${
          a.avance === 100 ? '#10B981' : a.avance >= 60 ? '#F59E0B' : '#EF4444'
        };"></div>
              </div>
              <span style="font-size:14px;font-weight:800;color:#1E293B;min-width:40px;text-align:right;">${
                a.avance
              }%</span>
            </div>

            ${
              a.observaciones
                ? `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px 12px;font-size:13px;color:#475569;">📝 ${a.observaciones}</div>`
                : ''
            }
            ${fotosHTML}
          </div>
        </div>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte de Turno</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: white; color: #1E293B; padding: 28px; max-width: 820px; margin: 0 auto; }
  @media print { body { padding: 12px; } }
</style>
</head>
<body>
  ${actividadesHTML}
  <div style="text-align:center;color:#94A3B8;font-size:11px;margin-top:16px;padding-top:12px;border-top:1px solid #E2E8F0;">
    Reporte generado el ${new Date().toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}
  </div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  // ── PREVIEW ──────────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div style={S.root}>
        <div style={S.container}>
          <div style={S.topBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26 }}>⚙️</div>
              <div>
                <div style={S.topBarTitle}>Resumen del Reporte</div>
                <div style={S.topBarSub}>
                  {actividades.length} actividad
                  {actividades.length !== 1 ? 'es' : ''} registrada
                  {actividades.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          <div style={S.shareBar}>
            <button
              style={{
                ...S.shareBtn,
                background: '#1E293B',
                color: '#fff',
                border: 'none',
              }}
              onClick={handleExportPDF}
            >
              📄 Exportar PDF
            </button>
            <button style={S.shareBtn} onClick={() => setStep('form')}>
              ← Editar
            </button>
          </div>

          {actividades.map((a, i) => {
            const est = estadoObj(a.estado);
            const tareasOk = a.tareasRealizadas.filter((t) => t.texto.trim());
            const fecha = new Date(a.fecha + 'T12:00:00').toLocaleDateString(
              'es-CL',
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }
            );
            return (
              <div key={a.id} style={S.previewCard}>
                {/* Encabezado de cada actividad */}
                <div style={S.previewCardTopBar}>
                  <div style={{ fontSize: 20 }}>⚙️</div>
                  <div>
                    <div style={S.previewCardBarTitle}>
                      Turno {a.turno} — Actividad {i + 1}
                    </div>
                    <div style={S.previewCardBarSub}>{fecha}</div>
                  </div>
                </div>

                <div style={S.previewCardMeta}>
                  {a.ran && (
                    <span
                      style={{
                        ...S.metaChip,
                        background: '#FEF3C7',
                        color: '#92400E',
                      }}
                    >
                      📋 RAN: {a.ran}
                    </span>
                  )}
                  {a.unidad && (
                    <span
                      style={{
                        ...S.metaChip,
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                      }}
                    >
                      🔧 {a.unidad}
                    </span>
                  )}
                  {a.cliente && (
                    <span
                      style={{
                        ...S.metaChip,
                        background: '#F3E8FF',
                        color: '#6B21A8',
                      }}
                    >
                      🏢 {a.cliente}
                    </span>
                  )}
                  {a.tecnicos && (
                    <span
                      style={{
                        ...S.metaChip,
                        background: '#F0FDF4',
                        color: '#166534',
                      }}
                    >
                      👷 {a.tecnicos}
                    </span>
                  )}
                  {a.supervisor && (
                    <span
                      style={{
                        ...S.metaChip,
                        background: '#F8FAFC',
                        color: '#334155',
                      }}
                    >
                      👤 {a.supervisor}
                    </span>
                  )}
                </div>

                <div style={S.previewCardBody}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <div style={S.sectionLabel}>ACTIVIDAD DEL TURNO</div>
                    <span
                      style={{
                        ...S.estadoBadge,
                        color: est.color,
                        background: est.bg,
                      }}
                    >
                      {a.estado}
                    </span>
                  </div>

                  {tareasOk.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={S.previewLabel}>Tareas realizadas</div>
                      {tareasOk.map((t, ti) => (
                        <div key={t.id} style={S.tareaPreviewItem}>
                          <span style={S.tareaNum}>{ti + 1}</span>
                          <span style={S.previewValue}>{t.texto}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {a.tareasPendientes && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={S.previewLabel}>Pendientes</div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#B45309',
                          background: '#FFFBEB',
                          borderRadius: 6,
                          padding: '6px 10px',
                        }}
                      >
                        {a.tareasPendientes}
                      </div>
                    </div>
                  )}

                  <div style={S.avanceRow}>
                    <span style={S.previewLabel}>Avance</span>
                    <div style={S.avanceBarWrap}>
                      <div style={S.avanceBarBg}>
                        <div
                          style={{
                            ...S.avanceBarFill,
                            width: `${a.avance}%`,
                            background:
                              a.avance === 100
                                ? '#10B981'
                                : a.avance >= 60
                                ? '#F59E0B'
                                : '#EF4444',
                          }}
                        />
                      </div>
                      <span style={S.avancePct}>{a.avance}%</span>
                    </div>
                  </div>

                  {a.observaciones && (
                    <div style={S.obsBox}>📝 {a.observaciones}</div>
                  )}

                  {a.fotos?.length > 0 && (
                    <div style={S.fotoPreviewGrid}>
                      {a.fotos.map((f, fi) => (
                        <div key={fi} style={S.fotoPreviewWrap}>
                          <img
                            src={f.dataUrl}
                            alt={f.name}
                            style={S.fotoPreviewImg}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div style={S.previewFooter}>
            Reporte generado el{' '}
            {new Date().toLocaleString('es-CL', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <div style={S.container}>
        <div style={S.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>⚙️</div>
            <div>
              <div style={S.topBarTitle}>Reporte de Turno</div>
              <div style={S.topBarSub}>Informe diario de actividades</div>
            </div>
          </div>
        </div>

        {actividades.map((a, i) => (
          <div key={a.id} style={S.section}>
            {/* Título de actividad */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={S.actCardNum}>#{i + 1}</div>
              <div
                style={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#1E293B',
                }}
              >
                Actividad {i + 1}
              </div>
              {actividades.length > 1 && (
                <button
                  style={S.removeBtn}
                  onClick={() => removeActividad(a.id)}
                >
                  ✕ Eliminar
                </button>
              )}
            </div>

            {/* ENCABEZADO PROPIO */}
            <div style={S.sectionLabel}>ENCABEZADO</div>

            <div style={S.row2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Fecha</label>
                <input
                  type="date"
                  style={S.input}
                  value={a.fecha}
                  onChange={(e) =>
                    updateActividad(a.id, 'fecha', e.target.value)
                  }
                />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Turno</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TURNOS.map((t) => (
                    <button
                      key={t}
                      style={{
                        ...S.turnoBtn,
                        ...(a.turno === t ? S.turnoBtnActive : {}),
                      }}
                      onClick={() => updateActividad(a.id, 'turno', t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={S.row2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>RAN</label>
                <input
                  style={S.input}
                  placeholder="Número de orden"
                  value={a.ran}
                  onChange={(e) => updateActividad(a.id, 'ran', e.target.value)}
                />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Unidad / Equipo</label>
                <input
                  style={S.input}
                  placeholder="Ej: Reductor #4"
                  value={a.unidad}
                  onChange={(e) =>
                    updateActividad(a.id, 'unidad', e.target.value)
                  }
                />
              </div>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Cliente</label>
              <input
                style={S.input}
                placeholder="Nombre del cliente"
                value={a.cliente}
                onChange={(e) =>
                  updateActividad(a.id, 'cliente', e.target.value)
                }
              />
            </div>

            <div style={S.row2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Técnicos asignados</label>
                <input
                  style={S.input}
                  placeholder="Ej: José, Alejandro, Francis"
                  value={a.tecnicos}
                  onChange={(e) =>
                    updateActividad(a.id, 'tecnicos', e.target.value)
                  }
                />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Supervisor</label>
                <input
                  style={S.input}
                  placeholder="Nombre del supervisor"
                  value={a.supervisor}
                  onChange={(e) =>
                    updateActividad(a.id, 'supervisor', e.target.value)
                  }
                />
              </div>
            </div>

            <div style={S.divider} />

            {/* ACTIVIDAD */}
            <div style={S.sectionLabel}>ACTIVIDAD DEL TURNO</div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Tareas realizadas</label>
              {a.tareasRealizadas.map((t, ti) => (
                <div key={t.id} style={S.tareaRow}>
                  <span style={S.tareaRowNum}>{ti + 1}</span>
                  <input
                    style={{ ...S.input, flex: 1 }}
                    placeholder={`Tarea ${ti + 1}...`}
                    value={t.texto}
                    onChange={(e) => updateTarea(a.id, t.id, e.target.value)}
                  />
                  {a.tareasRealizadas.length > 1 && (
                    <button
                      style={S.tareaRemoveBtn}
                      onClick={() => removeTarea(a.id, t.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button style={S.addTareaBtn} onClick={() => addTarea(a.id)}>
                + Agregar tarea
              </button>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Tareas pendientes</label>
              <textarea
                style={{ ...S.textarea, borderColor: '#FCD34D' }}
                placeholder="Actividades que quedan para el siguiente turno..."
                value={a.tareasPendientes}
                onChange={(e) =>
                  updateActividad(a.id, 'tareasPendientes', e.target.value)
                }
              />
            </div>

            <div style={S.row2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Estado</label>
                <select
                  style={S.select}
                  value={a.estado}
                  onChange={(e) =>
                    updateActividad(a.id, 'estado', e.target.value)
                  }
                >
                  {ESTADOS.map((e) => (
                    <option key={e.label}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Avance: {a.avance}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  style={S.range}
                  value={a.avance}
                  onChange={(e) =>
                    updateActividad(a.id, 'avance', Number(e.target.value))
                  }
                />
                <div style={S.avanceBarBg}>
                  <div
                    style={{
                      ...S.avanceBarFill,
                      width: `${a.avance}%`,
                      background:
                        a.avance === 100
                          ? '#10B981'
                          : a.avance >= 60
                          ? '#F59E0B'
                          : '#EF4444',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Observaciones</label>
              <textarea
                style={S.textarea}
                placeholder="Notas adicionales, alertas..."
                value={a.observaciones}
                onChange={(e) =>
                  updateActividad(a.id, 'observaciones', e.target.value)
                }
              />
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>📷 Fotos evidencia</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                style={{ display: 'none' }}
                ref={(el) => (cameraRefs.current[a.id] = el)}
                onChange={(e) => {
                  handleFotos(a.id, e.target.files);
                  e.target.value = '';
                }}
              />
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                ref={(el) => (galleryRefs.current[a.id] = el)}
                onChange={(e) => {
                  handleFotos(a.id, e.target.files);
                  e.target.value = '';
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ ...S.fotoBtn, flex: 1 }}
                  onClick={() => cameraRefs.current[a.id]?.click()}
                >
                  📷 Tomar foto
                </button>
                <button
                  style={{ ...S.fotoBtn, flex: 1 }}
                  onClick={() => galleryRefs.current[a.id]?.click()}
                >
                  🖼️ Galería
                </button>
              </div>
              {a.fotos?.length > 0 && (
                <div style={S.fotoGrid}>
                  {a.fotos.map((f, fi) => (
                    <div key={fi} style={S.fotoThumbWrap}>
                      <img src={f.dataUrl} alt={f.name} style={S.fotoThumb} />
                      <button
                        style={S.fotoRemove}
                        onClick={() => removeFoto(a.id, fi)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <button style={S.addBtn} onClick={addActividad}>
          + Agregar actividad
        </button>

        <button style={S.btnPrimary} onClick={() => setStep('preview')}>
          Ver resumen del reporte →
        </button>
      </div>
    </div>
  );
}

const S = {
  root: {
    minHeight: '100vh',
    background: '#F8FAFC',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    paddingBottom: 40,
  },
  container: { maxWidth: 680, margin: '0 auto', padding: '0 16px' },
  topBar: {
    background: '#1E293B',
    margin: '0 -16px 24px',
    padding: '18px 20px',
  },
  topBarTitle: {
    color: '#F1F5F9',
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: '-0.3px',
  },
  topBarSub: { color: '#94A3B8', fontSize: 13, marginTop: 1 },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 18px',
    marginBottom: 16,
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#64748B',
    marginBottom: 12,
  },
  divider: { height: 1, background: '#E2E8F0', margin: '16px 0 18px' },
  row2: { display: 'flex', gap: 12 },
  fieldGroup: { flex: 1, marginBottom: 14 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 14,
    color: '#1E293B',
    background: '#F8FAFC',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 14,
    color: '#1E293B',
    background: '#F8FAFC',
    boxSizing: 'border-box',
    minHeight: 72,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 14,
    color: '#1E293B',
    background: '#F8FAFC',
    boxSizing: 'border-box',
  },
  range: { width: '100%', margin: '6px 0 6px' },
  turnoBtn: {
    width: 44,
    height: 38,
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    background: '#F8FAFC',
    color: '#64748B',
    cursor: 'pointer',
  },
  turnoBtnActive: {
    background: '#1E293B',
    color: '#fff',
    borderColor: '#1E293B',
  },
  actCardNum: {
    background: '#1E293B',
    color: '#fff',
    borderRadius: 6,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  removeBtn: {
    background: 'none',
    border: '1px solid #FCA5A5',
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 6,
  },
  tareaRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  tareaRowNum: {
    width: 22,
    height: 22,
    background: '#E2E8F0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    flexShrink: 0,
  },
  tareaRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: 14,
    cursor: 'pointer',
    padding: '0 4px',
    flexShrink: 0,
  },
  addTareaBtn: {
    padding: '6px 14px',
    border: '1.5px dashed #CBD5E1',
    borderRadius: 6,
    background: 'none',
    color: '#64748B',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 2,
  },
  addBtn: {
    width: '100%',
    padding: '13px',
    border: '2px dashed #CBD5E1',
    borderRadius: 10,
    background: 'none',
    color: '#475569',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 12,
  },
  btnPrimary: {
    width: '100%',
    padding: '14px',
    background: '#1E293B',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
  },
  shareBar: { display: 'flex', gap: 8, margin: '16px 0 20px' },
  shareBtn: {
    flex: 1,
    padding: '11px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    background: '#fff',
    color: '#1E293B',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  // Preview
  previewCard: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  previewCardTopBar: {
    background: '#1E293B',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  previewCardBarTitle: { color: '#F1F5F9', fontWeight: 700, fontSize: 15 },
  previewCardBarSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  previewCardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '12px 16px',
    borderBottom: '1px solid #F1F5F9',
    background: '#FAFAFA',
  },
  previewCardBody: { padding: '14px 16px' },
  metaChip: {
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 12,
    fontWeight: 600,
  },
  estadoBadge: {
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 12,
    fontWeight: 600,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: '0.04em',
  },
  previewValue: { fontSize: 13, color: '#1E293B', flex: 1 },
  tareaPreviewItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  tareaNum: {
    width: 20,
    height: 20,
    background: '#E2E8F0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    flexShrink: 0,
    marginTop: 1,
  },
  avanceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  avanceBarWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: 8 },
  avancePct: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1E293B',
    minWidth: 38,
    textAlign: 'right',
  },
  avanceBarBg: {
    height: 8,
    background: '#E2E8F0',
    borderRadius: 99,
    overflow: 'hidden',
    flex: 1,
  },
  avanceBarFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.3s ease',
  },
  obsBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  fotoPreviewGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  fotoPreviewWrap: { width: 90, height: 90 },
  fotoPreviewImg: {
    width: 90,
    height: 90,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
  },
  previewFooter: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    margin: '8px 0 16px',
  },
  fotoBtn: {
    padding: '9px 12px',
    border: '1.5px dashed #94A3B8',
    borderRadius: 8,
    background: '#F8FAFC',
    color: '#475569',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  fotoGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  fotoThumbWrap: { position: 'relative', width: 80, height: 80 },
  fotoThumb: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1.5px solid #E2E8F0',
  },
  fotoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 20,
    height: 20,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
