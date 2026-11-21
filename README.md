# Enlace Rosa

Plataforma web de **EIRA Movimiento Rosa A.C.** para coordinar jornadas de detección oportuna de cáncer de mama y cervicouterino con gobiernos municipales. Cada municipio sabe qué entregar, cómo y para cuándo, y EIRA detecta riesgos antes de movilizar al equipo.

> Estado: demo funcional. Los datos de ejemplo (Naucalpan, Toluca y San Pedro Cholula) se cargan solos.

## Tabla de contenidos

1. [Qué hace](#qué-hace)
2. [Accesos de demostración](#accesos-de-demostración)
3. [Guía de uso](#guía-de-uso)
4. [Reglas de negocio](#reglas-de-negocio)
5. [Instalación y ejecución local](#instalación-y-ejecución-local)
6. [Despliegue en Vercel](#despliegue-en-vercel)
7. [Variables de entorno](#variables-de-entorno)
8. [Arquitectura](#arquitectura)
9. [Limitaciones conocidas](#limitaciones-conocidas)

## Qué hace

Hay dos perfiles con vistas separadas:

| Perfil | Ruta | Acceso | Para qué sirve |
|---|---|---|---|
| **Equipo EIRA** | `/eira` | Usuario y contraseña | Panel global: crear jornadas, revisar documentos, ver alertas operativas y atender dudas |
| **Enlace Municipal** | `/gob` | ID único, sin contraseña | Panel de su jornada: subir documentos, llenar la carta y la ficha de campo, pedir ayuda |

Funciones principales:

- **Tablero EIRA** con las jornadas ordenadas por urgencia, semáforo de riesgo (Luz Verde Logística, En preparación, Riesgo de reprogramación) y bandeja de documentos por revisar.
- **Buscador de jornadas** en la barra lateral y en el tablero (por municipio, estado, sede o ID).
- **Estado de la jornada**: *En progreso* o *Completada*. Cambia solo cuando pasa el día de realización.
- **Asistente de 3 pasos** para crear una jornada, con requisitos y fechas límite calculadas automáticamente.
- **Portal municipal en 3 columnas** (Jurídico y administrativo, Identidad y convocatoria, Evidencia del espacio) con requisitos en acordeón.
- **Revisión de documentos**: EIRA aprueba u observa cada versión, con motivo obligatorio al observar. Todo queda en un historial.
- **Carta compromiso** que el municipio llena, firma con el mouse y envía; se descarga como PDF de una hoja.
- **Ficha del lugar y la comunidad** con lógica condicional que activa requisitos y alertas.
- **Estimado de personas a atender**, modificable hasta 5 días antes de la visita, con aviso a EIRA.
- **Dudas del municipio** hacia EIRA, con bandeja propia.

## Accesos de demostración

**Enlace Municipal** (en `/gob`, solo se escribe el ID):

| Municipio | ID único | Situación de partida |
|---|---|---|
| Naucalpan de Juárez, Estado de México | `naucalpan-2026` | Carta observada, pendientes críticos y una duda sin responder |
| Toluca, Estado de México | `toluca-2026` | Todo aprobado (Luz Verde) |
| San Pedro Cholula, Puebla | `cholula-2026` | Recién creada, con pocos avances |
| Atizapán de Zaragoza, Estado de México | `atizapan-2026` | Jornada ya realizada (aparece como Completada en EIRA) |

**Equipo EIRA** (en `/login-eira`):

- Usuario: `eira`
- Contraseña: `rosa2026`

Son credenciales de respaldo para la demo. En producción cámbialas con las [variables de entorno](#variables-de-entorno).

## Guía de uso

### Como persona del Equipo EIRA

1. Entra a `/login-eira` con tu usuario y contraseña. Cualquier ruta bajo `/eira` te redirige ahí si no tienes sesión.
2. **Tablero** (`/eira`): ve las jornadas por urgencia, con la barra de búsqueda y los filtros *En progreso* y *Completadas*. Las completadas pasan al final de la lista y no cuentan en las métricas. Los filtros muestran las que vencen en menos de 72 h, las que tienen observaciones y las que están listas. La bandeja de la derecha lista los documentos recibidos esperando revisión.
3. **Buscar una jornada**: escribe en el buscador de la barra lateral y elige el resultado.
4. **Crear una jornada** (botón "Crear jornada"):
   - *Paso 1*: municipio, estado, sede, dirección, fecha, estimado de personas, servicios y datos de la persona enlace (correo, celular, WhatsApp, medio preferido).
   - *Paso 2*: módulos opcionales (Tamizaje Rosa, Comunidad indígena, Estancia de más de un día) y vista previa de los requisitos con sus fechas límite.
   - *Paso 3*: confirmación y generación del **ID único**, que aparece al terminar con un botón para copiarlo. Compártelo con la persona enlace del municipio.
5. **Expediente** (`/eira/jornadas/[id]`):
   - Pestaña *Expediente y checklist*: aprueba u observa cada documento recibido, consulta el historial, los contactos y los servicios. En la tarjeta "Carta compromiso" puedes **editar la plantilla, previsualizarla en PDF** y descargarla (si cambias datos, la firma del municipio se invalida).
   - Pestaña *Condiciones y alertas*: tarjetas de alertas operativas generadas por la ficha de campo, junto con las respuestas del municipio.
6. **Dudas sin responder**: el aviso de la barra lateral abre `/eira/preguntas`, donde marcas cada duda como atendida.
7. Cierra sesión con el botón de la barra lateral.

### Como persona Enlace Municipal

1. Entra a `/gob` e ingresa tu ID único. Te lleva a tu panel.
2. **Tablero de tu jornada**: tres columnas con tus requisitos. Cada uno se ve cerrado con su nombre y estatus. Haz clic para abrirlo y ver la descripción, el criterio de aprobación, la fecha límite, la última actualización, el historial y los botones de acción.
3. **Estatus**: *Pendiente* (aún no entregas), *Recibido* (EIRA lo está revisando), *Observaciones* (hay algo que corregir; se muestra el motivo) y *Aprobado*.
4. **Subir un documento**: abre el requisito y usa "Subir documento" o "Subir nueva versión". Pasa a *Recibido*.
5. **Estimado de personas**: elige el rango (menos de 50, 50 a 100, 100 a 200, más de 200). Puedes cambiarlo hasta 5 días antes de la visita; cada cambio avisa a EIRA.
6. **Carta compromiso** (`/gob/[ID]/carta`):
   - Llena autoridad, cargo, sede, horarios, mobiliario, transporte y seguridad. La vista previa se actualiza al escribir.
   - Las cláusulas 5, 6 y 7 son institucionales de EIRA y no se pueden editar.
   - Firma con el mouse o el dedo y pulsa "Firmar y enviar a EIRA".
   - "Descargar PDF" baja la última versión guardada. También puedes firmarla y sellarla a mano y subir el escaneo.
   - Si cambias los datos después de firmar, la firma se invalida y debes firmar de nuevo.
7. **Ficha del lugar y la comunidad** (`/gob/[ID]/ficha-campo`): responde instalaciones y comunidad. Antes de enviar, la pantalla te avisa qué se activará con tus respuestas.
8. **"Tengo una duda"**: dentro de cada requisito, escribe tu pregunta; llega al equipo de EIRA.

## Reglas de negocio

**Fechas límite** (calculadas hacia atrás desde el día de la jornada, D, a las 18:00 h, hora de México):

| Plazo | Ejemplos de requisitos |
|---|---|
| D-15 | Ficha de condiciones, traductora (módulo comunidad indígena) |
| D-10 | Carta compromiso, permiso de espacio, Protección Civil, Jurisdicción Sanitaria, resguardo nocturno |
| D-5 | Confirmación de persona enlace y transporte, fotografías del espacio, ruta de la unidad (Tamizaje Rosa) |

**Semáforo de la jornada**

- *Luz Verde Logística*: todos los requisitos críticos están aprobados.
- *Riesgo de reprogramación*: la carta compromiso está observada o a menos de 72 h sin aprobar, o hay críticos a menos de 48 h o con observaciones. EIRA no debe movilizar personal ni cubrir viáticos.
- *En preparación*: faltan críticos, pero aún hay tiempo.

**Progreso**: un requisito aprobado cuenta 100 %; uno recibido (en revisión), 50 %.

**Lógica condicional de la ficha de campo** (al enviarla):

1. Si se habla una **lengua indígena**: se activa el requisito de promotora bilingüe o traductora y EIRA recibe una alerta.
2. Si hay problemas de **electricidad, acceso o privacidad**: las 3 fotografías del lugar pasan a ser obligatorias.
3. Si **no hay internet ni señal**: EIRA recibe la alerta "Operación en modo sin conexión".
4. También se generan alertas por planta eléctrica requerida, transporte comunitario, acceso 4×4, resguardo nocturno, personal femenino, falta de baños o agua y espacio sin techo.

**Estimado de personas**: como referencia, mastografía para mujeres de 40 a 69 años y exploración clínica o Papanicolaou para mujeres de 25 años o más.

## Instalación y ejecución local

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
```

Para probar la versión de producción:

```bash
npm run build
npm run start      # http://localhost:3000
```

Otros comandos:

```bash
npm run typecheck  # revisión de tipos con TypeScript
```

Para restaurar los datos de demostración, inicia sesión como EIRA y usa el botón de la flecha circular en la parte inferior de la barra lateral.

Sin configuración extra, los datos se guardan en el directorio temporal del sistema (`enlace-rosa-data.json`) y se reinician con la demo si el esquema cambia.

## Despliegue en Vercel

1. Importa el repositorio en Vercel (Next.js se detecta solo).
2. **Agrega una base de datos compartida**: en tu proyecto ve a *Storage* o *Marketplace*, agrega **Upstash Redis** y conéctalo. Vercel crea `KV_REST_API_URL` y `KV_REST_API_TOKEN` por ti.
3. Define las credenciales de EIRA (ver abajo) y despliega.

Sin el paso 2 la app funciona, pero cada instancia serverless guarda sus propios datos: una jornada recién creada puede dar 404 al abrirla y los cambios no se ven entre pantallas.

## Variables de entorno

| Variable | Para qué sirve | Valor si falta |
|---|---|---|
| `EIRA_USER` | Usuario del Equipo EIRA | `eira` |
| `EIRA_PASSWORD` | Contraseña del Equipo EIRA | `rosa2026` |
| `EIRA_SECRET` | Clave para firmar la cookie de sesión | un valor fijo de demostración |
| `KV_REST_API_URL` y `KV_REST_API_TOKEN` | Base de datos Redis compartida (Vercel KV o Upstash) | se usa `/tmp` y memoria |
| `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` | Alternativa a las dos anteriores | se usa `/tmp` y memoria |

En producción, cambia siempre `EIRA_USER`, `EIRA_PASSWORD` y `EIRA_SECRET`.

## Arquitectura

Next.js 15 (App Router) con React 19, TypeScript y Tailwind CSS 3. Íconos con `lucide-react`; PDF con `jspdf`.

```
src/
  app/
    page.tsx                 Portada con acceso a ambos perfiles
    login-eira/              Inicio de sesión de EIRA
    eira/                    Panel de EIRA (protegido por middleware)
      jornadas/nueva/        Asistente de creación de jornadas
      jornadas/[id]/         Expediente, pestañas y descarga de la carta en PDF
      preguntas/             Dudas de los municipios sin responder
    gob/                     Acceso del municipio por ID único
      [token]/               Tablero de 3 columnas con acordeones
      [token]/carta/         Generador de carta compromiso, firma y PDF
      [token]/ficha-campo/   Ficha del lugar y la comunidad
  lib/
    db.ts                    Persistencia (Redis si está configurado; /tmp y memoria si no)
    actions.ts               Server Actions (subir, aprobar, observar, carta, ficha, etc.)
    auth.ts, auth-actions.ts Sesión de EIRA, ID del municipio y protección de acciones
    catalogo.ts              Requisitos, módulos, servicios y rangos de personas
    logica.ts                Progreso, semáforo y construcción de requisitos
    ficha.ts                 Reglas condicionales de la ficha de campo
    carta.ts, clausulas.ts   Generación del PDF y cláusulas institucionales fijas
    fechas.ts                Fechas en hora de México
    seed.ts                  Datos de demostración
  middleware.ts              Redirige /eira/* a login si no hay sesión
```

Puntos de diseño:

- **Sin base de datos tradicional**: todo el estado es un único documento JSON versionado (`esquema`). Si cambia la estructura, se sube `ESQUEMA` en `seed.ts` y los datos guardados se reinician con la demo.
- **Datos siempre frescos**: las páginas se renderizan en cada petición y un componente refresca la vista cuando cambia la versión de los datos (`/api/version`).
- **Seguridad**: las acciones exclusivas de EIRA (aprobar, observar, crear, reiniciar) exigen sesión válida aunque se invoquen directamente.

## Limitaciones conocidas

- Es una demo: el acceso del municipio depende solo del ID, y las credenciales de respaldo son públicas.
- La subida de documentos registra el nombre y el tamaño del archivo; **no almacena el archivo** en sí. La carta firmada digitalmente sí genera un PDF real bajo demanda.
- No existen recordatorios automáticos ni notificaciones por correo o WhatsApp; los avisos a EIRA se muestran dentro de la plataforma.
- Sin Redis (o equivalente) configurado, los datos no se comparten entre instancias en Vercel.
- No existe el estado "Rechazado" para los requisitos; se usa "Observaciones".
- La ficha de campo es un formulario en pantalla, no una plantilla PDF.
