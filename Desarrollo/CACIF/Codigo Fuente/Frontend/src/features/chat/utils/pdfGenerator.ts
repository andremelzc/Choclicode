import { jsPDF } from "jspdf";
import type { Message } from "../../../types/chat";

function cleanTextForPDF(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1")     // italic
    .replace(/`(.*?)`/g, "$1")      // code blocks
    // Remove emojis, symbols, and surrogate pairs that aren't supported in standard PDF Helvetica
    .replace(/[\uD800-\uDFFF\u2600-\u27BF]/g, "")
    .normalize("NFC");
}

export function downloadChatPDF(title: string, messages: Message[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 0;

  // 1. Cabecera Premium (Solo en la primera página)
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("CACIF", margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("Reporte de Conversación · Asistente de Investigación FISI", margin, 28);

  y = 52; // Inicio de contenido debajo de la cabecera

  // 2. Tarjeta de Metadatos
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text("CONVERSACIÓN:", margin + 8, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(cleanTextForPDF(title), margin + 38, y + 8);

  const dateStr = new Date().toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("EXPORTADO EL:", margin + 8, y + 15);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, margin + 38, y + 15);

  y += 32; // Separación para los mensajes

  // 3. Renderizado de Mensajes en Burbujas / Bloques
  messages.forEach((msg) => {
    const isUser = msg.role === "user";
    const senderName = isUser ? "Usuario" : "Asistente CACIF";
    const cleanedText = cleanTextForPDF(msg.content);
    
    // Configuración de dimensiones
    const innerPadding = 6;
    const textWidth = contentWidth - 2 * innerPadding - 4; // margen interno extra para el borde izquierdo
    const lines = doc.splitTextToSize(cleanedText, textWidth);
    const lineHeight = 5.5;
    const textHeight = lines.length * lineHeight;
    
    const blockHeight = textHeight + 16; // espacio para label + padding

    // Si no cabe en la página, saltar de página antes de dibujar el bloque
    if (y + blockHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    // Fondo del bloque
    if (isUser) {
      doc.setFillColor(239, 246, 255); // Celeste muy claro (Blue-50)
      doc.setDrawColor(219, 234, 254); // Blue-100
    } else {
      doc.setFillColor(243, 244, 246); // Gris claro (Gray-100)
      doc.setDrawColor(229, 231, 235); // Gray-200
    }
    doc.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, "FD");

    // Línea de acento lateral (borde izquierdo de color)
    if (isUser) {
      doc.setFillColor(37, 99, 235); // Azul primary (Blue-600)
    } else {
      doc.setFillColor(16, 185, 129); // Esmeralda (Emerald-500)
    }
    doc.rect(margin, y, 3, blockHeight, "F");

    // Nombre del emisor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    if (isUser) {
      doc.setTextColor(29, 78, 216); // Blue-700
    } else {
      doc.setTextColor(6, 95, 70); // Emerald-800
    }
    doc.text(senderName, margin + 8, y + 7);

    // Cuerpo del mensaje
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // Slate-700
    
    let textY = y + 13;
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], margin + 8, textY);
      textY += lineHeight;
    }

    y += blockHeight + 6; // Margen inferior entre bloques de chat
  });

  // 4. Numeración de Páginas en el Pie de Página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Nombre seguro para el archivo
  const safeTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  doc.save(`chat-cacif-${safeTitle || "conversacion"}.pdf`);
}
