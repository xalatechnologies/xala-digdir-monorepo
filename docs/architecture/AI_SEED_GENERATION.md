# 🤖 AI SEED GENERATION ARCHITECTURE

**Purpose:** Enable saas-admin to generate, edit, and manage seed data using AI  
**Date:** 2026-01-17  
**Status:** Design Document

---

## 🎯 Overview

The Seed Management System allows administrators to:
1. **Generate** seed data using AI (GPT-4, Claude, etc.)
2. **Edit** existing seed data through UI forms
3. **Preview** SQL output before applying
4. **Export/Import** seed data as JSON
5. **Version control** seed data changes

---

## 📁 Architecture

### Directory Structure
```
apps/saas-admin/
├── src/
│   ├── features/
│   │   └── seed-management/
│   │       ├── components/
│   │       │   ├── SeedGenerator.tsx        # AI seed generator UI
│   │       │   ├── SeedEditor.tsx           # JSON/Form editor
│   │       │   ├── SeedPreview.tsx          # SQL preview
│   │       │   └── SeedImportExport.tsx     # Import/Export UI
│   │       ├── services/
│   │       │   ├── ai-generator.service.ts  # AI integration
│   │       │   ├── json-to-sql.service.ts   # JSON → SQL converter
│   │       │   └── validation.service.ts    # JSON schema validation
│   │       └── types/
│   │           └── seed-types.ts            # TypeScript types
│   └── lib/
│       └── seed-schemas/                    # JSON schemas
│
apps/api/
├── db/
│   └── seeds/
│       ├── schemas/
│       │   └── seed-data-schema.json        # Master schema
│       ├── json/                            # JSON seed sources
│       │   ├── tenants.json
│       │   ├── users.json
│       │   ├── rental-objects.json
│       │   ├── amenities.json
│       │   ├── addons.json
│       │   └── bookings.json
│       ├── generators/                      # SQL generators
│       │   ├── generate_platform.py
│       │   ├── generate_rental_objects.py
│       │   └── generate_all.py
│       └── sql/                             # Generated SQL
│           ├── 02_domain_catalog.sql
│           ├── 03_domain_rental_objects.sql
│           └── ...
```

---

## 🔧 Components

### 1. AI Seed Generator Service

```typescript
// apps/saas-admin/src/features/seed-management/services/ai-generator.service.ts

export interface AIGeneratorConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
}

export interface GenerateRequest {
  entityType: 'rental_object' | 'user' | 'amenity' | 'booking';
  count: number;
  tenantId: string;
  prompt?: string; // Custom instructions
  baseTemplate?: any; // Template to vary from
}

export class AISeedGeneratorService {
  /**
   * Generate seed data using AI
   */
  async generateSeeds(request: GenerateRequest): Promise<any[]> {
    const schema = await this.getSchemaForEntity(request.entityType);
    const prompt = this.buildPrompt(request, schema);
    
    // Call AI API
    const response = await this.callAI(prompt, request.count);
    
    // Validate against JSON schema
    const validated = this.validateSeeds(response, schema);
    
    return validated;
  }
  
  /**
   * Build AI prompt with schema and examples
   */
  private buildPrompt(request: GenerateRequest, schema: any): string {
    return `
Generate ${request.count} realistic ${request.entityType} seed data for a Norwegian booking platform.

JSON Schema:
${JSON.stringify(schema, null, 2)}

Requirements:
- All IDs must be valid UUIDs
- Use Norwegian names, addresses, and text
- Follow the exact schema structure
- Ensure referential integrity (valid tenant/org IDs)
- Be realistic and diverse

${request.prompt ? `Additional instructions: ${request.prompt}` : ''}

${request.baseTemplate ? `Base template to vary from:\n${JSON.stringify(request.baseTemplate, null, 2)}` : ''}

Return ONLY valid JSON array, no explanations.
`;
  }
  
  /**
   * Call AI provider
   */
  private async callAI(prompt: string, count: number): Promise<any[]> {
    // OpenAI example
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a seed data generator for a Norwegian booking platform. Output only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    return JSON.parse(content);
  }
  
  /**
   * Validate seeds against JSON schema
   */
  private validateSeeds(seeds: any[], schema: any): any[] {
    const Ajv = require('ajv');
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    
    const validSeeds = seeds.filter(seed => {
      const valid = validate(seed);
      if (!valid) {
        console.warn('Invalid seed:', validate.errors);
      }
      return valid;
    });
    
    return validSeeds;
  }
}
```

