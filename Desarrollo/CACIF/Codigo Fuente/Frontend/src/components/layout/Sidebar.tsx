
import { Plus, Loader2, MessageSquare } from "lucide-react"
import { cn } from "../../lib/utils"
import type { Conversation } from "../../types/chat"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  conversations: Conversation[];
  isLoadingConversations: boolean;
}

export const Sidebar = ({ 
  activeConversationId, 
  onSelectConversation, 
  onNewConversation, 
  conversations, 
  isLoadingConversations 
}: SidebarProps) => {

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' · ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="w-[280px] bg-background border-r border-border flex flex-col shrink-0 h-full relative z-0">
      <div className="p-4">
        <button 
          onClick={onNewConversation}
          className="flex w-full items-center justify-start px-5 gap-3 rounded-xl border border-primary/40 bg-primary/10 py-3 text-[14px] font-medium text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Nueva conversación
        </button>
      </div>
      
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-widest mb-3 px-1 uppercase">
          Conversaciones
        </h3>
        
        <div className="flex flex-col gap-1">
          <AnimatePresence mode="wait">
            {isLoadingConversations ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex justify-center py-4 text-muted-foreground"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
              </motion.div>
            ) : conversations.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-6 px-4"
              >
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[12px] font-medium text-muted-foreground">No hay conversaciones previas</p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
                className="flex flex-col gap-1"
              >
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <motion.button
                      key={conv.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      onClick={() => onSelectConversation(conv.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-colors duration-300",
                        isActive 
                          ? "bg-surface border border-primary/30 shadow-[0_0_10px_rgba(88,101,242,0.1)]" 
                          : "hover:bg-surface/50 text-muted-foreground border border-transparent hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                      )}
                    >
                      <span className={cn("text-[14px] font-semibold truncate w-full", isActive ? "text-foreground" : "text-foreground/70")}>
                        {conv.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatDate(conv.started_at)}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}
