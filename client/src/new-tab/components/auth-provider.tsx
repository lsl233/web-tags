import { f } from "@/lib/f";
import React, { createContext, useContext, useEffect, useState } from "react";
import { signInSchema, signUpSchema } from "shared/auth";
import { UserPayload } from "shared/user";
import { z } from "zod";

// 创建 AuthContext
interface AuthContextType {
  session: UserPayload | null;
  signIn: (data: z.infer<typeof signInSchema>) => Promise<void>;
  signUp: (data: z.infer<typeof signUpSchema>) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(false)
  const signIn = async (data: z.infer<typeof signInSchema>) => {
    const res = await f("/api/user/session", {
      method: "POST",
      body: data,
    });
    await chrome.storage.local.set({ token: res });
    await fetchSession()
  };

  const signUp = async (data: z.infer<typeof signUpSchema>) => {
    await f("/api/user", {
      method: "POST",
      body: data,
    });
  };

  const signOut = async () => {
    await chrome.storage.local.remove("token");
    setSession(null);
  };

  const fetchSession = async () => {
    try {
      const res = await f("/api/user/session");
      setSession(res);
    } catch (err) {
      setSession(null);
      console.error('fetchSession', err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用 AuthContext 的 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
