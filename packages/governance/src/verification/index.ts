/**
 * Verification tools for Xala governance.
 *
 * This module provides tools for verifying code quality,
 * architectural boundaries, and terminology compliance.
 */

export {
  checkBoundaries,
  formatViolations,
  runBoundaryCheck,
  defaultBoundaryConfig,
  type BoundaryViolation,
  type BoundaryCheckConfig,
} from './boundary-check.js';

export {
  checkTerms,
  formatTermViolations,
  summarizeViolations,
  runTermCheck,
  defaultTermConfig,
  type TermViolation,
  type TermCheckConfig,
} from './term-check.js';
