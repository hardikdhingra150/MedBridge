import { createContext, useContext } from "react";


export const AuthContext = createContext(null);


export function roleHome(role) {
  const homes = {
    DOCTOR: "/clinical",
    EXPERT: "/review",
    ADMIN: "/admin",
  };
  return homes[role] || "/";
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }
  return context;
}
