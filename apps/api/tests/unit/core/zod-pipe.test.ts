/**
 * Zod Validation Pipe Unit Tests
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate, validatePartial } from '../../../src/core/validation/zod-pipe';
import { ValidationError } from '../../../src/core/errors/problem-details';
import { setupTestHooks } from '../../setup';

describe('ZodPipe', () => {
  setupTestHooks();

  describe('validate', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().int().positive().optional(),
    });

    it('should validate and return data for valid input', () => {
      const input = { name: 'Test', email: 'test@example.com' };

      const result = validate(TestSchema, input);

      expect(result).toEqual(input);
    });

    it('should throw ValidationError for invalid input', () => {
      const input = { name: '', email: 'invalid' };

      expect(() => validate(TestSchema, input)).toThrow(ValidationError);
    });

    it('should include field errors in ValidationError', () => {
      const input = { name: '', email: 'invalid' };

      try {
        validate(TestSchema, input);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        // errors is an array of { field, message } objects
        expect(Array.isArray(validationError.errors)).toBe(true);
        expect(validationError.errors.length).toBeGreaterThan(0);
        const fields = validationError.errors.map((e: any) => e.field);
        expect(fields).toContain('name');
        expect(fields).toContain('email');
      }
    });

    it('should strip unknown fields', () => {
      const input = { name: 'Test', email: 'test@example.com', unknown: 'field' };

      const result = validate(TestSchema, input);

      expect(result).not.toHaveProperty('unknown');
    });

    it('should accept optional fields', () => {
      const input = { name: 'Test', email: 'test@example.com', age: 25 };

      const result = validate(TestSchema, input);

      expect(result.age).toBe(25);
    });
  });

  describe('validatePartial', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    it('should validate partial data', () => {
      const input = { name: 'Updated' };

      const result = validatePartial(TestSchema, input);

      expect(result).toEqual({ name: 'Updated' });
    });

    it('should allow empty object for partial', () => {
      const result = validatePartial(TestSchema, {});

      expect(result).toEqual({});
    });

    it('should still validate provided fields', () => {
      expect(() => validatePartial(TestSchema, { email: 'invalid' })).toThrow(ValidationError);
    });
  });

  describe('common patterns', () => {
    it('should validate UUID format', () => {
      const UuidSchema = z.string().uuid();
      
      expect(() => UuidSchema.parse('not-a-uuid')).toThrow();
      expect(UuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toBeTruthy();
    });

    it('should validate email format', () => {
      const EmailSchema = z.string().email();
      
      expect(() => EmailSchema.parse('invalid')).toThrow();
      expect(EmailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('should validate positive integer', () => {
      const PositiveIntSchema = z.number().int().positive();
      
      expect(() => PositiveIntSchema.parse(-1)).toThrow();
      expect(() => PositiveIntSchema.parse(1.5)).toThrow();
      expect(PositiveIntSchema.parse(42)).toBe(42);
    });

    it('should validate pagination with defaults', () => {
      const PaginationSchema = z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().min(1).max(100).default(20),
      });

      const result = PaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });
});
