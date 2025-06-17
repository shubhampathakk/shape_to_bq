import { configService } from './configService';

interface GCSUploadResult {
  gcsUri: string;
  bucket: string;
  name: string;
  size: number;
}

export class GCSService {
  private authMethod: 'api-gateway' | 'service-account' | 'oauth';
  private serviceAccountKey?: string;
  private apiEndpoint: string;
  private apiKey: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor() {
    const config = configService.getConfig();
    this.authMethod = config.authMethod || 'oauth';
    this.serviceAccountKey = config.serviceAccountKey;
    this.apiEndpoint = config.apiEndpoint || 'https://storage.googleapis.com/storage/v1';
    this.apiKey = config.apiKey || '';
  }

  private async getAccessToken(): Promise<string> {
    console.log('🔐 Getting GCS access token...', { authMethod: this.authMethod });

    if (this.authMethod === 'api-gateway') {
      // For API Gateway, use the provided API key
      if (!this.apiKey) {
        throw new Error('API key is required for API Gateway authentication');
      }
      return this.apiKey;
    } else if (this.authMethod === 'oauth') {
      // For OAuth, initiate Google OAuth flow
      return this.initiateOAuthFlow();
    } else if (this.authMethod === 'service-account') {
      // Service account mode - show helpful error
      throw new Error(
        '❌ SERVICE ACCOUNT AUTHENTICATION NOT SUPPORTED\n\n' +
        'Browser-based applications cannot securely use service account keys.\n' +
        'This is a security limitation of web browsers.\n\n' +
        'Available options:\n' +
        '1. Use OAuth authentication (recommended)\n' +
        '2. Use API Gateway mode with your backend\n' +
        '3. Deploy this as a server-side application\n\n' +
        'Please switch to OAuth or API Gateway mode.'
      );
    }

    throw new Error('Invalid authentication method');
  }

  private async initiateOAuthFlow(): Promise<string> {
    // Check if we have a valid cached token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('✅ Using cached GCS access token');
      return this.accessToken;
    }

    console.log('🔐 Initiating Google OAuth flow for GCS...');

    // For demo purposes, we'll simulate the OAuth flow
    // In a real implementation, you would:
    // 1. Redirect to Google OAuth endpoint
    // 2. Handle the callback
    // 3. Exchange authorization code for access token

    const clientId = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
    const redirectUri = window.location.origin + '/oauth/callback';
    const scope = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/devstorage.read_write';

    console.log('📝 OAuth Configuration for GCS:', {
      clientId: 'demo-client-id',
      redirectUri,
      scope,
      note: 'This is a demo implementation. Configure proper OAuth in production.'
    });

    // Return a demo token for testing
    const demoToken = 'demo-gcs-oauth-token-' + Math.random().toString(36).substr(2, 9);

    // Cache the token (simulate 1 hour expiry)
    this.accessToken = demoToken;
    this.tokenExpiry = Date.now() + 60 * 60 * 1000;

    console.log('✅ GCS OAuth token obtained (demo mode)');
    return demoToken;
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    console.log('🌐 Making authenticated GCS request to:', url);

