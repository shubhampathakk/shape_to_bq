import { configService } from './configService';
import { authService } from './authService';

interface GCSUploadResult {
  gcsUri: string;
  bucket: string;
  name: string;
  size: number;
}

interface GCSConnectionTestResult {
  success: boolean;
  error?: string;
  method: string;
  bucket?: string;
  permissionDetails?: {
    hasListPermission: boolean;
    hasReadPermission: boolean;
    hasWritePermission: boolean;
    missingPermissions: string[];
  };
}

export class GCSService {
  private baseUrl = 'https://storage.googleapis.com/storage/v1';
  private uploadUrl = 'https://storage.googleapis.com/upload/storage/v1';

  constructor() {
    console.log('🔧 GCSService initialized with OAuth authentication');
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    console.log('🌐 Making authenticated GCS request to:', url.replace(this.baseUrl, ''));

    try {
      return await authService.authenticatedFetch(url, options);
    } catch (error) {
      console.error('❌ GCS API request failed:', error);
      throw error;
    }
  }

  private parseGCSError(error: any): string {
    if (error.message) {
      // Check for specific permission errors
      if (error.message.includes('storage.buckets.list')) {
        return `Permission denied: Your account (${authService.getCurrentUser()?.email}) does not have the 'storage.buckets.list' permission. Please ask your Google Cloud administrator to grant you the "Storage Legacy Bucket Reader" role or "Storage Admin" role.`;
      }
      if (error.message.includes('storage.objects.list')) {
        return `Permission denied: Your account (${authService.getCurrentUser()?.email}) does not have the 'storage.objects.list' permission. Please ask your Google Cloud administrator to grant you the "Storage Object Viewer" role or "Storage Object Admin" role.`;
      }
      if (error.message.includes('storage.objects.create')) {
        return `Permission denied: Your account (${authService.getCurrentUser()?.email}) does not have the 'storage.objects.create' permission. Please ask your Google Cloud administrator to grant you the "Storage Object Creator" role or "Storage Object Admin" role.`;
      }
      if (error.message.includes('Permission') || error.message.includes('permission')) {
        return `Permission denied: ${error.message}. Please check that your account has the required Google Cloud Storage permissions.`;
      }
      if (error.message.includes('403')) {
        return `Access forbidden (403): Your account may not have sufficient permissions to access this Google Cloud Storage resource.`;
      }
      if (error.message.includes('401')) {
        return `Authentication required (401): Please sign in again to refresh your permissions.`;
      }
    }
    return error.message || 'Unknown error occurred';
  }

