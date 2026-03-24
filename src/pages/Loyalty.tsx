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
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = React.useState<LoyaltyTransaction[]>([]);
  const [isRedeeming, setIsRedeeming] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      // Mock transactions
      const mockTransactions: LoyaltyTransaction[] = [
        {
          id: "1",
          userId: user.id,
          points: 150,
          type: "earned",
          description: "Order #1234 earned points",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "2",
          userId: user.id,
          points: 50,
          type: "earned",
          description: "Daily streak bonus",
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setTransactions(mockTransactions);
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we'd update the profile state here. 
      // For this mock, we'll just show a success message.
      toast.success(`Successfully redeemed: ${description}`);
      
      // Update local transactions mock
      const newTx: LoyaltyTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        points: points,
        type: "redeemed",
        description: `Redeemed: ${description}`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    } catch (error) {
      console.error("Error redeeming points:", error);
      toast.error("Failed to redeem points. Please try again.");
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Trophy className="h-6 w-6 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Loyalty Rewards</h1>
      </div>

      {/* Points Overview */}
      <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="h-48 w-48" />
        </div>
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Available Points</p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <span className="text-6xl font-black">{profile?.loyaltyPoints ?? 0}</span>
            </div>
            <p className="text-slate-400 text-sm">You're in the <span className="text-yellow-500 font-bold">Gold Tier</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full md:w-auto">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-yellow-500" /> How to earn?
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                1 point for every ₹10 spent
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                50% points back on cancellations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Bonus points on daily streaks
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Redeem Rewards */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900">Redeem Points</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border-slate-200 hover:border-orange-200 transition-colors group">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-orange-50 transition-colors">
                      <ShoppingBag className="h-6 w-6 text-slate-600 group-hover:text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{reward.title}</h4>
                      <p className="text-xs text-slate-500">{reward.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 mb-2">{reward.points} pts</p>
                    <Button 
                      size="sm" 
                      variant={(profile?.loyaltyPoints ?? 0) >= reward.points ? "primary" : "outline"}
                      className="rounded-full text-xs"
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
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900">Points History</h2>
          </div>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No history yet
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      tx.type === "earned" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {tx.type === "earned" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{tx.description}</h4>
                      <p className="text-[10px] text-slate-500">{format(new Date(tx.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-bold",
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
