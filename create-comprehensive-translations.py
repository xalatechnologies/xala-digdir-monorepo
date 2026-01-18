#!/usr/bin/env python3
import json
import os
import re
import subprocess

print('🔍 Creating comprehensive translation files...\n')

# Read existing translations
with open('packages/i18n/locales/nb.json', 'r', encoding='utf-8') as f:
    nb_translations = json.load(f)

with open('packages/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_translations = json.load(f)

# Flatten existing keys
def flatten_keys(obj, prefix=''):
    keys = set()
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.update(flatten_keys(value, full_key))
        else:
            keys.add(full_key)
    return keys

existing_keys = flatten_keys(nb_translations)
print(f'📊 Existing translation keys: {len(existing_keys)}\n')

# Scan for used translation keys
print('🔎 Scanning apps for translation keys...\n')
used_keys = set()

for app_path in ['apps/web/src', 'apps/minside/src', 'apps/backoffice/src']:
    try:
        result = subprocess.run(
            f"grep -r \"t('\" {app_path} | grep -o \"t('[^']*')\" | sed \"s/t('//g\" | sed \"s/')//g\" | sort -u",
            shell=True, capture_output=True, text=True, timeout=30
        )
        for key in result.stdout.strip().split('\n'):
            if key and len(key) > 1 and not key.startswith('@'):
                used_keys.add(key)
    except:
        pass

print(f'📊 Translation keys used in apps: {len(used_keys)}\n')

# Find missing keys
missing_keys = [k for k in used_keys if k not in existing_keys]
print(f'❌ Missing translation keys: {len(missing_keys)}\n')

# Categories and enums to add
categories = {
    'LOKALER_OG_BANER': {'nb': 'Lokaler og baner', 'en': 'Venues & Courts'},
    'UTSTYR_OG_INVENTAR': {'nb': 'Utstyr og inventar', 'en': 'Equipment & Inventory'},
    'KJORETOY_OG_TRANSPORT': {'nb': 'Kjøretøy og transport', 'en': 'Vehicles & Transport'},
    'OPPLEVELSER_OG_ARRANGEMENT': {'nb': 'Opplevelser og arrangement', 'en': 'Experiences & Events'}
}

# Common amenities
amenities = {
    'wifi': {'nb': 'WiFi', 'en': 'WiFi'},
    'parking': {'nb': 'Parkering', 'en': 'Parking'},
    'kitchen': {'nb': 'Kjøkken', 'en': 'Kitchen'},
    'projector': {'nb': 'Projektor', 'en': 'Projector'},
    'sound_system': {'nb': 'Lydsystem', 'en': 'Sound System'},
    'wheelchair_accessible': {'nb': 'Rullestoltilgjengelig', 'en': 'Wheelchair Accessible'},
    'air_conditioning': {'nb': 'Klimaanlegg', 'en': 'Air Conditioning'},
    'heating': {'nb': 'Oppvarming', 'en': 'Heating'},
    'outdoor_area': {'nb': 'Utendørsområde', 'en': 'Outdoor Area'},
    'changing_rooms': {'nb': 'Garderober', 'en': 'Changing Rooms'}
}

# Sidebar items for backoffice
backoffice_nav = {
    'dashboard': {'nb': 'Dashbord', 'en': 'Dashboard'},
    'bookings': {'nb': 'Bookinger', 'en': 'Bookings'},
    'listings': {'nb': 'Lokaler', 'en': 'Listings'},
    'calendar': {'nb': 'Kalender', 'en': 'Calendar'},
    'users': {'nb': 'Brukere', 'en': 'Users'},
    'reports': {'nb': 'Rapporter', 'en': 'Reports'},
    'settings': {'nb': 'Innstillinger', 'en': 'Settings'},
    'organizations': {'nb': 'Organisasjoner', 'en': 'Organizations'},
    'messages': {'nb': 'Meldinger', 'en': 'Messages'},
    'audit': {'nb': 'Revisjonslogg', 'en': 'Audit Log'}
}

# MinSide nav items
minside_nav = {
    'myBookings': {'nb': 'Mine bookinger', 'en': 'My Bookings'},
    'myProfile': {'nb': 'Min profil', 'en': 'My Profile'},
    'myOrganizations': {'nb': 'Mine organisasjoner', 'en': 'My Organizations'},
    'favorites': {'nb': 'Favoritter', 'en': 'Favorites'},
    'history': {'nb': 'Historikk', 'en': 'History'}
}

# Login screen
login_items = {
    'loginWithBankID': {'nb': 'Logg inn med BankID', 'en': 'Login with BankID'},
    'loginWithVipps': {'nb': 'Logg inn med Vipps', 'en': 'Login with Vipps'},
    'welcome': {'nb': 'Velkommen', 'en': 'Welcome'},
    'selectLoginMethod': {'nb': 'Velg innloggingsmetode', 'en': 'Select login method'},
    'termsAndConditions': {'nb': 'Vilkår og betingelser', 'en': 'Terms and Conditions'},
    'privacyPolicy': {'nb': 'Personvernerklæring', 'en': 'Privacy Policy'}
}

# Add all to translations
def add_nested(target, key_path, value):
    parts = key_path.split('.')
    current = target
    for i, part in enumerate(parts[:-1]):
        if part not in current:
            current[part] = {}
        elif not isinstance(current[part], dict):
            current[part] = {'_value': current[part]}
        current = current[part]
    current[parts[-1]] = value

# Add categories
for cat, trans in categories.items():
    add_nested(nb_translations, f'sdk.rentalObject.category.{cat}', trans['nb'])
    add_nested(en_translations, f'sdk.rentalObject.category.{cat}', trans['en'])

# Add amenities
for amenity, trans in amenities.items():
    add_nested(nb_translations, f'amenities.{amenity}', trans['nb'])
    add_nested(en_translations, f'amenities.{amenity}', trans['en'])

# Add backoffice nav
for item, trans in backoffice_nav.items():
    add_nested(nb_translations, f'nav.backoffice.{item}', trans['nb'])
    add_nested(en_translations, f'nav.backoffice.{item}', trans['en'])

# Add minside nav
for item, trans in minside_nav.items():
    add_nested(nb_translations, f'nav.minside.{item}', trans['nb'])
    add_nested(en_translations, f'nav.minside.{item}', trans['en'])

# Add login items
for item, trans in login_items.items():
    add_nested(nb_translations, f'auth.{item}', trans['nb'])
    add_nested(en_translations, f'auth.{item}', trans['en'])

# Add common missing keys with Norwegian fallback
common_missing = {
    'filter.showingResults': {'nb': 'Viser {{count}} resultater', 'en': 'Showing {{count}} results'},
    'filter.showResults': {'nb': 'Vis resultater', 'en': 'Show results'},
    'listings.category.all': {'nb': 'Alle typer', 'en': 'All types'},
    'common.showMore': {'nb': 'Vis mer', 'en': 'Show more'},
    'common.showLess': {'nb': 'Vis mindre', 'en': 'Show less'},
    'common.loading': {'nb': 'Laster...', 'en': 'Loading...'},
    'common.error': {'nb': 'Feil', 'en': 'Error'},
    'common.success': {'nb': 'Suksess', 'en': 'Success'},
    'common.cancel': {'nb': 'Avbryt', 'en': 'Cancel'},
    'common.save': {'nb': 'Lagre', 'en': 'Save'},
    'common.delete': {'nb': 'Slett', 'en': 'Delete'},
    'common.edit': {'nb': 'Rediger', 'en': 'Edit'},
    'common.close': {'nb': 'Lukk', 'en': 'Close'},
    'common.back': {'nb': 'Tilbake', 'en': 'Back'},
    'common.next': {'nb': 'Neste', 'en': 'Next'},
    'common.previous': {'nb': 'Forrige', 'en': 'Previous'},
    'common.search': {'nb': 'Søk', 'en': 'Search'},
    'common.filter': {'nb': 'Filtrer', 'en': 'Filter'},
    'common.sort': {'nb': 'Sorter', 'en': 'Sort'},
    'common.view': {'nb': 'Vis', 'en': 'View'},
    'common.download': {'nb': 'Last ned', 'en': 'Download'},
    'common.upload': {'nb': 'Last opp', 'en': 'Upload'},
    'common.confirm': {'nb': 'Bekreft', 'en': 'Confirm'},
    'common.yes': {'nb': 'Ja', 'en': 'Yes'},
    'common.no': {'nb': 'Nei', 'en': 'No'}
}

for key, trans in common_missing.items():
    add_nested(nb_translations, key, trans['nb'])
    add_nested(en_translations, key, trans['en'])

# Write updated translations
with open('packages/i18n/locales/nb.json', 'w', encoding='utf-8') as f:
    json.dump(nb_translations, f, ensure_ascii=False, indent=2)

with open('packages/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_translations, f, ensure_ascii=False, indent=2)

print('✅ Enhanced translation files created!')
print(f'\n📊 Summary:')
print(f'   - Categories added: {len(categories)}')
print(f'   - Amenities added: {len(amenities)}')
print(f'   - Backoffice nav items: {len(backoffice_nav)}')
print(f'   - MinSide nav items: {len(minside_nav)}')
print(f'   - Login items: {len(login_items)}')
print(f'   - Common items: {len(common_missing)}')
print(f'\n✅ Files updated:')
print(f'   - packages/i18n/locales/nb.json')
print(f'   - packages/i18n/locales/en.json')
