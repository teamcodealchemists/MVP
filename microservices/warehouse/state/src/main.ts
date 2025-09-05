import { StateModule } from './application/state.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

const logger = new Logger('StateMicroservice');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(StateModule, {
    logger: logger,
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'],
    },
  });


  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
  logger.log('State microservice is listening...');
}

bootstrap();
