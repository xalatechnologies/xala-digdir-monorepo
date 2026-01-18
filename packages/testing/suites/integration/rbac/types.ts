/**
 * RBAC Matrix Types
 * Shared types for RBAC matrix-based test generation
 */

export interface RBACMatrixRule {
  id: string;
  action: string;
  resource: string;
  scope: 'org' | 'tenant' | 'own' | 'all';
  expected: 'ALLOW' | 'DENY' | 'READONLY';
  endpoint: string;
  sdkMethod?: string;
  uiRoute?: string;
  featureFlag?: string;
  constraint?: string;
}

export interface RBACMatrix {
  role: string;
  displayName: string;
  description: string;
  level: number;
  inherits: string[];
  scope: string;
  capabilities: RBACMatrixRule[];
  boundaryTests: BoundaryTest[];
  forbiddenRoutes?: string[];
  auditRequirements?: string[];
}

export interface BoundaryTest {
  id: string;
  description: string;
  expected: string;
}

export interface TestResult {
  ruleId: string;
  passed: boolean;
  status: number;
  expected: string;
  actual: string;
  duration: number;
}

/**
 * Load RBAC matrix from JSON file
 */
export function loadRBACMatrix(path: string): RBACMatrix {
  return require(path) as RBACMatrix;
}

/**
 * Generate test cases from RBAC matrix
 */
export function generateTestCases(matrix: RBACMatrix): {
  allowTests: RBACMatrixRule[];
  denyTests: RBACMatrixRule[];
  boundaryTests: BoundaryTest[];
} {
  return {
    allowTests: matrix.capabilities.filter(c => c.expected === 'ALLOW'),
    denyTests: matrix.capabilities.filter(c => c.expected === 'DENY'),
    boundaryTests: matrix.boundaryTests,
  };
}

/**
 * Format endpoint with parameters
 */
export function formatEndpoint(
  endpoint: string,
  params: Record<string, string>
): { method: string; path: string } {
  const [method, path] = endpoint.split(' ');
  let formattedPath = path;
  
  for (const [key, value] of Object.entries(params)) {
    formattedPath = formattedPath.replace(`:${key}`, value);
  }
  
  return { method, path: formattedPath };
}
