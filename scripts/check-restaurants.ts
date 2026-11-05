import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { loadConfig } from '../src/config/env';
import { extractTalabatMenu } from '../src/providers/talabat/adapter';
import { RestaurantRepository } from '../src/domain/restaurants/restaurant.repository';
import { Restaurant } from '../src/core/transform/menu-types';

async function main(): Promise<void> {
  const cfg = loadConfig();
  const client = new MongoClient(cfg.MONGO_URL);
  await client.connect();
  try {
    const raw = client.db(cfg.RAW_DB);
    const target = client.db(cfg.TARGET_DB);
    const repo = new RestaurantRepository(target);
    await repo.ensureIndexes();

    // Raw menus-il ninnu adapter vazhi restaurants edukkuka
    const rows: Restaurant[] = [];
    let rejected = 0;
    for await (const doc of raw.collection('raw_menus').find({})) {
      const r = extractTalabatMenu(doc, String(doc._id));
      if (r.ok) rows.push(r.value.restaurant);
      else rejected++;
    }
    console.log(`accepted restaurants: ${rows.length}, rejected docs: ${rejected}`);

    const keys = rows.map((r) => r.outletCode);
    const countOurs = () =>
      target.collection('restaurants').countDocuments({ outletCode: { $in: keys } });

    await repo.upsertMany(rows);
    const first = await countOurs();

    await repo.upsertMany(rows); // dusri baar
    const second = await countOurs();

    console.log(`count after run 1: ${first}, after run 2: ${second}`);
    console.log(second === first && first === rows.length ? 'IDEMPOTENT: yes' : 'IDEMPOTENT: NO');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});