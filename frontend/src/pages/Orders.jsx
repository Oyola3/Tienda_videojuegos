import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/api";
import { useAuth } from "../context/AuthContext";

const ETIQUETA_METODO = {
  tarjeta: "Tarjeta de crédito/débito",
  mercadopago: "Mercado Pago",
};

export default function Orders() {
  const { token } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders(token)
      .then((data) => setOrdenes(data.slice().reverse()))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token]);

  return (
    <main className="fondo">
      <h1>Mis compras</h1>

      {cargando && <p style={{ textAlign: "center" }}>Cargando historial...</p>}
      {error && <p className="alerta-error" style={{ textAlign: "center" }}>{error}</p>}

      {!cargando && ordenes.length === 0 && !error && (
        <p style={{ textAlign: "center" }}>
          Todavía no hiciste ninguna compra. <Link to="/">Ir al catálogo</Link>
        </p>
      )}

      <div className="ordenes-lista">
        {ordenes.map((orden) => (
          <div className="orden-card" key={orden.id}>
            <div className="orden-header">
              <span>Orden #{orden.id}</span>
              <span className={`orden-estado orden-estado--${orden.estado}`}>
                {orden.estado === "pagada" ? "Pagada" : "Pendiente"}
              </span>
            </div>
            <ul className="checkout-items">
              {orden.items.map((item) => (
                <li key={item.gameId}>
                  {item.cantidad}x {item.titulo} — $
                  {(item.precioUnitario * item.cantidad).toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="orden-footer">
              <span>{new Date(orden.creadoEn).toLocaleDateString("es-AR")}</span>
              {orden.metodoPago && <span>{ETIQUETA_METODO[orden.metodoPago]}</span>}
              <strong>${orden.total.toFixed(2)}</strong>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
