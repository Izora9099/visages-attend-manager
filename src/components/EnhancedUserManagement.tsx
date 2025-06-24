// src/components/EnhancedUserManagement.tsx
// Enhanced user management component for new RBAC system

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Edit, Trash2, Shield, Users, BookOpen, Key, Eye, EyeOff } from "lucide-react";

interface EnhancedUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'teacher' | 'staff';
  permissions: string[];
  assigned_courses: Course[];
  is_active: boolean;
  last_login: string;
  created_at: string;
  phone?: string;
  department?: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
  level: string;
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
}

// Dummy data
const dummyCourses: Course[] = [
  { id: 1, code: "CS101", name: "Introduction to Computer Science", level: "Level 100" },
  { id: 2, code: "MATH201", name: "Calculus II", level: "Level 200" },
  { id: 3, code: "ENG301", name: "Advanced English Composition", level: "Level 300" },
  { id: 4, code: "CS401", name: "Senior Project", level: "Level 400" },
  { id: 5, code: "PHYS101", name: "General Physics I", level: "Level 100" },
  { id: 6, code: "CHEM201", name: "Organic Chemistry", level: "Level 200" }
];

const dummyUsers: EnhancedUser[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@university.edu",
    first_name: "System",
    last_name: "Administrator",
    role: "superadmin",
    permissions: ["all"],
    assigned_courses: [],
    is_active: true,
    last_login: "2024-06-23T09:30:00",
    created_at: "2024-01-01T00:00:00",
    department: "IT"
  },
  {
    id: 2,
    username: "jsmith",
    email: "j.smith@university.edu",
    first_name: "John",
    last_name: "Smith",
    role: "teacher",
    permissions: ["view_student_roster", "view_attendance", "edit_attendance", "start_sessions"],
    assigned_courses: [dummyCourses[0], dummyCourses[3]],
    is_active: true,
    last_login: "2024-06-23T08:15:00",
    created_at: "2024-02-15T00:00:00",
    phone: "+1-555-0101",
    department: "Computer Science"
  },
  {
    id: 3,
    username: "sjohnson",
    email: "s.johnson@university.edu",
    first_name: "Sarah",
    last_name: "Johnson",
    role: "teacher",
    permissions: ["view_student_roster", "view_attendance", "edit_attendance", "start_sessions"],
    assigned_courses: [dummyCourses[1]],
    is_active: true,
    last_login: "2024-06-22T16:45:00",
    created_at: "2024-02-20T00:00:00",
    phone: "+1-555-0102",
    department: "Mathematics"
  },
  {
    id: 4,
    username: "mwilson",
    email: "m.wilson@university.edu",
    first_name: "Michael",
    last_name: "Wilson",
    role: "staff",
    permissions: ["view_students", "manage_students", "enroll_students"],
    assigned_courses: [],
    is_active: true,
    last_login: "2024-06-23T07:30:00",
    created_at: "2024-03-01T00:00:00",
    phone: "+1-555-0103",
    department: "Registrar"
  }
];

const availablePermissions = [
  { id: "view_students", name: "View Students", category: "Students" },
  { id: "manage_students", name: "Manage Students", category: "Students" },
  { id: "enroll_students", name: "Enroll Students", category: "Students" },
  { id: "view_student_roster", name: "View Student Roster", category: "Students" },
  { id: "view_courses", name: "View Courses", category: "Courses" },
  { id: "manage_courses", name: "Manage Courses", category: "Courses" },
  { id: "assign_teachers", name: "Assign Teachers", category: "Courses" },
  { id: "view_timetable", name: "View Timetable", category: "Timetable" },
  { id: "manage_timetable", name: "Manage Timetable", category: "Timetable" },
  { id: "view_attendance", name: "View Attendance", category: "Attendance" },
  { id: "edit_attendance", name: "Edit Attendance", category: "Attendance" },
  { id: "start_sessions", name: "Start Sessions", category: "Attendance" },
  { id: "view_reports", name: "View Reports", category: "Reports" },
  { id: "generate_reports", name: "Generate Reports", category: "Reports" },
  { id: "system_reports", name: "System Reports", category: "Reports" },
  { id: "view_users", name: "View Users", category: "Users" },
  { id: "manage_users", name: "Manage Users", category: "Users" },
  { id: "system_settings", name: "System Settings", category: "System" }
];

