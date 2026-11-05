import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractTalabatMenu } from '../../src/providers/talabat/adapter';

function validDoc(): any {
  return {
    payload: {
      results: [
        {
          id: 687548,
          name: 'Bombay Box',
          City: 'Dubai',
          'Restaurant Address': 'Oud Metha',
          latitude: '25.23',
          longitude: '55.31',
          rate: 4.4,
          deliveryFee: '9',
          DeliveryTime: '25-40 mins',
          'Minimum Order': 0,
          outletCode: 757815,
          category: [
            {
              category_id: 1,
              category_name: 'Picks',
              items: [
                { item_id: 10, item_name: 'Tom Yum', description: 'spicy', price: 50.80000076293945, image: null },
                { item_id: 11, item_name: 'Rice', description: '', price: 0, image: null },
              ],
            },
          ],
        },
      ],
    },
  };
}

test('valid doc gives a restaurant and items, with bad item reported', () => {
  const r = extractTalabatMenu(validDoc(), 'src-1');
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.restaurant.outletCode, 757815);
  assert.equal(r.value.restaurant.deliveryMinMinutes, 25);
  assert.equal(r.value.items.length, 1);
  assert.equal(r.value.items[0].priceAed, 50.8);
  assert.equal(r.value.rejectedItems.length, 1);
});

test('"not restaurant page" doc is rejected with a reason', () => {
  const r = extractTalabatMenu({ payload: { Message: 'This is not restaurant page (Talabat).' } }, 'src-2');
  assert.deepEqual(r, { ok: false, reason: 'not a restaurant page' });
});

test('bad delivery time rejects the whole restaurant', () => {
  const doc = validDoc();
  doc.payload.results[0].DeliveryTime = 'soon';
  assert.equal(extractTalabatMenu(doc, 'src-3').ok, false);
});