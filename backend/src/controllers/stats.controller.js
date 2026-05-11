const prisma = require("../config/db");

const eventosQueSuman = ["GOL", "PUNTO", "ENCESTA"];

const getTeamStats = async (req, res) => {
  try {
    const equipos = await prisma.team.findMany({
      include: {
        disciplina: true,
        partidosLocal: true,
        partidosVisitante: true,
        eventos: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    const estadisticas = equipos.map((equipo) => {
      const partidos = [
        ...equipo.partidosLocal,
        ...equipo.partidosVisitante,
      ].filter((partido) => partido.estado === "FINALIZADO");

      let ganados = 0;
      let perdidos = 0;
      let empatados = 0;

      partidos.forEach((partido) => {
        const esLocal = partido.equipoLocalId === equipo.id;

        const marcadorEquipo = esLocal
          ? partido.marcadorLocal
          : partido.marcadorVisitante;

        const marcadorRival = esLocal
          ? partido.marcadorVisitante
          : partido.marcadorLocal;

        if (marcadorEquipo > marcadorRival) ganados++;
        else if (marcadorEquipo < marcadorRival) perdidos++;
        else empatados++;
      });

      const puntosFavor = equipo.eventos.filter((evento) =>
        eventosQueSuman.includes(evento.tipo),
      ).length;

      const faltas = equipo.eventos.filter(
        (evento) => evento.tipo === "FALTA",
      ).length;

      const tarjetasAmarillas = equipo.eventos.filter(
        (evento) => evento.tipo === "TARJETA_AMARILLA",
      ).length;

      const tarjetasRojas = equipo.eventos.filter(
        (evento) => evento.tipo === "TARJETA_ROJA",
      ).length;

      return {
        equipoId: equipo.id,
        equipo: equipo.nombre,
        disciplina: equipo.disciplina.nombre,
        partidosJugados: partidos.length,
        ganados,
        perdidos,
        empatados,
        puntosFavor,
        faltas,
        tarjetasAmarillas,
        tarjetasRojas,
      };
    });

    return res.json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas por equipo:", error);
    return res.status(500).json({
      message: "Error al obtener estadísticas por equipo.",
    });
  }
};

const getPlayerStats = async (req, res) => {
  try {
    const jugadores = await prisma.player.findMany({
      include: {
        equipo: {
          include: {
            disciplina: true,
          },
        },
        eventos: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    const estadisticas = jugadores.map((jugador) => {
      const puntos = jugador.eventos.filter((evento) =>
        eventosQueSuman.includes(evento.tipo),
      ).length;

      const faltas = jugador.eventos.filter(
        (evento) => evento.tipo === "FALTA",
      ).length;

      const tarjetasAmarillas = jugador.eventos.filter(
        (evento) => evento.tipo === "TARJETA_AMARILLA",
      ).length;

      const tarjetasRojas = jugador.eventos.filter(
        (evento) => evento.tipo === "TARJETA_ROJA",
      ).length;

      const asistencias = jugador.eventos.filter(
        (evento) => evento.tipo === "ASISTENCIA",
      ).length;

      return {
        jugadorId: jugador.id,
        jugador: jugador.nombre,
        numero: jugador.numero,
        posicion: jugador.posicion,
        equipo: jugador.equipo.nombre,
        disciplina: jugador.equipo.disciplina.nombre,
        puntos,
        faltas,
        tarjetasAmarillas,
        tarjetasRojas,
        asistencias,
        totalEventos: jugador.eventos.length,
      };
    });

    return res.json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas por jugador:", error);
    return res.status(500).json({
      message: "Error al obtener estadísticas por jugador.",
    });
  }
};

const getMatchStats = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await prisma.match.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        disciplina: true,
        equipoLocal: true,
        equipoVisitante: true,
        eventos: {
          include: {
            equipo: true,
            jugador: true,
          },
        },
      },
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    const eventosLocal = partido.eventos.filter(
      (evento) => evento.equipoId === partido.equipoLocalId,
    );

    const eventosVisitante = partido.eventos.filter(
      (evento) => evento.equipoId === partido.equipoVisitanteId,
    );

    const contarTipo = (eventos, tipo) =>
      eventos.filter((evento) => evento.tipo === tipo).length;

    return res.json({
      partidoId: partido.id,
      disciplina: partido.disciplina.nombre,
      estado: partido.estado,
      equipoLocal: partido.equipoLocal.nombre,
      equipoVisitante: partido.equipoVisitante.nombre,
      marcadorLocal: partido.marcadorLocal,
      marcadorVisitante: partido.marcadorVisitante,
      estadisticasLocal: {
        eventos: eventosLocal.length,
        puntos: eventosLocal.filter((evento) =>
          eventosQueSuman.includes(evento.tipo),
        ).length,
        faltas: contarTipo(eventosLocal, "FALTA"),
        tarjetasAmarillas: contarTipo(eventosLocal, "TARJETA_AMARILLA"),
        tarjetasRojas: contarTipo(eventosLocal, "TARJETA_ROJA"),
        asistencias: contarTipo(eventosLocal, "ASISTENCIA"),
      },
      estadisticasVisitante: {
        eventos: eventosVisitante.length,
        puntos: eventosVisitante.filter((evento) =>
          eventosQueSuman.includes(evento.tipo),
        ).length,
        faltas: contarTipo(eventosVisitante, "FALTA"),
        tarjetasAmarillas: contarTipo(eventosVisitante, "TARJETA_AMARILLA"),
        tarjetasRojas: contarTipo(eventosVisitante, "TARJETA_ROJA"),
        asistencias: contarTipo(eventosVisitante, "ASISTENCIA"),
      },
      eventos: partido.eventos,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del partido:", error);
    return res.status(500).json({
      message: "Error al obtener estadísticas del partido.",
    });
  }
};

const getDisciplineStats = async (req, res) => {
  try {
    const { id } = req.params;

    const disciplina = await prisma.discipline.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        equipos: true,
        partidos: true,
      },
    });

    if (!disciplina) {
      return res.status(404).json({
        message: "Disciplina no encontrada.",
      });
    }

    const partidosFinalizados = disciplina.partidos.filter(
      (partido) => partido.estado === "FINALIZADO",
    );

    const partidosEnCurso = disciplina.partidos.filter(
      (partido) => partido.estado === "EN_CURSO",
    );

    const partidosProximos = disciplina.partidos.filter(
      (partido) => partido.estado === "PROXIMO",
    );

    return res.json({
      disciplinaId: disciplina.id,
      disciplina: disciplina.nombre,
      totalEquipos: disciplina.equipos.length,
      totalPartidos: disciplina.partidos.length,
      partidosProximos: partidosProximos.length,
      partidosEnCurso: partidosEnCurso.length,
      partidosFinalizados: partidosFinalizados.length,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas por disciplina:", error);
    return res.status(500).json({
      message: "Error al obtener estadísticas por disciplina.",
    });
  }
};

module.exports = {
  getTeamStats,
  getPlayerStats,
  getMatchStats,
  getDisciplineStats,
};
