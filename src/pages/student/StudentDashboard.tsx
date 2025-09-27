import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Download, Clock, Calendar, AlertCircle, 
  CreditCard, Activity, Wifi, RefreshCw, Plus
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { VPNProfile, Plan, Session } from '@/types/api';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vpnProfile, setVpnProfile] = useState<VPNProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!user?.is_active) {
      navigate('/pending-approval');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load VPN profiles
      const vpnResponse = await api.getVPNProfiles();
      if (vpnResponse.ok && vpnResponse.data?.length) {
        const profile = vpnResponse.data[0];
        // Calculate days remaining
        const expiryDate = new Date(profile.expiry_utc);
        const now = new Date();
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setVpnProfile({ ...profile, days_remaining: daysRemaining });
      }

      // Load plans
      const plansResponse = await api.getPlans();
      if (plansResponse.ok && plansResponse.data) {
        setPlans(plansResponse.data.filter(p => p.is_active));
      }

      // Load recent sessions
      const sessionsResponse = await api.getSessions(1, 5, user?.cn);
      if (sessionsResponse.ok && sessionsResponse.data) {
        setRecentSessions(sessionsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadProfile = async () => {
    if (!vpnProfile?.cn) return;
    
    try {
      await api.downloadVPNProfile(vpnProfile.cn);
      toast({
        title: "Profile Downloaded",
        description: "Your VPN configuration file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download your VPN profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExtendVPN = async (days: number) => {
    if (!vpnProfile?.cn) return;
    
    setIsExtending(true);
    try {
      const response = await api.extendVPN({
        cn: vpnProfile.cn,
        days,
        no_confirm: true,
      });
      
      if (response.ok) {
        toast({
          title: "VPN Extended",
          description: `Your VPN access has been extended by ${days} days.`,
        });
        loadDashboardData();
      } else {
        toast({
          title: "Extension Failed",
          description: response.error || "Could not extend VPN access.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while extending your VPN.",
        variant: "destructive",
      });
    } finally {
      setIsExtending(false);
    }
  };

  const handlePurchasePlan = async (plan: Plan) => {
    try {
      const response = await api.createCheckoutSession(plan.id);
      if (response.ok && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast({
          title: "Checkout Failed",
          description: "Could not create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (start: string, end?: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <Layout portal="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout portal="student">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || user?.email}!</h2>
          <p className="text-muted-foreground mt-2">Manage your VPN access and monitor your usage</p>
        </div>

        {/* VPN Status Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>VPN Profile Status</CardTitle>
                  <CardDescription>Your current VPN configuration</CardDescription>
                </div>
              </div>
              {vpnProfile && (
                <Badge 
                  className={vpnProfile.days_remaining! > 7 ? 'bg-success text-white' : 'bg-warning text-white'}
                >
                  {vpnProfile.days_remaining! > 0 ? 'Active' : 'Expired'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {vpnProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Certificate Name</p>
                    <p className="font-medium">{vpnProfile.cn}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{vpnProfile.role}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expires</p>
                    <p className="font-medium">{new Date(vpnProfile.expiry_utc).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Days Remaining Progress */}
                {vpnProfile.days_remaining! > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Days Remaining</span>
                      <span className="font-medium">{vpnProfile.days_remaining} days</span>
                    </div>
                    <Progress 
                      value={Math.min((vpnProfile.days_remaining! / 30) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleDownloadProfile}
                    className="gap-2"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                    Download Profile
                  </Button>
                  {vpnProfile.days_remaining! < 7 && (
                    <Button 
                      onClick={() => handleExtendVPN(30)}
                      className="gap-2 bg-gradient-primary"
                      disabled={isExtending}
                    >
                      <Clock className="h-4 w-4" />
                      Extend Access
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No VPN profile found</p>
                <Button 
                  onClick={() => navigate('/student/request-vpn')}
                  className="bg-gradient-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request VPN Access
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.code}</CardTitle>
                    <Badge variant="secondary">{plan.days} days</Badge>
                  </div>
                  <CardDescription>{plan.description || `${plan.days}-day VPN access`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold">${plan.price_usd}</div>
                    <Button 
                      onClick={() => handlePurchasePlan(plan)}
                      className="w-full bg-gradient-primary"
                      size="sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Recent Sessions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(session.connected_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          IP: {session.real_ip} → {session.virtual_ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDuration(session.connected_at, session.disconnected_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ↓ {formatBytes(session.bytes_received)} | ↑ {formatBytes(session.bytes_sent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}