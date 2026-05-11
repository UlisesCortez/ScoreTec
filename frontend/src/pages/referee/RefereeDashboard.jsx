import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getMatchesRequest } from "../../api/matchesApi";
import RefereeLayout from "../../components/layout/RefereeLayout";

function RefereeDashboard() {
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPartidos = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await getMatchesRequest();

      const asignados = data.filter(
        (partido) => partido.arbitroId === user?.id,
      );

      setPartidos(asignados);
    } catch (error) {
      setError("No se pudieron cargar tus partidos asignados.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPartidos();
  }, []);

  const resumen = useMemo(() => {
    return {
      total: partidos.length,
      proximos: partidos.filter((p) => p.estado === "PROXIMO").length,
      enCurso: partidos.filter((p) => p.estado === "EN_CURSO").length,
      finalizados: partidos.filter((p) => p.estado === "FINALIZADO").length,
    };
  }, [partidos]);

  const partidosOrdenados = useMemo(() => {
    const prioridad = {
      EN_CURSO: 1,
      PROXIMO: 2,
      FINALIZADO: 3,
      CANCELADO: 4,
    };

    return [...partidos].sort((a, b) => {
      const prioridadA = prioridad[a.estado] || 99;
      const prioridadB = prioridad[b.estado] || 99;

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      return new Date(a.fecha || 0) - new Date(b.fecha || 0);
    });
  }, [partidos]);

  const estadoClase = {
    PROXIMO: "border-blue-100 bg-blue-50 text-blue-700",
    EN_CURSO: "border-green-100 bg-green-50 text-green-700",
    FINALIZADO: "border-gray-200 bg-gray-100 text-gray-600",
    CANCELADO: "border-red-100 bg-red-50 text-red-700",
  };

  const estadoTexto = {
    PROXIMO: "Próximo",
    EN_CURSO: "En curso",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const obtenerTextoAccion = (estado) => {
    if (estado === "PROXIMO") return "Preparar partido";
    if (estado === "EN_CURSO") return "Controlar partido";
    if (estado === "FINALIZADO") return "Ver resumen";
    return "Ver partido";
  };

  return (
    <RefereeLayout>
      <section className="mb-5 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
              Panel de árbitro
            </p>

            <h2 className="mt-2 text-2xl font-black leading-tight text-[#2B2D31] sm:text-4xl">
              Hola, {user?.nombre || "árbitro"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-medium text-[#6B6F76] sm:text-base">
              Consulta tus partidos asignados y entra al control para registrar
              eventos, puntos o marcadores.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarPartidos}
            disabled={cargando}
            className="w-full rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white disabled:opacity-60 sm:w-auto"
          >
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase text-[#6B6F76]">Total</p>
          <h3 className="mt-2 text-3xl font-black text-[#2B2D31]">
            {resumen.total}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase text-[#6B6F76]">Próximos</p>
          <h3 className="mt-2 text-3xl font-black text-blue-700">
            {resumen.proximos}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase text-[#6B6F76]">En curso</p>
          <h3 className="mt-2 text-3xl font-black text-green-700">
            {resumen.enCurso}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase text-[#6B6F76]">
            Finalizados
          </p>
          <h3 className="mt-2 text-3xl font-black text-[#2B2D31]">
            {resumen.finalizados}
          </h3>
        </div>
      </section>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-[#2B2D31]">Mis partidos</h3>

            <p className="mt-1 text-sm text-[#6B6F76]">
              Primero aparecen los partidos en curso y próximos.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
            {partidos.length} asignados
          </span>
        </div>

        {cargando ? (
          <div className="rounded-2xl bg-[#FAFAFA] p-5">
            <p className="text-sm font-medium text-[#6B6F76]">
              Cargando partidos...
            </p>
          </div>
        ) : partidosOrdenados.length === 0 ? (
          <div className="rounded-2xl bg-[#FAFAFA] p-5">
            <p className="text-sm font-bold text-[#2B2D31]">
              No tienes partidos asignados todavía.
            </p>

            <p className="mt-2 text-sm text-[#6B6F76]">
              Un administrador debe asignarte como árbitro o anotador en un
              partido.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {partidosOrdenados.map((partido) => {
              const marcadorLocal = partido.marcadorLocal ?? 0;
              const marcadorVisitante = partido.marcadorVisitante ?? 0;

              return (
                <article
                  key={partido.id}
                  className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4 transition hover:border-[#8C1D2C] hover:bg-white hover:shadow-sm sm:p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                        {partido.disciplina?.nombre || "Disciplina"}
                      </p>

                      <h4 className="mt-2 line-clamp-2 text-lg font-black leading-tight text-[#2B2D31]">
                        {partido.equipoLocal?.nombre || "Local"} vs{" "}
                        {partido.equipoVisitante?.nombre || "Visitante"}
                      </h4>

                      <p className="mt-2 text-sm font-medium text-[#6B6F76]">
                        {formatearFecha(partido.fecha)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${
                        estadoClase[partido.estado] ||
                        "border-gray-200 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {estadoTexto[partido.estado] || partido.estado}
                    </span>
                  </div>

                  <div className="mb-4 rounded-3xl bg-white px-4 py-4 text-center shadow-sm">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div className="min-w-0 text-right">
                        <p className="truncate text-xs font-bold text-[#6B6F76]">
                          Local
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-[#2B2D31]">
                          {partido.equipoLocal?.nombre || "Local"}
                        </p>
                      </div>

                      <p className="min-w-[96px] text-3xl font-black leading-none text-[#2B2D31]">
                        {marcadorLocal}
                        <span className="mx-2 text-[#CDAA43]">-</span>
                        {marcadorVisitante}
                      </p>

                      <div className="min-w-0 text-left">
                        <p className="truncate text-xs font-bold text-[#6B6F76]">
                          Visitante
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-[#2B2D31]">
                          {partido.equipoVisitante?.nombre || "Visitante"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 truncate text-sm font-medium text-[#6B6F76]">
                      {partido.ubicacionNombre || "Ubicación no registrada"}
                    </p>

                    <Link
                      to={`/referee/matches/${partido.id}`}
                      className={`rounded-2xl px-4 py-3 text-center text-sm font-black transition ${
                        partido.estado === "EN_CURSO"
                          ? "bg-green-700 text-white hover:bg-green-800"
                          : "bg-[#8C1D2C] text-white hover:bg-[#741826]"
                      }`}
                    >
                      {obtenerTextoAccion(partido.estado)}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </RefereeLayout>
  );
}

export default RefereeDashboard;
