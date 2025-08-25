import { AuthModule } from './application/authentication.module'; //Modulo Principale
import { NestFactory } from '@nestjs/core'; //Factory per creare il servizio nest
import { MicroserviceOptions, Transport } from '@nestjs/microservices'; //Opzioni
import { Logger } from '@nestjs/common'; //Per fare logging del microservizio

//Importanti da copiare in seguito, permettono il formatting dei messaggi in entrata ed uscita a nats
import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
import { InboundRequestDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    logger: logger,
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats:4222'], // Indirizzo del container NATS
      deserializer: new InboundRequestDeserializer(),
      serializer: new OutboundResponseSerializer(),
    },
  });
  await app.listen();
}

bootstrap();
