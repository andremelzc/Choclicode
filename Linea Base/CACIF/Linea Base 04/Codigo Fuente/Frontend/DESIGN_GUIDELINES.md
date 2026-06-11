# Reglas de Diseño y Estética (UI/UX) - Asistente CACIF

Este proyecto utiliza **Tailwind CSS v4**. Toda la paleta de colores y fuentes ya está configurada globalmente mediante la directiva `@theme` en el archivo CSS principal (ej. `index.css` o `global.css`). 

> **⚠️ IMPORTANTE:** NUNCA inventes colores hexadecimales ni uses la paleta por defecto de Tailwind si existe una variable semántica definida para ese propósito.

## 1. Mapeo Estricto de Colores Base
- **Fondo principal de la App:** Usa `bg-background`.
- **Barra lateral (Sidebar):** Usa `bg-sidebar`.
- **Tarjetas, modales y contenedores secundarios:** Usa `bg-surface`.
- **Bordes divisores:** Usa `border-border`.

## 2. Tipografía y Textos
- **Fuente principal:** Usa la fuente por defecto configurada (`Inter`).
- **Texto principal:** (títulos, párrafos, mensajes): Usa `text-foreground`.
- **Texto secundario:** (fechas, placeholders, notas pequeñas): Usa `text-muted-foreground`.

## 3. Área del Chatbot (UI Específica)
- **Burbuja de la IA:** Usa `bg-chatbot` para el fondo del mensaje.
- **Burbuja del Usuario:** Usa el color primario (ej. `bg-primary-600` o `bg-primary`) con texto blanco.
- **Input de texto inferior:** Debe ser oscuro, con un placeholder en `text-muted-foreground` y el botón de enviar usando `bg-primary`.

## 4. Estados y Alertas (Basado en Mockups)
- **Alertas Normativas / Restricciones:** Usa bordes y textos de la escala de warning (`border-warning`, `text-warning`) o destructive (`border-destructive`, `text-destructive`). Los fondos de estas alertas deben ser transparentes pero con un borde sutil y un icono del color correspondiente.
- **Botones de acción / Sugerencias (Chips):** Usa un fondo transparente con `border-border`, y al hacer hover o estar activos, aplica un brillo o cambio a la escala `primary` o `glow` (`border-primary-500` o `border-glow`).

## 5. Estructura y Espaciado
- El diseño es **"clean" y minimalista**. Mantén un padding consistente (ej. `p-4` o `p-6`).
- Usa bordes redondeados (`rounded-lg` o `rounded-xl`) para suavizar los contenedores, botones y burbujas de chat.
- **Evita las sombras (box-shadow) pesadas.** La separación visual se logra mediante el contraste de los fondos oscuros (`background`, `sidebar`, `surface`) y los bordes sutiles (`border-border`).
