import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function GameCard({ juego, isAdmin, onDelete }) {
  const { addItem } = useCart();

  return (
    <article className="tarjeta">
      <Link to={`/producto/${juego.id}`} className="juego">
        <picture>
          <img src={juego.portada} alt={juego.titulo} />
        </picture>
      </Link>

      <div className="info">
        <p className="tipodeconsola">{juego.consola}</p>
        <p>{juego.genero}</p>
      </div>

      <div className="infoJuego">
        <Link to={`/producto/${juego.id}`}>
          <h4>{juego.titulo}</h4>
        </Link>
        <h5>${Number(juego.precio).toFixed(2)}</h5>
      </div>

      {juego.ratingPromedio && (
        <p className="tarjeta-rating">
          <i className="bi bi-star-fill"></i> {juego.ratingPromedio} ({juego.cantidadResenas})
        </p>
      )}

      <button
        className="botoncompra"
        type="button"
        disabled={juego.stock === 0}
        onClick={() => addItem(juego)}
      >
        {juego.stock === 0 ? "Sin stock" : "Agregar al carrito"}
      </button>

      {isAdmin && (
        <div className="tarjeta-admin-acciones">
          <Link to={`/editar/${juego.id}`} className="botoneditar">
            Editar
          </Link>
          <button className="botonbaja" type="button" onClick={() => onDelete(juego.id)}>
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
