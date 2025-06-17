
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SchemaField } from '@/types';
import { Settings, Plus, X, Info } from 'lucide-react';

interface SchemaDefinitionProps {
  autoDetectSchema: boolean;
  onAutoDetectChange: (enabled: boolean) => void;
  customSchema: SchemaField[];
  onCustomSchemaChange: (schema: SchemaField[]) => void;
  integerColumns: string;
  onIntegerColumnsChange: (columns: string) => void;
  disabled?: boolean;
}

const SchemaDefinition: React.FC<SchemaDefinitionProps> = ({
  autoDetectSchema,
  onAutoDetectChange,
  customSchema,
  onCustomSchemaChange,
  integerColumns,
  onIntegerColumnsChange,
  disabled = false
}) => {
  const [newField, setNewField] = useState<SchemaField>({
    name: '',
    type: 'STRING',
    mode: 'NULLABLE'
  });

  const addField = () => {
    if (newField.name.trim()) {
      onCustomSchemaChange([...customSchema, { ...newField }]);
      setNewField({ name: '', type: 'STRING', mode: 'NULLABLE' });
    }
  };

  const removeField = (index: number) => {
    const updated = customSchema.filter((_, i) => i !== index);
    onCustomSchemaChange(updated);
  };

  const updateField = (index: number, field: SchemaField) => {
    const updated = [...customSchema];
    updated[index] = field;
    onCustomSchemaChange(updated);
  };

  const exampleSchema = `[
  {
    "name": "geometry",
    "type": "GEOGRAPHY",
    "mode": "REQUIRED"
  },
  {
    "name": "id",
    "type": "INTEGER",
    "mode": "REQUIRED"
  },
  {
    "name": "name",
    "type": "STRING",
    "mode": "NULLABLE"
  },
  {
    "name": "population",
    "type": "INTEGER", 
    "mode": "NULLABLE"
  }
]`;

  return (
    <Card data-id="m2i5cgrwn" data-path="src/components/schema/SchemaDefinition.tsx">
      <CardHeader data-id="mlw7kfj9b" data-path="src/components/schema/SchemaDefinition.tsx">
        <CardTitle className="flex items-center space-x-2" data-id="9hqrmwa3p" data-path="src/components/schema/SchemaDefinition.tsx">
          <Settings className="h-5 w-5" data-id="uc3x0a5vs" data-path="src/components/schema/SchemaDefinition.tsx" />
          <span data-id="93eiqo55p" data-path="src/components/schema/SchemaDefinition.tsx">Schema Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6" data-id="5ex49bd0c" data-path="src/components/schema/SchemaDefinition.tsx">
        <div className="flex items-center justify-between" data-id="6uo9frleo" data-path="src/components/schema/SchemaDefinition.tsx">
          <div className="space-y-1" data-id="08kdjf9g0" data-path="src/components/schema/SchemaDefinition.tsx">
            <Label htmlFor="auto-detect" data-id="ketd0xo4z" data-path="src/components/schema/SchemaDefinition.tsx">Auto-detect Schema</Label>
            <p className="text-sm text-gray-500" data-id="j8sba8xkn" data-path="src/components/schema/SchemaDefinition.tsx">
              Automatically infer schema from the shapefile
            </p>
          </div>
          <Switch
            id="auto-detect"
            checked={autoDetectSchema}
            onCheckedChange={onAutoDetectChange}
            disabled={disabled} data-id="e3ese7yfa" data-path="src/components/schema/SchemaDefinition.tsx" />

        </div>

        {!autoDetectSchema &&
        <div className="space-y-4" data-id="rct8rimt3" data-path="src/components/schema/SchemaDefinition.tsx">
            <div data-id="zvl2f04w1" data-path="src/components/schema/SchemaDefinition.tsx">
              <Label data-id="i5y4fw5gb" data-path="src/components/schema/SchemaDefinition.tsx">Custom Schema Definition</Label>
              <p className="text-sm text-gray-500 mb-2" data-id="tbwe6b17m" data-path="src/components/schema/SchemaDefinition.tsx">
                Define the BigQuery table schema manually
              </p>
              
              {customSchema.length > 0 &&
            <div className="space-y-2 mb-4" data-id="ifw2e4nnq" data-path="src/components/schema/SchemaDefinition.tsx">
                  {customSchema.map((field, index) =>
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded" data-id="ayn9aeje2" data-path="src/components/schema/SchemaDefinition.tsx">
                      <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => updateField(index, { ...field, name: e.target.value })}
                  className="flex-1" data-id="grhjvon93" data-path="src/components/schema/SchemaDefinition.tsx" />

                      <select
                  value={field.type}
                  onChange={(e) => updateField(index, { ...field, type: e.target.value as any })}
                  className="px-2 py-1 border rounded text-sm" data-id="n8du3au9e" data-path="src/components/schema/SchemaDefinition.tsx">

                        <option value="STRING" data-id="ioplzm2it" data-path="src/components/schema/SchemaDefinition.tsx">STRING</option>
                        <option value="INTEGER" data-id="d2o6ai2vu" data-path="src/components/schema/SchemaDefinition.tsx">INTEGER</option>
                        <option value="FLOAT" data-id="mtebr86a4" data-path="src/components/schema/SchemaDefinition.tsx">FLOAT</option>
                        <option value="BOOLEAN" data-id="dpsu4l1pl" data-path="src/components/schema/SchemaDefinition.tsx">BOOLEAN</option>
                        <option value="TIMESTAMP" data-id="wju1byknj" data-path="src/components/schema/SchemaDefinition.tsx">TIMESTAMP</option>
                        <option value="GEOGRAPHY" data-id="6qs1lxbfx" data-path="src/components/schema/SchemaDefinition.tsx">GEOGRAPHY</option>
                      </select>
                      <select
                  value={field.mode}
                  onChange={(e) => updateField(index, { ...field, mode: e.target.value as any })}
                  className="px-2 py-1 border rounded text-sm" data-id="2ir915apx" data-path="src/components/schema/SchemaDefinition.tsx">

                        <option value="NULLABLE" data-id="8okvwrl4v" data-path="src/components/schema/SchemaDefinition.tsx">NULLABLE</option>
                        <option value="REQUIRED" data-id="dymkysfix" data-path="src/components/schema/SchemaDefinition.tsx">REQUIRED</option>
                        <option value="REPEATED" data-id="eohlr00yh" data-path="src/components/schema/SchemaDefinition.tsx">REPEATED</option>
                      </select>
                      <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(index)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700" data-id="cvbvbpi6a" data-path="src/components/schema/SchemaDefinition.tsx">

                        <X className="h-4 w-4" data-id="1odd38rzr" data-path="src/components/schema/SchemaDefinition.tsx" />
                      </Button>
                    </div>
              )}
                </div>
            }

              <div className="flex items-center space-x-2" data-id="0wrnkcsau" data-path="src/components/schema/SchemaDefinition.tsx">
                <Input
                placeholder="Field name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="flex-1" data-id="6dr3ntxkv" data-path="src/components/schema/SchemaDefinition.tsx" />

                <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                className="px-2 py-1 border rounded text-sm" data-id="34oajq2ma" data-path="src/components/schema/SchemaDefinition.tsx">

                  <option value="STRING" data-id="1g3267vjd" data-path="src/components/schema/SchemaDefinition.tsx">STRING</option>
                  <option value="INTEGER" data-id="vxgwt84nn" data-path="src/components/schema/SchemaDefinition.tsx">INTEGER</option>
                  <option value="FLOAT" data-id="vcemo0kpt" data-path="src/components/schema/SchemaDefinition.tsx">FLOAT</option>
                  <option value="BOOLEAN" data-id="zx2xop1kc" data-path="src/components/schema/SchemaDefinition.tsx">BOOLEAN</option>
                  <option value="TIMESTAMP" data-id="wvtodwkd4" data-path="src/components/schema/SchemaDefinition.tsx">TIMESTAMP</option>
                  <option value="GEOGRAPHY" data-id="ze87cyxmp" data-path="src/components/schema/SchemaDefinition.tsx">GEOGRAPHY</option>
                </select>
                <Button onClick={addField} size="sm" data-id="3hqpt4qdx" data-path="src/components/schema/SchemaDefinition.tsx">
                  <Plus className="h-4 w-4" data-id="30bqj9wo7" data-path="src/components/schema/SchemaDefinition.tsx" />
                </Button>
              </div>

              <Alert className="mt-4" data-id="bfdssx3hs" data-path="src/components/schema/SchemaDefinition.tsx">
                <Info className="h-4 w-4" data-id="0xmale49w" data-path="src/components/schema/SchemaDefinition.tsx" />
                <AlertDescription data-id="q7wiikbx9" data-path="src/components/schema/SchemaDefinition.tsx">
                  <strong data-id="jyh722quz" data-path="src/components/schema/SchemaDefinition.tsx">Example schema:</strong>
                  <details className="mt-2" data-id="wahiej4mc" data-path="src/components/schema/SchemaDefinition.tsx">
                    <summary className="cursor-pointer text-sm font-medium" data-id="faoz625a7" data-path="src/components/schema/SchemaDefinition.tsx">
                      Click to see example
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto" data-id="9sskuk3ks" data-path="src/components/schema/SchemaDefinition.tsx">
                      {exampleSchema}
                    </pre>
                  </details>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        }

        <div className="space-y-2" data-id="wdztqa6b6" data-path="src/components/schema/SchemaDefinition.tsx">
          <Label htmlFor="integer-columns" data-id="bxvecks6w" data-path="src/components/schema/SchemaDefinition.tsx">Integer Columns (Optional)</Label>
          <Input
            id="integer-columns"
            placeholder="column1|column2|column3"
            value={integerColumns}
            onChange={(e) => onIntegerColumnsChange(e.target.value)}
            disabled={disabled} data-id="ztk78wsq3" data-path="src/components/schema/SchemaDefinition.tsx" />

          <p className="text-sm text-gray-500" data-id="8jsqu2r3v" data-path="src/components/schema/SchemaDefinition.tsx">
            Pipe-separated list of columns to convert from string to integer
          </p>
        </div>
      </CardContent>
    </Card>);

};

export default SchemaDefinition;