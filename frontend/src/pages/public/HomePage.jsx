import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";

function HomePage() {
  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
            TecNM Campus Nogales
          </p>

          <h1 className="mt-4 text-5xl font-bold leading-tight">
            Marcadores, partidos y estadísticas en un solo lugar.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B6F76]">
            ScoreTec centraliza la información deportiva del campus para que
            estudiantes, árbitros y administradores puedan consultar y gestionar
            los torneos de forma clara y rápida.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/matches"
              className="rounded-xl bg-[#8C1D2C] px-6 py-3 text-center font-semibold text-white transition hover:opacity-90"
            >
              Ver partidos
            </Link>

            {!token && (
              <Link
                to="/login"
                className="rounded-xl border border-[#8C1D2C] px-6 py-3 text-center font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
              >
                Iniciar sesión
              </Link>
            )}

            {token && user?.rol === "ADMIN" && (
              <Link
                to="/admin"
                className="rounded-xl border border-[#8C1D2C] px-6 py-3 text-center font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
              >
                Ir al panel admin
              </Link>
            )}

            {token && user?.rol === "ARBITRO" && (
              <Link
                to="/referee"
                className="rounded-xl border border-[#8C1D2C] px-6 py-3 text-center font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
              >
                Ir al panel árbitro
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6F76]">Partido destacado</p>
              <h2 className="mt-1 text-xl font-bold">Jornada deportiva</h2>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              EN VIVO
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-3xl bg-[#FAFAFA] p-6">
            <div className="text-right">
              <h3 className="font-semibold">Halcones Tec</h3>
              <p className="text-xs text-[#6B6F76]">Local</p>
            </div>

            <div className="rounded-2xl bg-white px-5 py-3 shadow-sm">
              <p className="text-3xl font-bold">
                2 <span className="text-[#CDAA43]">-</span> 1
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Linces Tec</h3>
              <p className="text-xs text-[#6B6F76]">Visitante</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3">
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-[#6B6F76]">Disciplina</p>
                <p className="mt-0.5 font-semibold text-[#2B2D31]">Fútbol</p>
              </div>

              <div>
                <p className="text-xs text-[#6B6F76]">Estado</p>
                <p className="mt-0.5 font-semibold text-[#2B2D31]">En curso</p>
              </div>

              <div>
                <p className="text-xs text-[#6B6F76]">Sede</p>
                <p className="mt-0.5 font-semibold text-[#2B2D31]">
                  Directora de Cancha
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
