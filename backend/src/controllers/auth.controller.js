const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios.",
      });
    }

    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        message: "Credenciales incorrectas.",
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValido) {
      return res.status(401).json({
        message: "Credenciales incorrectas.",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    return res.json({
      message: "Inicio de sesión correcto.",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

const me = async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    return res.json(usuario);
  } catch (error) {
    console.error("Error en /me:", error);
    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

module.exports = {
  login,
  me,
};
