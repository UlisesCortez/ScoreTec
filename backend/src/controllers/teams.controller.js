const prisma = require("../config/db");

const getTeams = async (req, res) => {
  try {
    const equipos = await prisma.team.findMany({
      include: {
        disciplina: true,
        jugadores: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return res.json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    return res.status(500).json({
      message: "Error al obtener equipos.",
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await prisma.team.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        disciplina: true,
        jugadores: true,
      },
    });

    if (!equipo) {
      return res.status(404).json({
        message: "Equipo no encontrado.",
      });
    }

    return res.json(equipo);
  } catch (error) {
    console.error("Error al obtener equipo:", error);
    return res.status(500).json({
      message: "Error al obtener equipo.",
    });
  }
};

const createTeam = async (req, res) => {
  try {
    const { nombre, escudoUrl, entrenador, disciplinaId } = req.body;

    if (!nombre || !disciplinaId) {
      return res.status(400).json({
        message: "El nombre y la disciplina son obligatorios.",
      });
    }

    const disciplina = await prisma.discipline.findUnique({
      where: {
        id: Number(disciplinaId),
      },
    });

    if (!disciplina || !disciplina.activo) {
      return res.status(404).json({
        message: "La disciplina no existe o está inactiva.",
      });
    }

    const nuevoEquipo = await prisma.team.create({
      data: {
        nombre,
        escudoUrl,
        entrenador,
        disciplinaId: Number(disciplinaId),
      },
      include: {
        disciplina: true,
      },
    });

    return res.status(201).json({
      message: "Equipo creado correctamente.",
      equipo: nuevoEquipo,
    });
  } catch (error) {
    console.error("Error al crear equipo:", error);
    return res.status(500).json({
      message: "Error al crear equipo.",
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, escudoUrl, entrenador, disciplinaId, activo } = req.body;

    const equipoExiste = await prisma.team.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!equipoExiste) {
      return res.status(404).json({
        message: "Equipo no encontrado.",
      });
    }

    if (disciplinaId) {
      const disciplina = await prisma.discipline.findUnique({
        where: {
          id: Number(disciplinaId),
        },
      });

      if (!disciplina || !disciplina.activo) {
        return res.status(404).json({
          message: "La disciplina no existe o está inactiva.",
        });
      }
    }

    const equipoActualizado = await prisma.team.update({
      where: {
        id: Number(id),
      },
      data: {
        nombre,
        escudoUrl,
        entrenador,
        disciplinaId: disciplinaId ? Number(disciplinaId) : undefined,
        activo,
      },
      include: {
        disciplina: true,
      },
    });

    return res.json({
      message: "Equipo actualizado correctamente.",
      equipo: equipoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar equipo:", error);
    return res.status(500).json({
      message: "Error al actualizar equipo.",
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const equipoExiste = await prisma.team.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!equipoExiste) {
      return res.status(404).json({
        message: "Equipo no encontrado.",
      });
    }

    const equipoEliminado = await prisma.team.update({
      where: {
        id: Number(id),
      },
      data: {
        activo: false,
      },
    });

    return res.json({
      message: "Equipo desactivado correctamente.",
      equipo: equipoEliminado,
    });
  } catch (error) {
    console.error("Error al desactivar equipo:", error);
    return res.status(500).json({
      message: "Error al desactivar equipo.",
    });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
