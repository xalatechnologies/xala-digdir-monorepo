/**
 * GlobalSearch Component
 *
 * Global search with typeahead suggestions and recent searches.
 * Domain-agnostic - receives search results and handlers via props.
 *
 * @example
 * ```tsx
 * // In app with SDK hooks
 * import { useTypeahead, useRecentSearches } from '@digilist/client-sdk';
 *
 * function MyGlobalSearch() {
 *   const [query, setQuery] = useState('');
 *   const { data: typeahead } = useTypeahead({ query, limit: 5 });
 *   const { data: recent } = useRecentSearches({ limit: 5 });
 *
 *   return (
 *     <GlobalSearch
 *       value={query}
 *       onSearchChange={setQuery}
 *       results={transformToSearchResults(typeahead, recent)}
 *       onResultSelect={(result) => navigate(result.href)}
 *       onSubmit={() => navigate(`/search?q=${query}`)}
 *     />
 *   );
 * }
 * ```
 */

import { useCallback } from 'react';
import { HeaderSearch } from './header-parts';
import type { SearchResultItem, SearchResultGroup } from './header-parts';

// =============================================================================
// Types
// =============================================================================

export interface GlobalSearchLabels {
  placeholder: string;
  noResultsWithQuery: string;
  noResultsEmpty: string;
}

export interface GlobalSearchProps {
  /** Current search value */
  value: string;

  /** Callback when search value changes */
  onSearchChange: (value: string) => void;

  /** Search results to display */
  results: SearchResultGroup[];

  /** Callback when a result is selected */
  onResultSelect: (result: SearchResultItem) => void;

  /** Callback when search is submitted (Enter key) */
  onSubmit: () => void;

  /** Placeholder text */
  placeholder?: string;

  /** Show keyboard shortcut indicator */
  showShortcut?: boolean;

  /** Enable global keyboard shortcut (Cmd+K / Ctrl+K) */
  enableGlobalShortcut?: boolean;

  /** Text to show when no results found */
  noResultsText?: string;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Labels for i18n */
  labels?: Partial<GlobalSearchLabels>;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: GlobalSearchLabels = {
  placeholder: 'Sok...',
  noResultsWithQuery: 'Ingen forslag funnet',
  noResultsEmpty: 'Ingen nylige sok',
};

// =============================================================================
// Component
// =============================================================================

/**
 * GlobalSearch component - presentational wrapper around HeaderSearch.
 * Receives all data and callbacks via props for domain-agnostic usage.
 */
export function GlobalSearch({
  value,
  onSearchChange,
  results,
  onResultSelect,
  onSubmit,
  placeholder,
  showShortcut = true,
  enableGlobalShortcut = true,
  noResultsText,
  className,
  style,
  labels: customLabels,
}: GlobalSearchProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  // Handle search input change
  const handleSearchChange = useCallback(
    (newValue: string) => {
      onSearchChange(newValue);
    },
    [onSearchChange]
  );

  // Handle search result selection
  const handleResultSelect = useCallback(
    (result: SearchResultItem) => {
      onResultSelect(result);
    },
    [onResultSelect]
  );

  // Handle enter key (full search submission)
  const handleSearchSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  // Determine placeholder text
  const placeholderText = placeholder || labels.placeholder;

  // Determine no results text
  const noResultsDisplayText =
    noResultsText ||
    (value.trim().length > 0 ? labels.noResultsWithQuery : labels.noResultsEmpty);

  return (
    <HeaderSearch
      placeholder={placeholderText}
      value={value}
      onSearchChange={handleSearchChange}
      onResultSelect={handleResultSelect}
      onSubmit={handleSearchSubmit}
      results={results}
      showShortcut={showShortcut}
      enableGlobalShortcut={enableGlobalShortcut}
      noResultsText={noResultsDisplayText}
      className={className}
      style={style}
    />
  );
}
