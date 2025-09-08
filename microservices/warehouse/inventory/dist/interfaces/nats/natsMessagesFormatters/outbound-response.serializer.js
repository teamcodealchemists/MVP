"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundResponseSerializer = void 0;
const common_1 = require("@nestjs/common");
class OutboundResponseSerializer {
    logger = new common_1.Logger('OutboundResponseSerializer');
    serialize(value) {
        this.logger.verbose(`-->> Serializing outbound response: \n${JSON.stringify(value)}`);
        value = { data: JSON.stringify(value.response) };
        return value;
    }
}
exports.OutboundResponseSerializer = OutboundResponseSerializer;
//# sourceMappingURL=outbound-response.serializer.js.map