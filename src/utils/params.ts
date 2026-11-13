export function param(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0];
  return val || '';
}

export function queryStr(val: unknown): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return String(val[0]);
  return '';
}
