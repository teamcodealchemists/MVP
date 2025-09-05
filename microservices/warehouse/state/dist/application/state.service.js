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
var StateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateService = void 0;
// src/application/state.service.ts
const common_1 = require("@nestjs/common");
const state_repository_1 = require("../domain/mongodb/state.repository");
let StateService = StateService_1 = class StateService {
    constructor(stateRepository) {
        this.stateRepository = stateRepository;
        this.logger = new common_1.Logger(StateService_1.name);
    }
    async getState(warehouseId) {
        this.logger.log(`Fetching state for warehouse ${warehouseId.getId()}`);
        return await this.stateRepository.getState(warehouseId);
    }
    async updateState(state, warehouseId) {
        this.logger.log(`Updating state for warehouse ${warehouseId.getId()} to ${state.getState()}`);
        return await this.stateRepository.updateState(state, warehouseId);
    }
};
exports.StateService = StateService;
exports.StateService = StateService = StateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('STATEREPOSITORY')),
    __metadata("design:paramtypes", [Object])
], StateService);
