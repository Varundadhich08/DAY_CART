import * as React from "react";
import { Wallet as WalletIcon, Plus, History, CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/src/components/AuthProvider";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { WalletTransaction } from "../types";

export default function Wallet() {
  const { user, profile, updateBalance } = useAuth();
  const [amount, setAmount] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [transactions, setTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const savedTx = JSON.parse(localStorage.getItem("daycart_transactions") || "[]");
    if (savedTx.length === 0 && user) {
      const mockTransactions = [
        {
          id: "1",
          userId: user.id,
          amount: 500,
          type: "credit",
          description: "Initial Demo Credit",
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "completed"
        }
      ];
      setTransactions(mockTransactions);
      localStorage.setItem("daycart_transactions", JSON.stringify(mockTransactions));
    } else {
      setTransactions(savedTx);
    }
  }, [user]);

  const handleAddMoney = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!user || !profile) return;

    setIsAdding(true);
    try {
      const numAmount = Number(amount);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateBalance(numAmount);
      
      const newTx = {
        id: `tx-${Date.now()}`,
        userId: user.id,
        amount: numAmount,
        type: "credit",
        description: "Added to Wallet",
        date: new Date().toISOString(),
        status: "completed"
      };
      
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);
      localStorage.setItem("daycart_transactions", JSON.stringify(updatedTx));
      
      toast.success(`₹${amount} added to wallet!`);
      setAmount("");
    } catch (error) {
      toast.error("Failed to add money.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
          <WalletIcon className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">DayCart Wallet</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Secure funds for your daily essentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Balance & Add Money */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[2rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <WalletIcon className="h-32 w-32" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Current Balance</CardTitle>
              <div className="text-5xl font-black tracking-tighter mt-2">₹{profile?.walletBalance?.toFixed(2) ?? "0.00"}</div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                <CreditCard className="h-4 w-4" />
                <span>Linked Card: **** 4582</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 rounded-[2rem] shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-black tracking-tight">Add Money</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Top up for subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-10 h-14 text-2xl font-black rounded-2xl border-2 border-slate-100 focus:border-orange-500 transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["500", "1000", "2000"].map((val) => (
                  <Button 
                    key={val} 
                    variant="outline" 
                    className="h-10 text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-200 hover:border-orange-500 hover:text-orange-600 transition-all"
                    onClick={() => setAmount(val)}
                  >
                    +₹{val}
                  </Button>
                ))}
              </div>
              <Button 
                className="w-full h-14 rounded-2xl text-lg font-black shadow-xl bg-slate-900 text-white hover:bg-orange-600 transition-all" 
                onClick={handleAddMoney}
                disabled={isAdding}
              >
                {isAdding ? "PROCESSING..." : "ADD MONEY NOW"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-xl">
                <History className="h-5 w-5 text-slate-400" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Transactions</h2>
            </div>
            <Button variant="ghost" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:bg-transparent">View All</Button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="font-black uppercase tracking-widest text-xs">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id} className="flex flex-row items-center p-5 gap-5 border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                    tx.type === "credit" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {tx.type === "credit" ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{tx.description}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(tx.date || tx.createdAt), "MMM d, yyyy • h:mm a")}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-black text-xl tracking-tighter",
                      tx.type === "credit" ? "text-green-600" : "text-slate-900"
                    )}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </p>
                    <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                      SUCCESS
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
