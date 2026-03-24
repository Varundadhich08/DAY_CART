export interface User {
  uid: string;
  email: string;
  displayName: string;
  walletBalance: number;
  loyaltyPoints: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isSubscriptionEligible: boolean;
  isInstantEligible: boolean;
  estimatedDeliveryTime?: string; // For instant delivery
}

export type TimeSlot = "Morning (6–8 AM)" | "Evening (6–8 PM)";
export type PlanType = "Full Month" | "Custom Days";

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  timeSlot: TimeSlot;
  planType: PlanType;
  startDate: string;
  endDate: string;
  status: "active" | "paused" | "cancelled";
  totalCost: number;
  nextDelivery?: string;
}

export interface SubscriptionDay {
  id: string;
  subscriptionId: string;
  userId: string;
  date: string; // ISO string
  status: "scheduled" | "delivered" | "cancelled";
  refundedPoints?: number;
}

export interface Order {
  id: string;
  userId: string;
  type: "subscription" | "instant";
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: "placed" | "processing" | "delivered" | "cancelled";
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  createdAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: "earned" | "redeemed";
  description: string;
  createdAt: string;
}
