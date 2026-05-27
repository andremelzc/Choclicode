import type { Message, GroupCardData, Conversation, ContestData } from "../../../types/chat";

const mockGroups: GroupCardData[] = [
  {
    id: "g1",
    name: "GICOMP - Grupo de Investigación en Computación",
    coordinator: "Dr. Juan Pérez Torres",
    lines: ["Inteligencia Artificial y Machine Learning"],
    technical_areas: ["IA", "Machine Learning", "Deep Learning", "Visión Computacional"]
  },
  {
    id: "g2",
    name: "GIDIS-Web - Grupo de Desarrollo de Ingeniería de Software",
    coordinator: "Dra. María González Silva",
    lines: ["Desarrollo de Software y Aplicaciones Web"],
    technical_areas: ["React", "Node.js", "Arquitectura de Software", "DevOps"]
  }
];

const mockContests: ContestData[] = [
  {
    id: "contest-1",
    title: "Concurso VRI 2026: Proyectos de Innovación Tecnológica",
    contest_type: "Programa de financiamiento para grupos de investigación",
    status_badge: "COMPETENCIA",
    status_label: "Inscripciones abiertas",
    requirements: [
      "Grupo con Resolución de Decanato vigente",
      "Equipo: Mínimo 3 integrantes (1 docente + 2 estudiantes)",
      "Proyecto debe alinearse con ODS de la ONU",
      "Duración del proyecto: 6-12 meses"
    ],
    prize: "S/. 15,000 - mentoría especializada - publicación en revista indexada",
    required_documents: "Propuesta técnica (máx. 15 páginas), presupuesto detallado, CV de integrantes, resolución del grupo vigente, carta de compromiso del asesor",
    apply_url: "#",
    timeline_events: [
      { title: "Lanzamiento oficial", date: "01 Junio 2026", status: "completed" },
      { title: "Registro de equipos", date: "15 Junio 2026", status: "current" },
      { title: "Cierre de inscripciones", date: "30 Julio 2026", status: "upcoming" }
    ]
  }
];

const mockConversations: Conversation[] = [
  {
    id: "conv-hist-1",
    student_id: "1",
    intent_type: "CU02",
    title: "Requisitos de Tesis",
    started_at: new Date(Date.now() - 86400000).toISOString(),
    total_messages: 4
  },
  {
    id: "conv-hist-2",
    student_id: "1",
    intent_type: "CU01",
    title: "Grupos de Investigación Web",
    started_at: new Date(Date.now() - 172800000).toISOString(),
    total_messages: 2
  }
];

export const chatService = {
  getConversations: async (_studentId: string): Promise<Conversation[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockConversations;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (conversationId === "conv-hist-1") {
      return [
        { id: "m1", conversation_id: conversationId, role: "user", content: "¿Cuáles son los requisitos para sacar la tesis?", sent_at: new Date(Date.now() - 86400000).toISOString() },
        { id: "m2", conversation_id: conversationId, role: "assistant", content: "Para obtener el título mediante tesis necesitas: haber egresado, aprobar el plan de tesis y defenderla ante un jurado.", sent_at: new Date(Date.now() - 86390000).toISOString(), ui_type: "text", rag_confidence: 0.95 }
      ];
    }
    if (conversationId === "conv-hist-2") {
      return [
        { id: "m3", conversation_id: conversationId, role: "user", content: "Busco grupos de desarrollo web", sent_at: new Date(Date.now() - 172800000).toISOString() },
        { id: "m4", conversation_id: conversationId, role: "assistant", content: "Te recomiendo el grupo Galácticos de Software.", sent_at: new Date(Date.now() - 172790000).toISOString(), ui_type: "text" }
      ];
    }
    return [];
  },

  sendMessage: async (content: string, conversationId: string): Promise<Message> => {
    // Simular latencia de "pensamiento" del LLM y búsqueda vectorial RAG
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerContent = content.toLowerCase();

    // ESCENARIO 1: CONVOCATORIAS (CU02)
    if (lowerContent.includes("convocatoria") || lowerContent.includes("vacante") || lowerContent.includes("postular")) {
      return {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: "He encontrado convocatorias vigentes de **competencias y programas** para grupos de investigación establecidos:",
        sent_at: new Date().toISOString(),
        rag_confidence: 0.95,
        ui_type: 'convocatoria_cards',
        contest_data: mockContests,
        cited_sources: [
          { id: "s1", document_name: "Directiva de Concursos VRI FISI", start_page: 2, similarity_score: 0.91 }
        ]
      };
    }

    // ESCENARIO 2: MATCHMAKING / GRUPOS DE INVESTIGACIÓN (CU01)
    if (lowerContent.includes("grupo") || lowerContent.includes("investigación") || lowerContent.includes("ia") || lowerContent.includes("software") || lowerContent.includes("artificial")) {
      return {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: 'assistant',
        content: "He analizado tus intereses y te muestro los grupos organizados según las **líneas de investigación oficiales de la FISI**:",
        sent_at: new Date().toISOString(),
        rag_confidence: 0.88,
        ui_type: 'matchmaking_cards',
        cards_data: mockGroups,
        cited_sources: [
          { id: "s1", document_name: "Directiva_VRI_Grupos_2026.pdf", similarity_score: 0.98, start_page: 5 }
        ]
      };
    }

    // ESCENARIO 3: TESIS Y CONVALIDACIONES
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

    // ESCENARIO 4: RESPUESTA POR DEFECTO
    return {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: 'assistant',
      content: "Entiendo. ¿Podrías darme un poco más de contexto? Como tu Asistente CACIF, puedo ayudarte con orientación para buscar grupos de investigación, convocatorias de competencias (VRI) o explicarte cómo formalizar tu tesis en la facultad.",
      sent_at: new Date().toISOString(),
      rag_confidence: 0.65,
      ui_type: 'text'
    };
  }
};
