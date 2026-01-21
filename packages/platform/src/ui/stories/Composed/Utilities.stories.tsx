import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textfield,
  Checkbox,
} from '@xalatechnologies/platform/ui';
import { Timeline, CompactTimeline } from '../../src/composed/Timeline';
import { ProgressBar, ProgressRing, ProgressSteps } from '../../src/composed/Progress';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../src/composed/Modal';
import { Popover, PopoverHeader, PopoverBody, PopoverFooter } from '../../src/composed/Popover';
import { CommandPalette, useCommandPalette } from '../../src/composed/CommandPalette';
import { Drawer, DrawerSection, DrawerItem, DrawerEmptyState } from '../../src/composed/Drawer';
import { ConfirmDialog, ActionDialog, useConfirmDialog } from '../../src/composed/ConfirmDialog';
import type { TimelineItem } from '../../src/composed/Timeline';
import type { CommandItem, CommandGroup } from '../../src/composed/CommandPalette';

/**
 * Utility components for common UI patterns.
 *
 * ## Components
 * - **Timeline**: Activity feed and history display
 * - **Progress**: Progress bars, rings, and steps
 * - **Modal**: Generic reusable modal dialogs
 * - **Popover**: Rich content popovers
 * - **CommandPalette**: Keyboard-driven command palette
 * - **Drawer**: Sliding panel from edges
 * - **ConfirmDialog**: Confirmation dialogs
 *
 * ## Features
 * - Accessibility compliant
 * - Keyboard navigation
 * - Design system tokens
 */
const meta: Meta = {
  title: 'Composed/Utilities',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Utility components for municipal applications.

## Typical Use Cases
- Audit logs and activity feeds
- Loading and progress states
- Confirmation dialogs
- Quick actions and commands
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// =============================================================================
// Sample Data
// =============================================================================

const sampleTimelineItems: TimelineItem[] = [
  {
    id: '1',
    title: 'opprettet booking',
    description: 'Booking for Idrettshall A, 15. januar 2026',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'success',
    actor: { name: 'Ola Nordmann' },
    metadata: { 'Booking ID': 'BK-2026-001' },
  },
  {
    id: '2',
    title: 'endret bookingstatus til Bekreftet',
    description: 'Systembekreftelse etter betaling',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'info',
    actor: { name: 'System' },
  },
  {
    id: '3',
    title: 'sendte påminnelse',
    description: 'Automatisk påminnelse 24 timer før booking',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'default',
    actor: { name: 'System' },
  },
  {
    id: '4',
    title: 'kansellerte booking',
    description: 'Bruker kansellerte booking grunnet sykdom',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'danger',
    actor: { name: 'Kari Hansen', avatar: 'https://i.pravatar.cc/40?u=kari' },
    metadata: { Grunn: 'Sykdom', Refundert: 'Ja' },
  },
  {
    id: '5',
    title: 'oppdaterte brukerinfo',
    description: 'Endret telefonnummer og adresse',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: 'warning',
    actor: { name: 'Admin' },
  },
];

const compactTimelineItems = [
  { id: '1', label: 'Booking opprettet', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'success' as const },
  { id: '2', label: 'Betaling mottatt', timestamp: new Date(Date.now() - 10 * 60 * 1000), type: 'info' as const },
  { id: '3', label: 'E-post sendt', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'default' as const },
  { id: '4', label: 'Bruker logget inn', timestamp: new Date(Date.now() - 60 * 60 * 1000), type: 'default' as const },
  { id: '5', label: 'Passord endret', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'warning' as const },
  { id: '6', label: 'Konto opprettet', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), type: 'success' as const },
];

const commandGroups: CommandGroup[] = [
  { id: 'navigation', label: 'Navigasjon', priority: 100 },
  { id: 'actions', label: 'Handlinger', priority: 90 },
  { id: 'settings', label: 'Innstillinger', priority: 80 },
];

