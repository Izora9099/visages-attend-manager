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
  require_checkout: boolean;
  allow_manual_attendance: boolean;
  attendance_notifications: boolean;
  
  // Face Recognition Settings
  face_recognition_enabled: boolean;
  face_confidence_threshold: number;
  max_face_images_per_student: number;
  face_detection_timeout: number;
  auto_capture_enabled: boolean;
  face_image_quality_threshold: number;
  
  // Email Settings
  email_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  email_from_address: string;
  email_from_name: string;
  
  // Notification Settings
  send_absence_notifications: boolean;
  send_late_notifications: boolean;
  send_weekly_reports: boolean;
  parent_notification_enabled: boolean;
  admin_notification_enabled: boolean;
  
  // Storage Settings
  max_file_upload_size: number;
  image_compression_quality: number;
  auto_backup_enabled: boolean;
  backup_frequency: string;
  backup_retention_days: number;
  storage_cleanup_enabled: boolean;
  
  // System Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  system_announcement: string;
  debug_mode: boolean;
  log_level: string;
}

interface SystemStats {
  total_students: number;
  total_users: number;
  total_attendance_records: number;
  database_size: string;
  storage_used: string;
  system_uptime: string;
  last_backup: string;
  system_version: string;
}

export const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SystemSettings>({
    // General Settings
    school_name: "FACE.IT School",
    school_address: "",
    school_phone: "",
    school_email: "",
    academic_year: "2024-2025",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    time_format: "24h",
    
    // Attendance Settings
    attendance_grace_period: 15,
    late_threshold: 30,
    auto_mark_absent_after: 2,
    require_checkout: false,
    allow_manual_attendance: true,
    attendance_notifications: true,
    
    // Face Recognition Settings
    face_recognition_enabled: true,
    face_confidence_threshold: 80,
    max_face_images_per_student: 5,
    face_detection_timeout: 10,
    auto_capture_enabled: false,
    face_image_quality_threshold: 70,
    
    // Email Settings
    email_enabled: false,
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_use_tls: true,
    email_from_address: "",
    email_from_name: "FACE.IT System",
    
    // Notification Settings
    send_absence_notifications: true,
    send_late_notifications: true,
    send_weekly_reports: false,
    parent_notification_enabled: false,
    admin_notification_enabled: true,
    
    // Storage Settings
    max_file_upload_size: 10,
    image_compression_quality: 85,
    auto_backup_enabled: false,
    backup_frequency: "weekly",
    backup_retention_days: 30,
    storage_cleanup_enabled: true,
    
    // System Maintenance
    maintenance_mode: false,
    maintenance_message: "System is under maintenance. Please check back later.",
    system_announcement: "",
    debug_mode: false,
    log_level: "INFO",
  });

  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_students: 0,
    total_users: 0,
    total_attendance_records: 0,
    database_size: "0 MB",
    storage_used: "0 MB",
    system_uptime: "0 days",
    last_backup: "Never",
    system_version: "1.0.0",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemStats();
  }, []);

  
