
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, Calendar, Filter, TrendingUp, Users, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const monthlyData = [
  { month: "Jan", attendance: 88, students: 1200 },
  { month: "Feb", attendance: 92, students: 1220 },
  { month: "Mar", attendance: 85, students: 1234 },
  { month: "Apr", attendance: 90, students: 1245 },
  { month: "May", attendance: 87, students: 1234 },
  { month: "Jun", attendance: 89, students: 1234 },
];

const classData = [
  { class: "Grade 10A", present: 28, absent: 2, total: 30 },
  { class: "Grade 10B", present: 25, absent: 5, total: 30 },
  { class: "Grade 11A", present: 27, absent: 3, total: 30 },
  { class: "Grade 11B", present: 29, absent: 1, total: 30 },
];

const attendanceDistribution = [
  { name: "Excellent (95-100%)", value: 45, color: "#22c55e" },
  { name: "Good (85-94%)", value: 35, color: "#3b82f6" },
  { name: "Average (75-84%)", value: 15, color: "#f59e0b" },
  { name: "Poor (<75%)", value: 5, color: "#ef4444" },
];

export const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedClass, setSelectedClass] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Advanced Filters
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Period:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Class:</span>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="grade10a">Grade 10A</SelectItem>
                  <SelectItem value="grade10b">Grade 10B</SelectItem>
                  <SelectItem value="grade11a">Grade 11A</SelectItem>
                  <SelectItem value="grade11b">Grade 11B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Average Attendance</p>
                <p className="text-3xl font-bold">89.2%</p>
                <p className="text-sm opacity-80">This month</p>
              </div>
              <TrendingUp size={32} className="opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Best Class</p>
                <p className="text-xl font-bold">Grade 11B</p>
                <p className="text-sm opacity-80">96.7% attendance</p>
              </div>
              <Users size={32} className="opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">On-Time Rate</p>
                <p className="text-3xl font-bold">82.4%</p>
                <p className="text-sm opacity-80">Students arriving on time</p>
              </div>
              <Clock size={32} className="opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Improvement</p>
                <p className="text-3xl font-bold">+3.2%</p>
                <p className="text-sm opacity-80">From last month</p>
              </div>
              <TrendingUp size={32} className="opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class-wise Attendance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" />
                <Bar dataKey="absent" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sarah Wilson", attendance: 98.5, class: "Grade 11B" },
                { name: "Jane Smith", attendance: 96.2, class: "Grade 10B" },
                { name: "John Doe", attendance: 94.8, class: "Grade 10A" },
                { name: "Mike Johnson", attendance: 92.1, class: "Grade 11A" },
                { name: "Emma Davis", attendance: 91.7, class: "Grade 10A" },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.class}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
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
