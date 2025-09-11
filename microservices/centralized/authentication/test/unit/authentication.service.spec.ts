import { AuthService } from '../../src/application/authentication.service';
import { JwtService } from '@nestjs/jwt';
import { OutboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/outboundPortsAdapter';
import { AuthRepository } from '../../src/domain/mongodb/auth.repository';
import { Authentication } from '../../src/domain/authentication.entity';
import { User } from '../../src/domain/user.entity';
import { Token } from '../../src/domain/token.entity';
import { TokenStatus } from '../../src/domain/tokenStatus.entity';
import { Role } from '../../src/domain/role.entity';
import { GlobalSupervisor } from '../../src/domain/globalSupervisor.entity';
import { LocalSupervisor } from '../../src/domain/localSupervisior.entity';
import { Logger } from '@nestjs/common';

// Mock logger per silenziare i log durante i test
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: jest.Mocked<JwtService>;
    let outboundPortsAdapter: jest.Mocked<OutboundPortsAdapter>;
    let authRepository: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        jwtService = {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
        } as any;
        outboundPortsAdapter = {
            emitAccessToken: jest.fn(),
        } as any;
        authRepository = {
            findByEmail: jest.fn(),
            getIdByEmail: jest.fn(),
            getToken: jest.fn(),
            updateToken: jest.fn(),
            storeToken: jest.fn(),
            newProfile: jest.fn(),
            getGlobalSupervisor: jest.fn(),
        } as any;
        service = new AuthService(jwtService, outboundPortsAdapter, authRepository);
    });

    describe('login', () => {
        it('should login successfully', async () => {
            const authentication = {
                getEmail: () => 'test@email.com',
                getPassword: () => 'pass'
            } as Authentication;
            const user = {
                getAuthentication: () => ({
                    getEmail: () => 'test@email.com',
                    getPassword: () => 'pass'
                }),
                getRole: () => Role.GLOBAL
            } as User;
            authRepository.findByEmail.mockResolvedValue(user);
            authRepository.getIdByEmail.mockResolvedValue('id123');
            authRepository.getToken.mockResolvedValue(null);
            authRepository.storeToken.mockResolvedValue(undefined);
            jwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(authentication);
            expect(result).toContain('Login successful');
            expect(authRepository.findByEmail).toHaveBeenCalledWith('test@email.com');
            expect(authRepository.storeToken).toHaveBeenCalledWith(expect.any(Token));
        });

        it('should fail if email does not exist', async () => {
            const authentication = {
                getEmail: () => 'notfound@email.com',
                getPassword: () => 'pass'
            } as Authentication;
            authRepository.findByEmail.mockResolvedValue(null);

            const result = await service.login(authentication);
            expect(result).toContain('system.accessDenied');
            expect(result).toContain('Email does not exist');
        });

        it('should fail if password is invalid', async () => {
            const authentication = {
                getEmail: () => 'test@email.com',
                getPassword: () => 'wrongpass'
            } as Authentication;
            const user = {
                getAuthentication: () => ({
                    getEmail: () => 'test@email.com',
                    getPassword: () => 'pass'
                }),
                getRole: () => Role.GLOBAL
            } as User;
            authRepository.findByEmail.mockResolvedValue(user);

            const result = await service.login(authentication);
            expect(result).toContain('system.accessDenied');
            expect(result).toContain('Password is not valid');
        });

        it('should fail if already logged in', async () => {
            const authentication = {
                getEmail: () => 'test@email.com',
                getPassword: () => 'pass'
            } as Authentication;
            const user = {
                getAuthentication: () => ({
                    getEmail: () => 'test@email.com',
                    getPassword: () => 'pass'
                }),
                getRole: () => Role.GLOBAL
            } as User;
            authRepository.findByEmail.mockResolvedValue(user);
            authRepository.getIdByEmail.mockResolvedValue('id123');
            authRepository.getToken.mockResolvedValue({
                getStatus: () => TokenStatus.ACTIVE
            } as Token);

            const result = await service.login(authentication);
            expect(result).toContain('system.accessDenied');
            expect(result).toContain('already logged in');
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            authRepository.getToken.mockResolvedValue({
                getStatus: () => TokenStatus.ACTIVE
            } as Token);
            authRepository.updateToken.mockResolvedValue(undefined);

            const result = await service.logout('sub123');
            expect(result).toContain('Logout successful');
            expect(authRepository.updateToken).toHaveBeenCalledWith(expect.any(Token));
        });

        it('should fail if token is null', async () => {
            authRepository.getToken.mockResolvedValue(null);
            const result = await service.logout('sub123');
            expect(result).toContain("{\"error\":{\"code\":\"system.internalError\",\"message\":\"You are already logged out\"},\"meta\":{\"status\":401}}");
        });

        it('should fail if token is revoked', async () => {
            authRepository.getToken.mockResolvedValue({
                getStatus: () => TokenStatus.REVOKED
            } as Token);
            const result = await service.logout('sub123');
            expect(result).toContain('Token has already been Revoked');
        });
    });

    describe('authenticate', () => {
        it('should authenticate and emit token', async () => {
            jwtService.verify.mockReturnValue({ sub: 'sub123' });
            authRepository.getToken.mockResolvedValue({
                getStatus: () => TokenStatus.ACTIVE
            } as Token);

            const result = await service.authenticate('jwt-token', 'cid123');
            expect(result).toContain('"result":null');
            expect(outboundPortsAdapter.emitAccessToken).toHaveBeenCalled();
        });

        it('should return error if no JWT provided', async () => {
            const result = await service.authenticate('', 'cid123');
            expect(result).toContain('No JWT provided');
        });

        it('should return error if token is logged out', async () => {
            jwtService.verify.mockReturnValue({ sub: 'sub123' });
            authRepository.getToken.mockResolvedValue({
                getStatus: () => TokenStatus.REVOKED
            } as Token);

            const result = await service.authenticate('jwt-token', 'cid123');
            expect(result).toContain('Token has been logged out');
        });

        it('should return error if JWT verification fails', async () => {
            jwtService.verify.mockImplementation(() => { throw new Error('invalid jwt'); });
            jwtService.decode.mockReturnValue({ sub: 'sub123' });
            authRepository.updateToken.mockResolvedValue(undefined);
            outboundPortsAdapter.emitAccessToken.mockResolvedValue(undefined);

            const result = await service.authenticate('bad-token', 'cid123');
            expect(result).toContain('invalid jwt');
            expect(authRepository.updateToken).toHaveBeenCalled();
            expect(outboundPortsAdapter.emitAccessToken).toHaveBeenCalled();
        });
    });

    describe('registerGlobalSupervisor', () => {
        it('should register global supervisor if not set', async () => {
            authRepository.getGlobalSupervisor.mockResolvedValue(null);
            authRepository.newProfile.mockResolvedValue('global-id');
            authRepository.storeToken.mockResolvedValue(undefined);

            const globalSupervisor = {} as GlobalSupervisor;
            const result = await service.registerGlobalSupervisor(globalSupervisor);
            expect(result).toContain('Global Supervisor registered successfully');
            expect(authRepository.newProfile).toHaveBeenCalledWith(globalSupervisor);
        });

        it('should fail if global supervisor is already set', async () => {
            authRepository.getGlobalSupervisor.mockResolvedValue({} as GlobalSupervisor);

            const globalSupervisor = {} as GlobalSupervisor;
            const result = await service.registerGlobalSupervisor(globalSupervisor);
            expect(result).toContain('system.accessDenied');
            expect(result).toContain('already signed in');
        });
    });

    describe('registerLocalSupervisor', () => {
        it('should register local supervisor', async () => {
            authRepository.newProfile.mockResolvedValue('local-id');
            authRepository.storeToken.mockResolvedValue(undefined);

            const localSupervisor = {} as LocalSupervisor;
            const result = await service.registerLocalSupervisor(localSupervisor);
            expect(result).toContain('Local Supervisor registered successfully');
            expect(authRepository.newProfile).toHaveBeenCalledWith(localSupervisor);
        });

        it('should fail if error thrown', async () => {
            authRepository.newProfile.mockRejectedValue(new Error('fail'));
            const localSupervisor = {} as LocalSupervisor;
            const result = await service.registerLocalSupervisor(localSupervisor);
            expect(result).toContain('system.accessDenied');
            expect(result).toContain('fail');
        });
    });

    describe('isGlobalSet', () => {
        it('should return true if global supervisor exists', async () => {
            authRepository.getGlobalSupervisor.mockResolvedValue({} as GlobalSupervisor);
            const result = await service.isGlobalSet();
            expect(result).toBe(true);
        });

        it('should return false if global supervisor does not exist', async () => {
            authRepository.getGlobalSupervisor.mockResolvedValue(null);
            const result = await service.isGlobalSet();
            expect(result).toBe(false);
        });
    });
});