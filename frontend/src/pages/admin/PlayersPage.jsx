import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/layout/AdminLayout";

import {
  getPlayersRequest,
  createPlayerRequest,
  updatePlayerRequest,
  deletePlayerRequest,
} from "../../api/playersApi";

import { getTeamsRequest } from "../../api/teamsApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function PlayersPage() {
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    numero: "",
    equipoId: "",
    activo: true,
  });

  const [filtros, setFiltros] = useState({
    busqueda: "",
    disciplinaId: "TODAS",
    equipoId: "TODOS",
    estado: "TODOS",
  });

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [jugadoresData, equiposData, disciplinasData] = await Promise.all([
        getPlayersRequest(),
        getTeamsRequest(),
        getDisciplinesRequest(),
      ]);

      setJugadores(jugadoresData);
      setEquipos(equiposData.filter((equipo) => equipo.activo));
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
    } catch (error) {
      setError("No se pudieron cargar los jugadores.");
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
      total: jugadores.length,
      activos: jugadores.filter((jugador) => jugador.activo).length,
      inactivos: jugadores.filter((jugador) => !jugador.activo).length,
      equipos: new Set(jugadores.map((jugador) => jugador.equipoId)).size,
    };
  }, [jugadores]);

  const equiposParaFiltro = useMemo(() => {
    if (filtros.disciplinaId === "TODAS") return equipos;

    return equipos.filter(
      (equipo) => equipo.disciplinaId === Number(filtros.disciplinaId),
    );
  }, [equipos, filtros.disciplinaId]);

  const jugadoresFiltrados = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase();

    return jugadores
      .filter((jugador) => {
        const nombre = jugador.nombre?.toLowerCase() || "";
        const numero = jugador.numero ? String(jugador.numero) : "";
        const equipo = jugador.equipo?.nombre?.toLowerCase() || "";
        const disciplina =
          jugador.equipo?.disciplina?.nombre?.toLowerCase() || "";

        const coincideBusqueda =
          !texto ||
          nombre.includes(texto) ||
          numero.includes(texto) ||
          equipo.includes(texto) ||
          disciplina.includes(texto);

        const coincideDisciplina =
          filtros.disciplinaId === "TODAS" ||
          jugador.equipo?.disciplinaId === Number(filtros.disciplinaId);

        const coincideEquipo =
          filtros.equipoId === "TODOS" ||
          jugador.equipoId === Number(filtros.equipoId);

        const coincideEstado =
          filtros.estado === "TODOS" ||
          (filtros.estado === "ACTIVOS" && jugador.activo) ||
          (filtros.estado === "INACTIVOS" && !jugador.activo);

        return (
          coincideBusqueda &&
          coincideDisciplina &&
          coincideEquipo &&
          coincideEstado
        );
      })
      .sort((a, b) => {
        if (a.activo !== b.activo) return a.activo ? -1 : 1;

        const equipoA = a.equipo?.nombre || "";
        const equipoB = b.equipo?.nombre || "";

        if (equipoA !== equipoB) return equipoA.localeCompare(equipoB);

        return a.nombre.localeCompare(b.nombre);
      });
  }, [jugadores, filtros]);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      numero: "",
      equipoId: "",
      activo: true,
    });

    setEditandoId(null);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      disciplinaId: "TODAS",
      equipoId: "TODOS",
      estado: "TODOS",
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros((prev) => {
      const nuevoFiltro = {
        ...prev,
        [name]: value,
      };

      if (name === "disciplinaId") {
        nuevoFiltro.equipoId = "TODOS";
      }

      return nuevoFiltro;
    });
  };

  const guardarJugador = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim() || !form.equipoId) {
      setError("El nombre del jugador y el equipo son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const data = {
        nombre: form.nombre.trim(),
        numero: form.numero ? Number(form.numero) : null,
        equipoId: Number(form.equipoId),
        activo: form.activo,
      };

      if (editandoId) {
        await updatePlayerRequest(editandoId, data);
      } else {
        await createPlayerRequest(data);
      }

      limpiarFormulario();
      await cargarDatos(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo guardar el jugador.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarJugador = (jugador) => {
    setEditandoId(jugador.id);

    setForm({
      nombre: jugador.nombre || "",
      numero: jugador.numero ? String(jugador.numero) : "",
      equipoId: jugador.equipoId ? String(jugador.equipoId) : "",
      activo: jugador.activo,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarJugador = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar o desactivar este jugador?",
    );

    if (!confirmar) return;

    try {
      setError("");
      setGuardando(true);

      await deletePlayerRequest(id);
      await cargarDatos(true);

      if (editandoId === id) {
        limpiarFormulario();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo eliminar o desactivar el jugador.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const StatCard = ({ titulo, valor, tono = "normal" }) => {
    const tonos = {
      normal: "text-[#2B2D31]",
      vino: "text-[#8C1D2C]",
      verde: "text-green-700",
      gris: "text-[#6B6F76]",
    };

    return (
      <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
          {titulo}
        </p>

        <h3
          className={`mt-2 text-3xl font-black ${tonos[tono] || tonos.normal}`}
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
              Jugadores
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#6B6F76] sm:text-base">
              Registra jugadores, asigna equipos y administra su disponibilidad
              para los partidos.
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
        <StatCard titulo="Activos" valor={resumen.activos} tono="verde" />
        <StatCard titulo="Inactivos" valor={resumen.inactivos} tono="gris" />
        <StatCard titulo="Equipos" valor={resumen.equipos} tono="normal" />
      </section>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-xl font-black text-[#2B2D31]">
              {editandoId ? "Editar jugador" : "Nuevo jugador"}
            </h3>

            <p className="mt-1 text-sm text-[#6B6F76]">
              {editandoId
                ? "Modifica los datos del jugador seleccionado."
                : "Completa los datos para registrar un jugador."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={guardarJugador}>
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Nombre del jugador
              </label>

              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Número
              </label>

              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                min="0"
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                placeholder="Ej. 10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                Equipo
              </label>

              <select
                name="equipoId"
                value={form.equipoId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
              >
                <option value="">Selecciona un equipo</option>

                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} —{" "}
                    {equipo.disciplina?.nombre || "Sin disciplina"}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] px-4 py-3">
              <div>
                <p className="text-sm font-black text-[#2B2D31]">
                  Jugador activo
                </p>
                <p className="text-xs font-medium text-[#6B6F76]">
                  Si está inactivo, no debería usarse en nuevos partidos.
                </p>
              </div>

              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="h-5 w-5 accent-[#8C1D2C]"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-2xl bg-[#8C1D2C] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#741826] disabled:opacity-60 sm:flex-1"
              >
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Actualizar jugador"
                    : "Guardar jugador"}
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
                Listado de jugadores
              </h3>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Busca, filtra y administra los jugadores registrados.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
              {jugadoresFiltrados.length} resultados
            </span>
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_150px_auto] lg:items-center">
            <input
              type="text"
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleFiltro}
              placeholder="Buscar jugador, número o equipo..."
              className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
            />

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

            <select
              name="equipoId"
              value={filtros.equipoId}
              onChange={handleFiltro}
              className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
            >
              <option value="TODOS">Todos</option>

              {equiposParaFiltro.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>

            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltro}
              className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVOS">Activos</option>
              <option value="INACTIVOS">Inactivos</option>
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
                  className="h-24 animate-pulse rounded-2xl bg-[#F3F3F4]"
                />
              ))}
            </div>
          ) : jugadoresFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-6 text-center">
              <h3 className="text-lg font-black text-[#2B2D31]">
                No hay jugadores para mostrar
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
                Cambia los filtros o registra un nuevo jugador.
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
                {jugadoresFiltrados.map((jugador) => (
                  <article
                    key={jugador.id}
                    className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                          {jugador.equipo?.nombre || "Sin equipo"}
                        </p>

                        <h4 className="mt-2 truncate text-lg font-black text-[#2B2D31]">
                          {jugador.numero ? `#${jugador.numero} ` : ""}
                          {jugador.nombre}
                        </h4>

                        <p className="mt-1 truncate text-sm font-medium text-[#6B6F76]">
                          {jugador.equipo?.disciplina?.nombre ||
                            "Sin disciplina"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${
                          jugador.activo
                            ? "border-green-100 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {jugador.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => editarJugador(jugador)}
                        className="rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={guardando}
                        onClick={() => eliminarJugador(jugador.id)}
                        className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                      <th className="px-3 py-3 font-black">Jugador</th>
                      <th className="px-3 py-3 font-black">Número</th>
                      <th className="px-3 py-3 font-black">Equipo</th>
                      <th className="px-3 py-3 font-black">Disciplina</th>
                      <th className="px-3 py-3 font-black">Estado</th>
                      <th className="px-3 py-3 text-right font-black">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {jugadoresFiltrados.map((jugador) => (
                      <tr
                        key={jugador.id}
                        className="border-b border-[#F0F0F1] transition hover:bg-[#FAFAFA]"
                      >
                        <td className="px-3 py-4 font-black text-[#2B2D31]">
                          {jugador.nombre}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {jugador.numero || "Sin número"}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {jugador.equipo?.nombre || "Sin equipo"}
                        </td>

                        <td className="px-3 py-4 text-[#6B6F76]">
                          {jugador.equipo?.disciplina?.nombre ||
                            "Sin disciplina"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              jugador.activo
                                ? "border-green-100 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-100 text-gray-600"
                            }`}
                          >
                            {jugador.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => editarJugador(jugador)}
                              className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-black text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C]"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              disabled={guardando}
                              onClick={() => eliminarJugador(jugador.id)}
                              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default PlayersPage;
