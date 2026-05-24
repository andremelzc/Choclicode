import * as React from "react"
import { useState } from "react"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-12 pb-6 px-8 z-20">
      <div className="max-w-[850px] mx-auto">
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
        <div className="mt-4 text-center text-[11px] font-bold text-muted-foreground/50 tracking-widest uppercase">
          CACIF · FISI-UNMSM · Motor RAG Activo
        </div>
      </div>
    </div>
  );
};
