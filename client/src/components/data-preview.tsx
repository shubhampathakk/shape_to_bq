import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MapPin, Square, Minus } from "lucide-react";

interface DataPreviewProps {
  sessionId: string;
}

export function DataPreview({ sessionId }: DataPreviewProps) {
  // Get parsed shapefile data
  const { data: parseData, isLoading } = useQuery({
    queryKey: ["/api/upload", sessionId, "parse"],
    enabled: !!sessionId,
  });

  // Get current session data
  const { data: sessionData } = useQuery({
    queryKey: ["/api/upload-session", sessionId],
    enabled: !!sessionId,
  });

  const getGeometryIcon = (geometryType: string) => {
    switch (geometryType.toLowerCase()) {
      case "point":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "polygon":
        return <Square className="w-4 h-4 text-green-500" />;
      case "linestring":
        return <Minus className="w-4 h-4 text-purple-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGeometryBadgeColor = (geometryType: string) => {
    switch (geometryType.toLowerCase()) {
      case "point":
        return "bg-blue-100 text-blue-800";
      case "polygon":
        return "bg-green-100 text-green-800";
      case "linestring":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }
    
    return String(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading data preview...</div>
        </CardContent>
      </Card>
    );
  }

  if (!parseData && !sessionData?.session) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No data available. Please upload and parse shapefile first.
          </div>
        </CardContent>
      </Card>
    );
  }

  const session = sessionData?.session;
  const preview = parseData?.preview || [];

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Data Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {session?.totalFeatures?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Total Features</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center space-x-1">
                {getGeometryIcon(session?.geometryType || "")}
                <span>{session?.geometryType || "Unknown"}</span>
              </div>
              <div className="text-sm text-gray-600">Geometry Type</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {parseData?.schema?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Schema Fields</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {((sessionData?.files?.reduce((sum: number, file: any) => sum + file.size, 0) || 0) / 1024 / 1024).toFixed(2)} MB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Preview</CardTitle>
          <p className="text-sm text-gray-600">
            Showing first {Math.min(preview.length, 5)} of {session?.totalFeatures || 0} features
          </p>
        </CardHeader>
        <CardContent>
          {preview.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No preview data available
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Geometry</TableHead>
                      {preview[0]?.properties && Object.keys(preview[0].properties).map((key) => (
                        <TableHead key={key} className="font-medium">
                          {key}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((feature: any, index: number) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getGeometryIcon(feature.geometry?.type || "")}
                            <Badge 
                              variant="secondary" 
                              className={getGeometryBadgeColor(feature.geometry?.type || "")}
                            >
                              {feature.geometry?.type || "Unknown"}
                            </Badge>
                          </div>
                        </TableCell>
                        {feature.properties && Object.values(feature.properties).map((value: any, valueIndex: number) => (
                          <TableCell key={valueIndex}>
                            {formatValue(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <span className="text-xs text-gray-600">
                  Showing {preview.length} of {session?.totalFeatures || 0} features
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geometry Details */}
      {preview.length > 0 && preview[0].geometry && (
        <Card>
          <CardHeader>
            <CardTitle>Geometry Sample</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-600 mb-2">First feature geometry:</div>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(preview[0].geometry, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
