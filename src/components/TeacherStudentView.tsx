import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { djangoApi } from "@/services/djangoApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, User, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TeacherStudentView = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levels, setLevels] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isLoading, setIsLoading] = useState({
    levels: false,
    courses: false,
    students: false,
  });

  // Fetch levels and teacher's assigned courses
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, levels: true }));
        const [levelsData] = await Promise.all([
          djangoApi.getAcademicLevels(),
        ]);
        setLevels(levelsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, levels: false }));
      }
    };

    fetchInitialData();
  }, []);

  // Fetch courses when level is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedLevel) return;
      
      try {
        setIsLoading(prev => ({ ...prev, courses: true }));
        const assignedCourses = await djangoApi.getTeacherCourses(user.id);
        const filteredCourses = assignedCourses.filter(
          (course: any) => course.level === selectedLevel
        );
        setCourses(filteredCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, courses: false }));
      }
    };

    fetchCourses();
  }, [selectedLevel, user.id]);

  // Fetch students when course is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      
      try {
        setIsLoading(prev => ({ ...prev, students: true }));
        const studentsData = await djangoApi.getCourseStudents(selectedCourse);
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, students: false }));
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.matric_number?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleLevelChange = (levelId: string) => {
    setSelectedLevel(levelId);
    setSelectedCourse("");
    setStudents([]);
    setFilteredStudents([]);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Student Roster</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Academic Level</Label>
              <Select
                value={selectedLevel}
                onValueChange={handleLevelChange}
                disabled={isLoading.levels}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={handleCourseChange}
                disabled={!selectedLevel || isLoading.courses}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search Students</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedCourse || isLoading.students}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading.students ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {!selectedCourse
                  ? 'Select a course to view enrolled students'
                  : 'No students are enrolled in this course'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.matric_number}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Attendance: <span className="text-blue-600">{student.attendance || 0}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