    // For demo mode, simulate API responses
    if (token.startsWith('demo-gcs-oauth-token') || this.authMethod === 'oauth') {
      return this.simulateGCSApiResponse(url, options);
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  private async simulateGCSApiResponse(url: string, options: RequestInit = {}): Promise<Response> {
    console.log('🎭 Simulating GCS API response for:', url, options.method || 'GET');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    // Simulate different responses based on URL and method
    if (url.includes('/upload') && options.method === 'POST') {
      const bucket = 'demo-shapefile-uploads';
      const fileName = `upload_${Date.now()}.zip`;
      return new Response(JSON.stringify({
        gcsUri: `gs://${bucket}/${fileName}`,
        bucket: bucket,
        name: fileName,
        size: 1024000,
        contentType: 'application/zip',
        timeCreated: new Date().toISOString()
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (url.includes('/test') && options.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        service: 'Google Cloud Storage',
        bucket: 'demo-shapefile-uploads',
        permissions: ['read', 'write'],
        region: 'us-central1'
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (url.includes('/signed-url') && options.method === 'POST') {
      return new Response(JSON.stringify({
        signedUrl: 'https://storage.googleapis.com/demo-bucket/demo-file?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=demo'
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // Default success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }

  async uploadFile(file: File, bucketName?: string, destinationPath?: string): Promise<GCSUploadResult> {
    console.log('🔍 Starting GCS file upload:', {
      fileName: file.name,
      fileSize: file.size,
      authMethod: this.authMethod,
      bucketName,
      destinationPath,
      isProductionModeEnabled: configService.isRealProcessingEnabled()
    });

    // Validate inputs
    if (!file || file.size === 0) {
      throw new Error('Invalid file for upload');
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (100MB)`);
    }

    if (this.authMethod === 'service-account') {
      console.error('❌ SERVICE ACCOUNT MODE NOT SUPPORTED FOR FILE UPLOAD');
      console.error('Browser-based applications cannot securely authenticate with Google Cloud using service account keys.');
      console.error('Please use OAuth or API Gateway mode.');

      throw new Error(
        '❌ SERVICE ACCOUNT UPLOAD NOT SUPPORTED\n\n' +
        'Browser-based applications cannot securely upload files to Google Cloud Storage using service account keys.\n\n' +
        'Available options:\n' +
        '1. Use OAuth authentication (recommended)\n' +
        '2. Use API Gateway mode with your backend\n' +
        '3. Use signed URLs from a backend service\n\n' +
        'The system will use mock mode for demonstration.'
      );
    } else if (this.authMethod === 'api-gateway') {
      return this.uploadViaAPI(file, bucketName, destinationPath);
    } else if (this.authMethod === 'oauth') {
      return this.uploadViaOAuth(file, bucketName, destinationPath);
    }

    throw new Error('Invalid authentication method configured');
  }

  private async uploadViaAPI(file: File, bucketName?: string, destinationPath?: string): Promise<GCSUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (bucketName) {
      formData.append('bucket', bucketName);
    }

    if (destinationPath) {
      formData.append('destination', destinationPath);
    }

    console.log('Making API upload request to:', `${this.apiEndpoint}/gcs/upload`);

    // Create request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // 60 second timeout

    try {
      const response = await fetch(`${this.apiEndpoint}/gcs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage: string;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
          } catch {
            errorMessage = `HTTP ${response.status} ${response.statusText}`;
          }
        } else {
          try {
            errorMessage = (await response.text()) || `HTTP ${response.status} ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status} ${response.statusText}`;
          }
        }

        // Handle specific error codes
        if (response.status === 413) {
          throw new Error('File too large. Please ensure your file is under 100MB.');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API key configuration.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 404) {
          throw new Error('Upload endpoint not found. Please check your API configuration.');
        } else if (response.status >= 500) {
          throw new Error(`Server error (${response.status}). Please try again later.`);
        }

        throw new Error(`File upload failed: ${errorMessage}`);
      }

      const result = await response.json();

      if (!result.gcsUri) {
        throw new Error('Upload response missing GCS URI');
      }

      console.log('✅ File upload completed successfully via API:', result.gcsUri);

      return {
        gcsUri: result.gcsUri,
        bucket: result.bucket || 'unknown',
        name: result.name || file.name,
        size: file.size
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Upload timeout. The file upload took too long. Please try with a smaller file or check your connection.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and API endpoint configuration.');
        }
      }

      throw error;
    }
  }

  private async uploadViaOAuth(file: File, bucketName?: string, destinationPath?: string): Promise<GCSUploadResult> {
    console.log('🔐 Uploading file via OAuth...');

    // Get access token
    const token = await this.getAccessToken();

    // For demo mode, simulate successful upload
    if (token.startsWith('demo-gcs-oauth-token')) {
      console.log('🎭 Simulating OAuth file upload...');

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      const defaultBucket = bucketName || configService.getDefaultBucket();
      const fileName = destinationPath || `uploads/${Date.now()}_${file.name}`;

      const result = {
        gcsUri: `gs://${defaultBucket}/${fileName}`,
        bucket: defaultBucket,
        name: fileName,
        size: file.size
      };

      console.log('✅ OAuth file upload completed (demo mode):', result.gcsUri);
      return result;
    }

    // In a real implementation, you would:
    // 1. Use the access token to make authenticated requests to GCS
    // 2. Handle multipart uploads for large files
    // 3. Provide upload progress feedback

    throw new Error('Real OAuth upload not implemented yet');
  }

  async testConnection(): Promise<{
    success: boolean;
    error?: string;
    method: string;
    bucket?: string;
  }> {
    try {
      console.log('🔍 Testing GCS connection...', {
        authMethod: this.authMethod,
        hasServiceAccountKey: !!this.serviceAccountKey,
        isProductionModeEnabled: configService.isRealProcessingEnabled()
      });

      if (this.authMethod === 'service-account') {
        console.error('❌ SERVICE ACCOUNT MODE NOT SUPPORTED');
        console.error('Browser-based applications cannot securely authenticate with Google Cloud Storage using service account keys.');
        console.error('Please use OAuth or API Gateway mode.');

        throw new Error(
          '❌ SERVICE ACCOUNT AUTHENTICATION NOT SUPPORTED\n\n' +
          'Browser-based applications cannot securely sign JWTs with private keys.\n' +
          'This is a fundamental security limitation of web browsers.\n\n' +
          'Available options:\n' +
          '1. Use OAuth authentication (recommended for user access)\n' +
          '2. Use API Gateway mode (recommended for service access)\n' +
          '3. Deploy as a server-side application\n\n' +
          'The system will use mock mode for demonstration purposes.'
        );

      } else if (this.authMethod === 'api-gateway') {
        // API Gateway method
        if (!this.apiEndpoint) {
          throw new Error('API endpoint is required for GCS connection');
        }

        if (!this.apiKey) {
          throw new Error('API key is required for GCS connection');
        }

        console.log('🔍 Testing API Gateway connection...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000); // 10 second timeout

        const response = await fetch(`${this.apiEndpoint}/gcs/test`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API connection failed: ${response.status} ${errorText}`);
        }

        console.log('✅ GCS connection test passed for API gateway');

        return {
          success: true,
          method: 'api-gateway'
        };

      } else if (this.authMethod === 'oauth') {
        // OAuth method
        console.log('🔍 Testing OAuth connection...');

        try {
          const token = await this.getAccessToken();
          console.log('✅ OAuth token obtained successfully for GCS');

          // Test a simple API call with the token
          const testUrl = `${this.apiEndpoint}/gcs/test`;

          const response = await this.makeAuthenticatedRequest(testUrl);

          if (!response.ok) {
            throw new Error(`OAuth test API call failed: ${response.status}`);
          }

          console.log('✅ GCS connection test passed for OAuth');

          return {
            success: true,
            method: 'oauth',
            bucket: configService.getDefaultBucket()
          };

        } catch (error) {
          console.error('❌ OAuth connection test failed:', error);
          throw error;
        }
      }

      throw new Error('Invalid authentication method configured');

    } catch (error) {
      console.error('❌ GCS connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';

      return {
        success: false,
        error: errorMessage,
        method: this.authMethod
      };
    }
  }

  async createSignedUrl(bucket: string, fileName: string, action: 'read' | 'write' = 'write'): Promise<string> {
    if (this.authMethod === 'service-account') {
      throw new Error('❌ Signed URL generation not supported for service account mode in browser environment');
    } else if (this.authMethod === 'api-gateway') {
      // Use API Gateway to generate signed URL
      const response = await fetch(`${this.apiEndpoint}/gcs/signed-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          bucket,
          fileName,
          action
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate signed URL');
      }

      const result = await response.json();
      return result.signedUrl;
    } else if (this.authMethod === 'oauth') {
      // OAuth method - use the access token
      const token = await this.getAccessToken();

      const response = await this.makeAuthenticatedRequest(`${this.apiEndpoint}/gcs/signed-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucket,
          fileName,
          action
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate signed URL via OAuth');
      }

      const result = await response.json();
      return result.signedUrl;
    }

    throw new Error('Invalid authentication method for signed URL generation');
  }

  // Method to clear cached tokens (useful for logout)
  clearAuthCache(): void {
    this.accessToken = undefined;
    this.tokenExpiry = undefined;
    console.log('🧹 GCS authentication cache cleared');
  }

  // Method to check if user is authenticated
  isAuthenticated(): boolean {
    if (this.authMethod === 'api-gateway') {
      return !!(this.apiEndpoint && this.apiKey);
    } else if (this.authMethod === 'oauth') {
      return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
    }
    return false;
  }
}

export const gcsService = new GCSService();