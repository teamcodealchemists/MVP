import { Authentication } from 'src/domain/authentication.entity';
import { Injectable, Logger } from '@nestjs/common';
import { JsonResponseDTO } from 'src/interfaces/dto/jsonResponse.dto';
import { JwtService } from '@nestjs/jwt';




@Injectable()
export class AuthService {
    constructor(){}
    private readonly logger = new Logger(AuthService.name);

    public async login(authentication: Authentication) {
        this.logger.log(`User ${authentication.getEmail()} logging in with ${authentication.getPassword()}.`);

        //TODO: Implement login logic here

        // Set JWT for client session as a token
        try {
            const JWT = this.generateJWT(authentication);
            this.logger.log(`Generated JWT token for user ${authentication.getEmail()}: ${JWT}`);

            const response = new JsonResponseDTO();
            response.response = {
            result: {
                token: JWT
            }
            };
            return Promise.resolve(response);

        } catch (error) {
            this.logger.error(`Failed to generate JWT token for user ${authentication.getEmail()}: ${error.message}`);
            const response = new JsonResponseDTO();
            response.response = {
            error: {
                code: "system.accessDenied",
                message: error.message
            }
            };
            return Promise.resolve(response);
        }
    }

    public async ping(): Promise<boolean> {
        return Promise.resolve(true);
    }

    private generateJWT(authentication: Authentication) {
        //TODO: Implement JWT generation logic here
        return 'generated-jwt-token';
    }
}