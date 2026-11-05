import { talabatMenuMapping as M } from './mapping';
import { fail, ok, StageResult } from '../../core/pipeline/types';
import { parseNumber, roundMoney } from '../../core/transform/numbers';
import { parseDeliveryTime } from '../../core/transform/delivery-time';

// Raw Talabat data is untyped JSON, so we read it as a loose record here.
// Everything that comes out of this file is typed and validated.
type Raw = Record<string, any>;

export interface Restaurant {
  outletCode: number;
  name: string;
  city: string;
  address: string | null;
  latitude: number;
  longitude: number;
  rating: number;
  deliveryFeeAed: number;
  deliveryMinMinutes: number;
  deliveryMaxMinutes: number;
  minimumOrderAed: number;
  sourceId: string;
}

export interface MenuItem {
  itemId: number;
  restaurantOutletCode: number;
  categoryId: number;
  categoryName: string;
  name: string;
  priceAed: number;
  imageUrl: string | null;
  sourceId: string;
}

export interface ExtractedMenu {
  restaurant: Restaurant;
  items: MenuItem[];
  rejectedItems: string[]; // bad items are reported, the restaurant still goes through
}

export function extractTalabatMenu(doc: Raw, sourceId: string): StageResult<ExtractedMenu> {
  const payload = doc.payload;

  if (payload?.Message === M.notRestaurantMessage) return fail('not a restaurant page');
  if (!Array.isArray(payload?.results) || payload.results.length !== 1) {
    return fail('expected exactly one restaurant in results');
  }

  const f: Raw = payload.results[0];

  const outletCode = f[M.restaurant.outletCode];
  if (!Number.isInteger(outletCode)) return fail(`outletCode invalid: ${outletCode}`);

  const lat = parseNumber(f[M.restaurant.latitude], 'latitude');
  if (!lat.ok) return fail(lat.reason);
  const lng = parseNumber(f[M.restaurant.longitude], 'longitude');
  if (!lng.ok) return fail(lng.reason);
  const rating = parseNumber(f[M.restaurant.rating], 'rate');
  if (!rating.ok) return fail(rating.reason);
  const fee = parseNumber(f[M.restaurant.deliveryFee], 'deliveryFee');
  if (!fee.ok) return fail(fee.reason);
  const minOrder = parseNumber(f[M.restaurant.minimumOrder], 'Minimum Order');
  if (!minOrder.ok) return fail(minOrder.reason);
  const time = parseDeliveryTime(f[M.restaurant.deliveryTime]);
  if (!time.ok) return fail(time.reason);

  const restaurant: Restaurant = {
    outletCode,
    name: String(f[M.restaurant.name] ?? ''),
    city: String(f[M.restaurant.city] ?? ''),
    address: f[M.restaurant.address] ? String(f[M.restaurant.address]) : null,
    latitude: lat.value,
    longitude: lng.value,
    rating: rating.value,
    deliveryFeeAed: roundMoney(fee.value),
    deliveryMinMinutes: time.value.minMinutes,
    deliveryMaxMinutes: time.value.maxMinutes,
    minimumOrderAed: roundMoney(minOrder.value),
    sourceId,
  };

  const items: MenuItem[] = [];
  const rejectedItems: string[] = [];

  for (const cat of (f[M.restaurant.categories] ?? []) as Raw[]) {
    for (const it of (cat[M.category.items] ?? []) as Raw[]) {
      const price = parseNumber(it[M.item.price], 'price');
      if (!price.ok) {
        rejectedItems.push(`item ${it[M.item.id]}: ${price.reason}`);
        continue;
      }
      if (price.value <= 0) {
        rejectedItems.push(`item ${it[M.item.id]}: price must be positive`);
        continue;
      }
      items.push({
        itemId: it[M.item.id],
        restaurantOutletCode: outletCode,
        categoryId: cat[M.category.id],
        categoryName: String(cat[M.category.name] ?? ''),
        name: String(it[M.item.name] ?? ''),
        priceAed: roundMoney(price.value),
        imageUrl: it[M.item.imageUrl] ? String(it[M.item.imageUrl]) : null,
        sourceId,
      });
    }
  }

  return ok({ restaurant, items, rejectedItems });
}