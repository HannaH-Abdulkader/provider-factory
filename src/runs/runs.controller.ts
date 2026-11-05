import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { RunsService } from './runs.service';

@Controller('runs')
export class RunsController {
  constructor(@Inject(RunsService) private readonly runs: RunsService) {}

  @Post()
  start(@Body() body: { limit?: number }) {
    return this.runs.start(body ?? {});
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.runs.get(id);
  }

  @Get(':id/errors')
  errors(@Param('id') id: string, @Query('page') page = '1', @Query('pageSize') pageSize = '50') {
    return this.runs.errors(id, Number(page), Number(pageSize));
  }
}