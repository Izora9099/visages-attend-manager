import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { djangoApi } from '@/services/djangoApi';
import { TimetableSlotDialog } from './TimetableSlotDialog';

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
  'Computer Science & Engineering': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  'Electrical & Electronic Engineering': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800',
  'Business Administration': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  'Mathematics & Statistics': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
};
const DEFAULT_COLOR = 'bg-secondary text-foreground border-border';

export const TimetableGrid = ({ department, level }: TimetableGridProps) => {
  const [entries, setEntries] = useState<FlatEntry[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; timeSlot: string }>({
    day: 0,
    timeSlot: '08:00',
  });

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await djangoApi.getTimetableEntries({ department, level });
      setEntries(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await djangoApi.getCourses({});
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  useEffect(() => {
    loadEntries();
    loadCourses();
  }, [department, level]);

  const timeRanges = Array.from(
    new Map(
      entries.map((e) => [`${e.start_time}-${e.end_time}`, { start: e.start_time, end: e.end_time }])
    ).values()
  ).sort((a, b) => a.start.localeCompare(b.start));

  const getSlotEntries = (day: string, start: string): FlatEntry[] =>
    entries.filter((e) => e.day_of_week === day && e.start_time === start);

  const openDialog = (dayIndex: number, timeSlot: string) => {
    setSelectedSlot({ day: dayIndex, timeSlot });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3 text-muted-foreground" />
          <span className="text-muted-foreground">Loading timetable…</span>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No timetable entries for this filter.
              </p>
              <Button onClick={() => openDialog(0, '08:00')} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add First Entry
              </Button>
            </div>
          </CardContent>
        </Card>
        <TimetableSlotDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          selectedSlot={selectedSlot}
          existingEntries={[]}
          courses={courses}
          onUpdate={loadEntries}
        />
      </>
    );
  }

  return (
    <>
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
                <div className="p-3 font-semibold text-center bg-muted rounded-md text-sm">
                  <Clock className="h-4 w-4 mx-auto mb-1" /> Time
                </div>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-3 font-semibold text-center bg-muted rounded-md text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time rows */}
              <div className="space-y-2">
                {timeRanges.map(({ start, end }) => (
                  <div key={`${start}-${end}`} className="grid grid-cols-6 gap-2">
                    {/* Time label */}
                    <div className="p-3 bg-muted/50 rounded-md flex flex-col items-center justify-center text-sm">
                      <div className="font-medium">{start}</div>
                      <div className="text-[10px] text-muted-foreground">to</div>
                      <div className="font-medium">{end}</div>
                    </div>

                    {/* Day cells */}
                    {DAYS.map((day, dayIndex) => {
                      const cell = getSlotEntries(day, start);
                      return (
                        <div
                          key={day}
                          className={cn(
                            'group relative min-h-[100px] p-2 border-2 border-dashed border-border rounded-md transition-colors',
                            cell.length > 0 && 'border-solid border-border/60',
                            'hover:border-accent/40 hover:bg-accent-soft/10 cursor-pointer'
                          )}
                          onClick={() => openDialog(dayIndex, start)}
                        >
                          <div className="space-y-1.5">
                            {cell.map((entry) => (
                              <div
                                key={entry.id}
                                className={cn(
                                  'p-2 rounded-md border text-xs',
                                  DEPT_COLORS[entry.department] ?? DEFAULT_COLOR
                                )}
                              >
                                <div className="font-semibold">{entry.course_code}</div>
                                <div className="mb-1 line-clamp-2 leading-tight">
                                  {entry.course_name}
                                </div>
                                <div className="opacity-70">{entry.teacher_name}</div>
                                <div className="opacity-70">{entry.room}</div>
                                <Badge variant="outline" className="mt-1 text-[10px] h-4 px-1">
                                  {entry.level}
                                </Badge>
                              </div>
                            ))}

                            {/* Empty cell hint */}
                            {cell.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full min-h-[80px] gap-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="h-5 w-5" />
                                <span className="text-[10px]">Add class</span>
                              </div>
                            )}
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
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-muted-foreground mr-1">Departments:</span>
            {Object.entries(DEPT_COLORS).map(([name, cls]) => (
              <Badge key={name} variant="outline" className={cn('text-[10px]', cls)}>
                {name}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {entries.length} scheduled classes across {timeRanges.length} time slots · click any cell to add or view
          </p>
        </CardContent>
      </Card>

      <TimetableSlotDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        selectedSlot={selectedSlot}
        existingEntries={getSlotEntries(DAYS[selectedSlot.day], selectedSlot.timeSlot)}
        courses={courses}
        onUpdate={loadEntries}
      />
    </>
  );
};
