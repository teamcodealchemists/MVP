import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';

// Inbound Ports
import { InboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/indboundPortsAdapter';

// DTOs
import { AuthenticationDTO } from './dto/authentication.dto';
import { GlobalSupervisorDTO } from './dto/globalSupervisor.dto';
import { SubDTO } from './dto/sub.dto';
import { CidDTO } from './dto/cid.dto';
import { LocalSupervisorDTO } from './dto/localSupervisor.dto';

const logger = new Logger('AuthController');

@Controller()
export class AuthController {
    constructor(
        private readonly inboundPortsAdapter: InboundPortsAdapter
    ) { }

    @MessagePattern('call.auth.login')
    async login(@Payload('params') authenticationDTO: AuthenticationDTO): Promise<string> {
        try {
            logger.log('Login called with DTO:', authenticationDTO);
            return await this.inboundPortsAdapter.login(authenticationDTO);
        } catch (error) {
            logger.error('Login error:', error);
            // Return a serialized error response or rethrow as needed
            return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
        }
    }

    @MessagePattern('call.auth.logout')
    async logout(@Payload('') data: any): Promise<string> {
        try {
            if (!data.token || !data.token.sub) {
                return await this.inboundPortsAdapter.logout(new SubDTO());
            }

            const subDTO = new SubDTO();
            subDTO.sub = data.token.sub;

            await validateOrReject(subDTO);

            logger.debug('Logout called with data:', subDTO);
            return await this.inboundPortsAdapter.logout(subDTO);
        } catch (error) {
            logger.error('Logout error:', error);
            return JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } });
        }
    }

    @MessagePattern('call.auth.register.globalSupervisor')
    async registerGlobalSupervisor(@Payload('params') globalSupervisorDTO: GlobalSupervisorDTO): Promise<string> {
        try {
            logger.log('RegisterGlobalSupervisor called with DTO:', globalSupervisorDTO);
            return await this.inboundPortsAdapter.registerGlobalSupervisor(globalSupervisorDTO);
        } catch (error) {
            logger.error('RegisterGlobalSupervisor error:', error);
            return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
        }
    }

    @MessagePattern('call.auth.register.localSupervisor')
    async registerLocalSupervisor(@Payload('params') localSupervisorDTO: LocalSupervisorDTO): Promise<string> {
        try {
            logger.log('RegisterLocalSupervisor called with DTO:', localSupervisorDTO);
            return await this.inboundPortsAdapter.registerLocalSupervisor(localSupervisorDTO);
        } catch (error) {
            logger.error('RegisterLocalSupervisor error:', error);
            return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
        }
    }   

}