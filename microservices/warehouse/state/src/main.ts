import { StateModule } from './application/state.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { InboundRequestDeserializer } from './interfaces/nats/natsSerial/inbound-request.deserializer';
import { OutboundResponseSerializer } from './interfaces/nats/natsSerial/outbound-request.serializer';
const logger = new Logger('StateMicroservice');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(StateModule, {
    logger: logger,
    transport: Transport.NATS,
    options: {
      servers: ['nats://127.0.0.1:4222'],
         deserializer: new InboundRequestDeserializer(),
      serializer: new OutboundResponseSerializer(),
    },
   
  });


  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
  logger.log('State microservice is listening...');
}

bootstrap();
