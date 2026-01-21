/**
 * SimpleTabs and TabItem Components
 *
 * A simplified tabs abstraction that wraps Designsystemet's Tabs component
 * with a more convenient API using TabItem children.
 *
 * This component is a smart wrapper:
 * - If children are TabItem elements, it renders using the simple API
 * - If children are Tabs.List/Tabs.Panel, it passes through to Designsystemet Tabs
 *
 * @example
 * ```tsx
 * // Simple API with TabItem
 * import { Tabs, TabItem } from '@xalatechnologies/platform/ui';
 *
 * function Example() {
 *   return (
 *     <Tabs>
 *       <TabItem label="First Tab">
 *         Content for first tab
 *       </TabItem>
 *       <TabItem label="Second Tab">
 *         Content for second tab
 *       </TabItem>
 *     </Tabs>
 *   );
 * }
 *
 * // Advanced API with Designsystemet compound pattern
 * import { Tabs } from '@xalatechnologies/platform/ui';
 *
 * function AdvancedExample() {
 *   return (
 *     <Tabs defaultValue="tab1">
 *       <Tabs.List>
 *         <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
 *         <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
 *       </Tabs.List>
 *       <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
 *       <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
 *     </Tabs>
 *   );
 * }
 * ```
 */

import * as React from 'react';
import { Tabs as DSTabs } from '@digdir/designsystemet-react';

// =============================================================================
// TabItem
// =============================================================================

export interface TabItemProps {
  /** Unique value to identify this tab (auto-generated if not provided) */
  value?: string;
  /** Label displayed on the tab trigger */
  label: string;
  /** Tab panel content */
  children: React.ReactNode;
}

/**
 * TabItem is a data carrier component for the simplified Tabs API.
 * When used as a direct child of Tabs, the Tabs component reads its props
 * to render the tab list and panels automatically.
 *
 * This component doesn't render anything by itself - it's just a
 * way to declare tabs with a cleaner API.
 */
export function TabItem(_props: TabItemProps): React.ReactElement | null {
  // TabItem doesn't render - Tabs extracts its props
  // This return is for TypeScript - it's never actually called
  return null;
}

TabItem.displayName = 'TabItem';

// =============================================================================
// SimpleTabs (exported as Tabs)
// =============================================================================

export interface SimpleTabsProps {
  /** Default selected tab value */
  defaultValue?: string;
  /** Controlled selected tab value */
  value?: string;
  /** Callback when tab changes */
  onChange?: (value: string) => void;
  /** Children - can be TabItem elements or Designsystemet Tabs compound components */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

interface TabItemData {
  value: string;
  label: string;
  children: React.ReactNode;
}

/**
 * Check if a child is a TabItem element
 */
function isTabItemElement(child: React.ReactNode): child is React.ReactElement<TabItemProps> {
  return React.isValidElement(child) && (child.type as React.FC)?.displayName === 'TabItem';
}

/**
 * Check if children contain TabItem elements (simple API)
 */
function hasTabItemChildren(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (isTabItemElement(child)) {
      found = true;
    }
  });
  return found;
}

/**
 * SimpleTabs - A smart Tabs wrapper component.
 *
 * Detects whether children are TabItem elements (simple API) or
 * Designsystemet compound components (advanced API) and renders accordingly.
 */
export function SimpleTabs({
  defaultValue,
  value,
  onChange,
  children,
  className,
  size = 'md',
}: SimpleTabsProps): React.ReactElement {
  // Check if using simple TabItem API
  const useSimpleApi = hasTabItemChildren(children);

  if (!useSimpleApi) {
    // Pass through to Designsystemet Tabs for compound pattern
    return (
      <DSTabs
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className={className}
        data-size={size}
      >
        {children}
      </DSTabs>
    );
  }

  // Simple API - extract TabItem data and render
  const tabItems: TabItemData[] = [];

  React.Children.forEach(children, (child, index) => {
    if (isTabItemElement(child)) {
      const props = child.props;
      tabItems.push({
        value: props.value || `tab-${index}`,
        label: props.label,
        children: props.children,
      });
    }
  });

  const effectiveDefaultValue = defaultValue || value || (tabItems[0]?.value ?? 'tab-0');

  return (
    <DSTabs
      defaultValue={effectiveDefaultValue}
      value={value}
      onChange={onChange}
      className={className}
      data-size={size}
    >
      <DSTabs.List>
        {tabItems.map((tab) => (
          <DSTabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </DSTabs.Tab>
        ))}
      </DSTabs.List>

      {tabItems.map((tab) => (
        <DSTabs.Panel key={tab.value} value={tab.value}>
          {tab.children}
        </DSTabs.Panel>
      ))}
    </DSTabs>
  );
}

SimpleTabs.displayName = 'SimpleTabs';

// Attach Designsystemet compound components for advanced usage
SimpleTabs.List = DSTabs.List;
SimpleTabs.Tab = DSTabs.Tab;
SimpleTabs.Panel = DSTabs.Panel;

/**
 * Export SimpleTabs as Tabs for consistent naming
 */
export { SimpleTabs as Tabs };
