const prisma = require("../config/db");

const includeMatchData = {
  disciplina: true,
  equipoLocal: true,
  equipoVisitante: true,
  arbitro: {
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
    },
  },
  eventos: true,
};

const getMatches = async (req, res) => {
  try {
    const partidos = await prisma.match.findMany({
      include: includeMatchData,
      orderBy: {
        fecha: "asc",
      },
    });

    return res.json(partidos);
  } catch (error) {
    console.error("Error al obtener partidos:", error);
    return res.status(500).json({
      message: "Error al obtener partidos.",
    });
  }
};

const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await prisma.match.findUnique({
      where: {
        id: Number(id),
      },
      include: includeMatchData,
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    return res.json(partido);
  } catch (error) {
    console.error("Error al obtener partido:", error);
    return res.status(500).json({
      message: "Error al obtener partido.",
    });
  }
};

const getUpcomingMatches = async (req, res) => {
  try {
    const partidos = await prisma.match.findMany({
      where: {
        estado: "PROXIMO",
      },
      include: includeMatchData,
      orderBy: {
        fecha: "asc",
      },
    });

    return res.json(partidos);
  } catch (error) {
    console.error("Error al obtener próximos partidos:", error);
    return res.status(500).json({
      message: "Error al obtener próximos partidos.",
    });
  }
};

const getLiveMatches = async (req, res) => {
  try {
    const partidos = await prisma.match.findMany({
      where: {
        estado: "EN_CURSO",
      },
      include: includeMatchData,
      orderBy: {
        fecha: "asc",
      },
    });

    return res.json(partidos);
  } catch (error) {
    console.error("Error al obtener partidos en curso:", error);
    return res.status(500).json({
      message: "Error al obtener partidos en curso.",
    });
  }
};

const getFinishedMatches = async (req, res) => {
  try {
    const partidos = await prisma.match.findMany({
      where: {
        estado: "FINALIZADO",
      },
      include: includeMatchData,
      orderBy: {
        fecha: "desc",
      },
    });

    return res.json(partidos);
  } catch (error) {
    console.error("Error al obtener partidos finalizados:", error);
    return res.status(500).json({
      message: "Error al obtener partidos finalizados.",
    });
  }
};

const createMatch = async (req, res) => {
  try {
    const {
      disciplinaId,
      equipoLocalId,
      equipoVisitanteId,
      arbitroId,
      fecha,
      ubicacionNombre,
      ubicacionDireccion,
      ubicacionMapaUrl,
    } = req.body;

    if (!disciplinaId || !equipoLocalId || !equipoVisitanteId || !fecha) {
      return res.status(400).json({
        message:
          "La disciplina, equipo local, equipo visitante y fecha son obligatorios.",
      });
    }

    if (Number(equipoLocalId) === Number(equipoVisitanteId)) {
      return res.status(400).json({
        message: "El equipo local y visitante no pueden ser el mismo.",
      });
    }

    const disciplina = await prisma.discipline.findUnique({
      where: { id: Number(disciplinaId) },
    });

    if (!disciplina || !disciplina.activo) {
      return res.status(404).json({
        message: "La disciplina no existe o está inactiva.",
      });
    }

    const equipoLocal = await prisma.team.findUnique({
      where: { id: Number(equipoLocalId) },
    });

    const equipoVisitante = await prisma.team.findUnique({
      where: { id: Number(equipoVisitanteId) },
    });

    if (!equipoLocal || !equipoLocal.activo) {
      return res.status(404).json({
        message: "El equipo local no existe o está inactivo.",
      });
    }

    if (!equipoVisitante || !equipoVisitante.activo) {
      return res.status(404).json({
        message: "El equipo visitante no existe o está inactivo.",
      });
    }

    if (
      equipoLocal.disciplinaId !== Number(disciplinaId) ||
      equipoVisitante.disciplinaId !== Number(disciplinaId)
    ) {
      return res.status(400).json({
        message: "Ambos equipos deben pertenecer a la disciplina seleccionada.",
      });
    }

    if (arbitroId) {
      const arbitro = await prisma.user.findUnique({
        where: { id: Number(arbitroId) },
      });

      if (!arbitro || !arbitro.activo || arbitro.rol !== "ARBITRO") {
        return res.status(400).json({
          message:
            "El árbitro no existe, está inactivo o no tiene rol ARBITRO.",
        });
      }
    }

    const nuevoPartido = await prisma.match.create({
      data: {
        disciplinaId: Number(disciplinaId),
        equipoLocalId: Number(equipoLocalId),
        equipoVisitanteId: Number(equipoVisitanteId),
        arbitroId: arbitroId ? Number(arbitroId) : null,
        fecha: new Date(fecha),
        ubicacionNombre,
        ubicacionDireccion,
        ubicacionMapaUrl,
      },
      include: includeMatchData,
    });

    return res.status(201).json({
      message: "Partido creado correctamente.",
      partido: nuevoPartido,
    });
  } catch (error) {
    console.error("Error al crear partido:", error);
    return res.status(500).json({
      message: "Error al crear partido.",
    });
  }
};

