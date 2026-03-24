import * as React from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { SAMPLE_PRODUCTS } from "@/src/constants";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<"active" | "history">("active");
  const [subscriptions, setSubscriptions] = React.useState([
    {
      id: "s1",
      productName: "Fresh Milk (1L)",
      productImage: "https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&w=800&q=80",
      timeSlot: "Morning (6–8 AM)",
      planType: "Full Month",
      status: "active" as "active" | "paused",
      nextDelivery: addDays(new Date(), 1),
    },
    {
      id: "s2",
      productName: "Organic Eggs (6pcs)",
      productImage: "https://images.unsplash.com/photo-1516746157585-fa5f4532902a?auto=format&fit=crop&w=800&q=80",
      timeSlot: "Morning (6–8 AM)",
      planType: "Custom Days",
      status: "active" as "active" | "paused",
      nextDelivery: addDays(new Date(), 2),
    }
  ]);

  const handleCancelDay = (subId: string, date: Date) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return { ...sub, nextDelivery: addDays(sub.nextDelivery, 1) };
      }
      return sub;
    }));
    toast.info(`Delivery for ${format(date, "MMM d")} skipped. Next delivery set to ${format(addDays(date, 1), "MMM d")}.`);
  };

  const handleTogglePause = (subId: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        const newStatus = sub.status === "active" ? "paused" : "active";
        toast.success(`Subscription ${newStatus === "active" ? "resumed" : "paused"} successfully.`);
        return { ...sub, status: newStatus };
      }
      return sub;
    }));
  };

  const handleCancelSubscription = (subId: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== subId));
    toast.error("Subscription cancelled and removed.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Your Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage your subscriptions and deliveries</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <Button
            variant={activeTab === "active" ? "primary" : "ghost"}
            size="sm"
            className="rounded-lg font-black uppercase text-[10px] tracking-widest"
            onClick={() => setActiveTab("active")}
          >
            Active
          </Button>
          <Button
            variant={activeTab === "history" ? "primary" : "ghost"}
            size="sm"
            className="rounded-lg font-black uppercase text-[10px] tracking-widest"
            onClick={() => setActiveTab("history")}
          >
            History
          </Button>
        </div>
      </div>

      {activeTab === "active" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No active subscriptions</p>
              <Button onClick={() => navigate("/subscribe")} variant="outline" className="font-black rounded-xl">BROWSE PLANS</Button>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <Card key={sub.id} className={cn(
                "overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all rounded-[2rem]",
                sub.status === "paused" && "opacity-75 grayscale-[0.5]"
              )}>
                <CardHeader className="flex flex-row items-start gap-4 pb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                    <img src={sub.productImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-lg text-slate-900 tracking-tight">{sub.productName}</h3>
                      <Badge className={cn(
                        "rounded-full font-black text-[10px] uppercase tracking-widest px-3",
                        sub.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{sub.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{sub.planType}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center justify-between transition-colors",
                    sub.status === "active" ? "bg-orange-50" : "bg-slate-100"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        {sub.status === "active" ? (
                          <CheckCircle2 className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Pause className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          sub.status === "active" ? "text-orange-600" : "text-slate-400"
                        )}>
                          {sub.status === "active" ? "Next Delivery" : "Subscription Paused"}
                        </p>
                        <p className="text-sm font-black text-slate-900">
                          {sub.status === "active" ? format(sub.nextDelivery, "EEEE, MMM d") : "No upcoming delivery"}
                        </p>
                      </div>
                    </div>
                    {sub.status === "active" && (
                      <Button variant="outline" size="sm" className="bg-white text-[10px] font-black uppercase tracking-widest border-orange-200 text-orange-600 rounded-xl px-4" onClick={() => handleCancelDay(sub.id, sub.nextDelivery)}>
                        Skip Day
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Week</p>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => {
                        const date = addDays(new Date(), i);
                        const isDeliveryDay = sub.status === "active" && isSameDay(date, sub.nextDelivery);
                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-[8px] text-slate-400 font-black uppercase">{format(date, "EEE")}</span>
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                              isDeliveryDay ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-110" : "bg-slate-100 text-slate-600"
                            )}>
                              {format(date, "d")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-4 flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-xl h-10" onClick={() => handleTogglePause(sub.id)}>
                    {sub.status === "active" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Resume</>}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest rounded-xl h-10" onClick={() => handleCancelSubscription(sub.id)}>
                    <Trash2 className="h-3 w-3" /> Cancel
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-row items-center p-4 gap-4 border-slate-200">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Fresh Milk (1L) Delivered</h4>
                <p className="text-sm text-slate-500">{format(addDays(new Date(), -i), "MMMM d, yyyy")} • Morning Slot</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">₹60</p>
                <p className="text-[10px] text-green-600 font-bold uppercase">+5 Points Earned</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Low Wallet Alert Simulation */}
      <Card className="bg-red-50 border-red-100">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-900">Low Wallet Balance</h4>
            <p className="text-sm text-red-700">Your balance is ₹120. Add money to ensure uninterrupted daily deliveries.</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">Add Money</Button>
        </CardContent>
      </Card>
    </div>
  );
}
