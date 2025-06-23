
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import { TeacherCreateDialog } from './TeacherCreateDialog';
import { TeacherEditDialog } from './TeacherEditDialog';
import { TeacherCourseAssignmentDialog } from './TeacherCourseAssignmentDialog';

// Mock teacher data
const MOCK_TEACHERS = [
  {
    id: 1,
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    phone: '+234 123 456 7890',
    department: 'Computer Science',
    employee_id: 'EMP001',
    specialization: 'Software Engineering',
    assigned_courses: ['CSC101', 'CSC301', 'CSC401'],
    status: 'Active',
    joined_date: '2020-01-15',
  },
  {
    id: 2,
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    phone: '+234 123 456 7891',
    department: 'Mathematics',
    employee_id: 'EMP002',
    specialization: 'Applied Mathematics',
    assigned_courses: ['MTH201', 'MTH301'],
    status: 'Active',
    joined_date: '2018-08-20',
  },
  {
    id: 3,
    name: 'Dr. Michael Brown',
    email: 'michael.brown@university.edu',
    phone: '+234 123 456 7892',
    department: 'Physics',
    employee_id: 'EMP003',
    specialization: 'Quantum Physics',
    assigned_courses: ['PHY301', 'PHY401'],
    status: 'Active',
    joined_date: '2019-03-10',
  },
];

export const TeacherManagement = () => {
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<any>(null);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeacher = (teacherData: any) => {
    const newTeacher = {
      ...teacherData,
      id: Math.max(...teachers.map(t => t.id)) + 1,
      assigned_courses: [],
      status: 'Active',
      joined_date: new Date().toISOString().split('T')[0],
    };
    setTeachers([...teachers, newTeacher]);
  };

  const handleUpdateTeacher = (updatedTeacher: any) => {
    setTeachers(teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };

  const handleDeleteTeacher = (id: number) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const handleCourseAssignment = (teacherId: number, courses: string[]) => {
    setTeachers(teachers.map(t => 
      t.id === teacherId ? { ...t, assigned_courses: courses } : t
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={16} className="mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {teachers.filter(t => t.status === 'Active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Course Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {teachers.reduce((total, teacher) => total + teacher.assigned_courses.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search teachers by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} />
                    <AvatarFallback>
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <p className="text-sm text-gray-500">{teacher.employee_id}</p>
                  </div>
                </div>
                <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                  {teacher.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{teacher.department}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium">{teacher.specialization}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-sm">{teacher.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Assigned Courses ({teacher.assigned_courses.length})</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.assigned_courses.slice(0, 3).map((course, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                  {teacher.assigned_courses.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{teacher.assigned_courses.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditingTeacher(teacher);
                    setIsEditOpen(true);
                  }}
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setAssigningTeacher(teacher);
                    setIsAssignmentOpen(true);
                  }}
                >
                  <BookOpen size={14} className="mr-1" />
                  Courses
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <TeacherCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateTeacher}
      />

      {editingTeacher && (
        <TeacherEditDialog
          teacher={editingTeacher}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleUpdateTeacher}
        />
      )}

      {assigningTeacher && (
        <TeacherCourseAssignmentDialog
          teacher={assigningTeacher}
          isOpen={isAssignmentOpen}
          onClose={() => setIsAssignmentOpen(false)}
          onSave={handleCourseAssignment}
        />
      )}
    </div>
  );
};
