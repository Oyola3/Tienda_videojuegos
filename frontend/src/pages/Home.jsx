import { useEffect, useMemo, useState } from "react";
import { getGames, deleteGame } from "../api/api";
import { useAuth } from "../context/AuthContext";
import GameCard from "../components/GameCard";

const CATEGORIAS = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "juego", etiqueta: "Juegos" },
  { valor: "consola", etiqueta: "Consolas" },
  { valor: "joystick", etiqueta: "Joysticks" },
];

const ORDENES = [
  { valor: "relevancia", etiqueta: "Relevancia" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "nombre", etiqueta: "Nombre (A-Z)" },
];

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("relevancia");
  const { isAdmin, token } = useAuth();

  async function cargarProductos() {
    try {
      setCargando(true);
      const data = await getGames();
      setProductos(data);
    } catch (err) {
      setError("No se pudieron cargar los productos. ¿El backend está corriendo?");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    try {
      await deleteGame(id, token);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const visibles = useMemo(() => {
    let lista = productos;

    if (categoria !== "todos") {
      lista = lista.filter((p) => (p.categoria || "juego") === categoria);
    }

    if (busqueda.trim()) {
      const texto = busqueda.trim().toLowerCase();
      lista = lista.filter((p) => p.titulo.toLowerCase().includes(texto));
    }

    const ordenada = [...lista];
    if (orden === "precio-asc") ordenada.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") ordenada.sort((a, b) => b.precio - a.precio);
    if (orden === "nombre") ordenada.sort((a, b) => a.titulo.localeCompare(b.titulo));

    return ordenada;
  }, [productos, categoria, busqueda, orden]);

  return (
    <main className="main">
      <h1>Catálogo</h1>

      <div className="tabs-categorias">
        {CATEGORIAS.map((c) => (
          <button
            key={c.valor}
            className={`tab-categoria ${categoria === c.valor ? "activa" : ""}`}
            onClick={() => setCategoria(c.valor)}
          >
            {c.etiqueta}
          </button>
        ))}
      </div>

      <div className="catalogo-filtros">
        <div className="buscador">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select className="selector-orden" value={orden} onChange={(e) => setOrden(e.target.value)}>
          {ORDENES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="alerta-error">{error}</p>}
      {cargando && <p>Cargando catálogo...</p>}

      <section className="indexSec" id="juegos">
        {visibles.map((producto) => (
          <GameCard
            key={producto.id}
            juego={producto}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />
        ))}
        {!cargando && visibles.length === 0 && !error && (
          <p>No encontramos productos con esos filtros.</p>
        )}
      </section>
    </main>
  );
}
