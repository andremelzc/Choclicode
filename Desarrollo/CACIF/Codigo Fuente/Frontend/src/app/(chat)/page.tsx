import { useState, useEffect } from "react"
import { Menu, X, AlertTriangle } from "lucide-react"
import { Sidebar } from "../../components/layout/Sidebar"
import { TopHeader } from "../../components/layout/TopHeader"
import { MessageList } from "../../features/chat/components/MessageList"
import { ChatInput } from "../../features/chat/components/ChatInput"
import { chatService } from "../../features/chat/services/chat.service"
import type { Message, Conversation } from "../../types/chat"
import { useAuth } from "../../features/auth/context/AuthContext"

function useDisclaimerState() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const hasSeenDisclaimer = sessionStorage.getItem("cacif_disclaimer_seen");
    return !hasSeenDisclaimer;
  });
  return [showDisclaimer, setShowDisclaimer] as const;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useDisclaimerState();

  const closeDisclaimer = () => {
    sessionStorage.setItem("cacif_disclaimer_seen", "true");
    setShowDisclaimer(false);
  };

  // Derive active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  let headerTitle = "Nueva conversación";
  let headerDesc = "Asistente inteligente listo para ayudarte con tus consultas";

  if (activeConversationId) {
    headerTitle = "Consulta General";
    headerDesc = "Resolviendo dudas generales sobre la FISI";

    if (activeConversation) {
      if (activeConversation.intent_type === "CU01") {
        headerTitle = "Búsqueda de Grupos";
        headerDesc = "Orientación y matchmaking con grupos de investigación";
      } else if (activeConversation.intent_type === "CU02") {
        headerTitle = "Convocatorias";
        headerDesc = "Gestión de concursos y financiamiento activos";
      } else if (activeConversation.intent_type === "CU03") {
        headerTitle = "Trámites y Grados";
        headerDesc = "Asesoría para planes de tesis y vinculación";
      } else if (activeConversation.intent_type === "CU04") {
        headerTitle = "Normativa FISI";
        headerDesc = "Consultas sobre el reglamento general";
      }
    }
  }

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

    const lowerText = text.toLowerCase();
    const isRecommendationQuery =
      !lowerText.startsWith("matchmaking:") && (
        (lowerText.includes("recomienda") && lowerText.includes("grupo")) ||
        lowerText.includes("matchmaking") ||
        (lowerText.includes("grupo") && lowerText.includes("unirme")) ||
        (lowerText.includes("grupo") && lowerText.includes("ayudar"))
      );

    if (isRecommendationQuery) {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: currentConvId,
        role: 'assistant',
        content: "Para ayudarte a encontrar el grupo de investigación ideal para ti, por favor completa este breve cuestionario de perfil:",
        ui_type: 'matchmaking_quiz',
        sent_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoadingMessages(false);
      return;
    }

    try {
      const response = await chatService.sendMessage(text, currentConvId);
      setMessages(prev => [...prev, response]);

      // Refresh conversations to get updated intent_type (titles)
      if (user) {
        chatService.getConversations(user.id).then(data => setConversations(data));
      }
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
                  {headerTitle}
                </h2>
                <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                  {headerDesc}
                </p>
              </div>
            </div>
            <div className="hidden sm:block rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary tracking-widest uppercase shadow-[0_0_10px_rgba(88,101,242,0.2)]">
              Asistente CACIF
            </div>
          </div>

          <MessageList messages={messages} isLoading={isLoadingMessages} onQuickAction={handleSend} />
          <ChatInput onSend={handleSend} isLoading={isLoadingMessages} hasMessages={messages.length > 0} />
        </main>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeDisclaimer} />
          <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-5">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-3">
              Versión Prototipo
            </h3>
            <div className="text-[14px] text-foreground/80 space-y-4 mb-8">
              <p>
                El asistente <strong>CACIF</strong> se encuentra en fase de pruebas. La información proporcionada es generada por Inteligencia Artificial basándose en los reglamentos de la FISI.
              </p>
              <p>
                Por favor, <strong>toma esta información con pinzas</strong> y úsala solo como una guía orientativa.
              </p>
              <div className="p-4 bg-muted/50 rounded-xl border border-border mt-4 text-[13px]">
                <p className="font-bold text-foreground mb-1">Para mayor seguridad y trámites formales:</p>
                <p>Acércate a la <strong>Unidad de Investigación (FISI)</strong> o escribe directamente al correo institucional: <a href="mailto:investigacion.fisi@unmsm.edu.pe" className="text-primary hover:underline font-medium">investigacion.fisi@unmsm.edu.pe</a>.</p>
              </div>
            </div>
            <button
              onClick={closeDisclaimer}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)]"
            >
              Entendido, continuar al chat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}