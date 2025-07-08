import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp,
  CreditCard,
  Smartphone,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Banking
                </span>
                <br />
                <span className="text-foreground">Reimagined</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl">
                Experience the future of digital banking with GV Bank. Secure, 
                fast, and innovative financial solutions at your fingertips.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              {[
                "Instant transfers & payments",
                "Multi-currency support",
                "Advanced security features",
                "24/7 customer support"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-banking-success" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button variant="banking" size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/demo">
                <Button variant="banking-outline" size="lg" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-primary/20">
              <p className="text-sm text-muted-foreground mb-4">Trusted by 10M+ customers worldwide</p>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-banking-success" />
                  <span className="text-sm font-medium">Bank-grade Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Global Coverage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Banking Card */}
              <Card className="group hover:shadow-banking hover:scale-105 transition-all duration-300 bg-gradient-primary text-primary-foreground border-0">
                <CardContent className="p-6">
                  <CreditCard className="h-12 w-12 mb-4 text-primary-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Smart Banking</h3>
                  <p className="text-primary-foreground/80">
                    AI-powered insights and automated savings
                  </p>
                </CardContent>
              </Card>

              {/* Mobile Banking */}
              <Card className="group hover:shadow-banking hover:scale-105 transition-all duration-300 bg-card border border-primary/20">
                <CardContent className="p-6">
                  <Smartphone className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Mobile First</h3>
                  <p className="text-muted-foreground">
                    Complete banking on your mobile device
                  </p>
                </CardContent>
              </Card>

              {/* Fast Transactions */}
              <Card className="group hover:shadow-banking hover:scale-105 transition-all duration-300 bg-card border border-primary/20">
                <CardContent className="p-6">
                  <Zap className="h-12 w-12 mb-4 text-banking-warning" />
                  <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Instant transfers and real-time notifications
                  </p>
                </CardContent>
              </Card>

              {/* Investment */}
              <Card className="group hover:shadow-banking hover:scale-105 transition-all duration-300 bg-gradient-secondary text-secondary-foreground border-0">
                <CardContent className="p-6">
                  <TrendingUp className="h-12 w-12 mb-4 text-banking-success" />
                  <h3 className="text-xl font-semibold mb-2">Investments</h3>
                  <p className="text-secondary-foreground/80">
                    Grow your wealth with smart investment tools
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Banking Dashboard Preview */}
            <Card className="bg-card/50 backdrop-blur-sm border border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-primary p-4">
                  <div className="flex justify-between items-center text-primary-foreground">
                    <div>
                      <p className="text-sm opacity-80">Total Balance</p>
                      <p className="text-2xl font-bold">$24,580.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-80">This Month</p>
                      <p className="text-lg font-semibold text-banking-success">+12.5%</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Savings Account</span>
                    <span className="font-medium">$18,420.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Checking Account</span>
                    <span className="font-medium">$6,160.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Investment Portfolio</span>
                    <span className="font-medium text-banking-success">+$2,840.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};