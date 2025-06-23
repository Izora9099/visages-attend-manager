
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Play, Pause, Square } from 'lucide-react';
import { SessionInfo } from '@/types/timetable';

interface SessionMonitorProps {
  sessions: SessionInfo[];
}

export const SessionMonitor = ({ sessions }: SessionMonitorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'completed': return <Square className="h-4 w-4" />;
      case 'cancelled': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Session Monitor</h2>
        <Badge variant="outline" className="text-sm">
          {sessions.filter(s => s.status === 'active').length} Active Sessions
        </Badge>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No sessions scheduled at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(session => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{session.course.code}</CardTitle>
                    <p className="text-sm text-gray-600">{session.course.name}</p>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1 capitalize">{session.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium">{session.teacher.name}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{session.start_time} - {session.end_time}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium">
                      {session.attendance_count} / {session.total_enrolled}
                    </span>
                  </div>
                </div>

                {/* Attendance Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Attendance Rate</span>
                    <span>{Math.round((session.attendance_count / session.total_enrolled) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(session.attendance_count / session.total_enrolled) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {session.status === 'active' && (
                    <>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Users className="h-4 w-4 mr-1" />
                        View Attendance
                      </Button>
                      <Button size="sm" variant="destructive">
                        End Session
                      </Button>
                    </>
                  )}
                  
                  {session.status === 'scheduled' && (
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Start Session
                    </Button>
                  )}
                  
                  {session.status === 'completed' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      View Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
