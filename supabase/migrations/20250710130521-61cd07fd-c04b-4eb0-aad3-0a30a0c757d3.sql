-- Create enum for transfer types
CREATE TYPE public.transfer_type AS ENUM ('internal', 'external', 'crypto');

-- Create enum for crypto currency types
CREATE TYPE public.crypto_type AS ENUM ('BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'DOT');

-- Create bank details table for admin-managed bank accounts
CREATE TABLE public.bank_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  swift_code TEXT,
  routing_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crypto wallets table for admin-managed crypto addresses
CREATE TABLE public.crypto_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crypto_type crypto_type NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update transactions table to support more fields
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transfer_type transfer_type DEFAULT 'external';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS crypto_type crypto_type;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recipient_user_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS bank_details_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS crypto_wallet_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency currency_type NOT NULL,
  withdrawal_method TEXT NOT NULL, -- 'bank', 'crypto', 'cash'
  bank_details_id UUID,
  crypto_wallet_id UUID,
  status transaction_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for bank_details (public read, admin only write)
CREATE POLICY "Everyone can view active bank details" 
ON public.bank_details 
FOR SELECT 
USING (is_active = true);

-- Create policies for crypto_wallets (public read, admin only write)
CREATE POLICY "Everyone can view active crypto wallets" 
ON public.crypto_wallets 
FOR SELECT 
USING (is_active = true);

-- Create policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests" 
ON public.withdrawal_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own withdrawal requests" 
ON public.withdrawal_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to process internal transfers
CREATE OR REPLACE FUNCTION public.process_internal_transfer(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount NUMERIC,
  p_currency currency_type,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  from_balance NUMERIC;
  transaction_id UUID;
BEGIN
  -- Check sender balance
  SELECT balance INTO from_balance 
  FROM public.accounts 
  WHERE user_id = p_from_user_id AND currency = p_currency;
  
  IF from_balance IS NULL OR from_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Create transaction record for sender
  INSERT INTO public.transactions (
    user_id, amount, currency, transaction_type, status, description,
    transfer_type, recipient_user_id
  ) VALUES (
    p_from_user_id, p_amount, p_currency, 'transfer_out', 'completed', p_description,
    'internal', p_to_user_id
  ) RETURNING id INTO transaction_id;
  
  -- Create transaction record for recipient
  INSERT INTO public.transactions (
    user_id, amount, currency, transaction_type, status, description,
    transfer_type, recipient_user_id, reference_id
  ) VALUES (
    p_to_user_id, p_amount, p_currency, 'transfer_in', 'completed', p_description,
    'internal', p_from_user_id, transaction_id::TEXT
  );
  
  -- Update balances
  UPDATE public.accounts 
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = p_from_user_id AND currency = p_currency;
  
  -- Create or update recipient account
  INSERT INTO public.accounts (user_id, currency, balance)
  VALUES (p_to_user_id, p_currency, p_amount)
  ON CONFLICT (user_id, currency) 
  DO UPDATE SET balance = accounts.balance + p_amount, updated_at = now();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_message TEXT,
  p_type notification_type,
  p_recipient TEXT,
  p_transaction_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, message, notification_type, recipient, transaction_id
  ) VALUES (
    p_user_id, p_message, p_type, p_recipient, p_transaction_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update timestamps
CREATE TRIGGER update_bank_details_updated_at
BEFORE UPDATE ON public.bank_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_wallets_updated_at
BEFORE UPDATE ON public.crypto_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default bank details
INSERT INTO public.bank_details (bank_name, account_number, account_name, swift_code, routing_number) VALUES
('GV Bank Primary', '1234567890', 'GV Bank Limited', 'GVBKUS33', '021000021'),
('GV Bank Savings', '9876543210', 'GV Bank Savings Account', 'GVBKUS33', '021000021');

-- Insert default crypto wallets
INSERT INTO public.crypto_wallets (crypto_type, wallet_address, wallet_name) VALUES
('BTC', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'GV Bank Bitcoin Wallet'),
('ETH', '0x742d35Cc8e8d8e8d8e8d8e8d8e8d8e8d8e8d8e8d', 'GV Bank Ethereum Wallet'),
('USDT', '0x742d35Cc8e8d8e8d8e8d8e8d8e8d8e8d8e8d8e8e', 'GV Bank USDT Wallet');