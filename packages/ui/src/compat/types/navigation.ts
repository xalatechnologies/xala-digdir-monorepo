/**
 * Navigation Types
 */

import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

export interface NavGroup {
  id: string;
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SidebarNavItem {
  name: string;
  description?: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | string;
  badgeColor?: 'default' | 'danger' | 'warning' | 'success';
  contexts?: string[];
}

export interface SidebarSection {
  title?: string;
  items: SidebarNavItem[];
}

export interface BottomNavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
}
