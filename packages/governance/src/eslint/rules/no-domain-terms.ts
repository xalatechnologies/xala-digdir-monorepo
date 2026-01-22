/**
 * ESLint Rule: no-domain-terms
 * 
 * Prevents domain-specific terminology in platform code to maintain
 * domain-agnostic architecture.
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xalatechnologies/platform/blob/main/docs/rules/${name}.md`
);

const FORBIDDEN_TERMS = [
  'digilist',
  'booking',
  'rental',
  'listing',
];

const SUGGESTED_REPLACEMENTS: Record<string, string> = {
  booking: 'reservation, request',
  rental: 'allocation, assignment',
  listing: 'resource, item',
  digilist: 'custom, tenant-default',
};

export const noDomainTerms = createRule({
  name: 'no-domain-terms',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow domain-specific terminology in platform code',
    },
    messages: {
      forbiddenTerm: 'Domain-specific term "{{term}}" found. Platform code must be domain-agnostic. Consider: {{suggestions}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    
    // Skip stories and test files
    if (filename.includes('/stories/') || filename.includes('.test.') || filename.includes('.spec.')) {
      return {};
    }

    return {
      Identifier(node) {
        const name = node.name.toLowerCase();
        
        for (const term of FORBIDDEN_TERMS) {
          if (name.includes(term)) {
            context.report({
              node,
              messageId: 'forbiddenTerm',
              data: {
                term,
                suggestions: SUGGESTED_REPLACEMENTS[term] || 'generic alternatives',
              },
            });
          }
        }
      },
      Literal(node) {
        if (typeof node.value === 'string') {
          const value = node.value.toLowerCase();
          
          for (const term of FORBIDDEN_TERMS) {
            if (value.includes(term)) {
              context.report({
                node,
                messageId: 'forbiddenTerm',
                data: {
                  term,
                  suggestions: SUGGESTED_REPLACEMENTS[term] || 'generic alternatives',
                },
              });
            }
          }
        }
      },
      TemplateElement(node) {
        const value = node.value.raw.toLowerCase();
        
        for (const term of FORBIDDEN_TERMS) {
          if (value.includes(term)) {
            context.report({
              node,
              messageId: 'forbiddenTerm',
              data: {
                term,
                suggestions: SUGGESTED_REPLACEMENTS[term] || 'generic alternatives',
              },
            });
          }
        }
      },
    };
  },
});
