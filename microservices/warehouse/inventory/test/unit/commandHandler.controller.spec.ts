import { Test, TestingModule } from '@nestjs/testing';
import { CommandHandler } from '../../src/interfaces/commandHandler.controller';
import { InboundEventListener } from '../../src/infrastructure/adapters/inbound-event.adapter';
import { ProductDto } from '../../src/interfaces/dto/product.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { WarehouseIdDto } from 'src/interfaces/dto/warehouseId.dto';

describe('CommandHandler', () => {
  let controller: CommandHandler;
  let listener: InboundEventListener;

  beforeEach(async () => {
    const mockListener = {
      newStock: jest.fn(),
      removeStock: jest.fn(),
      editStock: jest.fn(),
      handleGetProduct: jest.fn(),
      getInventory: jest.fn(),
      addQuantity: jest.fn(),
      orderRequest: jest.fn(),
      shipOrderRequest: jest.fn(),
      receiveShipment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandHandler],
      providers: [
        { provide: InboundEventListener, useValue: mockListener },
      ],
    }).compile();

    controller = module.get<CommandHandler>(CommandHandler);
    listener = module.get<InboundEventListener>(InboundEventListener);
  });

  it('should handle new stock', async () => {
    const pIdDto = new ProductIdDto();
    pIdDto.id = 'p1';
    const p = new ProductDto()
    p.id = 'p1' as any,
    p.name= 'Product 1',
    p.unitPrice= 100,
    p.quantity= 5,
    p.quantityReserved= 0,
    p.minThres= 1,
    p.maxThres= 10,
    p.warehouseId= { warehouseId: 1 } as WarehouseIdDto,


    (listener.newStock as jest.Mock).mockResolvedValue(undefined);

    const result = await controller.handleNewStock(p);

    expect(listener.newStock).toHaveBeenCalledWith(expect.objectContaining({
      id: { id: 'p1' },
      name: 'Product 1',
      unitPrice: 100,
      quantity: 5,
      quantityReserved: 0,
      minThres: 1,
      maxThres: 10,
      warehouseId: { warehouseId: 1 },
    }));

    expect(result).toContain('warehouse');
  });

  it('should handle remove stock', async () => {
    const ctx = { getSubject: () => 'call.warehouse.1.stock.p1.delete' };
    (listener.removeStock as jest.Mock).mockResolvedValue(undefined);

    const result = await controller.handleRemoveStock(ctx as any);
    expect(listener.removeStock).toHaveBeenCalledWith({ id: 'p1' });
    expect(result).toContain('Product with ID p1 removed');
  });

  it('should handle edit stock', async () => {
    const ctx = { getSubject: () => 'call.warehouse.1.stock.p1.set' };
    const w = new WarehouseIdDto();
    w.warehouseId = 1;
    const payload: ProductDto = {
      id: { id: 'p1' },
      name: 'Product 1',
      unitPrice: 100,
      quantity: 10,
      quantityReserved: 0,
      minThres: 1,
      maxThres: 10,
      warehouseId: w,
    };
    (listener.editStock as jest.Mock).mockResolvedValue(undefined);

    const result = await controller.handleEditStock(payload, ctx as any);
    expect(listener.editStock).toHaveBeenCalled();
    expect(result).toContain('Product with ID p1 updated');
  });

  it('should handle get product', async () => {
    const ctx = { getSubject: () => 'get.warehouse.1.stock.p1' };
    const product = { id: 'p1', name: 'Product 1' };
    (listener.handleGetProduct as jest.Mock).mockResolvedValue(product);

    const result = await controller.handleGetProduct(ctx as any);
    expect(listener.handleGetProduct).toHaveBeenCalledWith({ id: 'p1' });
    expect(result).toContain('Product 1');
  });
});
