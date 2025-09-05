"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseState = void 0;
class WarehouseState {
    constructor(state) {
        this.state = state;
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
    }
}
exports.WarehouseState = WarehouseState;
