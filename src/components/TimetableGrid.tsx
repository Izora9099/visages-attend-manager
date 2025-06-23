
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimetableEntry } from '@/types/timetable';
import { cn } from '@/lib/utils';

interface TimetableGridProps {
  entries: TimetableEntry[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '8:00 AM - 10:00 AM' },
  { start: '10:30', end: '12:30', label: '10:30 AM - 12:30 PM' },
  { start: '14:00', end: '16:00', label: '2:00 PM - 4:00 PM' },
  { start: '16:30', end: '18:30', label: '4:30 PM - 6:30 PM' },
];

export const TimetableGrid = ({ entries }: TimetableGridProps) => {
  const [selectedCell, setSelectedCell] = useState<{day: number, timeSlot: string} | null>(null);

  const getEntryForSlot = (dayIndex: number, timeSlot: string) => {
    return entries.find(entry => 
      entry.timeslot.day_of_week === dayIndex && 
      entry.timeslot.start_time === timeSlot.split(' - ')[0]
    );
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mathematics': 'bg-green-100 text-green-800 border-green-200',
      'Physics': 'bg-purple-100 text-purple-800 border-purple-200',
      'Chemistry': 'bg-orange-100 text-orange-800 border-orange-200',
      'Biology': 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[800px]">
            {/* Header Row */}
            <div className="p-2 font-semibold text-center bg-gray-50 rounded">Time</div>
            {DAYS.map((day, index) => (
              <div key={day} className="p-2 font-semibold text-center bg-gray-50 rounded">
                {day}
              </div>
            ))}

            {/* Time Slot Rows */}
            {TIME_SLOTS.map((timeSlot) => (
              <>
                {/* Time Label */}
                <div key={`time-${timeSlot.start}`} className="p-2 text-sm text-gray-600 bg-gray-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-medium">{timeSlot.start}</div>
                    <div className="text-xs text-gray-500">{timeSlot.end}</div>
                  </div>
                </div>

                {/* Day Columns */}
                {DAYS.map((day, dayIndex) => {
                  const entry = getEntryForSlot(dayIndex, timeSlot.label);
                  
                  return (
                    <div
                      key={`${day}-${timeSlot.start}`}
                      className={cn(
                        "p-2 min-h-[100px] border-2 border-dashed border-gray-200 rounded cursor-pointer transition-all hover:border-gray-300",
                        selectedCell?.day === dayIndex && selectedCell?.timeSlot === timeSlot.start && "border-blue-500 bg-blue-50",
                        entry && "border-solid"
                      )}
                      onClick={() => setSelectedCell({ day: dayIndex, timeSlot: timeSlot.start })}
                    >
                      {entry ? (
                        <div className={cn(
                          "h-full p-2 rounded border",
                          getDepartmentColor(entry.course.department)
                        )}>
                          <div className="font-semibold text-sm mb-1">
                            {entry.course.code}
                          </div>
                          <div className="text-xs mb-2 line-clamp-2">
                            {entry.course.name}
                          </div>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {entry.teacher.name}
                            </Badge>
                            <div className="text-xs text-gray-600">
                              {entry.room.name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          Click to add
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Departments:</span>
          {['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].map(dept => (
            <Badge key={dept} variant="outline" className={getDepartmentColor(dept)}>
              {dept}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
