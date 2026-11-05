export type StageResult<T> = { ok: true; value: T } | { ok: false; reason: string };

export const ok = <T>(value: T): StageResult<T> => ({ ok: true, value });
export const fail = (reason: string): StageResult<never> => ({ ok: false, reason });