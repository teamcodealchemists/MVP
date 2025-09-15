import { OrdersModule } from './application/orders.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';

import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';
import { Logger, ValidationPipe } from '@nestjs/common';

const logger = new Logger('OrdersMicroservice');

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://nats:4222'],
      deserializer: new InboundResponseDeserializer(),
      serializer: new OutboundResponseSerializer(),
    },
  });
  app.useGlobalPipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }));
  await app.listen();
  console.log('Microservice is listening');
}
bootstrap();