import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { googleLoginUrl, facebookLoginUrl } from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const user = await login(username, password);
      const destino = location.state?.from || (user.role === "admin" ? "/alta" : "/");
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="fondo">
      <h1>Iniciar sesión</h1>
      <aside className="altapag">
        <div>
          <div className="login-social">
            <a className="btn-social btn-google" href={googleLoginUrl()}>
              <i className="bi bi-google"></i> Continuar con Google
            </a>
            <a className="btn-social btn-facebook" href={facebookLoginUrl()}>
              <i className="bi bi-facebook"></i> Continuar con Facebook
            </a>
          </div>

          <div className="separador-login">
            <span>o con tu usuario</span>
          </div>

          <form className="formularioAlta" onSubmit={handleSubmit}>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Link to="/forgot-password" className="olvide-password">
              ¿Olvidaste tu contraseña?
            </Link>

            {error && <p className="alerta-error">{error}</p>}

            <input
              className="botonAlta"
              type="submit"
              value={cargando ? "Ingresando..." : "Ingresar"}
              disabled={cargando}
            />
          </form>

          <p className="ayuda-login">
            ¿No tenés cuenta? <Link to="/register">Registrate</Link>
          </p>
          <p className="ayuda-login">
            Probá con <strong>admin / admin123</strong> (ve Alta) o{" "}
            <strong>user / user123</strong> (no ve Alta).
          </p>
        </div>
      </aside>
    </main>
  );
}
