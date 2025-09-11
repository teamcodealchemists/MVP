export class UserId {
    private readonly userId: number;

    constructor(userId: number) {
        this.userId = userId;
    }

    getId(): number {
        return this.userId;
    }
}