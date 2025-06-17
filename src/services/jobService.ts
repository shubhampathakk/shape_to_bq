// Export both services - the app will choose based on configuration
import { jobService as mockJobService } from './mockJobService';
import { productionJobService } from './productionJobService';
import { configService } from './configService';
import { ProcessingConfig, Job } from '@/types';

// Dynamic service selector that checks configuration in real-time
class DynamicJobService {
  private getCurrentService() {
    const isProductionReady = configService.isRealProcessingEnabled();
    const config = configService.getConfig();

    console.log('🔧 DynamicJobService: Selecting service', {
      isProductionReady,
      authMethod: config.authMethod,
      hasServiceAccount: !!config.serviceAccountKey,
      hasApiKey: !!config.apiKey,
      enableRealProcessing: config.enableRealProcessing,
      serviceSelected: isProductionReady ? 'PRODUCTION' : 'MOCK'
    });

    if (isProductionReady) {
      console.log('✅ Using PRODUCTION service - real GCP operations will be performed');
      return productionJobService;
    } else {
      console.log('🎭 Using MOCK service - simulated operations for demonstration');

      // Log why mock mode is being used
      if (config.authMethod === 'service-account') {
        console.log('   Reason: Service account mode is not fully implemented in browser environment');
      } else if (!config.enableRealProcessing) {
        console.log('   Reason: Real processing is disabled in configuration');
      } else if (!config.apiKey) {
        console.log('   Reason: API key not configured for API Gateway mode');
      } else {
        console.log('   Reason: Production requirements not met');
      }

      return mockJobService;
    }
  }

  async createJob(config: ProcessingConfig, userId: string): Promise<Job> {
    const service = this.getCurrentService();
    const serviceType = service === productionJobService ? '🚀 PRODUCTION' : '🎭 MOCK';
    console.log(`${serviceType} service: Creating job`);

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

  // Helper method to check if we're in production mode
  isUsingProductionService(): boolean {
    return configService.isRealProcessingEnabled();
  }

  // Helper method to get current service info
  getServiceInfo(): {
    mode: 'production' | 'mock';
    authMethod: string;
    ready: boolean;
    warnings: string[];
  } {
    const config = configService.getConfig();
    const isProduction = this.isUsingProductionService();
    const warnings: string[] = [];

    if (config.authMethod === 'service-account' && config.enableRealProcessing) {
      warnings.push('Service account mode is not fully implemented for browser applications');
      warnings.push('JWT signing cannot be done securely in browsers');
      warnings.push('Consider using API Gateway mode or server-side authentication');
    }

    if (!isProduction && config.enableRealProcessing) {
      warnings.push('Real processing is enabled but requirements are not met');
    }

    return {
      mode: isProduction ? 'production' : 'mock',
      authMethod: config.authMethod || 'service-account',
      ready: isProduction,
      warnings
    };
  }
}

export const jobService = new DynamicJobService();

// Also export individual services for explicit use
export { mockJobService, productionJobService };