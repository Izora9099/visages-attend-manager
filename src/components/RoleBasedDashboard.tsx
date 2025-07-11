// src/components/RoleBasedDashboard.tsx - Updated to work with Django API

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  Building2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList
} from "recharts";

import { djangoApi } from '@/services/djangoApi';
import { UserPermissions, DashboardStats, DepartmentStats, CourseStats, TeacherStats } from '@/types';

interface PermissionChecker {
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

interface RoleBasedDashboardProps {
  userPermissions: UserPermissions;
  setActiveTab: (tab: string) => void;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ userPermissions, setActiveTab }) => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const permissionChecker: PermissionChecker = {
    hasRole: (role: string | string[]) => {
      if (Array.isArray(role)) {
        return role.includes(userPermissions.role);
      }
      return userPermissions.role === role;
    },
    hasPermission: (permission: string) => {
      return userPermissions.is_superuser || userPermissions.permissions.includes(permission);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userPermissions]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load basic dashboard stats
      const statsPromise = djangoApi.getDashboardStats().catch(err => {
        console.warn('Dashboard stats not available:', err);
        return {
          total_students: 0,
          total_courses: 0,
          total_departments: 0,
          total_teachers: 0,
          active_sessions: 0,
          total_attendance_records: 0,
          todays_attendance_count: 0,
          todays_attendance_rate: 0,
          weekly_attendance_trend: [],
          recent_activities: []
        };
      });

      const promises = [statsPromise];

      // Load additional stats based on role
      if (permissionChecker.hasRole(['superadmin', 'staff'])) {
        promises.push(
          djangoApi.getDepartmentStats().catch(() => []),
          djangoApi.getCourseStats().catch(() => []),
          djangoApi.getTeacherStats().catch(() => [])
        );
      }

      const results = await Promise.all(promises);
      
      setDashboardData(results[0]);
      if (results.length > 1) {
        setDepartmentStats(results[1]);
        setCourseStats(results[2]);
        setTeacherStats(results[3]);
      }

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Superadmin Dashboard
  if (permissionChecker.hasRole('superadmin')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            System Administrator
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.total_students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.total_courses || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.total_departments || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.total_teachers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {dashboardData?.todays_attendance_rate?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-gray-600">
                {dashboardData?.todays_attendance_count || 0} students checked in
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {dashboardData?.active_sessions || 0}
              </div>
              <p className="text-sm text-gray-600">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {dashboardData?.total_attendance_records || 0}
              </div>
              <p className="text-sm text-gray-600">Attendance records</p>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        {departmentStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution by Department</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total students: {departmentStats.reduce((sum, dept) => sum + (dept.total_students || 0), 0)}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={[...departmentStats].sort((a, b) => (b.total_students || 0) - (a.total_students || 0))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="department_name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} students`, 'Number of Students']}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Bar 
                    dataKey="total_students" 
                    name="Students" 
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  >
                    {[...departmentStats]
                      .sort((a, b) => (b.total_students || 0) - (a.total_students || 0))
                      .map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${index * (360 / departmentStats.length)}, 70%, 60%)`}
                        />
                      ))
                    }
                    <LabelList 
                      dataKey="total_students" 
                      position="right" 
                      formatter={(value: number) => `${value} (${((value / departmentStats.reduce((sum, dept) => sum + (dept.total_students || 0), 0)) * 100).toFixed(1)}%)`}
                      style={{ fill: '#4b5563', fontSize: 12 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent System Activities</CardTitle>
            <a 
              href="#" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('security');
              }}
            >
              See All
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recent_activities?.length > 0 ? (
                dashboardData.recent_activities.slice(0, 3).map((activity: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                    <div>
                      <p className="font-medium">{activity.action || 'System Activity'}</p>
                      <p className="text-sm text-gray-500">
                        {activity.user || 'System'}
                        <span className="mx-2">•</span>
                        <span>{activity.time || 'Just now'}</span>
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {activity.status === 'success' ? (
                        <span className="text-green-500">✓</span>
                      ) : activity.status === 'failed' ? (
                        <span className="text-red-500">✗</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No recent activities found</p>
                  <p className="text-sm text-gray-400 mt-1">System activities will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Staff Dashboard
  if (permissionChecker.hasRole('staff')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Student Management Dashboard</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Staff Member
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.total_students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.total_courses || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData?.todays_attendance_rate?.toFixed(1) || 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Performance */}
        {courseStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseStats.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course_code" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrolled_students" fill="#3b82f6" name="Enrolled Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Teacher Dashboard
  if (permissionChecker.hasRole('teacher')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Teaching Dashboard</h1>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Teacher
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teacherStats.find(t => t.teacher_name === `${userPermissions.username}`)?.total_courses || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teacherStats.find(t => t.teacher_name === `${userPermissions.username}`)?.total_students || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.active_sessions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Records</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teacherStats.find(t => t.teacher_name === `${userPermissions.username}`)?.total_attendance_records || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming sessions</p>
                <p className="text-sm text-gray-400">Check your schedule or create a new session</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent sessions</p>
                  <p className="text-sm text-gray-400">Your recent teaching sessions will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Attendance Trend */}
        {dashboardData?.weekly_attendance_trend && dashboardData.weekly_attendance_trend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.weekly_attendance_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendance_rate" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default Dashboard for users without specific roles
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to FACE.IT</h1>
          <div>
            <span className="text-gray-600 mb-4">
              Role: </span>
            <Badge variant="outline">{userPermissions.role}</Badge>
          </div>
        </div>
        <p className="text-gray-600">Please contact your administrator for access permissions.</p>
      </div>
    </div>
  );
};