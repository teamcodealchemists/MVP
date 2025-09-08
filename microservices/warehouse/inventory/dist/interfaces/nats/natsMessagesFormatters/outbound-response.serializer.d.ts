import { Serializer, OutgoingResponse } from '@nestjs/microservices';
export declare class OutboundResponseSerializer implements Serializer {
    private readonly logger;
    serialize(value: any): OutgoingResponse;
}
