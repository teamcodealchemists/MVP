export interface SetTokenPortPublisher{
    emitAccessToken(token: string, cid: string): void;
}
