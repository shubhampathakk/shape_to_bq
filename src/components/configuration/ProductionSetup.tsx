
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
    <div className="space-y-6" data-id="xhl8icmcm" data-path="src/components/configuration/ProductionSetup.tsx">
      {/* Current Status */}
      <Card data-id="exqn8k9lg" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="zkexb9hho" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="gmlerb6kn" data-path="src/components/configuration/ProductionSetup.tsx">
            <Shield className="h-5 w-5" data-id="ozpq6nlt7" data-path="src/components/configuration/ProductionSetup.tsx" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent data-id="2ztgrkrto" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-id="dl7x9dd31" data-path="src/components/configuration/ProductionSetup.tsx">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="xiqd1ba2c" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="bwjrzrf55" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="i3rh59ntt" data-path="src/components/configuration/ProductionSetup.tsx">Authentication</p>
                <p className="text-xs text-gray-600" data-id="i4gcz6ynt" data-path="src/components/configuration/ProductionSetup.tsx">{config.authMethod}</p>
              </div>
              {hasValidAuth ?
              <Badge className="bg-green-100 text-green-800" data-id="c5jug5754" data-path="src/components/configuration/ProductionSetup.tsx">
                  <CheckCircle className="h-3 w-3 mr-1" data-id="ujiymdr57" data-path="src/components/configuration/ProductionSetup.tsx" />
                  Configured
                </Badge> :
              <Badge variant="outline" data-id="vt2o2mfz2" data-path="src/components/configuration/ProductionSetup.tsx">Not Configured</Badge>
              }
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="dy9rupza1" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="7gmut87ow" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="0bsk3riib" data-path="src/components/configuration/ProductionSetup.tsx">Processing Mode</p>
                <p className="text-xs text-gray-600" data-id="hgzd2638b" data-path="src/components/configuration/ProductionSetup.tsx">{envInfo.realProcessingEnabled ? 'Production' : 'Demo'}</p>
              </div>
              {envInfo.realProcessingEnabled ?
              <Badge className="bg-green-100 text-green-800" data-id="6w05djfjc" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Zap className="h-3 w-3 mr-1" data-id="rk322jhmw" data-path="src/components/configuration/ProductionSetup.tsx" />
                  Active
                </Badge> :
              <Badge variant="secondary" data-id="8cvsrl1g2" data-path="src/components/configuration/ProductionSetup.tsx">Demo</Badge>
              }
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="wzqtkoupm" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="ac5jpgo0x" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="cvgcmzbjk" data-path="src/components/configuration/ProductionSetup.tsx">Default Bucket</p>
                <p className="text-xs text-gray-600 truncate" title={envInfo.defaultBucket} data-id="ftgzafmgo" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.defaultBucket || 'Not set'}
                </p>
              </div>
              {envInfo.defaultBucket ?
              <Badge className="bg-blue-100 text-blue-800" data-id="y373ecv95" data-path="src/components/configuration/ProductionSetup.tsx">Set</Badge> :
              <Badge variant="outline" data-id="st928pmrr" data-path="src/components/configuration/ProductionSetup.tsx">Not Set</Badge>
              }
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="k5t1vdn04" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="9pdcw2kdo" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="65fx9jgob" data-path="src/components/configuration/ProductionSetup.tsx">Project ID</p>
                <p className="text-xs text-gray-600 truncate" title={envInfo.projectId} data-id="f1n4xrfxe" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.projectId || 'Not set'}
                </p>
              </div>
              {envInfo.projectId ?
              <Badge className="bg-blue-100 text-blue-800" data-id="idf2rmxgc" data-path="src/components/configuration/ProductionSetup.tsx">Set</Badge> :
              <Badge variant="outline" data-id="o6ku7apl9" data-path="src/components/configuration/ProductionSetup.tsx">Not Set</Badge>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="border-amber-200 bg-amber-50" data-id="s8mv7y1p5" data-path="src/components/configuration/ProductionSetup.tsx">
        <AlertTriangle className="h-4 w-4 text-amber-600" data-id="n995e5ffg" data-path="src/components/configuration/ProductionSetup.tsx" />
        <AlertDescription data-id="pfq0ph8uo" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-2" data-id="yaf4karpg" data-path="src/components/configuration/ProductionSetup.tsx">
            <p data-id="4npam5mlt" data-path="src/components/configuration/ProductionSetup.tsx"><strong data-id="hgajbvl9t" data-path="src/components/configuration/ProductionSetup.tsx">Bucket Issue Detected:</strong> If you're seeing "gcve-demo-408018-shapefile-uploads" but expect a different bucket, configure the correct bucket name below.</p>
            <div className="text-sm space-y-1" data-id="p4wtq09o9" data-path="src/components/configuration/ProductionSetup.tsx">
              <p data-id="kfdslslo2" data-path="src/components/configuration/ProductionSetup.tsx">• The system auto-generates bucket names from your project ID</p>
              <p data-id="h6njz37vj" data-path="src/components/configuration/ProductionSetup.tsx">• You can override this with a custom bucket name</p>
              <p data-id="dmbs18fx4" data-path="src/components/configuration/ProductionSetup.tsx">• Ensure the bucket exists in your GCP project</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* GCP Resource Configuration */}
      <Card data-id="a1ux0g2li" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="rfqm6o745" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="wak6mh4da" data-path="src/components/configuration/ProductionSetup.tsx">
            <Folder className="h-5 w-5" data-id="mgwljmdya" data-path="src/components/configuration/ProductionSetup.tsx" />
            GCP Resource Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="32p13dfz1" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="6c49dldya" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="2l4tkik8o" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label htmlFor="gcs-bucket" data-id="hoq8z6epz" data-path="src/components/configuration/ProductionSetup.tsx">Google Cloud Storage Bucket</Label>
              <Input
                id="gcs-bucket"
                value={customBucket}
                onChange={(e) => setCustomBucket(e.target.value)}
                placeholder="your-project-shapefile-uploads"
                className="font-mono text-sm" data-id="49ysqv6rj" data-path="src/components/configuration/ProductionSetup.tsx" />

              <p className="text-xs text-gray-600 mt-1" data-id="sj247ofiy" data-path="src/components/configuration/ProductionSetup.tsx">
                Override the default bucket name. Leave empty to auto-generate from project ID.
              </p>
            </div>

            <div data-id="06pwe084b" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label htmlFor="bq-dataset" data-id="kpkdhftty" data-path="src/components/configuration/ProductionSetup.tsx">BigQuery Default Dataset</Label>
              <Input
                id="bq-dataset"
                value={customDataset}
                onChange={(e) => setCustomDataset(e.target.value)}
                placeholder="geo_processing"
                className="font-mono text-sm" data-id="k6d3dat0b" data-path="src/components/configuration/ProductionSetup.tsx" />

              <p className="text-xs text-gray-600 mt-1" data-id="ehcm62knh" data-path="src/components/configuration/ProductionSetup.tsx">
                Default dataset for BigQuery tables. Will be created if it doesn't exist.
              </p>
            </div>
          </div>

          {customBucket &&
          <Alert className="border-blue-200 bg-blue-50" data-id="iga2ohdwd" data-path="src/components/configuration/ProductionSetup.tsx">
              <Info className="h-4 w-4 text-blue-600" data-id="tp8tl73a0" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription data-id="7ydpoxxg9" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="sa6rjhk0f" data-path="src/components/configuration/ProductionSetup.tsx">Custom Bucket:</strong> Files will be uploaded to <code className="bg-white px-1 rounded" data-id="1h2ajj5yh" data-path="src/components/configuration/ProductionSetup.tsx">gs://{customBucket}</code>
                <br data-id="x4n57zexg" data-path="src/components/configuration/ProductionSetup.tsx" />
                <span className="text-sm" data-id="rnpw3lspw" data-path="src/components/configuration/ProductionSetup.tsx">Make sure this bucket exists in your GCP project or enable auto-creation.</span>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Authentication Configuration */}
      <Card data-id="kfe5aki4r" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="q1e2lg8ko" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="c5iff6y01" data-path="src/components/configuration/ProductionSetup.tsx">
            <Key className="h-5 w-5" data-id="676ks9gys" data-path="src/components/configuration/ProductionSetup.tsx" />
            Authentication Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="a20t86a1g" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-4" data-id="k35dfdbaq" data-path="src/components/configuration/ProductionSetup.tsx">
            <div className="flex items-center space-x-2" data-id="g8z00ldgo" data-path="src/components/configuration/ProductionSetup.tsx">
              <input
                type="radio"
                id="service-account"
                checked={config.authMethod === 'service-account'}
                onChange={() => setConfig({ ...config, authMethod: 'service-account' })}
                className="text-blue-600" data-id="28q6l9w9q" data-path="src/components/configuration/ProductionSetup.tsx" />

              <Label htmlFor="service-account" className="flex items-center gap-2" data-id="5tlugdcic" data-path="src/components/configuration/ProductionSetup.tsx">
                <Cloud className="h-4 w-4" data-id="6hkw1cwca" data-path="src/components/configuration/ProductionSetup.tsx" />
                Service Account (Recommended for demo)
              </Label>
            </div>

            <div className="flex items-center space-x-2" data-id="gggwbgvxr" data-path="src/components/configuration/ProductionSetup.tsx">
              <input
                type="radio"
                id="api-gateway"
                checked={config.authMethod === 'api-gateway'}
                onChange={() => setConfig({ ...config, authMethod: 'api-gateway' })}
                className="text-blue-600" data-id="ooxlyy0d1" data-path="src/components/configuration/ProductionSetup.tsx" />

              <Label htmlFor="api-gateway" className="flex items-center gap-2" data-id="i6jr1l5o8" data-path="src/components/configuration/ProductionSetup.tsx">
                <Database className="h-4 w-4" data-id="g8szarj82" data-path="src/components/configuration/ProductionSetup.tsx" />
                API Gateway (Production)
              </Label>
            </div>
          </div>

          {config.authMethod === 'service-account' &&
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50" data-id="gs9uzlceb" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="dhk8fip8m" data-path="src/components/configuration/ProductionSetup.tsx">
                <Label htmlFor="service-account-key" className="text-sm font-medium" data-id="yy7l4i2l9" data-path="src/components/configuration/ProductionSetup.tsx">
                  Service Account Key (JSON)
                </Label>
                <p className="text-xs text-gray-600 mb-2" data-id="atqyhoclu" data-path="src/components/configuration/ProductionSetup.tsx">
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
                rows={8} data-id="qtyxztpkb" data-path="src/components/configuration/ProductionSetup.tsx" />

              </div>

              {keyErrors.length > 0 &&
            <Alert variant="destructive" data-id="b34vrwzoa" data-path="src/components/configuration/ProductionSetup.tsx">
                  <AlertTriangle className="h-4 w-4" data-id="zmbgm0mdj" data-path="src/components/configuration/ProductionSetup.tsx" />
                  <AlertDescription data-id="v9q9zwc80" data-path="src/components/configuration/ProductionSetup.tsx">
                    <strong data-id="1cs24vs0l" data-path="src/components/configuration/ProductionSetup.tsx">Service Account Key Issues:</strong>
                    <ul className="list-disc list-inside mt-1 text-sm" data-id="hcp2gyq99" data-path="src/components/configuration/ProductionSetup.tsx">
                      {keyErrors.map((error, index) =>
                  <li key={index} data-id="qpzix8rb3" data-path="src/components/configuration/ProductionSetup.tsx">{error}</li>
                  )}
                    </ul>
                  </AlertDescription>
                </Alert>
            }

              {isValidKey &&
            <Alert className="border-green-200 bg-green-50" data-id="keb00rjws" data-path="src/components/configuration/ProductionSetup.tsx">
                  <CheckCircle className="h-4 w-4 text-green-600" data-id="hthjjl454" data-path="src/components/configuration/ProductionSetup.tsx" />
                  <AlertDescription className="text-green-800" data-id="x4p4eiz9e" data-path="src/components/configuration/ProductionSetup.tsx">
                    <strong data-id="3j74fruof" data-path="src/components/configuration/ProductionSetup.tsx">Valid Service Account Key</strong>
                    <div className="text-sm mt-1" data-id="xfvacr2pg" data-path="src/components/configuration/ProductionSetup.tsx">
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

              <Alert data-id="our9584wj" data-path="src/components/configuration/ProductionSetup.tsx">
                <AlertCircle className="h-4 w-4" data-id="1skl1t4nu" data-path="src/components/configuration/ProductionSetup.tsx" />
                <AlertDescription data-id="zgzh982cd" data-path="src/components/configuration/ProductionSetup.tsx">
                  <strong data-id="1nt6mfnej" data-path="src/components/configuration/ProductionSetup.tsx">Security Note:</strong> In production applications, service account keys should never be embedded in frontend code. Use a secure backend API instead.
                </AlertDescription>
              </Alert>
            </div>
          }

          {config.authMethod === 'api-gateway' &&
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50" data-id="nzccugtbl" data-path="src/components/configuration/ProductionSetup.tsx">
              <Alert data-id="jfcswgy4l" data-path="src/components/configuration/ProductionSetup.tsx">
                <Info className="h-4 w-4" data-id="l25ecmzq5" data-path="src/components/configuration/ProductionSetup.tsx" />
                <AlertDescription data-id="t285gnaf3" data-path="src/components/configuration/ProductionSetup.tsx">
                  API Gateway mode requires a backend service to handle BigQuery operations. 
                  This mode is intended for production deployments with proper authentication infrastructure.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3" data-id="y9tjfxfrg" data-path="src/components/configuration/ProductionSetup.tsx">
                <div data-id="ubc9ts3yr" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Label htmlFor="api-endpoint" data-id="tko592ics" data-path="src/components/configuration/ProductionSetup.tsx">API Endpoint</Label>
                  <Input
                  id="api-endpoint"
                  value={config.apiEndpoint}
                  onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
                  placeholder="https://your-api-gateway.com/api" data-id="w0zvci6pi" data-path="src/components/configuration/ProductionSetup.tsx" />

                </div>
                <div data-id="8dnockxbq" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Label htmlFor="api-key" data-id="9l9utgzxe" data-path="src/components/configuration/ProductionSetup.tsx">API Key</Label>
                  <Input
                  id="api-key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Your API authentication key" data-id="qtund326q" data-path="src/components/configuration/ProductionSetup.tsx" />

                </div>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      <Card data-id="zhuxhkntr" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="tox1kxe5e" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="5ug8tt07h" data-path="src/components/configuration/ProductionSetup.tsx">
            <Settings className="h-5 w-5" data-id="t2gh2sdry" data-path="src/components/configuration/ProductionSetup.tsx" />
            Processing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="9ufleslbb" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="flex items-center justify-between p-4 border rounded-lg" data-id="e64due4vn" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="6zsmo6apd" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label className="text-base font-medium" data-id="tnvs26d0k" data-path="src/components/configuration/ProductionSetup.tsx">Enable Real Processing</Label>
              <p className="text-sm text-gray-600" data-id="e66onptd0" data-path="src/components/configuration/ProductionSetup.tsx">
                When enabled, the system will attempt real BigQuery and GCS operations.
                Note: This is a demo application with simulated operations for security.
              </p>
            </div>
            <Switch
              checked={config.enableRealProcessing}
              onCheckedChange={(checked) => setConfig({ ...config, enableRealProcessing: checked })} data-id="s1pm7nidp" data-path="src/components/configuration/ProductionSetup.tsx" />

          </div>

          {config.enableRealProcessing &&
          <Alert className="border-yellow-200 bg-yellow-50" data-id="pnaalz1bm" data-path="src/components/configuration/ProductionSetup.tsx">
              <AlertTriangle className="h-4 w-4 text-yellow-600" data-id="742mrfotr" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription className="text-yellow-800" data-id="m4oey3knc" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="9w4wr99eb" data-path="src/components/configuration/ProductionSetup.tsx">Demo Mode Active:</strong> Even with real processing enabled, this frontend application 
                simulates BigQuery operations for security. Actual data processing requires a secure backend service.
              </AlertDescription>
            </Alert>
          }

          {envInfo.configErrors.length > 0 &&
          <Alert variant="destructive" data-id="ld4tiwbmu" data-path="src/components/configuration/ProductionSetup.tsx">
              <AlertTriangle className="h-4 w-4" data-id="9n0jrb72v" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription data-id="qcxwolu3a" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="n03p29rvv" data-path="src/components/configuration/ProductionSetup.tsx">Configuration Issues:</strong>
                <ul className="list-disc list-inside mt-1" data-id="ptc3rvewv" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.configErrors.map((error, index) =>
                <li key={index} data-id="gi0pdd8tr" data-path="src/components/configuration/ProductionSetup.tsx">{error}</li>
                )}
                </ul>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4" data-id="d5vlekqk1" data-path="src/components/configuration/ProductionSetup.tsx">
        <Button
          onClick={saveConfiguration}
          disabled={config.authMethod === 'service-account' && !isValidKey}
          className="flex-1" data-id="jrx2k5ydc" data-path="src/components/configuration/ProductionSetup.tsx">

          <Settings className="h-4 w-4 mr-2" data-id="k2qoq5hsg" data-path="src/components/configuration/ProductionSetup.tsx" />
          Save Configuration
        </Button>
        <Button variant="outline" onClick={clearConfiguration} data-id="o0mqse0k4" data-path="src/components/configuration/ProductionSetup.tsx">
          Clear All
        </Button>
      </div>

      {/* Quick Setup Guide */}
      <Card data-id="vsst53v5k" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="m2qjgejqt" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="text-lg" data-id="vtssrqrwq" data-path="src/components/configuration/ProductionSetup.tsx">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent data-id="qcljjpw6s" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-4 text-sm" data-id="lv4zc1a19" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="qzz7w5m0m" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="pbusebe39" data-path="src/components/configuration/ProductionSetup.tsx">To Fix Bucket Issues:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="c6mj0vxgr" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="jy6cgrjnx" data-path="src/components/configuration/ProductionSetup.tsx">Check what bucket name you expect to use</li>
                <li data-id="d576sl5tx" data-path="src/components/configuration/ProductionSetup.tsx">Enter the correct bucket name in the "GCS Bucket" field above</li>
                <li data-id="w1lnoxf90" data-path="src/components/configuration/ProductionSetup.tsx">Ensure the bucket exists in your GCP project</li>
                <li data-id="eh2p1eft1" data-path="src/components/configuration/ProductionSetup.tsx">Save configuration and test again</li>
              </ol>
            </div>

            <div data-id="9huvuwtv2" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="apt5fj2lv" data-path="src/components/configuration/ProductionSetup.tsx">For Demo/Testing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="tkvbq2ptj" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="ij84xckxm" data-path="src/components/configuration/ProductionSetup.tsx">Select "Service Account" authentication method</li>
                <li data-id="l52r8rblg" data-path="src/components/configuration/ProductionSetup.tsx">Create a service account in your Google Cloud Console</li>
                <li data-id="tacaijyme" data-path="src/components/configuration/ProductionSetup.tsx">Download the JSON key file and paste its contents above</li>
                <li data-id="r9z5w0ta7" data-path="src/components/configuration/ProductionSetup.tsx">Configure the correct bucket name for your project</li>
                <li data-id="ga24jaryy" data-path="src/components/configuration/ProductionSetup.tsx">Enable "Real Processing" to simulate production behavior</li>
                <li data-id="qpklrpuxl" data-path="src/components/configuration/ProductionSetup.tsx">Test connections in the Diagnostics tab</li>
              </ol>
            </div>
            
            <div data-id="l9eha2hw8" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="m5vrfhu05" data-path="src/components/configuration/ProductionSetup.tsx">For Production:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="rc2y7tr7s" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="5yne928iq" data-path="src/components/configuration/ProductionSetup.tsx">Implement a secure backend API gateway</li>
                <li data-id="55vf978zm" data-path="src/components/configuration/ProductionSetup.tsx">Configure server-side BigQuery and GCS access</li>
                <li data-id="v162rfaj1" data-path="src/components/configuration/ProductionSetup.tsx">Select "API Gateway" authentication method</li>
                <li data-id="n242o6mml" data-path="src/components/configuration/ProductionSetup.tsx">Provide your backend API endpoint and authentication</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ProductionSetup;