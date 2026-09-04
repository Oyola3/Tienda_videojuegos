import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { checkout } from "../api/api";
import { useState } from "react";

export default function Cart() {
  const { items, removeItem, updateCantidad, total } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleCheckout() {
    setError("");

    if (!user) {
      navigate("/login", { state: { from: "/carrito" } });
      return;
    }

    setCargando(true);
    try {
      const payload = items.map((i) => ({ id: i.id, cantidad: i.cantidad }));
      const data = await checkout(payload, token);
      navigate(`/pago/${data.orderId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="fondo">
        <h1>Tu carrito</h1>
        <p style={{ textAlign: "center" }}>
          Todavía no agregaste juegos. <Link to="/">Ir al catálogo</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="fondo">
      <h1>Tu carrito</h1>
      <div className="carrito-lista">
        {items.map((item) => (
          <div className="carrito-item" key={item.id}>
            <img src={item.portada} alt={item.titulo} />
            <div className="carrito-item-info">
              <h4>{item.titulo}</h4>
              <p>${item.precio.toFixed(2)} c/u</p>
            </div>
            <div className="carrito-item-cantidad">
              <button onClick={() => updateCantidad(item.id, item.cantidad - 1)}>-</button>
              <span>{item.cantidad}</span>
              <button onClick={() => updateCantidad(item.id, item.cantidad + 1)}>+</button>
            </div>
            <p className="carrito-item-subtotal">
              ${(item.precio * item.cantidad).toFixed(2)}
            </p>
            <button className="carrito-quitar" onClick={() => removeItem(item.id)}>
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <div className="carrito-resumen">
        <p>
          Total: <strong>${total.toFixed(2)}</strong>
        </p>
        {error && <p className="alerta-error">{error}</p>}
        <button className="botonAlta" onClick={handleCheckout} disabled={cargando}>
          {cargando ? "Procesando..." : "Ir a pagar"}
        </button>
      </div>
    </main>
  );
}
