import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUploadZone } from "@/components/file-upload-zone";
import { SchemaEditor } from "@/components/schema-editor";
import { DataPreview } from "@/components/data-preview";
import { UploadProgress } from "@/components/upload-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Upload, 
  Eye, 
  BarChart3, 
  Settings, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

interface UploadSession {
  id: string;
  status: string;
  totalFeatures?: number;
  processedFeatures?: number;
  geometryType?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function UploadPage() {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [bigqueryConfig, setBigqueryConfig] = useState({
    projectId: "",
    datasetId: "",
    tableName: "",
  });
  const [schemaType, setSchemaType] = useState("auto");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create upload session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      console.log("Making API request to create session...");
      const response = await apiRequest("POST", "/api/upload-session");
      console.log("API response:", response);
      return response.json();
    },
    onSuccess: (session: UploadSession) => {
      console.log("Session created successfully:", session);
      setCurrentSession(session.id);
      setActiveTab("upload");
      toast({
        title: "Success",
        description: "Upload session created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create upload session",
        variant: "destructive",
      });
    },
  });

  // Get current session data
  const { data: sessionData } = useQuery({
    queryKey: ["/api/upload-session", currentSession],
    enabled: !!currentSession,
  });

  // Get recent uploads
  const { data: recentUploads } = useQuery({
    queryKey: ["/api/recent-uploads"],
  });

  // Save BigQuery config
  const saveBigqueryConfigMutation = useMutation({
    mutationFn: async (config: typeof bigqueryConfig) => {
      const response = await apiRequest("POST", `/api/upload/${currentSession}/bigquery-config`, config);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "BigQuery configuration saved",
      });
    },
  });

  // Parse shapefile
  const parseShapefileMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/upload/${currentSession}/parse`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload-session", currentSession] });
      toast({
        title: "Success",
        description: `Parsed ${data.featureCount} features with ${data.geometryType} geometry`,
      });
      setActiveTab("preview");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to parse shapefile",
        variant: "destructive",
      });
    },
  });

  // Upload to BigQuery
  const uploadToBigqueryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/upload/${currentSession}/to-bigquery`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload-session", currentSession] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-uploads"] });
      toast({
        title: "Success",
        description: `Uploaded ${data.rowsInserted} rows to ${data.tableId}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload to BigQuery",
        variant: "destructive",
      });
    },
  });

  const handleStartNewUpload = () => {
    console.log("Starting new upload session...");
    createSessionMutation.mutate();
  };

  const handleConfigSave = () => {
    if (!bigqueryConfig.projectId || !bigqueryConfig.datasetId || !bigqueryConfig.tableName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all BigQuery configuration fields",
        variant: "destructive",
      });
      return;
    }
    saveBigqueryConfigMutation.mutate(bigqueryConfig);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-2 h-2 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-2 h-2 text-red-500" />;
      case "processing":
        return <Clock className="w-2 h-2 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-2 h-2 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">ShapeFile Loader</h1>
              <p className="text-xs text-gray-500">to BigQuery</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("upload")}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                  activeTab === "upload"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("schema")}
                disabled={!sessionData?.session || sessionData.session.status === "pending"}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === "schema"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Schema Design</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("preview")}
                disabled={!sessionData?.session || sessionData.session.status !== "parsed"}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === "preview"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Data Preview</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("progress")}
                disabled={!sessionData?.session}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === "progress"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Upload Progress</span>
              </button>
            </li>
          </ul>

          {/* GCP Connection Status */}
          <div className="mt-8 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">GCP Ready</span>
            </div>
            <p className="text-xs text-gray-500">Environment configured</p>
          </div>
        </nav>

        {/* Recent Projects */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recent</h3>
          <div className="space-y-1">
            {recentUploads?.slice(0, 3).map((upload: UploadSession) => (
              <div
                key={upload.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => setCurrentSession(upload.id)}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(upload.status)}
                  <span className="text-sm text-gray-700 truncate">
                    Session {upload.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(upload.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {activeTab === "upload" && "File Upload"}
              {activeTab === "schema" && "Schema Configuration"}
              {activeTab === "preview" && "Data Preview"}
              {activeTab === "progress" && "Upload Progress"}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTab === "upload" && "Upload shapefile components (.shp, .shx, .dbf, .prj)"}
              {activeTab === "schema" && "Configure BigQuery table schema"}
              {activeTab === "preview" && "Preview data before uploading to BigQuery"}
              {activeTab === "progress" && "Monitor upload progress and status"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === "upload" && (
              <>
                {!currentSession ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Start New Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Create a new upload session to begin uploading shapefile data to BigQuery.
                      </p>
                      <Button 
                        onClick={handleStartNewUpload}
                        disabled={createSessionMutation.isPending}
                      >
                        {createSessionMutation.isPending ? "Creating..." : "Start New Upload"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <FileUploadZone sessionId={currentSession} />
                    
                    {sessionData?.files && sessionData.files.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Uploaded Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sessionData.files.map((file: any) => (
                              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">{file.originalName}</span>
                                <Badge variant="secondary">{file.fileType.toUpperCase()}</Badge>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <Button
                              onClick={() => parseShapefileMutation.mutate()}
                              disabled={parseShapefileMutation.isPending}
                            >
                              {parseShapefileMutation.isPending ? "Parsing..." : "Parse Shapefile"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* BigQuery Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle>BigQuery Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="projectId">Project ID</Label>
                            <Input
                              id="projectId"
                              placeholder="my-gcp-project"
                              value={bigqueryConfig.projectId}
                              onChange={(e) => setBigqueryConfig(prev => ({ ...prev, projectId: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="datasetId">Dataset ID</Label>
                            <Input
                              id="datasetId"
                              placeholder="geospatial_data"
                              value={bigqueryConfig.datasetId}
                              onChange={(e) => setBigqueryConfig(prev => ({ ...prev, datasetId: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="tableName">Table Name</Label>
                          <Input
                            id="tableName"
                            placeholder="shapefile_data"
                            value={bigqueryConfig.tableName}
                            onChange={(e) => setBigqueryConfig(prev => ({ ...prev, tableName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label>Schema Detection</Label>
                          <RadioGroup value={schemaType} onValueChange={setSchemaType} className="mt-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="auto" id="auto" />
                              <Label htmlFor="auto">Auto-detect schema</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="manual" id="manual" />
                              <Label htmlFor="manual">Define manual schema</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <Button 
                          onClick={handleConfigSave}
                          disabled={saveBigqueryConfigMutation.isPending}
                        >
                          {saveBigqueryConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}

            {activeTab === "schema" && currentSession && (
              <SchemaEditor sessionId={currentSession} schemaType={schemaType} />
            )}

            {activeTab === "preview" && currentSession && (
              <DataPreview sessionId={currentSession} />
            )}

            {activeTab === "progress" && currentSession && (
              <UploadProgress 
                sessionId={currentSession} 
                onUploadToBigquery={() => uploadToBigqueryMutation.mutate()}
                isUploading={uploadToBigqueryMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
