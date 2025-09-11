import { SyncItemId } from "src/domain/syncItemId.entity";
import { SyncOrderItem } from "src/domain/syncOrderItem.entity";


describe("Test per ItemId", () => {
    it("Dovrebbe restituire l'id di ItemId passato dal costruttore", () => {

        const id = 1234567890;
        const itemId = new SyncItemId(id);
        // OrderItem: id, quantity
        const orderItem = new SyncOrderItem(itemId, 10);

        expect(orderItem.getItemId().getId()).toBe(id);
    });

     it("Dovrebbe restituire la quantity di ItemId passato dal costruttore", () => {

        const id = 1234567890;
        const itemId = new SyncItemId(id);
        const quantity = 23;
        // OrderItem: id, quantity
        const orderItem = new SyncOrderItem(itemId, quantity);

        expect(orderItem.getQuantity()).toBe(quantity);
    });

});