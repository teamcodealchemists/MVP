import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AccessControlController {

    @MessagePattern('access.auth') 
    async loginAccess() {
        return JSON.stringify({ result: { get: false, call: "login" }});
    }

}
