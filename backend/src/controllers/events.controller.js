const prisma = require("../config/db");

const eventosQueSuman = ["GOL", "PUNTO", "ENCESTA"];

const includeEventData = {
  partido: true,
  equipo: true,
  jugador: true,
};

const recalcularMarcador = async (partidoId) => {
  const partido = await prisma.match.findUnique({
    where: {
      id: Number(partidoId),
    },
  });

  if (!partido) {
    return;
  }

  const eventos = await prisma.event.findMany({
    where: {
      partidoId: Number(partidoId),
      tipo: {
        in: eventosQueSuman,
      },
    },
  });

  let marcadorLocal = 0;
  let marcadorVisitante = 0;

  eventos.forEach((evento) => {
    if (evento.equipoId === partido.equipoLocalId) {
      marcadorLocal += 1;
    }

    if (evento.equipoId === partido.equipoVisitanteId) {
      marcadorVisitante += 1;
    }
  });

  await prisma.match.update({
    where: {
      id: Number(partidoId),
    },
    data: {
      marcadorLocal,
      marcadorVisitante,
    },
  });
};

const getEventsByMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await prisma.match.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    const eventos = await prisma.event.findMany({
      where: {
        partidoId: Number(id),
      },
      include: {
        equipo: true,
        jugador: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(eventos);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return res.status(500).json({
      message: "Error al obtener eventos.",
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipoId, jugadorId, tipo, minuto, descripcion } = req.body;

    if (!equipoId || !tipo) {
      return res.status(400).json({
        message: "El equipo y el tipo de evento son obligatorios.",
      });
    }

    const partido = await prisma.match.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    if (partido.estado !== "EN_CURSO") {
      return res.status(400).json({
        message: "Solo se pueden registrar eventos en partidos EN_CURSO.",
      });
    }

    if (req.usuario.rol === "ARBITRO" && partido.arbitroId !== req.usuario.id) {
      return res.status(403).json({
        message: "Solo puedes registrar eventos en partidos asignados a ti.",
      });
    }

    const equipo = await prisma.team.findUnique({
      where: {
        id: Number(equipoId),
      },
    });

    if (!equipo) {
      return res.status(404).json({
        message: "Equipo no encontrado.",
      });
    }

    if (
      Number(equipoId) !== partido.equipoLocalId &&
      Number(equipoId) !== partido.equipoVisitanteId
    ) {
      return res.status(400).json({
        message: "El equipo no pertenece a este partido.",
      });
    }

    if (jugadorId) {
      const jugador = await prisma.player.findUnique({
        where: {
          id: Number(jugadorId),
        },
      });

      if (!jugador) {
        return res.status(404).json({
          message: "Jugador no encontrado.",
        });
      }

      if (jugador.equipoId !== Number(equipoId)) {
        return res.status(400).json({
          message: "El jugador no pertenece al equipo seleccionado.",
        });
      }
    }

    const nuevoEvento = await prisma.event.create({
      data: {
        partidoId: Number(id),
        equipoId: Number(equipoId),
        jugadorId: jugadorId ? Number(jugadorId) : null,
        tipo,
        minuto: minuto !== undefined ? Number(minuto) : null,
        descripcion,
      },
      include: includeEventData,
    });

    await recalcularMarcador(id);

    const partidoActualizado = await prisma.match.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        disciplina: true,
        equipoLocal: true,
        equipoVisitante: true,
        eventos: true,
      },
    });

    return res.status(201).json({
      message: "Evento registrado correctamente.",
      evento: nuevoEvento,
      partido: partidoActualizado,
    });
  } catch (error) {
    console.error("Error al registrar evento:", error);
    return res.status(500).json({
      message: "Error al registrar evento.",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipoId, jugadorId, tipo, minuto, descripcion } = req.body;

    const eventoExiste = await prisma.event.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        partido: true,
      },
    });

    if (!eventoExiste) {
      return res.status(404).json({
        message: "Evento no encontrado.",
      });
    }

    if (eventoExiste.partido.estado !== "EN_CURSO") {
      return res.status(400).json({
        message: "Solo se pueden editar eventos de partidos EN_CURSO.",
      });
    }

    if (
      req.usuario.rol === "ARBITRO" &&
      eventoExiste.partido.arbitroId !== req.usuario.id
    ) {
      return res.status(403).json({
        message: "Solo puedes editar eventos de partidos asignados a ti.",
      });
    }

    const eventoActualizado = await prisma.event.update({
      where: {
        id: Number(id),
      },
      data: {
        equipoId: equipoId ? Number(equipoId) : undefined,
        jugadorId: jugadorId !== undefined ? Number(jugadorId) : undefined,
        tipo,
        minuto: minuto !== undefined ? Number(minuto) : undefined,
        descripcion,
      },
      include: includeEventData,
    });

    await recalcularMarcador(eventoExiste.partidoId);

    const partidoActualizado = await prisma.match.findUnique({
      where: {
        id: eventoExiste.partidoId,
      },
      include: {
        disciplina: true,
        equipoLocal: true,
        equipoVisitante: true,
        eventos: true,
      },
    });

    return res.json({
      message: "Evento actualizado correctamente.",
      evento: eventoActualizado,
      partido: partidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return res.status(500).json({
      message: "Error al actualizar evento.",
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const eventoExiste = await prisma.event.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        partido: true,
      },
    });

    if (!eventoExiste) {
      return res.status(404).json({
        message: "Evento no encontrado.",
      });
    }

    if (eventoExiste.partido.estado !== "EN_CURSO") {
      return res.status(400).json({
        message: "Solo se pueden eliminar eventos de partidos EN_CURSO.",
      });
    }

    if (
      req.usuario.rol === "ARBITRO" &&
      eventoExiste.partido.arbitroId !== req.usuario.id
    ) {
      return res.status(403).json({
        message: "Solo puedes eliminar eventos de partidos asignados a ti.",
      });
    }

    await prisma.event.delete({
      where: {
        id: Number(id),
      },
    });

    await recalcularMarcador(eventoExiste.partidoId);

    const partidoActualizado = await prisma.match.findUnique({
      where: {
        id: eventoExiste.partidoId,
      },
      include: {
        disciplina: true,
        equipoLocal: true,
        equipoVisitante: true,
        eventos: true,
      },
    });

    return res.json({
      message: "Evento eliminado correctamente.",
      partido: partidoActualizado,
    });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return res.status(500).json({
      message: "Error al eliminar evento.",
    });
  }
};

module.exports = {
  getEventsByMatch,
  createEvent,
  updateEvent,
  deleteEvent,
};
