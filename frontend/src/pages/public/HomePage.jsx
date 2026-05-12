import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavBar";

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
      ? "Panel admin"
      : user?.rol === "ARBITRO"
        ? "Panel árbitro"
        : "Ir al panel";

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-5 rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                ScoreTec · TecNM Campus Nogales
              </p>

              <h1 className="mt-2 text-2xl font-bold leading-tight text-[#2B2D31] sm:text-3xl">
                Información deportiva del campus
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6F76]">
                Consulta partidos, marcadores, equipos y estadísticas de los
                torneos deportivos en un solo lugar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Link
                to="/matches"
                className="rounded-2xl bg-[#8C1D2C] px-4 py-3 text-center text-sm font-semibold !text-white transition hover:bg-[#741826] hover:!text-white"
              >
                Ver partidos
              </Link>

              {token ? (
                <Link
                  to={panelLink}
                  className="rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-center text-sm font-semibold !text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:!text-white"
                >
                  {panelTexto}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-center text-sm font-semibold !text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:!text-white"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
          <section className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  Partidos
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[#2B2D31]">12</h2>
                <p className="mt-1 text-xs text-[#6B6F76]">registrados</p>
              </article>

              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  En vivo
                </p>
                <h2 className="mt-2 text-3xl font-bold text-green-700">2</h2>
                <p className="mt-1 text-xs text-[#6B6F76]">activos</p>
              </article>

              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  Equipos
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[#2B2D31]">8</h2>
                <p className="mt-1 text-xs text-[#6B6F76]">participantes</p>
              </article>

              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  Deportes
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[#8C1D2C]">4</h2>
                <p className="mt-1 text-xs text-[#6B6F76]">disciplinas</p>
              </article>
            </div>

            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#2B2D31]">
                    Partido destacado
                  </h2>
                  <p className="mt-1 text-xs text-[#6B6F76]">
                    Último resultado registrado
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  En vivo
                </span>
              </div>

              <div className="rounded-3xl bg-[#FAFAFA] px-4 py-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="min-w-0 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6E7EA] bg-white text-xs font-semibold text-[#8C1D2C]">
                      HT
                    </div>

                    <p className="truncate text-sm font-semibold text-[#2B2D31]">
                      Halcones Tec
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#6B6F76]">Local</p>
                  </div>

                  <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm">
                    <p className="text-3xl font-bold leading-none text-[#2B2D31]">
                      2<span className="mx-2 text-[#CDAA43]">-</span>1
                    </p>
                  </div>

                  <div className="min-w-0 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6E7EA] bg-white text-xs font-semibold text-[#CDAA43]">
                      LT
                    </div>

                    <p className="truncate text-sm font-semibold text-[#2B2D31]">
                      Linces Tec
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#6B6F76]">
                      Visitante
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-[#E6E7EA] bg-white px-3 py-2.5">
                  <p className="text-[11px] text-[#6B6F76]">Disciplina</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-[#2B2D31]">
                    Fútbol
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E6E7EA] bg-white px-3 py-2.5">
                  <p className="text-[11px] text-[#6B6F76]">Jornada</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-[#2B2D31]">
                    Actual
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E6E7EA] bg-white px-3 py-2.5">
                  <p className="text-[11px] text-[#6B6F76]">Sede</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-[#2B2D31]">
                    Cancha 1
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#2B2D31]">
                    Próximos partidos
                  </h2>
                  <p className="mt-1 text-xs text-[#6B6F76]">
                    Encuentros programados
                  </p>
                </div>

                <Link
                  to="/matches"
                  className="shrink-0 text-xs font-semibold text-[#8C1D2C]"
                >
                  Ver todos
                </Link>
              </div>

              <div className="space-y-2">
                <Link
                  to="/matches"
                  className="flex items-center gap-3 rounded-2xl bg-[#FAFAFA] px-3 py-3 transition hover:bg-[#F3F3F4]"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white">
                    <span className="text-[9px] font-semibold uppercase text-[#8C1D2C]">
                      May
                    </span>
                    <span className="text-base font-bold leading-none text-[#2B2D31]">
                      27
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2B2D31]">
                      Basketball Varonil
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                      Halcones vs Linces · 16:00h
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    Próximo
                  </span>
                </Link>

                <Link
                  to="/matches"
                  className="flex items-center gap-3 rounded-2xl bg-[#FAFAFA] px-3 py-3 transition hover:bg-[#F3F3F4]"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white">
                    <span className="text-[9px] font-semibold uppercase text-[#8C1D2C]">
                      May
                    </span>
                    <span className="text-base font-bold leading-none text-[#2B2D31]">
                      28
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2B2D31]">
                      Fútbol Soccer Femenil
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                      Nogales vs Águilas · 18:00h
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                    En vivo
                  </span>
                </Link>

                <Link
                  to="/matches"
                  className="flex items-center gap-3 rounded-2xl bg-[#FAFAFA] px-3 py-3 transition hover:bg-[#F3F3F4]"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white">
                    <span className="text-[9px] font-semibold uppercase text-[#8C1D2C]">
                      May
                    </span>
                    <span className="text-base font-bold leading-none text-[#2B2D31]">
                      29
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2B2D31]">
                      Voleibol Mixto
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                      TecNM vs Invitados · 17:30h
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    Próximo
                  </span>
                </Link>
              </div>
            </section>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-[#2B2D31]">
                Información del torneo
              </h2>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#FAFAFA] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">
                    Sede principal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#2B2D31]">
                    TecNM Campus Nogales
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">
                    Disciplinas
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#2B2D31]">
                    Fútbol, básquetbol, voleibol y más
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">
                    Consulta
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#2B2D31]">
                    Resultados públicos en tiempo real
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-[#2B2D31]">
                Accesos rápidos
              </h2>

              <div className="mt-4 grid gap-2">
                <Link
                  to="/matches"
                  className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#2B2D31] transition hover:bg-[#F3F3F4] hover:text-[#8C1D2C]"
                >
                  Ver calendario
                  <span className="text-[#8C1D2C]">→</span>
                </Link>

                <Link
                  to="/teams"
                  className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#2B2D31] transition hover:bg-[#F3F3F4] hover:text-[#8C1D2C]"
                >
                  Consultar equipos
                  <span className="text-[#8C1D2C]">→</span>
                </Link>

                <Link
                  to="/stats"
                  className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#2B2D31] transition hover:bg-[#F3F3F4] hover:text-[#8C1D2C]"
                >
                  Ver estadísticas
                  <span className="text-[#8C1D2C]">→</span>
                </Link>

                {!token && (
                  <Link
                    to="/login"
                    className="flex items-center justify-between rounded-2xl bg-[#8C1D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#741826]"
                  >
                    Iniciar sesión
                    <span>→</span>
                  </Link>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-[#2B2D31]">
                ¿Qué puedes consultar?
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F8F2E2] text-sm font-semibold text-[#8C1D2C]">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2B2D31]">
                      Partidos
                    </p>
                    <p className="text-xs leading-5 text-[#6B6F76]">
                      Fechas, horarios, sedes y marcadores.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F8F2E2] text-sm font-semibold text-[#8C1D2C]">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2B2D31]">
                      Equipos
                    </p>
                    <p className="text-xs leading-5 text-[#6B6F76]">
                      Participantes por disciplina.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F8F2E2] text-sm font-semibold text-[#8C1D2C]">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2B2D31]">
                      Estadísticas
                    </p>
                    <p className="text-xs leading-5 text-[#6B6F76]">
                      Resultados generales y desempeño del torneo.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
