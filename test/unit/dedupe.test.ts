import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dedupeByKey } from '../../src/core/transform/dedupe';

test('same key is kept once and counted as duplicate', () => {
  const items = [
    { id: 1, price: 10 },
    { id: 2, price: 5 },
    { id: 1, price: 10 },
  ];
  const r = dedupeByKey(items, (i) => String(i.id));
  assert.equal(r.kept.length, 2);
  assert.equal(r.duplicates, 1);
  assert.equal(r.conflicts.length, 0);
});

test('same key with different content is reported as conflict', () => {
  const items = [
    { id: 1, price: 10 },
    { id: 1, price: 12 },
  ];
  const r = dedupeByKey(items, (i) => String(i.id));
  assert.equal(r.kept.length, 1);
  assert.equal(r.kept[0].price, 10);
  assert.equal(r.conflicts.length, 1);
});

test('empty input gives empty output', () => {
  const r = dedupeByKey([], (i: { id: number }) => String(i.id));
  assert.equal(r.kept.length, 0);
  assert.equal(r.duplicates, 0);
});