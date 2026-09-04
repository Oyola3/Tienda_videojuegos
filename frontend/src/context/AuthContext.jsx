import { createContext, useContext, useState } from "react";
import { login as loginRequest, register as registerRequest } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("pichi_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("pichi_token"));

  function persistSession(data) {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("pichi_user", JSON.stringify(data.user));
    localStorage.setItem("pichi_token", data.token);
  }

  async function login(username, password) {
    const data = await loginRequest(username, password);
    persistSession(data);
    return data.user;
  }

  async function register(username, email, password) {
    const data = await registerRequest(username, email, password);
    persistSession(data);
    return data.user;
  }

  // Usado por la pantalla de callback de Google/Facebook: el backend ya
  // hizo el login social y nos pasa el JWT por query string.
  function loginWithToken(newToken, newUser) {
    persistSession({ token: newToken, user: newUser });
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("pichi_user");
    localStorage.removeItem("pichi_token");
  }

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, login, register, loginWithToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
