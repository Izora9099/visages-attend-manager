import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, Calendar, Filter, TrendingUp, Users, Clock, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const monthlyData = [
  { month: "Aug", attendance: 88 },
  { month: "Sep", attendance: 91 },
  { month: "Oct", attendance: 85 },
  { month: "Nov", attendance: 90 },
  { month: "Dec", attendance: 78 },
  { month: "Jan", attendance: 84 },
  { month: "Feb", attendance: 89 },
  { month: "Mar", attendance: 87 },
  { month: "Apr", attendance: 92 },
];

// Course-level data using actual university course codes (Level 200–500)
const courseData = [
  { course: "CSE 201", present: 38, absent: 4, rate: 90 },
  { course: "CSE 301", present: 22, absent: 5, rate: 81 },
  { course: "CSE 302", present: 24, absent: 3, rate: 89 },
  { course: "EEE 101", present: 32, absent: 8, rate: 80 },
  { course: "EEE 301", present: 19, absent: 2, rate: 90 },
  { course: "BUS 201", present: 16, absent: 2, rate: 89 },
  { course: "MAT 301", present: 14, absent: 3, rate: 82 },
];

const attendanceDistribution = [
  { name: "Excellent (≥95%)", value: 42, color: "#22c55e" },
  { name: "Good (85–94%)", value: 33, color: "#3b82f6" },
  { name: "Average (75–84%)", value: 18, color: "#f59e0b" },
  { name: "Poor (<75%)", value: 7, color: "#ef4444" },
];

const topStudents = [
  { name: "Patrick Nkwi", attendance: 98.5, course: "MAT 101", level: "100 Level" },
  { name: "Laure Biyong", attendance: 96.2, course: "CSE 201", level: "200 Level" },
  { name: "Nadine Manga", attendance: 95.8, course: "BUS 101", level: "100 Level" },
  { name: "Ghislaine Nkodo", attendance: 94.1, course: "EEE 301", level: "300 Level" },
  { name: "Isabelle Ngono", attendance: 92.7, course: "CSE 101", level: "100 Level" },
];

// Tooltip with theme-aware background (uses CSS variable via Tailwind)
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-2 shadow-md text-xs text-foreground">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}{typeof p.value === 'number' && p.name.includes('rate') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const filteredCourses = selectedLevel === "all"
    ? courseData
    : courseData.filter((c) => {
        const num = parseInt(c.course.split(" ")[1]);
        const levelMap: Record<string, [number, number]> = {
          "200": [200, 299],
          "300": [300, 399],
          "400": [400, 499],
          "500": [500, 599],
        };
        const [lo, hi] = levelMap[selectedLevel] ?? [0, 999];
        return num >= lo && num <= hi;
      });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Period:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Level:</span>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="200">Level 200</SelectItem>
                  <SelectItem value="300">Level 300</SelectItem>
                  <SelectItem value="400">Level 400</SelectItem>
                  <SelectItem value="500">Level 500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Avg Attendance</p>
                <p className="text-3xl font-bold mt-0.5">87.4%</p>
                <p className="text-xs opacity-70 mt-1">This semester</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Best Course</p>
                <p className="text-xl font-bold mt-0.5">CSE 201</p>
                <p className="text-xs opacity-70 mt-1">90% attendance</p>
              </div>
              <Users className="h-8 w-8 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">On-Time Rate</p>
                <p className="text-3xl font-bold mt-0.5">82.4%</p>
                <p className="text-xs opacity-70 mt-1">Students on time</p>
              </div>
              <Clock className="h-8 w-8 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Semester Change</p>
                <p className="text-3xl font-bold mt-0.5">+3.2%</p>
                <p className="text-xs opacity-70 mt-1">vs Semester 1</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance %"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--accent))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course-wise Attendance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={filteredCourses} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="course" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                />
                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {attendanceDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2 shadow-md text-xs text-foreground">
                        <p className="font-semibold">{d.name}</p>
                        <p>{d.value} students</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStudents.map((student, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.course} · {student.level}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600/20 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-0 text-xs font-semibold">
                    {student.attendance}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
