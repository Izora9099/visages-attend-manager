import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Search, Edit } from 'lucide-react';
import { Course, Level } from '@/types/index';
import { CourseDialog } from './CourseDialog';

interface LevelBasedCourseManagerProps {
  courses: Course[];
  academicLevels: Level[];
  setCourses: (courses: Course[]) => void;
  onUpdate: () => void;
}

// The API returns level_name as a numeric string (e.g. "200"), not a code (e.g. "L200").
// This mapping bridges that gap until the serializer is fixed on the backend.
const LEVEL_NAME_TO_CODE: Record<string, string> = {
  '200': 'L200',
  '300': 'L300',
  '400': 'L400',
  '500': 'L500',
};

export const LevelBasedCourseManager = ({
  courses,
  academicLevels,
  onUpdate,
}: LevelBasedCourseManagerProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!selectedLevel && academicLevels.length > 0) {
      setSelectedLevel(academicLevels[0].level_code);
    }
  }, [academicLevels, selectedLevel]);

  const getCoursesForLevel = (levelCode: string): Course[] => {
    const targetName = Object.entries(LEVEL_NAME_TO_CODE).find(([, code]) => code === levelCode)?.[0] ?? '';
    return courses.filter((c) => (c.level_name ?? '') === targetName);
  };

  const filteredCourses = getCoursesForLevel(selectedLevel).filter((course) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      course.course_name.toLowerCase().includes(term) ||
      course.course_code.toLowerCase().includes(term)
    );
  });

  const openCreateDialog = () => { setEditingCourse(null); setIsDialogOpen(true); };
  const openEditDialog = (course: Course) => { setEditingCourse(course); setIsDialogOpen(true); };

  if (academicLevels.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No academic levels found. Please add some academic levels first.</p>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses in this level..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
              <TabsList
                className="grid w-full h-auto p-1"
                style={{ gridTemplateColumns: `repeat(${academicLevels.length}, 1fr)` }}
              >
                {academicLevels.map((level) => (
                  <TabsTrigger
                    key={level.id}
                    value={level.level_code}
                    className="flex flex-col items-center justify-center p-3 h-auto min-h-[60px]"
                  >
                    <span className="font-semibold text-base">{level.level_code}</span>
                    <span className="text-xs mt-1 opacity-80">
                      {getCoursesForLevel(level.level_code).length} courses
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {academicLevels.map((level) => (
                <TabsContent key={level.id} value={level.level_code} className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{level.level_name}</h3>
                      <p className="text-sm text-muted-foreground">{level.level_code}</p>
                      {level.description && (
                        <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm">
                        {getCoursesForLevel(level.level_code).length} courses
                      </Badge>
                      <Button
                        onClick={openCreateDialog}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </div>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-12 bg-secondary/40 rounded-lg border-2 border-dashed border-border">
                      <BookOpen className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'No courses match your search' : 'No courses in this level'}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        {searchTerm
                          ? 'Try adjusting your search terms to find courses'
                          : `Start building your curriculum by adding courses to ${level.level_name}`}
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={openCreateDialog}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add First Course
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredCourses.map((course) => (
                        <Card
                          key={course.id}
                          className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-600"
                        >
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-foreground">
                                    {course.course_code}
                                  </h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {course.course_name}
                                  </p>
                                </div>
                                <Badge
                                  variant={course.status === 'active' ? 'default' : 'secondary'}
                                  className={`ml-3 ${course.status === 'active' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                >
                                  {course.status}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{course.credits} credits</span>
                                </div>
                                {course.department_name && (
                                  <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    <span className="truncate">{course.department_name}</span>
                                  </div>
                                )}
                              </div>

                              {course.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                                  {course.description}
                                </p>
                              )}

                              {course.teacher_names && course.teacher_names.length > 0 && (
                                <div className="pt-3 border-t border-border">
                                  <p className="text-xs font-medium text-foreground/80 mb-2">Instructors:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {course.teacher_names.slice(0, 2).map((teacher, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
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

                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(course)}
                                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="px-3 text-blue-600 hover:bg-blue-50"
                                >
                                  <Users className="h-4 w-4" />
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

      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingCourse(null); }}
        onSubmit={() => { onUpdate(); setIsDialogOpen(false); setEditingCourse(null); }}
        editingCourse={editingCourse}
      />
    </div>
  );
};
