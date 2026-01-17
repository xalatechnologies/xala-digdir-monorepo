/**
 * AI Seed Generator Page
 * 
 * Generate production-ready seed data using AI (OpenAI, Claude, etc.)
 */

import { useState } from 'react';
import {
  Heading,
  Paragraph,
  Button,
  Select,
  TextField,
  TextArea,
  Card,
  Spinner,
  CodeBlock,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useToast } from '../../providers/ToastProvider';
import { aiSeedGeneratorService } from '../../services/ai-seed-generator.service';
import { jsonToSqlService } from '../../services/json-to-sql.service';
import styles from './AISeedGenerator.module.css';

export type EntityType = 'rental_object' | 'user' | 'amenity' | 'addon' | 'booking';

export function AISeedGeneratorPage() {
  const t = useT();
  const { toast } = useToast();
  
  const [entityType, setEntityType] = useState<EntityType>('rental_object');
  const [count, setCount] = useState<number>(10);
  const [tenantId, setTenantId] = useState<string>('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [generatedSQL, setGeneratedSQL] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'json' | 'sql'>('json');
  
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const seeds = await aiSeedGeneratorService.generateSeeds({
        entityType,
        count,
        tenantId,
        prompt: customPrompt,
      });
      
      setGeneratedData(seeds);
      
      // Convert to SQL
      const sql = await jsonToSqlService.convertToSQL(entityType, seeds);
      setGeneratedSQL(sql);
      
      toast.success({
        title: 'Seeds Generated!',
        description: `Generated ${seeds.length} ${entityType} seeds successfully`,
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      toast.error({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate seeds. Check API key and try again.',
      });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(generatedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-seeds-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadSQL = () => {
    const blob = new Blob([generatedSQL], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-seeds-${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading level={1} data-size="lg">
          🤖 AI Seed Generator
        </Heading>
        <Paragraph>
          Generate production-ready seed data using AI. Seeds are validated against database schema
          and ready to import.
        </Paragraph>
      </div>
      
      {/* Configuration Form */}
      <Card className={styles.configCard}>
        <Heading level={2} data-size="md">
          Configuration
        </Heading>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="entityType">Entity Type</label>
            <Select
              id="entityType"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
            >
              <option value="rental_object">Rental Objects (Lokaler/Utstyr)</option>
              <option value="user">Users (Brukere)</option>
              <option value="amenity">Amenities (Fasiliteter)</option>
              <option value="addon">Add-ons (Tilleggstjenester)</option>
              <option value="booking">Bookings (Bookinger)</option>
            </Select>
            <Paragraph data-size="xs" className={styles.helpText}>
              Choose what type of data to generate
            </Paragraph>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="count">Count</label>
            <TextField
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            />
            <Paragraph data-size="xs" className={styles.helpText}>
              How many items to generate (1-100)
            </Paragraph>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="tenantId">Tenant ID</label>
            <Select
              id="tenantId"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              <option value="f47ac10b-58cc-4372-a567-0e02b2c3d479">Skien Kommune</option>
              <option value="a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d">Porsgrunn Kommune</option>
              <option value="b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e">Bamble Kommune</option>
            </Select>
            <Paragraph data-size="xs" className={styles.helpText}>
              Which tenant to generate data for
            </Paragraph>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="customPrompt">Custom Instructions (optional)</label>
          <TextArea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., 'Generate diverse sports facilities across different Norwegian cities with realistic pricing'"
            rows={4}
          />
          <Paragraph data-size="xs" className={styles.helpText}>
            Add specific instructions for AI to follow
          </Paragraph>
        </div>
        
        <div className={styles.actions}>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="primary"
            size="lg"
          >
            {generating ? (
              <>
                <Spinner size="sm" /> Generating...
              </>
            ) : (
              <>🚀 Generate Seeds</>
            )}
          </Button>
        </div>
      </Card>
      
      {/* Results */}
      {generatedData.length > 0 && (
        <Card className={styles.resultsCard}>
          <div className={styles.resultsHeader}>
            <Heading level={2} data-size="md">
              Generated {generatedData.length} {entityType} seeds
            </Heading>
            <div className={styles.resultActions}>
              <Button onClick={handleDownloadJSON} variant="outline" size="sm">
                📥 Download JSON
              </Button>
              <Button onClick={handleDownloadSQL} variant="outline" size="sm">
                📥 Download SQL
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'json' | 'sql')}>
            <TabsList>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="sql">SQL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className={styles.tabContent}>
              <CodeBlock
                language="json"
                code={JSON.stringify(generatedData, null, 2)}
                maxHeight="600px"
              />
            </TabsContent>
            
            <TabsContent value="sql" className={styles.tabContent}>
              <CodeBlock
                language="sql"
                code={generatedSQL}
                maxHeight="600px"
              />
            </TabsContent>
          </Tabs>
        </Card>
      )}
      
      {/* Schema Reference */}
      <Card className={styles.schemaCard}>
        <Heading level={3} data-size="sm">
          📋 Schema Reference
        </Heading>
        <Paragraph data-size="sm">
          AI generates data based on <code>complete-database-schema.json</code> (217 tables, 1303 columns).
          All generated data is validated before display.
        </Paragraph>
        <Paragraph data-size="sm">
          <strong>Powered by:</strong> OpenAI GPT-4 Turbo
        </Paragraph>
      </Card>
    </div>
  );
}
