const express = require("express");
const multer = require("multer");
const path = require("path");
const { readDB, writeDB } = require("../utils/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

function conRating(juego) {
  const resenas = juego.resenas || [];
  const promedio = resenas.length
    ? resenas.reduce((acc, r) => acc + r.rating, 0) / resenas.length
    : null;
  return {
    ...juego,
    ratingPromedio: promedio ? Number(promedio.toFixed(1)) : null,
    cantidadResenas: resenas.length,
  };
}

// GET /api/games -> listado público, visible sin login
router.get("/", (req, res) => {
  const { games } = readDB();
  res.json(games.map(conRating));
});

// GET /api/games/:id -> detalle de un producto (público)
router.get("/:id", (req, res) => {
  const { games } = readDB();
  const juego = games.find((g) => g.id === Number(req.params.id));
  if (!juego) return res.status(404).json({ error: "Producto no encontrado." });
  res.json(conRating(juego));
});

// POST /api/games -> alta de producto, solo admin autenticado
router.post("/", verifyToken, verifyAdmin, upload.single("foto"), (req, res) => {
  const { titulo, genero, consola, precio, stock, categoria } = req.body;

  if (!titulo || !genero || !consola || !precio || !stock) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const db = readDB();
  const nextId = db.games.length ? Math.max(...db.games.map((g) => g.id)) + 1 : 1;

  const portada = req.file ? `/uploads/${req.file.filename}` : "/img/consolas.png";

  const nuevoJuego = {
    id: nextId,
    categoria: ["juego", "consola", "joystick"].includes(categoria) ? categoria : "juego",
    titulo,
    genero,
    consola,
    precio: Number(precio),
    stock: Number(stock),
    portada,
    resenas: [],
  };

  db.games.push(nuevoJuego);
  writeDB(db);

  res.status(201).json(nuevoJuego);
});

// PUT /api/games/:id -> modificación de producto, solo admin autenticado
router.put("/:id", verifyToken, verifyAdmin, upload.single("foto"), (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const juego = db.games.find((g) => g.id === id);

  if (!juego) return res.status(404).json({ error: "Producto no encontrado." });

  const { titulo, genero, consola, precio, stock, categoria } = req.body;

  if (titulo !== undefined) juego.titulo = titulo;
  if (genero !== undefined) juego.genero = genero;
  if (consola !== undefined) juego.consola = consola;
  if (precio !== undefined) juego.precio = Number(precio);
  if (stock !== undefined) juego.stock = Number(stock);
  if (categoria !== undefined && ["juego", "consola", "joystick"].includes(categoria)) {
    juego.categoria = categoria;
  }
  if (req.file) juego.portada = `/uploads/${req.file.filename}`;

  writeDB(db);
  res.json(juego);
});

// DELETE /api/games/:id -> baja de producto, solo admin autenticado
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const existe = db.games.some((g) => g.id === id);

  if (!existe) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  db.games = db.games.filter((g) => g.id !== id);
  writeDB(db);

  res.json({ ok: true });
});

// POST /api/games/:id/resenas -> dejar una reseña (cualquier usuario logueado)
router.post("/:id/resenas", verifyToken, (req, res) => {
  const { rating, comentario } = req.body;
  const ratingNum = Number(rating);

  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "El rating debe ser un número entre 1 y 5." });
  }

  const db = readDB();
  const id = Number(req.params.id);
  const juego = db.games.find((g) => g.id === id);
  if (!juego) return res.status(404).json({ error: "Producto no encontrado." });

  if (!juego.resenas) juego.resenas = [];

  const yaOpino = juego.resenas.some((r) => r.userId === req.user.id);
  if (yaOpino) {
    return res.status(409).json({ error: "Ya dejaste una reseña para este producto." });
  }

  const nuevaResena = {
    id: juego.resenas.length ? Math.max(...juego.resenas.map((r) => r.id)) + 1 : 1,
    userId: req.user.id,
    username: req.user.username,
    rating: ratingNum,
    comentario: comentario || "",
    fecha: new Date().toISOString(),
  };

  juego.resenas.push(nuevaResena);
  writeDB(db);

  res.status(201).json(conRating(juego));
});

module.exports = router;
