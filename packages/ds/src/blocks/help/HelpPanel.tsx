/**
 * HelpPanel - Three-Tiered Help System
 *
 * Provides contextual assistance through three levels:
 * - Level 1: Quick tooltips (inline help)
 * - Level 2: Step-by-step guides
 * - Level 3: Comprehensive FAQ
 *
 * Usage:
 * ```tsx
 * <HelpPanel
 *   level={2}
 *   title="How to Create a Booking"
 *   content={guideContent}
 *   category="bookings"
 * />
 * ```
 */
import React, { useState } from 'react';
import { Card, Badge, Heading, Paragraph, Button, Alert, Link } from '@xala/ds';
import {
  InfoIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CloseIcon,
} from '@xala/ds';

export type HelpLevel = 1 | 2 | 3;

export type HelpCategory =
  | 'general'
  | 'bookings'
  | 'rental-objects'
  | 'users'
  | 'organizations'
  | 'reports'
  | 'settings'
  | 'integrations';

/**
 * Tooltip content (Level 1)
 */
export interface TooltipContent {
  content: string;
  learnMoreUrl?: string;
}

/**
 * Guide content (Level 2)
 */
export interface HelpGuideStep {
  title: string;
  content: string;
  screenshot?: string;
  code?: string;
}

export interface GuideContent {
  title: string;
  description: string;
  steps: HelpGuideStep[];
  estimatedTime?: string;
}

/**
 * FAQ content (Level 3)
 */
export interface FAQItem {
  question: string;
  answer: string;
  category: HelpCategory;
  tags?: string[];
}

export interface HelpPanelProps {
  /** Help level (1=tooltip, 2=guide, 3=FAQ) */
  level: HelpLevel;
  /** Help title */
  title?: string;
  /** Help content (varies by level) */
  content: TooltipContent | GuideContent | FAQItem[];
  /** Help category */
  category?: HelpCategory;
  /** Position (for Level 1 tooltip) */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Allow closing */
  closeable?: boolean;
  /** Close callback */
  onClose?: () => void;
}

/**
 * Level 1: Tooltip Help
 */
function TooltipHelp({
  content,
  position = 'bottom',
  closeable = true,
  onClose,
}: {
  content: TooltipContent;
  position?: 'top' | 'bottom' | 'left' | 'right';
  closeable?: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        maxWidth: '320px',
      }}
    >
      <Card
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          border: '1px solid var(--ds-color-neutral-border-default)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
            <InfoIcon
              style={{
                color: 'var(--ds-color-accent-base-default)',
                flexShrink: 0,
              }}
            />
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                flex: 1,
              }}
            >
              {content.content}
            </Paragraph>
            {closeable && onClose && (
              <Button
                type="button"
                variant="tertiary"
                data-size="sm"
                onClick={onClose}
                style={{
                  padding: 'var(--ds-spacing-2)',
                  minWidth: 'auto',
                }}
              >
                <CloseIcon />
              </Button>
            )}
          </div>
          {content.learnMoreUrl && (
            <Link href={content.learnMoreUrl} data-size="sm">
              Learn more →
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Level 2: Guide Help
 */
function GuideHelp({
  content,
  closeable = true,
  onClose,
}: {
  content: GuideContent;
  closeable?: boolean;
  onClose?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { title, description, steps, estimatedTime } = content;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
              <BookOpenIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
              <Heading data-size="sm" style={{ margin: 0 }}>
                {title}
              </Heading>
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {description}
            </Paragraph>
            {estimatedTime && (
              <Badge data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
                {estimatedTime}
              </Badge>
            )}
          </div>
          {closeable && onClose && (
            <Button type="button" variant="tertiary" data-size="sm" onClick={onClose}>
              <CloseIcon />
            </Button>
          )}
        </div>

        {/* Progress indicators */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor:
                  index <= currentStep
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-border-subtle)',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        {step && (
          <div>
            <Badge data-size="sm">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Heading data-size="xs" style={{ marginTop: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-3)' }}>
              {step.title}
            </Heading>
            <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              {step.content}
            </Paragraph>

            {step.screenshot && (
              <img
                src={step.screenshot}
                alt={`Step ${currentStep + 1} screenshot`}
                style={{
                  width: '100%',
                  borderRadius: 'var(--ds-border-radius-md)',
                  marginBottom: 'var(--ds-spacing-4)',
                }}
              />
            )}

            {step.code && (
              <div
                style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontFamily: 'var(--ds-font-family-mono)',
                  fontSize: 'var(--ds-font-size-sm)',
                  overflowX: 'auto',
                }}
              >
                <code>{step.code}</code>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Button
            type="button"
            variant="secondary"
            data-size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeftIcon /> Previous
          </Button>
          <Button
            type="button"
            variant="primary"
            data-size="sm"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? 'Done' : 'Next'} <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Level 3: FAQ Help
 */
function FAQHelp({
  content,
  category,
  closeable = true,
  onClose,
}: {
  content: FAQItem[];
  category?: HelpCategory;
  closeable?: boolean;
  onClose?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>(category || 'all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Filter FAQs
  const filteredFAQs = content.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const categorizedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<HelpCategory, FAQItem[]>);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Heading data-size="sm" style={{ margin: 0 }}>
              Frequently Asked Questions
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Find answers to common questions
            </Paragraph>
          </div>
          {closeable && onClose && (
            <Button type="button" variant="tertiary" data-size="sm" onClick={onClose}>
              <CloseIcon />
            </Button>
          )}
        </div>

        {/* Search - simplified input */}
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            fontSize: 'var(--ds-font-size-md)',
          }}
        />

        {/* FAQ Items */}
        {Object.entries(categorizedFAQs).map(([cat, faqs]) => (
          <div key={cat}>
            <Heading data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)', textTransform: 'capitalize' }}>
              {cat} ({faqs.length})
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {faqs.map((faq, index) => {
                const globalIndex = content.indexOf(faq);
                const isExpanded = expandedItems.has(globalIndex);

                return (
                  <div
                    key={globalIndex}
                    style={{
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(globalIndex)}
                      style={{
                        width: '100%',
                        padding: 'var(--ds-spacing-4)',
                        textAlign: 'left',
                        background: 'var(--ds-color-neutral-surface-default)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'var(--ds-font-weight-semibold)',
                      }}
                    >
                      <span>{faq.question}</span>
                      <ChevronRightIcon
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>
                    {isExpanded && (
                      <div style={{ padding: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                        <Paragraph>{faq.answer}</Paragraph>
                        {faq.tags && faq.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-3)' }}>
                            {faq.tags.map((tag) => (
                              <Badge key={tag} data-size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFAQs.length === 0 && (
          <Alert data-color="info">
            No help articles found. Try a different search term or category.
          </Alert>
        )}
      </div>
    </Card>
  );
}

/**
 * HelpPanel - Main component
 */
export function HelpPanel({
  level,
  title,
  content,
  category,
  position,
  closeable = true,
  onClose,
}: HelpPanelProps) {
  if (level === 1) {
    return (
      <TooltipHelp
        content={content as TooltipContent}
        position={position}
        closeable={closeable}
        onClose={onClose}
      />
    );
  }

  if (level === 2) {
    return (
      <GuideHelp
        content={content as GuideContent}
        closeable={closeable}
        onClose={onClose}
      />
    );
  }

  if (level === 3) {
    return (
      <FAQHelp
        content={content as FAQItem[]}
        category={category}
        closeable={closeable}
        onClose={onClose}
      />
    );
  }

  return null;
}
