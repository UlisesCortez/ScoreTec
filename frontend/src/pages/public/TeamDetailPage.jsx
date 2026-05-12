import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavbar";

import { getTeamsRequest } from "../../api/teamsApi";
import { getPlayersRequest } from "../../api/playersApi";
import { getMatchesRequest } from "../../api/matchesApi";

function TeamDetailPage() {
  const { id } = useParams();

  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const equipoId = Number(id);

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [equiposData, jugadoresData, partidosData] = await Promise.all([
        getTeamsRequest(),
        getPlayersRequest(),
        getMatchesRequest(),
      ]);

      setEquipos(equiposData);
      setJugadores(jugadoresData);
      setPartidos(partidosData);
    } catch (error) {
      setError("No se pudo cargar el detalle del equipo.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const equipo = useMemo(() => {
    return equipos.find((item) => item.id === equipoId);
  }, [equipos, equipoId]);

  const jugadoresEquipo = useMemo(() => {
    return jugadores
      .filter((jugador) => jugador.equipoId === equipoId && jugador.activo)
      .sort((a, b) => {
        const numeroA = a.numero ?? 999;
        const numeroB = b.numero ?? 999;

        if (numeroA !== numeroB) return numeroA - numeroB;

        return a.nombre.localeCompare(b.nombre);
      });
  }, [jugadores, equipoId]);

  const partidosEquipo = useMemo(() => {
    return partidos
      .filter(
        (partido) =>
          partido.equipoLocalId === equipoId ||
          partido.equipoVisitanteId === equipoId,
      )
      .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0));
  }, [partidos, equipoId]);

  const partidosFinalizados = useMemo(() => {
    return partidosEquipo.filter((partido) => partido.estado === "FINALIZADO");
  }, [partidosEquipo]);

  const partidosConMarcador = useMemo(() => {
    return partidosEquipo.filter(
      (partido) =>
        partido.estado === "FINALIZADO" || partido.estado === "EN_CURSO",
    );
  }, [partidosEquipo]);

  const resultadosRecientes = useMemo(() => {
    return [...partidosFinalizados]
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
      .slice(0, 5);
  }, [partidosFinalizados]);

  const proximosPartidos = useMemo(() => {
    return partidosEquipo
      .filter(
        (partido) =>
          partido.estado === "PROXIMO" || partido.estado === "EN_CURSO",
      )
      .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0))
      .slice(0, 5);
  }, [partidosEquipo]);

  const estadisticas = useMemo(() => {
    const datos = {
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      favor: 0,
      contra: 0,
      dif: 0,
    };

    partidosConMarcador.forEach((partido) => {
      const esLocal = partido.equipoLocalId === equipoId;

      const marcadorEquipo = esLocal
        ? (partido.marcadorLocal ?? 0)
        : (partido.marcadorVisitante ?? 0);

      const marcadorRival = esLocal
        ? (partido.marcadorVisitante ?? 0)
        : (partido.marcadorLocal ?? 0);

      datos.pj += 1;
      datos.favor += marcadorEquipo;
      datos.contra += marcadorRival;

      if (marcadorEquipo > marcadorRival) {
        datos.g += 1;
      } else if (marcadorEquipo < marcadorRival) {
        datos.p += 1;
      } else {
        datos.e += 1;
      }
    });

    datos.dif = datos.favor - datos.contra;

    return datos;
  }, [partidosConMarcador, equipoId]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const estadoTexto = {
    PROXIMO: "Próximo",
    EN_CURSO: "En vivo",
    FINALIZADO: "Final",
    CANCELADO: "Cancelado",
  };

  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700",
    EN_CURSO: "bg-green-50 text-green-700",
    FINALIZADO: "bg-[#F1F2F4] text-[#4B4F56]",
    CANCELADO: "bg-red-50 text-red-700",
  };

  const obtenerRival = (partido) => {
    const esLocal = partido.equipoLocalId === equipoId;

    return esLocal
      ? partido.equipoVisitante?.nombre || "Visitante"
      : partido.equipoLocal?.nombre || "Local";
  };

  const obtenerCondicion = (partido) => {
    return partido.equipoLocalId === equipoId ? "Local" : "Visitante";
  };

  const obtenerMarcadorEquipo = (partido) => {
    const esLocal = partido.equipoLocalId === equipoId;

    return esLocal
      ? (partido.marcadorLocal ?? 0)
      : (partido.marcadorVisitante ?? 0);
  };

  const obtenerMarcadorRival = (partido) => {
    const esLocal = partido.equipoLocalId === equipoId;

    return esLocal
      ? (partido.marcadorVisitante ?? 0)
      : (partido.marcadorLocal ?? 0);
  };

  const obtenerResultado = (partido) => {
    const marcadorEquipo = obtenerMarcadorEquipo(partido);
    const marcadorRival = obtenerMarcadorRival(partido);

    if (marcadorEquipo > marcadorRival) return "G";
    if (marcadorEquipo < marcadorRival) return "P";
    return "E";
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
        <PublicNavbar />

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-40 animate-pulse rounded-2xl bg-[#F1F2F4]" />
        </section>
      </main>
    );
  }

  if (error || !equipo) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
        <PublicNavbar />

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error || "Equipo no encontrado."}
          </div>

          <Link
            to="/teams"
            className="mt-4 inline-block rounded-xl border border-[#8C1D2C] bg-white px-4 py-2 text-sm font-semibold !text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:!text-white"
          >
            ← Volver a equipos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link
            to="/teams"
            className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-semibold !text-[#8C1D2C] transition hover:border-[#8C1D2C]"
          >
            ← Equipos
          </Link>

          <button
            type="button"
            onClick={() => cargarDatos(true)}
            disabled={actualizando}
            className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-semibold text-[#4B4F56] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C] disabled:opacity-60"
          >
            {actualizando ? "Actualizando" : "Actualizar"}
          </button>
        </div>

        <section className="mb-4 rounded-2xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                {equipo.disciplina?.nombre || "Sin disciplina"}
              </p>

              <h1 className="mt-1 text-2xl font-bold leading-tight text-[#2B2D31]">
                {equipo.nombre}
              </h1>

              <p className="mt-1 text-sm text-[#6B6F76]">
                {jugadoresEquipo.length} jugadores registrados
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F8F2E2] text-xl font-bold text-[#8C1D2C]">
              {equipo.nombre?.charAt(0)?.toUpperCase() || "E"}
            </div>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-7">
          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">PJ</p>
            <p className="mt-1 text-xl font-bold text-[#2B2D31]">
              {estadisticas.pj}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">G</p>
            <p className="mt-1 text-xl font-bold text-green-700">
              {estadisticas.g}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">E</p>
            <p className="mt-1 text-xl font-bold text-[#2B2D31]">
              {estadisticas.e}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">P</p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {estadisticas.p}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Favor</p>
            <p className="mt-1 text-xl font-bold text-[#2B2D31]">
              {estadisticas.favor}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Contra</p>
            <p className="mt-1 text-xl font-bold text-[#2B2D31]">
              {estadisticas.contra}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">DIF</p>
            <p
              className={`mt-1 text-xl font-bold ${
                estadisticas.dif > 0
                  ? "text-green-700"
                  : estadisticas.dif < 0
                    ? "text-red-700"
                    : "text-[#2B2D31]"
              }`}
            >
              {estadisticas.dif > 0 ? `+${estadisticas.dif}` : estadisticas.dif}
            </p>
          </article>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
              <div className="border-b border-[#E6E7EA] px-4 py-3">
                <h2 className="text-base font-semibold text-[#2B2D31]">
                  Próximos partidos
                </h2>
              </div>

              {proximosPartidos.length === 0 ? (
                <p className="p-4 text-sm text-[#6B6F76]">
                  No hay próximos partidos registrados.
                </p>
              ) : (
                <div className="divide-y divide-[#F0F0F1]">
                  {proximosPartidos.map((partido) => (
                    <Link
                      key={partido.id}
                      to={`/matches/${partido.id}`}
                      className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 transition hover:bg-[#FAFAFA]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2B2D31]">
                          vs {obtenerRival(partido)}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                          {formatearFecha(partido.fecha)} ·{" "}
                          {partido.ubicacionNombre || "Sin sede"} ·{" "}
                          {obtenerCondicion(partido)}
                        </p>
                      </div>

                      <span
                        className={`h-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${
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

            <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
              <div className="border-b border-[#E6E7EA] px-4 py-3">
                <h2 className="text-base font-semibold text-[#2B2D31]">
                  Resultados recientes
                </h2>
              </div>

              {resultadosRecientes.length === 0 ? (
                <p className="p-4 text-sm text-[#6B6F76]">
                  No hay resultados recientes.
                </p>
              ) : (
                <div className="divide-y divide-[#F0F0F1]">
                  {resultadosRecientes.map((partido) => {
                    const resultado = obtenerResultado(partido);

                    return (
                      <Link
                        key={partido.id}
                        to={`/matches/${partido.id}`}
                        className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 transition hover:bg-[#FAFAFA]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#2B2D31]">
                            vs {obtenerRival(partido)}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                            {formatearFecha(partido.fecha)} ·{" "}
                            {partido.ubicacionNombre || "Sin sede"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              resultado === "G"
                                ? "text-green-700"
                                : resultado === "P"
                                  ? "text-red-700"
                                  : "text-[#6B6F76]"
                            }`}
                          >
                            {resultado}
                          </p>

                          <p className="text-sm font-semibold text-[#2B2D31]">
                            {obtenerMarcadorEquipo(partido)} -{" "}
                            {obtenerMarcadorRival(partido)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </section>

          <aside className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E6E7EA] px-4 py-3">
              <h2 className="text-base font-semibold text-[#2B2D31]">
                Plantilla
              </h2>

              <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                {jugadoresEquipo.length}
              </span>
            </div>

            {jugadoresEquipo.length === 0 ? (
              <p className="p-4 text-sm text-[#6B6F76]">
                No hay jugadores registrados.
              </p>
            ) : (
              <div className="divide-y divide-[#F0F0F1]">
                {jugadoresEquipo.map((jugador) => (
                  <Link
                    key={jugador.id}
                    to={`/players/${jugador.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#FAFAFA]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] text-sm font-semibold text-[#8C1D2C]">
                      {jugador.numero || "-"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2B2D31]">
                        {jugador.nombre}
                      </p>

                      <p className="text-xs text-[#6B6F76]">Ver perfil</p>
                    </div>

                    <span className="text-sm font-semibold text-[#8C1D2C]">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default TeamDetailPage;
