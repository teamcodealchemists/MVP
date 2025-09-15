import { CloudOrdersModule } from './application/cloud.orders.module';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(CloudOrdersModule);
  const microserivceNats = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'],
      deserializer: new InboundResponseDeserializer(),
      serializer: new OutboundResponseSerializer(),
      queue: 'orders-aggregated-queue',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3010);
  logger.log('Aggregate Orders is listening');
}
bootstrap();
