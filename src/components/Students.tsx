// src/components/Students.tsx - Updated to work with Django ViewSet API

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
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Edit, 
  Trash2, 
  UserPlus, 
  Download,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { djangoApi } from '@/services/djangoApi';
import { 
  Student, 
  Department, 
  Specialization, 
  Level, 
  Course,
  StudentFormData,
  StudentFilters,
  PaginatedResponse
} from '@/types';

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    page_size: 20
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  // Form state
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: '',
    last_name: '',
    matric_number: '',
    email: '',
    phone: '',
    address: '',
    department: 0,
    level: 0,
    specialization: undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [deptData, levelData, courseData] = await Promise.all([
        djangoApi.getDepartments({ active_only: 'true' }),
        djangoApi.getLevels({ active_only: 'true' }),
        djangoApi.getCourses({ status: 'active' })
      ]);

      setDepartments(deptData.results || deptData);
      setLevels(levelData.results || levelData);
      setCourses(courseData.results || courseData);

      // Load specializations if a department is selected
      if (filters.department) {
        const specData = await djangoApi.getSpecializations({ 
          department: filters.department,
          active_only: 'true' 
        });
        setSpecializations(specData.results || specData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load initial data');
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await djangoApi.getStudents(filters);
      
      if (response.results) {
        // Paginated response
        setStudents(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous
        });
      } else {
        // Non-paginated response
        setStudents(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecializations = async (departmentId: number) => {
    try {
      const specData = await djangoApi.getSpecializations({ 
        department: departmentId,
        active_only: 'true' 
      });
      setSpecializations(specData.results || specData);
    } catch (err: any) {
      console.error('Failed to load specializations:', err);
    }
  };

  const handleDepartmentChange = (departmentId: number) => {
    setFormData(prev => ({
      ...prev,
      department: departmentId,
      specialization: undefined // Reset specialization when department changes
    }));
    
    if (departmentId) {
      loadSpecializations(departmentId);
    } else {
      setSpecializations([]);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      await djangoApi.createStudent(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      loadStudents();
    } catch (err: any) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setError(err.message || 'Failed to create student');
      }
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setFormErrors({});

    try {
      await djangoApi.updateStudent(selectedStudent.id, formData);
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      resetForm();
      loadStudents();
    } catch (err: any) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setError(err.message || 'Failed to update student');
      }
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.full_name}?`)) {
      return;
    }

    try {
      await djangoApi.deleteStudent(student.id);
      loadStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      matric_number: student.matric_number,
      email: student.email,
      phone: student.phone || '',
      address: student.address || '',
      department: student.department,
      level: student.level,
      specialization: student.specialization,
    });
    
    // Load specializations for the selected department
    if (student.department) {
      loadSpecializations(student.department);
    }
    
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      matric_number: '',
      email: '',
      phone: '',
      address: '',
      department: 0,
      level: 0,
      specialization: undefined,
    });
    setFormErrors({});
  };

  const handleFilterChange = (key: keyof StudentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      graduated: 'bg-blue-100 text-blue-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderStudentForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateStudent : handleCreateStudent} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className={formErrors.first_name ? 'border-red-500' : ''}
          />
          {formErrors.first_name && (
            <p className="text-sm text-red-500 mt-1">{formErrors.first_name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            className={formErrors.last_name ? 'border-red-500' : ''}
          />
          {formErrors.last_name && (
            <p className="text-sm text-red-500 mt-1">{formErrors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="matric_number">Matriculation Number *</Label>
        <Input
          id="matric_number"
          value={formData.matric_number}
          onChange={(e) => setFormData(prev => ({ ...prev, matric_number: e.target.value }))}
          className={formErrors.matric_number ? 'border-red-500' : ''}
        />
        {formErrors.matric_number && (
          <p className="text-sm text-red-500 mt-1">{formErrors.matric_number}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={formErrors.email ? 'border-red-500' : ''}
        />
        {formErrors.email && (
          <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="department">Department *</Label>
        <Select
          value={formData.department.toString()}
          onValueChange={(value) => handleDepartmentChange(parseInt(value))}
        >
          <SelectTrigger className={formErrors.department ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>Select department</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.department && (
          <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>
        )}
      </div>

      {specializations.length > 0 && (
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            value={formData.specialization?.toString() || ''}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              specialization: value ? parseInt(value) : undefined 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No specialization</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec.id} value={spec.id.toString()}>
                  {spec.specialization_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="level">Level *</Label>
        <Select
          value={formData.level.toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}
        >
          <SelectTrigger className={formErrors.level ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>Select level</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id.toString()}>
                {level.level_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.level && (
          <p className="text-sm text-red-500 mt-1">{formErrors.level}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
              setSelectedStudent(null);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  );

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading students...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage student records and enrollments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              {renderStudentForm()}
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
              <Label>Search</Label>
              <Input
                placeholder="Search by name or matric number..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Department</Label>
              <Select
                value={filters.department?.toString() || ''}
                onValueChange={(value) => handleFilterChange('department', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Level</Label>
              <Select
                value={filters.level?.toString() || ''}
                onValueChange={(value) => handleFilterChange('level', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.level_name}
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Students ({pagination.count || students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.full_name || `${student.first_name} ${student.last_name}`}
                    </TableCell>
                    <TableCell>{student.matric_number}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.department_name}</TableCell>
                    <TableCell>{student.level_name}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{(student.attendance_rate != null && typeof student.attendance_rate === 'number') ? student.attendance_rate.toFixed(1) : '0.0'}%</span>
                        {(student.attendance_rate || 0) >= 75 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStudent(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((filters.page || 1) - 1) * (filters.page_size || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.page_size || 20), pagination.count)} of{' '}
                {pagination.count} students
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {renderStudentForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};