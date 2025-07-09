-- Create custom types
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'airtime', 'data');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.currency_type AS ENUM ('USD', 'NGN', 'ZAR', 'BTC', 'ETH', 'USDT');
CREATE TYPE public.notification_type AS ENUM ('sms', 'email');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  account_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts table for balances
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency currency_type NOT NULL DEFAULT 'USD',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',
  status transaction_status NOT NULL DEFAULT 'pending',
  description TEXT,
  reference_id TEXT UNIQUE,
  recipient_account TEXT,
  recipient_name TEXT,
  bank_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON public.accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" 
ON public.accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin settings - only readable by authenticated users, writable by system
CREATE POLICY "Authenticated users can read admin settings" 
ON public.admin_settings FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create function to generate account numbers
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_account_number TEXT;
BEGIN
  -- Generate unique account number
  LOOP
    new_account_number := public.generate_account_number();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE account_number = new_account_number);
  END LOOP;
  
  -- Insert profile
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    country, 
    account_number
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'country', ''),
    new_account_number
  );
  
  -- Create default USD account
  INSERT INTO public.accounts (user_id, currency, balance) 
  VALUES (NEW.id, 'USD', 0.00);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update balances
CREATE OR REPLACE FUNCTION public.update_account_balance(
  p_user_id UUID,
  p_currency currency_type,
  p_amount DECIMAL(15,2),
  p_operation TEXT -- 'add' or 'subtract'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL(15,2);
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.accounts 
  WHERE user_id = p_user_id AND currency = p_currency;
  
  -- Check if account exists
  IF current_balance IS NULL THEN
    -- Create account if it doesn't exist
    INSERT INTO public.accounts (user_id, currency, balance) 
    VALUES (p_user_id, p_currency, 
      CASE WHEN p_operation = 'add' THEN p_amount ELSE 0 END
    );
    RETURN TRUE;
  END IF;
  
  -- Update balance
  IF p_operation = 'add' THEN
    UPDATE public.accounts 
    SET balance = balance + p_amount, updated_at = now()
    WHERE user_id = p_user_id AND currency = p_currency;
  ELSIF p_operation = 'subtract' THEN
    -- Check if sufficient balance
    IF current_balance >= p_amount THEN
      UPDATE public.accounts 
      SET balance = balance - p_amount, updated_at = now()
      WHERE user_id = p_user_id AND currency = p_currency;
    ELSE
      RETURN FALSE; -- Insufficient balance
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('deposit_account_usd', '1234567890', 'USD deposit account number'),
('deposit_account_ngn', '0123456789', 'NGN deposit account number'),
('deposit_account_zar', '9876543210', 'ZAR deposit account number'),
('admin_email', 'admin@gvbank.com', 'Admin email for notifications'),
('bank_name', 'GV BANK', 'Official bank name'),
('sms_enabled', 'true', 'Enable SMS notifications'),
('email_enabled', 'true', 'Enable email notifications');