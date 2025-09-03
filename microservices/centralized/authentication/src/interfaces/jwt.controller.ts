import { InboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/indboundPortsAdapter';
import { Controller, Header } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { JwtDTO } from 'src/interfaces/dto/jwt.dto';
import { CidDTO } from 'src/interfaces/dto/cid.dto';
import { validate, validateOrReject } from 'class-validator';

const logger = new Logger('JwtController');

@Controller()
export class JwtController {
    constructor(
        private readonly inboundPortsAdapter: InboundPortsAdapter
    ) { }

    @MessagePattern('auth.auth.jwtHeader')
    async getJwtFromHeader(@Payload('header') header: any, @Payload('cid') cid: any): Promise<string | null> {

        logger.log(`Received cid: ${JSON.stringify(cid)}`);

        const authHeader = Array.isArray(header.Authorization) ? header.Authorization[0] : header.Authorization;
        let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        logger.log(`Extracted JWT: ${token}`);

        if (!token) {
            logger.error('No Bearer token found');
            return JSON.stringify({
                error: {
                    code: "system.accessDenied",
                    message: "No Bearer token found"
                }
            });
        }

        const jwtDto = new JwtDTO();
        jwtDto.jwt = token;

        const cidDTO = new CidDTO();
        cidDTO.cid = cid;

        try {
            await validateOrReject(jwtDto);
            await validateOrReject(cidDTO);

            return await this.inboundPortsAdapter.authenticate(jwtDto, cidDTO);
        } catch (error) {
            logger.error('Validation or authentication failed:', error);
            return JSON.stringify({
                error: {
                    code: "system.accessDenied",
                    message: error?.message || "ERRORE"
                }
            });
        }
    }
}