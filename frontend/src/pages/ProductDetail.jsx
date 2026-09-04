import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getGame, postReview } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Estrellas({ valor, interactivo, onChange }) {
  return (
    <div className={`estrellas ${interactivo ? "estrellas-interactivo" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`bi ${n <= valor ? "bi-star-fill" : "bi-star"}`}
          onClick={interactivo ? () => onChange(n) : undefined}
        ></i>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [juego, setJuego] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [ratingNuevo, setRatingNuevo] = useState(0);
  const [comentarioNuevo, setComentarioNuevo] = useState("");
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [errorResena, setErrorResena] = useState("");

  function cargar() {
    setCargando(true);
    getGame(id)
      .then(setJuego)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleResena(e) {
    e.preventDefault();
    setErrorResena("");
    if (!user) {
      navigate("/login", { state: { from: `/producto/${id}` } });
      return;
    }
    if (ratingNuevo === 0) {
      setErrorResena("Elegí una cantidad de estrellas.");
      return;
    }
    setEnviandoResena(true);
    try {
      const actualizado = await postReview(id, ratingNuevo, comentarioNuevo, token);
      setJuego(actualizado);
      setRatingNuevo(0);
      setComentarioNuevo("");
    } catch (err) {
      setErrorResena(err.message);
    } finally {
      setEnviandoResena(false);
    }
  }

  if (cargando) {
    return (
      <main className="fondo">
        <p style={{ textAlign: "center" }}>Cargando producto...</p>
      </main>
    );
  }

  if (error || !juego) {
    return (
      <main className="fondo">
        <p className="alerta-error" style={{ textAlign: "center" }}>
          {error || "Producto no encontrado."}
        </p>
        <p style={{ textAlign: "center" }}>
          <Link to="/">Volver al catálogo</Link>
        </p>
      </main>
    );
  }

  const yaOpino = user && (juego.resenas || []).some((r) => r.userId === user.id);

  return (
    <main className="producto-detalle">
      <div className="producto-detalle-grid">
        <img src={juego.portada} alt={juego.titulo} className="producto-detalle-img" />

        <div className="producto-detalle-info">
          <p className="tipodeconsola">{juego.consola}</p>
          <h1>{juego.titulo}</h1>
          <p className="producto-detalle-genero">{juego.genero}</p>

          <div className="producto-detalle-rating">
            <Estrellas valor={Math.round(juego.ratingPromedio || 0)} interactivo={false} />
            {juego.ratingPromedio ? (
              <span>
                {juego.ratingPromedio} ({juego.cantidadResenas}{" "}
                {juego.cantidadResenas === 1 ? "reseña" : "reseñas"})
              </span>
            ) : (
              <span>Sin reseñas todavía</span>
            )}
          </div>

          <h2 className="producto-detalle-precio">${Number(juego.precio).toFixed(2)}</h2>
          <p className="producto-detalle-stock">
            {juego.stock > 0 ? `${juego.stock} unidades disponibles` : "Sin stock"}
          </p>

          <button
            className="botoncompra"
            disabled={juego.stock === 0}
            onClick={() => addItem(juego)}
          >
            {juego.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>
      </div>

      <section className="resenas-section">
        <h3>Reseñas</h3>

        {!yaOpino && (
          <form className="form-resena" onSubmit={handleResena}>
            <p>Dejá tu reseña:</p>
            <Estrellas valor={ratingNuevo} interactivo onChange={setRatingNuevo} />
            <textarea
              placeholder="¿Qué te pareció? (opcional)"
              rows="3"
              value={comentarioNuevo}
              onChange={(e) => setComentarioNuevo(e.target.value)}
            ></textarea>
            {errorResena && <p className="alerta-error">{errorResena}</p>}
            <button className="botonAlta" type="submit" disabled={enviandoResena}>
              {enviandoResena ? "Enviando..." : user ? "Publicar reseña" : "Iniciar sesión para opinar"}
            </button>
          </form>
        )}
        {yaOpino && <p className="ayuda-login">Ya dejaste tu reseña de este producto. ¡Gracias!</p>}

        <div className="lista-resenas">
          {(juego.resenas || []).slice().reverse().map((r) => (
            <div className="resena-card" key={r.id}>
              <div className="resena-header">
                <strong>{r.username}</strong>
                <Estrellas valor={r.rating} interactivo={false} />
              </div>
              {r.comentario && <p>{r.comentario}</p>}
              <span className="resena-fecha">
                {new Date(r.fecha).toLocaleDateString("es-AR")}
              </span>
            </div>
          ))}
          {(juego.resenas || []).length === 0 && (
            <p className="ayuda-login">Sé el primero en dejar una reseña.</p>
          )}
        </div>
      </section>
    </main>
  );
}
