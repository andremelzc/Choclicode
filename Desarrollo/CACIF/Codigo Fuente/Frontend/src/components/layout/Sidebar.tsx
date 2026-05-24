
import { Plus } from "lucide-react"
import { cn } from "../../lib/utils"

export const Sidebar = () => {
  const conversations = [
    { title: "Plan de tesis MIABOGUITO", time: "Hoy · 10:42 am", active: false },
    { title: "Convalidación de PPP", time: "30 abr · 03:15 pm", active: false },
    { title: "Grupos con línea IA", time: "28 abr · 11:00 am", active: false },
    { title: "Vacantes en GIDIS-Web", time: "25 abr · 09:30 am", active: false },
  ]

  return (
    <aside className="w-[280px] bg-background border-r border-border flex flex-col shrink-0 h-full relative z-0">
      <div className="p-4">
        <button className="flex w-full items-center justify-start px-5 gap-3 rounded-xl border border-primary/40 bg-primary/10 py-3 text-[14px] font-medium text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all duration-300">
          <Plus className="w-4 h-4" />
          Nueva conversación
        </button>
      </div>
      
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-widest mb-3 px-1 uppercase">
          Conversaciones
        </h3>
        
        <div className="flex flex-col gap-1">
          {conversations.map((conv, idx) => (
            <button
              key={idx}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-all duration-300",
                conv.active 
                  ? "bg-surface border border-primary/30 shadow-[0_0_10px_rgba(88,101,242,0.1)]" 
                  : "hover:bg-surface/50 text-muted-foreground border border-transparent hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]"
              )}
            >
              <span className={cn("text-[14px] font-semibold truncate w-full", conv.active ? "text-foreground" : "text-foreground/70")}>
                {conv.title}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {conv.time}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
