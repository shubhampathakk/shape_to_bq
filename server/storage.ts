import { 
  shapefileUploads, 
  bigqueryConfigs, 
  schemaFields, 
  uploadSessions,
  type ShapefileUpload,
  type InsertShapefileUpload,
  type BigqueryConfig,
  type InsertBigqueryConfig,
  type SchemaField,
  type InsertSchemaField,
  type UploadSession,
  type InsertUploadSession
} from "@shared/schema";

export interface IStorage {
  // Shapefile uploads
  createShapefileUpload(upload: InsertShapefileUpload): Promise<ShapefileUpload>;
  getShapefileUploadsByUploadId(uploadId: string): Promise<ShapefileUpload[]>;
  updateShapefileUploadStatus(id: number, status: string): Promise<void>;

  // BigQuery configs
  createBigqueryConfig(config: InsertBigqueryConfig): Promise<BigqueryConfig>;
  getBigqueryConfigByUploadId(uploadId: string): Promise<BigqueryConfig | undefined>;
  updateBigqueryConfig(uploadId: string, config: Partial<InsertBigqueryConfig>): Promise<void>;

  // Schema fields
  createSchemaField(field: InsertSchemaField): Promise<SchemaField>;
  createSchemaFields(fields: InsertSchemaField[]): Promise<SchemaField[]>;
  getSchemaFieldsByUploadId(uploadId: string): Promise<SchemaField[]>;
  deleteSchemaFieldsByUploadId(uploadId: string): Promise<void>;

  // Upload sessions
  createUploadSession(session: InsertUploadSession): Promise<UploadSession>;
  getUploadSession(id: string): Promise<UploadSession | undefined>;
  updateUploadSession(id: string, updates: Partial<InsertUploadSession>): Promise<void>;
  getAllUploadSessions(): Promise<UploadSession[]>;
}

export class MemStorage implements IStorage {
  private shapefileUploads: Map<number, ShapefileUpload>;
  private bigqueryConfigs: Map<string, BigqueryConfig>;
  private schemaFields: Map<string, SchemaField[]>;
  private uploadSessions: Map<string, UploadSession>;
  private currentId: number;

  constructor() {
    this.shapefileUploads = new Map();
    this.bigqueryConfigs = new Map();
    this.schemaFields = new Map();
    this.uploadSessions = new Map();
    this.currentId = 1;
  }

  async createShapefileUpload(upload: InsertShapefileUpload): Promise<ShapefileUpload> {
    const id = this.currentId++;
    const newUpload: ShapefileUpload = { ...upload, id };
    this.shapefileUploads.set(id, newUpload);
    return newUpload;
  }

  async getShapefileUploadsByUploadId(uploadId: string): Promise<ShapefileUpload[]> {
    return Array.from(this.shapefileUploads.values()).filter(
      (upload) => upload.uploadId === uploadId
    );
  }

  async updateShapefileUploadStatus(id: number, status: string): Promise<void> {
    const upload = this.shapefileUploads.get(id);
    if (upload) {
      this.shapefileUploads.set(id, { ...upload, status });
    }
  }

  async createBigqueryConfig(config: InsertBigqueryConfig): Promise<BigqueryConfig> {
    const id = this.currentId++;
    const newConfig: BigqueryConfig = { ...config, id };
    this.bigqueryConfigs.set(config.uploadId, newConfig);
    return newConfig;
  }

  async getBigqueryConfigByUploadId(uploadId: string): Promise<BigqueryConfig | undefined> {
    return this.bigqueryConfigs.get(uploadId);
  }

  async updateBigqueryConfig(uploadId: string, config: Partial<InsertBigqueryConfig>): Promise<void> {
    const existing = this.bigqueryConfigs.get(uploadId);
    if (existing) {
      this.bigqueryConfigs.set(uploadId, { ...existing, ...config });
    }
  }

  async createSchemaField(field: InsertSchemaField): Promise<SchemaField> {
    const id = this.currentId++;
    const newField: SchemaField = { ...field, id };
    
    const existing = this.schemaFields.get(field.uploadId) || [];
    this.schemaFields.set(field.uploadId, [...existing, newField]);
    
    return newField;
  }

  async createSchemaFields(fields: InsertSchemaField[]): Promise<SchemaField[]> {
    const results = [];
    for (const field of fields) {
      results.push(await this.createSchemaField(field));
    }
    return results;
  }

  async getSchemaFieldsByUploadId(uploadId: string): Promise<SchemaField[]> {
    return this.schemaFields.get(uploadId) || [];
  }

  async deleteSchemaFieldsByUploadId(uploadId: string): Promise<void> {
    this.schemaFields.delete(uploadId);
  }

  async createUploadSession(session: InsertUploadSession): Promise<UploadSession> {
    const newSession: UploadSession = { ...session };
    this.uploadSessions.set(session.id, newSession);
    return newSession;
  }

  async getUploadSession(id: string): Promise<UploadSession | undefined> {
    return this.uploadSessions.get(id);
  }

  async updateUploadSession(id: string, updates: Partial<InsertUploadSession>): Promise<void> {
    const existing = this.uploadSessions.get(id);
    if (existing) {
      this.uploadSessions.set(id, { ...existing, ...updates });
    }
  }

  async getAllUploadSessions(): Promise<UploadSession[]> {
    return Array.from(this.uploadSessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const storage = new MemStorage();
