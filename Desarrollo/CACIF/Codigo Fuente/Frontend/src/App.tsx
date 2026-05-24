export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-sidebar px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              CACIF 🚀
            </h1>

            <p className="text-sm text-muted-foreground">
              Asistente de Investigación - FISI
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-sm text-success">
            <div className="h-2 w-2 rounded-full bg-success" />

            Sistema operativo
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-border bg-sidebar p-4">
            <button className="mb-4 w-full rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-700">
              + Nueva conversación
            </button>

            <div className="space-y-2">
              <div className="rounded-xl bg-surface p-3">
                <p className="font-medium">
                  Convocatorias IA
                </p>

                <span className="text-sm text-muted-foreground">
                  Hace 2 min
                </span>
              </div>

              <div className="rounded-xl p-3 transition hover:bg-surface">
                <p className="font-medium">
                  Plan de tesis
                </p>

                <span className="text-sm text-muted-foreground">
                  Ayer
                </span>
              </div>

              <div className="rounded-xl p-3 transition hover:bg-surface">
                <p className="font-medium">
                  Marco normativo
                </p>

                <span className="text-sm text-muted-foreground">
                  Hace 3 días
                </span>
              </div>
            </div>
          </aside>

          {/* Chat */}
          <section className="flex flex-col rounded-2xl border border-border bg-sidebar">
            {/* Messages */}
            <div className="flex flex-1 flex-col gap-4 p-6">
              {/* User bubble */}
              <div className="ml-auto max-w-[75%] rounded-2xl bg-primary px-4 py-3 text-white shadow-lg shadow-primary-500/20">
                Quiero registrar mi plan de tesis
              </div>

              {/* AI bubble */}
              <div className="max-w-[85%] rounded-2xl border border-border bg-chatbot p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                    AI
                  </div>

                  <div>
                    <p className="font-semibold">
                      CACIF Assistant
                    </p>

                    <span className="text-xs text-muted-foreground">
                      RF10 · Reglamento VRI
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-foreground">
                  Para registrar tu plan de tesis debes presentar los
                  siguientes documentos:
                </p>

                <ul className="mb-4 list-disc space-y-2 pl-5 text-foreground">
                  <li>Formato de plan de tesis</li>
                  <li>Carta de aceptación del asesor</li>
                  <li>Constancia de matrícula vigente</li>
                </ul>

                {/* Warning */}
                <div className="mb-4 rounded-xl border border-warning bg-warning/10 p-4">
                  <p className="font-semibold text-warning">
                    Advertencia
                  </p>

                  <p className="mt-1 text-sm text-warning-500">
                    Verifica que tu asesor esté registrado oficialmente
                    en la FISI.
                  </p>
                </div>

                {/* Success */}
                <div className="rounded-xl border border-success bg-success/10 p-4">
                  <p className="font-semibold text-success-500">
                    Siguiente paso
                  </p>

                  <p className="mt-1 text-sm text-success-500">
                    Descarga el formato y envíalo a la unidad de
                    investigación.
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border bg-sidebar p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                <input
                  type="text"
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />

                <button className="rounded-xl bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-700">
                  Enviar
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}