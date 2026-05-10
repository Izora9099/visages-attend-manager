import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { djangoApi } from '@/services/djangoApi';

interface FlatEntry {
  id: number;
  course_name: string;
  course_code: string;
  teacher_name: string;
  room: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  department: string;
  level: string;
}

interface TimetableGridProps {
  academicYear?: string;
  semester?: number;
  department?: string;
  level?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DEPT_COLORS: Record<string, string> = {
  'Computer Science & Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
  'Electrical & Electronic Engineering': 'bg-green-100 text-green-800 border-green-200',
  'Business Administration': 'bg-purple-100 text-purple-800 border-purple-200',
  'Mathematics & Statistics': 'bg-orange-100 text-orange-800 border-orange-200',
};
const DEFAULT_COLOR = 'bg-gray-100 text-gray-800 border-gray-200';

export const TimetableGrid = ({ department, level }: TimetableGridProps) => {
  const [entries, setEntries] = useState<FlatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await djangoApi.getTimetableEntries({ department, level });
      setEntries(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, [department, level]);

  // Collect unique time ranges sorted by start time
  const timeRanges = Array.from(
    new Map(entries.map(e => [`${e.start_time}-${e.end_time}`, { start: e.start_time, end: e.end_time }])).values()
  ).sort((a, b) => a.start.localeCompare(b.start));

  const getSlotEntries = (day: string, start: string) =>
    entries.filter(e => e.day_of_week === day && e.start_time === start);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span>Loading timetable...</span>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">No timetable entries found for this filter.</p>
            <Button onClick={loadEntries} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" /> Weekly Timetable
          </CardTitle>
          <Button onClick={loadEntries} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="p-3 font-semibold text-center bg-gray-100 rounded">
                <Clock className="h-4 w-4 mx-auto mb-1" /> Time
              </div>
              {DAYS.map(day => (
                <div key={day} className="p-3 font-semibold text-center bg-gray-100 rounded">{day}</div>
              ))}
            </div>

            {/* Time rows */}
            <div className="space-y-2">
              {timeRanges.map(({ start, end }) => (
                <div key={`${start}-${end}`} className="grid grid-cols-6 gap-2">
                  <div className="p-3 bg-gray-50 rounded flex flex-col items-center justify-center text-sm">
                    <div className="font-medium">{start}</div>
                    <div className="text-xs text-gray-500">to</div>
                    <div className="font-medium">{end}</div>
                  </div>
                  {DAYS.map(day => {
                    const cell = getSlotEntries(day, start);
                    return (
                      <div key={day} className={cn('min-h-[100px] p-2 border-2 border-dashed border-gray-200 rounded', cell.length > 0 && 'border-solid border-gray-300')}>
                        <div className="space-y-2">
                          {cell.map(entry => (
                            <div key={entry.id} className={cn('p-2 rounded border text-xs', DEPT_COLORS[entry.department] ?? DEFAULT_COLOR)}>
                              <div className="font-semibold">{entry.course_code}</div>
                              <div className="mb-1 line-clamp-2">{entry.course_name}</div>
                              <div className="text-gray-600">{entry.teacher_name}</div>
                              <div className="text-gray-600">{entry.room}</div>
                              <Badge variant="outline" className="text-xs mt-1">{entry.level}</Badge>
                            </div>
                          ))}
                          {cell.length === 0 && <div className="flex items-center justify-center h-full text-gray-400 text-xs">No class</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium mr-2">Departments:</span>
          {Object.entries(DEPT_COLORS).map(([name, cls]) => (
            <Badge key={name} variant="outline" className={cn('text-xs', cls)}>{name}</Badge>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">{entries.length} scheduled classes across {timeRanges.length} time slots</p>
      </CardContent>
    </Card>
  );
};
