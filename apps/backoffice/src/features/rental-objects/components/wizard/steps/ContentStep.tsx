/**
 * Content Step Component
 * For rich content and FAQ (all categories)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textarea,
  Textfield,
  Button,
  Badge,
  BookOpenIcon,
  FileTextIcon,
  PlusIcon,
  TrashIcon,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '@/features/rental-objects';

export interface ContentStepProps {
  wizard: UseRentalObjectWizardReturn;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function ContentStep({ wizard }: ContentStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['content'] || [];

  const richContent = formData.richContent || '';
  const faqs = (formData.faqs || []) as FAQ[];

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
    };
    updateFormData({ faqs: [...faqs, newFAQ] });
  };

  const removeFAQ = (id: string) => {
    updateFormData({ faqs: faqs.filter((faq) => faq.id !== id) });
  };

  const updateFAQ = (id: string, field: keyof FAQ, value: string) => {
    updateFormData({
      faqs: faqs.map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq
      ),
    });
  };

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <BookOpenIcon
              style={{
                width: '2rem',
                height: '2rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={2} data-size="md" style={{ margin: 0 }}>
              {t('wizard.step.content')}
            </Heading>
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.contentDescription')}
          </Paragraph>
        </div>

        {/* Error Display */}
        {currentStepErrors.length > 0 && (
          <Alert data-color="danger">
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {currentStepErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Rich Content Editor */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            <FileTextIcon
              style={{
                width: '1.5rem',
                height: '1.5rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.content.richContent')}
            </Heading>
          </div>

          <Textarea
            label={t('form.content.detailedDescription')}
            value={richContent}
            onChange={(e) => updateFormData({ richContent: e.target.value })}
            rows={10}
            placeholder={t('form.content.detailedDescriptionPlaceholder')}
            description={t('form.content.detailedDescriptionDescription')}
          />
        </div>

        {/* FAQ Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.content.faq')}
            </Heading>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addFAQ}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
              aria-label={t('form.content.addFAQ')}
            >
              <PlusIcon
                style={{ width: '1rem', height: '1rem' }}
                aria-hidden="true"
              />
              {t('form.content.addFAQ')}
            </Button>
          </div>

          {faqs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  style={{
                    padding: 'var(--ds-spacing-5)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                  }}
                >
                  {/* FAQ Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--ds-spacing-4)',
                    }}
                  >
                    <Badge color="info" size="sm">
                      {t('form.content.faqItem')} {index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      color="danger"
                      onClick={() => removeFAQ(faq.id)}
                      aria-label={t('form.content.removeFAQ')}
                    >
                      <TrashIcon
                        style={{ width: '1rem', height: '1rem' }}
                        aria-hidden="true"
                      />
                      {t('form.content.remove')}
                    </Button>
                  </div>

                  {/* FAQ Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                    <Textfield
                      label={t('form.content.question')}
                      value={faq.question}
                      onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                      required
                      placeholder={t('form.content.questionPlaceholder')}
                    />

                    <Textarea
                      label={t('form.content.answer')}
                      value={faq.answer}
                      onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                      rows={4}
                      required
                      placeholder={t('form.content.answerPlaceholder')}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: 'var(--ds-spacing-8)',
                textAlign: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px dashed var(--ds-color-neutral-border-subtle)',
              }}
            >
              <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('form.content.noFAQs')}
              </Paragraph>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderLeft: '4px solid var(--ds-color-info-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {t('rentalObjects.contentInfo')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
