import * as React from "react"
import { useState } from "react"
import { Send, Loader2, Sparkles } from "lucide-react"
import { Badge } from "../../../components/ui/Badge"
import { motion, AnimatePresence } from "framer-motion"

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  hasMessages?: boolean;
}

export const ChatInput = ({ onSend, isLoading, hasMessages }: ChatInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText("");
    }
  };

  const SUGGESTIONS = [
    { label: "🔍 Grupos de IA", query: "Quiero buscar grupos de investigación o laboratorios sobre Inteligencia Artificial en la FISI." },
    { label: "📢 Concursos Activos", query: "¿Cuáles son las convocatorias o concursos de investigación actualmente activos?" },
    { label: "🎓 Trámite de Tesis", query: "¿Cuáles son los requisitos y el procedimiento paso a paso para inscribir mi plan de tesis?" },
    { label: "⚖️ Derechos de Autor", query: "¿Qué dice el reglamento sobre los derechos de autor y propiedad intelectual en las tesis?" }
  ];

  const handleSuggestionClick = (query: string) => {
    if (!isLoading) {
      onSend(query);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-12 pb-6 px-8 z-20 pointer-events-none">
      <div className="max-w-[850px] mx-auto pointer-events-auto">
        <AnimatePresence>
          {!hasMessages && !isLoading && text.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap items-center gap-2 mb-4 px-2"
            >
              <Sparkles className="w-4 h-4 text-primary/70 mr-1" />
              <span className="text-[12px] font-semibold text-muted-foreground mr-1" id="suggestions-label">Sugerencias:</span>
              <div role="list" aria-labelledby="suggestions-label" className="flex gap-2">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all text-[11px] py-1 border border-border/50 focus:ring-2 focus:ring-primary focus:outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`Sugerencia: ${suggestion.label}`}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSuggestionClick(suggestion.query);
                      }
                    }}
                  >
                    {suggestion.label}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="relative flex items-center rounded-2xl group">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            placeholder="Escribe tu consulta. El sistema buscará automáticamente la normativa..." 
            className="w-full rounded-2xl border border-border bg-surface/60 py-4 pl-6 pr-16 text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface focus:shadow-[0_0_20px_rgba(88,101,242,0.15)] transition-all backdrop-blur-md disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!text.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_20px_rgba(88,101,242,0.6)] disabled:opacity-50 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2.5} />
            ) : (
              <Send className="w-[18px] h-[18px] ml-0.5" strokeWidth={2.5} />
            )}
          </button>
        </form>
        <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
          <div className="text-[11px] font-bold text-muted-foreground/50 tracking-widest uppercase">
            CACIF · FISI-UNMSM · Motor RAG Activo
          </div>
          <p className="text-[10px] text-muted-foreground/60 max-w-xl leading-relaxed">
            Esta es una versión prototipo. La información generada debe tomarse bajo su propia responsabilidad, ya que podría estar sujeta a actualizaciones. Para mayor seguridad o consultas formales, puedes escribir a <a href="mailto:investigacion.fisi@unmsm.edu.pe" className="text-primary/70 hover:text-primary hover:underline transition-colors font-medium">investigacion.fisi@unmsm.edu.pe</a> o acercarte directamente a la Unidad de Investigación.
          </p>
        </div>
      </div>
    </div>
  );
};
