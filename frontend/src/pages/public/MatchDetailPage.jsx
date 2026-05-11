import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavbar";
import { getMatchByIdRequest } from "../../api/matchesApi";
import { getEventsByMatchRequest } from "../../api/eventsApi";

function MatchDetailPage() {
  const { id } = useParams();

  const [partido, setPartido] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [partidoData, eventosData] = await Promise.all([
        getMatchByIdRequest(id),
        getEventsByMatchRequest(id),
      ]);

      setPartido(partidoData);
      setEventos(eventosData);
    } catch (error) {
      setError("No se pudo cargar el detalle del partido.");
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
  }, [id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700",
    EN_CURSO: "bg-green-50 text-green-700",
    FINALIZADO: "bg-gray-100 text-gray-600",
    CANCELADO: "bg-red-50 text-red-700",
  };

  const tipoClase = {
    GOL: "bg-green-50 text-green-700",
    PUNTO: "bg-green-50 text-green-700",
    ENCESTA: "bg-green-50 text-green-700",
    FALTA: "bg-yellow-50 text-yellow-700",
    TARJETA_AMARILLA: "bg-yellow-50 text-yellow-700",
    TARJETA_ROJA: "bg-red-50 text-red-700",
    ASISTENCIA: "bg-blue-50 text-blue-700",
    TIEMPO_FUERA: "bg-gray-100 text-gray-600",
    OTRO: "bg-gray-100 text-gray-600",
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
        <PublicNavbar />
        <section className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-[#6B6F76]">Cargando partido...</p>
        </section>
      </main>
    );
  }

  if (error || !partido) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
        <PublicNavbar />
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Partido no encontrado."}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/matches"
          className="mb-6 inline-block text-sm font-semibold text-[#8C1D2C]"
        >
          ← Volver a partidos
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
              {partido.disciplina?.nombre}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {partido.equipoLocal?.nombre} vs {partido.equipoVisitante?.nombre}
            </h1>

            <p className="mt-3 text-[#6B6F76]">
              {formatearFecha(partido.fecha)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              estadoClase[partido.estado] || "bg-gray-100 text-gray-600"
            }`}
          >
            {partido.estado}
          </span>
        </div>

        <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-8 shadow-sm">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="text-right">
              <h2 className="text-2xl font-bold">
                {partido.equipoLocal?.nombre}
              </h2>
              <p className="mt-1 text-sm text-[#6B6F76]">Local</p>
            </div>

            <div className="rounded-3xl bg-[#FAFAFA] px-8 py-5 text-center shadow-sm">
              <p className="text-5xl font-bold">
                {partido.marcadorLocal}
                <span className="mx-4 text-[#CDAA43]">-</span>
                {partido.marcadorVisitante}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {partido.equipoVisitante?.nombre}
              </h2>
              <p className="mt-1 text-sm text-[#6B6F76]">Visitante</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Eventos del partido</h2>
              <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                {eventos.length} eventos
              </span>
            </div>

            {eventos.length === 0 ? (
              <p className="text-sm text-[#6B6F76]">
                Todavía no hay eventos registrados para este partido.
              </p>
            ) : (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#E6E7EA] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            tipoClase[evento.tipo] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {evento.tipo}
                        </span>

                        {evento.minuto !== null && (
                          <span className="text-sm text-[#6B6F76]">
                            Minuto {evento.minuto}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 font-semibold">
                        {evento.equipo?.nombre}
                      </p>

                      {evento.jugador && (
                        <p className="text-sm text-[#6B6F76]">
                          Jugador: {evento.jugador.nombre}
                        </p>
                      )}

                      {evento.descripcion && (
                        <p className="mt-1 text-sm text-[#6B6F76]">
                          {evento.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Ubicación</h2>

              <div className="mt-4 space-y-3 text-sm text-[#6B6F76]">
                <p>
                  <span className="font-semibold text-[#2B2D31]">Lugar:</span>{" "}
                  {partido.ubicacionNombre || "No registrado"}
                </p>

                <p>
                  <span className="font-semibold text-[#2B2D31]">
                    Dirección:
                  </span>{" "}
                  {partido.ubicacionDireccion || "No registrada"}
                </p>
              </div>

              {partido.ubicacionMapaUrl && (
                <a
                  href={partido.ubicacionMapaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block rounded-xl bg-[#8C1D2C] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Abrir ubicación
                </a>
              )}
            </section>

            <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Información</h2>

              <div className="mt-4 space-y-3 text-sm text-[#6B6F76]">
                <p>
                  <span className="font-semibold text-[#2B2D31]">
                    Disciplina:
                  </span>{" "}
                  {partido.disciplina?.nombre}
                </p>

                <p>
                  <span className="font-semibold text-[#2B2D31]">Estado:</span>{" "}
                  {partido.estado}
                </p>

                <p>
                  <span className="font-semibold text-[#2B2D31]">Fecha:</span>{" "}
                  {formatearFecha(partido.fecha)}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default MatchDetailPage;
