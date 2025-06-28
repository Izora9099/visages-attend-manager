import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Users, BookOpen, RefreshCw, AlertCircle, Mail, Phone, Eye, Building, GraduationCap, User } from 'lucide-react';

// Import your actual Django API service
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

interface Specialization {
  id: number;
  specialization_name: string;
  specialization_code: string;
  department: number;
  is_active: boolean;
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
  department: string; // This will store department ID as string
  employee_id: string;
  specialization: string; // This will store specialization ID as string  
  assigned_courses: number[];
  password?: string;
  confirm_password?: string;
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

interface TeacherFormProps {
  formData: TeacherFormData;
  setFormData: React.Dispatch<React.SetStateAction<TeacherFormData>>;
  formErrors: Partial<TeacherFormData>;
  departments: Department[];
  specializations: Specialization[];
  courses: Course[];
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

// Teacher Form Component
const TeacherForm: React.FC<TeacherFormProps> = ({
  formData,
  setFormData,
  formErrors,
  departments,
  specializations,
  courses,
  loading,
  onSubmit,
  onCancel,
  isEdit
}) => {
  const handleInputChange = (field: keyof TeacherFormData, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filter specializations based on selected department
  const filteredSpecializations = specializations.filter(spec => 
    !formData.department || spec.department.toString() === formData.department
  );

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

      {!isEdit && (
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Enter username"
            className={formErrors.username ? "border-red-500" : ""}
          />
          {formErrors.username && (
            <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>
          )}
        </div>
      )}

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
          <Select
            value={formData.department}
            onValueChange={(value) => handleInputChange('department', value)}
          >
            <SelectTrigger>
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
        </div>

        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) => handleInputChange('specialization', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {filteredSpecializations.map((spec) => (
                <SelectItem key={spec.id} value={spec.id.toString()}>
                  {spec.specialization_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ''}
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
              value={formData.confirm_password || ''}
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

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
const TeacherDetails: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email}`} />
          <AvatarFallback>
            {teacher.first_name[0]}{teacher.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{teacher.full_name || `${teacher.first_name} ${teacher.last_name}`}</h3>
          <p className="text-gray-600">{teacher.role}</p>
          <Badge variant={teacher.is_active ? "default" : "secondary"}>
            {teacher.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{teacher.email}</span>
            </div>
            {teacher.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{teacher.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Professional Details</h4>
          <div className="space-y-2">
            {teacher.department && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{teacher.department}</span>
              </div>
            )}
            {teacher.employee_id && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">ID: {teacher.employee_id}</span>
              </div>
            )}
            {teacher.specialization && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{teacher.specialization}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Last Login: {teacher.last_login ? new Date(teacher.last_login).toLocaleString() : 'Never'}</p>
          <p>Joined: {new Date(teacher.date_joined).toLocaleDateString()}</p>
          <p>Assigned Courses: {teacher.assigned_courses?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

// Main Component Function
function TeacherManagementComponent() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isViewTeacherOpen, setIsViewTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<TeacherFormData>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    department: '',
    employee_id: '',
    specialization: 'none',
    assigned_courses: [],
    password: '',
    confirm_password: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<TeacherFormData>>({});

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load departments and specializations first and wait for them to complete
      await loadDepartments();
      await loadSpecializations();
      await loadCourses();
      
      // Add a small delay to ensure state updates have completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now load teachers - this should have access to the departments/specializations
      await loadTeachers();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use your actual Django API to get admin users
      const data = await djangoApi.getAdminUsers();
      console.log('🔍 Raw admin users data from Django:', data);
      
      // Handle different response formats (array or object with results)
      const users = Array.isArray(data) ? data : data?.results || [];
      console.log('🔍 Processed users array:', users);
      
      // Get fresh department and specialization data for mapping
      let currentDepartments = departments;
      let currentSpecializations = specializations;
      
      // If arrays are empty, try to load them again
      if (departments.length === 0) {
        console.log('🔄 Departments empty, reloading...');
        const deptData = await djangoApi.getDepartments();
        currentDepartments = Array.isArray(deptData) ? deptData : deptData?.results || [];
        setDepartments(currentDepartments);
      }
      
      if (specializations.length === 0) {
        console.log('🔄 Specializations empty, reloading...');
        const specData = await djangoApi.getSpecializations();
        currentSpecializations = Array.isArray(specData) ? specData : specData?.results || [];
        setSpecializations(currentSpecializations);
      }
      
      console.log('🔍 Available departments for mapping:', currentDepartments);
      console.log('🔍 Available specializations for mapping:', currentSpecializations);
      
      // Filter for teachers only and transform data to match interface
      const teacherData = users
        .filter(user => user.role === 'teacher' || user.role === 'Teacher')
        .map(user => {
          console.log(`🔍 Processing user ${user.id}:`, {
            raw_department_id: user.department_id,
            raw_department: user.department,
            raw_specialization_id: user.specialization_id,
            raw_specialization: user.specialization
          });

          // Find department name from department ID
          const departmentName = user.department_id 
            ? currentDepartments.find(d => d.id === user.department_id)?.department_name || user.department || ''
            : user.department || '';
          
          // Find specialization name from specialization ID  
          const specializationName = user.specialization_id
            ? currentSpecializations.find(s => s.id === user.specialization_id)?.specialization_name || user.specialization || ''
            : user.specialization || '';

          console.log(`🔍 Mapped names for user ${user.id}:`, {
            departmentName,
            specializationName
          });

          return {
            id: user.id,
            username: user.username || user.email,
            email: user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            full_name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            role: user.role.toLowerCase(),
            phone: user.phone || '',
            department: departmentName, // Store department name for display
            employee_id: user.employee_id || '',
            specialization: specializationName, // Store specialization name for display
            assigned_courses: user.assigned_courses || [],
            is_active: user.status === 'Active' || user.is_active !== false,
            last_login: user.last_login,
            date_joined: user.date_joined || user.created_at,
            created_at: user.created_at,
            updated_at: user.updated_at
          };
        });
      
      console.log('🔍 Final teacher data:', teacherData);
      setTeachers(teacherData);
    } catch (err: any) {
      console.error('Failed to load teachers:', err);
      setError('Failed to load teachers: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await djangoApi.getDepartments();
      console.log('🔍 Raw departments data:', data);
      
      // Handle different response formats
      const departments = Array.isArray(data) ? data : data?.results || [];
      console.log('🔍 Processed departments:', departments);
      
      // 🧪 TEMPORARY: Add test data if empty
      if (departments.length === 0) {
        console.log('⚠️ No departments found, using test data');
        const testDepartments = [
          { id: 1, department_name: 'Computer Science', department_code: 'CS', is_active: true },
          { id: 2, department_name: 'Mathematics', department_code: 'MATH', is_active: true },
          { id: 3, department_name: 'Physics', department_code: 'PHYS', is_active: true }
        ];
        setDepartments(testDepartments);
      } else {
        setDepartments(departments);
      }
    } catch (err: any) {
      console.error('Failed to load departments:', err);
      // Set test data on error
      setDepartments([
        { id: 1, department_name: 'Computer Science', department_code: 'CS', is_active: true },
        { id: 2, department_name: 'Mathematics', department_code: 'MATH', is_active: true }
      ]);
    }
  };

  const loadSpecializations = async () => {
    try {
      const data = await djangoApi.getSpecializations();
      console.log('🔍 Raw specializations data:', data);
      
      // Handle different response formats
      const specializations = Array.isArray(data) ? data : data?.results || [];
      console.log('🔍 Processed specializations:', specializations);
      setSpecializations(specializations);
    } catch (err: any) {
      console.error('Failed to load specializations:', err);
      // Set empty array on error but don't show error to user for non-critical data
      setSpecializations([]);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await djangoApi.getCourses();
      
      // Handle different response formats
      const courses = Array.isArray(data) ? data : data?.results || [];
      setCourses(courses);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      // Set empty array on error but don't show error to user for non-critical data
      setCourses([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<TeacherFormData> = {};

    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!editingTeacher) {
      if (!formData.username.trim()) errors.username = 'Username is required';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      department: '',
      employee_id: '',
      specialization: 'none',
      assigned_courses: [],
      password: '',
      confirm_password: ''
    });
    setFormErrors({});
  };

  const handleCreateTeacher = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      setError('');

      const teacherData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: 'teacher',
        department_id: formData.department ? parseInt(formData.department) : null,
        employee_id: formData.employee_id,
        specialization_id: formData.specialization && formData.specialization !== 'none' ? parseInt(formData.specialization) : null,
        // Default teacher permissions as expected by your backend
        permissions: [
          'view_student_roster', 'view_attendance', 'edit_attendance',
          'start_sessions', 'view_reports', 'generate_reports', 'view_timetable'
        ]
      };

      const newTeacher = await djangoApi.createAdminUser(teacherData);

      // Find department and specialization names for display
      const departmentName = formData.department 
        ? departments.find(d => d.id.toString() === formData.department)?.department_name || ''
        : '';
      
      const specializationName = formData.specialization && formData.specialization !== 'none'
        ? specializations.find(s => s.id.toString() === formData.specialization)?.specialization_name || ''
        : '';

      // Transform the response to match our interface
      const transformedTeacher: Teacher = {
        id: newTeacher.id,
        username: newTeacher.username || formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        role: 'teacher',
        phone: formData.phone,
        department: departmentName, // Display department name
        employee_id: formData.employee_id || `EMP${newTeacher.id.toString().padStart(3, '0')}`,
        specialization: specializationName, // Display specialization name
        assigned_courses: [],
        is_active: true,
        last_login: null,
        date_joined: newTeacher.date_joined || new Date().toISOString(),
        created_at: newTeacher.created_at || new Date().toISOString(),
        updated_at: newTeacher.updated_at || new Date().toISOString()
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
      setError('');

      const updateData = {
        name: `${formData.first_name} ${formData.last_name}`,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department ? parseInt(formData.department) : null,
        employee_id: formData.employee_id,
        specialization_id: formData.specialization && formData.specialization !== 'none' ? parseInt(formData.specialization) : null,
      };

      const updatedTeacher = await djangoApi.updateAdminUser(editingTeacher.id, updateData);

      // Find department and specialization names for display
      const departmentName = formData.department 
        ? departments.find(d => d.id.toString() === formData.department)?.department_name || ''
        : '';
      
      const specializationName = formData.specialization && formData.specialization !== 'none'
        ? specializations.find(s => s.id.toString() === formData.specialization)?.specialization_name || ''
        : '';

      setTeachers(prev => prev.map(teacher => 
        teacher.id === editingTeacher.id 
          ? {
              ...teacher,
              first_name: formData.first_name,
              last_name: formData.last_name,
              full_name: `${formData.first_name} ${formData.last_name}`,
              email: formData.email,
              phone: formData.phone,
              department: departmentName, // Display department name
              employee_id: formData.employee_id,
              specialization: specializationName, // Display specialization name
              updated_at: updatedTeacher.updated_at || new Date().toISOString()
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
      setError('');
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
    
    // Find department ID from department name
    const departmentId = departments.find(d => d.department_name === teacher.department)?.id?.toString() || '';
    
    // Find specialization ID from specialization name
    const specializationId = specializations.find(s => s.specialization_name === teacher.specialization)?.id?.toString() || 'none';
    
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      username: teacher.username,
      email: teacher.email,
      phone: teacher.phone || '',
      department: departmentId,
      employee_id: teacher.employee_id || '',
      specialization: specializationId,
      assigned_courses: teacher.assigned_courses?.map(c => c.id) || [],
      password: '',
      confirm_password: ''
    });
    setIsEditTeacherOpen(true);
  };

  const openViewDialog = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setIsViewTeacherOpen(true);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter teachers based on current filters
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = !filters.search || 
      teacher.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      teacher.employee_id?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = !filters.department || teacher.department === filters.department;
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && teacher.is_active) ||
      (filters.status === 'inactive' && !teacher.is_active);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
                specializations={specializations}
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
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('department', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.department_name}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredTeachers.length} of {teachers.length} teachers
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Teachers List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading teachers...</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600 mb-4">
                {teachers.length === 0 
                  ? "Get started by adding your first teacher."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {teachers.length === 0 && (
                <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Teacher
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email}`} />
                            <AvatarFallback>
                              {teacher.first_name[0]}{teacher.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {teacher.full_name || `${teacher.first_name} ${teacher.last_name}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {teacher.specialization || 'No specialization'}
                            </div>
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
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          {teacher.department || 'No department'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {teacher.employee_id || 'Not assigned'}
                        </Badge>
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
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(teacher)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(teacher)}
                            className="text-green-600 hover:text-green-700"
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
            specializations={specializations}
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
}

// Export the component
export const TeacherManagement = TeacherManagementComponent;
export default TeacherManagementComponent;