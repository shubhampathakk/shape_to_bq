import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Database, Globe, CheckCircle } from "lucide-react";

interface FileUploadZoneProps {
  sessionId: string;
}

interface FileTypeConfig {
  extension: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  color: string;
}

const fileTypes: FileTypeConfig[] = [
  {
    extension: "shp",
    label: ".shp File",
    description: "Main geometry file",
    icon: <File className="w-6 h-6" />,
    required: true,
    color: "blue",
  },
  {
    extension: "shx",
    label: ".shx File", 
    description: "Shape index file",
    icon: <Database className="w-6 h-6" />,
    required: true,
    color: "purple",
  },
  {
    extension: "dbf",
    label: ".dbf File",
    description: "Attribute database",
    icon: <Database className="w-6 h-6" />,
    required: true,
    color: "green",
  },
  {
    extension: "prj",
    label: ".prj File",
    description: "Projection information",
    icon: <Globe className="w-6 h-6" />,
    required: false,
    color: "orange",
  },
];

export function FileUploadZone({ sessionId }: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/upload/${sessionId}/files`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload-session", sessionId] });
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (fileType: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const expectedExtension = `.${fileType}`;
    
    if (!file.name.toLowerCase().endsWith(expectedExtension)) {
      toast({
        title: "Invalid File Type",
        description: `Please select a ${expectedExtension} file`,
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
  };

  const handleDragOver = (e: React.DragEvent, fileType: string) => {
    e.preventDefault();
    setDragOver(fileType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, fileType: string) => {
    e.preventDefault();
    setDragOver(null);
    handleFileSelect(fileType, e.dataTransfer.files);
  };

  const handleUploadAll = () => {
    const files = Object.values(uploadedFiles);
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(files);
  };

  const getColorClasses = (color: string, isUploaded: boolean) => {
    if (isUploaded) {
      return "border-green-300 bg-green-50 text-green-700";
    }

    const colorMap = {
      blue: "border-blue-300 hover:border-blue-400 hover:bg-blue-50",
      purple: "border-purple-300 hover:border-purple-400 hover:bg-purple-50",
      green: "border-green-300 hover:border-green-400 hover:bg-green-50",
      orange: "border-orange-300 hover:border-orange-400 hover:bg-orange-50",
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColorClasses = (color: string, isUploaded: boolean) => {
    if (isUploaded) {
      return "text-green-600 bg-green-100";
    }

    const colorMap = {
      blue: "text-blue-600 bg-blue-100",
      purple: "text-purple-600 bg-purple-100", 
      green: "text-green-600 bg-green-100",
      orange: "text-orange-600 bg-orange-100",
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Shapefile Components</h3>
        <p className="text-sm text-gray-600 mb-6">
          Upload all required shapefile components. The .shp, .shx, and .dbf files are required.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {fileTypes.map((fileType) => {
            const isUploaded = uploadedFiles[fileType.extension];
            const isDraggedOver = dragOver === fileType.extension;

            return (
              <Card
                key={fileType.extension}
                className={`cursor-pointer transition-all duration-200 ${getColorClasses(
                  fileType.color,
                  !!isUploaded
                )} ${isDraggedOver ? "scale-105" : ""}`}
                onDragOver={(e) => handleDragOver(e, fileType.extension)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, fileType.extension)}
                onClick={() => fileInputRefs.current[fileType.extension]?.click()}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${getIconColorClasses(
                        fileType.color,
                        !!isUploaded
                      )}`}
                    >
                      {isUploaded ? <CheckCircle className="w-6 h-6" /> : fileType.icon}
                    </div>
                  </div>
                  <div className="text-sm font-medium mb-1">
                    {fileType.label}
                    {fileType.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">{fileType.description}</div>
                  {isUploaded ? (
                    <div className="text-xs text-green-600 font-medium">
                      {isUploaded.name} ({(isUploaded.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Click to select or drag file here</div>
                  )}

                  <input
                    ref={(el) => (fileInputRefs.current[fileType.extension] = el)}
                    type="file"
                    accept={`.${fileType.extension}`}
                    className="hidden"
                    onChange={(e) => handleFileSelect(fileType.extension, e.target.files)}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {Object.keys(uploadedFiles).length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.keys(uploadedFiles).length} file(s) selected
            </div>
            <button
              onClick={handleUploadAll}
              disabled={uploadMutation.isPending}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
