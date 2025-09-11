import { AuthRepositoryMongo } from '../../src/interfaces/mongodb/auth.repository.impl';
import { Authentication } from '../../src/domain/authentication.entity';
import { GlobalSupervisor } from '../../src/domain/globalSupervisor.entity';
import { LocalSupervisor } from '../../src/domain/localSupervisior.entity';
import { Role } from '../../src/domain/role.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { Token } from '../../src/domain/token.entity';
import { TokenStatus } from '../../src/domain/tokenStatus.entity';

describe('AuthRepositoryMongo', () => {
    let repo: AuthRepositoryMongo;
    let authenticationModel: any;
    let tokenListModel: any;

    beforeEach(() => {
        authenticationModel = {
            findOne: jest.fn(),
            find: jest.fn(),
        };
        tokenListModel = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
            save: jest.fn(),
        };
        repo = new AuthRepositoryMongo(authenticationModel, tokenListModel);
    });

    it('findByEmail returns GlobalSupervisor if isGlobal', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({
                name: 'Mario',
                surname: 'Rossi',
                phone: '+393331234567',
                email: 'global@email.com',
                password: 'pass',
                isGlobal: true
            })
        });
        const result = await repo.findByEmail('global@email.com');
        expect(result).toBeInstanceOf(GlobalSupervisor);
        expect(result && result.getName()).toBe('Mario');
    });

    it('findByEmail returns LocalSupervisor if not isGlobal', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({
                name: 'Luigi',
                surname: 'Bianchi',
                phone: '+393331234568',
                email: 'local@email.com',
                password: 'pass',
                isGlobal: false,
                warehouseAssigned: [1, 2]
            })
        });
        const result = await repo.findByEmail('local@email.com');
        expect(result).toBeInstanceOf(LocalSupervisor);
        expect(result && result.getName()).toBe('Luigi');
    });

    it('findByEmail returns null if not found', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });
        const result = await repo.findByEmail('notfound@email.com');
        expect(result).toBeNull();
    });

    it('getIdByEmail returns id if found', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ id: 'id123' })
        });
        const result = await repo.getIdByEmail('test@email.com');
        expect(result).toBe('id123');
    });

    it('getIdByEmail returns null if not found', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });
        const result = await repo.getIdByEmail('notfound@email.com');
        expect(result).toBeNull();
    });

    it('newProfile throws if email exists', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ email: 'exists@email.com' })
        });
        const user = new GlobalSupervisor('Mario', 'Rossi', '+393331234567', new Authentication('exists@email.com', 'pass'), Role.GLOBAL);
        await expect(repo.newProfile(user)).rejects.toThrow('Profile with this email already exists');
    });

    it('getGlobalSupervisor returns GlobalSupervisor if found', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({
                name: 'Mario',
                surname: 'Rossi',
                phone: '+393331234567',
                email: 'global@email.com',
                password: 'pass',
                isGlobal: true
            })
        });
        const result = await repo.getGlobalSupervisor();
        expect(result).toBeInstanceOf(GlobalSupervisor);
        expect(result && result.getName()).toBe('Mario');
    });

    it('getGlobalSupervisor returns null if not found', async () => {
        authenticationModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });
        const result = await repo.getGlobalSupervisor();
        expect(result).toBeNull();
    });

    it('getAllProfiles returns array of users', async () => {
        authenticationModel.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue([
                { name: 'Mario', surname: 'Rossi', phone: '+393331234567', email: 'global@email.com', password: 'pass', isGlobal: true },
                { name: 'Luigi', surname: 'Bianchi', phone: '+393331234568', email: 'local@email.com', password: 'pass', isGlobal: false, warehouseAssigned: [1] }
            ])
        });
        const result = await repo.getAllProfiles();
        expect(result.length).toBe(2);
        expect(result[0]).toBeInstanceOf(GlobalSupervisor);
        expect(result[1]).toBeInstanceOf(LocalSupervisor);
    });

    it('storeToken saves token', async () => {
        const saveMock = jest.fn();
        // Mock costruttore
        function TokenListModelMock(this: any, data: any) {
            Object.assign(this, data);
            this.save = saveMock;
        }
        repo = new AuthRepositoryMongo(authenticationModel, TokenListModelMock as any);
        const token = new Token('sub123', TokenStatus.ACTIVE);
        await repo.storeToken(token);
        expect(saveMock).toHaveBeenCalled();
    });

    it('getToken returns Token if found', async () => {
        tokenListModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ sub: 'sub123', status: true })
        });
        const result = await repo.getToken('sub123');
        expect(result).toBeInstanceOf(Token);
        expect(result && result.getSub()).toBe('sub123');
        expect(result && result.getStatus()).toBe(TokenStatus.ACTIVE);
    });

    it('getToken returns null if not found', async () => {
        tokenListModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });
        const result = await repo.getToken('sub123');
        expect(result).toBeNull();
    });

    it('updateToken updates token status', async () => {
        tokenListModel.updateOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(undefined)
        });
        const token = new Token('sub123', TokenStatus.REVOKED);
        await repo.updateToken(token);
        expect(tokenListModel.updateOne).toHaveBeenCalledWith({ sub: 'sub123' }, { status: TokenStatus.REVOKED });
    });
});