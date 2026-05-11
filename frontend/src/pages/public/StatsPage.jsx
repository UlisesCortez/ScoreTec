import { useEffect, useMemo, useState } from "react";

import PublicNavbar from "../../components/layout/PublicNavbar";

import { getPlayerStatsRequest, getTeamStatsRequest } from "../../api/statsApi";

function StatsPage() {
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [vista, setVista] = useState("equipos");

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      const [equiposData, jugadoresData] = await Promise.all([
        getTeamStatsRequest(),
        getPlayerStatsRequest(),
      ]);

      setEquipos(equiposData);
      setJugadores(jugadoresData);
    } catch (error) {
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const mejoresEquipos = useMemo(() => {
    return [...equipos].sort((a, b) => {
      if (b.ganados !== a.ganados) return b.ganados - a.ganados;
      return b.puntosFavor - a.puntosFavor;
    });
  }, [equipos]);

  const mejoresJugadores = useMemo(() => {
    return [...jugadores].sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return b.totalEventos - a.totalEventos;
    });
  }, [jugadores]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
              Rendimiento deportivo
            </p>

            <h1 className="mt-2 text-4xl font-bold">Estadísticas</h1>

            <p className="mt-3 max-w-2xl text-[#6B6F76]">
              Consulta el desempeño de equipos y jugadores registrados en los
              torneos deportivos del TecNM Campus Nogales.
            </p>
          </div>

          <div className="flex rounded-2xl border border-[#E6E7EA] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setVista("equipos")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                vista === "equipos"
                  ? "bg-[#8C1D2C] text-white"
                  : "text-[#6B6F76] hover:text-[#2B2D31]"
              }`}
            >
              Equipos
            </button>

            <button
              type="button"
              onClick={() => setVista("jugadores")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                vista === "jugadores"
                  ? "bg-[#8C1D2C] text-white"
                  : "text-[#6B6F76] hover:text-[#2B2D31]"
              }`}
            >
              Jugadores
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <p className="text-[#6B6F76]">Cargando estadísticas...</p>
        ) : vista === "equipos" ? (
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Estadísticas por equipo</h2>

              <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                {equipos.length} equipos
              </span>
            </div>

            {mejoresEquipos.length === 0 ? (
              <p className="text-sm text-[#6B6F76]">
                Todavía no hay estadísticas de equipos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                      <th className="px-3 py-3 font-semibold">Equipo</th>
                      <th className="px-3 py-3 font-semibold">Disciplina</th>
                      <th className="px-3 py-3 font-semibold">PJ</th>
                      <th className="px-3 py-3 font-semibold">G</th>
                      <th className="px-3 py-3 font-semibold">E</th>
                      <th className="px-3 py-3 font-semibold">P</th>
                      <th className="px-3 py-3 font-semibold">Puntos</th>
                      <th className="px-3 py-3 font-semibold">Faltas</th>
                      <th className="px-3 py-3 font-semibold">Tarjetas</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mejoresEquipos.map((equipo) => (
                      <tr
                        key={equipo.equipoId}
                        className="border-b border-[#F0F0F1]"
                      >
                        <td className="px-3 py-4 font-semibold">
                          {equipo.equipo}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {equipo.disciplina}
                        </td>

                        <td className="px-3 py-4">{equipo.partidosJugados}</td>

                        <td className="px-3 py-4 text-green-700">
                          {equipo.ganados}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {equipo.empatados}
                        </td>

                        <td className="px-3 py-4 text-red-700">
                          {equipo.perdidos}
                        </td>

                        <td className="px-3 py-4 font-semibold">
                          {equipo.puntosFavor}
                        </td>

                        <td className="px-3 py-4">{equipo.faltas}</td>

                        <td className="px-3 py-4">
                          <span className="text-yellow-700">
                            {equipo.tarjetasAmarillas}
                          </span>
                          <span className="mx-1 text-[#CBD0D6]">/</span>
                          <span className="text-red-700">
                            {equipo.tarjetasRojas}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Estadísticas por jugador
              </h2>

              <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                {jugadores.length} jugadores
              </span>
            </div>

            {mejoresJugadores.length === 0 ? (
              <p className="text-sm text-[#6B6F76]">
                Todavía no hay estadísticas de jugadores.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                      <th className="px-3 py-3 font-semibold">Jugador</th>
                      <th className="px-3 py-3 font-semibold">Equipo</th>
                      <th className="px-3 py-3 font-semibold">Disciplina</th>
                      <th className="px-3 py-3 font-semibold">Número</th>
                      <th className="px-3 py-3 font-semibold">Puntos</th>
                      <th className="px-3 py-3 font-semibold">Asist.</th>
                      <th className="px-3 py-3 font-semibold">Faltas</th>
                      <th className="px-3 py-3 font-semibold">Tarjetas</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mejoresJugadores.map((jugador) => (
                      <tr
                        key={jugador.jugadorId}
                        className="border-b border-[#F0F0F1]"
                      >
                        <td className="px-3 py-4 font-semibold">
                          {jugador.jugador}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {jugador.equipo}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {jugador.disciplina}
                        </td>

                        <td className="px-3 py-4">{jugador.numero || "—"}</td>

                        <td className="px-3 py-4 font-semibold">
                          {jugador.puntos}
                        </td>

                        <td className="px-3 py-4">{jugador.asistencias}</td>

                        <td className="px-3 py-4">{jugador.faltas}</td>

                        <td className="px-3 py-4">
                          <span className="text-yellow-700">
                            {jugador.tarjetasAmarillas}
                          </span>
                          <span className="mx-1 text-[#CBD0D6]">/</span>
                          <span className="text-red-700">
                            {jugador.tarjetasRojas}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default StatsPage;
