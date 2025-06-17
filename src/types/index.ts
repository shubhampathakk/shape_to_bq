
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Job {
  id: string;
  userId: string;
  status: 'queued' | 'converting' | 'reading' | 'loading' | 'completed' | 'failed';
  progress: number;
  sourceType: 'local' | 'gcs';
  fileName?: string;
  gcsPath?: string;
  gcpProjectId: string;
  targetTable: string;
  schema?: any;
  integerColumns?: string;
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
  logs: JobLog[];
}

export interface JobLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface SchemaField {
  name: string;
  type: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'TIMESTAMP' | 'GEOGRAPHY';
  mode: 'REQUIRED' | 'NULLABLE' | 'REPEATED';
  description?: string;
}

export interface ProcessingConfig {
  sourceType: 'local' | 'gcs';
  file?: File;
  gcsPath?: string;
  gcsBucket?: string;
  gcpProjectId: string;
  targetTable: string;
  autoDetectSchema: boolean;
  customSchema?: SchemaField[];
  integerColumns?: string;
}