  async uploadFile(file: File, bucketName?: string, destinationPath?: string): Promise<GCSUploadResult> {
    console.log('📤 Starting GCS file upload:', {
      fileName: file?.name || 'undefined',
      fileSize: file?.size || 0,
      bucketName,
      destinationPath,
      isAuthenticated: authService.isAuthenticated()
    });

    // Validate inputs
    if (!file) {
      throw new Error('No file provided for upload');
    }

    if (!file.name) {
      throw new Error('File name is required');
    }

    if (file.size === 0) {
      throw new Error('Cannot upload empty file');
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (100MB)`);
    }

    // Check authentication
    if (!authService.isAuthenticated()) {
      throw new Error('Not authenticated. Please sign in with Google OAuth.');
    }

    // Validate token and scopes
    const validation = await authService.validateToken();
    if (!validation.valid) {
      throw new Error(`Authentication failed: ${validation.error}`);
    }

    const hasScopes = await authService.hasRequiredScopes();
    if (!hasScopes) {
      const missingScopes = await authService.getMissingScopes();
      throw new Error(`Missing required permissions: ${missingScopes.join(', ')}`);
    }

    const bucket = bucketName || configService.getDefaultBucket();
    const fileName = destinationPath || `uploads/${Date.now()}_${file.name}`;

    try {
      // First, ensure bucket exists (for demo we'll skip this)
      console.log('🪣 Using bucket:', bucket);

      // Upload file using resumable upload
      const uploadResult = await this.performResumableUpload(file, bucket, fileName);

      console.log('✅ File upload completed successfully:', uploadResult.gcsUri);
      return uploadResult;

    } catch (error) {
      console.error('❌ File upload failed:', error);

      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('token')) {
          throw new Error('Authentication failed. Please sign in again with Google OAuth.');
        } else if (error.message.includes('permission') || error.message.includes('scope')) {
          throw new Error('Insufficient permissions. Please ensure you have granted all required permissions.');
        } else if (error.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please check your Google Cloud Storage limits.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Upload timeout. Please try with a smaller file or check your connection.');
        }
      }

      throw error;
    }
  }

  private async performResumableUpload(file: File, bucket: string, fileName: string): Promise<GCSUploadResult> {
    console.log('🔄 Starting resumable upload...');

    // Validate parameters
    if (!file) {
      throw new Error('File is required for upload');
    }

    if (!bucket) {
      throw new Error('Bucket name is required for upload');
    }

    if (!fileName) {
      throw new Error('File name is required for upload');
    }

    if (typeof file.size === 'undefined') {
      throw new Error('File size is undefined');
    }

    // Step 1: Initiate resumable upload
    const initUrl = `${this.uploadUrl}/b/${bucket}/o?uploadType=resumable&name=${encodeURIComponent(fileName)}`;

    const initResponse = await this.makeAuthenticatedRequest(initUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': file.type || 'application/octet-stream',
        'X-Upload-Content-Length': file.size.toString()
      },
      body: JSON.stringify({
        name: fileName,
        contentType: file.type || 'application/octet-stream'
      })
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      const errorMessage = errorData.error?.message || 'Unknown error';

      console.error('❌ Upload initiation failed:', errorMessage);
      throw new Error(`Failed to initiate upload: ${errorMessage}`);
    }

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('No upload URL received from GCS');
    }

    console.log('🔗 Upload URL obtained, uploading file...');

    // Step 2: Upload file content
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (!uploadResponse.ok) {
      let errorMessage: string;
      try {
        const errorData = await uploadResponse.json();
        errorMessage = errorData.error?.message || `HTTP ${uploadResponse.status}`;
      } catch {
        errorMessage = `HTTP ${uploadResponse.status} ${uploadResponse.statusText}`;
      }

      console.error('❌ File upload failed:', errorMessage);
      throw new Error(`File upload failed: ${errorMessage}`);
    }

    const result = await uploadResponse.json();

    return {
      gcsUri: `gs://${bucket}/${fileName}`,
      bucket: bucket,
      name: fileName,
      size: file.size
    };
  }

  async testConnection(): Promise<GCSConnectionTestResult> {
    try {
      console.log('🔍 Testing GCS connection...');

      // Check if authenticated
      if (!authService.isAuthenticated()) {
        return {
          success: false,
          error: 'Not authenticated. Please sign in with Google OAuth.',
          method: 'oauth'
        };
      }

      // Validate token
      const validation = await authService.validateToken();
      if (!validation.valid) {
        return {
          success: false,
          error: `Token validation failed: ${validation.error}`,
          method: 'oauth'
        };
      }

      // Check required scopes
      const hasScopes = await authService.hasRequiredScopes();
      if (!hasScopes) {
        const missingScopes = await authService.getMissingScopes();
        return {
          success: false,
          error: `Missing required OAuth scopes: ${missingScopes.join(', ')}. Please re-authenticate to grant all required permissions.`,
          method: 'oauth'
        };
      }

      // Test detailed permissions
      const permissionDetails = await this.testDetailedPermissions();

      if (!permissionDetails.hasListPermission) {
        const currentUser = authService.getCurrentUser();
        return {
          success: false,
          error: this.parseGCSError({
            message: `${currentUser?.email || 'User'} does not have storage.buckets.list access to the Google Cloud project. Permission 'storage.buckets.list' denied on resource (or it may not exist).`
          }),
          method: 'oauth',
          permissionDetails
        };
      }

      console.log('✅ GCS connection test passed');

      return {
        success: true,
        method: 'oauth',
        bucket: configService.getDefaultBucket(),
        permissionDetails
      };

    } catch (error) {
      console.error('❌ GCS connection test failed:', error);
      const errorMessage = this.parseGCSError(error);

      return {
        success: false,
        error: errorMessage,
        method: 'oauth'
      };
    }
  }

