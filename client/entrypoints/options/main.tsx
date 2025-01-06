import { AuthProvider } from "@/lib/components/auth-provider";
import { Toaster } from "@/lib/ui/sonner";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import '../main.css';


const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster
        theme="light"
        toastOptions={{ cancelButtonStyle: { right: 0, left: "auto" } }}
        position="top-center"
      />
      <App />
    </AuthProvider>
  </React.StrictMode>
);