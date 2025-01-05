import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '../main.css';
import { AuthProvider } from "@/lib/components/auth-provider";
import { Toaster } from '@/lib/ui/sonner.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <AuthProvider>
      <Toaster
        theme="light"
        toastOptions={{ duration: 1500, cancelButtonStyle: { right: 0, left: "auto" } }}
        position="top-center"
      />
        <App />
    </AuthProvider>
  </React.StrictMode>,
);
