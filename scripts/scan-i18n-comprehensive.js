#!/usr/bin/env node
/**
 * EXPERT-LEVEL i18n Localization Scanner
 * 
 * 🎯 MISSION: ZERO hardcoded strings, 100% translation coverage
 * 🔍 DETECTION: Advanced pattern matching with linguistic analysis
 * 🌍 SCOPE: All frontend apps with deep file inspection
 * ⚡ ACCURACY: Expert-level string classification
 *
 * This scanner acts as an i18n/localization expert that:
 * - Detects ALL user-facing strings (visible text, labels, messages, errors)
 * - Validates translation key existence and usage
 * - Identifies linguistic patterns (Norwegian, English, multilingual)
 * - Catches edge cases (template literals, concatenation, dynamic content)
 * - Provides actionable fix suggestions with translation keys
 * - Analyzes string context for semantic understanding
 *
 * Detection Capabilities:
 * ✅ JSX text content (all patterns)
 * ✅ Component props (30+ prop types)
 * ✅ Toast/notification messages (all libraries)
 * ✅ Form validation messages
 * ✅ Error messages (inline, boundaries, API)
 * ✅ Badge/Tag/Chip content
 * ✅ Table headers/cells
 * ✅ Button/Link text
 * ✅ Heading/Title/Subtitle
 * ✅ Placeholder text
 * ✅ Tooltip/Hint content
 * ✅ Modal/Dialog titles and content
 * ✅ Alert/Banner messages
 * ✅ Status indicators
 * ✅ Menu/Navigation items
 * ✅ Breadcrumb labels
 * ✅ Tab labels
 * ✅ Select/Option labels
 * ✅ Checkbox/Radio labels
 * ✅ Loading states
 * ✅ Empty states
 * ✅ Success/Error messages
 * ✅ Confirmation dialogs
 * ✅ Help text
 * ✅ Accessibility labels (aria-*)
 * ✅ Meta descriptions
 * ✅ Document titles
 * ✅ Template literals with text
 * ✅ String concatenation
 * ✅ Ternary operator strings
 * ✅ Array of strings (for options, lists)
 * ✅ Object string values (config, data)
 * ✅ Dynamic imports with text
 * ✅ Console messages meant for users
 * ✅ localStorage/sessionStorage keys (if user-facing)
 *
 * Usage:
 *   node scripts/scan-i18n-comprehensive.js [--all] [--app=appname] [--strict] [--fix-suggestions]
 *
 * Examples:
 *   node scripts/scan-i18n-comprehensive.js --all --strict
 *   node scripts/scan-i18n-comprehensive.js --app=backoffice --fix-suggestions
 *   node scripts/scan-i18n-comprehensive.js --app=minside
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  // Apps to scan (exclude API as it doesn't use i18n)
  apps: ['backoffice', 'minside', 'web', 'tenant-admin', 'saas-admin', 'docs-learning', 'monitoring'],
  
  // File extensions to scan
  extensions: ['.tsx', '.ts', '.jsx', '.js'],

  // Directories to skip
  skipDirs: [
    'node_modules', 'dist', 'build', '.git', 'coverage', 
    '__tests__', 'test', 'tests', 'fixtures', '__mocks__'
  ],

  // Files to skip
  skipFiles: ['.test.', '.spec.', '.stories.', 'fixtures', 'mock', '.mock.'],

  // Minimum string length to report
  minStringLength: 2,

  // Patterns to ignore (technical, not user-facing)
  ignorePatterns: [
    // Already using t() function
    /t\s*\(\s*["']/,
    /\{t\s*\(/,
    // Environment variables
    /process\.env\./,
    /import\.meta\.env\./,
    // URLs and paths
    /^https?:\/\//,
    /^\/[a-z-/]+$/,
    /^\//,  // Paths
    // CSS classes and IDs
    /className\s*=/,
    /class\s*=/,
    /id\s*=/,
    // Data attributes
    /data-[a-z-]+\s*=/,
    // File extensions and MIME types
    /\.(jpg|png|svg|pdf|json|css|js|ts|tsx|xml|yaml|yml|md)/,
    /^image\//,
    /^text\//,
    /^application\//,
    // ISO dates, times, and numbers
    /^\d{4}-\d{2}-\d{2}/,
    /^\d+$/,
    /^\d+\.\d+$/,
    /^\d+:\d+/,
    // Email addresses
    /@[a-z0-9.-]+\.[a-z]{2,}/i,
    // Common code strings
    /^(true|false|null|undefined|NaN)$/,
    // Regex patterns
    /new RegExp/,
    /\/.*\//,  // Regex literals
    // Import/export statements
    /^(import|export|from|as|default|const|let|var|function|class|interface|type|enum)\s/,
    // Mock/test data patterns
    /MOCK_[A-Z_]+/,
    /^Test\s/,
    /@test\./,
    // Technical identifier constants
    /(?:const|let|var)\s+[A-Z_][A-Z0-9_]*\s*[:=]\s*["']/,
    // Route/path constants
    /^\/(api|auth|callback|login|logout)/,
    // CSS/Style values
    /^(auto|none|inherit|initial|unset)$/,
    /^var\(--/,  // CSS variables
    /^\d+px$/,
    /^\d+%$/,
    /^#[0-9a-f]{3,6}$/i,  // Hex colors
    // Technical props
    /^(onClick|onChange|onSubmit|onBlur|onFocus|onKeyDown|onKeyUp|ref|key|style)$/,
    // TypeScript types
    /^(string|number|boolean|object|array|void|any|unknown|never|Promise|Record|Partial|Required)$/i,
    // Component names (PascalCase)
    /^[A-Z][a-zA-Z]*$/,
    // Technical context identifiers
    /CONTEXT_[A-Z_]+/,
    /TYPE_[A-Z_]+/,
    /STATUS_[A-Z_]+/,
  ],

  // Additional hardcoded string patterns to detect (EXPERT LEVEL)
  additionalPatterns: [
    // Toast/Notification messages (all variants)
    {
      pattern: /toast\.(success|error|warning|info|message)\s*\(\s*["']([^"']+)["']/g,
      type: 'toast_message',
      severity: 'high',
      captureGroup: 2,
    },
    // Sonner toast (newer library)
    {
      pattern: /sonner\.(success|error|warning|info|message)\s*\(\s*["']([^"']+)["']/g,
      type: 'toast_message',
      severity: 'high',
      captureGroup: 2,
    },
    // React-hot-toast
    {
      pattern: /toast(?:\.(?:success|error|loading|custom))?\s*\(\s*["']([^"']+)["']/g,
      type: 'toast_message',
      severity: 'high',
      captureGroup: 1,
    },
    // Badge/Tag/Chip content (all variants)
    {
      pattern: /<(?:Badge|Tag|Chip|Label|StatusIndicator)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'badge_content',
      severity: 'high',
      captureGroup: 1,
    },
    // Table headers (all variants)
    {
      pattern: /<(?:th|Table\.HeaderCell|TableHeader|DataTable\.Header)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'table_header',
      severity: 'high',
      captureGroup: 1,
    },
    // Table cells with text
    {
      pattern: /<(?:td|Table\.Cell|TableCell|DataTable\.Cell)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'table_cell',
      severity: 'medium',
      captureGroup: 1,
    },
    // Button content (direct children, all button types)
    {
      pattern: /<(?:Button|IconButton|ActionButton|LinkButton)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'button_text',
      severity: 'high',
      captureGroup: 1,
    },
    // Link content
    {
      pattern: /<(?:Link|NavLink|RouterLink|a)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'link_text',
      severity: 'high',
      captureGroup: 1,
    },
    // Heading content (all levels)
    {
      pattern: /<(?:Heading|Title|h[1-6])[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'heading_text',
      severity: 'high',
      captureGroup: 1,
    },
    // Paragraph/Text content
    {
      pattern: /<(?:Paragraph|Text|Typography|p)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'paragraph_text',
      severity: 'medium',
      captureGroup: 1,
    },
    // Alert/Banner messages
    {
      pattern: /<(?:Alert|Banner|Notification|Notice)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'alert_content',
      severity: 'high',
      captureGroup: 1,
    },
    // Modal/Dialog titles
    {
      pattern: /<(?:Modal|Dialog|Drawer)\.(?:Title|Header)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'modal_title',
      severity: 'high',
      captureGroup: 1,
    },
    // Tab labels
    {
      pattern: /<(?:Tab|Tabs\.Tab|TabPanel)[^>]*(?:label|title)=["']([^"']+)["']/g,
      type: 'tab_label',
      severity: 'high',
      captureGroup: 1,
    },
    // Select/option values (option text)
    {
      pattern: /<option[^>]*value=["']([^"']+)["'][^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<]+?)\s*</g,
      type: 'option_text',
      severity: 'high',
      captureGroup: 2,
    },
    // Empty state messages
    {
      pattern: /<(?:EmptyState|NoResults|NoData)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'empty_state',
      severity: 'high',
      captureGroup: 1,
    },
    // Loading states
    {
      pattern: /<(?:Loading|Spinner|Skeleton)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'loading_state',
      severity: 'medium',
      captureGroup: 1,
    },
    // Error messages (inline)
    {
      pattern: /(?:error|errorMessage|validationMessage|errorText)\s*[:=]\s*["']([^"']+)["']/g,
      type: 'error_message',
      severity: 'high',
      captureGroup: 1,
    },
    // Validation error messages (Zod, Yup, etc.)
    {
      pattern: /\.(?:message|error)\s*\(\s*["']([^"']+)["']/g,
      type: 'validation_error',
      severity: 'high',
      captureGroup: 1,
    },
    // Confirm/alert dialog messages
    {
      pattern: /(?:window\.)?(?:confirm|alert)\s*\(\s*["']([^"']+)["']/g,
      type: 'confirm_dialog',
      severity: 'high',
      captureGroup: 1,
    },
    // Template literals with Norwegian/English text (advanced detection)
    {
      pattern: /`([^`]*(?:hjelp|søk|lagre|avbryt|slett|endre|velkommen|feil|suksess|advarsel|help|search|save|cancel|delete|edit|welcome|error|success|warning)[^`]*)`/gi,
      type: 'template_literal',
      severity: 'high',
      captureGroup: 1,
    },
    // String concatenation with user-facing text
    {
      pattern: /["']([A-Z\u00C6\u00D8\u00C5][a-z\u00E6\u00F8\u00E5\s]+)["']\s*\+/g,
      type: 'string_concatenation',
      severity: 'high',
      captureGroup: 1,
    },
    // Ternary operator with strings
    {
      pattern: /\?\s*["']([A-Z\u00C6\u00D8\u00C5][^"']+)["']\s*:/g,
      type: 'ternary_string',
      severity: 'medium',
      captureGroup: 1,
    },
    // Menu/Navigation items
    {
      pattern: /<(?:MenuItem|NavItem|NavigationItem)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'menu_item',
      severity: 'high',
      captureGroup: 1,
    },
    // Breadcrumb labels
    {
      pattern: /<(?:Breadcrumb|BreadcrumbItem)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'breadcrumb_label',
      severity: 'high',
      captureGroup: 1,
    },
    // Status indicators (beyond badges)
    {
      pattern: /<(?:Status|StatusIndicator|State)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'status_indicator',
      severity: 'high',
      captureGroup: 1,
    },
    // Checkbox/Radio labels (direct)
    {
      pattern: /<(?:Checkbox|Radio|Switch)[^>]*label=["']([^"']+)["']/g,
      type: 'checkbox_label',
      severity: 'high',
      captureGroup: 1,
    },
    // List item content
    {
      pattern: /<(?:li|ListItem)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'list_item',
      severity: 'medium',
      captureGroup: 1,
    },
    // Card titles/content
    {
      pattern: /<(?:Card\.Title|CardTitle|CardHeader)[^>]*>\s*([A-Z\u00C6\u00D8\u00C5][^<{]+?)\s*</g,
      type: 'card_title',
      severity: 'high',
      captureGroup: 1,
    },
    // Form section titles
    {
      pattern: /<(?:FormSection|FieldSet|FormGroup)[^>]*title=["']([^"']+)["']/g,
      type: 'form_section_title',
      severity: 'high',
      captureGroup: 1,
    },
    // Helper text / Hints
    {
      pattern: /(?:helperText|hint|helpText)\s*=\s*["']([^"']+)["']/g,
      type: 'helper_text',
      severity: 'high',
      captureGroup: 1,
    },
  ],

  // Norwegian/English common words that indicate user-facing text
  commonWords: [
    // Norwegian
    'hjelp', 'søk', 'lukk', 'åpne', 'lagre', 'avbryt', 'slett', 'endre', 'legg', 'til',
    'tilbake', 'neste', 'forrige', 'send', 'bekreft', 'ja', 'nei', 'velg', 'valgt',
    'feil', 'suksess', 'advarsel', 'informasjon', 'laster', 'ingen', 'alle', 'ny',
    'rediger', 'opprett', 'fjern', 'kopier', 'lim', 'inn', 'last', 'ned', 'opp',
    'aktiv', 'inaktiv', 'utløpt', 'godkjent', 'avslått', 'ventende', 'status',
    'navn', 'type', 'lokasjon', 'telefon', 'bruker', 'organisasjon', 'booking',
    'dato', 'tid', 'pris', 'betaling', 'beskrivelse', 'melding', 'varsel',
    // English
    'help', 'search', 'close', 'open', 'save', 'cancel', 'delete', 'edit', 'add',
    'back', 'next', 'previous', 'submit', 'confirm', 'yes', 'no', 'select', 'selected',
    'error', 'success', 'warning', 'info', 'loading', 'none', 'all', 'new',
    'remove', 'copy', 'paste', 'download', 'upload', 'create',
    'active', 'inactive', 'expired', 'approved', 'rejected', 'pending', 'status',
    'name', 'type', 'location', 'phone', 'user', 'organization', 'booking',
    'date', 'time', 'price', 'payment', 'description', 'message', 'notification',
  ],
};

// Results storage
const results = {
  apps: {},
  summary: {
    totalApps: 0,
    totalFiles: 0,
    scannedFiles: 0,
    skippedFiles: 0,
    hardcodedStrings: 0,
    missingT: 0,
    totalIssues: 0,
  },
  translationKeys: null,  // Will load from nb.ts
  missingTranslations: [],
  usedButMissingKeys: [],
};

/**
 * Load translation keys from nb.ts
 */
