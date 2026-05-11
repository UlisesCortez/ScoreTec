import { useEffect, useMemo, useState } from "react";

import PublicNavbar from "../../components/layout/PublicNavbar";
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

        const equipoLocal = partido.equipoLocal?.nombre?.toLowerCase() || "";
        const equipoVisitante =
          partido.equipoVisitante?.nombre?.toLowerCase() || "";
        const disciplina = partido.disciplina?.nombre?.toLowerCase() || "";
        const ubicacion = partido.ubicacionNombre?.toLowerCase() || "";

        const coincideBusqueda =
          !texto ||
          equipoLocal.includes(texto) ||
          equipoVisitante.includes(texto) ||
          disciplina.includes(texto) ||
          ubicacion.includes(texto);

        return coincideEstado && coincideDisciplina && coincideBusqueda;
      })
      .sort((a, b) => {
        const prioridadA = prioridad[a.estado] || 99;
        const prioridadB = prioridad[b.estado] || 99;

        if (prioridadA !== prioridadB) {
          return prioridadA - prioridadB;
        }

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

  const limpiarFiltros = () => {
    setFiltros({
      estado: "TODOS",
      disciplinaId: "TODAS",
      busqueda: "",
    });
  };

  const seleccionarEstado = (estado) => {
    setFiltros((prev) => ({
      ...prev,
      estado,
    }));
  };

  const estadoChipClass = (estado) => {
    const activo = filtros.estado === estado;

    if (activo) {
      return "border-[#8C1D2C] bg-[#8C1D2C] text-white";
    }

    return "border-[#E6E7EA] bg-white text-[#4B4F56] hover:border-[#8C1D2C] hover:text-[#8C1D2C]";
  };

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-5 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                Torneos deportivos
              </p>

              <h1 className="mt-2 text-3xl font-black leading-tight text-[#2B2D31] sm:text-5xl">
                Partidos
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#6B6F76] sm:text-base">
                Consulta próximos encuentros, marcadores en vivo y resultados
                finalizados del TecNM Campus Nogales.
              </p>
            </div>

            <button
              type="button"
              onClick={() => cargarDatos(true)}
              disabled={actualizando || cargando}
              className="w-full rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white disabled:opacity-60 sm:w-auto"
            >
              {actualizando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => seleccionarEstado("TODOS")}
            className={`rounded-3xl border p-4 text-left shadow-sm transition sm:p-5 ${estadoChipClass(
              "TODOS",
            )}`}
          >
            <p className="text-xs font-bold uppercase opacity-80">Total</p>
            <h3 className="mt-2 text-3xl font-black">{resumen.total}</h3>
          </button>

          <button
            type="button"
            onClick={() => seleccionarEstado("PROXIMO")}
            className={`rounded-3xl border p-4 text-left shadow-sm transition sm:p-5 ${estadoChipClass(
              "PROXIMO",
            )}`}
          >
            <p className="text-xs font-bold uppercase opacity-80">Próximos</p>
            <h3 className="mt-2 text-3xl font-black">{resumen.proximos}</h3>
          </button>

          <button
            type="button"
            onClick={() => seleccionarEstado("EN_CURSO")}
            className={`rounded-3xl border p-4 text-left shadow-sm transition sm:p-5 ${estadoChipClass(
              "EN_CURSO",
            )}`}
          >
            <p className="text-xs font-bold uppercase opacity-80">En curso</p>
            <h3 className="mt-2 text-3xl font-black">{resumen.enCurso}</h3>
          </button>

          <button
            type="button"
            onClick={() => seleccionarEstado("FINALIZADO")}
            className={`rounded-3xl border p-4 text-left shadow-sm transition sm:p-5 ${estadoChipClass(
              "FINALIZADO",
            )}`}
          >
            <p className="text-xs font-bold uppercase opacity-80">
              Finalizados
            </p>
            <h3 className="mt-2 text-3xl font-black">{resumen.finalizados}</h3>
          </button>
        </section>

        <section className="mb-6 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-center">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                Buscar
              </label>

              <input
                type="text"
                name="busqueda"
                value={filtros.busqueda}
                onChange={handleFiltro}
                placeholder="Equipo, disciplina o ubicación..."
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                Estado
              </label>

              <select
                name="estado"
                value={filtros.estado}
                onChange={handleFiltro}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              >
                <option value="TODOS">Todos</option>
                <option value="PROXIMO">Próximos</option>
                <option value="EN_CURSO">En curso</option>
                <option value="FINALIZADO">Finalizados</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                Disciplina
              </label>

              <select
                name="disciplinaId"
                value={filtros.disciplinaId}
                onChange={handleFiltro}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              >
                <option value="TODAS">Todas</option>

                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-1 rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] px-4 py-3 text-sm font-black text-[#4B4F56] transition hover:border-[#8C1D2C] hover:bg-white hover:text-[#8C1D2C] lg:mt-6"
            >
              Limpiar
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-[#2B2D31]">
                Lista de partidos
              </h2>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Primero se muestran los partidos en curso y próximos.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
              {partidosFiltrados.length} resultados
            </span>
          </div>

          {cargando ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-2xl bg-[#F3F3F4]"
                />
              ))}
            </div>
          ) : partidosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-6 text-center sm:p-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-2xl font-black text-[#8C1D2C] shadow-sm">
                !
              </div>

              <h3 className="text-xl font-black text-[#2B2D31]">
                No hay partidos para mostrar
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B6F76]">
                Cambia los filtros, busca otro equipo o revisa nuevamente más
                tarde.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-5 rounded-2xl bg-[#8C1D2C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#741826]"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
