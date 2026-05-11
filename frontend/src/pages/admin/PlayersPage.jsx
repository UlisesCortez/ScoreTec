import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  getPlayersRequest,
  createPlayerRequest,
  updatePlayerRequest,
  deletePlayerRequest,
} from "../../api/playersApi";

import { getTeamsRequest } from "../../api/teamsApi";

function PlayersPage() {
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    numero: "",
    posicion: "",
    fotoUrl: "",
    equipoId: "",
  });

  const [editandoId, setEditandoId] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [jugadoresData, equiposData] = await Promise.all([
        getPlayersRequest(),
        getTeamsRequest(),
      ]);

      setJugadores(jugadoresData);
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

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      numero: "",
      posicion: "",
      fotoUrl: "",
      equipoId: "",
    });

    setEditandoId(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardarJugador = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre del jugador es obligatorio.");
      return;
    }

    if (!form.equipoId) {
      setError("Debes seleccionar un equipo.");
      return;
    }

    try {
      setGuardando(true);

      const data = {
        nombre: form.nombre,
        numero: form.numero ? Number(form.numero) : null,
        posicion: form.posicion,
        fotoUrl: form.fotoUrl || null,
        equipoId: Number(form.equipoId),
      };

      if (editandoId) {
        await updatePlayerRequest(editandoId, data);
      } else {
        await createPlayerRequest(data);
      }

      limpiarFormulario();
      await cargarDatos();
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
      nombre: jugador.nombre,
      numero: jugador.numero || "",
      posicion: jugador.posicion || "",
      fotoUrl: jugador.fotoUrl || "",
      equipoId: String(jugador.equipoId),
    });
  };

  const desactivarJugador = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres desactivar este jugador?",
    );

    if (!confirmar) return;

    try {
      await deletePlayerRequest(id);
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo desactivar el jugador.",
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Jugadores</h2>
        <p className="mt-2 text-[#6B6F76]">
          Administra los jugadores registrados en cada equipo.
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
            {editandoId ? "Editar jugador" : "Nuevo jugador"}
          </h3>

          <form className="mt-6 space-y-5" onSubmit={guardarJugador}>
            <div>
              <label className="mb-2 block text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Número</label>
              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. 10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Posición</label>
              <input
                type="text"
                name="posicion"
                value={form.posicion}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Ej. Delantero"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Foto URL</label>
              <input
                type="text"
                name="fotoUrl"
                value={form.fotoUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Equipo</label>
              <select
                name="equipoId"
                value={form.equipoId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E6E7EA] bg-white px-4 py-3 outline-none focus:border-[#8C1D2C]"
              >
                <option value="">Selecciona un equipo</option>

                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} — {equipo.disciplina?.nombre}
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
              {jugadores.length} registros
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando jugadores...</p>
          ) : jugadores.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay jugadores registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E6E7EA] text-[#6B6F76]">
                    <th className="px-3 py-3 font-semibold">Jugador</th>
                    <th className="px-3 py-3 font-semibold">Número</th>
                    <th className="px-3 py-3 font-semibold">Posición</th>
                    <th className="px-3 py-3 font-semibold">Equipo</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {jugadores.map((jugador) => (
                    <tr key={jugador.id} className="border-b border-[#F0F0F1]">
                      <td className="px-3 py-4 font-medium">
                        {jugador.nombre}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {jugador.numero || "—"}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {jugador.posicion || "Sin posición"}
                      </td>

                      <td className="px-3 py-4 text-[#6B6F76]">
                        {jugador.equipo?.nombre || "Sin equipo"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            jugador.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {jugador.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editarJugador(jugador)}
                            className="rounded-lg border border-[#E6E7EA] px-3 py-2 text-xs font-semibold text-[#2B2D31] hover:bg-[#FAFAFA]"
                          >
                            Editar
                          </button>

                          {jugador.activo && (
                            <button
                              onClick={() => desactivarJugador(jugador.id)}
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

export default PlayersPage;
