/**
 * Zod Validation Pipe
 * Request validation middleware using Zod schemas
 */
import { z, type ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/problem-details';

/**
 * Validate data against a Zod schema
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    );
  }

  return result.data;
}

/**
 * Create a validation function for a schema
 */
export function createValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): T => validate(schema, data);
}

/**
 * Async validation function
 */
export async function validateAsync<T>(schema: ZodSchema<T>, data: unknown): Promise<T> {
  const result = await schema.safeParseAsync(data);
  
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    );
  }

  return result.data;
}

/**
 * Partial validation - validates only provided fields
 */
export function validatePartial<T>(schema: ZodSchema<T>, data: unknown): Partial<T> {
  // Make all fields optional for partial validation
  const partialSchema = (schema as unknown as z.ZodObject<any>).partial();
  return validate(partialSchema, data) as Partial<T>;
}

/**
 * Transform ZodError to ValidationError
 */
export function zodToValidationError(error: ZodError): ValidationError {
  return new ValidationError(
    error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
  );
}

/**
 * Schema coercion helpers
 */
export const coerce = {
  /**
   * Coerce string to number
   */
  number: z.coerce.number(),
  
  /**
   * Coerce string to boolean
   */
  boolean: z.coerce.boolean(),
  
  /**
   * Coerce string to date
   */
  date: z.coerce.date(),
  
  /**
   * Coerce string to integer
   */
  int: z.coerce.number().int(),
  
  /**
   * Coerce string to positive number
   */
  positiveNumber: z.coerce.number().positive(),
};

/**
 * Common validation patterns
 */
export const patterns = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  isoDate: z.string().datetime(),
};
