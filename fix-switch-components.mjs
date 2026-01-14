import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read settings.tsx
const settingsPath = path.join(__dirname, 'apps/backoffice/src/routes/settings.tsx');
let content = fs.readFileSync(settingsPath, 'utf8');

// Replace onCheckedChange with onChange
// Pattern: onCheckedChange={(checked: boolean) => ...}
// Replace with: onChange={(e) => ...checked becomes e.target.checked in the body

content = content.replace(
  /onCheckedChange=\{\(checked:\s*boolean\)\s*=>\s*/g,
  'onChange={(e) => '
);

// Replace all instances of 'checked' with 'e.target.checked' in the callback body
// This is a simple regex that works for the common case in settings.tsx
content = content.replace(
  /onChange=\{\(e\)\s*=>\s*setFormData\(prev\s*=>\s*\(\{\s*\.\.\.prev,\s*booking:\s*\{\s*\.\.\.prev\.booking,\s*(\w+):\s*checked\s*\}\s*\}\)\)\}/g,
  (match, prop) => {
    return `onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, ${prop}: e.target.checked }
                    }))}`;
  }
);

content = content.replace(
  /onChange=\{\(e\)\s*=>\s*setFormData\(prev\s*=>\s*\(\{\s*\.\.\.prev,\s*payment:\s*\{\s*\.\.\.prev\.payment,\s*(\w+):\s*checked\s*\}\s*\}\)\)\}/g,
  (match, prop) => {
    return `onChange={(e) => setFormData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, ${prop}: e.target.checked }
                    }))}`;
  }
);

content = content.replace(
  /onChange=\{\(e\)\s*=>\s*setFormData\(prev\s*=>\s*\(\{\s*\.\.\.prev,\s*notifications:\s*\{\s*\.\.\.prev\.notifications,\s*(\w+):\s*checked\s*\}\s*\}\)\)\}/g,
  (match, prop) => {
    return `onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, ${prop}: e.target.checked }
                    }))}`;
  }
);

content = content.replace(
  /onChange=\{\(e\)\s*=>\s*handleIntegrationToggle\('(\w+)',\s*checked\)\}/g,
  (match, integration) => {
    return `onChange={(e) => handleIntegrationToggle('${integration}', e.target.checked)}`;
  }
);

// Write the fixed content back
fs.writeFileSync(settingsPath, content, 'utf8');

console.log('✅ Fixed all Switch components in settings.tsx');
