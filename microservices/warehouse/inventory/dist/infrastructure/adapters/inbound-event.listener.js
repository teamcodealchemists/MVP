"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundEventListener = void 0;
const common_1 = require("@nestjs/common");
const nats_1 = require("nats");
const product_add_quantity_usecase_1 = require("../../domain/use-cases/product-add-quantity.usecase");
const order_request_usecase_1 = require("../../domain/use-cases/order-request.usecase");
let InboundEventListener = class InboundEventListener {
    addQuantityUseCase;
    orderRequestUseCase;
    nc;
    sc = (0, nats_1.StringCodec)();
    subAddQuantity;
    subOrderRequest;
    constructor(addQuantityUseCase, orderRequestUseCase) {
        this.addQuantityUseCase = addQuantityUseCase;
        this.orderRequestUseCase = orderRequestUseCase;
    }
    async onModuleInit() {
        this.nc = await (0, nats_1.connect)({ servers: 'nats://localhost:4222' });
        this.subAddQuantity = this.nc.subscribe('warehouse.product.addQuantity');
        (async () => {
            for await (const msg of this.subAddQuantity) {
                const dto = JSON.parse(this.sc.decode(msg.data));
                this.addQuantityUseCase.addQuantity(dto);
            }
        })();
        this.subOrderRequest = this.nc.subscribe('warehouse.order.request');
        (async () => {
            for await (const msg of this.subOrderRequest) {
                const dto = JSON.parse(this.sc.decode(msg.data));
                const result = this.orderRequestUseCase.orderRequest(dto);
                if (msg.reply) {
                    this.nc.publish(msg.reply, this.sc.encode(JSON.stringify({ success: result })));
                }
            }
        })();
    }
    async onModuleDestroy() {
        await this.subAddQuantity?.unsubscribe();
        await this.subOrderRequest?.unsubscribe();
        await this.nc.drain();
    }
};
exports.InboundEventListener = InboundEventListener;
exports.InboundEventListener = InboundEventListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_add_quantity_usecase_1.ProductAddQuantityUseCase,
        order_request_usecase_1.OrderRequestUseCase])
], InboundEventListener);
//# sourceMappingURL=inbound-event.listener.js.map