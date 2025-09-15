import { AuthModule } from './application/authentication.module'; //Modulo Principale
import { NestFactory } from '@nestjs/core'; //Factory per creare il servizio nest
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices'; //Opzioni
import { Logger, ValidationPipe } from '@nestjs/common'; //Per fare logging del microservizio

//Importanti da copiare in seguito, permettono il formatting dei messaggi in entrata ed uscita a nats
import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const microserivceNats = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'],
      deserializer: new InboundResponseDeserializer(),
      serializer: new OutboundResponseSerializer(),
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new RpcException(errors),
    }),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3510);
}

bootstrap();
