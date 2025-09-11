import { TokenStatus } from "./tokenStatus.entity"

export class Token {
    private readonly sub: string;
    private readonly status: TokenStatus;

    constructor(sub: string, status: TokenStatus) {
        this.sub = sub;
        this.status = status;
    }

    getSub(): string {
        return this.sub;
    }

    getStatus(): TokenStatus {
        return this.status;
    }
}   