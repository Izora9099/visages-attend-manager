// Complete TeacherManagement.tsx - Final Working Version
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Users, BookOpen, RefreshCw, AlertCircle, Mail, Phone, Eye, EyeOff, Calendar, MapPin, User, Building, GraduationCap } from 'lucide-react';
import { djangoApi } from '@/services/djangoApi';

interface Teacher {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  specialization?: string;
  assigned_courses: Course[];
  is_active: boolean;
  last_login?: string;
  date_joined: string;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  department: number;
  department_name?: string;
  level: number;
  level_name?: string;
  credits?: number;
  status: string;
}

interface Department {
  id: number;
  department_name: string;
  department_code: string;
  is_active: boolean;
}

interface TeacherFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  employee_id: string;
  specialization: string;
  assigned_courses: number[];
  password?: string;
  confirm_password?: string;
}

interface Filters {
  search?: string;
  department?: string;
  status?: string;
}

export const TeacherManagement = () => {
  // State management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCourseAssignmentOpen, setIsCourseAssignmentOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TeacherFormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    department: "",
    employee_id: "",
    specialization: "",
    assigned_courses: [],
    password: "",
    confirm_password: ""
  });
  
  const [formErrors, setFormErrors] = useState<Partial<TeacherFormData>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load teachers when filters change
  useEffect(() => {
    if (departments.length > 0) {
      loadTeachers();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all required data in parallel
      const [deptData, courseData] = await Promise.all([
        djangoApi.getDepartments({ is_active: true }).catch(() => []),
        djangoApi.getCourses({ status: 'active' }).catch(() => [])
      ]);

      setDepartments(Array.isArray(deptData) ? deptData : deptData?.results || []);
      setCourses(Array.isArray(courseData) ? courseData : courseData?.results || []);
      
    } catch (err: any) {
      console.error("Failed to load initial data:", err);
      setError("Failed to load initial data. Some features may not work properly.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Use admin users endpoint to get teacher users
      const response = await djangoApi.getAdminUsers();
      
      // Filter for teachers only and apply search filters
      let teacherData = response.filter((user: any) => 
        user.role === 'teacher' || user.role === 'Teacher'
      );
      
      // Apply client-side filtering if needed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        teacherData = teacherData.filter((teacher: any) =>
          teacher.name?.toLowerCase().includes(searchLower) ||
          teacher.email?.toLowerCase().includes(searchLower) ||
          teacher.username?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.department) {
        teacherData = teacherData.filter((teacher: any) =>
          teacher.department === filters.department
        );
      }

      if (filters.status === 'active') {
        teacherData = teacherData.filter((teacher: any) => teacher.status === 'Active');
      } else if (filters.status === 'inactive') {
        teacherData = teacherData.filter((teacher: any) => teacher.status !== 'Active');
      }
      
      // Transform the data to match our interface
      const transformedTeachers = teacherData.map((teacher: any) => ({
        id: teacher.id,
        username: teacher.username || teacher.email,
        email: teacher.email,
        first_name: teacher.name?.split(' ')[0] || teacher.first_name || '',
        last_name: teacher.name?.split(' ').slice(1).join(' ') || teacher.last_name || '',
        full_name: teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
        role: teacher.role,
        phone: teacher.phone || '',
        department: teacher.department || '',
        employee_id: teacher.employee_id || `EMP${teacher.id.toString().padStart(3, '0')}`,
        specialization: teacher.specialization || '',
        assigned_courses: teacher.assigned_courses || [],
        is_active: teacher.status === 'Active' || teacher.is_active !== false,
        last_login: teacher.last_login,
        date_joined: teacher.date_joined || teacher.created_at,
        created_at: teacher.created_at || new Date().toISOString(),
        updated_at: teacher.updated_at || new Date().toISOString()
      }));
      
      setTeachers(transformedTeachers);
      
    } catch (err: any) {
      console.error("Failed to load teachers:", err);
      setError("Failed to load teachers: " + (err.message || "Unknown error"));
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      department: "",
      employee_id: "",
      specialization: "",
      assigned_courses: [],
      password: "",
      confirm_password: ""
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<TeacherFormData> = {};
    
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    
    // Password validation only for new teachers
    if (!editingTeacher) {
      if (!formData.password) errors.password = "Password is required";
      if (formData.password && formData.password.length < 8) errors.password = "Password must be at least 8 characters";
      if (formData.password !== formData.confirm_password) errors.confirm_password = "Passwords do not match";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTeacher = async () => {
    if (!validateForm()) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      const teacherData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        phone: formData.phone,
        role: 'Teacher',
        permissions: [
          'view_student_roster', 'view_attendance', 'edit_attendance',
          'start_sessions', 'view_reports', 'generate_reports', 'view_timetable'
        ]
      };
      
      const newTeacher = await djangoApi.createAdminUser(teacherData);
      
      // Transform the response to match our interface
      const transformedTeacher = {
        id: newTeacher.id,
        username: newTeacher.email,
        email: newTeacher.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: newTeacher.name,
        role: newTeacher.role,
        phone: formData.phone,
        department: formData.department,
        employee_id: formData.employee_id || `EMP${newTeacher.id.toString().padStart(3, '0')}`,
        specialization: formData.specialization,
        assigned_courses: [],
        is_active: true,
        last_login: null,
        date_joined: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTeachers(prev => [transformedTeacher, ...prev]);
      setSuccess("Teacher created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      
    } catch (err: any) {
      console.error("Failed to create teacher:", err);
      setError("Failed to create teacher: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      username: teacher.username,
      email: teacher.email,
      phone: teacher.phone || "",
      department: teacher.department || "",
      employee_id: teacher.employee_id || "",
      specialization: teacher.specialization || "",
      assigned_courses: teacher.assigned_courses.map(c => c.id) || [],
      password: "",
      confirm_password: ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeacher = async () => {
    if (!validateForm() || !editingTeacher) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      const updateData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        role: 'Teacher'
      };
      
      await djangoApi.updateAdminUser(editingTeacher.id, updateData);
      
      // Update local state
      setTeachers(prev => prev.map(t => 
        t.id === editingTeacher.id ? {
          ...t,
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          employee_id: formData.employee_id,
          specialization: formData.specialization,
          updated_at: new Date().toISOString()
        } : t
      ));
      
      setSuccess("Teacher updated successfully!");
      setIsEditDialogOpen(false);
      setEditingTeacher(null);
      resetForm();
      
    } catch (err: any) {
      console.error("Failed to update teacher:", err);
      setError("Failed to update teacher: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!confirm("Are you sure you want to delete this teacher? This action cannot be undone.")) {
      return;
    }
    
    try {
      await djangoApi.deleteAdminUser(teacherId);
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      setSuccess("Teacher deleted successfully!");
      
    } catch (err: any) {
      console.error("Failed to delete teacher:", err);
      setError("Failed to delete teacher: " + (err.message || "Unknown error"));
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const handleCourseAssignment = (teacher: Teacher) => {
    setAssigningTeacher(teacher);
    setFormData(prev => ({
      ...prev,
      assigned_courses: teacher.assigned_courses.map(c => c.id) || []
    }));
    setIsCourseAssignmentOpen(true);
  };

  const handleSaveCourseAssignment = async () => {
    if (!assigningTeacher) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      // Update teacher with new course assignments
      const assignedCourses = courses.filter(course => 
        formData.assigned_courses.includes(course.id)
      );
      
      // Update local state
      setTeachers(prev => prev.map(t => 
        t.id === assigningTeacher.id ? {
          ...t,
          assigned_courses: assignedCourses,
          updated_at: new Date().toISOString()
        } : t
      ));
      
      setSuccess("Course assignments updated successfully!");
      setIsCourseAssignmentOpen(false);
      setAssigningTeacher(null);
      resetForm();
      
    } catch (err: any) {
      console.error("Failed to update course assignments:", err);
      setError("Failed to update course assignments: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleCourseToggle = (courseId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_courses: checked 
        ? [...prev.assigned_courses, courseId]
        : prev.assigned_courses.filter(id => id !== courseId)
    }));
  };

  // Show loading state during initial load
  if (loading && teachers.length === 0 && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
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
          <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600">Manage teacher accounts and course assignments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadTeachers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              
              {/* Create Teacher Form */}
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      email: e.target.value,
                      username: e.target.value
                    }))}
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
                      placeholder="+234 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                      placeholder="EMP001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.department_name}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="e.g., Software Engineering"
                    />
                  </div>
                </div>

                {/* Password fields for new teachers only */}
                {!editingTeacher && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className={formErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Confirm Password *</Label>
                      <Input
                        id="confirm_password"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirm_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className={formErrors.confirm_password ? 'border-red-500' : ''}
                      />
                      {formErrors.confirm_password && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.confirm_password}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleCreateTeacher}
                    disabled={formLoading}
                  >
                    {formLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Create Teacher
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teachers.filter(t => t.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {departments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {teachers.reduce((total, teacher) => total + (teacher.assigned_courses?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search by name, email..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Department</Label>
              <Select
                value={filters.department || ''}
                onValueChange={(value) => handleFilterChange('department', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.department_name}>
                      {dept.department_name
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
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
  
        {/* Teachers Display */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email}`} />
                          <AvatarFallback>
                            {teacher.first_name[0]}{teacher.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {teacher.full_name || `${teacher.first_name} ${teacher.last_name}`}
                          </CardTitle>
                          <p className="text-sm text-gray-500">{teacher.employee_id}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(teacher.is_active)}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        Department
                      </p>
                      <p className="font-medium">{teacher.department || 'Not assigned'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Specialization
                      </p>
                      <p className="font-medium">{teacher.specialization || 'Not specified'}</p>
                    </div>
  
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </p>
                      <p className="font-medium text-sm">{teacher.email}</p>
                    </div>
  
                    {teacher.phone && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          Phone
                        </p>
                        <p className="font-medium text-sm">{teacher.phone}</p>
                      </div>
                    )}
  
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Courses ({teacher.assigned_courses?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {teacher.assigned_courses?.slice(0, 3).map((course, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {course.course_code}
                          </Badge>
                        ))}
                        {(teacher.assigned_courses?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(teacher.assigned_courses?.length || 0) - 3} more
                          </Badge>
                        )}
                        {(!teacher.assigned_courses || teacher.assigned_courses.length === 0) && (
                          <span className="text-xs text-gray-400">No courses assigned</span>
                        )}
                      </div>
                    </div>
  
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last Login
                      </p>
                      <p className="font-medium text-sm">
                        {teacher.last_login 
                          ? new Date(teacher.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
  
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewTeacher(teacher)}
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditTeacher(teacher)}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCourseAssignment(teacher)}
                      >
                        <BookOpen size={14} className="mr-1" />
                        Courses
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500">
                  {filters.search || filters.department ? 
                    "No teachers found matching your filters." : 
                    "No teachers found. Add your first teacher to get started."
                  }
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <Card>
            <CardHeader>
              <CardTitle>Teachers ({teachers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email}`} />
                              <AvatarFallback>
                                {teacher.first_name[0]}{teacher.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {teacher.full_name || `${teacher.first_name} ${teacher.last_name}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {teacher.specialization || 'No specialization'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{teacher.employee_id}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.department || 'Not assigned'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.assigned_courses?.slice(0, 2).map((course, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {course.course_code}
                              </Badge>
                            ))}
                            {(teacher.assigned_courses?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(teacher.assigned_courses?.length || 0) - 2}
                              </Badge>
                            )}
                            {(!teacher.assigned_courses || teacher.assigned_courses.length === 0) && (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(teacher.is_active)}>
                            {teacher.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {teacher.last_login 
                            ? new Date(teacher.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTeacher(teacher)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTeacher(teacher)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCourseAssignment(teacher)}
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {teachers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-gray-500">
                            {filters.search || filters.department ? 
                              "No teachers found matching your filters." : 
                              "No teachers found. Add your first teacher to get started."
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
  
        {/* Edit Teacher Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
            </DialogHeader>
            
            {/* Edit Teacher Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className={formErrors.first_name ? 'border-red-500' : ''}
                  />
                  {formErrors.first_name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.first_name}</p>
                  )}
                </div>
  
                <div>
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
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
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    email: e.target.value,
                    username: e.target.value
                  }))}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+234 123 456 7890"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_employee_id">Employee ID</Label>
                  <Input
                    id="edit_employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                    placeholder="EMP001"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.department_name}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_specialization">Specialization</Label>
                  <Input
                    id="edit_specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="e.g., Software Engineering"
                  />
                </div>
              </div>
  
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingTeacher(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleUpdateTeacher}
                  disabled={formLoading}
                >
                  {formLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Update Teacher
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
  
        {/* Teacher Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Teacher Details</DialogTitle>
            </DialogHeader>
            {viewingTeacher && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingTeacher.email}`} />
                    <AvatarFallback>
                      {viewingTeacher.first_name[0]}{viewingTeacher.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{viewingTeacher.full_name}</h3>
                    <p className="text-gray-600">{viewingTeacher.employee_id}</p>
                    <Badge className={getStatusBadgeColor(viewingTeacher.is_active)}>
                      {viewingTeacher.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Label>
                    <p className="mt-1">{viewingTeacher.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </Label>
                    <p className="mt-1">{viewingTeacher.phone || 'Not provided'}</p>
                  </div>
  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Department
                    </Label>
                    <p className="mt-1">{viewingTeacher.department || 'Not assigned'}</p>
                  </div>
  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Specialization
                    </Label>
                    <p className="mt-1">{viewingTeacher.specialization || 'Not specified'}</p>
                  </div>
  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last Login
                    </Label>
                    <p className="mt-1">
                      {viewingTeacher.last_login 
                        ? new Date(viewingTeacher.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined Date
                    </Label>
                    <p className="mt-1">{new Date(viewingTeacher.date_joined).toLocaleDateString()}</p>
                  </div>
                </div>
  
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assigned Courses ({viewingTeacher.assigned_courses?.length || 0})
                  </Label>
                  <div className="mt-2">
                    {viewingTeacher.assigned_courses?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewingTeacher.assigned_courses.map((course, index) => (
                          <Badge key={index} variant="outline">
                            {course.course_code} - {course.course_name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No courses assigned</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
  
        {/* Course Assignment Dialog */}
        <Dialog open={isCourseAssignmentOpen} onOpenChange={setIsCourseAssignmentOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Course Assignments - {assigningTeacher?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Available Courses</Label>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                  {courses.length > 0 ? (
                    courses.map(course => (
                      <div key={course.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={formData.assigned_courses.includes(course.id)}
                          onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                        />
                        <Label htmlFor={`course-${course.id}`} className="text-sm flex-1">
                          <span className="font-medium">{course.course_code}</span> - {course.course_name}
                          <span className="text-gray-500 ml-2">({course.level_name})</span>
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No courses available for assignment</p>
                  )}
                </div>
              </div>
  
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCourseAssignmentOpen(false);
                    setAssigningTeacher(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleSaveCourseAssignment}
                  disabled={formLoading}
                >
                  {formLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Save Assignments
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };