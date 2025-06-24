// src/components/SessionManagement.tsx
// New component for automated attendance session management

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, StopCircle, Clock, Users, CheckCircle, XCircle, AlertTriangle, Settings, Calendar } from "lucide-react";

interface AttendanceSession {
  id: number;
  course_code: string;
  course_name: string;
  teacher_name: string;
  teacher_id: number;
  level: string;
  start_time: string;
  expected_end_time: string;
  actual_end_time?: string;
  status: 'active' | 'completed' | 'cancelled';
  total_students: number;
  checked_in_students: number;
  late_students: number;
  absent_students: number;
  grace_period_minutes: number;
  session_duration_minutes: number;
  room: string;
  check_in_method: 'biometric' | 'nfc' | 'qr_code';
  created_at: string;
  auto_closed: boolean;
}

interface StudentCheckIn {
  id: number;
  session_id: number;
  student_id: number;
  student_name: string;
  student_number: string;
  check_in_time: string;
  status: 'present' | 'late' | 'absent';
  check_in_method: string;
  is_manual_entry: boolean;
}

interface SessionSettings {
  default_session_duration: number;
  default_grace_period: number;
  auto_close_enabled: boolean;
  check_in_methods: string[];
  notification_enabled: boolean;
  manual_override_allowed: boolean;
}

// Dummy data
const dummySessions: AttendanceSession[] = [
  {
    id: 1,
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    teacher_name: "Dr. John Smith",
    teacher_id: 1,
    level: "Level 100",
    start_time: "2024-06-23T08:00:00",
    expected_end_time: "2024-06-23T10:00:00",
    status: 'active',
    total_students: 45,
    checked_in_students: 38,
    late_students: 5,
    absent_students: 2,
    grace_period_minutes: 15,
    session_duration_minutes: 120,
    room: "Room A101",
    check_in_method: 'biometric',
    created_at: "2024-06-23T07:58:00",
    auto_closed: false
  },
  {
    id: 2,
    course_code: "MATH201",
    course_name: "Calculus II",
    teacher_name: "Prof. Sarah Johnson",
    teacher_id: 2,
    level: "Level 200",
    start_time: "2024-06-23T10:15:00",
    expected_end_time: "2024-06-23T12:15:00",
    actual_end_time: "2024-06-23T12:10:00",
    status: 'completed',
    total_students: 38,
    checked_in_students: 35,
    late_students: 2,
    absent_students: 1,
    grace_period_minutes: 15,
    session_duration_minutes: 120,
    room: "Room B205",
    check_in_method: 'nfc',
    created_at: "2024-06-23T10:12:00",
    auto_closed: true
  },
  {
    id: 3,
    course_code: "ENG301",
    course_name: "Advanced English Composition",
    teacher_name: "Dr. Emily Davis",
    teacher_id: 3,
    level: "Level 300",
    start_time: "2024-06-23T13:00:00",
    expected_end_time: "2024-06-23T15:00:00",
    status: 'active',
    total_students: 28,
    checked_in_students: 26,
    late_students: 1,
    absent_students: 1,
    grace_period_minutes: 10,
    session_duration_minutes: 120,
    room: "Room C301",
    check_in_method: 'qr_code',
    created_at: "2024-06-23T12:58:00",
    auto_closed: false
  }
];

const dummyCheckIns: StudentCheckIn[] = [
  {
    id: 1,
    session_id: 1,
    student_id: 101,
    student_name: "Alice Johnson",
    student_number: "STU001",
    check_in_time: "2024-06-23T08:05:00",
    status: 'present',
    check_in_method: 'biometric',
    is_manual_entry: false
  },
  {
    id: 2,
    session_id: 1,
    student_id: 102,
    student_name: "Bob Smith",
    student_number: "STU002",
    check_in_time: "2024-06-23T08:18:00",
    status: 'late',
    check_in_method: 'biometric',
    is_manual_entry: false
  },
  {
    id: 3,
    session_id: 1,
    student_id: 103,
    student_name: "Carol Davis",
    student_number: "STU003",
    check_in_time: "2024-06-23T08:02:00",
    status: 'present',
    check_in_method: 'biometric',
    is_manual_entry: false
  },
  {
    id: 4,
    session_id: 2,
    student_id: 201,
    student_name: "David Wilson",
    student_number: "STU201",
    check_in_time: "2024-06-23T10:20:00",
    status: 'present',
    check_in_method: 'nfc',
    is_manual_entry: false
  }
];

const dummySettings: SessionSettings = {
  default_session_duration: 120,
  default_grace_period: 15,
  auto_close_enabled: true,
  check_in_methods: ['biometric', 'nfc', 'qr_code'],
  notification_enabled: true,
  manual_override_allowed: true
};

