import * as React from "react";
import { Trophy, Gift, History, Star, ArrowUpRight, ArrowDownLeft, ShoppingBag } from "lucide-react";
import { useAuth } from "@/src/components/AuthProvider";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { LoyaltyTransaction } from "../types";

export default function Loyalty() {
  const { user, profile, updateLoyaltyPoints } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isRedeeming, setIsRedeeming] = React.useState<string | null>(null);

  React.useEffect(() => {
    const savedTx = JSON.parse(localStorage.getItem("daycart_loyalty_transactions") || "[]");
    if (savedTx.length === 0 && user) {
      const mockTransactions = [
        {
          id: "1",
          userId: user.id,
          points: 150,
          type: "earned",
          description: "Initial Demo Points",
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setTransactions(mockTransactions);
      localStorage.setItem("daycart_loyalty_transactions", JSON.stringify(mockTransactions));
    } else {
      setTransactions(savedTx);
    }
  }, [user]);

  const handleRedeem = async (rewardId: string, points: number, description: string) => {
    if (!profile || profile.loyaltyPoints < points) {
      toast.error("Insufficient loyalty points");
      return;
    }
    if (!user) return;

    setIsRedeeming(rewardId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateLoyaltyPoints(-points);
      
      const newTx = {
        id: `ltx-${Date.now()}`,
        userId: user.id,
        points: points,
        type: "redeemed",
        description: `Redeemed: ${description}`,
        date: new Date().toISOString()
      };
      
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);
      localStorage.setItem("daycart_loyalty_transactions", JSON.stringify(updatedTx));
      
      toast.success(`Successfully redeemed: ${description}`);
    } catch (error) {
      toast.error("Failed to redeem points.");
    } finally {
      setIsRedeeming(null);
    }
  };

  const rewards = [
    { id: "r1", title: "₹50 Wallet Credit", points: 500, description: "Convert points to wallet cash" },
    { id: "r2", title: "Free Delivery Pack", points: 1000, description: "5 free instant deliveries" },
    { id: "r3", title: "₹200 Discount Voucher", points: 1800, description: "Flat discount on next order" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
          <Trophy className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Loyalty Rewards</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Earn points with every delivery</p>
        </div>
      </div>

      {/* Points Overview */}
      <Card className="bg-slate-900 text-white border-none rounded-[2rem] overflow-hidden relative group shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy className="h-48 w-48" />
        </div>
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left space-y-4">
            <p className="text-white/50 font-black uppercase tracking-[0.2em] text-xs">Available Points</p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Star className="h-10 w-10 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-7xl md:text-8xl font-black tracking-tighter">{profile?.loyaltyPoints ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Badge className="bg-orange-500 text-white border-none font-black px-3 py-1 uppercase tracking-widest text-[10px]">
                GOLD TIER
              </Badge>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Top 5% of Users</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 w-full md:w-auto max-w-sm">
            <h4 className="font-black text-lg mb-6 flex items-center gap-3 uppercase tracking-tight">
              <Gift className="h-6 w-6 text-orange-500" /> How to earn?
            </h4>
            <ul className="space-y-4 text-xs font-bold text-white/60 uppercase tracking-widest">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                1 point for every ₹10 spent
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                50% points back on cancellations
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                Bonus points on daily streaks
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Redeem Rewards */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-xl">
              <Gift className="h-5 w-5 text-slate-400" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Redeem Points</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border-slate-100 rounded-3xl hover:shadow-xl transition-all group overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-orange-50 transition-colors">
                      <ShoppingBag className="h-8 w-8 text-slate-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight text-lg">{reward.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{reward.description}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{reward.points} pts</p>
                    <Button 
                      size="sm" 
                      className={cn(
                        "rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] transition-all",
                        (profile?.loyaltyPoints ?? 0) >= reward.points 
                          ? "bg-slate-900 text-white hover:bg-orange-600 shadow-lg" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                      disabled={isRedeeming !== null || (profile?.loyaltyPoints ?? 0) < reward.points}
                      onClick={() => handleRedeem(reward.id, reward.points, reward.title)}
                    >
                      {isRedeeming === reward.id ? "..." : "Redeem"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Points History */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-xl">
              <History className="h-5 w-5 text-slate-400" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Points History</h2>
          </div>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="font-black uppercase tracking-widest text-xs">No history yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-transform group-hover:scale-110",
                      tx.type === "earned" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {tx.type === "earned" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{tx.description}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(tx.date || tx.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-black text-lg tracking-tighter",
                    tx.type === "earned" ? "text-green-600" : "text-orange-600"
                  )}>
                    {tx.type === "earned" ? "+" : "-"}{tx.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
