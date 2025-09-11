import { SyncOrderId } from "src/domain/syncOrderId.entity";

describe("Test per SyncOrderId", () => {
    it("Dovrebbe restituire l'id di SyncOrderId passato dal costruttore", () => {

        const id = "S-1234567890";
        const orderId = new SyncOrderId(id);

        expect(orderId.getId()).toBe(id);
    });

    it("Dovrebbe restituire la prima lettera dell'id dell'ordine passato dal costruttore", () => {

        const id = "S-1234567890";
        const orderId = new SyncOrderId(id);

        expect(orderId.getOrderType()).toBe(id.charAt(0));
    });
});

