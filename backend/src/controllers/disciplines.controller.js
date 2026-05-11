const prisma = require("../config/db");

const getDisciplines = async (req, res) => {
  try {
    const disciplinas = await prisma.discipline.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return res.json(disciplinas);
  } catch (error) {
    console.error("Error al obtener disciplinas:", error);
    return res.status(500).json({
      message: "Error al obtener disciplinas.",
    });
  }
};

const createDiscipline = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre de la disciplina es obligatorio.",
      });
    }

    const nuevaDisciplina = await prisma.discipline.create({
      data: {
        nombre,
        descripcion,
      },
    });

    return res.status(201).json({
      message: "Disciplina creada correctamente.",
      disciplina: nuevaDisciplina,
    });
  } catch (error) {
    console.error("Error al crear disciplina:", error);
    return res.status(500).json({
      message: "Error al crear disciplina.",
    });
  }
};

const updateDiscipline = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const disciplinaActualizada = await prisma.discipline.update({
      where: {
        id: Number(id),
      },
      data: {
        nombre,
        descripcion,
        activo,
      },
    });

    return res.json({
      message: "Disciplina actualizada correctamente.",
      disciplina: disciplinaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar disciplina:", error);
    return res.status(500).json({
      message: "Error al actualizar disciplina.",
    });
  }
};

const deleteDiscipline = async (req, res) => {
  try {
    const { id } = req.params;

    const disciplinaEliminada = await prisma.discipline.update({
      where: {
        id: Number(id),
      },
      data: {
        activo: false,
      },
    });

    return res.json({
      message: "Disciplina desactivada correctamente.",
      disciplina: disciplinaEliminada,
    });
  } catch (error) {
    console.error("Error al desactivar disciplina:", error);
    return res.status(500).json({
      message: "Error al desactivar disciplina.",
    });
  }
};

module.exports = {
  getDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
};
