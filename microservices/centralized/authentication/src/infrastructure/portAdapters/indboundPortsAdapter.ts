import { AuthService } from "src/application/authentication.service";

//Mapper
import { DataMapper } from "src/infrastructure/mappers/dataMapper";

//Ports Interfaces
import { AuthenticationEventListener } from "src/domain/inbound-ports/authenticationEvent.listener";

//DTOs
import { AuthenticationDTO } from "src/interfaces/dto/authentication.dto";
import { UserIdDTO } from "src/interfaces/dto/userId.dto";
import { JsonResponseDTO } from "src/interfaces/dto/jsonResponse.dto";


export class InboundPortsAdapter implements AuthenticationEventListener {
    constructor(private readonly authService: AuthService) {}

    async login(authenticationDTO: AuthenticationDTO) {
        return await this.authService.login(DataMapper.authenticationToDomain(authenticationDTO));
    }

    async ping(): Promise<boolean> {
        return await Promise.resolve(this.authService.ping());
    }
}