import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ListChecks, Layers, Search, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LevelBasedCourseManager } from './LevelBasedCourseManager';
import { Course, Level } from '@/types/index';
import { djangoApi } from '@/services/djangoApi';
import { CourseDialog } from './CourseDialog';
import { toast } from 'sonner';

export const CourseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesResponse, levelsResponse] = await Promise.all([
        djangoApi.getCourses().catch(() => [] as Course[]),
        djangoApi.getLevels().catch(() => [] as Level[]),
      ]);
      setCourses(coursesResponse ?? []);
      setLevels(levelsResponse ?? []);
      if (!coursesResponse?.length && !levelsResponse?.length) {
        setError('No data available. Please check if the Django backend is running.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to backend: ${message}`);
      setCourses([]);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCourseDeleted = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const handleSubmitCourse = async (courseData: any) => {
    try {
      if (editingCourse) {
        await djangoApi.updateCourse(editingCourse.id, courseData);
        toast.success('Course updated successfully');
      } else {
        await djangoApi.createCourse(courseData);
        toast.success('Course created successfully');
      }
      const refreshedCourses = await djangoApi.getCourses();
      setCourses(refreshedCourses);
      setIsDialogOpen(false);
      setEditingCourse(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to save course: ${message}`);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete course: ${message}`);
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
        <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
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
      <div className="text-sm text-muted-foreground">
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
                <div className="p-8 text-center text-muted-foreground">
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
            academicLevels={levels}
            setCourses={setCourses}
            onUpdate={fetchData}
          />
        </TabsContent>
      </Tabs>

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