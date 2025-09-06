import { OutboundPortsAdapter } from '../src/infrastructure/adapters/portAdapters/outboundPortAdapters';
import { StatePortPublisher } from './../src/domain/outbound-ports/statePort.publisher';
import { WarehouseState } from '../src/domain/warehouse-state.entity';

describe('OutboundPortsAdapter', () => {
  let adapter: OutboundPortsAdapter;
  let mockPublisher: { publishState: jest.Mock };

  beforeEach(() => {
    // Creo un mock di StatePortPublisher
    mockPublisher = {
      publishState: jest.fn().mockResolvedValue(undefined), // simula sempre successo
    };

    // Inietto il mock nell'adapter
    adapter = new OutboundPortsAdapter(mockPublisher as any);
  });

  it('should call publishState on the publisher', async () => {
    const state = new WarehouseState('ACTIVE');

    await adapter.publishState(state);

    // Verifica che il publisher sia stato chiamato con lo stato corretto
    expect(mockPublisher.publishState).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publishState).toHaveBeenCalledWith(state);
  });

  it('should log an error if publishState throws', async () => {
    // Faccio fallire il mock
    mockPublisher.publishState.mockRejectedValueOnce(new Error('Fail'));

    const state = new WarehouseState('INACTIVE');

    // Spy sul logger per intercettare i log di errore
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await adapter.publishState(state);

    // Verifica che il publisher sia stato chiamato
    expect(mockPublisher.publishState).toHaveBeenCalledWith(state);

    // Pulisce lo spy
    logSpy.mockRestore();
  });
});