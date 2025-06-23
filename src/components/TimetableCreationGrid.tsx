
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { TimetableEntry, Course } from '@/types/timetable';
import { TimetableSlotDialog } from './TimetableSlotDialog';
import { cn } from '@/lib/utils';

interface TimetableCreationGridProps {
  entries: TimetableEntry[];
  courses: Course[];
  onUpdate: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '8:00 AM - 10:00 AM' },
  { start: '10:30', end: '12:30', label: '10:30 AM - 12:30 PM' },
  { start: '14:00', end: '16:00', label: '2:00 PM - 4:00 PM' },
  { start: '16:30', end: '18:30', label: '4:30 PM - 6:30 PM' },
];

export const TimetableCreationGrid = ({ entries, courses, onUpdate }: TimetableCreationGridProps) => {
  const [selectedSlot, setSelectedSlot] = useState<{day: number, timeSlot: string} | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getEntriesForSlot = (dayIndex: number, timeSlot: string) => {
    return entries.filter(entry => 
      entry.timeslot.day_of_week === dayIndex && 
      entry.timeslot.start_time === timeSlot.split(' - ')[0]
    );
  };

  const handleSlotClick = (dayIndex: number, timeSlot: string) => {
    setSelectedSlot({ day: dayIndex, timeSlot });
    setIsDialogOpen(true);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable - Click any slot to add courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[900px]">
              {/* Header Row */}
              <div className="p-2 font-semibold text-center bg-gray-50 rounded">Time</div>
              {DAYS.map((day) => (
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
                    const slotEntries = getEntriesForSlot(dayIndex, timeSlot.label);
                    
                    return (
                      <div
                        key={`${day}-${timeSlot.start}`}
                        className={cn(
                          "p-2 min-h-[120px] border-2 border-dashed border-gray-200 rounded cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50",
                          slotEntries.length > 0 && "border-solid border-blue-300 bg-blue-50"
                        )}
                        onClick={() => handleSlotClick(dayIndex, timeSlot.start)}
                      >
                        {slotEntries.length > 0 ? (
                          <div className="space-y-2">
                            {slotEntries.map((entry, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "p-2 rounded border text-xs",
                                  getDepartmentColor(entry.course.department)
                                )}
                              >
                                <div className="font-semibold">{entry.course.code}</div>
                                <div className="truncate">{entry.course.name}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {entry.teacher.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {entry.room.name}
                                </div>
                                <Badge variant="outline" className="text-xs mt-1">
                                  Level {entry.course.level}
                                </Badge>
                              </div>
                            ))}
                            <Button size="sm" variant="ghost" className="w-full">
                              <Plus className="h-3 w-3 mr-1" />
                              Add More
                            </Button>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                            <Plus className="h-4 w-4 mb-1" />
                            <span>Add Course</span>
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

      {selectedSlot && (
        <TimetableSlotDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          selectedSlot={selectedSlot}
          existingEntries={getEntriesForSlot(selectedSlot.day, selectedSlot.timeSlot)}
          courses={courses}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};
