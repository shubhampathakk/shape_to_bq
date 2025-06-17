// Configuration Service for Production Settings
interface AppConfig {
  apiEndpoint: string;
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  gcpProjectId?: string;
  gcsDefaultBucket?: string;
  bigQueryDefaultDataset?: string;
  enableRealProcessing: boolean;
  maxFileSize: number; // in MB
  supportedFormats: string[];
  authMethod?: 'api-gateway' | 'service-account' | 'oauth';
  serviceAccountKey?: string;
}

class ConfigService {
  private config: AppConfig;
  private readonly STORAGE_KEY = 'gis_app_config';

  constructor() {
    // Try to load from localStorage first
    const savedConfig = this.loadFromStorage();

    this.config = {
      apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'https://your-api-gateway.com/api',
      apiKey: import.meta.env.VITE_API_KEY || '',
      environment: import.meta.env.VITE_ENVIRONMENT as any || 'development',
      gcpProjectId: import.meta.env.VITE_GCP_PROJECT_ID,
      gcsDefaultBucket: import.meta.env.VITE_GCS_DEFAULT_BUCKET,
      bigQueryDefaultDataset: import.meta.env.VITE_BIGQUERY_DEFAULT_DATASET,
      enableRealProcessing: import.meta.env.VITE_ENABLE_REAL_PROCESSING === 'true',
      maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '100', 10),
      supportedFormats: ['zip', 'shp', 'geojson', 'kml'],
      authMethod: import.meta.env.VITE_AUTH_METHOD as any || 'oauth', // Default to OAuth
      serviceAccountKey: import.meta.env.VITE_SERVICE_ACCOUNT_KEY,
      // Override with saved configuration
      ...savedConfig
    };

    // Auto-configure bucket name based on project ID if not set
    if (!this.config.gcsDefaultBucket && this.config.serviceAccountKey) {
      try {
        const keyData = JSON.parse(this.config.serviceAccountKey);
        if (keyData.project_id) {
          this.config.gcsDefaultBucket = `${keyData.project_id}-shapefile-uploads`;
          console.log('Auto-configured default bucket:', this.config.gcsDefaultBucket);
        }
      } catch (error) {
        console.warn('Failed to auto-configure bucket from service account key');
      }
    }

    console.log('🔧 ConfigService initialized:', {
      environment: this.config.environment,
      authMethod: this.config.authMethod,
      enableRealProcessing: this.config.enableRealProcessing,
      hasServiceAccountKey: !!this.config.serviceAccountKey,
      hasApiKey: !!this.config.apiKey,
      defaultBucket: this.config.gcsDefaultBucket,
      isProductionReady: this.isProductionReady(),
      isRealProcessingEnabled: this.isRealProcessingEnabled()
    });

