const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const disciplineRoutes = require("./routes/disciplines.routes");
const teamRoutes = require("./routes/teams.routes");
const playerRoutes = require("./routes/players.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API ScoreTec funcionando correctamente",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/disciplines", disciplineRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);

module.exports = app;
