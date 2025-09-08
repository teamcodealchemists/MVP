"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const inventory_service_1 = require("./inventory.service");
const inventory_repository_module_1 = require("../infrastructure/adapters/mongodb/inventory.repository.module");
const commandHandler_controller_1 = require("../interfaces/commandHandler.controller");
const inventory_repository_impl_1 = require("../infrastructure/adapters/mongodb/inventory.repository.impl");
const outbound_event_adapter_1 = require("../infrastructure/adapters/outbound-event.adapter");
const inbound_event_listener_1 = require("../infrastructure/adapters/inbound-event.listener");
const product_add_quantity_usecase_1 = require("../domain/use-cases/product-add-quantity.usecase");
const order_request_usecase_1 = require("../domain/use-cases/order-request.usecase");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/inventorydb'),
            inventory_repository_module_1.InventoryRepositoryModule,
        ],
        controllers: [commandHandler_controller_1.CommandHandler],
        providers: [
            inventory_service_1.InventoryService,
            outbound_event_adapter_1.OutboundEventAdapter,
            inbound_event_listener_1.InboundEventListener,
            product_add_quantity_usecase_1.ProductAddQuantityUseCase,
            order_request_usecase_1.OrderRequestUseCase,
            {
                provide: 'INVENTORYREPOSITORY',
                useClass: inventory_repository_impl_1.InventoryRepositoryMongo,
            },
        ],
        exports: [inventory_service_1.InventoryService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map