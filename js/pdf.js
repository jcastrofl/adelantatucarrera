/* PDF "Descargar este plan" (A4, jsPDF). Incluye el aviso oficial y,
   si los datos son de demostración, una franja en cada página. */
window.UCL = window.UCL || {};
UCL.descargarPlan = function ({ datos, carrera, ruta, interes }) {
  if (!window.jspdf || !window.jspdf.jsPDF) { alert('No se pudo cargar el generador de PDF. Revisa tu conexión e inténtalo de nuevo.'); return false; }
  const M = UCL.modelo, T = UCL.textos, cfg = UCL.config;
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, MX = 16, ANCHO = W - MX * 2, ALTO = 297;
  const demo = datos.fuente !== 'oficial';
  let y = 0;

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const hoy = new Date(); const fechaTxt = `${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}`;

  function franjaDemo() {
    if (!demo) return;
    doc.setFillColor(253, 226, 253); doc.rect(0, ALTO - 22, W, 8, 'F');
    doc.setTextColor(90, 12, 90); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    doc.text('DEMOSTRACIÓN: opciones y datos de ejemplo. No es información académica oficial.', W / 2, ALTO - 16.8, { align: 'center' });
  }
  function nuevaPagina() { doc.addPage(); y = 18; franjaDemo(); }
  function espacio(h) { if (y + h > ALTO - 26) nuevaPagina(); }
  function titulo(t) { espacio(12); y += 3; doc.setTextColor(75, 0, 135); doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); doc.text(t, MX, y); y += 6.5; }
  function parrafo(t, tam = 9.5, color = [40, 36, 52], negrita = false) {
    doc.setFont('helvetica', negrita ? 'bold' : 'normal'); doc.setFontSize(tam); doc.setTextColor(...color);
    doc.splitTextToSize(t, ANCHO).forEach((l) => { espacio(5); doc.text(l, MX, y); y += tam * 0.47; });
    y += 1.5;
  }
  function recuadro(t, fondo, borde) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.2);
    const lineas = doc.splitTextToSize(t, ANCHO - 10); const h = lineas.length * 4.4 + 7;
    espacio(h + 2);
    doc.setFillColor(...fondo); doc.setDrawColor(...borde); doc.roundedRect(MX, y, ANCHO, h, 2.5, 2.5, 'FD');
    doc.setTextColor(40, 36, 52); lineas.forEach((l, i) => doc.text(l, MX + 5, y + 6 + i * 4.4));
    y += h + 4;
  }

  // Encabezado
  doc.setFillColor(18, 12, 28); doc.rect(0, 0, W, 34, 'F');
  doc.setFillColor(106, 0, 190); doc.rect(0, 34, W, 1.6, 'F');
  doc.setTextColor(217, 194, 240); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text('Universidad Continental · Modalidad A Distancia', MX, 11);
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text(doc.splitTextToSize('Plan de cursos: ' + ruta.nombre, ANCHO)[0], MX, 21);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(233, 225, 243);
  doc.text(fechaTxt, MX, 28.5);
  franjaDemo();
  y = 45;

  // Datos generales y resumen
  const cul = M.culminacion(ruta);
  const claves = M.cursosClave(datos, carrera.id);
  titulo('Datos generales');
  parrafo(`Carrera: ${carrera.nombre}\nPlan de estudios: ${carrera.planEstudios || 'Por confirmar'}\nOpción: ${ruta.nombre} (${ruta.id})`);
  titulo('Resumen de la opción');
  parrafo(`Veranos: ${(ruta.veranos || []).length ? ruta.veranos.map((v) => 'verano ' + v).join(', ') : 'ninguno'}\n` +
          `Carga referencial por semestre: ${ruta.cargaReferencial ? ruta.cargaReferencial + ' créditos' : 'por confirmar'}\n` +
          `Culminación referencial del plan: ${cul.largo}\n` +
          `Cursos en verano: ${M.cursosEnVerano(ruta)}\n` +
          `Cursos clave: ${claves.length ? claves.map((c) => c.nombre).join(', ') : 'por confirmar'}`);
  recuadro(T.avisoPlan, [243, 236, 251], [217, 194, 240]);
  if (carrera.origenDatos) recuadro(carrera.origenDatos, [253, 226, 253], [240, 190, 240]);

  // Secuencia por año
  titulo('Secuencia de semestres y veranos');
  const porAnio = {};
  ruta.periodos.forEach((p) => { (porAnio[M.anioDe(p)] ||= []).push(p); });
  Object.keys(porAnio).sort((a, b) => a - b).forEach((anio) => {
    espacio(10); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(18, 12, 28);
    doc.text('Año ' + anio, MX, y); y += 5.5;
    porAnio[anio].forEach((p) => {
      const cr = M.creditos(datos, carrera.id, p.cursos);
      const max = p.tipo === 'verano' ? cfg.limites.creditosVerano : cfg.limites.creditosSemestre;
      espacio(14);
      doc.setFillColor(p.tipo === 'verano' ? 225 : 246, p.tipo === 'verano' ? 241 : 242, p.tipo === 'verano' ? 252 : 250);
      doc.rect(MX, y - 3.8, ANCHO, 5.6, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(40, 36, 52);
      doc.text(`${M.etiquetaPeriodo(p)} · ${(p.cursos || []).length} cursos · ${cr} de ${max} créditos`, MX + 2, y); y += 5.5;
      if (!(p.cursos || []).length) { parrafo('Sin cursos en este periodo.', 9, [90, 81, 112]); return; }
      (p.cursos || []).forEach((k) => {
        const c = M.getCurso(datos, carrera.id, k);
        const etiquetas = [];
        if (c.clave) etiquetas.push('Curso clave');
        if (c.electivo) etiquetas.push('Electivo');
        if (p.tipo === 'verano') etiquetas.push(T.estadosOferta[M.estadoOferta(datos, carrera.id, k, p)]);
        if (interes && interes.has(k)) etiquetas.push('Me interesa llevarlo');
        espacio(5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 36, 52);
        doc.text(doc.splitTextToSize(c.codigoInterno ? c.nombre : `${c.codigo}   ${c.nombre}`, 108)[0], MX + 4, y);
        doc.text(`${c.creditos} cr.`, MX + 118, y);
        if (etiquetas.length) { doc.setTextColor(90, 0, 163); doc.setFontSize(8); doc.text(etiquetas.join(' · '), MX + 134, y); }
        y += 4.6;
      });
      y += 1.5;
    });
  });

  // Condiciones, cursos clave y siguientes pasos
  if ((ruta.condiciones || []).length || (ruta.restricciones || []).length) {
    titulo('Condiciones de esta opción');
    [...(ruta.condiciones || []), ...(ruta.restricciones || [])].forEach((t) => parrafo('· ' + t));
  }
  if (claves.length) {
    titulo('Tus cursos clave');
    claves.forEach((c) => {
      const p = M.periodoDeCurso(ruta, c.codigo);
      parrafo(`${c.nombre}${c.codigoInterno ? '' : ' (' + c.codigo + ')'}: habilita ${c.dependientes.length} asignaturas posteriores. En esta opción se lleva en ${p ? M.etiquetaPeriodo(p) : 'un periodo por confirmar'}.`, 9.5, [40, 36, 52]);
    });
    parrafo(T.cursoClave.explicacion, 9, [90, 81, 112]);
  }
  titulo('Cómo se construyeron las opciones');
  parrafo(T.duracion.supuestos, 9, [90, 81, 112]);
  titulo('Siguiente paso');
  parrafo('1. Si te interesa algún curso de verano, registra tu interés en la página. No es una matrícula.\n2. Revisa los requisitos: pagos al día, prerrequisitos aprobados y carga dentro del máximo.\n3. Matricúlate en el portal en las fechas oficiales. Ahí verás qué cursos se abrieron.');
  const ct = carrera.contacto;
  parrafo('Consultas sobre tu avance: ' + (ct && ct.nombre ? `${ct.nombre}${ct.cargo ? ', ' + ct.cargo : ''}${ct.canal ? ' · ' + ct.canal : ''}` : 'contacto pendiente de actualización.'), 9.5, [40, 36, 52], true);

  // Pie con numeración
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 112, 138);
    doc.text(`Página ${i} de ${n}`, W - MX, ALTO - 8, { align: 'right' });
    doc.text('Documento informativo. No constituye matrícula ni reserva de vacante.', MX, ALTO - 8);
  }
  const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  doc.save(demo ? `ejemplo-plan-${slug(ruta.id)}-DEMOSTRACION.pdf` : `plan-${slug(carrera.nombre)}-${slug(ruta.id)}.pdf`);
  return true;
};
