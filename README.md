# yap--Programa-Territorial-de-idoneidad-Laboral-PTIL-YAPÓ - Programa Territorial de Idoneidad Laboral (PTIL) 🇵🇾

**Nota:** En la interfaz del dashboard el producto se presenta como **Territorio Command**. El **Design System** que unifica colores, componentes y patrones se llama **SENTINEL360** (ver `docs/DESIGN-SYSTEM-SENTINEL360.md`).

📋 Descripción General
YAPÓ es una plataforma Insurtech y de gestión territorial desarrollada por Guaraní Global Tech (GGT). El sistema implementa el Operativo PTIL, un censo digital diseñado para organizar y formalizar la fuerza laboral informal de Asunción.

A través de una arquitectura Mobile-First, la plataforma permite capturar, validar y clasificar a miles de trabajadores en tiempo real, transformando el censo tradicional en un activo de inteligencia política y social para la toma de decisiones estratégicas.

🚀 Funcionalidades Principales
1. Sistema de Captura Multimodal (Landing Page)
Interfaz ultra-simplificada optimizada para dispositivos de baja gama, diseñada para el auto-registro o registro vía operadores.

Validación de Identidad: Integración con OCR para lectura de Cédulas de Identidad y Biometría Facial.

YAPÓ Selfie: Sistema de captura de evidencia laboral que obliga al uso de la cámara en vivo (bloqueo de galería) para garantizar la veracidad del oficio.

Geolocalización Obligatoria: Captura de coordenadas GPS exactas y metadatos en cada registro para evitar fraudes territoriales.

2. Clasificación Inteligente (Matriz A-B-C)
Utiliza un motor de IA (OpenAI/Gemini) para procesar descripciones de oficios informales y categorizarlos automáticamente:

Grupo A (Certificado): Trabajadores con títulos oficiales (SNPP/SINAFOCAL).

Grupo B (Historial): Trabajadores empíricos con experiencia comprobable (Generan mayor lealtad política).

Grupo C (Capacitación): Registros sin respaldo que se derivan automáticamente a programas de formación.

3. Dashboard Pro: Control de Mandos Medios
Vista exclusiva para el cliente (referente) que permite auditar su estructura de poder:

Ranking de Lealtad: Visualización en tiempo real de la efectividad de Presidentes de Seccional, Convencionales y Miembros.

Gestión de Operadores: Seguimiento de los "Caza Talentos" (Dirigentes de Base) y sus comisiones por validación exitosa (5.000 Gs).

Mapa de Calor: Visualización de densidad poblacional de leales por barrio y seccional.

4. Dashboard Maestro (Camilo)
Interfaz de nivel superior para la gestión de toda la ciudad (44 Seccionales), permitiendo comparar la fuerza de distintos concejales y aliados.

🛠️ Stack Tecnológico
Frontend: Next.js 14 (App Router) y Tailwind CSS para una UI rápida y responsiva.

Backend: Node.js con Edge Functions en Vercel para procesamiento de baja latencia.

Base de datos (inscripción de subscriptores): Prisma ORM con **PostgreSQL** (Neon, Supabase o Vercel Postgres). Cada ficha tiene un **código de seguridad** (uso interno/traspaso a YAPÓ oficial) y un **código de verificación** (consulta pública del estado). **Para que la inscripción funcione en Vercel:** (1) Creá una base en [Neon](https://neon.tech) o [Supabase](https://supabase.com), (2) En Vercel → Project → Settings → Environment Variables agregá `DATABASE_URL` con la URL de conexión, (3) Creá un Blob store (Storage → Blob) y enlazalo al proyecto para las selfies. **Primera vez (local o tras crear la DB):** `npm run db:push` para crear las tablas. Comandos: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`.

Inteligencia Artificial: Modelos multimodales para tipificación de oficios y auditoría de imágenes.

Mapas: Leaflet.js / Mapbox para la representación de datos geográficos en tiempo real.

Comunicación: Integración con WhatsApp API para notificaciones automáticas de bienvenida y validación.

📦 Despliegue en Vercel (para que la inscripción no falle)
- **Guía paso a paso**: Ver **[docs/NEON-SETUP.md](docs/NEON-SETUP.md)** (crear base en Neon, configurar Vercel, crear tablas).
- **DATABASE_URL**: Base PostgreSQL en [Neon](https://neon.tech) (gratis); agregala en Vercel → Settings → Environment Variables. Sin esto la inscripción devuelve error.
- **BLOB_READ_WRITE_TOKEN**: En Vercel → Storage → Blob, creá un store y enlazalo al proyecto (evita error 413 en selfies).
- Tras configurar DATABASE_URL, ejecutá una vez `npx prisma db push` (con la misma URL en `.env` local) para crear las tablas.

🛡️ Propiedad y Blindaje
Este software y los datos recolectados se rigen bajo la Cláusula de Autonomía de GGT. La gestión financiera, los fondos de reserva del Seguro YAPÓ Insurtech y la administración de datos son competencia privada de Guaraní Global Tech Corporation.
