//TEST PER INBOUND RESPONSE DESERIALIZER
import { InboundResponseDeserializer } from '../../src/interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';
import { Logger } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    verbose: jest.fn(),
  })),
}));

describe('InboundResponseDeserializer', () => {
  let deserializer: InboundResponseDeserializer;
  let loggerInstance: any;

  beforeEach(() => {
    deserializer = new InboundResponseDeserializer();
    loggerInstance = ((Logger as unknown) as jest.Mock).mock.results[0].value;
  });

  it('chiama logger.verbose con il messaggio corretto', () => {
    const value = JSON.stringify({ foo: 'bar' });
    const options = { test: true };
    deserializer.deserialize(value, options);
    expect(loggerInstance.verbose).toHaveBeenCalledWith(
      expect.stringContaining('deserializing inbound response message:')
    );
    expect(loggerInstance.verbose).toHaveBeenCalledWith(
      expect.stringContaining(value)
    );
    expect(loggerInstance.verbose).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify(options))
    );
  });

  it('restituisce un oggetto con pattern, data e id', () => {
    const value = JSON.stringify({ foo: 'bar' });
    const result = deserializer.deserialize(value);
    expect(result).toHaveProperty('pattern', undefined);
    expect(result).toHaveProperty('data', { foo: 'bar' });
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    });
});