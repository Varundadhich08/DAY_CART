import * as React from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, getProfile, isSupabaseConfigured } from "../lib/supabase";
import { User } from "../types";

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [profile, setProfile] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  React.useEffect(() => {
    console.log("AuthProvider: useEffect triggered, isSupabaseConfigured:", isSupabaseConfigured);
    
    if (!isSupabaseConfigured) {
      console.log("AuthProvider: Supabase not configured, setting loading to false");
      setLoading(false);
      return;
    }

    // Check current session
    const checkSession = async () => {
      console.log("AuthProvider: checkSession starting");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("AuthProvider: getSession result:", { hasSession: !!session, error });
        if (error) throw error;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("AuthProvider: Fetching profile for user:", session.user.id);
          let profileData = await getProfile(session.user.id);
          console.log("AuthProvider: Profile data:", profileData ? "Found" : "Not Found");
          
          if (!profileData) {
            console.log("AuthProvider: Creating new profile");
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.user_metadata.full_name || session.user.email?.split("@")[0],
                wallet_balance: 100,
                loyalty_points: 50,
              })
              .select()
              .single();
            
            if (!insertError) profileData = newProfile;
            else console.error("AuthProvider: Profile creation error:", insertError);
          }

          if (profileData) {
            setProfile({
              uid: profileData.id,
              email: profileData.email,
              displayName: profileData.display_name,
              walletBalance: profileData.wallet_balance,
              loyaltyPoints: profileData.loyalty_points,
            });
          }
        }
      } catch (error) {
        console.error("AuthProvider: Session check failed:", error);
      } finally {
        console.log("AuthProvider: Setting loading to false (checkSession finally)");
        setLoading(false);
      }
    };

    checkSession();

    // Safety timeout to ensure loading state is cleared
    const timeout = setTimeout(() => {
      console.log("AuthProvider: Safety timeout triggered, setting loading to false");
      setLoading(false);
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: onAuthStateChange event:", event);
      try {
        clearTimeout(timeout);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("AuthProvider: Fetching profile for user (auth change):", session.user.id);
          let profileData = await getProfile(session.user.id);
          
          if (!profileData) {
            console.log("AuthProvider: Creating profile (auth change)");
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.user_metadata.full_name || session.user.email?.split("@")[0],
                wallet_balance: 100,
                loyalty_points: 50,
              })
              .select()
              .single();
            
            if (!insertError) profileData = newProfile;
            else console.error("AuthProvider: Profile creation error (auth change):", insertError);
          }

          if (profileData) {
            setProfile({
              uid: profileData.id,
              email: profileData.email,
              displayName: profileData.display_name,
              walletBalance: profileData.wallet_balance,
              loyaltyPoints: profileData.loyalty_points,
            });
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("AuthProvider: Auth state change failed:", error);
      } finally {
        console.log("AuthProvider: Setting loading to false (auth change finally)");
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
