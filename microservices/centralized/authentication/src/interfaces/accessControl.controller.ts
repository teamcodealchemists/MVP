import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import e from 'express';
import { AuthService } from 'src/application/authentication.service';

const logger = new Logger('AccessControlController');

@Controller()
export class AccessControlController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @MessagePattern('access.auth')
    async loginAccess(@Payload() data: any): Promise<string> {
        if (await this.authService.isGlobalSet()) {
            //if (data.token && !data.token.error) { 
            //    return JSON.stringify({ result: { get: false, call: "logout,login" } });
            //}
            //else {
            //    return JSON.stringify({ result: { get: false, call: "login" } });
            //}
            return JSON.stringify({ result: { get: false, call: "login,logout" } });
        }
        else {
            return JSON.stringify({ error: { code: 'system.accessDenied', message: 'You must Sign In a Global Supervisor' } });
        }
    }

    @MessagePattern('access.auth.register')
    async registerAccess(@Payload() data: any): Promise<string> {
        logger.debug('Register called with RESTOKEN:', data);

        if (!await this.authService.isGlobalSet()) {
            return JSON.stringify({ result: { get: false, call: "globalSupervisor" } });
        }
        else {
            if (data.token && !data.token.error) {
                if (data.token.isGlobal) {
                    return JSON.stringify({ result: { get: false, call: "localSupervisor,globalSupervisor" } });
                }
                else {
                    return JSON.stringify({ result: { get: false } });
                }
            }
            else {
                const errorMsg = data.token?.error || 'Operation not allowed.';
                return JSON.stringify({ error: { code: 'system.accessDenied', message: errorMsg } });
            }
        }
    }

}
