// src/components/ConnectionStatus.tsx - Fixed version that works

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  showDetailed?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ showDetailed = false }) => {
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    // Check initial API connection
    checkApiConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsConnected(true);
      checkApiConnection();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setApiStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check API every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkApiConnection = async () => {
    if (!navigator.onLine) {
      setApiStatus('disconnected');
      return;
    }

    try {
      setApiStatus('checking');
      
      // Try to ping the Django backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('http://localhost:8000/api/', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 401) {
        // 401 is fine - it means Django is running but requires auth
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      console.log('API connection check failed:', error);
      setApiStatus('disconnected');
    } finally {
      setLastChecked(new Date());
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-500';
    
    switch (apiStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'checking':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isConnected) return 'Offline';
    
    switch (apiStatus) {
      case 'connected':
        return 'Connected';
      case 'checking':
        return 'Checking...';
      case 'disconnected':
        return 'API Offline';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    if (!isConnected || apiStatus === 'disconnected') {
      return <WifiOff className="h-3 w-3" />;
    }
    
    if (apiStatus === 'checking') {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }
    
    return <Wifi className="h-3 w-3" />;
  };

  if (!showDetailed) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        {apiStatus === 'checking' && (
          <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      
      {showDetailed && (
        <div className="text-xs text-gray-500">
          Last: {lastChecked.toLocaleTimeString()}
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={checkApiConnection}
        disabled={apiStatus === 'checking'}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};