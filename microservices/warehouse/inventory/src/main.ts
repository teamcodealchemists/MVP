import { InventoryModule } from './application/inventory.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundRequestDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InventoryModule, {
    logger: logger,
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'], // Nome del container NATS
      deserializer: new InboundRequestDeserializer(),
      serializer: new OutboundResponseSerializer(),
    },
  });
  await app.listen();
}

bootstrap();
