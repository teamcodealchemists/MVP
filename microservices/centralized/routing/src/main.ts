    import { RoutingModule } from './application/routing.module'; //Modulo Principale
    import { NestFactory } from '@nestjs/core'; //Factory per creare il servizio nest
    import { MicroserviceOptions, Transport, RpcException } from '@nestjs/microservices'; //Opzioni
    import { Logger, ValidationPipe } from '@nestjs/common'; //Per fare logging del microservizio

    //Importanti da copiare in seguito, permettono il formatting dei messaggi in entrata ed uscita a nats
    import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
    import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';


    const logger = new Logger();

    export async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(RoutingModule, {
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
    }

    bootstrap();