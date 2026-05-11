import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getMatchesRequest } from "../../api/matchesApi";

function RefereeDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cerrarSesion = () => {
    localStorage.removeItem("scoretec_token");
    localStorage.removeItem("scoretec_user");
    navigate("/login");
  };

  const cargarPartidos = async () => {
    try {
      setCargando(true);

      const data = await getMatchesRequest();

      const asignados = data.filter(
        (partido) => partido.arbitroId === user?.id,
      );

      setPartidos(asignados);
    } catch (error) {
      setError("No se pudieron cargar tus partidos asignados.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPartidos();
  }, []);

  const resumen = useMemo(() => {
    return {
      proximos: partidos.filter((p) => p.estado === "PROXIMO").length,
      enCurso: partidos.filter((p) => p.estado === "EN_CURSO").length,
      finalizados: partidos.filter((p) => p.estado === "FINALIZADO").length,
    };
  }, [partidos]);

  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700",
    EN_CURSO: "bg-green-50 text-green-700",
    FINALIZADO: "bg-gray-100 text-gray-600",
    CANCELADO: "bg-red-50 text-red-700",
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <header className="border-b border-[#E6E7EA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              Score<span className="text-[#8C1D2C]">Tec</span>
            </h1>
            <p className="mt-1 text-sm text-[#6B6F76]">Panel de árbitro</p>
          </div>

          <button
            onClick={cerrarSesion}
            className="rounded-xl bg-[#8C1D2C] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Salir
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#8C1D2C]">
            Partidos asignados
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Bienvenido, {user?.nombre}
          </h2>

          <p className="mt-3 max-w-2xl text-[#6B6F76]">
            Desde aquí puedes iniciar partidos, registrar eventos y finalizar
            encuentros que tengas asignados.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6B6F76]">Próximos</p>
            <h3 className="mt-2 text-3xl font-bold">{resumen.proximos}</h3>
          </div>

          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6B6F76]">En curso</p>
            <h3 className="mt-2 text-3xl font-bold">{resumen.enCurso}</h3>
          </div>

          <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6B6F76]">Finalizados</p>
            <h3 className="mt-2 text-3xl font-bold">{resumen.finalizados}</h3>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Mis partidos</h3>

            <span className="rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
              {partidos.length} asignados
            </span>
          </div>

          {cargando ? (
            <p className="text-sm text-[#6B6F76]">Cargando partidos...</p>
          ) : partidos.length === 0 ? (
            <p className="text-sm text-[#6B6F76]">
              No tienes partidos asignados todavía.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {partidos.map((partido) => (
                <article
                  key={partido.id}
                  className="rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                        {partido.disciplina?.nombre}
                      </p>

                      <h4 className="mt-2 text-lg font-bold">
                        {partido.equipoLocal?.nombre} vs{" "}
                        {partido.equipoVisitante?.nombre}
                      </h4>

                      <p className="mt-1 text-sm text-[#6B6F76]">
                        {formatearFecha(partido.fecha)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        estadoClase[partido.estado] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {partido.estado}
                    </span>
                  </div>

                  <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-center">
                    <p className="text-2xl font-bold">
                      {partido.marcadorLocal}
                      <span className="mx-3 text-[#CDAA43]">-</span>
                      {partido.marcadorVisitante}
                    </p>
                  </div>

                  <Link
                    to={`/referee/matches/${partido.id}`}
                    className="inline-block rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Gestionar partido
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default RefereeDashboard;
