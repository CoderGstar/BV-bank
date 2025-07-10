import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Wallet,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Settings,
  Bell,
  Eye,
  EyeOff,
  User,
  LogOut
} from "lucide-react";

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getAccountBalance = (currency: string) => {
    const account = accounts.find(acc => acc.currency === currency);
    return account ? account.balance : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-primary-foreground">
              <h1 className="text-2xl font-bold">Welcome back, {profile?.first_name || 'User'}!</h1>
              <p className="text-primary-foreground/80">Account: {profile?.account_number || 'Loading...'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="banking-glass" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="banking-glass" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="banking-glass" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-banking border-0 text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `$${getTotalBalance().toLocaleString()}` : "••••••"}
              </div>
              <p className="text-xs text-primary-foreground/80">
                Total across all accounts
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card-banking transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Account</CardTitle>
              <Wallet className="h-4 w-4 text-banking-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `$${getAccountBalance('USD').toLocaleString()}` : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground">
                USD Account
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card-banking transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checking Account</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `₦${getAccountBalance('NGN').toLocaleString()}` : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground">
                NGN Account
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border border-primary/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your finances with one click</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="banking" className="h-20 flex-col">
                <Send className="h-6 w-6 mb-2" />
                Transfer
              </Button>
              <Button variant="banking-outline" className="h-20 flex-col">
                <PlusCircle className="h-6 w-6 mb-2" />
                Deposit
              </Button>
              <Button variant="banking-outline" className="h-20 flex-col">
                <ArrowUpRight className="h-6 w-6 mb-2" />
                Withdraw
              </Button>
              <Button variant="banking-outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Invest
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border border-primary/20">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm">Start using your account to see transactions here</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-primary/10 hover:bg-primary/5 transition-banking"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.transaction_type.includes('in') || transaction.transaction_type === 'deposit'
                          ? 'bg-banking-success/10 text-banking-success' 
                          : 'bg-banking-danger/10 text-banking-danger'
                      }`}>
                        {transaction.transaction_type.includes('in') || transaction.transaction_type === 'deposit' ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || transaction.transaction_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.transaction_type.includes('in') || transaction.transaction_type === 'deposit'
                          ? 'text-banking-success' : 'text-banking-danger'
                      }`}>
                        {transaction.transaction_type.includes('in') || transaction.transaction_type === 'deposit' ? '+' : '-'}
                        {transaction.currency === 'NGN' ? '₦' : '$'}{transaction.amount.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}