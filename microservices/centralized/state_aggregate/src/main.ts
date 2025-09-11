    import { StateAggregateModule } from './application/stateAggregate.module'; //Modulo Principale
    import { NestFactory } from '@nestjs/core'; //Factory per creare il servizio nest
    import { MicroserviceOptions, Transport } from '@nestjs/microservices'; //Opzioni
    import { Logger } from '@nestjs/common'; //Per fare logging del microservizio

    import { ValidationPipe } from '@nestjs/common'; //Per validare i DTO
    import { RpcException } from '@nestjs/microservices';

    //Importanti da copiare in seguito, permettono il formatting dei messaggi in entrata ed uscita a nats
    import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
    import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

    const logger = new Logger();

    export async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(StateAggregateModule, { //RICORDA DI CAMBIARE I NOMI DEI MODULI
        logger: logger,
        transport: Transport.NATS,
        options: {
        servers: ['nats://nats:4222'], // Indirizzo del container NATS
        deserializer: new InboundResponseDeserializer(),
        serializer: new OutboundResponseSerializer(),
        },
    });
    app.useGlobalPipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }));
    await app.listen();
    logger.log(`State-Aggregate NATS microservice running on ${process.env.NATS_URL || 'nats://nats:4222'}`);
    }

    bootstrap();