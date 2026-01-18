#!/usr/bin/env python3
import json
import os

# Read database translations
with open('packages/database-schema/seeds/platform/translations.json', 'r', encoding='utf-8') as f:
    db_translations = json.load(f)

# Group by language
nb = {}
en = {}

for t in db_translations:
    target = nb if t['language'] == 'nb' else en
    
    # Build nested structure
    full_key = f"{t.get('namespace', '')}.{t['key']}" if t.get('namespace') else t['key']
    parts = full_key.split('.')
    
    current = target
    for i, part in enumerate(parts[:-1]):
        if part not in current:
            current[part] = {}
        elif not isinstance(current[part], dict):
            # Key conflict - convert to dict
            current[part] = {'_value': current[part]}
        current = current[part]
    
    # Set the final value
    final_key = parts[-1]
    if final_key in current and isinstance(current[final_key], dict):
        current[final_key]['_value'] = t['value']
    else:
        current[final_key] = t['value']

# Create locales directory
os.makedirs('packages/i18n/locales', exist_ok=True)

# Write JSON files
with open('packages/i18n/locales/nb.json', 'w', encoding='utf-8') as f:
    json.dump(nb, f, ensure_ascii=False, indent=2)

with open('packages/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

print('✅ Generated JSON translation files')
print(f'   - packages/i18n/locales/nb.json: {len(nb)} top-level namespaces')
print(f'   - packages/i18n/locales/en.json: {len(en)} top-level namespaces')
print(f'📊 Total translations: {len(db_translations)}')
