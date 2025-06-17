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
    <div className="max-w-7xl mx-auto p-6 space-y-6" data-id="0v7tpcibo" data-path="src/components/dashboard/MainDashboard.tsx">
      {/* Header */}
      <div className="text-center space-y-2" data-id="zqs5aky2t" data-path="src/components/dashboard/MainDashboard.tsx">
        <h1 className="text-3xl font-bold text-gray-900" data-id="tu62z776a" data-path="src/components/dashboard/MainDashboard.tsx">
          Geospatial Data Processing
        </h1>
        <p className="text-gray-600" data-id="5mk7w3lvd" data-path="src/components/dashboard/MainDashboard.tsx">
          Upload shapefiles and seamlessly load them into Google BigQuery
        </p>
      </div>

      {/* Environment Status Alert */}
      <Alert className={`border-${envInfo.realProcessingEnabled ? 'green' : 'amber'}-200 bg-${envInfo.realProcessingEnabled ? 'green' : 'amber'}-50`} data-id="zj5mza0h3" data-path="src/components/dashboard/MainDashboard.tsx">
        {envInfo.realProcessingEnabled ?
        <CheckCircle className="h-4 w-4 text-green-600" data-id="cbwxl2g09" data-path="src/components/dashboard/MainDashboard.tsx" /> :

        <Info className="h-4 w-4 text-amber-600" data-id="efpwuletb" data-path="src/components/dashboard/MainDashboard.tsx" />
        }
        <AlertDescription className={`text-${envInfo.realProcessingEnabled ? 'green' : 'amber'}-800`} data-id="smeukuatb" data-path="src/components/dashboard/MainDashboard.tsx">
          <strong data-id="lc5qopgoi" data-path="src/components/dashboard/MainDashboard.tsx">{envInfo.realProcessingEnabled ? 'Production Mode:' : 'Demo Mode:'}</strong>{' '}
          {envInfo.realProcessingEnabled ?
          'Real data processing is enabled. Jobs will load data to BigQuery.' :

          'Jobs will simulate the processing pipeline. Configure production settings to load real data.'
          }
          {envInfo.configErrors.length > 0 &&
          <div className="mt-2" data-id="n9g0pmoi2" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="font-medium" data-id="tehdlbgby" data-path="src/components/dashboard/MainDashboard.tsx">Configuration issues:</p>
              <ul className="list-disc list-inside text-sm" data-id="y1co8j195" data-path="src/components/dashboard/MainDashboard.tsx">
                {envInfo.configErrors.map((error, index) =>
              <li key={index} data-id="6nd1aigvy" data-path="src/components/dashboard/MainDashboard.tsx">{error}</li>
              )}
              </ul>
            </div>
          }
        </AlertDescription>
      </Alert>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="adj041l6s" data-path="src/components/dashboard/MainDashboard.tsx">
        <Card data-id="jrtb281jf" data-path="src/components/dashboard/MainDashboard.tsx">
          <CardContent className="p-4 flex items-center space-x-3" data-id="kj7j6w1c2" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="p-2 bg-blue-100 rounded-full" data-id="my6n07095" data-path="src/components/dashboard/MainDashboard.tsx">
              <Database className="h-5 w-5 text-blue-600" data-id="15xwcofr3" data-path="src/components/dashboard/MainDashboard.tsx" />
            </div>
            <div data-id="g78s42oq3" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="text-sm text-gray-600" data-id="yvbonis1m" data-path="src/components/dashboard/MainDashboard.tsx">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900" data-id="hq0z7uziq" data-path="src/components/dashboard/MainDashboard.tsx">{jobs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card data-id="r74o2tl5g" data-path="src/components/dashboard/MainDashboard.tsx">
          <CardContent className="p-4 flex items-center space-x-3" data-id="vmafcf5z2" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="p-2 bg-yellow-100 rounded-full" data-id="9lrupg5ep" data-path="src/components/dashboard/MainDashboard.tsx">
              <Zap className="h-5 w-5 text-yellow-600" data-id="pzsyppm68" data-path="src/components/dashboard/MainDashboard.tsx" />
            </div>
            <div data-id="lrmlj40dy" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="text-sm text-gray-600" data-id="1j3xdwx75" data-path="src/components/dashboard/MainDashboard.tsx">Running</p>
              <p className="text-2xl font-bold text-gray-900" data-id="ahb4hsfk4" data-path="src/components/dashboard/MainDashboard.tsx">{runningJobs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card data-id="yika8cce4" data-path="src/components/dashboard/MainDashboard.tsx">
          <CardContent className="p-4 flex items-center space-x-3" data-id="x5s6uopqb" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="p-2 bg-green-100 rounded-full" data-id="kfj1nmedj" data-path="src/components/dashboard/MainDashboard.tsx">
              <Upload className="h-5 w-5 text-green-600" data-id="ok1rel2un" data-path="src/components/dashboard/MainDashboard.tsx" />
            </div>
            <div data-id="7e9km84ml" data-path="src/components/dashboard/MainDashboard.tsx">
              <p className="text-sm text-gray-600" data-id="338tx7vc6" data-path="src/components/dashboard/MainDashboard.tsx">Completed</p>
              <p className="text-2xl font-bold text-gray-900" data-id="2tmzt5qxa" data-path="src/components/dashboard/MainDashboard.tsx">
                {jobs.filter((job) => job.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="u8ns3dqsf" data-path="src/components/dashboard/MainDashboard.tsx">
        {/* Main Content Tabs */}
        <div className="lg:col-span-2" data-id="ofka63c52" data-path="src/components/dashboard/MainDashboard.tsx">
          <Tabs defaultValue="processing" className="space-y-6" data-id="vxlfikwg6" data-path="src/components/dashboard/MainDashboard.tsx">
            <TabsList className="grid w-full grid-cols-3" data-id="hitk4magq" data-path="src/components/dashboard/MainDashboard.tsx">
              <TabsTrigger value="processing" className="flex items-center space-x-2" data-id="1xv7n2jnu" data-path="src/components/dashboard/MainDashboard.tsx">
                <Play className="h-4 w-4" data-id="9naea7zhv" data-path="src/components/dashboard/MainDashboard.tsx" />
                <span data-id="k3lu2lnk2" data-path="src/components/dashboard/MainDashboard.tsx">Data Processing</span>
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center space-x-2" data-id="y1wn6q0vg" data-path="src/components/dashboard/MainDashboard.tsx">
                <TestTube className="h-4 w-4" data-id="c28bncddy" data-path="src/components/dashboard/MainDashboard.tsx" />
                <span data-id="8bp8jany0" data-path="src/components/dashboard/MainDashboard.tsx">Diagnostics</span>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center space-x-2" data-id="fjqksa5uk" data-path="src/components/dashboard/MainDashboard.tsx">
                <Settings className="h-4 w-4" data-id="trxql36t4" data-path="src/components/dashboard/MainDashboard.tsx" />
                <span data-id="nxbxg7vvs" data-path="src/components/dashboard/MainDashboard.tsx">Configuration</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processing" className="space-y-6" data-id="jinsaeto7" data-path="src/components/dashboard/MainDashboard.tsx">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="q7ehx3jtp" data-path="src/components/dashboard/MainDashboard.tsx">
                {/* Processing Configuration */}
                <Card data-id="jejf0pix5" data-path="src/components/dashboard/MainDashboard.tsx">
                  <CardHeader data-id="gey097wx0" data-path="src/components/dashboard/MainDashboard.tsx">
                    <CardTitle data-id="9damdt7wm" data-path="src/components/dashboard/MainDashboard.tsx">New Processing Job</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6" data-id="l6i5p6utz" data-path="src/components/dashboard/MainDashboard.tsx">
                    {/* Data Source Selection */}
                    <div data-id="elr2uiavt" data-path="src/components/dashboard/MainDashboard.tsx">
                      <Label className="text-base font-medium" data-id="k20iosrqd" data-path="src/components/dashboard/MainDashboard.tsx">Data Source</Label>
                      <Tabs
                        value={config.sourceType}
                        onValueChange={(value) => setConfig({
                          ...config,
                          sourceType: value as 'local' | 'gcs'
                        })} data-id="ue1h11wlm" data-path="src/components/dashboard/MainDashboard.tsx">

                        <TabsList className="grid w-full grid-cols-2" data-id="p1jh6pyt3" data-path="src/components/dashboard/MainDashboard.tsx">
                          <TabsTrigger value="local" className="flex items-center space-x-2" data-id="4a9ddlh3p" data-path="src/components/dashboard/MainDashboard.tsx">
                            <Upload className="h-4 w-4" data-id="z02vcz2y9" data-path="src/components/dashboard/MainDashboard.tsx" />
                            <span data-id="y6x7hool2" data-path="src/components/dashboard/MainDashboard.tsx">Local Upload</span>
                          </TabsTrigger>
                          <TabsTrigger value="gcs" className="flex items-center space-x-2" data-id="ntkjnuo6z" data-path="src/components/dashboard/MainDashboard.tsx">
                            <Cloud className="h-4 w-4" data-id="pvrgczg43" data-path="src/components/dashboard/MainDashboard.tsx" />
                            <span data-id="sjxcpx1t5" data-path="src/components/dashboard/MainDashboard.tsx">GCS Path</span>
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="local" className="mt-4" data-id="jfc51aad7" data-path="src/components/dashboard/MainDashboard.tsx">
                          <FileUploadZone
                            selectedFile={config.file || null}
                            onFileSelect={(file) => setConfig({ ...config, file: file || undefined })}
                            disabled={isProcessing} data-id="sn3vph9jb" data-path="src/components/dashboard/MainDashboard.tsx" />

                        </TabsContent>
                        
                        <TabsContent value="gcs" className="mt-4" data-id="sjcktbu0j" data-path="src/components/dashboard/MainDashboard.tsx">
                          <GCSPathInput
                            bucket={config.gcsBucket || ''}
                            path={config.gcsPath || ''}
                            onBucketChange={(bucket) => setConfig({ ...config, gcsBucket: bucket })}
                            onPathChange={(path) => setConfig({ ...config, gcsPath: path })}
                            disabled={isProcessing} data-id="a4f7xxdb0" data-path="src/components/dashboard/MainDashboard.tsx" />

                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* GCP Configuration */}
                    <div className="grid gap-4" data-id="f2na6jsyw" data-path="src/components/dashboard/MainDashboard.tsx">
                      <div className="space-y-2" data-id="fyobhq6jz" data-path="src/components/dashboard/MainDashboard.tsx">
                        <Label htmlFor="gcp-project" data-id="kf1t5i3mk" data-path="src/components/dashboard/MainDashboard.tsx">GCP Project ID</Label>
                        <Input
                          id="gcp-project"
                          placeholder="my-gcp-project"
                          value={config.gcpProjectId}
                          onChange={(e) => setConfig({ ...config, gcpProjectId: e.target.value })}
                          disabled={isProcessing} data-id="18kdiwe17" data-path="src/components/dashboard/MainDashboard.tsx" />

                        <p className="text-xs text-gray-500" data-id="tb1i1ibjf" data-path="src/components/dashboard/MainDashboard.tsx">
                          Enter your Google Cloud Platform project ID
                        </p>
                      </div>

                      <div className="space-y-2" data-id="msyrxat1m" data-path="src/components/dashboard/MainDashboard.tsx">
                        <Label htmlFor="target-table" data-id="3j6el044j" data-path="src/components/dashboard/MainDashboard.tsx">BigQuery Target Table</Label>
                        <Input
                          id="target-table"
                          placeholder="dataset.table_name"
                          value={config.targetTable}
                          onChange={(e) => setConfig({ ...config, targetTable: e.target.value })}
                          disabled={isProcessing} data-id="d57zwh7l7" data-path="src/components/dashboard/MainDashboard.tsx" />

                        <p className="text-xs text-gray-500" data-id="dycmj4944" data-path="src/components/dashboard/MainDashboard.tsx">
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
                      disabled={isProcessing} data-id="nx1u4zo3f" data-path="src/components/dashboard/MainDashboard.tsx" />


                    {/* Process Button */}
                    <div className="pt-4" data-id="ivtp6j8ub" data-path="src/components/dashboard/MainDashboard.tsx">
                      <Button
                        onClick={handleStartProcessing}
                        disabled={isProcessing}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-id="i4szcwquo" data-path="src/components/dashboard/MainDashboard.tsx">

                        {isProcessing ?
                        <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" data-id="g9xhd179h" data-path="src/components/dashboard/MainDashboard.tsx" />
                            Starting Processing...
                          </> :

                        <>
                            <Play className="mr-2 h-4 w-4" data-id="nylhjvet0" data-path="src/components/dashboard/MainDashboard.tsx" />
                            Start Processing
                          </>
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Status */}
                <div data-id="80wl9ymte" data-path="src/components/dashboard/MainDashboard.tsx">
                  <JobStatus jobs={jobs} onJobsUpdate={setJobs} data-id="ro4qqqe1j" data-path="src/components/dashboard/MainDashboard.tsx" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-6" data-id="pwnxyh5oo" data-path="src/components/dashboard/MainDashboard.tsx">
              <ConnectionTest projectId={config.gcpProjectId} data-id="z7fsctidm" data-path="src/components/dashboard/MainDashboard.tsx" />
            </TabsContent>

            <TabsContent value="configuration" data-id="dukzf1j4h" data-path="src/components/dashboard/MainDashboard.tsx">
              <ProductionSetup data-id="i9u576tun" data-path="src/components/dashboard/MainDashboard.tsx" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>);

};

export default MainDashboard;