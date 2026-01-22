/**
 * ESLint Rule: no-cross-layer-imports
 * 
 * Enforces UI layer hierarchy to prevent architectural violations.
 * Lower layers cannot import from higher layers.
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xalatechnologies/platform/blob/main/docs/rules/${name}.md`
);

const LAYER_HIERARCHY: Record<string, number> = {
  'ui/primitives': 0,
  'ui/blocks': 1,
  'ui/composed': 2,
  'ui/patterns': 3,
  'ui/shells': 4,
  'ui/pages': 5,
};

function getLayerLevel(path: string): { layer: string; level: number } | null {
  for (const [layer, level] of Object.entries(LAYER_HIERARCHY)) {
    if (path.includes(layer)) {
      return { layer, level };
    }
  }
  return null;
}

export const noCrossLayerImports = createRule({
  name: 'no-cross-layer-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent lower UI layers from importing higher layers',
    },
    messages: {
      crossLayerImport: 'Layer "{{currentLayer}}" (level {{currentLevel}}) cannot import from higher layer "{{importLayer}}" (level {{importLevel}}). Follow hierarchy: primitives → blocks → composed → patterns → shells → pages',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    const currentLayer = getLayerLevel(filename);
    
    if (!currentLayer) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        
        if (typeof importPath !== 'string') {
          return;
        }
        
        const importLayer = getLayerLevel(importPath);
        
        if (importLayer && importLayer.level > currentLayer.level) {
          context.report({
            node,
            messageId: 'crossLayerImport',
            data: {
              currentLayer: currentLayer.layer,
              currentLevel: currentLayer.level.toString(),
              importLayer: importLayer.layer,
              importLevel: importLayer.level.toString(),
            },
          });
        }
      },
    };
  },
});
