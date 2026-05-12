import { useEffect, useMemo, useState } from "react";

import PublicNavbar from "../../components/layout/PublicNavBar";
import MatchCard from "../../components/matches/MatchCard";

import { getMatchesRequest } from "../../api/matchesApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function MatchesPublicPage() {
  const [partidos, setPartidos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    estado: "TODOS",
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

      const [partidosData, disciplinasData] = await Promise.all([
        getMatchesRequest(),
        getDisciplinesRequest(),
      ]);

      setPartidos(partidosData);
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
    } catch (error) {
      setError("No se pudieron cargar los partidos.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos(true);
    }, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const resumen = useMemo(() => {
    return {
      total: partidos.length,
      proximos: partidos.filter((p) => p.estado === "PROXIMO").length,
      enCurso: partidos.filter((p) => p.estado === "EN_CURSO").length,
      finalizados: partidos.filter((p) => p.estado === "FINALIZADO").length,
    };
  }, [partidos]);

  const partidosFiltrados = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase();

    const prioridad = {
      EN_CURSO: 1,
      PROXIMO: 2,
      FINALIZADO: 3,
      CANCELADO: 4,
    };

    return partidos
      .filter((partido) => {
        const coincideEstado =
          filtros.estado === "TODOS" || partido.estado === filtros.estado;

        const coincideDisciplina =
          filtros.disciplinaId === "TODAS" ||
          partido.disciplinaId === Number(filtros.disciplinaId);

        const local = partido.equipoLocal?.nombre?.toLowerCase() || "";
        const visitante = partido.equipoVisitante?.nombre?.toLowerCase() || "";
        const disciplina = partido.disciplina?.nombre?.toLowerCase() || "";
        const ubicacion = partido.ubicacionNombre?.toLowerCase() || "";

        const coincideBusqueda =
          !texto ||
          local.includes(texto) ||
          visitante.includes(texto) ||
          disciplina.includes(texto) ||
          ubicacion.includes(texto);

        return coincideEstado && coincideDisciplina && coincideBusqueda;
      })
      .sort((a, b) => {
        const prioridadA = prioridad[a.estado] || 99;
        const prioridadB = prioridad[b.estado] || 99;

        if (prioridadA !== prioridadB) return prioridadA - prioridadB;

        return new Date(a.fecha || 0) - new Date(b.fecha || 0);
      });
  }, [partidos, filtros]);

  const handleFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const seleccionarEstado = (estado) => {
    setFiltros((prev) => ({
      ...prev,
      estado,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: "TODOS",
      disciplinaId: "TODAS",
      busqueda: "",
    });
  };

  const tabClass = (estado) => {
    const activo = filtros.estado === estado;

    return `shrink-0 border-b-2 px-1 pb-2 text-sm font-semibold transition ${
      activo
        ? "border-[#8C1D2C] text-[#8C1D2C]"
        : "border-transparent text-[#6B6F76] hover:text-[#8C1D2C]"
    }`;
  };

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                ScoreTec
              </p>

              <h1 className="text-2xl font-bold leading-tight text-[#2B2D31]">
                Partidos
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
              onClick={() => seleccionarEstado("TODOS")}
              className={tabClass("TODOS")}
            >
              Todos
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => seleccionarEstado("EN_CURSO")}
              className={tabClass("EN_CURSO")}
            >
              En vivo
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.enCurso}
              </span>
            </button>

            <button
              type="button"
              onClick={() => seleccionarEstado("PROXIMO")}
              className={tabClass("PROXIMO")}
            >
              Próximos
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.proximos}
              </span>
            </button>

            <button
              type="button"
              onClick={() => seleccionarEstado("FINALIZADO")}
              className={tabClass("FINALIZADO")}
            >
              Finalizados
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.finalizados}
              </span>
            </button>
          </div>
        </header>

        <section className="mb-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleFiltro}
            placeholder="Buscar equipo..."
            className="h-11 rounded-xl border border-[#E6E7EA] bg-white px-3 text-sm outline-none transition focus:border-[#8C1D2C]"
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
              {partidosFiltrados.length} partidos
            </h2>

            {(filtros.busqueda ||
              filtros.estado !== "TODOS" ||
              filtros.disciplinaId !== "TODAS") && (
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
            <div className="grid gap-2 xl:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[112px] animate-pulse rounded-2xl bg-[#F1F2F4]"
                />
              ))}
            </div>
          ) : partidosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-[#E6E7EA] bg-white p-6 text-center">
              <h3 className="text-base font-semibold text-[#2B2D31]">
                No hay partidos
              </h3>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Cambia los filtros o revisa más tarde.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold text-white"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-2 xl:grid-cols-2">
              {partidosFiltrados.map((partido) => (
                <MatchCard key={partido.id} partido={partido} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default MatchesPublicPage;
