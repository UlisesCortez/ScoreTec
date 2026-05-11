import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";

import { getDisciplinesRequest } from "../../api/disciplinesApi";
import { getTeamsRequest } from "../../api/teamsApi";
import { getPlayersRequest } from "../../api/playersApi";
import { getMatchesRequest } from "../../api/matchesApi";
import { getUsersRequest } from "../../api/usersApi";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [disciplinas, setDisciplinas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [
        disciplinasData,
        equiposData,
        jugadoresData,
        partidosData,
        usuariosData,
      ] = await Promise.all([
        getDisciplinesRequest(),
        getTeamsRequest(),
        getPlayersRequest(),
        getMatchesRequest(),
        getUsersRequest(),
      ]);

      setDisciplinas(disciplinasData);
      setEquipos(equiposData);
      setJugadores(jugadoresData);
      setPartidos(partidosData);
      setUsuarios(usuariosData);
    } catch (error) {
      setError("No se pudieron cargar los datos del dashboard.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resumen = useMemo(() => {
    return {
      disciplinasActivas: disciplinas.filter((d) => d.activo).length,
      equiposActivos: equipos.filter((e) => e.activo).length,
      jugadoresActivos: jugadores.filter((j) => j.activo).length,
      totalPartidos: partidos.length,
      partidosProximos: partidos.filter((p) => p.estado === "PROXIMO").length,
      partidosEnCurso: partidos.filter((p) => p.estado === "EN_CURSO").length,
      partidosFinalizados: partidos.filter((p) => p.estado === "FINALIZADO")
        .length,
      partidosCancelados: partidos.filter((p) => p.estado === "CANCELADO")
        .length,
      totalUsuarios: usuarios.length,
      arbitros: usuarios.filter((u) => u.rol === "ARBITRO" && u.activo).length,
      usuariosPublicos: usuarios.filter((u) => u.rol === "USUARIO" && u.activo)
        .length,
    };
  }, [disciplinas, equipos, jugadores, partidos, usuarios]);

  const partidosRecientes = useMemo(() => {
    return [...partidos]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 5);
  }, [partidos]);

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

  const StatCard = ({ titulo, valor, descripcion }) => (
    <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
      <p className="text-sm text-[#6B6F76]">{titulo}</p>
      <h3 className="mt-3 text-4xl font-bold text-[#2B2D31]">
        {cargando ? "..." : valor}
      </h3>
      {descripcion && (
        <p className="mt-2 text-xs text-[#6B6F76]">{descripcion}</p>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
          Panel administrativo
        </p>

        <h2 className="mt-2 text-3xl font-bold">Dashboard</h2>

        <p className="mt-2 text-[#6B6F76]">
          Bienvenido, {user?.nombre}. Desde aquí podrás administrar el torneo.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Disciplinas"
          valor={resumen.disciplinasActivas}
          descripcion="Disciplinas activas"
        />

        <StatCard
          titulo="Equipos"
          valor={resumen.equiposActivos}
          descripcion="Equipos activos"
        />

        <StatCard
          titulo="Jugadores"
          valor={resumen.jugadoresActivos}
          descripcion="Jugadores activos"
        />

        <StatCard
          titulo="Partidos"
          valor={resumen.totalPartidos}
          descripcion="Partidos registrados"
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Próximos"
          valor={resumen.partidosProximos}
          descripcion="Partidos programados"
        />

        <StatCard
          titulo="En curso"
          valor={resumen.partidosEnCurso}
          descripcion="Partidos activos"
        />

        <StatCard
          titulo="Finalizados"
          valor={resumen.partidosFinalizados}
          descripcion="Resultados guardados"
        />

        <StatCard
          titulo="Árbitros"
          valor={resumen.arbitros}
          descripcion="Árbitros activos"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Partidos recientes</h3>
              <p className="mt-1 text-sm text-[#6B6F76]">
                Próximos o últimos partidos registrados.
              </p>
            </div>

            <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
              {partidos.length} partidos
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando partidos...</p>
          ) : partidosRecientes.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              Todavía no hay partidos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {partidosRecientes.map((partido) => (
                <article
                  key={partido.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                      {partido.disciplina?.nombre || "Disciplina"}
                    </p>

                    <h4 className="mt-1 font-semibold text-[#2B2D31]">
                      {partido.equipoLocal?.nombre} vs{" "}
                      {partido.equipoVisitante?.nombre}
                    </h4>

                    <p className="mt-1 text-sm text-[#6B6F76]">
                      {formatearFecha(partido.fecha)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="rounded-xl bg-white px-4 py-2 text-sm font-bold">
                      {partido.marcadorLocal} - {partido.marcadorVisitante}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        estadoClase[partido.estado] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {partido.estado}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Resumen general</h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E7EA] pb-3">
              <span className="text-sm text-[#6B6F76]">Usuarios totales</span>
              <span className="font-bold">{resumen.totalUsuarios}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#E6E7EA] pb-3">
              <span className="text-sm text-[#6B6F76]">Usuarios públicos</span>
              <span className="font-bold">{resumen.usuariosPublicos}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#E6E7EA] pb-3">
              <span className="text-sm text-[#6B6F76]">
                Partidos cancelados
              </span>
              <span className="font-bold">{resumen.partidosCancelados}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6F76]">Estado del sistema</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Activo
              </span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
