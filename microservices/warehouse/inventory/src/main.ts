import { NestFactory } from '@nestjs/core';
import { InventoryModule } from './application/inventory.module';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';

const logger = new Logger('InventoryMicroservice');

async function bootstrap() {
  // Creiamo il microservizio Nest con NATS
  console.log(process.env.NATS_URL);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryModule,
    {
      logger,
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL || 'nats://nats:4222'],
      },
    },
  );
  console.log(process.env.NATS_URL);
  app.useGlobalPipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }));
  await app.listen();
  console.log('Inventory NATS microservice running on nats://nats:4222');
}

// Avvio
bootstrap().catch(err => {
  console.error('Error starting Inventory microservice:', err);
  process.exit(1);
});
