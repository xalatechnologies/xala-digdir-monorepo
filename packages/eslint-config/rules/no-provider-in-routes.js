/**
 * ESLint Rule: no-provider-in-routes
 * Disallow importing providers in route/page components
 * 
 * Thin App Rule: Route components should not import providers.
 * Use RuntimeProvider in main.tsx only.
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing providers in route/page components',
      category: 'Thin App Compliance',
      recommended: true,
    },
    messages: {
      noProviderInRoutes: 'Do not import {{ providerName }} in route components. Use RuntimeProvider in main.tsx instead.',
      noProviderImportInRoutes: 'Provider imports are not allowed in routes/pages. Move to RuntimeProvider composition in main.tsx.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedProviders: {
            type: 'array',
            items: { type: 'string' },
            description: 'Provider names that are allowed (app-specific providers)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    
    // Default allowed providers (app-specific, not core)
    const allowedProviders = options.allowedProviders || [
      'AccountContextProvider',
      'BackofficeRoleProvider',
      'CapabilityProvider',
      'ToastProvider',
      'RealtimeProvider', // App-level realtime
    ];

    // Check if file is in routes directory
    function isRouteFile() {
      return (
        filename.includes('/routes/') ||
        filename.includes('/pages/') ||
        filename.match(/Page\.tsx$/)
      );
    }

    // Core providers that should never be in routes
    const forbiddenProviders = [
      'QueryClientProvider',
      'ThemeProvider',
      'I18nProvider',
      'LazyI18nProvider',
      'DesignsystemetProvider',
      'AuthProvider',
      'ErrorBoundary',
      'DialogProvider',
    ];

    return {
      ImportDeclaration(node) {
        if (!isRouteFile()) {
          return;
        }

        const source = node.source.value;
        
        // Check for provider imports from common sources
        const isProviderSource = 
          source.includes('/providers') ||
          source === '@tanstack/react-query' ||
          source === '@xala/ds' ||
          source === '@xala/i18n' ||
          source === '@xala/auth';

        if (!isProviderSource) {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') continue;
          
          const importedName = specifier.imported?.name || specifier.local?.name;
          
          if (!importedName) continue;
          
          // Check if it looks like a provider
          if (!importedName.includes('Provider')) continue;
          
          // Allow app-specific providers
          if (allowedProviders.includes(importedName)) continue;
          
          // Check against forbidden list
          if (forbiddenProviders.includes(importedName)) {
            context.report({
              node: specifier,
              messageId: 'noProviderInRoutes',
              data: { providerName: importedName },
            });
          }
        }
      },

      // Also check JSX usage
      JSXOpeningElement(node) {
        if (!isRouteFile()) {
          return;
        }

        const elementName = node.name?.name;
        if (!elementName) return;

        if (forbiddenProviders.includes(elementName)) {
          context.report({
            node,
            messageId: 'noProviderInRoutes',
            data: { providerName: elementName },
          });
        }
      },
    };
  },
};
