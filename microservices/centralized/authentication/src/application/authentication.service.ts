import { Authentication } from 'src/domain/authentication.entity';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/outboundPortsAdapter';
import { AuthRepository } from 'src/domain/mongodb/auth.repository';
import { User } from 'src/domain/user.entity';
import { Role } from 'src/domain/role.entity';
import { LocalSupervisor } from 'src/domain/localSupervisior.entity';
import { GlobalSupervisor } from 'src/domain/globalSupervisor.entity';
import { UserId } from 'src/domain/userId.entity';
import { TokenStatus } from 'src/domain/tokenStatus.entity';
import { Token } from 'src/domain/token.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly outboundPortsAdapter: OutboundPortsAdapter,
        @Inject('AUTHREPOSITORY') private readonly authRepository: AuthRepository
    ) { }
    private readonly logger = new Logger(AuthService.name);

    public async login(authentication: Authentication): Promise<string> {
        this.logger.log(`User ${authentication.getEmail()} logging in.`);

        // Set JWT for client session as a token and check for login
        try {
            const user = await this.authRepository.findByEmail(authentication.getEmail());

            if (!user) { //If it doesn't return anything the mail doesn't exist
                throw new Error('Email does not exist');
            }
            if (user.getAuthentication().getPassword() !== authentication.getPassword()) { //Check password
                throw new Error(`Password is not valid`);
            }
            // Both email and password are correct

            
            const id = await this.authRepository.getIdByEmail(user.getAuthentication().getEmail());
            const token = await this.authRepository.getToken(id as string);
            if (token) {
                if (token.getStatus() === TokenStatus.REVOKED) {
                    await this.authRepository.updateToken(new Token(id as string, TokenStatus.ACTIVE));
                }
                else {
                    throw new Error('You are already logged in');
                }                
            }
            else {
                await this.authRepository.storeToken(new Token(id as string, TokenStatus.ACTIVE));
            }

            const JWT = await this.generateJWT(user);
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
            this.logger.error(`Failed to login for user ${authentication.getEmail()}: ${error.message}`);
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.accessDenied",
                    message: error.message
                }
            }));
        }
    }

    public async logout(sub: string): Promise<string> {
        let token = await this.authRepository.getToken(sub);
        this.logger.log(`User with sub ${sub} logging out: `, token);
        if (token == null) {
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.internalError",
                    message: "Token has already been logged out"
                }
            }));
        }
        else if (token.getStatus() == TokenStatus.REVOKED) {
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.internalError",
                    message: "Token has already been Revoked"
                }
            }));
        }
        else {
            await this.authRepository.updateToken(new Token(sub, TokenStatus.REVOKED));
            this.logger.debug(`Token with sub ${sub} has been revoked.`);
            return Promise.resolve(JSON.stringify({ result: 'Logout successful' }));
        }
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
                if (decoded) {
                    const listToken = await this.authRepository.getToken(decoded.sub);
                    if (listToken !== null && listToken?.getStatus() === TokenStatus.ACTIVE) {

                        this.logger.debug(`JWT verified successfully: ${JSON.stringify(decoded)}`);

                        const token = { token: decoded };

                        // Call the emit function to notify RESGATE of the token
                        await this.outboundPortsAdapter.emitAccessToken(JSON.stringify(token), cid);

                        return Promise.resolve(JSON.stringify({
                            result: null
                        }));
                    }
                    else {
                        this.logger.warn('Token has been logged out');
                        await this.outboundPortsAdapter.emitAccessToken(JSON.stringify({ token: { error: "Token has been logged out" } }), cid);
                        return Promise.resolve(JSON.stringify({
                            error: {
                                code: "system.accessDenied",
                                message: "Token has been logged out"
                            }
                        }));
                    }
                }
                else {
                    this.logger.warn('JWT verification failed');
                    await this.authRepository.updateToken(new Token((this.jwtService.decode(jwt) as { sub: string }).sub, TokenStatus.REVOKED));
                    return Promise.resolve(JSON.stringify({
                        error: {
                            code: "system.invalidParams",
                            message: "JWT verification failed"
                        }
                    }));
                }
            }
        } catch (error) {
            this.logger.error(`JWT verification failed: ${error.message}, with ${(this.jwtService.decode(jwt) as { sub: string }).sub}`);
            await this.outboundPortsAdapter.emitAccessToken(JSON.stringify({ token: { error: error.message } }), cid);
            await this.authRepository.updateToken(new Token((this.jwtService.decode(jwt) as { sub: string }).sub, TokenStatus.REVOKED));
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            }));
        }
    }

    public async registerGlobalSupervisor(globalSupervisor: GlobalSupervisor): Promise<string> {
        try {
            if (!await this.isGlobalSet()) {
                const newGlobalId = await this.authRepository.newProfile(globalSupervisor);
                await this.authRepository.storeToken(new Token(newGlobalId, TokenStatus.REVOKED));
                return Promise.resolve(JSON.stringify({
                    result: "Global Supervisor registered successfully, with id: " + newGlobalId,
                }));
            }
            else {
                throw new Error('A Global Supervisor is already signed in');
            }
        } catch (error) {
            this.logger.error(`Failed to Register GlobalSupervisor`);
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.accessDenied",
                    message: error.message
                }
            }));
        }
    }

    public async registerLocalSupervisor(LocalSupervisor: LocalSupervisor): Promise<string> {
        try {
            const newLocalId = await this.authRepository.newProfile(LocalSupervisor);
            await this.authRepository.storeToken(new Token(newLocalId, TokenStatus.REVOKED));
            return Promise.resolve(JSON.stringify({
                result: "Local Supervisor registered successfully, with id: " + newLocalId,
            }));
        } catch (error) {
            this.logger.error(`Failed to Register LocalSupervisor`);
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.accessDenied",
                    message: error.message
                }
            }));
        }
    }

    public async isGlobalSet(): Promise<boolean> {
        const globalSupervisor = await this.authRepository.getGlobalSupervisor();
        return globalSupervisor !== null;
    }

    private async generateJWT(user: User): Promise<string> {
        let payload;

        this.logger.log(`Generating JWT for user: ${user.getRole()}`);

        if (user.getRole() == Role.GLOBAL) {
            payload = {
                sub: await this.authRepository.getIdByEmail(user.getAuthentication().getEmail()),
                isGlobal: true
            }
        }
        else {
            payload = {
                sub: await this.authRepository.getIdByEmail(user.getAuthentication().getEmail()),
                isGlobal: false,
                warehouseAssigned: (user as LocalSupervisor).getWarehouseAssigned()
            }
        }


        this.logger.log(`Using JWT secret: ${process.env.JWT_SECRET}`);
        return this.jwtService.sign(payload);
    }
}