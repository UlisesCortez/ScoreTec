import { Link } from "react-router-dom";

function MatchCard({ partido }) {
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

  const formatearFecha = (fecha) => {
    if (!fecha) return "--";

    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "Sin hora";

    return new Date(fecha).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;

  return (
    <Link
      to={`/matches/${partido.id}`}
      className="block rounded-2xl border border-[#E6E7EA] bg-white px-3 py-3 transition hover:border-[#8C1D2C] hover:shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#8C1D2C]">
            {partido.disciplina?.nombre || "Disciplina"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              estadoClase[partido.estado] || "bg-[#F1F2F4] text-[#4B4F56]"
            }`}
          >
            {estadoTexto[partido.estado] || partido.estado || "Sin estado"}
          </span>

          <span className="text-[11px] text-[#6B6F76]">
            {formatearHora(partido.fecha)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8F2E2] text-[10px] font-semibold text-[#8C1D2C]">
                L
              </div>

              <p className="truncate text-sm font-semibold text-[#2B2D31]">
                {partido.equipoLocal?.nombre || "Local"}
              </p>
            </div>

            <p className="shrink-0 text-xl font-bold text-[#2B2D31]">
              {marcadorLocal}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] text-[10px] font-semibold text-[#6B6F76]">
                V
              </div>

              <p className="truncate text-sm font-semibold text-[#2B2D31]">
                {partido.equipoVisitante?.nombre || "Visitante"}
              </p>
            </div>

            <p className="shrink-0 text-xl font-bold text-[#2B2D31]">
              {marcadorVisitante}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <p className="rounded-xl bg-[#FAFAFA] px-2.5 py-1 text-[11px] font-semibold text-[#6B6F76]">
            {formatearFecha(partido.fecha)}
          </p>

          <p className="max-w-[92px] truncate text-right text-[11px] text-[#6B6F76]">
            {partido.ubicacionNombre || "Sin sede"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default MatchCard;
