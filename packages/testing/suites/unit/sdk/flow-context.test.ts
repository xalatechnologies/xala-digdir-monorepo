/**
 * SDK Flow Context Tests
 * Validates SDK flow context utility exports
 */

import { describe, it, expect } from 'vitest';

describe('SDK Flow Context Utils', () => {
  describe('FLOW_CONTEXT_KEY', () => {
    it('should export FLOW_CONTEXT_KEY constant', async () => {
      const { FLOW_CONTEXT_KEY } = await import('@digilist/client-sdk');
      expect(FLOW_CONTEXT_KEY).toBeDefined();
      expect(typeof FLOW_CONTEXT_KEY).toBe('string');
    });
  });

  describe('MAX_FLOW_CONTEXT_SIZE', () => {
    it('should export MAX_FLOW_CONTEXT_SIZE constant', async () => {
      const { MAX_FLOW_CONTEXT_SIZE } = await import('@digilist/client-sdk');
      expect(MAX_FLOW_CONTEXT_SIZE).toBeDefined();
      expect(typeof MAX_FLOW_CONTEXT_SIZE).toBe('number');
    });
  });

  describe('serializeFlowContext', () => {
    it('should export serializeFlowContext function', async () => {
      const { serializeFlowContext } = await import('@digilist/client-sdk');
      expect(serializeFlowContext).toBeDefined();
      expect(typeof serializeFlowContext).toBe('function');
    });
  });

  describe('deserializeFlowContext', () => {
    it('should export deserializeFlowContext function', async () => {
      const { deserializeFlowContext } = await import('@digilist/client-sdk');
      expect(deserializeFlowContext).toBeDefined();
      expect(typeof deserializeFlowContext).toBe('function');
    });
  });

  describe('isValidFlowContext', () => {
    it('should export isValidFlowContext function', async () => {
      const { isValidFlowContext } = await import('@digilist/client-sdk');
      expect(isValidFlowContext).toBeDefined();
      expect(typeof isValidFlowContext).toBe('function');
    });
  });

  describe('createFlowContext', () => {
    it('should export createFlowContext function', async () => {
      const { createFlowContext } = await import('@digilist/client-sdk');
      expect(createFlowContext).toBeDefined();
      expect(typeof createFlowContext).toBe('function');
    });
  });
});
