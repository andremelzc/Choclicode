import type { Message } from "../../../types/chat"
import { Search, Link as LinkIcon, ExternalLink, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface MessageBubbleProps {
  message: Message;
  onQuickAction?: (text: string) => void;
}

export const MessageBubble = ({ message, onQuickAction }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  const formattedTime = new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
        className="flex justify-end mb-6"
      >
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="rounded-2xl rounded-tr-sm bg-primary/20 text-primary-foreground p-5 border border-primary/30 shadow-sm backdrop-blur-sm">
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className="mt-2 text-[11px] font-medium text-muted-foreground mr-2">
            {formattedTime}
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant Bubble
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 25 }}
      className="flex gap-5 mb-6 max-w-[90%]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_15px_rgba(88,101,242,0.4)]">
        CA
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-tl-sm bg-chatbot p-6 border border-border/40 shadow-sm">
          
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-primary tracking-widest uppercase">
              {message.ui_type === 'matchmaking_cards' ? 'ORIENTACIÓN Y MATCHMAKING - RF01, RF02, RF03' : 
               message.ui_type === 'convocatoria_cards' ? 'GESTIÓN DE CONVOCATORIAS - RF04, RF05, RF06' : 
               'CACIF · ASISTENTE FISI'}
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

          {/* Render Matchmaking Cards (CU01) */}
          {message.ui_type === 'matchmaking_cards' && message.cards_data && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
              className="mt-6 flex flex-col gap-4"
            >
              {message.cards_data.map((card) => (
                <motion.div 
                  key={card.id} 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" } } }}
                  className="bg-surface/30 border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <h4 className="font-bold text-[16px] text-foreground mb-1">{card.name}</h4>
                  <p className="text-[13px] text-muted-foreground mb-4">Docente Responsable: {card.coordinator}</p>
                  
                  <div className="mb-4">
                    <span className="inline-block border border-primary text-primary bg-primary/10 px-3 py-1.5 rounded-lg text-[12px] font-medium">
                      {card.lines[0]}
                    </span>
                  </div>

                  {card.technical_areas && card.technical_areas.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[12px] text-muted-foreground mb-2">Áreas técnicas:</p>
                      <div className="flex flex-wrap gap-2">
                        {card.technical_areas.map((area, idx) => (
                          <span key={idx} className="bg-surface border border-border text-foreground/80 px-2.5 py-1 rounded-md text-[11px] font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => onQuickAction?.(`Dame más información sobre el ${card.name}`)}
                    className="w-full bg-primary/90 text-white font-medium text-[13px] py-2.5 rounded-lg hover:bg-primary transition-colors"
                  >
                    Ver información completa
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Render Concursos / Convocatorias Cards (CU02) */}
          {message.ui_type === 'convocatoria_cards' && message.contest_data && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
              className="mt-6 flex flex-col gap-6"
            >
              {message.contest_data.map((contest) => (
                <motion.div key={contest.id} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
                  
                  <div className="bg-surface/30 border border-border rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-warning text-warning-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {contest.status_badge}
                      </span>
                      <span className="bg-success text-success-foreground px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-success/30">
                        {contest.status_label}
                      </span>
                    </div>

                    <h4 className="font-bold text-[18px] text-foreground mb-2">{contest.title}</h4>
                    <p className="text-[13px] text-muted-foreground mb-5">Tipo: <span className="font-medium text-foreground">{contest.contest_type}</span></p>
                    
                    <div className="mb-5">
                      <p className="text-[13px] text-muted-foreground mb-2">Requisitos para participar como grupo:</p>
                      <ul className="space-y-1.5 ml-1">
                        {contest.requirements.map((req, idx) => {
                          const boldParts = req.split('**');
                          return (
                            <li key={idx} className="text-[13px] text-foreground/80 flex items-start gap-2">
                              <span className="text-muted-foreground/50 mt-1">•</span>
                              <span>
                                {boldParts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part)}
                              </span>
                            </li>
                          )
                        })}
                        <li className="text-[13px] text-foreground/80 flex items-start gap-2 pt-1">
                          <span className="text-muted-foreground/50 mt-1">•</span>
                          <span><strong className="text-foreground">Premio:</strong> {contest.prize}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5 mb-5 p-4 border border-warning/40 rounded-xl bg-warning/5 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-warning" />
                        <span className="text-[13px] font-bold text-warning">Documentos requeridos del grupo:</span>
                      </div>
                      <p className="text-[12px] text-foreground/80 leading-relaxed ml-6">{contest.required_documents}</p>
                    </div>

                    <a 
                      href={contest.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-warning text-warning-foreground py-3 rounded-xl text-[14px] font-bold hover:bg-warning/90 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                    >
                      Inscribir proyecto del grupo <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Timeline section */}
                  {contest.timeline_events && contest.timeline_events.length > 0 && (
                    <div className="px-2">
                      <h4 className="text-[14px] font-bold text-foreground mb-6">Cronograma y Eventos - {contest.title.split(':')[0]}</h4>
                      <div className="relative border-l-2 border-border ml-2 pl-6 pb-2 space-y-7">
                        {contest.timeline_events.map((event, idx) => (
                          <div key={idx} className="relative">
                            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-background ${
                              event.status === 'completed' ? 'bg-success' :
                              event.status === 'current' ? 'bg-warning' :
                              'bg-border'
                            }`}></div>
                            <h5 className={`text-[14px] font-bold leading-none ${event.status === 'upcoming' ? 'text-foreground/60' : 'text-foreground'}`}>
                              {event.title}
                            </h5>
                            <p className="text-[12px] text-muted-foreground mt-1.5 font-medium">{event.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Cited Sources */}
          {message.cited_sources && message.cited_sources.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 pt-4 border-t border-border/50"
            >
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Referencias Normativas Utilizadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {message.cited_sources.map(source => (
                  <div key={source.id} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 hover:bg-surface transition-all cursor-pointer hover:border-primary/40 hover:text-primary group">
                    <span className="text-[11px] font-medium text-foreground/80 group-hover:text-primary transition-colors">{source.document_name}</span>
                    {source.start_page && (
                      <span className="text-[10px] text-muted-foreground border-l border-border pl-2">Pág. {source.start_page}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="mt-2 text-[11px] font-medium text-muted-foreground ml-2">
          {formattedTime}
        </div>
      </div>
    </motion.div>
  );
};
