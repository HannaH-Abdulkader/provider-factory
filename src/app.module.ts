import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [HealthModule, RunsModule],
})
export class AppModule {}