export interface CitedSource {
  id: string;
  document_name: string;
  start_page?: number;
  end_page?: number;
  similarity_score: number;
}

export interface GroupCardData {
  id: string;
  name: string;
  coordinator: string;
  lines: string[];
  vacancies: number;
  description: string;
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
  ui_type?: 'text' | 'matchmaking_cards' | 'vacancies_list';
  cards_data?: GroupCardData[];
}

export interface Conversation {
  id: string;
  student_id: string;
  intent_type: string; // 'CU01' | 'CU02' | 'CU03' | 'CU04'
  title: string;       // Not in DB directly, but useful for sidebar UI derived from intent/first message
  started_at: string;
  closed_at?: string;
  total_messages: number;
}
