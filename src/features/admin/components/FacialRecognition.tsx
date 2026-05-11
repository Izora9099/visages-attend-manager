
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Square, Users, CheckCircle, XCircle, Settings } from "lucide-react";

export const FacialRecognition = () => {
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [recognizedStudents, setRecognizedStudents] = useState([
    { id: 1, name: "Kevin Fondzeyuv", studentId: "CSE/2024/001", confidence: 0.97, time: "09:15:32", status: "Recognized" },
    { id: 2, name: "Laure Biyong", studentId: "CSE/2023/002", confidence: 0.99, time: "09:12:15", status: "Recognized" },
    { id: 3, name: "Unknown Person", studentId: "-", confidence: 0.38, time: "09:10:08", status: "Unknown" },
  ]);

  const toggleRecognition = () => {
    setIsRecognitionActive(!isRecognitionActive);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Facial Recognition System</h1>
        <Button variant="outline">
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
      </div>

      {/* Camera Feed and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera size={20} />
              <span>Live Camera Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-zinc-900 dark:bg-zinc-950 rounded-lg aspect-video flex items-center justify-center">
              {isRecognitionActive ? (
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Recognition Active</p>
                  <p className="text-sm text-gray-300">Scanning for faces...</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <Camera size={64} className="mx-auto mb-4" />
                  <p>Camera Feed Stopped</p>
                  <p className="text-sm">Click start to begin recognition</p>
                </div>
              )}
              
              {/* Recognition overlay */}
              {isRecognitionActive && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black bg-opacity-50 text-white p-2 rounded text-sm">
                    Status: Active | Faces Detected: 2 | Last Update: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={toggleRecognition}
                className={isRecognitionActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isRecognitionActive ? (
                  <>
                    <Square size={16} className="mr-2" />
                    Stop Recognition
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Start Recognition
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recognition Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Recognition Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-sm text-green-600 dark:text-green-400">Successful</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">147</p>
                <p className="text-xs text-green-600 dark:text-green-500">Today</p>
              </div>

              <div className="bg-red-500/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="text-red-500" size={20} />
                  <span className="text-sm text-red-600 dark:text-red-400">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">8</p>
                <p className="text-xs text-red-600 dark:text-red-500">Today</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Recognition Accuracy</span>
                  <span>94.8%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94.8%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing Speed</span>
                  <span>1.2s avg</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">System Health</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Camera Status</span>
                  <Badge className="bg-green-500/15 text-green-600 dark:text-green-400">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span>AI Model</span>
                  <Badge className="bg-green-500/15 text-green-600 dark:text-green-400">Loaded</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Database</span>
                  <Badge className="bg-green-500/15 text-green-600 dark:text-green-400">Connected</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Recognition Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Recognition Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recognizedStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-secondary/40 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/15 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.studentId}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Confidence: {(student.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{student.time}</p>
                  </div>
                  <Badge 
                    className={student.status === 'Recognized' 
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400' 
                      : 'bg-orange-100 text-orange-800'
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
