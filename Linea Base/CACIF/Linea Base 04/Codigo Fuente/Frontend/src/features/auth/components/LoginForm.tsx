import * as React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Input } from "../../../components/ui/Input"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/Card"
import { authService } from "../services/auth.service"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      login(response.user, response.token);
      navigate("/chat");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
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
    } catch {
      setError("Error al entrar como invitado");
    } finally {
      setIsGuestLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="w-[calc(100%-2rem)] md:w-full max-w-[420px] relative z-10 mx-auto"
    >
      <Card className="w-full bg-surface border-border shadow-2xl">
      <CardHeader className="pb-8 text-left">
        <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
        <CardDescription className="text-muted-foreground text-[13px] mt-1">
          Ingresa tus credenciales institucionales UNMSM
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground/80 pl-1">Correo Electrónico</label>
            <Input
              type="email"
              placeholder="Ej: ejemplo@unmsm.edu.pe"
              iconLeft={<User className="w-[18px] h-[18px]" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
    </motion.div>
  )
}
