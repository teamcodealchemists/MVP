import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

const logger = new Logger('AccessControlController');

@Controller()
export class AccessControlController {

    @MessagePattern('access.authTest') 
    async testAccess(@Payload() data: any): Promise<string> {
        logger.debug('AccessControlController - testAccess called with RESTOKEN:', data);

        if (data.token && data.token.isGlobal) {
            return JSON.stringify({ result: { get: false, call: "ping" }});
        }
        else {
            return JSON.stringify({ result: { get: false }});
        }
    }

    @MessagePattern('access.auth')
    async loginAccess(@Payload() data: any): Promise<string> {
        return JSON.stringify({ result: { get: false, call: "login" }});
    }

}
