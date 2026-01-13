import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { Card, Heading, Paragraph, Button, Spinner, SearchIcon } from '@xala/ds';
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
    !searchQuery || c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useMessages(selectedConversationId!, {
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
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
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
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
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
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {conversation.subject || t('messages.unknownUser')}
                    </Paragraph>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div
                        style={{
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: 'var(--ds-color-accent-base-default)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--ds-font-size-xs)',
                          fontWeight: 'var(--ds-font-weight-bold)',
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
                        color: 'var(--ds-color-neutral-text-subtle)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conversation.lastMessage}
                    </Paragraph>
                  )}
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
                }}
              >
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  {selectedConversation.subject || t('messages.unknownUser')}
                </Heading>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4)' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <Spinner aria-label={t('messages.loadingConversations')} data-size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
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
                                ? 'var(--ds-color-accent-surface-default)'
                                : 'var(--ds-color-neutral-surface-hover)',
                            }}
                          >
                            <Paragraph data-size="sm" style={{ margin: 0 }}>
                              {message.content}
                            </Paragraph>
                            <Paragraph
                              data-size="xs"
                              style={{
                                margin: 0,
                                marginTop: 'var(--ds-spacing-1)',
                                color: 'var(--ds-color-neutral-text-subtle)',
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
                  {t('messages.send')}
                </Button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('messages.selectConversation')}
              </Paragraph>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
