import { Job, JobStatus, ProcessingJob, ProcessingConfig } from '@/types';
import { bigqueryService } from './bigqueryService';
import { fileProcessingService } from './fileProcessingService';
import { gcsService } from './gcsService';
import { jobService as mockJobService } from './mockJobService';
import { configService } from './configService';

class ProductionJobService {
  private jobs: Map<string, ProcessingJob> = new Map();
  private jobUpdateCallbacks: Set<() => void> = new Set();

  private log(level: 'INFO' | 'WARN' | 'ERROR', jobId: string, message: string) {
    console.log(`[${level}] Job ${jobId}: ${message}`);
  }

  addJobUpdateCallback(callback: () => void) {
    this.jobUpdateCallbacks.add(callback);
  }

  removeJobUpdateCallback(callback: () => void) {
    this.jobUpdateCallbacks.delete(callback);
  }

  private notifyJobUpdate() {
    this.jobUpdateCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Job update callback error:', error);
      }
    });
  }

  private updateJobStatus(jobId: string, status: JobStatus, progress: number, error?: string) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      job.progress = progress;
      job.lastUpdated = new Date();
      if (error) {
        job.error = error;
      }
      this.log('INFO', jobId, `Status updated: ${status} (${progress}%)`);
      this.notifyJobUpdate();
    }
  }

  // New method that matches the interface expected by DynamicJobService
  async createJob(config: ProcessingConfig, userId: string): Promise<Job> {
    const jobId = `job_${Date.now()}`;

    console.log('🚀 ProductionJobService: Creating job with config:', config);

    // Validate input parameters
    if (!config.file && config.sourceType === 'local') {
      throw new Error('File is required for local file processing');
    }

    if (!config.file?.name && config.sourceType === 'local') {
      throw new Error('File name is required');
    }

    if (!config.gcpProjectId) {
      throw new Error('GCP Project ID is required');
    }

    if (!config.targetTable) {
      throw new Error('Target table is required');
    }

    // Parse dataset and table from targetTable (format: dataset.table)
    const [datasetId, tableId] = config.targetTable.split('.');
    if (!datasetId || !tableId) {
      throw new Error('Target table must be in format: dataset.table');
    }

    // For GCS source, validate bucket and path
    if (config.sourceType === 'gcs') {
      if (!config.gcsBucket) {
        throw new Error('GCS bucket is required for GCS source');
      }
      if (!config.gcsPath) {
        throw new Error('GCS path is required for GCS source');
      }
    }

    // Prepare schema - only use custom schema if it has fields
    const useCustomSchema = config.customSchema && config.customSchema.length > 0;
    const schema = useCustomSchema ? config.customSchema : undefined;

    console.log('📋 Schema processing:', {
      hasCustomSchema: !!config.customSchema,
      customSchemaLength: config.customSchema?.length || 0,
      useCustomSchema,
      finalSchema: schema?.length || 0
    });

    // Create job based on source type
    if (config.sourceType === 'local' && config.file) {
      return this.createJobFromFile(
        config.file,
        config.gcsPath || `uploads/${config.file.name}`,
        schema,
        datasetId,
        tableId
      );
    } else if (config.sourceType === 'gcs') {
      return this.createJobFromGCS(
        config.gcsBucket!,
        config.gcsPath!,
        schema,
        datasetId,
        tableId
      );
    } else {
      throw new Error('Invalid source type or missing file');
    }
  }

  // Original method for file-based processing
  async createJobFromFile(
  file: File,
  gcsPath: string,
  schema: any,
  datasetId: string,
  tableId: string)
  : Promise<Job> {
    const jobId = `job_${Date.now()}`;

    // Validate input parameters
    if (!file) {
      throw new Error('File parameter is required');
    }

    if (!file.name) {
      throw new Error('File name is required');
    }

    if (typeof file.size === 'undefined') {
      throw new Error('File size is undefined');
    }

    if (!gcsPath) {
      throw new Error('GCS path is required');
    }

    if (!datasetId) {
      throw new Error('Dataset ID is required');
    }

    if (!tableId) {
      throw new Error('Table ID is required');
    }

    const job: ProcessingJob = {
      id: jobId,
      fileName: file.name,
      fileSize: file.size,
      gcsPath,
      schema,
      datasetId,
      tableId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.jobs.set(jobId, job);
    this.log('INFO', jobId, `Job created for file: ${file.name} (${file.size} bytes)`);
    this.notifyJobUpdate();

    // Start processing asynchronously
    this.processFileJob(jobId, file, gcsPath, schema, datasetId, tableId).catch((error) => {
      this.log('ERROR', jobId, `Job processing failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
    });

    return this.convertToJob(job);
  }

  // New method for GCS-based processing
  async createJobFromGCS(
  gcsBucket: string,
  gcsPath: string,
  schema: any,
  datasetId: string,
  tableId: string)
  : Promise<Job> {
    const jobId = `job_${Date.now()}`;

    const job: ProcessingJob = {
      id: jobId,
      fileName: gcsPath.split('/').pop() || 'unknown',
      fileSize: 0, // Unknown for GCS files
      gcsPath: `gs://${gcsBucket}/${gcsPath}`,
      schema,
      datasetId,
      tableId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.jobs.set(jobId, job);
    this.log('INFO', jobId, `Job created for GCS file: gs://${gcsBucket}/${gcsPath}`);
    this.notifyJobUpdate();

    // Start processing asynchronously
    this.processGCSJob(jobId, gcsBucket, gcsPath, schema, datasetId, tableId).catch((error) => {
      this.log('ERROR', jobId, `Job processing failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
    });

    return this.convertToJob(job);
  }

  private async processFileJob(
  jobId: string,
  file: File,
  gcsPath: string,
  schema: any,
  datasetId: string,
  tableId: string)
  : Promise<void> {
    try {
      this.log('INFO', jobId, 'Starting job processing...');

      // Validate parameters again
      if (!file) {
        throw new Error('File parameter is undefined in processJob');
      }

      if (!file.name) {
        throw new Error('File name is undefined in processJob');
      }

      this.updateJobStatus(jobId, 'uploading', 10);

      // Step 1: Upload original file to GCS
      this.log('INFO', jobId, 'Uploading file to GCS...');
      try {
        await gcsService.uploadFile(file, gcsPath);
        this.log('INFO', jobId, 'File uploaded to GCS successfully');
      } catch (uploadError) {
        // Continue even if upload fails (file might already exist)
        this.log('WARN', jobId, `GCS upload warning: ${uploadError}`);
      }

      this.updateJobStatus(jobId, 'processing', 30);

      // Step 2: Process the file
      this.log('INFO', jobId, 'Processing file...');
      let processedFileUrl: string;
      let recordCount: number;

      try {
        const processingResult = await fileProcessingService.processFile(
          file,
          schema,
          (progress) => {
            // Update progress during file processing (30-60%)
            const adjustedProgress = 30 + progress * 0.3;
            this.updateJobStatus(jobId, 'processing', adjustedProgress);
          }
        );

        processedFileUrl = processingResult.processedFileUrl;
        recordCount = processingResult.recordCount;
        this.log('INFO', jobId, `File processed successfully. Records: ${recordCount}`);
      } catch (processingError) {
        throw new Error(`File processing failed: ${processingError.message}`);
      }

      this.updateJobStatus(jobId, 'loading', 70);

      // Step 3: Create dataset and table (only if we have a custom schema)
      if (schema && schema.length > 0) {
        this.log('INFO', jobId, 'Creating BigQuery dataset and table with custom schema...');
        try {
          const config = configService.getConfig();
          const bigQueryConfig = {
            projectId: config.gcpProjectId || 'gcve-demo-408018',
            datasetId,
            tableId
          };

          await bigqueryService.createTable(bigQueryConfig, schema);
          this.log('INFO', jobId, 'Table created successfully with custom schema');
        } catch (tableError) {
          // Continue if table already exists
          if (tableError.message?.includes('409') || tableError.message?.includes('already exists')) {
            this.log('INFO', jobId, 'Table already exists, continuing...');
          } else {
            throw new Error(`Table creation failed: ${tableError.message}`);
          }
        }
      } else {
        this.log('INFO', jobId, 'Skipping table creation - will use BigQuery auto-detect schema');
      }

      this.updateJobStatus(jobId, 'loading', 80);

      // Step 4: Validate processed file exists
      this.log('INFO', jobId, 'Validating processed file...');
      const fileExists = await fileProcessingService.validateProcessedFile(processedFileUrl);
      if (!fileExists) {
        throw new Error(`Processed file not found: ${processedFileUrl}`);
      }

      // Step 5: Load data to BigQuery
      this.log('INFO', jobId, 'Loading data to BigQuery...');
      try {
        const config = configService.getConfig();
        const bigQueryConfig = {
          projectId: config.gcpProjectId || 'gcve-demo-408018',
          datasetId,
          tableId
        };

        console.log('🎯 Loading data with schema configuration:', {
          hasSchema: schema && schema.length > 0,
          schemaFields: schema?.length || 0,
          willAutoDetect: !schema || schema.length === 0
        });

        const loadJobId = await bigqueryService.loadDataFromGCS(
          bigQueryConfig,
          processedFileUrl,
          schema && schema.length > 0 ? schema : undefined
        );
        this.log('INFO', jobId, `BigQuery load job started: ${loadJobId}`);

        // Step 6: Monitor BigQuery job
        this.updateJobStatus(jobId, 'loading', 90);
        await this.monitorBigQueryJob(jobId, loadJobId);

        // Update job with final details
        const job = this.jobs.get(jobId);
        if (job) {
          job.bigQueryJobId = loadJobId;
          job.recordCount = recordCount;
          job.processedFileUrl = processedFileUrl;
        }

        this.updateJobStatus(jobId, 'completed', 100);
        this.log('INFO', jobId, 'Job completed successfully');

      } catch (loadError) {
        throw new Error(`BigQuery load failed: ${loadError.message}`);
      }

    } catch (error) {
      this.log('ERROR', jobId, `Job failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
      throw error;
    }
  }

  private async processGCSJob(
  jobId: string,
  gcsBucket: string,
  gcsPath: string,
  schema: any,
  datasetId: string,
  tableId: string)
  : Promise<void> {
    try {
      this.log('INFO', jobId, 'Starting GCS job processing...');

      const fullGcsPath = `gs://${gcsBucket}/${gcsPath}`;

      this.updateJobStatus(jobId, 'processing', 20);

      // Step 1: Create dataset and table (only if we have a custom schema)
      if (schema && schema.length > 0) {
        this.log('INFO', jobId, 'Creating BigQuery dataset and table with custom schema...');
        try {
          const config = configService.getConfig();
          const bigQueryConfig = {
            projectId: config.gcpProjectId || 'gcve-demo-408018',
            datasetId,
            tableId
          };

          await bigqueryService.createTable(bigQueryConfig, schema);
          this.log('INFO', jobId, 'Table created successfully with custom schema');
        } catch (tableError) {
          // Continue if table already exists
          if (tableError.message?.includes('409') || tableError.message?.includes('already exists')) {
            this.log('INFO', jobId, 'Table already exists, continuing...');
          } else {
            throw new Error(`Table creation failed: ${tableError.message}`);
          }
        }
      } else {
        this.log('INFO', jobId, 'Skipping table creation - will use BigQuery auto-detect schema');
      }

      this.updateJobStatus(jobId, 'loading', 50);

      // Step 2: Load data directly from GCS to BigQuery
      this.log('INFO', jobId, 'Loading data from GCS to BigQuery...');
      try {
        const config = configService.getConfig();
        const bigQueryConfig = {
          projectId: config.gcpProjectId || 'gcve-demo-408018',
          datasetId,
          tableId
        };

        const loadJobId = await bigqueryService.loadDataFromGCS(
          bigQueryConfig,
          fullGcsPath,
          schema && schema.length > 0 ? schema : undefined
        );
        this.log('INFO', jobId, `BigQuery load job started: ${loadJobId}`);

        // Step 3: Monitor BigQuery job
        this.updateJobStatus(jobId, 'loading', 80);
        await this.monitorBigQueryJob(jobId, loadJobId);

        // Update job with final details
        const job = this.jobs.get(jobId);
        if (job) {
          job.bigQueryJobId = loadJobId;
          job.processedFileUrl = fullGcsPath;
        }

        this.updateJobStatus(jobId, 'completed', 100);
        this.log('INFO', jobId, 'GCS job completed successfully');

      } catch (loadError) {
        throw new Error(`BigQuery load failed: ${loadError.message}`);
      }

    } catch (error) {
      this.log('ERROR', jobId, `GCS job failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
      throw error;
    }
  }

  private async monitorBigQueryJob(jobId: string, bigQueryJobId: string): Promise<void> {
    const maxAttempts = 15;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const jobStatus = await bigqueryService.getJobStatus(bigQueryJobId);

        if (jobStatus.status === 'DONE') {
          if (jobStatus.errors && jobStatus.errors.length > 0) {
            const errorMessage = jobStatus.errors.map((e) => e.message).join(', ');
            throw new Error(`BigQuery job failed: ${errorMessage}`);
          }
          this.log('INFO', jobId, 'BigQuery job completed successfully');
          return;
        }

        this.log('INFO', jobId, `BigQuery job status: ${jobStatus.status} (attempt ${attempts})`);

        // Wait before next check
        await new Promise((resolve) => setTimeout(resolve, 2000));

      } catch (error) {
        this.log('WARN', jobId, `Failed to check job status (attempt ${attempts}): ${error.message}`);

        if (attempts >= maxAttempts) {
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    throw new Error('BigQuery job monitoring timeout');
  }

  // Convert ProcessingJob to Job interface
  private convertToJob(processingJob: ProcessingJob): Job {
    return {
      id: processingJob.id,
      userId: 'system', // Add default userId
      fileName: processingJob.fileName,
      status: processingJob.status,
      progress: processingJob.progress,
      createdAt: processingJob.createdAt,
      updatedAt: processingJob.lastUpdated,
      error: processingJob.error,
      result: processingJob.recordCount ? {
        recordCount: processingJob.recordCount,
        processedFileUrl: processingJob.processedFileUrl,
        bigQueryJobId: processingJob.bigQueryJobId
      } : undefined
    };
  }

  // Interface methods to match mockJobService
  async getJobs(userId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).
    map((job) => this.convertToJob(job)).
    sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJob(jobId: string): Promise<Job | null> {
    const processingJob = this.jobs.get(jobId);
    return processingJob ? this.convertToJob(processingJob) : null;
  }

  subscribeToJobUpdates(jobId: string, callback: (job: Job) => void): () => void {
    const updateCallback = () => {
      const processingJob = this.jobs.get(jobId);
      if (processingJob) {
        callback(this.convertToJob(processingJob));
      }
    };

    this.addJobUpdateCallback(updateCallback);

    return () => {
      this.removeJobUpdateCallback(updateCallback);
    };
  }

  // Legacy methods for backward compatibility
  async getJobLegacy(jobId: string): Promise<ProcessingJob | undefined> {
    return this.jobs.get(jobId);
  }

  async getAllJobs(): Promise<ProcessingJob[]> {
    return Array.from(this.jobs.values()).sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteJob(jobId: string): Promise<void> {
    if (this.jobs.delete(jobId)) {
      this.log('INFO', jobId, 'Job deleted');
      this.notifyJobUpdate();
    }
  }

  async retryJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'pending' || job.status === 'uploading' || job.status === 'processing' || job.status === 'loading') {
      throw new Error('Job is already in progress');
    }

    this.log('INFO', jobId, 'Retrying job...');
    job.status = 'pending';
    job.progress = 0;
    job.error = undefined;
    job.lastUpdated = new Date();
    this.notifyJobUpdate();

    // Create a new file object (this is a limitation - in real app, we'd store the file)
    // For now, we'll just update the status to show retry attempt
    this.updateJobStatus(jobId, 'failed', 0, 'Retry not supported - original file not available. Please upload the file again.');
  }

  // Get job statistics
  async getJobStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  }> {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      inProgress: jobs.filter((j) =>
      j.status === 'pending' ||
      j.status === 'uploading' ||
      j.status === 'processing' ||
      j.status === 'loading'
      ).length
    };
  }
}

export const productionJobService = new ProductionJobService();