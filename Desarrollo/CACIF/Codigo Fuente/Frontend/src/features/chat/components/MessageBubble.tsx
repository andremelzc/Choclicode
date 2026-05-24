import type { Message } from "../../../types/chat"
import { Search, Info, Link as LinkIcon } from "lucide-react"

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  const formattedTime = new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="rounded-2xl rounded-tr-sm bg-surface/80 p-5 border border-border shadow-sm backdrop-blur-sm">
            <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className="mt-2 text-[11px] font-medium text-muted-foreground mr-2">
            {formattedTime}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Bubble
  return (
    <div className="flex gap-5 mb-6 max-w-[90%]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_15px_rgba(88,101,242,0.4)]">
        CA
      </div>
      
      <div className="flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-chatbot p-6 border border-border/40 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-primary tracking-widest uppercase">
              CACIF · ASISTENTE FISI
            </h3>
            {message.rag_confidence && (
              <span className="text-[10px] font-medium text-muted-foreground/60 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Precisión: {(message.rag_confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          
          <div className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Render Matchmaking Cards */}
          {message.ui_type === 'matchmaking_cards' && message.cards_data && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {message.cards_data.map((card) => (
                <div key={card.id} className="bg-surface/50 border border-border rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer">
                  <h4 className="font-bold text-[14px] text-foreground mb-1">{card.name}</h4>
                  <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2">{card.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {card.lines.map((line: string, idx: number) => (
                      <span key={idx} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
                        {line}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-medium text-foreground/70">
                    <span className="flex items-center gap-1"><Info className="w-3 h-3"/> {card.coordinator}</span>
                    <span className={card.vacancies > 0 ? "text-green-500 font-bold" : "text-destructive font-bold"}>
                      {card.vacancies} vacantes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cited Sources */}
          {message.cited_sources && message.cited_sources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/50">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Referencias Normativas
              </h4>
              <div className="flex flex-wrap gap-2">
                {message.cited_sources.map(source => (
                  <div key={source.id} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 hover:bg-surface transition-all cursor-pointer">
                    <span className="text-[11px] font-semibold text-foreground/80">{source.document_name}</span>
                    {source.start_page && (
                      <span className="text-[10px] text-muted-foreground border-l border-border pl-2">Pág. {source.start_page}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-[11px] font-medium text-muted-foreground ml-2">
          {formattedTime}
        </div>
      </div>
    </div>
  );
};
