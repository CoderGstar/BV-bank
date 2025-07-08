import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  User
} from "lucide-react";

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    accountNumber: "1234567890",
    balance: 24580.50,
    savingsBalance: 18420.00,
    checkingBalance: 6160.50
  });

  const recentTransactions = [
    { id: 1, type: "credit", amount: 2500, description: "Salary Deposit", date: "2024-01-15", status: "completed" },
    { id: 2, type: "debit", amount: 50, description: "Coffee Shop", date: "2024-01-14", status: "completed" },
    { id: 3, type: "credit", amount: 100, description: "Refund", date: "2024-01-13", status: "completed" },
    { id: 4, type: "debit", amount: 1200, description: "Rent Payment", date: "2024-01-12", status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-primary-foreground">
              <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
              <p className="text-primary-foreground/80">Account: {user.accountNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="banking-glass" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="banking-glass" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="banking-glass" size="icon">
                <User className="h-5 w-5" />
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
                {showBalance ? `$${user.balance.toLocaleString()}` : "••••••"}
              </div>
              <p className="text-xs text-primary-foreground/80">
                +12.5% from last month
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
                {showBalance ? `$${user.savingsBalance.toLocaleString()}` : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground">
                +2.1% interest rate
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
                {showBalance ? `$${user.checkingBalance.toLocaleString()}` : "••••••"}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for spending
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
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-primary/10 hover:bg-primary/5 transition-banking"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'credit' 
                        ? 'bg-banking-success/10 text-banking-success' 
                        : 'bg-banking-danger/10 text-banking-danger'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-banking-success' : 'text-banking-danger'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}