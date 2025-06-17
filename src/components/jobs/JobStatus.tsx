
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Job } from '@/types';
import { jobService } from '@/services/jobService';
import { configService } from '@/services/configService';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Database,
  FileText,
  Eye,
  AlertTriangle,
  ExternalLink,
  Zap } from
'lucide-react';
import { format } from 'date-fns';

interface JobStatusProps {
  jobs: Job[];
  onJobsUpdate: (jobs: Job[]) => void;
}

const JobStatus: React.FC<JobStatusProps> = ({ jobs, onJobsUpdate }) => {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [isRealProcessingEnabled, setIsRealProcessingEnabled] = useState(false);

  useEffect(() => {
    // Check if real processing is enabled
    const checkRealProcessing = () => {
      setIsRealProcessingEnabled(configService.isRealProcessingEnabled());
    };

    // Initial check
    checkRealProcessing();

    // Check periodically in case configuration changes
    const interval = setInterval(checkRealProcessing, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    jobs.forEach((job) => {
      if (job.status !== 'completed' && job.status !== 'failed') {
        const unsubscribe = jobService.subscribeToJobUpdates(job.id, (updatedJob) => {
          onJobsUpdate(jobs.map((j) => j.id === updatedJob.id ? updatedJob : j));
        });
        unsubscribeFunctions.push(unsubscribe);
      }
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [jobs, onJobsUpdate]);

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" data-id="p8w7st0yt" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'converting':
      case 'reading':
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" data-id="wngau3wj6" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" data-id="pd5qs13ie" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'failed':
        return <XCircle className="h-4 w-4" data-id="izojxfrny" data-path="src/components/jobs/JobStatus.tsx" />;
      default:
        return <AlertCircle className="h-4 w-4" data-id="vbycy5hkr" data-path="src/components/jobs/JobStatus.tsx" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'queued':
        return 'bg-gray-100 text-gray-800';
      case 'converting':
      case 'reading':
      case 'loading':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getJobStatusMessage = (job: Job) => {
    if (job.status === 'completed') {
      if (isRealProcessingEnabled) {
        return '🎉 Job completed successfully! Data has been loaded to BigQuery.';
      } else {
        return 'Job completed successfully (Demo mode - no actual data loaded)';
      }
    }
    if (job.status === 'failed') {
      return job.errorMessage || 'Job failed with unknown error';
    }
    return `Processing: ${job.status}...`;
  };

  if (jobs.length === 0) {
    return (
      <Card data-id="vl8fvf2tl" data-path="src/components/jobs/JobStatus.tsx">
        <CardContent className="p-6 text-center" data-id="0n8gt59mf" data-path="src/components/jobs/JobStatus.tsx">
          <div className="text-gray-400 mb-2" data-id="p24hbtbm8" data-path="src/components/jobs/JobStatus.tsx">
            <Database className="h-12 w-12 mx-auto" data-id="2jv5t757g" data-path="src/components/jobs/JobStatus.tsx" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1" data-id="iodjnrnwe" data-path="src/components/jobs/JobStatus.tsx">No jobs yet</h3>
          <p className="text-gray-500" data-id="yr0xxqc63" data-path="src/components/jobs/JobStatus.tsx">Your processing jobs will appear here</p>
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-4" data-id="ps6hwn7v9" data-path="src/components/jobs/JobStatus.tsx">
      <div className="flex items-center justify-between" data-id="60eu818i6" data-path="src/components/jobs/JobStatus.tsx">
        <h2 className="text-lg font-semibold" data-id="lrwkv0xzl" data-path="src/components/jobs/JobStatus.tsx">Processing Jobs</h2>
        <div className="flex items-center gap-2" data-id="nytvudcjv" data-path="src/components/jobs/JobStatus.tsx">
          <Badge variant="outline" data-id="xrr593gdd" data-path="src/components/jobs/JobStatus.tsx">{jobs.length} total</Badge>
          {isRealProcessingEnabled ?
          <Badge className="bg-green-100 text-green-800" data-id="7mz6854j3" data-path="src/components/jobs/JobStatus.tsx">
              <Zap className="h-3 w-3 mr-1" data-id="wj0342zig" data-path="src/components/jobs/JobStatus.tsx" />
              Production Mode
            </Badge> :
          <Badge variant="secondary" data-id="cnaf7spvr" data-path="src/components/jobs/JobStatus.tsx">Demo Mode</Badge>
          }
        </div>
      </div>

      {/* Mode Alert - only show if in demo mode */}
      {!isRealProcessingEnabled &&
      <Alert data-id="397nnylg3" data-path="src/components/jobs/JobStatus.tsx">
          <AlertTriangle className="h-4 w-4" data-id="p4ztur0gb" data-path="src/components/jobs/JobStatus.tsx" />
          <AlertDescription data-id="plsumzzzl" data-path="src/components/jobs/JobStatus.tsx">
            <strong data-id="mx214z65m" data-path="src/components/jobs/JobStatus.tsx">Demo Mode Active:</strong> Jobs show as "completed" but no actual data is loaded to BigQuery. 
            To enable real processing, configure your production settings and test connections in the Diagnostics tab.
          </AlertDescription>
        </Alert>
      }

      {/* Production Mode Success Alert */}
      {isRealProcessingEnabled && jobs.some((job) => job.status === 'completed') &&
      <Alert className="border-green-200 bg-green-50" data-id="kyckyeg50" data-path="src/components/jobs/JobStatus.tsx">
          <CheckCircle className="h-4 w-4 text-green-600" data-id="o8wph5vpo" data-path="src/components/jobs/JobStatus.tsx" />
          <AlertDescription data-id="ee1c3qq6t" data-path="src/components/jobs/JobStatus.tsx">
            <strong data-id="ki835luwi" data-path="src/components/jobs/JobStatus.tsx">Production Mode Active:</strong> Your jobs are processing real data and loading to BigQuery. 
            Check the BigQuery console to view your data.
          </AlertDescription>
        </Alert>
      }

      <div className="space-y-3" data-id="a02mv7xdt" data-path="src/components/jobs/JobStatus.tsx">
        {jobs.map((job) =>
        <Card key={job.id} className="transition-all duration-200 hover:shadow-md" data-id="atqrf3fuz" data-path="src/components/jobs/JobStatus.tsx">
            <CardContent className="p-4" data-id="adb6bw3uk" data-path="src/components/jobs/JobStatus.tsx">
              <div className="flex items-center justify-between mb-3" data-id="z11fw85qa" data-path="src/components/jobs/JobStatus.tsx">
                <div className="flex items-center space-x-3" data-id="kyesrugwj" data-path="src/components/jobs/JobStatus.tsx">
                  <div className={`p-1 rounded-full ${getStatusColor(job.status)}`} data-id="o9rpd3zyt" data-path="src/components/jobs/JobStatus.tsx">
                    {getStatusIcon(job.status)}
                  </div>
                  <div data-id="zxph7cfxj" data-path="src/components/jobs/JobStatus.tsx">
                    <h3 className="font-medium text-gray-900" data-id="lv2p8vh4u" data-path="src/components/jobs/JobStatus.tsx">
                      {job.fileName || job.gcsPath || 'Processing Job'}
                    </h3>
                    <p className="text-sm text-gray-500" data-id="phqz9ihbx" data-path="src/components/jobs/JobStatus.tsx">
                      Target: {job.targetTable}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2" data-id="1spsfawvw" data-path="src/components/jobs/JobStatus.tsx">
                  <Badge className={getStatusColor(job.status)} data-id="xh5dgw8wx" data-path="src/components/jobs/JobStatus.tsx">
                    {job.status.toUpperCase()}
                  </Badge>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} data-id="solbegac5" data-path="src/components/jobs/JobStatus.tsx">

                    <Eye className="h-4 w-4" data-id="vklmr7uyv" data-path="src/components/jobs/JobStatus.tsx" />
                  </Button>
                </div>
              </div>

              {/* Status Message */}
              <div className="mb-3" data-id="v7aiqo3h8" data-path="src/components/jobs/JobStatus.tsx">
                <p className={`text-sm ${
              job.status === 'completed' ? 'text-green-600' :
              job.status === 'failed' ? 'text-red-600' :
              'text-blue-600'}`
              } data-id="6xh39uv5h" data-path="src/components/jobs/JobStatus.tsx">
                  {getJobStatusMessage(job)}
                </p>
              </div>

              {(job.status === 'converting' || job.status === 'reading' || job.status === 'loading') &&
            <div className="mb-3" data-id="934gp8h2k" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="flex justify-between items-center mb-1" data-id="l7i2ev1y1" data-path="src/components/jobs/JobStatus.tsx">
                    <span className="text-sm text-gray-600" data-id="1cxr3wgmk" data-path="src/components/jobs/JobStatus.tsx">Progress</span>
                    <span className="text-sm font-medium" data-id="8o81wvuhm" data-path="src/components/jobs/JobStatus.tsx">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" data-id="5e0o7t5v9" data-path="src/components/jobs/JobStatus.tsx" />
                </div>
            }

              <div className="flex items-center justify-between text-sm text-gray-500" data-id="h7vccwxje" data-path="src/components/jobs/JobStatus.tsx">
                <div className="flex items-center space-x-4" data-id="jehw6hcg6" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="flex items-center space-x-1" data-id="ldp9z9e8p" data-path="src/components/jobs/JobStatus.tsx">
                    <Calendar className="h-4 w-4" data-id="odhislv0e" data-path="src/components/jobs/JobStatus.tsx" />
                    <span data-id="8m54r0o82" data-path="src/components/jobs/JobStatus.tsx">{format(job.startTime, 'MMM d, HH:mm')}</span>
                  </div>
                  <div className="flex items-center space-x-1" data-id="ab8ymus4y" data-path="src/components/jobs/JobStatus.tsx">
                    <Clock className="h-4 w-4" data-id="dc49fp62w" data-path="src/components/jobs/JobStatus.tsx" />
                    <span data-id="z27jldzvt" data-path="src/components/jobs/JobStatus.tsx">{formatDuration(job.startTime, job.endTime)}</span>
                  </div>
                </div>
                {job.errorMessage &&
              <Badge variant="destructive" className="text-xs" data-id="l9emurfk9" data-path="src/components/jobs/JobStatus.tsx">
                    Error
                  </Badge>
              }
              </div>

              {expandedJob === job.id &&
            <div className="mt-4 pt-4 border-t border-gray-200" data-id="s2l8qocuu" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-id="71q4jzk31" data-path="src/components/jobs/JobStatus.tsx">
                    <div data-id="7hzo04wr8" data-path="src/components/jobs/JobStatus.tsx">
                      <h4 className="text-sm font-medium text-gray-700 mb-2" data-id="ktdupmx69" data-path="src/components/jobs/JobStatus.tsx">Job Details</h4>
                      <div className="space-y-1 text-sm text-gray-600" data-id="awvgnrdug" data-path="src/components/jobs/JobStatus.tsx">
                        <p data-id="e00thmpg2" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="ncme2f95i" data-path="src/components/jobs/JobStatus.tsx">ID:</strong> {job.id}</p>
                        <p data-id="5pz3v561l" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="7qlbkkcco" data-path="src/components/jobs/JobStatus.tsx">Source:</strong> {job.sourceType.toUpperCase()}</p>
                        <p data-id="c7rh9sf9y" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="rvfj9x55r" data-path="src/components/jobs/JobStatus.tsx">Project:</strong> {job.gcpProjectId}</p>
                        <p data-id="adpcmgcjl" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="hco2abfm2" data-path="src/components/jobs/JobStatus.tsx">Mode:</strong> {isRealProcessingEnabled ? 'Production' : 'Demo'}</p>
                        {job.integerColumns &&
                    <p data-id="jp23768g7" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="cf7mn0h7j" data-path="src/components/jobs/JobStatus.tsx">Integer Columns:</strong> {job.integerColumns}</p>
                    }
                      </div>
                    </div>
                    {job.errorMessage &&
                <div data-id="wmam523u1" data-path="src/components/jobs/JobStatus.tsx">
                        <h4 className="text-sm font-medium text-red-700 mb-2" data-id="xd9pzty9r" data-path="src/components/jobs/JobStatus.tsx">Error Details</h4>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800" data-id="fbqu6jtqe" data-path="src/components/jobs/JobStatus.tsx">
                          {job.errorMessage}
                        </div>
                      </div>
                }
                  </div>

                  {/* BigQuery Link for completed jobs */}
                  {job.status === 'completed' && isRealProcessingEnabled &&
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded" data-id="judk18lg8" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="flex items-center justify-between" data-id="7r1wwdwwz" data-path="src/components/jobs/JobStatus.tsx">
                        <div data-id="9n8nphc6u" data-path="src/components/jobs/JobStatus.tsx">
                          <p className="text-sm font-medium text-green-800" data-id="9gzc9dxko" data-path="src/components/jobs/JobStatus.tsx">Data Available in BigQuery</p>
                          <p className="text-xs text-green-700" data-id="27wj04lxg" data-path="src/components/jobs/JobStatus.tsx">
                            Your data is now available in: {job.gcpProjectId}.{job.targetTable}
                          </p>
                        </div>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://console.cloud.google.com/bigquery?project=${job.gcpProjectId}`, '_blank')} data-id="8jca4xfuu" data-path="src/components/jobs/JobStatus.tsx">

                          <ExternalLink className="h-4 w-4 mr-1" data-id="4l4rslnja" data-path="src/components/jobs/JobStatus.tsx" />
                          Open BigQuery
                        </Button>
                      </div>
                    </div>
              }

                  {/* Demo Mode Notice for completed jobs */}
                  {job.status === 'completed' && !isRealProcessingEnabled &&
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded" data-id="elb1jw64r" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="flex items-center justify-between" data-id="8irkayzyw" data-path="src/components/jobs/JobStatus.tsx">
                        <div data-id="x68wsxh63" data-path="src/components/jobs/JobStatus.tsx">
                          <p className="text-sm font-medium text-yellow-800" data-id="eo81gv2r3" data-path="src/components/jobs/JobStatus.tsx">Demo Mode</p>
                          <p className="text-xs text-yellow-700" data-id="c0ja7tsq8" data-path="src/components/jobs/JobStatus.tsx">
                            In production mode, your data would be available at: {job.gcpProjectId}.{job.targetTable}
                          </p>
                        </div>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://console.cloud.google.com/bigquery?project=${job.gcpProjectId}`, '_blank')} data-id="j0x4b971x" data-path="src/components/jobs/JobStatus.tsx">

                          <ExternalLink className="h-4 w-4 mr-1" data-id="96r8si4n9" data-path="src/components/jobs/JobStatus.tsx" />
                          Open BigQuery
                        </Button>
                      </div>
                    </div>
              }

                  <div data-id="z81mduhrc" data-path="src/components/jobs/JobStatus.tsx">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center" data-id="tupy8j6w5" data-path="src/components/jobs/JobStatus.tsx">
                      <FileText className="h-4 w-4 mr-1" data-id="1k4ta4i6i" data-path="src/components/jobs/JobStatus.tsx" />
                      Processing Logs
                    </h4>
                    <ScrollArea className="h-32 border rounded p-2 bg-gray-50" data-id="p1casvk6q" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="space-y-1" data-id="p9a04imzy" data-path="src/components/jobs/JobStatus.tsx">
                        {job.logs.map((log, index) =>
                    <div key={index} className="text-xs" data-id="kv9d1zpgn" data-path="src/components/jobs/JobStatus.tsx">
                            <span className="text-gray-500" data-id="gdmucmlp4" data-path="src/components/jobs/JobStatus.tsx">
                              {format(log.timestamp, 'HH:mm:ss')}
                            </span>
                            <span className={`ml-2 font-mono ${
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warn' ? 'text-yellow-600' :
                      'text-gray-700'}`
                      } data-id="6oc39n0y5" data-path="src/components/jobs/JobStatus.tsx">
                              [{log.level.toUpperCase()}] {log.message}
                            </span>
                          </div>
                    )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
            }
            </CardContent>
          </Card>
        )}
      </div>
    </div>);

};

export default JobStatus;