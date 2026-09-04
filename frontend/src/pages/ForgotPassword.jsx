import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setDevLink("");
    setCargando(true);
    try {
      const data = await forgotPassword(email);
      setMensaje(data.mensaje);
      if (data.devLink) setDevLink(data.devLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="fondo">
      <h1>Recuperar contraseña</h1>
      <aside className="altapag">
        <div>
          <form className="formularioAlta" onSubmit={handleSubmit}>
            <label htmlFor="email">Email de tu cuenta:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="alerta-error">{error}</p>}
            {mensaje && <p className="alerta-exito">{mensaje}</p>}
            {devLink && (
              <p className="ayuda-login">
                (Modo desarrollo, sin email real configurado) Link de prueba:{" "}
                <Link to={devLink.replace(window.location.origin, "")}>{devLink}</Link>
              </p>
            )}

            <input
              className="botonAlta"
              type="submit"
              value={cargando ? "Enviando..." : "Enviar link"}
              disabled={cargando}
            />
          </form>
          <p className="ayuda-login">
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </aside>
    </main>
  );
}
