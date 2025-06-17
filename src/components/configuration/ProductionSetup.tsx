
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { configService } from '@/services/configService';
import {
  Settings,
  Key,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Cloud,
  Database,
  AlertCircle,
  Folder } from
'lucide-react';

const ProductionSetup: React.FC = () => {
  const [config, setConfig] = useState(configService.getConfig());
  const [serviceAccountKey, setServiceAccountKey] = useState('');
  const [customBucket, setCustomBucket] = useState('');
  const [customDataset, setCustomDataset] = useState('');
  const [isValidKey, setIsValidKey] = useState(false);
  const [keyErrors, setKeyErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const currentKey = configService.getServiceAccountKey();
    if (currentKey) {
      setServiceAccountKey(currentKey);
      validateServiceAccountKey(currentKey);
    }

    const currentConfig = configService.getConfig();
    setCustomBucket(currentConfig.gcsDefaultBucket || '');
    setCustomDataset(currentConfig.bigQueryDefaultDataset || '');
  }, []);

  const validateServiceAccountKey = (keyString: string): boolean => {
    if (!keyString.trim()) {
      setIsValidKey(false);
      setKeyErrors(['Service account key is required']);
      return false;
    }

    try {
      const parsed = JSON.parse(keyString);
      const errors: string[] = [];

      // Check required fields
      if (!parsed.type || parsed.type !== 'service_account') {
        errors.push('Key must be of type "service_account"');
      }
      if (!parsed.project_id) {
        errors.push('Missing project_id field');
      }
      if (!parsed.private_key) {
        errors.push('Missing private_key field');
      }
      if (!parsed.client_email) {
        errors.push('Missing client_email field');
      }
      if (!parsed.private_key_id) {
        errors.push('Missing private_key_id field');
      }

      // Validate project ID format
      if (parsed.project_id && !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(parsed.project_id)) {
        errors.push('Invalid project_id format');
      }

      // Validate client email format
      if (parsed.client_email && !parsed.client_email.includes('@')) {
        errors.push('Invalid client_email format');
      }

      setKeyErrors(errors);
      setIsValidKey(errors.length === 0);

      // Auto-configure bucket and dataset if not set
      if (errors.length === 0) {
        if (!customBucket) {
          setCustomBucket(`${parsed.project_id}-shapefile-uploads`);
        }
        if (!customDataset) {
          setCustomDataset('geo_processing');
        }
      }

      return errors.length === 0;
    } catch (error) {
      setKeyErrors(['Invalid JSON format']);
      setIsValidKey(false);
      return false;
    }
  };

  const handleServiceAccountKeyChange = (value: string) => {
    setServiceAccountKey(value);
    validateServiceAccountKey(value);
  };

  const saveConfiguration = () => {
    const updates: any = {
      authMethod: config.authMethod,
      enableRealProcessing: config.enableRealProcessing,
      gcsDefaultBucket: customBucket.trim() || undefined,
      bigQueryDefaultDataset: customDataset.trim() || undefined
    };

    if (config.authMethod === 'service-account') {
      if (!isValidKey) {
        toast({
          title: "❌ Invalid Service Account Key",
          description: "Please provide a valid service account key before saving.",
          variant: "destructive"
        });
        return;
      }
      updates.serviceAccountKey = serviceAccountKey;

      try {
        const parsed = JSON.parse(serviceAccountKey);
        updates.gcpProjectId = parsed.project_id;
      } catch (error) {
        console.error('Failed to parse service account key:', error);
      }
    }

    configService.updateConfig(updates);

    toast({
      title: "✅ Configuration Saved",
      description: "Your production settings have been updated successfully.",
      duration: 3000
    });
  };

  const clearConfiguration = () => {
    configService.clearConfig();
    setServiceAccountKey('');
    setCustomBucket('');
    setCustomDataset('');
    setIsValidKey(false);
    setKeyErrors([]);
    setConfig(configService.getConfig());

    toast({
      title: "🗑️ Configuration Cleared",
      description: "All configuration has been reset to defaults.",
      duration: 3000
    });
  };

  const envInfo = configService.getEnvironmentInfo();
  const hasValidAuth = config.authMethod === 'service-account' ? isValidKey : !!(config.apiEndpoint && config.apiKey);

  return (
    <div className="space-y-6" data-id="435opc7pr" data-path="src/components/configuration/ProductionSetup.tsx">
      {/* Current Status */}
      <Card data-id="k81ytzrni" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="0anb2rkiy" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="l3p7hwbd8" data-path="src/components/configuration/ProductionSetup.tsx">
            <Shield className="h-5 w-5" data-id="t8o5e2987" data-path="src/components/configuration/ProductionSetup.tsx" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent data-id="hqick4bsk" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-id="z71fq6hll" data-path="src/components/configuration/ProductionSetup.tsx">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="u94qh9i5r" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="apzwp6jt6" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="1gwx25w0v" data-path="src/components/configuration/ProductionSetup.tsx">Authentication</p>
                <p className="text-xs text-gray-600" data-id="orqmvgpf0" data-path="src/components/configuration/ProductionSetup.tsx">{config.authMethod}</p>
              </div>
              {hasValidAuth ?
              <Badge className="bg-green-100 text-green-800" data-id="357uff12q" data-path="src/components/configuration/ProductionSetup.tsx">
                  <CheckCircle className="h-3 w-3 mr-1" data-id="0fhudo4bw" data-path="src/components/configuration/ProductionSetup.tsx" />
                  Configured
                </Badge> :
              <Badge variant="outline" data-id="cquudwtrv" data-path="src/components/configuration/ProductionSetup.tsx">Not Configured</Badge>
              }
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="tny4cwn26" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="xur0kra5d" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="1t6nx3k6c" data-path="src/components/configuration/ProductionSetup.tsx">Processing Mode</p>
                <p className="text-xs text-gray-600" data-id="31vs01uqh" data-path="src/components/configuration/ProductionSetup.tsx">{envInfo.realProcessingEnabled ? 'Production' : 'Demo'}</p>
              </div>
              {envInfo.realProcessingEnabled ?
              <Badge className="bg-green-100 text-green-800" data-id="v3ruyii09" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Zap className="h-3 w-3 mr-1" data-id="fq1sy8h33" data-path="src/components/configuration/ProductionSetup.tsx" />
                  Active
                </Badge> :
              <Badge variant="secondary" data-id="57fi2hk7l" data-path="src/components/configuration/ProductionSetup.tsx">Demo</Badge>
              }
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="0sw9i0os5" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="2wktpf0hh" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="mg7ohzvg5" data-path="src/components/configuration/ProductionSetup.tsx">Default Bucket</p>
                <p className="text-xs text-gray-600 truncate" title={envInfo.defaultBucket} data-id="iclgf3fed" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.defaultBucket || 'Not set'}
                </p>
              </div>
              {envInfo.defaultBucket ?
              <Badge className="bg-blue-100 text-blue-800" data-id="3oe1q3byb" data-path="src/components/configuration/ProductionSetup.tsx">Set</Badge> :
              <Badge variant="outline" data-id="yeuq5hktw" data-path="src/components/configuration/ProductionSetup.tsx">Not Set</Badge>
              }
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="ax0g0685v" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="62e95e493" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="llyrdgc74" data-path="src/components/configuration/ProductionSetup.tsx">Project ID</p>
                <p className="text-xs text-gray-600 truncate" title={envInfo.projectId} data-id="7ztotv77v" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.projectId || 'Not set'}
                </p>
              </div>
              {envInfo.projectId ?
              <Badge className="bg-blue-100 text-blue-800" data-id="bxy69e6mq" data-path="src/components/configuration/ProductionSetup.tsx">Set</Badge> :
              <Badge variant="outline" data-id="mou7cv0sx" data-path="src/components/configuration/ProductionSetup.tsx">Not Set</Badge>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="border-amber-200 bg-amber-50" data-id="yhg59e7dz" data-path="src/components/configuration/ProductionSetup.tsx">
        <AlertTriangle className="h-4 w-4 text-amber-600" data-id="kkg83c009" data-path="src/components/configuration/ProductionSetup.tsx" />
        <AlertDescription data-id="576ogtgfw" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-2" data-id="gmsx8ldaj" data-path="src/components/configuration/ProductionSetup.tsx">
            <p data-id="3vjr8mhdw" data-path="src/components/configuration/ProductionSetup.tsx"><strong data-id="8hm6lao49" data-path="src/components/configuration/ProductionSetup.tsx">Bucket Issue Detected:</strong> If you're seeing "gcve-demo-408018-shapefile-uploads" but expect a different bucket, configure the correct bucket name below.</p>
            <div className="text-sm space-y-1" data-id="r1eynela5" data-path="src/components/configuration/ProductionSetup.tsx">
              <p data-id="pbsn954du" data-path="src/components/configuration/ProductionSetup.tsx">• The system auto-generates bucket names from your project ID</p>
              <p data-id="827xom0mb" data-path="src/components/configuration/ProductionSetup.tsx">• You can override this with a custom bucket name</p>
              <p data-id="qtv6vhhlj" data-path="src/components/configuration/ProductionSetup.tsx">• Ensure the bucket exists in your GCP project</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* GCP Resource Configuration */}
      <Card data-id="4f7sumy6k" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="jxx71i8mo" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="w5vs02xv8" data-path="src/components/configuration/ProductionSetup.tsx">
            <Folder className="h-5 w-5" data-id="yn96h07c0" data-path="src/components/configuration/ProductionSetup.tsx" />
            GCP Resource Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="rm0q5l7gz" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="x2ewmqno7" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="rmr98xvdm" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label htmlFor="gcs-bucket" data-id="jr13nsrvl" data-path="src/components/configuration/ProductionSetup.tsx">Google Cloud Storage Bucket</Label>
              <Input
                id="gcs-bucket"
                value={customBucket}
                onChange={(e) => setCustomBucket(e.target.value)}
                placeholder="your-project-shapefile-uploads"
                className="font-mono text-sm" data-id="xclh9wqwm" data-path="src/components/configuration/ProductionSetup.tsx" />

              <p className="text-xs text-gray-600 mt-1" data-id="d8nfs811u" data-path="src/components/configuration/ProductionSetup.tsx">
                Override the default bucket name. Leave empty to auto-generate from project ID.
              </p>
            </div>

            <div data-id="vi8ztvu69" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label htmlFor="bq-dataset" data-id="qr2pjyovi" data-path="src/components/configuration/ProductionSetup.tsx">BigQuery Default Dataset</Label>
              <Input
                id="bq-dataset"
                value={customDataset}
                onChange={(e) => setCustomDataset(e.target.value)}
                placeholder="geo_processing"
                className="font-mono text-sm" data-id="h5nans4za" data-path="src/components/configuration/ProductionSetup.tsx" />

              <p className="text-xs text-gray-600 mt-1" data-id="3bvedw4ix" data-path="src/components/configuration/ProductionSetup.tsx">
                Default dataset for BigQuery tables. Will be created if it doesn't exist.
              </p>
            </div>
          </div>

          {customBucket &&
          <Alert className="border-blue-200 bg-blue-50" data-id="k6j05vgwk" data-path="src/components/configuration/ProductionSetup.tsx">
              <Info className="h-4 w-4 text-blue-600" data-id="0vtv903r3" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription data-id="6lhbgokaa" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="n7rx6r6zi" data-path="src/components/configuration/ProductionSetup.tsx">Custom Bucket:</strong> Files will be uploaded to <code className="bg-white px-1 rounded" data-id="q5mpuiw7k" data-path="src/components/configuration/ProductionSetup.tsx">gs://{customBucket}</code>
                <br data-id="b107z8ki2" data-path="src/components/configuration/ProductionSetup.tsx" />
                <span className="text-sm" data-id="xlt0106uk" data-path="src/components/configuration/ProductionSetup.tsx">Make sure this bucket exists in your GCP project or enable auto-creation.</span>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Authentication Configuration */}
      <Card data-id="ek56b7izf" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="0eg612l1t" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="9956e74il" data-path="src/components/configuration/ProductionSetup.tsx">
            <Key className="h-5 w-5" data-id="p62jm9a19" data-path="src/components/configuration/ProductionSetup.tsx" />
            Authentication Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="nl6cxjfeu" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-4" data-id="dufm2fvrq" data-path="src/components/configuration/ProductionSetup.tsx">
            <div className="flex items-center space-x-2" data-id="us966wkvn" data-path="src/components/configuration/ProductionSetup.tsx">
              <input
                type="radio"
                id="service-account"
                checked={config.authMethod === 'service-account'}
                onChange={() => setConfig({ ...config, authMethod: 'service-account' })}
                className="text-blue-600" data-id="wggu20kwp" data-path="src/components/configuration/ProductionSetup.tsx" />

              <Label htmlFor="service-account" className="flex items-center gap-2" data-id="b2g33zaqw" data-path="src/components/configuration/ProductionSetup.tsx">
                <Cloud className="h-4 w-4" data-id="ps01id06k" data-path="src/components/configuration/ProductionSetup.tsx" />
                Service Account (Recommended for demo)
              </Label>
            </div>

            <div className="flex items-center space-x-2" data-id="owzy83y35" data-path="src/components/configuration/ProductionSetup.tsx">
              <input
                type="radio"
                id="api-gateway"
                checked={config.authMethod === 'api-gateway'}
                onChange={() => setConfig({ ...config, authMethod: 'api-gateway' })}
                className="text-blue-600" data-id="nwpdngggh" data-path="src/components/configuration/ProductionSetup.tsx" />

              <Label htmlFor="api-gateway" className="flex items-center gap-2" data-id="e3r1akgl9" data-path="src/components/configuration/ProductionSetup.tsx">
                <Database className="h-4 w-4" data-id="s47slctcy" data-path="src/components/configuration/ProductionSetup.tsx" />
                API Gateway (Production)
              </Label>
            </div>
          </div>

          {config.authMethod === 'service-account' &&
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50" data-id="ny17v7u2v" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="2bd8k4q5b" data-path="src/components/configuration/ProductionSetup.tsx">
                <Label htmlFor="service-account-key" className="text-sm font-medium" data-id="vv56hcr30" data-path="src/components/configuration/ProductionSetup.tsx">
                  Service Account Key (JSON)
                </Label>
                <p className="text-xs text-gray-600 mb-2" data-id="w77r2phkq" data-path="src/components/configuration/ProductionSetup.tsx">
                  Paste your Google Cloud service account key JSON here
                </p>
                <Textarea
                id="service-account-key"
                value={serviceAccountKey}
                onChange={(e) => handleServiceAccountKeyChange(e.target.value)}
                placeholder={`{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  ...
}`}
                className="font-mono text-xs"
                rows={8} data-id="62sl93zfp" data-path="src/components/configuration/ProductionSetup.tsx" />

              </div>

              {keyErrors.length > 0 &&
            <Alert variant="destructive" data-id="cyg74rp82" data-path="src/components/configuration/ProductionSetup.tsx">
                  <AlertTriangle className="h-4 w-4" data-id="r8awb2yff" data-path="src/components/configuration/ProductionSetup.tsx" />
                  <AlertDescription data-id="5ymcglajn" data-path="src/components/configuration/ProductionSetup.tsx">
                    <strong data-id="f8i5vcaur" data-path="src/components/configuration/ProductionSetup.tsx">Service Account Key Issues:</strong>
                    <ul className="list-disc list-inside mt-1 text-sm" data-id="dhwooohte" data-path="src/components/configuration/ProductionSetup.tsx">
                      {keyErrors.map((error, index) =>
                  <li key={index} data-id="6qzmluqls" data-path="src/components/configuration/ProductionSetup.tsx">{error}</li>
                  )}
                    </ul>
                  </AlertDescription>
                </Alert>
            }

              {isValidKey &&
            <Alert className="border-green-200 bg-green-50" data-id="929ryhxqj" data-path="src/components/configuration/ProductionSetup.tsx">
                  <CheckCircle className="h-4 w-4 text-green-600" data-id="t3kcky8bd" data-path="src/components/configuration/ProductionSetup.tsx" />
                  <AlertDescription className="text-green-800" data-id="x22g19wh8" data-path="src/components/configuration/ProductionSetup.tsx">
                    <strong data-id="vk4j9fhy0" data-path="src/components/configuration/ProductionSetup.tsx">Valid Service Account Key</strong>
                    <div className="text-sm mt-1" data-id="u519lkzk9" data-path="src/components/configuration/ProductionSetup.tsx">
                      {(() => {
                    try {
                      const parsed = JSON.parse(serviceAccountKey);
                      return `Project: ${parsed.project_id} | Email: ${parsed.client_email}`;
                    } catch {
                      return 'Key validation passed';
                    }
                  })()}
                    </div>
                  </AlertDescription>
                </Alert>
            }

              <Alert data-id="9ya677af2" data-path="src/components/configuration/ProductionSetup.tsx">
                <AlertCircle className="h-4 w-4" data-id="zgzywsfcp" data-path="src/components/configuration/ProductionSetup.tsx" />
                <AlertDescription data-id="vkr2w67db" data-path="src/components/configuration/ProductionSetup.tsx">
                  <strong data-id="5w8jh3gg9" data-path="src/components/configuration/ProductionSetup.tsx">Security Note:</strong> In production applications, service account keys should never be embedded in frontend code. Use a secure backend API instead.
                </AlertDescription>
              </Alert>
            </div>
          }

          {config.authMethod === 'api-gateway' &&
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50" data-id="m9loe501x" data-path="src/components/configuration/ProductionSetup.tsx">
              <Alert data-id="sgy83irua" data-path="src/components/configuration/ProductionSetup.tsx">
                <Info className="h-4 w-4" data-id="ingigb8k8" data-path="src/components/configuration/ProductionSetup.tsx" />
                <AlertDescription data-id="d0tswvmuo" data-path="src/components/configuration/ProductionSetup.tsx">
                  API Gateway mode requires a backend service to handle BigQuery operations. 
                  This mode is intended for production deployments with proper authentication infrastructure.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3" data-id="e1g9docg8" data-path="src/components/configuration/ProductionSetup.tsx">
                <div data-id="k89enp0t6" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Label htmlFor="api-endpoint" data-id="fjko1pcgw" data-path="src/components/configuration/ProductionSetup.tsx">API Endpoint</Label>
                  <Input
                  id="api-endpoint"
                  value={config.apiEndpoint}
                  onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
                  placeholder="https://your-api-gateway.com/api" data-id="v4ly9v5ct" data-path="src/components/configuration/ProductionSetup.tsx" />

                </div>
                <div data-id="f74bprrgr" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Label htmlFor="api-key" data-id="qnei72nu4" data-path="src/components/configuration/ProductionSetup.tsx">API Key</Label>
                  <Input
                  id="api-key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Your API authentication key" data-id="ie67kxma7" data-path="src/components/configuration/ProductionSetup.tsx" />

                </div>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      <Card data-id="8m1blag4p" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="akblx3k7f" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="d3jzx435k" data-path="src/components/configuration/ProductionSetup.tsx">
            <Settings className="h-5 w-5" data-id="4ks7b7brx" data-path="src/components/configuration/ProductionSetup.tsx" />
            Processing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="rvquy8hp0" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="flex items-center justify-between p-4 border rounded-lg" data-id="s8cx9yq4p" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="zvvkd0xlp" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label className="text-base font-medium" data-id="y1jys6bds" data-path="src/components/configuration/ProductionSetup.tsx">Enable Real Processing</Label>
              <p className="text-sm text-gray-600" data-id="zf3nn80hx" data-path="src/components/configuration/ProductionSetup.tsx">
                When enabled, the system will attempt real BigQuery and GCS operations.
                Note: This is a demo application with simulated operations for security.
              </p>
            </div>
            <Switch
              checked={config.enableRealProcessing}
              onCheckedChange={(checked) => setConfig({ ...config, enableRealProcessing: checked })} data-id="tuq94vefo" data-path="src/components/configuration/ProductionSetup.tsx" />

          </div>

          {config.enableRealProcessing &&
          <Alert className="border-yellow-200 bg-yellow-50" data-id="2vguw0jxg" data-path="src/components/configuration/ProductionSetup.tsx">
              <AlertTriangle className="h-4 w-4 text-yellow-600" data-id="2s4kq2mfh" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription className="text-yellow-800" data-id="9pllh00fr" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="euek7bwp1" data-path="src/components/configuration/ProductionSetup.tsx">Demo Mode Active:</strong> Even with real processing enabled, this frontend application 
                simulates BigQuery operations for security. Actual data processing requires a secure backend service.
              </AlertDescription>
            </Alert>
          }

          {envInfo.configErrors.length > 0 &&
          <Alert variant="destructive" data-id="f2mef7ciq" data-path="src/components/configuration/ProductionSetup.tsx">
              <AlertTriangle className="h-4 w-4" data-id="yxalf2ufz" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription data-id="opxpw5hmk" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="9yifgkvcv" data-path="src/components/configuration/ProductionSetup.tsx">Configuration Issues:</strong>
                <ul className="list-disc list-inside mt-1" data-id="77thcsfd9" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.configErrors.map((error, index) =>
                <li key={index} data-id="tsb5k062k" data-path="src/components/configuration/ProductionSetup.tsx">{error}</li>
                )}
                </ul>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4" data-id="zw9v6fbuc" data-path="src/components/configuration/ProductionSetup.tsx">
        <Button
          onClick={saveConfiguration}
          disabled={config.authMethod === 'service-account' && !isValidKey}
          className="flex-1" data-id="8ttzssynt" data-path="src/components/configuration/ProductionSetup.tsx">

          <Settings className="h-4 w-4 mr-2" data-id="t7kaif0uv" data-path="src/components/configuration/ProductionSetup.tsx" />
          Save Configuration
        </Button>
        <Button variant="outline" onClick={clearConfiguration} data-id="5nm3sqfoe" data-path="src/components/configuration/ProductionSetup.tsx">
          Clear All
        </Button>
      </div>

      {/* Quick Setup Guide */}
      <Card data-id="00u7t30pt" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="r6y7530fp" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="text-lg" data-id="gbddbhoci" data-path="src/components/configuration/ProductionSetup.tsx">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent data-id="l34zohbsp" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-4 text-sm" data-id="z2loef83l" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="4g90byqbu" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="zbwazpjmt" data-path="src/components/configuration/ProductionSetup.tsx">To Fix Bucket Issues:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="4znccpyuq" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="u2wzjg3gh" data-path="src/components/configuration/ProductionSetup.tsx">Check what bucket name you expect to use</li>
                <li data-id="96nvolvy3" data-path="src/components/configuration/ProductionSetup.tsx">Enter the correct bucket name in the "GCS Bucket" field above</li>
                <li data-id="5rs12b1o9" data-path="src/components/configuration/ProductionSetup.tsx">Ensure the bucket exists in your GCP project</li>
                <li data-id="73oxmgvlk" data-path="src/components/configuration/ProductionSetup.tsx">Save configuration and test again</li>
              </ol>
            </div>

            <div data-id="xbrrqeanr" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="6zlkr9eun" data-path="src/components/configuration/ProductionSetup.tsx">For Demo/Testing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="70hk0uw7w" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="bq2wrw2fa" data-path="src/components/configuration/ProductionSetup.tsx">Select "Service Account" authentication method</li>
                <li data-id="89k00in76" data-path="src/components/configuration/ProductionSetup.tsx">Create a service account in your Google Cloud Console</li>
                <li data-id="on3qnrk4h" data-path="src/components/configuration/ProductionSetup.tsx">Download the JSON key file and paste its contents above</li>
                <li data-id="31w1xhf3u" data-path="src/components/configuration/ProductionSetup.tsx">Configure the correct bucket name for your project</li>
                <li data-id="zg3u6co3m" data-path="src/components/configuration/ProductionSetup.tsx">Enable "Real Processing" to simulate production behavior</li>
                <li data-id="7wiwgmuqa" data-path="src/components/configuration/ProductionSetup.tsx">Test connections in the Diagnostics tab</li>
              </ol>
            </div>
            
            <div data-id="v9zw4ejx3" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="5y44xqqf8" data-path="src/components/configuration/ProductionSetup.tsx">For Production:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="m0h09ej4b" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="rrtrrkm8h" data-path="src/components/configuration/ProductionSetup.tsx">Implement a secure backend API gateway</li>
                <li data-id="1j7zdtu4o" data-path="src/components/configuration/ProductionSetup.tsx">Configure server-side BigQuery and GCS access</li>
                <li data-id="gd2cstax7" data-path="src/components/configuration/ProductionSetup.tsx">Select "API Gateway" authentication method</li>
                <li data-id="4haonc3tz" data-path="src/components/configuration/ProductionSetup.tsx">Provide your backend API endpoint and authentication</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ProductionSetup;