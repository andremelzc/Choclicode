

export const Footer = () => {
  return (
    <footer className="py-6 px-6 border-t border-border mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Asistente CACIF - FISI UNMSM. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Reglamento de Grupos</a>
          <a href="#" className="hover:text-foreground transition-colors">Soporte Técnico</a>
        </div>
      </div>
    </footer>
  )
}
