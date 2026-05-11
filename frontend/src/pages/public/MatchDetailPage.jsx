import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavbar";
import { getMatchByIdRequest } from "../../api/matchesApi";
import { getEventsByMatchRequest } from "../../api/eventsApi";

function MatchDetailPage() {
  const { id } = useParams();

  const [partido, setPartido] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

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
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos(true);
    }, 10000);

    return () => clearInterval(intervalo);
  }, [id]);

  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => {
      const minutoA = a.minuto ?? 9999;
      const minutoB = b.minuto ?? 9999;

      if (minutoA !== minutoB) {
        return minutoB - minutoA;
      }

      return b.id - a.id;
    });
  }, [eventos]);

  const resumenEventos = useMemo(() => {
    return {
      goles: eventos.filter((e) => e.tipo === "GOL").length,
      puntos: eventos.filter((e) => e.tipo === "PUNTO" || e.tipo === "ENCESTA")
        .length,
      faltas: eventos.filter((e) => e.tipo === "FALTA").length,
      tarjetas: eventos.filter(
        (e) => e.tipo === "TARJETA_AMARILLA" || e.tipo === "TARJETA_ROJA",
      ).length,
    };
  }, [eventos]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  const estadoTexto = {
    PROXIMO: "Próximo",
    EN_CURSO: "En curso",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };

  const estadoClase = {
    PROXIMO: "border-blue-100 bg-blue-50 text-blue-700",
    EN_CURSO: "border-green-100 bg-green-50 text-green-700",
    FINALIZADO: "border-gray-200 bg-gray-100 text-gray-600",
    CANCELADO: "border-red-100 bg-red-50 text-red-700",
  };

  const tipoClase = {
    GOL: "border-green-100 bg-green-50 text-green-700",
    PUNTO: "border-green-100 bg-green-50 text-green-700",
    ENCESTA: "border-green-100 bg-green-50 text-green-700",
    FALTA: "border-yellow-100 bg-yellow-50 text-yellow-700",
    TARJETA_AMARILLA: "border-yellow-100 bg-yellow-50 text-yellow-700",
    TARJETA_ROJA: "border-red-100 bg-red-50 text-red-700",
    ASISTENCIA: "border-blue-100 bg-blue-50 text-blue-700",
    TIEMPO_FUERA: "border-gray-200 bg-gray-100 text-gray-600",
    OTRO: "border-gray-200 bg-gray-100 text-gray-600",
  };

  const tipoTexto = {
    GOL: "Gol",
    PUNTO: "Punto",
    ENCESTA: "Canasta",
    FALTA: "Falta",
    TARJETA_AMARILLA: "Tarjeta amarilla",
    TARJETA_ROJA: "Tarjeta roja",
    ASISTENCIA: "Asistencia",
    TIEMPO_FUERA: "Tiempo fuera",
    OTRO: "Otro",
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
        <PublicNavbar />

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#6B6F76]">
              Cargando partido...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !partido) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
        <PublicNavbar />

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">
            {error || "Partido no encontrado."}
          </div>
        </section>
      </main>
    );
  }

  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/matches"
            className="inline-flex w-fit items-center rounded-xl border border-[#E6E7EA] bg-white px-4 py-2 text-sm font-black text-[#8C1D2C] shadow-sm transition hover:border-[#8C1D2C]"
          >
            ← Volver a partidos
          </Link>

          <button
            type="button"
            onClick={() => cargarDatos(true)}
            disabled={actualizando}
            className="w-full rounded-xl border border-[#8C1D2C] bg-white px-4 py-2 text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white disabled:opacity-60 sm:w-auto"
          >
            {actualizando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <section className="mb-6 rounded-[2rem] border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                  {partido.disciplina?.nombre || "Disciplina"}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    estadoClase[partido.estado] ||
                    "border-gray-200 bg-gray-100 text-gray-600"
                  }`}
                >
                  {estadoTexto[partido.estado] || partido.estado}
                </span>
              </div>

              <h1 className="text-2xl font-black leading-tight text-[#2B2D31] sm:text-4xl lg:text-5xl">
                {partido.equipoLocal?.nombre || "Local"} vs{" "}
                {partido.equipoVisitante?.nombre || "Visitante"}
              </h1>

              <p className="mt-3 text-sm font-medium leading-6 text-[#6B6F76] sm:text-base">
                {formatearFecha(partido.fecha)}
              </p>
            </div>

            {partido.estado === "EN_CURSO" && (
              <span className="w-fit rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-black text-green-700">
                Marcador en vivo
              </span>
            )}
          </div>

          <div className="rounded-[2rem] bg-[#FAFAFA] p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
              <div className="min-w-0 text-right">
                <h2 className="truncate text-sm font-black text-[#2B2D31] sm:text-2xl">
                  {partido.equipoLocal?.nombre || "Local"}
                </h2>

                <p className="mt-1 text-[11px] font-bold uppercase text-[#6B6F76] sm:text-xs">
                  Local
                </p>
              </div>

              <div className="rounded-3xl bg-white px-4 py-4 text-center shadow-sm sm:px-8 sm:py-6 lg:px-10">
                <p className="text-4xl font-black leading-none text-[#2B2D31] sm:text-6xl lg:text-7xl">
                  {marcadorLocal}
                  <span className="mx-2 text-[#CDAA43] sm:mx-4">-</span>
                  {marcadorVisitante}
                </p>
              </div>

              <div className="min-w-0 text-left">
                <h2 className="truncate text-sm font-black text-[#2B2D31] sm:text-2xl">
                  {partido.equipoVisitante?.nombre || "Visitante"}
                </h2>

                <p className="mt-1 text-[11px] font-bold uppercase text-[#6B6F76] sm:text-xs">
                  Visitante
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-[#6B6F76]">
              Eventos
            </p>
            <h3 className="mt-2 text-3xl font-black text-[#2B2D31]">
              {eventos.length}
            </h3>
          </div>

          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-[#6B6F76]">Goles</p>
            <h3 className="mt-2 text-3xl font-black text-green-700">
              {resumenEventos.goles}
            </h3>
          </div>

          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-[#6B6F76]">Puntos</p>
            <h3 className="mt-2 text-3xl font-black text-green-700">
              {resumenEventos.puntos}
            </h3>
          </div>

          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-[#6B6F76]">Faltas</p>
            <h3 className="mt-2 text-3xl font-black text-yellow-700">
              {resumenEventos.faltas + resumenEventos.tarjetas}
            </h3>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#2B2D31]">
                  Eventos del partido
                </h2>

                <p className="mt-1 text-sm text-[#6B6F76]">
                  Historial de acciones registradas.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
                {eventos.length} eventos
              </span>
            </div>

            {eventosOrdenados.length === 0 ? (
              <div className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-2xl font-black text-[#8C1D2C] shadow-sm">
                  0
                </div>

                <h3 className="text-lg font-black text-[#2B2D31]">
                  Sin eventos registrados
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B6F76]">
                  Cuando el árbitro registre goles, puntos, faltas u otros
                  eventos, aparecerán en esta sección.
                </p>
              </div>
            ) : (
              <div className="relative space-y-3">
                {eventosOrdenados.map((evento) => (
                  <article
                    key={evento.id}
                    className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              tipoClase[evento.tipo] ||
                              "border-gray-200 bg-gray-100 text-gray-600"
                            }`}
                          >
                            {tipoTexto[evento.tipo] || evento.tipo}
                          </span>

                          {evento.minuto !== null && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B6F76]">
                              Min. {evento.minuto}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 truncate text-sm font-black text-[#2B2D31] sm:text-base">
                          {evento.equipo?.nombre || "Equipo no registrado"}
                        </p>

                        {evento.jugador && (
                          <p className="mt-1 text-sm font-medium text-[#6B6F76]">
                            {evento.jugador.numero
                              ? `#${evento.jugador.numero} `
                              : ""}
                            {evento.jugador.nombre}
                          </p>
                        )}

                        {evento.descripcion && (
                          <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
                            {evento.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#2B2D31]">Información</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-[#FAFAFA] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                    Disciplina
                  </p>
                  <p className="mt-1 font-bold text-[#2B2D31]">
                    {partido.disciplina?.nombre || "No registrada"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                    Estado
                  </p>
                  <p className="mt-1 font-bold text-[#2B2D31]">
                    {estadoTexto[partido.estado] || partido.estado}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                    Fecha
                  </p>
                  <p className="mt-1 font-bold leading-6 text-[#2B2D31]">
                    {formatearFecha(partido.fecha)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#2B2D31]">Ubicación</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-[#FAFAFA] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                    Lugar
                  </p>
                  <p className="mt-1 font-bold text-[#2B2D31]">
                    {partido.ubicacionNombre || "No registrado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAFA] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
                    Dirección
                  </p>
                  <p className="mt-1 font-bold leading-6 text-[#2B2D31]">
                    {partido.ubicacionDireccion || "No registrada"}
                  </p>
                </div>
              </div>

              {partido.ubicacionMapaUrl && (
                <a
                  href={partido.ubicacionMapaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 block rounded-2xl bg-[#8C1D2C] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#741826]"
                >
                  Abrir ubicación
                </a>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default MatchDetailPage;
