import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Download, Edit, Save, X, ChevronDown, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { djangoApi } from "@/services/djangoApi";
import * as XLSX from "xlsx";

export const AttendanceTable = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [levels, setLevels] = useState<{id: string, name: string}[]>([]);
  const [courses, setCourses] = useState<{id: string, code: string, title: string}[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [loading, setLoading] = useState({
    levels: false,
    courses: false,
    attendance: false
  });

  // Fetch levels on component mount
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(prev => ({ ...prev, levels: true }));
        const data = await djangoApi.getAcademicLevels();
        setLevels(data.map((level: any) => ({
          id: level.id,
          name: level.name
        })));
      } catch (err) {
        console.error("❌ Failed to load levels:", err);
      } finally {
        setLoading(prev => ({ ...prev, levels: false }));
      }
    };
    fetchLevels();
  }, []);

  // Fetch courses when level is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedLevel) {
        setCourses([]);
        setSelectedCourse("");
        return;
      }
      try {
        setLoading(prev => ({ ...prev, courses: true }));
        const data = await djangoApi.getCoursesByLevel(selectedLevel);
        setCourses(data.map((course: any) => ({
          id: course.id,
          code: course.code,
          title: course.title
        })));
      } catch (err) {
        console.error("❌ Failed to load courses:", err);
      } finally {
        setLoading(prev => ({ ...prev, courses: false }));
      }
    };
    fetchCourses();
  }, [selectedLevel]);

  const fetchAttendance = async () => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const params = new URLSearchParams();
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedCourse) params.append('course', selectedCourse);
      if (selectedDate) params.append('date', selectedDate);
      
      const data = await djangoApi.getAttendance(params.toString());
      const formatted = data.map((record: any) => ({
        id: record.id,
        name: record.student_name,
        matric: record.matric_number,
        status: record.status,
        date: record.date,
        checkIn: record.check_in,
        level: record.level,
        course: record.course
      }));
      setAttendance(formatted);
    } catch (err) {
      console.error("❌ Failed to load attendance:", err);
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // Fetch attendance when filters change
  useEffect(() => {
    fetchAttendance();
  }, [selectedLevel, selectedCourse, selectedDate]);

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setSelectedCourse(""); // Reset course when level changes
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const filteredRecords = attendance.filter(
    (record) =>
      (record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.matric.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setEditingRecord({ ...record });
  };

  const handleSave = async () => {
    try {
      await djangoApi.updateAttendance(editingId!, {
        status: editingRecord.status,
        check_in: editingRecord.checkIn, 
      });
      await fetchAttendance();
    } catch (err) {
      console.error("❌ Update failed:", err);
    }
    setEditingId(null);
    setEditingRecord(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingRecord(null);
  };

  const handleExport = () => {
    const exportData = filteredRecords.map(({ name, matric, date, status, checkIn }) => ({
      Name: name,
      MatriculationNumber: matric,
      Date: date,
      Status: status,
      CheckIn: checkIn,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance_${selectedDate}.xlsx`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Attendance Records</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchAttendance} disabled={loading.attendance}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading.attendance ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Level</label>
            <Select value={selectedLevel} onValueChange={handleLevelChange} disabled={loading.levels}>
              <SelectTrigger>
                <SelectValue placeholder="Select level">
                  {selectedLevel ? levels.find(l => l.id === selectedLevel)?.name : 'Select level'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Course</label>
            <Select 
              value={selectedCourse} 
              onValueChange={handleCourseChange}
              disabled={!selectedLevel || loading.courses}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedLevel ? 'Select level first' : 'Select course'} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full pl-3 pr-10 py-2"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.matric}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <Select
                      value={editingRecord?.status}
                      onValueChange={(value) =>
                        setEditingRecord({ ...editingRecord, status: value })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <Input
                      type="time"
                      value={editingRecord?.checkIn}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, checkIn: e.target.value })
                      }
                      className="w-24"
                    />
                  ) : (
                    record.checkIn
                  )}
                </TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
