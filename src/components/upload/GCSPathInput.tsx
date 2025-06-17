
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
    <Card data-id="nu11iisvw" data-path="src/components/upload/GCSPathInput.tsx">
      <CardHeader data-id="tdy8phzde" data-path="src/components/upload/GCSPathInput.tsx">
        <CardTitle className="flex items-center space-x-2" data-id="1rkjewx2w" data-path="src/components/upload/GCSPathInput.tsx">
          <FolderOpen className="h-5 w-5" data-id="cp8e1zqwe" data-path="src/components/upload/GCSPathInput.tsx" />
          <span data-id="j0doxx403" data-path="src/components/upload/GCSPathInput.tsx">Google Cloud Storage Path</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" data-id="2ipt5vq66" data-path="src/components/upload/GCSPathInput.tsx">
        <Alert data-id="7p7949b1n" data-path="src/components/upload/GCSPathInput.tsx">
          <Info className="h-4 w-4" data-id="lg1uogbxr" data-path="src/components/upload/GCSPathInput.tsx" />
          <AlertDescription data-id="cl0hrxwp1" data-path="src/components/upload/GCSPathInput.tsx">
            Specify the GCS bucket and path where your shapefile(s) are stored. 
            Use wildcards (*) to process multiple files.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4" data-id="xszg517kl" data-path="src/components/upload/GCSPathInput.tsx">
          <div className="space-y-2" data-id="9demdowcf" data-path="src/components/upload/GCSPathInput.tsx">
            <Label htmlFor="gcs-bucket" data-id="l93ksp0m6" data-path="src/components/upload/GCSPathInput.tsx">GCS Bucket Name</Label>
            <Input
              id="gcs-bucket"
              placeholder="my-geospatial-data"
              value={bucket}
              onChange={(e) => onBucketChange(e.target.value)}
              disabled={disabled} data-id="qxjl3ceol" data-path="src/components/upload/GCSPathInput.tsx" />

          </div>

          <div className="space-y-2" data-id="1j8qkrcip" data-path="src/components/upload/GCSPathInput.tsx">
            <Label htmlFor="gcs-path" data-id="vwvc7dqvj" data-path="src/components/upload/GCSPathInput.tsx">Path/Pattern</Label>
            <Input
              id="gcs-path"
              placeholder="shapefiles/*.shp or path/to/specific/file.shp"
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              disabled={disabled} data-id="3e6ez8rsi" data-path="src/components/upload/GCSPathInput.tsx" />

          </div>

          {fullPath &&
          <div className="p-3 bg-gray-50 rounded-lg" data-id="h8t1r1u3t" data-path="src/components/upload/GCSPathInput.tsx">
              <Label className="text-xs text-gray-500" data-id="67ym15w7j" data-path="src/components/upload/GCSPathInput.tsx">Full GCS Path:</Label>
              <p className="font-mono text-sm text-gray-800 break-all" data-id="3fvjc1u1b" data-path="src/components/upload/GCSPathInput.tsx">{fullPath}</p>
            </div>
          }
        </div>

        <div className="space-y-2" data-id="huu7bbfpx" data-path="src/components/upload/GCSPathInput.tsx">
          <h4 className="text-sm font-medium text-gray-700" data-id="6kvgi2766" data-path="src/components/upload/GCSPathInput.tsx">Examples:</h4>
          <div className="space-y-1 text-xs text-gray-500" data-id="bs6quleu7" data-path="src/components/upload/GCSPathInput.tsx">
            <p data-id="mo1hehsyw" data-path="src/components/upload/GCSPathInput.tsx"><code data-id="rv46ivyds" data-path="src/components/upload/GCSPathInput.tsx">gs://my-bucket/data/*.shp</code> - Process all .shp files in the data folder</p>
            <p data-id="4nbw1nv3v" data-path="src/components/upload/GCSPathInput.tsx"><code data-id="al8vci3lc" data-path="src/components/upload/GCSPathInput.tsx">gs://my-bucket/cities.shp</code> - Process a specific shapefile</p>
            <p data-id="0inhg72no" data-path="src/components/upload/GCSPathInput.tsx"><code data-id="dzafpggyw" data-path="src/components/upload/GCSPathInput.tsx">gs://my-bucket/regions/**/*.shp</code> - Process all .shp files recursively</p>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default GCSPathInput;