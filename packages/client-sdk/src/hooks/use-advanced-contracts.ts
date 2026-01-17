/**
 * Advanced Contracts Hooks
 * React Query hooks for help, search, GDPR, reports, seasons, org context
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseService } from '../services/base.service';

// =============================================================================
// Services
// =============================================================================

class HelpService extends BaseService {
  constructor() {
    super('/api/help');
  }

  async getTOC() {
    return this.get('/toc');
  }

  async getArticle(slug: string) {
    return this.get(`/articles/${slug}`);
  }

  async search(query: string) {
    return this.get('/search', { params: { q: query } });
  }
}

class GlobalSearchService extends BaseService {
  constructor() {
    super('/api/search');
  }

  async search(request: any) {
    return this.post('/global', request);
  }
}

class GDPRService extends BaseService {
  constructor() {
    super('/api/gdpr');
  }

  async createDSAR(request: any) {
    return this.post('/dsar', request);
  }

  async getDSAR(requestId: string) {
    return this.get(`/dsar/${requestId}`);
  }

  async getConsents() {
    return this.get('/consents');
  }

  async updateConsent(consentType: string, granted: boolean) {
    return this.put(`/consents/${consentType}`, { granted });
  }
}

class ReportsService extends BaseService {
  constructor() {
    super('/api/reports');
  }

  async getTemplates() {
    return this.get('/templates');
  }

  async generateReport(request: any) {
    return this.post('/generate', request);
  }

  async getReport(reportId: string) {
    return this.get(`/${reportId}`);
  }

  async listReports() {
    return this.get('');
  }
}

class SeasonsService extends BaseService {
  constructor() {
    super('/api/seasons');
  }

  async getSeason(seasonId: string) {
    return this.get(`/${seasonId}`);
  }

  async apply(seasonId: string, request: any) {
    return this.post(`/${seasonId}/apply`, request);
  }

  async getAllocations(seasonId: string) {
    return this.get(`/${seasonId}/allocations`);
  }

  async listSeasons(rentalObjectId: string) {
    return this.get('', { params: { rentalObjectId } });
  }
}

class OrgContextService extends BaseService {
  constructor() {
    super('/api/minside');
  }

  async getOrgContext() {
    return this.get('/org-context');
  }

  async setOrgContext(request: any) {
    return this.post('/org-context', request);
  }
}

const helpService = new HelpService();
const globalSearchService = new GlobalSearchService();
const gdprService = new GDPRService();
const reportsService = new ReportsService();
const seasonsService = new SeasonsService();
const orgContextService = new OrgContextService();

// =============================================================================
// Query Keys
// =============================================================================

export const advancedContractsKeys = {
  help: {
    all: ['help'] as const,
    toc: () => [...advancedContractsKeys.help.all, 'toc'] as const,
    article: (slug: string) => [...advancedContractsKeys.help.all, 'article', slug] as const,
    search: (query: string) => [...advancedContractsKeys.help.all, 'search', query] as const,
  },
  search: {
    all: ['global-search'] as const,
    results: (request: any) => [...advancedContractsKeys.search.all, 'results', request] as const,
  },
  gdpr: {
    all: ['gdpr'] as const,
    dsar: (requestId: string) => [...advancedContractsKeys.gdpr.all, 'dsar', requestId] as const,
    consents: () => [...advancedContractsKeys.gdpr.all, 'consents'] as const,
  },
  reports: {
    all: ['reports'] as const,
    templates: () => [...advancedContractsKeys.reports.all, 'templates'] as const,
    report: (reportId: string) => [...advancedContractsKeys.reports.all, 'report', reportId] as const,
    list: () => [...advancedContractsKeys.reports.all, 'list'] as const,
  },
  seasons: {
    all: ['seasons'] as const,
    season: (seasonId: string) => [...advancedContractsKeys.seasons.all, 'season', seasonId] as const,
    allocations: (seasonId: string) => [...advancedContractsKeys.seasons.all, 'allocations', seasonId] as const,
    list: (rentalObjectId: string) => [...advancedContractsKeys.seasons.all, 'list', rentalObjectId] as const,
  },
  orgContext: {
    all: ['org-context'] as const,
    current: () => [...advancedContractsKeys.orgContext.all, 'current'] as const,
  },
};

// =============================================================================
// Help Hooks
// =============================================================================

export function useHelpTOC() {
  return useQuery({
    queryKey: advancedContractsKeys.help.toc(),
    queryFn: () => helpService.getTOC(),
  });
}

export function useHelpArticle(slug: string) {
  return useQuery({
    queryKey: advancedContractsKeys.help.article(slug),
    queryFn: () => helpService.getArticle(slug),
    enabled: !!slug,
  });
}

export function useHelpSearch(query: string) {
  return useQuery({
    queryKey: advancedContractsKeys.help.search(query),
    queryFn: () => helpService.search(query),
    enabled: query.length >= 2,
  });
}

// =============================================================================
// Global Search Hooks
// =============================================================================

export function useGlobalSearch(request: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: advancedContractsKeys.search.results(request),
    queryFn: () => globalSearchService.search(request),
    enabled: options?.enabled !== false && !!request?.query,
  });
}

export function useGlobalSearchMutation() {
  return useMutation({
    mutationFn: (request: any) => globalSearchService.search(request),
  });
}

// =============================================================================
// GDPR Hooks
// =============================================================================

export function useCreateDSAR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => gdprService.createDSAR(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedContractsKeys.gdpr.all });
    },
  });
}

export function useDSAR(requestId: string) {
  return useQuery({
    queryKey: advancedContractsKeys.gdpr.dsar(requestId),
    queryFn: () => gdprService.getDSAR(requestId),
    enabled: !!requestId,
  });
}

export function useConsents() {
  return useQuery({
    queryKey: advancedContractsKeys.gdpr.consents(),
    queryFn: () => gdprService.getConsents(),
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consentType, granted }: { consentType: string; granted: boolean }) =>
      gdprService.updateConsent(consentType, granted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedContractsKeys.gdpr.consents() });
    },
  });
}

// =============================================================================
// Reports Hooks
// =============================================================================

export function useReportTemplates() {
  return useQuery({
    queryKey: advancedContractsKeys.reports.templates(),
    queryFn: () => reportsService.getTemplates(),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => reportsService.generateReport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedContractsKeys.reports.list() });
    },
  });
}

export function useReport(reportId: string) {
  return useQuery({
    queryKey: advancedContractsKeys.reports.report(reportId),
    queryFn: () => reportsService.getReport(reportId),
    enabled: !!reportId,
    refetchInterval: (data: any) => {
      if (data?.data?.status === 'QUEUED' || data?.data?.status === 'GENERATING') {
        return 5000; // Poll every 5 seconds while generating
      }
      return false;
    },
  });
}

export function useReportsList() {
  return useQuery({
    queryKey: advancedContractsKeys.reports.list(),
    queryFn: () => reportsService.listReports(),
  });
}

// =============================================================================
// Seasons Hooks
// =============================================================================

export function useSeason(seasonId: string) {
  return useQuery({
    queryKey: advancedContractsKeys.seasons.season(seasonId),
    queryFn: () => seasonsService.getSeason(seasonId),
    enabled: !!seasonId,
  });
}

export function useApplyForSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seasonId, request }: { seasonId: string; request: any }) =>
      seasonsService.apply(seasonId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: advancedContractsKeys.seasons.season(variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: advancedContractsKeys.seasons.allocations(variables.seasonId),
      });
    },
  });
}

export function useSeasonAllocations(seasonId: string) {
  return useQuery({
    queryKey: advancedContractsKeys.seasons.allocations(seasonId),
    queryFn: () => seasonsService.getAllocations(seasonId),
    enabled: !!seasonId,
  });
}

export function useSeasonsList(rentalObjectId: string) {
  return useQuery({
    queryKey: advancedContractsKeys.seasons.list(rentalObjectId),
    queryFn: () => seasonsService.listSeasons(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

// =============================================================================
// Org Context Hooks
// =============================================================================

export function useOrgContext() {
  return useQuery({
    queryKey: advancedContractsKeys.orgContext.current(),
    queryFn: () => orgContextService.getOrgContext(),
  });
}

export function useSetOrgContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => orgContextService.setOrgContext(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedContractsKeys.orgContext.current() });
    },
  });
}
