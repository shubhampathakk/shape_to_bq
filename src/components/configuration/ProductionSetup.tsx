
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
    <div className="space-y-6" data-id="4ee3dkujd" data-path="src/components/configuration/ProductionSetup.tsx">
      {/* Current Status */}
      <Card data-id="tvosfovl7" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="q9500wh80" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="5jt8btmyp" data-path="src/components/configuration/ProductionSetup.tsx">
            <Shield className="h-5 w-5" data-id="61zakjw49" data-path="src/components/configuration/ProductionSetup.tsx" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent data-id="skpnnjw4b" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-id="s6ur9tq5m" data-path="src/components/configuration/ProductionSetup.tsx">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="e0138bcje" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="mlcuikbxq" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="141ga5aeo" data-path="src/components/configuration/ProductionSetup.tsx">Authentication</p>
                <p className="text-xs text-gray-600" data-id="ohqgnx9oy" data-path="src/components/configuration/ProductionSetup.tsx">{config.authMethod}</p>
              </div>
              {hasValidAuth ?
              <Badge className="bg-green-100 text-green-800" data-id="mtccznecx" data-path="src/components/configuration/ProductionSetup.tsx">
                  <CheckCircle className="h-3 w-3 mr-1" data-id="oyn64ct2r" data-path="src/components/configuration/ProductionSetup.tsx" />
                  Configured
                </Badge> :
              <Badge variant="outline" data-id="vpx2yq2uj" data-path="src/components/configuration/ProductionSetup.tsx">Not Configured</Badge>
              }
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="rssj04t75" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="jaquv59un" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="b0r5yk8ty" data-path="src/components/configuration/ProductionSetup.tsx">Processing Mode</p>
                <p className="text-xs text-gray-600" data-id="ujqy0zw4z" data-path="src/components/configuration/ProductionSetup.tsx">{envInfo.realProcessingEnabled ? 'Production' : 'Demo'}</p>
              </div>
              {envInfo.realProcessingEnabled ?
              <Badge className="bg-green-100 text-green-800" data-id="49tjr1nkx" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Zap className="h-3 w-3 mr-1" data-id="r4clyqdhw" data-path="src/components/configuration/ProductionSetup.tsx" />
                  Active
                </Badge> :
              <Badge variant="secondary" data-id="493bj2fza" data-path="src/components/configuration/ProductionSetup.tsx">Demo</Badge>
              }
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="xw5dyqenk" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="7tnansesf" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="ytr0vq3vo" data-path="src/components/configuration/ProductionSetup.tsx">Default Bucket</p>
                <p className="text-xs text-gray-600 truncate" title={envInfo.defaultBucket} data-id="me7ucgdgl" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.defaultBucket || 'Not set'}
                </p>
              </div>
              {envInfo.defaultBucket ?
              <Badge className="bg-blue-100 text-blue-800" data-id="3xuh15wxb" data-path="src/components/configuration/ProductionSetup.tsx">Set</Badge> :
              <Badge variant="outline" data-id="n8y00jqpw" data-path="src/components/configuration/ProductionSetup.tsx">Not Set</Badge>
              }
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="u19ksvqa2" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="hd5eepng3" data-path="src/components/configuration/ProductionSetup.tsx">
                <p className="text-sm font-medium" data-id="l0waf9pk6" data-path="src/components/configuration/ProductionSetup.tsx">Project ID</p>
                <p className="text-xs text-gray-600 truncate" title={envInfo.projectId} data-id="jl46rnd43" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.projectId || 'Not set'}
                </p>
              </div>
              {envInfo.projectId ?
              <Badge className="bg-blue-100 text-blue-800" data-id="qk4apont0" data-path="src/components/configuration/ProductionSetup.tsx">Set</Badge> :
              <Badge variant="outline" data-id="u3c64f9gv" data-path="src/components/configuration/ProductionSetup.tsx">Not Set</Badge>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="border-amber-200 bg-amber-50" data-id="fzw4tg5hu" data-path="src/components/configuration/ProductionSetup.tsx">
        <AlertTriangle className="h-4 w-4 text-amber-600" data-id="orqxibwu2" data-path="src/components/configuration/ProductionSetup.tsx" />
        <AlertDescription data-id="zdg3voe5h" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-2" data-id="j2am4wkp9" data-path="src/components/configuration/ProductionSetup.tsx">
            <p data-id="4dputh2xq" data-path="src/components/configuration/ProductionSetup.tsx"><strong data-id="fc1hiy90p" data-path="src/components/configuration/ProductionSetup.tsx">Bucket Issue Detected:</strong> If you're seeing "gcve-demo-408018-shapefile-uploads" but expect a different bucket, configure the correct bucket name below.</p>
            <div className="text-sm space-y-1" data-id="jz698ex71" data-path="src/components/configuration/ProductionSetup.tsx">
              <p data-id="9r32pz37e" data-path="src/components/configuration/ProductionSetup.tsx">• The system auto-generates bucket names from your project ID</p>
              <p data-id="g6g64jz2n" data-path="src/components/configuration/ProductionSetup.tsx">• You can override this with a custom bucket name</p>
              <p data-id="31opk5jcf" data-path="src/components/configuration/ProductionSetup.tsx">• Ensure the bucket exists in your GCP project</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* GCP Resource Configuration */}
      <Card data-id="7p7d26g84" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="rcfpjymie" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="d27sgke4j" data-path="src/components/configuration/ProductionSetup.tsx">
            <Folder className="h-5 w-5" data-id="apsyi7io8" data-path="src/components/configuration/ProductionSetup.tsx" />
            GCP Resource Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="r72w42wjp" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="0kz867b5f" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="u56wo585y" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label htmlFor="gcs-bucket" data-id="t1oqxm0a2" data-path="src/components/configuration/ProductionSetup.tsx">Google Cloud Storage Bucket</Label>
              <Input
                id="gcs-bucket"
                value={customBucket}
                onChange={(e) => setCustomBucket(e.target.value)}
                placeholder="your-project-shapefile-uploads"
                className="font-mono text-sm" data-id="g7misawqh" data-path="src/components/configuration/ProductionSetup.tsx" />

              <p className="text-xs text-gray-600 mt-1" data-id="dhqrlnymx" data-path="src/components/configuration/ProductionSetup.tsx">
                Override the default bucket name. Leave empty to auto-generate from project ID.
              </p>
            </div>

            <div data-id="fx5vok4z2" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label htmlFor="bq-dataset" data-id="p1m016yht" data-path="src/components/configuration/ProductionSetup.tsx">BigQuery Default Dataset</Label>
              <Input
                id="bq-dataset"
                value={customDataset}
                onChange={(e) => setCustomDataset(e.target.value)}
                placeholder="geo_processing"
                className="font-mono text-sm" data-id="t910nmlnw" data-path="src/components/configuration/ProductionSetup.tsx" />

              <p className="text-xs text-gray-600 mt-1" data-id="vjotrrz9s" data-path="src/components/configuration/ProductionSetup.tsx">
                Default dataset for BigQuery tables. Will be created if it doesn't exist.
              </p>
            </div>
          </div>

          {customBucket &&
          <Alert className="border-blue-200 bg-blue-50" data-id="8gjyl30q2" data-path="src/components/configuration/ProductionSetup.tsx">
              <Info className="h-4 w-4 text-blue-600" data-id="3gosexe1l" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription data-id="ngeckzsl7" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="28o6giiit" data-path="src/components/configuration/ProductionSetup.tsx">Custom Bucket:</strong> Files will be uploaded to <code className="bg-white px-1 rounded" data-id="cyag6izj2" data-path="src/components/configuration/ProductionSetup.tsx">gs://{customBucket}</code>
                <br data-id="j2tox0oyz" data-path="src/components/configuration/ProductionSetup.tsx" />
                <span className="text-sm" data-id="37mp6igtu" data-path="src/components/configuration/ProductionSetup.tsx">Make sure this bucket exists in your GCP project or enable auto-creation.</span>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Authentication Configuration */}
      <Card data-id="i55wrevmd" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="rbues3nq5" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="sjlfdex05" data-path="src/components/configuration/ProductionSetup.tsx">
            <Key className="h-5 w-5" data-id="d7ek6fqt6" data-path="src/components/configuration/ProductionSetup.tsx" />
            Authentication Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="kp7ghrue8" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-4" data-id="x4vgoqfgf" data-path="src/components/configuration/ProductionSetup.tsx">
            <div className="flex items-center space-x-2" data-id="mn22d0mmc" data-path="src/components/configuration/ProductionSetup.tsx">
              <input
                type="radio"
                id="service-account"
                checked={config.authMethod === 'service-account'}
                onChange={() => setConfig({ ...config, authMethod: 'service-account' })}
                className="text-blue-600" data-id="39fpbyc8l" data-path="src/components/configuration/ProductionSetup.tsx" />

              <Label htmlFor="service-account" className="flex items-center gap-2" data-id="0me99zcla" data-path="src/components/configuration/ProductionSetup.tsx">
                <Cloud className="h-4 w-4" data-id="ww6jy5563" data-path="src/components/configuration/ProductionSetup.tsx" />
                Service Account (Recommended for demo)
              </Label>
            </div>

            <div className="flex items-center space-x-2" data-id="4gpcalzht" data-path="src/components/configuration/ProductionSetup.tsx">
              <input
                type="radio"
                id="api-gateway"
                checked={config.authMethod === 'api-gateway'}
                onChange={() => setConfig({ ...config, authMethod: 'api-gateway' })}
                className="text-blue-600" data-id="ktm90j5wq" data-path="src/components/configuration/ProductionSetup.tsx" />

              <Label htmlFor="api-gateway" className="flex items-center gap-2" data-id="dkibnglnh" data-path="src/components/configuration/ProductionSetup.tsx">
                <Database className="h-4 w-4" data-id="ata35zajf" data-path="src/components/configuration/ProductionSetup.tsx" />
                API Gateway (Production)
              </Label>
            </div>
          </div>

          {config.authMethod === 'service-account' &&
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50" data-id="oosco282a" data-path="src/components/configuration/ProductionSetup.tsx">
              <div data-id="y47bwwq7d" data-path="src/components/configuration/ProductionSetup.tsx">
                <Label htmlFor="service-account-key" className="text-sm font-medium" data-id="2emrgcrgn" data-path="src/components/configuration/ProductionSetup.tsx">
                  Service Account Key (JSON)
                </Label>
                <p className="text-xs text-gray-600 mb-2" data-id="x2fs5eoha" data-path="src/components/configuration/ProductionSetup.tsx">
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
                rows={8} data-id="jjk5i1uk4" data-path="src/components/configuration/ProductionSetup.tsx" />

              </div>

              {keyErrors.length > 0 &&
            <Alert variant="destructive" data-id="zhaxzt214" data-path="src/components/configuration/ProductionSetup.tsx">
                  <AlertTriangle className="h-4 w-4" data-id="sugm3fe32" data-path="src/components/configuration/ProductionSetup.tsx" />
                  <AlertDescription data-id="dzbis4jln" data-path="src/components/configuration/ProductionSetup.tsx">
                    <strong data-id="o3grsxc01" data-path="src/components/configuration/ProductionSetup.tsx">Service Account Key Issues:</strong>
                    <ul className="list-disc list-inside mt-1 text-sm" data-id="lh6wuy3ue" data-path="src/components/configuration/ProductionSetup.tsx">
                      {keyErrors.map((error, index) =>
                  <li key={index} data-id="d27z0tjip" data-path="src/components/configuration/ProductionSetup.tsx">{error}</li>
                  )}
                    </ul>
                  </AlertDescription>
                </Alert>
            }

              {isValidKey &&
            <Alert className="border-green-200 bg-green-50" data-id="fcbio9iff" data-path="src/components/configuration/ProductionSetup.tsx">
                  <CheckCircle className="h-4 w-4 text-green-600" data-id="1ef75axpn" data-path="src/components/configuration/ProductionSetup.tsx" />
                  <AlertDescription className="text-green-800" data-id="xv5a6doik" data-path="src/components/configuration/ProductionSetup.tsx">
                    <strong data-id="folutimuv" data-path="src/components/configuration/ProductionSetup.tsx">Valid Service Account Key</strong>
                    <div className="text-sm mt-1" data-id="aza7re8vu" data-path="src/components/configuration/ProductionSetup.tsx">
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

              <Alert data-id="hf0kspt9j" data-path="src/components/configuration/ProductionSetup.tsx">
                <AlertCircle className="h-4 w-4" data-id="f3kjfcl9i" data-path="src/components/configuration/ProductionSetup.tsx" />
                <AlertDescription data-id="cw6vs34u8" data-path="src/components/configuration/ProductionSetup.tsx">
                  <strong data-id="9chcj8xi7" data-path="src/components/configuration/ProductionSetup.tsx">Security Note:</strong> In production applications, service account keys should never be embedded in frontend code. Use a secure backend API instead.
                </AlertDescription>
              </Alert>
            </div>
          }

          {config.authMethod === 'api-gateway' &&
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50" data-id="lx9z7kvir" data-path="src/components/configuration/ProductionSetup.tsx">
              <Alert data-id="qy0xslhj3" data-path="src/components/configuration/ProductionSetup.tsx">
                <Info className="h-4 w-4" data-id="p79w3va8a" data-path="src/components/configuration/ProductionSetup.tsx" />
                <AlertDescription data-id="jsj5mmj97" data-path="src/components/configuration/ProductionSetup.tsx">
                  API Gateway mode requires a backend service to handle BigQuery operations. 
                  This mode is intended for production deployments with proper authentication infrastructure.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3" data-id="tzntyf1br" data-path="src/components/configuration/ProductionSetup.tsx">
                <div data-id="dlxdzhc01" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Label htmlFor="api-endpoint" data-id="99ywkaovh" data-path="src/components/configuration/ProductionSetup.tsx">API Endpoint</Label>
                  <Input
                  id="api-endpoint"
                  value={config.apiEndpoint}
                  onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
                  placeholder="https://your-api-gateway.com/api" data-id="d44rfcmb0" data-path="src/components/configuration/ProductionSetup.tsx" />

                </div>
                <div data-id="i5caj44x2" data-path="src/components/configuration/ProductionSetup.tsx">
                  <Label htmlFor="api-key" data-id="zprbuuo1c" data-path="src/components/configuration/ProductionSetup.tsx">API Key</Label>
                  <Input
                  id="api-key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Your API authentication key" data-id="zaigul47s" data-path="src/components/configuration/ProductionSetup.tsx" />

                </div>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      <Card data-id="m6y3d4gw0" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="tn6loa0ak" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="flex items-center gap-2" data-id="4w3evzmt1" data-path="src/components/configuration/ProductionSetup.tsx">
            <Settings className="h-5 w-5" data-id="ey5oczqch" data-path="src/components/configuration/ProductionSetup.tsx" />
            Processing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="qhenm34ky" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="flex items-center justify-between p-4 border rounded-lg" data-id="cjbbt7iop" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="fiqv1kv3h" data-path="src/components/configuration/ProductionSetup.tsx">
              <Label className="text-base font-medium" data-id="7w4x54vfc" data-path="src/components/configuration/ProductionSetup.tsx">Enable Real Processing</Label>
              <p className="text-sm text-gray-600" data-id="4mnqpbt4n" data-path="src/components/configuration/ProductionSetup.tsx">
                When enabled, the system will attempt real BigQuery and GCS operations.
                Note: This is a demo application with simulated operations for security.
              </p>
            </div>
            <Switch
              checked={config.enableRealProcessing}
              onCheckedChange={(checked) => setConfig({ ...config, enableRealProcessing: checked })} data-id="rubf36h7w" data-path="src/components/configuration/ProductionSetup.tsx" />

          </div>

          {config.enableRealProcessing &&
          <Alert className="border-yellow-200 bg-yellow-50" data-id="gypd7gxtm" data-path="src/components/configuration/ProductionSetup.tsx">
              <AlertTriangle className="h-4 w-4 text-yellow-600" data-id="m8xmdip7g" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription className="text-yellow-800" data-id="9fz12spnu" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="mh2kw86nw" data-path="src/components/configuration/ProductionSetup.tsx">Demo Mode Active:</strong> Even with real processing enabled, this frontend application 
                simulates BigQuery operations for security. Actual data processing requires a secure backend service.
              </AlertDescription>
            </Alert>
          }

          {envInfo.configErrors.length > 0 &&
          <Alert variant="destructive" data-id="ldco1ilqs" data-path="src/components/configuration/ProductionSetup.tsx">
              <AlertTriangle className="h-4 w-4" data-id="fkt98i5wh" data-path="src/components/configuration/ProductionSetup.tsx" />
              <AlertDescription data-id="hyc6h56za" data-path="src/components/configuration/ProductionSetup.tsx">
                <strong data-id="iz0a38yw8" data-path="src/components/configuration/ProductionSetup.tsx">Configuration Issues:</strong>
                <ul className="list-disc list-inside mt-1" data-id="dg17ututz" data-path="src/components/configuration/ProductionSetup.tsx">
                  {envInfo.configErrors.map((error, index) =>
                <li key={index} data-id="meh73toam" data-path="src/components/configuration/ProductionSetup.tsx">{error}</li>
                )}
                </ul>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4" data-id="66kyqlb9o" data-path="src/components/configuration/ProductionSetup.tsx">
        <Button
          onClick={saveConfiguration}
          disabled={config.authMethod === 'service-account' && !isValidKey}
          className="flex-1" data-id="ul1lpp44c" data-path="src/components/configuration/ProductionSetup.tsx">

          <Settings className="h-4 w-4 mr-2" data-id="y863p5ht3" data-path="src/components/configuration/ProductionSetup.tsx" />
          Save Configuration
        </Button>
        <Button variant="outline" onClick={clearConfiguration} data-id="mimd7ryir" data-path="src/components/configuration/ProductionSetup.tsx">
          Clear All
        </Button>
      </div>

      {/* Quick Setup Guide */}
      <Card data-id="okvtghm44" data-path="src/components/configuration/ProductionSetup.tsx">
        <CardHeader data-id="mx2lyshr0" data-path="src/components/configuration/ProductionSetup.tsx">
          <CardTitle className="text-lg" data-id="20l9pk38d" data-path="src/components/configuration/ProductionSetup.tsx">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent data-id="gb29i19yf" data-path="src/components/configuration/ProductionSetup.tsx">
          <div className="space-y-4 text-sm" data-id="lslf1mwng" data-path="src/components/configuration/ProductionSetup.tsx">
            <div data-id="lapjmbigx" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="j54dt9xsq" data-path="src/components/configuration/ProductionSetup.tsx">To Fix Bucket Issues:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="5hvvhyiop" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="1vy0ue04f" data-path="src/components/configuration/ProductionSetup.tsx">Check what bucket name you expect to use</li>
                <li data-id="oy0ckffi3" data-path="src/components/configuration/ProductionSetup.tsx">Enter the correct bucket name in the "GCS Bucket" field above</li>
                <li data-id="xmibasmza" data-path="src/components/configuration/ProductionSetup.tsx">Ensure the bucket exists in your GCP project</li>
                <li data-id="9wcnzihhp" data-path="src/components/configuration/ProductionSetup.tsx">Save configuration and test again</li>
              </ol>
            </div>

            <div data-id="nhep7p3cb" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="dxjstz675" data-path="src/components/configuration/ProductionSetup.tsx">For Demo/Testing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="7px48ee94" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="a2j34v20r" data-path="src/components/configuration/ProductionSetup.tsx">Select "Service Account" authentication method</li>
                <li data-id="6ii0newsw" data-path="src/components/configuration/ProductionSetup.tsx">Create a service account in your Google Cloud Console</li>
                <li data-id="arm9f6wfz" data-path="src/components/configuration/ProductionSetup.tsx">Download the JSON key file and paste its contents above</li>
                <li data-id="cqqpeedo4" data-path="src/components/configuration/ProductionSetup.tsx">Configure the correct bucket name for your project</li>
                <li data-id="zhqmw3rxe" data-path="src/components/configuration/ProductionSetup.tsx">Enable "Real Processing" to simulate production behavior</li>
                <li data-id="cbyljejtt" data-path="src/components/configuration/ProductionSetup.tsx">Test connections in the Diagnostics tab</li>
              </ol>
            </div>
            
            <div data-id="gqxnwe8nh" data-path="src/components/configuration/ProductionSetup.tsx">
              <h4 className="font-medium mb-2" data-id="dizywsm5p" data-path="src/components/configuration/ProductionSetup.tsx">For Production:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600" data-id="z78pqz29b" data-path="src/components/configuration/ProductionSetup.tsx">
                <li data-id="jdjx8yqil" data-path="src/components/configuration/ProductionSetup.tsx">Implement a secure backend API gateway</li>
                <li data-id="k2a96k0h1" data-path="src/components/configuration/ProductionSetup.tsx">Configure server-side BigQuery and GCS access</li>
                <li data-id="q9rtm05os" data-path="src/components/configuration/ProductionSetup.tsx">Select "API Gateway" authentication method</li>
                <li data-id="szutfgpm6" data-path="src/components/configuration/ProductionSetup.tsx">Provide your backend API endpoint and authentication</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ProductionSetup;