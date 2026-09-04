const express = require("express");
const { readDB, writeDB } = require("../utils/db");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// POST /api/orders/checkout -> crea una orden "pendiente" a partir del carrito
router.post("/checkout", verifyToken, (req, res) => {
  const { items } = req.body; // [{ id, cantidad }]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." });
  }

  const db = readDB();
  let total = 0;
  const detalle = [];

  for (const item of items) {
    const juego = db.games.find((g) => g.id === item.id);
    if (!juego) {
      return res.status(404).json({ error: `El juego con id ${item.id} ya no existe.` });
    }
    const cantidad = Math.max(1, Number(item.cantidad) || 1);
    if (cantidad > juego.stock) {
      return res.status(400).json({ error: `No hay stock suficiente de "${juego.titulo}".` });
    }
    total += juego.precio * cantidad;
    detalle.push({
      gameId: juego.id,
      titulo: juego.titulo,
      precioUnitario: juego.precio,
      cantidad,
    });
  }

  if (!db.orders) db.orders = [];
  const nextId = db.orders.length ? Math.max(...db.orders.map((o) => o.id)) + 1 : 1;

  const orden = {
    id: nextId,
    userId: req.user.id,
    username: req.user.username,
    items: detalle,
    total: Number(total.toFixed(2)),
    estado: "pendiente",
    metodoPago: null,
    creadoEn: new Date().toISOString(),
  };

  db.orders.push(orden);
  writeDB(db);

  // NOTA: acá es donde en una integración real se llamaría a la API de
  // Mercado Pago (mercadopago.preferences.create) y se devolvería la URL
  // real de pago (init_point) para redirigir al usuario. Por ahora se
  // redirige a una pantalla de pago simulada dentro de la propia app.
  res.status(201).json({ orderId: orden.id, total: orden.total });
});

// GET /api/orders/:id -> detalle de una orden (dueño de la orden)
router.get("/:id", verifyToken, (req, res) => {
  const db = readDB();
  const orden = (db.orders || []).find((o) => o.id === Number(req.params.id));

  if (!orden) return res.status(404).json({ error: "Orden no encontrada." });
  if (orden.userId !== req.user.id) {
    return res.status(403).json({ error: "Esta orden no te pertenece." });
  }

  res.json(orden);
});

// POST /api/orders/:id/pagar -> simula la confirmación de pago (tarjeta o Mercado Pago)
router.post("/:id/pagar", verifyToken, (req, res) => {
  const { metodo } = req.body; // "tarjeta" | "mercadopago"
  if (!["tarjeta", "mercadopago"].includes(metodo)) {
    return res.status(400).json({ error: "Método de pago inválido." });
  }

  const db = readDB();
  const orden = (db.orders || []).find((o) => o.id === Number(req.params.id));

  if (!orden) return res.status(404).json({ error: "Orden no encontrada." });
  if (orden.userId !== req.user.id) {
    return res.status(403).json({ error: "Esta orden no te pertenece." });
  }
  if (orden.estado === "pagada") {
    return res.status(409).json({ error: "Esta orden ya fue pagada." });
  }

  // Descuenta stock recién al confirmar el pago (simulado)
  for (const item of orden.items) {
    const juego = db.games.find((g) => g.id === item.gameId);
    if (juego) juego.stock = Math.max(0, juego.stock - item.cantidad);
  }

  orden.estado = "pagada";
  orden.metodoPago = metodo;
  orden.pagadoEn = new Date().toISOString();
  writeDB(db);

  res.json({ ok: true, orden });
});

// GET /api/orders -> historial de compras del usuario logueado
router.get("/", verifyToken, (req, res) => {
  const db = readDB();
  const propias = (db.orders || []).filter((o) => o.userId === req.user.id);
  res.json(propias);
});

module.exports = router;
