import { DataMapper } from 'src/infrastructure/mappers/data.mapper';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { SellOrder } from 'src/domain/sellOrder.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderState } from 'src/domain/orderState.enum';
import { OrderId } from 'src/domain/orderId.entity';
import { Orders } from 'src/domain/orders.entity';
import { ItemId } from 'src/domain/itemId.entity';

import { InternalOrderDTO } from 'src/interfaces/dto/internalOrder.dto';
import { SellOrderDTO } from 'src/interfaces/dto/sellOrder.dto';
import { OrderItemDTO } from 'src/interfaces/dto/orderItem.dto';
import { OrderItemDetailDTO } from 'src/interfaces/dto/orderItemDetail.dto';
import { OrderStateDTO } from 'src/interfaces/dto/orderState.dto';
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';
import { OrdersDTO } from 'src/interfaces/dto/orders.dto';
import { OrderQuantityDTO } from 'src/interfaces/dto/orderQuantity.dto';
import { ItemIdDTO } from 'src/interfaces/dto/itemId.dto';

describe('DataMapper', () => {
  let mapper: DataMapper;

  beforeEach(() => {
    mapper = new DataMapper();
  });

  describe('DTO to Domain', () => {
    describe('internalOrderToDomain', () => {
      it('should convert InternalOrderDTO to InternalOrder', async () => {
        const dto: InternalOrderDTO = {
          orderId: { id: 'I123' },
          items: [{
            item: { itemId: { id: 1 }, quantity: 5 },
            quantityReserved: 3,
            unitPrice: 10.50
          }],
          orderState: { orderState: OrderState.PENDING },
          creationDate: new Date('2024-01-01'),
          warehouseDeparture: 1,
          warehouseDestination: 2,
          sellOrderReference: { id: 'S456' }
        };

        const result = await mapper.internalOrderToDomain(dto);

        expect(result).toBeInstanceOf(InternalOrder);
        expect(result.getOrderId()).toBe('I123');
        expect(result.getWarehouseDeparture()).toBe(1);
        expect(result.getWarehouseDestination()).toBe(2);
        expect(result.getSellOrderReference().getId()).toBe('S456');
      });

      it('should throw error when departure and destination warehouses are the same', async () => {
        const dto: InternalOrderDTO = {
          orderId: { id: 'I123' },
          items: [],
          orderState: { orderState: OrderState.PENDING },
          creationDate: new Date(),
          warehouseDeparture: 1,
          warehouseDestination: 1, // Same as departure
          sellOrderReference: { id: 'S456' }
        };

        await expect(mapper.internalOrderToDomain(dto))
          .rejects.toThrow('Il magazzino di partenza (1) non può essere uguale alla destinazione');
      });
    });

    describe('sellOrderToDomain', () => {
      it('should convert SellOrderDTO to SellOrder', async () => {
        const dto: SellOrderDTO = {
          orderId: { id: 'S123' },
          items: [{
            item: { itemId: { id: 1 }, quantity: 5 },
            quantityReserved: 3,
            unitPrice: 10.50
          }],
          orderState: { orderState: OrderState.PENDING },
          creationDate: new Date('2024-01-01'),
          warehouseDeparture: 1,
          destinationAddress: 'Via Roma 123'
        };

        const result = await mapper.sellOrderToDomain(dto);

        expect(result).toBeInstanceOf(SellOrder);
        expect(result.getOrderId()).toBe('S123');
        expect(result.getWarehouseDeparture()).toBe(1);
        expect(result.getDestinationAddress()).toBe('Via Roma 123');
      });
    });

    describe('orderItemToDomain', () => {
      it('should convert OrderItemDTO to OrderItem', async () => {
        const dto: OrderItemDTO = {
          itemId: { id: 1 },
          quantity: 5
        };

        const result = await mapper.orderItemToDomain(dto);

        expect(result).toBeInstanceOf(OrderItem);
        expect(result.getItemId().getId()).toBe(1);
        expect(result.getQuantity()).toBe(5);
      });
    });

    describe('orderIdToDomain', () => {
      it('should convert OrderIdDTO to OrderId', async () => {
        const dto: OrderIdDTO = { id: 'I123' };

        const result = await mapper.orderIdToDomain(dto);

        expect(result).toBeInstanceOf(OrderId);
        expect(result.getId()).toBe('I123');
      });
    });

    describe('sellOrderReferenceToDomain', () => {
      it('should convert OrderIdDTO to OrderId for sell order reference', async () => {
        const dto: OrderIdDTO = { id: 'S456' };

        const result = await mapper.sellOrderReferenceToDomain(dto);

        expect(result).toBeInstanceOf(OrderId);
        expect(result.getId()).toBe('S456');
      });
    });

    describe('orderStateToDomain', () => {
      it('should convert valid OrderStateDTO to OrderState', async () => {
        const dto: OrderStateDTO = { orderState: OrderState.PENDING };

        const result = await mapper.orderStateToDomain(dto);

        expect(result).toBe(OrderState.PENDING);
      });

      it('should throw error for invalid OrderState', async () => {
        const dto: OrderStateDTO = { orderState: 'INVALID_STATE' as any };

        await expect(mapper.orderStateToDomain(dto))
          .rejects.toThrow('Mapper: Stato ordine non valido: INVALID_STATE');
      });
    });

    describe('orderItemDetailToDomain', () => {
      it('should convert OrderItemDetailDTO to OrderItemDetail', async () => {
        const dto: OrderItemDetailDTO = {
          item: { itemId: { id: 1 }, quantity: 5 },
          quantityReserved: 3,
          unitPrice: 10.50
        };

        const result = await mapper.orderItemDetailToDomain(dto);

        expect(result).toBeInstanceOf(OrderItemDetail);
        expect(result.getItem().getItemId().getId()).toBe(1);
        expect(result.getItem().getQuantity()).toBe(5);
        expect(result.getQuantityReserved()).toBe(3);
        expect(result.getUnitPrice()).toBe(10.50);
      });

      it('should throw error when quantityReserved > quantity', async () => {
        const dto: OrderItemDetailDTO = {
          item: { itemId: { id: 1 }, quantity: 5 },
          quantityReserved: 6, // Greater than quantity
          unitPrice: 10.50
        };

        await expect(mapper.orderItemDetailToDomain(dto))
          .rejects.toThrow('Quantità riservata (6) maggiore della quantità ordinata (5)');
      });
    });
  });

  describe('Domain to DTO', () => {
    describe('internalOrderToDTO', () => {
      it('should convert InternalOrder to InternalOrderDTO', async () => {
        const entity = new InternalOrder(
          new OrderId('I123'),
          [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10.50)],
          OrderState.PENDING,
          new Date('2024-01-01'),
          1,
          2,
          new OrderId('S456')
        );

        const result = await mapper.internalOrderToDTO(entity);

        expect(result.orderId.id).toBe('I123');
        expect(result.warehouseDeparture).toBe(1);
        expect(result.warehouseDestination).toBe(2);
        expect(result.sellOrderReference.id).toBe('S456');
        expect(result.items).toHaveLength(1);
        expect(result.items[0].item.itemId.id).toBe(1);
      });
    });

    describe('sellOrderToDTO', () => {
      it('should convert SellOrder to SellOrderDTO', async () => {
        const entity = new SellOrder(
          new OrderId('S123'),
          [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10.50)],
          OrderState.PENDING,
          new Date('2024-01-01'),
          1,
          'Via Roma 123'
        );

        const result = await mapper.sellOrderToDTO(entity);

        expect(result.orderId.id).toBe('S123');
        expect(result.warehouseDeparture).toBe(1);
        expect(result.destinationAddress).toBe('Via Roma 123');
        expect(result.items).toHaveLength(1);
        expect(result.items[0].item.itemId.id).toBe(1);
      });
    });

    describe('orderItemToDTO', () => {
      it('should convert OrderItem to OrderItemDTO', async () => {
        const entity = new OrderItem(new ItemId(1), 5);

        const result = await mapper.orderItemToDTO(entity);

        expect(result.itemId.id).toBe(1);
        expect(result.quantity).toBe(5);
      });
    });

    describe('orderIdToDTO', () => {
      it('should convert OrderId to OrderIdDTO', async () => {
        const entity = new OrderId('I123');

        const result = await mapper.orderIdToDTO(entity);

        expect(result.id).toBe('I123');
      });
    });

    describe('sellOrderReferenceToDTO', () => {
      it('should convert OrderId to OrderIdDTO for sell order reference', async () => {
        const entity = new OrderId('S456');

        const result = await mapper.sellOrderReferenceToDTO(entity);

        expect(result.id).toBe('S456');
      });
    });

    describe('orderStateToDTO', () => {
      it('should convert OrderState to OrderStateDTO', async () => {
        const result = await mapper.orderStateToDTO(OrderState.PENDING);

        expect(result.orderState).toBe(OrderState.PENDING);
      });

      it('should handle all OrderState values', async () => {
        const states = Object.values(OrderState);
        
        for (const state of states) {
          const result = await mapper.orderStateToDTO(state);
          expect(result.orderState).toBe(state);
        }
      });
    });

    describe('orderItemDetailToDTO', () => {
      it('should convert OrderItemDetail to OrderItemDetailDTO', async () => {
        const entity = new OrderItemDetail(
          new OrderItem(new ItemId(1), 5),
          3,
          10.50
        );

        const result = await mapper.orderItemDetailToDTO(entity);

        expect(result.item.itemId.id).toBe(1);
        expect(result.item.quantity).toBe(5);
        expect(result.quantityReserved).toBe(3);
        expect(result.unitPrice).toBe(10.50);
      });
    });

    describe('orderQuantityToDTO', () => {
      it('should convert OrderId and OrderItem[] to OrderQuantityDTO', async () => {
        const orderId = new OrderId('I123');
        const items = [new OrderItem(new ItemId(1), 5)];

        const result = await mapper.orderQuantityToDTO(orderId, items);

        expect(result.id.id).toBe('I123');
        expect(result.items).toHaveLength(1);
        expect(result.items[0].itemId.id).toBe(1);
        expect(result.items[0].quantity).toBe(5);
      });

      it('should handle empty items array', async () => {
        const orderId = new OrderId('I123');
        const items: OrderItem[] = [];

        const result = await mapper.orderQuantityToDTO(orderId, items);

        expect(result.id.id).toBe('I123');
        expect(result.items).toHaveLength(0);
      });
    });

    describe('ordersToDTO', () => {
      it('should convert Orders to OrdersDTO', async () => {
        const sellOrder = new SellOrder(
          new OrderId('S123'),
          [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10.50)],
          OrderState.PENDING,
          new Date('2024-01-01'),
          1,
          'Via Roma 123'
        );

        const internalOrder = new InternalOrder(
          new OrderId('I123'),
          [new OrderItemDetail(new OrderItem(new ItemId(2), 3), 2, 15.75)],
          OrderState.PROCESSING,
          new Date('2024-01-02'),
          1,
          2,
          new OrderId('S456')
        );

        const orders = new Orders([sellOrder], [internalOrder]);

        const result = await mapper.ordersToDTO(orders);

        expect(result.sellOrders).toHaveLength(1);
        expect(result.internalOrders).toHaveLength(1);
        expect(result.sellOrders[0].orderId.id).toBe('S123');
        expect(result.internalOrders[0].orderId.id).toBe('I123');
      });

      it('should handle empty orders', async () => {
        const orders = new Orders([], []);

        const result = await mapper.ordersToDTO(orders);

        expect(result.sellOrders).toHaveLength(0);
        expect(result.internalOrders).toHaveLength(0);
      });

      it('should handle conversion errors in sell orders', async () => {
        // Mock console.error to avoid test output pollution
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Create a mock sell order that will cause conversion error
        const invalidSellOrder = {
          getSellOrders: () => [{}], // Invalid order object
          getInternalOrders: () => []
        } as unknown as Orders;

        // Mock sellOrderToDTO to throw error
        jest.spyOn(mapper, 'sellOrderToDTO').mockRejectedValue(new Error('Conversion error'));

        await expect(mapper.ordersToDTO(invalidSellOrder))
          .rejects.toThrow('Conversion error');

        consoleErrorSpy.mockRestore();
      });

      it('should handle conversion errors in internal orders', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const invalidInternalOrder = {
          getSellOrders: () => [],
          getInternalOrders: () => [{}] // Invalid order object
        } as unknown as Orders;

        jest.spyOn(mapper, 'internalOrderToDTO').mockRejectedValue(new Error('Conversion error'));

        await expect(mapper.ordersToDTO(invalidInternalOrder))
          .rejects.toThrow('Conversion error');

        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null/undefined values in DTO to Domain conversion', async () => {
      // Test with minimal valid DTO
      const minimalDto: InternalOrderDTO = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: OrderState.PENDING },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      const result = await mapper.internalOrderToDomain(minimalDto);
      expect(result).toBeInstanceOf(InternalOrder);
    });

    it('should handle different OrderState values', async () => {
      const states = Object.values(OrderState);
      
      for (const state of states) {
        const dto: OrderStateDTO = { orderState: state };
        const result = await mapper.orderStateToDomain(dto);
        expect(result).toBe(state);
      }
    });

    it('should handle zero values in orderItemDetailToDomain', async () => {
      const dto: OrderItemDetailDTO = {
        item: { itemId: { id: 1 }, quantity: 0 },
        quantityReserved: 0,
        unitPrice: 0
      };

      const result = await mapper.orderItemDetailToDomain(dto);
      expect(result.getQuantityReserved()).toBe(0);
      expect(result.getUnitPrice()).toBe(0);
    });

    it('should handle decimal values in unitPrice', async () => {
      const entity = new OrderItemDetail(
        new OrderItem(new ItemId(1), 5),
        3,
        12.3456
      );

      const result = await mapper.orderItemDetailToDTO(entity);
      expect(result.unitPrice).toBe(12.3456);
    });
  });

  describe('Integration tests', () => {
    it('should perform round-trip conversion for InternalOrder', async () => {
      const originalDto: InternalOrderDTO = {
        orderId: { id: 'I123' },
        items: [{
          item: { itemId: { id: 1 }, quantity: 5 },
          quantityReserved: 3,
          unitPrice: 10.50
        }],
        orderState: { orderState: OrderState.PENDING },
        creationDate: new Date('2024-01-01'),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      // DTO -> Domain
      const domainEntity = await mapper.internalOrderToDomain(originalDto);
      
      // Domain -> DTO
      const resultDto = await mapper.internalOrderToDTO(domainEntity);

      expect(resultDto.orderId.id).toBe(originalDto.orderId.id);
      expect(resultDto.warehouseDeparture).toBe(originalDto.warehouseDeparture);
      expect(resultDto.warehouseDestination).toBe(originalDto.warehouseDestination);
      expect(resultDto.sellOrderReference.id).toBe(originalDto.sellOrderReference.id);
      expect(resultDto.items[0].item.itemId.id).toBe(originalDto.items[0].item.itemId.id);
    });

    it('should perform round-trip conversion for SellOrder', async () => {
      const originalDto: SellOrderDTO = {
        orderId: { id: 'S123' },
        items: [{
          item: { itemId: { id: 1 }, quantity: 5 },
          quantityReserved: 3,
          unitPrice: 10.50
        }],
        orderState: { orderState: OrderState.PENDING },
        creationDate: new Date('2024-01-01'),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma 123'
      };

      const domainEntity = await mapper.sellOrderToDomain(originalDto);
      const resultDto = await mapper.sellOrderToDTO(domainEntity);

      expect(resultDto.orderId.id).toBe(originalDto.orderId.id);
      expect(resultDto.destinationAddress).toBe(originalDto.destinationAddress);
      expect(resultDto.items[0].item.itemId.id).toBe(originalDto.items[0].item.itemId.id);
    });
  });
});