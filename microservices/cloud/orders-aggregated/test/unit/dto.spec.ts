import 'reflect-metadata';
import { validate } from 'class-validator';

import { SyncOrderIdDTO } from '../../src/interfaces/dto/syncOrderId.dto';
import { SyncOrderItemDTO } from '../../src/interfaces/dto/syncOrderItem.dto';
import { SyncItemIdDTO } from '../../src/interfaces/dto/syncItemId.dto';
import { SyncOrderItemDetailDTO } from '../../src/interfaces/dto/syncOrderItemDetail.dto';
import { SyncOrderStateDTO } from '../../src/interfaces/dto/syncOrderState.dto';
import { SyncSellOrderDTO } from '../../src/interfaces/dto/syncSellOrder.dto';
import { SyncInternalOrderDTO } from '../../src/interfaces/dto/syncInternalOrder.dto';
import { SyncOrderQuantityDTO } from '../../src/interfaces/dto/syncOrderQuantity.dto';
import { SyncOrdersDTO } from '../../src/interfaces/dto/syncOrders.dto';

describe('DTO validation', () => {
  it('SyncOrderIdDTO valido', async () => {
    const dto = new SyncOrderIdDTO();
    dto.id = 'O-1';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncOrderIdDTO non valido', async () => {
    const dto = new SyncOrderIdDTO();
    // manca id
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncItemIdDTO valido', async () => {
    const dto = new SyncItemIdDTO();
    dto.id = 1;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncItemIdDTO non valido', async () => {
    const dto = new SyncItemIdDTO();
    dto.id = -1;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncOrderItemDTO valido', async () => {
    const dto = new SyncOrderItemDTO();
    dto.itemId = { id: 1 };
    dto.quantity = 5;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncOrderItemDTO non valido', async () => {
    const dto = new SyncOrderItemDTO();
    dto.itemId = {} as SyncItemIdDTO;
    dto.quantity = -2;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncOrderItemDetailDTO valido', async () => {
    const dto = new SyncOrderItemDetailDTO();
    dto.item = { itemId: { id: 1 }, quantity: 5 };
    dto.quantityReserved = 3;
    dto.unitPrice = 10.5;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncOrderItemDetailDTO non valido', async () => {
    const dto = new SyncOrderItemDetailDTO();
    dto.item = {} as SyncOrderItemDTO;
    dto.quantityReserved = -1;
    dto.unitPrice = -5;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncOrderStateDTO valido', async () => {
    const dto = new SyncOrderStateDTO();
    dto.orderState = 'CREATO';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncOrderStateDTO non valido', async () => {
    const dto = new SyncOrderStateDTO();
    // manca orderState
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncSellOrderDTO valido', async () => {
    const dto = new SyncSellOrderDTO();
    dto.orderId = new SyncOrderIdDTO();
    dto.orderId.id = 'O-1';
    const itemDetail = new SyncOrderItemDetailDTO();
    itemDetail.item = new SyncOrderItemDTO();
    itemDetail.item.itemId = new SyncItemIdDTO();
    itemDetail.item.itemId.id = 1;
    itemDetail.item.quantity = 5;
    itemDetail.quantityReserved = 3;
    itemDetail.unitPrice = 10;
    dto.items = [itemDetail];
    dto.orderState = new SyncOrderStateDTO();
    dto.orderState.orderState = 'PENDING';
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1;
    dto.destinationAddress = 'Via Roma';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncSellOrderDTO non valido', async () => {
    const dto = new SyncSellOrderDTO();
    // manca tutto
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncInternalOrderDTO valido', async () => {
    const dto = new SyncInternalOrderDTO();
    dto.orderId = new SyncOrderIdDTO();
    dto.orderId.id = 'O-2';
    const itemDetail = new SyncOrderItemDetailDTO();
    itemDetail.item = new SyncOrderItemDTO();
    itemDetail.item.itemId = new SyncItemIdDTO();
    itemDetail.item.itemId.id = 1;
    itemDetail.item.quantity = 5;
    itemDetail.quantityReserved = 3;
    itemDetail.unitPrice = 10;
    dto.items = [itemDetail];
    dto.orderState = new SyncOrderStateDTO();
    dto.orderState.orderState = 'PENDING';
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1;
    dto.warehouseDestination = 2;
    dto.sellOrderReference = new SyncOrderIdDTO();
    dto.sellOrderReference.id = 'O-1';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncInternalOrderDTO non valido', async () => {
    const dto = new SyncInternalOrderDTO();
    // manca tutto
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('SyncOrderQuantityDTO valido', async () => {
    const dto = new SyncOrderQuantityDTO();
    dto.id = new SyncOrderIdDTO();
    dto.id.id = 'O-3';
    const item = new SyncOrderItemDTO();
    item.itemId = new SyncItemIdDTO();
    item.itemId.id = 1;
    item.quantity = 5;
    dto.items = [item];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('SyncOrderQuantityDTO non valido', async () => {
    const dto = new SyncOrderQuantityDTO();
    // manca tutto
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

    it('SyncOrdersDTO valido', async () => {
    const dto = new SyncOrdersDTO();

    // SellOrder
    const sellOrder = new SyncSellOrderDTO();
    sellOrder.orderId = new SyncOrderIdDTO();
    sellOrder.orderId.id = 'O-1';
    const sellItemDetail = new SyncOrderItemDetailDTO();
    sellItemDetail.item = new SyncOrderItemDTO();
    sellItemDetail.item.itemId = new SyncItemIdDTO();
    sellItemDetail.item.itemId.id = 1;
    sellItemDetail.item.quantity = 5;
    sellItemDetail.quantityReserved = 3;
    sellItemDetail.unitPrice = 10;
    sellOrder.items = [sellItemDetail];
    sellOrder.orderState = new SyncOrderStateDTO();
    sellOrder.orderState.orderState = 'CREATO';
    sellOrder.creationDate = new Date();
    sellOrder.warehouseDeparture = 1;
    sellOrder.destinationAddress = 'Via Roma';

    // InternalOrder
    const internalOrder = new SyncInternalOrderDTO();
    internalOrder.orderId = new SyncOrderIdDTO();
    internalOrder.orderId.id = 'O-2';
    const internalItemDetail = new SyncOrderItemDetailDTO();
    internalItemDetail.item = new SyncOrderItemDTO();
    internalItemDetail.item.itemId = new SyncItemIdDTO();
    internalItemDetail.item.itemId.id = 1;
    internalItemDetail.item.quantity = 5;
    internalItemDetail.quantityReserved = 3;
    internalItemDetail.unitPrice = 10;
    internalOrder.items = [internalItemDetail];
    internalOrder.orderState = new SyncOrderStateDTO();
    internalOrder.orderState.orderState = 'CREATO';
    internalOrder.creationDate = new Date();
    internalOrder.warehouseDeparture = 1;
    internalOrder.warehouseDestination = 2;
    internalOrder.sellOrderReference = new SyncOrderIdDTO();
    internalOrder.sellOrderReference.id = 'O-1';

    dto.sellOrders = [sellOrder];
    dto.internalOrders = [internalOrder];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    });

  it('SyncOrdersDTO non valido', async () => {
    const dto = new SyncOrdersDTO();
    // manca tutto
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});