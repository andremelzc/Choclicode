import * as React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Input } from "../../../components/ui/Input"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/Card"
import { authService } from "../services/auth.service"
import { useAuth } from "../context/AuthContext"

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [university_code, setUniversityCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(university_code, password);
      login(response.user, response.token);
      navigate("/chat");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGuestLogin = async () => {
    setError("");
    setIsGuestLoading(true);
    try {
      const response = await authService.loginAsGuest();
      login(response.user, response.token);
      navigate("/chat");
    } catch (err: any) {
      setError("Error al entrar como invitado");
    } finally {
      setIsGuestLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[420px] bg-surface border-border shadow-2xl relative z-10">
      <CardHeader className="pb-8 text-left">
        <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
        <CardDescription className="text-muted-foreground text-[13px] mt-1">
          Ingresa tus credenciales institucionales UNMSM
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground/80 pl-1">Código de Estudiante</label>
            <Input
              type="text"
              placeholder="Ej: 23200107"
              iconLeft={<User className="w-[18px] h-[18px]" />}
              value={university_code}
              onChange={(e) => setUniversityCode(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground/80 pl-1">Contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              iconLeft={<Lock className="w-[18px] h-[18px]" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-[13px] font-medium text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2 hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all h-11 text-[14px]"
            disabled={isLoading || isGuestLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar al Sistema"}
          </Button>
        </form>
      </CardContent>

      <div className="px-6 pb-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-surface px-3 text-muted-foreground font-semibold">o continuar como</span>
          </div>
        </div>
      </div>

      <CardFooter className="pt-4 pb-6">
        <Button
          type="button"
          variant="outline"
          className="w-full hover:bg-surface/80 border-border text-foreground/80 hover:text-foreground h-11 text-[14px]"
          onClick={handleGuestLogin}
          disabled={isLoading || isGuestLoading}
        >
          {isGuestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <span className="flex items-center justify-center gap-2 w-full">
              Usuario Invitado <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
