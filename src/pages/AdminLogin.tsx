import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Shield, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [adminKey, setAdminKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_KEY = "6325988131562514";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (adminKey === ADMIN_KEY) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin panel!",
        });
        // In a real app, this would handle admin authentication
        window.location.href = "/admin/dashboard";
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin key. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-banking-danger/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-banking-warning/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-foreground hover:text-primary mb-6 transition-banking">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="bg-card/95 backdrop-blur-sm border border-banking-danger/20 shadow-banking">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-dark rounded-lg shadow-glow">
                <Shield className="h-8 w-8 text-banking-danger" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-banking-danger">Admin Access</CardTitle>
              <CardDescription>
                Enter the admin key to access the control panel
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin Key</Label>
                <div className="relative">
                  <Input
                    id="adminKey"
                    type={showKey ? "text" : "password"}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key"
                    required
                    className="border-banking-danger/20 focus:border-banking-danger pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="banking-danger"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </form>

            {/* Security Warning */}
            <div className="bg-banking-danger/5 border border-banking-danger/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-banking-danger" />
                <p className="text-sm font-medium text-banking-danger">Restricted Access</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This area is for authorized administrators only. All access attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Having trouble? Contact system administrator
          </p>
        </div>
      </div>
    </div>
  );
}