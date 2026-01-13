import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { 
  Card, 
  Heading, 
  Paragraph, 
  Button, 
  Spinner, 
  SearchIcon,
  SendIcon,
  MessageSquareIcon,
  OrganizationIcon,
} from '@xala/ds';
import { useConversations, useMessages, useSendMessage, type Conversation, type Message, formatTime } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';

export function MessagesPage() {
  const t = useT();
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's conversations
  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const conversations = conversationsData?.data ?? [];

  // Filter conversations by search
  const filteredConversations = conversations.filter((c: Conversation) =>
    !searchQuery || (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useMessages(selectedConversationId ?? '', {
    enabled: !!selectedConversationId,
  });
  const messages = messagesData?.data ?? [];

  const sendMessageMutation = useSendMessage();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversationId,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation = conversations.find((c: Conversation) => c.id === selectedConversationId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('minside.messages')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('minside.messagesDesc')}
        </Paragraph>
      </div>

      {/* Messages Container */}
      <Card style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex' }}>
        {/* Conversations List */}
        <div
          style={{
            width: '320px',
            borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search */}
          <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={t('messages.searchConversations')}
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                  paddingRight: 'var(--ds-spacing-10)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-sm)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              />
              <div style={{ position: 'absolute', right: 'var(--ds-spacing-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loadingConversations ? (
              <div style={{ padding: 'var(--ds-spacing-8)', display: 'flex', justifyContent: 'center' }}>
                <Spinner aria-label={t('messages.loadingConversations')} data-size="md" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--ds-spacing-4)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}>
                  <MessageSquareIcon />
                </div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                  {t('messages.noConversations')}
                </Paragraph>
              </div>
            ) : (
              filteredConversations.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    cursor: 'pointer',
                    backgroundColor: selectedConversationId === conversation.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                    borderLeft: selectedConversationId === conversation.id
                      ? '3px solid var(--ds-color-accent-base-default)'
                      : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-brand-1-base-default)',
                      flexShrink: 0,
                    }}>
                      <OrganizationIcon />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600, color: 'var(--ds-color-neutral-text-default)' }}>
                          {String(conversation.subject || t('messages.unknownUser'))}
                        </Paragraph>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <div
                            style={{
                              minWidth: '20px',
                              height: '20px',
                              borderRadius: 'var(--ds-border-radius-full)',
                              backgroundColor: 'var(--ds-color-danger-base-default)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--ds-font-size-xs)',
                              fontWeight: 700,
                              padding: '0 var(--ds-spacing-1)',
                            }}
                          >
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <Paragraph
                          data-size="xs"
                          style={{
                            margin: 0,
                            marginTop: 'var(--ds-spacing-1)',
                            color: 'var(--ds-color-neutral-text-default)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {typeof conversation.lastMessage === 'object' && conversation.lastMessage !== null
                            ? String((conversation.lastMessage as { content?: string }).content || '')
                            : String(conversation.lastMessage)}
                        </Paragraph>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-color-brand-1-base-default)',
                }}>
                  <OrganizationIcon />
                </div>
                <div>
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    {String(selectedConversation.subject || t('messages.unknownUser'))}
                  </Heading>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-background-subtle)' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <Spinner aria-label={t('messages.loadingConversations')} data-size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto var(--ds-spacing-4)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}>
                      <MessageSquareIcon />
                    </div>
                    <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                      {t('messages.noMessagesYet')}
                    </Paragraph>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                    {messages.map((message: Message) => {
                      const isOwnMessage = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          style={{
                            display: 'flex',
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                              borderRadius: 'var(--ds-border-radius-lg)',
                              backgroundColor: isOwnMessage
                                ? 'var(--ds-color-brand-1-base-default)'
                                : 'var(--ds-color-neutral-background-default)',
                              color: isOwnMessage ? 'white' : 'var(--ds-color-neutral-text-default)',
                            }}
                          >
                            <Paragraph data-size="sm" style={{ margin: 0, color: 'inherit' }}>
                              {String(message.content)}
                            </Paragraph>
                            <Paragraph
                              data-size="xs"
                              style={{
                                margin: 0,
                                marginTop: 'var(--ds-spacing-1)',
                                opacity: 0.7,
                                textAlign: 'right',
                              }}
                            >
                              {formatTime(message.createdAt)}
                            </Paragraph>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                  display: 'flex',
                  gap: 'var(--ds-spacing-2)',
                }}
              >
                <input
                  type="text"
                  placeholder={t('messages.writeMessage')}
                  value={newMessage}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  data-size="md"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <SendIcon />
                  {t('messages.send')}
                </Button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--ds-spacing-4)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}>
                <MessageSquareIcon />
              </div>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                {t('messages.selectConversation')}
              </Paragraph>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
