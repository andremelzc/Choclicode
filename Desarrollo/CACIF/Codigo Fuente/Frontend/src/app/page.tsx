
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16">
          <div className="flex flex-col items-center p-6 bg-surface/30 border border-border rounded-2xl hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Encuentra Grupos</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">Matchmaking inteligente para conectar con líneas de investigación y laboratorios ideales para ti.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-surface/30 border border-border rounded-2xl hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Gestión de Tesis</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">Guía administrativa paso a paso para la inscripción, desarrollo y sustentación de tu proyecto.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-surface/30 border border-border rounded-2xl hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Normativa Clara</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">Respuestas precisas sobre convalidaciones, reglamentos y derechos estudiantiles.</p>
          </div>
        </div>

        {/* Contacto */}
        <div className="w-full max-w-2xl border-t border-border/50 pt-10 pb-8 flex flex-col items-center">
          <h4 className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase mb-4">
            ¿Necesitas ayuda adicional?
          </h4>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[13px] text-foreground/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>
                Correo: <a href="mailto:investigacion.fisi@unmsm.edu.pe" className="text-primary hover:underline font-medium">investigacion.fisi@unmsm.edu.pe</a>
              </span>
            </div>
            <div className="hidden sm:block text-muted-foreground/30">|</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Unidad de Investigación, FISI - UNMSM</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-4 text-center max-w-lg leading-relaxed">
            CACIF es una herramienta de asistencia impulsada por Inteligencia Artificial. Toda información provista está basada en documentación oficial, pero se recomienda validar casos excepcionales directamente con la Unidad.
          </p>
        </div>
      </div>
    </div>
  )
}