const roleTemplates: RoleTemplate[] = [
  {
    id: "superadmin",
    name: "Superadmin",
    description: "Full system access and control",
    permissions: availablePermissions.map(p => p.id),
    level: 4
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Course-specific access with attendance management",
    permissions: [
      "view_student_roster", "view_attendance", "edit_attendance", 
      "start_sessions", "view_reports", "generate_reports", "view_timetable"
    ],
    level: 1
  },
  {
    id: "staff",
    name: "Staff (Administrative)",
    description: "Student lifecycle management",
    permissions: [
      "view_students", "manage_students", "enroll_students", 
      "view_courses", "view_timetable"
    ],
    level: 2
  }
];

export const EnhancedUserManagement = () => {
  const [users, setUsers] = useState<EnhancedUser[]>(dummyUsers);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    role: 'staff' as 'superadmin' | 'teacher' | 'staff',
    password: '',
    confirm_password: '',
    permissions: [] as string[],
    assigned_courses: [] as number[],
    is_active: true
  });

  const departments = ["Computer Science", "Mathematics", "English", "Physics", "Chemistry", "Biology", "IT", "Registrar"];

  const handleCreateUser = () => {
    const roleTemplate = roleTemplates.find(r => r.id === formData.role);
    const assignedCourses = dummyCourses.filter(c => formData.assigned_courses.includes(c.id));
    
    const newUser: EnhancedUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      permissions: roleTemplate ? roleTemplate.permissions : formData.permissions,
      assigned_courses: assignedCourses,
      is_active: formData.is_active,
      last_login: "",
      created_at: new Date().toISOString(),
      phone: formData.phone,
      department: formData.department
    };

    setUsers([...users, newUser]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const roleTemplate = roleTemplates.find(r => r.id === formData.role);
    const assignedCourses = dummyCourses.filter(c => formData.assigned_courses.includes(c.id));

    const updatedUsers = users.map(user =>
      user.id === selectedUser.id
        ? {
            ...user,
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            permissions: roleTemplate ? roleTemplate.permissions : formData.permissions,
            assigned_courses: assignedCourses,
            is_active: formData.is_active,
            phone: formData.phone,
            department: formData.department
          }
        : user
    );

    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      department: '',
      role: 'staff',
      password: '',
      confirm_password: '',
      permissions: [],
      assigned_courses: [],
      is_active: true
    });
  };

  const openEditDialog = (user: EnhancedUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      department: user.department || '',
      role: user.role,
      password: '',
      confirm_password: '',
      permissions: user.permissions,
      assigned_courses: user.assigned_courses.map(c => c.id),
      is_active: user.is_active
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      case 'teacher': return 'bg-blue-500 text-white';
      case 'staff': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: typeof availablePermissions } = {};
    availablePermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const handleRoleChange = (role: 'superadmin' | 'teacher' | 'staff') => {
    const roleTemplate = roleTemplates.find(r => r.id === role);
    setFormData({
      ...formData,
      role,
      permissions: roleTemplate ? roleTemplate.permissions : []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.is_active).length}
                </div>
                <div className="text-sm text-gray-500">Active Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'teacher').length}
                </div>
                <div className="text-sm text-gray-500">Teachers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {users.filter(u => u.role === 'staff').length}
                </div>
                <div className="text-sm text-gray-500">Staff</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Courses</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || "—"}</TableCell>
                      <TableCell>
                        {user.assigned_courses.length > 0 ? (
                          <div className="space-y-1">
                            {user.assigned_courses.slice(0, 2).map(course => (
                              <Badge key={course.id} variant="outline" className="text-xs">
                                {course.code}
                              </Badge>
                            ))}
                            {user.assigned_courses.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.assigned_courses.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="text-sm">
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleTemplates.map(role => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{role.name}</span>
                    <Badge className={getRoleBadgeColor(role.id)}>
                      Level {role.level}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Users with this role:</span>
                      <span className="font-medium">
                        {users.filter(u => u.role === role.id).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Permissions:</span>
                      <span className="font-medium">{role.permissions.length}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Key Permissions:</Label>
                      <div className="space-y-1">
                        {role.permissions.slice(0, 5).map(permissionId => {
                          const permission = availablePermissions.find(p => p.id === permissionId);
                          return permission ? (
                            <Badge key={permission.id} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ) : null;
                        })}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <p className="text-sm text-gray-500">
                Manage granular permissions for system access control
              </p>
            </CardHeader>
            <CardContent>
              {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map(permission => (
                      <div key={permission.id} className="border rounded p-3">
                        <div className="font-medium text-sm">{permission.name}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {permission.id}</div>
                        <div className="mt-2">
                          <div className="text-xs text-gray-600">
                            Used by: {roleTemplates.filter(r => r.permissions.includes(permission.id)).map(r => r.name).join(', ') || 'None'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Smith"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="jsmith"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="j.smith@university.edu"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1-555-0101"
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Password"
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
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleTemplates.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center">
                        <Badge className={`${getRoleBadgeColor(role.id)} mr-2`}>
                          {role.name}
                        </Badge>
                        <span>{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'teacher' && (
              <div>
                <Label>Assigned Courses</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {dummyCourses.map(course => (
                    <div key={course.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={formData.assigned_courses.includes(course.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              assigned_courses: [...formData.assigned_courses, course.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assigned_courses: formData.assigned_courses.filter(id => id !== course.id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`course-${course.id}`} className="text-sm">
                        {course.code} - {course.name}
                        <Badge variant="outline" className="ml-2 text-xs">{course.level}</Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Permissions</Label>
              <div className="border rounded p-3 max-h-60 overflow-y-auto">
                {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{category}</h4>
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2 mb-1 ml-4">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, permission.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter(id => id !== permission.id)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`permission-${permission.id}`} className="text-xs">
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
              />
              <label htmlFor="is_active" className="text-sm">
                Active User
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser}>
            Create User
          </Button>
        </div>
      </DialogContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name</Label>
                  <Input
                    id="edit_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input
                    id="edit_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit_username">Username</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTemplates.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center">
                          <Badge className={`${getRoleBadgeColor(role.id)} mr-2`}>
                            {role.name}
                          </Badge>
                          <span>{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'teacher' && (
                <div>
                  <Label>Assigned Courses</Label>
                  <div className="border rounded p-3 max-h-40 overflow-y-auto">
                    {dummyCourses.map(course => (
                      <div key={course.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`edit-course-${course.id}`}
                          checked={formData.assigned_courses.includes(course.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                assigned_courses: [...formData.assigned_courses, course.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assigned_courses: formData.assigned_courses.filter(id => id !== course.id)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`edit-course-${course.id}`} className="text-sm">
                          {course.code} - {course.name}
                          <Badge variant="outline" className="ml-2 text-xs">{course.level}</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                />
                <label htmlFor="edit_is_active" className="text-sm">
                  Active User
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Courses</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || "—"}</TableCell>
                      <TableCell>
                        {user.assigned_courses.length > 0 ? (
                          <div className="space-y-1">
                            {user.assigned_courses.slice(0, 2).map(course => (
                              <Badge key={course.id} variant="outline" className="text-xs">
                                {course.code}
                              </Badge>
                            ))}
                            {user.assigned_courses.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.assigned_courses.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="text-sm">
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};