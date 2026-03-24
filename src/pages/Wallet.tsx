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
  const { user, profile } = useAuth();
  const [amount, setAmount] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>([]);

  React.useEffect(() => {
    if (user) {
      // Mock transactions
      const mockTransactions: WalletTransaction[] = [
        {
          id: "1",
          userId: user.id,
          amount: 500,
          type: "credit",
          description: "Added to Wallet",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "2",
          userId: user.id,
          amount: 120,
          type: "debit",
          description: "Order Payment #1234",
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setTransactions(mockTransactions);
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
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we'd update the profile state here.
      // For this mock, we'll just show a success message.
      toast.success(`₹${amount} added to wallet!`);
      
      // Update local transactions mock
      const newTx: WalletTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amount: numAmount,
        type: "credit",
        description: "Added to Wallet",
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
      setAmount("");
    } catch (error) {
      console.error("Error adding money:", error);
      toast.error("Failed to add money. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="bg-orange-100 p-2 rounded-lg">
          <WalletIcon className="h-6 w-6 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">DayCart Wallet</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Balance & Add Money */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-orange-600 to-orange-500 text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-medium opacity-80">Current Balance</CardTitle>
              <div className="text-4xl font-bold">₹{profile?.walletBalance?.toFixed(2) ?? "0.00"}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-orange-100 text-sm">
                <CreditCard className="h-4 w-4" />
                <span>Linked Card: **** 4582</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Add Money</CardTitle>
              <CardDescription>Top up your wallet for subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  className="pl-8 text-lg font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["500", "1000", "2000"].map((val) => (
                  <Button 
                    key={val} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-bold"
                    onClick={() => setAmount(val)}
                  >
                    +₹{val}
                  </Button>
                ))}
              </div>
              <Button 
                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg" 
                onClick={handleAddMoney}
                disabled={isAdding}
              >
                {isAdding ? "Processing..." : "Add Money"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: History */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-600 font-bold">Download Statement</Button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No transactions yet
              </div>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id} className="flex flex-row items-center p-4 gap-4 border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {tx.type === "credit" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{tx.description}</h4>
                    <p className="text-xs text-slate-500">{format(new Date(tx.createdAt), "MMM d, yyyy • h:mm a")}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-lg",
                      tx.type === "credit" ? "text-green-600" : "text-slate-900"
                    )}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </p>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">Success</Badge>
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
