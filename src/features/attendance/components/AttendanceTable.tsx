import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, Edit, Trash2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { djangoApi } from '@/services/djangoApi';
import {
  AttendanceRecord,
  Student,
  Course,
  AttendanceFilters,
  AttendanceFormData,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const variantMap: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    present: "success",
    late:    "warning",
    absent:  "destructive",
    excused: "secondary",
  };
  return <Badge variant={variantMap[status] ?? "outline"}>{status}</Badge>;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AttendanceTable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents]   = useState<Student[]>([]);
  const [courses, setCourses]     = useState<Course[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<AttendanceRecord | null>(null);

  const [filters, setFilters] = useState<AttendanceFilters>({ page: 1, page_size: 20 });
  const [pagination, setPagination] = useState({ count: 0, next: null as null | string, previous: null as null | string });

  const [formData, setFormData] = useState<AttendanceFormData>({ student: 0, course: 0, status: 'present', notes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { loadAttendanceRecords(); }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, coursesData] = await Promise.all([
        djangoApi.getStudents({ status: 'active' }),
        djangoApi.getCourses({ status: 'active' }),
      ]);
      setStudents(studentsData.results || studentsData);
      setCourses(coursesData.results  || coursesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load initial data');
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await djangoApi.getAttendanceRecords(filters);
      if (response.results) {
        setAttendanceRecords(response.results);
        setPagination({ count: response.count, next: response.next, previous: response.previous });
      } else {
        setAttendanceRecords(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    try {
      await djangoApi.markAttendance(formData);
      setIsCreateOpen(false);
      resetForm();
      loadAttendanceRecords();
    } catch (err: any) {
      if (err.errors) setFormErrors(err.errors);
      else setError(err.message || 'Failed to mark attendance');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setFormErrors({});
    try {
      await djangoApi.updateAttendance(selectedRecord.id, { status: formData.status, check_in: new Date().toISOString() });
      setIsEditOpen(false);
      setSelectedRecord(null);
      resetForm();
      loadAttendanceRecords();
    } catch (err: any) {
      if (err.errors) setFormErrors(err.errors);
      else setError(err.message || 'Failed to update attendance');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await djangoApi.deleteAttendance(deleteTarget.id);
      toast.success('Attendance record deleted.');
      loadAttendanceRecords();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete attendance record');
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormData({ student: record.student, course: record.course, status: record.status, notes: record.notes || '' });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({ student: 0, course: 0, status: 'present', notes: '' });
    setFormErrors({});
  };

  const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdate : handleCreate} className="space-y-4">
      <div>
        <Label htmlFor="student">Student *</Label>
        <Select
          value={formData.student.toString()}
          onValueChange={v => setFormData(prev => ({ ...prev, student: parseInt(v) }))}
          disabled={isEdit}
        >
          <SelectTrigger className={formErrors.student ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>Select student</SelectItem>
            {students.map(s => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.full_name || `${s.first_name} ${s.last_name}`} ({s.matric_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.student && <p className="text-sm text-destructive mt-1">{formErrors.student}</p>}
      </div>

      <div>
        <Label htmlFor="course">Course *</Label>
        <Select
          value={formData.course.toString()}
          onValueChange={v => setFormData(prev => ({ ...prev, course: parseInt(v) }))}
          disabled={isEdit}
        >
          <SelectTrigger className={formErrors.course ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>Select course</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.course_code} — {c.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.course && <p className="text-sm text-destructive mt-1">{formErrors.course}</p>}
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={v => setFormData(prev => ({ ...prev, status: v as any }))}
        >
          <SelectTrigger className={formErrors.status ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="excused">Excused</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.status && <p className="text-sm text-destructive mt-1">{formErrors.status}</p>}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Optional notes…"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEdit) { setIsEditOpen(false); setSelectedRecord(null); }
            else setIsCreateOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update' : 'Mark attendance'}
        </Button>
      </div>
    </form>
  );

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading attendance records…</p>
      </div>
    );
  }

  const page     = filters.page || 1;
  const pageSize = filters.page_size || 20;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 pb-8 border-b border-hairline md:flex-row md:items-end md:justify-between animate-fade-up">
        <div className="space-y-2 max-w-2xl">
          <p className="eyebrow">Records</p>
          <h1 className="display-serif text-4xl md:text-5xl leading-[1.05] text-balance">Attendance.</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed pt-1">
            Track and manage student check-ins across courses and sessions.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ink" size="lg">
              <Plus className="h-4 w-4" />
              Mark attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Student</Label>
              <Select
                value={filters.student_id?.toString() || ''}
                onValueChange={v => handleFilterChange('student_id', v ? parseInt(v) : undefined)}
              >
                <SelectTrigger><SelectValue placeholder="All students" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All students</SelectItem>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.full_name || `${s.first_name} ${s.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Course</Label>
              <Select
                value={filters.course_id?.toString() || ''}
                onValueChange={v => handleFilterChange('course_id', v ? parseInt(v) : undefined)}
              >
                <SelectTrigger><SelectValue placeholder="All courses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All courses</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.course_code} — {c.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={v => handleFilterChange('status', v || undefined)}
              >
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
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
              <Label>Date range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={e => handleFilterChange('date_from', e.target.value || undefined)}
                  className="text-xs"
                />
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={e => handleFilterChange('date_to', e.target.value || undefined)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Records ({pagination.count || attendanceRecords.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div>{record.student_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{record.student_matric}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.course_code}</div>
                        <div className="text-xs text-muted-foreground">{record.course_name}</div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(record.check_in_time)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          {formatTime(record.check_in_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                            {formatTime(record.check_out_time)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                        {record.notes || <span className="text-muted-foreground/40">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            aria-label="Edit record"
                            onClick={() => openEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            aria-label="Delete record"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.count > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-hairline">
              <span className="text-sm text-muted-foreground">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, pagination.count)} of {pagination.count}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={!pagination.previous}
                  onClick={() => handleFilterChange('page', page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={!pagination.next}
                  onClick={() => handleFilterChange('page', page + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Attendance</DialogTitle></DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attendance record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record for{' '}
              <span className="font-medium text-foreground">{deleteTarget?.student_name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
