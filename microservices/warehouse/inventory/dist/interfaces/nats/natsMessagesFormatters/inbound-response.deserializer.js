"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundRequestDeserializer = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
class InboundRequestDeserializer {
    logger = new common_1.Logger('InboundRequestDeserializer');
    deserialize(value, options) {
        this.logger.verbose(`<<-- deserializing inbound request message:\n${value}
      \n\twith options: ${JSON.stringify(options)}`);
        return {
            pattern: undefined,
            data: value,
            id: (0, uuid_1.v4)(),
        };
    }
}
exports.InboundRequestDeserializer = InboundRequestDeserializer;
//# sourceMappingURL=inbound-response.deserializer.js.map