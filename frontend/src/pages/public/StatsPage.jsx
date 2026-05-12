import { useEffect, useMemo, useState } from "react";

import PublicNavbar from "../../components/layout/PublicNavBar";

import { getMatchesRequest } from "../../api/matchesApi";
import { getTeamsRequest } from "../../api/teamsApi";
import { getPlayersRequest } from "../../api/playersApi";
import { getEventsByMatchRequest } from "../../api/eventsApi";

function StatsPage() {
  const [tab, setTab] = useState("equipos");
  const [tablaEquipos, setTablaEquipos] = useState("vivo");

  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [partidosData, equiposData, jugadoresData] = await Promise.all([
        getMatchesRequest(),
        getTeamsRequest(),
        getPlayersRequest(),
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

      setPartidos(partidosData);
      setEquipos(equiposData);
      setJugadores(jugadoresData);
      setEventos(eventosData);
    } catch (error) {
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos(true);
    }, 15000);

    return () => clearInterval(intervalo);
  }, []);

  const calcularEstadisticasEquipos = (modo) => {
    const mapa = new Map();

    equipos.forEach((equipo) => {
      mapa.set(equipo.id, {
        id: equipo.id,
        nombre: equipo.nombre,
        disciplina: equipo.disciplina?.nombre || "Sin disciplina",

        pj: 0,
        g: 0,
        e: 0,
        p: 0,

        favor: 0,
        contra: 0,
        dif: 0,
      });
    });

    const partidosValidos = partidos.filter((partido) => {
      if (modo === "oficial") {
        return partido.estado === "FINALIZADO";
      }

      return partido.estado === "FINALIZADO" || partido.estado === "EN_CURSO";
    });

    partidosValidos.forEach((partido) => {
      const local = mapa.get(partido.equipoLocalId);
      const visitante = mapa.get(partido.equipoVisitanteId);

      if (!local || !visitante) return;

      const marcadorLocal = partido.marcadorLocal ?? 0;
      const marcadorVisitante = partido.marcadorVisitante ?? 0;

      local.pj += 1;
      visitante.pj += 1;

      local.favor += marcadorLocal;
      local.contra += marcadorVisitante;

      visitante.favor += marcadorVisitante;
      visitante.contra += marcadorLocal;

      if (marcadorLocal > marcadorVisitante) {
        local.g += 1;
        visitante.p += 1;
      } else if (marcadorLocal < marcadorVisitante) {
        visitante.g += 1;
        local.p += 1;
      } else {
        local.e += 1;
        visitante.e += 1;
      }

      local.dif = local.favor - local.contra;
      visitante.dif = visitante.favor - visitante.contra;
    });

    return Array.from(mapa.values()).sort((a, b) => {
      if (b.g !== a.g) return b.g - a.g;
      if (b.dif !== a.dif) return b.dif - a.dif;
      if (b.favor !== a.favor) return b.favor - a.favor;
      if (a.contra !== b.contra) return a.contra - b.contra;

      return a.nombre.localeCompare(b.nombre);
    });
  };

  const estadisticasEquiposEnVivo = useMemo(() => {
    return calcularEstadisticasEquipos("vivo");
  }, [equipos, partidos]);

  const estadisticasEquiposOficial = useMemo(() => {
    return calcularEstadisticasEquipos("oficial");
  }, [equipos, partidos]);

  const estadisticasEquipos =
    tablaEquipos === "vivo"
      ? estadisticasEquiposEnVivo
      : estadisticasEquiposOficial;

  const estadisticasJugadores = useMemo(() => {
    const mapa = new Map();

    jugadores.forEach((jugador) => {
      mapa.set(jugador.id, {
        id: jugador.id,
        nombre: jugador.nombre,
        numero: jugador.numero,
        equipo: jugador.equipo?.nombre || "Sin equipo",
        disciplina: jugador.equipo?.disciplina?.nombre || "Sin disciplina",
        goles: 0,
        puntos: 0,
        faltas: 0,
        tarjetas: 0,
        eventos: 0,
      });
    });

    eventos.forEach((evento) => {
      if (!evento.jugadorId) return;

      const jugador = mapa.get(evento.jugadorId);
      if (!jugador) return;

      jugador.eventos += 1;

      if (evento.tipo === "GOL") {
        jugador.goles += 1;
      }

      if (evento.tipo === "PUNTO" || evento.tipo === "ENCESTA") {
        jugador.puntos += 1;
      }

      if (evento.tipo === "FALTA") {
        jugador.faltas += 1;
      }

      if (
        evento.tipo === "TARJETA_AMARILLA" ||
        evento.tipo === "TARJETA_ROJA"
      ) {
        jugador.tarjetas += 1;
      }
    });

    return Array.from(mapa.values()).sort((a, b) => {
      if (b.goles !== a.goles) return b.goles - a.goles;
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.eventos !== a.eventos) return b.eventos - a.eventos;

      return a.nombre.localeCompare(b.nombre);
    });
  }, [jugadores, eventos]);

  const resumen = useMemo(() => {
    return {
      partidos: partidos.length,
      enCurso: partidos.filter((partido) => partido.estado === "EN_CURSO")
        .length,
      finalizados: partidos.filter((partido) => partido.estado === "FINALIZADO")
        .length,
      equipos: equipos.length,
      jugadores: jugadores.length,
      eventos: eventos.length,
    };
  }, [partidos, equipos, jugadores, eventos]);

  const tabClass = (value) =>
    `shrink-0 border-b-2 px-1 pb-2 text-sm font-semibold transition ${
      tab === value
        ? "border-[#8C1D2C] text-[#8C1D2C]"
        : "border-transparent text-[#6B6F76] hover:text-[#8C1D2C]"
    }`;

  const tablaClass = (value) =>
    `rounded-xl px-3 py-2 text-xs font-semibold transition ${
      tablaEquipos === value
        ? "bg-[#8C1D2C] !text-white"
        : "bg-white text-[#4B4F56] hover:bg-[#F4F4F5] hover:text-[#8C1D2C]"
    }`;

  const TablaEquipos = ({ datos }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#E6E7EA] bg-[#FAFAFA] text-left text-xs text-[#6B6F76]">
            <th className="w-12 px-4 py-3 font-semibold">#</th>

            <th className="px-3 py-3 font-semibold">Equipo</th>

            <th className="px-3 py-3 font-semibold">Disciplina</th>

            <th className="px-3 py-3 text-center font-semibold">PJ</th>

            <th className="px-3 py-3 text-center font-semibold">G</th>

            <th className="px-3 py-3 text-center font-semibold">E</th>

            <th className="px-3 py-3 text-center font-semibold">P</th>

            <th className="px-3 py-3 text-center font-semibold">Favor</th>

            <th className="px-3 py-3 text-center font-semibold">Contra</th>

            <th className="px-4 py-3 text-center font-semibold">DIF</th>
          </tr>
        </thead>

        <tbody>
          {datos.map((equipo, index) => (
            <tr
              key={equipo.id}
              className="border-b border-[#F0F0F1] last:border-b-0 hover:bg-[#FAFAFA]"
            >
              <td className="px-4 py-3 text-[#6B6F76]">{index + 1}</td>

              <td className="px-3 py-3">
                <p className="font-semibold text-[#2B2D31]">{equipo.nombre}</p>
              </td>

              <td className="px-3 py-3 text-[#6B6F76]">{equipo.disciplina}</td>

              <td className="px-3 py-3 text-center">{equipo.pj}</td>

              <td className="px-3 py-3 text-center font-semibold text-green-700">
                {equipo.g}
              </td>

              <td className="px-3 py-3 text-center text-[#6B6F76]">
                {equipo.e}
              </td>

              <td className="px-3 py-3 text-center text-red-700">{equipo.p}</td>

              <td className="px-3 py-3 text-center">{equipo.favor}</td>

              <td className="px-3 py-3 text-center">{equipo.contra}</td>

              <td
                className={`px-4 py-3 text-center font-semibold ${
                  equipo.dif > 0
                    ? "text-green-700"
                    : equipo.dif < 0
                      ? "text-red-700"
                      : "text-[#2B2D31]"
                }`}
              >
                {equipo.dif > 0 ? `+${equipo.dif}` : equipo.dif}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                Rendimiento deportivo
              </p>

              <h1 className="text-2xl font-bold leading-tight text-[#2B2D31]">
                Estadísticas
              </h1>
            </div>

            <button
              type="button"
              onClick={() => cargarDatos(true)}
              disabled={actualizando || cargando}
              className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-semibold text-[#4B4F56] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C] disabled:opacity-60"
            >
              {actualizando ? "Actualizando" : "Actualizar"}
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto border-b border-[#E6E7EA]">
            <button
              type="button"
              onClick={() => setTab("equipos")}
              className={tabClass("equipos")}
            >
              Equipos
            </button>

            <button
              type="button"
              onClick={() => setTab("jugadores")}
              className={tabClass("jugadores")}
            >
              Jugadores
            </button>

            <button
              type="button"
              onClick={() => setTab("resumen")}
              className={tabClass("resumen")}
            >
              Resumen
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-2xl bg-[#F1F2F4]" />
            <div className="h-96 animate-pulse rounded-2xl bg-[#F1F2F4]" />
          </div>
        ) : (
          <>
            {tab === "equipos" && (
              <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[#E6E7EA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[#2B2D31]">
                      {tablaEquipos === "vivo"
                        ? "Tabla en vivo"
                        : "Tabla oficial"}
                    </h2>

                    <p className="mt-0.5 text-xs text-[#6B6F76]">
                      {tablaEquipos === "vivo"
                        ? "Incluye partidos en curso y finalizados."
                        : "Solo incluye partidos finalizados."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTablaEquipos("vivo")}
                      className={tablaClass("vivo")}
                    >
                      En vivo
                    </button>

                    <button
                      type="button"
                      onClick={() => setTablaEquipos("oficial")}
                      className={tablaClass("oficial")}
                    >
                      Oficial
                    </button>
                  </div>
                </div>

                <TablaEquipos datos={estadisticasEquipos} />
              </section>
            )}

            {tab === "jugadores" && (
              <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E6E7EA] px-4 py-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#2B2D31]">
                      Estadísticas por jugador
                    </h2>

                    <p className="mt-0.5 text-xs text-[#6B6F76]">
                      Eventos registrados durante los partidos.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                    {estadisticasJugadores.length} jugadores
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E6E7EA] bg-[#FAFAFA] text-left text-xs text-[#6B6F76]">
                        <th className="px-4 py-3 font-semibold">Jugador</th>

                        <th className="px-3 py-3 font-semibold">Equipo</th>

                        <th className="px-3 py-3 font-semibold">Disciplina</th>

                        <th className="px-3 py-3 text-center font-semibold">
                          Goles
                        </th>

                        <th className="px-3 py-3 text-center font-semibold">
                          Puntos
                        </th>

                        <th className="px-3 py-3 text-center font-semibold">
                          Faltas
                        </th>

                        <th className="px-3 py-3 text-center font-semibold">
                          Tarjetas
                        </th>

                        <th className="px-4 py-3 text-center font-semibold">
                          Eventos
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {estadisticasJugadores.map((jugador) => (
                        <tr
                          key={jugador.id}
                          className="border-b border-[#F0F0F1] last:border-b-0 hover:bg-[#FAFAFA]"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#2B2D31]">
                              {jugador.numero ? `#${jugador.numero} ` : ""}
                              {jugador.nombre}
                            </p>
                          </td>

                          <td className="px-3 py-3 text-[#6B6F76]">
                            {jugador.equipo}
                          </td>

                          <td className="px-3 py-3 text-[#6B6F76]">
                            {jugador.disciplina}
                          </td>

                          <td className="px-3 py-3 text-center">
                            {jugador.goles}
                          </td>

                          <td className="px-3 py-3 text-center">
                            {jugador.puntos}
                          </td>

                          <td className="px-3 py-3 text-center">
                            {jugador.faltas}
                          </td>

                          <td className="px-3 py-3 text-center">
                            {jugador.tarjetas}
                          </td>

                          <td className="px-4 py-3 text-center font-bold text-[#2B2D31]">
                            {jugador.eventos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === "resumen" && (
              <section className="rounded-2xl border border-[#E6E7EA] bg-white shadow-sm">
                <div className="border-b border-[#E6E7EA] px-4 py-3">
                  <h2 className="text-base font-semibold text-[#2B2D31]">
                    Resumen general
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B6F76]">
                    Datos generales del torneo.
                  </p>
                </div>

                <div className="divide-y divide-[#F0F0F1]">
                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-[#6B6F76]">Partidos</span>
                    <span className="text-lg font-bold text-[#2B2D31]">
                      {resumen.partidos}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-[#6B6F76]">En curso</span>
                    <span className="text-lg font-bold text-green-700">
                      {resumen.enCurso}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-[#6B6F76]">Finalizados</span>
                    <span className="text-lg font-bold text-[#2B2D31]">
                      {resumen.finalizados}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-[#6B6F76]">Equipos</span>
                    <span className="text-lg font-bold text-[#8C1D2C]">
                      {resumen.equipos}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-[#6B6F76]">Jugadores</span>
                    <span className="text-lg font-bold text-[#2B2D31]">
                      {resumen.jugadores}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-[#6B6F76]">Eventos</span>
                    <span className="text-lg font-bold text-[#CDAA43]">
                      {resumen.eventos}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default StatsPage;
