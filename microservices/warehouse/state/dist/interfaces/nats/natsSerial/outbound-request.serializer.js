"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundResponseSerializer = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
class OutboundResponseSerializer {
    constructor() {
        this.logger = new common_1.Logger('OutboundResponseSerializer');
    }
    serialize(value) {
        var _a;
        this.logger.verbose(`-->> Serializing outbound response: ${JSON.stringify(value)}`);
        return {
            id: (0, uuid_1.v4)(),
            response: (_a = value.response) !== null && _a !== void 0 ? _a : value,
            isDisposed: true,
        };
    }
}
exports.OutboundResponseSerializer = OutboundResponseSerializer;
