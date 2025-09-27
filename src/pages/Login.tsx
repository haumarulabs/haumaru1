import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogIn, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const navigate = useNavigate();
  const { checkAuth, isAuthenticated, isAdmin, isStudent, user } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-check authentication on load
    handleCheckAuth();
  }, []);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (isAdmin) {
        navigate('/admin');
      } else if (isStudent && user.is_active) {
        navigate('/student');
      } else if (!user.is_active) {
        navigate('/pending-approval');
      }
    }
  }, [isAuthenticated, isAdmin, isStudent, user, navigate]);

  const handleCheckAuth = async () => {
    setIsChecking(true);
    setError('');
    
    try {
      // Check if user is authenticated via Cloudflare Access
      await checkAuth();
      
      // If authenticated, the useEffect above will handle navigation
      if (!isAuthenticated) {
        setError('Not authenticated via Cloudflare Access. Please sign in through the Cloudflare Access portal.');
      }
    } catch (error) {
      setError('Unable to verify authentication status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCloudflareLogin = () => {
    // Redirect to Cloudflare Access team URL
    window.location.href = 'https://haumarugroup.cloudflareaccess.com';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration - Academy theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      
      {/* Cybersecurity pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl border-border/50 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-primary shadow-glow">
              <div className="relative">
                <Shield className="h-10 w-10 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl text-center font-bold">
            <span className="gradient-text">Haumaru Academy</span>
          </CardTitle>
          <CardDescription className="text-center text-base">
            Cybersecurity Training & Lab Access Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academy Welcome Message */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-sm">Welcome to Haumaru Academy</p>
                <p className="text-sm text-muted-foreground">
                  Access professional cybersecurity courses, hands-on labs, and certification programs.
                </p>
              </div>
            </div>
          </div>

          {/* Cloudflare Access Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5,11.5c0-1.1-0.9-2-2-2c-0.2,0-0.4,0-0.6,0.1c-0.2-1.4-1.4-2.5-2.9-2.5c-1.6,0-3,1.4-3,3c0,0.2,0,0.4,0.1,0.5C6.9,10.6,6,11.6,6,12.8c0,1.2,1,2.2,2.2,2.2h7.3c1.1,0,2-0.9,2-2C17.5,12.4,17.1,11.8,16.5,11.5z"/>
                </svg>
              </div>
              <p className="font-medium text-sm">Secure Access via Cloudflare</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in with your organization credentials through Cloudflare Access to begin your cybersecurity journey.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Primary Actions */}
          <div className="space-y-3">
            {/* Sign In via Cloudflare */}
            <Button
              onClick={handleCloudflareLogin}
              className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:shadow-glow"
              disabled={isChecking}
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Access Academy Portal
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>

            {/* Check Authentication Status */}
            <Button
              onClick={handleCheckAuth}
              variant="outline"
              className="w-full"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Access...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Access Status
                </>
              )}
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl mb-1">🎓</div>
              <p className="text-xs font-medium">Expert Courses</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl mb-1">🔬</div>
              <p className="text-xs font-medium">Hands-on Labs</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-xs font-medium">Certifications</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl mb-1">🌐</div>
              <p className="text-xs font-medium">24/7 Lab Access</p>
            </div>
          </div>

          {/* Info Text */}
          <div className="text-center text-sm text-muted-foreground pt-2 border-t">
            <p>New student? Sign in to create your academy account</p>
            <p className="mt-1 text-xs">Admin approval required for lab access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}