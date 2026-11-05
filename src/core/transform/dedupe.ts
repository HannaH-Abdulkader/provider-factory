export interface DedupeResult<T> {
  kept: T[];
  duplicates: number;
  conflicts: Array<{ key: string; kept: T; dropped: T }>;
}

// Same key → first one kept. Different content with same key → recorded as conflict.
export function dedupeByKey<T>(items: T[], keyOf: (item: T) => string): DedupeResult<T> {
  const seen = new Map<string, T>();
  const conflicts: DedupeResult<T>['conflicts'] = [];
  let duplicates = 0;

  for (const item of items) {
    const key = keyOf(item);
    const existing = seen.get(key);
    if (existing === undefined) {
      seen.set(key, item);
      continue;
    }
    duplicates++;
    if (JSON.stringify(existing) !== JSON.stringify(item)) {
      conflicts.push({ key, kept: existing, dropped: item });
    }
  }

  return { kept: [...seen.values()], duplicates, conflicts };
}