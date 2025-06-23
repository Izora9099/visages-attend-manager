
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { djangoApi } from "@/services/djangoApi";

// Mock academic levels data
const ACADEMIC_LEVELS = [
  { id: 1, code: "100", name: "Level 100" },
  { id: 2, code: "200", name: "Level 200" },
  { id: 3, code: "300", name: "Level 300" },
  { id: 4, code: "400", name: "Level 400" },
];

interface StudentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const StudentCreateDialog = ({ isOpen, onClose, onSave }: StudentCreateDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    matric_number: "",
    email: "",
    phone: "",
    academic_level: "",
    face_encoding_model: "dlib",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.matric_number || !formData.academic_level) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await djangoApi.createStudent(formData);
      onSave();
      onClose();
      setFormData({
        name: "",
        matric_number: "",
        email: "",
        phone: "",
        academic_level: "",
        face_encoding_model: "dlib",
      });
      setError("");
    } catch (err) {
      console.error("Create failed", err);
      setError("Failed to create student: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter student's full name"
            />
          </div>

          <div>
            <Label htmlFor="matric">Matriculation Number *</Label>
            <Input
              id="matric"
              value={formData.matric_number}
              onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
              placeholder="e.g., 2024/CS/001"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@university.edu"
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
            <Label htmlFor="level">Academic Level *</Label>
            <Select
              value={formData.academic_level}
              onValueChange={(value) => setFormData({ ...formData, academic_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic level" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {ACADEMIC_LEVELS.map((level) => (
                  <SelectItem key={level.id} value={level.code}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model">Face Encoding Model</Label>
            <Select
              value={formData.face_encoding_model}
              onValueChange={(value) => setFormData({ ...formData, face_encoding_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="dlib">DLib</SelectItem>
                <SelectItem value="facenet">FaceNet</SelectItem>
                <SelectItem value="openface">OpenFace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
