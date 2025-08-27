import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthEventHandler {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,) { }

    async emitAccessToken(token: string, cid: string): Promise<void> {
        this.natsClient.emit(
            `conn.${cid}.token`,
            JSON.stringify(token)
        );
        return Promise.resolve();
    }
}