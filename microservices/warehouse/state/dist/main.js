"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_module_1 = require("./application/state.module");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const inbound_request_deserializer_1 = require("./interfaces/nats/natsSerial/inbound-request.deserializer");
const outbound_request_serializer_1 = require("./interfaces/nats/natsSerial/outbound-request.serializer");
const logger = new common_1.Logger('StateMicroservice');
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(state_module_1.StateModule, {
        logger: logger,
        transport: microservices_1.Transport.NATS,
        options: {
            servers: ['nats://127.0.0.1:4222'],
            deserializer: new inbound_request_deserializer_1.InboundRequestDeserializer(),
            serializer: new outbound_request_serializer_1.OutboundResponseSerializer(),
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    await app.listen();
    logger.log('State microservice is listening...');
}
bootstrap();
