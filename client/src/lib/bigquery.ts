// BigQuery utility functions and types for the frontend
export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  tableName: string;
  credentialsPath?: string;
}

export interface BigQuerySchema {
  fields: BigQueryField[];
}

export interface BigQueryField {
  name: string;
  type: string;
  mode: "REQUIRED" | "NULLABLE" | "REPEATED";
  description?: string;
}

export const BIGQUERY_DATA_TYPES = [
  "STRING",
  "INTEGER", 
  "FLOAT",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "GEOGRAPHY",
  "JSON",
  "BYTES",
  "NUMERIC",
  "BIGNUMERIC",
] as const;

export type BigQueryDataType = typeof BIGQUERY_DATA_TYPES[number];

export const BIGQUERY_MODES = ["REQUIRED", "NULLABLE", "REPEATED"] as const;

export type BigQueryMode = typeof BIGQUERY_MODES[number];

// Utility function to validate BigQuery table name
export const validateTableName = (tableName: string): boolean => {
  // BigQuery table names must be 1-1024 characters
  // Can contain letters, numbers, and underscores
  // Must start with a letter or underscore
  const tableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{0,1023}$/;
  return tableNameRegex.test(tableName);
};

// Utility function to validate BigQuery dataset ID
export const validateDatasetId = (datasetId: string): boolean => {
  // Dataset IDs must be 1-1024 characters
  // Can contain letters, numbers, and underscores
  // Must start with a letter or underscore
  const datasetIdRegex = /^[a-zA-Z_][a-zA-Z0-9_]{0,1023}$/;
  return datasetIdRegex.test(datasetId);
};

// Utility function to validate BigQuery project ID
export const validateProjectId = (projectId: string): boolean => {
  // Project IDs must be 6-30 characters
  // Can contain lowercase letters, numbers, and hyphens
  // Must start with a letter, cannot end with a hyphen
  const projectIdRegex = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
  return projectIdRegex.test(projectId);
};

// Function to generate a BigQuery schema from shapefile attributes
export const generateSchemaFromAttributes = (
  attributes: Record<string, any>
): BigQueryField[] => {
  const fields: BigQueryField[] = [];

  // Add geometry field first
  fields.push({
    name: "geometry",
    type: "GEOGRAPHY",
    mode: "REQUIRED",
    description: "Geospatial geometry data",
  });

  // Process attribute fields
  Object.entries(attributes).forEach(([key, value]) => {
    let type: BigQueryDataType = "STRING";

    // Determine type based on value
    if (typeof value === "number") {
      type = Number.isInteger(value) ? "INTEGER" : "FLOAT";
    } else if (typeof value === "boolean") {
      type = "BOOLEAN";
    } else if (value instanceof Date) {
      type = "DATETIME";
    }

    fields.push({
      name: key.toLowerCase().replace(/[^a-z0-9_]/g, "_"), // Sanitize field name
      type,
      mode: "NULLABLE",
      description: `Attribute field: ${key}`,
    });
  });

  return fields;
};

// Function to convert geometry to BigQuery GEOGRAPHY format
export const convertGeometryToBigQuery = (geometry: any): string => {
  if (!geometry) return "";

  try {
    // For now, convert to WKT format
    // In a full implementation, you'd use a proper geometry conversion library
    switch (geometry.type) {
      case "Point":
        const [lng, lat] = geometry.coordinates;
        return `POINT(${lng} ${lat})`;
      
      case "Polygon":
        const coords = geometry.coordinates[0]; // Outer ring
        const points = coords.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(", ");
        return `POLYGON((${points}))`;
      
      case "LineString":
        const linePoints = geometry.coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(", ");
        return `LINESTRING(${linePoints})`;
      
      default:
        return JSON.stringify(geometry);
    }
  } catch (error) {
    console.error("Error converting geometry:", error);
    return "";
  }
};