const fetchSystemSettings = async () => {
    setLoading(true);
    try {
      const data = await djangoApi.getSystemSettings();
      setSettings(data);
    } catch (err: any) {
      setError("Failed to load system settings: " + err.message);
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
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Settings
              </>
            )}
          </Button>
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
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="face-recognition">Face Recognition</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="storage">Storage & Backup</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* School Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>School Name</Label>
                  <Input
                    value={settings.school_name}
                    onChange={(e) => updateSetting('school_name', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={settings.school_address}
                    onChange={(e) => updateSetting('school_address', e.target.value)}
                    placeholder="Enter school address"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={settings.school_phone}
                      onChange={(e) => updateSetting('school_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settings.school_email}
                      onChange={(e) => updateSetting('school_email', e.target.value)}
                      placeholder="info@school.edu"
                    />
                  </div>
                </div>
                <div>
                  <Label>Academic Year</Label>
                  <Input
                    value={settings.academic_year}
                    onChange={(e) => updateSetting('academic_year', e.target.value)}
                    placeholder="2024-2025"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date Format</Label>
                    <Select value={settings.date_format} onValueChange={(value) => updateSetting('date_format', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">2025-06-20</SelectItem>
                        <SelectItem value="MM/DD/YYYY">06/20/2025</SelectItem>
                        <SelectItem value="DD/MM/YYYY">20/06/2025</SelectItem>
                        <SelectItem value="DD-MM-YYYY">20-06-2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Format</Label>
                    <Select value={settings.time_format} onValueChange={(value) => updateSetting('time_format', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                        <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{systemStats.total_students}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold">{systemStats.total_users}</p>
                  <p className="text-xs text-gray-500">Users</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-lg font-bold">{systemStats.total_attendance_records}</p>
                  <p className="text-xs text-gray-500">Records</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Database className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                  <p className="text-lg font-bold">{systemStats.database_size}</p>
                  <p className="text-xs text-gray-500">Database</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <HardDrive className="h-6 w-6 mx-auto mb-1 text-red-500" />
                  <p className="text-lg font-bold">{systemStats.storage_used}</p>
                  <p className="text-xs text-gray-500">Storage</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-indigo-500" />
                  <p className="text-lg font-bold">{systemStats.system_uptime}</p>
                  <p className="text-xs text-gray-500">Uptime</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Download className="h-6 w-6 mx-auto mb-1 text-cyan-500" />
                  <p className="text-lg font-bold">{systemStats.last_backup !== 'Never' ? 
                    new Date(systemStats.last_backup).toLocaleDateString() : 'Never'}</p>
                  <p className="text-xs text-gray-500">Last Backup</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Info className="h-6 w-6 mx-auto mb-1 text-gray-500" />
                  <p className="text-lg font-bold">v{systemStats.system_version}</p>
                  <p className="text-xs text-gray-500">Version</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Attendance Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Grace Period (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.attendance_grace_period}
                    onChange={(e) => updateSetting('attendance_grace_period', parseInt(e.target.value))}
                    min="0"
                    max="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Students can mark attendance within this time without being marked late</p>
                </div>
                <div>
                  <Label>Late Threshold (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.late_threshold}
                    onChange={(e) => updateSetting('late_threshold', parseInt(e.target.value))}
                    min="1"
                    max="120"
                  />
                  <p className="text-xs text-gray-500 mt-1">Students arriving after this time are marked as late</p>
                </div>
                <div>
                  <Label>Auto Mark Absent After (hours)</Label>
                  <Input
                    type="number"
                    value={settings.auto_mark_absent_after}
                    onChange={(e) => updateSetting('auto_mark_absent_after', parseInt(e.target.value))}
                    min="1"
                    max="24"
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically mark students absent if they don't show up</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Attendance Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Check-out</Label>
                    <p className="text-sm text-gray-500">Students must check out when leaving</p>
                  </div>
                  <Switch
                    checked={settings.require_checkout}
                    onCheckedChange={(checked) => updateSetting('require_checkout', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Manual Attendance</Label>
                    <p className="text-sm text-gray-500">Teachers can manually mark attendance</p>
                  </div>
                  <Switch
                    checked={settings.allow_manual_attendance}
                    onCheckedChange={(checked) => updateSetting('allow_manual_attendance', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Attendance Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications for attendance events</p>
                  </div>
                  <Switch
                    checked={settings.attendance_notifications}
                    onCheckedChange={(checked) => updateSetting('attendance_notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="face-recognition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Face Recognition Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Face Recognition</Label>
                    <p className="text-sm text-gray-500">Use facial recognition for attendance</p>
                  </div>
                  <Switch
                    checked={settings.face_recognition_enabled}
                    onCheckedChange={(checked) => updateSetting('face_recognition_enabled', checked)}
                  />
                </div>
                <div>
                  <Label>Confidence Threshold (%)</Label>
                  <Input
                    type="number"
                    value={settings.face_confidence_threshold}
                    onChange={(e) => updateSetting('face_confidence_threshold', parseInt(e.target.value))}
                    min="50"
                    max="99"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum confidence required for face recognition</p>
                </div>
                <div>
                  <Label>Detection Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.face_detection_timeout}
                    onChange={(e) => updateSetting('face_detection_timeout', parseInt(e.target.value))}
                    min="5"
                    max="60"
                  />
                </div>
                <div>
                  <Label>Max Images Per Student</Label>
                  <Input
                    type="number"
                    value={settings.max_face_images_per_student}
                    onChange={(e) => updateSetting('max_face_images_per_student', parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Image Quality Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Image Quality Threshold (%)</Label>
                  <Input
                    type="number"
                    value={settings.face_image_quality_threshold}
                    onChange={(e) => updateSetting('face_image_quality_threshold', parseInt(e.target.value))}
                    min="50"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum image quality for face registration</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Capture</Label>
                    <p className="text-sm text-gray-500">Automatically capture when face is detected</p>
                  </div>
                  <Switch
                    checked={settings.auto_capture_enabled}
                    onCheckedChange={(checked) => updateSetting('auto_capture_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.email_enabled}
                    onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
                  />
                </div>
                {settings.email_enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SMTP Host</Label>
                        <Input
                          value={settings.smtp_host}
                          onChange={(e) => updateSetting('smtp_host', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label>SMTP Port</Label>
                        <Input
                          type="number"
                          value={settings.smtp_port}
                          onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={settings.smtp_username}
                          onChange={(e) => updateSetting('smtp_username', e.target.value)}
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={settings.smtp_password}
                          onChange={(e) => updateSetting('smtp_password', e.target.value)}
                          placeholder="Your app password"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>From Address</Label>
                        <Input
                          type="email"
                          value={settings.email_from_address}
                          onChange={(e) => updateSetting('email_from_address', e.target.value)}
                          placeholder="noreply@school.edu"
                        />
                      </div>
                      <div>
                        <Label>From Name</Label>
                        <Input
                          value={settings.email_from_name}
                          onChange={(e) => updateSetting('email_from_name', e.target.value)}
                          placeholder="School Attendance System"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Use TLS</Label>
                        <p className="text-sm text-gray-500">Enable secure email transmission</p>
                      </div>
                      <Switch
                        checked={settings.smtp_use_tls}
                        onCheckedChange={(checked) => updateSetting('smtp_use_tls', checked)}
                      />
                    </div>
                    <Button onClick={handleTestEmail} disabled={testingEmail} variant="outline">
                      {testingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Test Email
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Absence Notifications</Label>
                    <p className="text-sm text-gray-500">Notify when students are absent</p>
                  </div>
                  <Switch
                    checked={settings.send_absence_notifications}
                    onCheckedChange={(checked) => updateSetting('send_absence_notifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Late Notifications</Label>
                    <p className="text-sm text-gray-500">Notify when students are late</p>
                  </div>
                  <Switch
                    checked={settings.send_late_notifications}
                    onCheckedChange={(checked) => updateSetting('send_late_notifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Send weekly attendance summaries</p>
                  </div>
                  <Switch
                    checked={settings.send_weekly_reports}
                    onCheckedChange={(checked) => updateSetting('send_weekly_reports', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parent Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications to parents</p>
                  </div>
                  <Switch
                    checked={settings.parent_notification_enabled}
                    onCheckedChange={(checked) => updateSetting('parent_notification_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications to administrators</p>
                  </div>
                  <Switch
                    checked={settings.admin_notification_enabled}
                    onCheckedChange={(checked) => updateSetting('admin_notification_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="mr-2 h-5 w-5" />
                  Storage Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Max File Upload Size (MB)</Label>
                  <Input
                    type="number"
                    value={settings.max_file_upload_size}
                    onChange={(e) => updateSetting('max_file_upload_size', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum size for uploaded files</p>
                </div>
                <div>
                  <Label>Image Compression Quality (%)</Label>
                  <Input
                    type="number"
                    value={settings.image_compression_quality}
                    onChange={(e) => updateSetting('image_compression_quality', parseInt(e.target.value))}
                    min="50"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quality level for compressed images</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Storage Cleanup</Label>
                    <p className="text-sm text-gray-500">Automatically clean up old files</p>
                  </div>
                  <Switch
                    checked={settings.storage_cleanup_enabled}
                    onCheckedChange={(checked) => updateSetting('storage_cleanup_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Backup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-gray-500">Automatically create backups</p>
                  </div>
                  <Switch
                    checked={settings.auto_backup_enabled}
                    onCheckedChange={(checked) => updateSetting('auto_backup_enabled', checked)}
                  />
                </div>
                {settings.auto_backup_enabled && (
                  <>
                    <div>
                      <Label>Backup Frequency</Label>
                      <Select value={settings.backup_frequency} onValueChange={(value) => updateSetting('backup_frequency', value)}>
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
                      <Label>Backup Retention (days)</Label>
                      <Input
                        type="number"
                        value={settings.backup_retention_days}
                        onChange={(e) => updateSetting('backup_retention_days', parseInt(e.target.value))}
                        min="7"
                        max="365"
                      />
                      <p className="text-xs text-gray-500 mt-1">How long to keep backup files</p>
                    </div>
                  </>
                )}
                <Button onClick={handleBackupNow} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Maintenance Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put system in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                </div>
                {settings.maintenance_mode && (
                  <div>
                    <Label>Maintenance Message</Label>
                    <Textarea
                      value={settings.maintenance_message}
                      onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                      placeholder="System is under maintenance..."
                      rows={3}
                    />
                  </div>
                )}
                <div>
                  <Label>System Announcement</Label>
                  <Textarea
                    value={settings.system_announcement}
                    onChange={(e) => updateSetting('system_announcement', e.target.value)}
                    placeholder="Important system announcement..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Will be displayed to all users</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="mr-2 h-5 w-5" />
                  System Debug
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable detailed logging</p>
                  </div>
                  <Switch
                    checked={settings.debug_mode}
                    onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
                  />
                </div>
                <div>
                  <Label>Log Level</Label>
                  <Select value={settings.log_level} onValueChange={(value) => updateSetting('log_level', value)}>
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
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download System Logs
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear System Logs
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restart System Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                System Health Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-green-600">Connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Storage</p>
                    <p className="text-sm text-green-600">Available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-red-600">Not Configured</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Face Recognition</p>
                    <p className="text-sm text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};