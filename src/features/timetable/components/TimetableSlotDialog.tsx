import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { djangoApi } from '@/services/djangoApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface FlatEntry {
  id: number;
  course_name: string;
  course_code: string;
  teacher_name: string;
  room: string;
  level: string;
}

interface RoomOption {
  id: number;
  name: string;
  building?: string;
  capacity: number;
}

interface NewEntryDraft {
  courseId: number;
  roomId: number;
}

interface TimetableSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { day: number; timeSlot: string };
  existingEntries: FlatEntry[];
  courses: any[];
  onUpdate: () => void;
}

function addTwoHours(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const next = new Date(0, 0, 0, h + 2, m);
  return `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`;
}

export const TimetableSlotDialog = ({
  isOpen,
  onClose,
  selectedSlot,
  existingEntries,
  courses,
  onUpdate,
}: TimetableSlotDialogProps) => {
  const [drafts, setDrafts] = useState<NewEntryDraft[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      djangoApi.getRooms().then(setRooms).catch(console.error);
    }
  }, [isOpen]);

  const handleClose = () => {
    setDrafts([]);
    onClose();
  };

  const addDraft = () => setDrafts((prev) => [...prev, { courseId: 0, roomId: 0 }]);

  const updateDraft = (index: number, field: keyof NewEntryDraft, value: number) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeDraft = (index: number) =>
    setDrafts((prev) => prev.filter((_, i) => i !== index));

  const usedCourseIds = existingEntries.map((e: any) => e.course_id ?? e.id);
  const availableCourses = courses.filter((c) => !usedCourseIds.includes(c.id));

  const handleSave = async () => {
    const valid = drafts.filter((d) => d.courseId && d.roomId);
    if (valid.length === 0) { handleClose(); return; }

    setLoading(true);
    try {
      for (const d of valid) {
        const course = courses.find((c) => c.id === d.courseId);
        const room = rooms.find((r) => r.id === d.roomId);
        if (!course || !room) continue;

        await djangoApi.createTimetableEntry({
          course_id: course.id,
          course_name: course.course_name,
          course_code: course.course_code,
          teacher_name: course.teacher_names?.[0] ?? 'TBA',
          room: room.name,
          day_of_week: DAYS[selectedSlot.day],
          start_time: selectedSlot.timeSlot,
          end_time: addTwoHours(selectedSlot.timeSlot),
          academic_year: '2024/2025',
          semester: '2',
          department: course.department_name ?? '',
          level: course.level_name ?? String(course.level),
        });
      }
      onUpdate();
      handleClose();
    } catch (err) {
      console.error('Failed to save timetable entries:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {DAYS[selectedSlot.day]} — {selectedSlot.timeSlot}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing slots */}
          {existingEntries.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-[10px]">
                Currently scheduled
              </Label>
              {existingEntries.map((entry, i) => (
                <div
                  key={i}
                  className="p-3 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {entry.course_code} — {entry.course_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.teacher_name} · {entry.room}
                      </p>
                      <Badge variant="outline" className="mt-1.5 text-xs">
                        {entry.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new entries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-[10px]">
                Add courses to this slot
              </Label>
              <Button onClick={addDraft} size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Add Course
              </Button>
            </div>

            {drafts.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Click "Add Course" to schedule a class in this slot.
              </p>
            )}

            <div className="space-y-3">
              {drafts.map((draft, i) => (
                <div key={i} className="p-3 border border-border rounded-lg bg-card space-y-3">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <Label className="text-xs mb-1 block">Course</Label>
                      <select
                        className="w-full px-2 py-1.5 text-sm rounded-md border border-border bg-background text-foreground"
                        value={draft.courseId}
                        onChange={(e) => updateDraft(i, 'courseId', Number(e.target.value))}
                      >
                        <option value={0}>Select course…</option>
                        {availableCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.course_code} — {c.course_name} ({c.level_name ?? `Level ${c.level}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs mb-1 block">Room</Label>
                      <select
                        className="w-full px-2 py-1.5 text-sm rounded-md border border-border bg-background text-foreground"
                        value={draft.roomId}
                        onChange={(e) => updateDraft(i, 'roomId', Number(e.target.value))}
                      >
                        <option value={0}>Select room…</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}{r.building ? ` (${r.building})` : ''} — cap {r.capacity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeDraft(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
