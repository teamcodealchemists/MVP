import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthEventHandler implements OnModuleInit {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,) { }

    async onModuleInit() {
        await this.natsClient.connect(); // 🔑 forza la connessione prima di usare emit/send
    }

    emitAccessToken(token: string, cid: string): void {
        this.natsClient.emit(
            `conn.${cid}.token`,
            token
        );
        return;
    }
}