const express = require("express");
const router = express.Router();

const {
  getEventsByMatch,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/events.controller");

const {
  verificarToken,
  soloArbitroOAdmin,
} = require("../middlewares/authMiddleware");

// Público
router.get("/matches/:id/events", getEventsByMatch);

// Árbitro o admin
router.post(
  "/matches/:id/events",
  verificarToken,
  soloArbitroOAdmin,
  createEvent,
);
router.put("/events/:id", verificarToken, soloArbitroOAdmin, updateEvent);
router.delete("/events/:id", verificarToken, soloArbitroOAdmin, deleteEvent);

module.exports = router;
