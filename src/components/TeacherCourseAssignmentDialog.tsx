
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { timetableApi } from '@/services/timetableApi';

interface TeacherCourseAssignmentDialogProps {
  teacher: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherId: number, courses: string[]) => void;
}

export const TeacherCourseAssignmentDialog = ({ 
  teacher, 
  isOpen, 
  onClose, 
  onSave 
}: TeacherCourseAssignmentDialogProps) => {
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(teacher.assigned_courses || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const courses = await timetableApi.getCourses();
      setAvailableCourses(courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseCode: string) => {
    if (selectedCourses.includes(courseCode)) {
      setSelectedCourses(selectedCourses.filter(code => code !== courseCode));
    } else {
      setSelectedCourses([...selectedCourses, courseCode]);
    }
  };

  const handleSave = () => {
    onSave(teacher.id, selectedCourses);
    onClose();
  };

  const handleClose = () => {
    setSelectedCourses(teacher.assigned_courses || []);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Loading courses...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Courses to {teacher.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Select courses to assign to this teacher:
            </p>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              {availableCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-3 py-2">
                  <Checkbox
                    id={course.code}
                    checked={selectedCourses.includes(course.code)}
                    onCheckedChange={() => handleCourseToggle(course.code)}
                  />
                  <div className="flex-1">
                    <label htmlFor={course.code} className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{course.code} - {course.name}</p>
                          <p className="text-sm text-gray-500">
                            {course.department} • {course.credits} credits • Level {course.level}
                          </p>
                        </div>
                        {selectedCourses.includes(course.code) && (
                          <Badge variant="default" className="ml-2">Assigned</Badge>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Currently selected courses ({selectedCourses.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCourses.map((courseCode) => (
                <Badge key={courseCode} variant="outline">
                  {courseCode}
                </Badge>
              ))}
              {selectedCourses.length === 0 && (
                <p className="text-gray-400 text-sm">No courses selected</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white" onClick={handleSave}>
              Save Assignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
