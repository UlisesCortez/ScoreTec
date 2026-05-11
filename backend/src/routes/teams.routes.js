const express = require("express");
const router = express.Router();

const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teams.controller");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

// Público
router.get("/", getTeams);
router.get("/:id", getTeamById);

// Solo admin
router.post("/", verificarToken, soloAdmin, createTeam);
router.put("/:id", verificarToken, soloAdmin, updateTeam);
router.delete("/:id", verificarToken, soloAdmin, deleteTeam);

module.exports = router;
