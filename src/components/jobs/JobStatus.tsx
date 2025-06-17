
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
        return <Clock className="h-4 w-4" data-id="asp935bd4" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'converting':
      case 'reading':
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" data-id="rdkwe29sj" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" data-id="1jvs6txu8" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'failed':
        return <XCircle className="h-4 w-4" data-id="rvn3gp2qp" data-path="src/components/jobs/JobStatus.tsx" />;
      default:
        return <AlertCircle className="h-4 w-4" data-id="o7w65bjyl" data-path="src/components/jobs/JobStatus.tsx" />;
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
      <Card data-id="en7ug8v1o" data-path="src/components/jobs/JobStatus.tsx">
        <CardContent className="p-6 text-center" data-id="dbkfinppz" data-path="src/components/jobs/JobStatus.tsx">
          <div className="text-gray-400 mb-2" data-id="mizfctlbh" data-path="src/components/jobs/JobStatus.tsx">
            <Database className="h-12 w-12 mx-auto" data-id="f5f60cid9" data-path="src/components/jobs/JobStatus.tsx" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1" data-id="489fnm1iu" data-path="src/components/jobs/JobStatus.tsx">No jobs yet</h3>
          <p className="text-gray-500" data-id="h1886lnk3" data-path="src/components/jobs/JobStatus.tsx">Your processing jobs will appear here</p>
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-4" data-id="00aei3y5o" data-path="src/components/jobs/JobStatus.tsx">
      <div className="flex items-center justify-between" data-id="j1e497m4z" data-path="src/components/jobs/JobStatus.tsx">
        <h2 className="text-lg font-semibold" data-id="179zde6gt" data-path="src/components/jobs/JobStatus.tsx">Processing Jobs</h2>
        <div className="flex items-center gap-2" data-id="u9zuchgx7" data-path="src/components/jobs/JobStatus.tsx">
          <Badge variant="outline" data-id="0110vm9pn" data-path="src/components/jobs/JobStatus.tsx">{jobs.length} total</Badge>
          {isRealProcessingEnabled ?
          <Badge className="bg-green-100 text-green-800" data-id="uoe1q8rjj" data-path="src/components/jobs/JobStatus.tsx">
              <Zap className="h-3 w-3 mr-1" data-id="c78fr1s61" data-path="src/components/jobs/JobStatus.tsx" />
              Production Mode
            </Badge> :
          <Badge variant="secondary" data-id="p52d0b662" data-path="src/components/jobs/JobStatus.tsx">Demo Mode</Badge>
          }
        </div>
      </div>

      {/* Mode Alert - only show if in demo mode */}
      {!isRealProcessingEnabled &&
      <Alert data-id="4mrlpz64s" data-path="src/components/jobs/JobStatus.tsx">
          <AlertTriangle className="h-4 w-4" data-id="eg3xg6cy2" data-path="src/components/jobs/JobStatus.tsx" />
          <AlertDescription data-id="rl93rn8i2" data-path="src/components/jobs/JobStatus.tsx">
            <strong data-id="sjnemkmvk" data-path="src/components/jobs/JobStatus.tsx">Demo Mode Active:</strong> Jobs show as "completed" but no actual data is loaded to BigQuery. 
            To enable real processing, configure your production settings and test connections in the Diagnostics tab.
          </AlertDescription>
        </Alert>
      }

      {/* Production Mode Success Alert */}
      {isRealProcessingEnabled && jobs.some((job) => job.status === 'completed') &&
      <Alert className="border-green-200 bg-green-50" data-id="30ubbhnps" data-path="src/components/jobs/JobStatus.tsx">
          <CheckCircle className="h-4 w-4 text-green-600" data-id="bec1pj3fa" data-path="src/components/jobs/JobStatus.tsx" />
          <AlertDescription data-id="c0dy8vgt1" data-path="src/components/jobs/JobStatus.tsx">
            <strong data-id="zbm8rc68u" data-path="src/components/jobs/JobStatus.tsx">Production Mode Active:</strong> Your jobs are processing real data and loading to BigQuery. 
            Check the BigQuery console to view your data.
          </AlertDescription>
        </Alert>
      }

      <div className="space-y-3" data-id="nfuja7veg" data-path="src/components/jobs/JobStatus.tsx">
        {jobs.map((job) =>
        <Card key={job.id} className="transition-all duration-200 hover:shadow-md" data-id="6xbtxopp0" data-path="src/components/jobs/JobStatus.tsx">
            <CardContent className="p-4" data-id="lsmkpzm7e" data-path="src/components/jobs/JobStatus.tsx">
              <div className="flex items-center justify-between mb-3" data-id="0tkm5vuc7" data-path="src/components/jobs/JobStatus.tsx">
                <div className="flex items-center space-x-3" data-id="sbvsgjjd2" data-path="src/components/jobs/JobStatus.tsx">
                  <div className={`p-1 rounded-full ${getStatusColor(job.status)}`} data-id="vkli8blgw" data-path="src/components/jobs/JobStatus.tsx">
                    {getStatusIcon(job.status)}
                  </div>
                  <div data-id="ld0c8bx6o" data-path="src/components/jobs/JobStatus.tsx">
                    <h3 className="font-medium text-gray-900" data-id="24y160pcv" data-path="src/components/jobs/JobStatus.tsx">
                      {job.fileName || job.gcsPath || 'Processing Job'}
                    </h3>
                    <p className="text-sm text-gray-500" data-id="6z8tdtwmk" data-path="src/components/jobs/JobStatus.tsx">
                      Target: {job.targetTable}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2" data-id="12trecu0a" data-path="src/components/jobs/JobStatus.tsx">
                  <Badge className={getStatusColor(job.status)} data-id="irjasgit8" data-path="src/components/jobs/JobStatus.tsx">
                    {job.status.toUpperCase()}
                  </Badge>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} data-id="d2v8geaog" data-path="src/components/jobs/JobStatus.tsx">

                    <Eye className="h-4 w-4" data-id="j0o3viosn" data-path="src/components/jobs/JobStatus.tsx" />
                  </Button>
                </div>
              </div>

              {/* Status Message */}
              <div className="mb-3" data-id="64o75ggzq" data-path="src/components/jobs/JobStatus.tsx">
                <p className={`text-sm ${
              job.status === 'completed' ? 'text-green-600' :
              job.status === 'failed' ? 'text-red-600' :
              'text-blue-600'}`
              } data-id="bqcod3ncs" data-path="src/components/jobs/JobStatus.tsx">
                  {getJobStatusMessage(job)}
                </p>
              </div>

              {(job.status === 'converting' || job.status === 'reading' || job.status === 'loading') &&
            <div className="mb-3" data-id="7tu2ffblj" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="flex justify-between items-center mb-1" data-id="2b5unh8uj" data-path="src/components/jobs/JobStatus.tsx">
                    <span className="text-sm text-gray-600" data-id="ts7xoop4u" data-path="src/components/jobs/JobStatus.tsx">Progress</span>
                    <span className="text-sm font-medium" data-id="cwisxa6ru" data-path="src/components/jobs/JobStatus.tsx">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" data-id="wsxqvvyli" data-path="src/components/jobs/JobStatus.tsx" />
                </div>
            }

              <div className="flex items-center justify-between text-sm text-gray-500" data-id="7rl4l1kz5" data-path="src/components/jobs/JobStatus.tsx">
                <div className="flex items-center space-x-4" data-id="xeutaetrr" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="flex items-center space-x-1" data-id="y5ucbsovl" data-path="src/components/jobs/JobStatus.tsx">
                    <Calendar className="h-4 w-4" data-id="ju6ngi90i" data-path="src/components/jobs/JobStatus.tsx" />
                    <span data-id="d59z124z3" data-path="src/components/jobs/JobStatus.tsx">{format(job.startTime, 'MMM d, HH:mm')}</span>
                  </div>
                  <div className="flex items-center space-x-1" data-id="hdzecnvy3" data-path="src/components/jobs/JobStatus.tsx">
                    <Clock className="h-4 w-4" data-id="tbjgwmrmg" data-path="src/components/jobs/JobStatus.tsx" />
                    <span data-id="vck4jecb1" data-path="src/components/jobs/JobStatus.tsx">{formatDuration(job.startTime, job.endTime)}</span>
                  </div>
                </div>
                {job.errorMessage &&
              <Badge variant="destructive" className="text-xs" data-id="5lkpvq50k" data-path="src/components/jobs/JobStatus.tsx">
                    Error
                  </Badge>
              }
              </div>

              {expandedJob === job.id &&
            <div className="mt-4 pt-4 border-t border-gray-200" data-id="s2s1j710b" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-id="49aigx1io" data-path="src/components/jobs/JobStatus.tsx">
                    <div data-id="y9do3kjt7" data-path="src/components/jobs/JobStatus.tsx">
                      <h4 className="text-sm font-medium text-gray-700 mb-2" data-id="1s0zd6z20" data-path="src/components/jobs/JobStatus.tsx">Job Details</h4>
                      <div className="space-y-1 text-sm text-gray-600" data-id="9lrgyhlzs" data-path="src/components/jobs/JobStatus.tsx">
                        <p data-id="rknhaqcj1" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="ugw0f8zts" data-path="src/components/jobs/JobStatus.tsx">ID:</strong> {job.id}</p>
                        <p data-id="elzdqnk53" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="1wqelxtzq" data-path="src/components/jobs/JobStatus.tsx">Source:</strong> {job.sourceType.toUpperCase()}</p>
                        <p data-id="txa11cv5e" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="gagpzgkjc" data-path="src/components/jobs/JobStatus.tsx">Project:</strong> {job.gcpProjectId}</p>
                        <p data-id="ncvnqkn1o" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="s2zo7i8nl" data-path="src/components/jobs/JobStatus.tsx">Mode:</strong> {isRealProcessingEnabled ? 'Production' : 'Demo'}</p>
                        {job.integerColumns &&
                    <p data-id="9iczv5k3v" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="q2vw8sl9x" data-path="src/components/jobs/JobStatus.tsx">Integer Columns:</strong> {job.integerColumns}</p>
                    }
                      </div>
                    </div>
                    {job.errorMessage &&
                <div data-id="nc6edwafg" data-path="src/components/jobs/JobStatus.tsx">
                        <h4 className="text-sm font-medium text-red-700 mb-2" data-id="xc1inty0e" data-path="src/components/jobs/JobStatus.tsx">Error Details</h4>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800" data-id="ku1vyku6f" data-path="src/components/jobs/JobStatus.tsx">
                          {job.errorMessage}
                        </div>
                      </div>
                }
                  </div>

                  {/* BigQuery Link for completed jobs */}
                  {job.status === 'completed' && isRealProcessingEnabled &&
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded" data-id="zx26eoz0r" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="flex items-center justify-between" data-id="bnjt433wu" data-path="src/components/jobs/JobStatus.tsx">
                        <div data-id="6s0p7ocoq" data-path="src/components/jobs/JobStatus.tsx">
                          <p className="text-sm font-medium text-green-800" data-id="6dmjwwb80" data-path="src/components/jobs/JobStatus.tsx">Data Available in BigQuery</p>
                          <p className="text-xs text-green-700" data-id="b8jhldvi0" data-path="src/components/jobs/JobStatus.tsx">
                            Your data is now available in: {job.gcpProjectId}.{job.targetTable}
                          </p>
                        </div>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://console.cloud.google.com/bigquery?project=${job.gcpProjectId}`, '_blank')} data-id="qxky1ddmt" data-path="src/components/jobs/JobStatus.tsx">

                          <ExternalLink className="h-4 w-4 mr-1" data-id="g7n1fbkr9" data-path="src/components/jobs/JobStatus.tsx" />
                          Open BigQuery
                        </Button>
                      </div>
                    </div>
              }

                  {/* Demo Mode Notice for completed jobs */}
                  {job.status === 'completed' && !isRealProcessingEnabled &&
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded" data-id="6hwihacxh" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="flex items-center justify-between" data-id="l9yp6t4bh" data-path="src/components/jobs/JobStatus.tsx">
                        <div data-id="7bzwehv5b" data-path="src/components/jobs/JobStatus.tsx">
                          <p className="text-sm font-medium text-yellow-800" data-id="90zmmh1lw" data-path="src/components/jobs/JobStatus.tsx">Demo Mode</p>
                          <p className="text-xs text-yellow-700" data-id="rsi6t0a6c" data-path="src/components/jobs/JobStatus.tsx">
                            In production mode, your data would be available at: {job.gcpProjectId}.{job.targetTable}
                          </p>
                        </div>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://console.cloud.google.com/bigquery?project=${job.gcpProjectId}`, '_blank')} data-id="kkeqp29bj" data-path="src/components/jobs/JobStatus.tsx">

                          <ExternalLink className="h-4 w-4 mr-1" data-id="n15jdzgqi" data-path="src/components/jobs/JobStatus.tsx" />
                          Open BigQuery
                        </Button>
                      </div>
                    </div>
              }

                  <div data-id="d0mah92ic" data-path="src/components/jobs/JobStatus.tsx">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center" data-id="mrd7ys7rt" data-path="src/components/jobs/JobStatus.tsx">
                      <FileText className="h-4 w-4 mr-1" data-id="w8jj7thdy" data-path="src/components/jobs/JobStatus.tsx" />
                      Processing Logs
                    </h4>
                    <ScrollArea className="h-32 border rounded p-2 bg-gray-50" data-id="zgxh9oy2x" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="space-y-1" data-id="ge0gxa2ak" data-path="src/components/jobs/JobStatus.tsx">
                        {job.logs.map((log, index) =>
                    <div key={index} className="text-xs" data-id="b8bw6dei3" data-path="src/components/jobs/JobStatus.tsx">
                            <span className="text-gray-500" data-id="a5kdg4x5c" data-path="src/components/jobs/JobStatus.tsx">
                              {format(log.timestamp, 'HH:mm:ss')}
                            </span>
                            <span className={`ml-2 font-mono ${
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warn' ? 'text-yellow-600' :
                      'text-gray-700'}`
                      } data-id="wag4k5wri" data-path="src/components/jobs/JobStatus.tsx">
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