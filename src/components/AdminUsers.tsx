import { useEffect, useState } from "react";
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
import { djangoApi } from "@/services/djangoApi";

export const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await djangoApi.getAdminUsers();
        setAdminUsers(data);
      } catch (error) {
        console.error("Failed to fetch admin users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

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

  const handleAddUser = async () => {
    try {
      const result = await djangoApi.createAdminUser(newUser);
      setAdminUsers(prev => [...prev, result]);
      setNewUser({ name: "", email: "", phone: "", role: "", permissions: [] });
      setIsAddUserOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const togglePermission = (permission: string) => {
    setNewUser(prev => {
      const updatedPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: updatedPermissions };
    });
  };

  const filteredUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Enter email address" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {["View Reports", "Manage Students", "Edit Attendance", "Manage Admin Users", "System Settings"].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Switch id={permission} checked={newUser.permissions.includes(permission)} onCheckedChange={() => togglePermission(permission)} />
                      <Label htmlFor={permission} className="text-sm">{permission}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleAddUser}>
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      {loading ? <p>Loading admin users...</p> : (
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
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    <Badge className={getStatusColor("Active")}>Active</Badge>
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
                    {user.permissions?.map((permission: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">Last Login: {user.lastLogin || "-"}</div>
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
      )}
    </div>
  );
};
