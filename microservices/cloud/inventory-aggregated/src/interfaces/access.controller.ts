import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

const logger = new Logger('AccessControlController');

@Controller()
export class AccessController {
    constructor() { }

    @MessagePattern('access.aggregatedWarehouses.>')
    async loginAccess(@Payload() data: any): Promise<string> {
        return JSON.stringify({ result: { get: true, call: "*" } });
    }


}