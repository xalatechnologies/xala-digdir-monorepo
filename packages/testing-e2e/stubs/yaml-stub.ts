/**
 * Stub for yaml package
 */

export function parse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

export function stringify(obj: any): string {
  return JSON.stringify(obj, null, 2);
}

export default {
  parse,
  stringify,
};
