import { NestFactory } from '@nestjs/core';
import { InventoryModule } from './application/inventory.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Creiamo il microservizio Nest con NATS
  console.log(process.env.NATS_URL);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryModule,
    {
      transport: Transport.NATS,
      options: {
        servers: ['nats://nats:4222'],
      },
    },
  );
  console.log(process.env.NATS_URL);
  await app.listen();
  console.log('Inventory NATS microservice running on nats://nats:4222');
}

// Avvio
bootstrap().catch(err => {
  console.error('Error starting Inventory microservice:', err);
  process.exit(1);
});
