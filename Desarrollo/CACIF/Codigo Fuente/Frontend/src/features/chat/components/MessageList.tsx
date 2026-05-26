import { useRef, useEffect } from "react"
import type { Message } from "../../../types/chat"
import { MessageBubble } from "./MessageBubble"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center h-full text-center mt-20"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-[0_0_30px_rgba(88,101,242,0.4)]"
            >
              CA
            </motion.div>
            <h3 className="text-xl font-bold text-foreground">¿En qué puedo ayudarte hoy?</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Pregúntame sobre trámites de tesis, grupos de investigación o normativa vigente de la FISI.
            </p>
          </motion.div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-5 mb-6 max-w-[90%]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_15px_rgba(88,101,242,0.4)]">
              CA
            </div>
            <div className="flex-1">
              <div className="rounded-2xl rounded-tl-sm bg-chatbot p-6 border border-border/40 shadow-sm w-fit">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
