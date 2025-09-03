import { JwtController } from '../../src/interfaces/jwt.controller';
import { InboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/indboundPortsAdapter';
import { JwtDTO } from '../../src/interfaces/dto/jwt.dto';
import { CidDTO } from '../../src/interfaces/dto/cid.dto';
import * as classValidator from 'class-validator';
import { Logger } from '@nestjs/common';

// Mock validateOrReject per evitare errori di validazione
jest.spyOn(classValidator, 'validateOrReject').mockResolvedValue(undefined);

// Mock logger per silenziare i log
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

function getValidJwtDTO(): JwtDTO {
    return { jwt: 'valid.jwt.token' } as JwtDTO;
}

function getValidCidDTO(): CidDTO {
    return { cid: 'valid-cid' } as CidDTO;
}

describe('JwtController', () => {
    let controller: JwtController;
    let inboundPortsAdapter: jest.Mocked<InboundPortsAdapter>;

    beforeEach(() => {
        inboundPortsAdapter = {
            authenticate: jest.fn(),
        } as any;
        controller = new JwtController(inboundPortsAdapter);
    });

    describe('getJwtFromHeader', () => {
        it('should extract JWT and call authenticate', async () => {
            inboundPortsAdapter.authenticate.mockResolvedValue('auth-ok');
            const header = { Authorization: 'Bearer valid.jwt.token' };
            const cid = 'valid-cid';
            const result = await controller.getJwtFromHeader(header, cid);
            expect(inboundPortsAdapter.authenticate).toHaveBeenCalledWith(
                expect.objectContaining({ jwt: 'valid.jwt.token' }),
                expect.objectContaining({ cid: 'valid-cid' })
            );
            expect(result).toBe('auth-ok');
        });

        it('should handle array Authorization header', async () => {
            inboundPortsAdapter.authenticate.mockResolvedValue('auth-ok');
            const header = { Authorization: ['Bearer valid.jwt.token'] };
            const cid = 'valid-cid';
            const result = await controller.getJwtFromHeader(header, cid);
            expect(inboundPortsAdapter.authenticate).toHaveBeenCalledWith(
                expect.objectContaining({ jwt: 'valid.jwt.token' }),
                expect.objectContaining({ cid: 'valid-cid' })
            );
            expect(result).toBe('auth-ok');
        });

        it('should return error if authenticate throws', async () => {
            inboundPortsAdapter.authenticate.mockRejectedValue(new Error('fail'));
            const header = { Authorization: 'Bearer valid.jwt.token' };
            const cid = 'valid-cid';
            const result = await controller.getJwtFromHeader(header, cid);
            expect(result).toContain('system.accessDenied');
            expect(result).toContain('fail');
        });

        it('should return error if no Bearer token', async () => {
            const header = { Authorization: 'invalid' };
            const cid = 'valid-cid';
            inboundPortsAdapter.authenticate.mockResolvedValue('should-not-be-called');
            const result = await controller.getJwtFromHeader(header, cid);
            expect(result).toContain('system.accessDenied');
        });
    });
});