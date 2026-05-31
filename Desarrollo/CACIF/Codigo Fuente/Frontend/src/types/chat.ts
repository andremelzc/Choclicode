export interface CitedSource {
  id: string;
  document_name: string;
  start_page?: number;
  end_page?: number;
  similarity_score: number;
}
export interface TimelineEvent {
  title: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface ContestData {
  id: string;
  title: string;
  contest_type: string;
  status_badge: string;
  status_label: string;
  requirements: string[];
  prize: string;
  required_documents: string;
  apply_url: string;
  timeline_events: TimelineEvent[];
}

export interface GroupCardData {
  id: string;
  name?: string;
  coordinator?: string;
  lines?: string[];
  technical_areas?: string[];
  description?: string;
}

export interface StepData {
  step_number?: number;
  title?: string;
  description?: string;
  action_url?: string;
}

export interface ProcedureData {
  id: string;
  procedure_name?: string;
  estimated_time?: string;
  cost?: string;
  requirements?: string[];
  steps?: StepData[];
}

export interface CitationData {
  id: string;
  document_name?: string;
  article_number?: string;
  exact_quote?: string;
  explanation?: string;
  page?: number;
  link?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  rag_confidence?: number;
  sent_at: string;
  cited_sources?: CitedSource[];
  
  // Custom UI Fields for Rendering Matchmaking / Complex UI
  ui_type?: 'text' | 'matchmaking_cards' | 'convocatoria_cards' | 'stepper_cards' | 'citation_cards';
  cards_data?: GroupCardData[];
  contest_data?: ContestData[];
  stepper_data?: ProcedureData[];
  citation_data?: CitationData[];
}

export interface Conversation {
  id: string;
  student_id: string;
  intent_type: string; // 'CU01' | 'CU02' | 'CU03' | 'CU04'
  started_at: string;
  closed_at?: string;
  total_messages: number;
}
