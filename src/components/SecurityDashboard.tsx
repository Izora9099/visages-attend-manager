import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  Key,
  Activity,
  Clock,
  Globe,
  Database,
  UserX,
  RefreshCw,
  Download,
  Trash2,
  Settings,
  Bell,
  Monitor,
  Smartphone,
  MapPin,
  Calendar,
  Users,
  FileText,
  Camera,
  ClipboardList,
  Search,
  Filter,
  TrendingUp,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Minus
} from "lucide-react";
import { djangoApi } from "@/services/djangoApi";

interface UserActivity {
  id: number;
  user: {
    username: string;
    full_name: string;
    role: string;
  };
  action: string;
  resource: string;
  resource_id?: number;
  details: string;
  ip_address: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  session_id: string;
}

interface LoginAttempt {
  id: number;
  username: string;
  ip_address: string;
  location: string;
  timestamp: string;
  success: boolean;
  user_agent: string;
  reason?: string;
}

interface ActiveSession {
  id: string;
  user: string;
  role: string;
  ip_address: string;
  location: string;
  device: string;
  last_activity: string;
  created_at: string;
  activity_count: number;
}

interface SecuritySettings {
  max_login_attempts: number;
  lockout_duration: number;
  session_timeout: number;
  require_2fa: boolean;
  password_expiry_days: number;
  min_password_length: number;
  allow_multiple_sessions: boolean;
  ip_whitelist_enabled: boolean;
  audit_log_retention_days: number;
  track_user_activities: boolean;
  alert_on_suspicious_activity: boolean;
}

interface SecurityStats {
  total_activities: number;
  failed_activities: number;
  total_logins: number;
  failed_logins: number;
  active_users: number;
  active_sessions: number;
}

interface ActivityFilter {
  user: string;
  action: string;
  dateRange: string;
  status: string;
}

