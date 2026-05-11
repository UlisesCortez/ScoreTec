import { useEffect, useMemo, useState } from "react";

import PublicNavbar from "../../components/layout/PublicNavbar";
import MatchCard from "../../components/matches/MatchCard";

import { getMatchesRequest } from "../../api/matchesApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function MatchesPublicPage() {
  const [partidos, setPartidos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    estado: "TODOS",
    disciplinaId: "TODAS",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);

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
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos();
    }, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const partidosFiltrados = useMemo(() => {
    return partidos.filter((partido) => {
      const coincideEstado =
        filtros.estado === "TODOS" || partido.estado === filtros.estado;

      const coincideDisciplina =
        filtros.disciplinaId === "TODAS" ||
        partido.disciplinaId === Number(filtros.disciplinaId);

      return coincideEstado && coincideDisciplina;
    });
  }, [partidos, filtros]);

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
              Torneos deportivos
            </p>
            <h1 className="mt-2 text-4xl font-bold">Partidos</h1>
            <p className="mt-3 max-w-2xl text-[#6B6F76]">
              Consulta los próximos encuentros, marcadores en vivo y resultados
              finalizados del TecNM Campus Nogales.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltro}
              className="rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm outline-none focus:border-[#8C1D2C]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PROXIMO">Próximos</option>
              <option value="EN_CURSO">En curso</option>
              <option value="FINALIZADO">Finalizados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>

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
          <p className="text-[#6B6F76]">Cargando partidos...</p>
        ) : partidosFiltrados.length === 0 ? (
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No hay partidos para mostrar
            </h2>
            <p className="mt-2 text-[#6B6F76]">
              Cambia los filtros o revisa nuevamente más tarde.
            </p>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partidosFiltrados.map((partido) => (
              <MatchCard key={partido.id} partido={partido} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MatchesPublicPage;
