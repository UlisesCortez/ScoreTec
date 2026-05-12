import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavbar";

import { getTeamsRequest } from "../../api/teamsApi";
import { getPlayersRequest } from "../../api/playersApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function TeamsPublicPage() {
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    disciplinaId: "TODAS",
    busqueda: "",
  });

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [equiposData, jugadoresData, disciplinasData] = await Promise.all([
        getTeamsRequest(),
        getPlayersRequest(),
        getDisciplinesRequest(),
      ]);

      setEquipos(equiposData.filter((equipo) => equipo.activo));
      setJugadores(jugadoresData.filter((jugador) => jugador.activo));
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
    } catch (error) {
      setError("No se pudieron cargar los equipos.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const equiposConDatos = useMemo(() => {
    return equipos.map((equipo) => {
      const jugadoresEquipo = jugadores.filter(
        (jugador) => jugador.equipoId === equipo.id,
      );

      return {
        ...equipo,
        jugadores: jugadoresEquipo,
        totalJugadores: jugadoresEquipo.length,
      };
    });
  }, [equipos, jugadores]);

  const equiposFiltrados = useMemo(() => {
    const textoBusqueda = filtros.busqueda.trim().toLowerCase();

    return equiposConDatos
      .filter((equipo) => {
        const coincideDisciplina =
          filtros.disciplinaId === "TODAS" ||
          equipo.disciplinaId === Number(filtros.disciplinaId);

        const coincideBusqueda =
          !textoBusqueda ||
          equipo.nombre?.toLowerCase().includes(textoBusqueda) ||
          equipo.entrenador?.toLowerCase().includes(textoBusqueda) ||
          equipo.disciplina?.nombre?.toLowerCase().includes(textoBusqueda);

        return coincideDisciplina && coincideBusqueda;
      })
      .sort((a, b) => {
        const disciplinaA = a.disciplina?.nombre || "";
        const disciplinaB = b.disciplina?.nombre || "";

        if (disciplinaA !== disciplinaB) {
          return disciplinaA.localeCompare(disciplinaB);
        }

        return a.nombre.localeCompare(b.nombre);
      });
  }, [equiposConDatos, filtros]);

  const resumen = useMemo(() => {
    return {
      equipos: equipos.length,
      jugadores: jugadores.length,
      disciplinas: disciplinas.length,
    };
  }, [equipos, jugadores, disciplinas]);

  const handleFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      disciplinaId: "TODAS",
      busqueda: "",
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                Comunidad deportiva
              </p>

              <h1 className="text-2xl font-bold leading-tight text-[#2B2D31]">
                Equipos
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

          <div className="flex gap-5 overflow-x-auto border-b border-[#E6E7EA] pb-2">
            <span className="shrink-0 text-sm font-semibold text-[#8C1D2C]">
              {resumen.equipos} equipos
            </span>

            <span className="shrink-0 text-sm text-[#6B6F76]">
              {resumen.jugadores} jugadores
            </span>

            <span className="shrink-0 text-sm text-[#6B6F76]">
              {resumen.disciplinas} disciplinas
            </span>
          </div>
        </header>

        <section className="mb-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleFiltro}
            className="h-11 rounded-xl border border-[#E6E7EA] bg-white px-3 text-sm outline-none transition focus:border-[#8C1D2C]"
            placeholder="Buscar equipo..."
          />

          <select
            name="disciplinaId"
            value={filtros.disciplinaId}
            onChange={handleFiltro}
            className="h-11 max-w-[150px] rounded-xl border border-[#E6E7EA] bg-white px-2 text-sm outline-none transition focus:border-[#8C1D2C]"
          >
            <option value="TODAS">Todas</option>

            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.nombre}
              </option>
            ))}
          </select>
        </section>

        {error && (
          <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#2B2D31]">
              {equiposFiltrados.length} equipos
            </h2>

            {(filtros.busqueda || filtros.disciplinaId !== "TODAS") && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-xs font-semibold text-[#8C1D2C]"
              >
                Limpiar
              </button>
            )}
          </div>

          {cargando ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[160px] animate-pulse rounded-2xl bg-[#F1F2F4]"
                />
              ))}
            </div>
          ) : equiposFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-[#E6E7EA] bg-white p-6 text-center">
              <h3 className="text-base font-semibold text-[#2B2D31]">
                No hay equipos
              </h3>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Cambia los filtros o revisa más tarde.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#741826]"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {equiposFiltrados.map((equipo) => (
                <Link
                  key={equipo.id}
                  to={`/teams/${equipo.id}`}
                  className="rounded-2xl border border-[#E6E7EA] bg-white p-4 shadow-sm transition hover:border-[#8C1D2C] hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                        {equipo.disciplina?.nombre || "Disciplina"}
                      </p>

                      <h2 className="mt-1 truncate text-xl font-bold text-[#2B2D31]">
                        {equipo.nombre}
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F8F2E2] text-base font-bold text-[#8C1D2C]">
                      {equipo.nombre?.charAt(0)?.toUpperCase() || "E"}
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-[#FAFAFA] px-3 py-2.5">
                      <p className="text-[11px] text-[#6B6F76]">Jugadores</p>
                      <p className="mt-0.5 text-base font-semibold text-[#2B2D31]">
                        {equipo.totalJugadores}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAFAFA] px-3 py-2.5">
                      <p className="text-[11px] text-[#6B6F76]">Disciplina</p>
                      <p className="mt-0.5 truncate text-base font-semibold text-[#2B2D31]">
                        {equipo.disciplina?.nombre || "Sin disciplina"}
                      </p>
                    </div>
                  </div>

                  {equipo.jugadores.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-[#6B6F76]">
                        Plantilla
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {equipo.jugadores.slice(0, 4).map((jugador) => (
                          <span
                            key={jugador.id}
                            className="rounded-full bg-[#FAFAFA] px-3 py-1 text-xs text-[#4B4F56]"
                          >
                            {jugador.numero
                              ? `#${jugador.numero} ${jugador.nombre}`
                              : jugador.nombre}
                          </span>
                        ))}

                        {equipo.jugadores.length > 4 && (
                          <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                            +{equipo.jugadores.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default TeamsPublicPage;
