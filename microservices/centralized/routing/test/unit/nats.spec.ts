import { natsConfig } from '../../src/interfaces/nats/nats.config';
import { Transport } from '@nestjs/microservices';


//TEST PER NATS CONFIG
describe('natsConfig', () => {
  it('deve avere la struttura corretta', () => {
    expect(natsConfig).toHaveProperty('transport', Transport.NATS);
    expect(natsConfig).toHaveProperty('options');
    expect(natsConfig.options).toHaveProperty('servers');
    expect(natsConfig.options).toHaveProperty('queue', 'orders-queue');
    expect(natsConfig.options).toHaveProperty('timeout', 5000);
    expect(natsConfig.options).toHaveProperty('maxReconnectAttempts', -1);
    expect(natsConfig.options).toHaveProperty('reconnect', true);
    expect(natsConfig.options).toHaveProperty('reconnectTimeWait', 1000);
  });

  it('deve usare NATS_URL se presente', () => {
    process.env.NATS_URL = 'nats://custom:4222';
    jest.resetModules();
    const { natsConfig: freshConfig } = require('../../src/interfaces/nats/nats.config');
    expect(freshConfig.options.servers[0]).toBe('nats://custom:4222');
    delete process.env.NATS_URL;
  });

  it('deve usare il valore di default se NATS_URL non è presente', () => {
    delete process.env.NATS_URL;
    jest.resetModules();
    const { natsConfig: freshConfig } = require('../../src/interfaces/nats/nats.config');
    expect(freshConfig.options.servers[0]).toBe('nats://localhost:4222');
  });
});

//TEST PER NATS SERVICE
import { NatsService } from '../../src/interfaces/nats/nats.service';
import { connect, NatsConnection, JSONCodec } from 'nats';

jest.mock('nats', () => {
  const mockPublish = jest.fn();
  return {
    connect: jest.fn().mockResolvedValue({
      publish: mockPublish,
      close: jest.fn().mockResolvedValue(undefined),
    }),
    JSONCodec: jest.fn().mockReturnValue({
      encode: jest.fn((data) => Buffer.from(JSON.stringify(data))),
    }),
  };
});

describe('NatsService', () => {
  let service: NatsService;

  beforeEach(() => {
    service = new NatsService();
  });

  it('onModuleInit inizializza la connessione NATS', async () => {
    await service.onModuleInit();
    expect(connect).toHaveBeenCalledWith({
      servers: process.env.NATS_URL || 'nats://nats:4222',
    });
    expect(service['nc']).toBeDefined();
  });

  it('onModuleDestroy chiude la connessione NATS', async () => {
    await service.onModuleInit();
    const closeSpy = jest.spyOn(service['nc'], 'close');
    await service.onModuleDestroy();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('publish invia il messaggio codificato', async () => {
    await service.onModuleInit();
    const publishSpy = jest.spyOn(service['nc'], 'publish');
    const encodeSpy = jest.spyOn(service['jsonCodec'], 'encode');
    await service.publish('test.subject', { foo: 'bar' });
    expect(encodeSpy).toHaveBeenCalledWith({ foo: 'bar' });
    expect(publishSpy).toHaveBeenCalledWith('test.subject', expect.any(Buffer));
  });
});