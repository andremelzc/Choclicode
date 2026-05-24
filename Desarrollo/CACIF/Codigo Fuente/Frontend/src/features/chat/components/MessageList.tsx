import { useRef, useEffect } from "react"
import type { Message } from "../../../types/chat"
import { MessageBubble } from "./MessageBubble"
import { Loader2 } from "lucide-react"

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-40 scroll-smooth">
      <div className="max-w-[850px] mx-auto flex flex-col">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center mt-20">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-[0_0_30px_rgba(88,101,242,0.4)]">
              CA
            </div>
            <h3 className="text-xl font-bold text-foreground">¿En qué puedo ayudarte hoy?</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Pregúntame sobre trámites de tesis, grupos de investigación o normativa vigente de la FISI.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-5 mb-6 max-w-[90%]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_15px_rgba(88,101,242,0.4)]">
              CA
            </div>
            <div className="flex-1">
              <div className="rounded-2xl rounded-tl-sm bg-chatbot p-6 border border-border/40 shadow-sm w-fit">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
