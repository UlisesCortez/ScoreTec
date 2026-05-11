import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("scoretec_user"));

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
        { value: "TARJETA_AMARILLA", label: "Tarjeta amarilla", suma: false },
        { value: "TARJETA_ROJA", label: "Tarjeta roja", suma: false },
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

  const cargarDatos = async () => {
    try {
      setCargando(true);

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

  useEffect(() => {
    if (eventosDisponibles.length > 0) {
      setForm((prev) => ({
        ...prev,
        tipo: eventosDisponibles[0].value,
      }));
    }
  }, [eventosDisponibles]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
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

    if (!form.equipoId || !form.tipo) {
      setError("El equipo y el tipo de evento son obligatorios.");
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

      setForm({
        equipoId: "",
        jugadorId: "",
        tipo: eventosDisponibles[0]?.value || "PUNTO",
        minuto: "",
        descripcion: "",
      });

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
        <p className="text-[#6B6F76]">Cargando partido...</p>
      </RefereeLayout>
    );
  }

  if (!partido) {
    return (
      <RefereeLayout>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Partido no encontrado.
        </div>
      </RefereeLayout>
    );
  }

  return (
    <RefereeLayout>
      <Link
        to="/referee"
        className="mb-6 inline-block text-sm font-semibold text-[#8C1D2C]"
      >
        ← Volver a mis partidos
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
            {partido.disciplina?.nombre}
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {partido.equipoLocal?.nombre} vs {partido.equipoVisitante?.nombre}
          </h2>

          <p className="mt-3 text-[#6B6F76]">{formatearFecha(partido.fecha)}</p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            estadoClase[partido.estado] || "bg-gray-100 text-gray-600"
          }`}
        >
          {partido.estado}
        </span>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mb-6 rounded-[2rem] border border-[#E6E7EA] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="text-right">
            <h3 className="text-xl font-bold">{partido.equipoLocal?.nombre}</h3>
            <p className="text-sm text-[#6B6F76]">Local</p>
          </div>

          <div className="rounded-3xl bg-[#FAFAFA] px-8 py-5 text-center shadow-sm">
            <p className="text-5xl font-bold">
              {partido.marcadorLocal}
              <span className="mx-4 text-[#CDAA43]">-</span>
              {partido.marcadorVisitante}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold">
              {partido.equipoVisitante?.nombre}
            </h3>
            <p className="text-sm text-[#6B6F76]">Visitante</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {partido.estado === "PROXIMO" && (
            <button
              type="button"
              disabled={guardando}
              onClick={iniciarPartido}
              className="rounded-xl bg-[#8C1D2C] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Iniciar partido
            </button>
          )}

          {partido.estado === "EN_CURSO" && (
            <button
              type="button"
              disabled={guardando}
              onClick={finalizarPartido}
              className="rounded-xl bg-[#2B2D31] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Finalizar partido
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Registrar evento</h3>

          {partido.estado !== "EN_CURSO" ? (
            <p className="mt-4 rounded-2xl bg-[#FAFAFA] p-4 text-sm text-[#6B6F76]">
              Solo puedes registrar eventos cuando el partido esté en curso.
            </p>
          ) : (
            <>
              <div className="mt-4 rounded-2xl bg-[#FAFAFA] p-4 text-xs text-[#6B6F76]">
                Eventos disponibles para{" "}
                <span className="font-semibold text-[#2B2D31]">
                  {partido.disciplina?.nombre}
                </span>
                : {eventosDisponibles.map((evento) => evento.label).join(", ")}.
              </div>

              <form className="mt-6 space-y-5" onSubmit={registrarEvento}>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Equipo
                  </label>

                  <select
                    name="equipoId"
                    value={form.equipoId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
                  >
                    <option value="">Selecciona un equipo</option>
                    <option value={partido.equipoLocalId}>
                      {partido.equipoLocal?.nombre}
                    </option>
                    <option value={partido.equipoVisitanteId}>
                      {partido.equipoVisitante?.nombre}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Jugador
                  </label>

                  <select
                    name="jugadorId"
                    value={form.jugadorId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
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

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tipo de evento
                  </label>

                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
                  >
                    {eventosDisponibles.map((evento) => (
                      <option key={evento.value} value={evento.value}>
                        {evento.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Minuto
                  </label>

                  <input
                    type="number"
                    name="minuto"
                    value={form.minuto}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                    placeholder="Ej. 12"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Descripción
                  </label>

                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows="3"
                    className="w-full resize-none rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                    placeholder="Opcional"
                  />
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full rounded-xl bg-[#8C1D2C] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {guardando ? "Registrando..." : "Registrar evento"}
                </button>
              </form>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Eventos registrados</h3>

            <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
              {eventos.length} eventos
            </span>
          </div>

          {eventos.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay eventos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento) => (
                <article
                  key={evento.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          tipoClase[evento.tipo] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tipoLabel[evento.tipo] || evento.tipo}
                      </span>

                      {evento.minuto !== null && (
                        <span className="text-xs text-[#6B6F76]">
                          Min. {evento.minuto}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 font-semibold">
                      {evento.equipo?.nombre}
                    </p>

                    {evento.jugador && (
                      <p className="text-sm text-[#6B6F76]">
                        {evento.jugador.nombre}
                      </p>
                    )}

                    {evento.descripcion && (
                      <p className="mt-1 text-sm text-[#6B6F76]">
                        {evento.descripcion}
                      </p>
                    )}
                  </div>

                  {partido.estado === "EN_CURSO" && (
                    <button
                      type="button"
                      onClick={() => eliminarEvento(evento.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  )}
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
