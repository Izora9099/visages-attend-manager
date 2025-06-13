import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { djangoApi } from "@/services/djangoApi";

interface StudentEditDialogProps {
  student: {
    id: number;
    name: string;
    matric_number: string;
    face_encoding_model: string;
    registered_on: string;
  };
  onClose: () => void;
  onSave: () => void;
}

export const StudentEditDialog = ({ student, onClose, onSave }: StudentEditDialogProps) => {
  const [name, setName] = useState(student.name);
  const [matricNumber, setMatricNumber] = useState(student.matric_number);
  const [model, setModel] = useState(student.face_encoding_model);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      await djangoApi.updateStudent(student.id, {
        name,
        matric_number: matricNumber,
        face_encoding_model: model,
      });
      onSave();  // refresh the parent list
      onClose(); // close the dialog
    } catch (err) {
      console.error("Update failed", err);
      setError("Update failed: " + (err as any).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="bg-white">
    <DialogHeader>
      <DialogTitle>Edit Student</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="matric">Matric Number</Label>
        <Input id="matric" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="model">Encoding Model</Label>
        <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-blue-600 text-white" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

  
  );
};
