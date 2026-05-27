# Roadmap Frontend - Asistente CACIF

> **Nota de Diseño:** Por favor revisa y sigue estrictamente las reglas definidas en [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) antes de maquetar cualquier componente.

## 1. Tareas Generales (Core & UI)
- [x] Configurar paleta de colores oscuros en `tailwind.config.ts` (ya configurado en `src/index.css` con Tailwind v4).
- [x] Crear componentes globales en `src/components/layout/`: `Sidebar.tsx`, `TopHeader.tsx`, `Footer.tsx`.
- [x] Crear componentes UI reutilizables en `src/components/ui/`: `Input.tsx` (con soporte para iconos), `Card.tsx`, `Badge.tsx`, `Button.tsx`, `Avatar.tsx`.
- [x] Configurar esqueleto de servicios globales en `src/services/api.ts`.

## 2. Feature: Autenticación (Login)
- [x] Maquetar vista `app/login/page.tsx`.
- [x] Construir `src/features/auth/components/LoginForm.tsx` y `LoginLogo.tsx`.
- [x] Conectar `LoginForm.tsx` con el endpoint de login y manejar validación de errores. (Actualizado: Usa email/password, sin CORS issues gracias al proxy).

## 3. Feature: Chatbot - Caso de Uso 1 (Orientación y Matchmaking)
- [x] Construir base visual en `src/features/chat/components/`: `MessageList.tsx`, `MessageBubble.tsx`, `ChatInput.tsx`.
- [x] Implementar UI para búsqueda por palabras clave o términos técnicos.
- [x] Crear `components/ui/Badge.tsx` interactivos para filtrar por líneas de investigación oficiales de la FISI.
- [x] Maquetar flujo conversacional para evaluar áreas de interés del alumno y mostrar tarjetas comparativas con la ficha técnica del grupo.

## 4. Feature: Chatbot - Caso de Uso 2 (Gestión de Convocatorias)
- [x] Diseñar UI (ej. carrusel o lista de tarjetas) para mostrar plazas disponibles y perfiles requeridos (`ui_type: 'convocatoria_cards'`).
- [x] Maquetar alertas o timelines visuales para fechas límite de postulación y eventos.
- [x] Implementar botones de acción para redirección al enlace de inscripción oficial.

## 5. Feature: Chatbot - Caso de Uso 3 (Asesoría de Grados y Trámites)
- [ ] Diseñar UI de "Paso a Paso" o Timeline vertical (`ui_type: 'stepper_cards'`) para explicar de forma interactiva el procedimiento administrativo de vinculación de plan de tesis.
- [ ] Crear visualización de Tarjetas de Requisitos (`ui_type: 'requirement_cards'`) con checkboxes visuales inactivos para ilustrar lo que se necesita para convalidar PPP.
- [ ] Maquetar componentes informativos para listar beneficios académicos de forma estructurada.

## 6. Feature: Chatbot - Caso de Uso 4 (Marco Normativo)
- [ ] Diseñar UI de Citas Normativas Enriquecidas (`ui_type: 'citation_cards'`) para mostrar el artículo citado en un bloque destacado (blockquote elegante) separado del texto natural.
- [ ] Configurar tooltips flotantes o enlaces estilizados dentro de las tarjetas que apunten directamente a la página del PDF del Reglamento de la UNMSM.
- [ ] Crear un componente visual de verificación (ej. Checkmark verde o Badge "Resolución Vigente") para confirmar el estado legal de la respuesta.

## 7. Futuras Implementaciones (Escalabilidad)
- [ ] Conectar finalmente `src/features/chat/services/chat.service.ts` con el LLM real, asegurando que se extraigan correctamente el `ui_type` y `ui_data` (Mock actual 100% funcional y persistente).
- [ ] Agregar validaciones de accesibilidad (a11y) y navegación por teclado en todo el chat.
- [ ] Preparar arquitectura para un posible Dashboard Administrativo (`src/features/admin`).
- [ ] Dejar hooks básicos para sistema de notificaciones push o alertas in-app.
- [ ] Diseñar UI para historial avanzado y exportación de transcripciones del chat.
