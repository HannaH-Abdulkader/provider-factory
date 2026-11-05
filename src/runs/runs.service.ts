import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface RunRecord {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  counters: { read: number; transformed: number; written: number; skipped: number; failed: number };
  startedAt: string;
}

@Injectable()
export class RunsService {
  private readonly runs = new Map<string, RunRecord>();

  start(_opts: { limit?: number }): RunRecord {
    const run: RunRecord = {
      id: randomUUID(),
      status: 'queued',
      counters: { read: 0, transformed: 0, written: 0, skipped: 0, failed: 0 },
      startedAt: new Date().toISOString(),
    };
    this.runs.set(run.id, run);
    return run; // TODO: enqueue dispatcher job on BullMQ
  }

  get(id: string): RunRecord {
    const run = this.runs.get(id);
    if (!run) throw new NotFoundException(`run ${id} not found`);
    return run;
  }

  errors(id: string, page: number, pageSize: number) {
    this.get(id); // 404 if unknown
    return { items: [], page, pageSize, total: 0 }; // TODO: read quarantine store
  }
}