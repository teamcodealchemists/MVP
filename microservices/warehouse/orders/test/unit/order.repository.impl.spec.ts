import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/orders.repository.impl';
import { DataMapper } from '../../src/infrastructure/mappers/data.mapper';
import { getModelToken } from '@nestjs/mongoose';
import { OrderId } from '../../src/domain/orderId.entity';
import { OrderState } from '../../src/domain/orderState.enum';
import { InternalOrder } from '../../src/domain/internalOrder.entity';
import { SellOrder } from '../../src/domain/sellOrder.entity';
import { OrderItemDetail } from '../../src/domain/orderItemDetail.entity';
import { OrderItem } from '../../src/domain/orderItem.entity';
import { ItemId } from '../../src/domain/itemId.entity';
import { NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

// Mock dei modelli
let internalModel: any;
let sellModel: any;
let mapper: any;
let repository: OrdersRepositoryMongo;
let orderItemDetailModel: any;

describe('OrdersRepositoryMongo', () => {
  let repository: OrdersRepositoryMongo;
  let internalModel: any;
  let sellModel: any;
  let mapper: any;

 beforeEach(() => {
  internalModel = jest.fn().mockImplementation((orderData) => ({
    save: jest.fn().mockResolvedValue(undefined)
  }));
  internalModel.findOne = jest.fn();
  internalModel.findOneAndUpdate = jest.fn();
  internalModel.bulkWrite = jest.fn();
  internalModel.prototype.save = jest.fn();

  sellModel = jest.fn().mockImplementation((orderData) => ({
    save: jest.fn().mockResolvedValue(undefined)
  }));
  sellModel.findOne = jest.fn();
  sellModel.findOneAndUpdate = jest.fn();
  sellModel.prototype.save = jest.fn();

  mapper = {
    sellOrderToDomain: jest.fn(),
    internalOrderToDomain: jest.fn()
  };
  orderItemDetailModel = {};
  repository = new OrdersRepositoryMongo(internalModel, sellModel, orderItemDetailModel, mapper);
});

  describe('getById', () => {
    it('should return InternalOrder if found', async () => {
      const id = new OrderId('I1');
      

      internalModel.findOne.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({
            orderId: { id: 'I1' },
            items: [],
            orderState: OrderState.PENDING,
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: 'S1' }
          })
        })
      });

      const order = await repository.getById(id);
      expect(order).toBeInstanceOf(InternalOrder);
      expect(order.getOrderId()).toBe('I1');
    });

    it('should return SellOrder if InternalOrder not found', async () => {
      const id = new OrderId('S1');
      internalModel.findOne.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null)
        })
      });
      sellModel.findOne.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({
            orderId: { id: 'S1' },
            items: [],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: 'Via Roma'
          })
        })
      });
      
      const order = await repository.getById(id);
      expect(order).toBeInstanceOf(SellOrder);
      expect(order.getOrderId()).toBe('S1');
    });

    it('should throw NotFoundException if not found', async () => {
      const id = new OrderId('X1');
      internalModel.findOne.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null)
        })
      });
      sellModel.findOne.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(null) })
      });

      await expect(repository.getById(id)).rejects.toThrow();
    });
  });

  describe('addSellOrder', () => {
    it('should save sell order', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S1'),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        'Address1'
      );

      const saveMock = jest.fn().mockResolvedValue({});
      sellModel.prototype.save = saveMock;

      await repository.addSellOrder(sellOrder);
      expect(true).toBeTruthy();
    });
  });

  describe('addInternalOrder', () => {
    it('should save internal order', async () => {
      const internalOrder = new InternalOrder(
        new OrderId('I1'),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId('S1')
      );

      const saveMock = jest.fn().mockResolvedValue({});
      internalModel.prototype.save = saveMock;

      await repository.addInternalOrder(internalOrder);
      expect(true).toBeTruthy();
    });
  });

  describe('updateOrderState', () => {
    it('should update InternalOrder state', async () => {
      const id = new OrderId('I1');
      internalModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({
            orderId: { id: 'I1' },
            items: [],
            orderState: OrderState.COMPLETED,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: 'S1' }
          })
        })
      });

      const updated = await repository.updateOrderState(id, OrderState.COMPLETED);
      expect(updated.getOrderState()).toBe(OrderState.COMPLETED);
    });

    it('should update SellOrder state', async () => {
      const id = new OrderId('S1');
      internalModel.findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
      sellModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({
            orderId: { id: 'S1' },
            items: [],
            orderState: OrderState.COMPLETED,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: 'Addr'
          })
        })
      });

      const updated = await repository.updateOrderState(id, OrderState.COMPLETED);
      expect(updated.getOrderState()).toBe(OrderState.COMPLETED);
    });
  });

  describe('removeById', () => {
    it('should throw RpcException if COMPLETED', async () => {
      const id = new OrderId('I1');
      jest.spyOn(repository, 'getState').mockResolvedValue(OrderState.COMPLETED);
      await expect(repository.removeById(id)).rejects.toThrow(RpcException);
    });

    it('should return false if CANCELED', async () => {
      const id = new OrderId('I2');
      jest.spyOn(repository, 'getState').mockResolvedValue(OrderState.CANCELED);
      const result = await repository.removeById(id);
      expect(result).toBe(false);
    });
  });

  describe('updateReservedStock', () => {
    it('should throw error if order not found', async () => {
      const id = new OrderId('X1');
      const items: any[] = [];
      internalModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
      sellModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });

      await expect(repository.updateReservedStock(id, items)).rejects.toThrow();
    });
  });

  describe('checkReservedQuantityForSellOrder', () => {
    it('should throw error if quantity insufficient', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S1'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 10), 5, 100)],
        OrderState.PENDING,
        new Date(),
        1,
        'Addr'
      );

      sellModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue({
        orderId: { id: 'S1' },
        items: [{ item: { itemId: { id: 'i1' }, quantity: 10 }, quantityReserved: 5, unitPrice: 100 }],
        orderState: OrderState.PENDING,
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Addr'
      }) }) });

      await expect(repository.checkReservedQuantityForSellOrder(sellOrder)).rejects.toThrow();
    });
  });

  describe('checkReservedQuantityForInternalOrder', () => {
    it('should throw error if quantity insufficient', async () => {
      const internalOrder = new InternalOrder(
        new OrderId('I1'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 10), 5, 100)],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId('S1')
      );

      internalModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue({
        orderId: { id: 'I1' },
        items: [{ item: { itemId: { id: 'i1' }, quantity: 10 }, quantityReserved: 5, unitPrice: 100 }],
        orderState: OrderState.PENDING,
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S1' }
      }) }) });

      await expect(repository.checkReservedQuantityForInternalOrder(internalOrder)).rejects.toThrow();
    });
  });

});
