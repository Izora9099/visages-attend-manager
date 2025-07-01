// src/components/TimetableGrid.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Updated interfaces to match your Django backend
interface TimeSlot {
  id: number;
  day_of_week: number; // 0 = Monday, 4 = Friday
  day_name: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration_minutes: number;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  building?: string;
  floor?: string;
  equipment?: string[];
  is_available: boolean;
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
  level: string;
  department: string;
}

interface Teacher {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

interface TimetableEntry {
  id: number;
  course: Course;
  teacher: Teacher;
  time_slot: TimeSlot;
  room: Room;
  academic_year: string;
  semester: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Updated API service with fallback for missing endpoints
const timetableApi = {
  async getTimetableEntries(filters: Record<string, any> = {}): Promise<TimetableEntry[]> {
    try {
      const token = localStorage.getItem('access_token');
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `http://localhost:8000/api/timetable/entries/?${queryParams}`;
      console.log('🔗 Fetching timetable from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.status === 404) {
        console.warn('⚠️ Timetable API endpoints not found. Using mock data.');
        // Return mock data for demonstration
        return this.getMockTimetableData();
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Timetable data received:', data);
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error('❌ Failed to fetch timetable:', error);
      console.log('🔄 Falling back to mock data');
      return this.getMockTimetableData();
    }
  },

  async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/timetable/timeslots/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.status === 404) {
        console.warn('⚠️ TimeSlots API endpoint not found. Using default slots.');
        return this.getDefaultTimeSlots();
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : this.getDefaultTimeSlots();
      
    } catch (error) {
      console.error('❌ Failed to fetch time slots:', error);
      return this.getDefaultTimeSlots();
    }
  },

  getDefaultTimeSlots(): TimeSlot[] {
    return [
      { id: 1, day_of_week: 0, day_name: 'All Days', start_time: '07:00', end_time: '09:00', duration_minutes: 120 },
      { id: 2, day_of_week: 0, day_name: 'All Days', start_time: '09:30', end_time: '11:30', duration_minutes: 120 },
      { id: 3, day_of_week: 0, day_name: 'All Days', start_time: '12:00', end_time: '14:00', duration_minutes: 120 },
      { id: 4, day_of_week: 0, day_name: 'All Days', start_time: '14:30', end_time: '16:30', duration_minutes: 120 },
      { id: 5, day_of_week: 0, day_name: 'All Days', start_time: '17:00', end_time: '19:00', duration_minutes: 120 },
    ];
  },

