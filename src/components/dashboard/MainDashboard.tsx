import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { jobService } from '@/services/jobService';
import { configService } from '@/services/configService';
import { authService } from '@/services/authService';
import { ProcessingConfig, Job } from '@/types';
import FileUploadZone from '@/components/upload/FileUploadZone';
import GCSPathInput from '@/components/upload/GCSPathInput';
import SchemaDefinition from '@/components/schema/SchemaDefinition';
import JobStatus from '@/components/jobs/JobStatus';
import ProductionSetup from '@/components/configuration/ProductionSetup';
import ConnectionTest from '@/components/diagnostics/ConnectionTest';
import BigQueryJobChecker from '@/components/diagnostics/BigQueryJobChecker';
import OAuthManager from '@/components/auth/OAuthManager';
import OAuthSetupGuide from '@/components/setup/OAuthSetupGuide';
import {
  Upload,
  Settings,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Key,
  Info,
  BookOpen,
} from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for jobs
  const [jobs, setJobs] = useState<Job[]>([]);

  // Processing Configuration State
  const [processingConfig, setProcessingConfig] = useState<ProcessingConfig>({
    sourceType: 'local',
    gcpProjectId: '',
    targetTable: '',
    customSchema: [],
    integerColumns: [],
    file: undefined,
    gcsBucket: '',
    gcsPath: '',
    autoDetectSchema: true,
  });

  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const config = configService.getConfig();
    setProcessingConfig((prev) => ({
      ...prev,
      gcpProjectId: config.gcpProjectId || '',
      targetTable: config.bigQueryDefaultDataset ? `${config.bigQueryDefaultDataset}.processed_data` : '',
    }));

    // Fetch initial jobs
    if (user) {
      jobService.getJobs(user.id).then(setJobs);
    }
  }, [user]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        setShowOAuth(true);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleProcessFile = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process files.",
        variant: "destructive"
      });
      return;
    }

    // Validate OAuth authentication
    if (!authService.isAuthenticated()) {
      toast({
        title: "Google OAuth Required",
        description: "Please authenticate with Google to access BigQuery and Cloud Storage.",
        variant: "destructive"
      });
      setShowOAuth(true);
      return;
    }

    // Validate processing configuration
    const errors = validateProcessingConfig();
    if (errors.length > 0) {
      toast({
        title: "Configuration Invalid",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 Starting job with configuration:', processingConfig);

      const job = await jobService.createJob(processingConfig, user.id);
      setJobs((prevJobs) => [job, ...prevJobs]); // Add the new job to the list

      toast({
        title: "Processing Started! 🚀",
        description: `Job ${job.id} has been queued for processing.`
      });

      console.log('✅ Job created successfully:', job.id);

    } catch (error) {
      console.error('❌ Job creation failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive"
      });

      // Show specific guidance based on error type
      if (errorMessage.includes('authentication') || errorMessage.includes('OAuth')) {
        setShowOAuth(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const validateProcessingConfig = (): string[] => {
    const errors: string[] = [];

    if (!processingConfig.gcpProjectId?.trim()) {
      errors.push('GCP Project ID is required');
    }

    if (!processingConfig.targetTable?.trim()) {
      errors.push('Target table is required');
    } else if (!processingConfig.targetTable.includes('.')) {
      errors.push('Target table must include dataset (format: dataset.table)');
    }

    if (processingConfig.sourceType === 'local' && !processingConfig.file) {
      errors.push('Please select a file to upload');
    }

    if (processingConfig.sourceType === 'gcs') {
      if (!processingConfig.gcsBucket?.trim()) {
        errors.push('GCS bucket is required for GCS source');
      }
      if (!processingConfig.gcsPath?.trim()) {
        errors.push('GCS path is required for GCS source');
      }
    }

    // Schema validation
    if (!processingConfig.autoDetectSchema && (!processingConfig.customSchema || processingConfig.customSchema.length === 0)) {
      errors.push('Please define a custom schema or enable auto-detect schema');
    }

    return errors;
  };

  const getAuthStatus = () => {
    if (!authService.isAuthenticated()) {
      return {
        status: 'error' as const,
        message: 'Not authenticated with Google OAuth',
        action: 'Sign in required'
      };
    }

    if (authService.willExpireSoon()) {
      return {
        status: 'warning' as const,
        message: 'OAuth token will expire soon',
        action: 'Refresh recommended'
      };
    }

    return {
      status: 'success' as const,
      message: 'Authenticated and ready',
      action: 'All systems go'
    };
  };

  const authStatus = getAuthStatus();

  return (
    <div className="container mx-auto p-6 space-y-6" data-id="610vhpoad" data-path="src/components/dashboard/MainDashboard.tsx">
      {/* Header */}
      <div className="flex items-center justify-between" data-id="58x56orlc" data-path="src/components/dashboard/MainDashboard.tsx">
        <div data-id="voovrmf3l" data-path="src/components/dashboard/MainDashboard.tsx">
          <h1 className="text-3xl font-bold tracking-tight" data-id="1yg04mku0" data-path="src/components/dashboard/MainDashboard.tsx">GIS Data Processing</h1>
          <p className="text-muted-foreground" data-id="0ekhvrwqz" data-path="src/components/dashboard/MainDashboard.tsx">
            Process and load spatial data to BigQuery with OAuth authentication
          </p>
        </div>
        
        {/* Authentication Status */}
        <div className="flex items-center gap-2" data-id="kyxembiij" data-path="src/components/dashboard/MainDashboard.tsx">
          {authStatus.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" data-id="4n4j19zla" data-path="src/components/dashboard/MainDashboard.tsx" />}
          {authStatus.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" data-id="178fjl1jp" data-path="src/components/dashboard/MainDashboard.tsx" />}
          {authStatus.status === 'error' && <Key className="h-5 w-5 text-red-500" data-id="iga24nt99" data-path="src/components/dashboard/MainDashboard.tsx" />}
          
          <div className="text-sm" data-id="126wc2kb5" data-path="src/components/dashboard/MainDashboard.tsx">
            <div className="font-medium" data-id="5l0rrkuy8" data-path="src/components/dashboard/MainDashboard.tsx">{authStatus.action}</div>
            <div className="text-muted-foreground" data-id="f5y3aa0me" data-path="src/components/dashboard/MainDashboard.tsx">{authStatus.message}</div>
          </div>
          
          {authStatus.status !== 'success' &&
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOAuth(true)} data-id="hkno7m41b" data-path="src/components/dashboard/MainDashboard.tsx">

              <Key className="h-4 w-4 mr-1" data-id="dz64zmdfs" data-path="src/components/dashboard/MainDashboard.tsx" />
              Authenticate
            </Button>
          }
        </div>
      </div>

      {/* OAuth Manager Modal */}
      {showOAuth &&
      <div className="mb-6" data-id="6wllf6otv" data-path="src/components/dashboard/MainDashboard.tsx">
          <OAuthManager
          onAuthSuccess={() => {
            setShowOAuth(false);
            toast({
              title: "Authentication Successful ✅",
              description: "You can now process files with Google Cloud services."
            });
          }}
          onAuthError={(error) => {
            toast({
              title: "Authentication Failed",
              description: error,
              variant: "destructive"
            });
          }} data-id="cyocw1kms" data-path="src/components/dashboard/MainDashboard.tsx" />

          
          <div className="mt-4 flex justify-center" data-id="tohchgr6m" data-path="src/components/dashboard/MainDashboard.tsx">
            <Button
            variant="ghost"
            onClick={() => setShowOAuth(false)} data-id="yj7q4ysl5" data-path="src/components/dashboard/MainDashboard.tsx">

              Close
            </Button>
          </div>
        </div>
      }

      {/* Main Content */}
      <Tabs defaultValue="process" className="space-y-6" data-id="6ev99wt6z" data-path="src/components/dashboard/MainDashboard.tsx">
        <TabsList className="grid w-full grid-cols-6" data-id="i7idg4mm4" data-path="src/components/dashboard/MainDashboard.tsx">
          <TabsTrigger value="process" className="flex items-center gap-2" data-id="hdsdatg5z" data-path="src/components/dashboard/MainDashboard.tsx">
            <Upload className="h-4 w-4" data-id="y1lm3o30w" data-path="src/components/dashboard/MainDashboard.tsx" />
            Process
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2" data-id="6dltcm3ir" data-path="src/components/dashboard/MainDashboard.tsx">
            <Activity className="h-4 w-4" data-id="sb4nwokd5" data-path="src/components/dashboard/MainDashboard.tsx" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2" data-id="ds96alr3k" data-path="src/components/dashboard/MainDashboard.tsx">
            <BarChart3 className="h-4 w-4" data-id="86n0e9dyr" data-path="src/components/dashboard/MainDashboard.tsx" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2" data-id="gc34222m2" data-path="src/components/dashboard/MainDashboard.tsx">
            <Settings className="h-4 w-4" data-id="860d94v45" data-path="src/components/dashboard/MainDashboard.tsx" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="checker" className="flex items-center gap-2" data-id="0t2hjsyll" data-path="src/components/dashboard/MainDashboard.tsx">
            <BarChart3 className="h-4 w-4" data-id="hq4k0ols7" data-path="src/components/dashboard/MainDashboard.tsx" />
            Job Checker
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2" data-id="hd668c1w9" data-path="src/components/dashboard/MainDashboard.tsx">
            <BookOpen className="h-4 w-4" data-id="82afkl33r" data-path="src/components/dashboard/MainDashboard.tsx" />
            OAuth Guide
          </TabsTrigger>
        </TabsList>

        {/* Processing Tab */}
        <TabsContent value="process" className="space-y-6" data-id="xeguf2oty" data-path="src/components/dashboard/MainDashboard.tsx">
          {/* Authentication Warning */}
          {!authService.isAuthenticated() &&
          <Alert variant="destructive" data-id="p1z3q138a" data-path="src/components/dashboard/MainDashboard.tsx">
              <AlertTriangle className="h-4 w-4" data-id="eqqoucnya" data-path="src/components/dashboard/MainDashboard.tsx" />
              <AlertDescription data-id="nnkenda03" data-path="src/components/dashboard/MainDashboard.tsx">
                <div className="flex items-center justify-between" data-id="0zqhlbimu" data-path="src/components/dashboard/MainDashboard.tsx">
                  <span data-id="eolhtk4fh" data-path="src/components/dashboard/MainDashboard.tsx">Google OAuth authentication is required to process files.</span>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOAuth(true)} data-id="6hwj5kfyv" data-path="src/components/dashboard/MainDashboard.tsx">

                    Authenticate Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          }

          {/* Configuration Section */}
          <Card data-id="4lftwpagv" data-path="src/components/dashboard/MainDashboard.tsx">
            <CardHeader data-id="2lk26eh4p" data-path="src/components/dashboard/MainDashboard.tsx">
              <CardTitle data-id="kif83n22n" data-path="src/components/dashboard/MainDashboard.tsx">Processing Configuration</CardTitle>
              <CardDescription data-id="v2hpelsgb" data-path="src/components/dashboard/MainDashboard.tsx">
                Configure your GCP project and target table settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4" data-id="u6q90vprs" data-path="src/components/dashboard/MainDashboard.tsx">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="clvupzkqi" data-path="src/components/dashboard/MainDashboard.tsx">
                <div className="space-y-2" data-id="ejctsb37q" data-path="src/components/dashboard/MainDashboard.tsx">
                  <Label htmlFor="gcpProject" data-id="yzyc2c83w" data-path="src/components/dashboard/MainDashboard.tsx">GCP Project ID *</Label>
                  <Input
                    id="gcpProject"
                    placeholder="your-gcp-project-id"
                    value={processingConfig.gcpProjectId}
                    onChange={(e) => setProcessingConfig((prev) => ({
                      ...prev,
                      gcpProjectId: e.target.value
                    }))} data-id="art6fseda" data-path="src/components/dashboard/MainDashboard.tsx" />

                </div>
                
                <div className="space-y-2" data-id="vg1mfd1x4" data-path="src/components/dashboard/MainDashboard.tsx">
                  <Label htmlFor="targetTable" data-id="fizja9rgl" data-path="src/components/dashboard/MainDashboard.tsx">Target Table *</Label>
                  <Input
                    id="targetTable"
                    placeholder="dataset.table_name"
                    value={processingConfig.targetTable}
                    onChange={(e) => setProcessingConfig((prev) => ({
                      ...prev,
                      targetTable: e.target.value
                    }))} data-id="tv9ef347b" data-path="src/components/dashboard/MainDashboard.tsx" />

                </div>
              </div>

              <Alert data-id="w995wvnur" data-path="src/components/dashboard/MainDashboard.tsx">
                <Info className="h-4 w-4" data-id="6eif61hne" data-path="src/components/dashboard/MainDashboard.tsx" />
                <AlertDescription data-id="9m4quzf1k" data-path="src/components/dashboard/MainDashboard.tsx">
                  <strong data-id="rkbdmrkmp" data-path="src/components/dashboard/MainDashboard.tsx">Requirements:</strong> Ensure BigQuery and Cloud Storage APIs are enabled in your GCP project. 
                  You need OAuth permissions for BigQuery and Cloud Storage access. 
                  <Button
                    variant="link"
                    className="p-0 h-auto ml-1"
                    onClick={() => setShowOAuth(true)} data-id="tb4hkgl5s" data-path="src/components/dashboard/MainDashboard.tsx">

                    Click here to authenticate
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Source Selection */}
          <Tabs
            value={processingConfig.sourceType}
            onValueChange={(value) => setProcessingConfig((prev) => ({
              ...prev,
              sourceType: value as 'local' | 'gcs'
            }))} data-id="n5u1z7u0y" data-path="src/components/dashboard/MainDashboard.tsx">

            <TabsList className="grid w-full grid-cols-2" data-id="1ugh8l2n0" data-path="src/components/dashboard/MainDashboard.tsx">
              <TabsTrigger value="local" data-id="iy1j74g5q" data-path="src/components/dashboard/MainDashboard.tsx">Upload File</TabsTrigger>
              <TabsTrigger value="gcs" data-id="fkn4vwo57" data-path="src/components/dashboard/MainDashboard.tsx">GCS Path</TabsTrigger>
            </TabsList>
            
            <TabsContent value="local" data-id="87ogyucb3" data-path="src/components/dashboard/MainDashboard.tsx">
              <FileUploadZone
                onFileSelect={(file) => setProcessingConfig((prev) => ({
                  ...prev,
                  file
                }))}
                selectedFile={processingConfig.file} data-id="xpiysjtq7" data-path="src/components/dashboard/MainDashboard.tsx" />

            </TabsContent>
            
            <TabsContent value="gcs" data-id="gkwh17u8a" data-path="src/components/dashboard/MainDashboard.tsx">
              <GCSPathInput
                bucket={processingConfig.gcsBucket}
                path={processingConfig.gcsPath}
                onBucketChange={(bucket) => setProcessingConfig((prev) => ({
                  ...prev,
                  gcsBucket: bucket
                }))}
                onPathChange={(path) => setProcessingConfig((prev) => ({
                  ...prev,
                  gcsPath: path
                }))} data-id="ypliuvbj8" data-path="src/components/dashboard/MainDashboard.tsx" />

            </TabsContent>
          </Tabs>

          {/* Schema Configuration */}
          <SchemaDefinition
            autoDetectSchema={processingConfig.autoDetectSchema}
            onAutoDetectChange={(value) => setProcessingConfig((prev) => ({ ...prev, autoDetectSchema: value }))}
            customSchema={processingConfig.customSchema || []}
            onCustomSchemaChange={(schema) => setProcessingConfig((prev) => ({
              ...prev,
              customSchema: schema
            }))}
            integerColumns={processingConfig.integerColumns?.join('|') || ''}
            onIntegerColumnsChange={(columns) => setProcessingConfig((prev) => ({
              ...prev,
              integerColumns: columns.split('|').filter((col) => col.trim())
            }))}
            disabled={isProcessing}
          />


          {/* Process Button */}
          <Card data-id="poscom590" data-path="src/components/dashboard/MainDashboard.tsx">
            <CardContent className="pt-6" data-id="flxwdthuf" data-path="src/components/dashboard/MainDashboard.tsx">
              <Button
                onClick={handleProcessFile}
                disabled={isProcessing || !authService.isAuthenticated()}
                className="w-full"
                size="lg" data-id="8f4pgz8ya" data-path="src/components/dashboard/MainDashboard.tsx">

                {isProcessing ?
                <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" data-id="8812014lf" data-path="src/components/dashboard/MainDashboard.tsx" />
                    Processing...
                  </> :

                <>
                    <Upload className="h-4 w-4 mr-2" data-id="ln3g58noa" data-path="src/components/dashboard/MainDashboard.tsx" />
                    Start Processing
                  </>
                }
              </Button>
              
              {!authService.isAuthenticated() &&
              <p className="text-center text-sm text-muted-foreground mt-2" data-id="xhriylkop" data-path="src/components/dashboard/MainDashboard.tsx">
                  Please authenticate with Google OAuth to continue. 
                  <Button
                  variant="link"
                  className="p-0 h-auto ml-1"
                  onClick={() => setShowOAuth(true)} data-id="4yalon696" data-path="src/components/dashboard/MainDashboard.tsx">

                    Sign in now
                  </Button>
                </p>
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Status Tab */}
        <TabsContent value="status" data-id="vq7rue4ms" data-path="src/components/dashboard/MainDashboard.tsx">
          <JobStatus jobs={jobs} onJobsUpdate={setJobs} />
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" data-id="ttlxp120m" data-path="src/components/dashboard/MainDashboard.tsx">
          <ConnectionTest data-id="fjpb01o74" data-path="src/components/dashboard/MainDashboard.tsx" />
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" data-id="x9kx071c1" data-path="src/components/dashboard/MainDashboard.tsx">
          <ProductionSetup data-id="3hlfpgrsj" data-path="src/components/dashboard/MainDashboard.tsx" />
        </TabsContent>

        {/* Job Checker Tab */}
        <TabsContent value="checker" data-id="80x6hh3nn" data-path="src/components/dashboard/MainDashboard.tsx">
          <BigQueryJobChecker data-id="k0tyc00ch" data-path="src/components/dashboard/MainDashboard.tsx" />
        </TabsContent>

        {/* OAuth Guide Tab */}
        <TabsContent value="guide" data-id="6wtchw2hc" data-path="src/components/dashboard/MainDashboard.tsx">
          <OAuthSetupGuide data-id="jyb4eu6ke" data-path="src/components/dashboard/MainDashboard.tsx" />
        </TabsContent>
      </Tabs>
    </div>);

};

export default MainDashboard;