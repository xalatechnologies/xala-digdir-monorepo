/**
 * @digdir/designsystemet-react Component Re-exports
 * 
 * This is the SINGLE SOURCE OF TRUTH for all @digdir base components.
 * Import from here instead of directly from @digdir/designsystemet-react.
 * 
 * @example
 * // Inside platform/ui modules:
 * import { Button, Paragraph } from '../primitives/components';
 * 
 * // From apps:
 * import { Button, Paragraph } from '@xalatechnologies/platform/ui';
 */

// =============================================================================
// Typography
// =============================================================================
export {
  Paragraph,
  Heading,
  Label,
} from '@digdir/designsystemet-react';

// =============================================================================
// Form Components
// =============================================================================
export {
  Button,
  Textfield,
  Textarea,
  Checkbox,
  Radio,
  Switch,
  Select,
  Combobox,
  Search,
  Field,
  Fieldset,
  ValidationMessage,
} from '@digdir/designsystemet-react';

// Alias: Input -> Textfield for convenience
export { Textfield as Input } from '@digdir/designsystemet-react';

// =============================================================================
// Layout Components
// =============================================================================
export {
  Card,
  Details,
  Dialog,
  Divider,
  Link,
  List,
  // Note: Tabs is exported from composed/SimpleTabs.tsx with TabItem support
  // Use the composed Tabs which supports both simple TabItem API and compound pattern
  Table,
  Spinner,
  ErrorSummary,
  ToggleGroup,
  Pagination,
  Chip,
  Dropdown,
} from '@digdir/designsystemet-react';

// Re-export original Tabs as DSTabs for direct access if needed
export { Tabs as DSTabs } from '@digdir/designsystemet-react';

// Tabs compound components - exported as named exports for convenience
// These allow usage like: import { Tabs, TabsList, TabsTab, TabsPanel } from '...'
import { Tabs as DesignsystemetTabs } from '@digdir/designsystemet-react';
export const TabsList = DesignsystemetTabs.List;
export const TabsTab = DesignsystemetTabs.Tab;
export const TabsPanel = DesignsystemetTabs.Panel;

// Dropdown compound components - exported as named exports for convenience
// These allow usage like: import { Dropdown, DropdownTrigger, DropdownList, DropdownItem } from '...'
import { Dropdown as DesignsystemetDropdown } from '@digdir/designsystemet-react';
export const DropdownTrigger = DesignsystemetDropdown.Trigger;
export const DropdownList = DesignsystemetDropdown.List;
export const DropdownItem = DesignsystemetDropdown.Item;
export const DropdownHeading = DesignsystemetDropdown.Heading;

// Table compound components - exported as named exports for convenience
// These allow usage like: import { Table, TableHead, TableBody, TableRow, TableCell } from '...'
import { Table as DesignsystemetTable } from '@digdir/designsystemet-react';
export const TableHead = DesignsystemetTable.Head;
export const TableBody = DesignsystemetTable.Body;
export const TableRow = DesignsystemetTable.Row;
export const TableCell = DesignsystemetTable.Cell;
export const TableHeaderCell = DesignsystemetTable.HeaderCell;
export const TableFoot = DesignsystemetTable.Foot;

// List compound components - exported as named exports for convenience
import { List as DesignsystemetList } from '@digdir/designsystemet-react';
export const ListItem = DesignsystemetList.Item;
export const ListOrdered = DesignsystemetList.Ordered;
export const ListUnordered = DesignsystemetList.Unordered;

// Card compound components - exported as named exports for convenience
import { Card as DesignsystemetCard } from '@digdir/designsystemet-react';
export const CardBlock = DesignsystemetCard.Block;

// Details compound components - exported as named exports for convenience
import { Details as DesignsystemetDetails } from '@digdir/designsystemet-react';
export const DetailsSummary = DesignsystemetDetails.Summary;
export const DetailsContent = DesignsystemetDetails.Content;

// Dialog compound components - exported as named exports for convenience
import { Dialog as DesignsystemetDialog } from '@digdir/designsystemet-react';
export const DialogTrigger = DesignsystemetDialog.Trigger;
export const DialogTriggerContext = DesignsystemetDialog.TriggerContext;
export const DialogBlock = DesignsystemetDialog.Block;

// ErrorSummary compound components - exported as named exports for convenience
import { ErrorSummary as DesignsystemetErrorSummary } from '@digdir/designsystemet-react';
export const ErrorSummaryHeading = DesignsystemetErrorSummary.Heading;
export const ErrorSummaryList = DesignsystemetErrorSummary.List;
export const ErrorSummaryItem = DesignsystemetErrorSummary.Item;
export const ErrorSummaryLink = DesignsystemetErrorSummary.Link;

// ToggleGroup compound components - exported as named exports for convenience
import { ToggleGroup as DesignsystemetToggleGroup } from '@digdir/designsystemet-react';
export const ToggleGroupItem = DesignsystemetToggleGroup.Item;

// Note: Badge is exported from composed (custom implementation with more features)
