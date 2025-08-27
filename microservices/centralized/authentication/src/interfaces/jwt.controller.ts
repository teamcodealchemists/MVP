import { InboundPortsAdapter } from 'src/infrastructure/portAdapters/indboundPortsAdapter';
import { Controller, Header } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { JwtDTO } from 'src/interfaces/dto/jwt.dto';
import { CidDTO } from 'src/interfaces/dto/cid.dto';

const logger = new Logger('JwtController');

@Controller()
export class JwtController {
    constructor(
        private readonly inboundPortsAdapter: InboundPortsAdapter
    ) {}

    @MessagePattern('auth.auth.jwtHeader')
    async getJwtFromHeader(@Payload('header') header: any, @Payload('cid') cid: any): Promise<string | null> {

        logger.log(`Received cid: ${JSON.stringify(cid)}`);

        // Supponendo che header.Authorization sia un array come nell'esempio
        const authHeader = Array.isArray(header.Authorization) ? header.Authorization[0] : header.Authorization;

        // Extract Bearer token from the Authorization header
        let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        

        logger.log(`Extracted JWT: ${token}`);

        token=''

        const jwtDto = new JwtDTO();
        jwtDto.jwt = token;

        const cidDTO = new CidDTO();
        cidDTO.cid = cid;

        return this.inboundPortsAdapter.authenticate(jwtDto, cidDTO);
    }
}