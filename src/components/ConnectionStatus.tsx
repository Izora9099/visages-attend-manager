// src/components/ConnectionStatus.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  Activity,
} from 'lucide-react';
import { useApiConnection } from '@/hooks/useApiConnection';

interface ConnectionStatusProps {
  showDetailed?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetailed = false, 
  className = '' 
}) => {
  const {
    isConnected,
    currentUrl,
    isDetecting,
    lastChecked,
    connectionHistory,
    reconnect,
    checkConnection,
    forceRedetection,
  } = useApiConnection();

  const [showHistory, setShowHistory] = useState(false);

  const getStatusColor = () => {
    if (isDetecting) return 'text-yellow-500';
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isDetecting) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isDetecting) return 'Detecting...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const formatUrl = (url: string | null) => {
    if (!url) return 'Unknown';
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}:${urlObj.port}`;
    } catch {
      return url;
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  // Simple status indicator for minimal display
  if (!showDetailed) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {currentUrl && (
          <span className="text-xs text-gray-500">
            ({formatUrl(currentUrl)})
          </span>
        )}
      </div>
    );
  }

  // Detailed status panel
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-500" />
            <span>Django Backend Connection</span>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Current URL:</span>
            <p className="font-medium">{formatUrl(currentUrl)}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Checked:</span>
            <p className="font-medium">{formatTime(lastChecked)}</p>
          </div>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && !isDetecting && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              Unable to connect to Django backend. Please check if the server is running.
            </AlertDescription>
          </Alert>
        )}

        {isDetecting && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription className="text-yellow-700">
              Detecting Django backend location...
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Successfully connected to Django backend at {formatUrl(currentUrl)}.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => checkConnection()}
            disabled={isDetecting}
            variant="outline"
            size="sm"
          >
            {isDetecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Check Now
              </>
            )}
          </Button>

          <Button
            onClick={reconnect}
            disabled={isDetecting}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconnect
          </Button>

          <Button
            onClick={forceRedetection}
            disabled={isDetecting}
            variant="outline"
            size="sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Re-detect
          </Button>

          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            size="sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showHistory ? 'Hide' : 'Show'} History
          </Button>
        </div>

        {/* Connection History */}
        {showHistory && connectionHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recent Connection Attempts</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {connectionHistory.map((attempt, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    {attempt.success ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="font-medium">{formatUrl(attempt.url)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">
                      {attempt.timestamp.toLocaleTimeString()}
                    </span>
                    {attempt.error && (
                      <span className="text-red-500 truncate max-w-32" title={attempt.error}>
                        {attempt.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Information */}
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 p-2 bg-gray-100 rounded font-mono">
            <div>Environment: {import.meta.env.MODE}</div>
            <div>VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL || 'not set'}</div>
            <div>Detected URL: {currentUrl || 'none'}</div>
            <div>Auto-detection: Enabled</div>
            <div>Last check: {lastChecked?.toISOString() || 'never'}</div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};