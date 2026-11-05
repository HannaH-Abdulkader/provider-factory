import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, roundMoney } from '../../src/core/transform/numbers';

test('parseNumber accepts numeric strings and numbers', () => {
  assert.equal(parseNumber('9', 'fee').ok, true);
  assert.equal(parseNumber(4, 'fee').ok, true);
});

test('parseNumber rejects junk', () => {
  assert.equal(parseNumber('12 AED', 'fee').ok, false);
  assert.equal(parseNumber(null, 'fee').ok, false);
});

test('roundMoney removes float artefacts', () => {
  assert.equal(roundMoney(50.80000076293945), 50.8);
});