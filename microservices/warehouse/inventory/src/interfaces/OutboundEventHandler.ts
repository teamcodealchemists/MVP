import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
@Injectable()
export class OutboundEventHandler implements OnModuleInit {
  constructor(
    @Inject("NATS_SERVICE") private readonly natsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.natsClient.connect();
  }
}