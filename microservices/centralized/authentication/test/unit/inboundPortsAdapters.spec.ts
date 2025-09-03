import { InboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/indboundPortsAdapter';
import { AuthService } from '../../src/application/authentication.service';
import { AuthenticationDTO } from '../../src/interfaces/dto/authentication.dto';
import { GlobalSupervisorDTO } from '../../src/interfaces/dto/globalSupervisor.dto';
import { LocalSupervisorDTO } from '../../src/interfaces/dto/localSupervisor.dto';
import { JwtDTO } from '../../src/interfaces/dto/jwt.dto';
import { CidDTO } from '../../src/interfaces/dto/cid.dto';
import { SubDTO } from '../../src/interfaces/dto/sub.dto';

// Mock DataMapper
jest.mock('../../src/infrastructure/mappers/dataMapper', () => ({
    DataMapper: {
        authenticationToDomain: jest.fn((dto) => dto),
        globalSupervisorToDomain: jest.fn((dto) => dto),
        localSupervisorToDomain: jest.fn((dto) => dto),
    }
}));

describe('InboundPortsAdapter', () => {
    let adapter: InboundPortsAdapter;
    let authService: jest.Mocked<AuthService>;

    beforeEach(() => {
        authService = {
            login: jest.fn(),
            logout: jest.fn(),
            authenticate: jest.fn(),
            registerGlobalSupervisor: jest.fn(),
            registerLocalSupervisor: jest.fn(),
            ping: jest.fn(),
        } as any;
        adapter = new InboundPortsAdapter(authService);
    });

    it('login chiama authService.login con il DTO mappato', async () => {
        authService.login.mockResolvedValue('token');
        const dto: AuthenticationDTO = { email: 'test@email.com', password: 'pass' } as AuthenticationDTO;
        const result = await adapter.login(dto);
        expect(authService.login).toHaveBeenCalledWith(dto);
        expect(result).toBe('token');
    });

    it('logout chiama authService.logout con sub', async () => {
        authService.logout.mockResolvedValue('ok');
        const dto: SubDTO = { sub: '123' } as SubDTO;
        const result = await adapter.logout(dto);
        expect(authService.logout).toHaveBeenCalledWith('123');
        expect(result).toBe('ok');
    });

    it('authenticate chiama authService.authenticate con jwt e cid', async () => {
        authService.authenticate.mockResolvedValue('auth');
        const jwtDTO: JwtDTO = { jwt: 'jwt' } as JwtDTO;
        const cidDTO: CidDTO = { cid: 'cid' } as CidDTO;
        const result = await adapter.authenticate(jwtDTO, cidDTO);
        expect(authService.authenticate).toHaveBeenCalledWith('jwt', 'cid');
        expect(result).toBe('auth');
    });

    it('registerGlobalSupervisor chiama authService.registerGlobalSupervisor con DTO mappato', async () => {
        authService.registerGlobalSupervisor.mockResolvedValue('registered');
        const dto: GlobalSupervisorDTO = {
            name: 'Mario',
            surname: 'Rossi',
            phone: '+393331234567',
            authentication: { email: 'm.rossi@email.com', password: 'Carota123!' }
        } as GlobalSupervisorDTO;
        const result = await adapter.registerGlobalSupervisor(dto);
        expect(authService.registerGlobalSupervisor).toHaveBeenCalledWith(dto);
        expect(result).toBe('registered');
    });

    it('registerLocalSupervisor chiama authService.registerLocalSupervisor con DTO mappato', async () => {
        authService.registerLocalSupervisor.mockResolvedValue('registered');
        const dto: LocalSupervisorDTO = {
            name: 'Luigi',
            surname: 'Bianchi',
            phone: '+393331234568',
            authentication: { email: 'l.bianchi@email.com', password: 'Carota123!' },
            warehouseAssigned: [{ warehouseId: 1 }]
        } as LocalSupervisorDTO;
        const result = await adapter.registerLocalSupervisor(dto);
        expect(authService.registerLocalSupervisor).toHaveBeenCalledWith(dto);
        expect(result).toBe('registered');
    });
});