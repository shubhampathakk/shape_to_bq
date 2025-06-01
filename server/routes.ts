import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { BigQuery } from "@google-cloud/bigquery";
import shpjs from "shpjs";
import { insertBigqueryConfigSchema, insertSchemaFieldSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create upload session
  app.post("/api/upload-session", async (req, res) => {
    try {
      const sessionId = nanoid();
      const session = await storage.createUploadSession({
        id: sessionId,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create upload session" });
    }
  });

  // Upload shapefile components
  app.post("/api/upload/:sessionId/files", upload.array("files", 4), async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploads = [];
      for (const file of files) {
        const upload = await storage.createShapefileUpload({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          fileType: path.extname(file.originalname).toLowerCase().slice(1),
          uploadId: sessionId,
          filePath: file.path,
        });
        uploads.push(upload);
      }

      await storage.updateUploadSession(sessionId, { status: "uploaded" });
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Get upload session status
  app.get("/api/upload-session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getUploadSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const files = await storage.getShapefileUploadsByUploadId(sessionId);
      res.json({ session, files });
    } catch (error) {
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  // Parse shapefile and detect schema
  app.post("/api/upload/:sessionId/parse", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = await storage.getShapefileUploadsByUploadId(sessionId);

      // Find the .shp file
      const shpFile = files.find(f => f.fileType === "shp");
      if (!shpFile) {
        return res.status(400).json({ error: "No .shp file found" });
      }

      // Parse the shapefile
      const shpBuffer = fs.readFileSync(shpFile.filePath);
      const geojson = await shpjs(shpBuffer);

      if (!geojson.features || geojson.features.length === 0) {
        return res.status(400).json({ error: "No features found in shapefile" });
      }

      // Detect schema from properties
      const firstFeature = geojson.features[0];
      const schemaFields = [];

      // Add geometry field
      schemaFields.push({
        uploadId: sessionId,
        fieldName: "geometry",
        fieldType: "GEOGRAPHY",
        mode: "REQUIRED",
        isAutoDetected: true,
      });

      // Detect property fields
      if (firstFeature.properties) {
        for (const [key, value] of Object.entries(firstFeature.properties)) {
          let fieldType = "STRING";
          
          if (typeof value === "number") {
            fieldType = Number.isInteger(value) ? "INTEGER" : "FLOAT";
          } else if (typeof value === "boolean") {
            fieldType = "BOOLEAN";
          }

          schemaFields.push({
            uploadId: sessionId,
            fieldName: key,
            fieldType,
            mode: "NULLABLE",
            isAutoDetected: true,
          });
        }
      }

      // Save detected schema
      await storage.createSchemaFields(schemaFields);

      // Update session with feature count and geometry type
      const geometryType = firstFeature.geometry?.type || "Unknown";
      await storage.updateUploadSession(sessionId, {
        status: "parsed",
        totalFeatures: geojson.features.length,
        geometryType,
      });

      res.json({
        featureCount: geojson.features.length,
        geometryType,
        schema: schemaFields,
        preview: geojson.features.slice(0, 5), // First 5 features for preview
      });
    } catch (error) {
      console.error("Parse error:", error);
      await storage.updateUploadSession(sessionId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Parse failed",
      });
      res.status(500).json({ error: "Failed to parse shapefile" });
    }
  });

  // Save BigQuery configuration
  app.post("/api/upload/:sessionId/bigquery-config", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const validatedConfig = insertBigqueryConfigSchema.parse({
        ...req.body,
        uploadId: sessionId,
      });

      const config = await storage.createBigqueryConfig(validatedConfig);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Invalid BigQuery configuration" });
    }
  });

  // Update schema fields (for manual schema editing)
  app.put("/api/upload/:sessionId/schema", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { fields } = req.body;

      // Delete existing fields
      await storage.deleteSchemaFieldsByUploadId(sessionId);

      // Create new fields
      const validatedFields = fields.map((field: any) =>
        insertSchemaFieldSchema.parse({ ...field, uploadId: sessionId, isAutoDetected: false })
      );

      const newFields = await storage.createSchemaFields(validatedFields);
      res.json(newFields);
    } catch (error) {
      res.status(400).json({ error: "Invalid schema fields" });
    }
  });

  // Get schema fields
  app.get("/api/upload/:sessionId/schema", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const fields = await storage.getSchemaFieldsByUploadId(sessionId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: "Failed to get schema" });
    }
  });

  // Upload to BigQuery
  app.post("/api/upload/:sessionId/to-bigquery", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Get session, files, config, and schema
      const session = await storage.getUploadSession(sessionId);
      const files = await storage.getShapefileUploadsByUploadId(sessionId);
      const config = await storage.getBigqueryConfigByUploadId(sessionId);
      const schemaFields = await storage.getSchemaFieldsByUploadId(sessionId);

      if (!session || !config || schemaFields.length === 0) {
        return res.status(400).json({ error: "Missing required data for BigQuery upload" });
      }

      // Update session status
      await storage.updateUploadSession(sessionId, { status: "processing" });

      // Initialize BigQuery client
      // In App Engine, authentication is automatic using the service account
      // For local development, use GOOGLE_APPLICATION_CREDENTIALS
      const bigquery = new BigQuery({
        projectId: config.projectId,
        ...(process.env.GOOGLE_APPLICATION_CREDENTIALS && {
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        }),
      });

      // Find the .shp file and parse it
      const shpFile = files.find(f => f.fileType === "shp");
      if (!shpFile) {
        throw new Error("No .shp file found");
      }

      const shpBuffer = fs.readFileSync(shpFile.filePath);
      const geojson = await shpjs(shpBuffer);

      // Create BigQuery schema
      const bqSchema = schemaFields.map(field => ({
        name: field.fieldName,
        type: field.fieldType,
        mode: field.mode,
      }));

      // Create dataset if it doesn't exist
      const dataset = bigquery.dataset(config.datasetId);
      const [datasetExists] = await dataset.exists();
      if (!datasetExists) {
        await dataset.create();
      }

      // Create table
      const table = dataset.table(config.tableName);
      const [tableExists] = await table.exists();
      if (tableExists) {
        await table.delete();
      }

      await table.create({
        schema: bqSchema,
        location: "US",
      });

      // Prepare data for insertion
      const rows = geojson.features.map((feature: any) => {
        const row: any = {};
        
        // Add geometry as WKT
        if (feature.geometry) {
          row.geometry = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`;
        }

        // Add properties
        if (feature.properties) {
          Object.assign(row, feature.properties);
        }

        return row;
      });

      // Insert data in batches
      const batchSize = 1000;
      let processedFeatures = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await table.insert(batch);
        
        processedFeatures += batch.length;
        await storage.updateUploadSession(sessionId, {
          processedFeatures,
        });
      }

      // Update final status
      await storage.updateUploadSession(sessionId, {
        status: "completed",
        processedFeatures: rows.length,
      });

      res.json({
        success: true,
        tableId: `${config.projectId}.${config.datasetId}.${config.tableName}`,
        rowsInserted: rows.length,
      });

    } catch (error) {
      console.error("BigQuery upload error:", error);
      await storage.updateUploadSession(sessionId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Upload failed",
      });
      res.status(500).json({ error: "Failed to upload to BigQuery" });
    }
  });

  // Get recent upload sessions
  app.get("/api/recent-uploads", async (req, res) => {
    try {
      const sessions = await storage.getAllUploadSessions();
      res.json(sessions.slice(0, 10)); // Return last 10 sessions
    } catch (error) {
      res.status(500).json({ error: "Failed to get recent uploads" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
