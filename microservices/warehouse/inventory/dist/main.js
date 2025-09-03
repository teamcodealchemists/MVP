"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_module_1 = require("./application/inventory.module");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const outbound_response_serializer_1 = require("./interfaces/nats/natsMessagesFormatters/outbound-response.serializer");
const inbound_response_deserializer_1 = require("./interfaces/nats/natsMessagesFormatters/inbound-response.deserializer");
const logger = new common_1.Logger();
async function bootstrap() {
    const natsUrl = process.env.NATS_URL;
    const maxRetries = 10;
    const retryDelay = 2000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const app = await core_1.NestFactory.createMicroservice(inventory_module_1.InventoryModule, {
                logger,
                transport: microservices_1.Transport.NATS,
                options: {
                    servers: [natsUrl],
                    deserializer: new inbound_response_deserializer_1.InboundRequestDeserializer(),
                    serializer: new outbound_response_serializer_1.OutboundResponseSerializer(),
                },
            });
            await app.listen();
            logger.log('Inventory microservice connected to NATS and listening...');
            return;
        }
        catch (err) {
            logger.error(`Attempt ${attempt} - Could not connect to NATS at ${natsUrl}. Retrying in ${retryDelay}ms...`);
            if (attempt === maxRetries)
                throw err;
            await new Promise(res => setTimeout(res, retryDelay));
        }
    }
}
bootstrap();
//# sourceMappingURL=main.js.map