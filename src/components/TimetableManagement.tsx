// src/components/TimetableManagement.tsx
// New component for timetable management with import/export functionality

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Download, Upload, Plus, Edit, Trash2, FileText, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  duration: number; // in minutes
}

interface TimetableEntry {
  id: number;
  course_code: string;
  course_name: string;
  teacher_name: string;
  teacher_id: number;
  level: string;
  day_of_week: string;
  time_slot: TimeSlot;
  room: string;
  capacity: number;
  enrolled_count: number;
  semester: string;
  is_active: boolean;
}

interface TimetableTemplate {
  id: number;
  name: string;
  description: string;
  semester: string;
  created_at: string;
  entries_count: number;
  is_active: boolean;
}

// Dummy data
const dummyTimeSlots: TimeSlot[] = [
  { id: 1, start_time: "08:00", end_time: "10:00", duration: 120 },
  { id: 2, start_time: "10:15", end_time: "12:15", duration: 120 },
  { id: 3, start_time: "13:00", end_time: "15:00", duration: 120 },
  { id: 4, start_time: "15:15", end_time: "17:15", duration: 120 },
];

const dummyTimetableEntries: TimetableEntry[] = [
  {
    id: 1,
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    teacher_name: "Dr. John Smith",
    teacher_id: 1,
    level: "Level 100",
    day_of_week: "Monday",
    time_slot: dummyTimeSlots[0],
    room: "Room A101",
    capacity: 50,
    enrolled_count: 45,
    semester: "Fall 2024",
    is_active: true
  },
  {
    id: 2,
    course_code: "MATH201",
    course_name: "Calculus II",
    teacher_name: "Prof. Sarah Johnson",
    teacher_id: 2,
    level: "Level 200",
    day_of_week: "Monday",
    time_slot: dummyTimeSlots[1],
    room: "Room B205",
    capacity: 40,
    enrolled_count: 38,
    semester: "Fall 2024",
    is_active: true
  },
  {
    id: 3,
    course_code: "ENG301",
    course_name: "Advanced English Composition",
    teacher_name: "Dr. Emily Davis",
    teacher_id: 3,
    level: "Level 300",
    day_of_week: "Tuesday",
    time_slot: dummyTimeSlots[0],
    room: "Room C301",
    capacity: 30,
    enrolled_count: 28,
    semester: "Fall 2024",
    is_active: true
  },
  {
    id: 4,
    course_code: "CS401",
    course_name: "Senior Project",
    teacher_name: "Dr. Michael Brown",
    teacher_id: 4,
    level: "Level 400",
    day_of_week: "Wednesday",
    time_slot: dummyTimeSlots[2],
    room: "Lab D401",
    capacity: 20,
    enrolled_count: 18,
    semester: "Fall 2024",
    is_active: true
  },
  {
    id: 5,
    course_code: "PHYS101",
    course_name: "General Physics I",
    teacher_name: "Dr. Robert Wilson",
    teacher_id: 5,
    level: "Level 100",
    day_of_week: "Thursday",
    time_slot: dummyTimeSlots[1],
    room: "Lab E101",
    capacity: 35,
    enrolled_count: 32,
    semester: "Fall 2024",
    is_active: true
  },
  {
    id: 6,
    course_code: "CHEM201",
    course_name: "Organic Chemistry",
    teacher_name: "Dr. Lisa Anderson",
    teacher_id: 6,
    level: "Level 200",
    day_of_week: "Friday",
    time_slot: dummyTimeSlots[0],
    room: "Lab F201",
    capacity: 25,
    enrolled_count: 23,
    semester: "Fall 2024",
    is_active: true
  }
];

