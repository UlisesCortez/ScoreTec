const express = require("express");
const router = express.Router();

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, getUsers);
router.post("/", verificarToken, soloAdmin, createUser);
router.put("/:id", verificarToken, soloAdmin, updateUser);
router.delete("/:id", verificarToken, soloAdmin, deleteUser);

module.exports = router;
