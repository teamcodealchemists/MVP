"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAggregatedModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const inventory_aggregated_service_1 = require("./inventory-aggregated.service");
const inventory_aggregated_repository_impl_1 = require("../infrastructure/adapters/mongodb/inventory-aggregated.repository.impl");
const syncProduct_schema_1 = require("../infrastructure/adapters/mongodb/schemas/syncProduct.schema");
const syncProduct_schema_2 = require("../infrastructure/adapters/mongodb/schemas/syncProduct.schema");
const cloud_data_mapper_1 = require("../infrastructure/mappers/cloud-data.mapper");
let InventoryAggregatedModule = class InventoryAggregatedModule {
};
exports.InventoryAggregatedModule = InventoryAggregatedModule;
exports.InventoryAggregatedModule = InventoryAggregatedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory'),
            mongoose_1.MongooseModule.forFeature([{ name: syncProduct_schema_1.SyncProduct.name, schema: syncProduct_schema_2.SyncProductSchema }]),
        ],
        providers: [
            inventory_aggregated_service_1.InventoryAggregatedService,
            cloud_data_mapper_1.CloudDataMapper,
            {
                provide: 'INVENTORYREPOSITORY',
                useClass: inventory_aggregated_repository_impl_1.InventoryAggregatedRepositoryImpl,
            },
        ],
        exports: [inventory_aggregated_service_1.InventoryAggregatedService],
    })
], InventoryAggregatedModule);
