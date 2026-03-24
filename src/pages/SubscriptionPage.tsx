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
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("productId");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    productId ? SAMPLE_PRODUCTS.find(p => p.id === productId) || null : null
  );

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
    if (!selectedProduct) return 0;
    const perDayFee = selectedProduct.price > 50 ? 25 : 30;
    
    if (planType === "Full Month") {
      return (selectedProduct.price * daysInMonth) + 750;
    }
    return selectedDays.length * (selectedProduct.price + perDayFee);
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
    setIsSubmitting(false);
    
    toast.success(`₹${calculateTotal()} added to wallet! Subscription active.`);
    navigate("/dashboard");
  };

  const openSubscriptionModal = (product: Product) => {
    setSelectedProduct(product);
    setSearchParams({ productId: product.id });
  };

  const closeSubscriptionModal = () => {
    setSelectedProduct(null);
    setSearchParams({});
    setSelectedDays([]);
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
        {subscriptionProducts.map((product) => (
          <motion.div 
            key={product.id} 
            whileHover={{ y: -5 }} 
            transition={{ duration: 0.2 }}
            onClick={() => openSubscriptionModal(product)}
          >
            <Card className="overflow-hidden h-full flex flex-col group cursor-pointer border-slate-200 hover:shadow-xl transition-all rounded-2xl">
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <Badge className="absolute top-2 right-2 bg-orange-600 text-white border-none font-bold">DAILY</Badge>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-900 line-clamp-1 text-lg">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">{product.category}</p>
                  <p className="text-xl font-black text-slate-900">₹{product.price}</p>
                </div>
                <Button variant="outline" className="w-full mt-4 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-black rounded-xl">
                  SUBSCRIBE
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {selectedProduct && (
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
                  <div className="flex gap-6 items-start">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                      <img src={selectedProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <Badge className="bg-orange-100 text-orange-600 border-none mb-2 font-bold uppercase tracking-widest text-[10px]">
                        {selectedProduct.category}
                      </Badge>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedProduct.name}</h2>
                      <p className="text-sm text-slate-500 font-medium">{selectedProduct.description}</p>
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
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">₹{selectedProduct.price > 50 ? 25 : 30} Fee + Product Price per day</p>
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
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Product Price</span>
                        <span className="font-black text-slate-900">₹{selectedProduct.price}</span>
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
                            <span className="font-black text-slate-900">₹{selectedProduct.price * daysInMonth}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Per Day Service Fee</span>
                            <span className="font-black text-slate-900">₹{selectedProduct.price > 50 ? 25 : 30}</span>
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
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Select Payment Method</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setPaymentMethod("UPI")}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all bg-white group",
                            paymentMethod === "UPI" ? "border-orange-600 bg-orange-50" : "border-slate-100 hover:border-orange-500"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            paymentMethod === "UPI" ? "bg-white shadow-sm" : "bg-slate-50 group-hover:bg-orange-50"
                          )}>
                            <Zap className={cn("h-4 w-4", paymentMethod === "UPI" ? "text-orange-600" : "text-slate-600 group-hover:text-orange-600")} />
                          </div>
                          <span className={cn("text-xs font-black uppercase tracking-widest", paymentMethod === "UPI" ? "text-orange-600" : "text-slate-700")}>UPI</span>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod("Card")}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                            paymentMethod === "Card" ? "border-orange-600 bg-orange-50" : "border-slate-100 hover:border-orange-500 bg-white"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            paymentMethod === "Card" ? "bg-white shadow-sm" : "bg-slate-50 group-hover:bg-orange-50"
                          )}>
                            <CreditCard className={cn("h-4 w-4", paymentMethod === "Card" ? "text-orange-600" : "text-slate-600 group-hover:text-orange-600")} />
                          </div>
                          <span className={cn("text-xs font-black uppercase tracking-widest", paymentMethod === "Card" ? "text-orange-600" : "text-slate-700")}>Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Payment Inputs */}
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {paymentMethod === "UPI" ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI ID</label>
                          <input 
                            type="text" 
                            placeholder="username@bank" 
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:outline-none font-bold text-slate-700 transition-all"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                            <input 
                              type="text" 
                              placeholder="0000 0000 0000 0000" 
                              maxLength={16}
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '')})}
                              className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:outline-none font-bold text-slate-700 transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                maxLength={5}
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:outline-none font-bold text-slate-700 transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                              <input 
                                type="password" 
                                placeholder="***" 
                                maxLength={3}
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:outline-none font-bold text-slate-700 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-xl shadow-sm mt-0.5">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Smart Wallet Flow</p>
                        <p className="text-[10px] font-medium text-blue-800 leading-relaxed mt-1">
                          The product amount will be added to your wallet. Daily cost will be auto-deducted only on delivery. If you skip a day, your money stays safe in your wallet!
                        </p>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-14 rounded-2xl text-lg font-black shadow-xl bg-slate-900 hover:bg-orange-600 transition-all" 
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "PROCESSING..." : `PAY ₹${calculateTotal()}`}
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                      Secure payment via Razorpay / Stripe
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
