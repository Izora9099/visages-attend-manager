// src/config/api.ts - Optimized version with proper intervals

interface ApiEndpoint {
    url: string;
    name: string;
    priority: number;
  }
  
  interface HealthCheckResponse {
    status?: string;
    database?: string;
    storage?: string;
    email?: string;
    face_recognition?: string;
    timestamp?: string;
    version?: string;
  }
  
  class ApiConfiguration {
    private static instance: ApiConfiguration;
    private detectedUrl: string | null = null;
    private isDetecting: boolean = false;
    private detectionPromise: Promise<string> | null = null;
    private lastDetectionTime: number = 0;
    private detectionInterval: number = 15 * 60 * 1000; // ✅ 15 minutes in milliseconds
    private connectionFailures: number = 0;
    private maxFailuresBeforeRedetect: number = 3;
  
    // Define possible Django backend URLs in order of preference
    private readonly possibleEndpoints: ApiEndpoint[] = [
      {
        url: 'http://localhost:8000',
        name: 'Localhost',
        priority: 1
      },
      {
        url: 'http://127.0.0.1:8000',
        name: 'Local IP',
        priority: 2
      },
      {
        url: 'http://192.168.1.111:8000',
        name: 'Network IP (WiFi)',
        priority: 3
      }
    ];
  
    private constructor() {}
  
    public static getInstance(): ApiConfiguration {
      if (!ApiConfiguration.instance) {
        ApiConfiguration.instance = new ApiConfiguration();
      }
      return ApiConfiguration.instance;
    }
  
    /**
     * Check if we should perform detection based on time interval
     */
    private shouldPerformDetection(): boolean {
      const now = Date.now();
      const timeSinceLastDetection = now - this.lastDetectionTime;
      
      // Only detect if:
      // 1. We've never detected before, OR
      // 2. Enough time has passed since last detection, OR
      // 3. We've had multiple connection failures
      return (
        this.lastDetectionTime === 0 || 
        timeSinceLastDetection >= this.detectionInterval ||
        this.connectionFailures >= this.maxFailuresBeforeRedetect
      );
    }
  
    /**
     * Test if Django backend is reachable at a specific URL
     */
    private async testEndpoint(endpoint: ApiEndpoint): Promise<boolean> {
      try {
        console.log(`🔍 Testing Django backend at: ${endpoint.url} (${endpoint.name})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
        const response = await fetch(`${endpoint.url}/api/system/health/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
  
        clearTimeout(timeoutId);
  
        if (response.ok) {
          const data: HealthCheckResponse = await response.json();
          console.log(`✅ Django backend found at: ${endpoint.url} (${endpoint.name})`);
          
          // ✅ Reset failure count on successful connection
          this.connectionFailures = 0;
          return true;
        } else {
          console.log(`❌ Backend responded with status ${response.status} at: ${endpoint.url}`);
          return false;
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log(`⏰ Timeout testing: ${endpoint.url} (${endpoint.name})`);
          } else {
            console.log(`❌ Error testing ${endpoint.url} (${endpoint.name}):`, error.message);
          }
        }
        return false;
      }
    }
  
    /**
     * Detect the best available Django backend URL
     */
    private async detectBackendUrl(): Promise<string> {
      console.log('🚀 Starting Django backend auto-detection...');
      
      // ✅ Update last detection time
      this.lastDetectionTime = Date.now();
      
      // Sort endpoints by priority
      const sortedEndpoints = [...this.possibleEndpoints].sort((a, b) => a.priority - b.priority);
  
      // ✅ Test endpoints sequentially (not in parallel) to reduce load
      for (const endpoint of sortedEndpoints) {
        const isReachable = await this.testEndpoint(endpoint);
        if (isReachable) {
          const detectedUrl = `${endpoint.url}/api`;
          console.log(`🎯 Selected Django backend: ${detectedUrl} (${endpoint.name})`);
          return detectedUrl;
        }
      }
  
      // No endpoints reachable - use fallbacks
      console.warn('⚠️ No Django backend detected, using fallback...');
      
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl) {
        console.log(`🔄 Using environment variable: ${envUrl}`);
        return envUrl;
      }
  
      const fallbackUrl = 'http://localhost:8000/api';
      console.log(`🔄 Using fallback URL: ${fallbackUrl}`);
      return fallbackUrl;
    }
  
    /**
     * Get the detected API base URL (with intelligent caching)
     */
    public async getApiBaseUrl(): Promise<string> {
      // Return cached URL if we have one and don't need to re-detect
      if (this.detectedUrl && !this.shouldPerformDetection()) {
        return this.detectedUrl;
      }
  
      // If detection is already in progress, wait for it
      if (this.isDetecting && this.detectionPromise) {
        return this.detectionPromise;
      }
  
      // Only perform detection if needed
      if (this.shouldPerformDetection()) {
        this.isDetecting = true;
        this.detectionPromise = this.detectBackendUrl();
  
        try {
          this.detectedUrl = await this.detectionPromise;
          return this.detectedUrl;
        } catch (error) {
          console.error('❌ Failed to detect API URL:', error);
          return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        } finally {
          this.isDetecting = false;
        }
      }
  
      // Return existing URL or fallback
      return this.detectedUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    }
  
    /**
     * Report a connection failure (might trigger re-detection)
     */
    public reportConnectionFailure(): void {
      this.connectionFailures++;
      console.log(`⚠️ Connection failure reported (${this.connectionFailures}/${this.maxFailuresBeforeRedetect})`);
      
      if (this.connectionFailures >= this.maxFailuresBeforeRedetect) {
        console.log('🔄 Too many failures, will trigger re-detection on next request');
      }
    }
  
    /**
     * Report a successful connection (resets failure count)
     */
    public reportConnectionSuccess(): void {
      if (this.connectionFailures > 0) {
        console.log('✅ Connection restored, resetting failure count');
        this.connectionFailures = 0;
      }
    }
  
    /**
     * Force re-detection (useful for manual retries)
     */
    public async forceRedetection(): Promise<string> {
      console.log('🔄 Forcing Django backend re-detection...');
      this.detectedUrl = null;
      this.isDetecting = false;
      this.detectionPromise = null;
      this.lastDetectionTime = 0; // ✅ Reset timer to force detection
      this.connectionFailures = 0;
      return this.getApiBaseUrl();
    }
  
    /**
     * Get the currently detected URL without triggering detection
     */
    public getCurrentUrl(): string | null {
      return this.detectedUrl;
    }
  
    /**
     * Check if a specific URL is currently being used
     */
    public isUsingUrl(url: string): boolean {
      return this.detectedUrl === url;
    }
  
    /**
     * Get all possible endpoints for debugging
     */
    public getPossibleEndpoints(): ApiEndpoint[] {
      return [...this.possibleEndpoints];
    }
  
    /**
     * Get detection status for debugging
     */
    public getDetectionStatus() {
      const now = Date.now();
      const timeSinceLastDetection = this.lastDetectionTime > 0 ? now - this.lastDetectionTime : 0;
      const timeUntilNextDetection = Math.max(0, this.detectionInterval - timeSinceLastDetection);
      
      return {
        currentUrl: this.detectedUrl,
        lastDetectionTime: new Date(this.lastDetectionTime).toISOString(),
        timeSinceLastDetection: Math.floor(timeSinceLastDetection / 1000), // seconds
        timeUntilNextDetection: Math.floor(timeUntilNextDetection / 1000), // seconds
        connectionFailures: this.connectionFailures,
        maxFailuresBeforeRedetect: this.maxFailuresBeforeRedetect,
        isDetecting: this.isDetecting,
        shouldDetectNow: this.shouldPerformDetection()
      };
    }
  
    /**
     * Configure detection intervals
     */
    public configureDetection(options: {
      intervalMinutes?: number;
      maxFailures?: number;
    }) {
      if (options.intervalMinutes) {
        this.detectionInterval = options.intervalMinutes * 60 * 1000;
        console.log(`🔧 Detection interval set to ${options.intervalMinutes} minutes`);
      }
      
      if (options.maxFailures) {
        this.maxFailuresBeforeRedetect = options.maxFailures;
        console.log(`🔧 Max failures before re-detection set to ${options.maxFailures}`);
      }
    }
  }
  
  // Export singleton instance
  export const apiConfig = ApiConfiguration.getInstance();
  
  // ✅ Configure for less aggressive detection
  apiConfig.configureDetection({
    intervalMinutes: 15,  // Check every 15 minutes
    maxFailures: 3        // Re-detect after 3 consecutive failures
  });
  
  // Export a function to get the API URL (for easy importing)
  export const getApiBaseUrl = async (): Promise<string> => {
    return apiConfig.getApiBaseUrl();
  };
  
  // Export types for use in other files
  export type { ApiEndpoint, HealthCheckResponse };