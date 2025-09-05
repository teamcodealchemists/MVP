"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateModule = void 0;
const common_1 = require("@nestjs/common");
const state_service_1 = require("./state.service");
const state_repository_module_1 = require("../interfaces/mongodb/state.repository.module");
const mongoose_1 = require("@nestjs/mongoose");
const state_controller_1 = require("../interfaces/state.controller");
const inboundPortAdapters_1 = require("../infrastructure/adapters/portAdapters/inboundPortAdapters");
let StateModule = class StateModule {
};
exports.StateModule = StateModule;
exports.StateModule = StateModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/state-db'),
            state_repository_module_1.StateRepositoryModule,
        ],
        controllers: [state_controller_1.StateController],
        providers: [state_service_1.StateService, inboundPortAdapters_1.InboundPortsAdapter],
        exports: [state_service_1.StateService],
    })
], StateModule);
