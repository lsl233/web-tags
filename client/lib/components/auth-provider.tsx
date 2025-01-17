import { f } from "@/lib/f";
import { useSettingsStore } from "@/lib/hooks/settings.store.hook";
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
  const { setActiveTag, setTags, setWebpages } = useStore();
  const { setSettings } = useSettingsStore();
  const signIn = async (data: z.infer<typeof signInSchema>) => {
    const res = await f("/api/user/session", {
      method: "POST",
      body: data,
    });
    await chrome.storage.local.set({ token: res });
    await fetchSession()
  };

  const signInInTourist = async () => {
    const storage = await chrome.storage.local.get("guestId")
    let guestId = storage.guestId
    // if (!guestId) {
    const createdGuest = await f("/api/guest", {
      method: "POST",
    });
    guestId = createdGuest.id
    // }

    await chrome.storage.local.set({ guestId });
    const token = await f("/api/guest/session", { method: "POST", body: { id: guestId } })
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
    setActiveTag(null);
    setTags([]);
    setWebpages([]);
    setSettings({})
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
