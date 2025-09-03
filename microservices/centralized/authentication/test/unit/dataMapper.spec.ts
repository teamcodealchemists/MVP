import { DataMapper } from '../../src/infrastructure/mappers/dataMapper';
import { GlobalSupervisorDTO } from '../../src/interfaces/dto/globalSupervisor.dto';
import { LocalSupervisorDTO } from '../../src/interfaces/dto/localSupervisor.dto';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouseId.dto';
import { AuthenticationDTO } from '../../src/interfaces/dto/authentication.dto';
import { UserIdDTO } from '../../src/interfaces/dto/userId.dto';
import { GlobalSupervisor } from '../../src/domain/globalSupervisor.entity';
import { LocalSupervisor } from '../../src/domain/localSupervisior.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { Authentication } from '../../src/domain/authentication.entity';
import { UserId } from '../../src/domain/userId.entity';
import { Role } from '../../src/domain/role.entity';

describe('DataMapper', () => {
    it('globalSupervisorToDomain maps DTO to domain entity', () => {
        const dto: GlobalSupervisorDTO = {
            name: 'Mario',
            surname: 'Rossi',
            phone: '+393331234567',
            authentication: {
                email: 'm.rossi@email.com',
                password: 'Carota123!'
            }
        } as GlobalSupervisorDTO;
        const domain = DataMapper.globalSupervisorToDomain(dto);
        expect(domain).toBeInstanceOf(GlobalSupervisor);
        expect(domain.getName()).toBe(dto.name);
        expect(domain.getSurname()).toBe(dto.surname);
        expect(domain.getPhone()).toBe(dto.phone);
        expect(domain.getAuthentication().getEmail()).toBe(dto.authentication.email);
        expect(domain.getAuthentication().getPassword()).toBe(dto.authentication.password);
        expect(domain.getRole()).toBe(Role.GLOBAL);
    });

    it('localSupervisorToDomain maps DTO to domain entity', () => {
        const dto: LocalSupervisorDTO = {
            name: 'Luigi',
            surname: 'Bianchi',
            phone: '+393331234568',
            authentication: {
                email: 'l.bianchi@email.com',
                password: 'Carota123!'
            },
            warehouseAssigned: [
                { warehouseId: 1 },
                { warehouseId: 2 }
            ]
        } as LocalSupervisorDTO;
        const domain = DataMapper.localSupervisorToDomain(dto);
        expect(domain).toBeInstanceOf(LocalSupervisor);
        expect(domain.getName()).toBe(dto.name);
        expect(domain.getSurname()).toBe(dto.surname);
        expect(domain.getPhone()).toBe(dto.phone);
        expect(domain.getAuthentication().getEmail()).toBe(dto.authentication.email);
        expect(domain.getWarehouseAssigned().length).toBe(2);
        expect(domain.getWarehouseAssigned()[0]).toBeInstanceOf(WarehouseId);
        expect(domain.getWarehouseAssigned()[0].getId()).toBe(1);
        expect(domain.getRole()).toBe(Role.LOCAL);
    });

    it('warehouseToDomain maps DTO to domain entity', () => {
        const dto: WarehouseIdDTO = { warehouseId: 3 };
        const domain = DataMapper.warehouseToDomain(dto);
        expect(domain).toBeInstanceOf(WarehouseId);
        expect(domain.getId()).toBe(3);
    });

    it('authenticationToDomain maps DTO to domain entity', () => {
        const dto: AuthenticationDTO = { email: 'user@email.com', password: 'pass' };
        const domain = DataMapper.authenticationToDomain(dto);
        expect(domain).toBeInstanceOf(Authentication);
        expect(domain.getEmail()).toBe('user@email.com');
        expect(domain.getPassword()).toBe('pass');
    });

    it('globalSupervisorToDTO maps domain entity to DTO', () => {
        const auth = new Authentication('m.rossi@email.com', 'Carota123!');
        const domain = new GlobalSupervisor('Mario', 'Rossi', '+393331234567', auth, Role.GLOBAL);
        const dto = DataMapper.globalSupervisorToDTO(domain);
        expect(dto.name).toBe('Mario');
        expect(dto.surname).toBe('Rossi');
        expect(dto.phone).toBe('+393331234567');
        expect(dto.authentication.email).toBe('m.rossi@email.com');
        expect(dto.authentication.password).toBe('Carota123!');
    });

    it('localSupervisorToDTO maps domain entity to DTO', () => {
        const auth = new Authentication('l.bianchi@email.com', 'Carota123!');
        const warehouses = [new WarehouseId(1), new WarehouseId(2)];
        const domain = new LocalSupervisor('Luigi', 'Bianchi', '+393331234568', auth, Role.LOCAL, warehouses);
        const dto = DataMapper.localSupervisorToDTO(domain);
        expect(dto.name).toBe('Luigi');
        expect(dto.surname).toBe('Bianchi');
        expect(dto.phone).toBe('+393331234568');
        expect(dto.authentication.email).toBe('l.bianchi@email.com');
        expect(dto.warehouseAssigned.length).toBe(2);
        expect(dto.warehouseAssigned[0].warehouseId).toBe(1);
    });

    it('warehouseIdToDTO maps domain entity to DTO', () => {
        const domain = new WarehouseId(3);
        const dto = DataMapper.warehouseIdToDTO(domain);
        expect(dto.warehouseId).toBe(3);
    });

    it('authenticationToDTO maps domain entity to DTO', () => {
        const domain = new Authentication('user@email.com', 'pass');
        const dto = DataMapper.authenticationToDTO(domain);
        expect(dto.email).toBe('user@email.com');
        expect(dto.password).toBe('pass');
    });

    it('userIdToDTO maps domain entity to DTO', () => {
        const domain = new UserId(3);
        const dto = DataMapper.userIdToDTO(domain);
        expect(dto.userId).toBe(3);
    });
});