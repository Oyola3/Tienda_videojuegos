require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const passport = require("./config/passport");

const authRoutes = require("./routes/auth.routes");
const gamesRoutes = require("./routes/games.routes");
const ordersRoutes = require("./routes/orders.routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Sesión mínima requerida por Passport durante el handshake de OAuth
// (la autenticación de la app en sí usa JWT sin estado, no cookies de sesión)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cambia_esta_otra_clave_secreta",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

// Imágenes subidas por el admin desde el formulario de alta
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/orders", ordersRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "API de Pichi-Gamez funcionando." });
});

module.exports = app;
