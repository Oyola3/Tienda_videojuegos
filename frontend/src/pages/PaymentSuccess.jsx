import { Link, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="fondo">
      <h1>¡Compra confirmada!</h1>
      <aside className="altapag">
        <div className="checkout-box" style={{ textAlign: "center" }}>
          <i
            className="bi bi-check-circle-fill"
            style={{ fontSize: "3rem", color: "#4bd18c" }}
          ></i>
          <p>
            Tu orden {orderId && <strong>#{orderId}</strong>} se pagó correctamente. Ya podés
            volver al catálogo.
          </p>
          <Link className="botonAlta" style={{ display: "inline-block" }} to="/">
            Volver al catálogo
          </Link>
        </div>
      </aside>
    </main>
  );
}
