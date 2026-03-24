import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { toast } from "sonner";

export default function Auth() {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create initial user profile
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          walletBalance: 1000, // Welcome bonus
          loyaltyPoints: 100,
          role: 'user'
        });
        toast.success("Welcome to DayCart! You've received a ₹1000 welcome bonus.");
      } else {
        toast.success("Welcome back to DayCart!");
      }
      navigate("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-orange-600 p-8 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">DayCart</h2>
          <p className="text-orange-100 text-sm">Your Daily Essentials, Automated.</p>
        </div>
        
        <CardHeader className="pt-8 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Welcome to DayCart
          </CardTitle>
          <CardDescription>
            Sign in to manage your daily essentials and instant deliveries
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-12 gap-3 text-lg font-bold border-slate-200 hover:bg-slate-50"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">Safe & Secure</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-50 bg-slate-50/50 p-6">
          <p className="text-sm text-slate-500">
            Need help? <a href="#" className="text-orange-600 font-bold hover:underline">Contact Support</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
