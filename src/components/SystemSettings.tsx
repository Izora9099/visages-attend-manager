// Fix for SystemSettings.tsx - Replace the state initialization and input handling

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
import { ConnectionStatus } from "./ConnectionStatus";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Database,
  Mail,
  Clock,
  Shield,
  Camera,
  Users,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Key,
  Globe,
  Bell,
  Monitor,
  HardDrive,
  Wifi,
  Server,
  FileText,
  Calendar,
  Palette,
  Volume2,
  Lock,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  ClipboardList
} from "lucide-react";
import { djangoApi } from "@/services/djangoApi";

interface SystemSettings {
  // General Settings
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  academic_year: string;
  timezone: string;
  date_format: string;
  time_format: string;
  
  // Attendance Settings
  attendance_grace_period: number;
  late_threshold: number;
  auto_mark_absent_after: number;
  attendance_session_timeout: number;
  face_recognition_threshold: number;
  
  // Security Settings
  password_min_length: number;
  password_require_special: boolean;
  max_login_attempts: number;
  session_timeout: number;
  enable_2fa: boolean;
  auto_logout_inactive: boolean;
  
  // Email Settings
  email_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  email_from_address: string;
  
  // Backup Settings
  backup_enabled: boolean;
  backup_frequency: string;
  backup_retention_days: number;
  backup_location: string;
  
  // System Settings
  maintenance_mode: boolean;
  debug_mode: boolean;
  log_level: string;
  max_file_upload_size: number;
  system_announcement: string;
  
  // UI Settings
  theme: string;
  language: string;
  notification_enabled: boolean;
}

// Default values to prevent undefined state
const defaultSettings: SystemSettings = {
  // General Settings
  school_name: '',
  school_address: '',
  school_phone: '',
  school_email: '',
  academic_year: '',
  timezone: 'UTC',
  date_format: 'YYYY-MM-DD',
  time_format: '24h',
  
  // Attendance Settings
  attendance_grace_period: 10,
  late_threshold: 15,
  auto_mark_absent_after: 30,
  attendance_session_timeout: 60,
  face_recognition_threshold: 0.6,
  
  // Security Settings
  password_min_length: 8,
  password_require_special: false,
  max_login_attempts: 5,
  session_timeout: 60,
  enable_2fa: false,
  auto_logout_inactive: true,
  
  // Email Settings
  email_enabled: false,
  smtp_host: '',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  smtp_use_tls: true,
  email_from_address: '',
  
  // Backup Settings
  backup_enabled: false,
  backup_frequency: 'daily',
  backup_retention_days: 30,
  backup_location: '',
  
  // System Settings
  maintenance_mode: false,
  debug_mode: false,
  log_level: 'INFO',
  max_file_upload_size: 10,
  system_announcement: '',
  
  // UI Settings
  theme: 'light',
  language: 'en',
  notification_enabled: true,
};

