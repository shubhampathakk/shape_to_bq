import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { configService } from '@/services/configService';
import { bigQueryService } from '@/services/bigqueryService';
import { gcsService } from '@/services/gcsService';
import { CheckCircle, XCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import ApiDiagnostics from './ApiDiagnostics';

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  details?: string;
}

interface TestResult {
  bigquery: ConnectionStatus;
  gcs: ConnectionStatus;
  overall: ConnectionStatus;
}

const ConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult>({
    bigquery: { status: 'idle' },
    gcs: { status: 'idle' },
    overall: { status: 'idle' }
  });
  const [isTestingAll, setIsTestingAll] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" data-id="5agi250xj" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" data-id="bpzh3ysv8" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" data-id="wae0t9id0" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" data-id="04wdi4xvg" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800" data-id="3ri3o1tbu" data-path="src/components/diagnostics/ConnectionTest.tsx">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive" data-id="ablz9bdj9" data-path="src/components/diagnostics/ConnectionTest.tsx">Failed</Badge>;
      case 'testing':
        return <Badge variant="secondary" data-id="b1mb8gfqx" data-path="src/components/diagnostics/ConnectionTest.tsx">Testing...</Badge>;
      default:
        return <Badge variant="outline" data-id="ig42nn71u" data-path="src/components/diagnostics/ConnectionTest.tsx">Not Tested</Badge>;
    }
  };

  const testBigQueryConnection = async () => {
    const config = configService.getConfig();
    const projectId = config.gcpProjectId || configService.getGcpProjectFromServiceAccount();

    if (!projectId) {
      setTestResult((prev) => ({
        ...prev,
        bigquery: {
          status: 'error',
          message: 'No GCP Project ID configured',
          details: 'Please set your GCP Project ID in the configuration'
        }
      }));
      return false;
    }

    setTestResult((prev) => ({ ...prev, bigquery: { status: 'testing' } }));

    try {
      const isConnected = await bigQueryService.testConnection(projectId);

      if (isConnected) {
        setTestResult((prev) => ({
          ...prev,
          bigquery: {
            status: 'success',
            message: `Successfully connected to BigQuery project: ${projectId}`,
            details: 'BigQuery API is accessible and authentication is working'
          }
        }));
        return true;
      } else {
        setTestResult((prev) => ({
          ...prev,
          bigquery: {
            status: 'error',
            message: 'BigQuery connection failed',
            details: 'Check your service account permissions and project ID'
          }
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult((prev) => ({
        ...prev,
        bigquery: {
          status: 'error',
          message: 'BigQuery connection failed',
          details: errorMessage
        }
      }));
      return false;
    }
  };

  const testGCSConnection = async () => {
    setTestResult((prev) => ({ ...prev, gcs: { status: 'testing' } }));

    try {
      const result = await gcsService.testConnection();

      if (result.success) {
        setTestResult((prev) => ({
          ...prev,
          gcs: {
            status: 'success',
            message: `GCS connection successful using ${result.method}`,
            details: result.bucket ? `Default bucket: ${result.bucket}` : 'Connection established'
          }
        }));
        return true;
      } else {
        setTestResult((prev) => ({
          ...prev,
          gcs: {
            status: 'error',
            message: 'GCS connection failed',
            details: result.error || 'Unknown error'
          }
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult((prev) => ({
        ...prev,
        gcs: {
          status: 'error',
          message: 'GCS connection failed',
          details: errorMessage
        }
      }));
      return false;
    }
  };

  const testAllConnections = async () => {
    setIsTestingAll(true);
    setTestResult((prev) => ({ ...prev, overall: { status: 'testing' } }));

    try {
      console.log('🔍 Starting comprehensive connection test...');

      // Test both connections
      const [bqSuccess, gcsSuccess] = await Promise.all([
      testBigQueryConnection(),
      testGCSConnection()]
      );

      const allSuccess = bqSuccess && gcsSuccess;

      if (allSuccess) {
        console.log('✅ All connections successful - enabling real processing');

        // Auto-enable real processing when all connections are successful
        configService.enableRealProcessingIfReady();

        setTestResult((prev) => ({
          ...prev,
          overall: {
            status: 'success',
            message: 'All connections successful! Real processing enabled.',
            details: 'Your application is ready for production data processing'
          }
        }));

        toast({
          title: "🎉 Connections Successful!",
          description: "All services are connected and real processing is now enabled. You can start processing data.",
          duration: 5000
        });
      } else {
        setTestResult((prev) => ({
          ...prev,
          overall: {
            status: 'error',
            message: 'Some connections failed',
            details: 'Please fix the failed connections before proceeding'
          }
        }));

        toast({
          title: "❌ Connection Issues",
          description: "Some services failed to connect. Please check your configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setTestResult((prev) => ({
        ...prev,
        overall: {
          status: 'error',
          message: 'Connection test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setIsTestingAll(false);
    }
  };

  const config = configService.getConfig();
  const authMethod = configService.getAuthMethod();
  const hasServiceAccount = !!configService.getServiceAccountKey();
  const isRealProcessingEnabled = configService.isRealProcessingEnabled();

  return (
    <div className="space-y-6" data-id="k9g6xi5mg" data-path="src/components/diagnostics/ConnectionTest.tsx">
      <Card data-id="507lnog5c" data-path="src/components/diagnostics/ConnectionTest.tsx">
        <CardHeader data-id="fq5tqw3so" data-path="src/components/diagnostics/ConnectionTest.tsx">
          <CardTitle className="flex items-center gap-2" data-id="kpvi1h54n" data-path="src/components/diagnostics/ConnectionTest.tsx">
            <Zap className="h-5 w-5" data-id="oafzv26p1" data-path="src/components/diagnostics/ConnectionTest.tsx" />
            Connection Diagnostics
          </CardTitle>
          <CardDescription data-id="apl5wy4s3" data-path="src/components/diagnostics/ConnectionTest.tsx">
            Test your BigQuery and Google Cloud Storage connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" data-id="vtzgpynva" data-path="src/components/diagnostics/ConnectionTest.tsx">
          {/* Configuration Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-id="bi84vvrk3" data-path="src/components/diagnostics/ConnectionTest.tsx">
            <div data-id="523xwo382" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <p className="font-medium" data-id="0olu2720l" data-path="src/components/diagnostics/ConnectionTest.tsx">Current Configuration</p>
              <p className="text-sm text-gray-600" data-id="3hvefvkm1" data-path="src/components/diagnostics/ConnectionTest.tsx">
                Auth: {authMethod} • Real Processing: {isRealProcessingEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="flex items-center gap-2" data-id="ruro58w65" data-path="src/components/diagnostics/ConnectionTest.tsx">
              {hasServiceAccount ?
              <Badge variant="default" className="bg-green-100 text-green-800" data-id="s8kpko3qq" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  Service Account Configured
                </Badge> :

              <Badge variant="outline" data-id="hary7zqv2" data-path="src/components/diagnostics/ConnectionTest.tsx">No Service Account</Badge>
              }
            </div>
          </div>

          {/* Test All Button */}
          <div className="flex justify-center" data-id="064bvwapx" data-path="src/components/diagnostics/ConnectionTest.tsx">
            <Button
              onClick={testAllConnections}
              disabled={isTestingAll || !hasServiceAccount}
              size="lg"
              className="min-w-48" data-id="27kp7iosg" data-path="src/components/diagnostics/ConnectionTest.tsx">

              {isTestingAll ?
              <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" data-id="zx5btixua" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                  Testing Connections...
                </> :

              <>
                  <Zap className="h-4 w-4 mr-2" data-id="xmb0ka9al" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                  Test All Connections
                </>
              }
            </Button>
          </div>

          {/* Overall Status */}
          {testResult.overall.status !== 'idle' &&
          <Alert className={testResult.overall.status === 'success' ? 'border-green-200 bg-green-50' :
          testResult.overall.status === 'error' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'} data-id="v3k99936d" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <div className="flex items-center gap-2" data-id="52s5709rc" data-path="src/components/diagnostics/ConnectionTest.tsx">
                {getStatusIcon(testResult.overall.status)}
                <AlertDescription data-id="bk32qjv9p" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <strong data-id="ahszw9l9y" data-path="src/components/diagnostics/ConnectionTest.tsx">{testResult.overall.message}</strong>
                  {testResult.overall.details &&
                <div className="text-sm text-gray-600 mt-1" data-id="fnmxs0bz8" data-path="src/components/diagnostics/ConnectionTest.tsx">
                      {testResult.overall.details}
                    </div>
                }
                </AlertDescription>
              </div>
            </Alert>
          }

          <Separator data-id="0y53bzpv0" data-path="src/components/diagnostics/ConnectionTest.tsx" />

          {/* Individual Connection Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="cx0ck1z2q" data-path="src/components/diagnostics/ConnectionTest.tsx">
            {/* BigQuery Connection */}
            <Card data-id="tdsj46bm4" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <CardHeader className="pb-3" data-id="97yddwdwj" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <CardTitle className="text-lg flex items-center justify-between" data-id="7mmkk6t1r" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <span data-id="1we0nu6wm" data-path="src/components/diagnostics/ConnectionTest.tsx">BigQuery</span>
                  {getStatusBadge(testResult.bigquery.status)}
                </CardTitle>
              </CardHeader>
              <CardContent data-id="as2jchbgc" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <div className="space-y-3" data-id="ath0ppl6l" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <Button
                    variant="outline"
                    onClick={testBigQueryConnection}
                    disabled={testResult.bigquery.status === 'testing' || !hasServiceAccount}
                    className="w-full" data-id="0ohnsvnek" data-path="src/components/diagnostics/ConnectionTest.tsx">

                    {testResult.bigquery.status === 'testing' ?
                    <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" data-id="ke7460t0l" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                        Testing...
                      </> :

                    'Test BigQuery Connection'
                    }
                  </Button>

                  {testResult.bigquery.message &&
                  <div className="text-sm" data-id="4knj7y0gc" data-path="src/components/diagnostics/ConnectionTest.tsx">
                      <p className={testResult.bigquery.status === 'success' ? 'text-green-600' : 'text-red-600'} data-id="ezjamjkic" data-path="src/components/diagnostics/ConnectionTest.tsx">
                        {testResult.bigquery.message}
                      </p>
                      {testResult.bigquery.details &&
                    <p className="text-gray-600 mt-1" data-id="v3rviv45l" data-path="src/components/diagnostics/ConnectionTest.tsx">
                          {testResult.bigquery.details}
                        </p>
                    }
                    </div>
                  }
                </div>
              </CardContent>
            </Card>

            {/* GCS Connection */}
            <Card data-id="93d23whvy" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <CardHeader className="pb-3" data-id="pf9z49yuk" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <CardTitle className="text-lg flex items-center justify-between" data-id="4z4jsvjbx" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <span data-id="1rv9h9hmw" data-path="src/components/diagnostics/ConnectionTest.tsx">Cloud Storage</span>
                  {getStatusBadge(testResult.gcs.status)}
                </CardTitle>
              </CardHeader>
              <CardContent data-id="ki35fjzkm" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <div className="space-y-3" data-id="9upg211jb" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <Button
                    variant="outline"
                    onClick={testGCSConnection}
                    disabled={testResult.gcs.status === 'testing' || !hasServiceAccount}
                    className="w-full" data-id="m91c0kkzv" data-path="src/components/diagnostics/ConnectionTest.tsx">

                    {testResult.gcs.status === 'testing' ?
                    <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" data-id="v8sf9sdnu" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                        Testing...
                      </> :

                    'Test GCS Connection'
                    }
                  </Button>

                  {testResult.gcs.message &&
                  <div className="text-sm" data-id="jxtvu0835" data-path="src/components/diagnostics/ConnectionTest.tsx">
                      <p className={testResult.gcs.status === 'success' ? 'text-green-600' : 'text-red-600'} data-id="nms7m0ezy" data-path="src/components/diagnostics/ConnectionTest.tsx">
                        {testResult.gcs.message}
                      </p>
                      {testResult.gcs.details &&
                    <p className="text-gray-600 mt-1" data-id="1851k11m8" data-path="src/components/diagnostics/ConnectionTest.tsx">
                          {testResult.gcs.details}
                        </p>
                    }
                    </div>
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {!hasServiceAccount &&
          <Alert data-id="y6duycj5d" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <AlertCircle className="h-4 w-4" data-id="cpvtttvk4" data-path="src/components/diagnostics/ConnectionTest.tsx" />
              <AlertDescription data-id="o6qaz1yu7" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <strong data-id="l83slfjip" data-path="src/components/diagnostics/ConnectionTest.tsx">Service Account Required:</strong> Please configure your service account in the Production Setup tab before testing connections.
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* API Diagnostics */}
      <ApiDiagnostics data-id="llh1zf8va" data-path="src/components/diagnostics/ConnectionTest.tsx" />
    </div>);

};

export default ConnectionTest;