import { useState } from "react"
import { Sidebar } from "../../components/layout/Sidebar"
import { TopHeader } from "../../components/layout/TopHeader"
import { MessageList } from "../../features/chat/components/MessageList"
import { ChatInput } from "../../features/chat/components/ChatInput"
import { chatService } from "../../features/chat/services/chat.service"
import type { Message } from "../../types/chat"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    // Add user message optimistically
    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: "conv-1",
      role: 'user',
      content: text,
      sent_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(text, "conv-1");
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      <TopHeader />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 flex flex-col relative h-full bg-background">
          {/* Internal Chat Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-foreground">
                Nueva conversación
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                Asistente inteligente listo para ayudarte con tus consultas
              </p>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary tracking-widest uppercase shadow-[0_0_10px_rgba(88,101,242,0.2)]">
              CACIF · Asistente FISI
            </div>
          </div>

          <MessageList messages={messages} isLoading={isLoading} />
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </main>
      </div>
    </div>
  )
}