import { Injectable } from '@nestjs/common';

@Injectable()
export class RoutingService {
  getHello(): string {
    return 'Hello World!';
  }
}
