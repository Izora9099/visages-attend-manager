import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, Clock, Users } from 'lucide-react';
import { CourseManager } from './CourseManager';
import { SessionMonitor } from './SessionMonitor';
import { TimetableGrid } from './TimetableGrid';
import { Course, SessionInfo, TimetableEntry } from '@/types/timetable';
import { Button } from './ui/button';

interface SuperadminTimetableManagerProps {
  children: ReactNode;
  courses?: Course[];
  timetableEntries?: TimetableEntry[];
  currentSessions?: SessionInfo[];
  onCoursesUpdate?: (courses: Course[]) => void;
  onTimetableUpdate?: (entries: TimetableEntry[]) => void;
}

export const SuperadminTimetableManager = ({
  children,
  courses = [],
  timetableEntries = [],
  currentSessions = [],
  onCoursesUpdate,
  onTimetableUpdate
}: SuperadminTimetableManagerProps) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSessions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSessions.reduce((acc, session) => acc + (session.total_enrolled || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="schedule">Schedule View</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Export Schedule
            </Button>
          </div>
        </div>

        <TabsContent value="schedule" className="space-y-4">
          {children || <TimetableGrid entries={timetableEntries} />}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CourseManager 
            courses={courses} 
            onCoursesUpdate={onCoursesUpdate} 
          />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionMonitor 
            sessions={currentSessions} 
            onSessionsUpdate={(sessions) => {
              // Handle session updates if needed
              console.log('Sessions updated:', sessions);
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
