import { useEffect, useMemo, useState } from "react";

import PublicNavbar from "../../components/layout/PublicNavbar";
import { getTeamsRequest } from "../../api/teamsApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function TeamsPublicPage() {
  const [equipos, setEquipos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    disciplinaId: "TODAS",
    busqueda: "",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [equiposData, disciplinasData] = await Promise.all([
        getTeamsRequest(),
        getDisciplinesRequest(),
      ]);

      setEquipos(equiposData.filter((equipo) => equipo.activo));
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
    } catch (error) {
      setError("No se pudieron cargar los equipos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const equiposFiltrados = useMemo(() => {
    return equipos.filter((equipo) => {
      const coincideDisciplina =
        filtros.disciplinaId === "TODAS" ||
        equipo.disciplinaId === Number(filtros.disciplinaId);

      const textoBusqueda = filtros.busqueda.toLowerCase();

      const coincideBusqueda =
        equipo.nombre.toLowerCase().includes(textoBusqueda) ||
        equipo.entrenador?.toLowerCase().includes(textoBusqueda) ||
        equipo.disciplina?.nombre?.toLowerCase().includes(textoBusqueda);

      return coincideDisciplina && coincideBusqueda;
    });
  }, [equipos, filtros]);

  const handleFiltro = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
              Comunidad deportiva
            </p>

            <h1 className="mt-2 text-4xl font-bold">Equipos</h1>

            <p className="mt-3 max-w-2xl text-[#6B6F76]">
              Consulta los equipos participantes en los torneos deportivos del
              TecNM Campus Nogales.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleFiltro}
              className="rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm outline-none focus:border-[#8C1D2C]"
              placeholder="Buscar equipo..."
            />

            <select
              name="disciplinaId"
              value={filtros.disciplinaId}
              onChange={handleFiltro}
              className="rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm outline-none focus:border-[#8C1D2C]"
            >
              <option value="TODAS">Todas las disciplinas</option>

              {disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <p className="text-[#6B6F76]">Cargando equipos...</p>
        ) : equiposFiltrados.length === 0 ? (
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No hay equipos para mostrar
            </h2>
            <p className="mt-2 text-[#6B6F76]">
              Cambia los filtros o revisa nuevamente más tarde.
            </p>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {equiposFiltrados.map((equipo) => (
              <article
                key={equipo.id}
                className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
                      {equipo.disciplina?.nombre || "Disciplina"}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">{equipo.nombre}</h2>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8F2E2] text-lg font-bold text-[#8C1D2C]">
                    {equipo.nombre?.charAt(0)}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-[#6B6F76]">
                  <p>
                    <span className="font-semibold text-[#2B2D31]">
                      Entrenador:
                    </span>{" "}
                    {equipo.entrenador || "No registrado"}
                  </p>

                  <p>
                    <span className="font-semibold text-[#2B2D31]">
                      Jugadores:
                    </span>{" "}
                    {equipo.jugadores?.length || 0}
                  </p>
                </div>

                {equipo.jugadores?.length > 0 && (
                  <div className="mt-5 border-t border-[#E6E7EA] pt-4">
                    <p className="mb-3 text-sm font-semibold">Plantilla</p>

                    <div className="flex flex-wrap gap-2">
                      {equipo.jugadores.slice(0, 6).map((jugador) => (
                        <span
                          key={jugador.id}
                          className="rounded-full bg-[#FAFAFA] px-3 py-1 text-xs font-medium text-[#2B2D31]"
                        >
                          {jugador.numero ? `#${jugador.numero} ` : ""}
                          {jugador.nombre}
                        </span>
                      ))}

                      {equipo.jugadores.length > 6 && (
                        <span className="rounded-full bg-[#FAFAFA] px-3 py-1 text-xs font-medium text-[#6B6F76]">
                          +{equipo.jugadores.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default TeamsPublicPage;
