
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, BookOpen, Clock } from 'lucide-react';
import { TimetableCreationGrid } from './TimetableCreationGrid';
import { LevelBasedCourseManager } from './LevelBasedCourseManager';
import { timetableApi } from '@/services/timetableApi';
import { Course, TimetableEntry, AcademicLevel } from '@/types/timetable';

export const SuperadminTimetableManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesData, entriesData, levelsData] = await Promise.all([
        timetableApi.getCourses(),
        timetableApi.getTimetableEntries(),
        timetableApi.getAcademicLevels()
      ]);
      
      setCourses(coursesData);
      setTimetableEntries(entriesData);
      setAcademicLevels(levelsData);
    } catch (error) {
      console.error('Failed to fetch timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Levels</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicLevels.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Classes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetableEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Timetable Creation</TabsTrigger>
          <TabsTrigger value="courses">Level-Based Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <TimetableCreationGrid 
            entries={timetableEntries} 
            courses={courses}
            onUpdate={fetchData}
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <LevelBasedCourseManager 
            courses={courses} 
            academicLevels={academicLevels}
            setCourses={setCourses}
            onUpdate={fetchData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
