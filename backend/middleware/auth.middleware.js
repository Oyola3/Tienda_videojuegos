const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cambia_esta_clave_super_secreta";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no provisto." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
}

function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso reservado a administradores." });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin, JWT_SECRET };
