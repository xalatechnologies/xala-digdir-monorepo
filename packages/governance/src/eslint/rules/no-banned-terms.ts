import type { Rule } from 'eslint';

/**
 * ESLint rule to disallow banned terms in code.
 *
 * Banned terms:
 * - "listing" -> Use "rentalObject" instead
 * - "facility" -> Use "amenity" instead
 *
 * This rule helps maintain consistent terminology across the codebase.
 */
const noBannedTerms: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow banned terms (listing, facility)',
      recommended: true,
    },
    schema: [],
    messages: {
      bannedTerm:
        'Banned term "{{ term }}" found in "{{ name }}". Use "{{ replacement }}" instead.',
    },
  },
  create(context) {
    const bannedTerms: Record<string, string> = {
      listing: 'rentalObject',
      facility: 'amenity',
    };

    function checkName(node: Rule.Node & { name?: string }) {
      if (!node.name) return;

      const nameLower = node.name.toLowerCase();

      for (const [term, replacement] of Object.entries(bannedTerms)) {
        if (nameLower.includes(term)) {
          context.report({
            node,
            messageId: 'bannedTerm',
            data: {
              term,
              name: node.name,
              replacement,
            },
          });
        }
      }
    }

    return {
      Identifier(node) {
        checkName(node as Rule.Node & { name: string });
      },
    };
  },
};

export default noBannedTerms;
