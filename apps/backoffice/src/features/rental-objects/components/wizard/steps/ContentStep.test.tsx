/**
 * Unit Tests for ContentStep Component
 * Tests rich content editor and FAQ management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentStep } from './ContentStep';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

// Mock @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

// Mock @xala/ds icons
vi.mock('@xala/ds', async () => {
  const actual = await vi.importActual('@xala/ds');
  return {
    ...actual,
    BookOpenIcon: () => <div data-testid="book-open-icon" />,
    FileTextIcon: () => <div data-testid="file-text-icon" />,
    PlusIcon: () => <div data-testid="plus-icon" />,
    TrashIcon: () => <div data-testid="trash-icon" />,
  };
});

describe('ContentStep', () => {
  let mockWizard: UseRentalObjectWizardReturn;

  beforeEach(() => {
    mockWizard = {
      formData: {
        richContent: '',
        faqs: [],
      },
      updateFormData: vi.fn(),
      errors: {},
      currentStep: 'content',
      steps: [],
      goToStep: vi.fn(),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      canGoNext: true,
      canGoPrev: true,
      isFirstStep: false,
      isLastStep: false,
      saveDraft: vi.fn(),
      publish: vi.fn(),
      cancel: vi.fn(),
      isSaving: false,
      isPublishing: false,
    } as unknown as UseRentalObjectWizardReturn;
  });

  describe('Rendering', () => {
    it('should render header with icon and title', () => {
      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByText('wizard.step.content')).toBeInTheDocument();
      expect(screen.getByText('rentalObjects.contentDescription')).toBeInTheDocument();
    });

    it('should render rich content textarea', () => {
      render(<ContentStep wizard={mockWizard} />);

      const textarea = screen.getByLabelText('form.content.detailedDescription');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('');
    });

    it('should render FAQ section with add button', () => {
      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByText('form.content.faq')).toBeInTheDocument();
      expect(screen.getByText('form.content.addFAQ')).toBeInTheDocument();
    });

    it('should render empty state when no FAQs', () => {
      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByText('form.content.noFAQs')).toBeInTheDocument();
    });

    it('should render error alert when errors exist', () => {
      mockWizard.errors = {
        content: ['Error 1', 'Error 2'],
      };

      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });

    it('should render info message at bottom', () => {
      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByText('rentalObjects.contentInfo')).toBeInTheDocument();
    });
  });

  describe('Rich Content Editor', () => {
    it('should display existing rich content', () => {
      mockWizard.formData.richContent = 'Existing content';

      render(<ContentStep wizard={mockWizard} />);

      const textarea = screen.getByLabelText('form.content.detailedDescription');
      expect(textarea).toHaveValue('Existing content');
    });

    it('should call updateFormData when rich content changes', () => {
      render(<ContentStep wizard={mockWizard} />);

      const textarea = screen.getByLabelText('form.content.detailedDescription');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        richContent: 'New content',
      });
    });
  });

  describe('FAQ Management', () => {
    it('should add new FAQ when add button clicked', () => {
      render(<ContentStep wizard={mockWizard} />);

      const addButton = screen.getByText('form.content.addFAQ');
      fireEvent.click(addButton);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        faqs: expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringContaining('faq-'),
            question: '',
            answer: '',
          }),
        ]),
      });
    });

    it('should render existing FAQs', () => {
      mockWizard.formData.faqs = [
        { id: 'faq-1', question: 'Question 1', answer: 'Answer 1' },
        { id: 'faq-2', question: 'Question 2', answer: 'Answer 2' },
      ];

      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByDisplayValue('Question 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Answer 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Question 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Answer 2')).toBeInTheDocument();
    });

    it('should display FAQ badges with correct numbering', () => {
      mockWizard.formData.faqs = [
        { id: 'faq-1', question: 'Q1', answer: 'A1' },
        { id: 'faq-2', question: 'Q2', answer: 'A2' },
      ];

      render(<ContentStep wizard={mockWizard} />);

      expect(screen.getByText(/form\.content\.faqItem.*1/)).toBeInTheDocument();
      expect(screen.getByText(/form\.content\.faqItem.*2/)).toBeInTheDocument();
    });

    it('should update FAQ question when typed', () => {
      mockWizard.formData.faqs = [
        { id: 'faq-1', question: '', answer: '' },
      ];

      render(<ContentStep wizard={mockWizard} />);

      const questionInput = screen.getByLabelText('form.content.question');
      fireEvent.change(questionInput, { target: { value: 'New question' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        faqs: [
          { id: 'faq-1', question: 'New question', answer: '' },
        ],
      });
    });

    it('should update FAQ answer when typed', () => {
      mockWizard.formData.faqs = [
        { id: 'faq-1', question: 'Question', answer: '' },
      ];

      render(<ContentStep wizard={mockWizard} />);

      const answerInput = screen.getByLabelText('form.content.answer');
      fireEvent.change(answerInput, { target: { value: 'New answer' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        faqs: [
          { id: 'faq-1', question: 'Question', answer: 'New answer' },
        ],
      });
    });

    it('should remove FAQ when remove button clicked', () => {
      mockWizard.formData.faqs = [
        { id: 'faq-1', question: 'Q1', answer: 'A1' },
        { id: 'faq-2', question: 'Q2', answer: 'A2' },
      ];

      render(<ContentStep wizard={mockWizard} />);

      const removeButtons = screen.getAllByText('form.content.remove');
      fireEvent.click(removeButtons[0]);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        faqs: [{ id: 'faq-2', question: 'Q2', answer: 'A2' }],
      });
    });

    it('should generate unique IDs for new FAQs', () => {
      const calls: any[] = [];
      mockWizard.updateFormData = vi.fn((data) => calls.push(data));

      render(<ContentStep wizard={mockWizard} />);

      const addButton = screen.getByText('form.content.addFAQ');
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(calls).toHaveLength(2);
      expect(calls[0].faqs[0].id).not.toBe(calls[1].faqs[0].id);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-hidden on decorative icons', () => {
      render(<ContentStep wizard={mockWizard} />);

      const icons = [
        screen.getByTestId('book-open-icon'),
        screen.getByTestId('file-text-icon'),
      ];

      icons.forEach((icon) => {
        expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should have required attribute on FAQ fields', () => {
      mockWizard.formData.faqs = [
        { id: 'faq-1', question: '', answer: '' },
      ];

      render(<ContentStep wizard={mockWizard} />);

      const questionInput = screen.getByLabelText('form.content.question');
      const answerInput = screen.getByLabelText('form.content.answer');

      expect(questionInput).toHaveAttribute('required');
      expect(answerInput).toHaveAttribute('required');
    });

    it('should have proper placeholder text', () => {
      render(<ContentStep wizard={mockWizard} />);

      const textarea = screen.getByLabelText('form.content.detailedDescription');
      expect(textarea).toHaveAttribute(
        'placeholder',
        'form.content.detailedDescriptionPlaceholder'
      );
    });
  });
});
