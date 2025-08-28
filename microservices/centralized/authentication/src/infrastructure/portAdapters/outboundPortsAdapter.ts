import { Injectable } from "@nestjs/common";

//Ports Interfaces
import { SetTokenPortPublisher } from "src/domain/outbound-ports/setTokenPort.publisher";

import { AuthEventHandler } from "src/interfaces/authEvent.handler";


@Injectable()
export class OutboundPortsAdapter implements 
SetTokenPortPublisher {
    constructor(private readonly authEventHandler: AuthEventHandler) {}

    emitAccessToken(token: string, cid: string): void {
        this.authEventHandler.emitAccessToken(token, cid);
    }

}