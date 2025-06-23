
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowRight, Check } from "lucide-react";
import { FaceScanningDialog } from "./FaceScanningDialog";

interface StudentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: any) => void;
}

export const StudentCreateDialog = ({ isOpen, onClose, onSave }: StudentCreateDialogProps) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Face Scan, 3: Complete
  const [studentData, setStudentData] = useState({
    name: "",
    matric_number: "",
    email: "",
    phone: "",
    address: "",
    level: "100",
    face_encoding: ""
  });
  const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = () => {
    // Validate form
    if (!studentData.name || !studentData.matric_number || !studentData.email) {
      alert("Please fill in all required fields");
      return;
    }
    setStep(2);
    setIsFaceScanOpen(true);
  };

  const handleFaceScanComplete = (faceData: string) => {
    setFaceImage(faceData);
    setStudentData(prev => ({ ...prev, face_encoding: faceData }));
    setIsFaceScanOpen(false);
    setStep(3);
  };

  const handleFinalSave = () => {
    onSave({
      ...studentData,
      registered_on: new Date().toISOString()
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setStudentData({
      name: "",
      matric_number: "",
      email: "",
      phone: "",
      address: "",
      level: "100",
      face_encoding: ""
    });
    setFaceImage(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              Register New Student
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Badge variant={step >= 1 ? "default" : "outline"} className="mr-2">
                  1. Info
                </Badge>
                <ArrowRight className="h-3 w-3 mx-1" />
                <Badge variant={step >= 2 ? "default" : "outline"} className="mr-2">
                  2. Face Scan
                </Badge>
                <ArrowRight className="h-3 w-3 mx-1" />
                <Badge variant={step >= 3 ? "default" : "outline"}>
                  3. Complete
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={studentData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter student's full name"
                  />
                </div>

                <div>
                  <Label htmlFor="matric">Matriculation Number *</Label>
                  <Input
                    id="matric"
                    value={studentData.matric_number}
                    onChange={(e) => handleInputChange("matric_number", e.target.value)}
                    placeholder="e.g., 2024/CS/001"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={studentData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="student@university.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={studentData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+234 123 456 7890"
                  />
                </div>

                <div>
                  <Label htmlFor="level">Academic Level</Label>
                  <select
                    id="level"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={studentData.level}
                    onChange={(e) => handleInputChange("level", e.target.value)}
                  >
                    <option value="100">Level 100</option>
                    <option value="200">Level 200</option>
                    <option value="300">Level 300</option>
                    <option value="400">Level 400</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={studentData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Student's address"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleFormSubmit}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Face Scan
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="text-center py-8">
                <Camera className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Face Scanning Required</h3>
                <p className="text-gray-600 mb-4">
                  Please scan {studentData.name}'s face for attendance recognition
                </p>
                <Button onClick={() => setIsFaceScanOpen(true)} className="bg-blue-600">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Face Scan
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8 space-y-4">
                <Check className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-lg font-medium">Registration Complete!</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Name:</strong> {studentData.name}</p>
                  <p><strong>Matric:</strong> {studentData.matric_number}</p>
                  <p><strong>Level:</strong> {studentData.level}</p>
                  <p><strong>Face Scan:</strong> ✓ Completed</p>
                </div>
                {faceImage && (
                  <div className="flex justify-center">
                    <img 
                      src={faceImage} 
                      alt="Student face" 
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex justify-center space-x-2 pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    Register Another
                  </Button>
                  <Button onClick={handleFinalSave} className="bg-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Save Student
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FaceScanningDialog
        isOpen={isFaceScanOpen}
        onClose={() => setIsFaceScanOpen(false)}
        onComplete={handleFaceScanComplete}
        studentName={studentData.name}
      />
    </>
  );
};
