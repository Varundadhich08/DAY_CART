import * as React from "react";
import { User } from "../types";

interface AuthContextType {
  user: any | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
});

export const useAuth = () => React.useContext(AuthContext);

const MOCK_USER: User = {
  uid: "mock-user-123",
  email: "demo@daycart.com",
  displayName: "Demo User",
  walletBalance: 500,
  loyaltyPoints: 120,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<any | null>(null);
  const [profile, setProfile] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const signOut = async () => {
    localStorage.removeItem("daycart_user");
    setUser(null);
    setProfile(null);
  };

  const signIn = async (email: string) => {
    const newUser = { ...MOCK_USER, email };
    localStorage.setItem("daycart_user", JSON.stringify(newUser));
    setUser({ id: newUser.uid, email: newUser.email });
    setProfile(newUser);
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem("daycart_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser({ id: parsedUser.uid, email: parsedUser.email });
      setProfile(parsedUser);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};
