import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Calendar, Wallet, Trophy, Home, User, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "./ui/Button";
import { useAuth } from "./AuthProvider";

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Subscriptions", path: "/subscriptions", icon: Calendar },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Loyalty", path: "/loyalty", icon: Trophy },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-orange-600 p-1.5 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DayCart</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>
          
          {profile && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</span>
                <span className="text-sm font-black text-slate-900">₹{profile.walletBalance}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-slate-400 hover:text-red-600">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Nav (Persistent) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 h-16 flex items-center justify-around z-50">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors",
              location.pathname === item.path ? "text-orange-600" : "text-slate-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
