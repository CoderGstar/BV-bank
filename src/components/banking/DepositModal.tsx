import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Building2, Bitcoin, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositComplete: () => void;
}

export const DepositModal = ({ isOpen, onClose, onDepositComplete }: DepositModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<any[]>([]);
  
  // Form states
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      // Fetch bank details
      const { data: banks } = await supabase
        .from('bank_details')
        .select('*')
        .eq('is_active', true);
      setBankDetails(banks || []);

      // Fetch crypto wallets
      const { data: crypto } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('is_active', true);
      setCryptoWallets(crypto || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDeposit = async (depositType: 'bank' | 'crypto' | 'card') => {
    if (!amount) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create transaction
      const transactionData: any = {
        user_id: user?.id,
        amount: parseFloat(amount),
        currency: currency as "USD" | "NGN" | "ZAR" | "BTC" | "ETH" | "USDT",
        transaction_type: 'deposit',
        status: 'completed', // Auto-approve for demo
        description: description || `${depositType} deposit`,
      };

      if (depositType === 'bank' && selectedBank) {
        transactionData.bank_details_id = selectedBank;
      }

      if (depositType === 'crypto' && selectedCrypto) {
        transactionData.crypto_wallet_id = selectedCrypto;
      }

      const { error } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (error) throw error;

      // Update account balance
      const { error: balanceError } = await supabase
        .rpc('update_account_balance', {
          p_user_id: user?.id,
          p_currency: currency as "USD" | "NGN" | "ZAR" | "BTC" | "ETH" | "USDT",
          p_amount: parseFloat(amount),
          p_operation: 'add'
        });

      if (balanceError) throw balanceError;

      toast({
        title: "Deposit Successful",
        description: `$${amount} has been added to your ${currency} account`,
      });

      onDepositComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Deposit Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="ZAR">ZAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="bank" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank Transfer
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Transfer</CardTitle>
                  <CardDescription>Transfer from your bank account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bank">Select Deposit Bank</Label>
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank for deposit" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankDetails.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.bank_name} - {bank.account_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedBank && (
                    <div className="p-4 bg-secondary/20 rounded-lg">
                      {bankDetails.find(b => b.id === selectedBank) && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Transfer Details:</h4>
                          <p className="text-sm">Bank: {bankDetails.find(b => b.id === selectedBank)?.bank_name}</p>
                          <p className="text-sm">Account: {bankDetails.find(b => b.id === selectedBank)?.account_number}</p>
                          <p className="text-sm">Name: {bankDetails.find(b => b.id === selectedBank)?.account_name}</p>
                          {bankDetails.find(b => b.id === selectedBank)?.swift_code && (
                            <p className="text-sm">SWIFT: {bankDetails.find(b => b.id === selectedBank)?.swift_code}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter deposit description"
                    />
                  </div>

                  <Button 
                    onClick={() => handleDeposit('bank')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Confirm Bank Deposit"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cryptocurrency Deposit</CardTitle>
                  <CardDescription>Deposit using cryptocurrency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="crypto">Select Cryptocurrency</Label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoWallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.crypto_type} - {wallet.wallet_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCrypto && (
                    <div className="p-4 bg-secondary/20 rounded-lg">
                      {cryptoWallets.find(w => w.id === selectedCrypto) && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Deposit Address:</h4>
                          <p className="text-sm font-mono break-all">
                            {cryptoWallets.find(w => w.id === selectedCrypto)?.wallet_address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Send {cryptoWallets.find(w => w.id === selectedCrypto)?.crypto_type} to this address
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={() => handleDeposit('crypto')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Confirm Crypto Deposit"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Deposit</CardTitle>
                  <CardDescription>Deposit using credit/debit card</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleDeposit('card')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Confirm Card Deposit"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};