import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Wallet, Trophy, ChevronRight, Zap, Info } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { SAMPLE_PRODUCTS } from "@/src/constants";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/src/components/AuthProvider";
import { useCart } from "@/src/components/CartContext";

export default function InstantCart() {
  const navigate = useNavigate();
  const { profile, updateBalance } = useAuth();
  const { cart, updateQuantity, subtotal, totalItems, removeItem, clearCart } = useCart();

  const [showPreview, setShowPreview] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const deliveryCharge = subtotal >= 150 ? 0 : 25;
  const handlingCharge = 5;
  const total = subtotal + deliveryCharge + handlingCharge;

  const handleCheckout = async () => {
    if (totalItems === 0) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Deduct balance
    updateBalance(-total);
    
    // Add transaction history
    const existingTx = JSON.parse(localStorage.getItem("daycart_transactions") || "[]");
    const newTx = {
      id: `tx-${Date.now()}`,
      type: "instant",
      amount: total,
      description: `Instant order for ${totalItems} items`,
      date: new Date().toISOString(),
      status: "completed"
    };
    localStorage.setItem("daycart_transactions", JSON.stringify([newTx, ...existingTx]));
    
    // Clear cart
    clearCart();
    
    setIsSubmitting(false);
    toast.success("Order placed successfully! Delivery in 12 mins.");
    navigate("/dashboard");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex items-center gap-4">
        <div className="bg-yellow-100 p-2 rounded-xl">
          <Zap className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Instant Cart</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Fastest delivery to your doorstep</p>
        </div>
      </div>

      {totalItems === 0 ? (
        <Card className="p-16 text-center space-y-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <ShoppingCart className="h-10 w-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your cart is empty</h2>
            <p className="text-slate-500 font-medium">Add some items for instant delivery!</p>
          </div>
          <Button 
            onClick={() => navigate("/")}
            className="bg-slate-900 text-white hover:bg-orange-600 transition-colors font-black rounded-xl px-8 h-12"
          >
            BROWSE PRODUCTS
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="flex flex-row items-center p-5 gap-6 border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                  <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-slate-900 text-lg tracking-tight">{item.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.category}</p>
                  <p className="text-sm font-black text-slate-900">₹{item.price} / unit</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-slate-200 transition-colors">
                        <Minus className="h-4 w-4 text-slate-600" />
                      </button>
                      <span className="px-4 text-sm font-black text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-slate-200 transition-colors">
                        <Plus className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-xl tracking-tighter">₹{item.price * item.quantity}</p>
                </div>
              </Card>
            ))}
            
            {subtotal < 150 && (
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Info className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-sm text-orange-800 font-bold">
                  Add items worth <span className="text-orange-600 font-black">₹{150 - subtotal}</span> more for <span className="uppercase tracking-widest">Free Delivery</span>!
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-slate-200 shadow-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl font-black tracking-tight">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-black text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Delivery Charge</span>
                  <span className={cn("font-black", deliveryCharge === 0 ? "text-green-600" : "text-slate-900")}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Handling Charge</span>
                  <span className="font-black text-slate-900">₹{handlingCharge}</span>
                </div>
                
                <div className="h-px bg-slate-100 my-6" />
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Total Amount</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{total}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none font-black px-3 py-1">
                    SECURE
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex flex-col gap-4">
                <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <Wallet className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Payment Method</p>
                    <p className="text-sm font-black text-slate-700">DayCart Wallet (₹{profile?.walletBalance ?? 0})</p>
                  </div>
                </div>

                {!showPreview ? (
                  <Button 
                    className="w-full h-14 rounded-2xl text-lg font-black shadow-xl bg-slate-900 text-white hover:bg-orange-600 transition-all" 
                    onClick={() => {
                      if (profile && profile.walletBalance < total) {
                        toast.error("Insufficient balance! Please top up your wallet.");
                        navigate("/wallet");
                        return;
                      }
                      setShowPreview(true);
                    }}
                  >
                    PROCEED TO CHECKOUT
                  </Button>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 w-full">
                    <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-200 space-y-2">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Wallet Summary</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Current Balance</span>
                        <span className="font-black text-slate-900">₹{profile?.walletBalance}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Deduction</span>
                        <span className="font-black text-red-600">- ₹{total}</span>
                      </div>
                      <div className="h-px bg-orange-200 my-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-900 font-black">Final Balance</span>
                        <span className="font-black text-green-600">₹{(profile?.walletBalance || 0) - total}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-slate-200"
                        onClick={() => setShowPreview(false)}
                        disabled={isSubmitting}
                      >
                        BACK
                      </Button>
                      <Button 
                        className="flex-[2] h-14 rounded-2xl text-lg font-black shadow-xl bg-orange-600 hover:bg-orange-700 transition-all" 
                        onClick={handleCheckout}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <Zap className="h-3 w-3 text-yellow-500 fill-current" /> Delivery in 10–30 mins
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
