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
var OutboundPortsAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundPortsAdapter = void 0;
const common_1 = require("@nestjs/common");
let OutboundPortsAdapter = OutboundPortsAdapter_1 = class OutboundPortsAdapter {
    constructor(statePublisher) {
        this.statePublisher = statePublisher;
        this.logger = new common_1.Logger(OutboundPortsAdapter_1.name);
    }
    async publishState(state) {
        try {
            this.logger.log(`Publishing state for warehouse: ${state.getState()}`);
            await this.statePublisher.publishState(state);
        }
        catch (error) {
            const e = error;
            this.logger.error(`Failed to publish warehouse state: ${e.message}`);
        }
    }
};
exports.OutboundPortsAdapter = OutboundPortsAdapter;
exports.OutboundPortsAdapter = OutboundPortsAdapter = OutboundPortsAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], OutboundPortsAdapter);
