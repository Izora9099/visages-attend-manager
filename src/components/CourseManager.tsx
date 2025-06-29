// src/components/LevelBasedCourseManager.tsx
// Fixed component for managing courses by academic level

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Search } from 'lucide-react';
// Import correct types
import { Course, Level } from '@/types/index';
import { CourseDialog } from './CourseDialog';

interface LevelBasedCourseManagerProps {
  courses: Course[];
  academicLevels: Level[]; // Updated to use Level instead of AcademicLevel
  setCourses: (courses: Course[]) => void;
  onUpdate: () => void;
}

export const LevelBasedCourseManager = ({ 
  courses, 
  academicLevels, 
  setCourses, 
  onUpdate 
}: LevelBasedCourseManagerProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Set default selected level if not set and levels are available
  if (!selectedLevel && academicLevels.length > 0) {
    setSelectedLevel(academicLevels[0].level_code);
  }

  const filteredCourses = courses.filter(course => {
    // Find the level that matches this course
    const courseLevel = academicLevels.find(level => level.id === course.level);
    const matchesLevel = courseLevel?.level_code === selectedLevel;
    
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const openCreateDialog = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const getCoursesCountForLevel = (levelCode: string) => {
    const level = academicLevels.find(l => l.level_code === levelCode);
    if (!level) return 0;
    return courses.filter(course => course.level === level.id).length;
  };

  if (academicLevels.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No academic levels found. Please add some academic levels first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Courses by Academic Level
            </CardTitle>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses in this level..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Level Tabs */}
            <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
              <TabsList className="grid w-full grid-cols-auto">
                {academicLevels.map((level) => (
                  <TabsTrigger key={level.id} value={level.level_code}>
                    {level.level_name} ({getCoursesCountForLevel(level.level_code)})
                  </TabsTrigger>
                ))}
              </TabsList>

              {academicLevels.map((level) => (
                <TabsContent key={level.id} value={level.level_code} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{level.level_name}</h3>
                      {level.description && (
                        <p className="text-sm text-gray-600">{level.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {getCoursesCountForLevel(level.level_code)} courses
                    </Badge>
                  </div>

                  {/* Courses Grid */}
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No courses match your search' : 'No courses in this level'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm 
                          ? 'Try adjusting your search terms'
                          : `Get started by adding courses to ${level.level_name}`
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={openCreateDialog}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Course
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredCourses.map((course) => (
                        <Card key={course.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{course.course_code}</h4>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {course.course_name}
                                  </p>
                                </div>
                                <Badge 
                                  variant={course.status === 'active' ? 'default' : 'secondary'}
                                  className="ml-2"
                                >
                                  {course.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500">
                                <Users className="h-3 w-3 mr-1" />
                                {course.credits} credits
                                {course.department_name && (
                                  <>
                                    <span className="mx-2">•</span>
                                    {course.department_name}
                                  </>
                                )}
                              </div>
                              
                              {course.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                              
                              {course.teacher_names && course.teacher_names.length > 0 && (
                                <div className="pt-2">
                                  <p className="text-xs text-gray-500">Teachers:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {course.teacher_names.slice(0, 2).map((teacher, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {teacher}
                                      </Badge>
                                    ))}
                                    {course.teacher_names.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{course.teacher_names.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex space-x-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(course)}
                                  className="flex-1"
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Course Dialog */}
      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={(courseData) => {
          // Handle submission through parent component
          onUpdate();
          setIsDialogOpen(false);
          setEditingCourse(null);
        }}
        editingCourse={editingCourse}
      />
    </div>
  );
};