import { Logger } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    verbose: jest.fn(),
  })),
}));

//TEST PER OUTBOUND RESPONSE SERIALIZER
import { OutboundResponseSerializer } from '../../src/interfaces/nats/natsMessagesFormatters/outbound-response.serializer';

describe('OutboundResponseSerializer', () => {
  let serializer: OutboundResponseSerializer;
  let loggerInstance: any;

  beforeEach(() => {
    serializer = new OutboundResponseSerializer();
    loggerInstance = ((Logger as unknown) as jest.Mock).mock.results[0].value;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('serializza una risposta con response', () => {
    const value = { response: { foo: 'bar' } };
    const result = serializer.serialize(value);
    expect(result).toEqual({ data: { foo: 'bar' } });
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serializing outbound response'));
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serialized outbound response'));
  });

  it('serializza una risposta con err come stringa', () => {
    const value = { err: 'errore generico' };
    const result = serializer.serialize(value) as any;
    expect(JSON.parse(result.data)).toEqual({
      error: {
        code: 'system.invalidParams',
        message: 'errore generico'
      }
    });
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serializing outbound response'));
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serialized outbound response'));
  });

  it('serializza una risposta con err come array di errori di validazione', () => {
    const value = {
      err: [
        { constraints: { isString: 'Deve essere una stringa', isNotEmpty: 'Non può essere vuoto' } },
        { constraints: { isNumber: 'Deve essere un numero' } }
      ]
    };
    const result = serializer.serialize(value) as any;
    expect(JSON.parse(result.data)).toEqual({
      error: {
        code: 'system.invalidParams',
        message: 'Deve essere una stringa. Non può essere vuoto. Deve essere un numero'
      }
    });
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serializing outbound response'));
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serialized outbound response'));
  });

  it('serializza una risposta senza response né err', () => {
    const value = { data: 'test' };
    const result = serializer.serialize(value);
    expect(result).toEqual({ data: 'test' });
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serializing outbound response'));
    expect(loggerInstance.verbose).toHaveBeenCalledWith(expect.stringContaining('Serialized outbound response'));
  });
});