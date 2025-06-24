// src/components/CourseManagement.tsx
// New component for managing courses and levels

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Edit, Trash2, Users, Clock, Calendar, ListChecks, Layers, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LevelBasedCourseManager } from './LevelBasedCourseManager';
import { Course, AcademicLevel } from '@/types/timetable';
import { timetableApi } from '@/services/timetableApi';
import { CourseDialog } from './CourseDialog';

interface CourseManagementProps {
  // Add any props if needed
}

export const CourseManagement: React.FC<CourseManagementProps> = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch courses and academic levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, levelsData] = await Promise.all([
          timetableApi.getCourses(),
          timetableApi.getAcademicLevels()
        ]);
        setCourses(coursesData);
        setAcademicLevels(levelsData);
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCourseSaved = (savedCourse: Course) => {
    setCourses(prev => {
      const existingIndex = prev.findIndex(c => c.id === savedCourse.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = savedCourse;
        return updated;
      }
      return [...prev, savedCourse];
    });
  };

  const handleCourseDeleted = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const handleSubmitCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingCourse) {
        // Update existing course
        await timetableApi.updateCourse(editingCourse.id, courseData);
      } else {
        // Create new course
        await timetableApi.createCourse(courseData);
      }
      // Refresh courses list
      const [coursesData] = await Promise.all([
        timetableApi.getCourses(),
      ]);
      setCourses(coursesData);
      setIsDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            setEditingCourse(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            <ListChecks className="h-4 w-4 mr-2" />
            All Courses
          </TabsTrigger>
          <TabsTrigger value="by-level">
            <Layers className="h-4 w-4 mr-2" />
            By Academic Level
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>Level {course.level}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <Badge variant={course.is_active ? 'default' : 'secondary'}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCourse(course);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-level">
          <LevelBasedCourseManager 
            courses={courses}
            academicLevels={academicLevels}
            setCourses={setCourses}
            onUpdate={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Course Dialog */}
      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        editingCourse={editingCourse}
      />
    </div>
  );
};