import { Logger } from '@nestjs/common';
import { Authentication } from '../../src/domain/authentication.entity';
import { GlobalSupervisor } from '../../src/domain/globalSupervisor.entity';
import { LocalSupervisor } from '../../src/domain/localSupervisior.entity';
import { Role } from '../../src/domain/role.entity';
import { Token } from '../../src/domain/token.entity';
import { TokenStatus } from '../../src/domain/tokenStatus.entity';
import { User } from '../../src/domain/user.entity';
import { UserId } from '../../src/domain/userId.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';

// Sopprime tutti i log di NestJS durante i test
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

describe('Domain Entities', () => {
    it('Authentication entity should store email and password', () => {
        const auth = new Authentication('test@email.com', 'pass123');
        expect(auth.getEmail()).toBe('test@email.com');
        expect(auth.getPassword()).toBe('pass123');
    });

    it('GlobalSupervisor entity should store name, surname, phone, authentication', () => {
        const auth = new Authentication('global@email.com', 'pass');
        const gs = new GlobalSupervisor('Mario', 'Rossi', '+393331234567', auth, Role.GLOBAL);
        expect(gs.getName()).toBe('Mario');
        expect(gs.getSurname()).toBe('Rossi');
        expect(gs.getPhone()).toBe('+393331234567');
        expect(gs.getAuthentication()).toBe(auth);
    });

    it('LocalSupervisor entity should store name, surname, phone, authentication, warehouses', () => {
        const auth = new Authentication('local@email.com', 'pass');
        const warehouses = [new WarehouseId(1), new WarehouseId(2)];
        const userId = new UserId(1);
        const ls = new LocalSupervisor('Luigi', 'Bianchi', '+393331234568', auth, Role.LOCAL, warehouses);
        expect(ls.getName()).toBe('Luigi');
        expect(ls.getSurname()).toBe('Bianchi');
        expect(ls.getPhone()).toBe('+393331234568');
        expect(ls.getAuthentication()).toBe(auth);
        expect(ls.getWarehouseAssigned()).toEqual(warehouses);
    });

    it('Role entity should have static values', () => {
        expect(Role.GLOBAL).toBeDefined();
        expect(Role.LOCAL).toBeDefined();
    });

    it('Token entity should store sub, status', () => {
        const token = new Token('sub123', TokenStatus.ACTIVE);
        expect(token.getSub()).toBe('sub123');
        expect(token.getStatus()).toBe(TokenStatus.ACTIVE);
    });

    it('TokenStatus entity should have static values', () => {
        expect(TokenStatus.ACTIVE).toBeDefined();
        expect(TokenStatus.REVOKED).toBeDefined();
    });

    it('UserId entity should store id', () => {
        const userId = new UserId(123);
        expect(userId.getId()).toBe(123);
    });

    it('WarehouseId entity should store warehouseId', () => {
        const warehouseId = new WarehouseId(1);
        expect(warehouseId.getId()).toBe(1);
    });
});