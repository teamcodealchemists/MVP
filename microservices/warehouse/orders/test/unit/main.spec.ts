import * as nest from '@nestjs/core';
import { Transport } from "@nestjs/microservices";
import { OrdersModule } from "../../src/application/orders.module";
import { bootstrap } from '../../src/main';
import { InboundResponseDeserializer } from '../../src/interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';
import { OutboundResponseSerializer } from '../../src/interfaces/nats/natsMessagesFormatters/outbound-response.serializer';


jest.mock('@nestjs/core', () => ({
  NestFactory: {
    createMicroservice: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

describe("Test per main", () => {
    it('crea la microservice app con le opzioni corrette', async () => {
    // const {bootstrap } = await import('../../src/main.js');
    await bootstrap();

    expect(nest.NestFactory.createMicroservice).toHaveBeenCalledWith(
      OrdersModule,
      expect.objectContaining({
        transport: Transport.NATS,
        options: expect.objectContaining({
            servers: ['nats://nats:4222']
        }),
      })
    );
  });
});