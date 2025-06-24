import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimetableEntry } from '@/types/timetable';

interface TimetableViewProps {
  entries: TimetableEntry[];
}

export const TimetableView = ({ entries }: TimetableViewProps) => {
  // Group entries by day of week
  const entriesByDay = entries.reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
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

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No timetable entries found</h3>
        <p className="text-sm text-muted-foreground">
          Create a new schedule to see it appear here
        </p>
      </div>
    );
  }

  return (
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
                        <p className="text-sm text-muted-foreground">
                          {entry.teacher?.name || 'No teacher assigned'}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
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
  );
};
