import { OutboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/outboundPortsAdapter';
import { AuthEventHandler } from '../../src/interfaces/authEvent.handler';

describe('OutboundPortsAdapter', () => {
    let adapter: OutboundPortsAdapter;
    let authEventHandler: jest.Mocked<AuthEventHandler>;

    beforeEach(() => {
        authEventHandler = {
            emitAccessToken: jest.fn(),
        } as any;
        adapter = new OutboundPortsAdapter(authEventHandler);
    });

    it('emitAccessToken chiama authEventHandler.emitAccessToken con token e cid', async () => {
        await adapter.emitAccessToken('token123', 'cid456');
        expect(authEventHandler.emitAccessToken).toHaveBeenCalledWith('token123', 'cid456');
    });
});