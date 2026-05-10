import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Calendar, AlertCircle, CheckCircle, Clock,
  GraduationCap, Building2, Activity, ArrowUpRight, FileText,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Area, AreaChart,
} from "recharts";

import { djangoApi } from '@/services/djangoApi';
import { UserPermissions, DashboardStats, DepartmentStats, CourseStats, TeacherStats } from '@/types';

interface RoleBasedDashboardProps {
  userPermissions: UserPermissions;
  setActiveTab: (tab: string) => void;
}

const chartTooltip = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--hairline))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: 'var(--shadow-md)',
  },
  cursor: { fill: 'hsl(var(--muted) / 0.4)' },
};

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ userPermissions, setActiveTab }) => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasRole = (role: string | string[]) =>
    Array.isArray(role) ? role.includes(userPermissions.role) : userPermissions.role === role;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const stats = await djangoApi.getDashboardStats().catch(() => ({
          total_students: 0, total_courses: 0, total_departments: 0, total_teachers: 0,
          active_sessions: 0, total_attendance_records: 0, todays_attendance_count: 0,
          todays_attendance_rate: 0, weekly_attendance_trend: [], recent_activities: [],
        } as DashboardStats));
        setDashboardData(stats);

        if (hasRole(['superadmin', 'staff'])) {
          const [d, c, t] = await Promise.all([
            djangoApi.getDepartmentStats().catch(() => [] as DepartmentStats[]),
            djangoApi.getCourseStats().catch(() => [] as CourseStats[]),
            djangoApi.getTeacherStats().catch(() => [] as TeacherStats[]),
          ]);
          setDepartmentStats(d as DepartmentStats[]);
          setCourseStats(c as CourseStats[]);
          setTeacherStats(t as TeacherStats[]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally { setLoading(false); }
    })();
  }, [userPermissions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-72 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg border border-hairline bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  const userName = userPermissions.username || 'User';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  // ── SUPERADMIN ────────────────────────────────────────────────
  if (hasRole('superadmin')) {
    const trendData = dashboardData?.weekly_attendance_trend?.length
      ? dashboardData.weekly_attendance_trend
      : Array.from({ length: 7 }, (_, i) => ({ date: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], attendance_rate: 0 }));

    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow={`${greeting}, ${userName}`}
          title="System overview."
          description="A real-time look at attendance, sessions, and institutional health across departments."
          actions={
            <>
              <Badge variant="accent" className="hidden sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
                Live
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')}>
                Reports <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </>
          }
        />

        {/* Key metrics */}
        <section>
          <p className="eyebrow mb-4">Key metrics</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Students" value={dashboardData?.total_students ?? 0} icon={<Users className="h-4 w-4" />} hint="Active enrolment" />
            <StatCard label="Courses" value={dashboardData?.total_courses ?? 0} icon={<BookOpen className="h-4 w-4" />} hint="Across all levels" />
            <StatCard label="Teachers" value={dashboardData?.total_teachers ?? 0} icon={<GraduationCap className="h-4 w-4" />} hint="Faculty members" />
            <StatCard label="Departments" value={dashboardData?.total_departments ?? 0} icon={<Building2 className="h-4 w-4" />} hint="Organisational units" />
          </div>
        </section>

        {/* Today + Trend */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 grid gap-4">
            <StatCard
              accent
              label="Today's attendance"
              value={`${(dashboardData?.todays_attendance_rate ?? 0).toFixed(1)}%`}
              icon={<CheckCircle className="h-4 w-4" />}
              hint={`${dashboardData?.todays_attendance_count ?? 0} students checked in`}
            />
            <StatCard label="Active sessions" value={dashboardData?.active_sessions ?? 0} icon={<Activity className="h-4 w-4" />} hint="Currently running" />
            <StatCard label="Total records" value={dashboardData?.total_attendance_records ?? 0} icon={<FileText className="h-4 w-4" />} hint="All-time" />
          </div>

          <div className="lg:col-span-2 rounded-lg border border-hairline bg-card p-6">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="eyebrow">This week</p>
                <h3 className="display-serif text-2xl mt-1">Attendance trend</h3>
              </div>
              <Badge variant="outline" className="font-mono normal-case">7d</Badge>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--hairline))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="attendance_rate" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Department distribution */}
        {departmentStats.length > 0 && (
          <section className="rounded-lg border border-hairline bg-card p-6">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="eyebrow">By department</p>
                <h3 className="display-serif text-2xl mt-1">Student distribution</h3>
              </div>
              <p className="text-xs text-muted-foreground num">
                Total: {departmentStats.reduce((s, d) => s + (d.total_students || 0), 0)}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(260, departmentStats.length * 36)}>
              <BarChart
                data={[...departmentStats].sort((a, b) => (b.total_students || 0) - (a.total_students || 0))}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--hairline))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="department_name" type="category" width={140} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="total_students" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Recent activities */}
        <section className="rounded-lg border border-hairline bg-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <p className="eyebrow">Activity log</p>
              <h3 className="display-serif text-2xl mt-1">Recent system events</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('security')}>
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="border-t border-hairline divide-y divide-hairline">
            {dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 ? (
              dashboardData.recent_activities.slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${a.status === 'success' ? 'bg-success' : a.status === 'failed' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{a.action || 'System activity'}</p>
                      <p className="text-xs text-muted-foreground">{a.user || 'System'} · {a.time || 'Just now'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">No recent activities yet.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Events will appear here as they occur.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ── STAFF ────────────────────────────────────────────────────
  if (hasRole('staff')) {
    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow={`${greeting}, ${userName}`}
          title="Student management."
          description="Manage enrolment, monitor course attendance, and act on absence trends."
          actions={<Badge variant="outline">Staff</Badge>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active students" value={dashboardData?.total_students ?? 0} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Available courses" value={dashboardData?.total_courses ?? 0} icon={<BookOpen className="h-4 w-4" />} />
          <StatCard accent label="Today's rate" value={`${(dashboardData?.todays_attendance_rate ?? 0).toFixed(1)}%`} icon={<CheckCircle className="h-4 w-4" />} />
          <StatCard label="Pending tasks" value={0} icon={<AlertCircle className="h-4 w-4" />} />
        </div>

        {courseStats.length > 0 && (
          <div className="rounded-lg border border-hairline bg-card p-6">
            <div className="mb-6">
              <p className="eyebrow">Enrolment</p>
              <h3 className="display-serif text-2xl mt-1">Course overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseStats.slice(0, 10)} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--hairline))" vertical={false} />
                <XAxis dataKey="course_code" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="enrolled_students" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // ── TEACHER ──────────────────────────────────────────────────
  if (hasRole('teacher')) {
    const me = teacherStats.find((t: any) => t.teacher_name === userPermissions.username);
    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow={`${greeting}, ${userName}`}
          title="Your teaching dashboard."
          description="Your courses, students, and recent attendance — all in one place."
          actions={<Badge variant="outline">Teacher</Badge>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My courses" value={me?.total_courses ?? 0} icon={<BookOpen className="h-4 w-4" />} />
          <StatCard label="My students" value={me?.total_students ?? 0} icon={<Users className="h-4 w-4" />} />
          <StatCard accent label="Active sessions" value={dashboardData?.active_sessions ?? 0} icon={<Calendar className="h-4 w-4" />} />
          <StatCard label="Records" value={me?.total_attendance_records ?? 0} icon={<FileText className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { title: 'Next session', icon: Calendar, copy: 'No upcoming sessions', sub: 'Check your schedule or create one.' },
            { title: 'Recent sessions', icon: Clock, copy: 'No recent sessions', sub: 'Your last sessions will appear here.' },
          ].map(({ title, icon: Icon, copy, sub }) => (
            <div key={title} className="rounded-lg border border-hairline bg-card p-6">
              <p className="eyebrow">{title}</p>
              <div className="mt-10 mb-6 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-md border border-hairline flex items-center justify-center text-muted-foreground mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{copy}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {dashboardData?.weekly_attendance_trend && dashboardData.weekly_attendance_trend.length > 0 && (
          <div className="rounded-lg border border-hairline bg-card p-6">
            <div className="mb-6">
              <p className="eyebrow">7d trend</p>
              <h3 className="display-serif text-2xl mt-1">Weekly attendance</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dashboardData.weekly_attendance_trend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--hairline))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Line type="monotone" dataKey="attendance_rate" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--accent))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // ── DEFAULT ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="eyebrow mb-4">FACE.IT</p>
      <h1 className="display-serif text-4xl mb-3">Welcome.</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Please contact your administrator for access permissions.
      </p>
      <Badge variant="outline">Role: {userPermissions.role}</Badge>
    </div>
  );
};
