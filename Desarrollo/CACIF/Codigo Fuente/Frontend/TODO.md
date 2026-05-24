# Roadmap Frontend - Asistente CACIF

> **Nota de Diseño:** Por favor revisa y sigue estrictamente las reglas definidas en [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) antes de maquetar cualquier componente.

## 1. Tareas Generales (Core & UI)
- [x] Configurar paleta de colores oscuros en `tailwind.config.ts` (ya configurado en `src/index.css` con Tailwind v4).
- [x] Crear componentes globales en `src/components/layout/`: `Sidebar.tsx`, `TopHeader.tsx`, `Footer.tsx`.
- [x] Crear componentes UI reutilizables en `src/components/ui/`: `Input.tsx` (con soporte para iconos), `Card.tsx`, `Badge.tsx`, `Button.tsx`, `Avatar.tsx`.
- [x] Configurar esqueleto de servicios globales en `src/services/api.ts`.

## 2. Feature: Autenticación (Login)
- [ ] Maquetar vista `app/login/page.tsx`.
- [ ] Construir `src/features/auth/components/LoginForm.tsx` y `LoginLogo.tsx`.
- [ ] Dejar preparado `src/features/auth/services/auth.service.ts` (solo firmas de funciones/mocks).

## 3. Feature: Chatbot - Caso de Uso 1 (Orientación y Matchmaking)
- [ ] Construir base visual en `src/features/chat/components/`: `MessageList.tsx`, `MessageBubble.tsx`, `ChatInput.tsx`.
- [ ] Implementar UI para búsqueda por palabras clave o términos técnicos.
- [ ] Crear `components/ui/Badge.tsx` interactivos para filtrar por líneas de investigación oficiales de la FISI.
- [ ] Maquetar flujo conversacional para evaluar áreas de interés del alumno y mostrar tarjetas comparativas con la ficha técnica del grupo.

## 4. Feature: Chatbot - Caso de Uso 2 (Gestión de Convocatorias)
- [ ] Diseñar UI (ej. carrusel o lista de tarjetas) para mostrar plazas disponibles y perfiles requeridos.
- [ ] Maquetar alertas o timelines visuales para fechas límite de postulación y eventos.
- [ ] Implementar botones de acción para redirección al enlace de inscripción oficial.

## 5. Feature: Chatbot - Caso de Uso 3 (Asesoría de Grados)
- [ ] Diseñar tarjetas o flujos paso a paso para explicar el procedimiento administrativo de vinculación de plan de tesis.
- [ ] Crear visualización de requisitos para convalidar investigación como prácticas pre-profesionales.
- [ ] Maquetar componentes informativos para listar beneficios académicos (reconocimientos, puntajes, certificaciones).

## 6. Feature: Chatbot - Caso de Uso 4 (Marco Normativo)
- [ ] Diseñar tablas o tarjetas comparativas para explicar diferencias, deberes y derechos entre miembro titular, adherente y estudiante.
- [ ] Configurar UI para formatear citas y respuestas basadas en el Reglamento General de Grupos de Investigación de la UNMSM.
- [ ] Crear un componente visual de verificación (ej. Checkmark verde o Badge) para confirmar si un grupo tiene Resolución de Decanato vigente.

## 7. Futuras Implementaciones (Escalabilidad)
- [ ] Preparar arquitectura para un posible Dashboard Administrativo (`src/features/admin`).
- [ ] Dejar hooks básicos para sistema de notificaciones push o alertas in-app.
- [ ] Diseñar UI para historial avanzado y exportación de transcripciones del chat.
- [ ] Dejar preparado `src/features/chat/services/rag.service.ts` para la futura conexión con el backend IA.