const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      disciplinaId,
      equipoLocalId,
      equipoVisitanteId,
      arbitroId,
      fecha,
      ubicacionNombre,
      ubicacionDireccion,
      ubicacionMapaUrl,
      estado,
    } = req.body;

    const partidoExiste = await prisma.match.findUnique({
      where: { id: Number(id) },
    });

    if (!partidoExiste) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    const partidoActualizado = await prisma.match.update({
      where: {
        id: Number(id),
      },
      data: {
        disciplinaId: disciplinaId ? Number(disciplinaId) : undefined,
        equipoLocalId: equipoLocalId ? Number(equipoLocalId) : undefined,
        equipoVisitanteId: equipoVisitanteId
          ? Number(equipoVisitanteId)
          : undefined,
        arbitroId: arbitroId !== undefined ? Number(arbitroId) : undefined,
        fecha: fecha ? new Date(fecha) : undefined,
        ubicacionNombre,
        ubicacionDireccion,
        ubicacionMapaUrl,
        estado,
      },
      include: includeMatchData,
    });

    return res.json({
      message: "Partido actualizado correctamente.",
      partido: partidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar partido:", error);
    return res.status(500).json({
      message: "Error al actualizar partido.",
    });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const partidoExiste = await prisma.match.findUnique({
      where: { id: Number(id) },
    });

    if (!partidoExiste) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    const partidoCancelado = await prisma.match.update({
      where: {
        id: Number(id),
      },
      data: {
        estado: "CANCELADO",
      },
      include: includeMatchData,
    });

    return res.json({
      message: "Partido cancelado correctamente.",
      partido: partidoCancelado,
    });
  } catch (error) {
    console.error("Error al cancelar partido:", error);
    return res.status(500).json({
      message: "Error al cancelar partido.",
    });
  }
};

const startMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await prisma.match.findUnique({
      where: { id: Number(id) },
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    if (partido.estado !== "PROXIMO") {
      return res.status(400).json({
        message: "Solo se pueden iniciar partidos en estado PROXIMO.",
      });
    }

    if (req.usuario.rol === "ARBITRO" && partido.arbitroId !== req.usuario.id) {
      return res.status(403).json({
        message: "Solo puedes iniciar partidos asignados a ti.",
      });
    }

    const partidoIniciado = await prisma.match.update({
      where: { id: Number(id) },
      data: {
        estado: "EN_CURSO",
      },
      include: includeMatchData,
    });

    return res.json({
      message: "Partido iniciado correctamente.",
      partido: partidoIniciado,
    });
  } catch (error) {
    console.error("Error al iniciar partido:", error);
    return res.status(500).json({
      message: "Error al iniciar partido.",
    });
  }
};

const finishMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await prisma.match.findUnique({
      where: { id: Number(id) },
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    if (partido.estado !== "EN_CURSO") {
      return res.status(400).json({
        message: "Solo se pueden finalizar partidos en estado EN_CURSO.",
      });
    }

    if (req.usuario.rol === "ARBITRO" && partido.arbitroId !== req.usuario.id) {
      return res.status(403).json({
        message: "Solo puedes finalizar partidos asignados a ti.",
      });
    }

    const partidoFinalizado = await prisma.match.update({
      where: { id: Number(id) },
      data: {
        estado: "FINALIZADO",
      },
      include: includeMatchData,
    });

    return res.json({
      message: "Partido finalizado correctamente.",
      partido: partidoFinalizado,
    });
  } catch (error) {
    console.error("Error al finalizar partido:", error);
    return res.status(500).json({
      message: "Error al finalizar partido.",
    });
  }
};

const cancelMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await prisma.match.findUnique({
      where: { id: Number(id) },
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    const partidoCancelado = await prisma.match.update({
      where: { id: Number(id) },
      data: {
        estado: "CANCELADO",
      },
      include: includeMatchData,
    });

    return res.json({
      message: "Partido cancelado correctamente.",
      partido: partidoCancelado,
    });
  } catch (error) {
    console.error("Error al cancelar partido:", error);
    return res.status(500).json({
      message: "Error al cancelar partido.",
    });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  getUpcomingMatches,
  getLiveMatches,
  getFinishedMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  finishMatch,
  cancelMatch,
};