const sampleCommands: CommandItem[] = [
  {
    id: 'home',
    label: 'Gå til forsiden',
    description: 'Naviger til hovedsiden',
    shortcut: ['⌘', 'H'],
    group: 'navigation',
    onSelect: () => console.log('Navigate to home'),
  },
  {
    id: 'bookings',
    label: 'Mine bookinger',
    description: 'Vis alle dine bookinger',
    shortcut: ['⌘', 'B'],
    group: 'navigation',
    onSelect: () => console.log('Navigate to bookings'),
  },
  {
    id: 'new-booking',
    label: 'Ny booking',
    description: 'Opprett en ny booking',
    shortcut: ['⌘', 'N'],
    group: 'actions',
    onSelect: () => console.log('Create new booking'),
  },
  {
    id: 'search',
    label: 'Søk i anlegg',
    description: 'Finn tilgjengelige anlegg',
    shortcut: ['⌘', 'K'],
    group: 'actions',
    onSelect: () => console.log('Search facilities'),
  },
  {
    id: 'profile',
    label: 'Min profil',
    description: 'Rediger profilinnstillinger',
    group: 'settings',
    onSelect: () => console.log('Open profile'),
  },
  {
    id: 'notifications',
    label: 'Varsler',
    description: 'Administrer varslingsinnstillinger',
    group: 'settings',
    onSelect: () => console.log('Open notifications'),
  },
  {
    id: 'logout',
    label: 'Logg ut',
    description: 'Logg ut av kontoen',
    group: 'settings',
    onSelect: () => console.log('Logout'),
  },
];

// =============================================================================
// Timeline Stories
// =============================================================================

type TimelineStory = StoryObj<typeof Timeline>;

/**
 * Activity timeline with connectors
 */
export const TimelineDefault: TimelineStory = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Timeline items={sampleTimelineItems} showConnector />
    </div>
  ),
};

/**
 * Timeline without connectors
 */
export const TimelineNoConnectors: TimelineStory = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Timeline items={sampleTimelineItems} showConnector={false} />
    </div>
  ),
};

/**
 * Timeline loading state
 */
export const TimelineLoading: TimelineStory = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Timeline items={[]} loading />
    </div>
  ),
};

/**
 * Timeline empty state
 */
export const TimelineEmpty: TimelineStory = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Timeline items={[]} emptyMessage="Ingen aktivitet ennå" />
    </div>
  ),
};

/**
 * Compact timeline for sidebars
 */
export const TimelineCompact: TimelineStory = {
  render: () => (
    <div style={{ maxWidth: '300px' }}>
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
          Siste aktivitet
        </Heading>
        <CompactTimeline items={compactTimelineItems} maxItems={5} />
      </Card>
    </div>
  ),
};

// =============================================================================
// Progress Stories
// =============================================================================

type ProgressStory = StoryObj<typeof ProgressBar>;

/**
 * Progress bar variants
 */
export const ProgressBarDefault: ProgressStory = {
  render: () => (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <ProgressBar value={25} showLabel labelPosition="outside" />
      <ProgressBar value={50} variant="success" showLabel labelPosition="outside" />
      <ProgressBar value={75} variant="warning" showLabel labelPosition="outside" />
      <ProgressBar value={90} variant="danger" showLabel labelPosition="outside" />
    </div>
  ),
};

/**
 * Progress bar sizes
 */
export const ProgressBarSizes: ProgressStory = {
  render: () => (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <div>
        <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-1) 0' }}>Small</Paragraph>
        <ProgressBar value={60} size="sm" />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-1) 0' }}>Medium</Paragraph>
        <ProgressBar value={60} size="md" />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-1) 0' }}>Large</Paragraph>
        <ProgressBar value={60} size="lg" showLabel labelPosition="inside" />
      </div>
    </div>
  ),
};

/**
 * Striped and animated progress bar
 */
export const ProgressBarAnimated: ProgressStory = {
  render: () => (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <ProgressBar value={45} striped showLabel labelPosition="top" />
      <ProgressBar value={65} striped animated variant="info" showLabel labelPosition="top" />
    </div>
  ),
};

/**
 * Progress ring
 */
export const ProgressRingDefault: ProgressStory = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-6)', flexWrap: 'wrap' }}>
      <ProgressRing value={25} />
      <ProgressRing value={50} variant="success" />
      <ProgressRing value={75} variant="warning" />
      <ProgressRing value={100} variant="info" />
    </div>
  ),
};

