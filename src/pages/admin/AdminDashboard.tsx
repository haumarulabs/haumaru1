import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, Shield, CreditCard, Activity, Search, 
  CheckCircle, XCircle, RefreshCw, Eye, Ban, Clock
} from 'lucide-react';
import { User, VPNProfile, Plan, Session } from '@/types/api';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [vpnProfiles, setVpnProfiles] = useState<VPNProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    activeVPNs: 0,
    totalRevenue: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load users
      const usersResponse = await api.getUsers(1, 100);
      if (usersResponse.ok && usersResponse.data) {
        const userData = usersResponse.data.data;
        setUsers(userData);
        
        // Calculate stats
        setStats({
          totalUsers: userData.length,
          activeUsers: userData.filter(u => u.is_active).length,
          pendingUsers: userData.filter(u => !u.is_active).length,
          activeVPNs: 0, // Will be updated from VPN profiles
          totalRevenue: 0, // Would come from receipts endpoint
          activeSessions: 0, // Will be updated from sessions
        });
      }

      // Load VPN profiles
      const vpnResponse = await api.getVPNProfiles();
      if (vpnResponse.ok && vpnResponse.data) {
        setVpnProfiles(vpnResponse.data);
        setStats(prev => ({ ...prev, activeVPNs: vpnResponse.data.length }));
      }

      // Load sessions
      const sessionsResponse = await api.getSessions(1, 50);
      if (sessionsResponse.ok && sessionsResponse.data) {
        setSessions(sessionsResponse.data.data);
        const active = sessionsResponse.data.data.filter(s => !s.disconnected_at).length;
        setStats(prev => ({ ...prev, activeSessions: active }));
      }

      // Load plans
      const plansResponse = await api.getPlans();
      if (plansResponse.ok && plansResponse.data) {
        setPlans(plansResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await api.activateUser(userId);
      if (response.ok) {
        toast({
          title: "User Activated",
          description: "The user account has been activated successfully.",
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const response = await api.deactivateUser(userId);
      if (response.ok) {
        toast({
          title: "User Deactivated",
          description: "The user account has been deactivated.",
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    }
  };

  const handleIssueVPN = async (userId: string, email: string) => {
    try {
      const response = await api.issueVPN({
        role: 'student',
        days: 30,
        name: email,
        no_confirm: true,
      });
      if (response.ok) {
        toast({
          title: "VPN Issued",
          description: `VPN certificate issued for ${email}`,
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue VPN certificate",
        variant: "destructive",
      });
    }
  };

  const handleRevokeVPN = async (cn: string) => {
    try {
      const response = await api.revokeVPN({ cn, force: true });
      if (response.ok) {
        toast({
          title: "VPN Revoked",
          description: `VPN certificate ${cn} has been revoked.`,
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke VPN certificate",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout portal="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout portal="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Instructor Dashboard 🛡️</h2>
          <p className="text-muted-foreground mt-2">Manage students, lab access, and monitor training progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} enrolled, {stats.pendingUsers} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Lab Access</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVPNs}</div>
              <p className="text-xs text-muted-foreground">
                Lab environments issued
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Lab Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Students currently in labs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active VPNs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVPNs}</div>
              <p className="text-xs text-muted-foreground">
                Certificates issued
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Currently connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                Total enrollment fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Students</TabsTrigger>
            <TabsTrigger value="vpn">Lab Access</TabsTrigger>
            <TabsTrigger value="sessions">Lab Sessions</TabsTrigger>
            <TabsTrigger value="plans">Course Plans</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Management</CardTitle>
                    <CardDescription>Manage student accounts and enrollments</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button onClick={loadDashboardData} variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>CN</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.name || '-'}</TableCell>
                        <TableCell>{user.cn || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                            {user.is_student && <Badge>Student</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? 'Active' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!user.is_active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivateUser(user.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Activate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeactivateUser(user.id)}
                                className="gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Deactivate
                              </Button>
                            )}
                            {!user.cn && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleIssueVPN(user.id, user.email)}
                                className="gap-1"
                              >
                                <Shield className="h-3 w-3" />
                                Grant Lab Access
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Access Tab */}
          <TabsContent value="vpn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lab Access Management</CardTitle>
                <CardDescription>Manage student lab environment credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Access ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vpnProfiles.map((profile) => {
                      const isExpired = new Date(profile.expiry_utc) < new Date();
                      return (
                        <TableRow key={profile.cn}>
                          <TableCell className="font-medium font-mono">{profile.cn}</TableCell>
                          <TableCell className="capitalize">
                            {profile.role === 'student' ? '🎓 Student Lab' : profile.role}
                          </TableCell>
                          <TableCell>{new Date(profile.expiry_utc).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={isExpired ? "secondary" : "default"}>
                              {isExpired ? 'Expired' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeVPN(profile.cn)}
                              className="gap-1"
                            >
                              <Ban className="h-3 w-3" />
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>VPN Sessions</CardTitle>
                <CardDescription>Monitor active and recent VPN connections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CN</TableHead>
                      <TableHead>Real IP</TableHead>
                      <TableHead>Virtual IP</TableHead>
                      <TableHead>Connected</TableHead>
                      <TableHead>Data Transfer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => {
                      const isActive = !session.disconnected_at;
                      const bytesTotal = session.bytes_received + session.bytes_sent;
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.cn}</TableCell>
                          <TableCell>{session.real_ip}</TableCell>
                          <TableCell>{session.virtual_ip}</TableCell>
                          <TableCell>{new Date(session.connected_at).toLocaleString()}</TableCell>
                          <TableCell>{(bytesTotal / 1024 / 1024).toFixed(2)} MB</TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "default" : "secondary"}>
                              {isActive ? 'Active' : 'Disconnected'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Manage available subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.code}</TableCell>
                        <TableCell>{plan.days} days</TableCell>
                        <TableCell>${plan.price_usd}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}