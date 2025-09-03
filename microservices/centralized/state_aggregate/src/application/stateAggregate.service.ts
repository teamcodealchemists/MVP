import { Injectable } from '@nestjs/common';

@Injectable()
export class StateAggregateService {
  getHello(): string {
    return 'Hello World!';
  }
}
