import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JSONCodec } from 'nats';
import { OutboundRequestSerializer } from './natsMessagesFormatters/outbound-request.serializer';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
  private jsonCodec = JSONCodec();

  async onModuleInit() {
    this.nc = await connect({
      servers: process.env.NATS_URL || 'nats://nats:4222'
    });
  }

  async onModuleDestroy() {
    await this.nc?.close();
  }

  async publish(subject: string, data: any): Promise<void> {
    this.nc.publish(subject, this.jsonCodec.encode(data));
  }
}