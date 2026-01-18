/**
 * Grafana Integration DTOs
 * Grafana dashboards and panels
 */

export interface GrafanaDashboardDTO {
  uid: string;
  title: string;
  description?: string;
  tags: string[];
  url: string;
  version: number;
  starred: boolean;
  folderId?: number;
  folderTitle?: string;
  panels: GrafanaPanelDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface GrafanaPanelDTO {
  id: number;
  title: string;
  type: string;
  datasource: string;
  targets: GrafanaQueryTarget[];
  gridPos: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface GrafanaQueryTarget {
  expr: string;
  legendFormat?: string;
  refId: string;
}

export interface GrafanaDashboardListDTO {
  dashboards: GrafanaDashboardSummaryDTO[];
  total: number;
}

export interface GrafanaDashboardSummaryDTO {
  uid: string;
  title: string;
  tags: string[];
  url: string;
  starred: boolean;
  folderId?: number;
  folderTitle?: string;
}

export interface GrafanaQueryRequestDTO {
  dashboardUid: string;
  panelId: number;
  from: string;
  to: string;
  interval?: string;
  maxDataPoints?: number;
}

export interface GrafanaQueryResponseDTO {
  data: GrafanaTimeSeriesData[];
  meta?: Record<string, unknown>;
}

export interface GrafanaTimeSeriesData {
  target: string;
  datapoints: Array<[number | null, number]>;
  tags?: Record<string, string>;
}

export interface GrafanaAnnotationDTO {
  id: string;
  dashboardId: number;
  panelId?: number;
  time: number;
  timeEnd?: number;
  text: string;
  tags: string[];
}

export interface CreateGrafanaAnnotationDTO {
  dashboardUid: string;
  panelId?: number;
  time: number;
  timeEnd?: number;
  text: string;
  tags?: string[];
}
