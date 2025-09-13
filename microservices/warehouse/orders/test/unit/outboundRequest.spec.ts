import { OutboundRequestSerializer } from '../../src/interfaces/nats/natsMessagesFormatters/outbound-request.serializer';

describe('OutboundRequestSerializer', () => {
  let serializer: OutboundRequestSerializer;

  beforeEach(() => {
    serializer = new OutboundRequestSerializer();
  });

  it('should serialize a request with data property', () => {
    const value = { data: { foo: 'bar' } };
    const result = serializer.serialize(value);
    expect(result).toEqual({ data: { foo: 'bar' } });
  });

  it('should serialize a request with empty data', () => {
    const value = { data: {} };
    const result = serializer.serialize(value);
    expect(result).toEqual({ data: {} });
  });

  it('should serialize a request with data as string', () => {
    const value = { data: 'test' };
    const result = serializer.serialize(value);
    expect(result).toEqual({ data: 'test' });
  });
});