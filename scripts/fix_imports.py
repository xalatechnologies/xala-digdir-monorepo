import os
import re

TEST_SUITES_DIR = 'packages/testing/suites'

replacements = [
    # API
    (r"from '\.\./\.\./\.\./\.\./apps/api/src/", "from '@xala/api/"),
    (r"from '\.\./\.\./\.\./", "from '@xala/api/"), # For depth 3 files in API
    (r"from '\.\./\.\./", "from '@xala/api/"),     # For depth 2 files in API
    (r"from '\.\./", "from '@xala/api/"),         # For depth 1 files in API
    
    # Backoffice
    (r"from '\.\./\.\./\.\./\.\./\.\./apps/backoffice/src/", "from '@xala/backoffice/"),
    (r"from '\.\./\.\./\.\./\.\./apps/backoffice/src/", "from '@xala/backoffice/"),
    
    # Packages
    (r"from '\.\./\.\./\.\./\.\./packages/auth/src/", "from '@xala/auth/"),
    (r"from '\.\./\.\./\.\./\.\./packages/i18n/src/", "from '@xala/i18n/"),
    (r"from '\.\./\.\./\.\./\.\./packages/ds/src/", "from '@xala/ds/"),
    
    # Double quotes versions
    (r'from "\.\./\.\./\.\./\.\./apps/api/src/', 'from "@xala/api/'),
    (r'from "\.\./\.\./\.\./', 'from "@xala/api/'),
    (r'from "\.\./\.\./', 'from "@xala/api/'),
    (r'from "\.\./', 'from "@xala/api/'),
    (r'from "\.\./\.\./\.\./\.\./\.\./apps/backoffice/src/', 'from "@xala/backoffice/'),
    (r'from "\.\./\.\./\.\./\.\./apps/backoffice/src/', 'from "@xala/backoffice/'),
]

# Specific overrides for certain paths
path_specific = [
    ('suites/unit/api', [
        (r"from '\.\./", "from '@xala/api/"),
        (r"from '\.\./\.\./", "from '@xala/api/"),
    ]),
    ('suites/unit/apps/backoffice', [
        (r"from '\.\./\.\./\.\./\.\./", "from '@xala/backoffice/"),
        (r"from '\.\./\.\./\.\./", "from '@xala/backoffice/"),
    ]),
]

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Apply path-specific rules first
    for path_part, rules in path_specific:
        if path_part in filepath:
            for pattern, replacement in rules:
                content = re.sub(pattern, replacement, content)
    
    # Apply global rules
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    fixed_count = 0
    for root, _, files in os.walk(TEST_SUITES_DIR):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    fixed_count += 1
    print(f"Fixed {fixed_count} files.")

if __name__ == '__main__':
    main()
