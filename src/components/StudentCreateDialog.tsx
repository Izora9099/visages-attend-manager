import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowRight, Check, ArrowLeft, AlertCircle, RotateCcw, X, Upload } from "lucide-react";

// Interfaces matching the Students.tsx component
interface Department {
  id: number;
  department_name: string;
  department_code: string;
  is_active: boolean;
}

interface Specialization {
  id: number;
  specialization_name: string;
  specialization_code: string;
  department: number;
  is_active: boolean;
}

interface Level {
  id: number;
  level_name: string;
  level_code: string;
  is_active: boolean;
}

interface StudentFormData {
  first_name: string;
  last_name: string;
  matric_number: string;
  email: string;
  phone: string;
  address: string;
  department: number;
  specialization: number;
  level: number;
  date_of_birth: string;
  gender: string;
  emergency_contact: string;
  emergency_phone: string;
  face_image?: File | null;
  face_encoding_model: string;
}

interface StudentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: StudentFormData & { face_image: File }) => void;
  departments: Department[];
  specializations: Specialization[];
  levels: Level[];
}

export const StudentCreateDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  departments = [], 
  specializations = [], 
  levels = [] 
}: StudentCreateDialogProps) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Face Scan
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: "",
    last_name: "",
    matric_number: "",
    email: "",
    phone: "",
    address: "",
    department: 0,
    specialization: 0,
    level: 0,
    date_of_birth: "",
    gender: "",
    emergency_contact: "",
    emergency_phone: "",
    face_image: null,
    face_encoding_model: "cnn"
  });

  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera when component unmounts or dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Auto-start camera when step 2 is reached
  useEffect(() => {
    if (step === 2 && !capturedImage) {
      setTimeout(() => {
        startCamera();
      }, 500); // Small delay to ensure UI is rendered
    }
  }, [step, capturedImage]);

  const resetForm = () => {
    setStep(1);
    setFormData({
      first_name: "",
      last_name: "",
      matric_number: "",
      email: "",
      phone: "",
      address: "",
      department: 0,
      specialization: 0,
      level: 0,
      date_of_birth: "",
      gender: "",
      emergency_contact: "",
      emergency_phone: "",
      face_image: null,
      face_encoding_model: "cnn"
    });
    setFormErrors({});
    setCapturedImage(null);
    setScanAttempts(0);
    setCameraError("");
    setCameraReady(false);
    stopCamera();
  };

  const validateForm = (): boolean => {
    const errors: Partial<StudentFormData> = {};
    
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.matric_number.trim()) errors.matric_number = "Matriculation number is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.department) errors.department = "Department is required";
    if (!formData.level) errors.level = "Level is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) {
      return;
    }
    setStep(2);
  };

  const handleDepartmentChange = (departmentId: number) => {
    setFormData(prev => ({
      ...prev,
      department: departmentId,
      specialization: 0 // Reset specialization when department changes
    }));
  };

  const getFormSpecializations = () => {
    if (!formData.department) return [];
    return specializations.filter(spec => spec.department === formData.department);
  };

  // Face scanning functions
  const startCamera = async () => {
    try {
      setCameraError("");
      setCameraReady(false);
      setIsScanning(true);
      
      console.log("Requesting camera access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Front camera
        } 
      });
      
      console.log("Camera stream obtained:", stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready and playing
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log("Video playing successfully");
              setCameraReady(true);
            }).catch((playError) => {
              console.error("Error playing video:", playError);
              setCameraError("Unable to start video playback. Please try again.");
            });
          }
        };
        
        // Additional error handling
        videoRef.current.onerror = (error) => {
          console.error("Video element error:", error);
          setCameraError("Video playback error. Please check your camera.");
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsScanning(false);
      if (err.name === 'NotAllowedError') {
        setCameraError("Camera access denied. Please allow camera permissions in your browser and try again.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("No camera found. Please ensure your device has a camera connected.");
      } else if (err.name === 'NotReadableError') {
        setCameraError("Camera is being used by another application. Please close other camera applications and try again.");
      } else {
        setCameraError(`Camera error: ${err.message || "Unknown error occurred"}. Please try again.`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setCameraReady(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert to blob and store
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'face_capture.jpg', { type: 'image/jpeg' });
            setFormData(prev => ({ ...prev, face_image: file }));
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            setScanAttempts(prev => prev + 1);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setFormData(prev => ({ ...prev, face_image: null }));
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, face_image: file }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
          stopCamera(); // Stop camera if file is uploaded
        };
        reader.readAsDataURL(file);
      } else {
        setCameraError("Please select a valid image file");
      }
    }
  };

  const handleFinalSave = () => {
    if (!formData.face_image) {
      setCameraError("Please capture or upload a face image");
      return;
    }

    onSave({
      ...formData,
      face_image: formData.face_image
    });
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackToForm = () => {
    setStep(1);
    stopCamera();
    setCapturedImage(null);
    setScanAttempts(0);
    setCameraError("");
    setCameraReady(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Register New Student
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Badge variant={step >= 1 ? "default" : "outline"} className="mr-2">
                1. Information
              </Badge>
              <ArrowRight className="h-3 w-3 mx-1" />
              <Badge variant={step >= 2 ? "default" : "outline"} className="mr-2">
                2. Face Scan
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className={formErrors.first_name ? 'border-red-500' : ''}
                    placeholder="Enter first name"
                  />
                  {formErrors.first_name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className={formErrors.last_name ? 'border-red-500' : ''}
                    placeholder="Enter last name"
                  />
                  {formErrors.last_name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="matric_number">Matriculation Number *</Label>
                <Input
                  id="matric_number"
                  value={formData.matric_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, matric_number: e.target.value }))}
                  className={formErrors.matric_number ? 'border-red-500' : ''}
                  placeholder="Enter matriculation number"
                />
                {formErrors.matric_number && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.matric_number}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={formErrors.email ? 'border-red-500' : ''}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder="Emergency contact name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_phone">Emergency Phone</Label>
                <Input
                  id="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                  placeholder="Emergency contact phone"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={formData.department.toString()} 
                    onValueChange={(value) => handleDepartmentChange(parseInt(value))}
                  >
                    <SelectTrigger className={formErrors.department ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.department && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select 
                    value={formData.specialization.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: parseInt(value) }))}
                    disabled={!formData.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFormSpecializations().map(spec => (
                        <SelectItem key={spec.id} value={spec.id.toString()}>
                          {spec.specialization_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select 
                    value={formData.level.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}
                  >
                    <SelectTrigger className={formErrors.level ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          {level.level_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.level && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.level}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="face_encoding_model">Face Recognition Model</Label>
                <Select 
                  value={formData.face_encoding_model} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, face_encoding_model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnn">CNN (More Accurate)</SelectItem>
                    <SelectItem value="hog">HOG (Faster)</SelectItem>
                    <SelectItem value="facenet">FaceNet (Experimental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleFormSubmit}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next: Face Scan
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium">
                      Face Registration - {formData.first_name} {formData.last_name}
                    </h3>
                    
                    <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
                      {!capturedImage ? (
                        <div className="relative">
                          {/* Live Camera Feed */}
                          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                          {/* Live Camera Feed */}
                          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                              style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                            />
                            
                            {/* Face Detection Frame Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="relative">
                                {/* Main Face Frame */}
                                <div 
                                  className="border-4 border-blue-400 rounded-full bg-transparent"
                                  style={{ 
                                    width: '200px', 
                                    height: '240px',
                                    borderRadius: '50% 50% 45% 45%' // Oval shape for face
                                  }}
                                >
                                  {/* Corner guides */}
                                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                                  <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                                </div>
                                
                                {/* Center crosshair */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                  <div className="w-4 h-4 border border-blue-300 rounded-full bg-blue-100 opacity-50"></div>
                                </div>
                              </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                              {cameraReady ? (
                                <span className="flex items-center">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                  Camera Ready
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                                  {isScanning ? "Initializing..." : "Starting Camera..."}
                                </span>
                              )}
                            </div>

                            {/* Instructions Overlay */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
                              {cameraReady ? "Position your face within the oval frame" : "Please wait..."}
                            </div>
                          </div>
                          </div>

                          {/* Camera Controls */}
                          <div className="mt-4 flex justify-center space-x-4">
                            {!isScanning ? (
                              <>
                                <Button onClick={startCamera} size="lg" className="bg-blue-600">
                                  <Camera className="h-4 w-4 mr-2" />
                                  Start Camera
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => document.getElementById('face-upload')?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Photo
                                </Button>
                                <input
                                  id="face-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </>
                            ) : (
                              <>
                                <Button 
                                  onClick={capturePhoto} 
                                  size="lg" 
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={!cameraReady}
                                >
                                  <Camera className="h-5 w-5 mr-2" />
                                  {cameraReady ? "Capture Photo" : "Please Wait..."}
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={stopCamera}
                                  size="lg"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Stop Camera
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Captured Image Preview */
                        <div className="relative">
                          <img
                            src={capturedImage}
                            alt="Captured face"
                            className="w-full rounded-lg border-4 border-green-400"
                            style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                          />
                          <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ✓ Photo Captured
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-4 flex justify-center space-x-4">
                            <Button variant="outline" onClick={retakePhoto}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retake Photo
                            </Button>
                            <Button onClick={handleFinalSave} className="bg-green-600 hover:bg-green-700">
                              <Check className="h-4 w-4 mr-2" />
                              Save Student
                            </Button>
                          </div>
                        </div>
                      )}

                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {cameraError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{cameraError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="text-sm text-gray-500 space-y-1 bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-700 mb-2">📷 Photo Guidelines:</p>
                      <p>• Position your face within the oval frame</p>
                      <p>• Ensure good lighting on your face</p>
                      <p>• Look directly at the camera</p>
                      <p>• Keep a neutral expression</p>
                      <p>• Remove glasses if possible for better recognition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBackToForm}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Form
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};