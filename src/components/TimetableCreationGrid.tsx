import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { timetableApi } from '@/services/timetableApi';
import { TimetableEntry } from '@/types/timetable';

interface TimetableCreationGridProps {
  onUpdate: () => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const TimetableCreationGrid = ({ onUpdate }: TimetableCreationGridProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<Partial<TimetableEntry>[]>([]);
  const [newEntry, setNewEntry] = useState<Partial<TimetableEntry>>({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, teachersData, classroomsData] = await Promise.all([
          timetableApi.getCourses(),
          timetableApi.getTeachers(),
          timetableApi.getClassrooms()
        ]);
        
        setCourses(coursesData);
        setTeachers(teachersData);
        setClassrooms(classroomsData);
        
        // Load existing entries
        const entriesData = await timetableApi.getTimetableEntries();
        setEntries(entriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddEntry = () => {
    setEntries([...entries, newEntry]);
    setNewEntry({
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00'
    });
  };

  const handleUpdateEntry = (index: number, field: string, value: any) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Here you would typically send the entries to your API
      // For now, we'll just log them
      console.log('Saving entries:', entries);
      
      // Call the onUpdate callback to refresh the parent component
      onUpdate();
    } catch (error) {
      console.error('Failed to save timetable:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Timetable Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Course</Label>
              <Select 
                value={newEntry.courseId as string || ''}
                onValueChange={(value) => setNewEntry({...newEntry, courseId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Teacher</Label>
              <Select
                value={newEntry.teacherId as string || ''}
                onValueChange={(value) => setNewEntry({...newEntry, teacherId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Day</Label>
              <Select
                value={newEntry.dayOfWeek || 'Monday'}
                onValueChange={(value) => setNewEntry({...newEntry, dayOfWeek: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label>Start Time</Label>
                <Input 
                  type="time" 
                  value={newEntry.startTime}
                  onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <Label>End Time</Label>
                <Input 
                  type="time" 
                  value={newEntry.endTime}
                  onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={handleAddEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Timetable Entries</h3>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
        
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No timetable entries yet. Add one above to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-sm font-medium">
                          {courses.find(c => c.id === entry.courseId)?.name || 'No course selected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {classrooms.find(c => c.id === entry.classroomId)?.name || 'No classroom'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          {teachers.find(t => t.id === entry.teacherId)?.name || 'No teacher'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">{entry.dayOfWeek}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.startTime} - {entry.endTime}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEntry(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
