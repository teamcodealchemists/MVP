import { Transport } from '@nestjs/microservices';
import { OutboundRequestSerializer } from './natsMessagesFormatters/outbound-request.serializer';

export const natsConfig = {
  transport: Transport.NATS,
  options: {
    servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    queue: 'orders-queue',
    timeout: 5000,
    maxReconnectAttempts: -1,
    reconnect: true,
    reconnectTimeWait: 1000,
  },
  serializer: new OutboundRequestSerializer(),
};