/* =====================================================================
   Configuración del piloto. Todo lo que está en null queda "pendiente"
   y la interfaz lo muestra así, sin inventar datos.
   ===================================================================== */
window.UCL = window.UCL || {};
UCL.config = {
  // true: usa la carrera de demostración si no hay datos oficiales cargados.
  // Poner en false antes de publicar con datos oficiales.
  mostrarEjemplos: true,

  marca: {
    logoUrl: 'https://adistancia.ucontinental.edu.pe/assets/img/logo.svg',   // null para mostrar el nombre en texto
    logoPieUrl: 'https://ucontinental.edu.pe/site/wp-content/themes/salient-child/img/logo.svg',
    iconosBase: 'https://adistancia.ucontinental.edu.pe/assets/img/'
  },

  limites: { creditosSemestre: 25, creditosVerano: 11 },

  calendario: {
    registroInteres: null,        // p. ej. 'Del 2 al 20 de noviembre de 2026'
    matriculaVerano: null,        // p. ej. 'Se publicará en el calendario académico'
    horarioVerano: 'Los cursos de verano mantienen el mismo rango horario de los semestres regulares.'
  },

  // Registro de interés en cursos de verano (POST JSON).
  // Solo se considera guardado si responde 2xx con { "ok": true }.
  interes: {
    endpoint: null,               // p. ej. 'https://universidadcontinental.app.n8n.cloud/webhook/interes-verano'
    dominioCorreo: '@continental.edu.pe',
    politicaPrivacidadUrl: null
  },

  // Eventos de uso: se envían a window.dataLayer y, si hay endpoint, por sendBeacon.
  analitica: { prefijo: 'rfe_', endpoint: null, debug: false },

  // Contacto general para pagos, matrícula, accesos y plataforma.
  acompanamiento: { nombre: 'Acompañamiento al estudiante', canal: null, enlace: null, horario: null },

  enlaces: {
    portalEstudiante: 'https://estudiantes.ucontinental.edu.pe/',
    modalidad: 'https://adistancia.ucontinental.edu.pe/'
  }
};
