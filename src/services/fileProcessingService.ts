import { SchemaField } from '@/types';

interface ProcessingOptions {
  detectSchema: boolean;
  customSchema?: SchemaField[];
  integerColumns?: string;
  geometryColumn?: string;
}

interface ProcessedFile {
  gcsUri: string;
  recordCount: number;
  schema: SchemaField[];
  errors: string[];
  warnings: string[];
}

// File Processing Service for Geospatial Data
export class FileProcessingService {
  private apiEndpoint: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(apiEndpoint?: string, apiKey?: string) {
    this.apiEndpoint = apiEndpoint || import.meta.env.VITE_API_ENDPOINT || 'https://your-api-gateway.com/api';
    this.apiKey = apiKey || import.meta.env.VITE_API_KEY || '';

    console.log('FileProcessingService initialized:', {
      apiEndpoint: this.apiEndpoint,
      hasApiKey: !!this.apiKey
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
  requestFn: () => Promise<T>,
  errorContext: string,
  attempt: number = 1)
  : Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      console.error(`${errorContext} failed (attempt ${attempt}/${this.maxRetries}):`, error);

      if (attempt >= this.maxRetries) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`${errorContext} failed after ${this.maxRetries} attempts: ${errorMessage}`);
      }

      const delayMs = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`Retrying in ${delayMs}ms...`);
      await this.delay(delayMs);

      return this.retryRequest(requestFn, errorContext, attempt + 1);
    }
  }

  async uploadFile(file: File, destinationPath?: string): Promise<string> {
    console.log('Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      destinationPath,
      apiEndpoint: this.apiEndpoint
    });

    // Validate file before upload
    if (!file) {
      throw new Error('No file provided for upload');
    }

    if (file.size === 0) {
      throw new Error('Cannot upload empty file');
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (100MB)`);
    }

    const uploadRequest = async (): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);

      if (destinationPath) {
        formData.append('destination', destinationPath);
      }

      console.log('Making upload request to:', `${this.apiEndpoint}/files/upload`);

      // Create request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000); // 60 second timeout

      try {
        const response = await fetch(`${this.apiEndpoint}/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Upload response status:', response.status);

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
        console.log('Upload successful:', result);

        if (!result.gcsUri) {
          throw new Error('Upload response missing GCS URI');
        }

        return result.gcsUri;
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
    };

    return this.retryRequest(uploadRequest, 'File upload');
  }

  async processShapefile(
  source: string, // GCS URI or file path
  options: ProcessingOptions)
  : Promise<ProcessedFile> {
    console.log('Processing shapefile:', { source, options });

    const processRequest = async (): Promise<ProcessedFile> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 2 minute timeout for processing

      try {
        const response = await fetch(`${this.apiEndpoint}/files/process/shapefile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            source,
            options
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Shapefile processing failed: ${error}`);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Processing timeout. The shapefile processing took too long.');
        }

        throw error;
      }
    };

    return this.retryRequest(processRequest, 'Shapefile processing');
  }

  async validateShapefile(file: File): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata?: {
      geometryType: string;
      recordCount: number;
      bounds: [number, number, number, number]; // [minX, minY, maxX, maxY]
      projection: string;
    };
  }> {
    console.log('Validating shapefile:', { fileName: file.name, fileSize: file.size });

    const validateRequest = async () => {
      const formData = new FormData();
      formData.append('file', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30 second timeout

      try {
        const response = await fetch(`${this.apiEndpoint}/files/validate/shapefile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Validation failed: ${error}`);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Validation timeout. The shapefile validation took too long.');
        }

        throw error;
      }
    };

    return this.retryRequest(validateRequest, 'Shapefile validation');
  }

  async convertToGeoJSON(source: string): Promise<string> {
    console.log('Converting to GeoJSON:', source);

    const convertRequest = async (): Promise<string> => {
      const response = await fetch(`${this.apiEndpoint}/files/convert/geojson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ source })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`GeoJSON conversion failed: ${error}`);
      }

      const result = await response.json();
      return result.gcsUri;
    };

    return this.retryRequest(convertRequest, 'GeoJSON conversion');
  }

  async detectSchema(source: string): Promise<SchemaField[]> {
    console.log('Detecting schema:', source);

    const detectRequest = async (): Promise<SchemaField[]> => {
      const response = await fetch(`${this.apiEndpoint}/files/schema/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ source })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Schema detection failed: ${error}`);
      }

      const result = await response.json();
      return result.schema;
    };

    return this.retryRequest(detectRequest, 'Schema detection');
  }

  async getProcessingStatus(jobId: string): Promise<{
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: number;
    currentStep: string;
    errors: string[];
    result?: ProcessedFile;
  }> {
    const response = await fetch(`${this.apiEndpoint}/files/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get processing status');
    }

    return response.json();
  }

  // Method to test the API connection
  async testApiConnection(): Promise<{
    success: boolean;
    error?: string;
    endpoint: string;
    hasApiKey: boolean;
  }> {
    try {
      console.log('Testing API connection to:', this.apiEndpoint);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout

      const response = await fetch(`${this.apiEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      return {
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`,
        endpoint: this.apiEndpoint,
        hasApiKey: !!this.apiKey
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('API connection test failed:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        endpoint: this.apiEndpoint,
        hasApiKey: !!this.apiKey
      };
    }
  }
}

export const fileProcessingService = new FileProcessingService();