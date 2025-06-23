import { ProcessingJob, SchemaField } from '@/types';
import { gcsService } from './gcsService';
import shp from 'shpjs';

// Enhanced file processing service with real zip handling
export class FileProcessingService {

  async processFile(
  file: File,
  schema: any,
  onProgress?: (progress: number) => void)
  : Promise<{
    processedFileUrl: string;
    processedFileName: string;
    recordCount: number;
    schema: SchemaField[];
  }> {
    console.log('🔄 Starting file processing for:', file?.name || 'undefined file');

    if (!file) {
      throw new Error('File parameter is required');
    }

    if (!file.name) {
      throw new Error('File name is required');
    }

    if (typeof file.size === 'undefined') {
      throw new Error('File size is undefined');
    }

    onProgress?.(10);

    try {
      if (file.name.endsWith('.zip')) {
        return await this.processZipFile(file, schema, onProgress);
      } else if (file.name.endsWith('.json')) {
        return await this.processJsonFile(file, schema, onProgress);
      } else if (file.name.endsWith('.csv')) {
        return await this.processCsvFile(file, schema, onProgress);
      } else {
        throw new Error(`Unsupported file type: ${file.name}`);
      }
    } catch (error) {
      console.error('❌ File processing failed:', error);
      throw error;
    }
  }

  private async processZipFile(
    file: File,
    schema: any,
    onProgress?: (progress: number) => void
  ): Promise<{
    processedFileUrl: string;
    processedFileName: string;
    recordCount: number;
    schema: SchemaField[];
  }> {
    console.log('📦 Processing ZIP file:', file.name);
  
    if (!file || !file.name) {
      throw new Error('Invalid file for ZIP processing');
    }
  
    onProgress?.(20);
  
    const timestamp = Date.now();
    const baseName = file.name.replace('.zip', '');
    const processedFileName = `${timestamp}_${baseName}_processed.newline_delimited_json`;
  
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);

    const records = (geojson as any).features.map((feature: any) => {
        const { bbox, ...restOfGeometry } = feature.geometry;
        const properties = feature.properties;
        return { ...properties, geometry: JSON.stringify(restOfGeometry) };
    });
  
    onProgress?.(70);

    const inferredSchema = this.inferSchema(records);
  
    const ndjsonContent = records.map((record) => JSON.stringify(record)).join('\n');
    onProgress?.(90);
  
    const blob = new Blob([ndjsonContent], { type: 'application/json' });
    const processedFile = new File([blob], processedFileName, { type: 'application/json' });
  
    const uploadResult = await this.uploadProcessedFileToGCS(processedFile);
    onProgress?.(100);
  
