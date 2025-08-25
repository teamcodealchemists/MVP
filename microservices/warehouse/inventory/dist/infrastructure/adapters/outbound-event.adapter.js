"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundEventAdapter = void 0;
const common_1 = require("@nestjs/common");
const nats_1 = require("nats");
let OutboundEventAdapter = class OutboundEventAdapter {
    nc;
    sc = (0, nats_1.StringCodec)();
    async onModuleInit() {
        this.nc = await (0, nats_1.connect)({ servers: 'nats://localhost:4222' });
        console.log('Connected to NATS');
    }
    async onModuleDestroy() {
        await this.nc.drain();
        console.log('Disconnected from NATS');
    }
    belowMinThres(product) {
        this.nc.publish('warehouse.critical.belowMin', this.sc.encode(JSON.stringify(product)));
    }
    aboveMaxThres(product) {
        this.nc.publish('warehouse.critical.aboveMax', this.sc.encode(JSON.stringify(product)));
    }
    stockAdded(product, warehouseId) {
        this.nc.publish('warehouse.stock.added', this.sc.encode(JSON.stringify({ product, warehouseId })));
    }
    stockRemoved(productId, warehouseId) {
        this.nc.publish('warehouse.stock.removed', this.sc.encode(JSON.stringify({ productId, warehouseId })));
    }
    stockUpdated(product, warehouseId) {
        this.nc.publish('warehouse.stock.updated', this.sc.encode(JSON.stringify({ product, warehouseId })));
    }
    insufficientProductAvailability() {
        this.nc.publish('warehouse.availability.insufficient', this.sc.encode('{}'));
    }
    sufficientProductAvailability() {
        this.nc.publish('warehouse.availability.sufficient', this.sc.encode('{}'));
    }
    requestRestock(productId, number) {
        this.nc.publish('warehouse.restock.request', this.sc.encode(JSON.stringify({ productId, number })));
    }
};
exports.OutboundEventAdapter = OutboundEventAdapter;
exports.OutboundEventAdapter = OutboundEventAdapter = __decorate([
    (0, common_1.Injectable)()
], OutboundEventAdapter);
//# sourceMappingURL=outbound-event.adapter.js.map