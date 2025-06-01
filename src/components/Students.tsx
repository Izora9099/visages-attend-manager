
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Filter, Edit, Trash2, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const students = [
  { id: 1, name: "John Doe", studentId: "ST001", class: "Grade 10A", email: "john@school.edu", phone: "+1234567890", status: "Active", attendance: 85 },
  { id: 2, name: "Jane Smith", studentId: "ST002", class: "Grade 10B", email: "jane@school.edu", phone: "+1234567891", status: "Active", attendance: 92 },
  { id: 3, name: "Mike Johnson", studentId: "ST003", class: "Grade 11A", email: "mike@school.edu", phone: "+1234567892", status: "Inactive", attendance: 76 },
  { id: 4, name: "Sarah Wilson", studentId: "ST004", class: "Grade 11B", email: "sarah@school.edu", phone: "+1234567893", status: "Active", attendance: 94 },
];

export const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter student name" />
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" placeholder="Enter student ID" />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="grade10a">Grade 10A</SelectItem>
                    <SelectItem value="grade10b">Grade 10B</SelectItem>
                    <SelectItem value="grade11a">Grade 11A</SelectItem>
                    <SelectItem value="grade11b">Grade 11B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex-1">
                  <Camera size={16} className="mr-2" />
                  Capture Face
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddStudentOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add Student
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search students by name, ID, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                </div>
                <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{student.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-sm">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{student.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${student.attendance}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{student.attendance}%</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