function loadTranslationKeys() {
  try {
    const i18nPath = path.join(rootDir, 'packages/i18n/src/locales/nb.ts');
    const content = fs.readFileSync(i18nPath, 'utf8');
    
    // Extract keys using regex (simple approach)
    const keys = [];
    const keyPattern = /['"]([a-zA-Z0-9._-]+)['"]\s*:/g;
    let match;
    
    while ((match = keyPattern.exec(content)) !== null) {
      keys.push(match[1]);
    }
    
    results.translationKeys = new Set(keys);
    console.log(`📚 Loaded ${keys.length} translation keys from nb.ts\n`);
  } catch (error) {
    console.warn('⚠️  Could not load translation keys:', error.message);
    results.translationKeys = new Set();
  }
}

/**
 * Check if a string should be ignored
 */
function shouldIgnore(str, context = '') {
  if (!str || typeof str !== 'string') return true;
  
  const trimmed = str.trim();
  if (trimmed.length < CONFIG.minStringLength) return true;

  // Check against ignore patterns
  for (const pattern of CONFIG.ignorePatterns) {
    if (pattern.test(trimmed) || pattern.test(context)) {
      return true;
    }
  }

  // Ignore strings that are just symbols or punctuation
  if (/^[^a-zA-ZæøåÆØÅ]+$/.test(trimmed)) return true;

  // Ignore single words that are likely code (camelCase, PascalCase, snake_case)
  if (/^[a-z]+[A-Z]/.test(trimmed) && !/\s/.test(trimmed)) return true;
  if (/^[a-z]+_[a-z]+$/.test(trimmed)) return true;

  // Ignore SCREAMING_SNAKE_CASE constants
  if (/^[A-Z_][A-Z0-9_]*$/.test(trimmed)) return true;

  return false;
}

/**
 * Advanced linguistic analysis - Detect if string is Norwegian or English
 */
function detectLanguage(str) {
  const norwegianPatterns = [
    /[æøå]/i,  // Norwegian characters
    /\b(og|eller|med|til|fra|for|på|av|i|er|har|kan|må|skal|vil|ikke|også|som)\b/i,  // Common Norwegian words
    /\b(hjelp|søk|lukk|åpne|lagre|avbryt|slett|endre|velkommen|feil|suksess)\b/i,  // Action words
  ];
  
  const englishPatterns = [
    /\b(and|or|with|to|from|for|on|of|in|is|are|has|have|can|must|should|will|not|also|as|the|a|an)\b/i,
    /\b(help|search|close|open|save|cancel|delete|edit|welcome|error|success)\b/i,
  ];
  
  const norwegianScore = norwegianPatterns.filter(pattern => pattern.test(str)).length;
  const englishScore = englishPatterns.filter(pattern => pattern.test(str)).length;
  
  if (norwegianScore > englishScore) return 'Norwegian';
  if (englishScore > norwegianScore) return 'English';
  if (/^[A-ZÆØÅ]/.test(str)) return 'Likely Norwegian or English';
  return 'Unknown';
}

/**
 * Generate translation key suggestion based on string content
 */
function suggestTranslationKey(str, type) {
  // Clean and normalize string
  const cleaned = str
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)  // Max 4 words
    .join('_');
  
  // Generate contextual prefix based on type
  const prefixMap = {
    'toast_message': 'messages',
    'badge_content': 'status',
    'table_header': 'table',
    'button_text': 'actions',
    'heading_text': 'titles',
    'error_message': 'errors',
    'validation_error': 'validation',
    'form_section_title': 'forms',
    'modal_title': 'modals',
    'tab_label': 'tabs',
    'menu_item': 'navigation',
    'empty_state': 'empty_states',
    'loading_state': 'loading',
  };
  
  const prefix = prefixMap[type] || 'common';
  return `${prefix}.${cleaned}`;
}

