import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Sidebar } from "../../components/layout/Sidebar"
import { TopHeader } from "../../components/layout/TopHeader"
import { MessageList } from "../../features/chat/components/MessageList"
import { ChatInput } from "../../features/chat/components/ChatInput"
import { chatService } from "../../features/chat/services/chat.service"
import type { Message, Conversation } from "../../types/chat"
import { useAuth } from "../../features/auth/context/AuthContext"

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      chatService.getConversations(user.id).then(data => {
        setConversations(data);
        setIsLoadingConversations(false);
      });
    }
  }, [user]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMessages([]);
    setIsLoadingMessages(true);
    setIsMobileSidebarOpen(false);
    chatService.getMessages(id).then(data => {
      setMessages(data);
      setIsLoadingMessages(false);
    });
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setIsMobileSidebarOpen(false);
  };

  const handleSend = async (text: string) => {
    let currentConvId = activeConversationId;

    // Optimistic UI update
    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: currentConvId || "temp-conv",
      role: 'user',
      content: text,
      sent_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoadingMessages(true);
    
    // Forzamos a React a renderizar el mensaje en el DOM inmediatamente
    await new Promise(resolve => setTimeout(resolve, 10));
    
    if (!currentConvId) {
      try {
        const newConv = await chatService.createConversation("CU00");
        currentConvId = newConv.id;
        setActiveConversationId(currentConvId);
        setConversations(prev => [newConv, ...prev]);
      } catch (error) {
        console.error("No se pudo crear la conversación en el backend", error);
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        setIsLoadingMessages(false);
        return;
      }
    }

    try {
      const response = await chatService.sendMessage(text, currentConvId);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      <TopHeader />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <Sidebar 
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            conversations={conversations}
            isLoadingConversations={isLoadingConversations}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar Content */}
            <div className="relative z-50 h-full flex shadow-2xl animate-in slide-in-from-left duration-300">
              <Sidebar 
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                conversations={conversations}
                isLoadingConversations={isLoadingConversations}
              />
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute -right-10 top-4 p-1.5 bg-surface text-foreground rounded-full border border-border shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        <main className="flex-1 flex flex-col relative h-full bg-background">
          <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-foreground">
                {activeConversationId 
                  ? "Conversación activa"
                  : "Nueva conversación"}
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                {activeConversationId ? "Recuperando contexto..." : "Asistente inteligente listo para ayudarte con tus consultas"}
              </p>
            </div>
            </div>
            <div className="hidden sm:block rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary tracking-widest uppercase shadow-[0_0_10px_rgba(88,101,242,0.2)]">
              CACIF · Asistente FISI
            </div>
          </div>

          <MessageList messages={messages} isLoading={isLoadingMessages} />
          <ChatInput onSend={handleSend} isLoading={isLoadingMessages} hasMessages={messages.length > 0} />
        </main>
      </div>
    </div>
  )
}