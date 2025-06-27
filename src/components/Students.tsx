// Updated Students.tsx - Integrated with Backend API
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { djangoApi } from "@/services/djangoApi";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  matric_number: string;
  email: string;
  phone?: string;
  address?: string;
  department: number;
  department_name?: string;
  specialization?: number;
  specialization_name?: string;
  level: number;
  level_name?: string;
  enrolled_courses: number[];
  enrolled_courses_count?: number;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  registration_date: string;
  attendance_rate: number;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: number;
  department_name: string;
  department_code: string;
  is_active: boolean;
}

interface Specialization {
  id: number;
  specialization_name: string;
  specialization_code: string;
  department: number;
  is_active: boolean;
}

interface Level {
  id: number;
  level_name: string;
  level_code: string;
  is_active: boolean;
}

interface StudentFormData {
  first_name: string;
  last_name: string;
  matric_number: string;
  email: string;
  phone: string;
  address: string;
  department: number;
  specialization: number;
  level: number;
  academic_year: string;
}

interface Filters {
  search?: string;
  department?: number;
  specialization?: number;
  level?: number;
  status?: string;
}

interface Pagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
}

export const Students = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: "",
    last_name: "",
    matric_number: "",
    email: "",
    phone: "",
    address: "",
    department: 0,
    specialization: 0,
    level: 0,
    academic_year: new Date().getFullYear().toString()
  });
  
  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});
  const [formLoading, setFormLoading] = useState(false);
  
  // Filter and pagination state
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<Pagination>({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    page_size: 20,
    total_pages: 1
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load students when filters change
  useEffect(() => {
    if (departments.length > 0) { // Only load students after departments are loaded
      loadStudents();
    }
  }, [filters, pagination.page]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all required data in parallel
      const [deptData, specData, levelData] = await Promise.all([
        djangoApi.getDepartments({ is_active: true }),
        djangoApi.getSpecializations({ is_active: true }),
        djangoApi.getLevels({ is_active: true })
      ]);

      setDepartments(deptData.results || deptData || []);
      setSpecializations(specData.results || specData || []);
      setLevels(levelData.results || levelData || []);
      
    } catch (err: any) {
      console.error("Failed to load initial data:", err);
      setError("Failed to load initial data. Some features may not work properly.");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      
      // Build filter parameters
      const params: any = {
        page,
        page_size: pagination.page_size
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.department) params.department = filters.department;
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.level) params.level = filters.level;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      
      const response = await djangoApi.getStudents(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setStudents(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          page: page,
          page_size: pagination.page_size,
          total_pages: Math.ceil(response.count / pagination.page_size)
        });
      } else {
        setStudents(response || []);
        setPagination(prev => ({ ...prev, count: response?.length || 0 }));
      }
      
    } catch (err: any) {
      console.error("Failed to load students:", err);
      setError("Failed to load students: " + (err.message || "Unknown error"));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      // Reset related filters when parent changes
      ...(key === 'department' && { specialization: undefined })
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filtering
  };

  const handleDepartmentChange = (deptId: number) => {
    setFormData(prev => ({ 
      ...prev, 
      department: deptId,
      specialization: 0 // Reset specialization when department changes
    }));
    setFormErrors(prev => ({ ...prev, department: undefined }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      matric_number: "",
      email: "",
      phone: "",
      address: "",
      department: 0,
      specialization: 0,
      level: 0,
      academic_year: new Date().getFullYear().toString()
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<StudentFormData> = {};
    
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.matric_number.trim()) errors.matric_number = "Matriculation number is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.department) errors.department = "Department is required";
    if (!formData.level) errors.level = "Level is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStudent = async () => {
    if (!validateForm()) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      const studentData = {
        ...formData,
        status: 'active',
        registration_date: new Date().toISOString().split('T')[0]
      };
      
      const newStudent = await djangoApi.createStudent(studentData);
      
      setStudents(prev => [newStudent, ...prev]);
      setSuccess("Student created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Refresh the list to get updated data
      loadStudents(pagination.page);
      
    } catch (err: any) {
      console.error("Failed to create student:", err);
      setError("Failed to create student: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      matric_number: student.matric_number,
      email: student.email,
      phone: student.phone || "",
      address: student.address || "",
      department: student.department,
      specialization: student.specialization || 0,
      level: student.level,
      academic_year: student.academic_year
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!validateForm() || !editingStudent) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      const updatedStudent = await djangoApi.updateStudent(editingStudent.id, formData);
      
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? updatedStudent : s));
      setSuccess("Student updated successfully!");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      
    } catch (err: any) {
      console.error("Failed to update student:", err);
      setError("Failed to update student: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }
    
    try {
      await djangoApi.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setSuccess("Student deleted successfully!");
      
    } catch (err: any) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student: " + (err.message || "Unknown error"));
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredSpecializations = () => {
    if (!filters.department) return specializations;
    return specializations.filter(spec => spec.department === filters.department);
  };

  const getFormSpecializations = () => {
    if (!formData.department) return [];
    return specializations.filter(spec => spec.department === formData.department);
  };

  const renderStudentForm = () => (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="academic_year">Academic Year</Label>
          <Input
            id="academic_year"
            value={formData.academic_year}
            onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
            placeholder="2024"
          />
        </div>
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

      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Select
          value={formData.specialization.toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: parseInt(value) }))}
          disabled={!formData.department}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.department ? "Select specialization" : "Select department first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            {getFormSpecializations().map((spec) => (
              <SelectItem key={spec.id} value={spec.id.toString()}>
                {spec.specialization_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            if (editingStudent) {
              setIsEditDialogOpen(false);
              setEditingStudent(null);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button 
          type="button"
          onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
          disabled={formLoading}
        >
          {formLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          {editingStudent ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  );

  // Show loading state during initial load
  if (loading && students.length === 0 && departments.length === 0) {
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
      {/* Error and Success Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage student records and enrollments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => loadStudents(pagination.page)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.count}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {students.length > 0 ? 
                Math.round(students.reduce((sum, s) => sum + s.attendance_rate, 0) / students.length) : 0}%
            </div>
          </CardContent>
        </Card>
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
              <Label>Specialization</Label>
              <Select
                value={filters.specialization?.toString() || ''}
                onValueChange={(value) => handleFilterChange('specialization', value ? parseInt(value) : undefined)}
                disabled={!filters.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filters.department ? "All specializations" : "Select department first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All specializations</SelectItem>
                  {getFilteredSpecializations().map((spec) => (
                    <SelectItem key={spec.id} value={spec.id.toString()}>
                      {spec.specialization_name}
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
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
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.matric_number}`} />
                            <AvatarFallback>
                              {student.first_name[0]}{student.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.specialization_name || 'No specialization'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{student.matric_number}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department_name}</TableCell>
                      <TableCell>{student.level_name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{student.attendance_rate}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.attendance_rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-gray-500">
                          {filters.search || filters.department || filters.level ? 
                            "No students found matching your filters." : 
                            "No students found. Add your first student to get started."
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
                {Math.min(pagination.page * pagination.page_size, pagination.count)} of{' '}
                {pagination.count} students
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadStudents(pagination.page - 1)}
                  disabled={!pagination.previous || loading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadStudents(pagination.page + 1)}
                  disabled={!pagination.next || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {renderStudentForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
};