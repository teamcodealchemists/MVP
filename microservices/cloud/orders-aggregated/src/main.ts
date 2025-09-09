import { CloudOrdersModule } from './application/cloud.orders.module';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundRequestDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';


async function bootstrap() {
    const logger = new Logger('Bootstrap');

  const app = await NestFactory.createMicroservice(CloudOrdersModule, {
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'],
      deserializer: new InboundRequestDeserializer(),
      //serializer: new OutboundResponseSerializer(),
      queue: 'orders-aggregated-queue',
    },
  });
  
  await app.listen();
  logger.log('Aggregate Orders is listening');
}
bootstrap();