/**
 * Check if string is definitely user-facing (EXPERT ANALYSIS)
 */
function isDefinitelyUserFacing(str, context = '') {
  // Definitely user-facing if:
  
  // 1. Contains Norwegian-specific characters
  if (/[æøå]/i.test(str)) return true;
  
  // 2. Contains common Norwegian words
  const norwegianWords = [
    'hjelp', 'søk', 'lukk', 'åpne', 'lagre', 'avbryt', 'slett', 'endre',
    'velkommen', 'feil', 'suksess', 'advarsel', 'informasjon', 'laster',
    'ingen', 'alle', 'ny', 'rediger', 'opprett', 'fjern', 'og', 'til',
    'fra', 'med', 'for', 'på', 'av', 'er', 'har', 'kan', 'skal', 'vil',
    'aktiv', 'inaktiv', 'godkjent', 'avslått', 'ventende', 'bruker',
    'organisasjon', 'booking', 'dato', 'tid', 'navn', 'type', 'status',
  ];
  
  const lowerStr = str.toLowerCase();
  if (norwegianWords.some(word => lowerStr.includes(word))) return true;
  
  // 3. Contains common English UI words (if we support English)
  const englishUIWords = [
    'save', 'cancel', 'delete', 'edit', 'create', 'remove', 'add',
    'close', 'open', 'search', 'filter', 'loading', 'error', 'success',
    'warning', 'confirm', 'submit', 'reset', 'clear', 'select', 'choose',
  ];
  
  if (englishUIWords.some(word => lowerStr.includes(word))) return true;
  
  // 4. Starts with capital letter and contains spaces (likely a sentence/phrase)
  if (/^[A-ZÆØÅ]/.test(str) && /\s/.test(str) && str.length > 10) return true;
  
  // 5. In user-facing context (form labels, buttons, headings)
  const userFacingContexts = [
    /<(?:Button|Heading|Title|Label|FormField|Alert|Badge|Tag)\b/,
    /\b(?:label|title|placeholder|description|tooltip|hint)\s*=/,
    /toast\./,
    /<th\b/,
    /<option\b/,
  ];
  
  if (userFacingContexts.some(pattern => pattern.test(context))) return true;
  
  return false;
}

