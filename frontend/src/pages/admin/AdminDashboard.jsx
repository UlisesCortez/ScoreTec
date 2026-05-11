import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

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
      setActualizando(false);
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
      administradores: usuarios.filter((u) => u.rol === "ADMIN" && u.activo)
        .length,
      usuariosPublicos: usuarios.filter((u) => u.rol === "USUARIO" && u.activo)
        .length,
    };
  }, [disciplinas, equipos, jugadores, partidos, usuarios]);

  const partidosImportantes = useMemo(() => {
    const prioridad = {
      EN_CURSO: 1,
      PROXIMO: 2,
      FINALIZADO: 3,
      CANCELADO: 4,
    };

    return [...partidos]
      .sort((a, b) => {
        const prioridadA = prioridad[a.estado] || 99;
        const prioridadB = prioridad[b.estado] || 99;

        if (prioridadA !== prioridadB) {
          return prioridadA - prioridadB;
        }

        return new Date(a.fecha || 0) - new Date(b.fecha || 0);
      })
      .slice(0, 5);
  }, [partidos]);

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

  const StatCard = ({ titulo, valor, descripcion, tono = "normal" }) => {
    const tonoClase = {
      normal: "text-[#2B2D31]",
      vino: "text-[#8C1D2C]",
      verde: "text-green-700",
      azul: "text-blue-700",
      gris: "text-[#6B6F76]",
    };

    return (
      <article className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[#6B6F76]">
          {titulo}
        </p>

        <h3
          className={`mt-2 text-3xl font-black sm:text-4xl ${
            tonoClase[tono] || tonoClase.normal
          }`}
        >
          {cargando ? "..." : valor}
        </h3>

        {descripcion && (
          <p className="mt-2 text-xs font-semibold leading-5 text-[#6B6F76]">
            {descripcion}
          </p>
        )}
      </article>
    );
  };

  const AccesoRapido = ({ to, titulo, descripcion }) => (
    <Link
      to={to}
      className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm transition hover:border-[#8C1D2C] hover:shadow-md"
    >
      <p className="text-sm font-black text-[#2B2D31]">{titulo}</p>

      <p className="mt-1 text-xs font-medium leading-5 text-[#6B6F76]">
        {descripcion}
      </p>
    </Link>
  );

  return (
    <AdminLayout>
      <section className="mb-5 rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
              Panel administrativo
            </p>

            <h2 className="mt-2 text-3xl font-black leading-tight text-[#2B2D31] sm:text-5xl">
              Dashboard
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#6B6F76] sm:text-base">
              Bienvenida, {user?.nombre || "administradora"}. Desde aquí puedes
              revisar el estado general del torneo y entrar rápido a las
              secciones principales.
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

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          titulo="Disciplinas"
          valor={resumen.disciplinasActivas}
          descripcion="Disciplinas activas"
          tono="vino"
        />

        <StatCard
          titulo="Equipos"
          valor={resumen.equiposActivos}
          descripcion="Equipos activos"
          tono="normal"
        />

        <StatCard
          titulo="Jugadores"
          valor={resumen.jugadoresActivos}
          descripcion="Jugadores activos"
          tono="normal"
        />

        <StatCard
          titulo="Partidos"
          valor={resumen.totalPartidos}
          descripcion="Partidos registrados"
          tono="vino"
        />
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          titulo="Próximos"
          valor={resumen.partidosProximos}
          descripcion="Partidos programados"
          tono="azul"
        />

        <StatCard
          titulo="En curso"
          valor={resumen.partidosEnCurso}
          descripcion="Partidos activos"
          tono="verde"
        />

        <StatCard
          titulo="Finalizados"
          valor={resumen.partidosFinalizados}
          descripcion="Resultados guardados"
          tono="gris"
        />

        <StatCard
          titulo="Árbitros"
          valor={resumen.arbitros}
          descripcion="Árbitros activos"
          tono="vino"
        />
      </section>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AccesoRapido
          to="/admin/matches"
          titulo="Gestionar partidos"
          descripcion="Crear, editar, iniciar o revisar partidos registrados."
        />

        <AccesoRapido
          to="/admin/teams"
          titulo="Gestionar equipos"
          descripcion="Administrar equipos participantes y su estado."
        />

        <AccesoRapido
          to="/admin/players"
          titulo="Gestionar jugadores"
          descripcion="Registrar jugadores y asignarlos a sus equipos."
        />

        <AccesoRapido
          to="/admin/users"
          titulo="Gestionar usuarios"
          descripcion="Administrar cuentas de árbitros, admins y usuarios."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2B2D31]">
                Partidos importantes
              </h3>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Primero aparecen los partidos en curso y próximos.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black text-[#8C1D2C]">
              {partidos.length} partidos
            </span>
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
          ) : partidosImportantes.length === 0 ? (
            <div className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-6">
              <p className="text-sm font-bold text-[#2B2D31]">
                Todavía no hay partidos registrados.
              </p>

              <p className="mt-2 text-sm leading-6 text-[#6B6F76]">
                Crea un partido para que aparezca en esta sección.
              </p>

              <Link
                to="/admin/matches"
                className="mt-4 inline-block rounded-2xl bg-[#8C1D2C] px-4 py-3 text-sm font-black text-white transition hover:bg-[#741826]"
              >
                Crear partido
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {partidosImportantes.map((partido) => {
                const marcadorLocal = partido.marcadorLocal ?? 0;
                const marcadorVisitante = partido.marcadorVisitante ?? 0;

                return (
                  <article
                    key={partido.id}
                    className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4 transition hover:border-[#8C1D2C] hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                            {partido.disciplina?.nombre || "Disciplina"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              estadoClase[partido.estado] ||
                              "border-gray-200 bg-gray-100 text-gray-600"
                            }`}
                          >
                            {estadoTexto[partido.estado] || partido.estado}
                          </span>
                        </div>

                        <h4 className="line-clamp-2 text-base font-black text-[#2B2D31]">
                          {partido.equipoLocal?.nombre || "Local"} vs{" "}
                          {partido.equipoVisitante?.nombre || "Visitante"}
                        </h4>

                        <p className="mt-1 text-sm font-medium text-[#6B6F76]">
                          {formatearFecha(partido.fecha)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 lg:justify-end">
                        <p className="rounded-2xl bg-white px-4 py-3 text-xl font-black text-[#2B2D31] shadow-sm">
                          {marcadorLocal}
                          <span className="mx-2 text-[#CDAA43]">-</span>
                          {marcadorVisitante}
                        </p>

                        <Link
                          to="/admin/matches"
                          className="rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-sm font-black text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
                        >
                          Abrir
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-[#2B2D31]">
              Resumen general
            </h3>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                <span className="text-sm font-medium text-[#6B6F76]">
                  Usuarios totales
                </span>

                <span className="font-black text-[#2B2D31]">
                  {resumen.totalUsuarios}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                <span className="text-sm font-medium text-[#6B6F76]">
                  Administradores
                </span>

                <span className="font-black text-[#2B2D31]">
                  {resumen.administradores}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                <span className="text-sm font-medium text-[#6B6F76]">
                  Usuarios públicos
                </span>

                <span className="font-black text-[#2B2D31]">
                  {resumen.usuariosPublicos}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                <span className="text-sm font-medium text-[#6B6F76]">
                  Cancelados
                </span>

                <span className="font-black text-[#2B2D31]">
                  {resumen.partidosCancelados}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#E6E7EA] bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-[#2B2D31]">
              Estado del sistema
            </h3>

            <div className="mt-5 rounded-3xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm font-black text-green-700">Activo</p>

              <p className="mt-1 text-sm leading-6 text-green-700/80">
                Las consultas principales del dashboard cargaron correctamente.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
