import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  getDisciplinesRequest,
  createDisciplineRequest,
  updateDisciplineRequest,
  deleteDisciplineRequest,
} from "../../api/disciplinesApi";

function DisciplinesPage() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
  });

  const [editandoId, setEditandoId] = useState(null);

  const cargarDisciplinas = async () => {
    try {
      setCargando(true);
      const data = await getDisciplinesRequest();
      setDisciplinas(data);
    } catch (error) {
      setError("No se pudieron cargar las disciplinas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDisciplinas();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      descripcion: "",
    });
    setEditandoId(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardarDisciplina = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre de la disciplina es obligatorio.");
      return;
    }

    try {
      setGuardando(true);

      if (editandoId) {
        await updateDisciplineRequest(editandoId, {
          nombre: form.nombre,
          descripcion: form.descripcion,
        });
      } else {
        await createDisciplineRequest({
          nombre: form.nombre,
          descripcion: form.descripcion,
        });
      }

      limpiarFormulario();
      await cargarDisciplinas();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo guardar la disciplina.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarDisciplina = (disciplina) => {
    setEditandoId(disciplina.id);
    setForm({
      nombre: disciplina.nombre,
      descripcion: disciplina.descripcion || "",
    });
  };

  const desactivarDisciplina = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres desactivar esta disciplina?",
    );

    if (!confirmar) return;

    try {
      await deleteDisciplineRequest(id);
      await cargarDisciplinas();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo desactivar la disciplina.",
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold">Disciplinas</h2>
          <p className="mt-2 text-[#6B6F76]">
            Administra los deportes disponibles para el torneo.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            {editandoId ? "Editar disciplina" : "Nueva disciplina"}
          </h3>

          <form className="mt-6 space-y-5" onSubmit={guardarDisciplina}>
            <div>
              <label className="mb-2 block text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. Fútbol"
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
                rows="4"
                className="w-full resize-none rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Descripción opcional"
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
              {disciplinas.length} registros
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando disciplinas...</p>
          ) : disciplinas.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay disciplinas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                    <th className="px-3 py-3 font-semibold">Nombre</th>
                    <th className="px-3 py-3 font-semibold">Descripción</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {disciplinas.map((disciplina) => (
                    <tr
                      key={disciplina.id}
                      className="border-b border-[#F0F0F1]"
                    >
                      <td className="px-3 py-4 font-medium">
                        {disciplina.nombre}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {disciplina.descripcion || "Sin descripción"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            disciplina.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {disciplina.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editarDisciplina(disciplina)}
                            className="rounded-lg border border-[#E6E7EA] px-3 py-2 text-xs font-semibold text-[#2B2D31] hover:bg-[#FAFAFA]"
                          >
                            Editar
                          </button>

                          {disciplina.activo && (
                            <button
                              onClick={() =>
                                desactivarDisciplina(disciplina.id)
                              }
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

export default DisciplinesPage;
