import { NestFactory } from '@nestjs/core';
import { InventoryAggregatedModule } from './application/inventory-aggregated.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryAggregatedModule,
    {
      transport: Transport.NATS,
      options: {
        servers: ['nats://nats:4222'],
      },
    },
  );
  await app.listen();
  console.log(
    `Inventory-Aggregated NATS microservice running on ${process.env.NATS_URL || 'nats://nats:4222'}`
  );
}

bootstrap();
