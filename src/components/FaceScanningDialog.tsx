
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Check, X, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FaceScanningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (faceData: string) => void;
  studentName: string;
}

export const FaceScanningDialog = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  studentName 
}: FaceScanningDialogProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Cannot access camera. Please check permissions.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setScanAttempts(prev => prev + 1);
        
        // Stop video stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsScanning(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startScanning();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onComplete(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    // Stop video stream if active
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsScanning(false);
    setCapturedImage(null);
    setScanAttempts(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Face Registration - {studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  {!isScanning && !capturedImage && (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Click below to start face scanning</p>
                        <Button onClick={startScanning}>
                          <Camera className="h-4 w-4 mr-2" />
                          Start Face Scan
                        </Button>
                      </div>
                    </div>
                  )}

                  {isScanning && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover rounded-lg bg-black"
                      />
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                      </div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button onClick={captureImage} size="lg" className="bg-blue-600">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture Photo
                        </Button>
                      </div>
                    </div>
                  )}

                  {capturedImage && (
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        Photo {scanAttempts}
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {capturedImage && (
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={retakePhoto}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake
                    </Button>
                    <Button onClick={confirmPhoto} className="bg-green-600">
                      <Check className="h-4 w-4 mr-2" />
                      Confirm & Save
                    </Button>
                  </div>
                )}

                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Position your face within the frame</p>
                  <p>• Ensure good lighting</p>
                  <p>• Look directly at the camera</p>
                  <p>• Remove glasses if possible</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
