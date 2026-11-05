import 'dotenv/config';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient } from 'mongodb';
import { RestaurantRepository } from '../../src/domain/restaurants/restaurant.repository';
import { MenuItemRepository } from '../../src/domain/menu-items/menu-item.repository';
import type { Restaurant, MenuItem } from '../../src/core/transform/menu-types';

const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
const TEST_DB = 'provider_test';

let client: MongoClient;

before(async () => {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  await client.db(TEST_DB).dropDatabase();
});

after(async () => {
  await client.db(TEST_DB).dropDatabase();
  await client.close();
});

const restaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  outletCode: 1001,
  name: 'Test Kitchen',
  city: 'Dubai',
  address: 'Test Street',
  latitude: 25.1,
  longitude: 55.2,
  rating: 4.5,
  deliveryFeeAed: 5,
  deliveryMinMinutes: 25,
  deliveryMaxMinutes: 40,
  minimumOrderAed: 30,
  sourceId: 'raw-1',
  ...overrides,
});

const item = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  itemId: 5001,
  restaurantOutletCode: 1001,
  categoryId: 1,
  categoryName: 'Mains',
  name: 'Burger',
  priceAed: 25,
  imageUrl: 'https://example.com/b.jpg',
  sourceId: 'raw-1',
  ...overrides,
});

test('restaurants: running the same upsert twice gives the same final state', async () => {
  const repo = new RestaurantRepository(client.db(TEST_DB));
  await repo.ensureIndexes();

  const rows = [restaurant(), restaurant({ outletCode: 1002, name: 'Second' })];

  await repo.upsertMany(rows);
  const secondRun = await repo.upsertMany(rows);

  const count = await client.db(TEST_DB).collection('restaurants').countDocuments();
  assert.equal(count, 2);
  assert.equal(secondRun.written, 0);
});

test('restaurants: a changed field updates the existing row, no duplicate', async () => {
  const repo = new RestaurantRepository(client.db(TEST_DB));

  await repo.upsertMany([restaurant({ name: 'Renamed' })]);

  const count = await client.db(TEST_DB).collection('restaurants').countDocuments({ outletCode: 1001 });
  const doc = await client.db(TEST_DB).collection('restaurants').findOne({ outletCode: 1001 });
  assert.equal(count, 1);
  assert.equal(doc?.name, 'Renamed');
});

test('menu items: duplicate item_id across runs is stored once', async () => {
  const repo = new MenuItemRepository(client.db(TEST_DB));
  await repo.ensureIndexes();

  await repo.upsertMany([item(), item({ itemId: 5002, name: 'Fries' })]);
  await repo.upsertMany([item(), item({ itemId: 5002, name: 'Fries' })]);

  const count = await client.db(TEST_DB).collection('menu_items').countDocuments();
  assert.equal(count, 2);
});