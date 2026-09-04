import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { cantidadTotal } = useCart();
  const navigate = useNavigate();

  function closeMenu() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark pichi-navbar">
      <div className="container">
        <Link
          className="navbar-brand fw-bold d-flex align-items-center gap-2"
          to="/"
          onClick={closeMenu}
        >
          <img src="/img/logo.svg" alt="Pichi-Gamez" className="logo-pichi" />
          Pichi-Gamez
        </Link>

        {/* BOTÓN HAMBURGUESA */}
        <button
          className={`navbar-toggler ${open ? "is-active" : ""}`}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-controls="navbarNav"
          aria-expanded={open}
          aria-label="Abrir menú de navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENÚ COLAPSABLE */}
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="navbarNav">
          <div className="ms-auto d-flex flex-column flex-lg-row gap-2 align-items-lg-center py-3 py-lg-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `btn btn-outline-light ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              Inicio
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/alta"
                className={({ isActive }) => `btn btn-outline-light ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                Alta
              </NavLink>
            )}

            <NavLink
              to="/contacto"
              className={({ isActive }) => `btn btn-outline-light ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              Contacto
            </NavLink>

            <NavLink
              to="/nosotros"
              className={({ isActive }) => `btn btn-outline-light ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              Nosotros
            </NavLink>

            <NavLink
              to="/carrito"
              className={({ isActive }) => `btn btn-outline-light pichi-cart-link ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              <i className="bi bi-cart3"></i>
              Carrito
              {cantidadTotal > 0 && <span className="cart-badge">{cantidadTotal}</span>}
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/mis-compras"
                  className={({ isActive }) => `btn btn-outline-light ${isActive ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  Mis compras
                </NavLink>
                <span className="pichi-user-pill">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.username} {isAdmin && <span className="badge-admin">admin</span>}
                </span>
                <button className="btn btn-light" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-light" onClick={closeMenu}>
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn btn-outline-light"
                  onClick={closeMenu}
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
