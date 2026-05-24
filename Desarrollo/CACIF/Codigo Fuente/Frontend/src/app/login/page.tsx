
import { LoginLogo } from "../../features/auth/components/LoginLogo"
import { LoginForm } from "../../features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <LoginLogo />
        <LoginForm />
        <p className="mt-8 text-[11px] font-bold tracking-widest text-muted-foreground/60 uppercase text-center max-w-xs">
          Sistema de Gestión de Grupos de Investigación
        </p>
      </div>
    </div>
  )
}
