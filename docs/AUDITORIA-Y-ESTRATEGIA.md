# PTIL / YAPÓ — Guía simple para entender la app, qué falta y el negocio

**Para quién es este documento:** el señor Rolón, socios, inversionistas y cualquier persona sin ser experta en tecnología.  
**Qué vas a encontrar acá:**  
1) Cómo está la app *hoy* (en palabras simples).  
2) Qué falta para probarla en serio con datos reales.  
3) Una lista de prioridades (P0 = urgente, P1 importante, P2 después).  
4) Idea del negocio en Paraguay y del dinero grande (100 millones de dólares), explicado sin vueltas.  
5) Aviso: esto no reemplaza abogado ni contador.

---

## Parte 1 — De qué trata la plataforma (en una frase)

**YAPÓ / PTIL es un sistema para registrar trabajadores informales, con foto, ubicación y clasificación (grupos A, B y C), y luego validarlos con operadores en el territorio.**  
Es como un “padrón laboral con pruebas” que empieza en la web y escala con gente de campo en seccionales.

---

## Parte 2 — ¿Qué ya funciona bien hoy? (traducción sin tecnicismos)

Imaginamos la app como **una casa**:

| Habitación | ¿Qué significa? | Estado hoy |
|------------|-----------------|------------|
| **Entrada (landing)** | Donde la persona se anota: nombre, cédula, WhatsApp, oficio, selfies, GPS. | **Bien.** Los datos se pueden guardar en una base de datos real (PostgreSQL / Neon). |
| **Bodega de fotos** | Subir la selfie sin que “reviente” el servidor. | **Bien.** Se usa almacenamiento de Vercel (Blob). |
| **Consulta pública** | Ver si mi ficha está pendiente o verificada con un código. | **Bien.** |
| **Clasificación A/B/C** | Definir si alguien va más “rápido” por tener título, más “intermedio” o va a capacitación. | **Bien** en la lógica básica. |
| **Panel del operador** | Validar, tomar fichas, etc. | **Avanzado**, conectado en buena parte a la base. |
| **Tableros grandes (dashboards)** | Gráficos, mapas, “Territorio Command”, vista maestro. | **Se ven muy bien**, pero **varias cifras siguen siendo de demostración** (no todo viene de la base todavía). |

**Resumen para el señor Rolón:** *La “fábrica” de fichas ya puede producir en serio; los “televisores del comando” aún cuentan en parte historias de muestra, no el 100 % del reality.*

---

## Parte 3 — Qué le falta para estar “lista al 100 %” con testers y datos reales

Aquí **no es que la app no sirva**: es que para un piloto **serio** hace falta cerrar temas de **seguridad, verdad de los números y reglas del juego**.

### A) Datos reales en los tableros
Hoy parte del sistema de **auditoría, mapa por seccional y algunos KPIs** está como **“relleno de prueba”** hasta que se conecte todo a la misma base donde viven las fichas.  
**En simple:** si vas a decidir plata y territorio mirando el tablero, querés que cada gráfico **mande a la misma verdad**.

### B) Inteligencia artificial para tipificar oficios
Si no se configura una API de IA (por ejemplo OpenAI), el sistema usa una **respuesta simulada**. Para demostrar IA real a un inversionista, hay que **enchufar** el servicio y controlar costo por consulta.

### C) Leer cédula con cámara (OCR)
En pantalla dice que el escaneo viene **“próximamente”**. Hoy la cédula se carga a mano.

### D) Quién entra al dashboard (usuarios y contraseñas serios)
Hoy el acceso a pantallas internas no está armado como un **banco** (login fuerte, permisos en servidor). Para datos sensibles y muchos operadores, hace falta **autenticación profesional**.

### E) WhatsApp automático masivo
El proyecto **guarda** el número y se pueden armar links para chatear, pero **no** está desplegado el envío masivo tipo “empresa verificada de WhatsApp” para miles de mensajes automáticos.

