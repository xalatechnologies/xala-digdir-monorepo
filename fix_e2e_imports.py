import os
import re

TEST_SUITES_DIR = 'packages/testing-e2e/suites'

def get_rel_root(filepath):
    rel_path = os.path.relpath(filepath, TEST_SUITES_DIR)
    parts = rel_path.split(os.sep)
    depth = len(parts) - 1
    return '../' * (depth + 1)

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    rel_root = get_rel_root(filepath)
    
    # 1. Fix Mock API
    content = re.sub(r"from '(\.\./|\./)*mocks/api-server\.mock'", f"from '{rel_root}mocks/api-server.mock'", content)
    content = re.sub(r"from '@digilist/api/mocks/api-server\.mock'", f"from '{rel_root}mocks/api-server.mock'", content)
    content = re.sub(r"from '@xala/api/mocks/api-server\.mock'", f"from '{rel_root}mocks/api-server.mock'", content)
    
    # Update setupMockApi call to pass 'test'
    content = content.replace('setupMockApi();', 'setupMockApi(test);')

    # 2. Fix LoginPage Helper
    content = re.sub(r"from '@xala/api/helpers/pages/LoginPage'", f"from '{rel_root}src/helpers/pages/LoginPage'", content)
    content = re.sub(r"from '@digilist/api/helpers/pages/LoginPage'", f"from '{rel_root}src/helpers/pages/LoginPage'", content)
    
    # 3. Fix Fixtures
    if 'TEST_CREDENTIALS' in content:
         content = re.sub(r"from '(\.\./|\./)*(src/)?fixtures/([^']+)'", f"from '{rel_root}src/fixtures/auth-credentials'", content)
    else:
         content = re.sub(r"from '(\.\./|\./)*(src/)?fixtures/([^']+)'", f"from '{rel_root}src/fixtures/index'", content)

    # 4. Fix specific syntax errors
    if 'backoffice.config.ts' in filepath:
        if 'interface BackofficeConfig {' in content and '}\n\nexport const config' not in content:
            content = content.replace('};\n\nexport const config', '};\n}\n\nexport const config')

    if 'redundancy-check.spec.ts' in filepath:
        if 'overall: \'pass\' | \'warn\' | \'fail\';\n\ntest.describe' in content:
             content = content.replace('overall: \'pass\' | \'warn\' | \'fail\';\n\ntest.describe', 'overall: \'pass\' | \'warn\' | \'fail\';\n}\n\ntest.describe')

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
    print(f"Fixed {fixed_count} files in E2E suites.")

if __name__ == '__main__':
    main()
