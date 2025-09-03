import { Controller, Get } from '@nestjs/common';
import { StateAggregateService } from '../application/stateAggregate.service';

@Controller()
export class StateAggregateController {
  constructor(private readonly stateAggregateService: StateAggregateService) {}

  @Get()
  getHello(): string {
    return this.stateAggregateService.getHello();
  }
}
