import { NestFactory } from '@nestjs/core';
import { InventoryAggregatedModule } from './application/inventory-aggregated.module';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';
import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';


const logger = new Logger('InventoryAggregatedMicroservice');

export async function bootstrap() {
  const app = await NestFactory.create(InventoryAggregatedModule);
  const microserviceNats = app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.NATS,
      options: {
        servers: ['nats://nats:4222'],
        deserializer: new InboundResponseDeserializer(),
        serializer: new OutboundResponseSerializer(),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }));
  
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3110);

  logger.log(
    `Inventory-Aggregated NATS microservice running on ${process.env.NATS_URL || 'nats://nats:4222'}`
  );
}

bootstrap();
