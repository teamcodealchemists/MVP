import { OutboundRequestSerializer } from '../../src/interfaces/nats/natsMessagesFormatters/outbound-request.serializer';

describe('OutboundRequestSerializer', () => {
  let serializer: OutboundRequestSerializer;

  beforeEach(() => {
    serializer = new OutboundRequestSerializer();
  });

  it('serializza correttamente un oggetto con proprietà data', () => {
    const input = { data: { foo: 'bar', num: 42 } };
    const result = serializer.serialize(input);
    expect(result).toEqual({ data: { foo: 'bar', num: 42 } });
  });

  it('serializza un oggetto senza proprietà data', () => {
    const input = { other: 'value' };
    const result = serializer.serialize(input);
    expect(result).toEqual({ data: undefined });
  });

  it('logga la serializzazione', () => {
    const spy = jest.spyOn(serializer['logger'], 'verbose');
    const input = { data: { test: 'ok' } };
    serializer.serialize(input);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Serializing outbound request')
    );
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Serialized value')
    );
  });
});