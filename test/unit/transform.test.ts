import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDeliveryTime } from '../../src/core/transform/delivery-time';

test('delivery time ranges', () => {
  assert.equal(parseDeliveryTime('25-40 mins').ok, true);
  assert.equal(parseDeliveryTime('40-25 mins').ok, false);
  assert.equal(parseDeliveryTime('about an hour').ok, false);
});