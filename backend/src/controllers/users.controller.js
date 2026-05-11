const bcrypt = require("bcrypt");
const prisma = require("../config/db");

const getUsers = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      message: "Error al obtener usuarios.",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !rol) {
      return res.status(400).json({
        message: "Nombre, correo y rol son obligatorios.",
      });
    }

    if (rol !== "ADMIN" && rol !== "ARBITRO" && rol !== "USUARIO") {
      return res.status(400).json({
        message: "Rol no válido.",
      });
    }

    const existeUsuario = await prisma.user.findUnique({
      where: { email },
    });

    if (existeUsuario) {
      return res.status(400).json({
        message: "Ya existe un usuario con ese correo.",
      });
    }

    let passwordHash = null;

    if (rol === "ADMIN" || rol === "ARBITRO") {
      if (!password) {
        return res.status(400).json({
          message: "La contraseña es obligatoria para ADMIN o ARBITRO.",
        });
      }

      passwordHash = await bcrypt.hash(password, 10);
    }

    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        rol,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    return res.status(201).json({
      message: "Usuario creado correctamente.",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({
      message: "Error al crear usuario.",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, activo } = req.body;

    const usuarioExiste = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExiste) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    if (rol && rol !== "ADMIN" && rol !== "ARBITRO" && rol !== "USUARIO") {
      return res.status(400).json({
        message: "Rol no válido.",
      });
    }

    let passwordHash = undefined;

    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        nombre,
        email,
        rol,
        activo,
        passwordHash,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    return res.json({
      message: "Usuario actualizado correctamente.",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({
      message: "Error al actualizar usuario.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.usuario.id) {
      return res.status(400).json({
        message: "No puedes desactivar tu propia cuenta.",
      });
    }

    const usuarioExiste = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExiste) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    const usuarioDesactivado = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        activo: false,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    return res.json({
      message: "Usuario desactivado correctamente.",
      usuario: usuarioDesactivado,
    });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    return res.status(500).json({
      message: "Error al desactivar usuario.",
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
