function RefereeDashboard() {
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8 text-[#2B2D31]">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Panel de árbitro</h1>
        <p className="mt-2 text-[#6B6F76]">Bienvenido, {user?.nombre}</p>
      </section>
    </main>
  );
}

export default RefereeDashboard;
