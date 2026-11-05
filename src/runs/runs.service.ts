import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { loadConfig } from '../config/env';

export interface RunRecord {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  counters: { read: number; transformed: number; written: number; skipped: number; failed: number };
  startedAt: string;
}

@Injectable()
export class RunsService implements OnModuleDestroy {
  private readonly cfg = loadConfig();
  private readonly client = new MongoClient(this.cfg.MONGO_URL);
  private readonly runs: Promise<Collection<RunRecord>>;

  constructor() {
    this.runs = this.init();
  }

  private async init(): Promise<Collection<RunRecord>> {
    await this.client.connect();
    const col = this.client.db(this.cfg.TARGET_DB).collection<RunRecord>('runs');
    await col.createIndex({ id: 1 }, { unique: true });
    return col;
  }

  async start(_opts: { limit?: number }): Promise<RunRecord> {
    const col = await this.runs;
    const run: RunRecord = {
      id: randomUUID(),
      status: 'queued',
      counters: { read: 0, transformed: 0, written: 0, skipped: 0, failed: 0 },
      startedAt: new Date().toISOString(),
    };
    await col.insertOne(run);
    return run; 
  }

  async get(id: string): Promise<RunRecord> {
    const col = await this.runs;
    const run = await col.findOne({ id }, { projection: { _id: 0 } });
    if (!run) throw new NotFoundException(`run ${id} not found`);
    return run;
  }

  async errors(id: string, page: number, pageSize: number) {
    await this.get(id); 
    return { items: [], page, pageSize, total: 0 }; 
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }
}