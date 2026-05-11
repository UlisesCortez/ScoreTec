import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  getMatchesRequest,
  createMatchRequest,
  updateMatchRequest,
  cancelMatchRequest,
} from "../../api/matchesApi";

import { getDisciplinesRequest } from "../../api/disciplinesApi";
import { getTeamsRequest } from "../../api/teamsApi";
import { getUsersRequest } from "../../api/usersApi";

function MatchesPage() {
  const [partidos, setPartidos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [arbitros, setArbitros] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "TODOS",
    disciplinaId: "TODAS",
  });

  const [form, setForm] = useState({
    disciplinaId: "",
    equipoLocalId: "",
    equipoVisitanteId: "",
    arbitroId: "",
    fecha: "",
    ubicacionNombre: "",
    ubicacionDireccion: "",
    ubicacionMapaUrl: "",
  });

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [partidosData, disciplinasData, equiposData, usuariosData] =
        await Promise.all([
          getMatchesRequest(),
          getDisciplinesRequest(),
          getTeamsRequest(),
          getUsersRequest(),
        ]);

      setPartidos(partidosData);
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
      setEquipos(equiposData.filter((equipo) => equipo.activo));
      setArbitros(
        usuariosData.filter(
          (usuario) => usuario.activo && usuario.rol === "ARBITRO",
        ),
      );
    } catch (error) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resumen = useMemo(() => {
    return {
      total: partidos.length,
      proximos: partidos.filter((p) => p.estado === "PROXIMO").length,
      enCurso: partidos.filter((p) => p.estado === "EN_CURSO").length,
      finalizados: partidos.filter((p) => p.estado === "FINALIZADO").length,
    };
  }, [partidos]);

  const equiposFiltrados = useMemo(() => {
    if (!form.disciplinaId) return equipos;

    return equipos.filter(
      (equipo) => equipo.disciplinaId === Number(form.disciplinaId),
    );
  }, [equipos, form.disciplinaId]);

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

        const local = partido.equipoLocal?.nombre?.toLowerCase() || "";
        const visitante = partido.equipoVisitante?.nombre?.toLowerCase() || "";
        const disciplina = partido.disciplina?.nombre?.toLowerCase() || "";
        const arbitro = partido.arbitro?.nombre?.toLowerCase() || "";
        const lugar = partido.ubicacionNombre?.toLowerCase() || "";

        const coincideBusqueda =
          !texto ||
          local.includes(texto) ||
          visitante.includes(texto) ||
          disciplina.includes(texto) ||
          arbitro.includes(texto) ||
          lugar.includes(texto);

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

  const limpiarFormulario = () => {
    setForm({
      disciplinaId: "",
      equipoLocalId: "",
      equipoVisitanteId: "",
      arbitroId: "",
      fecha: "",
      ubicacionNombre: "",
      ubicacionDireccion: "",
      ubicacionMapaUrl: "",
    });

    setEditandoId(null);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "TODOS",
      disciplinaId: "TODAS",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const nuevoForm = {
        ...prev,
        [name]: value,
      };

      if (name === "disciplinaId") {
        nuevoForm.equipoLocalId = "";
        nuevoForm.equipoVisitanteId = "";
      }

      return nuevoForm;
    });
  };

  const handleFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarPartido = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.disciplinaId ||
      !form.equipoLocalId ||
      !form.equipoVisitanteId ||
      !form.fecha
    ) {
      setError("Disciplina, equipos y fecha son obligatorios.");
      return;
    }

    if (form.equipoLocalId === form.equipoVisitanteId) {
      setError("El equipo local y visitante no pueden ser el mismo.");
      return;
    }

    try {
      setGuardando(true);

      const data = {
        disciplinaId: Number(form.disciplinaId),
        equipoLocalId: Number(form.equipoLocalId),
        equipoVisitanteId: Number(form.equipoVisitanteId),
        arbitroId: form.arbitroId ? Number(form.arbitroId) : null,
        fecha: new Date(form.fecha).toISOString(),
        ubicacionNombre: form.ubicacionNombre || null,
        ubicacionDireccion: form.ubicacionDireccion || null,
        ubicacionMapaUrl: form.ubicacionMapaUrl || null,
      };

      if (editandoId) {
        await updateMatchRequest(editandoId, data);
      } else {
        await createMatchRequest(data);
      }

      limpiarFormulario();
      await cargarDatos(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo guardar el partido.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarPartido = (partido) => {
    setEditandoId(partido.id);

    setForm({
      disciplinaId: String(partido.disciplinaId),
      equipoLocalId: String(partido.equipoLocalId),
      equipoVisitanteId: String(partido.equipoVisitanteId),
      arbitroId: partido.arbitroId ? String(partido.arbitroId) : "",
      fecha: partido.fecha ? partido.fecha.slice(0, 16) : "",
      ubicacionNombre: partido.ubicacionNombre || "",
      ubicacionDireccion: partido.ubicacionDireccion || "",
      ubicacionMapaUrl: partido.ubicacionMapaUrl || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarPartido = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres cancelar este partido?",
    );

    if (!confirmar) return;

    try {
      setError("");
      setGuardando(true);
      await cancelMatchRequest(id);
      await cargarDatos(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo cancelar el partido.",
      );
    } finally {
      setGuardando(false);
    }
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

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const StatCard = ({ titulo, valor, tono = "normal" }) => {
    const tonoClase = {
      normal: "text-[#2B2D31]",
      vino: "text-[#8C1D2C]",
      verde: "text-green-700",
      azul: "text-blue-700",
      gris: "text-[#6B6F76]",
    };

    return (
      <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
          {titulo}
        </p>

        <h3
          className={`mt-2 text-3xl font-black ${
            tonoClase[tono] || tonoClase.normal
          }`}
        >
          {cargando ? "..." : valor}
        </h3>
      </article>
    );
  };

  return (
    <AdminLayout>
      <section className="mb-5 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
              Administración
            </p>

            <h2 className="mt-2 text-3xl font-black leading-tight text-[#2B2D31] sm:text-5xl">
              Partidos
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#6B6F76] sm:text-base">
              Programa encuentros deportivos, asigna árbitros y administra el
              estado de cada partido.
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
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard titulo="Total" valor={resumen.total} tono="vino" />
        <StatCard titulo="Próximos" valor={resumen.proximos} tono="azul" />
        <StatCard titulo="En curso" valor={resumen.enCurso} tono="verde" />
        <StatCard
          titulo="Finalizados"
          valor={resumen.finalizados}
          tono="gris"
        />
      </section>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-xl font-black text-[#2B2D31]">
              {editandoId ? "Editar partido" : "Nuevo partido"}
            </h3>

            <p className="mt-1 text-sm text-[#6B6F76]">
              {editandoId
                ? "Modifica los datos del partido seleccionado."
                : "Completa los datos para programar un nuevo encuentro."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={guardarPartido}>
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Disciplina
              </label>

              <select
                name="disciplinaId"
                value={form.disciplinaId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              >
                <option value="">Selecciona una disciplina</option>

                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                  Equipo local
                </label>

                <select
                  name="equipoLocalId"
                  value={form.equipoLocalId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                >
                  <option value="">Selecciona local</option>

                  {equiposFiltrados.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                  Equipo visitante
                </label>

                <select
                  name="equipoVisitanteId"
                  value={form.equipoVisitanteId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                >
                  <option value="">Selecciona visitante</option>

                  {equiposFiltrados.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Árbitro / Anotador
              </label>

              <select
                name="arbitroId"
                value={form.arbitroId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              >
                <option value="">Sin árbitro asignado</option>

                {arbitros.map((arbitro) => (
                  <option key={arbitro.id} value={arbitro.id}>
                    {arbitro.nombre} — {arbitro.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Fecha y hora
              </label>

              <input
                type="datetime-local"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Lugar
              </label>

              <input
                type="text"
                name="ubicacionNombre"
                value={form.ubicacionNombre}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                placeholder="Ej. Cancha principal"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Dirección
              </label>

              <input
                type="text"
                name="ubicacionDireccion"
                value={form.ubicacionDireccion}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                placeholder="Ej. TecNM Campus Nogales"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                URL de mapa
              </label>

              <input
                type="text"
                name="ubicacionMapaUrl"
                value={form.ubicacionMapaUrl}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                placeholder="https://maps.google.com"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-2xl bg-[#8C1D2C] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#741826] disabled:opacity-60 sm:flex-1"
              >
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Actualizar partido"
                    : "Guardar partido"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-2xl border border-[#E6E7EA] bg-white px-5 py-3.5 text-sm font-black text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C] sm:flex-1"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2B2D31]">
                Listado de partidos
              </h3>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Busca, filtra y administra los encuentros registrados.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
              {partidosFiltrados.length} resultados
            </span>
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto] lg:items-center">
            <input
              type="text"
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleFiltro}
              placeholder="Buscar equipo, árbitro o lugar..."
              className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
            />

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

            <button
              type="button"
              onClick={limpiarFiltros}
              className="rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] px-4 py-3 text-sm font-black text-[#4B4F56] transition hover:border-[#8C1D2C] hover:bg-white hover:text-[#8C1D2C]"
            >
              Limpiar
            </button>
          </div>

          {cargando ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-[#F3F3F4]"
                />
              ))}
            </div>
          ) : partidosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-6 text-center">
              <h3 className="text-lg font-black text-[#2B2D31]">
                No hay partidos para mostrar
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
                Cambia los filtros o registra un nuevo partido.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 rounded-2xl bg-[#8C1D2C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#741826]"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {partidosFiltrados.map((partido) => {
                  const marcadorLocal = partido.marcadorLocal ?? 0;
                  const marcadorVisitante = partido.marcadorVisitante ?? 0;

                  return (
                    <article
                      key={partido.id}
                      className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                            {partido.disciplina?.nombre || "Disciplina"}
                          </p>

                          <h4 className="mt-2 line-clamp-2 text-base font-black text-[#2B2D31]">
                            {partido.equipoLocal?.nombre || "Local"} vs{" "}
                            {partido.equipoVisitante?.nombre || "Visitante"}
                          </h4>

                          <p className="mt-1 text-sm font-medium text-[#6B6F76]">
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

                      <div className="mb-3 rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                        <p className="text-2xl font-black text-[#2B2D31]">
                          {marcadorLocal}
                          <span className="mx-2 text-[#CDAA43]">-</span>
                          {marcadorVisitante}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-[#6B6F76]">
                          <span className="font-bold text-[#2B2D31]">
                            Árbitro:
                          </span>{" "}
                          {partido.arbitro?.nombre || "Sin asignar"}
                        </p>

                        <p className="text-[#6B6F76]">
                          <span className="font-bold text-[#2B2D31]">
                            Lugar:
                          </span>{" "}
                          {partido.ubicacionNombre || "Sin ubicación"}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => editarPartido(partido)}
                          className="rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
                        >
                          Editar
                        </button>

                        {partido.estado !== "CANCELADO" &&
                        partido.estado !== "FINALIZADO" ? (
                          <button
                            type="button"
                            disabled={guardando}
                            onClick={() => cancelarPartido(partido.id)}
                            className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-black text-[#9CA3AF]"
                          >
                            Bloqueado
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                      <th className="px-3 py-3 font-black">Partido</th>
                      <th className="px-3 py-3 font-black">Disciplina</th>
                      <th className="px-3 py-3 font-black">Árbitro</th>
                      <th className="px-3 py-3 font-black">Fecha</th>
                      <th className="px-3 py-3 font-black">Marcador</th>
                      <th className="px-3 py-3 font-black">Estado</th>
                      <th className="px-3 py-3 text-right font-black">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {partidosFiltrados.map((partido) => {
                      const marcadorLocal = partido.marcadorLocal ?? 0;
                      const marcadorVisitante = partido.marcadorVisitante ?? 0;

                      return (
                        <tr
                          key={partido.id}
                          className="border-b border-[#F0F0F1] transition hover:bg-[#FAFAFA]"
                        >
                          <td className="px-3 py-4 font-black text-[#2B2D31]">
                            {partido.equipoLocal?.nombre || "Local"} vs{" "}
                            {partido.equipoVisitante?.nombre || "Visitante"}
                          </td>

                          <td className="px-3 py-4 text-[#6B6F76]">
                            {partido.disciplina?.nombre || "Sin disciplina"}
                          </td>

                          <td className="px-3 py-4 text-[#6B6F76]">
                            {partido.arbitro?.nombre || "Sin asignar"}
                          </td>

                          <td className="px-3 py-4 text-[#6B6F76]">
                            {formatearFecha(partido.fecha)}
                          </td>

                          <td className="px-3 py-4">
                            <span className="rounded-xl bg-[#FAFAFA] px-3 py-2 font-black text-[#2B2D31]">
                              {marcadorLocal}
                              <span className="mx-1 text-[#CDAA43]">-</span>
                              {marcadorVisitante}
                            </span>
                          </td>

                          <td className="px-3 py-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${
                                estadoClase[partido.estado] ||
                                "border-gray-200 bg-gray-100 text-gray-600"
                              }`}
                            >
                              {estadoTexto[partido.estado] || partido.estado}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editarPartido(partido)}
                                className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-black text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C]"
                              >
                                Editar
                              </button>

                              {partido.estado !== "CANCELADO" &&
                                partido.estado !== "FINALIZADO" && (
                                  <button
                                    type="button"
                                    disabled={guardando}
                                    onClick={() => cancelarPartido(partido.id)}
                                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                  >
                                    Cancelar
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default MatchesPage;
