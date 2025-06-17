
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GCSPathInputProps {
  bucket: string;
  path: string;
  onBucketChange: (bucket: string) => void;
  onPathChange: (path: string) => void;
  disabled?: boolean;
}

const GCSPathInput: React.FC<GCSPathInputProps> = ({
  bucket,
  path,
  onBucketChange,
  onPathChange,
  disabled = false
}) => {
  const fullPath = bucket && path ? `gs://${bucket}/${path}` : '';

  return (
    <Card data-id="k7pdmjnbq" data-path="src/components/upload/GCSPathInput.tsx">
      <CardHeader data-id="luvz1ya7a" data-path="src/components/upload/GCSPathInput.tsx">
        <CardTitle className="flex items-center space-x-2" data-id="t7grbtmtj" data-path="src/components/upload/GCSPathInput.tsx">
          <FolderOpen className="h-5 w-5" data-id="fzz8r4xy0" data-path="src/components/upload/GCSPathInput.tsx" />
          <span data-id="xv96oizi9" data-path="src/components/upload/GCSPathInput.tsx">Google Cloud Storage Path</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" data-id="uuat10192" data-path="src/components/upload/GCSPathInput.tsx">
        <Alert data-id="t6u8tk3am" data-path="src/components/upload/GCSPathInput.tsx">
          <Info className="h-4 w-4" data-id="9fsocx6x0" data-path="src/components/upload/GCSPathInput.tsx" />
          <AlertDescription data-id="85xtloll4" data-path="src/components/upload/GCSPathInput.tsx">
            Specify the GCS bucket and path where your shapefile(s) are stored. 
            Use wildcards (*) to process multiple files.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4" data-id="u105gwclo" data-path="src/components/upload/GCSPathInput.tsx">
          <div className="space-y-2" data-id="nufqnn9hp" data-path="src/components/upload/GCSPathInput.tsx">
            <Label htmlFor="gcs-bucket" data-id="qfwhdf0z5" data-path="src/components/upload/GCSPathInput.tsx">GCS Bucket Name</Label>
            <Input
              id="gcs-bucket"
              placeholder="my-geospatial-data"
              value={bucket}
              onChange={(e) => onBucketChange(e.target.value)}
              disabled={disabled} data-id="akzvzkjvv" data-path="src/components/upload/GCSPathInput.tsx" />

          </div>

          <div className="space-y-2" data-id="zqm7hpc0q" data-path="src/components/upload/GCSPathInput.tsx">
            <Label htmlFor="gcs-path" data-id="dsphmca8j" data-path="src/components/upload/GCSPathInput.tsx">Path/Pattern</Label>
            <Input
              id="gcs-path"
              placeholder="shapefiles/*.shp or path/to/specific/file.shp"
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              disabled={disabled} data-id="fk5kl0g2k" data-path="src/components/upload/GCSPathInput.tsx" />

          </div>

          {fullPath &&
          <div className="p-3 bg-gray-50 rounded-lg" data-id="z80xi2t8w" data-path="src/components/upload/GCSPathInput.tsx">
              <Label className="text-xs text-gray-500" data-id="2rxxsm7c0" data-path="src/components/upload/GCSPathInput.tsx">Full GCS Path:</Label>
              <p className="font-mono text-sm text-gray-800 break-all" data-id="csbttcmk7" data-path="src/components/upload/GCSPathInput.tsx">{fullPath}</p>
            </div>
          }
        </div>

        <div className="space-y-2" data-id="ey0z9z3dh" data-path="src/components/upload/GCSPathInput.tsx">
          <h4 className="text-sm font-medium text-gray-700" data-id="32tvmrnpu" data-path="src/components/upload/GCSPathInput.tsx">Examples:</h4>
          <div className="space-y-1 text-xs text-gray-500" data-id="dahz9fon2" data-path="src/components/upload/GCSPathInput.tsx">
            <p data-id="9zrk37k5c" data-path="src/components/upload/GCSPathInput.tsx"><code data-id="09pw0xkls" data-path="src/components/upload/GCSPathInput.tsx">gs://my-bucket/data/*.shp</code> - Process all .shp files in the data folder</p>
            <p data-id="hhp6p1h2j" data-path="src/components/upload/GCSPathInput.tsx"><code data-id="cs3okppat" data-path="src/components/upload/GCSPathInput.tsx">gs://my-bucket/cities.shp</code> - Process a specific shapefile</p>
            <p data-id="acw9ykm8v" data-path="src/components/upload/GCSPathInput.tsx"><code data-id="b1mehlsg0" data-path="src/components/upload/GCSPathInput.tsx">gs://my-bucket/regions/**/*.shp</code> - Process all .shp files recursively</p>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default GCSPathInput;