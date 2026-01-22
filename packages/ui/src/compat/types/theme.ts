/**
 * Theme Types
 */

export type ColorScheme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  colorScheme: ColorScheme;
  size: 'sm' | 'md' | 'lg';
  typography: 'primary' | 'secondary';
  brand?: string;
}
