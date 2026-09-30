/* =====================================================================
   Importador del Excel académico oficial (uso interno).
   Convierte las hojas al modelo de datos de la landing, valida y genera
   data/datos-oficiales.js. Todo ocurre en el navegador: el archivo no se
   envía a ningún servidor.
   ===================================================================== */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  const si = (v) => ['si', 'sí', 'x', '1', 'true', 'verdadero'].includes(String(v || '').trim().toLowerCase());
  const lista = (v) => String(v || '').split(/[;,]/).map((x) => x.trim()).filter(Boolean);

  // Estructura de la plantilla. Cada columna tiene alias aceptados.
  const HOJAS = {
    Carreras:   [['carrera_id'], ['carrera', 'nombre_carrera'], ['area'], ['plan_estudios', 'plan'], ['nota_duracion']],
    Cursos:     [['carrera_id'], ['codigo_curso', 'codigo'], ['curso', 'nombre_curso'], ['creditos'], ['electivo'], ['prerrequisitos'], ['curso_clave', 'clave', 'asignatura_puerta'], ['habilita'], ['solo_regular', 'no_se_dicta_en_verano']],
    Rutas:      [['carrera_id'], ['ruta_id', 'opcion_id'], ['nombre_opcion', 'nombre'], ['veranos'], ['carga_referencial'], ['periodo_culminacion'], ['destacada'], ['caracteristica_destacada'], ['condiciones'], ['restricciones']],
    Plan_Rutas: [['carrera_id'], ['ruta_id', 'opcion_id'], ['orden_periodo'], ['tipo_periodo'], ['numero_periodo'], ['anio'], ['codigo_curso', 'codigo']],
    Oferta:     [['carrera_id'], ['codigo_curso', 'codigo'], ['periodo'], ['estado'], ['confirmado_por'], ['fecha_confirmacion']],
    Contactos:  [['carrera_id'], ['nombre'], ['cargo'], ['canal'], ['enlace'], ['horario']]
  };
  const EJEMPLOS = {
    Carreras:   ['EJ-CARRERA', 'Carrera de ejemplo', 'Ingeniería', 'Plan 2024', 'Opcional: nota sobre la duración'],
    Cursos:     ['EJ-CARRERA', 'EJ101', 'Curso de ejemplo', 4, 'no', '', 'si', 'EJ201;EJ202', 'no'],
    Rutas:      ['EJ-CARRERA', 'EJ-R06', 'Veranos 1 y 2', '1;2', 25, 'Semestre 8', 'no', '', 'Aprobar cada curso a tiempo', 'Sujeto a la apertura de cursos'],
    Plan_Rutas: ['EJ-CARRERA', 'EJ-R06', 1, 'Semestre', 1, 1, 'EJ101'],
    Oferta:     ['EJ-CARRERA', 'EJ101', 'Verano 1', 'por_confirmar', '', ''],
    Contactos:  ['EJ-CARRERA', 'Nombre y apellido', 'Director(a) de carrera', 'Correo o WhatsApp', 'mailto:director@continental.edu.pe', 'Lunes a viernes, 9:00 a 18:00']
  };
  const INSTRUCCIONES = [
    ['Plantilla de datos académicos · Opciones para adelantar la carrera'],
    [''],
    ['1. Completa una hoja por tabla. No cambies los nombres de las hojas ni de las columnas.'],
    ['2. Borra las filas de ejemplo (carrera_id = EJ-CARRERA) antes de enviar el archivo.'],
    ['3. Listas dentro de una celda: separa con punto y coma. Ejemplo: EJ201;EJ202'],
    ['4. Sí o no: escribe "si" o "no".'],
    ['5. Cada carrera debe tener 16 opciones (hoja Rutas) y el detalle de cada periodo (hoja Plan_Rutas).'],
    ['6. tipo_periodo: Semestre o Verano. En veranos, numero_periodo va de 1 a 4 (el verano n es el que sigue al año n).'],
    ['7. Límites: 25 créditos por semestre y 11 por verano.'],
    ['8. estado de oferta: por_confirmar u ofertado. Usa "ofertado" solo con confirmación institucional y completa confirmado_por.'],
    ['9. curso_clave: marca "si" en las asignaturas puerta. "habilita" es opcional: los dependientes también se calculan desde los prerrequisitos.']
  ];

  function descargarPlantilla() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(INSTRUCCIONES), 'Instrucciones');
    Object.entries(HOJAS).forEach(([h, cols]) => {
      const ws = XLSX.utils.aoa_to_sheet([cols.map((c) => c[0]), EJEMPLOS[h]]);
      ws['!cols'] = cols.map(() => ({ wch: 22 }));
      XLSX.utils.book_append_sheet(wb, ws, h);
    });
    XLSX.writeFile(wb, 'plantilla-opciones-de-carrera.xlsx');
  }

  function leerHoja(wb, nombre) {
    const hoja = wb.SheetNames.find((n) => norm(n) === norm(nombre));
    if (!hoja) return null;
    const filas = XLSX.utils.sheet_to_json(wb.Sheets[hoja], { defval: '' });
    return filas.map((f) => {
      const o = {}; Object.keys(f).forEach((k) => { o[norm(k)] = f[k]; });
      const r = {};
      HOJAS[nombre].forEach((alias) => { const k = alias.find((a) => a in o); r[alias[0]] = k ? o[k] : ''; });
      return r;
    }).filter((r) => String(r.carrera_id).trim() && String(r.carrera_id).trim() !== 'EJ-CARRERA');
  }

  function periodoTxt(t) { const m = String(t || '').match(/(semestre|verano)\s*(\d+)/i); return m ? { tipo: m[1].toLowerCase(), numero: Number(m[2]) } : null; }

  function convertir(wb) {
    const faltan = Object.keys(HOJAS).filter((h) => !leerHoja(wb, h));
    const H = {}; Object.keys(HOJAS).forEach((h) => { H[h] = leerHoja(wb, h) || []; });
    const contactos = {}; H.Contactos.forEach((c) => { contactos[c.carrera_id] = { nombre: c.nombre || null, cargo: c.cargo || null, canal: c.canal || null, enlace: c.enlace || null, horario: c.horario || null }; });
    const carreras = H.Carreras.map((c) => ({ id: String(c.carrera_id).trim(), nombre: c.carrera, area: c.area || 'Carreras', planEstudios: c.plan_estudios || null, notaDuracion: c.nota_duracion || null, contacto: contactos[c.carrera_id] || null }));
    const cursos = H.Cursos.map((c) => ({ carreraId: String(c.carrera_id).trim(), codigo: String(c.codigo_curso).trim(), nombre: c.curso, creditos: Number(c.creditos) || 0,
      electivo: si(c.electivo), prerrequisitos: lista(c.prerrequisitos), clave: si(c.curso_clave), habilita: lista(c.habilita), soloRegular: si(c.solo_regular) }));
    const periodos = {};
    H.Plan_Rutas.forEach((p) => {
      const k = p.carrera_id + '|' + p.ruta_id;
      const tipo = norm(p.tipo_periodo).startsWith('ver') ? 'verano' : 'semestre';
      const orden = Number(p.orden_periodo) || 0;
      periodos[k] ||= {};
      const per = periodos[k][orden] ||= { orden, tipo, numero: Number(p.numero_periodo) || 0, anio: Number(p.anio) || null, cursos: [] };
      if (p.codigo_curso) per.cursos.push(String(p.codigo_curso).trim());
    });
    const rutas = H.Rutas.map((r) => {
      const k = r.carrera_id + '|' + r.ruta_id;
      return { id: String(r.ruta_id).trim(), carreraId: String(r.carrera_id).trim(), nombre: r.nombre_opcion || r.ruta_id,
        veranos: lista(r.veranos).map(Number).filter(Boolean), cargaReferencial: Number(r.carga_referencial) || null,
        periodoCulminacion: periodoTxt(r.periodo_culminacion), destacada: si(r.destacada), caracteristicaDestacada: r.caracteristica_destacada || null,
        condiciones: lista(r.condiciones), restricciones: lista(r.restricciones),
        periodos: Object.values(periodos[k] || {}).sort((a, b) => a.orden - b.orden) };
    });
    const oferta = H.Oferta.map((o) => ({ carreraId: String(o.carrera_id).trim(), codigo: String(o.codigo_curso).trim(), periodo: o.periodo || null,
      estado: norm(o.estado) === 'ofertado' ? 'ofertado' : 'por_confirmar', confirmadoPor: o.confirmado_por || null, fecha: o.fecha_confirmacion || null }));
    const datos = { meta: { fuente: 'oficial', importado: new Date().toISOString() }, carreras, cursos, rutas, oferta };
    const v = UCL.modelo.validar(datos);
    faltan.forEach((h) => v.errores.unshift(`Falta la hoja "${h}".`));
    rutas.forEach((r) => { if (!r.periodos.length) v.errores.push(`${r.id}: no tiene periodos en la hoja Plan_Rutas.`); });
    oferta.filter((o) => o.estado === 'ofertado' && !o.confirmadoPor).forEach((o) => v.avisos.push(`${o.codigo}: marcado como ofertado sin "confirmado_por"; se mostrará como "por confirmar".`));
    return { datos, ...v };
  }

  let ultimo = null;
  async function leerArchivo(file) {
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    ultimo = convertir(wb);
    const d = ultimo.datos;
    $('reporte').innerHTML = `<h2>Reporte de ${esc(file.name)}</h2>
      <ul class="lista-check"><li>${d.carreras.length} carreras</li><li>${d.cursos.length} cursos</li><li>${d.rutas.length} opciones</li><li>${d.oferta.length} registros de oferta</li></ul>
      <h3 style="margin-top:20px">${ultimo.errores.length} errores</h3>${ultimo.errores.length ? `<ul>${ultimo.errores.slice(0, 200).map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : '<p>Sin errores.</p>'}
      <h3>${ultimo.avisos.length} avisos</h3>${ultimo.avisos.length ? `<ul>${ultimo.avisos.slice(0, 200).map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : '<p>Sin avisos.</p>'}`;
    $('acciones-import').classList.remove('oculto');
    $('btn-exportar').disabled = ultimo.errores.length > 0;
    $('nota-export').textContent = ultimo.errores.length ? 'Corrige los errores en el Excel antes de exportar. Puedes revisar la vista previa igualmente.' : 'Listo para exportar.';
  }

  function vistaPrevia() { localStorage.setItem('uc_datos_importados', JSON.stringify(ultimo.datos)); window.open('index.html?vista=importada', '_blank'); }
  function exportar() {
    const txt = '/* Generado por importar.html el ' + new Date().toLocaleString('es-PE') + ' */\nwindow.UC_DATOS_OFICIALES = ' + JSON.stringify(ultimo.datos, null, 1) + ';\n';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' })); a.download = 'datos-oficiales.js'; a.click();
  }

  $('btn-plantilla').addEventListener('click', descargarPlantilla);
  $('archivo').addEventListener('change', (e) => { if (e.target.files[0]) leerArchivo(e.target.files[0]).catch((err) => { $('reporte').innerHTML = `<p class="mensaje error">No se pudo leer el archivo: ${esc(err.message)}</p>`; }); });
  $('btn-vista').addEventListener('click', vistaPrevia);
  $('btn-exportar').addEventListener('click', exportar);
})();
