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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StateRepositoryMongo_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateRepositoryMongo = void 0;
// src/interfaces/mongodb/state.repository.impl.ts
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const warehouse_state_entity_1 = require("../../domain/warehouse-state.entity");
let StateRepositoryMongo = StateRepositoryMongo_1 = class StateRepositoryMongo {
    constructor(stateModel) {
        this.stateModel = stateModel;
        this.logger = new common_1.Logger(StateRepositoryMongo_1.name);
    }
    async getState(warehouseId) {
        const doc = await this.stateModel.findOne({ warehouseId: warehouseId.getId() }).exec();
        if (!doc) {
            this.logger.warn(`No state found for warehouse ${warehouseId.getId()}`);
            return new warehouse_state_entity_1.WarehouseState('unknown'); // default state
        }
        return new warehouse_state_entity_1.WarehouseState(doc.state);
    }
    async updateState(state, warehouseId) {
        const result = await this.stateModel.updateOne({ warehouseId: warehouseId.getId() }, { state: state.getState() }, { upsert: true }).exec();
        return result.acknowledged;
    }
};
exports.StateRepositoryMongo = StateRepositoryMongo;
exports.StateRepositoryMongo = StateRepositoryMongo = StateRepositoryMongo_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('State')),
    __metadata("design:paramtypes", [Object])
], StateRepositoryMongo);
