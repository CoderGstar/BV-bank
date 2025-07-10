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
import { Banknote, Building2, Bitcoin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onWithdrawComplete: () => void;
}

export const WithdrawModal = ({ isOpen, onClose, accounts, onWithdrawComplete }: WithdrawModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<any[]>([]);
  
  // Form states
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [notes, setNotes] = useState("");

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

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount || !withdrawalMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (parseFloat(amount) > account.balance) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough balance for this withdrawal",
          variant: "destructive",
        });
        return;
      }

      // Create withdrawal request
      const withdrawalData: any = {
        user_id: user?.id,
        amount: parseFloat(amount),
        currency: account.currency,
        withdrawal_method: withdrawalMethod,
        status: 'pending'
      };

      if (withdrawalMethod === 'bank' && selectedBank) {
        const bank = bankDetails.find(b => b.id === selectedBank);
        withdrawalData.bank_details_id = selectedBank;
      }

      if (withdrawalMethod === 'crypto' && selectedCrypto) {
        const crypto = cryptoWallets.find(c => c.id === selectedCrypto);
        withdrawalData.crypto_wallet_id = selectedCrypto;
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .insert(withdrawalData);

      if (error) throw error;

      // Update account balance
      const { error: balanceError } = await supabase
        .rpc('update_account_balance', {
          p_user_id: user?.id,
          p_currency: account.currency,
          p_amount: parseFloat(amount),
          p_operation: 'subtract'
        });

      if (balanceError) throw balanceError;

      // Send notification
      if (profile?.email || profile?.phone) {
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              userId: user?.id,
              message: `Your withdrawal of $${amount} has been processed successfully. Your new balance is $${(account.balance - parseFloat(amount)).toFixed(2)}.`,
              type: profile.email ? 'email' : 'sms',
              recipient: profile.email || profile.phone,
              transactionId: null
            }
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
          // Don't fail the withdrawal if notification fails
        }
      }

      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request has been submitted for processing",
      });

      onWithdrawComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
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
            <Banknote className="h-5 w-5" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Selection */}
          <div>
            <Label htmlFor="account">From Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.currency} Account - ${account.balance.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <Tabs defaultValue="bank" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="cash" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Cash
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Withdrawal</CardTitle>
                  <CardDescription>Withdraw to your registered bank account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bank">Select Bank Account</Label>
                    <Select value={selectedBank} onValueChange={(value) => {
                      setSelectedBank(value);
                      setWithdrawalMethod('bank');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account" />
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Withdrawal</CardTitle>
                  <CardDescription>Withdraw to cryptocurrency wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="crypto">Select Crypto Wallet</Label>
                    <Select value={selectedCrypto} onValueChange={(value) => {
                      setSelectedCrypto(value);
                      setWithdrawalMethod('crypto');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crypto wallet" />
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cash" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Withdrawal</CardTitle>
                  <CardDescription>Withdraw cash at GV Bank locations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Cash withdrawals can be collected at any GV Bank branch. 
                      Please bring valid ID and your account details.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setWithdrawalMethod('cash')}
                    variant={withdrawalMethod === 'cash' ? 'default' : 'outline'}
                    className="w-full"
                  >
                    Select Cash Withdrawal
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions"
            />
          </div>

          <Button 
            onClick={handleWithdraw} 
            disabled={loading || !withdrawalMethod}
            className="w-full"
          >
            {loading ? "Processing..." : "Submit Withdrawal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};