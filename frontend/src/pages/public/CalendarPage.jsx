import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PublicNavbar from "../../components/layout/PublicNavBar";
import { getMatchesRequest } from "../../api/matchesApi";
import { getDisciplinesRequest } from "../../api/disciplinesApi";

function CalendarPage() {
  const [partidos, setPartidos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const [vista, setVista] = useState("HOY");

  const [filtros, setFiltros] = useState({
    busqueda: "",
    disciplinaId: "TODAS",
  });

  const cargarDatos = async (silencioso = false) => {
    try {
      if (silencioso) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const [partidosData, disciplinasData] = await Promise.all([
        getMatchesRequest(),
        getDisciplinesRequest(),
      ]);

      setPartidos(partidosData);
      setDisciplinas(disciplinasData.filter((disciplina) => disciplina.activo));
    } catch (error) {
      setError("No se pudo cargar el calendario de partidos.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos(true);
    }, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const normalizarFecha = (fecha) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setHours(0, 0, 0, 0);
    return nuevaFecha;
  };

  const esMismaFecha = (fechaA, fechaB) => {
    return (
      normalizarFecha(fechaA).getTime() === normalizarFecha(fechaB).getTime()
    );
  };

  const esEstaSemana = (fecha) => {
    const hoy = normalizarFecha(new Date());
    const fechaPartido = normalizarFecha(fecha);

    const diaSemana = hoy.getDay();
    const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() + diferenciaLunes);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return fechaPartido >= inicioSemana && fechaPartido <= finSemana;
  };

  const partidosFiltrados = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase();

    const hoy = new Date();

    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    return partidos
      .filter((partido) => {
        const local = partido.equipoLocal?.nombre?.toLowerCase() || "";
        const visitante = partido.equipoVisitante?.nombre?.toLowerCase() || "";
        const disciplina = partido.disciplina?.nombre?.toLowerCase() || "";
        const ubicacion = partido.ubicacionNombre?.toLowerCase() || "";

        const coincideBusqueda =
          !texto ||
          local.includes(texto) ||
          visitante.includes(texto) ||
          disciplina.includes(texto) ||
          ubicacion.includes(texto);

        const coincideDisciplina =
          filtros.disciplinaId === "TODAS" ||
          partido.disciplinaId === Number(filtros.disciplinaId);

        if (!coincideBusqueda || !coincideDisciplina) return false;

        if (vista === "HOY") {
          return partido.fecha && esMismaFecha(partido.fecha, hoy);
        }

        if (vista === "MANANA") {
          return partido.fecha && esMismaFecha(partido.fecha, manana);
        }

        if (vista === "SEMANA") {
          return partido.fecha && esEstaSemana(partido.fecha);
        }

        if (vista === "FINALIZADOS") {
          return partido.estado === "FINALIZADO";
        }

        return true;
      })
      .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0));
  }, [partidos, filtros, vista]);

  const partidosAgrupados = useMemo(() => {
    const grupos = {};

    partidosFiltrados.forEach((partido) => {
      const clave = partido.fecha
        ? new Date(partido.fecha).toLocaleDateString("es-MX", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })
        : "Sin fecha";

      if (!grupos[clave]) {
        grupos[clave] = [];
      }

      grupos[clave].push(partido);
    });

    return grupos;
  }, [partidosFiltrados]);

  const resumen = useMemo(() => {
    const hoy = new Date();

    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    return {
      hoy: partidos.filter(
        (partido) => partido.fecha && esMismaFecha(partido.fecha, hoy),
      ).length,
      manana: partidos.filter(
        (partido) => partido.fecha && esMismaFecha(partido.fecha, manana),
      ).length,
      semana: partidos.filter(
        (partido) => partido.fecha && esEstaSemana(partido.fecha),
      ).length,
      finalizados: partidos.filter((partido) => partido.estado === "FINALIZADO")
        .length,
    };
  }, [partidos]);

  const handleFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      disciplinaId: "TODAS",
    });
  };

  const tabClass = (value) =>
    `shrink-0 border-b-2 px-1 pb-2 text-sm font-semibold transition ${
      vista === value
        ? "border-[#8C1D2C] text-[#8C1D2C]"
        : "border-transparent text-[#6B6F76] hover:text-[#8C1D2C]"
    }`;

  const estadoClase = {
    PROXIMO: "bg-blue-50 text-blue-700",
    EN_CURSO: "bg-green-50 text-green-700",
    FINALIZADO: "bg-[#F1F2F4] text-[#4B4F56]",
    CANCELADO: "bg-red-50 text-red-700",
  };

  const estadoTexto = {
    PROXIMO: "Próximo",
    EN_CURSO: "En vivo",
    FINALIZADO: "Final",
    CANCELADO: "Cancelado",
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "--:--";

    return new Date(fecha).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearMarcador = (partido) => {
    const marcadorLocal = partido.marcadorLocal ?? 0;
    const marcadorVisitante = partido.marcadorVisitante ?? 0;

    return `${marcadorLocal} - ${marcadorVisitante}`;
  };

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8C1D2C]">
                Agenda deportiva
              </p>

              <h1 className="text-2xl font-bold leading-tight text-[#2B2D31]">
                Calendario
              </h1>
            </div>

            <button
              type="button"
              onClick={() => cargarDatos(true)}
              disabled={actualizando || cargando}
              className="rounded-xl border border-[#E6E7EA] bg-white px-3 py-2 text-xs font-semibold text-[#4B4F56] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C] disabled:opacity-60"
            >
              {actualizando ? "Actualizando" : "Actualizar"}
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto border-b border-[#E6E7EA]">
            <button
              type="button"
              onClick={() => setVista("HOY")}
              className={tabClass("HOY")}
            >
              Hoy
              <span className="ml-1 text-xs text-[#9CA3AF]">{resumen.hoy}</span>
            </button>

            <button
              type="button"
              onClick={() => setVista("MANANA")}
              className={tabClass("MANANA")}
            >
              Mañana
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.manana}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVista("SEMANA")}
              className={tabClass("SEMANA")}
            >
              Esta semana
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.semana}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVista("FINALIZADOS")}
              className={tabClass("FINALIZADOS")}
            >
              Finalizados
              <span className="ml-1 text-xs text-[#9CA3AF]">
                {resumen.finalizados}
              </span>
            </button>
          </div>
        </header>

        <section className="mb-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleFiltro}
            placeholder="Buscar equipo..."
            className="h-11 rounded-xl border border-[#E6E7EA] bg-white px-3 text-sm outline-none transition focus:border-[#8C1D2C]"
          />

          <select
            name="disciplinaId"
            value={filtros.disciplinaId}
            onChange={handleFiltro}
            className="h-11 max-w-[150px] rounded-xl border border-[#E6E7EA] bg-white px-2 text-sm outline-none transition focus:border-[#8C1D2C]"
          >
            <option value="TODAS">Todas</option>

            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.nombre}
              </option>
            ))}
          </select>
        </section>

        {error && (
          <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#2B2D31]">
              {partidosFiltrados.length} partidos
            </h2>

            {(filtros.busqueda || filtros.disciplinaId !== "TODAS") && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-xs font-semibold text-[#8C1D2C]"
              >
                Limpiar
              </button>
            )}
          </div>

          {cargando ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[78px] animate-pulse rounded-2xl bg-[#F1F2F4]"
                />
              ))}
            </div>
          ) : partidosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-[#E6E7EA] bg-white p-6 text-center">
              <h3 className="text-base font-semibold text-[#2B2D31]">
                No hay partidos
              </h3>

              <p className="mt-1 text-sm text-[#6B6F76]">
                Cambia la vista, los filtros o revisa más tarde.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#741826]"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(partidosAgrupados).map(
                ([fecha, partidosDelDia]) => (
                  <section
                    key={fecha}
                    className="overflow-hidden rounded-2xl border border-[#E6E7EA] bg-white shadow-sm"
                  >
                    <div className="border-b border-[#E6E7EA] bg-[#FAFAFA] px-4 py-3">
                      <h3 className="text-sm font-semibold capitalize text-[#2B2D31]">
                        {fecha}
                      </h3>
                    </div>

                    <div className="divide-y divide-[#F0F0F1]">
                      {partidosDelDia.map((partido) => (
                        <Link
                          key={partido.id}
                          to={`/matches/${partido.id}`}
                          className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-[#FAFAFA]"
                        >
                          <div className="text-center">
                            <p className="text-sm font-semibold text-[#2B2D31]">
                              {formatearHora(partido.fecha)}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#6B6F76]">
                              hora
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#2B2D31]">
                              {partido.equipoLocal?.nombre || "Local"} vs{" "}
                              {partido.equipoVisitante?.nombre || "Visitante"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
                              {partido.disciplina?.nombre || "Disciplina"} ·{" "}
                              {partido.ubicacionNombre || "Sin sede"}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                estadoClase[partido.estado] ||
                                "bg-[#F1F2F4] text-[#4B4F56]"
                              }`}
                            >
                              {estadoTexto[partido.estado] ||
                                partido.estado ||
                                "Estado"}
                            </span>

                            {(partido.estado === "EN_CURSO" ||
                              partido.estado === "FINALIZADO") && (
                              <p className="text-sm font-bold text-[#2B2D31]">
                                {formatearMarcador(partido)}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default CalendarPage;
