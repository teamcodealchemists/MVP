    import { CentralSystemModule } from './application/centralsystem.module'; 
    import { NestFactory } from '@nestjs/core'; 
    import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
    import { Logger, ValidationPipe } from '@nestjs/common';

    import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
    import { InboundResponseDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

    const logger = new Logger();

    export async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(CentralSystemModule, { 
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
    logger.log(`Routing NATS microservice running on ${process.env.NATS_URL || 'nats://nats:4222'}`);
    }

    bootstrap();
