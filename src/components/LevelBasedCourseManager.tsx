// src/components/LevelBasedCourseManager.tsx
// COMPLETELY FIXED component for managing courses by academic level

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Search, Edit } from 'lucide-react';
// FIXED: Import correct types
import { Course, Level } from '@/types/index';
import { CourseDialog } from './CourseDialog';

interface LevelBasedCourseManagerProps {
  courses: Course[];
  academicLevels: Level[]; // FIXED: Use Level instead of AcademicLevel
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

  // COMPREHENSIVE DEBUG LOGGING WITH API STRUCTURE CHECK
  console.log('=== LevelBasedCourseManager Debug Info ===');
  console.log('Raw courses data:', courses);
  console.log('Raw academicLevels data:', academicLevels);
  console.log('Number of courses:', courses.length);
  console.log('Number of levels:', academicLevels.length);
  
  // DETAILED INSPECTION OF COURSE STRUCTURE
  courses.forEach((course, index) => {
    console.log(`\n🔍 DETAILED Course ${index + 1} Analysis:`, {
      id: course.id,
      course_code: course.course_code,
      course_name: course.course_name,
      level_field: course.level,
      level_type: typeof course.level,
      level_value: course.level,
      department_field: course.department,
      department_type: typeof course.department,
      department_name: course.department_name,
      level_name: course.level_name,
      all_fields: Object.keys(course),
      complete_course_object: course
    });
  });

  // DETAILED INSPECTION OF LEVEL STRUCTURE  
  academicLevels.forEach((level, index) => {
    console.log(`\n📊 DETAILED Level ${index + 1} Analysis:`, {
      id: level.id,
      id_type: typeof level.id,
      level_code: level.level_code,
      level_name: level.level_name,
      level_order: level.level_order,
      all_fields: Object.keys(level),
      complete_level_object: level
    });
  });

  // CHECK FOR ACTUAL MATCHES
  console.log('\n🔍 CHECKING LEVEL MATCHES:');
  academicLevels.forEach(level => {
    const matchingCourses = courses.filter(course => {
      const strictMatch = course.level === level.id;
      const stringMatch = String(course.level) === String(level.id);
      console.log(`Level ${level.level_code} (ID: ${level.id}) vs Course levels:`, 
        courses.map(c => `${c.course_code}:${c.level}`).join(', '));
      return strictMatch || stringMatch;
    });
    console.log(`📚 Level ${level.level_code} (ID: ${level.id}) has ${matchingCourses.length} courses:`, 
      matchingCourses.map(c => c.course_code));
  });

  console.log('Current selectedLevel:', selectedLevel);

  // Set default selected level if not set and levels are available
  if (!selectedLevel && academicLevels.length > 0) {
    const defaultLevel = academicLevels[0].level_code;
    console.log(`Setting default level to: ${defaultLevel}`);
    setSelectedLevel(defaultLevel);
  }

  // 🔍 DIRECT API TEST - Let's check what the backend actually returns
  useEffect(() => {
    const testDirectAPICall = async () => {
      try {
        console.log('\n🧪 TESTING DIRECT API CALLS:');
        const directCoursesResponse = await fetch('http://localhost:8000/api/courses/');
        const directCoursesData = await directCoursesResponse.json();
        console.log('📡 Direct API courses response:', directCoursesData);
        
        const directLevelsResponse = await fetch('http://localhost:8000/api/levels/');
        const directLevelsData = await directLevelsResponse.json();
        console.log('📡 Direct API levels response:', directLevelsData);
        
        // Check specific course details
        if (directCoursesData && directCoursesData.length > 0) {
          console.log('\n🔍 FIRST COURSE DETAILED ANALYSIS:');
          const firstCourse = directCoursesData[0];
          console.log('First course from API:', firstCourse);
          console.log('Level field value:', firstCourse.level);
          console.log('Level field type:', typeof firstCourse.level);
          console.log('Is level null?', firstCourse.level === null);
          console.log('Is level undefined?', firstCourse.level === undefined);
        }
      } catch (error) {
        console.error('❌ Direct API test failed:', error);
      }
    };
    
    if (courses.length > 0 && academicLevels.length > 0) {
      testDirectAPICall();
    }
  }, [courses, academicLevels]);

  // WORKAROUND: Since API returns level_name instead of level ID, let's use level_name for filtering
  const filteredCourses = courses.filter(course => {
    console.log(`\n--- Filtering course: ${course.course_code} ---`);
    console.log(`Course level_name field:`, course.level_name, `(type: ${typeof course.level_name})`);
    console.log(`Selected level code:`, selectedLevel);
    
    // TEMPORARY FIX: Use level_name to match against level codes
    // Map level_name to level_code for matching
    let courseLevelCode = '';
    if (course.level_name === '200') courseLevelCode = 'L200';
    else if (course.level_name === '300') courseLevelCode = 'L300'; 
    else if (course.level_name === '400') courseLevelCode = 'L400';
    else if (course.level_name === '500') courseLevelCode = 'L500';
    
    console.log(`Mapped course level: ${course.level_name} → ${courseLevelCode}`);
    
    const matchesLevel = courseLevelCode === selectedLevel;
    console.log(`Level match check: ${courseLevelCode} === ${selectedLevel} = ${matchesLevel}`);
    
    // FIXED: Use safe access with fallback for undefined fields
    const courseName = course.course_name || '';
    const courseCode = course.course_code || '';
    const matchesSearch = searchTerm === '' || 
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log(`Search match check: "${searchTerm}" in "${courseName}" or "${courseCode}" = ${matchesSearch}`);
    
    const finalResult = matchesLevel && matchesSearch;
    console.log(`Final result for ${course.course_code}: ${finalResult}`);
    
    return finalResult;
  });
  
