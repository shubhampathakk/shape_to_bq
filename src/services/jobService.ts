// Export both services - the app will choose based on configuration
import { jobService as mockJobService } from './mockJobService';
import { productionJobService } from './productionJobService';
import { configService } from './configService';
import { ProcessingConfig, Job } from '@/types';

// Dynamic service selector that checks configuration in real-time
class DynamicJobService {
  private getCurrentService() {
    const isProductionReady = configService.isRealProcessingEnabled();
    console.log('DynamicJobService: Selecting service', {
      isProductionReady,
      authMethod: configService.getAuthMethod(),
      hasServiceAccount: !!configService.getServiceAccountKey(),
      enableRealProcessing: configService.getConfig().enableRealProcessing
    });

    return isProductionReady ? productionJobService : mockJobService;
  }

  async createJob(config: ProcessingConfig, userId: string): Promise<Job> {
    const service = this.getCurrentService();
    console.log('Creating job with service:', service === productionJobService ? 'production' : 'mock');
    return service.createJob(config, userId);
  }

  async getJobs(userId: string): Promise<Job[]> {
    const service = this.getCurrentService();
    return service.getJobs(userId);
  }

  async getJob(jobId: string): Promise<Job | null> {
    const service = this.getCurrentService();
    return service.getJob(jobId);
  }

  subscribeToJobUpdates(jobId: string, callback: (job: Job) => void): () => void {
    const service = this.getCurrentService();
    return service.subscribeToJobUpdates(jobId, callback);
  }
}

export const jobService = new DynamicJobService();

// Also export individual services for explicit use
export { mockJobService, productionJobService };