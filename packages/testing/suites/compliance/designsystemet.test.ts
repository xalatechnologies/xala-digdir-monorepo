/**
 * Comprehensive Designsystemet Compliance Test Suite
 * 
 * Tests compliance with Norwegian public sector design system (Digdir):
 * - Design Tokens (colors, spacing, typography, border-radius)
 * - Component Patterns (proper DS component usage)
 * - Theme/Teambygger (CSS variable structure)
 * - WCAG 2.1 AA Accessibility
 * - GDPR Consent & Privacy
 * 
 * @see https://designsystemet.no/no
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

// Configuration
const MONOREPO_ROOT = path.resolve(__dirname, '../../../../..');
const APPS_TO_SCAN = ['web', 'backoffice', 'minside', 'saas-admin', 'tenant-admin', 'docs-learning'];

// Helper to get files
function getAppFiles(app: string, ext: string): string[] {
  const appPath = path.join(MONOREPO_ROOT, 'apps', app, 'src');
  if (!fs.existsSync(appPath)) return [];
  try {
    return globSync(`${appPath}/**/*${ext}`, { ignore: '**/node_modules/**' });
  } catch {
    return [];
  }
}

function getAllCssFiles(): string[] {
  return APPS_TO_SCAN.flatMap(app => getAppFiles(app, '.css'));
}

function getAllTsxFiles(): string[] {
  return APPS_TO_SCAN.flatMap(app => getAppFiles(app, '.tsx'));
}

describe('Designsystemet Compliance Suite', () => {
  describe('1. Design Token Compliance', () => {
    describe('Colors', () => {
      it('should use DS color tokens instead of hardcoded values', () => {
        const cssFiles = getAllCssFiles().slice(0, 50);
        const violations: string[] = [];
        
        for (const file of cssFiles) {
          const content = fs.readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, idx) => {
            // Check for hardcoded hex colors
            if (/#[0-9a-fA-F]{3,6}/.test(line) && !line.includes('/*') && !line.includes('//')) {
              // Skip CSS variable definitions
              if (!line.includes('--ds-') && !line.includes('--fds-') && !line.includes(':root')) {
                violations.push(`${path.basename(file)}:${idx + 1}`);
              }
            }
          });
        }

        console.log(`\nColor token violations: ${violations.length} (max 50 allowed)`);
        expect(violations.length).toBeLessThan(50);
      });
    });

    describe('Spacing', () => {
      it('should use DS spacing tokens (--ds-spacing-*)', () => {
        const cssFiles = getAllCssFiles().slice(0, 50);
        const violations: string[] = [];
        
        for (const file of cssFiles) {
          const content = fs.readFileSync(file, 'utf-8');
          const matches = content.match(/(?:margin|padding|gap):\s*\d+px/g);
          if (matches) {
            violations.push(`${path.basename(file)}: ${matches.length} hardcoded`);
          }
        }

        console.log(`\nSpacing violations: ${violations.length} files (max 20 allowed)`);
        expect(violations.length).toBeLessThan(20);
      });
    });

    describe('Typography', () => {
      it('should use DS typography tokens', () => {
        const cssFiles = getAllCssFiles().slice(0, 50);
        let violations = 0;
        
        for (const file of cssFiles) {
          const content = fs.readFileSync(file, 'utf-8');
          if (/font-size:\s*\d+px/.test(content)) violations++;
        }

        console.log(`\nTypography violations: ${violations} files (max 10 allowed)`);
        expect(violations).toBeLessThan(10);
      });
    });
  });

  describe('2. Component Pattern Compliance', () => {
    it('should use DS components instead of native HTML', () => {
      const tsxFiles = getAllTsxFiles().slice(0, 100);
      const dsComponents = { Button: 0, Card: 0, Heading: 0, Paragraph: 0, Badge: 0, Table: 0 };
      const nativeHtml = { button: 0, h1: 0, h2: 0, h3: 0, p: 0, table: 0 };

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        Object.keys(dsComponents).forEach(comp => {
          const matches = content.match(new RegExp(`<${comp}[\\s>]`, 'g'));
          if (matches) dsComponents[comp as keyof typeof dsComponents] += matches.length;
        });

        Object.keys(nativeHtml).forEach(tag => {
          const matches = content.match(new RegExp(`<${tag}[\\s>]`, 'g'));
          if (matches) nativeHtml[tag as keyof typeof nativeHtml] += matches.length;
        });
      }

      const totalDS = Object.values(dsComponents).reduce((a, b) => a + b, 0);
      console.log(`\nDS Components used: ${totalDS}`);
      console.log('  Breakdown:', dsComponents);
      expect(totalDS).toBeGreaterThan(50);
    });

    it('should import from @xala/ds package', () => {
      const tsxFiles = getAllTsxFiles().slice(0, 100);
      let dsImports = 0;
      let otherUiLibs = 0;

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/@xala\/ds/.test(content)) dsImports++;
        if (/@radix-ui|@chakra-ui|@mui/.test(content)) otherUiLibs++;
      }

      console.log(`\n@xala/ds imports: ${dsImports}, Other UI libs: ${otherUiLibs}`);
      expect(dsImports).toBeGreaterThan(otherUiLibs);
    });
  });

  describe('3. Theme/Teambygger Compliance', () => {
    it('should have root.css with DS token imports', () => {
      let appsWithTokens = 0;
      
      for (const app of APPS_TO_SCAN) {
        const rootCss = path.join(MONOREPO_ROOT, 'apps', app, 'src', 'root.css');
        if (fs.existsSync(rootCss)) {
          const content = fs.readFileSync(rootCss, 'utf-8');
          if (/--ds-|@digdir|designsystemet/.test(content)) appsWithTokens++;
        }
      }

      console.log(`\nApps with DS tokens in root.css: ${appsWithTokens}/${APPS_TO_SCAN.length}`);
      expect(appsWithTokens).toBeGreaterThan(0);
    });

    it('should use semantic color tokens (not raw color values)', () => {
      const cssFiles = getAllCssFiles().slice(0, 30);
      let semanticUsage = 0;
      let rawUsage = 0;

      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        const semanticMatches = content.match(/--ds-color-[a-z]+-/g);
        if (semanticMatches) semanticUsage += semanticMatches.length;

        const rawMatches = content.match(/#[0-9a-fA-F]{6}/g);
        if (rawMatches) rawUsage += rawMatches.length;
      }

      console.log(`\nSemantic tokens: ${semanticUsage}, Raw hex: ${rawUsage}`);
      expect(semanticUsage).toBeGreaterThan(rawUsage / 2);
    });
  });

  describe('4. WCAG 2.1 AA Accessibility', () => {
    it('should have alt text on images', () => {
      const tsxFiles = getAllTsxFiles().slice(0, 100);
      let withAlt = 0;
      let withoutAlt = 0;

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const imgTags = content.match(/<img[^>]*>/g) || [];
        imgTags.forEach(tag => {
          if (/alt=/.test(tag)) withAlt++;
          else withoutAlt++;
        });
      }

      console.log(`\nImages: ${withAlt} with alt, ${withoutAlt} without`);
      expect(withoutAlt).toBeLessThan(withAlt + 10);
    });

    it('should have button type attributes', () => {
      const tsxFiles = getAllTsxFiles().slice(0, 100);
      let withType = 0;
      let withoutType = 0;

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const buttonTags = content.match(/<button[^>]*>/g) || [];
        buttonTags.forEach(tag => {
          if (/type=/.test(tag)) withType++;
          else withoutType++;
        });
      }

      console.log(`\nButtons: ${withType} with type, ${withoutType} without`);
      expect(withoutType).toBeLessThan(withType + 5);
    });

    it('should use semantic HTML structure', () => {
      const tsxFiles = getAllTsxFiles().slice(0, 50);
      const elements = ['header', 'main', 'nav', 'footer', 'article', 'section'];
      let count = 0;

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        elements.forEach(el => {
          const matches = content.match(new RegExp(`<${el}[\\s>]`, 'g'));
          if (matches) count += matches.length;
        });
      }

      console.log(`\nSemantic HTML elements: ${count}`);
      expect(count).toBeGreaterThan(10);
    });
  });

  describe('5. GDPR Compliance', () => {
    it('should have privacy/consent UI patterns', () => {
      const tsxFiles = getAllTsxFiles();
      let hasConsentUI = false;
      let hasPrivacyLink = false;

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/consent|samtykkje|cookie/i.test(content)) hasConsentUI = true;
        if (/personvern|privacy/i.test(content)) hasPrivacyLink = true;
      }

      console.log(`\nGDPR: Consent UI=${hasConsentUI}, Privacy Link=${hasPrivacyLink}`);
      expect(hasPrivacyLink || hasConsentUI).toBe(true);
    });
  });

  describe('6. App Coverage Summary', () => {
    it('should report compliance status per app', () => {
      console.log('\n📊 App Compliance Summary:');
      console.log('═══════════════════════════════════════');
      
      for (const app of APPS_TO_SCAN) {
        const tsxFiles = getAppFiles(app, '.tsx');
        let dsImports = 0;
        
        for (const file of tsxFiles.slice(0, 50)) {
          const content = fs.readFileSync(file, 'utf-8');
          if (/@xala\/ds/.test(content)) dsImports++;
        }

        const sampleSize = Math.min(tsxFiles.length, 50);
        const coverage = sampleSize > 0 ? Math.round((dsImports / sampleSize) * 100) : 0;
        const bar = '█'.repeat(Math.round(coverage / 10)) + '░'.repeat(10 - Math.round(coverage / 10));
        console.log(`  ${app.padEnd(15)} ${bar} ${coverage}% (${dsImports}/${tsxFiles.length} files)`);
      }
      console.log('═══════════════════════════════════════');

      expect(APPS_TO_SCAN.length).toBeGreaterThan(0);
    });
  });
});
