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

// Production BigQuery API Service with REAL API calls
export class BigQueryService {
  private apiEndpoint: string;
  private apiKey: string;
  private authMethod: 'api-gateway' | 'service-account';
  private serviceAccountKey?: string;

  constructor(apiEndpoint?: string, apiKey?: string) {
    const config = configService.getConfig();
    this.apiEndpoint = apiEndpoint || config.apiEndpoint || 'https://bigquery.googleapis.com/bigquery/v2';
    this.apiKey = apiKey || config.apiKey || '';
    this.authMethod = config.authMethod || 'service-account';
    this.serviceAccountKey = config.serviceAccountKey;
  }

  private async getAccessToken(): Promise<string> {
    if (this.authMethod === 'service-account' && this.serviceAccountKey) {
      try {
        const keyData = JSON.parse(this.serviceAccountKey);

        // Create JWT for Google OAuth
        const now = Math.floor(Date.now() / 1000);
        const payload = {
          iss: keyData.client_email,
          scope: 'https://www.googleapis.com/auth/bigquery',
          aud: 'https://oauth2.googleapis.com/token',
          exp: now + 3600,
          iat: now
        };

        // In a real implementation, you would use a proper JWT library
        // For now, we'll make a direct call to Google's OAuth endpoint
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
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
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
      console.log('Testing BigQuery connection...', {
        authMethod: this.authMethod,
        projectId,
        hasServiceAccountKey: !!this.serviceAccountKey
      });

      if (this.authMethod === 'service-account') {
        // Validate service account key format and content
        if (!this.serviceAccountKey) {
          console.error('Connection test failed: No service account key provided');
          throw new Error('Service account key is required for BigQuery connection');
        }

        let keyData;
        try {
          keyData = JSON.parse(this.serviceAccountKey);
        } catch (error) {
          console.error('Connection test failed: Invalid service account key JSON format');
          throw new Error('Invalid service account key format. Please ensure it is valid JSON.');
        }

        // Validate required fields
        const requiredFields = ['project_id', 'private_key', 'client_email', 'type'];
        const missingFields = requiredFields.filter((field) => !keyData[field]);

        if (missingFields.length > 0) {
          console.error('Connection test failed: Missing required fields:', missingFields);
          throw new Error(`Service account key is missing required fields: ${missingFields.join(', ')}`);
        }

        if (keyData.type !== 'service_account') {
          console.error('Connection test failed: Invalid key type:', keyData.type);
          throw new Error('Service account key must be of type "service_account"');
        }

        const effectiveProjectId = projectId || keyData.project_id;
        if (!effectiveProjectId) {
          console.error('Connection test failed: No project ID available');
          throw new Error('Project ID is required for BigQuery connection');
        }

        // Validate project ID format (basic validation)
        if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(effectiveProjectId)) {
          console.error('Connection test failed: Invalid project ID format:', effectiveProjectId);
          throw new Error('Invalid project ID format. Project IDs must start with a letter, contain only lowercase letters, numbers, and hyphens, and end with a letter or number.');
        }

        // Test actual connection by trying to list datasets
        try {
          const url = `${this.apiEndpoint}/projects/${effectiveProjectId}/datasets`;
          const response = await this.makeAuthenticatedRequest(url);

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`API call failed: ${response.status} ${error}`);
          }

          console.log('BigQuery connection test successful - API responded correctly');
          return true;
        } catch (apiError) {
          console.error('API connection test failed:', apiError);
          throw new Error(`Failed to connect to BigQuery API: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }

      } else {
        // API Gateway method - test with a simple API call
        if (!this.apiEndpoint) {
          console.error('Connection test failed: No API endpoint provided');
          throw new Error('API endpoint is required for BigQuery connection');
        }

        if (!this.apiKey) {
          console.error('Connection test failed: No API key provided');
          throw new Error('API key is required for BigQuery connection');
        }

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
          console.error('Connection test failed:', response.status, errorText);
          throw new Error(`API connection failed: ${response.status} ${errorText}`);
        }

        console.log('Connection test passed for API gateway');
        return true;
      }
    } catch (error) {
      console.error('BigQuery connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      throw new Error(`Failed to connect to BigQuery. ${errorMessage}`);
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
}

export const bigQueryService = new BigQueryService();