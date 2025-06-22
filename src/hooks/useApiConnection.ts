// src/hooks/useApiConnection.ts - Optimized version with longer intervals

import { useState, useEffect, useCallback, useRef } from 'react';
import { djangoApi } from '@/services/djangoApi';
import { apiConfig } from '@/config/api';

interface ApiConnectionState {
  isConnected: boolean;
  currentUrl: string | null;
  isDetecting: boolean;
  lastChecked: Date | null;
  connectionHistory: ConnectionAttempt[];
  detectionStatus: any;
}

interface ConnectionAttempt {
  url: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface UseApiConnectionReturn extends ApiConnectionState {
  reconnect: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  getApiInfo: () => Promise<any>;
  forceRedetection: () => Promise<void>;
}

export const useApiConnection = (autoCheck: boolean = true): UseApiConnectionReturn => {
  const [state, setState] = useState<ApiConnectionState>({
    isConnected: false,
    currentUrl: null,
    isDetecting: false,
    lastChecked: null,
    connectionHistory: [],
    detectionStatus: null,
  });

  // ✅ Much longer intervals - only check every 5 minutes
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes instead of 30 seconds
  const mountedRef = useRef(true);

  // Update state helper
  const updateState = useCallback((updates: Partial<ApiConnectionState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Add connection attempt to history
  const addConnectionAttempt = useCallback((attempt: ConnectionAttempt) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        connectionHistory: [attempt, ...prev.connectionHistory.slice(0, 4)] // Keep only last 5 attempts
      }));
    }
  }, []);

  // ✅ Lightweight connection check - doesn't trigger detection
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!mountedRef.current) return false;

    try {
      updateState({ isDetecting: true });
      
      // ✅ Use a very lightweight check that doesn't trigger re-detection
      const isConnected = await djangoApi.isConnected();
      const currentUrl = apiConfig.getCurrentUrl();
      const detectionStatus = apiConfig.getDetectionStatus();
      
      addConnectionAttempt({
        url: currentUrl || 'unknown',
        timestamp: new Date(),
        success: isConnected,
      });

      updateState({
        isConnected,
        currentUrl,
        lastChecked: new Date(),
        isDetecting: false,
        detectionStatus,
      });

      return isConnected;
    } catch (error) {
      const currentUrl = apiConfig.getCurrentUrl();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      addConnectionAttempt({
        url: currentUrl || 'unknown',
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      });

      updateState({
        isConnected: false,
        lastChecked: new Date(),
        isDetecting: false,
        detectionStatus: apiConfig.getDetectionStatus(),
      });

      console.error('❌ API connection check failed:', error);
      return false;
    }
  }, [addConnectionAttempt, updateState]);

  // Force reconnection
  const reconnect = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    try {
      updateState({ isDetecting: true });
      console.log('🔄 Attempting to reconnect to Django backend...');
      
      await djangoApi.reconnect();
      await checkConnection();
      
      console.log('✅ Reconnection attempt completed');
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
      updateState({ isDetecting: false });
    }
  }, [checkConnection, updateState]);

  // Force re-detection of backend
  const forceRedetection = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    try {
      updateState({ isDetecting: true });
      console.log('🔍 Forcing backend re-detection...');
      
      const newUrl = await apiConfig.forceRedetection();
      
      updateState({
        currentUrl: newUrl,
        isDetecting: false,
        detectionStatus: apiConfig.getDetectionStatus(),
      });
      
      // Check connection with new URL
      await checkConnection();
      
      console.log(`✅ Re-detection completed, using: ${newUrl}`);
    } catch (error) {
      console.error('❌ Re-detection failed:', error);
      updateState({ isDetecting: false });
    }
  }, [checkConnection, updateState]);

  // Get detailed API information
  const getApiInfo = useCallback(async () => {
    try {
      return await djangoApi.getApiInfo();
    } catch (error) {
      console.error('❌ Failed to get API info:', error);
      return null;
    }
  }, []);

  // ✅ Much less aggressive auto-checking
  useEffect(() => {
    if (!autoCheck || !mountedRef.current) return;

    // Initial connection check (but don't be too aggressive)
    const initialCheck = async () => {
      // Wait a bit before first check to let the app settle
      setTimeout(() => {
        if (mountedRef.current) {
          checkConnection();
        }
      }, 2000); // 2 second delay
    };

    initialCheck();

    // ✅ Set up much less frequent checking - every 5 minutes
    checkIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        // Only check if we're not already detecting
        const detectionStatus = apiConfig.getDetectionStatus();
        if (!detectionStatus.isDetecting) {
          checkConnection();
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [autoCheck, checkConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    reconnect,
    checkConnection,
    getApiInfo,
    forceRedetection,
  };
};