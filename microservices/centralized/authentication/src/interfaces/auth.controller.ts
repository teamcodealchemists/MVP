import { Controller, Injectable, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

//Inbound Ports
import { InboundPortsAdapter } from 'src/infrastructure/portAdapters/indboundPortsAdapter';

//DTOs
import { AuthenticationDTO } from './dto/authentication.dto';
import { JsonResponseDTO } from './dto/jsonResponse.dto';

    
@Controller()
@Injectable()
export class AuthController {
    constructor(
        private readonly inboundPortsAdapter: InboundPortsAdapter
    ) {}

    @MessagePattern('call.auth.login')
    async login(@Payload() authenticationDto: AuthenticationDTO) {
        return (await this.inboundPortsAdapter.login(authenticationDto)).response;
    }

    @MessagePattern('call.auth.ping')
    async ping(): Promise<boolean> {
        return await this.inboundPortsAdapter.ping();
    }
}