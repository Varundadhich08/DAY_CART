import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleAuthCallback = async () => {
      // Safety timeout to ensure we don't hang forever
      const timeout = setTimeout(() => {
        console.warn("AuthCallback: Safety timeout triggered, redirecting to home");
        navigate("/");
      }, 10000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeout);
        
        if (error) throw error;

        if (session?.user) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create it with welcome bonus
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.user_metadata.full_name || session.user.email?.split("@")[0],
                wallet_balance: 100, // Welcome bonus
                loyalty_points: 50,  // Welcome bonus
              });

            if (createError) {
              console.error("Error creating profile:", createError);
              toast.error("Failed to create profile");
            } else {
              toast.success("Welcome! You've received a ₹100 bonus and 50 loyalty points.");
            }
          }
          
          navigate("/");
        } else {
          navigate("/auth");
        }
      } catch (error: any) {
        console.error("Error during auth callback:", error);
        toast.error(error.message || "Authentication failed");
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Completing sign in...</p>
      </div>
    </div>
  );
}
