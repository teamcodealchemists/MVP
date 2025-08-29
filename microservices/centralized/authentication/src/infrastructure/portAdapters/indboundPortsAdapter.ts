import { Injectable } from "@nestjs/common";
import { AuthService } from "src/application/authentication.service";

//Mapper
import { DataMapper } from "src/infrastructure/mappers/dataMapper";

//Ports Interfaces
import { AuthenticationEventListener } from "src/domain/inbound-ports/authenticationEvent.listener";
import { AuthenticationDTO } from "src/interfaces/dto/authentication.dto";

//DTOs
import { JwtHeaderAuthenticationListener } from "src/domain/inbound-ports/jwtHeaderAuthentication.listener";
import { JwtDTO } from "src/interfaces/dto/jwt.dto";
import { CidDTO } from "src/interfaces/dto/cid.dto";


@Injectable()
export class InboundPortsAdapter implements 
AuthenticationEventListener,
JwtHeaderAuthenticationListener {
    constructor(private readonly authService: AuthService) {}

    async login(authenticationDTO: AuthenticationDTO) : Promise<string> {
        return await this.authService.login(DataMapper.authenticationToDomain(authenticationDTO));
    }

    async logout(): Promise<string> {
        return await this.authService.logout();
    }

    async authenticate(jwtDTO: JwtDTO, cidDTO: CidDTO): Promise<string> {
        return await this.authService.authenticate(jwtDTO.jwt, cidDTO.cid);
    }

    async ping(): Promise<string> {
        return await Promise.resolve(this.authService.ping());
    }
}