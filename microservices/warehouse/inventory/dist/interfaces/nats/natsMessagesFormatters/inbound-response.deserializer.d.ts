import { ConsumerDeserializer } from '@nestjs/microservices';
export declare class InboundRequestDeserializer implements ConsumerDeserializer {
    private readonly logger;
    deserialize(value: any, options?: Record<string, any>): {
        pattern: undefined;
        data: any;
        id: string;
    };
}
