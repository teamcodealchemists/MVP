import { InventoryModule } from './application/inventory.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundRequestDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

const logger = new Logger();

async function bootstrap() {
  const natsUrl = process.env.NATS_URL!;
  const maxRetries = 10;
  const retryDelay = 2000; // 2 secondi

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const app = await NestFactory.createMicroservice<MicroserviceOptions>(InventoryModule, {
        logger,
        transport: Transport.NATS,
        options: {
          servers: [natsUrl],
          deserializer: new InboundRequestDeserializer(),
          serializer: new OutboundResponseSerializer(),
        },
      });

      await app.listen();
      logger.log('Inventory microservice connected to NATS and listening...');
      return; // connesso, esce dal loop
    } catch (err) {
      logger.error(`Attempt ${attempt} - Could not connect to NATS at ${natsUrl}. Retrying in ${retryDelay}ms...`);
      if (attempt === maxRetries) throw err;
      await new Promise(res => setTimeout(res, retryDelay));
    }
  }
}

bootstrap();
