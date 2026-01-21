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

// =============================================================================
// Layout Components
// =============================================================================
export {
  Card,
  Details,
  Divider,
  Link,
  List,
  Tabs,
  Table,
  Spinner,
  ErrorSummary,
  ToggleGroup,
  Pagination,
  Chip,
  Dropdown,
} from '@digdir/designsystemet-react';
