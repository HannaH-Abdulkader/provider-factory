import { MenuItem, Restaurant } from '../transform/menu-types';
import { Quarantined } from '../pipeline/types';

export interface WriteResult {
  written: number;
}

// Upsert by outletCode: rerunning writes the same final state, no duplicates.
export interface RestaurantPort {
  upsertMany(rows: Restaurant[]): Promise<WriteResult>;
}

// Upsert by itemId.
export interface MenuItemPort {
  upsertMany(rows: MenuItem[]): Promise<WriteResult>;
}

// Bad documents are saved with a reason, never dropped.
export interface QuarantinePort {
  addMany(runId: string, rows: Quarantined[]): Promise<void>;
}