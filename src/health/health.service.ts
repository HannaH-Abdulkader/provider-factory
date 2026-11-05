import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import { loadConfig } from '../config/env';

type Status = 'up' | string;

@Injectable()
export class HealthService {
  private readonly cfg = loadConfig();
  private readonly mongo = new MongoClient(this.cfg.MONGO_URL);
  private readonly redis = new Redis({
    host: this.cfg.REDIS_HOST,
    port: this.cfg.REDIS_PORT,
    maxRetriesPerRequest: 1,
  });

  async check(): Promise<{ status: 'ok' | 'degraded'; mongo: Status; redis: Status }> {
    const [mongo, redis] = await Promise.all([this.pingMongo(), this.pingRedis()]);
    const status = mongo === 'up' && redis === 'up' ? 'ok' : 'degraded';
    return { status, mongo, redis };
  }

  private async pingMongo(): Promise<Status> {
    try {
      await this.mongo.connect(); // safe to call repeatedly
      await this.mongo.db('admin').command({ ping: 1 });
      return 'up';
    } catch (err) {
      return `down: ${(err as Error).message}`;
    }
  }

  private async pingRedis(): Promise<Status> {
    try {
      const reply = await this.redis.ping();
      return reply === 'PONG' ? 'up' : `down: ${reply}`;
    } catch (err) {
      return `down: ${(err as Error).message}`;
    }
  }
}