  getMockTimetableData(): TimetableEntry[] {
    return [
      {
        id: 1,
        course: {
          id: 1,
          course_code: 'CS201',
          course_name: 'Data Structures & Algorithms',
          credits: 3,
          level: '200',
          department: 'Computer Science'
        },
        teacher: {
          id: 1,
          username: 'john.doe',
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe',
          email: 'john.doe@faceit.edu'
        },
        time_slot: {
          id: 1,
          day_of_week: 0,
          day_name: 'Monday',
          start_time: '07:00',
          end_time: '09:00',
          duration_minutes: 120
        },
        room: {
          id: 1,
          name: 'BGFL',
          capacity: 100,
          building: 'Main Building',
          equipment: ['Projector', 'Sound System'],
          is_available: true
        },
        academic_year: '2024-2025',
        semester: 2,
        is_active: true,
        notes: 'Mock data - run timetable generator script',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        course: {
          id: 2,
          course_code: 'MECH301',
          course_name: 'Fluid Mechanics',
          credits: 3,
          level: '300',
          department: 'Mechanical Engineering'
        },
        teacher: {
          id: 2,
          username: 'jane.smith',
          first_name: 'Jane',
          last_name: 'Smith',
          full_name: 'Jane Smith',
          email: 'jane.smith@faceit.edu'
        },
        time_slot: {
          id: 2,
          day_of_week: 1,
          day_name: 'Tuesday',
          start_time: '09:30',
          end_time: '11:30',
          duration_minutes: 120
        },
        room: {
          id: 2,
          name: 'Hall 1',
          capacity: 80,
          building: 'Academic Block A',
          equipment: ['Projector', 'Whiteboard'],
          is_available: true
        },
        academic_year: '2024-2025',
        semester: 2,
        is_active: true,
        notes: 'Mock data - run timetable generator script',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        course: {
          id: 3,
          course_code: 'ELEC401',
          course_name: 'Power Systems II',
          credits: 3,
          level: '400',
          department: 'Electrical Engineering'
        },
        teacher: {
          id: 3,
          username: 'mike.wilson',
          first_name: 'Mike',
          last_name: 'Wilson',
          full_name: 'Mike Wilson',
          email: 'mike.wilson@faceit.edu'
        },
        time_slot: {
          id: 3,
          day_of_week: 2,
          day_name: 'Wednesday',
          start_time: '12:00',
          end_time: '14:00',
          duration_minutes: 120
        },
        room: {
          id: 3,
          name: 'Hall 2',
          capacity: 80,
          building: 'Academic Block B',
          equipment: ['Projector', 'Lab Equipment'],
          is_available: true
        },
        academic_year: '2024-2025',
        semester: 2,
        is_active: true,
        notes: 'Mock data - run timetable generator script',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
};

interface TimetableGridProps {
  academicYear?: string;
  semester?: number;
  department?: string;
  level?: string;
}

export const TimetableGrid = ({ 
  academicYear = "2024-2025", 
  semester = 2,
  department,
  level 
}: TimetableGridProps) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Days of the week for the grid
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const DAY_INDICES = [0, 1, 2, 3, 4]; // Corresponding to day_of_week values

  // Default time slots if backend doesn't have them
  const defaultTimeSlots = [
    { id: 1, day_of_week: 0, day_name: 'All Days', start_time: '07:00', end_time: '09:00', duration_minutes: 120 },
    { id: 2, day_of_week: 0, day_name: 'All Days', start_time: '09:30', end_time: '11:30', duration_minutes: 120 },
    { id: 3, day_of_week: 0, day_name: 'All Days', start_time: '12:00', end_time: '14:00', duration_minutes: 120 },
    { id: 4, day_of_week: 0, day_name: 'All Days', start_time: '14:30', end_time: '16:30', duration_minutes: 120 },
    { id: 5, day_of_week: 0, day_name: 'All Days', start_time: '17:00', end_time: '19:00', duration_minutes: 120 },
  ];

  useEffect(() => {
    fetchTimetableData();
  }, [academicYear, semester, department, level]);

  const fetchTimetableData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching timetable data...');
      
      // Build filters
      const filters: Record<string, any> = {
        academic_year: academicYear,
        semester: semester
      };
      
      if (department && department !== 'all') filters.department = department;
      if (level && level !== 'all') filters.level = level;

      // Fetch both entries and time slots
      const [entriesData, timeSlotsData] = await Promise.all([
        timetableApi.getTimetableEntries(filters),
        timetableApi.getTimeSlots()
      ]);

      console.log('📅 Entries fetched:', entriesData.length);
      console.log('⏰ Time slots fetched:', timeSlotsData.length);

      setEntries(entriesData);
      setTimeSlots(timeSlotsData.length > 0 ? timeSlotsData : defaultTimeSlots);
      
    } catch (err: any) {
      console.error('❌ Error fetching timetable:', err);
      setError('Failed to load timetable data. Showing mock data instead.');
      
      // Use mock data even on error
      setEntries(timetableApi.getMockTimetableData());
      setTimeSlots(timetableApi.getDefaultTimeSlots());
    } finally {
      setLoading(false);
    }
  };