const dummyTemplates: TimetableTemplate[] = [
  {
    id: 1,
    name: "Fall 2024 Standard",
    description: "Standard timetable for Fall 2024 semester",
    semester: "Fall 2024",
    created_at: "2024-01-15",
    entries_count: 45,
    is_active: true
  },
  {
    id: 2,
    name: "Spring 2025 Draft",
    description: "Draft timetable for Spring 2025 semester",
    semester: "Spring 2025",
    created_at: "2024-06-10",
    entries_count: 38,
    is_active: false
  }
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const levels = ["Level 100", "Level 200", "Level 300", "Level 400"];
const rooms = ["Room A101", "Room A102", "Room B205", "Room B206", "Room C301", "Room C302", "Lab D401", "Lab E101", "Lab F201"];

export const TimetableManagement = () => {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(dummyTimetableEntries);
  const [templates, setTemplates] = useState<TimetableTemplate[]>(dummyTemplates);
  const [activeTab, setActiveTab] = useState<'schedule' | 'templates' | 'settings'>('schedule');
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    teacher_name: '',
    level: '',
    day_of_week: '',
    time_slot_id: '',
    room: '',
    capacity: 30,
    semester: 'Fall 2024'
  });

  const filteredEntries = timetableEntries.filter(entry => {
    const dayMatch = selectedDay === "all" || entry.day_of_week === selectedDay;
    const levelMatch = selectedLevel === "all" || entry.level === selectedLevel;
    return dayMatch && levelMatch;
  });

  const getEntriesForDayAndSlot = (day: string, slotId: number) => {
    return timetableEntries.filter(entry => 
      entry.day_of_week === day && entry.time_slot.id === slotId
    );
  };

  const handleCreateEntry = () => {
    const timeSlot = dummyTimeSlots.find(slot => slot.id === parseInt(formData.time_slot_id));
    if (!timeSlot) return;

    const newEntry: TimetableEntry = {
      id: Math.max(...timetableEntries.map(e => e.id)) + 1,
      course_code: formData.course_code,
      course_name: formData.course_name,
      teacher_name: formData.teacher_name,
      teacher_id: Math.floor(Math.random() * 100),
      level: formData.level,
      day_of_week: formData.day_of_week,
      time_slot: timeSlot,
      room: formData.room,
      capacity: formData.capacity,
      enrolled_count: 0,
      semester: formData.semester,
      is_active: true
    };

    setTimetableEntries([...timetableEntries, newEntry]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditEntry = () => {
    if (!selectedEntry) return;

    const timeSlot = dummyTimeSlots.find(slot => slot.id === parseInt(formData.time_slot_id));
    if (!timeSlot) return;

    const updatedEntries = timetableEntries.map(entry =>
      entry.id === selectedEntry.id
        ? {
            ...entry,
            course_code: formData.course_code,
            course_name: formData.course_name,
            teacher_name: formData.teacher_name,
            level: formData.level,
            day_of_week: formData.day_of_week,
            time_slot: timeSlot,
            room: formData.room,
            capacity: formData.capacity,
            semester: formData.semester
          }
        : entry
    );

    setTimetableEntries(updatedEntries);
    setIsEditDialogOpen(false);
    setSelectedEntry(null);
    resetForm();
  };

  const handleDeleteEntry = (entryId: number) => {
    setTimetableEntries(timetableEntries.filter(entry => entry.id !== entryId));
  };

  const resetForm = () => {
    setFormData({
      course_code: '',
      course_name: '',
      teacher_name: '',
      level: '',
      day_of_week: '',
      time_slot_id: '',
      room: '',
      capacity: 30,
      semester: 'Fall 2024'
    });
  };

  const openEditDialog = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setFormData({
      course_code: entry.course_code,
      course_name: entry.course_name,
      teacher_name: entry.teacher_name,
      level: entry.level,
      day_of_week: entry.day_of_week,
      time_slot_id: entry.time_slot.id.toString(),
      room: entry.room,
      capacity: entry.capacity,
      semester: entry.semester
    });
    setIsEditDialogOpen(true);
  };

  const exportTimetable = () => {
    const csvContent = [
      'Course Code,Course Name,Teacher,Level,Day,Start Time,End Time,Room,Capacity,Enrolled',
      ...filteredEntries.map(entry => 
        `${entry.course_code},"${entry.course_name}","${entry.teacher_name}",${entry.level},${entry.day_of_week},${entry.time_slot.start_time},${entry.time_slot.end_time},${entry.room},${entry.capacity},${entry.enrolled_count}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable_${selectedDay}_${selectedLevel}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportTimetable}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Time Slots</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Label>Day:</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Level:</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                List View
              </Button>
            </div>
          </div>

          {viewMode === 'grid' && selectedDay !== 'all' && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedDay} Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummyTimeSlots.map(slot => (
                    <div key={slot.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-sm">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <Badge variant="outline">{slot.duration} mins</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {getEntriesForDayAndSlot(selectedDay, slot.id).map(entry => (
                          <div key={entry.id} className="border rounded p-3 bg-blue-50">
                            <div className="font-medium text-sm">{entry.course_code}</div>
                            <div className="text-xs text-gray-600">{entry.course_name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.teacher_name} • {entry.room}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">{entry.level}</Badge>
                              <div className="text-xs text-gray-500">
                                {entry.enrolled_count}/{entry.capacity}
                              </div>
                            </div>
                            <div className="flex space-x-1 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(entry)}
                                className="h-6 px-2 text-xs"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {getEntriesForDayAndSlot(selectedDay, slot.id).length === 0 && (
                          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center text-gray-500 text-sm">
                            No classes scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === 'grid' && selectedDay === 'all' && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-50">Time</th>
                        {daysOfWeek.map(day => (
                          <th key={day} className="border p-2 bg-gray-50 min-w-32">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dummyTimeSlots.map(slot => (
                        <tr key={slot.id}>
                          <td className="border p-2 font-medium text-sm">
                            {slot.start_time}<br/>-<br/>{slot.end_time}
                          </td>
                          {daysOfWeek.map(day => (
                            <td key={day} className="border p-1 align-top">
                              <div className="space-y-1">
                                {getEntriesForDayAndSlot(day, slot.id)
                                  .filter(entry => selectedLevel === 'all' || entry.level === selectedLevel)
                                  .map(entry => (
                                  <div key={entry.id} className="bg-blue-100 rounded p-1 text-xs">
                                    <div className="font-medium">{entry.course_code}</div>
                                    <div className="text-gray-600">{entry.room}</div>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {entry.level}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.course_code}</div>
                            <div className="text-sm text-gray-500">{entry.course_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{entry.teacher_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.level}</Badge>
                        </TableCell>
                        <TableCell>{entry.day_of_week}</TableCell>
                        <TableCell>
                          {entry.time_slot.start_time} - {entry.time_slot.end_time}
                        </TableCell>
                        <TableCell>{entry.room}</TableCell>
                        <TableCell>
                          <span className={entry.enrolled_count > entry.capacity * 0.8 ? 'text-orange-600' : 'text-green-600'}>
                            {entry.enrolled_count}/{entry.capacity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Timetable Templates</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Draft"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Semester:</span>
                      <span className="font-medium">{template.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entries:</span>
                      <span className="font-medium">{template.entries_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Load
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Slot Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummyTimeSlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div className="text-sm text-gray-500">
                        Duration: {slot.duration} minutes
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Entry Dialog */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Timetable Entry</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course_code">Course Code</Label>
            <Input
              id="course_code"
              value={formData.course_code}
              onChange={(e) => setFormData({...formData, course_code: e.target.value})}
              placeholder="e.g., CS101"
            />
          </div>
          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={formData.course_name}
              onChange={(e) => setFormData({...formData, course_name: e.target.value})}
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div>
            <Label htmlFor="teacher_name">Teacher</Label>
            <Input
              id="teacher_name"
              value={formData.teacher_name}
              onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
              placeholder="Teacher name"
            />
          </div>
          <div>
            <Label htmlFor="day_of_week">Day</Label>
            <Select value={formData.day_of_week} onValueChange={(value) => setFormData({...formData, day_of_week: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="time_slot">Time Slot</Label>
            <Select value={formData.time_slot_id} onValueChange={(value) => setFormData({...formData, time_slot_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {dummyTimeSlots.map(slot => (
                  <SelectItem key={slot.id} value={slot.id.toString()}>
                    {slot.start_time} - {slot.end_time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="room">Room</Label>
            <Select value={formData.room} onValueChange={(value) => setFormData({...formData, room: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              min="1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="semester">Semester</Label>
            <Select value={formData.semester} onValueChange={(value) => setFormData({...formData, semester: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                <SelectItem value="Summer 2025">Summer 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateEntry}>
            Create Entry
          </Button>
        </div>
      </DialogContent>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Timetable Entry</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_course_code">Course Code</Label>
              <Input
                id="edit_course_code"
                value={formData.course_code}
                onChange={(e) => setFormData({...formData, course_code: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_course_name">Course Name</Label>
              <Input
                id="edit_course_name"
                value={formData.course_name}
                onChange={(e) => setFormData({...formData, course_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_teacher_name">Teacher</Label>
              <Input
                id="edit_teacher_name"
                value={formData.teacher_name}
                onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_day_of_week">Day</Label>
              <Select value={formData.day_of_week} onValueChange={(value) => setFormData({...formData, day_of_week: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_time_slot">Time Slot</Label>
              <Select value={formData.time_slot_id} onValueChange={(value) => setFormData({...formData, time_slot_id: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dummyTimeSlots.map(slot => (
                    <SelectItem key={slot.id} value={slot.id.toString()}>
                      {slot.start_time} - {slot.end_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_room">Room</Label>
              <Select value={formData.room} onValueChange={(value) => setFormData({...formData, room: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_capacity">Capacity</Label>
              <Input
                id="edit_capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEntry}>
              Update Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};