const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "Token no proporcionado.",
      });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token inválido.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token no válido o expirado.",
    });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== "ADMIN") {
    return res.status(403).json({
      message: "Acceso permitido solo para administradores.",
    });
  }

  next();
};

const soloArbitroOAdmin = (req, res, next) => {
  if (req.usuario.rol !== "ADMIN" && req.usuario.rol !== "ARBITRO") {
    return res.status(403).json({
      message: "Acceso permitido solo para árbitros o administradores.",
    });
  }

  next();
};

module.exports = {
  verificarToken,
  soloAdmin,
  soloArbitroOAdmin,
};
