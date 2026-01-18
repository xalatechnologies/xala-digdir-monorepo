/**
 * Seed Data Management Page
 * Comprehensive UI for importing and managing seed data
 * 
 * Features:
 * - Drag & drop JSON file upload
 * - Real-time validation
 * - Data preview with statistics
 * - Category filtering
 * - Progress tracking
 * - Success/error reporting
 */

import { useState, useCallback } from 'react';
import {  
  Heading,
  Paragraph,
  Card,
  Button,
  Alert,
  Chip,
  ProgressBar
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  type SeedData,
  type ImportProgress,
  type ImportResult,
  loadSeedDataFromFile,
  importSeedData,
  getSeedDataStats,
  validateSeedData
} from '../../services/seed-data.service';

type Step = 'upload' | 'preview' | 'importing' | 'complete';

export function SeedDataManagementPage() {
  const t = useT();
  const [step, setStep] = useState<Step>('upload');
  const [seedData, setSeedData] = useState<SeedData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Handle file drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  }, []);

  // Process uploaded file
  const handleFile = async (file: File) => {
    try {
      setValidationErrors([]);
      const data = await loadSeedDataFromFile(file);
      const validation = validateSeedData(data);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }

      setSeedData(data);
      setStep('preview');
    } catch (error) {
      setValidationErrors([error.message]);
    }
  };

  // Start import process
  const handleImport = async () => {
    if (!seedData) return;

    setStep('importing');
    setProgress({
      stage: 'validating',
      current: 0,
      total: 100,
      message: t('common.starting_import')
    });

    const importResult = await importSeedData(seedData, (progress) => {
      setProgress(progress);
    });

    setResult(importResult);
    setStep('complete');
  };

  // Reset to upload  
  const handleReset = () => {
    setStep('upload');
    setSeedData(null);
    setValidationErrors([]);
    setProgress(null);
    setResult(null);
    setSelectedCategory(null);
  };

  // Get filtered rental objects
  const getFilteredObjects = () => {
    if (!seedData) return [];
    if (!selectedCategory) return seedData.rental_objects;
    return seedData.rental_objects.filter(obj => obj.category_key === selectedCategory);
  };

  const stats = seedData ? getSeedDataStats(seedData) : null;
  const filteredObjects = getFilteredObjects();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('saasAdmin.seedData.title')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('saasAdmin.seedData.description')}
        </Paragraph>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            Upload Seed Data
          </Heading>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--ds-color-brand-default)' : 'var(--ds-color-neutral-border-subtle)'}`,
              borderRadius: 'var(--ds-border-radius-lg)',
              padding: 'var(--ds-spacing-12)',
              textAlign: 'center',
              backgroundColor: dragActive ? 'var(--ds-color-brand-surface-hover)' : 'var(--ds-color-neutral-surface-default)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: 'var(--ds-spacing-4)' }}>📁</div>
            <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Drag & Drop JSON File
            </Heading>
            <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              or click to browse
            </Paragraph>
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button as="span">
                t('actions.choose_file')
              </Button>
            </label>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert severity="error" style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                Validation Errors
              </Heading>
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Info */}
          <Alert severity="info" style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Paragraph>
              Expected format: rental-objects-comprehensive.json (70 objects, users, organizations)
            </Paragraph>
          </Alert>
        </Card>
      )}

      {/* Preview Step */}
      {step === 'preview' && seedData && stats && (
        <>
          {/* Statistics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--ds-spacing-4)',
            marginBottom: 'var(--ds-spacing-6)'
          }}>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>
                Total Objects
              </Paragraph>
              <Heading level={2} size="lg">{stats.total_objects}</Heading>
            </Card>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>
                Users
              </Paragraph>
              <Heading level={2} size="lg">{stats.total_users}</Heading>
            </Card>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>
                Images
              </Paragraph>
              <Heading level={2} size="lg">{stats.total_images}</Heading>
            </Card>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>
                With Pricing
              </Paragraph>
              <Heading level={2} size="lg">{stats.objects_with_pricing}</Heading>
            </Card>
          </div>

          {/* Category Filter */}
          <Card style={{ padding: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-4)' }}>
            <Paragraph style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-2)' }}>
              Filter by Category
            </Paragraph>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
              <Chip
                selected={selectedCategory === null}
                onClick={() => setSelectedCategory(null)}
              >
                All ({stats.total_objects})
              </Chip>
              {Object.entries(stats.categories).map(([category, count]) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace(/_/g, ' ')} ({count})
                </Chip>
              ))}
            </div>
          </Card>

          {/* Objects Preview */}
          <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Preview ({filteredObjects.length} objects)
            </Heading>
            <div style={{ 
              display: 'grid', 
              gap: 'var(--ds-spacing-3)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {filteredObjects.slice(0, 10).map((obj) => (
                <div 
                  key={obj.id}
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    gap: 'var(--ds-spacing-3)'
                  }}
                >
                  {obj.images[0] && (
                    <img 
                      src={obj.images[0].thumbnail} 
                      alt={obj.images[0].alt}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover',
                        borderRadius: 'var(--ds-border-radius-sm)'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <Paragraph style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>
                      {obj.name}
                    </Paragraph>
                    <Paragraph style={{ 
                      fontSize: 'var(--ds-font-size-sm)', 
                      color: 'var(--ds-color-neutral-text-subtle)',
                      marginBottom: 'var(--ds-spacing-1)'
                    }}>
                      {obj.metadata.address.city} • {obj.capacity} capacity
                    </Paragraph>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <Chip size="sm">{obj.category_key.replace(/_/g, ' ')}</Chip>
                      <Chip size="sm">{obj.images.length} images</Chip>
                      <Chip size="sm">{obj.pricing.base_price} {obj.pricing.currency}</Chip>
                    </div>
                  </div>
                </div>
              ))}
              {filteredObjects.length > 10 && (
                <Paragraph style={{ textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  ... and {filteredObjects.length - 10} more
                </Paragraph>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={handleReset}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import {stats.total_objects} Objects
            </Button>
          </div>
        </>
      )}

      {/* Importing Step */}
      {step === 'importing' && progress && (
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            Importing Seed Data...
          </Heading>
          
          <ProgressBar 
            value={progress.current} 
            max={progress.total}
            style={{ marginBottom: 'var(--ds-spacing-4)' }}
          />
          
          <Paragraph style={{ textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {progress.message}
          </Paragraph>
          
          <Paragraph style={{ textAlign: 'center', fontWeight: 600, marginTop: 'var(--ds-spacing-2)' }}>
            {progress.current} / {progress.total}
          </Paragraph>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && result && (
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {result.success ? '✅ Import Complete!' : '⚠️ Import Completed with Errors'}
          </Heading>

          {/* Success Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-4)'
          }}>
            <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-3)' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                Tenants
              </Paragraph>
              <Heading level={3} size="md">{result.imported.tenants}</Heading>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-3)' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                Organizations
              </Paragraph>
              <Heading level={3} size="md">{result.imported.organizations}</Heading>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-3)' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                Users
              </Paragraph>
              <Heading level={3} size="md">{result.imported.users}</Heading>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-3)' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                Rental Objects
              </Paragraph>
              <Heading level={3} size="md">{result.imported.rental_objects}</Heading>
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <Alert severity="warning" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                {result.errors.length} Errors
              </Heading>
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', maxHeight: '200px', overflowY: 'auto' }}>
                {result.errors.map((error, i) => (
                  <li key={i}>
                    <strong>{error.type}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'center' }}>
            <Button onClick={handleReset}>
              t('actions.import_more_data')
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
