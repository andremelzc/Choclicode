import { Sidebar } from "./components/layout/Sidebar"
import { TopHeader } from "./components/layout/TopHeader"
import { Send, Search, FileText, Scale, RefreshCw } from "lucide-react"

export default function App() {
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
                Plan de tesis MIABOGUITO
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                El sistema identifica automáticamente el tipo de consulta · RAG activo
              </p>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary tracking-widest uppercase shadow-[0_0_10px_rgba(88,101,242,0.2)]">
              CACIF · Asistente FISI
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 pb-40 scroll-smooth">
            <div className="max-w-[850px] mx-auto flex gap-5">
              {/* AI Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_15px_rgba(88,101,242,0.4)]">
                AI
              </div>
              
              {/* AI Message Bubble */}
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-chatbot p-6 border border-border/40 shadow-sm">
                  <div className="mb-4 flex items-center">
                    <span className="text-[11px] font-bold text-primary tracking-widest uppercase">
                      CACIF · ASISTENTE FISI
                    </span>
                  </div>
                  
                  <p className="text-[15px] leading-relaxed text-foreground/90 mb-6 font-medium">
                    Hola, soy el asistente del sistema CACIF. Puedo ayudarte con cualquier consulta sobre grupos de investigación de la FISI: desde encontrar un grupo hasta formalizar tu tesis, convalidar prácticas o conocer tus derechos como investigador.
                    <br/><br/>
                    ¿En qué puedo ayudarte hoy?
                  </p>

                  {/* Action Chips */}
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/30 px-3.5 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground hover:bg-surface hover:border-primary/50 hover:shadow-[0_0_15px_rgba(88,101,242,0.2)] transition-all">
                      <Search className="w-[15px] h-[15px] text-primary" strokeWidth={2.5} />
                      Buscar grupo
                    </button>
                    <button className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/30 px-3.5 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground hover:bg-surface hover:border-primary/50 hover:shadow-[0_0_15px_rgba(88,101,242,0.2)] transition-all">
                      <FileText className="w-[15px] h-[15px] text-foreground/60" strokeWidth={2.5} />
                      Tramitar mi tesis
                    </button>
                    <button className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/30 px-3.5 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground hover:bg-surface hover:border-primary/50 hover:shadow-[0_0_15px_rgba(88,101,242,0.2)] transition-all">
                      <RefreshCw className="w-[15px] h-[15px] text-primary" strokeWidth={2.5} />
                      Convalidar PPP
                    </button>
                    <button className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/30 px-3.5 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground hover:bg-surface hover:border-warning/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
                      <Scale className="w-[15px] h-[15px] text-warning" strokeWidth={2.5} />
                      Mis derechos
                    </button>
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="mt-2.5 text-[11px] font-medium text-muted-foreground ml-2">
                  10:42 am
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-12 pb-6 px-8 z-20">
            <div className="max-w-[850px] mx-auto">
              <div className="relative flex items-center rounded-2xl group">
                <input 
                  type="text" 
                  placeholder="Escribe tu consulta. El sistema identifica automáticamente el tema..." 
                  className="w-full rounded-2xl border border-border bg-surface/60 py-4 pl-6 pr-16 text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface focus:shadow-[0_0_20px_rgba(88,101,242,0.15)] transition-all backdrop-blur-md"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_20px_rgba(88,101,242,0.6)]">
                  <Send className="w-[18px] h-[18px] ml-0.5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="mt-4 text-center text-[11px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                CACIF · FISI-UNMSM · Base normativa actualizada al 02/05/2026
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}