export const SystemSettings = () => {
  // Initialize with default values to prevent undefined
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [systemStats, setSystemStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemStats();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const data = await djangoApi.getSystemSettings();
      // Merge with defaults to ensure all fields exist
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err: any) {
      setError("Failed to load system settings: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSystemStats = async () => {
    try {
      const stats = await djangoApi.getSystemStats();
      setSystemStats(stats);
    } catch (err: any) {
      console.error("Failed to fetch system stats:", err);
    }
  };
  
  const handleSaveSettings = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await djangoApi.updateSystemSettings(settings);
      setSuccess("System settings updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to update settings: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await djangoApi.testEmailSettings();
      setSuccess("Test email sent successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to send test email: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setTestingEmail(false);
    }
  };
  
  const handleBackupNow = async () => {
    try {
      await djangoApi.createBackup();
      setSuccess("Backup created successfully");
      setTimeout(() => setSuccess(""), 3000);
      fetchSystemStats(); // Refresh stats
    } catch (err: any) {
      setError("Failed to create backup: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Safe update function that ensures controlled inputs
  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value ?? '' // Ensure value is never undefined
    }));
  };

  // Safe getter function that always returns a string or number
  const getSetting = (key: keyof SystemSettings): string | number | boolean => {
    const value = settings[key];
    return value ?? defaultSettings[key];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">Configure and manage system-wide settings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => fetchSystemSettings()}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveSettings} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>School Name</Label>
                <Input
                  value={getSetting('school_name') as string}
                  onChange={(e) => updateSetting('school_name', e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={getSetting('school_address') as string}
                  onChange={(e) => updateSetting('school_address', e.target.value)}
                  placeholder="Enter school address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={getSetting('school_phone') as string}
                    onChange={(e) => updateSetting('school_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={getSetting('school_email') as string}
                    onChange={(e) => updateSetting('school_email', e.target.value)}
                    placeholder="info@school.edu"
                  />
                </div>
              </div>
              <div>
                <Label>Academic Year</Label>
                <Input
                  value={getSetting('academic_year') as string}
                  onChange={(e) => updateSetting('academic_year', e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Attendance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grace Period (minutes)</Label>
                  <Input
                    type="number"
                    value={getSetting('attendance_grace_period') as number}
                    onChange={(e) => updateSetting('attendance_grace_period', parseInt(e.target.value) || 0)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label>Late Threshold (minutes)</Label>
                  <Input
                    type="number"
                    value={getSetting('late_threshold') as number}
                    onChange={(e) => updateSetting('late_threshold', parseInt(e.target.value) || 0)}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Auto-mark Absent After (minutes)</Label>
                  <Input
                    type="number"
                    value={getSetting('auto_mark_absent_after') as number}
                    onChange={(e) => updateSetting('auto_mark_absent_after', parseInt(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label>Face Recognition Threshold</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={getSetting('face_recognition_threshold') as number}
                    onChange={(e) => updateSetting('face_recognition_threshold', parseFloat(e.target.value) || 0)}
                    placeholder="0.6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={getSetting('password_min_length') as number}
                    onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value) || 8)}
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={getSetting('max_login_attempts') as number}
                    onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value) || 5)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Special Characters</Label>
                    <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                  </div>
                  <Switch
                    checked={getSetting('password_require_special') as boolean}
                    onCheckedChange={(checked) => updateSetting('password_require_special', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={getSetting('enable_2fa') as boolean}
                    onCheckedChange={(checked) => updateSetting('enable_2fa', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send system notifications via email</p>
                </div>
                <Switch
                  checked={getSetting('email_enabled') as boolean}
                  onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    value={getSetting('smtp_host') as string}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={getSetting('smtp_port') as number}
                    onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value) || 587)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Username</Label>
                  <Input
                    value={getSetting('smtp_username') as string}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={getSetting('smtp_password') as string}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <Label>From Email Address</Label>
                <Input
                  type="email"
                  value={getSetting('email_from_address') as string}
                  onChange={(e) => updateSetting('email_from_address', e.target.value)}
                  placeholder="noreply@school.edu"
                />
              </div>

              <Button onClick={handleTestEmail} disabled={testingEmail}>
                {testingEmail ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                Test Email Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Backup Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Automatic Backups</Label>
                  <p className="text-sm text-gray-500">Automatically backup system data</p>
                </div>
                <Switch
                  checked={getSetting('backup_enabled') as boolean}
                  onCheckedChange={(checked) => updateSetting('backup_enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Backup Frequency</Label>
                  <Select 
                    value={getSetting('backup_frequency') as string} 
                    onValueChange={(value) => updateSetting('backup_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Retention Period (days)</Label>
                  <Input
                    type="number"
                    value={getSetting('backup_retention_days') as number}
                    onChange={(e) => updateSetting('backup_retention_days', parseInt(e.target.value) || 30)}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleBackupNow} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Block access for system maintenance</p>
                </div>
                <Switch
                  checked={getSetting('maintenance_mode') as boolean}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                />
              </div>

              <div>
                <Label>System Announcement</Label>
                <Textarea
                  value={getSetting('system_announcement') as string}
                  onChange={(e) => updateSetting('system_announcement', e.target.value)}
                  placeholder="Important system announcement..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Will be displayed to all users</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-gray-500">Enable detailed logging</p>
                </div>
                <Switch
                  checked={getSetting('debug_mode') as boolean}
                  onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
                />
              </div>

              <div>
                <Label>Log Level</Label>
                <Select 
                  value={getSetting('log_level') as string} 
                  onValueChange={(value) => updateSetting('log_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max File Upload Size (MB)</Label>
                <Input
                  type="number"
                  value={getSetting('max_file_upload_size') as number}
                  onChange={(e) => updateSetting('max_file_upload_size', parseInt(e.target.value) || 10)}
                  placeholder="10"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};