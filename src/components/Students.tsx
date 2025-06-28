// Complete Students.tsx - Error Free with Proper Backend Integration
import { useState, useEffect, useRef } from "react";
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
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, RefreshCw, Users, ChevronLeft, ChevronRight, Camera, Upload, RotateCcw } from "lucide-react";
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
  date_of_birth?: string;
  gender?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  face_encoding_model?: string;
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
  date_of_birth: string;
  gender: string;
  emergency_contact: string;
  emergency_phone: string;
  face_image?: File | null;
  face_encoding_model: string;
}

interface Filters {
  search?: string;
  department?: number;
  specialization?: number;
  level?: number;
  status?: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  count: number;
  totalPages: number;
}

export const Students = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    count: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState<Filters>({});

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
    date_of_birth: "",
    gender: "",
    emergency_contact: "",
    emergency_phone: "",
    face_image: null,
    face_encoding_model: "cnn"
  });

  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Face capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load students when filters change
  useEffect(() => {
    loadStudents(pagination.page);
  }, [filters]);

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load academic structure data concurrently
      const [deptResponse, specResponse, levelResponse] = await Promise.all([
        djangoApi.getDepartments().catch(() => ({ results: [] })),
        djangoApi.getSpecializations().catch(() => ({ results: [] })),
        djangoApi.getLevels().catch(() => ({ results: [] }))
      ]);

      // Handle different response formats
      setDepartments(Array.isArray(deptResponse) ? deptResponse : deptResponse?.results || []);
      setSpecializations(Array.isArray(specResponse) ? specResponse : specResponse?.results || []);
      setLevels(Array.isArray(levelResponse) ? levelResponse : levelResponse?.results || []);

      // Load initial students
      loadStudents(1);
      
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
      
      // Filter out undefined values from filters before sending to API
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const params = {
        page,
        page_size: pagination.pageSize,
        ...cleanFilters
      };
      
      const response = await djangoApi.getStudents(params);
      
      // Debug: Log the actual response to see what backend returns
      console.log('Students API response:', response);
      if (Array.isArray(response) && response.length > 0) {
        console.log('First student object:', response[0]);
        console.log('Available fields:', Object.keys(response[0]));
      } else if (response?.results?.length > 0) {
        console.log('First student object:', response.results[0]);
        console.log('Available fields:', Object.keys(response.results[0]));
      }
      
      // Handle different response formats and validate data
      const studentsData = Array.isArray(response) ? response : response?.results || [];
      const totalCount = response?.count || studentsData.length;
      
      // Transform and validate student data with safe defaults
      const transformedStudents: Student[] = studentsData
        .filter(student => student && typeof student === 'object' && student.id) // Filter invalid entries
        .map((student: any) => {
          // Handle different serializer formats from backend
          let firstName = student.first_name;
          let lastName = student.last_name;
          
          // If we only have full_name (from StudentListSerializer), split it
          if (!firstName && !lastName && student.full_name) {
            const nameParts = student.full_name.trim().split(' ');
            firstName = nameParts[0] || 'Unknown';
            lastName = nameParts.slice(1).join(' ') || 'Student';
          }
          
          // Fallback to any name field if still missing
          if (!firstName && !lastName && student.name) {
            const nameParts = student.name.trim().split(' ');
            firstName = nameParts[0] || 'Unknown';
            lastName = nameParts.slice(1).join(' ') || 'Student';
          }
          
          return {
            id: student.id || 0,
            first_name: firstName || 'Unknown',
            last_name: lastName || 'Student',
            full_name: student.full_name || student.name || `${firstName || 'Unknown'} ${lastName || 'Student'}`,
            matric_number: student.matric_number || student.student_number || student.student_id || `TEMP${student.id}`,
            email: student.email || '',
            phone: student.phone || '',
            address: student.address || '',
            department: student.department || student.department_id || 0,
            department_name: student.department_name || 'Unknown Department',
            specialization: student.specialization || student.specialization_id || null,
            specialization_name: student.specialization_name || '',
            level: student.level || student.level_id || 0,
            level_name: student.level_name || 'Unknown Level',
            enrolled_courses: Array.isArray(student.enrolled_courses) ? student.enrolled_courses : [],
            enrolled_courses_count: student.enrolled_courses_count || 0,
            status: student.status || 'active',
            registration_date: student.registration_date || student.registered_on || student.created_at || new Date().toISOString(),
            attendance_rate: typeof student.attendance_rate === 'number' ? student.attendance_rate : 0,
            academic_year: student.academic_year || new Date().getFullYear().toString(),
            created_at: student.created_at || new Date().toISOString(),
            updated_at: student.updated_at || new Date().toISOString(),
            date_of_birth: student.date_of_birth || '',
            gender: student.gender || '',
            emergency_contact: student.emergency_contact || '',
            emergency_phone: student.emergency_phone || '',
            face_encoding_model: student.face_encoding_model || 'cnn'
          };
        });
      
      setStudents(transformedStudents);
      setPagination(prev => ({
        ...prev,
        page,
        count: totalCount,
        totalPages: Math.ceil(totalCount / prev.pageSize)
      }));
      
    } catch (err: any) {
      console.error("Failed to load students:", err);
      setError("Failed to load students: " + (err.message || "Unknown error"));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Remove the filter if value is undefined, null, empty string, or "all"
      if (value === undefined || value === null || value === "" || value === "all") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      return newFilters;
    });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
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
      date_of_birth: "",
      gender: "",
      emergency_contact: "",
      emergency_phone: "",
      face_image: null,
      face_encoding_model: "cnn"
    });
    setFormErrors({});
    setCapturedImage(null);
    stopCamera();
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
    
    // Only require face image for new students, not editing
    if (!editingStudent && !formData.face_image && !capturedImage) {
      errors.face_image = "Face image is required for registration";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStudent = async () => {
    if (!validateForm()) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      // Prepare FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('matric_number', formData.matric_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('department_id', formData.department.toString());
      if (formData.specialization) {
        formDataToSend.append('specialization_id', formData.specialization.toString());
      }
      formDataToSend.append('level_id', formData.level.toString());
      
      // Add optional fields
      if (formData.date_of_birth) formDataToSend.append('date_of_birth', formData.date_of_birth);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      if (formData.emergency_contact) formDataToSend.append('emergency_contact', formData.emergency_contact);
      if (formData.emergency_phone) formDataToSend.append('emergency_phone', formData.emergency_phone);
      
      // Add face image
      if (formData.face_image) {
        formDataToSend.append('image', formData.face_image);
      } else if (capturedImage) {
        // Convert base64 to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formDataToSend.append('image', blob, 'captured_face.jpg');
      }
      
      // Use the register-student endpoint that handles face processing
      const apiUrl = await djangoApi.getApiUrl();
      const response = await fetch(`${apiUrl.replace('/api', '')}/api/register-student/`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setSuccess("Student created successfully with facial recognition!");
        setIsCreateDialogOpen(false);
        resetForm();
        loadStudents(pagination.page);
      } else {
        setError(result.message || "Failed to create student");
      }
      
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
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      matric_number: student.matric_number || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      department: student.department || 0,
      specialization: student.specialization || 0,
      level: student.level || 0,
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      emergency_contact: student.emergency_contact || '',
      emergency_phone: student.emergency_phone || '',
      face_image: null,
      face_encoding_model: student.face_encoding_model || 'cnn'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!validateForm() || !editingStudent) return;
    
    try {
      setFormLoading(true);
      setError("");
      
      // For updates, we only send basic data (no face image unless specifically captured)
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        matric_number: formData.matric_number,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        department: formData.department,
        specialization: formData.specialization || null,
        level: formData.level,
        ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.emergency_contact && { emergency_contact: formData.emergency_contact }),
        ...(formData.emergency_phone && { emergency_phone: formData.emergency_phone }),
      };
      
      const updatedStudent = await djangoApi.updateStudent(editingStudent.id, updateData);
      
      setSuccess("Student updated successfully!");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      
      // Refresh the list
      loadStudents(pagination.page);
      
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
      setSuccess("Student deleted successfully!");
      
      // Refresh the list
      loadStudents(pagination.page);
      
    } catch (err: any) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student: " + (err.message || "Unknown error"));
    }
  };

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleDepartmentChange = (departmentId: number) => {
    setFormData(prev => ({
      ...prev,
      department: departmentId,
      specialization: 0 // Reset specialization when department changes
    }));
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

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadStudents(newPage);
  };

  // Face capture functions
  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Front camera
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert to blob and store
        canvas.toBlob((blob) => {
          if (blob) {
            setFormData(prev => ({ ...prev, face_image: new File([blob], 'face_capture.jpg', { type: 'image/jpeg' }) }));
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, face_image: file }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError("Please select a valid image file");
      }
    }
  };

  const clearCapturedImage = () => {
    setCapturedImage(null);
    setFormData(prev => ({ ...prev, face_image: null }));
  };

  // Safe student rendering with error boundary
  const renderStudentRow = (student: Student) => {
    try {
      // Safety check
      if (!student || !student.id) {
        console.warn('Invalid student object:', student);
        return null;
      }

      const firstName = student.first_name || 'Unknown';
      const lastName = student.last_name || 'Student';
      const fullName = `${firstName} ${lastName}`;
      const matricNumber = student.matric_number || 'N/A';
      const email = student.email || 'No email';
      const departmentName = student.department_name || 'Unknown';
      const levelName = student.level_name || 'Unknown';
      const status = student.status || 'inactive';
      const attendanceRate = student.attendance_rate || 0;
      const specializationName = student.specialization_name || 'No specialization';

      return (
        <TableRow key={student.id}>
          <TableCell>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${matricNumber}`} 
                  alt={fullName}
                />
                <AvatarFallback>
                  {firstName[0]}{lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{fullName}</div>
                <div className="text-sm text-gray-500">{specializationName}</div>
              </div>
            </div>
          </TableCell>
          <TableCell className="font-mono">{matricNumber}</TableCell>
          <TableCell>{email}</TableCell>
          <TableCell>{departmentName}</TableCell>
          <TableCell>{levelName}</TableCell>
          <TableCell>
            <Badge className={getStatusBadgeColor(status)}>
              {status}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">{attendanceRate}%</div>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewStudent(student)}
                title="View student details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditStudent(student)}
                title="Edit student"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteStudent(student.id)}
                className="text-red-600 hover:text-red-700"
                title="Delete student"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    } catch (error) {
      console.error('Error rendering student row:', error, student);
      return null;
    }
  };

  const renderStudentForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className={formErrors.first_name ? 'border-red-500' : ''}
            placeholder="Enter first name"
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
            placeholder="Enter last name"
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
          placeholder="Enter matriculation number"
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
          placeholder="Enter email address"
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
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="emergency_contact">Emergency Contact</Label>
          <Input
            id="emergency_contact"
            value={formData.emergency_contact}
            onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
            placeholder="Emergency contact name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="emergency_phone">Emergency Phone</Label>
        <Input
          id="emergency_phone"
          value={formData.emergency_phone}
          onChange={(e) => setFormData(prev => ({ ...prev, emergency_phone: e.target.value }))}
          placeholder="Emergency contact phone"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
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
              {departments.map(dept => (
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
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              {getFormSpecializations().map(spec => (
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
              {levels.map(level => (
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
      </div>

      {/* Face Image Section */}
      <div className="border-t pt-4">
        <Label>Face Image {!editingStudent && '*'}</Label>
        <div className="mt-2 space-y-4">
          {capturedImage ? (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCapturedImage}
                className="absolute top-2 right-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  disabled={isCameraOpen}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isCameraOpen ? "Camera Active" : "Take Photo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('face-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
              
              <input
                id="face-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Interface */}
          {isCameraOpen && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md rounded-lg border"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex space-x-2">
                <Button type="button" onClick={capturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button type="button" variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {cameraError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {formErrors.face_image && (
            <p className="text-sm text-red-500">{formErrors.face_image}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="face_encoding_model">Face Recognition Model</Label>
        <Select 
          value={formData.face_encoding_model} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, face_encoding_model: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cnn">CNN (More Accurate)</SelectItem>
            <SelectItem value="hog">HOG (Faster)</SelectItem>
            <SelectItem value="facenet">FaceNet (Experimental)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Students Management</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            {renderStudentForm()}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateStudent} 
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Student"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
            ×
          </Button>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
            ×
          </Button>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Department</Label>
              <Select 
                value={filters.department?.toString() || 'all'} 
                onValueChange={(value) => handleFilterChange('department', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
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
                value={filters.specialization?.toString() || 'all'} 
                onValueChange={(value) => handleFilterChange('specialization', value === 'all' ? undefined : parseInt(value))}
                disabled={!filters.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {getFilteredSpecializations().map(spec => (
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
                value={filters.level?.toString() || 'all'} 
                onValueChange={(value) => handleFilterChange('level', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(level => (
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
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {loading ? "Loading..." : `${pagination.count} students found`}
            </div>
            <Button 
              variant="outline" 
              onClick={() => loadStudents(pagination.page)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
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
                  <TableHead>Attendance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading students...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No students found. {Object.keys(filters).length > 0 ? 'Try adjusting your filters.' : 'Click "Add Student" to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map(renderStudentRow).filter(Boolean)
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.count} total students)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {renderStudentForm()}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingStudent(null);
                resetForm();
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStudent} 
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingStudent.matric_number}`} 
                    alt={viewingStudent.full_name}
                  />
                  <AvatarFallback>
                    {viewingStudent.first_name[0]}{viewingStudent.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewingStudent.full_name}</h3>
                  <p className="text-gray-500">{viewingStudent.matric_number}</p>
                  <Badge className={getStatusBadgeColor(viewingStudent.status)}>
                    {viewingStudent.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p>{viewingStudent.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p>{viewingStudent.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p>{viewingStudent.department_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Level</Label>
                  <p>{viewingStudent.level_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Specialization</Label>
                  <p>{viewingStudent.specialization_name || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Attendance Rate</Label>
                  <p>{viewingStudent.attendance_rate}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Enrolled Courses</Label>
                  <p>{viewingStudent.enrolled_courses_count || 0} courses</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                  <p>{new Date(viewingStudent.registration_date).toLocaleDateString()}</p>
                </div>
              </div>

              {viewingStudent.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p>{viewingStudent.address}</p>
                </div>
              )}

              {(viewingStudent.emergency_contact || viewingStudent.emergency_phone) && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingStudent.emergency_contact && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                      <p>{viewingStudent.emergency_contact}</p>
                    </div>
                  )}
                  {viewingStudent.emergency_phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Emergency Phone</Label>
                      <p>{viewingStudent.emergency_phone}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewDialogOpen(false);
                setViewingStudent(null);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};