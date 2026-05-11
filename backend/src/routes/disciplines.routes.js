const express = require("express");
const router = express.Router();

const {
  getDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
} = require("../controllers/disciplines.controller");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

// Público
router.get("/", getDisciplines);

// Solo admin
router.post("/", verificarToken, soloAdmin, createDiscipline);
router.put("/:id", verificarToken, soloAdmin, updateDiscipline);
router.delete("/:id", verificarToken, soloAdmin, deleteDiscipline);

module.exports = router;
