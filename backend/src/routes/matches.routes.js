const express = require("express");
const router = express.Router();

const {
  getMatches,
  getMatchById,
  getUpcomingMatches,
  getLiveMatches,
  getFinishedMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  finishMatch,
  cancelMatch,
} = require("../controllers/matches.controller");

const {
  verificarToken,
  soloAdmin,
  soloArbitroOAdmin,
} = require("../middlewares/authMiddleware");

// Público
router.get("/", getMatches);
router.get("/upcoming", getUpcomingMatches);
router.get("/live", getLiveMatches);
router.get("/finished", getFinishedMatches);
router.get("/:id", getMatchById);

// Solo admin
router.post("/", verificarToken, soloAdmin, createMatch);
router.put("/:id", verificarToken, soloAdmin, updateMatch);
router.delete("/:id", verificarToken, soloAdmin, deleteMatch);
router.patch("/:id/cancel", verificarToken, soloAdmin, cancelMatch);

// Árbitro o admin
router.patch("/:id/start", verificarToken, soloArbitroOAdmin, startMatch);
router.patch("/:id/finish", verificarToken, soloArbitroOAdmin, finishMatch);

module.exports = router;
