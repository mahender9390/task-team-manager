import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export type Role = "Admin" | "Member";
export interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem("ttm_token");
      const u = localStorage.getItem("ttm_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {}
    setLoading(false);
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem("ttm_token", t);
    localStorage.setItem("ttm_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login: AuthCtx["login"] = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
  };

  const signup: AuthCtx["signup"] = async (name, email, password, role) => {
    const { data } = await api.post("/auth/signup", { name, email, password, role });
    persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem("ttm_token");
    localStorage.removeItem("ttm_user");
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}