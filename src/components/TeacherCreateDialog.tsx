
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Business Administration',
  'Economics',
];

interface TeacherCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherData: any) => void;
}

export const TeacherCreateDialog = ({ isOpen, onClose, onSave }: TeacherCreateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    employee_id: '',
    specialization: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.department || !formData.employee_id) {
      setError('Please fill in all required fields');
      return;
    }

    onSave(formData);
    onClose();
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      employee_id: '',
      specialization: '',
    });
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. John Smith"
            />
          </div>

          <div>
            <Label htmlFor="employee_id">Employee ID *</Label>
            <Input
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              placeholder="EMP001"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.smith@university.edu"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 xxx xxx xxxx"
            />
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="Software Engineering, Data Science, etc."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white" onClick={handleSubmit}>
              Create Teacher
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
