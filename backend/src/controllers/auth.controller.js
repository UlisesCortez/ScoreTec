const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const prisma = require("../config/db");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    if (!usuario.passwordHash) {
      return res.status(401).json({
        message: "Esta cuenta fue creada con Google. Inicia sesión con Google.",
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

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "La credencial de Google es obligatoria.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const nombre = payload.name || "Usuario ScoreTec";

    if (!email) {
      return res.status(400).json({
        message: "No se pudo obtener el correo de Google.",
      });
    }

    let usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario) {
      usuario = await prisma.user.create({
        data: {
          nombre,
          email,
          passwordHash: null,
          rol: "USUARIO",
          activo: true,
        },
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        message: "Tu cuenta está desactivada.",
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
      message: "Inicio de sesión con Google correcto.",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login con Google:", error);
    return res.status(401).json({
      message: "No se pudo validar la cuenta de Google.",
    });
  }
};

module.exports = {
  login,
  me,
  googleLogin,
};
