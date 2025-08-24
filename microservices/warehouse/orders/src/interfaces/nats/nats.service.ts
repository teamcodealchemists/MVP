import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JSONCodec } from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
  private jsonCodec = JSONCodec();

  async onModuleInit() {
    this.nc = await connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222'
    });
  }

  async onModuleDestroy() {
    await this.nc?.close();
  }

  async publish(subject: string, data: any): Promise<void> {
    this.nc.publish(subject, this.jsonCodec.encode(data));
  }
}