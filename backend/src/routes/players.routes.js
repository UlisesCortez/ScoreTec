const express = require("express");
const router = express.Router();

const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controllers/players.controller");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

// Público
router.get("/", getPlayers);
router.get("/:id", getPlayerById);

// Solo admin
router.post("/", verificarToken, soloAdmin, createPlayer);
router.put("/:id", verificarToken, soloAdmin, updatePlayer);
router.delete("/:id", verificarToken, soloAdmin, deletePlayer);

module.exports = router;
