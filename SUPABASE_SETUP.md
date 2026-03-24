# Supabase Setup Guide for DayCart

To get your application fully functional, you need to set up the database schema in your Supabase project.

## 1. SQL Schema
Copy and paste the following SQL into the **SQL Editor** in your Supabase Dashboard and run it:

```sql
-- 1. Create Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  is_subscription_eligible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  time_slot TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  next_delivery TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Wallet Transactions table
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- 'credit' or 'debit'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Loyalty Transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earn' or 'redeem'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can only manage their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Wallet Transactions: Users can only view their own transactions
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Loyalty Transactions: Users can only view their own transactions
CREATE POLICY "Users can view own loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id);

-- Products: Everyone can view products
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT USING (true);
```

## 2. Authentication Settings
1. Go to **Authentication** -> **Providers**.
2. Enable **Google** (if you want to use Google Sign-In).
3. Ensure **Email** is enabled.
4. Set the **Site URL** in **Authentication** -> **URL Configuration** to your App URL:
   `https://ais-dev-qg4kleg33yq7suqxoalh2n-58848306785.asia-southeast1.run.app`

## 3. Environment Variables
Make sure you have added these to your AI Studio Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
