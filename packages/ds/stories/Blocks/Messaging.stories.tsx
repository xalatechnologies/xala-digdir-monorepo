import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
} from '@xala/ds';
import {
  ConversationList,
  ConversationListItem,
  ChatThread,
  MessageBubble,
} from '../../src/blocks/messaging';
import type { ConversationItem, MessageItem } from '../../src/blocks/messaging';

/**
 * Messaging components for chat and conversation functionality.
 *
 * ## Components
 * - **ConversationList**: List of conversations with search and filters
 * - **ConversationListItem**: Individual conversation in the list
 * - **ChatThread**: Complete chat view with messages and input
 * - **MessageBubble**: Single message bubble
 *
 * ## Features
 * - Real-time message display
 * - Read receipts
 * - Date separators
 * - Online status indicators
 * - Search and filtering
 */
const meta: Meta<typeof ConversationList> = {
  title: 'Blocks/Messaging',
  component: ConversationList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Messaging components for municipal communication systems.

## Use Cases
- Booking inquiries and communication
- Customer support chat
- Internal messaging between staff
- Notification conversations
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConversationList>;

// =============================================================================
// Sample Data
// =============================================================================

const sampleConversations: ConversationItem[] = [
  {
    id: 'conv-1',
    userName: 'Kari Nordmann',
    subject: 'Spørsmål om booking',
    lastMessage: 'Takk for rask tilbakemelding!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
    status: 'active',
    isOnline: true,
    bookingId: 'BK-2026-001',
  },
  {
    id: 'conv-2',
    userName: 'Per Hansen',
    subject: 'Avbestilling',
    lastMessage: 'Jeg må dessverre avbestille min booking for lørdag.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCount: 1,
    status: 'pending',
    isOnline: false,
  },
  {
    id: 'conv-3',
    userName: 'Lisa Johansen',
    subject: 'Forespørsel om ekstra utstyr',
    lastMessage: 'Er det mulig å leie projektor i tillegg?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 0,
    status: 'active',
    isOnline: true,
  },
  {
    id: 'conv-4',
    userName: 'Erik Berg',
    subject: 'Fakturaspørsmål',
    lastMessage: 'Jeg har mottatt fakturaen, alt ser bra ut.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    status: 'resolved',
    isOnline: false,
  },
  {
    id: 'conv-5',
    userName: 'Anne Olsen',
    subject: 'Tilgjengelighet i juni',
    lastMessage: 'Vi ser frem til å benytte lokalet!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    unreadCount: 0,
    status: 'resolved',
    isOnline: false,
  },
];

const sampleMessages: MessageItem[] = [
  {
    id: 'msg-1',
    content: 'Hei! Jeg har et spørsmål om min booking for neste uke.',
    senderId: 'user-1',
    senderName: 'Kari Nordmann',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    isFromCurrentUser: false,
  },
  {
    id: 'msg-2',
    content: 'Hei Kari! Selvfølgelig, hva lurer du på?',
    senderId: 'admin-1',
    senderName: 'Admin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    isRead: true,
    isFromCurrentUser: true,
  },
  {
    id: 'msg-3',
    content: 'Er det mulig å endre tidspunktet fra kl. 10 til kl. 14? Vi har fått en konflikt med et annet møte.',
    senderId: 'user-1',
    senderName: 'Kari Nordmann',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    isRead: true,
    isFromCurrentUser: false,
  },
  {
    id: 'msg-4',
    content: 'Ja, det går helt fint! Jeg har endret bookingen til kl. 14-17. Du vil motta en bekreftelse på e-post.',
    senderId: 'admin-1',
    senderName: 'Admin',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: true,
    isFromCurrentUser: true,
  },
  {
    id: 'msg-5',
    content: 'Takk for rask tilbakemelding!',
    senderId: 'user-1',
    senderName: 'Kari Nordmann',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    isFromCurrentUser: false,
  },
];

// =============================================================================
// ConversationList Stories
// =============================================================================

/**
 * Default conversation list
 */
export const ConversationListDefault: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
      <div style={{ width: '360px', height: '600px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <ConversationList
          conversations={sampleConversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    );
  },
};

/**
 * Conversation list with filters
 */
export const ConversationListWithFilters: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const filterTabs = [
      { id: 'all', label: 'Alle', count: 5 },
      { id: 'unread', label: 'Uleste', count: 2 },
      { id: 'active', label: 'Aktive', count: 2 },
      { id: 'resolved', label: 'Løst', count: 2 },
    ];

    const filteredConversations = activeFilter === 'all'
      ? sampleConversations
      : activeFilter === 'unread'
        ? sampleConversations.filter(c => (c.unreadCount ?? 0) > 0)
        : sampleConversations.filter(c => c.status === activeFilter);

    return (
      <div style={{ width: '360px', height: '600px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filterTabs={filterTabs}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>
    );
  },
};

/**
 * Empty conversation list
 */
export const ConversationListEmpty: Story = {
  render: () => (
    <div style={{ width: '360px', height: '400px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ConversationList
        conversations={[]}
        emptyMessage="Ingen samtaler å vise"
      />
    </div>
  ),
};

/**
 * Loading state
 */
export const ConversationListLoading: Story = {
  render: () => (
    <div style={{ width: '360px', height: '400px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ConversationList
        conversations={[]}
        isLoading={true}
      />
    </div>
  ),
};

// =============================================================================
// ConversationListItem Stories
// =============================================================================

/**
 * Individual conversation item
 */
export const ListItemDefault: Story = {
  render: () => (
    <div style={{ width: '360px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ConversationListItem
        conversation={sampleConversations[0]!}
        onClick={() => console.log('Clicked')}
      />
    </div>
  ),
};

/**
 * Selected conversation item
 */
export const ListItemSelected: Story = {
  render: () => (
    <div style={{ width: '360px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ConversationListItem
        conversation={sampleConversations[0]!}
        isSelected={true}
        onClick={() => console.log('Clicked')}
      />
    </div>
  ),
};

/**
 * Conversation without unread messages
 */
export const ListItemRead: Story = {
  render: () => (
    <div style={{ width: '360px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ConversationListItem
        conversation={sampleConversations[3]!}
        onClick={() => console.log('Clicked')}
      />
    </div>
  ),
};

// =============================================================================
// MessageBubble Stories
// =============================================================================

/**
 * Message from other user
 */
export const MessageFromOther: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', padding: 'var(--ds-spacing-4)' }}>
      <MessageBubble
        message={sampleMessages[0]!}
        isFromCurrentUser={false}
      />
    </div>
  ),
};

/**
 * Message from current user
 */
export const MessageFromMe: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', padding: 'var(--ds-spacing-4)' }}>
      <MessageBubble
        message={sampleMessages[1]!}
        isFromCurrentUser={true}
        showReadReceipt={true}
      />
    </div>
  ),
};

/**
 * Message with read receipt
 */
export const MessageWithReadReceipt: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', padding: 'var(--ds-spacing-4)' }}>
      <MessageBubble
        message={{ ...sampleMessages[1]!, isRead: true }}
        isFromCurrentUser={true}
        showReadReceipt={true}
      />
    </div>
  ),
};

/**
 * Long message
 */
export const MessageLong: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', padding: 'var(--ds-spacing-4)' }}>
      <MessageBubble
        message={{
          id: 'long-msg',
          content: 'Dette er en lengre melding som demonstrerer hvordan meldingsbobler håndterer tekst som går over flere linjer. Meldingene bryter automatisk og tilpasser seg innholdet på en naturlig måte.',
          senderId: 'user-1',
          senderName: 'Bruker',
          createdAt: new Date().toISOString(),
          isFromCurrentUser: false,
        }}
      />
    </div>
  ),
};

// =============================================================================
// ChatThread Stories
// =============================================================================

/**
 * Default chat thread
 */
export const ChatThreadDefault: Story = {
  render: () => {
    const [messages, setMessages] = useState<MessageItem[]>(sampleMessages);
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = (content: string) => {
      setIsSending(true);
      setTimeout(() => {
        const newMessage: MessageItem = {
          id: `msg-${Date.now()}`,
          content,
          senderId: 'admin-1',
          senderName: 'Admin',
          createdAt: new Date().toISOString(),
          isRead: false,
          isFromCurrentUser: true,
        };
        setMessages(prev => [...prev, newMessage]);
        setIsSending(false);
      }, 500);
    };

    return (
      <div style={{ width: '500px', height: '600px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <ChatThread
          messages={messages}
          currentUserId="admin-1"
          onSendMessage={handleSendMessage}
          isSending={isSending}
          showReadReceipts={true}
        />
      </div>
    );
  },
};

/**
 * Chat thread with header
 */
export const ChatThreadWithHeader: Story = {
  render: () => {
    const conversation = sampleConversations[0]!;

    const header = (
      <div style={{ padding: 'var(--ds-spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ds-color-accent-base-default)',
          fontWeight: 600,
        }}>
          KN
        </div>
        <div>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {conversation.userName}
          </Paragraph>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
            Online
          </Paragraph>
        </div>
      </div>
    );

    return (
      <div style={{ width: '500px', height: '600px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <ChatThread
          messages={sampleMessages}
          currentUserId="admin-1"
          onSendMessage={(content) => console.log('Send:', content)}
          header={header}
          showReadReceipts={true}
        />
      </div>
    );
  },
};

/**
 * Empty chat thread
 */
export const ChatThreadEmpty: Story = {
  render: () => (
    <div style={{ width: '500px', height: '400px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ChatThread
        messages={[]}
        onSendMessage={(content) => console.log('Send:', content)}
        emptyMessage="Start en samtale ved å sende en melding"
      />
    </div>
  ),
};

/**
 * Loading chat thread
 */
export const ChatThreadLoading: Story = {
  render: () => (
    <div style={{ width: '500px', height: '400px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ChatThread
        messages={[]}
        isLoading={true}
      />
    </div>
  ),
};

/**
 * Read-only chat thread (no input)
 */
export const ChatThreadReadOnly: Story = {
  render: () => (
    <div style={{ width: '500px', height: '400px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <ChatThread
        messages={sampleMessages}
        currentUserId="admin-1"
        showReadReceipts={true}
      />
    </div>
  ),
};

// =============================================================================
// Complete Messaging Interface
// =============================================================================

/**
 * Complete messaging interface with list and thread
 */
export const CompleteMessagingInterface: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>('conv-1');
    const [messages, setMessages] = useState<MessageItem[]>(sampleMessages);
    const [activeFilter, setActiveFilter] = useState('all');

    const filterTabs = [
      { id: 'all', label: 'Alle', count: 5 },
      { id: 'unread', label: 'Uleste', count: 2 },
    ];

    const selectedConversation = sampleConversations.find(c => c.id === selectedId);

    const handleSendMessage = (content: string) => {
      const newMessage: MessageItem = {
        id: `msg-${Date.now()}`,
        content,
        senderId: 'admin-1',
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isRead: false,
        isFromCurrentUser: true,
      };
      setMessages(prev => [...prev, newMessage]);
    };

    const header = selectedConversation && (
      <div style={{
        padding: 'var(--ds-spacing-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ds-color-accent-base-default)',
            fontWeight: 600,
          }}>
            {selectedConversation.userName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {selectedConversation.userName}
            </Paragraph>
            <Paragraph data-size="xs" style={{
              margin: 0,
              color: selectedConversation.isOnline
                ? 'var(--ds-color-success-text-default)'
                : 'var(--ds-color-neutral-text-subtle)'
            }}>
              {selectedConversation.isOnline ? 'Online' : 'Offline'}
            </Paragraph>
          </div>
        </div>
        {selectedConversation.bookingId && (
          <Button variant="tertiary" data-size="sm">
            Se booking
          </Button>
        )}
      </div>
    );

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        height: '650px',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        overflow: 'hidden',
      }}>
        {/* Conversation List */}
        <div style={{ borderRight: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <div style={{
            padding: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              Meldinger
            </Heading>
          </div>
          <ConversationList
            conversations={sampleConversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            filterTabs={filterTabs}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Chat Thread */}
        <div>
          {selectedId ? (
            <ChatThread
              messages={messages}
              currentUserId="admin-1"
              onSendMessage={handleSendMessage}
              header={header}
              showReadReceipts={true}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}>
              <Paragraph>Velg en samtale for å starte</Paragraph>
            </div>
          )}
        </div>
      </div>
    );
  },
};
