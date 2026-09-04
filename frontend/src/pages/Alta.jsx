import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createGame, updateGame, deleteGame, getGame, getGames } from "../api/api";
import { useAuth } from "../context/AuthContext";

const CONSOLAS = ["PS4", "PS5", "Xbox", "Nintendo", "PC"];

const TIPOS_PRODUCTO = [
  { valor: "juego", etiqueta: "Juego" },
  { valor: "consola", etiqueta: "Consola" },
  { valor: "joystick", etiqueta: "Joystick / Accesorio" },
];

const FORM_VACIO = {
  nombre: "",
  tipoProducto: "juego",
  genero: "",
  consola: "PS4",
  precio: "",
  stock: "",
};

export default function Alta() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  // ===== Formulario (alta / modificación) =====
  const [form, setForm] = useState(FORM_VACIO);
  const [foto, setFoto] = useState(null);
  const [portadaActual, setPortadaActual] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(esEdicion);

  // ===== Listado (baja + acceso rápido a modificación) =====
  const [productos, setProductos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState("");

  function cargarLista() {
    setCargandoLista(true);
    getGames()
      .then(setProductos)
      .catch((err) => setErrorLista(err.message))
      .finally(() => setCargandoLista(false));
  }

  useEffect(() => {
    cargarLista();
  }, []);

  useEffect(() => {
    if (!esEdicion) {
      setForm(FORM_VACIO);
      setPortadaActual(null);
      setFoto(null);
      setCargandoForm(false);
      return;
    }
    setCargandoForm(true);
    getGame(id)
      .then((juego) => {
        setForm({
          nombre: juego.titulo,
          tipoProducto: juego.categoria || "juego",
          genero: juego.genero,
          consola: juego.consola,
          precio: juego.precio,
          stock: juego.stock,
        });
        setPortadaActual(juego.portada);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargandoForm(false));
  }, [id, esEdicion]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");
    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("titulo", form.nombre);
      formData.append("categoria", form.tipoProducto);
      formData.append("genero", form.genero);
      formData.append("consola", form.consola);
      formData.append("precio", form.precio);
      formData.append("stock", form.stock);
      if (foto) formData.append("foto", foto);

      if (esEdicion) {
        await updateGame(id, formData, token);
        setExito("Producto actualizado correctamente.");
      } else {
        await createGame(formData, token);
        setExito("Producto cargado correctamente.");
      }
      cargarLista();
      setTimeout(() => {
        setExito("");
        if (esEdicion) navigate("/alta");
      }, 900);
      if (!esEdicion) {
        setForm(FORM_VACIO);
        setFoto(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar(productoId, titulo) {
    if (!confirm(`¿Eliminar "${titulo}" del catálogo?`)) return;
    try {
      await deleteGame(productoId, token);
      cargarLista();
      if (esEdicion && Number(id) === productoId) {
        navigate("/alta");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="fondo fondo-abm">
      <h1>Administración de Productos</h1>

      <div className="abm-layout">
        {/* ===== FORMULARIO ===== */}
        <aside className="altapag">
          <div>
            <h2 className="abm-form-subtitulo">
              {esEdicion ? "Editar producto" : "Nuevo producto"}
            </h2>
            {cargandoForm ? (
              <p>Cargando producto...</p>
            ) : (
              <>
                {portadaActual && (
                  <img src={portadaActual} alt="Portada actual" className="preview-portada" />
                )}
                <form className="formularioAlta" onSubmit={handleSubmit}>
                  <label className="nombre" htmlFor="nombre">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="tipoProducto">Tipo de producto:</label>
                  <select
                    id="tipoProducto"
                    name="tipoProducto"
                    value={form.tipoProducto}
                    onChange={handleChange}
                  >
                    {TIPOS_PRODUCTO.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.etiqueta}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="genero">
                    {form.tipoProducto === "juego" ? "Género:" : "Detalle (ej: Inalámbrico, 1TB):"}
                  </label>
                  <input
                    type="text"
                    id="genero"
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="consola">Consola / Plataforma:</label>
                  <select id="consola" name="consola" value={form.consola} onChange={handleChange}>
                    {CONSOLAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="precio">Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    id="precio"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="stock">Stock:</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />

                  <div className="divFoto">
                    <label htmlFor="foto">
                      Foto{esEdicion ? " (dejar vacío para mantener la actual):" : ":"}
                    </label>
                    <input
                      className="botonFoto"
                      type="file"
                      id="foto"
                      accept="image/*"
                      onChange={(e) => setFoto(e.target.files[0])}
                    />
                  </div>

                  {error && <p className="alerta-error">{error}</p>}
                  {exito && <p className="alerta-exito">{exito}</p>}

                  <input
                    className="botonAlta"
                    type="submit"
                    value={enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Dar de alta"}
                    disabled={enviando}
                  />

                  {esEdicion && (
                    <Link to="/alta" className="cancelar-edicion">
                      Cancelar edición / cargar producto nuevo
                    </Link>
                  )}
                </form>
              </>
            )}
          </div>
        </aside>

        {/* ===== LISTADO (baja + acceso a modificación) ===== */}
        <section className="abm-lista">
          <h2>Catálogo actual</h2>

          {cargandoLista && <p>Cargando productos...</p>}
          {errorLista && <p className="alerta-error">{errorLista}</p>}

          {!cargandoLista && !errorLista && (
            <div className="abm-tabla">
              {productos.map((p) => (
                <div
                  className={`abm-fila ${esEdicion && Number(id) === p.id ? "abm-fila--activa" : ""}`}
                  key={p.id}
                >
                  <img src={p.portada} alt={p.titulo} />
                  <div className="abm-fila-info">
                    <strong>{p.titulo}</strong>
                    <span>
                      {p.categoria} · {p.consola} · ${Number(p.precio).toFixed(2)} · stock {p.stock}
                    </span>
                  </div>
                  <div className="abm-fila-acciones">
                    <Link to={`/editar/${p.id}`} className="botoneditar">
                      Editar
                    </Link>
                    <button className="botonbaja" onClick={() => handleEliminar(p.id, p.titulo)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {productos.length === 0 && <p>Todavía no hay productos cargados.</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
