
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { djangoApi } from '@/services/djangoApi';
import { PermissionChecker } from '@/utils/permissionChecker';
import { UserPermissions } from '@/types/permissions';
import { Users, BookOpen, Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface RoleBasedDashboardProps {
  userPermissions: UserPermissions;
}

export const RoleBasedDashboard = ({ userPermissions }: RoleBasedDashboardProps) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const permissionChecker = new PermissionChecker(userPermissions);

  useEffect(() => {
    fetchDashboardData();
  }, [userPermissions]);

  const fetchDashboardData = async () => {
    try {
      // Fetch role-specific dashboard data
      const data = await getDashboardDataByRole();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardDataByRole = async () => {
    if (permissionChecker.hasRole('Superadmin')) {
      return getSuperadminDashboardData();
    } else if (permissionChecker.hasRole('Teacher')) {
      return getTeacherDashboardData();
    } else if (permissionChecker.hasRole('Staff')) {
      return getStaffDashboardData();
    }
    return getDefaultDashboardData();
  };

  const getSuperadminDashboardData = () => {
    // Mock data for Superadmin
    return {
      totalStudents: 1250,
      totalTeachers: 45,
      totalCourses: 120,
      activeSessions: 8,
      todayAttendance: 89,
      systemHealth: 'Good',
      recentActivities: [
        { action: 'New student registered', time: '5 minutes ago', user: 'Staff01' },
        { action: 'Course CSC301 updated', time: '15 minutes ago', user: 'Dr. Smith' },
        { action: 'Attendance session started', time: '30 minutes ago', user: 'Prof. Johnson' },
      ]
    };
  };

  const getTeacherDashboardData = () => {
    // Mock data for Teacher (scoped to their courses)
    return {
      myCourses: ['CSC101', 'CSC201', 'CSC301'],
      todaySessions: 2,
      totalStudentsInMyCourses: 150,
      averageAttendance: 85,
      nextSession: {
        course: 'CSC101',
        time: '2:00 PM',
        room: 'Lab A101'
      },
      recentSessions: [
        { course: 'CSC101', date: 'Today', attendance: '45/50', status: 'Completed' },
        { course: 'CSC201', date: 'Yesterday', attendance: '38/42', status: 'Completed' },
      ]
    };
  };

  const getStaffDashboardData = () => {
    // Mock data for Staff
    return {
      newRegistrations: 12,
      pendingEnrollments: 5,
      enrollmentRequests: 8,
      totalActiveStudents: 1180,
      recentRegistrations: [
        { name: 'John Doe', level: '100', date: 'Today' },
        { name: 'Jane Smith', level: '200', date: 'Yesterday' },
      ]
    };
  };

  const getDefaultDashboardData = () => {
    return {
      message: 'Welcome to FACE.IT'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Superadmin Dashboard
  if (permissionChecker.hasRole('Superadmin')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <Badge variant="outline" className="text-green-600 border-green-600">
            System Health: {dashboardData.systemHealth}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activeSessions}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent System Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Teacher Dashboard
  if (permissionChecker.hasRole('Teacher')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Teaching Dashboard</h1>
          <Badge variant="outline">
            {dashboardData.myCourses.length} Assigned Courses
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalStudentsInMyCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.todaySessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.averageAttendance}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.myCourses.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-medium">{dashboardData.nextSession.course}</h3>
                <p className="text-sm text-gray-600">Time: {dashboardData.nextSession.time}</p>
                <p className="text-sm text-gray-600">Room: {dashboardData.nextSession.room}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentSessions.map((session: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{session.course}</p>
                      <p className="text-sm text-gray-500">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.attendance}</p>
                      <Badge variant="outline" className="text-xs">
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Staff Dashboard
  if (permissionChecker.hasRole('Staff')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Student Management Dashboard</h1>
          <Badge variant="outline">
            {dashboardData.pendingEnrollments} Pending Tasks
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalActiveStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardData.newRegistrations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingEnrollments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollment Requests</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardData.enrollmentRequests}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Student Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentRegistrations.map((registration: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{registration.name}</p>
                    <p className="text-sm text-gray-500">Level {registration.level}</p>
                  </div>
                  <span className="text-sm text-gray-400">{registration.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default Dashboard
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FACE.IT</h2>
        <p className="text-gray-600">Please contact your administrator for access permissions.</p>
      </div>
    </div>
  );
};
