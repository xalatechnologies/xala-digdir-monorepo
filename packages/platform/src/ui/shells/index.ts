/**
 * @xalatechnologies/platform/ui/shells
 *
 * Layer 4: Application Shell components
 * Top-level layout containers for applications
 *
 * Shells provide:
 * - AppShell - Complete application container with header, sidebar, content
 * - AppLayout - Thin wrapper for layout composition
 * - DashboardSidebar - Navigation sidebar with sections
 * - DashboardContent - Main content area
 */

// Placeholder exports - these will be implemented
// by migrating from @xala/ds/shells

// Example placeholder for future implementation
export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface DashboardSidebarProps {
  children: React.ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// TODO: Migrate shell components from @xala/ds
// export { AppShell } from './AppShell';
// export { AppLayout } from './AppLayout';
// export { DashboardSidebar } from './DashboardSidebar';
// export { DashboardContent } from './DashboardContent';
