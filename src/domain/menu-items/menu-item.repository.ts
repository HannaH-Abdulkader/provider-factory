import { Collection, Db } from 'mongodb';
import { MenuItemPort, WriteResult } from '../../core/ports/repositories';
import { MenuItem } from '../../core/transform/menu-types';

export class MenuItemRepository implements MenuItemPort {
  private readonly collection: Collection<MenuItem>;

  constructor(db: Db) {
    this.collection = db.collection<MenuItem>('menu_items');
  }

  // itemId unique: same item never stored twice.
  // restaurantOutletCode index: "ee restaurant-inte ella items" kittaan fast.
  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ itemId: 1 }, { unique: true });
    await this.collection.createIndex({ restaurantOutletCode: 1 });
  }

  // Rerun-safe: existing itemId is updated, new one inserted.
  async upsertMany(rows: MenuItem[]): Promise<WriteResult> {
    if (rows.length === 0) return { written: 0 };

    const result = await this.collection.bulkWrite(
      rows.map((r) => ({
        updateOne: {
          filter: { itemId: r.itemId },
          update: { $set: r },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    return { written: result.upsertedCount + result.modifiedCount };
  }
}