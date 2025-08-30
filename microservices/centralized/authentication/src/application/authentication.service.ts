import { Authentication } from 'src/domain/authentication.entity';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/outboundPortsAdapter';
import { AuthRepository } from 'src/domain/mongodb/auth.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly outboundPortsAdapter: OutboundPortsAdapter,
        @Inject('AUTHREPOSITORY') private readonly authRepository: AuthRepository
    ) {}
    private readonly logger = new Logger(AuthService.name);

    public async login(authentication: Authentication) : Promise<string> {
        this.logger.log(`User ${authentication.getEmail()} logging in with ${authentication.getPassword()}.`);

        //TODO: Implement login logic here

        // Set JWT for client session as a token
        try {
            const auth = await this.authRepository.findByEmail(authentication.getEmail());
            if (!auth) { //If it doesn't return anything the mail doesn't exist
                throw new Error('Email does not exist');
            }
            if (auth.getPassword() !== authentication.getPassword()) { //Check password
                throw new Error('Password is not valid');
            }
            // Both email and password are correct

            const JWT = this.generateJWT(authentication);
            this.logger.log(`Generated JWT token for user ${authentication.getEmail()}: ${JWT}`);

            return Promise.resolve(JSON.stringify({
                result: 'Login successful',
                meta: {
                    header: {
                        "Set-token": [`${JWT}`]
                    }
                }
            }));
        } catch (error) {
            this.logger.error(`Failed to generate JWT token for user ${authentication.getEmail()}: ${error.message}`);
            return Promise.resolve(JSON.stringify({
            error: {
                code: "system.accessDenied",
                message: error.message
            }
            }));
        }
    }

    public async logout(): Promise<string> {
        //TODO: Implement logout logic here
        return Promise.resolve('User logged out successfully');
    }

    public async ping(): Promise<string> {
        return Promise.resolve(JSON.stringify({ result: 'pong' }));
    }

    public async authenticate(jwt: string, cid: string): Promise<string> {
        try {
            if (!jwt) {
                this.logger.warn('No JWT provided');
                return Promise.resolve(JSON.stringify({
                    error: {
                        code: "system.accessDenied",
                        message: "No JWT provided"
                    }
                }));
            }
            else {
                const decoded = this.jwtService.verify(jwt);
                if(decoded) {

                    //TODO: Fare altri controlli

                    this.logger.debug(`JWT verified successfully: ${JSON.stringify(decoded)}`);

                    const token = {token : decoded};

                    // Call the emit function to notify RESGATE of the token
                    await this.outboundPortsAdapter.emitAccessToken(JSON.stringify(token), cid);

                    return Promise.resolve(JSON.stringify({
                        result: null
                    }));

                }
                else {
                    this.logger.warn('JWT verification failed');
                    return Promise.resolve(JSON.stringify({
                        error: {
                            code: "system.invalidParams",
                            message: "JWT verification failed"
                        }
                    }));
                }
            }
        } catch (error) {
            this.logger.error(`JWT verification failed: ${error.message}`);
            await this.outboundPortsAdapter.emitAccessToken(JSON.stringify({ token: { error: error.message } }), cid);
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            }));
        }
    }

    private generateJWT(authentication: Authentication): string {
        const payload = { sub: authentication.getEmail(), isGlobal: true };

        //TODO: Costruire il payload da MongoDB

        this.logger.log(`Generating JWT for subject: ${payload.sub}`);
        this.logger.log(`Using JWT secret: ${process.env.JWT_SECRET}`);
        return this.jwtService.sign(payload);
    }
}