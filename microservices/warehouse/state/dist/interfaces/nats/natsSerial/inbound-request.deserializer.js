"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundRequestDeserializer = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
class InboundRequestDeserializer {
    constructor() {
        this.logger = new common_1.Logger('InboundRequestDeserializer');
    }
    deserialize(value, options) {
        this.logger.verbose(`<<-- deserializing inbound request message:\n${value}
      \n\twith options: ${JSON.stringify(options)}`);
        let data;
        // Se è Buffer, prova a fare il parse JSON
        if (Buffer.isBuffer(value)) {
            const str = value.toString().trim(); // rimuove spazi e ritorni a capo
            try {
                data = JSON.parse(str);
            }
            catch (_a) {
                data = str;
            }
        }
        else if (typeof value === 'string') {
            try {
                data = JSON.parse(value.trim());
            }
            catch (_b) {
                data = value.trim();
            }
        }
        else {
            data = value;
        }
        return {
            pattern: undefined,
            data,
            id: (0, uuid_1.v4)(),
        };
    }
}
exports.InboundRequestDeserializer = InboundRequestDeserializer;
