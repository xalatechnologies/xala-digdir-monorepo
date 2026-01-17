/**
 * AI Seed Generator Service
 * 
 * Integrates with OpenAI API to generate realistic seed data
 */

export interface GenerateRequest {
  entityType: 'rental_object' | 'user' | 'amenity' | 'addon' | 'booking';
  count: number;
  tenantId: string;
  prompt?: string;
  baseTemplate?: any;
}

class AISeedGeneratorService {
  private apiKey: string;
  private apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  
  constructor() {
    // In production, this should come from secure environment variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }
  
  /**
   * Generate seeds using AI
   */
  async generateSeeds(request: GenerateRequest): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY environment variable.');
    }
    
    const schema = await this.getSchemaForEntity(request.entityType);
    const prompt = this.buildPrompt(request, schema);
    
    // Call OpenAI API
    const response = await this.callOpenAI(prompt, request.count);
    
    // Validate against JSON schema
    const validated = this.validateSeeds(response, schema);
    
    return validated;
  }
  
  /**
   * Get JSON schema for entity type
   */
  private async getSchemaForEntity(entityType: string): Promise<any> {
    // Load from seed-data-schema.json
    const response = await fetch('/schemas/seed-data-schema.json');
    const schema = await response.json();
    
    const schemaMap: Record<string, string> = {
      rental_object: 'RentalObject',
      user: 'User',
      amenity: 'Amenity',
      addon: 'AddOn',
      booking: 'Booking',
    };
    
    return schema.definitions[schemaMap[entityType]];
  }
  
  /**
   * Build AI prompt with schema and Norwegian context
   */
  private buildPrompt(request: GenerateRequest, schema: any): string {
    const examples = this.getExamplesForType(request.entityType);
    
    return `You are a seed data generator for a Norwegian booking platform (Digilist).

TASK: Generate ${request.count} realistic ${request.entityType} objects.

JSON SCHEMA:
${JSON.stringify(schema, null, 2)}

REQUIREMENTS:
- All IDs must be valid UUIDs (use format: d0000001-0000-XXXX-0000-000000000000)
- Use Norwegian names, addresses, and text
- Use real Norwegian cities (Skien, Porsgrunn, Bamble, Notodden, Kragerø, etc.)
- Use realistic postal codes (37XX for Telemark region)
- Follow the exact schema structure
- Ensure referential integrity (valid tenant/org IDs)
- Be diverse and realistic
- For rental objects: include complete metadata, amenities, regulations, pricing
- For pricing: use realistic Norwegian prices (1000-3000 NOK/hour for venues)

TENANT ID: ${request.tenantId}
ORGANIZATION ID: 11111111-1111-1111-1111-111111111111

${request.prompt ? `\nADDITIONAL INSTRUCTIONS:\n${request.prompt}\n` : ''}

${examples ? `\nEXAMPLE DATA:\n${JSON.stringify(examples, null, 2)}\n` : ''}

IMPORTANT: Return ONLY a valid JSON array. No explanations, no markdown, just the JSON array.`;
  }
  
  /**
   * Get example data for entity type
   */
  private getExamplesForType(entityType: string): any {
    const examples: Record<string, any> = {
      rental_object: {
        id: 'd0000001-0000-0000-0000-000000000001',
        tenantId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        organizationId: '11111111-1111-1111-1111-111111111111',
        name: 'Idrettshall A',
        slug: 'idrettshall-a-0',
        type: 'SPACE',
        categoryKey: 'LOKALER_OG_BANER',
        timeMode: 'PERIOD',
        status: 'published',
        description: 'Moderne idrettshall i Skien...',
        capacity: 300,
        pricing: {
          basePrice: 1500,
          currency: 'NOK',
          unit: 'hour',
          tiers: [
            { type: 'hourly', price: 1500, label: 'Timepris' },
            { type: 'half_day', price: 4500, duration: 4, label: 'Halvdag (4 timer)' },
          ],
          discounts: [
            { type: 'member', percentage: 15, label: 'Medlemsrabatt' },
            { type: 'student', percentage: 20, label: 'Studentrabatt' },
          ],
        },
        images: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80'],
        metadata: {
          location: {
            address: 'Idrettsveien 1',
            postalCode: '3720',
            city: 'Skien',
            country: 'Norway',
          },
          contactName: 'Booking Avdeling',
          contactEmail: 'booking@skien.kommune.no',
          contactPhone: '+47 35 50 10 00',
          openingHours: {
            monday: { open: '06:00', close: '23:00' },
            tuesday: { open: '06:00', close: '23:00' },
          },
          amenities: ['changing_rooms', 'showers', 'parking', 'wifi', 'first_aid'],
        },
      },
    };
    
    return examples[entityType];
  }
  
  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, count: number): Promise<any[]> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a seed data generator for a Norwegian booking platform. Output only valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      // Handle both direct array and object with data property
      return Array.isArray(parsed) ? parsed : parsed.data || parsed.items || [];
    } catch (e) {
      throw new Error('Failed to parse AI response as JSON');
    }
  }
  
  private validateSeeds(seeds: any[], schema: any): any[] {
    // Basic validation - check required fields exist
    const validSeeds = seeds.filter(seed => {
      if (schema.required) {
        return schema.required.every((field: string) => seed[field] !== undefined);
      }
      return true;
    });
    
    console.log(`Validated ${validSeeds.length} of ${seeds.length} seeds`);
    return validSeeds;
  }
}
