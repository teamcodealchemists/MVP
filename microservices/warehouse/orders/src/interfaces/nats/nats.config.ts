import { Transport } from '@nestjs/microservices';
import { OutboundRequestSerializer } from './natsMessagesFormatters/outbound-request.serializer';
import { serialize } from 'v8';

export const natsConfig = {
  transport: Transport.NATS,
  options: {
    servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    serializer: OutboundRequestSerializer, 
    queue: 'orders-queue',
    timeout: 5000,
    maxReconnectAttempts: -1,
    reconnect: true,
    reconnectTimeWait: 1000,
  },
};