import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Drawer, DrawerSection, DrawerItem, DrawerEmptyState } from '@xala/ds';
import { Button, Checkbox, Paragraph } from '@xala/ds';
import { FilterIcon, ShoppingCartIcon, BellIcon, SearchIcon, SettingsIcon, CalendarIcon } from '@xala/ds';

/**
 * Drawer is a sliding panel component that can open from any edge.
 *
 * ## Features
 * - Multiple positions (left, right, top, bottom)
 * - Size presets and custom sizes
 * - Backdrop overlay with click-to-close
 * - Focus trap and keyboard navigation
 * - Helper components (DrawerSection, DrawerItem, DrawerEmptyState)
 * - Mobile-responsive with handle for swipe
 *
 * ## Accessibility
 * - Focus trap when open
 * - Escape key closes drawer
 * - ARIA attributes for dialog role
 * - Body scroll lock when open
 */
const meta: Meta<typeof Drawer> = {
  title: 'Composed/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Drawer provides a sliding panel for secondary content and actions.

## Use Cases
- Filter panels (left position)
- Shopping cart (right position)
- Notifications panel (right position)
- Mobile navigation (left position)
- Bottom sheets on mobile (bottom position)

## Positions
- **left**: Navigation, filters
- **right**: Cart, notifications, details
- **top**: Alerts, announcements
- **bottom**: Mobile actions, quick access

## data-testid
- Panel: Inherits from className
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

// Interactive wrapper for stories
const DrawerDemo = ({
  buttonText = 'Open Drawer',
  children,
  ...props
}: Omit<Partial<React.ComponentProps<typeof Drawer>>, 'children'> & {
  buttonText?: string;
  children?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <Button onClick={() => setIsOpen(true)}>{buttonText}</Button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} {...props}>
        {children}
      </Drawer>
    </div>
  );
};

/**
 * Default drawer from the left
 */
export const Default: Story = {
  render: () => (
    <DrawerDemo title="Drawer Title">
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>This is the drawer content.</Paragraph>
      </div>
    </DrawerDemo>
  ),
};

/**
 * Right side drawer (common for carts, details)
 */
export const RightPosition: Story = {
  render: () => (
    <DrawerDemo
      title="Right Drawer"
      position="right"
      buttonText="Open Right Drawer"
    >
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>Content slides in from the right.</Paragraph>
      </div>
    </DrawerDemo>
  ),
};

/**
 * Bottom drawer (for mobile actions)
 */
export const BottomPosition: Story = {
  render: () => (
    <DrawerDemo
      title="Bottom Sheet"
      position="bottom"
      size="md"
      showHandle
      buttonText="Open Bottom Sheet"
    >
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>Perfect for mobile action sheets.</Paragraph>
      </div>
    </DrawerDemo>
  ),
};

/**
 * Top drawer (for alerts, announcements)
 */
export const TopPosition: Story = {
  render: () => (
    <DrawerDemo
      title="Announcement"
      position="top"
      size="sm"
      buttonText="Open Top Drawer"
    >
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>Important announcement or alert content.</Paragraph>
      </div>
    </DrawerDemo>
  ),
};

/**
 * Filter panel example
 */
export const FilterPanel: Story = {
  render: () => (
    <DrawerDemo
      title="Filtre"
      icon={<FilterIcon size={20} />}
      position="left"
      size="sm"
      buttonText="Open Filters"
      footer={
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button variant="secondary" style={{ flex: 1 }}>Nullstill</Button>
          <Button style={{ flex: 1 }}>Bruk filtre</Button>
        </div>
      }
    >
      <DrawerSection title="Type anlegg" collapsible>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          <Checkbox aria-label="Idrettshall">Idrettshall</Checkbox>
          <Checkbox aria-label="Svømmehall">Svømmehall</Checkbox>
          <Checkbox aria-label="Fotballbane">Fotballbane</Checkbox>
          <Checkbox aria-label="Tennisbane">Tennisbane</Checkbox>
        </div>
      </DrawerSection>
      <DrawerSection title="Tilgjengelighet" collapsible defaultCollapsed>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          <Checkbox aria-label="Handicap-tilpasset">Handicap-tilpasset</Checkbox>
          <Checkbox aria-label="Parkering">Parkering</Checkbox>
          <Checkbox aria-label="Garderobe">Garderobe</Checkbox>
        </div>
      </DrawerSection>
      <DrawerSection title="Pris" collapsible>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          <Checkbox aria-label="Gratis">Gratis</Checkbox>
          <Checkbox aria-label="Under 500 kr/time">Under 500 kr/time</Checkbox>
          <Checkbox aria-label="500-1000 kr/time">500-1000 kr/time</Checkbox>
          <Checkbox aria-label="Over 1000 kr/time">Over 1000 kr/time</Checkbox>
        </div>
      </DrawerSection>
    </DrawerDemo>
  ),
};

/**
 * Shopping cart example
 */
