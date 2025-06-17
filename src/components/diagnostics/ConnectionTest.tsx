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
        return <CheckCircle className="h-4 w-4 text-green-500" data-id="1hh89pvvk" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" data-id="ap7bdall3" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" data-id="6ffc5yueq" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" data-id="uib7z7qxb" data-path="src/components/diagnostics/ConnectionTest.tsx" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800" data-id="hss4r9ys3" data-path="src/components/diagnostics/ConnectionTest.tsx">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive" data-id="zj9umdiu2" data-path="src/components/diagnostics/ConnectionTest.tsx">Failed</Badge>;
      case 'testing':
        return <Badge variant="secondary" data-id="fhsabd3wv" data-path="src/components/diagnostics/ConnectionTest.tsx">Testing...</Badge>;
      default:
        return <Badge variant="outline" data-id="0yqyb4fpe" data-path="src/components/diagnostics/ConnectionTest.tsx">Not Tested</Badge>;
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
    <div className="space-y-6" data-id="nr1s77iys" data-path="src/components/diagnostics/ConnectionTest.tsx">
      <Card data-id="ful8mdeqk" data-path="src/components/diagnostics/ConnectionTest.tsx">
        <CardHeader data-id="t5twsa3r6" data-path="src/components/diagnostics/ConnectionTest.tsx">
          <CardTitle className="flex items-center gap-2" data-id="sb1e1t9r8" data-path="src/components/diagnostics/ConnectionTest.tsx">
            <Zap className="h-5 w-5" data-id="jijku6gtv" data-path="src/components/diagnostics/ConnectionTest.tsx" />
            Connection Diagnostics
          </CardTitle>
          <CardDescription data-id="uav09c3b2" data-path="src/components/diagnostics/ConnectionTest.tsx">
            Test your BigQuery and Google Cloud Storage connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" data-id="pg0x5v3g4" data-path="src/components/diagnostics/ConnectionTest.tsx">
          {/* Configuration Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-id="cvg5h9v8b" data-path="src/components/diagnostics/ConnectionTest.tsx">
            <div data-id="zftvbxzbt" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <p className="font-medium" data-id="ky5f04crx" data-path="src/components/diagnostics/ConnectionTest.tsx">Current Configuration</p>
              <p className="text-sm text-gray-600" data-id="wy8y9wy02" data-path="src/components/diagnostics/ConnectionTest.tsx">
                Auth: {authMethod} • Real Processing: {isRealProcessingEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="flex items-center gap-2" data-id="un1ao3znb" data-path="src/components/diagnostics/ConnectionTest.tsx">
              {hasServiceAccount ?
              <Badge variant="default" className="bg-green-100 text-green-800" data-id="1zkd9a60m" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  Service Account Configured
                </Badge> :

              <Badge variant="outline" data-id="umzfvhoi6" data-path="src/components/diagnostics/ConnectionTest.tsx">No Service Account</Badge>
              }
            </div>
          </div>

          {/* Test All Button */}
          <div className="flex justify-center" data-id="ptz5g4uvj" data-path="src/components/diagnostics/ConnectionTest.tsx">
            <Button
              onClick={testAllConnections}
              disabled={isTestingAll || !hasServiceAccount}
              size="lg"
              className="min-w-48" data-id="xnlc4c1m1" data-path="src/components/diagnostics/ConnectionTest.tsx">

              {isTestingAll ?
              <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" data-id="a9xey5cvz" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                  Testing Connections...
                </> :

              <>
                  <Zap className="h-4 w-4 mr-2" data-id="ldmkmu3yv" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                  Test All Connections
                </>
              }
            </Button>
          </div>

          {/* Overall Status */}
          {testResult.overall.status !== 'idle' &&
          <Alert className={testResult.overall.status === 'success' ? 'border-green-200 bg-green-50' :
          testResult.overall.status === 'error' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'} data-id="wid5ljz9d" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <div className="flex items-center gap-2" data-id="p5angh2a9" data-path="src/components/diagnostics/ConnectionTest.tsx">
                {getStatusIcon(testResult.overall.status)}
                <AlertDescription data-id="ne5qljvvm" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <strong data-id="yxjed5ioa" data-path="src/components/diagnostics/ConnectionTest.tsx">{testResult.overall.message}</strong>
                  {testResult.overall.details &&
                <div className="text-sm text-gray-600 mt-1" data-id="15u1m9eny" data-path="src/components/diagnostics/ConnectionTest.tsx">
                      {testResult.overall.details}
                    </div>
                }
                </AlertDescription>
              </div>
            </Alert>
          }

          <Separator data-id="2nlgwveau" data-path="src/components/diagnostics/ConnectionTest.tsx" />

          {/* Individual Connection Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="mbutithe5" data-path="src/components/diagnostics/ConnectionTest.tsx">
            {/* BigQuery Connection */}
            <Card data-id="rn7vzvz2w" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <CardHeader className="pb-3" data-id="3kzy0h2sg" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <CardTitle className="text-lg flex items-center justify-between" data-id="jf5ng2g6t" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <span data-id="hkk0m1i8c" data-path="src/components/diagnostics/ConnectionTest.tsx">BigQuery</span>
                  {getStatusBadge(testResult.bigquery.status)}
                </CardTitle>
              </CardHeader>
              <CardContent data-id="yt22139c0" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <div className="space-y-3" data-id="eo7s33dqf" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <Button
                    variant="outline"
                    onClick={testBigQueryConnection}
                    disabled={testResult.bigquery.status === 'testing' || !hasServiceAccount}
                    className="w-full" data-id="roylk2n7p" data-path="src/components/diagnostics/ConnectionTest.tsx">

                    {testResult.bigquery.status === 'testing' ?
                    <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" data-id="og7jttyje" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                        Testing...
                      </> :

                    'Test BigQuery Connection'
                    }
                  </Button>

                  {testResult.bigquery.message &&
                  <div className="text-sm" data-id="lh9wi8w5j" data-path="src/components/diagnostics/ConnectionTest.tsx">
                      <p className={testResult.bigquery.status === 'success' ? 'text-green-600' : 'text-red-600'} data-id="chygef7d1" data-path="src/components/diagnostics/ConnectionTest.tsx">
                        {testResult.bigquery.message}
                      </p>
                      {testResult.bigquery.details &&
                    <p className="text-gray-600 mt-1" data-id="g90d9lgh2" data-path="src/components/diagnostics/ConnectionTest.tsx">
                          {testResult.bigquery.details}
                        </p>
                    }
                    </div>
                  }
                </div>
              </CardContent>
            </Card>

            {/* GCS Connection */}
            <Card data-id="wj74bz1zp" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <CardHeader className="pb-3" data-id="p6o4xqgib" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <CardTitle className="text-lg flex items-center justify-between" data-id="q2i5f8tvy" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <span data-id="grv6c3z9o" data-path="src/components/diagnostics/ConnectionTest.tsx">Cloud Storage</span>
                  {getStatusBadge(testResult.gcs.status)}
                </CardTitle>
              </CardHeader>
              <CardContent data-id="gj2egb408" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <div className="space-y-3" data-id="s6hh26auo" data-path="src/components/diagnostics/ConnectionTest.tsx">
                  <Button
                    variant="outline"
                    onClick={testGCSConnection}
                    disabled={testResult.gcs.status === 'testing' || !hasServiceAccount}
                    className="w-full" data-id="hi754onkx" data-path="src/components/diagnostics/ConnectionTest.tsx">

                    {testResult.gcs.status === 'testing' ?
                    <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" data-id="qybrka6pj" data-path="src/components/diagnostics/ConnectionTest.tsx" />
                        Testing...
                      </> :

                    'Test GCS Connection'
                    }
                  </Button>

                  {testResult.gcs.message &&
                  <div className="text-sm" data-id="keii4hi2e" data-path="src/components/diagnostics/ConnectionTest.tsx">
                      <p className={testResult.gcs.status === 'success' ? 'text-green-600' : 'text-red-600'} data-id="zmqusi3gi" data-path="src/components/diagnostics/ConnectionTest.tsx">
                        {testResult.gcs.message}
                      </p>
                      {testResult.gcs.details &&
                    <p className="text-gray-600 mt-1" data-id="5e2zydno2" data-path="src/components/diagnostics/ConnectionTest.tsx">
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
          <Alert data-id="fdnnu7gbx" data-path="src/components/diagnostics/ConnectionTest.tsx">
              <AlertCircle className="h-4 w-4" data-id="1e6a6z5j1" data-path="src/components/diagnostics/ConnectionTest.tsx" />
              <AlertDescription data-id="jh3hedvac" data-path="src/components/diagnostics/ConnectionTest.tsx">
                <strong data-id="94mxxitwn" data-path="src/components/diagnostics/ConnectionTest.tsx">Service Account Required:</strong> Please configure your service account in the Production Setup tab before testing connections.
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* API Diagnostics */}
      <ApiDiagnostics data-id="3sz0s3xno" data-path="src/components/diagnostics/ConnectionTest.tsx" />
    </div>);

};

export default ConnectionTest;