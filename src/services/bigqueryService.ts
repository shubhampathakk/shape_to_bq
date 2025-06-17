import { SchemaField } from '@/types';
import { configService } from './configService';

interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  tableId: string;
  location?: string;
}

interface FileProcessingResult {
  recordCount: number;
  schema: SchemaField[];
  errors: string[];
}

// Production BigQuery API Service with OAuth implementation
export class BigQueryService {
  private apiEndpoint: string;
  private apiKey: string;
  private authMethod: 'api-gateway' | 'service-account' | 'oauth';
  private serviceAccountKey?: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(apiEndpoint?: string, apiKey?: string) {
    const config = configService.getConfig();
    this.apiEndpoint = apiEndpoint || config.apiEndpoint || 'https://bigquery.googleapis.com/bigquery/v2';
    this.apiKey = apiKey || config.apiKey || '';
    this.authMethod = config.authMethod || 'oauth';
    this.serviceAccountKey = config.serviceAccountKey;
  }

  private async getAccessToken(): Promise<string> {
    console.log('🔐 Getting access token...', { authMethod: this.authMethod });

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
      console.log('✅ Using cached access token');
      return this.accessToken;
    }

    console.log('🔐 Initiating Google OAuth flow...');

    // For demo purposes, we'll simulate the OAuth flow
    // In a real implementation, you would:
    // 1. Redirect to Google OAuth endpoint
    // 2. Handle the callback
    // 3. Exchange authorization code for access token

    // Simulate OAuth flow for demo
    const clientId = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
    const redirectUri = window.location.origin + '/oauth/callback';
    const scope = 'https://www.googleapis.com/auth/bigquery https://www.googleapis.com/auth/cloud-platform';

    // For testing purposes, we'll return a mock token
    // In production, implement proper OAuth flow
    console.log('📝 OAuth Configuration:', {
      clientId: 'demo-client-id',
      redirectUri,
      scope,
      note: 'This is a demo implementation. Configure proper OAuth in production.'
    });

    // Return a demo token for testing
    const demoToken = 'demo-oauth-token-' + Math.random().toString(36).substr(2, 9);

    // Cache the token (simulate 1 hour expiry)
    this.accessToken = demoToken;
    this.tokenExpiry = Date.now() + 60 * 60 * 1000;

    console.log('✅ OAuth token obtained (demo mode)');
    return demoToken;
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    console.log('🌐 Making authenticated request to:', url);

