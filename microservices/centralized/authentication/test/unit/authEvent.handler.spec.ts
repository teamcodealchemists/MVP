import { AuthEventHandler } from '../../src/interfaces/authEvent.handler';

describe('AuthEventHandler', () => {
    let handler: AuthEventHandler;
    let natsClient: any;

    beforeEach(() => {
        natsClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            emit: jest.fn().mockResolvedValue(undefined),
        };
        handler = new AuthEventHandler(natsClient);
    });

    it('onModuleInit chiama natsClient.connect', async () => {
        await handler.onModuleInit();
        expect(natsClient.connect).toHaveBeenCalled();
    });

    it('emitAccessToken chiama natsClient.emit con topic e token', async () => {
        await handler.emitAccessToken('token123', 'cid456');
        expect(natsClient.emit).toHaveBeenCalledWith('conn.cid456.token', 'token123');
    });
});