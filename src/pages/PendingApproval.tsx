import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, logout, checkAuth } = useAuth();

  useEffect(() => {
    // Redirect if user is already active
    if (user?.is_active) {
      if (user.is_admin) {
        navigate('/admin');
      } else if (user.is_student) {
        navigate('/student');
      }
    }
  }, [user, navigate]);

  const handleRefresh = async () => {
    await checkAuth();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 shadow-xl border-border/50 bg-card/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-warning/20">
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl">Enrollment Pending Approval</CardTitle>
          <CardDescription>
            Welcome to Haumaru Academy! 🎓
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Your academy registration is complete! An instructor will review and approve your enrollment shortly.
            </p>
            <p className="text-sm font-medium">
              Once approved, you'll gain access to:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="text-xs bg-background rounded p-2">
                🔬 Hands-on Labs
              </div>
              <div className="text-xs bg-background rounded p-2">
                📚 Course Materials
              </div>
              <div className="text-xs bg-background rounded p-2">
                🛡️ Security Tools
              </div>
              <div className="text-xs bg-background rounded p-2">
                🏆 Certifications
              </div>
            </div>
          </div>

          {user && (
            <div className="border rounded-lg p-3 space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-medium">{user.email}</span>
              </p>
              {user.name && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Name:</span>{' '}
                  <span className="font-medium">{user.name}</span>
                </p>
              )}
              <p className="text-sm">
                <span className="text-muted-foreground">Status:</span>{' '}
                <Badge variant="secondary" className="ml-1">Pending Instructor Approval</Badge>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleLogout}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button
              className="flex-1 bg-gradient-primary"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            You'll receive an email notification once your enrollment is approved
          </p>
        </CardContent>
      </Card>
    </div>
  );
}