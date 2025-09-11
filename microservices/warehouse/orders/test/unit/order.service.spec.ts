import { OrdersService } from "src/application/orders.service";

import { Orders } from "src/domain/orders.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

import { ItemId } from "src/domain/itemId.entity";

import { OrderId } from "src/domain/orderId.entity";
import { OrderState } from "src/domain/orderState.enum";

import { Test } from "@nestjs/testing";

import { OrdersRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/orders.repository.impl';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outboundEvent.adapter';

/*const id = new OrderId("12345");
const itemId = new ItemId(2);
const item = new OrderItem(itemId, 100);
const detail = new OrderItemDetail(item, 20, 10);

const mockOrdersRepository = {
    getById: jest.fn(),//.mockReturnValue(new InternalOrder(new OrderId("I-12345"), [], OrderState.PENDING, new Date(), 0, 1))
    
    getState: jest.fn(),//.mockReturnValue(OrderState.PENDING),
    getAllOrders: jest.fn(),//.mockReturnValue(new Orders([], [new OrderId("12345"), OrderState.PENDING, new Date(), 0, 1])),
    addSellOrder:jest.fn(),
    addInternalOrder: jest.fn(),
    removeById: jest.fn(),
    updateOrderState: jest.fn(),
    genUniqueId: jest.fn(),
    updateReservedStock: jest.fn(),
    getById(id: OrderId): Promise<InternalOrder | SellOrder>;
    getState(id: OrderId): Promise<OrderState>;
    getAllOrders(): Promise<Orders>;
    addSellOrder(order: SellOrder): Promise<void>;
    addInternalOrder(order: InternalOrder): Promise<void>;
    removeById(id: OrderId): Promise<boolean>;
    updateOrderState(id: OrderId, state: OrderState): Promise<InternalOrder | SellOrder>;
    genUniqueId(): Promise<OrderId>;
    updateReservedStock(id: OrderId, items: OrderItem[]): Promise<InternalOrder | SellOrder>
}

const mockOutboundEventAdapter = {
    publishInternalOrder: jest.fn(),
    publishSellOrder: jest.fn(),
    orderStateUpdated: jest.fn(), 
    orderCancelled: jest.fn(),
    orderCompleted: jest.fn()
}


describe("Test per Orders Service", () => {
let service: any;

    beforeEach( async () => {
        jest.clearAllMocks();   // Ripulisce lo stato dei mock tra un test e l’altro
        const moduleA = await Test.createTestingModule ({
            providers: [
                OrdersService,
                {
                    provide: 'ORDERSREPOSITORY',//OrdersRepositoryMongo,
                    useValue: mockOrdersRepository,
                },
                {
                    provide: OutboundEventAdapter,
                    useValue: mockOutboundEventAdapter,
                }
            ]
        }).compile();
        service = moduleA.get(OrdersService);
    })


    describe("Test per checkOrderExistence", () => {

        it("Dovrebbe restituire true quando l'ordine esiste", async () => {
            const id = new OrderId('I012345');
            mockOrdersRepository.getById.mockResolvedValueOnce({} as any);  
            await expect(service.checkOrderExistence(id)).resolves.toBe(true);
            expect(mockOrdersRepository.getById).toHaveBeenCalledWith(id);
        });

        it("Dovrebbe restituire false quando l'ordine NON esiste", async () => {
            const id = new OrderId('I012346');
            mockOrdersRepository.getById.mockResolvedValueOnce(null);             //simuli che db non c'è nessun codice con quell'ID quindi deve ritornare null
            await expect(service.checkOrderExistence(id)).resolves.toBe(false);
            expect(mockOrdersRepository.getById).toHaveBeenCalledWith(id);
        });
    });
});

*/