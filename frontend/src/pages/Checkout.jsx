import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, payOrder } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { id } = useParams();
  const { token } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [orden, setOrden] = useState(null);
  const [metodo, setMetodo] = useState(null);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    getOrder(id, token)
      .then(setOrden)
      .catch((err) => setError(err.message));
  }, [id, token]);

  async function confirmarPago() {
    if (!metodo) return;
    setError("");
    setProcesando(true);
    try {
      // Pago simulado: no se procesan tarjetas ni credenciales reales.
      // Acá es donde se conectaría el SDK real de Mercado Pago (Checkout
      // Pro) o un procesador de tarjetas para redirigir al usuario a la
      // pasarela real.
      await new Promise((resolve) => setTimeout(resolve, 900));
      await payOrder(id, metodo, token);
      clearCart();
      navigate(`/pago/exito?orderId=${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (error && !orden) {
    return (
      <main className="fondo">
        <h1>Pago</h1>
        <p className="alerta-error" style={{ textAlign: "center" }}>
          {error}
        </p>
      </main>
    );
  }

  if (!orden) {
    return (
      <main className="fondo">
        <h1>Pago</h1>
        <p style={{ textAlign: "center" }}>Cargando orden...</p>
      </main>
    );
  }

  return (
    <main className="fondo">
      <h1>Finalizar compra</h1>
      <aside className="altapag">
        <div className="checkout-box">
          <h4>Orden #{orden.id}</h4>
          <ul className="checkout-items">
            {orden.items.map((item) => (
              <li key={item.gameId}>
                {item.cantidad}x {item.titulo} — ${(item.precioUnitario * item.cantidad).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="checkout-total">Total a pagar: ${orden.total.toFixed(2)}</p>

          <p className="checkout-subtitulo">Elegí cómo pagar:</p>
          <div className="metodos-pago">
            <button
              className={`metodo-pago ${metodo === "tarjeta" ? "seleccionado" : ""}`}
              onClick={() => setMetodo("tarjeta")}
            >
              <i className="bi bi-credit-card"></i>
              Tarjeta de crédito/débito
            </button>
            <button
              className={`metodo-pago ${metodo === "mercadopago" ? "seleccionado" : ""}`}
              onClick={() => setMetodo("mercadopago")}
            >
              <i className="bi bi-wallet2"></i>
              Mercado Pago
            </button>
          </div>

          {error && <p className="alerta-error">{error}</p>}

          <button
            className="botonAlta"
            disabled={!metodo || procesando}
            onClick={confirmarPago}
          >
            {procesando ? "Procesando pago..." : "Confirmar pago"}
          </button>
          <p className="ayuda-login">
            Pago simulado para portafolio — no se procesan tarjetas reales.
          </p>
        </div>
      </aside>
    </main>
  );
}
