import { OrderId } from "src/domain/orderId.entity";

describe("Test per OrderId", () => {
    it("Dovrebbe restituire l'id di OrderId passato dal costruttore", () => {

        const id = "S-1234567890";
        const orderId = new OrderId(id);

        expect(orderId.getId()).toBe(id);
    });

    it("Dovrebbe restituire la prima lettera dell'id dell'ordine passato dal costruttore", () => {

        const id = "S-1234567890";
        const orderId = new OrderId(id);

        expect(orderId.getOrderType()).toBe(id.charAt(0));
    });
});

