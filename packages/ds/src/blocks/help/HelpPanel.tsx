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
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Accordion,
  Search,
  Box,
  Stack,
  Alert,
  Link,
} from '../../primitives';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CloseIcon,
} from '../../primitives';

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

export interface HelpTooltip {
  content: string;
  learnMoreUrl?: string;
}

export interface HelpGuideStep {
  title: string;
  content: string;
  screenshot?: string;
  code?: string;
}

export interface HelpGuide {
  title: string;
  description: string;
  category: HelpCategory;
  steps: HelpGuideStep[];
  relatedGuides?: string[];
}

export interface HelpFAQItem {
  question: string;
  answer: string;
  category: HelpCategory;
  tags?: string[];
  relatedQuestions?: string[];
}

export interface HelpPanelProps {
  /**
   * Help level
   * 1 = Tooltip (inline contextual help)
   * 2 = Guide (step-by-step walkthrough)
   * 3 = FAQ (comprehensive searchable help)
   */
  level: HelpLevel;

  /**
   * Title for the help content
   */
  title?: string;

  /**
   * Help content (varies by level)
   */
  content: HelpTooltip | HelpGuide | HelpFAQItem[];

  /**
   * Category for filtering and navigation
   */
  category?: HelpCategory;

  /**
   * Position for tooltip (level 1 only)
   */
  position?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Size of the help panel
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show close button
   */
  closeable?: boolean;

  /**
   * Callback when help is closed
   */
  onClose?: () => void;

  /**
   * Custom CSS class
   */
  className?: string;
}

/**
 * Level 1: Tooltip Help
 */
function TooltipHelp({
  content,
  position = 'top',
  closeable,
  onClose,
}: {
  content: HelpTooltip;
  position?: 'top' | 'bottom' | 'left' | 'right';
  closeable?: boolean;
  onClose?: () => void;
}) {
  return (
    <Box
      style={{
        position: 'relative',
        display: 'inline-block',
        maxWidth: '320px',
      }}
    >
      <Card
        variant="outlined"
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderColor: 'var(--ds-color-neutral-border-default)',
        }}
      >
        <Stack gap={3}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
            <QuestionMarkCircleIcon
              style={{
                color: 'var(--ds-color-accent-base-default)',
                flexShrink: 0,
              }}
            />
            <Paragraph
              size="sm"
              style={{
                margin: 0,
                flex: 1,
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {content.content}
            </Paragraph>
            {closeable && onClose && (
              <Button
                variant="tertiary"
                size="sm"
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
            <Link href={content.learnMoreUrl} size="sm">
              Learn more →
            </Link>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

/**
 * Level 2: Guide Help
 */
function GuideHelp({
  content,
  closeable,
  onClose,
}: {
  content: HelpGuide;
  closeable?: boolean;
  onClose?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { steps } = content;
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
        maxWidth: '720px',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <Stack gap={4}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <BookOpenIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
            <div>
              <Heading size="sm" style={{ margin: 0 }}>
                {content.title}
              </Heading>
              <Paragraph size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {content.description}
              </Paragraph>
            </div>
          </div>
          {closeable && onClose && (
            <Button variant="tertiary" size="sm" onClick={onClose}>
              <CloseIcon />
            </Button>
          )}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor:
                  index <= currentStep
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-border-subtle)',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div>
          <Badge color="accent" size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Step {currentStep + 1} of {steps.length}
          </Badge>
          <Heading size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            {step.title}
          </Heading>
          <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>{step.content}</Paragraph>

          {step.screenshot && (
            <img
              src={step.screenshot}
              alt={step.title}
              style={{
                width: '100%',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                marginBottom: 'var(--ds-spacing-4)',
              }}
            />
          )}

          {step.code && (
            <Box
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
            </Box>
          )}
        </div>

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
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeftIcon /> Previous
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            Next <ChevronRightIcon />
          </Button>
        </div>

        {/* Related Guides */}
        {content.relatedGuides && content.relatedGuides.length > 0 && (
          <Alert variant="info" size="sm">
            <div>
              <strong>Related guides:</strong>{' '}
              {content.relatedGuides.map((guide, index) => (
                <React.Fragment key={guide}>
                  <Link href={`/help/guides/${guide}`}>{guide}</Link>
                  {index < content.relatedGuides!.length - 1 && ', '}
                </React.Fragment>
              ))}
            </div>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}

/**
 * Level 3: FAQ Help
 */
function FAQHelp({
  content,
  category,
  closeable,
  onClose,
}: {
  content: HelpFAQItem[];
  category?: HelpCategory;
  closeable?: boolean;
  onClose?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>(
    category || 'all'
  );

  // Filter FAQs
  const filteredFAQs = content.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Group by category
  const categorizedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<HelpCategory, HelpFAQItem[]>);

  return (
    <Card
      style={{
        maxWidth: '960px',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <Stack gap={4}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Heading size="md" style={{ margin: 0 }}>
            Frequently Asked Questions
          </Heading>
          {closeable && onClose && (
            <Button variant="tertiary" size="sm" onClick={onClose}>
              <CloseIcon />
            </Button>
          )}
        </div>

        {/* Search */}
        <Search
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%' }}
        />

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {Array.from(new Set(content.map((f) => f.category))).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        {filteredFAQs.length === 0 ? (
          <Alert variant="info">No help articles found matching your search.</Alert>
        ) : (
          Object.entries(categorizedFAQs).map(([category, faqs]) => (
            <div key={category}>
              <Heading size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </Heading>
              <Accordion>
                {faqs.map((faq, index) => (
                  <Accordion.Item key={index} value={`${category}-${index}`}>
                    <Accordion.Trigger>{faq.question}</Accordion.Trigger>
                    <Accordion.Content>
                      <Paragraph style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                        {faq.answer}
                      </Paragraph>
                      {faq.tags && faq.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                          {faq.tags.map((tag) => (
                            <Badge key={tag} size="sm" color="neutral">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
                        <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
                          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                            <strong>Related:</strong>{' '}
                            {faq.relatedQuestions.map((q, i) => (
                              <React.Fragment key={q}>
                                <Link href="#" size="sm">{q}</Link>
                                {i < faq.relatedQuestions!.length - 1 && ', '}
                              </React.Fragment>
                            ))}
                          </Paragraph>
                        </div>
                      )}
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </Stack>
    </Card>
  );
}

/**
 * Main HelpPanel Component
 */
export function HelpPanel({
  level,
  content,
  category,
  position = 'top',
  size = 'md',
  closeable = false,
  onClose,
  className,
  ...props
}: HelpPanelProps) {
  if (level === 1) {
    return (
      <TooltipHelp
        content={content as HelpTooltip}
        position={position}
        closeable={closeable}
        onClose={onClose}
      />
    );
  }

  if (level === 2) {
    return (
      <GuideHelp
        content={content as HelpGuide}
        closeable={closeable}
        onClose={onClose}
      />
    );
  }

  if (level === 3) {
    return (
      <FAQHelp
        content={content as HelpFAQItem[]}
        category={category}
        closeable={closeable}
        onClose={onClose}
      />
    );
  }

  return null;
}

// Export types
export type { HelpTooltip as TooltipContent, HelpGuide as GuideContent, HelpFAQItem as FAQItem };
