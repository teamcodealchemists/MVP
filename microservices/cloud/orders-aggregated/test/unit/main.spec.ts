// import { mock } from "node:test";
import * as nest from '@nestjs/core';
import { Transport } from "@nestjs/microservices";
import { CloudOrdersModule } from "../../src/application/cloud.orders.module";
import { bootstrap } from '../../src/main';
import { InboundResponseDeserializer } from '../../src/interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';
import { OutboundResponseSerializer } from '../../src/interfaces/nats/natsMessagesFormatters/outbound-response.serializer';


jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      connectMicroservice: jest.fn(),
      startAllMicroservices: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

describe("Test per main", () => {
  it('crea la microservice app con le opzioni corrette', async () => {
    await bootstrap();

    expect(nest.NestFactory.create).toHaveBeenCalledWith(CloudOrdersModule);
  });
});