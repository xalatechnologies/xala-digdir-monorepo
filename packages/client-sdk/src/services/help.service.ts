/**
 * Help Service
 * In-app help, FAQ, guides, and support
 * KRAV-SUP-01: Opplæringsplan + innebygde hjelpeverktøy
 * KRAV-SUP-03: Brukerstøtte for innbyggere
 */
import { getClient } from '../core/client-factory';

// =============================================================================
// FAQ Types
// =============================================================================

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface FAQResponse {
  data: FAQ[];
  meta: {
    total: number;
    categories: string[];
    language: string;
  };
}

// =============================================================================
// Guide Types
// =============================================================================

export interface Guide {
  id: string;
  role: string;
  title: string;
  description: string;
  steps: string[];
  estimatedMinutes: number;
}

export interface GuidesResponse {
  data: Guide[];
  meta: {
    total: number;
    roles: string[];
  };
}

// =============================================================================
// Training Types
// =============================================================================

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  targetRoles: string[];
}

export interface TrainingPlan {
  title: string;
  version: string;
  lastUpdated: string;
  modules: TrainingModule[];
}

export interface TrainingResource {
  type: 'pdf' | 'video' | 'link';
  title: string;
  url: string;
}

export interface TrainingSupport {
  email: string;
  phone: string;
  hours: string;
}

export interface TrainingResponse {
  data: {
    plan: TrainingPlan;
    resources: TrainingResource[];
    support: TrainingSupport;
  };
}

// =============================================================================
// Tooltip Types
// =============================================================================

export interface TooltipsResponse {
  data: Record<string, Record<string, string>>;
}

// =============================================================================
// Support Ticket Types
// =============================================================================

export interface ContactRequest {
  name?: string;
  email: string;
  subject?: string;
  message: string;
  category?: string;
}

export interface SupportTicket {
  ticketId: string;
  status: string;
  message: string;
  submittedAt: string;
  contact: {
    name?: string;
    email: string;
    subject?: string;
    category?: string;
  };
}

export interface ContactResponse {
  data: SupportTicket;
}

// =============================================================================
// Help Service
// =============================================================================

class HelpService {
  private basePath = '/api/help';

  /**
   * Get FAQ entries
   * @param category Optional category filter (booking, payment, account, seasonal, accessibility)
   * @param lang Language code (default: 'no')
   */
  async getFaq(category?: string, lang = 'no'): Promise<FAQResponse> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('lang', lang);
    
    const url = params.toString()
      ? `${this.basePath}/faq?${params.toString()}`
      : `${this.basePath}/faq`;
      
    return getClient().get<FAQResponse>(url);
  }

  /**
   * Get user guides/tutorials
   * @param role User role filter (user, admin, case_handler, all)
   */
  async getGuides(role = 'user'): Promise<GuidesResponse> {
    return getClient().get<GuidesResponse>(`${this.basePath}/guides?role=${role}`);
  }

  /**
   * Get UI tooltips for contextual help
   * Returns a dictionary of tooltips organized by section (booking, listing, seasonal)
   */
  async getTooltips(): Promise<TooltipsResponse> {
    return getClient().get<TooltipsResponse>(`${this.basePath}/tooltips`);
  }

  /**
   * Get training materials and plan
   * Returns training modules, resources, and support contact info
   */
  async getTraining(): Promise<TrainingResponse> {
    return getClient().get<TrainingResponse>(`${this.basePath}/training`);
  }

  /**
   * Submit support request
   * Creates a support ticket and returns confirmation
   */
  async submitContact(data: ContactRequest): Promise<ContactResponse> {
    return getClient().post<ContactResponse>(`${this.basePath}/contact`, data);
  }
}

export const helpService = new HelpService();
