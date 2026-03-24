import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { CartProvider } from "./components/CartContext";
import { isSupabaseConfigured } from "./lib/supabase";
import Home from "./pages/Home";
import SubscriptionPage from "./pages/SubscriptionPage";
import Dashboard from "./pages/Dashboard";
import InstantCart from "./pages/InstantCart";
import InstantPage from "./pages/InstantPage";
import Wallet from "./pages/Wallet";
import Loyalty from "./pages/Loyalty";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";

function AppRoutes() {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    console.log("AppRoutes: State Update:", { 
      loading, 
      hasUser: !!user, 
      isSupabaseConfigured 
    });
  }, [loading, user]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Required</h1>
          <p className="text-slate-600 mb-6">
            Please set your Supabase environment variables in the <strong>Secrets</strong> panel:
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-left font-mono text-sm space-y-2 mb-6">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="text-xs text-slate-400">
            Once configured, the app will load automatically.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <div className="text-center animate-pulse">
          <p className="text-slate-600 font-medium">Loading your essentials...</p>
          <p className="text-slate-400 text-xs mt-2">This usually takes a few seconds.</p>
        </div>
        <div className="mt-8 max-w-xs text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
            If this takes more than 10 seconds, please check your internet connection or verify your Supabase configuration in the Secrets panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/subscriptions" element={<SubscriptionPage />} />
                <Route path="/instant" element={<InstantPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cart" element={<InstantCart />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/loyalty" element={<Loyalty />} />
                <Route path="/profile" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" richColors />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
