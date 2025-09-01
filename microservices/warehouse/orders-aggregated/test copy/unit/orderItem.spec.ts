import { ItemId } from "src/domain/itemId.entity";
import { OrderItem } from "src/domain/orderItem.entity";


describe("Test per ItemId", () => {
    it("Dovrebbe restituire l'id di ItemId passato dal costruttore", () => {

        const id = 1234567890;
        const itemId = new ItemId(id);
        // OrderItem: id, quantity
        const orderItem = new OrderItem(itemId, 10);

        expect(orderItem.getItemId()).toBe(id);
    });

     it("Dovrebbe restituire la quantity di ItemId passato dal costruttore", () => {

        const id = 1234567890;
        const itemId = new ItemId(id);
        const quantity = 23;
        // OrderItem: id, quantity
        const orderItem = new OrderItem(itemId, quantity);

        expect(orderItem.getQuantity()).toBe(quantity);
    });

});