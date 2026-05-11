import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";

function HomePage() {
  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const panelLink =
    user?.rol === "ADMIN"
      ? "/admin"
      : user?.rol === "ARBITRO"
        ? "/referee"
        : "/";

  const panelTexto =
    user?.rol === "ADMIN"
      ? "Ir al panel admin"
      : user?.rol === "ARBITRO"
        ? "Ir al panel árbitro"
        : "Ir al panel";

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="order-2 lg:order-1">
          <div className="mb-4 inline-flex rounded-full border border-[#E6E7EA] bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#8C1D2C] shadow-sm">
            Campus TecNM Nogales
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-[#2B2D31] sm:text-5xl lg:text-6xl">
            Marcadores, partidos y estadísticas deportivas en tiempo real.
          </h1>

          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-[#6B6F76] sm:text-lg sm:leading-8">
            ScoreTec centraliza los torneos del campus para consultar partidos,
            seguir resultados y facilitar el registro de eventos por parte de
            árbitros o administradores.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/matches"
              className="rounded-2xl bg-[#8C1D2C] px-6 py-4 text-center text-sm font-black text-white shadow-sm transition hover:bg-[#741826]"
            >
              Ver partidos
            </Link>

            {!token ? (
              <Link
                to="/login"
                className="rounded-2xl border border-[#8C1D2C] bg-white px-6 py-4 text-center text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
              >
                Iniciar sesión
              </Link>
            ) : (
              <Link
                to={panelLink}
                className="rounded-2xl border border-[#8C1D2C] bg-white px-6 py-4 text-center text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
              >
                {panelTexto}
              </Link>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            <div className="rounded-2xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#2B2D31]">24/7</p>
              <p className="mt-1 text-xs font-bold text-[#6B6F76]">
                Consulta pública
              </p>
            </div>

            <div className="rounded-2xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#2B2D31]">Live</p>
              <p className="mt-1 text-xs font-bold text-[#6B6F76]">
                Marcadores
              </p>
            </div>

            <div className="rounded-2xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#2B2D31]">UX</p>
              <p className="mt-1 text-xs font-bold text-[#6B6F76]">
                Mobile first
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                  Partido destacado
                </p>

                <h2 className="mt-1 truncate text-xl font-black text-[#2B2D31]">
                  Jornada deportiva
                </h2>
              </div>

              <span className="shrink-0 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                En vivo
              </span>
            </div>

            <div className="rounded-3xl bg-[#FAFAFA] p-4 sm:p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="min-w-0 text-right">
                  <h3 className="truncate text-sm font-black text-[#2B2D31] sm:text-base">
                    Halcones Tec
                  </h3>
                  <p className="mt-1 text-xs font-bold text-[#6B6F76]">Local</p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm sm:px-6">
                  <p className="text-3xl font-black leading-none text-[#2B2D31] sm:text-5xl">
                    2<span className="mx-2 text-[#CDAA43]">-</span>1
                  </p>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-[#2B2D31] sm:text-base">
                    Linces Tec
                  </h3>
                  <p className="mt-1 text-xs font-bold text-[#6B6F76]">
                    Visitante
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3">
                <p className="text-xs font-bold text-[#6B6F76]">Disciplina</p>
                <p className="mt-1 text-sm font-black text-[#2B2D31]">Fútbol</p>
              </div>

              <div className="rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3">
                <p className="text-xs font-bold text-[#6B6F76]">Estado</p>
                <p className="mt-1 text-sm font-black text-[#2B2D31]">
                  En curso
                </p>
              </div>

              <div className="rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3">
                <p className="text-xs font-bold text-[#6B6F76]">Sede</p>
                <p className="mt-1 truncate text-sm font-black text-[#2B2D31]">
                  Cancha principal
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-[#2B2D31]">
                  Últimos eventos
                </p>

                <Link
                  to="/matches"
                  className="text-xs font-black text-[#8C1D2C]"
                >
                  Ver todos
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-[#2B2D31]">
                      Gol Halcones Tec
                    </p>
                    <p className="text-xs text-[#6B6F76]">Min. 42</p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                    Gol
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-[#2B2D31]">
                      Falta Linces Tec
                    </p>
                    <p className="text-xs text-[#6B6F76]">Min. 38</p>
                  </div>

                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700">
                    Falta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F2E2] text-lg font-black text-[#8C1D2C]">
              1
            </div>

            <h3 className="text-lg font-black text-[#2B2D31]">
              Consulta pública
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
              Estudiantes y visitantes pueden revisar partidos, resultados y
              equipos sin entrar al panel administrativo.
            </p>
          </article>

          <article className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F2E2] text-lg font-black text-[#8C1D2C]">
              2
            </div>

            <h3 className="text-lg font-black text-[#2B2D31]">
              Control de árbitro
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
              El árbitro puede entrar desde celular y registrar goles, puntos,
              faltas o eventos del partido de forma rápida.
            </p>
          </article>

          <article className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F2E2] text-lg font-black text-[#8C1D2C]">
              3
            </div>

            <h3 className="text-lg font-black text-[#2B2D31]">
              Administración
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
              Los administradores gestionan usuarios, equipos, jugadores,
              disciplinas y partidos desde un panel más amplio.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
