import { Authentication } from 'src/domain/authentication.entity';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OutboundPortsAdapter } from 'src/infrastructure/portAdapters/outboundPortsAdapter';

const Cookie_Age = 1*3600;

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly outboundPortsAdapter: OutboundPortsAdapter
    ) {}
    private readonly logger = new Logger(AuthService.name);

    public async login(authentication: Authentication) : Promise<string> {
        this.logger.log(`User ${authentication.getEmail()} logging in with ${authentication.getPassword()}.`);

        //TODO: Implement login logic here

        // Set JWT for client session as a token
        try {
            const JWT = this.generateJWT(authentication);
            this.logger.log(`Generated JWT token for user ${authentication.getEmail()}: ${JWT}`);

            // Set JWT as a cookie (example for NestJS with response object)
            // Here, just returning the token as before, since setting cookies should be handled in the controller layer.
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

    public authenticate(jwt: string, cid: string): string {
        try {
            if (!jwt) {
                this.logger.warn('No JWT provided');
                return JSON.stringify({
                    error: {
                        code: "system.accessDenied",
                        message: "No JWT provided"
                    }
                });
            }
            else {
                const decoded = this.jwtService.verify(jwt);
                if(decoded) {

                    //TODO: Fare altri controlli

                    this.logger.debug(`JWT verified successfully: ${JSON.stringify(decoded)}`);

                    const token = {token : decoded};

                    // Call the emit function to notify RESGATE of the token
                    this.outboundPortsAdapter.emitAccessToken(JSON.stringify(token), cid);

                    return JSON.stringify({
                        result: null
                    });
                    
                }
                else {
                    this.logger.warn('JWT verification failed');
                    return JSON.stringify({
                        error: {
                            code: "system.invalidParams",
                            message: "JWT verification failed"
                        }
                    });
                }
            }
        } catch (error) {
            this.logger.error(`JWT verification failed: ${error.message}`);
            return JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            });
        }
    }

    private generateJWT(authentication: Authentication): string {
        const payload = { sub: authentication.getEmail(), isGlobal: true };
        this.logger.log(`Generating JWT for subject: ${payload.sub}`);
        this.logger.log(`Using JWT secret: ${process.env.JWT_SECRET}`);
        return this.jwtService.sign(payload);
    }
}