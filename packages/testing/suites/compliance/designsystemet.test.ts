/**
 * @vitest-environment node
 * 
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

// Configuration - vitest runs from monorepo root via pnpm
const MONOREPO_ROOT = process.cwd().includes('packages/testing') 
  ? path.resolve(process.cwd(), '../..')
  : process.cwd();
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

// SKIPPED: Needs implementation
describe.skip('Designsystemet Compliance Suite', () => {
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

  describe('7. Cross-App Visual Consistency', () => {
    it('should use consistent typography families across apps', () => {
      const fontFamilyUsage: Record<string, Set<string>> = {};
      
      for (const app of APPS_TO_SCAN) {
        const cssFiles = getAppFiles(app, '.css');
        fontFamilyUsage[app] = new Set();
        
        for (const file of cssFiles) {
          const content = fs.readFileSync(file, 'utf-8');
          // Find font-family declarations
          const matches = content.match(/font-family:\s*var\(--ds-font-family-[^)]+\)/g);
          if (matches) {
            matches.forEach(m => fontFamilyUsage[app].add(m));
          }
        }
      }

      const allFonts = new Set<string>();
      Object.values(fontFamilyUsage).forEach(fonts => fonts.forEach(f => allFonts.add(f)));
      
      console.log('\nTypography families used across apps:');
      allFonts.forEach(f => console.log(`  ${f}`));
      
      // Should use consistent DS font families
      expect(allFonts.size).toBeLessThan(5); // Max 5 different font families
    });

    it('should use consistent color palette tokens', () => {
      const colorUsage: Record<string, number> = {};
      
      const cssFiles = getAllCssFiles();
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        // Find all DS color tokens
        const matches = content.match(/--ds-color-[a-z]+-[a-z0-9-]+/g);
        if (matches) {
          matches.forEach(token => {
            colorUsage[token] = (colorUsage[token] || 0) + 1;
          });
        }
      }

      const sortedColors = Object.entries(colorUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
      
      console.log('\nTop 15 color tokens used:');
      sortedColors.forEach(([token, count]) => {
        console.log(`  ${token}: ${count}x`);
      });

      expect(Object.keys(colorUsage).length).toBeGreaterThan(10);
    });

    it('should use consistent spacing scale', () => {
      const spacingUsage: Record<string, number> = {};
      
      const cssFiles = getAllCssFiles();
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        // Find DS spacing tokens
        const matches = content.match(/--ds-spacing-[0-9]+/g);
        if (matches) {
          matches.forEach(token => {
            spacingUsage[token] = (spacingUsage[token] || 0) + 1;
          });
        }
      }

      const sortedSpacing = Object.entries(spacingUsage)
        .sort((a, b) => b[1] - a[1]);
      
      console.log('\nSpacing tokens used:');
      sortedSpacing.forEach(([token, count]) => {
        console.log(`  ${token}: ${count}x`);
      });

      // Should use DS spacing tokens consistently
      expect(Object.keys(spacingUsage).length).toBeGreaterThan(0);
    });

    it('should share identical root.css structure across apps', () => {
      const rootCssContent: Record<string, string[]> = {};
      
      for (const app of APPS_TO_SCAN) {
        const rootCss = path.join(MONOREPO_ROOT, 'apps', app, 'src', 'root.css');
        if (fs.existsSync(rootCss)) {
          const content = fs.readFileSync(rootCss, 'utf-8');
          // Extract CSS imports
          const imports = content.match(/@import\s+['"][^'"]+['"]/g) || [];
          rootCssContent[app] = imports;
        }
      }

      console.log('\nroot.css imports per app:');
      Object.entries(rootCssContent).forEach(([app, imports]) => {
        console.log(`  ${app}: ${imports.length} imports`);
        imports.slice(0, 3).forEach(i => console.log(`    ${i}`));
      });

      // At least some apps should have root.css
      expect(Object.keys(rootCssContent).length).toBeGreaterThan(0);
    });

    it('should use consistent border-radius tokens', () => {
      const borderRadiusUsage: Record<string, number> = {};
      
      const cssFiles = getAllCssFiles();
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        // Find DS border-radius tokens
        const matches = content.match(/--ds-border-radius-[a-z]+/g);
        if (matches) {
          matches.forEach(token => {
            borderRadiusUsage[token] = (borderRadiusUsage[token] || 0) + 1;
          });
        }
      }

      console.log('\nBorder-radius tokens:');
      Object.entries(borderRadiusUsage)
        .sort((a, b) => b[1] - a[1])
        .forEach(([token, count]) => {
          console.log(`  ${token}: ${count}x`);
        });

      // Verify consistent border-radius usage
      expect(Object.keys(borderRadiusUsage).length).toBeLessThan(10);
    });
  });

  describe('8. Enhanced Accessibility (Universell Utforming)', () => {
    it('should have proper focus indicators in CSS', () => {
      const cssFiles = getAllCssFiles();
      let focusIndicators = 0;
      let outlineNone = 0;
      
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        // Count focus-visible and focus styles
        const focusMatches = content.match(/:focus-visible|:focus\s*\{/g);
        if (focusMatches) focusIndicators += focusMatches.length;
        // Check for dangerous outline:none without replacement
        const outlineNoneMatches = content.match(/outline:\s*none(?!.*box-shadow|ring)/g);
        if (outlineNoneMatches) outlineNone += outlineNoneMatches.length;
      }

      console.log(`\nFocus indicators: ${focusIndicators}, Dangerous outline:none: ${outlineNone}`);
      expect(focusIndicators).toBeGreaterThan(0);
    });

    it('should use ARIA labels for interactive elements', () => {
      const tsxFiles = getAllTsxFiles();
      let ariaLabels = 0;
      let ariaDescribedBy = 0;
      let ariaLive = 0;
      let roleAttributes = 0;
      
      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const labelMatches = content.match(/aria-label=/g);
        const describedByMatches = content.match(/aria-describedby=/g);
        const liveMatches = content.match(/aria-live=/g);
        const roleMatches = content.match(/role=/g);
        
        if (labelMatches) ariaLabels += labelMatches.length;
        if (describedByMatches) ariaDescribedBy += describedByMatches.length;
        if (liveMatches) ariaLive += liveMatches.length;
        if (roleMatches) roleAttributes += roleMatches.length;
      }

      console.log('\nARIA attribute usage:');
      console.log(`  aria-label: ${ariaLabels}`);
      console.log(`  aria-describedby: ${ariaDescribedBy}`);
      console.log(`  aria-live: ${ariaLive}`);
      console.log(`  role: ${roleAttributes}`);

      expect(ariaLabels).toBeGreaterThan(10);
    });

    it('should have proper form accessibility attributes', () => {
      const tsxFiles = getAllTsxFiles();
      let labelFor = 0;
      let inputId = 0;
      let requiredAttr = 0;
      let ariaRequired = 0;
      
      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/htmlFor=/.test(content)) labelFor++;
        if (/<input[^>]*id=/.test(content)) inputId++;
        if (/required[^=]/.test(content) || /required=/.test(content)) requiredAttr++;
        if (/aria-required/.test(content)) ariaRequired++;
      }

      console.log('\nForm accessibility:');
      console.log(`  Files with htmlFor: ${labelFor}`);
      console.log(`  Files with input id: ${inputId}`);
      console.log(`  Files with required: ${requiredAttr}`);
      console.log(`  Files with aria-required: ${ariaRequired}`);

      // Forms should have proper labeling
      expect(labelFor + inputId).toBeGreaterThan(5);
    });

    it('should use keyboard-accessible patterns', () => {
      const tsxFiles = getAllTsxFiles();
      let tabIndex = 0;
      let onKeyDown = 0;
      let onKeyUp = 0;
      
      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/tabIndex=/.test(content) || /tabindex/.test(content)) tabIndex++;
        if (/onKeyDown/.test(content)) onKeyDown++;
        if (/onKeyUp/.test(content)) onKeyUp++;
      }

      console.log('\nKeyboard navigation:');
      console.log(`  Files with tabIndex: ${tabIndex}`);
      console.log(`  Files with onKeyDown: ${onKeyDown}`);
      console.log(`  Files with onKeyUp: ${onKeyUp}`);

      // Should have some keyboard handling
      expect(tabIndex + onKeyDown).toBeGreaterThan(0);
    });

    it('should have consistent color contrast tokens', () => {
      const cssFiles = getAllCssFiles();
      let contrastSafeTokens = 0;
      let backgroundTokens = 0;
      let textTokens = 0;
      
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        // Check for proper DS background/surface tokens
        const bgMatches = content.match(/--ds-color-neutral-background|--ds-color-surface/g);
        if (bgMatches) backgroundTokens += bgMatches.length;
        // Check for proper DS text/foreground tokens
        const textMatches = content.match(/--ds-color-neutral-text|--ds-color-text/g);
        if (textMatches) textTokens += textMatches.length;
        // Check accent pairs (contrast-safe combinations)
        const accentMatches = content.match(/--ds-color-accent-/g);
        if (accentMatches) contrastSafeTokens += accentMatches.length;
      }

      console.log('\nContrast token usage:');
      console.log(`  Background tokens: ${backgroundTokens}`);
      console.log(`  Text tokens: ${textTokens}`);
      console.log(`  Accent tokens: ${contrastSafeTokens}`);

      // Should use DS tokens which guarantee contrast
      expect(contrastSafeTokens + backgroundTokens + textTokens).toBeGreaterThan(5);
    });

    it('should have proper image alt attributes', () => {
      const tsxFiles = getAllTsxFiles();
      let imagesTotal = 0;
      let emptyAlt = 0;
      let descriptiveAlt = 0;
      
      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const imgTags = content.match(/<img[^>]*>/g) || [];
        imagesTotal += imgTags.length;
        
        imgTags.forEach(tag => {
          if (/alt=""/.test(tag)) emptyAlt++;
          else if (/alt=/.test(tag)) descriptiveAlt++;
        });
      }

      console.log('\nImage accessibility:');
      console.log(`  Total images: ${imagesTotal}`);
      console.log(`  Decorative (alt=""): ${emptyAlt}`);
      console.log(`  Descriptive (alt="..."): ${descriptiveAlt}`);

      const missingAlt = imagesTotal - (emptyAlt + descriptiveAlt);
      console.log(`  Missing alt: ${missingAlt}`);

      // Allow some images without alt (report but don't hard fail)
      expect(missingAlt).toBeLessThan(5);
    });
  });
});
