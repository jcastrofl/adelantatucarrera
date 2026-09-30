/* =====================================================================
   Textos visibles. Comunicación puede editarlos sin tocar la lógica.
   Los textos marcados como OFICIAL vienen literalmente del documento
   de la campaña: no cambiarlos sin aprobación del equipo académico.
   ===================================================================== */
window.UCL = window.UCL || {};
UCL.textos = {
  portada: {
    titulo: 'Egresar en menos tiempo sí puede ser posible',                                                          // OFICIAL
    subtitulo: 'Conoce cómo podrías organizar tus cursos, aprovechar el verano y avanzar hacia el final de tu carrera', // OFICIAL
    boton: 'Ver opciones para mi carrera',                                                                           // OFICIAL
    nota: 'No necesitas ingresar ni dar datos personales para ver las opciones.',
    insignia: 'MODALIDAD A DISTANCIA · CURSOS DE VERANO',
    afiche: ['Organiza tus', 'Veranos', 'y semestres']
  },

  avisoDemo: 'Versión de demostración. El catálogo de carreras es real, pero las opciones, prerrequisitos y códigos que ves son de ejemplo hasta cargar la información académica oficial.',
  avisoVistaImportada: 'Vista previa de datos importados. Revisa la información antes de publicarla.',

  queEs: {
    titulo: '¿Qué es una opción para tu carrera?',
    texto: 'Es un orden propuesto para llevar los cursos de tu plan de estudios, repartidos entre semestres y veranos. La universidad diseñó 16 opciones para cada carrera. Todas respetan los prerrequisitos y los electivos; cambian en cuántos veranos usas y en qué momento.',
    distinciones: [
      { titulo: 'Consultar un plan', texto: 'Ver cómo se reparten los cursos en una opción. Es informativo y no te compromete a nada.' },
      { titulo: 'Expresar interés', texto: 'Contarnos qué cursos de verano te gustaría llevar. Nos ayuda a evaluar qué cursos abrir. No es una matrícula.' },
      { titulo: 'Matricularte', texto: 'Inscribirte en los cursos que sí se abrieron, en el portal y en las fechas oficiales.' }
    ]
  },

  beneficios: {
    titulo: '¿Para qué te sirve el verano?',
    tarjetas: [
      { icono: 'icon-certificado-uc.svg', titulo: 'Ponte al día', texto: 'Si tienes un curso pendiente, llevarlo en verano puede ayudarte a volver a tu ritmo para el siguiente semestre, si el curso se ofrece.' },
      { icono: 'icon-tutorial-uc.svg', titulo: 'Equilibra tu carga', texto: 'Adelantar uno o dos cursos en verano te permite llevar semestres más livianos. Es útil si trabajas o tienes otras responsabilidades.' },
      { icono: 'icon-birrete.svg', titulo: 'Avanza hacia tu egreso', texto: 'En ciertas opciones, empezar temprano y seguir el orden del plan podría acercarte al final de tu carrera antes de los cinco años.' }
    ]
  },

  datosClave: [
    { valor: 'Opciones', texto: '16 por carrera' },
    { valor: 'Semestre', texto: 'Hasta 25 créditos' },
    { valor: 'Verano', texto: 'Hasta 11 créditos' }
  ],

  duracion: {
    // OFICIAL: datos generales de la campaña
    general: 'En 14 programas, ciertas combinaciones con dos veranos tempranos permitirían culminar el plan en el semestre 8, aproximadamente cuatro años.',
    excepciones: 'Educación requiere tres veranos. Derecho tiene una duración mínima referencial de aproximadamente cuatro años y medio.',
    supuestos: 'Las opciones se modelaron suponiendo aprobación al primer intento y disponibilidad de ciertas asignaturas fuera de su periodo habitual. Algunas carreras aún no tienen oferta completa hasta el décimo ciclo. Una asignatura incluida en una opción no es una oferta confirmada.'
  },

  // OFICIAL: aviso que va junto al cronograma y dentro del PDF
  avisoPlan: 'Este plan es informativo. El tiempo en que podrías terminar tu carrera depende de tu avance académico, de los requisitos de cada curso y de la oferta disponible. Los cursos de verano se abrirán según la demanda, el aforo mínimo y la programación académica.',

  cursoClave: {
    titulo: 'Cursos clave de tu carrera',
    // OFICIAL (ejemplo de explicación)
    explicacion: 'Este curso habilita asignaturas de los siguientes periodos. Llevarlo y aprobarlo en el momento previsto ayuda a mantener esta opción de avance.',
    siSePostergan: 'Si lo desapruebas o lo postergas, los cursos que dependen de él también se moverán y tu avance podría tomar más tiempo. No es definitivo: tu director de carrera puede ayudarte a encontrar la mejor forma de ponerte al día.'
  },

  interes: {
    titulo: 'Cursos de verano que te interesan',
    // OFICIAL: explicación antes del envío
    explicacion: 'Registrar tu interés nos ayuda a evaluar qué cursos ofrecer en verano. No reserva una vacante ni confirma tu matrícula. La apertura dependerá de la demanda, el aforo mínimo y la programación académica. Si el curso se ofrece, deberás matricularte mediante el proceso regular de la universidad.',
    vacio: 'Todavía no marcaste cursos. Abre una opción de tu carrera y marca "Me interesa llevarlo" en los cursos de verano.',
    autorizacion: 'Autorizo el uso de mis datos para registrar mi interés en cursos de verano y ser contactado sobre su apertura.',
    exito: 'Interés registrado. Gracias: lo usaremos para evaluar qué cursos abrir. Recuerda que todavía no es una matrícula.',
    pendiente: 'Tu interés no se guardó. El registro todavía está pendiente de integración; no se envió ningún dato.',
    error: 'Tu interés no se guardó por un problema de conexión. Inténtalo de nuevo en unos minutos.'
  },

  estadosOferta: {
    incluido: 'Incluido en el plan académico',
    interes: 'Me interesa llevarlo',
    por_confirmar: 'Oferta por confirmar',
    ofertado: 'Curso oficialmente ofertado'
  },

  matricula: {
    titulo: 'Cuatro pasos para llevar cursos en verano',
    pasos: [
      { titulo: 'Explora las opciones de tu carrera', texto: 'Compara cuántos veranos usa cada opción y en qué periodo culmina el plan.' },
      { titulo: 'Registra tu interés', texto: 'Marca los cursos de verano que te gustaría llevar. Así evaluamos cuáles abrir. No es una matrícula.' },
      { titulo: 'Revisa los requisitos', texto: 'Pagos al día, prerrequisitos aprobados y carga dentro del máximo permitido.' },
      { titulo: 'Matricúlate en el portal', texto: 'En las fechas oficiales. Ahí verás qué cursos se abrieron.' }
    ],
    requisitos: ['Pagos al día', 'Prerrequisitos aprobados', 'Máximo 11 créditos en verano', 'Matrícula dentro de las fechas oficiales']
  },

  faq: [
    { p: '¿De verdad puedo egresar en menos tiempo?', r: 'Es posible en ciertas opciones, pero no es automático. En 14 programas, algunas combinaciones con dos veranos tempranos permitirían culminar el plan en el semestre 8, unos cuatro años. Depende de aprobar cada curso a tiempo, de los requisitos de cada curso y de que los cursos se abran. Educación requiere tres veranos, y en Derecho la duración mínima referencial es de unos cuatro años y medio.' },
    { p: '¿Qué significa "ruta" u "opción"?', r: 'Es el orden propuesto para llevar los cursos de tu plan, repartidos entre semestres y veranos. Cada carrera tiene 16 opciones aprobadas por el equipo académico.' },
    { p: '¿Me sirve el verano si ya llevo varios semestres?', r: 'Sí. Aunque las opciones se diseñaron desde el primer semestre, el verano también sirve para ponerte al día o para aligerar tus próximos semestres. Tu director de carrera puede ayudarte a ver cómo aplica a tu caso.' },
    { p: 'Si marco un curso, ¿ya tengo vacante?', r: 'No. Registrar tu interés no reserva una vacante ni confirma tu matrícula. Nos ayuda a evaluar qué cursos abrir según la demanda y el aforo mínimo.' },
    { p: '¿Cuántos créditos puedo llevar?', r: 'Hasta 25 créditos por semestre regular y hasta 11 créditos por verano.' },
    { p: '¿Cuándo es la matrícula de verano?', r: 'Las fechas se publicarán en el calendario académico oficial.' },
    { p: '¿Qué horarios tienen los cursos de verano?', r: 'Los cursos de verano mantienen el mismo rango horario de los semestres regulares.' },
    { p: '¿Dónde veo si se abrió un curso?', r: 'En el portal, al momento de matricularte. En esta página, un curso aparece como "oficialmente ofertado" solo cuando la universidad lo confirma.' },
    { p: 'Tengo cursos desaprobados, ¿qué hago?', r: 'Las opciones suponen aprobación al primer intento, así que tu avance puede ser distinto. Conversa con tu director de carrera: puede orientarte sobre cómo ponerte al día, incluido el verano si el curso se ofrece.' },
    { p: 'Convalidé cursos o vengo de otra carrera', r: 'Tu avance puede no coincidir con ninguna de las opciones publicadas. Tu director de carrera revisará contigo cómo se relacionan con tu caso.' },
    { p: '¿Por qué algunas carreras no muestran todos los semestres?', r: 'Algunas carreras aún no tienen oferta completa hasta el décimo ciclo. La información se irá completando con los datos oficiales.' },
    { p: '¿Egresar antes es titularme antes?', r: 'No necesariamente. La culminación que ves se refiere a completar los cursos del plan de estudios. La titulación tiene sus propios requisitos y plazos.' }
  ],

  contacto: {
    titulo: '¿Tienes dudas sobre tu avance?',                     // OFICIAL
    texto: 'Tu director de carrera o responsable académico puede revisar contigo cómo estas opciones se relacionan con tu caso particular.',
    pendiente: 'Pendiente de actualización',
    acompanamientoTexto: 'Para pagos, matrícula, accesos o problemas con la plataforma.'
  }
};
