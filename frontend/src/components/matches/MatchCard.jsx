import { Link } from "react-router-dom";

function MatchCard({ partido }) {
  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700 border-blue-100",
    EN_CURSO: "bg-green-50 text-green-700 border-green-100",
    FINALIZADO: "bg-gray-100 text-gray-600 border-gray-200",
    CANCELADO: "bg-red-50 text-red-700 border-red-100",
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

  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;

  return (
    <article className="group rounded-2xl border border-[#E6E7EA] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
            {partido.disciplina?.nombre || "Disciplina"}
          </p>

          <p className="mt-1 truncate text-xs font-medium text-[#6B6F76]">
            {formatearFecha(partido.fecha)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
            estadoClase[partido.estado] ||
            "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {estadoTexto[partido.estado] || partido.estado || "Sin estado"}
        </span>
      </div>

      <div className="rounded-2xl bg-[#FAFAFA] p-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="min-w-0 text-right">
            <h3 className="truncate text-sm font-bold text-[#2B2D31]">
              {partido.equipoLocal?.nombre || "Local"}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-[#6B6F76]">
              Local
            </p>
          </div>

          <div className="min-w-[86px] rounded-xl bg-white px-3 py-2 text-center shadow-sm">
            <p className="text-2xl font-black leading-none text-[#2B2D31]">
              {marcadorLocal}
              <span className="mx-2 text-[#CDAA43]">-</span>
              {marcadorVisitante}
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#2B2D31]">
              {partido.equipoVisitante?.nombre || "Visitante"}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-[#6B6F76]">
              Visitante
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-[#6B6F76]">
          {partido.ubicacionNombre || "Ubicación no registrada"}
        </p>

        <Link
          to={`/matches/${partido.id}`}
          className="shrink-0 rounded-xl border border-[#8C1D2C] px-3 py-2 text-xs font-bold text-[#8C1D2C] transition group-hover:bg-[#8C1D2C] group-hover:text-white"
        >
          Detalle
        </Link>
      </div>
    </article>
  );
}

export default MatchCard;