### F) Pruebas automáticas y backups
No hay una “máquina de chequeo” que pruebe todo el sistema cada vez que cambiamos código. En producción conviene **copias de seguridad** y planes si se cae el servidor.

### G) Modo demo (llave maestra)
Existe un modo para llenar datos falsos con una clave. **En pilotos con votantes o fichas reales**, eso debe estar **apagado o bien acotado**.

### H) Ley de datos personales
Cualquier censo de personas necesita **textos de consentimiento**, política de uso y definición de quién es responsable de los datos (con asesor legal).

---

## Parte 4 — Prioridades para el equipo (P0, P1, P2)

**P0 — Sin esto no podés decir que hay piloto serio**  
*(Hacer primero.)*

| # | Tema | Por qué importa |
|---|------|-----------------|
| P0-1 | Base de datos y variables en Vercel (`DATABASE_URL`, Blob, redesplegar) | Sin esto no se guardan fichas en producción. |
| P0-2 | Tablas al día (`prisma db push` o migraciones) y entorno de prueba estable | Evita “pantallas en blanco” y errores raros. |
| P0-3 | Apagar o restringir el modo demo en producción | Evita mezclar datos reales con prueba. |
| P0-4 | Mensaje claro de privacidad/consentimiento en el registro *(con abogado)* | Cumplimiento y confianza. |
| P0-5 | Límite de abuso en APIs públicas (rate limit) básico | Evita que alguien tumbe el servidor a puros envíos. |
| P0-6 | Definir quién valida en campo (operadores) y flujo real de dictamen | El producto no es solo la web, es el **circuito humano**. |

**P1 — Para que los números del comando sean de verdad**

| # | Tema | Por qué importa |
|---|------|-----------------|
| P1-1 | Conectar dashboard Maestro / KPIs / auditoría / mapa seccional a la BD | Decisiones con datos reales, no demos. |
| P1-2 | Login y roles (operador, admin, maestro) en servidor | Seguridad y trazabilidad. |
| P1-3 | IA opcional pero decidida: clave, costos, qué pasa si falla | Credibilidad ante inversionistas y operación. |
| P1-4 | Plan de backup y monitoreo de errores | Menos sustos en vivo. |

**P2 — Mejoras fuertes y escala**

| # | Tema | Por qué importa |
|---|------|-----------------|
| P2-1 | OCR de cédula | Menos fraude y más velocidad de carga. |
| P2-2 | WhatsApp Business / API para mensajes automáticos | Escala de comunicación. |
| P2-3 | Pruebas automáticas (E2E) | Menos bugs al crecer. |
| P2-4 | Importación masiva y administración de seccionales | Cuando el censo sea de verdad territorial nacional. |

---

## Parte 5 — Negocio en Paraguay (simple)

### Por qué tiene sentido un PTIL
En Paraguay hay **mucha gente que trabaja sin contrato formal** o con oficios que nadie “certifica” fácil. Eso es **riesgo para el trabajador** (sin respaldo) y **ruido para quien contrata** (no sabe si sabe).

**PTIL propone:** registrar → clasificar → validar en territorio → dejar un **registro verificable** (quién validó, cuándo, dónde).

### Cómo escala
1. **Piloto** en un área (ej. Gran Asunción): poco volumen, mucho aprendizaje.  
2. **Departamentos** con alianzas locales.  
3. **País** solo si hay reglas claras con instituciones y modelo de ingreso sostenible.

**El cuello de botella no es solo la app:** es **gente capacitada en seccional**, confianza política y **cuánto cuesta validar una ficha bien**.

---

## Parte 6 — Los 100 millones de dólares (qué significa, sin marear)

**100 millones de dólares** es una cifra de **proyecto nacional o regional**, no de “cuatro laptops y una web”.  
No somos asesores legales ni financieros; lo que sigue es un **mapa mental** de en qué se suele gastar plata así:

