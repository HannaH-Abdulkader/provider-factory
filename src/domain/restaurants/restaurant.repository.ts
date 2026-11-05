import { Collection, Db } from 'mongodb';
import { RestaurantPort, WriteResult } from '../../core/ports/repositories';
import { Restaurant } from '../../core/transform/menu-types';

export class RestaurantRepository implements RestaurantPort {
  private readonly collection: Collection<Restaurant>;

  constructor(db: Db) {
    this.collection = db.collection<Restaurant>('restaurants');
  }

  // Unique index: same outletCode can never be stored twice.
  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ outletCode: 1 }, { unique: true });
  }

  // Rerun-safe: existing outletCode is updated, new one is inserted.
  async upsertMany(rows: Restaurant[]): Promise<WriteResult> {
    if (rows.length === 0) return { written: 0 };

    const result = await this.collection.bulkWrite(
      rows.map((r) => ({
        updateOne: {
          filter: { outletCode: r.outletCode },
          update: { $set: r },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    return { written: result.upsertedCount + result.modifiedCount };
  }
}