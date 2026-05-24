import { useState, useEffect } from "react"
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
    chatService.getMessages(id).then(data => {
      setMessages(data);
      setIsLoadingMessages(false);
    });
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleSend = async (text: string) => {
    let currentConvId = activeConversationId;
    
    if (!currentConvId) {
      currentConvId = crypto.randomUUID();
      setActiveConversationId(currentConvId);
      
      const newConv: Conversation = {
        id: currentConvId,
        student_id: user?.id || "unknown",
        intent_type: "CU00",
        title: text.length > 25 ? text.substring(0, 25) + "..." : text,
        started_at: new Date().toISOString(),
        total_messages: 2
      };
      setConversations(prev => [newConv, ...prev]);
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: currentConvId,
      role: 'user',
      content: text,
      sent_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoadingMessages(true);

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
        <Sidebar 
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          conversations={conversations}
          isLoadingConversations={isLoadingConversations}
        />
        
        <main className="flex-1 flex flex-col relative h-full bg-background">
          <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-foreground">
                {activeConversationId 
                  ? conversations.find(c => c.id === activeConversationId)?.title || "Conversación activa"
                  : "Nueva conversación"}
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                {activeConversationId ? "Recuperando contexto..." : "Asistente inteligente listo para ayudarte con tus consultas"}
              </p>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary tracking-widest uppercase shadow-[0_0_10px_rgba(88,101,242,0.2)]">
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