import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import RefereeLayout from "../../components/layout/RefereeLayout";

import {
  finishMatchRequest,
  getMatchByIdRequest,
  startMatchRequest,
} from "../../api/matchesApi";

import {
  createEventRequest,
  deleteEventRequest,
  getEventsByMatchRequest,
} from "../../api/eventsApi";

import { getPlayersRequest } from "../../api/playersApi";

function RefereeMatchPage() {
  const { id } = useParams();

  const [partido, setPartido] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    equipoId: "",
    jugadorId: "",
    tipo: "GOL",
    minuto: "",
    descripcion: "",
  });

  const obtenerEventosPorDisciplina = (nombreDisciplina) => {
    const disciplina = nombreDisciplina?.toLowerCase() || "";

    if (disciplina.includes("fútbol") || disciplina.includes("futbol")) {
      return [
        { value: "GOL", label: "Gol", suma: true },
        { value: "FALTA", label: "Falta", suma: false },
        { value: "TARJETA_AMARILLA", label: "Amarilla", suma: false },
        { value: "TARJETA_ROJA", label: "Roja", suma: false },
        { value: "ASISTENCIA", label: "Asistencia", suma: false },
        { value: "OTRO", label: "Otro", suma: false },
      ];
    }

    if (
      disciplina.includes("básquet") ||
      disciplina.includes("basquet") ||
      disciplina.includes("basket")
    ) {
      return [
        { value: "ENCESTA", label: "Canasta", suma: true },
        { value: "PUNTO", label: "Punto", suma: true },
        { value: "FALTA", label: "Falta", suma: false },
        { value: "TIEMPO_FUERA", label: "Tiempo fuera", suma: false },
        { value: "ASISTENCIA", label: "Asistencia", suma: false },
        { value: "OTRO", label: "Otro", suma: false },
      ];
    }

    if (
      disciplina.includes("voleibol") ||
      disciplina.includes("volleyball") ||
      disciplina.includes("voley")
    ) {
      return [
        { value: "PUNTO", label: "Punto", suma: true },
        { value: "FALTA", label: "Falta", suma: false },
        { value: "TIEMPO_FUERA", label: "Tiempo fuera", suma: false },
        { value: "OTRO", label: "Otro", suma: false },
      ];
    }

    return [
      { value: "PUNTO", label: "Punto", suma: true },
      { value: "FALTA", label: "Falta", suma: false },
      { value: "OTRO", label: "Otro", suma: false },
    ];
  };

  const eventosDisponibles = useMemo(() => {
    return obtenerEventosPorDisciplina(partido?.disciplina?.nombre);
  }, [partido?.disciplina?.nombre]);

  const jugadoresFiltrados = useMemo(() => {
    if (!form.equipoId) return [];

    return jugadores.filter(
      (jugador) => jugador.equipoId === Number(form.equipoId),
    );
  }, [jugadores, form.equipoId]);

  const cargarDatos = async (silencioso = false) => {
    try {
      if (!silencioso) {
        setCargando(true);
      }

      const [partidoData, eventosData, jugadoresData] = await Promise.all([
        getMatchByIdRequest(id),
        getEventsByMatchRequest(id),
        getPlayersRequest(),
      ]);

      setPartido(partidoData);
      setEventos(eventosData);

      const jugadoresDelPartido = jugadoresData.filter(
        (jugador) =>
          jugador.equipoId === partidoData.equipoLocalId ||
          jugador.equipoId === partidoData.equipoVisitanteId,
      );

      setJugadores(jugadoresDelPartido);
    } catch (error) {
      setError("No se pudo cargar la información del partido.");
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos(true);
    }, 10000);

    return () => clearInterval(intervalo);
  }, [id]);

  useEffect(() => {
    if (eventosDisponibles.length > 0 && !form.tipo) {
      setForm((prev) => ({
        ...prev,
        tipo: eventosDisponibles[0].value,
      }));
    }
  }, [eventosDisponibles, form.tipo]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
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
    GOL: "bg-green-50 text-green-700 border-green-100",
    PUNTO: "bg-green-50 text-green-700 border-green-100",
    ENCESTA: "bg-green-50 text-green-700 border-green-100",
    FALTA: "bg-yellow-50 text-yellow-700 border-yellow-100",
    TARJETA_AMARILLA: "bg-yellow-50 text-yellow-700 border-yellow-100",
    TARJETA_ROJA: "bg-red-50 text-red-700 border-red-100",
    ASISTENCIA: "bg-blue-50 text-blue-700 border-blue-100",
    TIEMPO_FUERA: "bg-gray-100 text-gray-600 border-gray-200",
    OTRO: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const tipoLabel = {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const nuevoForm = {
        ...prev,
        [name]: value,
      };

      if (name === "equipoId") {
        nuevoForm.jugadorId = "";
      }

      return nuevoForm;
    });
  };

  const seleccionarEquipo = (equipoId) => {
    setForm((prev) => ({
      ...prev,
      equipoId: String(equipoId),
      jugadorId: "",
    }));
  };

  const seleccionarTipo = (tipo) => {
    setForm((prev) => ({
      ...prev,
      tipo,
    }));
  };

  const iniciarPartido = async () => {
    setError("");

    try {
      setGuardando(true);
      await startMatchRequest(id);
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo iniciar el partido.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const finalizarPartido = async () => {
    const confirmar = window.confirm(
      "¿Seguro que quieres finalizar el partido?",
    );

    if (!confirmar) return;

    setError("");

    try {
      setGuardando(true);
      await finishMatchRequest(id);
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo finalizar el partido.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const registrarEvento = async (e) => {
    e.preventDefault();
    setError("");

    if (partido.estado !== "EN_CURSO") {
      setError(
        "Solo puedes registrar eventos cuando el partido está en curso.",
      );
      return;
    }

    if (!form.equipoId || !form.tipo) {
      setError("Selecciona un equipo y un tipo de evento.");
      return;
    }

    try {
      setGuardando(true);

      await createEventRequest(id, {
        equipoId: Number(form.equipoId),
        jugadorId: form.jugadorId ? Number(form.jugadorId) : null,
        tipo: form.tipo,
        minuto: form.minuto ? Number(form.minuto) : null,
        descripcion: form.descripcion || null,
      });

      setForm((prev) => ({
        ...prev,
        jugadorId: "",
        minuto: "",
        descripcion: "",
      }));

      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo registrar el evento.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEvento = async (eventoId) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este evento?",
    );

    if (!confirmar) return;

    setError("");

    try {
      setGuardando(true);
      await deleteEventRequest(eventoId);
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo eliminar el evento.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <RefereeLayout>
        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B6F76]">
            Cargando partido...
          </p>
        </div>
      </RefereeLayout>
    );
  }

  if (!partido) {
    return (
      <RefereeLayout>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          Partido no encontrado.
        </div>
      </RefereeLayout>
    );
  }

  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;

  return (
    <RefereeLayout>
      <div className="mb-5">
        <Link
          to="/referee"
          className="inline-flex items-center rounded-xl border border-[#E6E7EA] bg-white px-4 py-2 text-sm font-bold text-[#8C1D2C] shadow-sm transition hover:border-[#8C1D2C]"
        >
          ← Volver
        </Link>
      </div>

      <section className="mb-5 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                {partido.disciplina?.nombre || "Disciplina"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  estadoClase[partido.estado] ||
                  "border-gray-200 bg-gray-100 text-gray-600"
                }`}
              >
                {estadoTexto[partido.estado] || partido.estado}
              </span>
            </div>

            <h2 className="text-2xl font-black leading-tight text-[#2B2D31] sm:text-3xl">
              {partido.equipoLocal?.nombre} vs {partido.equipoVisitante?.nombre}
            </h2>

            <p className="mt-2 text-sm font-medium text-[#6B6F76]">
              {formatearFecha(partido.fecha)}
            </p>
          </div>

          <div className="flex gap-2">
            {partido.estado === "PROXIMO" && (
              <button
                type="button"
                disabled={guardando}
                onClick={iniciarPartido}
                className="rounded-xl bg-[#8C1D2C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#741826] disabled:opacity-60"
              >
                Iniciar
              </button>
            )}

            {partido.estado === "EN_CURSO" && (
              <button
                type="button"
                disabled={guardando}
                onClick={finalizarPartido}
                className="rounded-xl bg-[#2B2D31] px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="sticky top-[73px] z-20 mb-6 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:static sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          <button
            type="button"
            disabled={partido.estado !== "EN_CURSO"}
            onClick={() => seleccionarEquipo(partido.equipoLocalId)}
            className={`min-w-0 rounded-2xl border p-3 text-right transition ${
              Number(form.equipoId) === partido.equipoLocalId
                ? "border-[#8C1D2C] bg-[#FFF8F8]"
                : "border-[#E6E7EA] bg-[#FAFAFA]"
            } disabled:cursor-not-allowed disabled:opacity-80`}
          >
            <h3 className="truncate text-sm font-black text-[#2B2D31] sm:text-lg">
              {partido.equipoLocal?.nombre}
            </h3>
            <p className="mt-1 text-[11px] font-bold uppercase text-[#6B6F76]">
              Local
            </p>
          </button>

          <div className="rounded-3xl bg-[#FAFAFA] px-4 py-3 text-center shadow-sm sm:px-8 sm:py-5">
            <p className="text-4xl font-black leading-none text-[#2B2D31] sm:text-6xl">
              {marcadorLocal}
              <span className="mx-2 text-[#CDAA43] sm:mx-4">-</span>
              {marcadorVisitante}
            </p>
          </div>

          <button
            type="button"
            disabled={partido.estado !== "EN_CURSO"}
            onClick={() => seleccionarEquipo(partido.equipoVisitanteId)}
            className={`min-w-0 rounded-2xl border p-3 text-left transition ${
              Number(form.equipoId) === partido.equipoVisitanteId
                ? "border-[#8C1D2C] bg-[#FFF8F8]"
                : "border-[#E6E7EA] bg-[#FAFAFA]"
            } disabled:cursor-not-allowed disabled:opacity-80`}
          >
            <h3 className="truncate text-sm font-black text-[#2B2D31] sm:text-lg">
              {partido.equipoVisitante?.nombre}
            </h3>
            <p className="mt-1 text-[11px] font-bold uppercase text-[#6B6F76]">
              Visitante
            </p>
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-xl font-black text-[#2B2D31]">
              Registrar evento
            </h3>
            <p className="mt-1 text-sm text-[#6B6F76]">
              Selecciona equipo, evento y registra.
            </p>
          </div>

          {partido.estado !== "EN_CURSO" ? (
            <div className="rounded-2xl bg-[#FAFAFA] p-4 text-sm font-medium text-[#6B6F76]">
              Solo puedes registrar eventos cuando el partido esté en curso.
            </div>
          ) : (
            <form className="space-y-5" onSubmit={registrarEvento}>
              <div>
                <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                  Equipo
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => seleccionarEquipo(partido.equipoLocalId)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                      Number(form.equipoId) === partido.equipoLocalId
                        ? "border-[#8C1D2C] bg-[#8C1D2C] text-white"
                        : "border-[#E6E7EA] bg-white text-[#2B2D31] hover:border-[#8C1D2C]"
                    }`}
                  >
                    Local
                  </button>

                  <button
                    type="button"
                    onClick={() => seleccionarEquipo(partido.equipoVisitanteId)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                      Number(form.equipoId) === partido.equipoVisitanteId
                        ? "border-[#8C1D2C] bg-[#8C1D2C] text-white"
                        : "border-[#E6E7EA] bg-white text-[#2B2D31] hover:border-[#8C1D2C]"
                    }`}
                  >
                    Visitante
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                  Tipo de evento
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {eventosDisponibles.map((evento) => (
                    <button
                      key={evento.value}
                      type="button"
                      onClick={() => seleccionarTipo(evento.value)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                        form.tipo === evento.value
                          ? "border-[#8C1D2C] bg-[#8C1D2C] text-white"
                          : "border-[#E6E7EA] bg-white text-[#2B2D31] hover:border-[#8C1D2C]"
                      }`}
                    >
                      {evento.label}
                      {evento.suma && (
                        <span className="ml-1 text-xs opacity-80">+1</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                  Jugador
                </label>

                <select
                  name="jugadorId"
                  value={form.jugadorId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                >
                  <option value="">Sin jugador</option>

                  {jugadoresFiltrados.map((jugador) => (
                    <option key={jugador.id} value={jugador.id}>
                      {jugador.numero ? `#${jugador.numero} ` : ""}
                      {jugador.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                    Minuto
                  </label>

                  <input
                    type="number"
                    name="minuto"
                    min="0"
                    value={form.minuto}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#E6E7EA] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                    Descripción
                  </label>

                  <input
                    type="text"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#E6E7EA] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-2xl bg-[#8C1D2C] px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#741826] disabled:opacity-60"
              >
                {guardando ? "Registrando..." : "Registrar evento"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2B2D31]">
                Eventos registrados
              </h3>
              <p className="mt-1 text-sm text-[#6B6F76]">
                Historial del partido.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
              {eventos.length} eventos
            </span>
          </div>

          {eventos.length === 0 ? (
            <div className="rounded-2xl bg-[#FAFAFA] p-5">
              <p className="text-sm font-medium text-[#6B6F76]">
                Todavía no hay eventos registrados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento) => (
                <article
                  key={evento.id}
                  className="rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-4"
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
                          {tipoLabel[evento.tipo] || evento.tipo}
                        </span>

                        {evento.minuto !== null && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B6F76]">
                            Min. {evento.minuto}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 truncate text-sm font-black text-[#2B2D31]">
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
                        <p className="mt-2 text-sm text-[#6B6F76]">
                          {evento.descripcion}
                        </p>
                      )}
                    </div>

                    {partido.estado === "EN_CURSO" && (
                      <button
                        type="button"
                        disabled={guardando}
                        onClick={() => eliminarEvento(evento.id)}
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </RefereeLayout>
  );
}

export default RefereeMatchPage;