---

### 2. JSON to SQL Converter

```typescript
// apps/saas-admin/src/features/seed-management/services/json-to-sql.service.ts

export class JsonToSqlConverterService {
  /**
   * Convert rental objects JSON to SQL
   */
  async convertRentalObjectsToSQL(objects: any[]): Promise<string> {
    let sql = `-- Generated: ${new Date().toISOString()}\n`;
    sql += `BEGIN;\n\n`;
    
    // Core rental objects
    sql += this.generateRentalObjectsInsert(objects);
    
    // Media
    sql += this.generateMediaInsert(objects);
    
    // Amenities
    sql += this.generateAmenitiesInsert(objects);
    
    // Pricing
    sql += this.generatePricingInsert(objects);
    
    // Opening hours
    sql += this.generateOpeningHoursInsert(objects);
    
    sql += `\nCOMMIT;\n`;
    
    return sql;
  }
  
  private generateRentalObjectsInsert(objects: any[]): string {
    let sql = `INSERT INTO domain.rental_objects (\n`;
    sql += `  id, tenant_id, organization_id, category_key, type_code,\n`;
    sql += `  time_mode, status, title, slug, description, capacity,\n`;
    sql += `  address, postal_code, city, country, published_at, is_active\n`;
    sql += `) VALUES\n`;
    
    const values = objects.map((obj, i) => {
      const comma = i < objects.length - 1 ? ',' : '';
      return `  ('${obj.id}', '${obj.tenantId}', '${obj.organizationId}',
   '${obj.categoryKey}', 'SPACE', 'PERIOD', 'PUBLISHED',
   '${this.escape(obj.name)}', '${obj.slug}',
   '${this.escape(obj.description)}', ${obj.capacity},
   '${this.escape(obj.metadata.location.address)}', 
   '${obj.metadata.location.postalCode}', 
   '${obj.metadata.location.city}', 'Norway',
   NOW() - INTERVAL '${40 - i} days', true)${comma}`;
    });
    
    sql += values.join('\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;\n\n`;
    
    return sql;
  }
  
  private escape(str: string): string {
    return str.replace(/'/g, "''");
  }
  
  // ... other generator methods
}
```

---

### 3. Seed Management UI Components

```tsx
// apps/saas-admin/src/features/seed-management/components/SeedGenerator.tsx

import { useState } from 'react';
import { AISeedGeneratorService } from '../services/ai-generator.service';

