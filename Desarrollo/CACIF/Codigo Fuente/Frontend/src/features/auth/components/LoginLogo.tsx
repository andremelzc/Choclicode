

export const LoginLogo = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center mb-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white font-bold text-2xl shadow-[0_0_20px_rgba(88,101,242,0.4)]">
        CA
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-wide">
          Sistema CACIF
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Asistente de Investigación · FISI - UNMSM
        </p>
      </div>
    </div>
  )
}
