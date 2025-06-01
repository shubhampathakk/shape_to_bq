import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  Database,
  Loader2
} from "lucide-react";

interface UploadProgressProps {
  sessionId: string;
  onUploadToBigquery: () => void;
  isUploading: boolean;
}

export function UploadProgress({ sessionId, onUploadToBigquery, isUploading }: UploadProgressProps) {
  // Get current session data
  const { data: sessionData } = useQuery({
    queryKey: ["/api/upload-session", sessionId],
    enabled: !!sessionId,
    refetchInterval: (data) => {
      // Refetch every 2 seconds if status is processing
      return data?.session?.status === "processing" ? 2000 : false;
    },
  });

  const session = sessionData?.session;
  const files = sessionData?.files || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = () => {
    if (!session?.totalFeatures || !session?.processedFeatures) return 0;
    return Math.round((session.processedFeatures / session.totalFeatures) * 100);
  };

  const canUpload = () => {
    return session?.status === "parsed" && files.length >= 3; // At least .shp, .shx, .dbf
  };

  return (
    <div className="space-y-6">
      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Upload Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(session?.status || "pending")}
              <div>
                <div className="font-medium">
                  Session {sessionId.slice(0, 8)}...
                </div>
                <div className="text-sm text-gray-600">
                  Created {session?.createdAt ? new Date(session.createdAt).toLocaleString() : "Unknown"}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(session?.status || "pending")}>
              {session?.status?.toUpperCase() || "PENDING"}
            </Badge>
          </div>

          {session?.errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{session.errorMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {session?.status === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>BigQuery Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing features...</span>
                  <span className="text-sm text-gray-600">
                    {session.processedFeatures?.toLocaleString() || 0} / {session.totalFeatures?.toLocaleString() || 0}
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                <div className="text-center mt-2">
                  <span className="text-lg font-semibold text-blue-600">
                    {getProgressPercentage()}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to BigQuery...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Status */}
      <Card>
        <CardHeader>
          <CardTitle>File Status</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No files uploaded yet
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{file.originalName}</div>
                      <div className="text-xs text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{file.fileType.toUpperCase()}</Badge>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Summary */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {session.totalFeatures?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Features</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {session.geometryType || "Unknown"}
                </div>
                <div className="text-sm text-gray-600">Geometry</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {files.length}
                </div>
                <div className="text-sm text-gray-600">Files</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Action */}
      {canUpload() && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <Upload className="w-12 h-12 text-blue-500 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Upload</h3>
              <p className="text-gray-600 mb-4">
                Files have been parsed and schema is configured. Click below to upload to BigQuery.
              </p>
              <Button
                onClick={onUploadToBigquery}
                disabled={isUploading}
                size="lg"
                className="px-8"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading to BigQuery...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to BigQuery
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
