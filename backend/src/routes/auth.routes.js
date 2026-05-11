const express = require("express");
const router = express.Router();

const { login, googleLogin, me } = require("../controllers/auth.controller");

const { verificarToken } = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", verificarToken, me);

module.exports = router;
