// src/components/CourseDialog.tsx
// Fixed CourseDialog component to work with Django API types and fetch data from database

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
// FIXED: Import correct types and API
import { Course, Level, Department } from '@/types/index';
import { djangoApi } from '@/services/djangoApi';

interface CourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: any) => void; // Accept any for flexibility
  editingCourse?: Course | null;
}

export const CourseDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCourse
}: CourseDialogProps) => {
  // FIXED: Use correct field names and ensure all values are never undefined
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    description: '',
    department: 0, // Use number for department ID
    level: 0, // Use number for level ID
    semester: 1,
    status: 'active' as const,
    specializations: [] as number[],
    teachers: [] as number[]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  // State for dropdown data fetched from database
  const [levels, setLevels] = useState<Level[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch dropdown data from Django API when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    try {
      setDataLoading(true);
      console.log('🔄 Fetching departments and levels from Django API...');
      
      const [departmentsResponse, levelsResponse] = await Promise.all([
        djangoApi.getDepartments().catch(err => {
          console.warn('Failed to fetch departments:', err);
          return [];
        }),
        djangoApi.getLevels().catch(err => {
          console.warn('Failed to fetch levels:', err);
          return [];
        })
      ]);
      
      console.log('📊 Departments data:', departmentsResponse);
      console.log('📊 Levels data:', levelsResponse);
      
      setDepartments(departmentsResponse || []);
      setLevels(levelsResponse || []);
      
    } catch (error) {
      console.error('❌ Failed to fetch dropdown data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // FIXED: Update form data when editing course changes, with proper null checks
  useEffect(() => {
    if (editingCourse) {
      console.log('📝 Editing course:', editingCourse);
      setFormData({
        course_code: editingCourse.course_code || '',
        course_name: editingCourse.course_name || '',
        credits: editingCourse.credits || 3,
        description: editingCourse.description || '',
        department: editingCourse.department || 0,
        level: editingCourse.level || 0,
        semester: editingCourse.semester || 1,
        status: editingCourse.status || 'active',
        specializations: editingCourse.specializations || [],
        teachers: editingCourse.teachers || []
      });
    } else {
      // Reset form for new course
      console.log('➕ Creating new course');
      setFormData({
        course_code: '',
        course_name: '',
        credits: 3,
        description: '',
        department: 0,
        level: 0,
        semester: 1,
        status: 'active',
        specializations: [],
        teachers: []
      });
    }
    setFormErrors({});
  }, [editingCourse, isOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.course_code.trim()) {
      errors.course_code = 'Course code is required';
    }
    if (!formData.course_name.trim()) {
      errors.course_name = 'Course name is required';
    }
    if (formData.credits < 1 || formData.credits > 10) {
      errors.credits = 'Credits must be between 1 and 10';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.level) {
      errors.level = 'Level is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('💾 Submitting course data:', formData);
      
      // Submit the form data to parent component
      await onSubmit(formData);
      
      // Reset form and close dialog
      setFormData({
        course_code: '',
        course_name: '',
        credits: 3,
        description: '',
        department: 0,
        level: 0,
        semester: 1,
        status: 'active',
        specializations: [],
        teachers: []
      });
      
    } catch (error) {
      console.error('❌ Error submitting course:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Safe update functions that ensure controlled inputs
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ?? (typeof prev[field as keyof typeof prev] === 'number' ? 0 : '')
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading form data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Code and Credits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_code">Course Code *</Label>
                <Input
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => updateField('course_code', e.target.value)}
                  placeholder="e.g., CSC101"
                  className={formErrors.course_code ? 'border-red-500' : ''}
                />
                {formErrors.course_code && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.course_code}</p>
                )}
              </div>
              <div>
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => updateField('credits', parseInt(e.target.value) || 0)}
                  className={formErrors.credits ? 'border-red-500' : ''}
                />
                {formErrors.credits && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.credits}</p>
                )}
              </div>
            </div>

            {/* Course Name */}
            <div>
              <Label htmlFor="course_name">Course Name *</Label>
              <Input
                id="course_name"
                value={formData.course_name}
                onChange={(e) => updateField('course_name', e.target.value)}
                placeholder="e.g., Introduction to Computer Science"
                className={formErrors.course_name ? 'border-red-500' : ''}
              />
              {formErrors.course_name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.course_name}</p>
              )}
            </div>

            {/* Department and Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department.toString()}
                  onValueChange={(value) => updateField('department', parseInt(value) || 0)}
                >
                  <SelectTrigger className={formErrors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.department_name} ({dept.department_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.department && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>
                )}
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(value) => updateField('level', parseInt(value) || 0)}
                >
                  <SelectTrigger className={formErrors.level ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.level_name} ({level.level_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.level && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.level}</p>
                )}
              </div>
            </div>

            {/* Semester and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => updateField('semester', parseInt(value) || 1)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief course description..."
                rows={3}
              />
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 p-3 rounded text-xs">
                <strong>Debug:</strong> Departments: {departments.length}, Levels: {levels.length}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  editingCourse ? 'Update Course' : 'Create Course'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};