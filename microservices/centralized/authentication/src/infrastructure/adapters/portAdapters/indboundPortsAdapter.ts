import { SubDTO } from './../../../interfaces/dto/sub.dto';
import { Injectable } from "@nestjs/common";
import { AuthService } from "src/application/authentication.service";

//Mapper
import { DataMapper } from "src/infrastructure/mappers/dataMapper";

//Ports Interfaces
import { AuthenticationEventListener } from "src/domain/inbound-ports/authenticationEvent.listener";
import { RegisterGlobalSupervisorEventListener } from "src/domain/inbound-ports/registerGlobalSupervisorEvent.listener";
import { RegisterLocalSupervisorEventListener } from 'src/domain/inbound-ports/registerLocalSupervisorEvent.listener';

//DTOs
import { JwtHeaderAuthenticationListener } from "src/domain/inbound-ports/jwtHeaderAuthentication.listener";
import { JwtDTO } from "src/interfaces/dto/jwt.dto";
import { CidDTO } from "src/interfaces/dto/cid.dto";
import { AuthenticationDTO } from "src/interfaces/dto/authentication.dto";
import { GlobalSupervisorDTO } from "src/interfaces/dto/globalSupervisor.dto";
import { UserId } from "src/domain/userId.entity";
import { LocalSupervisorDTO } from 'src/interfaces/dto/localSupervisor.dto';


@Injectable()
export class InboundPortsAdapter implements 
AuthenticationEventListener,
JwtHeaderAuthenticationListener,
RegisterGlobalSupervisorEventListener,
RegisterLocalSupervisorEventListener {
    constructor(private readonly authService: AuthService) {}

    async login(authenticationDTO: AuthenticationDTO) : Promise<string> {
        return await this.authService.login(DataMapper.authenticationToDomain(authenticationDTO));
    }

    async logout(subDTO: SubDTO): Promise<string> {
        return await this.authService.logout(subDTO.sub);
    }

    async authenticate(jwtDTO: JwtDTO, cidDTO: CidDTO): Promise<string> {
        return await this.authService.authenticate(jwtDTO.jwt, cidDTO.cid);
    }

    async registerGlobalSupervisor(globalSupervisorDTO: GlobalSupervisorDTO): Promise<string> {
        return await this.authService.registerGlobalSupervisor(DataMapper.globalSupervisorToDomain(globalSupervisorDTO));
    }

    async registerLocalSupervisor(localSupervisorDTO: LocalSupervisorDTO): Promise<string> {
        return await this.authService.registerLocalSupervisor(DataMapper.localSupervisorToDomain(localSupervisorDTO));
    }

    async ping(): Promise<string> {
        return await Promise.resolve(this.authService.ping());
    }
}