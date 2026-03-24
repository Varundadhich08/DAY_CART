import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Clock, 
  Wallet, 
  Trophy, 
  ArrowRight,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { SAMPLE_PRODUCTS } from "@/src/constants";
import { useAuth } from "@/src/components/AuthProvider";
import { useCart } from "@/src/components/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { cart, updateQuantity, totalItems, addToCart } = useCart();

  const getQuantity = (id: string) => {
    return cart.find(item => item.id === id)?.quantity || 0;
  };

  const categories = [
    { name: "Fruits", color: "bg-red-50", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&h=400&q=80" },
    { name: "Vegetables", color: "bg-green-50", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&h=400&q=80" },
    { name: "Dairy", color: "bg-blue-50", image: "https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&w=400&h=400&q=80" },
    { name: "Bakery", color: "bg-orange-50", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=400&q=80" },
    { name: "Snacks", color: "bg-yellow-50", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=400&h=400&q=80" },
    { name: "Beverages", color: "bg-purple-50", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&h=400&q=80" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4 md:px-6">
      {/* 1. Compact Stylish Banner Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-40 md:h-56 rounded-3xl overflow-hidden shadow-xl group"
      >
        {/* Background Image */}
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center p-6 md:p-12">
          
          <div className="max-w-2xl space-y-2 md:space-y-4">
            <Badge className="bg-orange-500 text-white border-none text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit">
              Premium Delivery
            </Badge>

            <div className="space-y-0">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-6xl font-black text-white leading-none tracking-tighter font-display uppercase"
              >
                DAY<span className="text-orange-500">CART</span>
              </motion.h1>
              
              <p className="text-[10px] md:text-lg text-white font-black uppercase tracking-[0.1em] md:tracking-[0.3em] opacity-90 mt-1">
                Everyday Groceries <span className="text-orange-500 italic">Made Easy</span>
              </p>
            </div>

            <Button 
              size="sm"
              onClick={() => navigate("/instant")}
              className="bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-300 font-black rounded-full px-4 md:px-6 h-8 md:h-10 text-[8px] md:text-[10px] uppercase tracking-widest shadow-lg group w-fit"
            >
              Shop Now
              <ArrowRight className="ml-1.5 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. Compact Wallet & Loyalty Section */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-900 text-white border-none rounded-2xl overflow-hidden shadow-md group cursor-pointer" onClick={() => navigate("/wallet")}>
          <CardContent className="p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Wallet className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-[8px] uppercase font-black text-white/50 tracking-widest">Balance</p>
                <p className="text-sm md:text-lg font-black tracking-tight">₹{profile?.walletBalance ?? 0}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 rounded-2xl shadow-sm group cursor-pointer" onClick={() => navigate("/loyalty")}>
          <CardContent className="p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Trophy className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Points</p>
                <p className="text-sm md:text-lg font-black text-slate-900 tracking-tight">{profile?.loyaltyPoints ?? 0}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-orange-600 transition-colors" />
          </CardContent>
        </Card>
      </div>

      {/* 3. Compact Categories Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest">Categories</h2>
          <Button variant="ghost" className="text-[8px] md:text-[10px] h-auto p-0 font-bold text-orange-600 uppercase tracking-widest hover:bg-transparent">View All</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scrollbar-hide">
          {categories.map((cat) => (
            <motion.div 
              key={cat.name} 
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
              onClick={() => navigate(`/instant?category=${cat.name}`)}
            >
              <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl ${cat.color} flex items-center justify-center shadow-sm border border-white overflow-hidden relative`}>
                <img src={cat.image} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tighter">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. All Products Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm md:text-lg font-black text-slate-900 uppercase tracking-widest">All Products</h2>
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
            <Clock className="h-3 w-3 md:h-4 md:w-4" /> 15 Mins Delivery
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {SAMPLE_PRODUCTS.map((product) => (
            <Card key={product.id} className="group border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {product.isSubscriptionEligible && (
                  <Badge className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white border-none text-[8px] font-black tracking-widest px-2 py-0.5">
                    SMART
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <div>
                  <h3 className="text-xs md:text-sm font-black text-slate-900 leading-tight tracking-tight line-clamp-1">{product.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{product.category}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm md:text-lg font-black text-slate-900 tracking-tighter">₹{product.price}</p>
                  
                  {getQuantity(product.id) > 0 ? (
                    <div className="flex items-center bg-orange-50 rounded-xl overflow-hidden border border-orange-100">
                      <button 
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1.5 hover:bg-orange-100 transition-colors"
                      >
                        <Minus className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                      </button>
                      <span className="px-2 md:px-3 text-xs md:text-sm font-black text-orange-600">{getQuantity(product.id)}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1.5 hover:bg-orange-100 transition-colors"
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                      </button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => addToCart(product)}
                      className="h-8 md:h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-orange-600 text-[10px] md:text-xs font-black uppercase tracking-widest"
                    >
                      ADD
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
          >
            <Button 
              onClick={() => navigate("/cart")}
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl shadow-2xl flex items-center justify-between px-6 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">{totalItems} Items Added</p>
                  <p className="text-sm font-black tracking-tight">GO TO YOUR CART</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