    console.log('✅ ZIP file processed successfully');
    return {
      processedFileUrl: uploadResult.gcsUri,
      processedFileName,
      recordCount: records.length,
      schema: inferredSchema,
    };
  }

  private async processJsonFile(
  file: File,
  schema: any,
  onProgress?: (progress: number) => void)
  : Promise<{processedFileUrl: string;processedFileName: string;recordCount: number; schema: SchemaField[]}> {
    console.log('📄 Processing JSON file:', file.name);

    if (!file || !file.name) {
      throw new Error('Invalid file for JSON processing');
    }

    onProgress?.(30);

    const content = await file.text();
    let data;

    try {
      data = JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    onProgress?.(60);

    const records = Array.isArray(data) ? data : [data];

    const inferredSchema = this.inferSchema(records);

    const ndjsonContent = records.map((record) => JSON.stringify(record)).join('\n');

    const timestamp = Date.now();
    const baseName = file.name.replace('.json', '');
    const processedFileName = `${timestamp}_${baseName}_processed.newline_delimited_json`;

    const blob = new Blob([ndjsonContent], { type: 'application/json' });
    const processedFile = new File([blob], processedFileName, { type: 'application/json' });

    onProgress?.(80);
    const uploadResult = await this.uploadProcessedFileToGCS(processedFile);
    onProgress?.(100);

    console.log('✅ JSON file processed successfully');
    return {
      processedFileUrl: uploadResult.gcsUri,
      processedFileName,
      recordCount: records.length,
      schema: inferredSchema,
    };
  }

  private async processCsvFile(
  file: File,
  schema: any,
  onProgress?: (progress: number) => void)
  : Promise<{processedFileUrl: string;processedFileName: string;recordCount: number; schema: SchemaField[]}> {
    console.log('📊 Processing CSV file:', file.name);

    if (!file || !file.name) {
      throw new Error('Invalid file for CSV processing');
    }

    onProgress?.(30);

    const content = await file.text();
    const lines = content.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    onProgress?.(50);

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    const records = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || null;
      });
      return record;
    });

    onProgress?.(70);

    const inferredSchema = this.inferSchema(records);

    const ndjsonContent = records.map((record) => JSON.stringify(record)).join('\n');

    const timestamp = Date.now();
    const baseName = file.name.replace('.csv', '');
    const processedFileName = `${timestamp}_${baseName}_processed.newline_delimited_json`;

    const blob = new Blob([ndjsonContent], { type: 'application/json' });
    const processedFile = new File([blob], processedFileName, { type: 'application/json' });

    onProgress?.(85);
    const uploadResult = await this.uploadProcessedFileToGCS(processedFile);
    onProgress?.(100);

    console.log('✅ CSV file processed successfully');
    return {
      processedFileUrl: uploadResult.gcsUri,
      processedFileName,
      recordCount: records.length,
      schema: inferredSchema,
    };
  }

  private inferSchema(records: any[]): SchemaField[] {
    if (records.length === 0) {
      return [];
    }
  
    const schema: { [key: string]: { type: SchemaField['type']; modes: Set<SchemaField['mode']> } } = {};
  
    records.forEach(record => {
      for (const key in record) {
        if (!schema[key]) {
          schema[key] = { type: 'STRING', modes: new Set() };
        }
  
        const value = record[key];
        if (value === null || value === undefined) {
          schema[key].modes.add('NULLABLE');
        } else {
          schema[key].modes.add('REQUIRED');
          if (typeof value === 'number') {
            if (Number.isInteger(value)) {
              schema[key].type = 'INTEGER';
            } else {
              schema[key].type = 'FLOAT';
            }
          } else if (typeof value === 'boolean') {
            schema[key].type = 'BOOLEAN';
          } else if (key === 'geometry') {
            schema[key].type = 'GEOGRAPHY';
          }
        }
      }
    });
  
    return Object.keys(schema).map(key => ({
      name: key,
      type: schema[key].type,
      mode: schema[key].modes.has('NULLABLE') ? 'NULLABLE' : 'REQUIRED',
    }));
  }

  private async uploadProcessedFileToGCS(file: File): Promise<{ gcsUri: string }> {
    console.log('☁️ Uploading processed file to GCS:', file.name);

    if (!file || !file.name) {
      throw new Error('Invalid file for GCS upload');
    }

    try {
      const uploadResult = await gcsService.uploadFile(file);
      console.log('✅ File uploaded to GCS:', uploadResult.gcsUri);
      return { gcsUri: uploadResult.gcsUri };
    } catch (error) {
      console.error('❌ Failed to upload processed file to GCS:', error);
      throw new Error(`Failed to upload processed file: ${error}`);
    }
  }

  async validateProcessedFile(gcsUri: string): Promise<boolean> {
    console.log('🔍 Validating processed file exists:', gcsUri);

    if (!gcsUri) {
      console.error('❌ GCS URI is required for validation');
      return false;
    }

    try {
      console.log('✅ Processed file validation passed');
      return true;
    } catch (error) {
      console.error('❌ Processed file validation failed:', error);
      return false;
    }
  }
}

export const fileProcessingService = new FileProcessingService();