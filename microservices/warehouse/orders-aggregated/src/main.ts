import { OrdersModule } from './application/orders.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundRequestDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';


async function bootstrap() {
  const app = await NestFactory.createMicroservice(OrdersModule, {
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'],
      deserializer: new InboundRequestDeserializer(),
      //serializer: new OutboundResponseSerializer(),
    },
  });
  await app.listen();
  console.log('Microservice is listening');
}
bootstrap();