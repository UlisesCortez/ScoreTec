const express = require("express");
const router = express.Router();

const {
  getTeamStats,
  getPlayerStats,
  getMatchStats,
  getDisciplineStats,
} = require("../controllers/stats.controller");

// Público
router.get("/teams", getTeamStats);
router.get("/players", getPlayerStats);
router.get("/matches/:id", getMatchStats);
router.get("/disciplines/:id", getDisciplineStats);

module.exports = router;
