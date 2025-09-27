import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
  portal: 'student' | 'admin';
}

export default function Layout({ children, portal }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePortalSwitch = () => {
    if (portal === 'admin' && user?.is_student) {
      navigate('/student');
    } else if (portal === 'student' && user?.is_admin) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  Haumaru Academy
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">Cybersecurity Training Platform</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {portal === 'admin' ? '🛡️ Instructor' : '🎓 Student'} Portal
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Portal Switch Button */}
            {isAdmin && user?.is_student && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePortalSwitch}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Switch to {portal === 'admin' ? 'Student' : 'Admin'} Portal
              </Button>
            )}

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.cn || 'No VPN Profile'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {children}
      </main>
    </div>
  );
}