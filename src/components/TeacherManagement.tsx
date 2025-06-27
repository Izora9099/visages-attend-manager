// Fixed TeachersManagement.tsx - Properly integrated with Backend API
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

const TeachersManagement = () => {
  // State management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  
  // Dialog states
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isViewTeacherOpen, setIsViewTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  
  // Form states
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

  // Load initial data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload teachers when filters change
  useEffect(() => {
    loadTeachers();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load departments and courses concurrently
      const [deptResponse, courseResponse] = await Promise.all([
        djangoApi.getDepartments().catch(err => {
          console.warn("Departments endpoint not available:", err);
          return { results: [] };
        }),
        djangoApi.getCourses().catch(err => {
          console.warn("Courses endpoint not available:", err);
          return { results: [] };
        })
      ]);
      
      // Handle different response formats
      const deptData = Array.isArray(deptResponse) ? deptResponse : deptResponse?.results || [];
      const courseData = Array.isArray(courseResponse) ? courseResponse : courseResponse?.results || [];
      
      setDepartments(deptData);
      setCourses(courseData);
      
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
      
      // Use admin users endpoint to get all users, then filter for teachers
      const response = await djangoApi.getAdminUsers();
      
      // Filter for teachers only
      let teacherData = response.filter((user: any) => 
        user.role === 'teacher' || user.role === 'Teacher'
      );
      
      // Apply client-side filtering
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        teacherData = teacherData.filter((teacher: any) =>
          teacher.name?.toLowerCase().includes(searchLower) ||
          teacher.email?.toLowerCase().includes(searchLower) ||
          teacher.username?.toLowerCase().includes(searchLower) ||
          teacher.first_name?.toLowerCase().includes(searchLower) ||
          teacher.last_name?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.department) {
        teacherData = teacherData.filter((teacher: any) =>
          teacher.department === filters.department
        );
      }

      if (filters.status === 'active') {
        teacherData = teacherData.filter((teacher: any) => 
          teacher.status === 'Active' || teacher.is_active === true
        );
      } else if (filters.status === 'inactive') {
        teacherData = teacherData.filter((teacher: any) => 
          teacher.status !== 'Active' || teacher.is_active === false
        );
      }
      
      // Transform the data to match our Teacher interface
      const transformedTeachers: Teacher[] = teacherData.map((teacher: any) => ({
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
        date_joined: teacher.date_joined || teacher.created_at || new Date().toISOString(),
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
      
      // Prepare teacher data for backend
      const teacherData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        phone: formData.phone,
        role: 'Teacher',
        department: formData.department,
        employee_id: formData.employee_id,
        specialization: formData.specialization,
        // Default teacher permissions
        permissions: [
          'view_student_roster', 'view_attendance', 'edit_attendance',
          'start_sessions', 'view_reports', 'generate_reports', 'view_timetable'
        ]
      };
      
      const newTeacher = await djangoApi.createAdminUser(teacherData);
      
      // Transform the response to match our interface
      const transformedTeacher: Teacher = {
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
      setIsAddTeacherOpen(false);
      resetForm();
      
    } catch (err: any) {
      console.error("Failed to create teacher:", err);
      setError("Failed to create teacher: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher || !validateForm()) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      const updateData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        employee_id: formData.employee_id,
        specialization: formData.specialization,
      };
      
      const updatedTeacher = await djangoApi.updateAdminUser(editingTeacher.id, updateData);
      
      // Update the teachers list
      setTeachers(prev => prev.map(teacher => 
        teacher.id === editingTeacher.id 
          ? {
              ...teacher,
              first_name: formData.first_name,
              last_name: formData.last_name,
              full_name: `${formData.first_name} ${formData.last_name}`,
              email: formData.email,
              phone: formData.phone,
              department: formData.department,
              employee_id: formData.employee_id,
              specialization: formData.specialization,
              updated_at: new Date().toISOString()
            }
          : teacher
      ));
      
      setSuccess("Teacher updated successfully!");
      setIsEditTeacherOpen(false);
      setEditingTeacher(null);
      resetForm();
      
    } catch (err: any) {
      console.error("Failed to update teacher:", err);
      setError("Failed to update teacher: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.full_name}?`)) return;
    
    try {
      setError("");
      await djangoApi.deleteAdminUser(teacher.id);
      
      setTeachers(prev => prev.filter(t => t.id !== teacher.id));
      setSuccess("Teacher deleted successfully!");
      
    } catch (err: any) {
      console.error("Failed to delete teacher:", err);
      setError("Failed to delete teacher: " + (err.message || "Unknown error"));
    }
  };

  const openEditDialog = (teacher: Teacher) => {
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
      assigned_courses: teacher.assigned_courses?.map(c => c.id) || [],
      password: "",
      confirm_password: ""
    });
    setIsEditTeacherOpen(true);
  };

  const openViewDialog = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setIsViewTeacherOpen(true);
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Filter teachers based on current filters
  const filteredTeachers = teachers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
          <p className="text-gray-600 mt-1">Manage teacher accounts, departments, and course assignments</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={loadTeachers}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <TeacherForm 
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                departments={departments}
                courses={courses}
                loading={formLoading}
                onSubmit={handleCreateTeacher}
                onCancel={() => {
                  setIsAddTeacherOpen(false);
                  resetForm();
                }}
                isEdit={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button variant="ghost" size="sm" onClick={clearMessages}>×</Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="flex justify-between items-center text-green-800">
            {success}
            <Button variant="ghost" size="sm" onClick={clearMessages}>×</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search teachers..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.department_name}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Teachers ({filteredTeachers.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading teachers...</p>
              </div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No teachers found</p>
              <p className="text-sm text-gray-500 mt-1">
                {Object.keys(filters).length > 0 ? "Try adjusting your filters" : "Add your first teacher to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher.full_name}`} />
                            <AvatarFallback>
                              {teacher.first_name[0]}{teacher.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{teacher.full_name}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {teacher.email}
                          </div>
                          {teacher.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {teacher.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{teacher.department || 'Not assigned'}</div>
                          {teacher.specialization && (
                            <div className="text-sm text-gray-500">{teacher.specialization}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacher.employee_id}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={teacher.is_active ? "default" : "secondary"}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {teacher.last_login 
                            ? new Date(teacher.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(teacher)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTeacher(teacher)}
                            className="text-red-600 hover:text-red-700"
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
          )}
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditTeacherOpen} onOpenChange={setIsEditTeacherOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          <TeacherForm 
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            departments={departments}
            courses={courses}
            loading={formLoading}
            onSubmit={handleUpdateTeacher}
            onCancel={() => {
              setIsEditTeacherOpen(false);
              setEditingTeacher(null);
              resetForm();
            }}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* View Teacher Dialog */}
      <Dialog open={isViewTeacherOpen} onOpenChange={setIsViewTeacherOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {viewingTeacher && (
            <TeacherDetails teacher={viewingTeacher} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Teacher Form Component
interface TeacherFormProps {
  formData: TeacherFormData;
  setFormData: React.Dispatch<React.SetStateAction<TeacherFormData>>;
  formErrors: Partial<TeacherFormData>;
  departments: Department[];
  courses: Course[];
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  formData,
  setFormData,
  formErrors,
  departments,
  courses,
  loading,
  onSubmit,
  onCancel,
  isEdit
}) => {
  const handleInputChange = (field: keyof TeacherFormData, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            placeholder="Enter first name"
            className={formErrors.first_name ? "border-red-500" : ""}
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
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            placeholder="Enter last name"
            className={formErrors.last_name ? "border-red-500" : ""}
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
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
          className={formErrors.email ? "border-red-500" : ""}
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
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input
            id="employee_id"
            value={formData.employee_id}
            onChange={(e) => handleInputChange('employee_id', e.target.value)}
            placeholder="Enter employee ID"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select onValueChange={(value) => handleInputChange('department', value)}>
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
            onChange={(e) => handleInputChange('specialization', e.target.value)}
            placeholder="Enter specialization"
          />
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              className={formErrors.password ? "border-red-500" : ""}
            />
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <Input
              id="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={(e) => handleInputChange('confirm_password', e.target.value)}
              placeholder="Confirm password"
              className={formErrors.confirm_password ? "border-red-500" : ""}
            />
            {formErrors.confirm_password && (
              <p className="text-sm text-red-500 mt-1">{formErrors.confirm_password}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <Label>Assigned Courses</Label>
        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
          {courses.length > 0 ? courses.map((course) => (
            <div key={course.id} className="flex items-center space-x-2">
              <Checkbox
                id={`course-${course.id}`}
                checked={formData.assigned_courses.includes(course.id)}
                onCheckedChange={(checked) => {
                  const currentCourses = formData.assigned_courses;
                  if (checked) {
                    handleInputChange('assigned_courses', [...currentCourses, course.id]);
                  } else {
                    handleInputChange('assigned_courses', currentCourses.filter(id => id !== course.id));
                  }
                }}
              />
              <Label htmlFor={`course-${course.id}`} className="text-sm">
                {course.course_code} - {course.course_name}
              </Label>
            </div>
          )) : (
            <p className="text-sm text-gray-500">No courses available</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update Teacher' : 'Create Teacher'
          )}
        </Button>
      </div>
    </div>
  );
};

// Teacher Details Component
interface TeacherDetailsProps {
  teacher: Teacher;
}

const TeacherDetails: React.FC<TeacherDetailsProps> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher.full_name}`} />
          <AvatarFallback className="text-lg">
            {teacher.first_name[0]}{teacher.last_name[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{teacher.full_name}</h3>
          <p className="text-gray-600">{teacher.role}</p>
          <div className="mt-2">
            <Badge variant={teacher.is_active ? "default" : "secondary"}>
              {teacher.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Label>
          <p className="mt-1">{teacher.email}</p>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            Phone
          </Label>
          <p className="mt-1">{teacher.phone || 'Not provided'}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Department
          </Label>
          <p className="mt-1">{teacher.department || 'Not assigned'}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <GraduationCap className="h-4 w-4 mr-2" />
            Specialization
          </Label>
          <p className="mt-1">{teacher.specialization || 'Not specified'}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Employee ID
          </Label>
          <p className="mt-1">{teacher.employee_id}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Last Login
          </Label>
          <p className="mt-1">
            {teacher.last_login 
              ? new Date(teacher.last_login).toLocaleDateString()
              : 'Never'
            }
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Joined Date
          </Label>
          <p className="mt-1">{new Date(teacher.date_joined).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500 flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Assigned Courses ({teacher.assigned_courses?.length || 0})
        </Label>
        <div className="mt-2">
          {teacher.assigned_courses?.length > 0 ? (
            <div className="space-y-2">
              {teacher.assigned_courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{course.course_code}</div>
                    <div className="text-sm text-gray-600">{course.course_name}</div>
                  </div>
                  <Badge variant="outline">{course.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No courses assigned</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Export both named and default for flexibility
export { TeachersManagement };
export default TeachersManagement;

// Alternative named export for the import in Index.tsx
export const TeacherManagement = TeachersManagement;