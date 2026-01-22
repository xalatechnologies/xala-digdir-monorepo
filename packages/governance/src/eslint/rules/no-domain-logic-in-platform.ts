/**
 * ESLint Rule: no-domain-logic-in-platform
 *
 * Prevents domain-specific business logic in platform apps.
 * Platform apps should be thin and domain-agnostic.
 *
 * @example
 * // ❌ Bad - Domain logic in platform app
 * const RENTAL_CATEGORIES = ['LOKALER_OG_BANER', 'UTSTYR', 'PARKERING'];
 * const BOOKING_STATUSES = ['pending', 'approved', 'rejected'];
 *
 * // ✅ Good - Generic platform logic
 * const { categories } = useTenantCategories(); // From API
 * const { statuses } = useWorkflowStatuses(); // From API
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xala-technologies/platform/blob/main/docs/eslint-rules/${name}.md`
);

// Domain-specific keywords that indicate business logic
const DOMAIN_KEYWORDS = [
  // Digilist/Rental domain
  'booking', 'rental', 'venue', 'facility', 'listing',
  'lokaler', 'baner', 'utstyr', 'parkering', 'arrangement',
  'idrettshall', 'gymsal', 'møterom', 'leieobjekt',
  
  // Generic domain indicators
  'category', 'categories', 'product', 'order', 'invoice',
  'customer', 'client', 'ticket', 'reservation',
];

// Allowed in these contexts
const ALLOWED_CONTEXTS = [
  '/packages/platform/', // Platform package can define domain interfaces
  '.test.', '.spec.', '.stories.', // Test files
  '/domain/', '/domains/', // Domain packages
];

export const noDomainLogicInPlatform = createRule({
  name: 'no-domain-logic-in-platform',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent domain-specific business logic in platform applications',
    },
    messages: {
      domainLogicDetected: 'Domain-specific logic detected: "{{identifier}}". Platform apps should be domain-agnostic. Move to domain repository or fetch from API.',
      domainConstantDetected: 'Domain-specific constant detected. Use API or configuration instead of hardcoded domain data.',
      suggestApiUsage: 'Consider using API hook: {{suggestion}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();

    // Allow in certain contexts
    if (ALLOWED_CONTEXTS.some(ctx => filename.includes(ctx))) {
      return {};
    }

    // Only check platform apps (backoffice, monitoring, etc.)
    if (!filename.includes('/apps/')) {
      return {};
    }

    return {
      // Check variable declarations
      VariableDeclarator(node: any) {
        const varName = node.id?.name?.toLowerCase() || '';
        
        // Check if variable name contains domain keywords
        if (DOMAIN_KEYWORDS.some(keyword => varName.includes(keyword))) {
          // Check if it's a constant array/object (likely hardcoded domain data)
          if (node.init?.type === 'ArrayExpression' || node.init?.type === 'ObjectExpression') {
            const suggestion = generateApiSuggestion(varName);
            
            context.report({
              node,
              messageId: 'domainConstantDetected',
            });
            
            if (suggestion) {
              context.report({
                node,
                messageId: 'suggestApiUsage',
                data: { suggestion },
              });
            }
          }
        }
      },

      // Check string literals for domain-specific values
      Literal(node: any) {
        if (typeof node.value !== 'string') return;
        
        const value = node.value.toLowerCase();
        
        // Check for Norwegian domain terms (strong indicator of domain logic)
        const norwegianDomainTerms = [
          'lokaler_og_baner', 'idrettshall', 'gymsal', 'møterom',
          'leieobjekt', 'utleie', 'booking', 'reservasjon',
        ];
        
        if (norwegianDomainTerms.some(term => value.includes(term))) {
          context.report({
            node,
            messageId: 'domainLogicDetected',
            data: {
              identifier: node.value.substring(0, 30),
            },
          });
        }
      },

      // Check function names
      FunctionDeclaration(node: any) {
        const funcName = node.id?.name?.toLowerCase() || '';
        
        if (DOMAIN_KEYWORDS.some(keyword => funcName.includes(keyword))) {
          // Allow if it's just calling an API hook
          const isApiCall = funcName.startsWith('use') || funcName.includes('fetch') || funcName.includes('get');
          
          if (!isApiCall) {
            context.report({
              node,
              messageId: 'domainLogicDetected',
              data: {
                identifier: node.id.name,
              },
            });
          }
        }
      },
    };
  },
});

/**
 * Generate API hook suggestion based on variable name
 */
function generateApiSuggestion(varName: string): string | null {
  const suggestions: Record<string, string> = {
    'categories': 'useTenantCategories()',
    'category': 'useTenantCategories()',
    'statuses': 'useWorkflowStatuses()',
    'status': 'useWorkflowStatuses()',
    'products': 'useProducts()',
    'plans': 'usePlans()',
  };

  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (varName.includes(key)) {
      return suggestion;
    }
  }

  return null;
}

export default noDomainLogicInPlatform;
