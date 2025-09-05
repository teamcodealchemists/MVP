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
exports.InboundPortsAdapter = void 0;
const common_1 = require("@nestjs/common");
const state_service_1 = require("../../../application/state.service");
const datamapper_1 = require("../../mappers/datamapper");
let InboundPortsAdapter = class InboundPortsAdapter {
    constructor(stateService) {
        this.stateService = stateService;
    }
    async getSyncedState(warehouseIdDTO) {
        const warehouseState = await this.stateService.getState(datamapper_1.DataMapper.toDomainWarehouseId(warehouseIdDTO));
        if (!warehouseState) {
            return { state: 'unknown' };
        }
        return datamapper_1.DataMapper.toDTOWarehouseState(warehouseState);
    }
};
exports.InboundPortsAdapter = InboundPortsAdapter;
exports.InboundPortsAdapter = InboundPortsAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService])
], InboundPortsAdapter);
