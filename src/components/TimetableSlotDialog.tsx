import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Course, TimetableEntry, Room } from '@/types/timetable';
import { timetableApi } from '@/services/timetableApi';

interface TimetableSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { day: number; timeSlot: string };
  existingEntries: TimetableEntry[];
  courses: Course[];
  onUpdate: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableSlotDialog = ({
  isOpen,
  onClose,
  selectedSlot,
  existingEntries,
  courses,
  onUpdate
}: TimetableSlotDialogProps) => {
  const [newEntries, setNewEntries] = useState<{
    courseId: number;
    teacherId: number;
    roomId: number;
  }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    try {
      const roomsData = await timetableApi.getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const addNewEntry = () => {
    setNewEntries([...newEntries, { courseId: 0, teacherId: 0, roomId: 0 }]);
  };

  const updateEntry = (index: number, field: string, value: number) => {
    const updated = [...newEntries];
    updated[index] = { ...updated[index], [field]: value };
    setNewEntries(updated);
  };

  const removeEntry = (index: number) => {
    setNewEntries(newEntries.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save new entries
      for (const entry of newEntries) {
        if (entry.courseId && entry.teacherId && entry.roomId) {
          const course = courses.find(c => c.id === entry.courseId);
          const room = rooms.find(r => r.id === entry.roomId);
          
          if (course && room) {
            await timetableApi.createTimetableEntry({
              course,
              teacher: course.assigned_teacher || { id: entry.teacherId, name: 'Teacher', email: '' },
              timeslot: {
                id: 1,
                day_of_week: selectedSlot.day,
                start_time: selectedSlot.timeSlot,
                end_time: '10:00', // This should be calculated
                duration_minutes: 120
              },
              room,
              academic_year: '2024',
              semester: 'Fall'
            });
          }
        }
      }
      
      onUpdate();
      onClose();
      setNewEntries([]);
    } catch (error) {
      console.error('Failed to save timetable entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCourses = () => {
    const usedCourseIds = existingEntries.map(e => e.course.id);
    return courses.filter(c => !usedCourseIds.includes(c.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Courses - {DAYS[selectedSlot.day]} ({selectedSlot.timeSlot})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Entries */}
          {existingEntries.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Currently Scheduled:</Label>
              <div className="space-y-2 mt-2">
                {existingEntries.map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{entry.course.code} - {entry.course.name}</p>
                        <p className="text-sm text-gray-600">Teacher: {entry.teacher.name}</p>
                        <p className="text-sm text-gray-600">Room: {entry.room.name}</p>
                        <Badge variant="outline" className="mt-1">Level {entry.course.level}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Entries */}
          <div>
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Add New Courses:</Label>
              <Button onClick={addNewEntry} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Course
              </Button>
            </div>

            <div className="space-y-3 mt-2">
              {newEntries.map((entry, index) => (
                <div key={index} className="p-3 border rounded space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div>
                        <Label className="text-xs">Course</Label>
                        <select
                          className="w-full p-2 border rounded text-sm"
                          value={entry.courseId}
                          onChange={(e) => updateEntry(index, 'courseId', Number(e.target.value))}
                        >
                          <option value={0}>Select Course</option>
                          {getAvailableCourses().map(course => (
                            <option key={course.id} value={course.id}>
                              {course.code} - {course.name} (Level {course.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">Room</Label>
                        <select
                          className="w-full p-2 border rounded text-sm"
                          value={entry.roomId}
                          onChange={(e) => updateEntry(index, 'roomId', Number(e.target.value))}
                        >
                          <option value={0}>Select Room</option>
                          {rooms.map(room => (
                            <option key={room.id} value={room.id}>
                              {room.name} ({room.building}) - Cap: {room.capacity}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
