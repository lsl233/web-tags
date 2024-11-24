import { f } from "@/lib/f";
import { useStore } from "@/lib/hooks/store.hook";
import React, { createContext, useContext, useEffect, useState } from "react";
import { signInSchema, signUpSchema } from "shared/auth";
import { UserPayload } from "shared/user";
import { z } from "zod";

// 创建 AuthContext
interface AuthContextType {
  session: UserPayload | null;
  signInInTourist: () => Promise<void>;
  signIn: (data: z.infer<typeof signInSchema>) => Promise<void>;
  signUp: (data: z.infer<typeof signUpSchema>) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true)
  const signIn = async (data: z.infer<typeof signInSchema>) => {
    const res = await f("/api/user/session", {
      method: "POST",
      body: data,
    });
    await chrome.storage.local.set({ token: res });
    await fetchSession()
  };
  const { setSignDialogOpen } = useStore();

  const signInInTourist = async () => {
    let userId = await chrome.storage.local.get("userId")
    if (!userId) {
      const createdGuest = await f("/api/guest", {
        method: "POST",
      });
      userId = createdGuest.id
    }
    
    await chrome.storage.local.set({ userId });
    const token = await f("/api/guest/session", { method: "POST", body: { id: userId } })
    await chrome.storage.local.set({ token });
    await fetchSession()
  }

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
      setLoading(true)
      const res = await f("/api/user/session");
      setSession(res);
    } catch (err) {
      setSession(null);
      console.error('fetchSession', err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, signIn, signInInTourist, signUp, signOut, loading }}>
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
