/* =====================================================================
   Interfaz. Presenta opciones por carrera; no evalúa el caso individual
   del visitante ni pide datos académicos para mostrar las opciones.
   ===================================================================== */
(function () {
  const M = UCL.modelo, T = UCL.textos, CFG = UCL.config;
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = UCL.datos = M.cargar();
  const S = { carreraId: null, filtro: 'todas', rutaId: null, rutasVistas: new Set(), interes: new Map() };

  // ---------- Contenido fijo ----------
  function pintarFijos() {
    const ttl = esc(T.portada.titulo).replace('menos tiempo', '<mark>menos tiempo</mark>');
    $('t-titulo').innerHTML = ttl;
    $('t-subtitulo').textContent = T.portada.subtitulo;
    $('t-boton').textContent = T.portada.boton;
    $('t-nota').textContent = T.portada.nota;
    $('datos-clave').innerHTML = T.datosClave.map((d) => `<div>${esc(d.valor)}<span>${esc(d.texto)}</span></div>`).join('');
    $('t-insignia').textContent = T.portada.insignia;
    ['t-afiche1', 't-afiche2', 't-afiche3'].forEach((id, i) => { $(id).textContent = T.portada.afiche[i] || ''; });
    $('t-duracion').textContent = T.duracion.general + ' ' + T.duracion.excepciones;
    $('t-queEs-titulo').textContent = T.queEs.titulo;
    $('t-queEs-texto').textContent = T.queEs.texto;
    $('distinciones').innerHTML = T.queEs.distinciones.map((d) => `<li><b>${esc(d.titulo)}</b><p>${esc(d.texto)}</p></li>`).join('');
    $('t-beneficios').textContent = T.beneficios.titulo;
    const base = CFG.marca.iconosBase;
    $('beneficios').innerHTML = T.beneficios.tarjetas.map((b) => `<article class="tarjeta beneficio">${b.icono && base ? `<img class="icono" src="${esc(base + b.icono)}" alt="" onerror="this.remove()">` : ''}<h3>${esc(b.titulo)}</h3><p>${esc(b.texto)}</p></article>`).join('');
    $('t-clave-titulo').textContent = T.cursoClave.titulo;
    $('t-clave-exp').textContent = T.cursoClave.explicacion;
    $('t-interes-titulo').textContent = T.interes.titulo;
    $('t-interes-exp').textContent = T.interes.explicacion;
    $('t-interes-exp2').textContent = T.interes.explicacion;
    $('t-autoriza').textContent = T.interes.autorizacion;
    const pol = CFG.interes.politicaPrivacidadUrl;
    $('privacidad').innerHTML = pol ? `Revisa la <a href="${esc(pol)}" target="_blank" rel="noopener">política de privacidad</a>.` : `Política de privacidad: <span class="pendiente">${esc(T.contacto.pendiente)}</span>`;
    $('t-matricula').textContent = T.matricula.titulo;
    $('pasos').innerHTML = T.matricula.pasos.map((p) => `<li><b>${esc(p.titulo)}</b><p>${esc(p.texto)}</p></li>`).join('');
    $('requisitos').innerHTML = T.matricula.requisitos.map((r) => `<li>${esc(r)}</li>`).join('');
    const cal = CFG.calendario, pend = `<span class="pendiente">Por anunciar</span>`;
    $('fechas').innerHTML = `<dt>Registro de interés</dt><dd>${cal.registroInteres ? esc(cal.registroInteres) : pend}</dd>
      <dt>Matrícula de verano</dt><dd>${cal.matriculaVerano ? esc(cal.matriculaVerano) : 'Se publicará en el calendario académico oficial.'}</dd>
      <dt>Horarios</dt><dd>${esc(cal.horarioVerano)}</dd>`;
    $('faq').innerHTML = T.faq.map((f, i) => `<details class="faq" data-faq="${i}"><summary>${esc(f.p)}</summary><p>${esc(f.r)}</p></details>`).join('');
    $('t-contacto').textContent = T.contacto.titulo;
    $('t-contacto-texto').textContent = T.contacto.texto;
    $('pie-portal').href = CFG.enlaces.portalEstudiante;
    $('pie-modalidad').href = CFG.enlaces.modalidad;
    $('pie-fuente').textContent = D.fuente === 'oficial' ? 'Información académica oficial' : D.fuente === 'importada' ? 'Vista previa de datos importados' : 'Versión con datos de demostración';
    const aviso = D.fuente === 'demo' ? T.avisoDemo : D.fuente === 'importada' ? T.avisoVistaImportada : '';
    if (aviso) { $('aviso-datos').textContent = aviso; $('aviso-datos').classList.remove('oculto'); }
    if (CFG.marca.logoPieUrl) {
      const img = new Image(); img.alt = 'Universidad Continental'; img.src = CFG.marca.logoPieUrl;
      img.onload = () => { $('pie-marca').innerHTML = ''; $('pie-marca').appendChild(img); };
    }
  }

  // ---------- Carrera ----------
  function pintarSelector() {
    const sel = $('sel-carrera');
    if (!D.carreras.length) {
      sel.disabled = true; sel.innerHTML = '<option>Las carreras se publicarán pronto</option>';
      $('comparacion').innerHTML = '<p class="vacio">Las opciones de cada carrera se publicarán cuando se cargue la información académica oficial.</p>';
      return;
    }
    const areas = {};
    D.carreras.forEach((c) => { (areas[c.area || 'Carreras'] ||= []).push(c); });
    sel.innerHTML = '<option value="">Selecciona tu carrera</option>' + Object.entries(areas).map(([a, cs]) =>
      `<optgroup label="${esc(a)}">${cs.map((c) => `<option value="${esc(c.id)}">${esc(c.nombre)}${D.fuente !== 'oficial' && (D.rutasDe[c.id] || []).length ? ' · con opciones de ejemplo' : ''}</option>`).join('')}</optgroup>`).join('');
    sel.addEventListener('change', () => elegirCarrera(sel.value));
    if (D.carreras.length === 1) { sel.value = D.carreras[0].id; elegirCarrera(sel.value, true); }
    const conOpciones = D.carreras.filter((c) => (D.rutasDe[c.id] || []).length);
    if (D.fuente !== 'oficial' && conOpciones.length && conOpciones.length < D.carreras.length)
      $('comparacion').innerHTML = `<p class="vacio">Elige tu carrera. En esta demostración tienen opciones de ejemplo: ${esc(conOpciones.map((c) => c.nombre).join(' y '))}.</p>`;
  }

  const carrera = () => D.carreras.find((c) => c.id === S.carreraId);
  const rutas = () => D.rutasDe[S.carreraId] || [];

  function elegirCarrera(id, silencioso) {
    S.carreraId = id || null; S.rutaId = null; S.filtro = 'todas';
    $('detalle').classList.add('oculto');
    if (!S.carreraId) { $('ficha-carrera').innerHTML = ''; $('comparacion').innerHTML = ''; pintarClaves(); pintarContactos(); return; }
    if (!silencioso) UCL.evento('carrera_consultada', { carrera: S.carreraId });
    pintarFicha(); pintarComparacion(); pintarClaves(); pintarContactos(); pintarInteres();
  }

  function pintarFicha() {
    const c = carrera(), claves = M.cursosClave(D, c.id), rs = rutas();
    const k = claves[0];
    $('ficha-carrera').innerHTML = `<div class="ficha">
      <div class="ficha-datos tarjeta">
        <h3>${esc(c.nombre)}</h3>
        <p><b>Plan de estudios:</b> ${esc(c.planEstudios || 'Por confirmar')}</p>
        <p><b>Opciones disponibles:</b> ${rs.length ? rs.length + ' de 16' : 'Por publicar'}</p>
        ${c.notaDuracion ? `<p class="nota-carrera">${esc(c.notaDuracion)}</p>` : ''}
        ${c.origenDatos ? `<p class="nota-origen">${esc(c.origenDatos)}</p>` : ''}
        ${c.enlaceCarrera ? `<p><a href="${esc(c.enlaceCarrera)}" target="_blank" rel="noopener">Ver la carrera en la web de la modalidad</a></p>` : ''}
      </div>
      ${k ? `<div class="recuadro-negro"><small>CURSO CLAVE</small><h3>${esc(k.nombre)}</h3>
        <p>Habilita ${k.dependientes.length} asignaturas posteriores. ${esc(T.cursoClave.explicacion)}</p>
        <p style="margin-top:10px"><a href="#cursos-clave" style="color:#fff">Ver los cursos clave de tu carrera</a></p></div>`
      : '<div class="vacio">Los cursos clave de esta carrera están por confirmar.</div>'}
    </div>`;
  }

  // ---------- Comparación de las 16 opciones ----------
  function pistaDe(r) {
    const cul = M.culminacion(r);
    const celdas = [];
    for (let s = 1; s <= 10; s++) {
      celdas.push(`<span class="${s <= Math.floor(cul.semestre) ? 'p-s' : 'p-vacio'}">S${s}</span>`);
      if (s % 2 === 0 && s < 10) { const v = s / 2; celdas.push((r.veranos || []).includes(v) ? `<span class="p-v">V${v}</span>` : ''); }
    }
    return `<div class="pista" aria-label="${esc(describirPista(r))}">${celdas.join('')}</div>`;
  }
  const describirPista = (r) => `${(r.veranos || []).length ? 'Usa ' + r.veranos.map((v) => 'el verano ' + v).join(', ') : 'Sin veranos'}; culmina en ${M.culminacion(r).corto}`;

  function pintarComparacion() {
    const rs = rutas();
    if (!rs.length) { $('comparacion').innerHTML = '<p class="vacio">Las opciones de esta carrera se publicarán cuando se cargue la información académica oficial. Mientras tanto, puedes consultar tus dudas con tu director de carrera.</p>'; return; }
    const minSem = Math.min(...rs.map((r) => M.culminacion(r).semestre));
    const filtros = [['todas', 'Todas'], ['0', 'Sin veranos'], ['1', 'Un verano'], ['2', 'Dos veranos'], ['3+', 'Tres o más']];
    const pasa = (r) => S.filtro === 'todas' || (S.filtro === '3+' ? M.grupoDe(r) >= 3 : String(M.grupoDe(r)) === S.filtro);
    const grupos = {};
    rs.filter(pasa).forEach((r) => { (grupos[M.grupoDe(r)] ||= []).push(r); });
    const abiertos = new Set(['0', ...Object.keys(grupos).filter((g) => grupos[g].some((r) => M.culminacion(r).semestre === minSem))]);
    const html = Object.keys(grupos).sort().map((g) => {
      const lista = grupos[g].sort((a, b) => M.culminacion(a).semestre - M.culminacion(b).semestre);
      const culms = [...new Set(lista.map((r) => M.culminacion(r).corto))];
      return `<details class="grupo" ${abiertos.has(g) || S.filtro !== 'todas' ? 'open' : ''}><summary><span class="grupo-titulo">${M.NOMBRE_GRUPO[g]} · ${lista.length} ${lista.length === 1 ? 'opción' : 'opciones'}</span>
        <span class="grupo-resumen">Culminación referencial: ${esc(culms.join(' o '))}</span></summary>
        ${lista.map((r) => {
          const cul = M.culminacion(r);
          return `<div class="opcion">
            <div><div class="opcion-cab"><b>${esc(r.nombre)}</b>
              ${cul.semestre === minSem ? '<span class="etiqueta">Culminación más temprana de la carrera</span>' : ''}
              ${r.destacada && r.caracteristicaDestacada ? `<span class="etiqueta etiqueta-ok">${esc(r.caracteristicaDestacada)}</span>` : ''}</div>
              <div style="margin-top:8px">${pistaDe(r)}</div></div>
            <div class="opcion-datos">
              <span>Culminación referencial<b>${esc(cul.medio)}</b></span>
              <span>Créditos por semestre<b>${r.cargaReferencial ? 'Hasta ' + r.cargaReferencial : 'Por confirmar'}</b></span>
              <span>Cursos en verano<b>${M.cursosEnVerano(r)}</b></span>
            </div>
            <button type="button" class="btn btn-borde btn-chico" data-ruta="${esc(r.id)}">Ver este plan</button>
          </div>`; }).join('')}
      </details>`;
    }).join('');
    $('comparacion').innerHTML = `<div class="filtros" role="group" aria-label="Filtrar por cantidad de veranos">
      ${filtros.map(([v, t]) => `<button type="button" class="chip" data-filtro="${v}" aria-pressed="${S.filtro === v}">${t}</button>`).join('')}</div>
      ${html || '<p class="vacio">No hay opciones con ese filtro.</p>'}
      <p class="explica">La "culminación referencial" es el periodo en que terminarías los cursos del plan si apruebas todo a tiempo y los cursos se abren. No es la fecha de titulación.</p>`;
  }

  // ---------- Detalle de una opción ----------
  function abrirRuta(id) {
    const r = rutas().find((x) => x.id === id); if (!r) return;
    if (S.rutasVistas.size && !S.rutasVistas.has(id)) UCL.evento('comparacion', { carrera: S.carreraId, opcion: id });
    S.rutasVistas.add(id); S.rutaId = id;
    UCL.evento('opcion_abierta', { carrera: S.carreraId, opcion: id });
    pintarDetalle(); pintarClaves();
    const sec = $('detalle'); sec.classList.remove('oculto'); sec.focus({ preventScroll: true }); sec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function pintarDetalle() {
    const c = carrera(), r = rutas().find((x) => x.id === S.rutaId); if (!r) return;
    const cul = M.culminacion(r), L = CFG.limites;
    const porAnio = {}; r.periodos.forEach((p) => { (porAnio[M.anioDe(p)] ||= []).push(p); });
    let n = 0;
    const anios = Object.keys(porAnio).sort((a, b) => a - b).map((a) => `<div class="anio"><h3>Año ${a}</h3><div class="periodos">
      ${porAnio[a].map((p) => {
        const cr = M.creditos(D, c.id, p.cursos), max = p.tipo === 'verano' ? L.creditosVerano : L.creditosSemestre, abierto = n++ < 3;
        return `<details class="periodo ${p.tipo === 'verano' ? 'es-verano' : ''}" ${abierto ? 'open' : ''}>
          <summary><span class="periodo-nombre">${M.etiquetaPeriodo(p)}</span><span class="periodo-meta">${(p.cursos || []).length} cursos · ${cr} de ${max} créditos</span></summary>
          <ul class="cursos">${(p.cursos || []).length ? p.cursos.map((k) => cursoHTML(c, r, p, k)).join('') : '<li class="curso">Sin cursos en este periodo.</li>'}</ul>
        </details>`; }).join('')}</div></div>`).join('');
    $('detalle').innerHTML = `<div class="envoltura">
      <div class="detalle-cab"><button type="button" class="btn-texto" data-volver>← Volver a comparar opciones</button></div>
      <h2 id="detalle-titulo">Plan de cursos: ${esc(r.nombre)}</h2>
      <p class="bajada">Es un orden propuesto para llevar los cursos de ${esc(c.nombre)} entre semestres y veranos.</p>
      <div class="resumen-4">
        <div><small>Culminación referencial</small><b>${esc(cul.largo)}</b></div>
        <div><small>Veranos</small><b>${(r.veranos || []).length ? esc(r.veranos.map((v) => 'V' + v).join(' · ')) : 'Ninguno'}</b></div>
        <div><small>Créditos por semestre</small><b>${r.cargaReferencial ? 'Hasta ' + r.cargaReferencial : 'Por confirmar'}</b></div>
        <div><small>Cursos en verano</small><b>${M.cursosEnVerano(r)}</b></div>
      </div>
      <p class="aviso-plan">${esc(T.avisoPlan)}</p>
      ${anios}
      <div class="acciones">
        <button type="button" class="btn btn-morado" data-pdf>Descargar este plan</button>
        <a class="btn btn-borde" href="#interes">Ir a mis cursos de verano</a>
      </div>
      <details class="desplegable"><summary>Cómo se construyeron estas opciones</summary>
        <p>${esc(T.duracion.supuestos)}</p>
        ${[...(r.condiciones || []), ...(r.restricciones || [])].length ? `<ul>${[...(r.condiciones || []), ...(r.restricciones || [])].map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      </details>
    </div>`;
  }

  function cursoHTML(c, r, p, k) {
    const cu = M.getCurso(D, c.id, k), est = M.estadoOferta(D, c.id, k, p);
    const clave = `${c.id}|${r.id}|${k}`, marcado = S.interes.has(clave);
    const etq = [];
    if (cu.clave) etq.push('<span class="etiqueta">Curso clave</span>');
    if (cu.electivo) etq.push('<span class="etiqueta">Electivo</span>');
    etq.push(`<span class="etiqueta ${p.tipo === 'verano' ? 'etiqueta-verano' : ''} ${est === 'ofertado' ? 'etiqueta-ok' : ''}">${esc(T.estadosOferta[est])}</span>`);
    return `<li class="curso"><div class="curso-fila"><span><span class="curso-nombre">${esc(cu.nombre)}</span><br><span class="curso-cod">${esc(M.codigoVisible(cu))}</span></span><span class="curso-cod">${cu.creditos} cr.</span></div>
      <div class="curso-etq">${etq.join('')}</div>
      ${p.tipo === 'verano' ? `<label class="casilla"><input type="checkbox" data-interes="${esc(clave)}" data-verano="${p.numero}" ${marcado ? 'checked' : ''}> ${esc(T.estadosOferta.interes)}</label>` : ''}</li>`;
  }

  // ---------- Cursos clave ----------
  function pintarClaves() {
    if (!S.carreraId) { $('lista-clave').innerHTML = '<p class="vacio">Elige tu carrera para ver sus cursos clave.</p>'; return; }
    const claves = M.cursosClave(D, S.carreraId), rs = rutas();
    const ref = rs.find((x) => x.id === S.rutaId) || rs[0];
    if (!claves.length) { $('lista-clave').innerHTML = '<p class="vacio">Los cursos clave de esta carrera están por confirmar.</p>'; return; }
    $('lista-clave').innerHTML = `<div class="clave-lista">${claves.map((k) => {
      const p = ref ? M.periodoDeCurso(ref, k.codigo) : null;
      const deps = k.dependientes.map((d) => M.getCurso(D, S.carreraId, d).nombre);
      return `<article class="tarjeta clave"><h3>${esc(k.nombre)}</h3><p class="curso-cod">${esc(M.codigoVisible(k))} · ${k.creditos} créditos</p>
        <p class="dato">Habilita ${k.dependientes.length} asignaturas posteriores</p>
        ${p ? `<p>En la opción <b>${esc(ref.nombre)}</b> se lleva en el <b>${M.etiquetaPeriodo(p).toLowerCase()}</b>.</p>` : ''}
        <p>${esc(T.cursoClave.siSePostergan)}</p>
        ${deps.length ? `<details class="desplegable"><summary>Ver las asignaturas que habilita</summary><p>${esc(deps.join(', '))}</p></details>` : ''}
      </article>`; }).join('')}</div>`;
  }

  // ---------- Interés en cursos de verano ----------
  function pintarInteres() {
    const items = [...S.interes.values()];
    if (!items.length) { $('interes-lista').innerHTML = `<p class="vacio">${esc(T.interes.vacio)}</p>`; return; }
    const porVerano = {}; items.forEach((i) => { const k = i.opcionId + '|' + i.verano; porVerano[k] = (porVerano[k] || 0) + i.creditos; });
    const excede = Object.entries(porVerano).filter(([, cr]) => cr > CFG.limites.creditosVerano);
    const total = items.reduce((s, i) => s + i.creditos, 0);
    $('interes-lista').innerHTML = items.map((i) => `<div class="item-interes"><span><b>${esc(i.nombre)}</b><br><span class="curso-cod">${i.creditos} cr. · Verano ${i.verano} · ${esc(i.opcionNombre)}</span></span>
      <button type="button" class="btn-texto" data-quitar="${esc(i.clave)}" aria-label="Quitar ${esc(i.nombre)}">Quitar</button></div>`).join('') +
      `<p class="contador ${excede.length ? 'excede' : ''}">${items.length} ${items.length === 1 ? 'curso' : 'cursos'} · ${total} créditos en total</p>
      ${excede.length ? `<p class="mensaje error">En un mismo verano no se pueden llevar más de ${CFG.limites.creditosVerano} créditos. Revisa tu selección.</p>` : `<p class="explica">Máximo ${CFG.limites.creditosVerano} créditos en un mismo verano.</p>`}`;
  }

  function marcar(clave, verano, activo) {
    const [carreraId, opcionId, codigo] = clave.split('|');
    const cu = M.getCurso(D, carreraId, codigo), r = (D.rutasDe[carreraId] || []).find((x) => x.id === opcionId);
    if (activo) S.interes.set(clave, { clave, carreraId, opcionId, opcionNombre: r ? r.nombre : opcionId, codigo, nombre: cu.nombre, creditos: cu.creditos, verano: Number(verano) });
    else S.interes.delete(clave);
    UCL.evento(activo ? 'curso_verano_marcado' : 'curso_verano_desmarcado', { carrera: carreraId, opcion: opcionId, curso: codigo });
    pintarInteres();
  }

  async function enviar(e) {
    e.preventDefault();
    const est = $('interes-estado'), f = e.target, items = [...S.interes.values()];
    const msg = (t, tipo) => { est.textContent = t; est.className = 'mensaje ' + (tipo || ''); };
    const correo = f.correo.value.trim().toLowerCase(), dom = CFG.interes.dominioCorreo;
    if (!items.length) return msg('Marca al menos un curso de verano en alguna opción de tu carrera.', 'error');
    if (!f.nombres.value.trim() || !f.apellidos.value.trim()) return msg('Completa tus nombres y apellidos.', 'error');
    if (!correo.endsWith(dom) || !/^[^\s@]+@[^\s@]+$/.test(correo)) return msg(`Usa tu correo institucional (${dom}).`, 'error');
    if (!$('f-autoriza').checked) return msg('Necesitamos tu autorización para registrar tu interés.', 'error');
    const porVerano = {}; items.forEach((i) => { const k = i.opcionId + '|' + i.verano; porVerano[k] = (porVerano[k] || 0) + i.creditos; });
    if (Object.values(porVerano).some((cr) => cr > CFG.limites.creditosVerano)) return msg(`Tu selección supera los ${CFG.limites.creditosVerano} créditos en un verano.`, 'error');
    $('btn-enviar').disabled = true; msg('Enviando…');
    const res = await UCL.enviarInteres({
      fecha: new Date().toISOString(), fuenteDatos: D.fuente,
      carrera: { id: items[0].carreraId, nombre: (D.carreras.find((c) => c.id === items[0].carreraId) || {}).nombre },
      cursos: items.map(({ codigo, nombre, creditos, verano, opcionId, opcionNombre }) => ({ codigo, nombre, creditos, verano, opcionId, opcionNombre })),
      contacto: { nombres: f.nombres.value.trim(), apellidos: f.apellidos.value.trim(), correo, celular: f.celular.value.trim() || null },
      autorizacion: true
    });
    $('btn-enviar').disabled = false;
    if (res.ok) { msg(T.interes.exito, 'ok'); UCL.evento('interes_registrado', { carrera: items[0].carreraId, cursos: items.length }); }
    else { msg(res.motivo === 'integracion_pendiente' ? T.interes.pendiente : T.interes.error, 'error'); UCL.evento('interes_no_guardado', { motivo: res.motivo }); }
  }

  // ---------- Contacto ----------
  function pintarContactos() {
    const c = carrera(), ct = c && c.contacto, A = CFG.acompanamiento, P = `<span class="pendiente">${esc(T.contacto.pendiente)}</span>`;
    const canal = (x) => x.enlace ? `<a href="${esc(x.enlace)}" target="_blank" rel="noopener" data-contacto="1">${esc(x.canal || 'Escribir')}</a>` : (x.canal ? esc(x.canal) : P);
    $('contactos').innerHTML = `<article class="contacto"><small>TEMAS ACADÉMICOS</small><h3>${c ? 'Director o responsable académico de ' + esc(c.nombre) : 'Director o responsable académico de tu carrera'}</h3>
        <p>Tu avance, las opciones de tu carrera, cursos clave y convalidaciones.</p>
        ${!c ? '<p>Elige tu carrera en la sección de opciones para ver su contacto.</p>' : ct && ct.nombre ? `<p><b>${esc(ct.nombre)}</b>${ct.cargo ? '<br>' + esc(ct.cargo) : ''}</p><p>${canal(ct)}${ct.horario ? ' · ' + esc(ct.horario) : ''}</p>` : `<p>${P}</p>`}</article>
      <article class="contacto"><small>PAGOS, MATRÍCULA Y ACCESOS</small><h3>${esc(A.nombre)}</h3><p>${esc(T.contacto.acompanamientoTexto)}</p>
        <p>${A.canal || A.enlace ? canal(A) : P}${A.horario ? ' · ' + esc(A.horario) : ''}</p></article>`;
  }

  // ---------- Eventos de la página ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button, a');
    if (!b) return;
    if (b.dataset.filtro) { S.filtro = b.dataset.filtro; pintarComparacion(); UCL.evento('comparacion_filtro', { carrera: S.carreraId, filtro: S.filtro }); }
    else if (b.dataset.ruta) abrirRuta(b.dataset.ruta);
    else if (b.hasAttribute('data-volver')) { $('detalle').classList.add('oculto'); $('opciones').scrollIntoView(); }
    else if (b.hasAttribute('data-pdf')) {
      const r = rutas().find((x) => x.id === S.rutaId);
      const marcados = new Set([...S.interes.values()].filter((i) => i.opcionId === S.rutaId).map((i) => i.codigo));
      if (UCL.descargarPlan({ datos: D, carrera: carrera(), ruta: r, interes: marcados })) UCL.evento('plan_descargado', { carrera: S.carreraId, opcion: S.rutaId });
    }
    else if (b.dataset.quitar) { const i = S.interes.get(b.dataset.quitar); S.interes.delete(b.dataset.quitar); pintarInteres(); if (S.rutaId) pintarDetalle(); if (i) UCL.evento('curso_verano_desmarcado', { carrera: i.carreraId, opcion: i.opcionId, curso: i.codigo }); }
    else if (b.dataset.contacto) UCL.evento('contacto_solicitado', { carrera: S.carreraId });
    else if (b.dataset.evento) UCL.evento(b.dataset.evento);
  });
  document.addEventListener('change', (e) => { const c = e.target.closest('input[data-interes]'); if (c) marcar(c.dataset.interes, c.dataset.verano, c.checked); });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.faq') && e.target.open) UCL.evento('faq_abierta', { pregunta: Number(e.target.dataset.faq) }); }, true);
  $('form-interes').addEventListener('submit', enviar);

  pintarFijos(); pintarSelector(); pintarClaves(); pintarContactos(); pintarInteres();
})();
