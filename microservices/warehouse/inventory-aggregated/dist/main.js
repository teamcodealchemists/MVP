"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const inventory_aggregated_module_1 = require("./application/inventory-aggregated.module");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(inventory_aggregated_module_1.InventoryAggregatedModule, {
        transport: microservices_1.Transport.NATS,
        options: {
            servers: ['nats://nats:4222'],
        },
    });
    await app.listen();
    console.log(`Inventory-Aggregated NATS microservice running on ${process.env.NATS_URL || 'nats://nats:4222'}`);
}
bootstrap();
