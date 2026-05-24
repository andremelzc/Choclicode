import type { Message, GroupCardData } from "../../../types/chat";

const mockGroups: GroupCardData[] = [
  {
    id: "g1",
    name: "Galácticos de Software",
    coordinator: "Dra. Maria Fernandez",
    lines: ["Ingeniería de Software", "Sistemas Inteligentes"],
    vacancies: 3,
    description: "Grupo dedicado a la creación de arquitecturas de software sostenibles y aplicaciones web escalables."
  },
  {
    id: "g2",
    name: "CyberFISI AI",
    coordinator: "Dr. Juan Perez",
    lines: ["Ciberseguridad", "Machine Learning"],
    vacancies: 0,
    description: "Investigación aplicada en defensa cibernética y modelos fundacionales de IA."
  }
];

export const chatService = {
  sendMessage: async (content: string, conversationId: string): Promise<Message> => {
    // Simular latencia de "pensamiento" del LLM y búsqueda vectorial RAG
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerContent = content.toLowerCase();

    // ESCENARIO 1: MATCHMAKING / GRUPOS DE INVESTIGACIÓN
    if (lowerContent.includes("grupo") || lowerContent.includes("investigación") || lowerContent.includes("ia") || lowerContent.includes("software")) {
      return {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: 'assistant',
        content: "He analizado tus intereses y la base normativa de grupos. Aquí tienes algunas opciones en la FISI que encajan perfectamente con tu perfil. ¿Te gustaría saber cómo postular a alguno de ellos?",
        sent_at: new Date().toISOString(),
        rag_confidence: 0.95,
        ui_type: 'matchmaking_cards',
        cards_data: mockGroups,
        cited_sources: [
          { id: "s1", document_name: "Directiva_VRI_Grupos_2026.pdf", similarity_score: 0.98, start_page: 5 }
        ]
      };
    }

    // ESCENARIO 2: TESIS Y CONVALIDACIONES
    if (lowerContent.includes("tesis") || lowerContent.includes("convalidar") || lowerContent.includes("ppp")) {
      return {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: 'assistant',
        content: "Para convalidar tus Prácticas Pre-Profesionales (PPP) a través de un Grupo de Investigación, debes cumplir con dos requisitos fundamentales:\n\n1. Tener al menos **1 año de permanencia activa** en el grupo.\n2. Contar con la **carta de aprobación firmada** por el Coordinador del grupo.\n\nEl trámite se realiza vía Mesa de Partes Virtual (MAT). ¿Deseas que te brinde el enlace o te enumere los anexos que debes presentar?",
        sent_at: new Date().toISOString(),
        rag_confidence: 0.88,
        ui_type: 'text',
        cited_sources: [
          { id: "s2", document_name: "Reglamento_Grados_y_Titulos_FISI.pdf", similarity_score: 0.92, start_page: 12 },
          { id: "s3", document_name: "Guia_Convalidacion_PPP.pdf", similarity_score: 0.85, start_page: 3 }
        ]
      };
    }

    // ESCENARIO 3: RESPUESTA POR DEFECTO
    return {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: 'assistant',
      content: "Entiendo. ¿Podrías darme un poco más de contexto? Como tu Asistente CACIF, puedo ayudarte con orientación para buscar grupos de investigación, resolver dudas sobre convalidaciones de PPP o explicarte cómo formalizar tu tesis en la facultad.",
      sent_at: new Date().toISOString(),
      rag_confidence: 0.65,
      ui_type: 'text'
    };
  }
};
