import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavBar";

import { getMatchesRequest } from "../../api/matchesApi";
import { getTeamsRequest } from "../../api/teamsApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function HomePage() {
  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [partidosData, equiposData, disciplinasData] = await Promise.all([
        getMatchesRequest(),
        getTeamsRequest(),
        getDisciplinesRequest(),
      ]);

      setPartidos(partidosData);
      setEquipos(equiposData);
      setDisciplinas(disciplinasData);
    } catch (error) {
      setError("No se pudieron cargar los datos del inicio.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resumen = useMemo(() => {
    return {
      partidos: partidos.length,
      enVivo: partidos.filter((partido) => partido.estado === "EN_CURSO")
        .length,
      equipos: equipos.filter((equipo) => equipo.activo).length,
      deportes: disciplinas.filter((disciplina) => disciplina.activo).length,
    };
  }, [partidos, equipos, disciplinas]);

  const partidoDestacado = useMemo(() => {
    const enCurso = partidos.find((partido) => partido.estado === "EN_CURSO");

    if (enCurso) return enCurso;

    const finalizado = [...partidos]
      .filter((partido) => partido.estado === "FINALIZADO")
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))[0];

    if (finalizado) return finalizado;

    const proximo = [...partidos]
      .filter((partido) => partido.estado === "PROXIMO")
      .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0))[0];

    return proximo || null;
  }, [partidos]);

  const proximosPartidos = useMemo(() => {
    return [...partidos]
      .filter(
        (partido) =>
          partido.estado === "PROXIMO" || partido.estado === "EN_CURSO",
      )
      .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0))
      .slice(0, 3);
  }, [partidos]);

  const disciplinasActivas = useMemo(() => {
    return disciplinas
      .filter((disciplina) => disciplina.activo)
      .map((disciplina) => disciplina.nombre)
      .slice(0, 4);
  }, [disciplinas]);

  const estadoTexto = {
    PROXIMO: "Próximo",
    EN_CURSO: "En vivo",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };

  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700",
    EN_CURSO: "bg-green-50 text-green-700",
    FINALIZADO: "bg-[#F1F2F4] text-[#4B4F56]",
    CANCELADO: "bg-red-50 text-red-700",
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "Sin hora";

    return new Date(fecha).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "E";

    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

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
                className="rounded-2xl bg-[#8C1D2C] px-4 py-3 text-center text-sm font-semibold !text-white transition hover:bg-[#741826]"
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

                <h2 className="mt-2 text-3xl font-bold text-[#2B2D31]">
                  {cargando ? "..." : resumen.partidos}
                </h2>

                <p className="mt-1 text-xs text-[#6B6F76]">registrados</p>
              </article>

              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  En vivo
                </p>

                <h2 className="mt-2 text-3xl font-bold text-green-700">
                  {cargando ? "..." : resumen.enVivo}
                </h2>

                <p className="mt-1 text-xs text-[#6B6F76]">activos</p>
              </article>

              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  Equipos
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#2B2D31]">
                  {cargando ? "..." : resumen.equipos}
                </h2>

                <p className="mt-1 text-xs text-[#6B6F76]">participantes</p>
              </article>

              <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[#6B6F76]">
                  Deportes
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#8C1D2C]">
                  {cargando ? "..." : resumen.deportes}
                </h2>

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
                    {partidoDestacado
                      ? partidoDestacado.estado === "EN_CURSO"
                        ? "Partido actualmente en curso"
                        : partidoDestacado.estado === "FINALIZADO"
                          ? "Último resultado registrado"
                          : "Próximo encuentro programado"
                      : "Sin partidos registrados"}
                  </p>
                </div>

                {partidoDestacado && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      estadoClase[partidoDestacado.estado] ||
                      "bg-[#F1F2F4] text-[#4B4F56]"
                    }`}
                  >
                    {estadoTexto[partidoDestacado.estado] ||
                      partidoDestacado.estado}
                  </span>
                )}
              </div>

              {!partidoDestacado ? (
                <div className="rounded-3xl bg-[#FAFAFA] p-6 text-center text-sm text-[#6B6F76]">
                  Todavía no hay partidos registrados.
                </div>
              ) : (
                <>
                  <div className="rounded-3xl bg-[#FAFAFA] px-4 py-4">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div className="min-w-0 text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6E7EA] bg-white text-xs font-semibold text-[#8C1D2C]">
                          {obtenerIniciales(
                            partidoDestacado.equipoLocal?.nombre,
                          )}
                        </div>

                        <p className="truncate text-sm font-semibold text-[#2B2D31]">
                          {partidoDestacado.equipoLocal?.nombre || "Local"}
                        </p>

                        <p className="mt-0.5 text-[11px] text-[#6B6F76]">
                          Local
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm">
                        <p className="text-3xl font-bold leading-none text-[#2B2D31]">
                          {partidoDestacado.marcadorLocal ?? 0}
                          <span className="mx-2 text-[#CDAA43]">-</span>
                          {partidoDestacado.marcadorVisitante ?? 0}
                        </p>
                      </div>

                      <div className="min-w-0 text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6E7EA] bg-white text-xs font-semibold text-[#CDAA43]">
                          {obtenerIniciales(
                            partidoDestacado.equipoVisitante?.nombre,
                          )}
                        </div>

                        <p className="truncate text-sm font-semibold text-[#2B2D31]">
                          {partidoDestacado.equipoVisitante?.nombre ||
                            "Visitante"}
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
                        {partidoDestacado.disciplina?.nombre ||
                          "Sin disciplina"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E6E7EA] bg-white px-3 py-2.5">
                      <p className="text-[11px] text-[#6B6F76]">Fecha</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-[#2B2D31]">
                        {formatearFecha(partidoDestacado.fecha)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E6E7EA] bg-white px-3 py-2.5">
                      <p className="text-[11px] text-[#6B6F76]">Sede</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-[#2B2D31]">
                        {partidoDestacado.ubicacionNombre || "Sin sede"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#2B2D31]">
                    Próximos partidos
                  </h2>

                  <p className="mt-1 text-xs text-[#6B6F76]">
                    Encuentros programados o en curso
                  </p>
                </div>

                <Link
                  to="/matches"
                  className="shrink-0 text-xs font-semibold text-[#8C1D2C]"
                >
                  Ver todos
                </Link>
              </div>

              {proximosPartidos.length === 0 ? (
                <p className="rounded-2xl bg-[#FAFAFA] p-4 text-sm text-[#6B6F76]">
                  No hay próximos partidos registrados.
                </p>
              ) : (
                <div className="space-y-2">
                  {proximosPartidos.map((partido) => (
                    <Link
                      key={partido.id}
                      to={`/matches/${partido.id}`}
                      className="flex items-center gap-3 rounded-2xl bg-[#FAFAFA] px-3 py-3 transition hover:bg-[#F3F3F4]"
                    >
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white">
                        <span className="text-[9px] font-semibold uppercase text-[#8C1D2C]">
                          {formatearFecha(partido.fecha).split(" ")[1] || "--"}
                        </span>

                        <span className="text-base font-bold leading-none text-[#2B2D31]">
                          {partido.fecha
                            ? new Date(partido.fecha)
                                .getDate()
                                .toString()
                                .padStart(2, "0")
                            : "--"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#2B2D31]">
                          {partido.equipoLocal?.nombre || "Local"} vs{" "}
                          {partido.equipoVisitante?.nombre || "Visitante"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                          {partido.disciplina?.nombre || "Disciplina"} ·{" "}
                          {formatearHora(partido.fecha)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          estadoClase[partido.estado] ||
                          "bg-[#F1F2F4] text-[#4B4F56]"
                        }`}
                      >
                        {estadoTexto[partido.estado] || partido.estado}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
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
                    {disciplinasActivas.length > 0
                      ? disciplinasActivas.join(", ")
                      : "Sin disciplinas activas"}
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
                  to="/calendar"
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
                    className="flex items-center justify-between rounded-2xl bg-[#8C1D2C] px-4 py-3 text-sm font-semibold !text-white transition hover:bg-[#741826]"
                  >
                    Iniciar sesión
                    <span>→</span>
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
