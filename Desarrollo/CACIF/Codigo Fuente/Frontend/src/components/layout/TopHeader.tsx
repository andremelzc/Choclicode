import * as React from "react"
import { Avatar } from "../ui/Avatar"

export const TopHeader = () => {
  return (
    <header className="h-[72px] border-b border-border bg-background flex items-center justify-between px-6 shrink-0 w-full z-10 relative shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-[0_0_15px_rgba(88,101,242,0.4)]">
          CA
        </div>
        <div className="flex flex-col">
          <h1 className="text-[15px] font-bold text-foreground leading-tight tracking-wide">
            SISTEMA CACIF
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Asistente de Investigación · FISI - UNMSM
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Badge Sistema Operativo */}
        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.9)]"></div>
          Sistema operativo
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-3 rounded-full border border-border bg-surface/30 pl-1.5 pr-5 py-1.5 hover:bg-surface hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <Avatar size="sm" fallback="AM" className="bg-primary/20 text-primary border border-primary/30 h-7 w-7 text-xs font-bold shadow-[0_0_10px_rgba(88,101,242,0.2)]" />
          <span className="text-[13px] font-medium text-muted-foreground">
            Andre Melendez Cava · 23200107
          </span>
        </button>
      </div>
    </header>
  )
}
