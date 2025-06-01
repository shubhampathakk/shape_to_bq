import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shapefileUploads = pgTable("shapefile_uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  fileType: text("file_type").notNull(), // 'shp', 'shx', 'dbf', 'prj'
  uploadId: text("upload_id").notNull(), // Group related files together
  filePath: text("file_path").notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, completed, failed
});

export const bigqueryConfigs = pgTable("bigquery_configs", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  datasetId: text("dataset_id").notNull(),
  tableName: text("table_name").notNull(),
  credentialsPath: text("credentials_path"),
  uploadId: text("upload_id").notNull(),
});

export const schemaFields = pgTable("schema_fields", {
  id: serial("id").primaryKey(),
  uploadId: text("upload_id").notNull(),
  fieldName: text("field_name").notNull(),
  fieldType: text("field_type").notNull(), // STRING, INTEGER, FLOAT, GEOGRAPHY, etc.
  mode: text("mode").notNull().default("NULLABLE"), // REQUIRED, NULLABLE
  isAutoDetected: boolean("is_auto_detected").default(true),
});

export const uploadSessions = pgTable("upload_sessions", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  totalFeatures: integer("total_features").default(0),
  processedFeatures: integer("processed_features").default(0),
  errorMessage: text("error_message"),
  geometryType: text("geometry_type"), // Point, Polygon, LineString
  createdAt: text("created_at").notNull(),
});

export const insertShapefileUploadSchema = createInsertSchema(shapefileUploads).omit({
  id: true,
});

export const insertBigqueryConfigSchema = createInsertSchema(bigqueryConfigs).omit({
  id: true,
});

export const insertSchemaFieldSchema = createInsertSchema(schemaFields).omit({
  id: true,
});

export const insertUploadSessionSchema = createInsertSchema(uploadSessions);

export type ShapefileUpload = typeof shapefileUploads.$inferSelect;
export type InsertShapefileUpload = z.infer<typeof insertShapefileUploadSchema>;

export type BigqueryConfig = typeof bigqueryConfigs.$inferSelect;
export type InsertBigqueryConfig = z.infer<typeof insertBigqueryConfigSchema>;

export type SchemaField = typeof schemaFields.$inferSelect;
export type InsertSchemaField = z.infer<typeof insertSchemaFieldSchema>;

export type UploadSession = typeof uploadSessions.$inferSelect;
export type InsertUploadSession = z.infer<typeof insertUploadSessionSchema>;
