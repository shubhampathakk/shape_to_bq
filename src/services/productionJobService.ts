import { Job, JobStatus, ProcessingJob, ProcessingConfig, JobLog, SchemaField } from '@/types';
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
    const job = this.jobs.get(jobId);
    if (job) {
      job.logs.push({ timestamp: new Date(), level: level.toLowerCase() as 'info' | 'warn' | 'error', message });
      this.notifyJobUpdate();
    }
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

  async createJob(config: ProcessingConfig, userId: string): Promise<Job> {
    const jobId = `job_${Date.now()}`;

    console.log('噫 ProductionJobService: Creating job with config:', config);

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

    const [datasetId, tableId] = config.targetTable.split('.');
    if (!datasetId || !tableId) {
      throw new Error('Target table must be in format: dataset.table');
    }

    if (config.sourceType === 'gcs') {
      if (!config.gcsBucket) {
        throw new Error('GCS bucket is required for GCS source');
      }
      if (!config.gcsPath) {
        throw new Error('GCS path is required for GCS source');
      }
    }

    const useCustomSchema = config.customSchema && config.customSchema.length > 0;
    const schema = useCustomSchema ? config.customSchema : undefined;

    console.log('搭 Schema processing:', {
      hasCustomSchema: !!config.customSchema,
      customSchemaLength: config.customSchema?.length || 0,
      useCustomSchema,
      finalSchema: schema?.length || 0
    });

    if (config.sourceType === 'local' && config.file) {
      return this.createJobFromFile(
        config.file,
        config.gcsBucket || configService.getDefaultBucket(),
        config.gcsPath || `uploads/${config.file.name}`,
        schema,
        datasetId,
        tableId,
        config.gcpProjectId,
        config.sourceType
      );
    } else if (config.sourceType === 'gcs') {
      return this.createJobFromGCS(
        config.gcsBucket!,
        config.gcsPath!,
        schema,
        datasetId,
        tableId,
        config.gcpProjectId,
        config.sourceType
      );
    } else {
      throw new Error('Invalid source type or missing file');
    }
  }

  async createJobFromFile(
    file: File,
    gcsBucket: string,
    gcsPath: string,
    schema: any,
    datasetId: string,
    tableId: string,
    gcpProjectId: string,
    sourceType: 'local' | 'gcs'
  ): Promise<Job> {
    const jobId = `job_${Date.now()}`;

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
      lastUpdated: new Date(),
      logs: [],
      gcpProjectId,
      sourceType,
    };

    this.jobs.set(jobId, job);
    this.log('INFO', jobId, `Job created for file: ${file.name} (${file.size} bytes)`);
    this.notifyJobUpdate();

    this.processFileJob(jobId, file, gcsBucket, gcsPath, schema, datasetId, tableId).catch((error) => {
      this.log('ERROR', jobId, `Job processing failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
    });

    return this.convertToJob(job);
  }

  async createJobFromGCS(
    gcsBucket: string,
    gcsPath: string,
    schema: any,
    datasetId: string,
    tableId: string,
    gcpProjectId: string,
    sourceType: 'local' | 'gcs'
  ): Promise<Job> {
    const jobId = `job_${Date.now()}`;

    const job: ProcessingJob = {
      id: jobId,
      fileName: gcsPath.split('/').pop() || 'unknown',
      fileSize: 0,
      gcsPath: `gs://${gcsBucket}/${gcsPath}`,
      schema,
      datasetId,
      tableId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      lastUpdated: new Date(),
      logs: [],
      gcpProjectId,
      sourceType,
    };

    this.jobs.set(jobId, job);
    this.log('INFO', jobId, `Job created for GCS file: gs://${gcsBucket}/${gcsPath}`);
    this.notifyJobUpdate();

    this.processGCSJob(jobId, gcsBucket, gcsPath, schema, datasetId, tableId).catch((error) => {
      this.log('ERROR', jobId, `Job processing failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
    });

    return this.convertToJob(job);
  }

  private async processFileJob(
  jobId: string,
  file: File,
  gcsBucket: string,
  gcsPath: string,
  schema: any,
  datasetId: string,
  tableId: string)
  : Promise<void> {
    try {
      this.log('INFO', jobId, 'Starting job processing...');

      this.updateJobStatus(jobId, 'uploading', 10);

      this.log('INFO', jobId, 'Uploading file to GCS...');
      try {
        await gcsService.uploadFile(file, gcsBucket, gcsPath);
        this.log('INFO', jobId, 'File uploaded to GCS successfully');
      } catch (uploadError) {
        this.log('WARN', jobId, `GCS upload warning: ${uploadError}`);
      }

      this.updateJobStatus(jobId, 'processing', 30);

      this.log('INFO', jobId, 'Processing file...');
      const processingResult = await fileProcessingService.processFile(
        file,
        schema,
        (progress) => {
          const adjustedProgress = 30 + progress * 0.3;
          this.updateJobStatus(jobId, 'processing', adjustedProgress);
        }
      );

      this.log('INFO', jobId, `File processed successfully. Records: ${processingResult.recordCount}`);

      this.updateJobStatus(jobId, 'loading', 70);

      let schemaToUse = schema;
      if (!schemaToUse) {
        this.log('INFO', jobId, 'Auto-detecting schema from processed file.');
        schemaToUse = processingResult.schema;
      }

      if (schemaToUse && schemaToUse.length > 0) {
        this.log('INFO', jobId, 'Creating BigQuery dataset and table with custom schema...');
        try {
          const config = configService.getConfig();
          const bigQueryConfig = {
            projectId: config.gcpProjectId || 'gcve-demo-408018',
            datasetId,
            tableId
          };

          await bigqueryService.createTable(bigQueryConfig, schemaToUse);
          this.log('INFO', jobId, 'Table created successfully with custom schema');
        } catch (tableError) {
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

      this.log('INFO', jobId, 'Validating processed file...');
      const fileExists = await fileProcessingService.validateProcessedFile(processingResult.processedFileUrl);
      if (!fileExists) {
        throw new Error(`Processed file not found: ${processingResult.processedFileUrl}`);
      }

      this.log('INFO', jobId, 'Loading data to BigQuery...');
      const config = configService.getConfig();
      const bigQueryConfig = {
        projectId: config.gcpProjectId || 'gcve-demo-408018',
        datasetId,
        tableId
      };

      console.log('識 Loading data with schema configuration:', {
        hasSchema: schemaToUse && schemaToUse.length > 0,
        schemaFields: schemaToUse?.length || 0,
        willAutoDetect: !schemaToUse || schemaToUse.length === 0
      });

      const loadJobId = await bigqueryService.loadDataFromGCS(
        bigQueryConfig,
        processingResult.processedFileUrl,
        schemaToUse
      );
      this.log('INFO', jobId, `BigQuery load job started: ${loadJobId}`);

      this.updateJobStatus(jobId, 'loading', 90);
      await this.monitorBigQueryJob(jobId, loadJobId);

      const job = this.jobs.get(jobId);
      if (job) {
        job.bigQueryJobId = loadJobId;
        job.recordCount = processingResult.recordCount;
        job.processedFileUrl = processingResult.processedFileUrl;
      }

      this.updateJobStatus(jobId, 'completed', 100);
      this.log('INFO', jobId, 'Job completed successfully');

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

      this.log('INFO', jobId, 'Loading data from GCS to BigQuery...');
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

      this.updateJobStatus(jobId, 'loading', 80);
      await this.monitorBigQueryJob(jobId, loadJobId);

      const job = this.jobs.get(jobId);
      if (job) {
        job.bigQueryJobId = loadJobId;
        job.processedFileUrl = fullGcsPath;
      }

      this.updateJobStatus(jobId, 'completed', 100);
      this.log('INFO', jobId, 'GCS job completed successfully');

    } catch (error) {
      this.log('ERROR', jobId, `GCS job failed: ${error.message}`);
      this.updateJobStatus(jobId, 'failed', 0, error.message);
      throw error;
    }
  }

  private async monitorBigQueryJob(jobId: string, bigQueryJobId: string): Promise<void> {
    const maxAttempts = 30; // Increased attempts
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

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Increased delay

      } catch (error) {
        this.log('WARN', jobId, `Failed to check job status (attempt ${attempts}): ${error.message}`);

        if (attempts >= maxAttempts) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    throw new Error('BigQuery job monitoring timeout');
  }

  private convertToJob(processingJob: ProcessingJob): Job {
    return {
      id: processingJob.id,
      userId: 'system',
      fileName: processingJob.fileName,
      status: processingJob.status,
      progress: processingJob.progress,
      startTime: processingJob.createdAt,
      endTime: processingJob.status === 'completed' || processingJob.status === 'failed' ? processingJob.lastUpdated : undefined,
      errorMessage: processingJob.error,
      sourceType: processingJob.sourceType,
      gcpProjectId: processingJob.gcpProjectId,
      targetTable: `${processingJob.datasetId}.${processingJob.tableId}`,
      logs: processingJob.logs,
      bigQueryJobId: processingJob.bigQueryJobId,
    };
  }

  async getJobs(userId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).
    map((job) => this.convertToJob(job)).
    sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
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

    this.updateJobStatus(jobId, 'failed', 0, 'Retry not supported - original file not available. Please upload the file again.');
  }

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