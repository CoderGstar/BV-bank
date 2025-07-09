import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Banknote,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  recipient_account?: string;
  bank_name?: string;
  phone_number?: string;
  profiles?: any;
}

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    totalVolume: 0
  });
  const [depositAccounts, setDepositAccounts] = useState({
    USD: '',
    NGN: '',
    ZAR: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verify admin access
    const adminKey = sessionStorage.getItem('adminKey');
    if (adminKey !== '6325988131562514') {
      navigate('/admin');
      return;
    }

    fetchAdminData();
    fetchDepositAccounts();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch all transactions with user details
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (transError) throw transError;

      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Calculate stats
      const pendingCount = transactionsData?.filter(t => t.status === 'pending').length || 0;
      const totalVolume = transactionsData?.reduce((sum, t) => sum + t.amount, 0) || 0;

      setTransactions((transactionsData as any) || []);
      setStats({
        totalUsers: userCount || 0,
        totalTransactions: transactionsData?.length || 0,
        pendingTransactions: pendingCount,
        totalVolume
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    }
  };

  const fetchDepositAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['deposit_account_usd', 'deposit_account_ngn', 'deposit_account_zar']);

      if (error) throw error;

      const accounts = { USD: '', NGN: '', ZAR: '' };
      data?.forEach(setting => {
        if (setting.setting_key === 'deposit_account_usd') accounts.USD = setting.setting_value;
        if (setting.setting_key === 'deposit_account_ngn') accounts.NGN = setting.setting_value;
        if (setting.setting_key === 'deposit_account_zar') accounts.ZAR = setting.setting_value;
      });

      setDepositAccounts(accounts);
    } catch (error) {
      console.error('Error fetching deposit accounts:', error);
    }
  };

  const updateDepositAccount = async (currency: string, account: string) => {
    try {
      const settingKey = `deposit_account_${currency.toLowerCase()}`;
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: account,
          description: `${currency} deposit account number`
        });

      if (error) throw error;

      toast({
        title: "Updated",
        description: `${currency} deposit account updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const approveTransaction = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      // Update transaction status
      const { error: transError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      if (transError) throw transError;

      // If it's a deposit, update user balance
      if (transaction.transaction_type === 'deposit') {
        const { error: balanceError } = await supabase
          .rpc('update_account_balance', {
            p_user_id: transaction.user_id,
            p_currency: transaction.currency as any,
            p_amount: transaction.amount,
            p_operation: 'add'
          });

        if (balanceError) throw balanceError;
      }

      toast({
        title: "Transaction Approved",
        description: "Transaction has been approved and processed",
      });

      // Send notification (in real app, this would trigger SMS/email)
      await supabase
        .from('notifications')
        .insert([{
          user_id: transaction.user_id,
          transaction_id: transactionId,
          notification_type: transaction.transaction_type === 'withdrawal' ? 'sms' : 'email',
          recipient: transaction.profiles?.email || transaction.profiles?.phone || '',
          message: `Your ${transaction.transaction_type} of ${transaction.currency} ${transaction.amount} has been approved.`
        }]);

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Transaction Rejected",
        description: "Transaction has been rejected",
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('adminKey');
    navigate('/admin');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-banking-success">Completed</Badge>;
      case 'pending': return <Badge variant="outline" className="border-banking-warning text-banking-warning">Pending</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="h-4 w-4 text-banking-success" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-banking-danger" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-header border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary rounded-lg">
                <Banknote className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GV BANK ADMIN</h1>
                <p className="text-sm text-muted-foreground">Welcome, GV OFFICIAL</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-banking-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-banking-warning">{stats.pendingTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Manage and approve transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No transactions found</p>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <p className="font-medium">
                              {transaction.profiles?.[0]?.first_name} {transaction.profiles?.[0]?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                            {transaction.bank_name && (
                              <p className="text-xs text-muted-foreground">Bank: {transaction.bank_name}</p>
                            )}
                            {transaction.phone_number && (
                              <p className="text-xs text-muted-foreground">Phone: {transaction.phone_number}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <p className="font-medium">
                            {transaction.currency === 'USD' ? '$' : 
                             transaction.currency === 'NGN' ? '₦' : 
                             transaction.currency === 'ZAR' ? 'R' : '₿'}
                            {transaction.amount.toLocaleString()}
                          </p>
                          {getStatusBadge(transaction.status)}
                          
                          {transaction.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => approveTransaction(transaction.id)}
                                disabled={isLoading}
                                className="bg-banking-success hover:bg-banking-success/90"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectTransaction(transaction.id)}
                                disabled={isLoading}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Account Settings</CardTitle>
                <CardDescription>Configure deposit account numbers for different currencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="usd-account">USD Deposit Account</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="usd-account"
                        value={depositAccounts.USD}
                        onChange={(e) => setDepositAccounts({...depositAccounts, USD: e.target.value})}
                        placeholder="Enter USD account number"
                      />
                      <Button onClick={() => updateDepositAccount('USD', depositAccounts.USD)}>
                        Update
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ngn-account">NGN Deposit Account</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="ngn-account"
                        value={depositAccounts.NGN}
                        onChange={(e) => setDepositAccounts({...depositAccounts, NGN: e.target.value})}
                        placeholder="Enter NGN account number"
                      />
                      <Button onClick={() => updateDepositAccount('NGN', depositAccounts.NGN)}>
                        Update
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zar-account">ZAR Deposit Account</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="zar-account"
                        value={depositAccounts.ZAR}
                        onChange={(e) => setDepositAccounts({...depositAccounts, ZAR: e.target.value})}
                        placeholder="Enter ZAR account number"
                      />
                      <Button onClick={() => updateDepositAccount('ZAR', depositAccounts.ZAR)}>
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>View sent SMS and email notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Notification history will appear here when SMS/email services are configured
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}