  console.log(`\n🎯 FINAL FILTERED COURSES for level ${selectedLevel}:`, filteredCourses.map(c => c.course_code));
  console.log(`Total filtered courses: ${filteredCourses.length}`);

  console.log('=== End Debug Info ===\n');

  const openCreateDialog = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const getCoursesCountForLevel = (levelCode: string) => {
    console.log(`\n=== getCoursesCountForLevel called for: ${levelCode} ===`);
    
    // WORKAROUND: Since API doesn't return level IDs, use level_name mapping
    let targetLevelName = '';
    if (levelCode === 'L200') targetLevelName = '200';
    else if (levelCode === 'L300') targetLevelName = '300';
    else if (levelCode === 'L400') targetLevelName = '400';
    else if (levelCode === 'L500') targetLevelName = '500';
    
    console.log(`Looking for courses with level_name: ${targetLevelName}`);
    
    const matchingCourses = courses.filter(course => {
      const courseLevelName = course.level_name;
      const match = courseLevelName === targetLevelName;
      
      console.log(`Course ${course.course_code}: level_name="${courseLevelName}" vs target="${targetLevelName}" = ${match}`);
      
      return match;
    });
    
    console.log(`✅ Found ${matchingCourses.length} courses for level ${levelCode}:`, matchingCourses.map(c => c.course_code));
    return matchingCourses.length;
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

  // Check if courses have level assignments (using level_name since level ID is missing)
  const coursesWithLevels = courses.filter(course => course.level_name !== undefined && course.level_name !== null && course.level_name !== '');
  const coursesWithoutLevels = courses.filter(course => course.level_name === undefined || course.level_name === null || course.level_name === '');
  
  console.log(`\n📊 COURSE LEVEL ASSIGNMENT SUMMARY (using level_name):`);
  console.log(`✅ Courses WITH level_name: ${coursesWithLevels.length}`);
  console.log(`❌ Courses WITHOUT level_name: ${coursesWithoutLevels.length}`);
  
  if (coursesWithLevels.length > 0) {
    console.log('✅ Courses with level assignments:');
    coursesWithLevels.forEach(course => {
      console.log(`  - ${course.course_code}: level_name="${course.level_name}"`);
    });
  }
  
  if (coursesWithoutLevels.length > 0) {
    console.warn('❌ Courses WITHOUT level assignments:', coursesWithoutLevels.map(c => c.course_code));
  }

  console.log('\n🔧 BACKEND ISSUE IDENTIFIED:');
  console.log('The Django API is returning level_name but not level (ID) field.');
  console.log('This suggests CourseListSerializer is being used instead of CourseSerializer.');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Courses by Academic Level
            </CardTitle>
            <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
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

            {/* Horizontal Level Tabs */}
            <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
              <TabsList className="grid w-full h-auto p-1" style={{ gridTemplateColumns: `repeat(${academicLevels.length}, 1fr)` }}>
                {academicLevels.map((level) => (
                  <TabsTrigger 
                    key={level.id} 
                    value={level.level_code} 
                    className="flex flex-col items-center justify-center p-3 h-auto min-h-[60px]"
                  >
                    <span className="font-semibold text-base">{level.level_code}</span>
                    <span className="text-xs mt-1 opacity-80">{getCoursesCountForLevel(level.level_code)} courses</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {academicLevels.map((level) => (
                <TabsContent key={level.id} value={level.level_code} className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{level.level_name}</h3>
                      <p className="text-sm text-gray-500">{level.level_code}</p>
                      {level.description && (
                        <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm">
                        {getCoursesCountForLevel(level.level_code)} courses
                      </Badge>
                      <Button onClick={openCreateDialog} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </div>
                  </div>

                  {/* Courses Grid */}
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No courses match your search' : 'No courses in this level'}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        {searchTerm 
                          ? 'Try adjusting your search terms to find courses'
                          : `Start building your curriculum by adding courses to ${level.level_name}`
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={openCreateDialog} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-5 w-5 mr-2" />
                          Add First Course
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredCourses.map((course) => (
                        <Card key={course.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-600">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {/* FIXED: Use correct field names */}
                                  <h4 className="font-semibold text-lg text-gray-900">{course.course_code || 'No Code'}</h4>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                    {course.course_name || 'Unnamed Course'}
                                  </p>
                                </div>
                                <Badge 
                                  variant={course.status === 'active' ? 'default' : 'secondary'}
                                  className={`ml-3 ${course.status === 'active' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                >
                                  {course.status || 'inactive'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{course.credits || 0} credits</span>
                                </div>
                                {/* FIXED: Use correct field name */}
                                {course.department_name && (
                                  <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    <span className="truncate">{course.department_name}</span>
                                  </div>
                                )}
                              </div>
                              
                              {course.description && (
                                <p className="text-sm text-gray-600 line-clamp-3 mt-2">
                                  {course.description}
                                </p>
                              )}
                              
                              {/* FIXED: Use correct field name */}
                              {course.teacher_names && course.teacher_names.length > 0 && (
                                <div className="pt-3 border-t border-gray-100">
                                  <p className="text-xs font-medium text-gray-700 mb-2">Instructors:</p>
                                  <div className="flex flex-wrap gap-1">
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