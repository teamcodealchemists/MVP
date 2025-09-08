import { Controller, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller()
export class AccessController{
    @MessagePattern('access.routing.>')
    access(@Payload() data: any): Promise<string> {
        if (data.token && !data.token.error && data.token.isGlobal) {
            return Promise.resolve(JSON.stringify({ result: { get: true, call: "*" } }));
        } else {
            const errorMsg = data.token?.error || 'Operation not allowed.';
            return Promise.resolve(JSON.stringify({ error: { code: 'system.accessDenied', message: errorMsg } }));
        }
    }
}
