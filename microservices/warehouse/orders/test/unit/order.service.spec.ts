import { OrdersService } from "src/application/orders.service";

import { Orders } from "src/domain/orders.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

import { ItemId } from "src/domain/itemId.entity";

import { OrderId } from "src/domain/orderId.entity";
import { OrderState } from "src/domain/orderState.enum";

import { Test } from "@nestjs/testing";

import { OrdersRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/orders.repository.impl';

/*const id = new OrderId("12345");
const itemId = new ItemId(2);
const item = new OrderItem(itemId, 100);
const detail = new OrderItemDetail(item, 20, 10);*/

const mockOrdersRepository = {
    getById: jest.fn().mockReturnValue(new InternalOrder(new OrderId("I-12345"), [], OrderState.PENDING, new Date(), 0, 1))
    /*getState: jest.fn().mockReturnValue(OrderState.PENDING),
    getAllOrders: jest.fn().mockReturnValue(new Orders([], [new OrderId("12345"), OrderState.PENDING, new Date(), 0, 1])),
    addSellOrder:jest.fn(),
    addInternalOrder: jest.fn(),
    removeById: jest.fn(),
    updateOrderState: jest.fn(),
    genUniqueId: jest.fn(),
    updateReservedStock: jest.fn()

    getById(id: OrderId): Promise<InternalOrder | SellOrder>;
    getState(id: OrderId): Promise<OrderState>;
    getAllOrders(): Promise<Orders>;
    addSellOrder(order: SellOrder): Promise<void>;
    addInternalOrder(order: InternalOrder): Promise<void>;
    removeById(id: OrderId): Promise<boolean>;
    updateOrderState(id: OrderId, state: OrderState): Promise<InternalOrder | SellOrder>;
    genUniqueId(): Promise<OrderId>;
    updateReservedStock(id: OrderId, items: OrderItem[]): Promise<InternalOrder | SellOrder>*/
}


describe("Test per Orders Service", () => {
let repo: OrdersRepositoryMongo;
let service: any;

    beforeEach( async () => {
        const moduleA = await Test.createTestingModule ({
            providers: [OrdersService, {
                provide: OrdersRepositoryMongo,
                useValue: mockOrdersRepository,
                }]
        }).compile();
        service = moduleA.get(OrdersService);
        repo = moduleA.get(OrdersRepositoryMongo);
    })


    describe("Test per checkOrderExistence", () => {

        it("Dovrebbe restituire false/true in base a se l'ordine esiste o meno", async () => {
            const id = new OrderId("I-012345");
            jest.spyOn(repo, "getById").mockResolvedValueOnce({} as any);
/*             const result = await service.checkOrderExistence(id);
 */
            await expect (service.checkOrderExistence(id)).resolves.toBe(false);
            expect(repo.getById).toHaveBeenCalledWith(id);
/*             expect(result).toBe(true);
 */        });

    });
});

