import { AccessControlController } from '../../src/interfaces/accessControl.controller';
import { AuthService } from '../../src/application/authentication.service';
import { Logger } from '@nestjs/common';

// Mock logger per silenziare i log
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});

describe('AccessControlController', () => {
    let controller: AccessControlController;
    let authService: jest.Mocked<AuthService>;

    beforeEach(() => {
        authService = {
            isGlobalSet: jest.fn(),
        } as any;
        controller = new AccessControlController(authService);
    });

    describe('loginAccess', () => {
        it('should return login,logout if global is set', async () => {
            authService.isGlobalSet.mockResolvedValue(true);
            const result = await controller.loginAccess({});
            expect(result).toBe(JSON.stringify({ result: { get: false, call: "login,logout" } }));
        });

        it('should return accessDenied if global is not set', async () => {
            authService.isGlobalSet.mockResolvedValue(false);
            const result = await controller.loginAccess({});
            expect(result).toBe(JSON.stringify({ error: { code: 'system.accessDenied', message: 'You must Sign In a Global Supervisor' } }));
        });
    });

    describe('registerAccess', () => {
        it('should return globalSupervisor if global is not set', async () => {
            authService.isGlobalSet.mockResolvedValue(false);
            const result = await controller.registerAccess({ token: {} });
            expect(result).toBe(JSON.stringify({ result: { get: false, call: "globalSupervisor" } }));
        });

        it('should return localSupervisor,globalSupervisor if global is set and token.isGlobal', async () => {
            authService.isGlobalSet.mockResolvedValue(true);
            const result = await controller.registerAccess({ token: { isGlobal: true } });
            expect(result).toBe(JSON.stringify({ result: { get: false, call: "localSupervisor,globalSupervisor" } }));
        });

        it('should return get:false if global is set and token is not global', async () => {
            authService.isGlobalSet.mockResolvedValue(true);
            const result = await controller.registerAccess({ token: { isGlobal: false } });
            expect(result).toBe(JSON.stringify({ result: { get: false } }));
        });

        it('should return accessDenied if token.error is present', async () => {
            authService.isGlobalSet.mockResolvedValue(true);
            const result = await controller.registerAccess({ token: { error: 'Some error' } });
            expect(result).toBe(JSON.stringify({ error: { code: 'system.accessDenied', message: 'Some error' } }));
        });
    });
});