/**
 * Progress ring sizes
 */
export const ProgressRingSizes: ProgressStory = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-6)', alignItems: 'center', flexWrap: 'wrap' }}>
      <ProgressRing value={60} size={60} strokeWidth={4} />
      <ProgressRing value={60} size={100} strokeWidth={8} />
      <ProgressRing value={60} size={140} strokeWidth={12} />
    </div>
  ),
};

/**
 * Progress steps / stepper
 */
export const ProgressStepsDefault: ProgressStory = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const steps = ['Velg anlegg', 'Velg tid', 'Bekreft', 'Betaling'];

    return (
      <div style={{ maxWidth: '600px' }}>
        <ProgressSteps steps={steps} currentStep={currentStep} />
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-6)' }}>
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Forrige
          </Button>
          <Button
            variant="primary"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Neste
          </Button>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Modal Stories
// =============================================================================

type ModalStory = StoryObj<typeof Modal>;

/**
 * Basic modal
 */
export const ModalDefault: ModalStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Eksempel modal"
        >
          <Paragraph>Dette er innholdet i modalen. Du kan legge hva som helst her.</Paragraph>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with footer
 */
export const ModalWithFooter: ModalStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne modal med footer</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Bekreft handling"
          footer={
            <ModalFooter>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Avbryt</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Bekreft</Button>
            </ModalFooter>
          }
        >
          <Paragraph>Er du sikker på at du vil fortsette med denne handlingen?</Paragraph>
        </Modal>
      </>
    );
  },
};

/**
 * Modal sizes
 */
export const ModalSizes: ModalStory = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);

    return (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
        <Button onClick={() => setSize('sm')}>Small</Button>
        <Button onClick={() => setSize('md')}>Medium</Button>
        <Button onClick={() => setSize('lg')}>Large</Button>
        <Button onClick={() => setSize('xl')}>Extra Large</Button>
        {size && (
          <Modal
            isOpen
            onClose={() => setSize(null)}
            title={`${size.toUpperCase()} Modal`}
            size={size}
          >
            <Paragraph>Dette er en {size} modal.</Paragraph>
          </Modal>
        )}
      </div>
    );
  },
};

/**
 * Modal with form
 */
export const ModalWithForm: ModalStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne skjema</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Opprett ny bruker"
          size="md"
          footer={
            <ModalFooter>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Avbryt</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Lagre</Button>
            </ModalFooter>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textfield label="Navn" placeholder="Ola Nordmann" />
            <Textfield label="E-post" type="email" placeholder="ola@example.no" />
            <Textfield label="Telefon" placeholder="+47 123 45 678" />
          </div>
        </Modal>
      </>
    );
  },
};

// =============================================================================
// Popover Stories
// =============================================================================

type PopoverStory = StoryObj<typeof Popover>;

/**
 * Basic popover
 */
export const PopoverDefault: PopoverStory = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-10)' }}>
      <Popover
        content={
          <PopoverBody>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              Dette er popover-innhold
            </Paragraph>
          </PopoverBody>
        }
      >
        <Button>Klikk for popover</Button>
      </Popover>
    </div>
  ),
};

/**
 * Popover with header and footer
 */
export const PopoverRich: PopoverStory = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-10)' }}>
      <Popover
        content={
          <>
            <PopoverHeader>Brukerinfo</PopoverHeader>
            <PopoverBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm" style={{ margin: 0 }}>Ola Nordmann</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  ola@example.no
                </Paragraph>
              </div>
            </PopoverBody>
            <PopoverFooter>
              <Button data-size="sm" variant="tertiary">Se profil</Button>
            </PopoverFooter>
          </>
        }
        position="bottom-start"
      >
        <Button>Vis brukerinfo</Button>
      </Popover>
    </div>
  ),
};

/**
 * Popover positions
 */
