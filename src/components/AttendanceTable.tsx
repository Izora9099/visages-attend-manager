import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Download, Edit, Save, X } from "lucide-react";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchAttendance = async () => {
    try {
      const data = await djangoApi.getAttendance();
      const formatted = data.map((record: any) => ({
        id: record.id,
        name: record.student_name,
        matric: record.matric_number,
        status: record.status,
        date: record.date,
        checkIn: record.check_in,
      }));
      setAttendance(formatted);
    } catch (err) {
      console.error("❌ Failed to load attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredRecords = attendance.filter(
    (record) =>
      (record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.matric.toLowerCase().includes(searchTerm.toLowerCase())) &&
      record.date === selectedDate
  );

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setEditingRecord({ ...record });
  };

  const handleSave = async () => {
    try {
      await djangoApi.updateAttendance(editingId!, {
        status: editingRecord.status,
        time_in: editingRecord.checkIn,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search by name or matricule number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Records - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  );
};
