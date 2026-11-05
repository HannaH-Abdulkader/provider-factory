
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EJSON } from 'bson';
import { MongoClient } from 'mongodb';

const FILES: Record<string, string> = {
  raw_locations: 'compero-xbyte.xbyte-raw-locations.json',
  raw_restaurants: 'compero-xbyte.xbyte-raw-restaurants.json',
  raw_menus: 'compero-xbyte.xbyte-raw-menus.json',
};

async function main(): Promise<void> {
  const seedDir = process.env.SEED_DIR;
  if (!seedDir) throw new Error('SEED_DIR is required');
  const url = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
  const dbName = process.env.RAW_DB ?? 'provider_raw';

  const client = new MongoClient(url);
  await client.connect();
  try {
    const db = client.db(dbName);
    for (const [collection, file] of Object.entries(FILES)) {
      const docs = EJSON.parse(readFileSync(join(seedDir, file), 'utf8'), { relaxed: false }) as unknown[];
      await db.collection(collection).deleteMany({}); // re-seeding replaces, so the seed is repeatable
      if (docs.length) await db.collection(collection).insertMany(docs as never[]);
      console.log(`${collection}: ${docs.length} docs`);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});