export const PopoverPositions: PopoverStory = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--ds-spacing-4)',
      padding: 'var(--ds-spacing-20)',
      justifyItems: 'center',
    }}>
      <Popover content={<PopoverBody>Top Start</PopoverBody>} position="top-start">
        <Button data-size="sm">Top Start</Button>
      </Popover>
      <Popover content={<PopoverBody>Top</PopoverBody>} position="top">
        <Button data-size="sm">Top</Button>
      </Popover>
      <Popover content={<PopoverBody>Top End</PopoverBody>} position="top-end">
        <Button data-size="sm">Top End</Button>
      </Popover>
      <Popover content={<PopoverBody>Left</PopoverBody>} position="left">
        <Button data-size="sm">Left</Button>
      </Popover>
      <div />
      <Popover content={<PopoverBody>Right</PopoverBody>} position="right">
        <Button data-size="sm">Right</Button>
      </Popover>
      <Popover content={<PopoverBody>Bottom Start</PopoverBody>} position="bottom-start">
        <Button data-size="sm">Bottom Start</Button>
      </Popover>
      <Popover content={<PopoverBody>Bottom</PopoverBody>} position="bottom">
        <Button data-size="sm">Bottom</Button>
      </Popover>
      <Popover content={<PopoverBody>Bottom End</PopoverBody>} position="bottom-end">
        <Button data-size="sm">Bottom End</Button>
      </Popover>
    </div>
  ),
};

/**
 * Hover trigger popover
 */
export const PopoverHover: PopoverStory = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-10)' }}>
      <Popover
        content={
          <PopoverBody>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              Hold musepekeren over for å se dette
            </Paragraph>
          </PopoverBody>
        }
        trigger="hover"
      >
        <Button>Hover over meg</Button>
      </Popover>
    </div>
  ),
};

// =============================================================================
// CommandPalette Stories
// =============================================================================

type CommandPaletteStory = StoryObj<typeof CommandPalette>;

/**
 * Command palette with groups
 */
export const CommandPaletteDefault: CommandPaletteStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <Paragraph>
            Trykk på knappen nedenfor eller bruk <kbd style={{ padding: 'var(--ds-spacing-1)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-sm)' }}>⌘K</kbd> for å åpne kommandopaletten.
          </Paragraph>
          <Button onClick={() => setIsOpen(true)}>Åpne kommandopaletten</Button>
        </div>
        <CommandPalette
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          commands={sampleCommands}
          groups={commandGroups}
          placeholder="Søk etter kommandoer..."
          emptyMessage="Ingen kommandoer funnet"
        />
      </>
    );
  },
};

/**
 * Command palette with recent items
 */
export const CommandPaletteWithRecent: CommandPaletteStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne med nylige</Button>
        <CommandPalette
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          commands={sampleCommands}
          groups={commandGroups}
          recentIds={['new-booking', 'bookings']}
          maxRecent={3}
          placeholder="Søk etter kommandoer..."
        />
      </>
    );
  },
};

/**
 * Command palette with hook
 */
export const CommandPaletteHook: CommandPaletteStory = {
  render: () => {
    const { isOpen, open, close } = useCommandPalette();

    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <Paragraph>
            Bruk <kbd style={{ padding: 'var(--ds-spacing-1)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-sm)' }}>⌘K</kbd> / <kbd style={{ padding: 'var(--ds-spacing-1)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-sm)' }}>Ctrl+K</kbd> for å åpne/lukke.
          </Paragraph>
          <Button onClick={open}>Eller klikk her</Button>
        </div>
        <CommandPalette
          isOpen={isOpen}
          onClose={close}
          commands={sampleCommands}
          groups={commandGroups}
        />
      </>
    );
  },
};

// =============================================================================
// Drawer Stories
// =============================================================================

type DrawerStory = StoryObj<typeof Drawer>;

/**
 * Right drawer
 */
export const DrawerRight: DrawerStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne drawer (høyre)</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Min bestilling"
          position="right"
          badge={3}
          footer={
            <Button variant="primary" style={{ width: '100%' }}>
              Gå til kassen
            </Button>
          }
        >
          <DrawerSection title="Valgte anlegg">
            <DrawerItem
              left={<Checkbox aria-label="Idrettshall A" checked />}
              right="250 kr"
            >
              Idrettshall A - 15. jan 10:00-12:00
            </DrawerItem>
            <DrawerItem
              left={<Checkbox aria-label="Svømmehall" checked />}
              right="300 kr"
            >
              Svømmehall - 16. jan 14:00-16:00
            </DrawerItem>
            <DrawerItem
              left={<Checkbox aria-label="Møterom B" checked />}
              right="150 kr"
            >
              Møterom B - 17. jan 09:00-10:00
            </DrawerItem>
          </DrawerSection>
        </Drawer>
      </>
    );
  },
};

