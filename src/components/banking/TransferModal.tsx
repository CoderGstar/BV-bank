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
import { Send, Building2, Bitcoin, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onTransferComplete: () => void;
}

export const TransferModal = ({ isOpen, onClose, accounts, onTransferComplete }: TransferModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Form states
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  // External transfer
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  
  // Crypto transfer
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("");
  
  // Internal transfer
  const [selectedUser, setSelectedUser] = useState("");

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

      // Fetch users for internal transfers
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, account_number')
        .neq('user_id', user?.id);
      setUsers(profiles || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleExternalTransfer = async () => {
    if (!selectedAccount || !amount || !recipientName || !recipientAccount) {
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
          description: "You don't have enough balance for this transfer",
          variant: "destructive",
        });
        return;
      }

      // Create transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: parseFloat(amount),
          currency: account.currency,
          transaction_type: 'transfer_out',
          status: 'pending',
          recipient_name: recipientName,
          recipient_account: recipientAccount,
          bank_name: selectedBank,
          description,
          transfer_type: 'external'
        });

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

      toast({
        title: "Transfer Initiated",
        description: "Your external transfer has been submitted for processing",
      });

      onTransferComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoTransfer = async () => {
    if (!selectedAccount || !amount || !cryptoAddress || !selectedCrypto) {
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
          description: "You don't have enough balance for this transfer",
          variant: "destructive",
        });
        return;
      }

      // Create transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: parseFloat(amount),
          currency: account.currency,
          transaction_type: 'transfer_out',
          status: 'pending',
          recipient_account: cryptoAddress,
          description,
          transfer_type: 'crypto',
          crypto_type: selectedCrypto as "BTC" | "ETH" | "USDT" | "BNB" | "ADA" | "DOT"
        });

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

      toast({
        title: "Crypto Transfer Initiated",
        description: "Your cryptocurrency transfer has been submitted for processing",
      });

      onTransferComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInternalTransfer = async () => {
    if (!selectedAccount || !amount || !selectedUser) {
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
          description: "You don't have enough balance for this transfer",
          variant: "destructive",
        });
        return;
      }

      // Process internal transfer
      const { data, error } = await supabase
        .rpc('process_internal_transfer', {
          p_from_user_id: user?.id,
          p_to_user_id: selectedUser,
          p_amount: parseFloat(amount),
          p_currency: account.currency,
          p_description: description
        });

      if (error) throw error;
      if (!data) {
        toast({
          title: "Transfer Failed",
          description: "Unable to process transfer. Please check your balance.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Transfer Completed",
        description: "Your internal transfer has been completed successfully",
      });

      onTransferComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Money
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

          <Tabs defaultValue="external" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="external" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                External Transfer
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto Transfer
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Internal Transfer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="external" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Transfer</CardTitle>
                  <CardDescription>Send money to external bank accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label htmlFor="bank">Bank</Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankDetails.map((bank) => (
                            <SelectItem key={bank.id} value={bank.bank_name}>
                              {bank.bank_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientAccount">Recipient Account Number</Label>
                    <Input
                      id="recipientAccount"
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter transfer description"
                    />
                  </div>
                  <Button 
                    onClick={handleExternalTransfer} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Send Money"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cryptocurrency Transfer</CardTitle>
                  <CardDescription>Send money to crypto wallets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cryptoAmount">Amount</Label>
                      <Input
                        id="cryptoAmount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="crypto">Cryptocurrency</Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoWallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.crypto_type}>
                              {wallet.crypto_type} - {wallet.wallet_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cryptoAddress">Wallet Address</Label>
                    <Input
                      id="cryptoAddress"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      placeholder="Enter wallet address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cryptoDescription">Description (Optional)</Label>
                    <Textarea
                      id="cryptoDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter transfer description"
                    />
                  </div>
                  <Button 
                    onClick={handleCryptoTransfer} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Send Crypto"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="internal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Internal Transfer</CardTitle>
                  <CardDescription>Send money to other GV Bank users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="internalAmount">Amount</Label>
                    <Input
                      id="internalAmount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user">Recipient</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.first_name} {user.last_name} - {user.account_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="internalDescription">Description (Optional)</Label>
                    <Textarea
                      id="internalDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter transfer description"
                    />
                  </div>
                  <Button 
                    onClick={handleInternalTransfer} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Send Money"}
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