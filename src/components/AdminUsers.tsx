
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, Shield, UserCog, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const adminUsers = [
  { 
    id: 1, 
    name: "John Admin", 
    email: "john.admin@school.edu", 
    role: "Super Admin", 
    status: "Active", 
    lastLogin: "2024-06-01 09:15",
    permissions: ["All Access"],
    phone: "+1234567890"
  },
  { 
    id: 2, 
    name: "Sarah Manager", 
    email: "sarah.manager@school.edu", 
    role: "Manager", 
    status: "Active", 
    lastLogin: "2024-06-01 08:30",
    permissions: ["View Reports", "Manage Students", "Edit Attendance"],
    phone: "+1234567891"
  },
  { 
    id: 3, 
    name: "Mike Teacher", 
    email: "mike.teacher@school.edu", 
    role: "Teacher", 
    status: "Active", 
    lastLogin: "2024-05-31 15:45",
    permissions: ["View Reports", "View Students"],
    phone: "+1234567892"
  },
  { 
    id: 4, 
    name: "Emma Staff", 
    email: "emma.staff@school.edu", 
    role: "Staff", 
    status: "Inactive", 
    lastLogin: "2024-05-25 10:20",
    permissions: ["View Reports"],
    phone: "+1234567893"
  },
];

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const filteredUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin": return "bg-red-100 text-red-800";
      case "Manager": return "bg-blue-100 text-blue-800";
      case "Teacher": return "bg-green-100 text-green-800";
      case "Staff": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Users Management</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {[
                    "View Reports",
                    "Manage Students", 
                    "Edit Attendance",
                    "Manage Admin Users",
                    "System Settings"
                  ].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Switch id={permission} />
                      <Label htmlFor={permission} className="text-sm">{permission}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Mail size={14} />
                    <span>Email</span>
                  </div>
                  <p className="text-sm font-medium break-all">{user.email}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Phone size={14} />
                    <span>Phone</span>
                  </div>
                  <p className="text-sm font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Shield size={14} />
                  <span>Permissions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="text-sm font-medium">{user.lastLogin}</p>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <UserCog size={14} className="mr-1" />
                  Permissions
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
