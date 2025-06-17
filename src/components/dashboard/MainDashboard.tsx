import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { jobService } from '@/services/jobService';
import { configService } from '@/services/configService';
import { Job, ProcessingConfig } from '@/types';

import FileUploadZone from '@/components/upload/FileUploadZone';
import GCSPathInput from '@/components/upload/GCSPathInput';
import SchemaDefinition from '@/components/schema/SchemaDefinition';
import JobStatus from '@/components/jobs/JobStatus';
import ProductionSetup from '@/components/configuration/ProductionSetup';
import ConnectionTest from '@/components/diagnostics/ConnectionTest';

import {
  Upload,
  Cloud,
  Play,
  AlertTriangle,
  Database,
  Zap,
  Info,
  ExternalLink,
  Settings,
  CheckCircle,
  TestTube } from
'lucide-react';

const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [config, setConfig] = useState<ProcessingConfig>({
    sourceType: 'local',
    gcpProjectId: configService.getConfig().gcpProjectId || '',
    targetTable: '',
    autoDetectSchema: true,
    customSchema: [],
    integerColumns: ''
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [envInfo, setEnvInfo] = useState(configService.getEnvironmentInfo());

  useEffect(() => {
    loadJobs();
    setEnvInfo(configService.getEnvironmentInfo());
  }, [user]);

  const loadJobs = async () => {
    if (user) {
      try {
        const userJobs = await jobService.getJobs(user.id);
        setJobs(userJobs);
      } catch (error) {
        console.error('Failed to load jobs:', error);
      }
    }
  };

  const validateConfig = (): string | null => {
    if (!config.gcpProjectId.trim()) {
      return 'GCP Project ID is required';
    }

    if (!config.targetTable.trim()) {
      return 'Target table is required';
    }

    if (!config.targetTable.includes('.')) {
      return 'Target table must include dataset (e.g., dataset.table)';
    }

    // Validate BigQuery naming conventions
    const [dataset, table] = config.targetTable.split('.');
    if (!dataset || !table) {
      return 'Invalid table format. Use: dataset.table_name';
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(dataset) || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(table)) {
      return 'Dataset and table names must start with a letter and contain only letters, numbers, and underscores';
    }

    if (config.sourceType === 'local' && !config.file) {
      return 'Please select a shapefile to upload';
    }

    if (config.sourceType === 'gcs' && (!config.gcsPath || !config.gcsBucket)) {
      return 'Please specify GCS bucket and path';
    }

    return null;
  };

  const handleStartProcessing = async () => {
    const validationError = validateConfig();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'Please sign in to start processing',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const newJob = await jobService.createJob(config, user.id);
      setJobs((prevJobs) => [newJob, ...prevJobs]);

      const processingMode = envInfo.realProcessingEnabled ? 'production' : 'demo';

      toast({
        title: 'Job Started',
        description: `Processing job ${newJob.id} has been started in ${processingMode} mode`,
        duration: 5000
      });

      if (!envInfo.realProcessingEnabled) {
        // Show demo mode warning
        setTimeout(() => {
          toast({
            title: 'Demo Mode Active',
            description: 'This is a simulation. Configure production settings to load real data to BigQuery.',
            duration: 8000
          });
        }, 2000);
      } else {
        // Show production mode confirmation
        setTimeout(() => {
          toast({
            title: 'Production Processing Started',
            description: 'Your data will be processed and loaded to BigQuery. Check the job status for updates.',
            duration: 6000
          });
        }, 1000);
      }

      // Reset form
      setConfig({
        ...config,
        file: undefined,
        gcsPath: '',
        gcsBucket: ''
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start processing job';
      toast({
        title: 'Processing Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const runningJobs = jobs.filter((job) =>
  ['queued', 'converting', 'reading', 'loading'].includes(job.status)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" data-id="x94r4ssqz" data-path="src/components/dashboard/MainDashboard.tsx">
      {/* Header */}
      <div className="text-center space-y-2" data-id="dmkuz4ua0" data-path="src/components/dashboard/MainDashboard.tsx">
        <h1 className="text-3xl font-bold text-gray-900" data-id="dx858s21d" data-path="src/components/dashboard/MainDashboard.tsx">
          Geospatial Data Processing
        </h1>
        <p className="text-gray-600" data-id="pq73sgg0a" data-path="src/components/dashboard/MainDashboard.tsx">
          Upload shapefiles and seamlessly load them into Google BigQuery
        </p>
      </div>

      {/* Environment Status Alert */}
      <Alert className={`border-${envInfo.realProcessingEnabled ? 'green' : 'amber'}-200 bg-${envInfo.realProcessingEnabled ? 'green' : 'amber'}-50`} data-id="a6z14yyxw" data-path="src/components/dashboard/MainDashboard.tsx">
        {envInfo.realProcessingEnabled ?
        <CheckCircle className="h-4 w-4 text-green-600" data-id="f62lxchho" data-path="src/components/dashboard/MainDashboard.tsx" /> :

        <Info className="h-4 w-4 text-amber-600" data-id="rrbopz19i" data-path="src/components/dashboard/MainDashboard.tsx" />
        }
        <AlertDescription className={`text-${envInfo.realProcessingEnabled ? 'green' : 'amber'}-800`} data-id="r34ov0r7e" data-path="src/components/dashboard/MainDashboard.tsx">
          <strong data-id="e8jrvsylw" data-path="src/components/dashboard/MainDashboard.tsx">{envInfo.realProcessingEnabled ? 'Production Mode:' : 'Demo Mode:'}</strong>{' '}
          {envInfo.realProcessingEnabled ?
          'Real data processing is enabled. Jobs will load data to BigQuery.' :

          'Jobs will simulate the processing pipeline. Configure production settings to load real data.'
          }
          {envInfo.configErrors.length > 0 &&
          <div className="mt-2" data-id="v8cn6xu2t" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="font-medium" data-id="vr0w9gtto" data-path="src/components/dashboard/MainDashboard.tsx">Configuration issues:</p>
              <ul className="list-disc list-inside text-sm" data-id="r6p970acq" data-path="src/components/dashboard/MainDashboard.tsx">
                {envInfo.configErrors.map((error, index) =>
              <li key={index} data-id="q9rcrivs4" data-path="src/components/dashboard/MainDashboard.tsx">{error}</li>
              )}
              </ul>
            </div>
          }
        </AlertDescription>
      </Alert>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="ge0yvcmcz" data-path="src/components/dashboard/MainDashboard.tsx">
        <Card data-id="qc0h11vg5" data-path="src/components/dashboard/MainDashboard.tsx">
          <CardContent className="p-4 flex items-center space-x-3" data-id="kvgzx45kw" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="p-2 bg-blue-100 rounded-full" data-id="pvhzioemo" data-path="src/components/dashboard/MainDashboard.tsx">
              <Database className="h-5 w-5 text-blue-600" data-id="kqrgauvr0" data-path="src/components/dashboard/MainDashboard.tsx" />
            </div>
            <div data-id="wodli5et1" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="text-sm text-gray-600" data-id="8kw3rrk1o" data-path="src/components/dashboard/MainDashboard.tsx">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900" data-id="vj1n64l8y" data-path="src/components/dashboard/MainDashboard.tsx">{jobs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card data-id="4v89xrz8f" data-path="src/components/dashboard/MainDashboard.tsx">
          <CardContent className="p-4 flex items-center space-x-3" data-id="pqwxsfo1h" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="p-2 bg-yellow-100 rounded-full" data-id="iehadu74a" data-path="src/components/dashboard/MainDashboard.tsx">
              <Zap className="h-5 w-5 text-yellow-600" data-id="w1k1r5drb" data-path="src/components/dashboard/MainDashboard.tsx" />
            </div>
            <div data-id="q061sklrv" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="text-sm text-gray-600" data-id="y531py2u8" data-path="src/components/dashboard/MainDashboard.tsx">Running</p>
              <p className="text-2xl font-bold text-gray-900" data-id="yaqhe5oj9" data-path="src/components/dashboard/MainDashboard.tsx">{runningJobs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card data-id="znjxlr5k7" data-path="src/components/dashboard/MainDashboard.tsx">
          <CardContent className="p-4 flex items-center space-x-3" data-id="pdgakc4ga" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="p-2 bg-green-100 rounded-full" data-id="vtnnz2cxg" data-path="src/components/dashboard/MainDashboard.tsx">
              <Upload className="h-5 w-5 text-green-600" data-id="n71mect8d" data-path="src/components/dashboard/MainDashboard.tsx" />
            </div>
            <div data-id="9lzfjc8f3" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="text-sm text-gray-600" data-id="xy8wt2ya8" data-path="src/components/dashboard/MainDashboard.tsx">Completed</p>
              <p className="text-2xl font-bold text-gray-900" data-id="xj6jud6k2" data-path="src/components/dashboard/MainDashboard.tsx">
                {jobs.filter((job) => job.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="mt6xwpnba" data-path="src/components/dashboard/MainDashboard.tsx">
        {/* Main Content Tabs */}
        <div className="lg:col-span-2" data-id="y82baj9hp" data-path="src/components/dashboard/MainDashboard.tsx">
          <Tabs defaultValue="processing" className="space-y-6" data-id="pdo14238d" data-path="src/components/dashboard/MainDashboard.tsx">
            <TabsList className="grid w-full grid-cols-3" data-id="omkgpbzsv" data-path="src/components/dashboard/MainDashboard.tsx">
              <TabsTrigger value="processing" className="flex items-center space-x-2" data-id="0zfgt7voq" data-path="src/components/dashboard/MainDashboard.tsx">
                <Play className="h-4 w-4" data-id="z0i6ugg03" data-path="src/components/dashboard/MainDashboard.tsx" />
                <span data-id="oqnm85lnc" data-path="src/components/dashboard/MainDashboard.tsx">Data Processing</span>
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center space-x-2" data-id="ku3lzu2yl" data-path="src/components/dashboard/MainDashboard.tsx">
                <TestTube className="h-4 w-4" data-id="jbig6u5et" data-path="src/components/dashboard/MainDashboard.tsx" />
                <span data-id="34gcziz87" data-path="src/components/dashboard/MainDashboard.tsx">Diagnostics</span>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center space-x-2" data-id="47k9n97ww" data-path="src/components/dashboard/MainDashboard.tsx">
                <Settings className="h-4 w-4" data-id="rxtz0isv9" data-path="src/components/dashboard/MainDashboard.tsx" />
                <span data-id="c3etyq1tt" data-path="src/components/dashboard/MainDashboard.tsx">Configuration</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processing" className="space-y-6" data-id="y4gxke9rd" data-path="src/components/dashboard/MainDashboard.tsx">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="2vkd4fi4y" data-path="src/components/dashboard/MainDashboard.tsx">
                {/* Processing Configuration */}
                <Card data-id="oh2zk6z2o" data-path="src/components/dashboard/MainDashboard.tsx">
                  <CardHeader data-id="an63ofjmb" data-path="src/components/dashboard/MainDashboard.tsx">
                    <CardTitle data-id="416lta82b" data-path="src/components/dashboard/MainDashboard.tsx">New Processing Job</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6" data-id="s9vw72dqb" data-path="src/components/dashboard/MainDashboard.tsx">
                    {/* Data Source Selection */}
                    <div data-id="c3i2hl0mr" data-path="src/components/dashboard/MainDashboard.tsx">
                      <Label className="text-base font-medium" data-id="izq61i7h3" data-path="src/components/dashboard/MainDashboard.tsx">Data Source</Label>
                      <Tabs
                        value={config.sourceType}
                        onValueChange={(value) => setConfig({
                          ...config,
                          sourceType: value as 'local' | 'gcs'
                        })} data-id="84ps1x4k8" data-path="src/components/dashboard/MainDashboard.tsx">

                        <TabsList className="grid w-full grid-cols-2" data-id="q0ose1zft" data-path="src/components/dashboard/MainDashboard.tsx">
                          <TabsTrigger value="local" className="flex items-center space-x-2" data-id="dndn1eg3z" data-path="src/components/dashboard/MainDashboard.tsx">
                            <Upload className="h-4 w-4" data-id="otwa467o0" data-path="src/components/dashboard/MainDashboard.tsx" />
                            <span data-id="4w4hmx1ws" data-path="src/components/dashboard/MainDashboard.tsx">Local Upload</span>
                          </TabsTrigger>
                          <TabsTrigger value="gcs" className="flex items-center space-x-2" data-id="f94i9qhy2" data-path="src/components/dashboard/MainDashboard.tsx">
                            <Cloud className="h-4 w-4" data-id="pw6osmfah" data-path="src/components/dashboard/MainDashboard.tsx" />
                            <span data-id="xhtn15aro" data-path="src/components/dashboard/MainDashboard.tsx">GCS Path</span>
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="local" className="mt-4" data-id="pj9eorws2" data-path="src/components/dashboard/MainDashboard.tsx">
                          <FileUploadZone
                            selectedFile={config.file || null}
                            onFileSelect={(file) => setConfig({ ...config, file: file || undefined })}
                            disabled={isProcessing} data-id="dd3ku9358" data-path="src/components/dashboard/MainDashboard.tsx" />

                        </TabsContent>
                        
                        <TabsContent value="gcs" className="mt-4" data-id="tkebwladr" data-path="src/components/dashboard/MainDashboard.tsx">
                          <GCSPathInput
                            bucket={config.gcsBucket || ''}
                            path={config.gcsPath || ''}
                            onBucketChange={(bucket) => setConfig({ ...config, gcsBucket: bucket })}
                            onPathChange={(path) => setConfig({ ...config, gcsPath: path })}
                            disabled={isProcessing} data-id="mmtnhioj8" data-path="src/components/dashboard/MainDashboard.tsx" />

                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* GCP Configuration */}
                    <div className="grid gap-4" data-id="bzb3opu1l" data-path="src/components/dashboard/MainDashboard.tsx">
                      <div className="space-y-2" data-id="nw7b96xgg" data-path="src/components/dashboard/MainDashboard.tsx">
                        <Label htmlFor="gcp-project" data-id="ilmmwqwc5" data-path="src/components/dashboard/MainDashboard.tsx">GCP Project ID</Label>
                        <Input
                          id="gcp-project"
                          placeholder="my-gcp-project"
                          value={config.gcpProjectId}
                          onChange={(e) => setConfig({ ...config, gcpProjectId: e.target.value })}
                          disabled={isProcessing} data-id="20p137592" data-path="src/components/dashboard/MainDashboard.tsx" />

                        <p className="text-xs text-gray-500" data-id="z08m0mcyz" data-path="src/components/dashboard/MainDashboard.tsx">
                          Enter your Google Cloud Platform project ID
                        </p>
                      </div>

                      <div className="space-y-2" data-id="2ol0rbi2z" data-path="src/components/dashboard/MainDashboard.tsx">
                        <Label htmlFor="target-table" data-id="e5fj5uhph" data-path="src/components/dashboard/MainDashboard.tsx">BigQuery Target Table</Label>
                        <Input
                          id="target-table"
                          placeholder="dataset.table_name"
                          value={config.targetTable}
                          onChange={(e) => setConfig({ ...config, targetTable: e.target.value })}
                          disabled={isProcessing} data-id="unha4h1y8" data-path="src/components/dashboard/MainDashboard.tsx" />

                        <p className="text-xs text-gray-500" data-id="oiz3vuw4e" data-path="src/components/dashboard/MainDashboard.tsx">
                          Format: dataset.table_name (e.g., geospatial_data.shapefiles)
                        </p>
                      </div>
                    </div>

                    {/* Schema Definition */}
                    <SchemaDefinition
                      autoDetectSchema={config.autoDetectSchema}
                      onAutoDetectChange={(enabled) => setConfig({ ...config, autoDetectSchema: enabled })}
                      customSchema={config.customSchema || []}
                      onCustomSchemaChange={(schema) => setConfig({ ...config, customSchema: schema })}
                      integerColumns={config.integerColumns || ''}
                      onIntegerColumnsChange={(columns) => setConfig({ ...config, integerColumns: columns })}
                      disabled={isProcessing} data-id="59iw3jqw0" data-path="src/components/dashboard/MainDashboard.tsx" />


                    {/* Process Button */}
                    <div className="pt-4" data-id="iz6vumtrh" data-path="src/components/dashboard/MainDashboard.tsx">
                      <Button
                        onClick={handleStartProcessing}
                        disabled={isProcessing}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-id="epcoxf39x" data-path="src/components/dashboard/MainDashboard.tsx">

                        {isProcessing ?
                        <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" data-id="eoqy6wayo" data-path="src/components/dashboard/MainDashboard.tsx" />
                            Starting Processing...
                          </> :

                        <>
                            <Play className="mr-2 h-4 w-4" data-id="ib4b5mgio" data-path="src/components/dashboard/MainDashboard.tsx" />
                            Start Processing
                          </>
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Status */}
                <div data-id="j9ev9b65x" data-path="src/components/dashboard/MainDashboard.tsx">
                  <JobStatus jobs={jobs} onJobsUpdate={setJobs} data-id="njboozhro" data-path="src/components/dashboard/MainDashboard.tsx" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-6" data-id="96rps60ld" data-path="src/components/dashboard/MainDashboard.tsx">
              <ConnectionTest projectId={config.gcpProjectId} data-id="7si9zmlo1" data-path="src/components/dashboard/MainDashboard.tsx" />
            </TabsContent>

            <TabsContent value="configuration" data-id="sub79wko8" data-path="src/components/dashboard/MainDashboard.tsx">
              <ProductionSetup data-id="k9a93kyah" data-path="src/components/dashboard/MainDashboard.tsx" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>);

};

export default MainDashboard;