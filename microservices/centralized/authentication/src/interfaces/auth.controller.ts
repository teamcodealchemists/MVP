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
import { WarehouseIdDTO } from './dto/warehouseId.dto';

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
    async registerGlobalSupervisor(@Payload('params') data: any): Promise<string> {
        try {
            // Manually instantiate DTO and nested DTOs
            const globalSupervisorDTO = new GlobalSupervisorDTO();
            globalSupervisorDTO.name = data.name;
            globalSupervisorDTO.surname = data.surname;
            globalSupervisorDTO.phone = data.phone;
            globalSupervisorDTO.authentication = new AuthenticationDTO();
            globalSupervisorDTO.authentication.email = data.authentication?.email;
            globalSupervisorDTO.authentication.password = data.authentication?.password;
            
            logger.log('RegisterGlobalSupervisor called with DTO:', globalSupervisorDTO);
            await validateOrReject(globalSupervisorDTO);
            return await this.inboundPortsAdapter.registerGlobalSupervisor(globalSupervisorDTO);
        } catch (error) {
            logger.error('RegisterGlobalSupervisor error:', error);
            return this.errorHandler(error);
        }
    }

    @MessagePattern('call.auth.register.localSupervisor')
    async registerLocalSupervisor(@Payload('params') data: any): Promise<string> {
        try {

            const localSupervisorDTO = new LocalSupervisorDTO();
            localSupervisorDTO.name = data.name;
            localSupervisorDTO.surname = data.surname;
            localSupervisorDTO.phone = data.phone;
            localSupervisorDTO.authentication = new AuthenticationDTO();
            localSupervisorDTO.authentication.email = data.authentication?.email;
            localSupervisorDTO.authentication.password = data.authentication?.password;
            localSupervisorDTO.warehouseAssigned = [];
            if (Array.isArray(data.warehouseAssigned)) {
                for (const warehouse of data.warehouseAssigned) {
                    const warehouseDTO = new WarehouseIdDTO();
                    warehouseDTO.warehouseId = warehouse.warehouseId;
                    localSupervisorDTO.warehouseAssigned.push(warehouseDTO);
                }
            }

            logger.log('RegisterLocalSupervisor called with DTO:', localSupervisorDTO);
            await validateOrReject(localSupervisorDTO);
            return await this.inboundPortsAdapter.registerLocalSupervisor(localSupervisorDTO);
        } catch (error) {
            logger.error('RegisterLocalSupervisor error:', error);
            return this.errorHandler(error);
        }
    }   

    private extractConstraints(errors: any[]): string[] {
        const messages: string[] = [];
        for (const error of errors) {
            if (error.constraints) {
                messages.push(...(Object.values(error.constraints).filter(Boolean) as string[]));
            }
            if (error.children && error.children.length > 0) {
                messages.push(...this.extractConstraints(error.children));
            }
        }
        return messages;
    }

    private async errorHandler(error: any): Promise<string> {
        let messages: string[];
        if (Array.isArray(error)) {
            // Estrai ricorsivamente tutti i messaggi di constraint
            messages = this.extractConstraints(error).filter(Boolean);
            return Promise.resolve(JSON.stringify({ error: { code: 'system.invalidParams', message: messages.join(', ') } }));
        } else {
            return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' }, meta: {status: 404} }));
        }
    }

}