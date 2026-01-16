/**
 * Widget Service
 * Embeddable widgets configuration (Admin)
 */
import { getClient } from '../core/client-factory';

export interface Widget {
  id: string;
  tenantId: string;
  name: string;
  type: 'booking' | 'calendar' | 'availability' | 'listing';
  listingId?: string;
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
  type: 'booking' | 'calendar' | 'availability' | 'listing';
  listingId?: string;
  settings?: Partial<WidgetSettings>;
}

class WidgetService {
  private basePath = '/api/widgets';

  /**
   * Get all widgets for the current tenant
   * Retrieves all embeddable widgets including booking forms, calendars, and availability displays
   *
   * @returns Promise resolving to an array of widgets
   *
   * @example
   * ```typescript
   * // Get all widgets
   * const { data: widgets } = await widgetService.getAll();
   * console.log(`Found ${widgets.length} widgets`);
   *
   * // Filter active widgets
   * const activeWidgets = widgets.filter(w => w.isActive);
   * ```
   */
  async getAll(): Promise<{ data: Widget[] }> {
    return getClient().get<{ data: Widget[] }>(this.basePath);
  }

  /**
   * Get a specific widget by ID
   * Retrieves full widget configuration including settings, embed code, and metadata
   *
   * @param id - The unique widget ID
   * @returns Promise resolving to the widget object
   *
   * @example
   * ```typescript
   * // Get widget details
   * const { data: widget } = await widgetService.getById('widget-123');
   * console.log(`Widget type: ${widget.type}`);
   * console.log(`Theme: ${widget.settings.theme}`);
   * ```
   */
  async getById(id: string): Promise<{ data: Widget }> {
    return getClient().get<{ data: Widget }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new embeddable widget
   * Generates a widget with embed code for external website integration
   *
   * @param data - Widget configuration including type, name, and settings
   * @returns Promise resolving to the created widget with embed code
   *
   * @example
   * ```typescript
   * // Create a booking widget
   * const { data: widget } = await widgetService.create({
   *   name: 'Main Booking Form',
   *   type: 'booking',
   *   listingId: 'listing-123',
   *   settings: {
   *     theme: 'light',
   *     primaryColor: '#0066cc',
   *     showHeader: true
   *   }
   * });
   * console.log('Embed code:', widget.embedCode);
   *
   * // Create a calendar widget
   * const { data: calendar } = await widgetService.create({
   *   name: 'Availability Calendar',
   *   type: 'calendar',
   *   settings: { theme: 'auto' }
   * });
   * ```
   */
  async create(data: CreateWidgetDTO): Promise<{ data: Widget }> {
    return getClient().post<{ data: Widget }>(this.basePath, data);
  }

  /**
   * Update widget configuration and settings
   * Modify widget appearance, behavior, or linked resources. Embed code is automatically regenerated.
   *
   * @param id - The widget ID to update
   * @param data - Partial widget data to update (only provided fields are updated)
   * @returns Promise resolving to the updated widget
   *
   * @example
   * ```typescript
   * // Update widget theme
   * const { data: widget } = await widgetService.update('widget-123', {
   *   settings: { theme: 'dark', primaryColor: '#ff6600' }
   * });
   *
   * // Update widget name and listing
   * await widgetService.update('widget-123', {
   *   name: 'Updated Widget Name',
   *   listingId: 'listing-456'
   * });
   * ```
   */
  async update(id: string, data: Partial<CreateWidgetDTO>): Promise<{ data: Widget }> {
    return getClient().put<{ data: Widget }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a widget permanently
   * Removes the widget configuration. Existing embedded instances will stop working.
   *
   * @param id - The widget ID to delete
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * // Delete a widget
   * const result = await widgetService.delete('widget-123');
   * if (result.success) {
   *   console.log('Widget deleted successfully');
   * }
   * ```
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Get the embed code for a widget
   * Retrieves the HTML/JavaScript snippet to embed the widget on external websites
   *
   * @param id - The widget ID
   * @returns Promise resolving to the embed code string
   *
   * @example
   * ```typescript
   * // Get embed code
   * const { embedCode } = await widgetService.getEmbedCode('widget-123');
   *
   * // Copy to clipboard (browser)
   * await navigator.clipboard.writeText(embedCode);
   *
   * // Example embed code format:
   * // <script src="https://cdn.digilist.no/widget.js"></script>
   * // <div data-digilist-widget="widget-123"></div>
   * ```
   */
  async getEmbedCode(id: string): Promise<{ embedCode: string }> {
    return getClient().get<{ embedCode: string }>(`${this.basePath}/${id}/embed`);
  }

  /**
   * Preview widget HTML rendering
   * Returns the fully rendered HTML for preview purposes (admin use only)
   *
   * @param id - The widget ID to preview
   * @returns Promise resolving to the widget HTML string
   *
   * @example
   * ```typescript
   * // Get widget preview HTML
   * const html = await widgetService.preview('widget-123');
   *
   * // Display in iframe
   * const iframe = document.createElement('iframe');
   * iframe.srcdoc = html;
   * document.body.appendChild(iframe);
   * ```
   */
  async preview(id: string): Promise<string> {
    const response = await fetch(`${this.basePath}/${id}/preview`);
    return response.text();
  }
}

export const widgetService = new WidgetService();
