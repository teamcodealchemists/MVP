import { AuthController } from '../../src/interfaces/auth.controller';
import { InboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/indboundPortsAdapter';
import { AuthenticationDTO } from '../../src/interfaces/dto/authentication.dto';
import { GlobalSupervisorDTO } from '../../src/interfaces/dto/globalSupervisor.dto';
import { LocalSupervisorDTO } from '../../src/interfaces/dto/localSupervisor.dto';
import { SubDTO } from '../../src/interfaces/dto/sub.dto';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouseId.dto';
import { UserIdDTO } from '../../src/interfaces/dto/userId.dto';
import * as classValidator from 'class-validator';
import { Logger } from '@nestjs/common';

jest.spyOn(classValidator, 'validateOrReject').mockResolvedValue(undefined);

// Mock del logger per silenziare i log durante i test
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});

function getValidAuthenticationDTO(): AuthenticationDTO {
    return { email: 'm.rossi@email.com', password: 'Carota123!' } as AuthenticationDTO;
}

function getValidGlobalSupervisorDTO(): GlobalSupervisorDTO {
    return {
        name: 'Mario',
        surname: 'Rossi',
        phone: '+393331234567',
        authentication: {
            email: 'm.rossi@email.com',
            password: 'Carota123!'
        } as AuthenticationDTO
    } as GlobalSupervisorDTO;
}

// Funzione per generare un LocalSupervisorDTO valido
function getValidLocalSupervisorDTO(): LocalSupervisorDTO {
    return {
        name: 'Luigi',
        surname: 'Bianchi',
        phone: '+393331234568',
        authentication: {
            email: 'l.bianchi@email.com',
            password: 'Carota123!'
        } as AuthenticationDTO,
        warehouseAssigned: [
            { warehouseId: 1 } as WarehouseIdDTO
        ]
    } as LocalSupervisorDTO;
}

function getValidSubDTO(): SubDTO {
    return { sub: '123' } as SubDTO;
}

describe('AuthController', () => {
    let controller: AuthController;
    let inboundPortsAdapter: jest.Mocked<InboundPortsAdapter>;

    beforeEach(() => {
        inboundPortsAdapter = {
            login: jest.fn(),
            logout: jest.fn(),
            registerGlobalSupervisor: jest.fn(),
            registerLocalSupervisor: jest.fn(),
        } as any;
        controller = new AuthController(inboundPortsAdapter);
    });

    describe('login', () => {
        it('should call inboundPortsAdapter.login and return result', async () => {
            const dto = getValidAuthenticationDTO();
            inboundPortsAdapter.login.mockResolvedValue('token');
            const result = await controller.login(dto);
            expect(inboundPortsAdapter.login).toHaveBeenCalledWith(dto);
            expect(result).toBe('token');
        });

        it('should handle errors and return error response', async () => {
            inboundPortsAdapter.login.mockRejectedValue(new Error('fail'));
            const result = await controller.login(getValidAuthenticationDTO());
            expect(result).toContain('system.internalError');
            expect(result).toContain('fail');
        });
    });

    describe('logout', () => {
        it('should call logout with SubDTO if no token.sub', async () => {
            inboundPortsAdapter.logout.mockResolvedValue('ok');
            const result = await controller.logout({});
            expect(inboundPortsAdapter.logout).toHaveBeenCalledWith(expect.any(SubDTO));
            expect(result).toBe('ok');
        });

        it('should call logout with sub from token', async () => {
            inboundPortsAdapter.logout.mockResolvedValue('ok');
            const result = await controller.logout({ token: { sub: 'valid-sub' } });
            expect(inboundPortsAdapter.logout).toHaveBeenCalledWith(expect.objectContaining({ sub: 'valid-sub' }));
            expect(result).toBe('ok');
        });

        it('should handle errors and return error response', async () => {
            inboundPortsAdapter.logout.mockRejectedValue(new Error('logout error'));
            const result = await controller.logout({ token: { sub: 'valid-sub' } });
            expect(result).toContain('system.internalError');
            expect(result).toContain('logout error');
        });
    });

    describe('registerGlobalSupervisor', () => {
        it('should call registerGlobalSupervisor and return result', async () => {
            const dto = getValidGlobalSupervisorDTO();
            inboundPortsAdapter.registerGlobalSupervisor.mockResolvedValue('registered');
            const result = await controller.registerGlobalSupervisor(dto);
            expect(inboundPortsAdapter.registerGlobalSupervisor).toHaveBeenCalledWith(dto);
            expect(result).toBe('registered');
        });

        it('should handle errors and return error response', async () => {
            inboundPortsAdapter.registerGlobalSupervisor.mockRejectedValue(new Error('reg error'));
            const result = await controller.registerGlobalSupervisor(getValidGlobalSupervisorDTO());
            expect(result).toContain('system.internalError');
            expect(result).toContain('reg error');
        });
    });

    describe('registerLocalSupervisor', () => {
        it('should call registerLocalSupervisor and return result', async () => {
            const dto = getValidLocalSupervisorDTO();
            inboundPortsAdapter.registerLocalSupervisor.mockResolvedValue('registered');
            const result = await controller.registerLocalSupervisor(dto);
            expect(inboundPortsAdapter.registerLocalSupervisor).toHaveBeenCalledWith(dto);
            expect(result).toBe('registered');
        });

        it('should handle errors and return error response', async () => {
            inboundPortsAdapter.registerLocalSupervisor.mockRejectedValue(new Error('reg error'));
            const result = await controller.registerLocalSupervisor(getValidLocalSupervisorDTO());
            expect(result).toContain('system.internalError');
            expect(result).toContain('reg error');
        });
    });
});

describe('UserIdDTO', () => {
    it('should create a UserIdDTO with userId', () => {
        const dto = new UserIdDTO();
        dto.userId = 123;
        expect(dto.userId).toBe(123);
    });
});