export const ShoppingCart: Story = {
  render: () => (
    <DrawerDemo
      title="Min bestilling"
      icon={<ShoppingCartIcon size={20} />}
      badge={3}
      position="right"
      size="md"
      buttonText="Open Cart (3)"
      footer={
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-3)' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 600 }}>kr 1 500</span>
          </div>
          <Button style={{ width: '100%' }}>Gå til betaling</Button>
        </div>
      }
    >
      <DrawerItem
        left={<CalendarIcon size={20} />}
        right={<span>kr 500</span>}
      >
        <div>
          <div style={{ fontWeight: 500 }}>Idrettshall A - 2 timer</div>
          <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Mandag 15. jan, 18:00-20:00
          </div>
        </div>
      </DrawerItem>
      <DrawerItem
        left={<CalendarIcon size={20} />}
        right={<span>kr 500</span>}
      >
        <div>
          <div style={{ fontWeight: 500 }}>Svømmehall - 1 time</div>
          <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Tirsdag 16. jan, 10:00-11:00
          </div>
        </div>
      </DrawerItem>
      <DrawerItem
        left={<CalendarIcon size={20} />}
        right={<span>kr 500</span>}
      >
        <div>
          <div style={{ fontWeight: 500 }}>Møterom B - 4 timer</div>
          <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Onsdag 17. jan, 09:00-13:00
          </div>
        </div>
      </DrawerItem>
    </DrawerDemo>
  ),
};

/**
 * Notifications panel example
 */
export const NotificationsPanel: Story = {
  render: () => (
    <DrawerDemo
      title="Varsler"
      icon={<BellIcon size={20} />}
      badge={5}
      position="right"
      size="md"
      buttonText="Open Notifications"
    >
      <DrawerSection title="I dag">
        <DrawerItem
          onClick={() => console.log('Clicked')}
          left={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--ds-color-accent-base-default)' }} />}
        >
          <div>
            <div style={{ fontWeight: 500 }}>Booking bekreftet</div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Din booking for Idrettshall A er bekreftet
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 4 }}>
              2 timer siden
            </div>
          </div>
        </DrawerItem>
        <DrawerItem onClick={() => console.log('Clicked')}>
          <div>
            <div style={{ fontWeight: 500 }}>Ny melding</div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Admin har sendt deg en melding
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 4 }}>
              5 timer siden
            </div>
          </div>
        </DrawerItem>
      </DrawerSection>
      <DrawerSection title="Tidligere">
        <DrawerItem onClick={() => console.log('Clicked')}>
          <div>
            <div style={{ fontWeight: 500 }}>Booking kansellert</div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Din booking for 10. januar er kansellert
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 4 }}>
              I går
            </div>
          </div>
        </DrawerItem>
      </DrawerSection>
    </DrawerDemo>
  ),
};

/**
 * Empty state example
 */
export const EmptyState: Story = {
  render: () => (
    <DrawerDemo
      title="Min bestilling"
      icon={<ShoppingCartIcon size={20} />}
      position="right"
      buttonText="Open Empty Cart"
    >
      <DrawerEmptyState
        icon={<ShoppingCartIcon size={48} />}
        title="Handlekurven er tom"
        description="Legg til utleieobjekter for å starte bookingen din."
        action={<Button variant="secondary">Utforsk utleieobjekter</Button>}
      />
    </DrawerDemo>
  ),
};

/**
 * Settings drawer with sections
 */
export const SettingsDrawer: Story = {
  render: () => (
    <DrawerDemo
      title="Innstillinger"
      icon={<SettingsIcon size={20} />}
      position="right"
      size="lg"
      buttonText="Open Settings"
    >
      <DrawerSection title="Varsler" description="Velg hvordan du vil bli varslet">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <DrawerItem
            selected
            onClick={() => {}}
            left={<BellIcon size={20} />}
          >
            E-postvarsler
          </DrawerItem>
          <DrawerItem
            onClick={() => {}}
            left={<BellIcon size={20} />}
          >
            SMS-varsler
          </DrawerItem>
          <DrawerItem
            onClick={() => {}}
            left={<BellIcon size={20} />}
          >
            Push-varsler
          </DrawerItem>
        </div>
      </DrawerSection>
      <DrawerSection title="Personvern" collapsible>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          <Checkbox aria-label="Del anonymisert bruksdata" defaultChecked>Del anonymisert bruksdata</Checkbox>
          <Checkbox aria-label="Motta nyhetsbrev">Motta nyhetsbrev</Checkbox>
        </div>
      </DrawerSection>
    </DrawerDemo>
  ),
};

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => {
    const [openDrawer, setOpenDrawer] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
          <div key={size}>
            <Button onClick={() => setOpenDrawer(size)}>
              {size.toUpperCase()}
            </Button>
            <Drawer
              isOpen={openDrawer === size}
              onClose={() => setOpenDrawer(null)}
              title={`Size: ${size}`}
              size={size}
            >
              <div style={{ padding: 'var(--ds-spacing-4)' }}>
                <Paragraph>This drawer uses the "{size}" size preset.</Paragraph>
              </div>
            </Drawer>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Without overlay (stays on page)
 */
export const NoOverlay: Story = {
  render: () => (
    <DrawerDemo
      title="Inline Panel"
      overlay={false}
      position="right"
      size="sm"
      buttonText="Open (no overlay)"
    >
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>This drawer has no backdrop overlay.</Paragraph>
      </div>
    </DrawerDemo>
  ),
};
