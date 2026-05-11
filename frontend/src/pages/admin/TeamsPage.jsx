import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  getTeamsRequest,
  createTeamRequest,
  updateTeamRequest,
  deleteTeamRequest,
} from "../../api/teamsApi";

import { getDisciplinesRequest } from "../../api/disciplinesApi";

function TeamsPage() {
  const [equipos, setEquipos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    entrenador: "",
    escudoUrl: "",
    disciplinaId: "",
  });

  const [editandoId, setEditandoId] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [equiposData, disciplinasData] = await Promise.all([
        getTeamsRequest(),
        getDisciplinesRequest(),
      ]);

      setEquipos(equiposData);
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
    } catch (error) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      entrenador: "",
      escudoUrl: "",
      disciplinaId: "",
    });

    setEditandoId(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardarEquipo = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre del equipo es obligatorio.");
      return;
    }

    if (!form.disciplinaId) {
      setError("Debes seleccionar una disciplina.");
      return;
    }

    try {
      setGuardando(true);

      const data = {
        nombre: form.nombre,
        entrenador: form.entrenador,
        escudoUrl: form.escudoUrl || null,
        disciplinaId: Number(form.disciplinaId),
      };

      if (editandoId) {
        await updateTeamRequest(editandoId, data);
      } else {
        await createTeamRequest(data);
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo guardar el equipo.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarEquipo = (equipo) => {
    setEditandoId(equipo.id);

    setForm({
      nombre: equipo.nombre,
      entrenador: equipo.entrenador || "",
      escudoUrl: equipo.escudoUrl || "",
      disciplinaId: String(equipo.disciplinaId),
    });
  };

  const desactivarEquipo = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres desactivar este equipo?",
    );

    if (!confirmar) return;

    try {
      await deleteTeamRequest(id);
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo desactivar el equipo.",
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Equipos</h2>
        <p className="mt-2 text-[#6B6F76]">
          Administra los equipos registrados por disciplina.
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
            {editandoId ? "Editar equipo" : "Nuevo equipo"}
          </h3>

          <form className="mt-6 space-y-5" onSubmit={guardarEquipo}>
            <div>
              <label className="mb-2 block text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. Halcones Tec"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Entrenador
              </label>
              <input
                type="text"
                name="entrenador"
                value={form.entrenador}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Nombre del entrenador"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Escudo URL
              </label>
              <input
                type="text"
                name="escudoUrl"
                value={form.escudoUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Opcional"
              />
            </div>

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
              {equipos.length} registros
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando equipos...</p>
          ) : equipos.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay equipos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                    <th className="px-3 py-3 font-semibold">Equipo</th>
                    <th className="px-3 py-3 font-semibold">Disciplina</th>
                    <th className="px-3 py-3 font-semibold">Entrenador</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {equipos.map((equipo) => (
                    <tr key={equipo.id} className="border-b border-[#F0F0F1]">
                      <td className="px-3 py-4 font-medium">{equipo.nombre}</td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {equipo.disciplina?.nombre || "Sin disciplina"}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {equipo.entrenador || "Sin entrenador"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            equipo.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {equipo.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editarEquipo(equipo)}
                            className="rounded-lg border border-[#E6E7EA] px-3 py-2 text-xs font-semibold text-[#2B2D31] hover:bg-[#FAFAFA]"
                          >
                            Editar
                          </button>

                          {equipo.activo && (
                            <button
                              onClick={() => desactivarEquipo(equipo.id)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              Desactivar
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

export default TeamsPage;
