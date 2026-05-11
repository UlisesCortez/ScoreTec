function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#8C1D2C]">
            <span className="text-2xl font-bold text-[#8C1D2C]">ST</span>
          </div>

          <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight">
              Score<span className="text-[#8C1D2C]">Tec</span>
            </h1>
            <p className="text-sm text-[#6B6F76]">
              Plataforma deportiva del TecNM Campus Nogales
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white px-8 py-6 shadow-sm">
          <h2 className="mb-3 text-2xl font-semibold">
            Frontend funcionando correctamente
          </h2>
          <p className="max-w-xl text-[#6B6F76]">
            Esta será la vista pública para consultar partidos, marcadores,
            resultados y estadísticas de los torneos deportivos del campus.
          </p>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
