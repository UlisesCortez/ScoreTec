import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  getUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "../../api/usersApi";

function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "ARBITRO",
    activo: true,
  });

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await getUsersRequest();
      setUsuarios(data);
    } catch (error) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      email: "",
      password: "",
      rol: "ARBITRO",
      activo: true,
    });
    setEditandoId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim() || !form.email.trim() || !form.rol) {
      setError("Nombre, correo y rol son obligatorios.");
      return;
    }

    if (!editandoId && (form.rol === "ADMIN" || form.rol === "ARBITRO")) {
      if (!form.password.trim()) {
        setError("La contraseña es obligatoria para ADMIN o ARBITRO.");
        return;
      }
    }

    try {
      setGuardando(true);

      const data = {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        activo: form.activo,
      };

      if (form.password.trim()) {
        data.password = form.password;
      }

      if (editandoId) {
        await updateUserRequest(editandoId, data);
      } else {
        await createUserRequest(data);
      }

      limpiarFormulario();
      await cargarUsuarios();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo guardar el usuario.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarUsuario = (usuario) => {
    setEditandoId(usuario.id);

    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
      activo: usuario.activo,
    });
  };

  const desactivarUsuario = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres desactivar este usuario?",
    );

    if (!confirmar) return;

    try {
      await deleteUserRequest(id);
      await cargarUsuarios();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo desactivar el usuario.",
      );
    }
  };

  const rolClase = {
    ADMIN: "bg-[#F8F2E2] text-[#8C1D2C]",
    ARBITRO: "bg-blue-50 text-blue-700",
    USUARIO: "bg-gray-100 text-gray-600",
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Usuarios</h2>
        <p className="mt-2 text-[#6B6F76]">
          Crea cuentas para administradores, árbitros y usuarios del sistema.
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
            {editandoId ? "Editar usuario" : "Nuevo usuario"}
          </h3>

          <form className="mt-6 space-y-5" onSubmit={guardarUsuario}>
            <div>
              <label className="mb-2 block text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. Árbitro Prueba"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Correo</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="arbitro@scoretec.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder={
                  editandoId ? "Dejar vacío para no cambiar" : "Contraseña"
                }
              />

              <p className="mt-2 text-xs text-[#6B6F76]">
                Para usuarios de Google puedes dejarla vacía si el rol es
                USUARIO.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Rol</label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="ARBITRO">ARBITRO</option>
                <option value="USUARIO">USUARIO</option>
              </select>
            </div>

            {editandoId && (
              <label className="flex items-center gap-3 rounded-xl border border-[#E6E7EA] px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                />
                Usuario activo
              </label>
            )}

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
              {usuarios.length} usuarios
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay usuarios registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                    <th className="px-3 py-3 font-semibold">Nombre</th>
                    <th className="px-3 py-3 font-semibold">Correo</th>
                    <th className="px-3 py-3 font-semibold">Rol</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-[#F0F0F1]">
                      <td className="px-3 py-4 font-medium">
                        {usuario.nombre}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {usuario.email}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            rolClase[usuario.rol] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {usuario.rol}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            usuario.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editarUsuario(usuario)}
                            className="rounded-lg border border-[#E6E7EA] px-3 py-2 text-xs font-semibold text-[#2B2D31] hover:bg-[#FAFAFA]"
                          >
                            Editar
                          </button>

                          {usuario.activo && (
                            <button
                              onClick={() => desactivarUsuario(usuario.id)}
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

export default UsersPage;
