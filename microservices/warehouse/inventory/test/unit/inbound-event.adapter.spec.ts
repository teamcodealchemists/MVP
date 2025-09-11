import { InboundEventListener } from '../../src/infrastructure/adapters/inbound-event.adapter';
import { InventoryService } from '../../src/application/inventory.service';
import { ProductDto } from '../../src/interfaces/dto/product.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';
import { ProductQuantityDto } from '../../src/interfaces/dto/productQuantity.dto';
import { ProductQuantityArrayDto } from '../../src/interfaces/dto/productQuantityArray.dto';
import { DataMapper } from '../../src/infrastructure/mappers/dataMapper';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseIdDto } from 'src/interfaces/dto/warehouseId.dto';
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';

describe('InboundEventListener', () => {
  let listener: InboundEventListener;
  let service: jest.Mocked<InventoryService>;

  beforeEach(() => {
    service = {
      receiveStock: jest.fn(),
      addProduct: jest.fn(),
      removeProduct: jest.fn(),
      editProduct: jest.fn(),
      getProduct: jest.fn(),
      getInventory: jest.fn(),
      reserveStock: jest.fn(),
      addProductQuantity: jest.fn(),
      shipOrder: jest.fn(),
    } as unknown as jest.Mocked<InventoryService>;

    listener = new InboundEventListener(service);
  });

  it('should call addProduct when newStock is invoked', async () => {
    const idDto = new ProductIdDto();
    idDto.id = 'p1';
    const wIdDto = new WarehouseIdDto();
    wIdDto.warehouseId = 1;
    const dto: ProductDto = { id: idDto, name: 'Test', unitPrice: 100, quantity: 5, quantityReserved : 0,minThres: 1, maxThres: 10, warehouseId : wIdDto };
    await listener.newStock(dto);
    expect(service.addProduct).toHaveBeenCalledWith(DataMapper.toDomainProduct(dto));
  });

  it('should call removeProduct when removeStock is invoked', async () => {
    const dto: ProductIdDto = { id: 'p1' };
    await listener.removeStock(dto);
    expect(service.removeProduct).toHaveBeenCalledWith(DataMapper.toDomainProductId(dto));
  });

  it('should call editProduct when editStock is invoked', async () => {
    const idDto = new ProductIdDto();
    idDto.id = 'p1';
    const wIdDto = new WarehouseIdDto();
    wIdDto.warehouseId = 1;
    const dto: ProductDto = { id: idDto, name: 'Test', unitPrice: 100, quantity: 5, quantityReserved : 0,minThres: 1, maxThres: 10, warehouseId : wIdDto };
    await listener.editStock(dto);
    expect(service.editProduct).toHaveBeenCalledWith(DataMapper.toDomainProduct(dto));
  });

  it('should call getProduct when handleGetProduct is invoked', async () => {
    const dto: ProductIdDto = { id: 'p1' };
    await listener.handleGetProduct(dto);
    expect(service.getProduct).toHaveBeenCalledWith(DataMapper.toDomainProductId(dto));
  });

  it('should call getInventory when getInventory is invoked', async () => {
    await listener.getInventory();
    expect(service.getInventory).toHaveBeenCalled();
  });

  it('should call reserveStock when orderRequest is invoked', async () => {
    const idDto = new OrderIdDTO();
    idDto.id = 'o1';
    const dto: ProductQuantityArrayDto = { id: idDto, productQuantityArray: [] };
    await listener.orderRequest(dto);
    expect(service.reserveStock).toHaveBeenCalledWith(...Object.values(DataMapper.toDomainProductQuantityArray(dto)));
  });

  it('should call addProductQuantity when addQuantity is invoked', async () => {
    const idDto = new ProductIdDto();
    idDto.id = 'p1';
    const dto: ProductQuantityDto = { productId: idDto, quantity: 5 };
    await listener.addQuantity(dto);
    expect(service.addProductQuantity).toHaveBeenCalledWith(DataMapper.toDomainProductQuantity(dto));
  });

  it('should call shipOrder when shipOrderRequest is invoked', async () => {
    const idDto = new OrderIdDTO();
    idDto.id = 'o1';
    const dto: ProductQuantityArrayDto = { id: idDto, productQuantityArray: [] };
    await listener.shipOrderRequest(dto);
    expect(service.shipOrder).toHaveBeenCalledWith(...Object.values(DataMapper.toDomainProductQuantityArray(dto)));
  });

  it('should call receiveStock when receiveShipment is invoked', async () => {
    const idDto = new OrderIdDTO();
    idDto.id = 'o1';
    const dto: ProductQuantityArrayDto = { id: idDto, productQuantityArray: [] };
    await listener.receiveShipment(dto);
    const { orderId, productQuantities } = DataMapper.toDomainProductQuantityArray(dto);
    expect(service.receiveStock).toHaveBeenCalledWith(orderId, productQuantities);
  });
});
