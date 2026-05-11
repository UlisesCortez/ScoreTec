import { Link } from "react-router-dom";

function MatchCard({ partido }) {
  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700",
    EN_CURSO: "bg-green-50 text-green-700",
    FINALIZADO: "bg-gray-100 text-gray-600",
    CANCELADO: "bg-red-50 text-red-700",
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <article className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#8C1D2C]">
            {partido.disciplina?.nombre || "Disciplina"}
          </p>
          <p className="mt-1 text-sm text-[#6B6F76]">
            {formatearFecha(partido.fecha)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            estadoClase[partido.estado] || "bg-gray-100 text-gray-600"
          }`}
        >
          {partido.estado}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-right">
          <h3 className="font-semibold text-[#2B2D31]">
            {partido.equipoLocal?.nombre || "Local"}
          </h3>
          <p className="mt-1 text-xs text-[#6B6F76]">Local</p>
        </div>

        <div className="rounded-2xl bg-[#FAFAFA] px-5 py-3 text-center">
          <p className="text-2xl font-bold text-[#2B2D31]">
            {partido.marcadorLocal} - {partido.marcadorVisitante}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[#2B2D31]">
            {partido.equipoVisitante?.nombre || "Visitante"}
          </h3>
          <p className="mt-1 text-xs text-[#6B6F76]">Visitante</p>
        </div>
      </div>

      <div className="mt-5 border-t border-[#E6E7EA] pt-4">
        <p className="text-sm text-[#6B6F76]">
          {partido.ubicacionNombre || "Ubicación no registrada"}
        </p>

        <Link
          to={`/matches/${partido.id}`}
          className="mt-4 inline-block rounded-xl border border-[#8C1D2C] px-4 py-2 text-sm font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

export default MatchCard;