/**
 * Left drawer with filters
 */
export const DrawerLeftFilters: DrawerStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne filtre</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Filtre"
          position="left"
          size="sm"
        >
          <DrawerSection title="Type anlegg" collapsible>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Checkbox aria-label="Idrettshall" value="idrettshall">Idrettshall</Checkbox>
              <Checkbox aria-label="Svømmehall" value="svommehall">Svømmehall</Checkbox>
              <Checkbox aria-label="Kulturhus" value="kulturhus">Kulturhus</Checkbox>
              <Checkbox aria-label="Møtelokale" value="motelokale">Møtelokale</Checkbox>
            </div>
          </DrawerSection>
          <DrawerSection title="Pris" collapsible defaultCollapsed>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Checkbox aria-label="Gratis" value="free">Gratis</Checkbox>
              <Checkbox aria-label="Under 500 kr" value="low">Under 500 kr</Checkbox>
              <Checkbox aria-label="500 - 1000 kr" value="medium">500 - 1000 kr</Checkbox>
              <Checkbox aria-label="Over 1000 kr" value="high">Over 1000 kr</Checkbox>
            </div>
          </DrawerSection>
          <DrawerSection title="Fasiliteter" collapsible defaultCollapsed>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Checkbox aria-label="WiFi" value="wifi">WiFi</Checkbox>
              <Checkbox aria-label="Parkering" value="parking">Parkering</Checkbox>
              <Checkbox aria-label="Rullestoltilpasset" value="accessible">Rullestoltilpasset</Checkbox>
              <Checkbox aria-label="Kjøkken" value="kitchen">Kjøkken</Checkbox>
            </div>
          </DrawerSection>
        </Drawer>
      </>
    );
  },
};

/**
 * Bottom drawer (mobile style)
 */
export const DrawerBottom: DrawerStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne bunndrawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Velg handling"
          position="bottom"
          size="sm"
          showHandle
        >
          <DrawerItem onClick={() => { console.log('Edit'); setIsOpen(false); }}>
            Rediger booking
          </DrawerItem>
          <DrawerItem onClick={() => { console.log('Duplicate'); setIsOpen(false); }}>
            Dupliser booking
          </DrawerItem>
          <DrawerItem onClick={() => { console.log('Share'); setIsOpen(false); }}>
            Del med andre
          </DrawerItem>
          <DrawerItem onClick={() => { console.log('Cancel'); setIsOpen(false); }}>
            Kanseller booking
          </DrawerItem>
        </Drawer>
      </>
    );
  },
};

/**
 * Drawer with empty state
 */
export const DrawerEmpty: DrawerStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne tom drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Mine favoritter"
          position="right"
        >
          <DrawerEmptyState
            title="Ingen favoritter ennå"
            description="Legg til anlegg som favoritter for rask tilgang senere."
            action={<Button variant="primary" onClick={() => setIsOpen(false)}>Utforsk anlegg</Button>}
          />
        </Drawer>
      </>
    );
  },
};

// =============================================================================
// ConfirmDialog Stories
// =============================================================================

type ConfirmDialogStory = StoryObj<typeof ConfirmDialog>;

/**
 * Default confirm dialog
 */
export const ConfirmDialogDefault: ConfirmDialogStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Åpne bekreftelsesdialog</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Confirmed');
            setIsOpen(false);
          }}
          title="Bekreft handling"
          description="Er du sikker på at du vil fortsette med denne handlingen?"
          confirmLabel="Bekreft"
          cancelLabel="Avbryt"
        />
      </>
    );
  },
};

/**
 * Danger confirm dialog
 */
export const ConfirmDialogDanger: ConfirmDialogStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="primary" color="danger" onClick={() => setIsOpen(true)}>
          Slett booking
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Deleted');
            setIsOpen(false);
          }}
          title="Slett booking"
          description="Er du sikker på at du vil slette denne bookingen? Denne handlingen kan ikke angres."
          confirmLabel="Slett"
          cancelLabel="Avbryt"
          variant="danger"
        />
      </>
    );
  },
};