export const SessionManagement = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>(dummySessions);
  const [checkIns, setCheckIns] = useState<StudentCheckIn[]>(dummyCheckIns);
  const [settings, setSettings] = useState<SessionSettings>(dummySettings);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'terminal' | 'settings'>('active');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  const getSessionProgress = (session: AttendanceSession) => {
    const now = currentTime.getTime();
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.expected_end_time).getTime();
    const progress = Math.min(((now - start) / (end - start)) * 100, 100);
    return Math.max(0, progress);
  };

  const getRemainingTime = (session: AttendanceSession) => {
    const now = currentTime.getTime();
    const end = new Date(session.expected_end_time).getTime();
    const remaining = Math.max(0, end - now);
    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getAttendanceRate = (session: AttendanceSession) => {
    return Math.round((session.checked_in_students / session.total_students) * 100);
  };

  const handleStartSession = (courseData: any) => {
    const newSession: AttendanceSession = {
      id: Math.max(...sessions.map(s => s.id)) + 1,
      course_code: courseData.course_code,
      course_name: courseData.course_name,
      teacher_name: courseData.teacher_name,
      teacher_id: courseData.teacher_id,
      level: courseData.level,
      start_time: new Date().toISOString(),
      expected_end_time: new Date(Date.now() + settings.default_session_duration * 60000).toISOString(),
      status: 'active',
      total_students: courseData.enrolled_students,
      checked_in_students: 0,
      late_students: 0,
      absent_students: 0,
      grace_period_minutes: settings.default_grace_period,
      session_duration_minutes: settings.default_session_duration,
      room: courseData.room,
      check_in_method: 'biometric',
      created_at: new Date().toISOString(),
      auto_closed: false
    };

    setSessions([...sessions, newSession]);
    setIsStartDialogOpen(false);
  };

  const handleEndSession = (sessionId: number) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? {
            ...session, 
            status: 'completed' as const,
            actual_end_time: new Date().toISOString(),
            absent_students: session.total_students - session.checked_in_students
          }
        : session
    ));
  };

  const getSessionCheckIns = (sessionId: number) => {
    return checkIns.filter(checkIn => checkIn.session_id === sessionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCheckInMethodIcon = (method: string) => {
    switch (method) {
      case 'biometric': return '👤';
      case 'nfc': return '📱';
      case 'qr_code': return '📱';
      default: return '✋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-green-50">
            {activeSessions.length} Active Sessions
          </Badge>
          <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="terminal">Terminal View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                <p className="text-gray-500 text-center mb-4">
                  Start a new attendance session to begin tracking student check-ins
                </p>
                <Button onClick={() => setIsStartDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start New Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSessions.map(session => (
                <Card key={session.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{session.course_code}</CardTitle>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{session.course_name}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Teacher</div>
                        <div className="font-medium">{session.teacher_name}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Room</div>
                        <div className="font-medium">{session.room}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Level</div>
                        <div className="font-medium">{session.level}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Check-in Method</div>
                        <div className="font-medium">
                          {getCheckInMethodIcon(session.check_in_method)} {session.check_in_method}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Session Progress</span>
                        <span>{getRemainingTime(session)} remaining</span>
                      </div>
                      <Progress value={getSessionProgress(session)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">{session.checked_in_students}</div>
                        <div className="text-xs text-gray-500">Present</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-lg font-bold text-orange-600">{session.late_students}</div>
                        <div className="text-xs text-gray-500">Late</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-lg font-bold text-gray-600">
                          {session.total_students - session.checked_in_students}
                        </div>
                        <div className="text-xs text-gray-500">Not Checked In</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Attendance Rate: </span>
                        <span className="font-medium">{getAttendanceRate(session)}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndSession(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedSessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.course_code}</div>
                          <div className="text-sm text-gray-500">{session.course_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{session.teacher_name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(session.start_time).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(session.start_time).toLocaleTimeString()} - 
                            {session.actual_end_time && new Date(session.actual_end_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.round(session.session_duration_minutes / 60 * 10) / 10}h
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm">
                            <span className="text-green-600">{session.checked_in_students}</span>
                            <span className="text-gray-400">/</span>
                            <span>{session.total_students}</span>
                          </div>
                          <Badge variant="outline">{getAttendanceRate(session)}%</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.auto_closed ? "secondary" : "default"}>
                          {session.auto_closed ? "Auto-closed" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Terminal Interface</CardTitle>
              <p className="text-sm text-gray-500">
                This interface simulates the physical attendance terminal device
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono">
                <div className="text-center mb-6">
                  <h2 className="text-xl mb-2">ATTENDANCE TERMINAL</h2>
                  <div className="text-sm text-gray-400">
                    {currentTime.toLocaleString()}
                  </div>
                </div>
                
                {activeSessions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg mb-2">ACTIVE SESSIONS</div>
                      {activeSessions.map(session => (
                        <div key={session.id} className="border border-green-400 p-3 mb-2 rounded">
                          <div className="font-bold">{session.course_code} - {session.course_name}</div>
                          <div className="text-sm">Room: {session.room} | Students: {session.checked_in_students}/{session.total_students}</div>
                          <div className="text-sm">Time Remaining: {getRemainingTime(session)}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg mb-2">READY FOR CHECK-IN</div>
                      <div className="text-sm text-gray-400">
                        Present your biometric scan, NFC card, or QR code
                      </div>
                      <div className="mt-4 p-4 bg-green-900 rounded">
                        <div className="animate-pulse">🔍 Scanning...</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-lg mb-2">NO ACTIVE SESSIONS</div>
                    <div className="text-sm text-gray-400">
                      Waiting for teacher to start a session...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session_duration">Default Session Duration (minutes)</Label>
                  <Input
                    id="session_duration"
                    type="number"
                    value={settings.default_session_duration}
                    onChange={(e) => setSettings({...settings, default_session_duration: parseInt(e.target.value)})}
                    min="30"
                    max="240"
                  />
                </div>
                <div>
                  <Label htmlFor="grace_period">Grace Period (minutes)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    value={settings.default_grace_period}
                    onChange={(e) => setSettings({...settings, default_grace_period: parseInt(e.target.value)})}
                    min="0"
                    max="30"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-close Sessions</Label>
                    <p className="text-sm text-gray-500">Automatically close sessions when duration expires</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.auto_close_enabled}
                    onChange={(e) => setSettings({...settings, auto_close_enabled: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications for session events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notification_enabled}
                    onChange={(e) => setSettings({...settings, notification_enabled: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Manual Override</Label>
                    <p className="text-sm text-gray-500">Allow manual attendance editing</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.manual_override_allowed}
                    onChange={(e) => setSettings({...settings, manual_override_allowed: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <div>
                <Label>Available Check-in Methods</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['biometric', 'nfc', 'qr_code'].map(method => (
                    <div key={method} className="flex items-center space-x-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={settings.check_in_methods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({
                              ...settings,
                              check_in_methods: [...settings.check_in_methods, method]
                            });
                          } else {
                            setSettings({
                              ...settings,
                              check_in_methods: settings.check_in_methods.filter(m => m !== method)
                            });
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Details Dialog */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Session Details: {selectedSession.course_code}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Course:</span>
                      <span className="font-medium">{selectedSession.course_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Teacher:</span>
                      <span className="font-medium">{selectedSession.teacher_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span className="font-medium">{selectedSession.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{selectedSession.session_duration_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grace Period:</span>
                      <span className="font-medium">{selectedSession.grace_period_minutes} minutes</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Students:</span>
                      <span className="font-medium">{selectedSession.total_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <span className="font-medium text-green-600">{selectedSession.checked_in_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late:</span>
                      <span className="font-medium text-orange-600">{selectedSession.late_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Not Checked In:</span>
                      <span className="font-medium text-gray-600">
                        {selectedSession.total_students - selectedSession.checked_in_students}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance Rate:</span>
                      <span className="font-medium">{getAttendanceRate(selectedSession)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Student Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSessionCheckIns(selectedSession.id).map(checkIn => (
                        <TableRow key={checkIn.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{checkIn.student_name}</div>
                              <div className="text-sm text-gray-500">{checkIn.student_number}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(checkIn.check_in_time).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                checkIn.status === 'present' ? 'default' : 
                                checkIn.status === 'late' ? 'secondary' : 'destructive'
                              }
                            >
                              {checkIn.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getCheckInMethodIcon(checkIn.check_in_method)} {checkIn.check_in_method}
                            {checkIn.is_manual_entry && (
                              <Badge variant="outline" className="ml-1 text-xs">Manual</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Start Session Dialog */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Available Courses (Current Time Slot)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on the current time ({currentTime.toLocaleTimeString()}), the following courses are scheduled:
            </p>
            
            {/* Mock current time slot courses */}
            <div className="space-y-2">
              {[
                {
                  course_code: "CS401",
                  course_name: "Senior Project",
                  teacher_name: "Dr. Michael Brown",
                  teacher_id: 4,
                  level: "Level 400",
                  room: "Lab D401",
                  enrolled_students: 18
                },
                {
                  course_code: "PHYS301",
                  course_name: "Quantum Physics",
                  teacher_name: "Dr. Sarah Wilson",
                  teacher_id: 5,
                  level: "Level 300",
                  room: "Lab E301",
                  enrolled_students: 25
                }
              ].map(course => (
                <div key={course.course_code} className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                     onClick={() => handleStartSession(course)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{course.course_code} - {course.course_name}</div>
                      <div className="text-sm text-gray-500">
                        {course.teacher_name} • {course.room} • {course.level}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{course.enrolled_students} students</div>
                      <Badge variant="outline">Ready to start</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* No courses message */}
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No courses scheduled for current time slot</p>
              <p className="text-sm">Sessions can only be started during scheduled class times</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </div>
  );
};