export function SeedGenerator() {
  const [entityType, setEntityType] = useState<string>('rental_object');
  const [count, setCount] = useState<number>(10);
  const [prompt, setPrompt] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedSeeds, setGeneratedSeeds] = useState<any[]>([]);
  
  const generator = new AISeedGeneratorService();
  
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const seeds = await generator.generateSeeds({
        entityType,
        count,
        tenantId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        prompt,
      });
      setGeneratedSeeds(seeds);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="seed-generator">
      <h2>🤖 AI Seed Generator</h2>
      
      <div className="form-group">
        <label>Entity Type</label>
        <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
          <option value="rental_object">Rental Objects</option>
          <option value="user">Users</option>
          <option value="amenity">Amenities</option>
          <option value="booking">Bookings</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Count</label>
        <input 
          type="number" 
          value={count} 
          onChange={(e) => setCount(parseInt(e.target.value))}
          min={1}
          max={100}
        />
      </div>
      
      <div className="form-group">
        <label>Custom Instructions (optional)</label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., 'Generate sports facilities in Oslo area'"
          rows={4}
        />
      </div>
      
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Seeds 🚀'}
      </button>
      
      {generatedSeeds.length > 0 && (
        <div className="results">
          <h3>Generated {generatedSeeds.length} seeds</h3>
          <SeedPreview seeds={generatedSeeds} />
          <SeedExport seeds={generatedSeeds} entityType={entityType} />
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Workflow

### Generate New Seeds with AI

```
1. User selects entity type (rental object, user, etc.)
   ↓
2. User specifies count and optional custom prompt
   ↓
3. AI generates JSON based on schema + examples
   ↓
4. System validates JSON against schema
   ↓
5. User previews generated data in UI
   ↓
6. User edits/refines if needed
   ↓
7. System converts JSON → SQL
   ↓
8. User previews SQL
   ↓
9. User downloads or applies seeds
```

### Edit Existing Seeds

```
1. User uploads/selects existing JSON seed file
   ↓
2. UI displays form/JSON editor
   ↓
3. User makes changes
   ↓
4. System validates changes
   ↓
5. System regenerates SQL
   ↓
6. User applies updated seeds
```

---

## 📊 Data Flow

```
JSON Source Files (Git)
         ↓
    AI Generator
         ↓
   Validation (JSON Schema)
         ↓
   JSON → SQL Converter
         ↓
   SQL Seed Files (Git)
         ↓
   Database (via psql)
```

---

## 🎨 UI Mockup

```
┌─────────────────────────────────────────────────────┐
│  Seed Management                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Generate  with AI] [Edit Existing] [Import/Export]│
│                                                     │
│  ┌────────────  AI Seed Generator ──────────────┐  │
│  │                                               │  │
│  │  Entity Type:  [Rental Objects ▼]            │  │
│  │  Count:        [40        ]                  │  │
│  │  Tenant:       [Skien Kommune ▼]             │  │
│  │                                               │  │
│  │  Custom Instructions:                         │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │ Generate diverse sports facilities     │ │  │
│  │  │ across different Norwegian cities      │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                               │  │
│  │  [Generate Seeds 🚀]                          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────  Generated Seeds (40) ─────────────────┐  │
│  │                                               │  │
│  │  [Table View] [JSON View] [SQL Preview]      │  │
│  │                                               │  │
│  │  Name            Category      City          │  │
│  │  ───────────────────────────────────────────  │  │
│  │  Idrettshall A   LOKALER...    Skien         │  │
│  │  Fotballbane 1   LOKALER...    Porsgrunn     │  │
│  │  ...                                          │  │
│  │                                               │  │
│  │  [Edit] [Download JSON] [Download SQL]       │  │
│  │  [Apply to Database]                          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

1. **API Keys**: Store AI API keys securely (env vars, secrets manager)
2. **Validation**: Always validate AI output against JSON schemas
3. **SQL Injection**: Use parameterized queries or escape all inputs
4. **Rate Limiting**: Limit AI generation requests per user/hour
5. **Audit Trail**: Log all seed generation/modifications

---

## 💰 Cost Optimization

1. **Caching**: Cache similar generation requests
2. **Batch Processing**: Generate multiple seeds in one AI call
3. **Template Reuse**: Use templates with variations to reduce tokens
4. **Local Models**: Consider local LLM for simple generations

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ JSON schema definition
- ✅ JSON → SQL converter
- ⏳ Basic UI structure

### Phase 2: AI Integration (Week 2)
- ⏳ OpenAI integration
- ⏳ Anthropic integration
- ⏳ Prompt engineering

### Phase 3: UI/UX (Week 3)
- ⏳ Seed generator UI
- ⏳ JSON/Form editor
- ⏳ SQL preview
- ⏳ Import/Export

### Phase 4: Advanced Features (Week 4)
- ⏳ Template library
- ⏳ Variation generator
- ⏳ Bulk operations
- ⏳ Version control integration

---

## 📝 Example Prompts for AI

### Rental Objects
```
Generate 10 realistic Norwegian sports facilities:
- Diverse types (halls, fields, pools)
- Different cities in Telemark
- Realistic pricing (1000-3000 NOK/hour)
- Norwegian addresses and contact info
- Complete amenities and regulations
```

### Users
```
Generate 20 demo users for Norwegian municipalities:
- Mix of roles (admin, staff, citizens)
- Norwegian names and emails
- Realistic phone numbers
- Assign to different organizations
```

### Bookings
```
Generate 50 bookings across February 2026:
- Mix of statuses (pending, confirmed, cancelled)
- Realistic time slots (mornings, evenings)
- Some recurring, some single
- Include notes in Norwegian
```

---

## ✅ Success Criteria

- ✅ Generate 40 rental objects in < 30 seconds
- ✅ 95%+ schema validation pass rate
- ✅ Zero SQL errors from generated seeds
- ✅ Norwegian text quality matches human-written
- ✅ Referential integrity maintained (valid IDs)

---

**Status:** Design Complete, Ready for Implementation  
**Owner:** SaaS Admin Team  
**Priority:** High (enables rapid demo environment setup)
