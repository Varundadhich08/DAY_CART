import { supabase } from "../lib/supabase";
import { 
  User, 
  Product, 
  Subscription, 
  WalletTransaction, 
  LoyaltyTransaction 
} from "../types";

export const supabaseService = {
  // User Profile
  async getUserProfile(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      return {
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        walletBalance: data.wallet_balance,
        loyaltyPoints: data.loyalty_points,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) throw error;
      return data as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  // Subscriptions
  async createSubscription(subscription: Omit<Subscription, "id">): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: subscription.userId,
          product_id: subscription.productId,
          product_name: subscription.productName,
          product_image: subscription.productImage,
          time_slot: subscription.timeSlot,
          plan_type: subscription.planType,
          status: subscription.status,
          next_delivery: subscription.nextDelivery,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating subscription:", error);
      return "";
    }
  },

  // Wallet
  async updateWalletBalance(userId: string, newBalance: number, transaction: Omit<WalletTransaction, "id">) {
    try {
      // 1. Update balance
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);
      
      if (profileError) throw profileError;

      // 2. Add transaction
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          created_at: new Date().toISOString()
        });
      
      if (txError) throw txError;
    } catch (error) {
      console.error("Error updating wallet balance:", error);
    }
  },

  // Loyalty
  async updateLoyaltyPoints(userId: string, newPoints: number, transaction: Omit<LoyaltyTransaction, "id">) {
    try {
      // 1. Update points
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ loyalty_points: newPoints })
        .eq("id", userId);
      
      if (profileError) throw profileError;

      // 2. Add transaction
      const { error: txError } = await supabase
        .from("loyalty_transactions")
        .insert({
          user_id: userId,
          points: transaction.points,
          type: transaction.type,
          description: transaction.description,
          created_at: new Date().toISOString()
        });
      
      if (txError) throw txError;
    } catch (error) {
      console.error("Error updating loyalty points:", error);
    }
  }
};