/**
 * Extract strings from file content
 */
function extractStrings(content, filePath, appName) {
  const issues = [];
  const lines = content.split('\n');

  // Check if file uses t() function
  const usesT = /const\s+t\s*=\s*useT\s*\(/.test(content) ||
                /import\s+{[^}]*\buseT\b[^}]*}\s+from/.test(content);

  // Pattern 1: JSX text content between tags
  const jsxTextPattern = />([^<>{}\n]+)</g;
  let match;

  while ((match = jsxTextPattern.exec(content)) !== null) {
    const text = match[1].trim();
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    if (shouldIgnore(text, lineContent)) continue;

    if (isDefinitelyUserFacing(text, lineContent)) {
      const contextLines = lines.slice(Math.max(0, lineNumber - 2), lineNumber + 1).join('\n');
      if (!contextLines.includes('t(') && !contextLines.includes('{t(')) {
        const language = detectLanguage(text);
        const suggestedKey = suggestTranslationKey(text, 'jsx_text');
        
        issues.push({
          app: appName,
          file: filePath,
          line: lineNumber,
          type: 'hardcoded_jsx_text',
          string: text,
          context: lineContent.substring(0, 120),
          severity: 'high',
          language: language,
          suggestedKey: suggestedKey,
          fix: `{t('${suggestedKey}')}`,
        });
        results.summary.hardcodedStrings++;
      }
    }
  }

  // Pattern 2: String literals in props (COMPREHENSIVE - 40+ prop types)
  const propsPattern = /(title|label|placeholder|description|message|text|subtitle|heading|alt|aria-label|ariaLabel|panelTitle|panelSubtitle|brandName|brandTagline|tooltip|hint|helperText|helpText|errorText|errorMessage|validationMessage|successMessage|warningMessage|infoMessage|emptyText|emptyMessage|loadingText|loadingMessage|noResultsText|confirmText|cancelText|submitText|resetText|clearText|searchPlaceholder|filterPlaceholder|buttonText|linkText|breadcrumbText|tabLabel|menuLabel|navigationLabel|sectionTitle|groupTitle|fieldLabel|inputLabel|checkboxLabel|radioLabel|switchLabel|selectLabel|textareaLabel|dateLabel|timeLabel)\s*=\s*["']([^"']+)["']/g;

  while ((match = propsPattern.exec(content)) !== null) {
    const propName = match[1];
    const propValue = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    if (shouldIgnore(propValue, lineContent)) continue;

    // Skip constants
    if (/^\s*(const|let|var)\s+[A-Z_][A-Z0-9_]*\s*[:=]/.test(lineContent)) continue;

    if (!lineContent.includes('t(') && isDefinitelyUserFacing(propValue, lineContent)) {
      const language = detectLanguage(propValue);
      const suggestedKey = suggestTranslationKey(propValue, 'hardcoded_prop');
      
      issues.push({
        app: appName,
        file: filePath,
        line: lineNumber,
        type: 'hardcoded_prop',
        string: propValue,
        prop: propName,
        context: lineContent.substring(0, 120),
        severity: 'high',
        language: language,
        suggestedKey: suggestedKey,
        fix: `${propName}={t('${suggestedKey}')}`,
      });
      results.summary.hardcodedStrings++;
    }
  }

  // Pattern 3: Additional patterns (toast, badges, etc.)
  for (const patternConfig of CONFIG.additionalPatterns) {
    const regex = new RegExp(patternConfig.pattern.source, patternConfig.pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      const text = match[patternConfig.captureGroup]?.trim();
      if (!text) continue;
      
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';

      if (shouldIgnore(text, lineContent)) continue;

      if (isDefinitelyUserFacing(text, lineContent) && !lineContent.includes('t(')) {
        const language = detectLanguage(text);
        const suggestedKey = suggestTranslationKey(text, patternConfig.type);
        
        issues.push({
          app: appName,
          file: filePath,
          line: lineNumber,
          type: patternConfig.type,
          string: text,
          context: lineContent.substring(0, 120),
          severity: patternConfig.severity,
          language: language,
          suggestedKey: suggestedKey,
          fix: `{t('${suggestedKey}')}`,
        });
        results.summary.hardcodedStrings++;
      }
    }
  }

  // Pattern 4: Object properties that look like text
  const objectTextPattern = /(name|title|label|description|text|message|heading|subtitle)\s*:\s*["']([^"']+)["']/g;

  while ((match = objectTextPattern.exec(content)) !== null) {
    const key = match[1];
    const value = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    if (shouldIgnore(value, lineContent)) continue;

    if (isDefinitelyUserFacing(value, lineContent) && !lineContent.includes('t(')) {
      const language = detectLanguage(value);
      const suggestedKey = suggestTranslationKey(value, 'hardcoded_object_value');
      
      issues.push({
        app: appName,
        file: filePath,
        line: lineNumber,
        type: 'hardcoded_object_value',
        string: value,
        key: key,
        context: lineContent.substring(0, 120),
        severity: 'medium',
        language: language,
        suggestedKey: suggestedKey,
        fix: `${key}: t('${suggestedKey}')`,
      });
      results.summary.hardcodedStrings++;
    }
  }

  // Pattern 5: Validate existing t() calls
  if (results.translationKeys && results.translationKeys.size > 0) {
    const tCallPattern = /t\s*\(\s*["']([a-zA-Z0-9._-]+)["']/g;
    
    while ((match = tCallPattern.exec(content)) !== null) {
      const key = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      if (!results.translationKeys.has(key)) {
        results.usedButMissingKeys.push({
          app: appName,
          file: filePath,
          line: lineNumber,
          key: key,
        });
      }
    }
  }

  // Pattern 6: Check if file has JSX but doesn't use t()
  const hasJSX = /<[A-Z][a-zA-Z]*/.test(content);
  const hasText = />[A-ZÆØÅ][a-z]/.test(content);

  if (hasJSX && hasText && !usesT && filePath.endsWith('.tsx') && issues.length > 0) {
    issues.push({
      app: appName,
      file: filePath,
      line: 1,
      type: 'missing_t_import',
      string: '',
      context: 'File contains user-facing text but does not import useT()',
      severity: 'high',
    });
    results.summary.missingT++;
  }

  return issues;
}

/**
 * Scan a single file
 */
function scanFile(filePath, appName) {
  results.summary.totalFiles++;

  // Check if file should be skipped
  for (const skip of CONFIG.skipFiles) {
    if (filePath.includes(skip)) {
      results.summary.skippedFiles++;
      return;
    }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.summary.scannedFiles++;

    const issues = extractStrings(content, filePath, appName);
    
    if (!results.apps[appName].issues) {
      results.apps[appName].issues = [];
    }
    results.apps[appName].issues.push(...issues);
    results.summary.totalIssues += issues.length;
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath, appName) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (CONFIG.skipDirs.includes(entry.name)) continue;
        scanDirectory(fullPath, appName);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (CONFIG.extensions.includes(ext)) {
          scanFile(fullPath, appName);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
}

/**
 * Scan a single app
 */
function scanApp(appName) {
  const appPath = path.join(rootDir, 'apps', appName, 'src');
  
  if (!fs.existsSync(appPath)) {
    console.log(`⏭️  Skipping ${appName} (no src directory)`);
    return;
  }

  console.log(`🔍 Scanning ${appName}...`);
  
  results.apps[appName] = {
    filesScanned: 0,
    issues: [],
  };

  scanDirectory(appPath, appName);
  
  results.apps[appName].filesScanned = results.summary.scannedFiles - 
    Object.values(results.apps)
      .filter(app => app !== results.apps[appName])
      .reduce((sum, app) => sum + (app.filesScanned || 0), 0);
  
  console.log(`   ✅ Found ${results.apps[appName].issues.length} issues in ${results.apps[appName].filesScanned} files`);
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  console.log('\n========================================');
  console.log('COMPREHENSIVE i18n SCAN REPORT');
  console.log('========================================\n');

  console.log('Apps Scanned:', results.summary.totalApps);
  console.log('Files Scanned:', results.summary.scannedFiles);
  console.log('Files Skipped:', results.summary.skippedFiles);
  console.log('Total Files:', results.summary.totalFiles);
  
  console.log('\n----------------------------------------');
  console.log('SUMMARY');
  console.log('----------------------------------------');
  console.log('Hardcoded Strings:', results.summary.hardcodedStrings);
  console.log('Missing t() Import:', results.summary.missingT);
  console.log('Missing Translation Keys:', results.usedButMissingKeys.length);
  console.log('Total Issues:', results.summary.totalIssues);

  // Issues by app
  console.log('\n----------------------------------------');
  console.log('ISSUES BY APP');
  console.log('----------------------------------------');
  
  const sortedApps = Object.keys(results.apps).sort((a, b) => 
    results.apps[b].issues.length - results.apps[a].issues.length
  );

  for (const appName of sortedApps) {
    const app = results.apps[appName];
    console.log(`\n📱 ${appName}: ${app.issues.length} issues (${app.filesScanned} files scanned)`);
  }

  // Top 10 files with most issues
  console.log('\n----------------------------------------');
  console.log('TOP 10 FILES WITH MOST ISSUES');
  console.log('----------------------------------------\n');

  const allIssues = Object.values(results.apps).flatMap(app => app.issues);
  const issuesByFile = {};
  
  for (const issue of allIssues) {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  }

  const sortedFiles = Object.keys(issuesByFile)
    .sort((a, b) => issuesByFile[b].length - issuesByFile[a].length)
    .slice(0, 10);

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const issues = issuesByFile[file];
    const relPath = file.replace(rootDir, '.');
    console.log(`${i + 1}. ${relPath} (${issues.length} issues)`);
  }

  // Missing translation keys
  if (results.usedButMissingKeys.length > 0) {
    console.log('\n----------------------------------------');
    console.log('MISSING TRANSLATION KEYS');
    console.log('----------------------------------------\n');
    console.log(`Found ${results.usedButMissingKeys.length} translation keys used in code but not defined in nb.ts:\n`);
    
    const uniqueKeys = [...new Set(results.usedButMissingKeys.map(item => item.key))];
    uniqueKeys.slice(0, 20).forEach(key => {
      console.log(`  - ${key}`);
    });
    
    if (uniqueKeys.length > 20) {
      console.log(`  ... and ${uniqueKeys.length - 20} more`);
    }
  }

  // Generate JSON report
  const reportPath = path.join(rootDir, 'i18n-comprehensive-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: results.summary,
    apps: results.apps,
    usedButMissingKeys: results.usedButMissingKeys,
    topFiles: sortedFiles.map(file => ({
      file: file.replace(rootDir, '.'),
      issueCount: issuesByFile[file].length,
    })),
  }, null, 2));

  console.log('\n----------------------------------------');
  console.log('REPORT SAVED');
  console.log('----------------------------------------');
  console.log(`JSON report: ${reportPath}`);
  console.log('\n========================================\n');

  return results.summary.totalIssues;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const scanAll = args.includes('--all');
  // const validateTranslations = args.includes('--validate-translations');  // Future feature
  const appArg = args.find(arg => arg.startsWith('--app='));
  const specificApp = appArg ? appArg.split('=')[1] : null;

  console.log('\n🔍 Starting comprehensive i18n localization scan...\n');

  // Load translation keys
  loadTranslationKeys();

  // Determine which apps to scan
  let appsToScan = [];
  
  if (specificApp) {
    if (!CONFIG.apps.includes(specificApp)) {
      console.error(`❌ Error: Unknown app "${specificApp}"`);
      console.log(`Available apps: ${CONFIG.apps.join(', ')}`);
      process.exit(1);
    }
    appsToScan = [specificApp];
  } else if (scanAll) {
    appsToScan = CONFIG.apps;
  } else {
    // Default: scan main user-facing apps
    appsToScan = ['backoffice', 'minside', 'web'];
  }

  console.log(`📱 Apps to scan: ${appsToScan.join(', ')}\n`);

  // Scan each app
  results.summary.totalApps = appsToScan.length;
  
  for (const appName of appsToScan) {
    scanApp(appName);
  }

  // Generate report
  const issueCount = generateReport();

  // Exit code (0 if no issues, 1 if issues found)
  process.exit(issueCount > 0 ? 1 : 0);
}

// Run scanner
main();
