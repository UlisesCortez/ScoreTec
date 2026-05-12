import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavBar";

import { getPlayersRequest } from "../../api/playersApi";
import { getMatchesRequest } from "../../api/matchesApi";
import { getEventsByMatchRequest } from "../../api/eventsApi";

function PlayerDetailPage() {
  const { id } = useParams();

  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const jugadorId = Number(id);

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [jugadoresData, partidosData] = await Promise.all([
        getPlayersRequest(),
        getMatchesRequest(),
      ]);

      let eventosData = [];

      try {
        const eventosPorPartido = await Promise.all(
          partidosData.map((partido) => getEventsByMatchRequest(partido.id)),
        );

        eventosData = eventosPorPartido.flat();
      } catch (error) {
        eventosData = [];
      }

      setJugadores(jugadoresData);
      setPartidos(partidosData);
      setEventos(eventosData);
    } catch (error) {
      setError("No se pudo cargar el perfil del jugador.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const jugador = useMemo(() => {
    return jugadores.find((item) => item.id === jugadorId);
  }, [jugadores, jugadorId]);

  const eventosJugador = useMemo(() => {
    return eventos
      .filter((evento) => evento.jugadorId === jugadorId)
      .sort((a, b) => {
        const minutoA = a.minuto ?? 9999;
        const minutoB = b.minuto ?? 9999;

        if (minutoA !== minutoB) return minutoA - minutoB;

        return b.id - a.id;
      });
  }, [eventos, jugadorId]);

  const estadisticas = useMemo(() => {
    const datos = {
      goles: 0,
      puntos: 0,
      faltas: 0,
      tarjetas: 0,
      eventos: eventosJugador.length,
    };

    eventosJugador.forEach((evento) => {
      if (evento.tipo === "GOL") {
        datos.goles += 1;
      }

      if (evento.tipo === "PUNTO" || evento.tipo === "ENCESTA") {
        datos.puntos += 1;
      }

      if (evento.tipo === "FALTA") {
        datos.faltas += 1;
      }

      if (
        evento.tipo === "TARJETA_AMARILLA" ||
        evento.tipo === "TARJETA_ROJA"
      ) {
        datos.tarjetas += 1;
      }
    });

    return datos;
  }, [eventosJugador]);

  const partidosJugador = useMemo(() => {
    if (!jugador?.equipoId) return [];

    return partidos
      .filter(
        (partido) =>
          partido.equipoLocalId === jugador.equipoId ||
          partido.equipoVisitanteId === jugador.equipoId,
      )
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [partidos, jugador]);

  const partidosFinalizados = useMemo(() => {
    return partidosJugador.filter((partido) => partido.estado === "FINALIZADO");
  }, [partidosJugador]);

  const partidosProximos = useMemo(() => {
    return partidosJugador
      .filter(
        (partido) =>
          partido.estado === "PROXIMO" || partido.estado === "EN_CURSO",
      )
      .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0))
      .slice(0, 5);
  }, [partidosJugador]);

  const resumenEquipo = useMemo(() => {
    const datos = {
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      favor: 0,
      contra: 0,
      dif: 0,
    };

    if (!jugador?.equipoId) return datos;

    partidosFinalizados.forEach((partido) => {
      const esLocal = partido.equipoLocalId === jugador.equipoId;

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
  }, [partidosFinalizados, jugador]);

  const eventosRecientes = useMemo(() => {
    return [...eventosJugador].slice(0, 8);
  }, [eventosJugador]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const tipoTexto = {
    GOL: "Gol",
    PUNTO: "Punto",
    ENCESTA: "Canasta",
    FALTA: "Falta",
    TARJETA_AMARILLA: "Tarjeta amarilla",
    TARJETA_ROJA: "Tarjeta roja",
    ASISTENCIA: "Asistencia",
    TIEMPO_FUERA: "Tiempo fuera",
    OTRO: "Otro",
  };

  const tipoClase = {
    GOL: "bg-green-50 text-green-700",
    PUNTO: "bg-green-50 text-green-700",
    ENCESTA: "bg-green-50 text-green-700",
    FALTA: "bg-yellow-50 text-yellow-700",
    TARJETA_AMARILLA: "bg-yellow-50 text-yellow-700",
    TARJETA_ROJA: "bg-red-50 text-red-700",
    ASISTENCIA: "bg-blue-50 text-blue-700",
    TIEMPO_FUERA: "bg-[#F1F2F4] text-[#4B4F56]",
    OTRO: "bg-[#F1F2F4] text-[#4B4F56]",
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

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "J";

    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
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

  if (error || !jugador) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
        <PublicNavbar />

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error || "Jugador no encontrado."}
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
            to={`/teams/${jugador.equipoId}`}
            className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-semibold !text-[#8C1D2C] transition hover:border-[#8C1D2C]"
          >
            ← Equipo
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
                {jugador.equipo?.disciplina?.nombre || "Sin disciplina"}
              </p>

              <h1 className="mt-1 text-2xl font-bold leading-tight text-[#2B2D31]">
                {jugador.nombre}
              </h1>

              <p className="mt-1 text-sm text-[#6B6F76]">
                {jugador.equipo?.nombre || "Sin equipo"}
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#F8F2E2] text-[#8C1D2C]">
              <span className="text-xs font-semibold">
                {jugador.numero ? `#${jugador.numero}` : "JUG"}
              </span>

              <span className="text-lg font-bold">
                {obtenerIniciales(jugador.nombre)}
              </span>
            </div>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Goles</p>
            <p className="mt-1 text-xl font-bold text-green-700">
              {estadisticas.goles}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Puntos</p>
            <p className="mt-1 text-xl font-bold text-[#2B2D31]">
              {estadisticas.puntos}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Faltas</p>
            <p className="mt-1 text-xl font-bold text-yellow-700">
              {estadisticas.faltas}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Tarjetas</p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {estadisticas.tarjetas}
            </p>
          </article>

          <article className="rounded-2xl border border-[#E6E7EA] bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-[#6B6F76]">Eventos</p>
            <p className="mt-1 text-xl font-bold text-[#8C1D2C]">
              {estadisticas.eventos}
            </p>
          </article>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E6E7EA] px-4 py-3">
                <h2 className="text-base font-semibold text-[#2B2D31]">
                  Eventos registrados
                </h2>

                <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                  {eventosJugador.length}
                </span>
              </div>

              {eventosRecientes.length === 0 ? (
                <p className="p-4 text-sm text-[#6B6F76]">
                  Este jugador todavía no tiene eventos registrados.
                </p>
              ) : (
                <div className="divide-y divide-[#F0F0F1]">
                  {eventosRecientes.map((evento) => (
                    <article
                      key={evento.id}
                      className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              tipoClase[evento.tipo] ||
                              "bg-[#F1F2F4] text-[#4B4F56]"
                            }`}
                          >
                            {tipoTexto[evento.tipo] || evento.tipo}
                          </span>

                          {evento.minuto !== null && (
                            <span className="text-xs text-[#6B6F76]">
                              Min. {evento.minuto}
                            </span>
                          )}
                        </div>

                        <p className="truncate text-sm font-semibold text-[#2B2D31]">
                          {evento.equipo?.nombre || jugador.equipo?.nombre}
                        </p>

                        {evento.descripcion && (
                          <p className="mt-0.5 text-xs text-[#6B6F76]">
                            {evento.descripcion}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
              <div className="border-b border-[#E6E7EA] px-4 py-3">
                <h2 className="text-base font-semibold text-[#2B2D31]">
                  Próximos partidos del equipo
                </h2>
              </div>

              {partidosProximos.length === 0 ? (
                <p className="p-4 text-sm text-[#6B6F76]">
                  No hay próximos partidos registrados.
                </p>
              ) : (
                <div className="divide-y divide-[#F0F0F1]">
                  {partidosProximos.map((partido) => (
                    <Link
                      key={partido.id}
                      to={`/matches/${partido.id}`}
                      className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 transition hover:bg-[#FAFAFA]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2B2D31]">
                          {partido.equipoLocal?.nombre || "Local"} vs{" "}
                          {partido.equipoVisitante?.nombre || "Visitante"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                          {formatearFecha(partido.fecha)} ·{" "}
                          {partido.ubicacionNombre || "Sin sede"}
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
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
              <div className="border-b border-[#E6E7EA] px-4 py-3">
                <h2 className="text-base font-semibold text-[#2B2D31]">
                  Información
                </h2>
              </div>

              <div className="divide-y divide-[#F0F0F1]">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-[#6B6F76]">Número</span>
                  <span className="text-sm font-semibold text-[#2B2D31]">
                    {jugador.numero || "Sin número"}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-[#6B6F76]">Equipo</span>
                  <span className="max-w-[180px] truncate text-sm font-semibold text-[#2B2D31]">
                    {jugador.equipo?.nombre || "Sin equipo"}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-[#6B6F76]">Disciplina</span>
                  <span className="max-w-[180px] truncate text-sm font-semibold text-[#2B2D31]">
                    {jugador.equipo?.disciplina?.nombre || "Sin disciplina"}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
              <div className="border-b border-[#E6E7EA] px-4 py-3">
                <h2 className="text-base font-semibold text-[#2B2D31]">
                  Equipo
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4">
                <div className="rounded-2xl bg-[#FAFAFA] p-3 text-center">
                  <p className="text-xs text-[#6B6F76]">PJ</p>
                  <p className="mt-1 text-lg font-bold text-[#2B2D31]">
                    {resumenEquipo.pj}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] p-3 text-center">
                  <p className="text-xs text-[#6B6F76]">G</p>
                  <p className="mt-1 text-lg font-bold text-green-700">
                    {resumenEquipo.g}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] p-3 text-center">
                  <p className="text-xs text-[#6B6F76]">P</p>
                  <p className="mt-1 text-lg font-bold text-red-700">
                    {resumenEquipo.p}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4">
                <Link
                  to={`/teams/${jugador.equipoId}`}
                  className="block rounded-xl border border-[#8C1D2C] bg-white px-4 py-2 text-center text-sm font-semibold !text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:!text-white"
                >
                  Ver equipo
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default PlayerDetailPage;