export const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    total_activities: 0,
    failed_activities: 0,
    total_logins: 0,
    failed_logins: 0,
    active_users: 0,
    active_sessions: 0,
  });
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>({
    user: 'all',
    action: 'all',
    dateRange: 'today',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    max_login_attempts: 5,
    lockout_duration: 30,
    session_timeout: 60,
    require_2fa: false,
    password_expiry_days: 90,
    min_password_length: 8,
    allow_multiple_sessions: true,
    ip_whitelist_enabled: false,
    audit_log_retention_days: 365,
    track_user_activities: true,
    alert_on_suspicious_activity: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSecurityData();
    
    // Set up auto-refresh every 30 seconds for overview tab
    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        fetchSecurityData(false); // Silent refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch data when filters change
  useEffect(() => {
    if (activeTab === 'user-activities') {
      fetchUserActivities();
    }
  }, [activityFilter, searchTerm]);

  const fetchSecurityData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    
    try {
      // Fetch all security data in parallel
      const [activitiesRes, loginAttemptsRes, activeSessionsRes, statsRes, settingsRes] = await Promise.allSettled([
        djangoApi.getUserActivities({ days: 7 }),
        djangoApi.getLoginAttempts({ days: 7 }),
        djangoApi.getActiveSessions(),
        djangoApi.getSecurityStatistics({ days: 7 }),
        djangoApi.getSecuritySettings()
      ]);

      // Handle user activities
      if (activitiesRes.status === 'fulfilled') {
        setUserActivities(activitiesRes.value || []);
      } else {
        console.error('Failed to fetch user activities:', activitiesRes.reason);
      }

      // Handle login attempts
      if (loginAttemptsRes.status === 'fulfilled') {
        setLoginAttempts(loginAttemptsRes.value || []);
      } else {
        console.error('Failed to fetch login attempts:', loginAttemptsRes.reason);
      }

      // Handle active sessions
      if (activeSessionsRes.status === 'fulfilled') {
        setActiveSessions(activeSessionsRes.value || []);
      } else {
        console.error('Failed to fetch active sessions:', activeSessionsRes.reason);
      }

      // Handle security statistics
      if (statsRes.status === 'fulfilled') {
        setSecurityStats(statsRes.value || securityStats);
      } else {
        console.error('Failed to fetch security stats:', statsRes.reason);
      }

      // Handle security settings
      if (settingsRes.status === 'fulfilled') {
        setSecuritySettings(settingsRes.value || securitySettings);
      } else {
        console.error('Failed to fetch security settings:', settingsRes.reason);
      }

    } catch (err: any) {
      setError("Failed to load security data. Please check your connection.");
      console.error('Security data fetch error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const filters: any = {};
      
      // Add filters
      if (activityFilter.user && activityFilter.user !== 'all') {
        filters.user = activityFilter.user;
      }
      if (activityFilter.action && activityFilter.action !== 'all') {
        filters.action = activityFilter.action;
      }
      if (activityFilter.status && activityFilter.status !== 'all') {
        filters.status = activityFilter.status;
      }
      
      // Add date range
      switch (activityFilter.dateRange) {
        case 'today':
          filters.days = 1;
          break;
        case 'week':
          filters.days = 7;
          break;
        case 'month':
          filters.days = 30;
          break;
        default:
          filters.days = 7;
      }

      const activities = await djangoApi.getUserActivities(filters);
      setUserActivities(activities || []);
    } catch (err: any) {
      console.error('Failed to fetch filtered activities:', err);
      setError("Failed to load activities");
    }
  };

  const fetchLoginAttempts = async () => {
    try {
      const attempts = await djangoApi.getLoginAttempts({ days: 7 });
      setLoginAttempts(attempts || []);
    } catch (err: any) {
      console.error('Failed to fetch login attempts:', err);
      setError("Failed to load login attempts");
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const sessions = await djangoApi.getActiveSessions();
      setActiveSessions(sessions || []);
    } catch (err: any) {
      console.error('Failed to fetch active sessions:', err);
      setError("Failed to load active sessions");
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await djangoApi.terminateSession(sessionId);
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      setSuccess("Session terminated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to terminate session: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      await djangoApi.updateSecuritySettings(securitySettings);
      setSuccess("Security settings updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to update security settings: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const exportActivityLog = async () => {
    try {
      const filters: any = {};
      
      // Add current filters to export
      if (activityFilter.user && activityFilter.user !== 'all') {
        filters.user = activityFilter.user;
      }
      if (activityFilter.action && activityFilter.action !== 'all') {
        filters.action = activityFilter.action;
      }
      if (activityFilter.status && activityFilter.status !== 'all') {
        filters.status = activityFilter.status;
      }
      
      filters.days = 30; // Export last 30 days

      const blob = await djangoApi.exportActivityLog(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess("Activity log exported successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to export activity log: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "VIEW_STUDENTS": return <Users className="h-4 w-4 text-blue-500" />;
      case "MARK_ATTENDANCE": return <ClipboardList className="h-4 w-4 text-green-500" />;
      case "USE_FACE_RECOGNITION": return <Camera className="h-4 w-4 text-purple-500" />;
      case "GENERATE_REPORT": return <FileText className="h-4 w-4 text-orange-500" />;
      case "UPDATE_STUDENT": return <Edit className="h-4 w-4 text-blue-500" />;
      case "DELETE_ATTENDANCE": return <Trash2 className="h-4 w-4 text-red-500" />;
      case "CREATE_STUDENT": return <Plus className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredActivities = userActivities.filter(activity => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.user?.full_name?.toLowerCase().includes(searchLower) ||
      activity.user?.username?.toLowerCase().includes(searchLower) ||
      activity.action.toLowerCase().includes(searchLower) ||
      activity.details.toLowerCase().includes(searchLower)
    );
  });

  const getUserActivitySummary = () => {
    const summary: Record<string, { count: number; role: string; lastActive: string }> = {};
    
    userActivities.forEach(activity => {
      const username = activity.user?.username;
      if (!summary[username]) {
        summary[username] = {
          count: 0,
          role: activity.user?.role,
          lastActive: activity.timestamp
        };
      }
      summary[username].count++;
      if (new Date(activity.timestamp) > new Date(summary[username].lastActive)) {
        summary[username].lastActive = activity.timestamp;
      }
    });
    
    return summary;
  };

  const getMostCommonAction = (activities: UserActivity[]) => {
    if (activities.length === 0) return 'None';
    
    const actionCounts = activities.reduce((acc, curr) => {
      acc[curr.action] = (acc[curr.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.keys(actionCounts).reduce((a, b) => 
      actionCounts[a] > actionCounts[b] ? a : b
    );
    
    return mostCommon.replace(/_/g, ' ');
  };

  const activitySummary = getUserActivitySummary();
  const totalActivities = securityStats.total_activities;
  const failedActivities = securityStats.failed_activities;
  const activeUsers = securityStats.active_users;

  if (loading && userActivities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-600" />
            Security & Activity Center
          </h1>
          <p className="text-gray-600 mt-2">Monitor system security and user activities</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => fetchSecurityData()}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Card className="px-4 py-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{totalActivities} Activities Today</span>
            </div>
          </Card>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-activities">User Activities</TabsTrigger>
          <TabsTrigger value="login-attempts">Login Logs</TabsTrigger>
          <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Activity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold">{totalActivities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Failed Actions</p>
                    <p className="text-2xl font-bold">{failedActivities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold">{activeSessions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Most Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(activitySummary)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 5)
                    .map(([username, data]) => (
                    <div key={username} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{username}</p>
                          <p className="text-sm text-gray-500">{data.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{data.count}</p>
                        <p className="text-xs text-gray-500">activities</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.action)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.user?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-activities" className="space-y-4">
          {/* Activity Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Activity Tracking</CardTitle>
                <Button onClick={exportActivityLog} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Activities
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={activityFilter.user === '' ? 'all' : activityFilter.user} onValueChange={(value) => 
                  setActivityFilter(prev => ({ ...prev, user: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {Object.keys(activitySummary || {}).map(username => (
                      <SelectItem key={username} value={username}>{username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={activityFilter.action === '' ? 'all' : activityFilter.action} onValueChange={(value) => 
                  setActivityFilter(prev => ({ ...prev, action: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="VIEW_STUDENTS">View Students</SelectItem>
                    <SelectItem value="MARK_ATTENDANCE">Mark Attendance</SelectItem>
                    <SelectItem value="USE_FACE_RECOGNITION">Face Recognition</SelectItem>
                    <SelectItem value="GENERATE_REPORT">Generate Report</SelectItem>
                    <SelectItem value="UPDATE_STUDENT">Update Student</SelectItem>
                    <SelectItem value="DELETE_ATTENDANCE">Delete Attendance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={activityFilter.status === '' ? 'all' : activityFilter.status} onValueChange={(value) => 
                  setActivityFilter(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredActivities && filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => {
                    // Safely get user display name with fallbacks
                    const getUserDisplayName = () => {
                      if (!activity.user) return 'System';
                      if (typeof activity.user === 'string') return activity.user;
                      if (activity.user.full_name) return activity.user.full_name;
                      if (activity.user.username) return activity.user.username;
                      return 'Unknown User';
                    };

                    // Safely get user role with fallback
                    const getUserRole = () => {
                      if (!activity.user) return 'System';
                      if (typeof activity.user === 'string') return 'User';
                      return activity.user.role || 'User';
                    };

                    return (
                      <div key={activity.id} className="grid grid-cols-1 lg:grid-cols-8 gap-4 p-3 border rounded-lg text-sm hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.action)}
                          <span className="font-medium">{getUserDisplayName()}</span>
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {getUserRole()}
                          </Badge>
                        </div>
                        <div>{activity.action ? activity.action.replace(/_/g, ' ') : 'Unknown Action'}</div>
                        <div className="truncate">{activity.details || 'No details'}</div>
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <span>{activity.ip_address || 'Unknown IP'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>
                            {activity.timestamp ? 
                              new Date(activity.timestamp).toLocaleString() : 
                              'Unknown time'
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(activity.status)}
                          <span className="capitalize">{activity.status || 'unknown'}</span>
                        </div>
                        <div className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No activities found</p>
                    <p className="text-sm">Try adjusting your filters or check back later</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-attempts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Login Attempts Log</CardTitle>
                <Button onClick={fetchLoginAttempts} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loginAttempts.map((attempt) => (
                  <div key={attempt.id} className="grid grid-cols-6 gap-4 p-3 border rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      {attempt.success ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      <span className="font-medium">{attempt.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <span>{attempt.ip_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{attempt.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Monitor className="h-3 w-3 text-gray-400" />
                      <span>{attempt.user_agent}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                      <Badge variant={attempt.success ? "default" : "destructive"}>
                        {attempt.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active User Sessions</CardTitle>
                <Button onClick={fetchActiveSessions} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{session.user}</span>
                        <Badge variant="outline">{session.role}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span>{session.ip_address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Smartphone className="h-3 w-3" />
                          <span>{session.device}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Last activity: {new Date(session.last_activity).toLocaleString()}</p>
                        <p>Activities: {session.activity_count}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Terminate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Activity Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Maximum Login Attempts</Label>
                    <Input
                      type="number"
                      value={securitySettings.max_login_attempts}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        max_login_attempts: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Account Lockout Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.lockout_duration}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        lockout_duration: parseInt(e.target.value)
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.session_timeout}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        session_timeout: parseInt(e.target.value)
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Audit Log Retention (days)</Label>
                    <Input
                      type="number"
                      value={securitySettings.audit_log_retention_days}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        audit_log_retention_days: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Track User Activities</Label>
                      <p className="text-sm text-gray-500">Log all user actions in the system</p>
                    </div>
                    <Switch
                      checked={securitySettings.track_user_activities}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        track_user_activities: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alert on Suspicious Activity</Label>
                      <p className="text-sm text-gray-500">Send notifications for unusual behavior</p>
                    </div>
                    <Switch
                      checked={securitySettings.alert_on_suspicious_activity}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        alert_on_suspicious_activity: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
                    </div>
                    <Switch
                      checked={securitySettings.require_2fa}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        require_2fa: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Multiple Sessions</Label>
                      <p className="text-sm text-gray-500">Users can be logged in from multiple devices</p>
                    </div>
                    <Switch
                      checked={securitySettings.allow_multiple_sessions}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        allow_multiple_sessions: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Whitelist</Label>
                      <p className="text-sm text-gray-500">Only allow access from approved IPs</p>
                    </div>
                    <Switch
                      checked={securitySettings.ip_whitelist_enabled}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        ip_whitelist_enabled: checked
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => fetchSecurityData()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={handleUpdateSettings} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Update Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Total Activities Today</span>
                    <span className="font-bold">{totalActivities}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Failed Actions</span>
                    <span className="font-bold text-red-600">{failedActivities}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Active Users</span>
                    <span className="font-bold text-green-600">{activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Teacher Activities</span>
                    <span className="font-bold text-blue-600">
                      {userActivities.filter(a => a.user?.role === 'Teacher').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={exportActivityLog}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Security Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => fetchSecurityData()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Security Scan
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Old Activity Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Configure Activity Alerts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown by Role */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Teacher', 'Manager', 'Super Admin'].map(role => {
                  const roleActivities = userActivities.filter(a => a.user?.role === role);
                  const successRate = roleActivities.length > 0 ? 
                    (roleActivities.filter(a => a.status === 'success').length / roleActivities.length * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={role} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{role}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Activities:</span>
                          <span className="font-medium">{roleActivities.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">{successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed Actions:</span>
                          <span className="font-medium text-red-600">
                            {roleActivities.filter(a => a.status === 'failed').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Common Action:</span>
                          <span className="font-medium text-xs">
                            {getMostCommonAction(roleActivities)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};