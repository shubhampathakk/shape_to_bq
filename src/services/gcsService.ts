import { configService } from './configService';

interface GCSUploadResult {
  gcsUri: string;
  bucket: string;
  name: string;
  size: number;
}

export class GCSService {
  private authMethod: 'api-gateway' | 'service-account';
  private serviceAccountKey?: string;
  private apiEndpoint: string;
  private apiKey: string;

  constructor() {
    const config = configService.getConfig();
    this.authMethod = config.authMethod || 'service-account';
    this.serviceAccountKey = config.serviceAccountKey;
    this.apiEndpoint = config.apiEndpoint || 'https://storage.googleapis.com/storage/v1';
    this.apiKey = config.apiKey || '';
  }

  private async getAccessToken(): Promise<string> {
    if (this.authMethod === 'service-account' && this.serviceAccountKey) {
      try {
        const keyData = JSON.parse(this.serviceAccountKey);

        // Create JWT for Google OAuth
        const now = Math.floor(Date.now() / 1000);
        const payload = {
          iss: keyData.client_email,
          scope: 'https://www.googleapis.com/auth/cloud-platform',
          aud: 'https://oauth2.googleapis.com/token',
          exp: now + 3600,
          iat: now
        };

        // Make OAuth request
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: await this.createJWT(payload, keyData.private_key)
          })
        });

        if (!response.ok) {
          throw new Error(`OAuth failed: ${response.status}`);
        }

        const tokenData = await response.json();
        return tokenData.access_token;
      } catch (error) {
        console.error('Failed to get access token:', error);
        throw new Error('Failed to authenticate with Google Cloud');
      }
    } else {
      return this.apiKey;
    }
  }

  private async createJWT(payload: any, privateKey: string): Promise<string> {
    // This is a simplified JWT creation - in production, use a proper JWT library
    const header = { alg: 'RS256', typ: 'JWT' };

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // For now, return a placeholder - in real implementation, use crypto to sign with privateKey
    return `${encodedHeader}.${encodedPayload}.signature_placeholder`;
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  async uploadFile(file: File, bucketName?: string, destinationPath?: string): Promise<GCSUploadResult> {
    console.log('Starting GCS file upload:', {
      fileName: file.name,
      fileSize: file.size,
      authMethod: this.authMethod,
      bucketName,
      destinationPath
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
      return this.uploadWithServiceAccount(file, bucketName, destinationPath);
    } else {
      return this.uploadViaAPI(file, bucketName, destinationPath);
    }
  }

  private async uploadWithServiceAccount(file: File, bucketName?: string, destinationPath?: string): Promise<GCSUploadResult> {
    if (!this.serviceAccountKey) {
      throw new Error('Service account key is required for GCS upload');
    }

    let keyData;
    try {
      keyData = JSON.parse(this.serviceAccountKey);
    } catch (error) {
      throw new Error('Invalid service account key format. Please ensure it is valid JSON.');
    }

    if (!keyData.project_id || !keyData.private_key || !keyData.client_email) {
      throw new Error('Service account key is missing required fields (project_id, private_key, client_email)');
    }

    // Get the actual bucket name from configuration
    const config = configService.getConfig();
    const bucket = bucketName || config.gcsDefaultBucket || `${keyData.project_id}-shapefile-uploads`;

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = destinationPath || `uploads/${timestamp}-${safeName}`;

    console.log('Service account upload prepared:', {
      bucket,
      fileName,
      projectId: keyData.project_id,
      serviceAccountEmail: keyData.client_email
    });

    try {
      // First, create bucket if it doesn't exist
      await this.createBucketIfNotExists(bucket, keyData.project_id);

      // Upload file using resumable upload
      const uploadUrl = await this.initiateResumableUpload(bucket, fileName, file);
      await this.performResumableUpload(uploadUrl, file);

      const gcsUri = `gs://${bucket}/${fileName}`;
      console.log('File upload completed successfully:', gcsUri);

      return {
        gcsUri,
        bucket,
        name: fileName,
        size: file.size
      };
    } catch (error) {
      console.error('GCS upload failed:', error);
      throw new Error(`GCS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createBucketIfNotExists(bucketName: string, projectId: string): Promise<void> {
    try {
      // Check if bucket exists
      const checkUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}`;
      const checkResponse = await this.makeAuthenticatedRequest(checkUrl);

      if (checkResponse.ok) {
        console.log('Bucket already exists:', bucketName);
        return;
      }

      if (checkResponse.status === 404) {
        console.log('Creating bucket:', bucketName);

        // Create bucket
        const createUrl = `https://storage.googleapis.com/storage/v1/b?project=${projectId}`;
        const createResponse = await this.makeAuthenticatedRequest(createUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: bucketName,
            location: 'US',
            storageClass: 'STANDARD'
          })
        });

        if (!createResponse.ok) {
          const error = await createResponse.text();
          throw new Error(`Failed to create bucket: ${error}`);
        }

        console.log('Bucket created successfully:', bucketName);
      } else {
        throw new Error(`Failed to check bucket: ${checkResponse.status}`);
      }
    } catch (error) {
      console.error('Bucket creation/check failed:', error);
      throw error;
    }
  }

  private async initiateResumableUpload(bucket: string, fileName: string, file: File): Promise<string> {
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=resumable`;

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        contentType: file.type || 'application/octet-stream'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to initiate upload: ${error}`);
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Upload location not provided');
    }

    return location;
  }

  private async performResumableUpload(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': file.size.toString()
      },
      body: file
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }
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

  async testConnection(): Promise<{
    success: boolean;
    error?: string;
    method: string;
    bucket?: string;
  }> {
    try {
      console.log('Testing GCS connection...', {
        authMethod: this.authMethod,
        hasServiceAccountKey: !!this.serviceAccountKey
      });

      if (this.authMethod === 'service-account') {
        if (!this.serviceAccountKey) {
          throw new Error('Service account key is required for GCS connection');
        }

        let keyData;
        try {
          keyData = JSON.parse(this.serviceAccountKey);
        } catch (error) {
          throw new Error('Invalid service account key format. Please ensure it is valid JSON.');
        }

        // Validate required fields
        const requiredFields = ['project_id', 'private_key', 'client_email', 'type'];
        const missingFields = requiredFields.filter((field) => !keyData[field]);

        if (missingFields.length > 0) {
          throw new Error(`Service account key is missing required fields: ${missingFields.join(', ')}`);
        }

        if (keyData.type !== 'service_account') {
          throw new Error('Service account key must be of type "service_account"');
        }

        // Test actual connection by trying to list buckets
        try {
          const url = `https://storage.googleapis.com/storage/v1/b?project=${keyData.project_id}`;
          const response = await this.makeAuthenticatedRequest(url);

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`API call failed: ${response.status} ${error}`);
          }

          console.log('GCS connection test successful - API responded correctly');

          // Get the configured bucket name
          const config = configService.getConfig();
          const bucket = config.gcsDefaultBucket || `${keyData.project_id}-shapefile-uploads`;

          return {
            success: true,
            method: 'service-account',
            bucket: bucket
          };
        } catch (apiError) {
          console.error('API connection test failed:', apiError);
          throw new Error(`Failed to connect to GCS API: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }

      } else {
        // API Gateway method
        if (!this.apiEndpoint) {
          throw new Error('API endpoint is required for GCS connection');
        }

        if (!this.apiKey) {
          throw new Error('API key is required for GCS connection');
        }

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

        console.log('GCS connection test passed for API gateway');

        return {
          success: true,
          method: 'api-gateway'
        };
      }
    } catch (error) {
      console.error('GCS connection test failed:', error);
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
      if (!this.serviceAccountKey) {
        throw new Error('Service account key is required for signed URL generation');
      }

      // Use Google Cloud Storage signed URL API
      const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}/signedURL`;

      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: action === 'write' ? 'PUT' : 'GET',
          expiration: new Date(Date.now() + 3600000).toISOString() // 1 hour
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate signed URL');
      }

      const result = await response.json();
      return result.signedUrl;
    } else {
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
    }
  }
}

export const gcsService = new GCSService();