import { Controller, Injectable, Inject, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';

//Inbound Ports
import { InboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/indboundPortsAdapter';

//DTOs
import { AuthenticationDTO } from './dto/authentication.dto';
import { GlobalSupervisorDTO } from './dto/globalSupervisor.dto';
import { UserId } from 'src/domain/userId.entity';

const logger = new Logger('AuthController');

@Controller()
export class AuthController {
    constructor(
        private readonly inboundPortsAdapter: InboundPortsAdapter
    ) { }

    @MessagePattern('call.auth.login')
    async login(@Payload('params') authenticationDTO: AuthenticationDTO): Promise<string> {
        try {
            logger.log('AuthController - login called with DTO:', authenticationDTO);
            return await this.inboundPortsAdapter.login(authenticationDTO);
        } catch (error) {
            logger.error('AuthController - login error:', error);
            // Return a serialized error response or rethrow as needed
            return Promise.resolve(JSON.stringify({ error: { code: 'system.error', message: error?.message || 'Unknown error' } }));
        }
    }

    @MessagePattern('call.authTest.ping')
    async ping(): Promise<string> {
        try {
            return await this.inboundPortsAdapter.ping();
        } catch (error) {
            logger.error('AuthController - ping error:', error);
            return JSON.stringify({ error: { code: 'system.error', message: error?.message || 'Unknown error' } });
        }
    }

    @MessagePattern('call.auth.register.globalSupervisor')
    async registerGlobalSupervisor(@Payload('params') globalSupervisorDTO: GlobalSupervisorDTO): Promise<string> {
        try {
            logger.log('RegisterGlobalSupervisor called with DTO:', globalSupervisorDTO);
            return await this.inboundPortsAdapter.registerGlobalSupervisor(globalSupervisorDTO);
        } catch (error) {
            logger.error('RegisterGlobalSupervisor error:', error);
            return Promise.resolve(JSON.stringify({ error: { code: 'system.error', message: error?.message || 'Unknown error' } }));
        }
    }

}