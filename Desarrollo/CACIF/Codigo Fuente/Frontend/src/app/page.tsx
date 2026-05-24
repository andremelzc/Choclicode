
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button";
import { ArrowRight, BookOpen, Search, Scale } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden text-center px-4">
      {/* Glow ambiental */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl flex flex-col items-center">
        {/* Logo / Badge */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white font-bold text-3xl shadow-[0_0_30px_rgba(88,101,242,0.4)] mb-8">
          CA
        </div>

        {/* Titulos */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
          Sistema CACIF
        </h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          Tu asistente inteligente para la orientación en investigación, gestión de tesis y convalidación de prácticas en la FISI - UNMSM.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-16">
          <Button
            className="h-12 px-8 text-base shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)] transition-all flex items-center justify-center gap-2"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 text-base border-border hover:bg-surface/50 text-foreground"
            onClick={() => navigate("/chat")}
          >
            Ir al Chat (Invitado)
          </Button>
        </div>

        {/* Features minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="flex flex-col items-center p-4">
            <div className="h-10 w-10 rounded-full bg-surface/50 border border-border flex items-center justify-center text-primary mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Encuentra Grupos</h3>
            <p className="text-[13px] text-muted-foreground">Matchmaking inteligente con líneas de investigación.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="h-10 w-10 rounded-full bg-surface/50 border border-border flex items-center justify-center text-primary mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Gestión de Tesis</h3>
            <p className="text-[13px] text-muted-foreground">Guía administrativa paso a paso.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="h-10 w-10 rounded-full bg-surface/50 border border-border flex items-center justify-center text-primary mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Convalidaciones</h3>
            <p className="text-[13px] text-muted-foreground">Requisitos legales y normativos claros.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
