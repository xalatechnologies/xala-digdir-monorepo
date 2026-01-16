/**
 * Widget Service
 * Embeddable widgets configuration (Admin)
 */
import { getClient } from '../core/client-factory';

export interface Widget {
  id: string;
  tenantId: string;
  name: string;
  type: 'booking' | 'calendar' | 'availability' | 'rental_object';
  rentalObjectId?: string;
  settings: WidgetSettings;
  embedCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  borderRadius?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  customCss?: string;
  locale?: string;
}

export interface CreateWidgetDTO {
  name: string;
  type: 'booking' | 'calendar' | 'availability' | 'rental_object';
  rentalObjectId?: string;
  settings?: Partial<WidgetSettings>;
}

class WidgetService {
  private basePath = '/api/widgets';

  /**
   * Get all widgets
   */
  async getAll(): Promise<{ data: Widget[] }> {
    return getClient().get<{ data: Widget[] }>(this.basePath);
  }

  /**
   * Get widget by ID
   */
  async getById(id: string): Promise<{ data: Widget }> {
    return getClient().get<{ data: Widget }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new widget
   */
  async create(data: CreateWidgetDTO): Promise<{ data: Widget }> {
    return getClient().post<{ data: Widget }>(this.basePath, data);
  }

  /**
   * Update widget settings
   */
  async update(id: string, data: Partial<CreateWidgetDTO>): Promise<{ data: Widget }> {
    return getClient().put<{ data: Widget }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a widget
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Get embed code for widget
   */
  async getEmbedCode(id: string): Promise<{ embedCode: string }> {
    return getClient().get<{ embedCode: string }>(`${this.basePath}/${id}/embed`);
  }

  /**
   * Preview widget (returns HTML)
   */
  async preview(id: string): Promise<string> {
    const response = await fetch(`${this.basePath}/${id}/preview`);
    return response.text();
  }
}

export const widgetService = new WidgetService();
