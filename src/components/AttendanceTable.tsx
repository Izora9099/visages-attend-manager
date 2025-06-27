// src/components/AttendanceTable.tsx - Updated to work with Django ViewSet API

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Calendar
} from "lucide-react";

import { djangoApi } from '@/services/djangoApi';
import { 
  AttendanceRecord, 
  Student, 
  Course,
  AttendanceFilters,
  AttendanceFormData,
  PaginatedResponse
} from '@/types';

export const AttendanceTable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  
  const [filters, setFilters] = useState<AttendanceFilters>({
    page: 1,
    page_size: 20
  });
  
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  // Form state
  const [formData, setFormData] = useState<AttendanceFormData>({
    student: 0,
    course: 0,
    status: 'present',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAttendanceRecords();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, coursesData] = await Promise.all([
        djangoApi.getStudents({ status: 'active' }),
        djangoApi.getCourses({ status: 'active' })
      ]);

      setStudents(studentsData.results || studentsData);
      setCourses(coursesData.results || coursesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load initial data');
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await djangoApi.getAttendanceRecords(filters);
      
      if (response.results) {
        // Paginated response
        setAttendanceRecords(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous
        });
      } else {
        // Non-paginated response
        setAttendanceRecords(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      await djangoApi.markAttendance(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      loadAttendanceRecords();
    } catch (err: any) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setError(err.message || 'Failed to mark attendance');
      }
    }
  };

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setFormErrors({});

    try {
      await djangoApi.updateAttendance(selectedRecord.id, {
        status: formData.status,
        check_in: new Date().toISOString()
      });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      loadAttendanceRecords();
    } catch (err: any) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setError(err.message || 'Failed to update attendance');
      }
    }
  };

  const handleDeleteAttendance = async (record: AttendanceRecord) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await djangoApi.deleteAttendance(record.id);
      loadAttendanceRecords();
    } catch (err: any) {
      setError(err.message || 'Failed to delete attendance record');
    }
  };

  const handleEditAttendance = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      student: record.student,
      course: record.course,
      status: record.status,
      notes: record.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      student: 0,
      course: 0,
      status: 'present',
      notes: ''
    });
    setFormErrors({});
  };

  const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      late: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      absent: { color: 'bg-red-100 text-red-800', icon: XCircle },
      excused: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderAttendanceForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateAttendance : handleCreateAttendance} className="space-y-4">
      <div>
        <Label htmlFor="student">Student *</Label>
        <Select
          value={formData.student.toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, student: parseInt(value) }))}
          disabled={isEdit} // Don't allow changing student in edit mode
        >
          <SelectTrigger className={formErrors.student ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>Select student</SelectItem>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.full_name || `${student.first_name} ${student.last_name}`} ({student.matric_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.student && (
          <p className="text-sm text-red-500 mt-1">{formErrors.student}</p>
        )}
      </div>

      <div>
        <Label htmlFor="course">Course *</Label>
        <Select
          value={formData.course.toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, course: parseInt(value) }))}
          disabled={isEdit} // Don't allow changing course in edit mode
        >
          <SelectTrigger className={formErrors.course ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>Select course</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.course_code} - {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.course && (
          <p className="text-sm text-red-500 mt-1">{formErrors.course}</p>
        )}
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
        >
          <SelectTrigger className={formErrors.status ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="excused">Excused</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.status && (
          <p className="text-sm text-red-500 mt-1">{formErrors.status}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Optional notes..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
              setSelectedRecord(null);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update Attendance' : 'Mark Attendance'}
        </Button>
      </div>
    </form>
  );

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
              </DialogHeader>
              {renderAttendanceForm()}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Student</Label>
              <Select
                value={filters.student_id?.toString() || ''}
                onValueChange={(value) => handleFilterChange('student_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.full_name || `${student.first_name} ${student.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Course</Label>
              <Select
                value={filters.course_id?.toString() || ''}
                onValueChange={(value) => handleFilterChange('course_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                  className="text-xs"
                />
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Records ({pagination.count || attendanceRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => {
                  const checkInDateTime = formatDateTime(record.check_in_time);
                  const checkOutDateTime = record.check_out_time ? formatDateTime(record.check_out_time) : null;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{record.student_name}</div>
                          <div className="text-sm text-gray-500">{record.student_matric}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.course_code}</div>
                          <div className="text-sm text-gray-500">{record.course_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{checkInDateTime.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{checkInDateTime.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {checkOutDateTime ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{checkOutDateTime.time}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {record.notes || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAttendance(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAttendance(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((filters.page || 1) - 1) * (filters.page_size || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.page_size || 20), pagination.count)} of{' '}
                {pagination.count} records
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.previous}
                  onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.next}
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          {renderAttendanceForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};