import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Clock, Eye, CalendarPlus } from 'lucide-react';
import { TimetableCreationGrid } from './TimetableCreationGrid';
import { TimetableView } from './TimetableView';
import { SessionMonitor } from './SessionMonitor';
import { timetableApi } from '@/services/timetableApi';
import { Course, TimetableEntry, SessionInfo } from '@/types/timetable';
import { useAuth } from '@/hooks/useAuth';
import { TeacherTimetableView } from './TeacherTimetableView';
import { ROLES } from '@/constants/roles';

export const TimetableManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [currentSessions, setCurrentSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    try {
      const [entriesData] = await Promise.all([
        timetableApi.getTimetableEntries(),
      ]);
      
      setTimetableEntries(entriesData);
    } catch (error) {
      console.error('Failed to fetch timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  // If user is a teacher, show the read-only view
  if (user?.role === ROLES.TEACHER) {
    return <TeacherTimetableView />;
  }

  // For admins and staff, show the full management interface
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">
            <Eye className="h-4 w-4 mr-2" />
            View Timetable
          </TabsTrigger>
          <TabsTrigger value="create">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Create/Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <TimetableView entries={timetableEntries} />
        </TabsContent>
        <TabsContent value="create" className="space-y-4">
          <TimetableCreationGrid onUpdate={fetchTimetableData} />
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Current Sessions</h2>
        <SessionMonitor sessions={currentSessions} />
      </div>
    </div>
  );
};
