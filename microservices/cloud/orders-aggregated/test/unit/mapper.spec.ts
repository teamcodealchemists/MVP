import { CloudDataMapper } from '../../src/infrastructure/mappers/cloud.data.mapper';
import { SyncInternalOrder } from '../../src/domain/syncInternalOrder.entity';
import { SyncSellOrder } from '../../src/domain/syncSellOrder.entity';
import { SyncOrderItem } from '../../src/domain/syncOrderItem.entity';
import { SyncOrderItemDetail } from '../../src/domain/syncOrderItemDetail.entity';
import { SyncOrderState } from '../../src/domain/syncOrderState.enum';
import { SyncOrderId } from '../../src/domain/syncOrderId.entity';
import { SyncOrders } from '../../src/domain/syncOrders.entity';
import { SyncItemId } from '../../src/domain/syncItemId.entity';

describe('CloudDataMapper', () => {
  let mapper: CloudDataMapper;

  beforeEach(() => {
    mapper = new CloudDataMapper();
  });

  it('syncOrderIdToDomain converte correttamente', async () => {
    const dto = { id: 'O-1' };
    const result = await mapper.syncOrderIdToDomain(dto);
    expect(result).toBeInstanceOf(SyncOrderId);
    expect(result.getId()).toBe('O-1');
  });

  it('syncOrderStateToDomain accetta solo stati validi', async () => {
    const dto = { orderState: SyncOrderState.PENDING };
    const result = await mapper.syncOrderStateToDomain(dto);
    expect(result).toBe(SyncOrderState.PENDING);

    await expect(mapper.syncOrderStateToDomain({ orderState: 'INVALIDO' }))
      .rejects.toThrow(/Stato ordine non valido/);
  });

  it('syncOrderItemToDomain converte correttamente', async () => {
    const dto = { itemId: { id: 1 }, quantity: 5 };
    const result = await mapper.syncOrderItemToDomain(dto);
    expect(result).toBeInstanceOf(SyncOrderItem);
    expect(result.getItemId().getId()).toBe(1);
    expect(result.getQuantity()).toBe(5);
  });

  it('syncOrderItemDetailToDomain valida la quantità riservata', async () => {
    const dto = {
      item: { itemId: { id: 1 }, quantity: 5 },
      quantityReserved: 3,
      unitPrice: 10
    };
    const result = await mapper.syncOrderItemDetailToDomain(dto);
    expect(result).toBeInstanceOf(SyncOrderItemDetail);

    // quantityReserved > quantity
    const invalidDto = {
      item: { itemId: { id: 1 }, quantity: 2 },
      quantityReserved: 5,
      unitPrice: 10
    };
    await expect(mapper.syncOrderItemDetailToDomain(invalidDto))
      .rejects.toThrow(/Quantità riservata/);
  });

  it('syncInternalOrderToDomain valida magazzini diversi', async () => {
    const dto = {
      orderId: { id: 'O-2' },
      items: [],
      orderState: { orderState: SyncOrderState.PENDING },
      creationDate: new Date('2024-01-01'),
      warehouseDeparture: 1,
      warehouseDestination: 2,
      sellOrderReference: { id: 'O-1' }
    };
    const result = await mapper.syncInternalOrderToDomain(dto);
    expect(result).toBeInstanceOf(SyncInternalOrder);

    // magazzini uguali
    const invalidDto = { ...dto, warehouseDeparture: 1, warehouseDestination: 1 };
    await expect(mapper.syncInternalOrderToDomain(invalidDto))
      .rejects.toThrow(/magazzino di partenza/);
  });

  it('syncSellOrderToDomain converte correttamente', async () => {
    const dto = {
      orderId: { id: 'O-3' },
      items: [],
      orderState: { orderState: SyncOrderState.PENDING },
      creationDate: new Date('2024-01-01'),
      warehouseDeparture: 1,
      destinationAddress: 'Via Roma'
    };
    const result = await mapper.syncSellOrderToDomain(dto);
    expect(result).toBeInstanceOf(SyncSellOrder);
  });

  it('syncOrderIdToDTO converte correttamente', async () => {
    const entity = new SyncOrderId('O-4');
    const result = await mapper.syncOrderIdToDTO(entity);
    expect(result).toEqual({ id: 'O-4' });
  });

  it('syncOrderStateToDTO converte correttamente', async () => {
    const result = await mapper.syncOrderStateToDTO(SyncOrderState.PENDING);
    expect(result).toEqual({ orderState: SyncOrderState.PENDING });
  });

  it('syncOrderItemToDTO converte correttamente', async () => {
    const entity = new SyncOrderItem(new SyncItemId(1), 5);
    const result = await mapper.syncOrderItemToDTO(entity);
    expect(result).toEqual({ itemId: { id: 1 }, quantity: 5 });
  });

  it('syncOrderItemDetailToDTO converte correttamente', async () => {
    const entity = new SyncOrderItemDetail(new SyncOrderItem(new SyncItemId(1), 5), 3, 10);
    const result = await mapper.syncOrderItemDetailToDTO(entity);
    expect(result).toEqual({
      item: { itemId: { id: 1 }, quantity: 5 },
      quantityReserved: 3,
      unitPrice: 10
    });
  });

  it('syncInternalOrderToDTO converte correttamente', async () => {
    const entity = new SyncInternalOrder(
      new SyncOrderId('O-5'),
      [],
      SyncOrderState.PENDING,
      new Date('2024-01-01'),
      1,
      2,
      new SyncOrderId('O-1')
    );
    const result = await mapper.syncInternalOrderToDTO(entity);
    expect(result.orderId).toEqual({ id: 'O-5' });
    expect(result.warehouseDeparture).toBe(1);
    expect(result.warehouseDestination).toBe(2);
  });

  it('syncSellOrderToDTO converte correttamente', async () => {
    const entity = new SyncSellOrder(
      new SyncOrderId('O-6'),
      [],
      SyncOrderState.PENDING,
      new Date('2024-01-01'),
      1,
      'Via Roma'
    );
    const result = await mapper.syncSellOrderToDTO(entity);
    expect(result.orderId).toEqual({ id: 'O-6' });
    expect(result.warehouseDeparture).toBe(1);
    expect(result.destinationAddress).toBe('Via Roma');
  });

  it('syncOrdersToDTO converte una collezione di ordini', async () => {
    const orders = new SyncOrders([
      new SyncSellOrder(
        new SyncOrderId('O-7'),
        [],
        SyncOrderState.PENDING,
        new Date('2024-01-01'),
        1,
        'Via Roma'
      )
    ], [
      new SyncInternalOrder(
        new SyncOrderId('O-8'),
        [],
        SyncOrderState.PENDING,
        new Date('2024-01-01'),
        1,
        2,
        new SyncOrderId('O-1')
      )
    ]);
    const result = await mapper.syncOrdersToDTO(orders);
    expect(result.sellOrders[0].orderId).toEqual({ id: 'O-7' });
    expect(result.internalOrders[0].orderId).toEqual({ id: 'O-8' });
  });
});