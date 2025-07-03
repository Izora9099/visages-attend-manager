// src/components/CourseManagement.tsx
// Fixed component for managing courses and levels

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
import { BookOpen, Plus, Edit, Trash2, Users, Clock, Calendar, ListChecks, Layers, Search, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LevelBasedCourseManager } from './LevelBasedCourseManager';
// Import correct types and API
import { Course, Level } from '@/types/index'; // Use correct types
import { djangoApi } from '@/services/djangoApi'; // Use real Django API
import { CourseDialog } from './CourseDialog';
import { toast } from 'sonner'; // For notifications

interface CourseManagementProps {
  // Add any props if needed
}

export const CourseManagement: React.FC<CourseManagementProps> = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch courses, levels, and departments from Django backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching courses, levels, and departments from Django API...');
        
        // Use the correct Django API endpoints
        const [coursesResponse, levelsResponse, departmentsResponse] = await Promise.all([
          djangoApi.getCourses().catch(err => {
            console.warn('Failed to fetch courses:', err);
            return [];
          }),
          djangoApi.getLevels().catch(err => {
            console.warn('Failed to fetch levels:', err);
            return [];
          }),
          djangoApi.getDepartments().catch(err => {
            console.warn('Failed to fetch departments:', err);
            return [];
          })
        ]);
        
        console.log('Courses data:', coursesResponse);
        console.log('Levels data:', levelsResponse);
        console.log('Departments data:', departmentsResponse);
        
        setCourses(coursesResponse || []);
        setLevels(levelsResponse || []);
        setDepartments(departmentsResponse || []);
        
        if (!coursesResponse?.length && !levelsResponse?.length && !departmentsResponse?.length) {
          setError('No data available. Please check if the Django backend is running.');
        }
        
      } catch (error: any) {
        console.error('Failed to fetch course data:', error);
        setError(`Failed to connect to backend: ${error.message || 'Unknown error'}`);
        
        // Set empty arrays as fallback
        setCourses([]);
        setLevels([]);
        setDepartments([]);
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

  const handleSubmitCourse = async (courseData: any) => {
    try {
      let savedCourse: Course;
      
      // Log the course data being submitted
      console.log('Submitting course data:', courseData);
      
      if (editingCourse) {
        // Update existing course
        console.log('Updating course:', editingCourse.id, courseData);
        savedCourse = await djangoApi.updateCourse(editingCourse.id, courseData);
        toast.success('Course updated successfully');
      } else {
        // Create new course
        console.log('Creating new course:', courseData);
        savedCourse = await djangoApi.createCourse(courseData);
        toast.success('Course created successfully');
      }
      
      // Refresh the courses list from the backend to get the latest data
      const refreshedCourses = await djangoApi.getCourses();
      setCourses(refreshedCourses);
      
      // Close dialog and reset state
      setIsDialogOpen(false);
      setEditingCourse(null);
      
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(`Failed to save course: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.course_name}"?`)) {
      return;
    }
    
    try {
      await djangoApi.deleteCourse(course.id);
      handleCourseDeleted(course.id);
      toast.success('Course deleted successfully');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(`Failed to delete course: ${error.message || 'Unknown error'}`);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading course data from Django backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
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
          {/* <Button onClick={() => {
            setEditingCourse(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>*/}
         
        </div>
      </div>

      {/* Show data status */}
      <div className="text-sm text-gray-600">
        Found {courses.length} courses and {levels.length} academic levels
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            <ListChecks className="h-4 w-4 mr-2" />
            All Courses ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger value="by-level">
            <Layers className="h-4 w-4 mr-2" />
            By Academic Level
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {filteredCourses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No courses match your search.' : 'No courses found. Add some courses to get started.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_name}</TableCell>
                        <TableCell>{course.department_name || 'N/A'}</TableCell>
                        <TableCell>{course.level_name || `Level ${course.level}`}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(course)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-level">
          <LevelBasedCourseManager 
            courses={courses}
            academicLevels={levels} // Pass the correct levels data
            setCourses={setCourses}
            onUpdate={() => {
              // Refresh data when needed
              window.location.reload();
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Course Dialog - FIXED: Pass levels and departments */}
      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        editingCourse={editingCourse}
        levels={levels}
        departments={departments}
      />
    </div>
  );
};