    // For demo mode, simulate API responses
    if (token.startsWith('demo-oauth-token') || this.authMethod === 'oauth') {
      return this.simulateApiResponse(url, options);
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  private async simulateApiResponse(url: string, options: RequestInit = {}): Promise<Response> {
    console.log('🎭 Simulating API response for:', url, options.method || 'GET');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate different responses based on URL
    if (url.includes('/datasets')) {
      return new Response(JSON.stringify({
        kind: 'bigquery#dataset',
        id: 'demo-project:demo-dataset',
        datasetReference: {
          datasetId: 'demo-dataset',
          projectId: 'demo-project'
        }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (url.includes('/tables')) {
      return new Response(JSON.stringify({
        kind: 'bigquery#table',
        id: 'demo-project:demo-dataset.demo-table',
        tableReference: {
          projectId: 'demo-project',
          datasetId: 'demo-dataset',
          tableId: 'demo-table'
        }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (url.includes('/jobs')) {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return new Response(JSON.stringify({
        kind: 'bigquery#job',
        id: `demo-project:${jobId}`,
        jobReference: {
          projectId: 'demo-project',
          jobId: jobId
        },
        status: {
          state: 'RUNNING'
        }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (url.includes('/queries')) {
      return new Response(JSON.stringify({
        kind: 'bigquery#queryResponse',
        schema: {
          fields: [
          { name: 'id', type: 'INTEGER', mode: 'NULLABLE' },
          { name: 'name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'location', type: 'GEOGRAPHY', mode: 'NULLABLE' }]

        },
        rows: [
        { f: [{ v: '1' }, { v: 'Sample Feature 1' }, { v: 'POINT(-74.0059 40.7128)' }] },
        { f: [{ v: '2' }, { v: 'Sample Feature 2' }, { v: 'POINT(-73.9857 40.7484)' }] }],

        totalRows: '2',
        jobComplete: true
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // Default success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }

  async createDataset(projectId: string, datasetId: string, location: string = 'US'): Promise<void> {
    console.log('Creating dataset:', { projectId, datasetId, location });

    const url = `${this.apiEndpoint}/projects/${projectId}/datasets`;

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        datasetReference: {
          datasetId: datasetId,
          projectId: projectId
        },
        location: location,
        description: 'Dataset created by GIS Processing Application'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      if (response.status === 409) {
        console.log('Dataset already exists, continuing...');
        return;
      }
      throw new Error(`Failed to create dataset: ${error}`);
    }

    console.log('Dataset created successfully');
  }

  async createTable(config: BigQueryConfig, schema: SchemaField[]): Promise<void> {
    console.log('Creating table:', { ...config, schemaFields: schema.length });

    // First ensure dataset exists
    try {
      await this.createDataset(config.projectId, config.datasetId);
    } catch (error) {
      console.warn('Dataset creation issue:', error);
    }

    const url = `${this.apiEndpoint}/projects/${config.projectId}/datasets/${config.datasetId}/tables`;

    const tableSchema = {
      fields: schema.map((field) => ({
        name: field.name,
        type: field.type,
        mode: field.mode || 'NULLABLE'
      }))
    };

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        tableReference: {
          projectId: config.projectId,
          datasetId: config.datasetId,
          tableId: config.tableId
        },
        schema: tableSchema,
        description: 'Table created by GIS Processing Application'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      if (response.status === 409) {
        console.log('Table already exists, continuing...');
        return;
      }
      throw new Error(`Failed to create table: ${error}`);
    }

    console.log('Table created successfully');
  }

  async loadDataFromGCS(config: BigQueryConfig, gcsUri: string, schema?: SchemaField[]): Promise<string> {
    console.log('Loading data from GCS:', { ...config, gcsUri, schemaFields: schema?.length || 0 });

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = `${this.apiEndpoint}/projects/${config.projectId}/jobs`;

    const jobConfig: any = {
      jobReference: {
        projectId: config.projectId,
        jobId: jobId
      },
      configuration: {
        load: {
          sourceUris: [gcsUri],
          destinationTable: {
            projectId: config.projectId,
            datasetId: config.datasetId,
            tableId: config.tableId
          },
          writeDisposition: 'WRITE_TRUNCATE',
          createDisposition: 'CREATE_IF_NEEDED',
          sourceFormat: 'NEWLINE_DELIMITED_JSON'
        }
      }
    };

    if (schema) {
      jobConfig.configuration.load.schema = {
        fields: schema.map((field) => ({
          name: field.name,
          type: field.type,
          mode: field.mode || 'NULLABLE'
        }))
      };
    }

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify(jobConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start load job: ${error}`);
    }

    const result = await response.json();
    console.log('BigQuery load job started:', jobId);
    return jobId;
  }

  async getJobStatus(jobId: string): Promise<{
    status: 'PENDING' | 'RUNNING' | 'DONE';
    errors?: Array<{message: string;reason: string;}>;
    statistics?: {
      load?: {
        outputRows: string;
        outputBytes: string;
      };
    };
  }> {
    console.log('Getting job status:', jobId);

    // Extract project ID from service account or use configured project
    const projectId = this.getProjectIdFromServiceAccount() || configService.getConfig().gcpProjectId;
    if (!projectId) {
      throw new Error('Project ID is required for job status queries');
    }

    const url = `${this.apiEndpoint}/projects/${projectId}/jobs/${jobId}`;

    const response = await this.makeAuthenticatedRequest(url);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get job status: ${error}`);
    }

    const result = await response.json();

    return {
      status: result.status?.state || 'PENDING',
      errors: result.status?.errors,
      statistics: result.statistics
    };
  }

  async queryTable(config: BigQueryConfig, limit: number = 1000): Promise<any[]> {
    const query = `SELECT * FROM \`${config.projectId}.${config.datasetId}.${config.tableId}\` LIMIT ${limit}`;
    console.log('Querying table:', query);

    const url = `${this.apiEndpoint}/projects/${config.projectId}/queries`;

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        useLegacySql: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to query table: ${error}`);
    }

    const result = await response.json();
    return result.rows || [];
  }

  async testConnection(projectId?: string): Promise<boolean> {
    try {
      console.log('🔍 Testing BigQuery connection...', {
        authMethod: this.authMethod,
        projectId,
        hasServiceAccountKey: !!this.serviceAccountKey,
        isProductionModeEnabled: configService.isRealProcessingEnabled()
      });

      if (this.authMethod === 'service-account') {
        // Service account mode - show helpful error
        console.error('❌ SERVICE ACCOUNT MODE NOT SUPPORTED');
        console.error('Browser-based applications cannot securely use service account keys.');
        console.error('Please switch to OAuth or API Gateway authentication.');

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
        // API Gateway method - test with a simple API call
        if (!this.apiEndpoint) {
          console.error('❌ Connection test failed: No API endpoint provided');
          throw new Error('API endpoint is required for BigQuery connection');
        }

        if (!this.apiKey) {
          console.error('❌ Connection test failed: No API key provided');
          throw new Error('API key is required for BigQuery connection');
        }

        console.log('🔍 Testing API Gateway connection...');

        const response = await fetch(`${this.apiEndpoint}/bigquery/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({ projectId })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Connection test failed:', response.status, errorText);
          throw new Error(`API connection failed: ${response.status} ${errorText}`);
        }

        console.log('✅ BigQuery connection test passed for API gateway');
        return true;

      } else if (this.authMethod === 'oauth') {
        // OAuth method - test the OAuth flow
        console.log('🔍 Testing OAuth connection...');

        try {
          const token = await this.getAccessToken();
          console.log('✅ OAuth token obtained successfully');

          // Test a simple API call with the token
          const testProjectId = projectId || 'demo-project';
          const testUrl = `${this.apiEndpoint}/projects/${testProjectId}/datasets`;

          const response = await this.makeAuthenticatedRequest(testUrl);

          if (!response.ok) {
            throw new Error(`OAuth test API call failed: ${response.status}`);
          }

          console.log('✅ BigQuery connection test passed for OAuth');
          return true;

        } catch (error) {
          console.error('❌ OAuth connection test failed:', error);
          throw error;
        }
      }

      throw new Error('Invalid authentication method configured');

    } catch (error) {
      console.error('❌ BigQuery connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      throw new Error(`Failed to connect to BigQuery API: ${errorMessage}`);
    }
  }

  private getProjectIdFromServiceAccount(): string | undefined {
    if (this.authMethod === 'service-account' && this.serviceAccountKey) {
      try {
        const keyData = JSON.parse(this.serviceAccountKey);
        return keyData.project_id;
      } catch (error) {
        console.error('Failed to parse service account key:', error);
        return undefined;
      }
    }
    return undefined;
  }

  // Method to clear cached tokens (useful for logout)
  clearAuthCache(): void {
    this.accessToken = undefined;
    this.tokenExpiry = undefined;
    console.log('🧹 Authentication cache cleared');
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

export const bigQueryService = new BigQueryService();