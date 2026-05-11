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

function MatchesPage() {
  const [partidos, setPartidos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    disciplinaId: "",
    equipoLocalId: "",
    equipoVisitanteId: "",
    fecha: "",
    ubicacionNombre: "",
    ubicacionDireccion: "",
    ubicacionMapaUrl: "",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [partidosData, disciplinasData, equiposData] = await Promise.all([
        getMatchesRequest(),
        getDisciplinesRequest(),
        getTeamsRequest(),
      ]);

      setPartidos(partidosData);
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
      setEquipos(equiposData.filter((equipo) => equipo.activo));
    } catch (error) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const equiposFiltrados = useMemo(() => {
    if (!form.disciplinaId) return equipos;

    return equipos.filter(
      (equipo) => equipo.disciplinaId === Number(form.disciplinaId),
    );
  }, [equipos, form.disciplinaId]);

  const limpiarFormulario = () => {
    setForm({
      disciplinaId: "",
      equipoLocalId: "",
      equipoVisitanteId: "",
      fecha: "",
      ubicacionNombre: "",
      ubicacionDireccion: "",
      ubicacionMapaUrl: "",
    });

    setEditandoId(null);
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
      await cargarDatos();
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
      fecha: partido.fecha ? partido.fecha.slice(0, 16) : "",
      ubicacionNombre: partido.ubicacionNombre || "",
      ubicacionDireccion: partido.ubicacionDireccion || "",
      ubicacionMapaUrl: partido.ubicacionMapaUrl || "",
    });
  };

  const cancelarPartido = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres cancelar este partido?",
    );

    if (!confirmar) return;

    try {
      await cancelMatchRequest(id);
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo cancelar el partido.",
      );
    }
  };

  const estadoClase = (estado) => {
    if (estado === "PROXIMO") return "bg-blue-50 text-blue-700";
    if (estado === "EN_CURSO") return "bg-green-50 text-green-700";
    if (estado === "FINALIZADO") return "bg-gray-100 text-gray-600";
    if (estado === "CANCELADO") return "bg-red-50 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Partidos</h2>
        <p className="mt-2 text-[#6B6F76]">
          Programa encuentros deportivos, equipos, horarios y ubicaciones.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            {editandoId ? "Editar partido" : "Nuevo partido"}
          </h3>

          <form className="mt-6 space-y-5" onSubmit={guardarPartido}>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Disciplina
              </label>
              <select
                name="disciplinaId"
                value={form.disciplinaId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
              >
                <option value="">Selecciona una disciplina</option>
                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Equipo local
              </label>
              <select
                name="equipoLocalId"
                value={form.equipoLocalId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
              >
                <option value="">Selecciona equipo local</option>
                {equiposFiltrados.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Equipo visitante
              </label>
              <select
                name="equipoVisitanteId"
                value={form.equipoVisitanteId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
              >
                <option value="">Selecciona equipo visitante</option>
                {equiposFiltrados.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Lugar</label>
              <input
                type="text"
                name="ubicacionNombre"
                value={form.ubicacionNombre}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. Cancha principal"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Dirección
              </label>
              <input
                type="text"
                name="ubicacionDireccion"
                value={form.ubicacionDireccion}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. TecNM Campus Nogales"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                URL de mapa
              </label>
              <input
                type="text"
                name="ubicacionMapaUrl"
                value={form.ubicacionMapaUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="https://maps.google.com"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-[#8C1D2C] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Actualizar"
                    : "Guardar"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-xl border border-[#E6E7EA] px-5 py-3 text-sm font-semibold text-[#2B2D31] transition hover:bg-[#FAFAFA]"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Listado</h3>
            <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
              {partidos.length} registros
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando partidos...</p>
          ) : partidos.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay partidos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                    <th className="px-3 py-3 font-semibold">Partido</th>
                    <th className="px-3 py-3 font-semibold">Disciplina</th>
                    <th className="px-3 py-3 font-semibold">Fecha</th>
                    <th className="px-3 py-3 font-semibold">Marcador</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {partidos.map((partido) => (
                    <tr key={partido.id} className="border-b border-[#F0F0F1]">
                      <td className="px-3 py-4 font-medium">
                        {partido.equipoLocal?.nombre} vs{" "}
                        {partido.equipoVisitante?.nombre}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {partido.disciplina?.nombre || "Sin disciplina"}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {formatearFecha(partido.fecha)}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {partido.marcadorLocal} - {partido.marcadorVisitante}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(
                            partido.estado,
                          )}`}
                        >
                          {partido.estado}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editarPartido(partido)}
                            className="rounded-lg border border-[#E6E7EA] px-3 py-2 text-xs font-semibold text-[#2B2D31] hover:bg-[#FAFAFA]"
                          >
                            Editar
                          </button>

                          {partido.estado !== "CANCELADO" &&
                            partido.estado !== "FINALIZADO" && (
                              <button
                                onClick={() => cancelarPartido(partido.id)}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                              >
                                Cancelar
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default MatchesPage;
