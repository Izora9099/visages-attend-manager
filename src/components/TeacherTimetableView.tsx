import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, Loader2 } from 'lucide-react';
import { TimetableEntry } from '@/types/timetable';
import { timetableApi } from '@/services/timetableApi';

export const TeacherTimetableView = () => {
  const { user } = useAuth();
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherTimetable = async () => {
      try {
        setIsLoading(true);
        // Assuming we have a method to get timetable entries for a specific teacher
        const entries = await timetableApi.getTimetableEntries({
          teacher_id: user?.id
        });
        setTimetableEntries(entries);
      } catch (err) {
        console.error('Failed to fetch teacher timetable:', err);
        setError('Failed to load timetable data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchTeacherTimetable();
    }
  }, [user?.id]);

  // Group entries by day of week
  const entriesByDay = timetableEntries.reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {});

  // Define the days of the week in order
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Sort entries by start time within each day
  Object.values(entriesByDay).forEach(dayEntries => {
    dayEntries.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading your timetable...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (timetableEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No timetable entries found</h3>
        <p className="text-sm text-muted-foreground">
          You don't have any scheduled classes yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Timetable</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daysOfWeek.map((day) => {
          const dayEntries = entriesByDay[day] || [];
          if (dayEntries.length === 0) return null;

          return (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="bg-gray-50 px-4 py-3 border-b">
                <CardTitle className="text-lg font-medium">{day}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{entry.courseName || 'Unnamed Course'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {entry.classroom} • {entry.courseCode || ''}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {entry.startTime} - {entry.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
