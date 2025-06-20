
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  selectedFile,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find((file) => file.name.endsWith('.zip'));

    if (zipFile) {
      onFileSelect(zipFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      onFileSelect(file);
    }
    e.target.value = '';
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      isDragOver && !disabled && "border-blue-500 bg-blue-50",
      disabled && "opacity-50 cursor-not-allowed"
    )} data-id="gqa4bae1m" data-path="src/components/upload/FileUploadZone.tsx">
      <CardContent className="p-6" data-id="q7t2sx16n" data-path="src/components/upload/FileUploadZone.tsx">
        {selectedFile ?
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg" data-id="glx2qntnj" data-path="src/components/upload/FileUploadZone.tsx">
            <div className="flex items-center space-x-3" data-id="1lapwqiw8" data-path="src/components/upload/FileUploadZone.tsx">
              <div className="p-2 bg-green-100 rounded-full" data-id="ah1tzlxr1" data-path="src/components/upload/FileUploadZone.tsx">
                <CheckCircle className="h-5 w-5 text-green-600" data-id="qdhgvvfys" data-path="src/components/upload/FileUploadZone.tsx" />
              </div>
              <div data-id="csa04uvd3" data-path="src/components/upload/FileUploadZone.tsx">
                <p className="font-medium text-green-800" data-id="xp5o49bg4" data-path="src/components/upload/FileUploadZone.tsx">{selectedFile.name}</p>
                <p className="text-sm text-green-600" data-id="j4zorkv1p" data-path="src/components/upload/FileUploadZone.tsx">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!disabled &&
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100" data-id="xvnoiykms" data-path="src/components/upload/FileUploadZone.tsx">

                <X className="h-4 w-4" data-id="ve54w4yz5" data-path="src/components/upload/FileUploadZone.tsx" />
              </Button>
          }
          </div> :

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver && !disabled ? "border-blue-500 bg-blue-50" : "border-gray-300",
            !disabled && "hover:border-gray-400 cursor-pointer"
          )} data-id="82dpobnfh" data-path="src/components/upload/FileUploadZone.tsx">

            <div className="flex flex-col items-center space-y-4" data-id="i6y4mx8qu" data-path="src/components/upload/FileUploadZone.tsx">
              <div className={cn(
              "p-4 rounded-full",
              isDragOver && !disabled ? "bg-blue-100" : "bg-gray-100"
            )} data-id="zguy9x24n" data-path="src/components/upload/FileUploadZone.tsx">
                <Upload className={cn(
                "h-8 w-8",
                isDragOver && !disabled ? "text-blue-600" : "text-gray-400"
              )} data-id="snuzn5ct2" data-path="src/components/upload/FileUploadZone.tsx" />
              </div>
              
              <div className="space-y-2" data-id="1jufh7s1d" data-path="src/components/upload/FileUploadZone.tsx">
                <h3 className="text-lg font-medium text-gray-900" data-id="mjfxs8j9z" data-path="src/components/upload/FileUploadZone.tsx">
                  Drop your shapefile here
                </h3>
                <p className="text-sm text-gray-500" data-id="e4rb113r0" data-path="src/components/upload/FileUploadZone.tsx">
                  Upload a .zip file containing your complete shapefile (.shp, .shx, .dbf, etc.)
                </p>
              </div>

              <div className="flex items-center space-x-2" data-id="tyfg6men3" data-path="src/components/upload/FileUploadZone.tsx">
                <input
                type="file"
                accept=".zip"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={disabled} data-id="8kfcy2tfz" data-path="src/components/upload/FileUploadZone.tsx" />

                <label htmlFor="file-upload" data-id="4qyf1ptuv" data-path="src/components/upload/FileUploadZone.tsx">
                  <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={disabled}
                  asChild data-id="yywcy40ob" data-path="src/components/upload/FileUploadZone.tsx">

                    <span data-id="ta4nnoxa3" data-path="src/components/upload/FileUploadZone.tsx">
                      <File className="mr-2 h-4 w-4" data-id="67pytn5lt" data-path="src/components/upload/FileUploadZone.tsx" />
                      Browse Files
                    </span>
                  </Button>
                </label>
              </div>

              <p className="text-xs text-gray-400" data-id="8bf6ffli6" data-path="src/components/upload/FileUploadZone.tsx">
                Maximum file size: 100MB
              </p>
            </div>
          </div>
        }
      </CardContent>
    </Card>);

};

export default FileUploadZone;