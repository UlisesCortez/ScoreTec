const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const disciplineRoutes = require("./routes/disciplines.routes");

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

module.exports = app;
