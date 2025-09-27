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
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 shadow-xl border-border/50 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Haumaru Portal</CardTitle>
          <CardDescription className="text-center">
            Secure VPN Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cloudflare Access Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="font-medium text-sm">Protected by Cloudflare Access</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This application uses Cloudflare Access for authentication. 
              You'll be redirected to sign in with your organization's identity provider.
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
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isChecking}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In via Cloudflare Access
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
                  Checking Authentication...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Authentication Status
                </>
              )}
            </Button>
          </div>

          {/* Info Text */}
          <div className="text-center text-sm text-muted-foreground pt-2">
            <p>Already authenticated? Click "Check Authentication Status"</p>
            <p className="mt-1">First time? Sign in and an account will be created for you</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}