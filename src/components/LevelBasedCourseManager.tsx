
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users } from 'lucide-react';
import { Course, AcademicLevel } from '@/types/timetable';
import { CourseDialog } from './CourseDialog';

interface LevelBasedCourseManagerProps {
  courses: Course[];
  academicLevels: AcademicLevel[];
  setCourses: (courses: Course[]) => void;
  onUpdate: () => void;
}

export const LevelBasedCourseManager = ({ 
  courses, 
  academicLevels, 
  setCourses, 
  onUpdate 
}: LevelBasedCourseManagerProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('100');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter(course => {
    const matchesLevel = course.level === selectedLevel;
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const levelTabs = academicLevels.map(level => level.level_code);

  const openCreateDialog = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Course Management by Academic Level</CardTitle>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
        <TabsList className="grid w-full grid-cols-4">
          {levelTabs.map(level => (
            <TabsTrigger key={level} value={level}>
              Level {level}
            </TabsTrigger>
          ))}
        </TabsList>

        {levelTabs.map(level => (
          <TabsContent key={level} value={level} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.code}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{course.name}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditDialog(course)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{course.department}</Badge>
                        <Badge variant="secondary">{course.credits} Credits</Badge>
                      </div>

                      {course.assigned_teacher && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {course.assigned_teacher.name}
                        </div>
                      )}

                      {course.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map(prereq => (
                              <Badge key={prereq} variant="outline" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Status: {course.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses found for Level {level}.</p>
                  <Button onClick={openCreateDialog} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Course for Level {level}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(courseData) => {
          // Handle course creation/update
          console.log('Course data:', courseData);
          onUpdate();
          setIsDialogOpen(false);
        }}
        editingCourse={editingCourse}
        defaultLevel={selectedLevel}
      />
    </div>
  );
};
