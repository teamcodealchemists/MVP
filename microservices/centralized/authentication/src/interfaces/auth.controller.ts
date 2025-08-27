import { Controller, Injectable, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

//Inbound Ports
import { InboundPortsAdapter } from 'src/infrastructure/portAdapters/indboundPortsAdapter';

//DTOs
import { AuthenticationDTO } from './dto/authentication.dto';


@Controller()
export class AuthController {
    constructor(
        private readonly inboundPortsAdapter: InboundPortsAdapter
    ) { }

    @MessagePattern('call.auth.login')
    async login(@Payload('params') authenticationDTO: AuthenticationDTO): Promise<string> {
        console.log('AuthController - login called with DTO:', authenticationDTO);
        return await this.inboundPortsAdapter.login(authenticationDTO);
        //return Promise.resolve(JSON.stringify({ result: 'Login successful' }));
    }

    @MessagePattern('call.authTest.ping')
    async ping(): Promise<boolean> {
        return await this.inboundPortsAdapter.ping();
    }
}