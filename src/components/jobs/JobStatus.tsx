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
  Zap,
  Copy } from
'lucide-react';
import { format } from 'date-fns';

interface JobStatusProps {
  jobs: Job[];
  onJobsUpdate: (jobs: Job[]) => void;
}

const JobStatus: React.FC<JobStatusProps> = ({ jobs = [], onJobsUpdate }) => {
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

    // Ensure jobs is an array before iterating
    if (Array.isArray(jobs)) {
      jobs.forEach((job) => {
        if (job.status !== 'completed' && job.status !== 'failed') {
          const unsubscribe = jobService.subscribeToJobUpdates(job.id, (updatedJob) => {
            onJobsUpdate(jobs.map((j) => j.id === updatedJob.id ? updatedJob : j));
          });
          unsubscribeFunctions.push(unsubscribe);
        }
      });
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [jobs, onJobsUpdate]);

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" data-id="bir47b764" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'converting':
      case 'reading':
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" data-id="sen7de2je" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" data-id="jw14nsqfj" data-path="src/components/jobs/JobStatus.tsx" />;
      case 'failed':
        return <XCircle className="h-4 w-4" data-id="y3p23m1re" data-path="src/components/jobs/JobStatus.tsx" />;
      default:
        return <AlertCircle className="h-4 w-4" data-id="9wsuzprzs" data-path="src/components/jobs/JobStatus.tsx" />;
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Ensure jobs is an array and handle the case when it's undefined or null
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  if (safeJobs.length === 0) {
    return (
      <Card data-id="f30lbfagq" data-path="src/components/jobs/JobStatus.tsx">
        <CardContent className="p-6 text-center" data-id="vn542q9g4" data-path="src/components/jobs/JobStatus.tsx">
          <div className="text-gray-400 mb-2" data-id="vd6z8ot2y" data-path="src/components/jobs/JobStatus.tsx">
            <Database className="h-12 w-12 mx-auto" data-id="v3ecfmeoo" data-path="src/components/jobs/JobStatus.tsx" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1" data-id="giecqqp7p" data-path="src/components/jobs/JobStatus.tsx">No jobs yet</h3>
          <p className="text-gray-500" data-id="inrwl5rqu" data-path="src/components/jobs/JobStatus.tsx">Your processing jobs will appear here</p>
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-4" data-id="dstqjg9aw" data-path="src/components/jobs/JobStatus.tsx">
      <div className="flex items-center justify-between" data-id="1qskrra5s" data-path="src/components/jobs/JobStatus.tsx">
        <h2 className="text-lg font-semibold" data-id="5nevl8kyd" data-path="src/components/jobs/JobStatus.tsx">Processing Jobs</h2>
        <div className="flex items-center gap-2" data-id="u043f5z3z" data-path="src/components/jobs/JobStatus.tsx">
          <Badge variant="outline" data-id="l5vgjb1i9" data-path="src/components/jobs/JobStatus.tsx">{safeJobs.length} total</Badge>
          {isRealProcessingEnabled ?
          <Badge className="bg-green-100 text-green-800" data-id="hod5n4ia2" data-path="src/components/jobs/JobStatus.tsx">
              <Zap className="h-3 w-3 mr-1" data-id="bop2ad8m7" data-path="src/components/jobs/JobStatus.tsx" />
              Production Mode
            </Badge> :
          <Badge variant="secondary" data-id="clrtsagjd" data-path="src/components/jobs/JobStatus.tsx">Demo Mode</Badge>
          }
        </div>
      </div>

      {/* Mode Alert - only show if in demo mode */}
      {!isRealProcessingEnabled &&
      <Alert data-id="5xryibctd" data-path="src/components/jobs/JobStatus.tsx">
          <AlertTriangle className="h-4 w-4" data-id="6h6q4n374" data-path="src/components/jobs/JobStatus.tsx" />
          <AlertDescription data-id="y9o7hjozz" data-path="src/components/jobs/JobStatus.tsx">
            <strong data-id="2qqv3n9ha" data-path="src/components/jobs/JobStatus.tsx">Demo Mode Active:</strong> Jobs show as "completed" but no actual data is loaded to BigQuery. 
            To enable real processing, configure your production settings and test connections in the Diagnostics tab.
          </AlertDescription>
        </Alert>
      }

      {/* Production Mode Success Alert */}
      {isRealProcessingEnabled && safeJobs.some((job) => job.status === 'completed') &&
      <Alert className="border-green-200 bg-green-50" data-id="ll6vxr8yo" data-path="src/components/jobs/JobStatus.tsx">
          <CheckCircle className="h-4 w-4 text-green-600" data-id="es5r1tee1" data-path="src/components/jobs/JobStatus.tsx" />
          <AlertDescription data-id="qg4jeqr63" data-path="src/components/jobs/JobStatus.tsx">
            <strong data-id="jw4z2gxdv" data-path="src/components/jobs/JobStatus.tsx">Production Mode Active:</strong> Your jobs are processing real data and loading to BigQuery. 
            Check the BigQuery console to view your data.
          </AlertDescription>
        </Alert>
      }

      <div className="space-y-3" data-id="nkimf41qg" data-path="src/components/jobs/JobStatus.tsx">
        {safeJobs.map((job) =>
        <Card key={job.id} className="transition-all duration-200 hover:shadow-md" data-id="k1a0uawhy" data-path="src/components/jobs/JobStatus.tsx">
            <CardContent className="p-4" data-id="4tstnpfnb" data-path="src/components/jobs/JobStatus.tsx">
              <div className="flex items-center justify-between mb-3" data-id="bun0tpfvj" data-path="src/components/jobs/JobStatus.tsx">
                <div className="flex items-center space-x-3" data-id="9q56uszsq" data-path="src/components/jobs/JobStatus.tsx">
                  <div className={`p-1 rounded-full ${getStatusColor(job.status)}`} data-id="92voh22v9" data-path="src/components/jobs/JobStatus.tsx">
                    {getStatusIcon(job.status)}
                  </div>
                  <div data-id="myy2wgrrt" data-path="src/components/jobs/JobStatus.tsx">
                    <h3 className="font-medium text-gray-900" data-id="ieo9xbua7" data-path="src/components/jobs/JobStatus.tsx">
                      {job.fileName || job.gcsPath || 'Processing Job'}
                    </h3>
                    <p className="text-sm text-gray-500" data-id="jxq8246os" data-path="src/components/jobs/JobStatus.tsx">
                      Target: {job.targetTable}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2" data-id="2eq3sii2e" data-path="src/components/jobs/JobStatus.tsx">
                  <Badge className={getStatusColor(job.status)} data-id="9jzne7g11" data-path="src/components/jobs/JobStatus.tsx">
                    {job.status.toUpperCase()}
                  </Badge>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} data-id="rpls59kn3" data-path="src/components/jobs/JobStatus.tsx">
                    <Eye className="h-4 w-4" data-id="pyvlzijlm" data-path="src/components/jobs/JobStatus.tsx" />
                  </Button>
                </div>
              </div>

              {/* Status Message */}
              <div className="mb-3" data-id="bq06w6gox" data-path="src/components/jobs/JobStatus.tsx">
                <p className={`text-sm ${
              job.status === 'completed' ? 'text-green-600' :
              job.status === 'failed' ? 'text-red-600' :
              'text-blue-600'}`
              } data-id="9oa98gcmo" data-path="src/components/jobs/JobStatus.tsx">
                  {getJobStatusMessage(job)}
                </p>
              </div>

              {(job.status === 'converting' || job.status === 'reading' || job.status === 'loading') &&
            <div className="mb-3" data-id="gmj6yw3vz" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="flex justify-between items-center mb-1" data-id="h6w3wpn9z" data-path="src/components/jobs/JobStatus.tsx">
                    <span className="text-sm text-gray-600" data-id="823xi33x7" data-path="src/components/jobs/JobStatus.tsx">Progress</span>
                    <span className="text-sm font-medium" data-id="xjmmk6cst" data-path="src/components/jobs/JobStatus.tsx">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" data-id="dnei8nosf" data-path="src/components/jobs/JobStatus.tsx" />
                </div>
            }

              <div className="flex items-center justify-between text-sm text-gray-500" data-id="nh46d1rng" data-path="src/components/jobs/JobStatus.tsx">
                <div className="flex items-center space-x-4" data-id="hp19481nk" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="flex items-center space-x-1" data-id="7dm4n5yz1" data-path="src/components/jobs/JobStatus.tsx">
                    <Calendar className="h-4 w-4" data-id="wasi7xgju" data-path="src/components/jobs/JobStatus.tsx" />
                    <span data-id="q69qttc46" data-path="src/components/jobs/JobStatus.tsx">{format(job.startTime, 'MMM d, HH:mm')}</span>
                  </div>
                  <div className="flex items-center space-x-1" data-id="24li0zi8i" data-path="src/components/jobs/JobStatus.tsx">
                    <Clock className="h-4 w-4" data-id="kmg3hj74t" data-path="src/components/jobs/JobStatus.tsx" />
                    <span data-id="h9m90mo4f" data-path="src/components/jobs/JobStatus.tsx">{formatDuration(job.startTime, job.endTime)}</span>
                  </div>
                </div>
                {job.errorMessage &&
              <Badge variant="destructive" className="text-xs" data-id="7dmqniop2" data-path="src/components/jobs/JobStatus.tsx">
                    Error
                  </Badge>
              }
              </div>

              {expandedJob === job.id &&
            <div className="mt-4 pt-4 border-t border-gray-200" data-id="gqpth5r2m" data-path="src/components/jobs/JobStatus.tsx">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-id="xoli7ppqy" data-path="src/components/jobs/JobStatus.tsx">
                    <div data-id="nd7wa6ymm" data-path="src/components/jobs/JobStatus.tsx">
                      <h4 className="text-sm font-medium text-gray-700 mb-2" data-id="yhnubji0o" data-path="src/components/jobs/JobStatus.tsx">Job Details</h4>
                      <div className="space-y-1 text-sm text-gray-600" data-id="hiwd1gbel" data-path="src/components/jobs/JobStatus.tsx">
                        <p data-id="0jjmh6tyt" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="w9lf9930s" data-path="src/components/jobs/JobStatus.tsx">ID:</strong> {job.id}</p>
                        <p data-id="t6uivwtp4" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="5hfo7fe3o" data-path="src/components/jobs/JobStatus.tsx">Source:</strong> {job.sourceType.toUpperCase()}</p>
                        <p data-id="ynszkraup" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="w1nukxghs" data-path="src/components/jobs/JobStatus.tsx">Project:</strong> {job.gcpProjectId}</p>
                        <p data-id="37z6qaao0" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="32vy9h42h" data-path="src/components/jobs/JobStatus.tsx">Mode:</strong> {isRealProcessingEnabled ? 'Production' : 'Demo'}</p>
                        {job.bigQueryJobId &&
                    <div className="flex items-center gap-2" data-id="szc3u1j5e" data-path="src/components/jobs/JobStatus.tsx">
                            <strong data-id="db31e8hs4" data-path="src/components/jobs/JobStatus.tsx">BigQuery Job ID:</strong>
                            <code className="bg-gray-100 px-1 rounded text-xs" data-id="dbzwl4saw" data-path="src/components/jobs/JobStatus.tsx">{job.bigQueryJobId}</code>
                            <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(job.bigQueryJobId!)}
                        className="h-6 w-6 p-0" data-id="xua2dr5ow" data-path="src/components/jobs/JobStatus.tsx">

                              <Copy className="h-3 w-3" data-id="3afdni9s1" data-path="src/components/jobs/JobStatus.tsx" />
                            </Button>
                          </div>
                    }
                        {job.integerColumns &&
                    <p data-id="zaab1b32d" data-path="src/components/jobs/JobStatus.tsx"><strong data-id="ufefmcjy7" data-path="src/components/jobs/JobStatus.tsx">Integer Columns:</strong> {job.integerColumns}</p>
                    }
                      </div>
                    </div>
                    {job.errorMessage &&
                <div data-id="pba860zdd" data-path="src/components/jobs/JobStatus.tsx">
                        <h4 className="text-sm font-medium text-red-700 mb-2" data-id="upq6exvkc" data-path="src/components/jobs/JobStatus.tsx">Error Details</h4>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800" data-id="ahsyh52im" data-path="src/components/jobs/JobStatus.tsx">
                          {job.errorMessage}
                        </div>
                        {job.errorMessage.includes('BigQuery job timed out') && job.bigQueryJobId &&
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800" data-id="jexgv6ozh" data-path="src/components/jobs/JobStatus.tsx">
                            <p className="font-medium" data-id="da152r6rn" data-path="src/components/jobs/JobStatus.tsx">💡 Tip:</p>
                            <p data-id="ajxia32sf" data-path="src/components/jobs/JobStatus.tsx">Use the "Job Checker" tab to manually verify if job {job.bigQueryJobId} completed successfully.</p>
                          </div>
                  }
                      </div>
                }
                  </div>

                  {/* BigQuery Link for completed jobs */}
                  {job.status === 'completed' && isRealProcessingEnabled &&
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded" data-id="4zrl7ndoq" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="flex items-center justify-between" data-id="k9u8tlpnr" data-path="src/components/jobs/JobStatus.tsx">
                        <div data-id="qrzjwcsoe" data-path="src/components/jobs/JobStatus.tsx">
                          <p className="text-sm font-medium text-green-800" data-id="xxsob4fmo" data-path="src/components/jobs/JobStatus.tsx">Data Available in BigQuery</p>
                          <p className="text-xs text-green-700" data-id="slqvpoiss" data-path="src/components/jobs/JobStatus.tsx">
                            Your data is now available in: {job.gcpProjectId}.{job.targetTable}
                          </p>
                        </div>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://console.cloud.google.com/bigquery?project=${job.gcpProjectId}`, '_blank')} data-id="qzqtj57su" data-path="src/components/jobs/JobStatus.tsx">
                          <ExternalLink className="h-4 w-4 mr-1" data-id="2m7yel5gd" data-path="src/components/jobs/JobStatus.tsx" />
                          Open BigQuery
                        </Button>
                      </div>
                    </div>
              }

                  {/* Demo Mode Notice for completed jobs */}
                  {job.status === 'completed' && !isRealProcessingEnabled &&
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded" data-id="hx7gvrdey" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="flex items-center justify-between" data-id="2pftbu7fx" data-path="src/components/jobs/JobStatus.tsx">
                        <div data-id="q2e2fst48" data-path="src/components/jobs/JobStatus.tsx">
                          <p className="text-sm font-medium text-yellow-800" data-id="flgc8vmrj" data-path="src/components/jobs/JobStatus.tsx">Demo Mode</p>
                          <p className="text-xs text-yellow-700" data-id="qtclrf9o9" data-path="src/components/jobs/JobStatus.tsx">
                            In production mode, your data would be available at: {job.gcpProjectId}.{job.targetTable}
                          </p>
                        </div>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://console.cloud.google.com/bigquery?project=${job.gcpProjectId}`, '_blank')} data-id="qacysz4m1" data-path="src/components/jobs/JobStatus.tsx">
                          <ExternalLink className="h-4 w-4 mr-1" data-id="9iboub4gg" data-path="src/components/jobs/JobStatus.tsx" />
                          Open BigQuery
                        </Button>
                      </div>
                    </div>
              }

                  <div data-id="2eitnk953" data-path="src/components/jobs/JobStatus.tsx">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center" data-id="164hg1l1k" data-path="src/components/jobs/JobStatus.tsx">
                      <FileText className="h-4 w-4 mr-1" data-id="xpy5utrby" data-path="src/components/jobs/JobStatus.tsx" />
                      Processing Logs
                    </h4>
                    <ScrollArea className="h-32 border rounded p-2 bg-gray-50" data-id="jpca5byrf" data-path="src/components/jobs/JobStatus.tsx">
                      <div className="space-y-1" data-id="6c63zewsp" data-path="src/components/jobs/JobStatus.tsx">
                        {/* Safe array access with fallback to empty array */}
                        {(job.logs || []).map((log, index) =>
                    <div key={index} className="text-xs" data-id="0d61z51xn" data-path="src/components/jobs/JobStatus.tsx">
                            <span className="text-gray-500" data-id="44a4dwtoy" data-path="src/components/jobs/JobStatus.tsx">
                              {format(log.timestamp, 'HH:mm:ss')}
                            </span>
                            <span className={`ml-2 font-mono ${
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warn' ? 'text-yellow-600' :
                      'text-gray-700'}`
                      } data-id="a00wbt64d" data-path="src/components/jobs/JobStatus.tsx">
                              [{log.level.toUpperCase()}] {log.message}
                            </span>
                          </div>
                    )}
                        {/* Show message if no logs */}
                        {(!job.logs || job.logs.length === 0) &&
                    <div className="text-xs text-gray-500 italic" data-id="4zb8776lc" data-path="src/components/jobs/JobStatus.tsx">
                          No logs available
                        </div>
                    }
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