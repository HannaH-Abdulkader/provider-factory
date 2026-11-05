import { fail, ok, StageResult } from '../pipeline/types';

// "9" → 9, 9 → 9, "abc" → fail
export function parseNumber(value: unknown, field: string): StageResult<number> {
  if (typeof value === 'number' && Number.isFinite(value)) return ok(value);
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return ok(Number(value));
  return fail(`${field} is not numeric: ${JSON.stringify(value)}`);
}

// 50.80000076293945 → 50.8
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}