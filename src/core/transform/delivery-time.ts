
import { fail, ok, StageResult } from '../pipeline/types';

export interface DeliveryWindow {
  minMinutes: number;
  maxMinutes: number;
}

// "25-40 mins" → {25, 40}, "30 mins" → {30, 30}
export function parseDeliveryTime(raw: unknown): StageResult<DeliveryWindow> {
  if (typeof raw !== 'string') return fail('DeliveryTime is not a string');
  const m = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*mins?\s*$/i.exec(raw);
  if (!m) return fail(`DeliveryTime unrecognised: "${raw}"`);

  const min = Number(m[1]);
  const max = m[2] !== undefined ? Number(m[2]) : min;
  if (max < min) return fail(`DeliveryTime reversed: "${raw}"`);

  return ok({ minMinutes: min, maxMinutes: max });
}