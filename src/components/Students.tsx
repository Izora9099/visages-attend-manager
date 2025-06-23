
import { useEffect, useState } from "react";
import { djangoApi } from "@/services/djangoApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudentEditDialog } from "./StudentEditDialog";
import { StudentCreateDialog } from "./StudentCreateDialog";

export const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await djangoApi.getStudents();
      const withAttendance = data.map((s: any) => ({
        ...s,
        attendance: Math.floor(Math.random() * 30) + 70,
      }));
      setStudents(withAttendance);
    } catch (err) {
      console.error("❌ Failed to load students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matric_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddStudentOpen(true)}
        >
          <Plus size={16} className="mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search students..."
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

      {/* Students Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                    <AvatarFallback>
                      {student.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-gray-500">{student.matric_number}</p>
                  </div>
                </div>
                <Badge>{student.face_encoding_model}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Registered On</p>
                <p className="font-medium text-sm">
                  {new Date(student.registered_on).toLocaleDateString()}
                </p>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditingStudent(student);
                    setIsEditOpen(true);
                  }}
                >
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

      {/* Student Create Dialog */}
      <StudentCreateDialog
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSave={fetchStudents}
      />

      {/* Student Edit Dialog */}
      {editingStudent && (
        <StudentEditDialog
          student={editingStudent}
          isOpen={isEditOpen} // Fixed: changed from 'open' to 'isOpen'
          onClose={() => setIsEditOpen(false)}
          onSave={fetchStudents}
        />
      )}
    </div>
  );
};
