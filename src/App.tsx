import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { CartProvider } from "./components/CartContext";
import Home from "./pages/Home";
import SubscriptionPage from "./pages/SubscriptionPage";
import Dashboard from "./pages/Dashboard";
import InstantCart from "./pages/InstantCart";
import InstantPage from "./pages/InstantPage";
import Wallet from "./pages/Wallet";
import Loyalty from "./pages/Loyalty";
import Auth from "./pages/Auth";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <div className="text-center animate-pulse">
          <p className="text-slate-600 font-medium">Loading your essentials...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
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