  private async testDetailedPermissions(): Promise<{
    hasListPermission: boolean;
    hasReadPermission: boolean;
    hasWritePermission: boolean;
    missingPermissions: string[];
  }> {
    const permissions = {
      hasListPermission: false,
      hasReadPermission: false,
      hasWritePermission: false,
      missingPermissions: [] as string[]
    };

    try {
      // Test bucket list permission
      const projectId = configService.getConfig().gcpProjectId || 'demo-project';
      const listResponse = await this.makeAuthenticatedRequest(`${this.baseUrl}/b?project=${projectId}`);

      if (listResponse.ok) {
        permissions.hasListPermission = true;
        console.log('✅ Storage bucket list permission: OK');
      } else {
        permissions.missingPermissions.push('storage.buckets.list');
        console.log('❌ Storage bucket list permission: DENIED');
      }
    } catch (error) {
      permissions.missingPermissions.push('storage.buckets.list');
      console.log('❌ Storage bucket list permission: ERROR', error);
    }

    // For now, we'll assume read/write permissions based on scopes
    // In a production environment, you might want to test these against a specific bucket
    const validation = await authService.validateToken();
    if (validation.valid && validation.scopes) {
      const hasStorageScope = validation.scopes.some((scope) =>
      scope.includes('devstorage') || scope.includes('cloud-platform')
      );

      if (hasStorageScope) {
        permissions.hasReadPermission = true;
        permissions.hasWritePermission = true;
      } else {
        permissions.missingPermissions.push('storage.objects.list', 'storage.objects.create');
      }
    }

    return permissions;
  }

  async createSignedUrl(bucket: string, fileName: string, action: 'read' | 'write' = 'write'): Promise<string> {
    console.log('🔗 Creating signed URL:', { bucket, fileName, action });

    if (!authService.isAuthenticated()) {
      throw new Error('Not authenticated. Please sign in with Google OAuth.');
    }

    // For OAuth, we can't create signed URLs directly
    // This would typically be done by a backend service
    throw new Error('Signed URL generation requires a backend service with service account credentials');
  }

  // Method to clear cached tokens (useful for logout)
  clearAuthCache(): void {
    authService.clearToken();
    console.log('🧹 GCS authentication cache cleared');
  }

  // Method to check if user is authenticated
  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  // Get authentication status
  getAuthStatus(): {
    isAuthenticated: boolean;
    willExpireSoon: boolean;
    timeUntilExpiry: number | null;
  } {
    return {
      isAuthenticated: authService.isAuthenticated(),
      willExpireSoon: authService.willExpireSoon(),
      timeUntilExpiry: authService.getTimeUntilExpiry()
    };
  }

  // Get current user for error messages
  getCurrentUser() {
    return authService.getCurrentUser();
  }

  // Get detailed error information for troubleshooting
  async getConnectionDiagnostics(): Promise<{
    isAuthenticated: boolean;
    tokenValid: boolean;
    hasRequiredScopes: boolean;
    missingScopes: string[];
    userEmail?: string;
    projectId?: string;
    errorDetails?: string;
  }> {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
      return {
        isAuthenticated: false,
        tokenValid: false,
        hasRequiredScopes: false,
        missingScopes: [],
        userEmail: user?.email
      };
    }

    const validation = await authService.validateToken();
    const hasScopes = await authService.hasRequiredScopes();
    const missingScopes = await authService.getMissingScopes();

    return {
      isAuthenticated,
      tokenValid: validation.valid,
      hasRequiredScopes: hasScopes,
      missingScopes,
      userEmail: user?.email,
      projectId: configService.getConfig().gcpProjectId,
      errorDetails: validation.error
    };
  }
}

export const gcsService = new GCSService();