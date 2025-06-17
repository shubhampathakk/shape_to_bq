
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
    <Card data-id="q7ajpjvs2" data-path="src/components/schema/SchemaDefinition.tsx">
      <CardHeader data-id="pvgamq7o2" data-path="src/components/schema/SchemaDefinition.tsx">
        <CardTitle className="flex items-center space-x-2" data-id="papmk8exo" data-path="src/components/schema/SchemaDefinition.tsx">
          <Settings className="h-5 w-5" data-id="0aw4bqymb" data-path="src/components/schema/SchemaDefinition.tsx" />
          <span data-id="mlu8tr6kz" data-path="src/components/schema/SchemaDefinition.tsx">Schema Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6" data-id="eq8e7qmpo" data-path="src/components/schema/SchemaDefinition.tsx">
        <div className="flex items-center justify-between" data-id="o6jtdwd65" data-path="src/components/schema/SchemaDefinition.tsx">
          <div className="space-y-1" data-id="9mjtgv0xx" data-path="src/components/schema/SchemaDefinition.tsx">
            <Label htmlFor="auto-detect" data-id="vsiue5dqu" data-path="src/components/schema/SchemaDefinition.tsx">Auto-detect Schema</Label>
            <p className="text-sm text-gray-500" data-id="lm2hrxfz3" data-path="src/components/schema/SchemaDefinition.tsx">
              Automatically infer schema from the shapefile
            </p>
          </div>
          <Switch
            id="auto-detect"
            checked={autoDetectSchema}
            onCheckedChange={onAutoDetectChange}
            disabled={disabled} data-id="ssoqp58hh" data-path="src/components/schema/SchemaDefinition.tsx" />

        </div>

        {!autoDetectSchema &&
        <div className="space-y-4" data-id="ffykpgsc9" data-path="src/components/schema/SchemaDefinition.tsx">
            <div data-id="47bhj9e9w" data-path="src/components/schema/SchemaDefinition.tsx">
              <Label data-id="ln31zr53s" data-path="src/components/schema/SchemaDefinition.tsx">Custom Schema Definition</Label>
              <p className="text-sm text-gray-500 mb-2" data-id="taixanm2g" data-path="src/components/schema/SchemaDefinition.tsx">
                Define the BigQuery table schema manually
              </p>
              
              {customSchema.length > 0 &&
            <div className="space-y-2 mb-4" data-id="vjx754h9e" data-path="src/components/schema/SchemaDefinition.tsx">
                  {customSchema.map((field, index) =>
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded" data-id="8bzhpg14t" data-path="src/components/schema/SchemaDefinition.tsx">
                      <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => updateField(index, { ...field, name: e.target.value })}
                  className="flex-1" data-id="t08u7x7s4" data-path="src/components/schema/SchemaDefinition.tsx" />

                      <select
                  value={field.type}
                  onChange={(e) => updateField(index, { ...field, type: e.target.value as any })}
                  className="px-2 py-1 border rounded text-sm" data-id="g0h1cn2kd" data-path="src/components/schema/SchemaDefinition.tsx">

                        <option value="STRING" data-id="jr46p6gj6" data-path="src/components/schema/SchemaDefinition.tsx">STRING</option>
                        <option value="INTEGER" data-id="3zrdpr2mv" data-path="src/components/schema/SchemaDefinition.tsx">INTEGER</option>
                        <option value="FLOAT" data-id="teopyocnz" data-path="src/components/schema/SchemaDefinition.tsx">FLOAT</option>
                        <option value="BOOLEAN" data-id="iqzwbhb1n" data-path="src/components/schema/SchemaDefinition.tsx">BOOLEAN</option>
                        <option value="TIMESTAMP" data-id="n5l1nul9w" data-path="src/components/schema/SchemaDefinition.tsx">TIMESTAMP</option>
                        <option value="GEOGRAPHY" data-id="l6n4x3xu6" data-path="src/components/schema/SchemaDefinition.tsx">GEOGRAPHY</option>
                      </select>
                      <select
                  value={field.mode}
                  onChange={(e) => updateField(index, { ...field, mode: e.target.value as any })}
                  className="px-2 py-1 border rounded text-sm" data-id="6e622g88f" data-path="src/components/schema/SchemaDefinition.tsx">

                        <option value="NULLABLE" data-id="1jpbymh1c" data-path="src/components/schema/SchemaDefinition.tsx">NULLABLE</option>
                        <option value="REQUIRED" data-id="xpykfradf" data-path="src/components/schema/SchemaDefinition.tsx">REQUIRED</option>
                        <option value="REPEATED" data-id="i7uijt4j4" data-path="src/components/schema/SchemaDefinition.tsx">REPEATED</option>
                      </select>
                      <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(index)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700" data-id="o8bguebr0" data-path="src/components/schema/SchemaDefinition.tsx">

                        <X className="h-4 w-4" data-id="my5wc747n" data-path="src/components/schema/SchemaDefinition.tsx" />
                      </Button>
                    </div>
              )}
                </div>
            }

              <div className="flex items-center space-x-2" data-id="46yjh5ces" data-path="src/components/schema/SchemaDefinition.tsx">
                <Input
                placeholder="Field name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="flex-1" data-id="xtrl3rukd" data-path="src/components/schema/SchemaDefinition.tsx" />

                <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                className="px-2 py-1 border rounded text-sm" data-id="8efng16zm" data-path="src/components/schema/SchemaDefinition.tsx">

                  <option value="STRING" data-id="h5glp7gqh" data-path="src/components/schema/SchemaDefinition.tsx">STRING</option>
                  <option value="INTEGER" data-id="izm47nkjf" data-path="src/components/schema/SchemaDefinition.tsx">INTEGER</option>
                  <option value="FLOAT" data-id="scjal87ep" data-path="src/components/schema/SchemaDefinition.tsx">FLOAT</option>
                  <option value="BOOLEAN" data-id="81dooslar" data-path="src/components/schema/SchemaDefinition.tsx">BOOLEAN</option>
                  <option value="TIMESTAMP" data-id="smi961c2w" data-path="src/components/schema/SchemaDefinition.tsx">TIMESTAMP</option>
                  <option value="GEOGRAPHY" data-id="5jh6cjhc3" data-path="src/components/schema/SchemaDefinition.tsx">GEOGRAPHY</option>
                </select>
                <Button onClick={addField} size="sm" data-id="eka89puom" data-path="src/components/schema/SchemaDefinition.tsx">
                  <Plus className="h-4 w-4" data-id="g0ld27fci" data-path="src/components/schema/SchemaDefinition.tsx" />
                </Button>
              </div>

              <Alert className="mt-4" data-id="ejpheniab" data-path="src/components/schema/SchemaDefinition.tsx">
                <Info className="h-4 w-4" data-id="bvj06jtgw" data-path="src/components/schema/SchemaDefinition.tsx" />
                <AlertDescription data-id="geed9bt3a" data-path="src/components/schema/SchemaDefinition.tsx">
                  <strong data-id="u3zg30x8y" data-path="src/components/schema/SchemaDefinition.tsx">Example schema:</strong>
                  <details className="mt-2" data-id="4do2f02yi" data-path="src/components/schema/SchemaDefinition.tsx">
                    <summary className="cursor-pointer text-sm font-medium" data-id="90cw13k42" data-path="src/components/schema/SchemaDefinition.tsx">
                      Click to see example
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto" data-id="euw53zhff" data-path="src/components/schema/SchemaDefinition.tsx">
                      {exampleSchema}
                    </pre>
                  </details>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        }

        <div className="space-y-2" data-id="8mnlpkt6w" data-path="src/components/schema/SchemaDefinition.tsx">
          <Label htmlFor="integer-columns" data-id="4tohkdmlw" data-path="src/components/schema/SchemaDefinition.tsx">Integer Columns (Optional)</Label>
          <Input
            id="integer-columns"
            placeholder="column1|column2|column3"
            value={integerColumns}
            onChange={(e) => onIntegerColumnsChange(e.target.value)}
            disabled={disabled} data-id="wtf8wuxy2" data-path="src/components/schema/SchemaDefinition.tsx" />

          <p className="text-sm text-gray-500" data-id="f93tdhi41" data-path="src/components/schema/SchemaDefinition.tsx">
            Pipe-separated list of columns to convert from string to integer
          </p>
        </div>
      </CardContent>
    </Card>);

};

export default SchemaDefinition;