/**
 * Warning confirm dialog
 */
export const ConfirmDialogWarning: ConfirmDialogStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Kanseller booking</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Cancelled');
            setIsOpen(false);
          }}
          title="Kanseller booking"
          description="Er du sikker på at du vil kansellere denne bookingen? Du vil motta en refusjon innen 5-7 virkedager."
          confirmLabel="Kanseller"
          cancelLabel="Behold booking"
          variant="warning"
        />
      </>
    );
  },
};

/**
 * Confirm dialog with loading
 */
export const ConfirmDialogLoading: ConfirmDialogStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsOpen(false);
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Lagre endringer</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          title="Lagre endringer"
          description="Vil du lagre endringene du har gjort?"
          confirmLabel="Lagre"
          cancelLabel="Avbryt"
          isLoading={isLoading}
        />
      </>
    );
  },
};

/**
 * Action dialog with form
 */
export const ActionDialogForm: ConfirmDialogStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Legg til merknad</Button>
        <ActionDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Legg til merknad"
          description="Skriv inn en merknad for denne bookingen"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Avbryt</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Lagre merknad</Button>
            </>
          }
        >
          <Textfield
            label="Merknad"
            placeholder="Skriv merknad her..."
          />
        </ActionDialog>
      </>
    );
  },
};

/**
 * useConfirmDialog hook
 */
export const ConfirmDialogHook: ConfirmDialogStory = {
  render: () => {
    const { confirm, DialogComponent } = useConfirmDialog();

    const handleDelete = async () => {
      const confirmed = await confirm({
        title: 'Slett bruker',
        description: 'Er du sikker på at du vil slette denne brukeren?',
        confirmLabel: 'Slett',
        cancelLabel: 'Avbryt',
        variant: 'danger',
      });

      if (confirmed) {
        console.log('User deleted');
      } else {
        console.log('Deletion cancelled');
      }
    };

    return (
      <>
        <Button variant="primary" color="danger" onClick={handleDelete}>
          Slett bruker (med hook)
        </Button>
        {DialogComponent}
      </>
    );
  },
};

// =============================================================================
// Combined Example
// =============================================================================

/**
 * Dashboard with multiple utility components
 */
export const CombinedDashboard: StoryObj = {
  render: () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const { isOpen: commandOpen, open: openCommand, close: closeCommand } = useCommandPalette();

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--ds-spacing-6)' }}>
        <div>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="md" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
              Fremdrift
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-1) 0' }}>Onboarding</Paragraph>
                <ProgressBar value={75} variant="success" showLabel labelPosition="outside" />
              </div>
              <div>
                <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-1) 0' }}>Profilutfylling</Paragraph>
                <ProgressBar value={50} variant="info" showLabel labelPosition="outside" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-5)' }}>
              <Button onClick={() => setModalOpen(true)}>Ny booking</Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Vis filtre</Button>
              <Button variant="tertiary" onClick={openCommand}>⌘K Kommandoer</Button>
            </div>
          </Card>
        </div>

        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
            Siste aktivitet
          </Heading>
          <CompactTimeline items={compactTimelineItems.slice(0, 4)} />
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Ny booking"
          footer={
            <ModalFooter>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Avbryt</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>Opprett</Button>
            </ModalFooter>
          }
        >
          <Textfield label="Anlegg" placeholder="Søk etter anlegg..." />
        </Modal>

        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filtre"
          position="left"
          size="sm"
        >
          <DrawerSection title="Kategori" collapsible>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Checkbox aria-label="Alle" value="all" checked>Alle</Checkbox>
              <Checkbox aria-label="Idrett" value="sports">Idrett</Checkbox>
              <Checkbox aria-label="Kultur" value="culture">Kultur</Checkbox>
            </div>
          </DrawerSection>
        </Drawer>

        <CommandPalette
          isOpen={commandOpen}
          onClose={closeCommand}
          commands={sampleCommands}
          groups={commandGroups}
        />
      </div>
    );
  },
};
