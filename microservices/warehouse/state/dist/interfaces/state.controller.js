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
var StateController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateController = void 0;
// src/interfaces/http/state.controller.ts
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inboundPortAdapters_1 = require("../infrastructure/adapters/portAdapters/inboundPortAdapters");
let StateController = StateController_1 = class StateController {
    constructor(inboundPortsAdapter) {
        this.inboundPortsAdapter = inboundPortsAdapter;
        this.logger = new common_1.Logger(StateController_1.name);
    }
    async getSyncedState(data) {
        var _a;
        this.logger.log(`Raw inbound data: ${JSON.stringify(data)}`);
        let warehouseId = 0;
        // Se arriva come stringa JSON
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                warehouseId = (_a = parsed === null || parsed === void 0 ? void 0 : parsed.id) !== null && _a !== void 0 ? _a : 0;
            }
            catch (e) {
                this.logger.error('Error parsing inbound JSON string', e);
            }
        }
        // Se arriva già come oggetto
        else if (data && typeof data.id === 'number') {
            warehouseId = data.id;
        }
        this.logger.log(`Received getSyncedState request for warehouse ${warehouseId}`);
        const warehouseIdDTO = { id: warehouseId };
        return this.inboundPortsAdapter.getSyncedState(warehouseIdDTO);
    }
};
exports.StateController = StateController;
__decorate([
    (0, microservices_1.MessagePattern)('call.state.get'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StateController.prototype, "getSyncedState", null);
exports.StateController = StateController = StateController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inboundPortAdapters_1.InboundPortsAdapter])
], StateController);
