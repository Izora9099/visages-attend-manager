
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Filter } from 'lucide-react';
import { Course } from '@/types/timetable';
import { timetableApi } from '@/services/timetableApi';

interface AttendanceFilterProps {
  onFilterChange: (filters: {
    level: string;
    courseId: number;
    date: string;
    searchTerm: string;
  }) => void;
  userRole: string;
  assignedCourses?: string[]; // For teachers
}

export const AttendanceFilter = ({ 
  onFilterChange, 
  userRole, 
  assignedCourses = [] 
}: AttendanceFilterProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const levels = ['100', '200', '300', '400'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCoursesByLevel();
  }, [selectedLevel, courses, userRole, assignedCourses]);

  useEffect(() => {
    onFilterChange({
      level: selectedLevel,
      courseId: selectedCourseId,
      date: selectedDate,
      searchTerm
    });
  }, [selectedLevel, selectedCourseId, selectedDate, searchTerm]);

  const fetchCourses = async () => {
    try {
      const coursesData = await timetableApi.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const filterCoursesByLevel = () => {
    let filtered = courses;

    // Filter by level if selected
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // For teachers, only show assigned courses
    if (userRole === 'Teacher' && assignedCourses.length > 0) {
      filtered = filtered.filter(course => assignedCourses.includes(course.code));
    }

    setFilteredCourses(filtered);

    // Reset course selection if current course is not in filtered list
    if (selectedCourseId && !filtered.find(c => c.id === selectedCourseId)) {
      setSelectedCourseId(0);
    }
  };

  const clearFilters = () => {
    setSelectedLevel('');
    setSelectedCourseId(0);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSearchTerm('');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Level Filter - Hidden for teachers with single level courses */}
          {(userRole !== 'Teacher' || new Set(courses.filter(c => assignedCourses.includes(c.code)).map(c => c.level)).size > 1) && (
            <div>
              <Label htmlFor="level">Academic Level</Label>
              <select
                id="level"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>
          )}

          {/* Course Filter */}
          <div>
            <Label htmlFor="course">Course</Label>
            <select
              id="course"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            >
              <option value={0}>All Courses</option>
              {filteredCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>

          {/* Search Filter */}
          <div>
            <Label htmlFor="search">Search Student</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Name or matric number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedLevel || selectedCourseId || searchTerm) && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {selectedLevel && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  Level {selectedLevel}
                </span>
              )}
              {selectedCourseId > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {filteredCourses.find(c => c.id === selectedCourseId)?.code}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