    // Show important warnings for service account mode
    if (this.config.authMethod === 'service-account') {
      console.warn('⚠️  WARNING: Service account mode is not supported in browser applications');
      console.warn('   Browser-based apps cannot securely use service account keys');
      console.warn('   Please use OAuth or API Gateway authentication instead');
      console.warn('   Switching to OAuth mode automatically...');

      // Auto-switch to OAuth mode for better user experience
      this.config.authMethod = 'oauth';
      this.saveToStorage();
    }
  }

  private loadFromStorage(): Partial<AppConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        console.log('Loading configuration from localStorage');
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load configuration from localStorage:', error);
    }
    return {};
  }

  private saveToStorage(): void {
    try {
      // Only save user-configurable settings, not environment variables
      const configToSave = {
        authMethod: this.config.authMethod,
        serviceAccountKey: this.config.serviceAccountKey,
        enableRealProcessing: this.config.enableRealProcessing,
        gcpProjectId: this.config.gcpProjectId,
        gcsDefaultBucket: this.config.gcsDefaultBucket,
        bigQueryDefaultDataset: this.config.bigQueryDefaultDataset,
        maxFileSize: this.config.maxFileSize,
        apiEndpoint: this.config.apiEndpoint,
        apiKey: this.config.apiKey
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configToSave));
      console.log('Configuration saved to localStorage');
    } catch (error) {
      console.warn('Failed to save configuration to localStorage:', error);
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  getApiEndpoint(): string {
    return this.config.apiEndpoint;
  }

  getApiKey(): string {
    return this.config.apiKey;
  }

  getAuthMethod(): 'api-gateway' | 'service-account' | 'oauth' {
    return this.config.authMethod || 'oauth';
  }

  getServiceAccountKey(): string | undefined {
    return this.config.serviceAccountKey;
  }

  isRealProcessingEnabled(): boolean {
    // Real processing is enabled if:
    // 1. The flag is explicitly enabled AND
    // 2. We have valid authentication configured AND
    // 3. Service account mode is explicitly disabled due to browser limitations
    if (this.config.authMethod === 'service-account') {
      // Service account mode is not supported in browsers - force to mock mode
      console.log('🔧 Using mock mode - service account authentication not supported in browsers');
      return false;
    }

    return this.config.enableRealProcessing && this.hasValidAuthentication();
  }

  isProductionReady(): boolean {
    // Check if production configuration is complete
    return this.hasValidAuthentication();
  }

  private hasValidAuthentication(): boolean {
    if (this.config.authMethod === 'service-account') {
      // Service account validation - but note it's not supported in browsers
      return false; // Always return false for service account in browser
    } else if (this.config.authMethod === 'api-gateway') {
      return !!(this.config.apiEndpoint && this.config.apiKey);
    } else if (this.config.authMethod === 'oauth') {
      // OAuth is valid if we have basic configuration - actual tokens are handled at runtime
      return true; // OAuth is always considered valid as it's user-initiated
    }
    return false;
  }

  getMaxFileSize(): number {
    return this.config.maxFileSize;
  }

  getSupportedFormats(): string[] {
    return [...this.config.supportedFormats];
  }

  updateConfig(updates: Partial<AppConfig>): void {
    console.log('🔧 Updating configuration:', updates);

    // Prevent setting service account mode in browser
    if (updates.authMethod === 'service-account') {
      console.warn('⚠️  Cannot use service account mode in browser applications');
      console.warn('   Switching to OAuth mode instead');
      updates.authMethod = 'oauth';
    }

    // Auto-configure bucket name if service account key is being updated (though we don't support it)
    if (updates.serviceAccountKey && !updates.gcsDefaultBucket) {
      try {
        const keyData = JSON.parse(updates.serviceAccountKey);
        if (keyData.project_id) {
          updates.gcsDefaultBucket = `${keyData.project_id}-shapefile-uploads`;
          console.log('Auto-configured bucket name:', updates.gcsDefaultBucket);
        }
      } catch (error) {
        console.warn('Failed to auto-configure bucket from service account key update');
      }
    }

    this.config = { ...this.config, ...updates };
    this.saveToStorage();

    // Log the updated state
    console.log('🔧 Configuration updated:', {
      environment: this.config.environment,
      authMethod: this.config.authMethod,
      enableRealProcessing: this.config.enableRealProcessing,
      hasServiceAccountKey: !!this.config.serviceAccountKey,
      hasApiKey: !!this.config.apiKey,
      defaultBucket: this.config.gcsDefaultBucket,
      isProductionReady: this.isProductionReady(),
      isRealProcessingEnabled: this.isRealProcessingEnabled()
    });
  }

  validateServiceAccountKey(keyString: string): boolean {
    try {
      const parsed = JSON.parse(keyString);
      return parsed.type === 'service_account' &&
      parsed.project_id &&
      parsed.private_key &&
      parsed.client_email;
    } catch {
      return false;
    }
  }

  getGcpProjectFromServiceAccount(): string | undefined {
    if (this.config.authMethod === 'service-account' && this.config.serviceAccountKey) {
      try {
        const parsed = JSON.parse(this.config.serviceAccountKey);
        return parsed.project_id;
      } catch {
        return undefined;
      }
    }
    return this.config.gcpProjectId;
  }

  validateRequiredConfig(): string[] {
    const errors: string[] = [];

    if (this.config.authMethod === 'api-gateway') {
      if (!this.config.apiEndpoint) {
        errors.push('API endpoint is required for API Gateway authentication');
      }
      if (this.config.enableRealProcessing && !this.config.apiKey) {
        errors.push('API key is required for real processing with API Gateway');
      }
    } else if (this.config.authMethod === 'service-account') {
      // Always add error for service account mode in browser
      errors.push('❌ Service account authentication is not supported in browser applications');
      errors.push('Please use OAuth or API Gateway authentication instead');
    } else if (this.config.authMethod === 'oauth') {


      // OAuth has no specific configuration requirements
      // The OAuth flow will handle authentication at runtime
    }return errors;
  }

  getEnvironmentInfo(): {
    environment: string;
    realProcessingEnabled: boolean;
    apiConfigured: boolean;
    configErrors: string[];
    productionReady: boolean;
    defaultBucket?: string;
    projectId?: string;
    implementationWarnings: string[];
  } {
    const authConfigured = this.config.authMethod === 'service-account' ?
    false : // Service account never configured in browser
    this.config.authMethod === 'api-gateway' ?
    !!(this.config.apiEndpoint && this.config.apiKey) :
    true; // OAuth is always considered configured

    const productionReady = this.isProductionReady();
    const implementationWarnings: string[] = [];

    // Add warnings for service account mode
    if (this.config.authMethod === 'service-account') {
      implementationWarnings.push('Service account authentication is not supported in browser applications');
      implementationWarnings.push('Browser-based apps cannot securely sign JWTs with private keys');
      implementationWarnings.push('This is a fundamental security limitation of web browsers');
      implementationWarnings.push('Please use OAuth (recommended) or API Gateway authentication');
    }

    return {
      environment: this.config.environment,
      realProcessingEnabled: this.isRealProcessingEnabled(),
      apiConfigured: authConfigured,
      configErrors: this.validateRequiredConfig(),
      productionReady,
      defaultBucket: this.config.gcsDefaultBucket,
      projectId: this.getGcpProjectFromServiceAccount(),
      implementationWarnings
    };
  }

  // Auto-enable real processing when connections are successfully tested
  enableRealProcessingIfReady(): void {
    if (this.hasValidAuthentication() && !this.config.enableRealProcessing) {
      if (this.config.authMethod === 'api-gateway') {
        console.log('🎯 Auto-enabling real processing - API Gateway authentication is valid');
        this.updateConfig({ enableRealProcessing: true });
      } else if (this.config.authMethod === 'oauth') {
        console.log('🎯 Auto-enabling real processing - OAuth authentication is available');
        this.updateConfig({ enableRealProcessing: true });
      }
    } else if (this.config.authMethod === 'service-account') {
      console.log('🚫 Not enabling real processing - Service account mode is not supported in browsers');
    }
  }

  // Method to clear configuration (for testing or reset)
  clearConfig(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Configuration cleared from localStorage');
    } catch (error) {
      console.warn('Failed to clear configuration from localStorage:', error);
    }
  }

  // Get the default bucket name for current configuration
  getDefaultBucket(): string {
    if (this.config.gcsDefaultBucket) {
      return this.config.gcsDefaultBucket;
    }

    // Try to get from service account (though not supported in browser)
    const projectId = this.getGcpProjectFromServiceAccount();
    if (projectId) {
      return `${projectId}-shapefile-uploads`;
    }

    // Default bucket for demo mode
    return 'demo-shapefile-uploads';
  }

  // Force mock mode (useful for demos)
  forceMockMode(): void {
    console.log('🎭 Forcing mock mode for demonstration');
    this.updateConfig({ enableRealProcessing: false });
  }

  // Force OAuth mode (recommended for browser apps)
  forceOAuthMode(): void {
    console.log('🔐 Switching to OAuth mode (recommended for browsers)');
    this.updateConfig({ authMethod: 'oauth' });
  }

  // Force API Gateway mode
  forceApiGatewayMode(): void {
    console.log('🌐 Switching to API Gateway mode');
    this.updateConfig({ authMethod: 'api-gateway' });
  }

  // Get OAuth configuration for UI display
  getOAuthInfo(): {
    clientId?: string;
    scopes: string[];
    redirectUri: string;
    authUrl: string;
  } {
    const redirectUri = window.location.origin + '/oauth/callback';
    const scopes = [
    'https://www.googleapis.com/auth/bigquery',
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/devstorage.read_write'];


    return {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
      scopes,
      redirectUri,
      authUrl: 'https://accounts.google.com/oauth2/v2/auth'
    };
  }
}

export const configService = new ConfigService();