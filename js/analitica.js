/* Eventos de uso. Se envían a window.dataLayer (Google Tag Manager u otra
   herramienta) y, si hay endpoint configurado, por navigator.sendBeacon.
   Nunca se envían datos personales ni porcentajes de elegibilidad. */
window.UCL = window.UCL || {};
UCL.evento = function (nombre, datos) {
  const cfg = UCL.config.analitica || {};
  const ev = Object.assign({ event: (cfg.prefijo || '') + nombre, fecha: new Date().toISOString(), fuenteDatos: UCL.datos ? UCL.datos.fuente : null }, datos || {});
  (window.dataLayer = window.dataLayer || []).push(ev);
  if (cfg.endpoint && navigator.sendBeacon) {
    try { navigator.sendBeacon(cfg.endpoint, new Blob([JSON.stringify(ev)], { type: 'application/json' })); } catch (e) { /* sin analítica */ }
  }
  if (cfg.debug) console.log('[evento]', ev);
};
