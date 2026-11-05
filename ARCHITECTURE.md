# Architecture

## What it does

1. Reads 3 raw Talabat collections from MongoDB (`provider_raw`).
2. Cleans and maps them into a target model (`provider_domain`).
3. Saves restaurants and menu items there.

## Data

| Collection | Key | Status |
|---|---|---|
| `restaurants` | `outletCode` | Done |
| `menu_items` | `itemId` | Done |
| `runs` | `id` | Done |
| `areas`, `restaurant_areas` | - | Planned, not saved yet |

- `outletCode` is the restaurant id from the URL. The provider's `id` is kept as `providerRestaurantId`.
- A restaurant can be in many areas, so area links are kept separately.

## Pipeline

1. **Validate**: check the raw data has the right fields.
2. **Normalise**: convert numbers, prices, delivery times.
3. **Map**: turn raw fields into our fields.
4. **Dedupe**: remove repeated items. Written and unit-tested, not yet connected to a full run.
5. **Save**: write to MongoDB.

A bad row gets a reason and is rejected. It does not stop the other rows.

## Folders

- `src/core/`: general code, no Talabat or Mongo.
- `src/providers/talabat/`: Talabat field names and adapter. A new provider would go here.
- `src/domain/`: MongoDB saving.
- `src/health/`, `src/runs/`: API.

## Saving twice

Every save uses the key (`outletCode`, `itemId`) with upsert. Running twice gives the same result. Checked on real data: 345 restaurants, both times.

## Not done

- BullMQ (queue, workers, retry, dead-letter).
- Saving rejected rows.
- Resuming a stopped run.
- Areas saved to the database.
- Full pipeline test.