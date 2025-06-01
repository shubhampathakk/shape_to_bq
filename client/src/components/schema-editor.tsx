import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Database } from "lucide-react";

interface SchemaEditorProps {
  sessionId: string;
  schemaType: string;
}

interface SchemaField {
  id?: number;
  fieldName: string;
  fieldType: string;
  mode: string;
  isAutoDetected?: boolean;
}

const FIELD_TYPES = [
  "STRING",
  "INTEGER", 
  "FLOAT",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "GEOGRAPHY",
  "JSON",
];

const FIELD_MODES = ["NULLABLE", "REQUIRED"];

export function SchemaEditor({ sessionId, schemaType }: SchemaEditorProps) {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [tableName, setTableName] = useState("shapefile_data");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current schema
  const { data: schemaData, isLoading } = useQuery({
    queryKey: ["/api/upload", sessionId, "schema"],
    enabled: !!sessionId,
  });

  // Update schema mutation
  const updateSchemaMutation = useMutation({
    mutationFn: async (schemaFields: SchemaField[]) => {
      const response = await apiRequest("PUT", `/api/upload/${sessionId}/schema`, {
        fields: schemaFields,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload", sessionId, "schema"] });
      toast({
        title: "Success",
        description: "Schema updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update schema",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (schemaData) {
      setFields(schemaData);
    }
  }, [schemaData]);

  const addField = () => {
    setFields(prev => [
      ...prev,
      {
        fieldName: "",
        fieldType: "STRING",
        mode: "NULLABLE",
        isAutoDetected: false,
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    setFields(prev =>
      prev.map((field, i) => (i === index ? { ...field, ...updates } : field))
    );
  };

  const handleSaveSchema = () => {
    const validFields = fields.filter(field => field.fieldName.trim() !== "");
    
    if (validFields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one field",
        variant: "destructive",
      });
      return;
    }

    updateSchemaMutation.mutate(validFields);
  };

  const getFieldTypeColor = (fieldType: string) => {
    const colorMap: Record<string, string> = {
      STRING: "bg-blue-100 text-blue-800",
      INTEGER: "bg-green-100 text-green-800",
      FLOAT: "bg-green-100 text-green-800",
      BOOLEAN: "bg-purple-100 text-purple-800",
      DATE: "bg-orange-100 text-orange-800",
      DATETIME: "bg-orange-100 text-orange-800",
      TIMESTAMP: "bg-orange-100 text-orange-800",
      GEOGRAPHY: "bg-red-100 text-red-800",
      JSON: "bg-gray-100 text-gray-800",
    };
    
    return colorMap[fieldType] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading schema...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>BigQuery Schema Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Schema Fields</h4>
              <p className="text-sm text-gray-600">
                {schemaType === "auto" 
                  ? "Schema was auto-detected from shapefile attributes"
                  : "Define custom schema fields"}
              </p>
            </div>
            <Button onClick={addField} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No schema fields defined. Click "Add Field" to start.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                  <div className="col-span-4">Field Name</div>
                  <div className="col-span-3">Data Type</div>
                  <div className="col-span-2">Mode</div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <div key={index} className="px-4 py-3">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <Input
                          value={field.fieldName}
                          onChange={(e) => updateField(index, { fieldName: e.target.value })}
                          placeholder="field_name"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <Select
                          value={field.fieldType}
                          onValueChange={(value) => updateField(index, { fieldType: value })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Select
                          value={field.mode}
                          onValueChange={(value) => updateField(index, { mode: value })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_MODES.map((mode) => (
                              <SelectItem key={mode} value={mode}>
                                {mode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Badge
                          variant={field.isAutoDetected ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {field.isAutoDetected ? "Auto" : "Manual"}
                        </Badge>
                      </div>

                      <div className="col-span-1">
                        <Button
                          onClick={() => removeField(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setFields(schemaData || [])}
            >
              Reset
            </Button>
            <Button
              onClick={handleSaveSchema}
              disabled={updateSchemaMutation.isPending}
            >
              {updateSchemaMutation.isPending ? "Saving..." : "Save Schema"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Schema Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-600 mb-2">BigQuery Schema:</div>
              <div className="space-y-1">
                {fields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-blue-600">{field.fieldName}</span>
                    <span className="text-gray-500">:</span>
                    <Badge className={getFieldTypeColor(field.fieldType)} variant="secondary">
                      {field.fieldType}
                    </Badge>
                    <span className="text-gray-400">({field.mode})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
