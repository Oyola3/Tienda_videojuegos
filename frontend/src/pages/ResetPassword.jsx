import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../api/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);
    try {
      await resetPassword(token, password);
      setExito("Contraseña actualizada. Ya podés iniciar sesión.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (!token) {
    return (
      <main className="fondo">
        <h1>Restablecer contraseña</h1>
        <aside className="altapag">
          <p className="alerta-error">
            Falta el token del link. Pedí uno nuevo desde{" "}
            <Link to="/forgot-password">acá</Link>.
          </p>
        </aside>
      </main>
    );
  }

  return (
    <main className="fondo">
      <h1>Restablecer contraseña</h1>
      <aside className="altapag">
        <div>
          <form className="formularioAlta" onSubmit={handleSubmit}>
            <label htmlFor="password">Nueva contraseña:</label>
            <input
              type="password"
              id="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="alerta-error">{error}</p>}
            {exito && <p className="alerta-exito">{exito}</p>}

            <input
              className="botonAlta"
              type="submit"
              value={cargando ? "Guardando..." : "Guardar nueva contraseña"}
              disabled={cargando}
            />
          </form>
        </div>
      </aside>
    </main>
  );
}
