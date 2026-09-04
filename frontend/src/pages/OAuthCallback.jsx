import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      navigate("/login", { replace: true });
      return;
    }

    loginWithToken(token, {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    });
    navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="fondo">
      <h1>Ingresando...</h1>
      <p style={{ textAlign: "center" }}>Te estamos redirigiendo, un segundo.</p>
    </main>
  );
}
