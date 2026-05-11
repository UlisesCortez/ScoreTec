const prisma = require("../config/db");

const getPlayers = async (req, res) => {
  try {
    const jugadores = await prisma.player.findMany({
      include: {
        equipo: {
          include: {
            disciplina: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return res.json(jugadores);
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return res.status(500).json({
      message: "Error al obtener jugadores.",
    });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await prisma.player.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        equipo: {
          include: {
            disciplina: true,
          },
        },
      },
    });

    if (!jugador) {
      return res.status(404).json({
        message: "Jugador no encontrado.",
      });
    }

    return res.json(jugador);
  } catch (error) {
    console.error("Error al obtener jugador:", error);
    return res.status(500).json({
      message: "Error al obtener jugador.",
    });
  }
};

const createPlayer = async (req, res) => {
  try {
    const { nombre, numero, posicion, fotoUrl, equipoId } = req.body;

    if (!nombre || !equipoId) {
      return res.status(400).json({
        message: "El nombre y el equipo son obligatorios.",
      });
    }

    const equipo = await prisma.team.findUnique({
      where: {
        id: Number(equipoId),
      },
    });

    if (!equipo || !equipo.activo) {
      return res.status(404).json({
        message: "El equipo no existe o está inactivo.",
      });
    }

    const nuevoJugador = await prisma.player.create({
      data: {
        nombre,
        numero: numero ? Number(numero) : null,
        posicion,
        fotoUrl,
        equipoId: Number(equipoId),
      },
      include: {
        equipo: {
          include: {
            disciplina: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Jugador creado correctamente.",
      jugador: nuevoJugador,
    });
  } catch (error) {
    console.error("Error al crear jugador:", error);
    return res.status(500).json({
      message: "Error al crear jugador.",
    });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, numero, posicion, fotoUrl, equipoId, activo } = req.body;

    const jugadorExiste = await prisma.player.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!jugadorExiste) {
      return res.status(404).json({
        message: "Jugador no encontrado.",
      });
    }

    if (equipoId) {
      const equipo = await prisma.team.findUnique({
        where: {
          id: Number(equipoId),
        },
      });

      if (!equipo || !equipo.activo) {
        return res.status(404).json({
          message: "El equipo no existe o está inactivo.",
        });
      }
    }

    const jugadorActualizado = await prisma.player.update({
      where: {
        id: Number(id),
      },
      data: {
        nombre,
        numero: numero !== undefined ? Number(numero) : undefined,
        posicion,
        fotoUrl,
        equipoId: equipoId ? Number(equipoId) : undefined,
        activo,
      },
      include: {
        equipo: {
          include: {
            disciplina: true,
          },
        },
      },
    });

    return res.json({
      message: "Jugador actualizado correctamente.",
      jugador: jugadorActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar jugador:", error);
    return res.status(500).json({
      message: "Error al actualizar jugador.",
    });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;

    const jugadorExiste = await prisma.player.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!jugadorExiste) {
      return res.status(404).json({
        message: "Jugador no encontrado.",
      });
    }

    const jugadorEliminado = await prisma.player.update({
      where: {
        id: Number(id),
      },
      data: {
        activo: false,
      },
    });

    return res.json({
      message: "Jugador desactivado correctamente.",
      jugador: jugadorEliminado,
    });
  } catch (error) {
    console.error("Error al desactivar jugador:", error);
    return res.status(500).json({
      message: "Error al desactivar jugador.",
    });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
