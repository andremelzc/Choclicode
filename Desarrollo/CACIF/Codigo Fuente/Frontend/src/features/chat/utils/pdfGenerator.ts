import { jsPDF } from "jspdf";
import type {
  Message,
  GroupCardData,
  ContestData,
  ProcedureData,
  CitationData,
  CitedSource,
} from "../../../types/chat";

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

// ── AUXILIARY DRAWING FUNCTIONS FOR CUSTOM CARDS ──────────────────

function drawMatchmakingCards(
  doc: jsPDF,
  cards: GroupCardData[],
  startY: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): number {
  let y = startY;
  const padding = 6;
  const cardWidth = contentWidth;
  const textWidth = cardWidth - 2 * padding - 4;
  const lineHeight = 5;

  cards.forEach((card) => {
    const title = card.name ? `Grupo: ${card.name}` : "Grupo de Investigación";
    const coordinator = card.coordinator ? `Coordinador: ${card.coordinator}` : "";
    const linesStr = card.lines && card.lines.length > 0 ? `Líneas de investigación: ${card.lines.join(", ")}` : "";
    const areasStr = card.technical_areas && card.technical_areas.length > 0 ? `Áreas técnicas: ${card.technical_areas.join(", ")}` : "";
    const description = card.description || "";

    const titleLines = doc.splitTextToSize(cleanTextForPDF(title), textWidth);
    const coordLines = coordinator ? doc.splitTextToSize(cleanTextForPDF(coordinator), textWidth) : [];
    const linesLines = linesStr ? doc.splitTextToSize(cleanTextForPDF(linesStr), textWidth) : [];
    const areasLines = areasStr ? doc.splitTextToSize(cleanTextForPDF(areasStr), textWidth) : [];
    const descLines = description ? doc.splitTextToSize(cleanTextForPDF(description), textWidth) : [];

    let cardHeight = 10; // basic padding
    cardHeight += titleLines.length * lineHeight;
    if (coordLines.length > 0) cardHeight += coordLines.length * lineHeight + 2;
    if (linesLines.length > 0) cardHeight += linesLines.length * lineHeight + 2;
    if (areasLines.length > 0) cardHeight += areasLines.length * lineHeight + 2;
    if (descLines.length > 0) cardHeight += descLines.length * lineHeight + 2;

    // Check page space
    if (y + cardHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    // Draw background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "FD");

    // Draw accent bar (Blue)
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(margin, y, 3, cardHeight, "F");

    let textY = y + 6;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // Slate-900
    titleLines.forEach((line: string) => {
      doc.text(line, margin + 8, textY);
      textY += lineHeight;
    });

    // Coordinator
    if (coordLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // Slate-600
      coordLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    // Lines
    if (linesLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85); // Slate-700
      linesLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    // Areas
    if (areasLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85); // Slate-700
      areasLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    // Description
    if (descLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // Slate-600
      descLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    y += cardHeight + 4; // Spacing below card
  });

  return y;
}

function drawContestCards(
  doc: jsPDF,
  contests: ContestData[],
  startY: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): number {
  let y = startY;
  const padding = 6;
  const cardWidth = contentWidth;
  const textWidth = cardWidth - 2 * padding - 4;
  const lineHeight = 5;

  contests.forEach((contest) => {
    const title = contest.title ? `Convocatoria: ${contest.title}` : "Convocatoria";
    const status = contest.status_label ? `Estado: ${contest.status_label}` : "";
    const type = contest.contest_type ? `Tipo: ${contest.contest_type}` : "";
    const prize = contest.prize ? `Premio/Beneficio: ${contest.prize}` : "";
    const docs = contest.required_documents ? `Documentos: ${contest.required_documents}` : "";
    
    const reqsHeader = contest.requirements && contest.requirements.length > 0 ? "Requisitos:" : "";
    const reqsLines: string[][] = [];
    if (contest.requirements) {
      contest.requirements.forEach(req => {
        reqsLines.push(doc.splitTextToSize(`- ${req}`, textWidth - 4));
      });
    }

    const timelineHeader = contest.timeline_events && contest.timeline_events.length > 0 ? "Cronograma:" : "";
    const timelineLines: string[][] = [];
    if (contest.timeline_events) {
      contest.timeline_events.forEach(ev => {
        timelineLines.push(doc.splitTextToSize(`• [${ev.date}] ${ev.title}`, textWidth - 4));
      });
    }

    const titleLines = doc.splitTextToSize(cleanTextForPDF(title), textWidth);
    const statusLines = status ? doc.splitTextToSize(cleanTextForPDF(status), textWidth) : [];
    const typeLines = type ? doc.splitTextToSize(cleanTextForPDF(type), textWidth) : [];
    const prizeLines = prize ? doc.splitTextToSize(cleanTextForPDF(prize), textWidth) : [];
    const docsLines = docs ? doc.splitTextToSize(cleanTextForPDF(docs), textWidth) : [];

    let cardHeight = 10;
    cardHeight += titleLines.length * lineHeight;
    if (statusLines.length > 0) cardHeight += statusLines.length * lineHeight + 2;
    if (typeLines.length > 0) cardHeight += typeLines.length * lineHeight + 2;
    if (prizeLines.length > 0) cardHeight += prizeLines.length * lineHeight + 2;
    if (docsLines.length > 0) cardHeight += docsLines.length * lineHeight + 2;
    if (reqsHeader) {
      cardHeight += lineHeight + 2;
      reqsLines.forEach(rl => { cardHeight += rl.length * lineHeight; });
    }
    if (timelineHeader) {
      cardHeight += lineHeight + 2;
      timelineLines.forEach(tl => { cardHeight += tl.length * lineHeight; });
    }

    if (y + cardHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFillColor(245, 158, 11); // Amber-500
    doc.rect(margin, y, 3, cardHeight, "F");

    let textY = y + 6;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    titleLines.forEach((line: string) => {
      doc.text(line, margin + 8, textY);
      textY += lineHeight;
    });

    // Status
    if (statusLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      if (contest.status_badge === "open" || contest.status_label.toLowerCase().includes("abiert")) {
        doc.setTextColor(16, 185, 129); // Emerald-500
      } else {
        doc.setTextColor(239, 68, 68); // Red-500
      }
      statusLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    // Type, Prize, Docs
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    if (typeLines.length > 0) {
      textY += 1;
      typeLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    if (prizeLines.length > 0) {
      textY += 1;
      prizeLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    if (docsLines.length > 0) {
      textY += 1;
      docsLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    // Requirements
    if (reqsHeader) {
      textY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(reqsHeader, margin + 8, textY);
      textY += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      reqsLines.forEach(rl => {
        rl.forEach((line: string) => {
          doc.text(line, margin + 12, textY);
          textY += lineHeight;
        });
      });
    }

    // Timeline
    if (timelineHeader) {
      textY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(timelineHeader, margin + 8, textY);
      textY += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      timelineLines.forEach(tl => {
        tl.forEach((line: string) => {
          doc.text(line, margin + 12, textY);
          textY += lineHeight;
        });
      });
    }

    y += cardHeight + 4;
  });

  return y;
}

function drawStepperCards(
  doc: jsPDF,
  procedures: ProcedureData[],
  startY: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): number {
  let y = startY;
  const padding = 6;
  const cardWidth = contentWidth;
  const textWidth = cardWidth - 2 * padding - 4;
  const lineHeight = 5;

  procedures.forEach((proc) => {
    const title = proc.procedure_name ? `Trámite: ${proc.procedure_name}` : "Trámite Académico";
    const timeCost = `Tiempo estimado: ${proc.estimated_time || "Variable"} | Costo: ${proc.cost || "Gratuito"}`;
    
    const reqsHeader = proc.requirements && proc.requirements.length > 0 ? "Requisitos:" : "";
    const reqsLines: string[][] = [];
    if (proc.requirements) {
      proc.requirements.forEach(req => {
        reqsLines.push(doc.splitTextToSize(`- ${req}`, textWidth - 4));
      });
    }

    const stepsHeader = proc.steps && proc.steps.length > 0 ? "Pasos del Procedimiento:" : "";
    const stepsLines: { number: number; titleLines: string[]; descLines: string[] }[] = [];
    if (proc.steps) {
      proc.steps.forEach(step => {
        const stepNum = step.step_number || 1;
        const stepTitle = step.title ? `Paso ${stepNum}: ${step.title}` : `Paso ${stepNum}`;
        const stepDesc = step.description || "";
        
        stepsLines.push({
          number: stepNum,
          titleLines: doc.splitTextToSize(cleanTextForPDF(stepTitle), textWidth - 8),
          descLines: stepDesc ? doc.splitTextToSize(cleanTextForPDF(stepDesc), textWidth - 12) : []
        });
      });
    }

    const titleLines = doc.splitTextToSize(cleanTextForPDF(title), textWidth);
    const timeCostLines = doc.splitTextToSize(cleanTextForPDF(timeCost), textWidth);

    let cardHeight = 10;
    cardHeight += titleLines.length * lineHeight;
    cardHeight += timeCostLines.length * lineHeight + 2;
    if (reqsHeader) {
      cardHeight += lineHeight + 2;
      reqsLines.forEach(rl => { cardHeight += rl.length * lineHeight; });
    }
    if (stepsHeader) {
      cardHeight += lineHeight + 2;
      stepsLines.forEach(sl => {
        cardHeight += sl.titleLines.length * lineHeight + 1;
        if (sl.descLines.length > 0) cardHeight += sl.descLines.length * lineHeight + 2;
      });
    }

    if (y + cardHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFillColor(99, 102, 241); // Indigo-500
    doc.rect(margin, y, 3, cardHeight, "F");

    let textY = y + 6;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    titleLines.forEach((line: string) => {
      doc.text(line, margin + 8, textY);
      textY += lineHeight;
    });

    // Time & Cost
    textY += 1;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    timeCostLines.forEach((line: string) => {
      doc.text(line, margin + 8, textY);
      textY += lineHeight;
    });

    // Requirements
    if (reqsHeader) {
      textY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(reqsHeader, margin + 8, textY);
      textY += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      reqsLines.forEach(rl => {
        rl.forEach((line: string) => {
          doc.text(line, margin + 12, textY);
          textY += lineHeight;
        });
      });
    }

    // Steps
    if (stepsHeader) {
      textY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(stepsHeader, margin + 8, textY);
      textY += lineHeight;

      stepsLines.forEach(sl => {
        textY += 1;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(99, 102, 241);
        sl.titleLines.forEach((line: string) => {
          doc.text(line, margin + 12, textY);
          textY += lineHeight;
        });

        if (sl.descLines.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          sl.descLines.forEach((line: string) => {
            doc.text(line, margin + 16, textY);
            textY += lineHeight;
          });
          textY += 1;
        }
      });
    }

    y += cardHeight + 4;
  });

  return y;
}

function drawCitationCards(
  doc: jsPDF,
  citations: CitationData[],
  startY: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): number {
  let y = startY;
  const padding = 6;
  const cardWidth = contentWidth;
  const textWidth = cardWidth - 2 * padding - 4;
  const lineHeight = 5;

  citations.forEach((citation) => {
    const docName = citation.document_name || "Reglamento Académico";
    const article = citation.article_number ? `Artículo ${citation.article_number}` : "";
    const exactQuote = citation.exact_quote ? `"${citation.exact_quote}"` : "";
    const explanation = citation.explanation ? `Explicación: ${citation.explanation}` : "";
    const pageInfo = citation.page ? `Página: ${citation.page}` : "";

    const headerLines = doc.splitTextToSize(cleanTextForPDF(`${docName} ${article ? `· ${article}` : ""}`), textWidth);
    const quoteLines = exactQuote ? doc.splitTextToSize(cleanTextForPDF(exactQuote), textWidth - 8) : [];
    const explanationLines = explanation ? doc.splitTextToSize(cleanTextForPDF(explanation), textWidth) : [];
    const pageLines = pageInfo ? doc.splitTextToSize(cleanTextForPDF(pageInfo), textWidth) : [];

    let cardHeight = 10;
    cardHeight += headerLines.length * lineHeight;
    if (quoteLines.length > 0) {
      cardHeight += quoteLines.length * 4.5 + 6;
    }
    if (explanationLines.length > 0) {
      cardHeight += explanationLines.length * lineHeight + 2;
    }
    if (pageLines.length > 0) {
      cardHeight += pageLines.length * lineHeight + 2;
    }

    if (y + cardHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(margin, y, 3, cardHeight, "F");

    let textY = y + 6;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(16, 185, 129);
    headerLines.forEach((line: string) => {
      doc.text(line, margin + 8, textY);
      textY += lineHeight;
    });

    // Quote Block
    if (quoteLines.length > 0) {
      textY += 2;
      const quoteHeight = quoteLines.length * 4.5 + 2;
      
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 8, textY - 2, textWidth, quoteHeight, "F");
      
      doc.setFillColor(203, 213, 225);
      doc.rect(margin + 8, textY - 2, 2, quoteHeight, "F");
      
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      
      quoteLines.forEach((line: string) => {
        doc.text(line, margin + 12, textY);
        textY += 4.5;
      });
      textY += 3;
    }

    // Explanation
    if (explanationLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      explanationLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    // Page Info
    if (pageLines.length > 0) {
      textY += 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      pageLines.forEach((line: string) => {
        doc.text(line, margin + 8, textY);
        textY += lineHeight;
      });
    }

    y += cardHeight + 4;
  });

  return y;
}

function drawCitedSourcesList(
  doc: jsPDF,
  sources: CitedSource[],
  startY: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): number {
  let y = startY;
  const lineHeight = 4.5;
  const padding = 6;
  const textWidth = contentWidth - 2 * padding;

  const lines: string[][] = [];
  sources.forEach(src => {
    const start = src.start_page ? `Pág. ${src.start_page}` : "";
    const end = src.end_page && src.end_page !== src.start_page ? `-${src.end_page}` : "";
    const pageRange = start ? `${start}${end}` : "";
    const similarity = `Similitud: ${(src.similarity_score * 100).toFixed(0)}%`;
    const docInfo = `${src.document_name}${pageRange ? ` (${pageRange})` : ""} · ${similarity}`;
    lines.push(doc.splitTextToSize(`• ${docInfo}`, textWidth));
  });

  let listHeight = 8;
  lines.forEach(lineGroup => {
    listHeight += lineGroup.length * lineHeight;
  });

  if (y + listHeight > pageHeight - 20) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(241, 245, 249); // Slate-100
  doc.line(margin, y, margin + contentWidth, y);
  
  let textY = y + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("Fuentes Citadas:", margin + 4, textY);
  textY += lineHeight + 1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(115, 115, 115);
  lines.forEach(lineGroup => {
    lineGroup.forEach((line: string) => {
      doc.text(line, margin + 6, textY);
      textY += lineHeight;
    });
  });

  return textY + 2;
}

// ── MAIN EXPORT FUNCTION ──────────────────────────────────────────

export function downloadChatPDF(title: string, messages: Message[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 0;

  // 1. Premium Header (First page only)
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

  y = 52; // Content start

  // 2. Metadata Card
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

  y += 32;

  // 3. Render Messages & Sub-components
  messages.forEach((msg) => {
    const isUser = msg.role === "user";
    const senderName = isUser ? "Usuario" : "Asistente CACIF";
    const cleanedText = cleanTextForPDF(msg.content);
    
    const innerPadding = 6;
    const textWidth = contentWidth - 2 * innerPadding - 4;
    const lines = doc.splitTextToSize(cleanedText, textWidth);
    const lineHeight = 5.5;
    const textHeight = lines.length * lineHeight;
    
    const blockHeight = textHeight + 16;

    if (y + blockHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    // Block background
    if (isUser) {
      doc.setFillColor(239, 246, 255); // Blue-50
      doc.setDrawColor(219, 234, 254); // Blue-100
    } else {
      doc.setFillColor(243, 244, 246); // Gray-100
      doc.setDrawColor(229, 231, 235); // Gray-200
    }
    doc.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, "FD");

    // Left border accent line
    if (isUser) {
      doc.setFillColor(37, 99, 235); // Blue-600
    } else {
      doc.setFillColor(16, 185, 129); // Emerald-500
    }
    doc.rect(margin, y, 3, blockHeight, "F");

    // Sender Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    if (isUser) {
      doc.setTextColor(29, 78, 216); // Blue-700
    } else {
      doc.setTextColor(6, 95, 70); // Emerald-800
    }
    doc.text(senderName, margin + 8, y + 7);

    // Text content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // Slate-700
    
    let textY = y + 13;
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], margin + 8, textY);
      textY += lineHeight;
    }

    y += blockHeight + 6; // spacing after message bubble

    // Render Custom UI Cards and Cited Sources for assistant messages
    if (!isUser) {
      if (msg.ui_type === "matchmaking_cards" && msg.cards_data && msg.cards_data.length > 0) {
        y = drawMatchmakingCards(doc, msg.cards_data, y, margin, contentWidth, pageHeight);
      } else if (msg.ui_type === "convocatoria_cards" && msg.contest_data && msg.contest_data.length > 0) {
        y = drawContestCards(doc, msg.contest_data, y, margin, contentWidth, pageHeight);
      } else if (msg.ui_type === "stepper_cards" && msg.stepper_data && msg.stepper_data.length > 0) {
        y = drawStepperCards(doc, msg.stepper_data, y, margin, contentWidth, pageHeight);
      } else if (msg.ui_type === "citation_cards" && msg.citation_data && msg.citation_data.length > 0) {
        y = drawCitationCards(doc, msg.citation_data, y, margin, contentWidth, pageHeight);
      }

      if (msg.cited_sources && msg.cited_sources.length > 0) {
        y = drawCitedSourcesList(doc, msg.cited_sources, y, margin, contentWidth, pageHeight);
      }
    }
  });

  // 4. Page numbering on footer
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

  const safeTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  doc.save(`chat-cacif-${safeTitle || "conversacion"}.pdf`);
}

