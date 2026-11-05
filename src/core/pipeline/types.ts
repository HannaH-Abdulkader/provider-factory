export type StageResult<T> = { ok: true; value: T } | { ok: false; reason: string };

export const ok = <T>(value: T): StageResult<T> => ({ ok: true, value });
export const fail = (reason: string): StageResult<never> => ({ ok: false, reason });

export type Stage<I, O> = (input: I) => StageResult<O>;

export interface Quarantined {
  sourceId: string;
  stage: string;
  reason: string;
}