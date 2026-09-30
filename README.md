# Landing · Opciones para adelantar la carrera (Modalidad A Distancia)

Landing informativa por carrera, construida según el documento oficial de la campaña. Presenta las 16 opciones aprobadas de cada carrera; **no evalúa la situación individual del estudiante, no pide datos académicos para mostrar las opciones, no matricula ni reserva vacantes**.

## Cómo abrirla

- **En la computadora:** doble clic en `index.html`. Funciona sin servidor.
- **En Netlify:** arrastra la carpeta completa (`landing-oficial`) a *Deploys* del proyecto.

## Estructura

```
index.html              Landing (recorrido del estudiante)
importar.html           Importador del Excel oficial (uso interno)
css/estilos.css         Estilos mobile first
js/config.js            Configuración del piloto: límites, fechas, endpoints, contactos
js/textos.js            Todos los textos visibles (editables por Comunicación)
js/modelo.js            Índices, cursos clave, culminación, grupos, estados de oferta, validación
js/analitica.js         Eventos a window.dataLayer (+ sendBeacon opcional)
js/interes.js           Envío del interés (POST JSON)
js/pdf.js               PDF "Descargar este plan"
js/app.js               Interfaz
js/importar.js          Conversión del Excel al modelo de datos
data/datos-oficiales.js Datos oficiales (null hasta cargar el Excel)
data/datos-demo.js      Carrera de demostración con 16 opciones ficticias
```

## Qué funciona

- Portada con el mensaje oficial y los datos generales de la campaña.
- Explicación de qué es una opción y la diferencia entre consultar un plan, expresar interés y matricularse.
- Selector de carrera agrupado por área (catálogo cargable).
- Comparación de las 16 opciones, agrupadas por cantidad de veranos, con filtro, pista S/V, culminación referencial, carga y cursos en verano.
- Detalle de cada opción: línea de tiempo por año, semestre y verano, con cursos, créditos y etiquetas (curso clave, electivo y estado de oferta).
- Cursos clave con sus asignaturas dependientes (calculadas desde los prerrequisitos).
- Marcado de cursos de verano, control del máximo de 11 créditos por verano y formulario de interés con autorización de datos.
- PDF "Descargar este plan" con el aviso oficial y marca de demostración.
- Contacto del director por carrera y de Acompañamiento al estudiante, o "Pendiente de actualización".
- Importador: descarga de plantilla, lectura, reporte de errores y avisos, vista previa y exportación de `datos-oficiales.js`.
- Accesibilidad: foco visible, objetivos de 44 px, `aria-live`, `details/summary`, `prefers-reduced-motion` y sin desplazamiento horizontal a 375 px.

## Qué es de demostración

- `data/datos-demo.js` contiene:
  - **El catálogo real de las 16 carreras** de la modalidad A Distancia, tal como aparecen en su web, con enlace a cada carrera y las notas oficiales de duración de Derecho y Educación.
  - **Opciones de ejemplo solo para Ingeniería de Sistemas e Informática y Administración.** Los cursos y créditos se tomaron de los catálogos PDF publicados en la web (pueden no corresponder al plan vigente; en Administración, los créditos del ciclo 4 deben verificarse). **Los códigos, prerrequisitos, cursos clave y las 16 opciones son supuestos del prototipo**, calculados con 25 créditos por semestre (22 con tres o más veranos), 11 por verano y un adelanto máximo de tres ciclos. No son las rutas aprobadas.
  - Las otras 14 carreras aparecen con "Opciones por publicar".
- Mientras se usan estos datos se muestra la franja rosada de aviso, cada carrera de ejemplo lleva su nota de origen, los códigos se muestran como "Código por confirmar" y el PDF lleva la marca DEMOSTRACIÓN.

## Qué falta para publicar

| Pendiente | Dónde se configura |
|---|---|
| Excel oficial de las 256 rutas (16 carreras) | `importar.html` → `data/datos-oficiales.js` |
| Cursos clave por carrera | Hoja Cursos, columna `curso_clave` |
| Contacto del director o responsable académico por carrera | Hoja Contactos |
| Contacto de Acompañamiento al estudiante | `config.acompanamiento` |
| Endpoint del registro de interés | `config.interes.endpoint` |
| Política de privacidad | `config.interes.politicaPrivacidadUrl` |
| Fechas del registro de interés y de la matrícula | `config.calendario` |
| Endpoint de analítica (opcional) | `config.analitica.endpoint` |
| Ocultar la demostración | `config.mostrarEjemplos = false` |

### Contrato del endpoint de interés

`POST` JSON con `{ fecha, fuenteDatos, carrera:{id,nombre}, cursos:[{codigo,nombre,creditos,verano,opcionId,opcionNombre}], contacto:{nombres,apellidos,correo,celular}, autorizacion:true }`.
Debe responder **2xx con `{ "ok": true }`** solo si guardó el registro. Cualquier otra respuesta se muestra como "Tu interés no se guardó".

## Eventos (prefijo `rfe_`)

`carrera_consultada`, `comparacion_filtro`, `opcion_abierta`, `comparacion`, `plan_descargado`, `curso_verano_marcado`, `curso_verano_desmarcado`, `interes_registrado` (solo con confirmación del servidor), `interes_no_guardado`, `contacto_solicitado`, `faq_abierta`, `cta_portada`, `cta_cabecera`. No se envían datos personales ni porcentajes de elegibilidad.

## Cinco tareas de prueba con estudiantes

1. **Entender la propuesta:** "Mira la primera pantalla durante 10 segundos. ¿Qué te ofrece esta página?" Esperado: que puede explorar formas de adelantar cursos, incluidos los veranos, sin promesas de terminar en 4 años.
2. **Comparar opciones:** "Elige tu carrera. ¿Cuál es la diferencia entre la opción sin veranos y una con dos veranos?" Esperado: identifica la cantidad de veranos y la culminación referencial.
3. **Curso clave:** "¿Qué curso no deberías postergar y por qué?" Esperado: nombra el curso clave y explica que habilita otros cursos.
4. **Interés frente a matrícula:** "Marca un curso de verano y registra tu interés. ¿Ya tienes vacante?" Esperado: responde que no, que es solo interés y que debe matricularse en el portal.
5. **Pedir ayuda:** "Tienes un curso desaprobado y no sabes qué opción te sirve. ¿Qué harías?" Esperado: encuentra el contacto del director de carrera.
