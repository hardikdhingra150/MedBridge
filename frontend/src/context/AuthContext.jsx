import {
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getToken,
  loginUser,
  registerUser,
  logoutSession,
  logoutUser,
} from "../services/api";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!getToken()) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getCurrentUser();
        if (active) setUser(data);
      } catch {
        logoutUser();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    function handleExpired() {
      setUser(null);
      setLoading(false);
    }

    loadUser();
    window.addEventListener(
      "medbridge-auth-expired",
      handleExpired
    );

    return () => {
      active = false;
      window.removeEventListener(
        "medbridge-auth-expired",
        handleExpired
      );
    };
  }, []);

  async function login(email, password) {
    const data = await loginUser(email, password);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await registerUser(name, email, password);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await logoutSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