  // Get unique time periods (ignoring day_of_week for slots)
  const getUniqueTimeSlots = () => {
    const uniqueSlots = new Map();
    timeSlots.forEach(slot => {
      const key = `${slot.start_time}-${slot.end_time}`;
      if (!uniqueSlots.has(key)) {
        uniqueSlots.set(key, slot);
      }
    });
    return Array.from(uniqueSlots.values()).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Get entries for a specific day and time slot
  const getEntriesForSlot = (dayIndex: number, timeSlot: TimeSlot): TimetableEntry[] => {
    return entries.filter(entry => 
      entry.time_slot.day_of_week === dayIndex && 
      entry.time_slot.start_time === timeSlot.start_time
    );
  };

  // Get color based on department
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Computer Science': 'bg-blue-100 text-blue-800 border-blue-200',
      'Computer Engineering': 'bg-green-100 text-green-800 border-green-200',
      'Electrical Engineering': 'bg-purple-100 text-purple-800 border-purple-200',
      'Mechanical Engineering': 'bg-orange-100 text-orange-800 border-orange-200',
      'Civil Engineering': 'bg-pink-100 text-pink-800 border-pink-200',
      'Civil Engineering and Architecture': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[department] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const uniqueTimeSlots = getUniqueTimeSlots();

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

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-2">API Endpoints Not Available</h3>
            <p className="text-sm text-gray-600 mb-4">
              Showing mock data. Run the timetable generator script to populate real data.
            </p>
            <Button onClick={fetchTimetableData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
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
            <h3 className="text-lg font-medium mb-2">No timetable entries found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Run the timetable generator script to create schedule entries
            </p>
            <Button onClick={fetchTimetableData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
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
            <CalendarDays className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{academicYear}</Badge>
            <Badge variant="outline">Semester {semester}</Badge>
            <Button onClick={fetchTimetableData} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Grid Header */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="p-3 font-semibold text-center bg-gray-100 rounded">
                <Clock className="h-4 w-4 mx-auto mb-1" />
                Time
              </div>
              {DAYS.map((day) => (
                <div key={day} className="p-3 font-semibold text-center bg-gray-100 rounded">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="space-y-2">
              {uniqueTimeSlots.map((timeSlot) => (
                <div key={`${timeSlot.start_time}-${timeSlot.end_time}`} className="grid grid-cols-6 gap-2">
                  {/* Time Column */}
                  <div className="p-3 bg-gray-50 rounded flex flex-col items-center justify-center text-sm">
                    <div className="font-medium">{timeSlot.start_time}</div>
                    <div className="text-xs text-gray-500">to</div>
                    <div className="font-medium">{timeSlot.end_time}</div>
                  </div>

                  {/* Day Columns */}
                  {DAY_INDICES.map((dayIndex, idx) => {
                    const dayEntries = getEntriesForSlot(dayIndex, timeSlot);
                    
                    return (
                      <div
                        key={`${DAYS[idx]}-${timeSlot.start_time}`}
                        className={cn(
                          "min-h-[100px] p-2 border-2 border-dashed border-gray-200 rounded transition-all",
                          dayEntries.length > 0 && "border-solid border-gray-300"
                        )}
                      >
                        <div className="space-y-2">
                          {dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className={cn(
                                "p-2 rounded border text-xs",
                                getDepartmentColor(entry.course.department)
                              )}
                            >
                              <div className="font-semibold mb-1">
                                {entry.course.course_code}
                              </div>
                              <div className="text-xs mb-2 line-clamp-2">
                                {entry.course.course_name}
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-600">
                                  {entry.teacher.full_name || `${entry.teacher.first_name} ${entry.teacher.last_name}`}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {entry.room.name}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {entry.course.level}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {dayEntries.length === 0 && (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                              No class
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
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium mr-2">Departments:</span>
            {[
              'Computer Science',
              'Computer Engineering', 
              'Electrical Engineering',
              'Mechanical Engineering',
              'Civil Engineering and Architecture'
            ].map(dept => (
              <Badge key={dept} variant="outline" className={cn("text-xs", getDepartmentColor(dept))}>
                {dept}
              </Badge>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Showing {entries.length} scheduled classes across {uniqueTimeSlots.length} time slots
          </p>
        </div>
      </CardContent>
    </Card>
  );
};