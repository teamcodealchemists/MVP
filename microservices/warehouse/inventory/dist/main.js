"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const inventory_module_1 = require("./application/inventory.module");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    console.log(process.env.NATS_URL);
    const app = await core_1.NestFactory.createMicroservice(inventory_module_1.InventoryModule, {
        transport: microservices_1.Transport.NATS,
        options: {
            servers: ['nats://172.25.0.4:4222'],
        },
    });
    console.log(process.env.NATS_URL);
    await app.listen();
    console.log('Inventory NATS microservice running on nats://nats:4222');
}
bootstrap().catch(err => {
    console.error('Error starting Inventory microservice:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map