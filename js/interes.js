/* Registro de interés en cursos de verano.
   Solo devuelve ok:true si el servidor confirma el guardado con {"ok": true}.
   Sin endpoint, NO simula un envío exitoso. */
window.UCL = window.UCL || {};
UCL.enviarInteres = async function (payload) {
  const endpoint = UCL.config.interes && UCL.config.interes.endpoint;
  if (!endpoint) return { ok: false, motivo: 'integracion_pendiente' };
  try {
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) return { ok: false, motivo: 'http_' + r.status };
    const j = await r.json().catch(() => null);
    return j && j.ok === true ? { ok: true } : { ok: false, motivo: 'sin_confirmacion' };
  } catch (e) {
    return { ok: false, motivo: 'red' };
  }
};
