import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format, addDays, isSameDay, isAfter, startOfDay, getDaysInMonth } from "date-fns";
import { ChevronLeft, Info, CheckCircle2, Calendar as CalendarIcon, Clock, CreditCard, X, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/Card";
import { Calendar } from "@/src/components/ui/Calendar";
import { Badge } from "@/src/components/ui/Badge";
import { SAMPLE_PRODUCTS } from "@/src/constants";
import { cn } from "@/src/lib/utils";
import { TimeSlot, PlanType, Product } from "@/src/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/components/AuthProvider";

export default function SubscriptionPage() {
  const { profile, updateBalance } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subsCart, setSubsCart] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId) {
      const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
      if (product && !subsCart.some(p => p.id === productId)) {
        setSubsCart(prev => [...prev, product]);
      }
    }
  }, [searchParams]);

  const [showPreview, setShowPreview] = React.useState(false);

  const subscriptionProducts = SAMPLE_PRODUCTS.filter((p) => p.isSubscriptionEligible);

  const [timeSlot, setTimeSlot] = React.useState<TimeSlot>("Morning (6–8 AM)");
  const [planType, setPlanType] = React.useState<PlanType>("Full Month");
  const [selectedDays, setSelectedDays] = React.useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"UPI" | "Card">("Card");
  const [upiId, setUpiId] = React.useState("");
  const [cardDetails, setCardDetails] = React.useState({
    number: "",
    expiry: "",
    cvv: ""
  });

  const daysInMonth = getDaysInMonth(new Date());

  const handleDayClick = (day: Date) => {
    if (planType === "Full Month") return;
    
    if (!isAfter(startOfDay(day), startOfDay(new Date()))) {
      toast.error("Cannot select past or current date");
      return;
    }

    const exists = selectedDays.some((d) => isSameDay(d, day));
    if (exists) {
      setSelectedDays(selectedDays.filter((d) => !isSameDay(d, day)));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const calculateTotal = () => {
    if (subsCart.length === 0) return 0;
    
    const productCost = subsCart.reduce((acc, p) => acc + p.price, 0);
    const perDayFee = productCost > 50 ? 28 : 33;
    
    if (planType === "Full Month") {
      return (productCost * daysInMonth) + 750;
    }
    return selectedDays.length * (productCost + perDayFee);
  };

  const handleConfirm = async () => {
    if (planType === "Custom Days" && selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    if (paymentMethod === "UPI" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    if (paymentMethod === "Card") {
      if (cardDetails.number.length < 16) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardDetails.expiry.includes("/")) {
        toast.error("Please enter expiry in MM/YY format");
        return;
      }
      if (cardDetails.cvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return;
      }
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const total = calculateTotal();
    
    // Save subscription to localStorage
    const newSub = {
      id: `sub-${Date.now()}`,
      items: subsCart.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image
      })),
      timeSlot,
      planType,
      status: "active",
      nextDelivery: addDays(new Date(), 1),
      totalPaid: total,
      createdAt: new Date().toISOString()
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("daycart_subscriptions") || "[]");
    localStorage.setItem("daycart_subscriptions", JSON.stringify([...existingSubs, newSub]));
    
    // Update wallet balance
    updateBalance(-total);
    
    // Add transaction history
    const existingTx = JSON.parse(localStorage.getItem("daycart_transactions") || "[]");
    const newTx = {
      id: `tx-${Date.now()}`,
      type: "subscription",
      amount: total,
      description: `Subscription for ${subsCart.length} items`,
      date: new Date().toISOString(),
      status: "completed"
    };
    localStorage.setItem("daycart_transactions", JSON.stringify([newTx, ...existingTx]));

    setIsSubmitting(false);
    toast.success(`₹${total} deducted from wallet. Subscription active!`);
    setSubsCart([]);
    navigate("/dashboard");
  };

  const toggleSubsCart = (product: Product) => {
    const exists = subsCart.find(p => p.id === product.id);
    if (exists) {
      setSubsCart(subsCart.filter(p => p.id !== product.id));
      toast.info(`Removed ${product.name} from subscription cart`);
    } else {
      setSubsCart([...subsCart, product]);
      toast.success(`Added ${product.name} to subscription cart`);
    }
  };

  const openSubscriptionModal = () => {
    if (subsCart.length === 0) {
      toast.error("Please add at least one product to your subscription cart");
      return;
    }
    setIsModalOpen(true);
  };

  const closeSubscriptionModal = () => {
    setIsModalOpen(false);
    setSelectedDays([]);
    setShowPreview(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Smart Subscriptions</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Freshness delivered daily on your schedule</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {subscriptionProducts.map((product) => {
          const isInCart = subsCart.some(p => p.id === product.id);
          return (
            <motion.div 
              key={product.id} 
              whileHover={{ y: -5 }} 
              transition={{ duration: 0.2 }}
              onClick={() => toggleSubsCart(product)}
            >
              <Card className={cn(
                "overflow-hidden h-full flex flex-col group cursor-pointer border-slate-200 hover:shadow-xl transition-all rounded-2xl",
                isInCart && "ring-4 ring-orange-600 ring-offset-2"
              )}>
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <Badge className="absolute top-2 right-2 bg-orange-600 text-white border-none font-bold">DAILY</Badge>
                  {isInCart && (
                    <div className="absolute inset-0 bg-orange-600/20 flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-orange-600 fill-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 line-clamp-1 text-lg">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">{product.category}</p>
                    <p className="text-xl font-black text-slate-900">₹{product.price}</p>
                  </div>
                  <Button 
                    variant={isInCart ? "primary" : "outline"}
                    className={cn(
                      "w-full mt-4 font-black rounded-xl",
                      !isInCart && "border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                    )}
                  >
                    {isInCart ? "ADDED" : "ADD TO SUBS"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Cart Button */}
      {subsCart.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
        >
          <Button 
            onClick={openSubscriptionModal}
            className="w-full h-16 rounded-3xl bg-slate-900 text-white shadow-2xl flex items-center justify-between px-8 group hover:bg-orange-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-xl group-hover:bg-white transition-colors">
                <Zap className="h-5 w-5 text-white group-hover:text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest opacity-70">Subscription Cart</p>
                <p className="font-black text-lg">{subsCart.length} Items Selected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl">₹{subsCart.reduce((acc, p) => acc + p.price, 0)}/day</span>
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </div>
          </Button>
        </motion.div>
      )}

      {/* Subscription Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSubscriptionModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl"
            >
              <button 
                onClick={closeSubscriptionModal}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
              >
                <X className="h-6 w-6 text-slate-600" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Product Info & Options */}
                <div className="p-8 space-y-8 border-r border-slate-100">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Items</h2>
                    <div className="flex flex-wrap gap-3">
                      {subsCart.map(p => (
                        <div key={p.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-xs font-black text-slate-700">{p.name}</span>
                          <button onClick={() => setSubsCart(subsCart.filter(item => item.id !== p.id))} className="p-1 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">1. Delivery Time</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Morning (6–8 AM)", "Evening (6–8 PM)"] as TimeSlot[]).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTimeSlot(slot)}
                          className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all",
                            timeSlot === slot
                              ? "border-orange-600 bg-orange-50 shadow-sm"
                              : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                          )}
                        >
                          <p className={cn("font-black text-sm", timeSlot === slot ? "text-orange-600" : "text-slate-900")}>{slot}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-orange-600" />
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">2. Select Plan</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => {
                          setPlanType("Full Month");
                          setSelectedDays([]);
                        }}
                        className={cn(
                          "p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                          planType === "Full Month"
                            ? "border-orange-600 bg-orange-50 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                        )}
                      >
                        <div>
                          <p className={cn("font-black text-lg", planType === "Full Month" ? "text-orange-600" : "text-slate-900")}>Full Month Plan</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">₹750 Subscription Fee + Product Price</p>
                        </div>
                        {planType === "Full Month" && <CheckCircle2 className="h-6 w-6 text-orange-600" />}
                      </button>

                      <button
                        onClick={() => setPlanType("Custom Days")}
                        className={cn(
                          "p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                          planType === "Custom Days"
                            ? "border-orange-600 bg-orange-50 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                        )}
                      >
                        <div>
                          <p className={cn("font-black text-lg", planType === "Custom Days" ? "text-orange-600" : "text-slate-900")}>Custom Days</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">₹28 (if &gt;₹50) or ₹33 Fee + Product Price per day</p>
                        </div>
                        {planType === "Custom Days" && <CheckCircle2 className="h-6 w-6 text-orange-600" />}
                      </button>
                    </div>
                  </div>

                  {planType === "Custom Days" && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-4">
                      <Calendar
                        selectedDays={selectedDays}
                        onDayClick={handleDayClick}
                        className="w-full border-2 border-slate-100 rounded-3xl p-4"
                      />
                    </div>
                  )}
                </div>

                {/* Right: Summary & Checkout */}
                <div className="p-8 bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Subscription Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Daily Product Total</span>
                        <span className="font-black text-slate-900">₹{subsCart.reduce((acc, p) => acc + p.price, 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Plan Type</span>
                        <span className="font-black text-slate-900">{planType}</span>
                      </div>
                      {planType === "Full Month" ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Subscription Fee</span>
                            <span className="font-black text-slate-900">₹750</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Monthly Product Cost ({daysInMonth} days)</span>
                            <span className="font-black text-slate-900">₹{subsCart.reduce((acc, p) => acc + p.price, 0) * daysInMonth}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Daily Service Fee</span>
                            <span className="font-black text-slate-900">₹{subsCart.reduce((acc, p) => acc + p.price, 0) > 50 ? 28 : 33}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Selected Days</span>
                            <span className="font-black text-slate-900">{selectedDays.length} days</span>
                          </div>
                        </>
                      )}
                      
                      <div className="h-px bg-slate-200 my-6" />
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Total Amount</p>
                          <p className="text-4xl font-black text-orange-600">₹{calculateTotal()}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 border-none font-black px-3 py-1">
                          <Zap className="h-3 w-3 mr-1 fill-current" /> SMART SAVER
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    {!showPreview ? (
                      <Button 
                        className="w-full h-14 rounded-2xl text-lg font-black shadow-xl bg-slate-900 hover:bg-orange-600 transition-all" 
                        onClick={() => {
                          if (profile && profile.walletBalance < calculateTotal()) {
                            toast.error("Insufficient balance! Please top up your wallet.");
                            navigate("/wallet");
                            return;
                          }
                          setShowPreview(true);
                        }}
                      >
                        PROCEED TO PREVIEW
                      </Button>
                    ) : (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-200 space-y-2">
                          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Wallet Summary</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Current Balance</span>
                            <span className="font-black text-slate-900">₹{profile?.walletBalance}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Deduction</span>
                            <span className="font-black text-red-600">- ₹{calculateTotal()}</span>
                          </div>
                          <div className="h-px bg-orange-200 my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-900 font-black">Final Balance</span>
                            <span className="font-black text-green-600">₹{(profile?.walletBalance || 0) - calculateTotal()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-slate-200"
                            onClick={() => setShowPreview(false)}
                          >
                            BACK
                          </Button>
                          <Button 
                            className="flex-[2] h-14 rounded-2xl text-lg font-black shadow-xl bg-orange-600 hover:bg-orange-700 transition-all" 
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "CONFIRMING..." : "CONFIRM & PAY"}
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                      Secure payment via DayCart Wallet
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
