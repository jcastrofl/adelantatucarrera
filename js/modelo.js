/* =====================================================================
   Modelo de datos. No calcula rutas nuevas: solo presenta las rutas
   aprobadas que vienen en los datos (oficiales o de demostración).
   ===================================================================== */
window.UCL = window.UCL || {};
(function () {
  const M = {};

  // --- Carga: vista previa importada > datos oficiales > demostración
  M.cargar = function () {
    const params = new URLSearchParams(location.search);
    if (params.get('vista') === 'importada') {
      try {
        const d = JSON.parse(localStorage.getItem('uc_datos_importados') || 'null');
        if (d) return M.indexar(d, 'importada');
      } catch (e) { /* sin vista previa */ }
    }
    if (window.UC_DATOS_OFICIALES) return M.indexar(window.UC_DATOS_OFICIALES, 'oficial');
    if (UCL.config.mostrarEjemplos && window.UC_DATOS_DEMO) return M.indexar(window.UC_DATOS_DEMO, 'demo');
    return M.indexar({ carreras: [], cursos: [], rutas: [], oferta: [] }, 'vacio');
  };

  M.indexar = function (d, fuente) {
    const x = { fuente, meta: d.meta || {}, carreras: d.carreras || [], cursos: d.cursos || [], rutas: d.rutas || [], oferta: d.oferta || [] };
    x.curso = {}; x.cursosDe = {}; x.rutasDe = {};
    x.cursos.forEach((c) => { x.curso[c.carreraId + '|' + c.codigo] = c; (x.cursosDe[c.carreraId] ||= []).push(c); });
    x.rutas.forEach((r) => { (x.rutasDe[r.carreraId] ||= []).push(r); });
    return x;
  };

  M.getCurso = (x, carreraId, codigo) => x.curso[carreraId + '|' + codigo] || { codigo, nombre: codigo, creditos: 0 };
  // Los datos de demostración usan claves internas: no se muestran como códigos reales.
  M.codigoVisible = (c) => (c.codigoInterno ? 'Código por confirmar' : c.codigo);

  // --- Dependientes (transitivos) de un curso, por prerrequisitos y columna "habilita"
  M.dependientes = function (x, carreraId, codigo) {
    const cursos = x.cursosDe[carreraId] || [];
    const hijos = {};
    cursos.forEach((c) => {
      (c.prerrequisitos || []).forEach((p) => { (hijos[p] ||= new Set()).add(c.codigo); });
      (c.habilita || []).forEach((h) => { (hijos[c.codigo] ||= new Set()).add(h); });
    });
    const vistos = new Set(); const pila = [codigo];
    while (pila.length) { const k = pila.pop(); (hijos[k] || []).forEach((h) => { if (!vistos.has(h)) { vistos.add(h); pila.push(h); } }); }
    return [...vistos];
  };

  M.cursosClave = function (x, carreraId) {
    return (x.cursosDe[carreraId] || []).filter((c) => c.clave)
      .map((c) => ({ ...c, dependientes: M.dependientes(x, carreraId, c.codigo) }));
  };

  // --- Periodos y culminación
  M.etiquetaPeriodo = (p) => (p.tipo === 'verano' ? 'Verano ' : 'Semestre ') + p.numero;
  M.anioDe = (p) => p.anio || (p.tipo === 'verano' ? p.numero : Math.ceil(p.numero / 2));

  M.culminacion = function (r) {
    const pc = r.periodoCulminacion || (() => { const u = [...r.periodos].reverse().find((p) => (p.cursos || []).length); return u ? { tipo: u.tipo, numero: u.numero } : null; })();
    if (!pc) return { corto: 'Por confirmar', medio: 'Por confirmar', largo: 'Culminación por confirmar', semestre: 99 };
    if (pc.tipo === 'verano') return { corto: 'Verano ' + pc.numero, medio: `Verano ${pc.numero} · aprox. ${pc.numero} años`, largo: `Verano ${pc.numero} · aprox. ${pc.numero} años`, semestre: pc.numero * 2 + 0.5 };
    const n = pc.numero, anios = n / 2;
    const aprox = Number.isInteger(anios) ? `${anios} años` : `${Math.floor(anios)} años y medio`;
    const extra = n % 2 ? ` (1.er semestre del año ${Math.ceil(n / 2)})` : '';
    return { corto: 'Semestre ' + n, medio: `Semestre ${n} · aprox. ${aprox}`, largo: `Semestre ${n}${extra} · aprox. ${aprox}`, semestre: n, aprox };
  };

  M.grupoDe = (r) => (r.veranos || []).length;
  M.NOMBRE_GRUPO = ['Sin veranos', 'Con un verano', 'Con dos veranos', 'Con tres veranos', 'Con los cuatro veranos'];

  M.creditos = (x, carreraId, codigos) => (codigos || []).reduce((s, k) => s + (M.getCurso(x, carreraId, k).creditos || 0), 0);
  M.cursosEnVerano = (r) => r.periodos.filter((p) => p.tipo === 'verano').reduce((s, p) => s + (p.cursos || []).length, 0);

  // Dónde se lleva un curso dentro de una ruta
  M.periodoDeCurso = (r, codigo) => r.periodos.find((p) => (p.cursos || []).includes(codigo));

  // --- Estado de oferta: "ofertado" solo con confirmación institucional
  M.estadoOferta = function (x, carreraId, codigo, periodo) {
    const o = x.oferta.find((o) => o.carreraId === carreraId && o.codigo === codigo && (!o.periodo || o.periodo === M.etiquetaPeriodo(periodo)));
    if (o && o.estado === 'ofertado' && o.confirmadoPor) return 'ofertado';
    if (periodo.tipo === 'verano') return 'por_confirmar';
    return 'incluido';
  };

  // --- Validación (la usa también el importador)
  M.validar = function (d) {
    const errores = [], avisos = [], L = UCL.config.limites;
    const cursos = {}; (d.cursos || []).forEach((c) => { cursos[c.carreraId + '|' + c.codigo] = c; });
    (d.carreras || []).forEach((ca) => {
      const rs = (d.rutas || []).filter((r) => r.carreraId === ca.id);
      if (rs.length !== 16) avisos.push(`${ca.nombre}: tiene ${rs.length} opciones (se esperaban 16).`);
      if (!ca.contacto || !ca.contacto.nombre) avisos.push(`${ca.nombre}: falta el contacto del director o responsable académico.`);
      if (!(d.cursos || []).some((c) => c.carreraId === ca.id && c.clave)) avisos.push(`${ca.nombre}: no tiene cursos clave marcados.`);
    });
    (d.rutas || []).forEach((r) => {
      const aprobados = new Set();
      [...r.periodos].sort((a, b) => a.orden - b.orden).forEach((p) => {
        let cr = 0;
        (p.cursos || []).forEach((k) => {
          const c = cursos[r.carreraId + '|' + k];
          if (!c) { errores.push(`${r.id} · ${M.etiquetaPeriodo(p)}: el curso ${k} no existe en la hoja Cursos.`); return; }
          cr += c.creditos || 0;
          (c.prerrequisitos || []).forEach((pr) => { if (!aprobados.has(pr)) errores.push(`${r.id} · ${M.etiquetaPeriodo(p)}: ${k} se lleva antes que su prerrequisito ${pr}.`); });
        });
        const max = p.tipo === 'verano' ? L.creditosVerano : L.creditosSemestre;
        if (cr > max) errores.push(`${r.id} · ${M.etiquetaPeriodo(p)}: ${cr} créditos (máximo ${max}).`);
        (p.cursos || []).forEach((k) => aprobados.add(k));
      });
    });
    return { errores, avisos };
  };

  UCL.modelo = M;
})();