| Bloque | Idea simple | Para qué sirve |
|--------|-------------|----------------|
| **Tecnología** | Apps, servidores, seguridad, integraciones | Que el sistema aguante y sea confiable. |
| **Censo en seccionales** | Tablets, internet, capacitación, logística | Que la gente de campo pueda registrar y validar. |
| **Marketing y educación** | Marca, talleres, material en guaraní/español | Que la gente entienda y confíe. |
| **Legal y cumplimiento** | Contratos, protección de datos, auditorías | Que no haya problemas con el Estado o con usuarios. |
| **Reserva** | Colchón para imprevistos | Que un error no mate el proyecto. |

**Los montos en guaraníes que dijeron (ej. 5 millones en marketing y 5 en desarrollo)** son chicos si pensamos en 100 M USD: conviene aclarar si es **por mes**, **por trimestre** o **total del arranque**, *y* separar el **gasto mensual del equipo** de la **inversión grande** del acuerdo.

### Socios a 12 millones × 6 meses (cada uno)
- 12 millones de guaraníes **por mes** por socio → son **72 millones por socio en 6 meses** → **144 millones entre los dos** solo en honorarios de socios.  
- Eso es coherente como **plan de retiro del esfuerzo** de dos personas que **lideran y venden** el proyecto.  
Los **dos ingenieros** y la **desarrolladora externa** se suman aparte: ahí el presupuesto depende del **nivel** (junior vs senior) y del **contrato por hitos**.

### Precios de referencia (hipótesis para negociar, no ley)
| Concepto | Idea |
|----------|------|
| Alta en la plataforma | A veces **gratis** para captar; a veces un **monto chico** si incluye validación prioritaria. |
| Validación por operador | **Comisión por ficha aprobada** (en el propio README se habla del orden de miles de guaraníes como referencia interna). |
| “Paquete seccional” (asesoría + reportes) | **Contrato mensual o trimestral** según cuántas seccionales y cuántos operadores entren. |
| Jornada de censo en seccional | **Precio por evento** o **paquete** con N puntos de registro. |

---

## Parte 7 — ¿Cuándo recupera el señor Rolón la inversión?

**No hay una fecha mágica sin números.** Depende de:

- cuántas fichas **validadas** salen por mes,
- cuánto se **cobra** por validación, por contrato municipal/partidario o por B2B (empresas, seguros),
- cuánto **cuesta** el operador y la tecnología por cada ficha.

**Orden de idea (no promesa):**

- **12 a 18 meses:** ver si el modelo **engancha** (volumen + primeros ingresos recurrentes).  
- **24 a 36 meses:** visión de retorno **si** ya hay contratos serios y el dato se usa para algo que pague (no solo por “tener base de datos”).

El **censo en seccionales** ayuda a **llenar rápido** el sistema; el retorno viene cuando **alguien paga** por ese orden y esa confianza.

---

## Parte 8 — Roles de los dos socios (lenguaje llano)

| Socio | Rol típico | Qué aporta al negocio |
|-------|------------|------------------------|
| **1** | Proyector, vendedor, analista de inversiones, asesor | Relaciones, lectura de riesgo, cierre con inversores y aliados, narrativa del proyecto. |
| **2** | Gestor, administrador, vendedor prospectador | Operación del día a día, coordinación de campo, caja y disciplina de ejecución. |

**Los ingenieros** vuelven técnica estable posible; **la desarrolladora externa** acelera cierre de apps si hay presupuesto y plazos firmes.

---

## Parte 9 — Disclaimer (importante)

Este documento **resume** el estado del **código y el producto** y ofrece **marcos de negocio**.  
**No** es asesoramiento legal, contable, fiscal ni de inversión.  
Para **100 M USD y contratos a contracuerdo**, hacen falta **asesores en Paraguay**, modelo en Excel y revisión contractual.

---

## Dónde seguir en el repo

- **Base de datos en la nube:** [NEON-SETUP.md](NEON-SETUP.md)  
- **Visión del producto:** [../README.md](../README.md)

---

*Última actualización: documento redactado para lectura simple; prioridades revisables con el equipo de producto.*
