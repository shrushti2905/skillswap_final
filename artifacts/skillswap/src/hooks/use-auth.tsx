import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, LoginInput, SignupInput } from "@workspace/api-client-react";
import { useLogin, useSignup, useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("skillswap_token"));
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  useEffect(() => {
    if (token) {
      localStorage.setItem("skillswap_token", token);
    } else {
      localStorage.removeItem("skillswap_token");
    }
  }, [token]);

  const login = async (data: LoginInput) => {
    const res = await loginMutation.mutateAsync({ data });
    setToken(res.token);
    await refetch();
    setLocation("/discover");
  };

  const signup = async (data: SignupInput) => {
    const res = await signupMutation.mutateAsync({ data });
    setToken(res.token);
    await refetch();
    setLocation("/discover");
  };

  const logout = () => {
    setToken(null);
    setLocation("/");
  };

  const isLoading = !!token && isUserLoading;

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
