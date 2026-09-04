const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const { readDB, writeDB } = require("../utils/db");
const { JWT_SECRET } = require("../middleware/auth.middleware");

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function issueToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function publicUser(user) {
  return { id: user.id, username: user.username, role: user.role, email: user.email || null };
}

// ===== LOGIN LOCAL =====
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios." });
  }

  const { users } = readDB();
  const user = users.find((u) => u.username === username);

  if (!user || !user.password) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const passwordOk = bcrypt.compareSync(password, user.password);
  if (!passwordOk) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  res.json({ token: issueToken(user), user: publicUser(user) });
});

// ===== REGISTRO =====
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Usuario, email y contraseña son obligatorios." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const db = readDB();
  const yaExiste = db.users.some((u) => u.username === username || u.email === email);
  if (yaExiste) {
    return res.status(409).json({ error: "Ese usuario o email ya está registrado." });
  }

  const nextId = db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
  const nuevoUsuario = {
    id: nextId,
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    role: "user",
    provider: "local",
  };

  db.users.push(nuevoUsuario);
  writeDB(db);

  res.status(201).json({ token: issueToken(nuevoUsuario), user: publicUser(nuevoUsuario) });
});

// ===== OLVIDÉ MI CONTRASEÑA =====
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "El email es obligatorio." });
  }

  const db = readDB();
  const user = db.users.find((u) => u.email === email);

  if (!user) {
    return res.json({
      mensaje: "Si el email existe, vas a recibir un link para restablecer tu contraseña.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutos
  writeDB(db);

  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  // No hay servicio de email configurado: se loguea en consola.
  // En producción acá se llamaría a un proveedor real (Resend, SendGrid, etc.)
  console.log(`[Recuperar contraseña] Link para ${email}: ${resetLink}`);

  res.json({
    mensaje: "Si el email existe, vas a recibir un link para restablecer tu contraseña.",
    devLink: process.env.NODE_ENV === "production" ? undefined : resetLink,
  });
});

router.post("/reset-password", (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token y nueva contraseña son obligatorios." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const db = readDB();
  const user = db.users.find(
    (u) => u.resetToken === token && u.resetTokenExpiry > Date.now()
  );

  if (!user) {
    return res.status(400).json({ error: "El link es inválido o expiró. Pedí uno nuevo." });
  }

  user.password = bcrypt.hashSync(password, 10);
  delete user.resetToken;
  delete user.resetTokenExpiry;
  writeDB(db);

  res.json({ mensaje: "Contraseña actualizada correctamente." });
});

// ===== GOOGLE =====
router.get(
  "/google",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(503)
        .send(
          "Login con Google no está configurado todavía: faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en el .env del backend."
        );
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = issueToken(req.user);
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

// ===== FACEBOOK =====
router.get(
  "/facebook",
  (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID) {
      return res
        .status(503)
        .send(
          "Login con Facebook no está configurado todavía: faltan FACEBOOK_APP_ID / FACEBOOK_APP_SECRET en el .env del backend."
        );
    }
    next();
  },
  passport.authenticate("facebook", { scope: ["email"], session: false })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = issueToken(req.user);
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

module.exports = router;
