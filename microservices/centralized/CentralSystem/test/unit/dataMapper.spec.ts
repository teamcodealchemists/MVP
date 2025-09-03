import { DataMapper } from '../../src/infrastructure/mappers/dataMapper';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { Inventory } from '../../src/domain/inventory.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { warehouseIdDto } from '../../src/interfaces/http/dto/warehouseId.dto';
import { InternalOrderDTO } from '../../src/interfaces/http/dto/internalOrder.dto';
import { OrderIdDTO } from '../../src/interfaces/http/dto/orderId.dto';
import { OrderItemDTO } from '../../src/interfaces/http/dto/orderItem.dto';
import { OrderItemDetailDTO } from '../../src/interfaces/http/dto/orderItemDetail.dto';
import { OrderState } from '../../src/domain/orderState.enum';
import { productIdDto } from 'src/interfaces/http/dto/productId.dto';
import { InternalOrder } from "../../src/domain/internalOrder.entity";
import { SellOrder } from "../../src/domain/sellOrder.entity";
import { OrderItem } from "../../src/domain/orderItem.entity";
import { OrderItemDetail } from "../../src/domain/orderItemDetail.entity";
import { OrderId } from "../../src/domain/orderId.entity";
import { ItemId } from "../../src/domain/itemId.entity";
describe('DataMapper specific methods', () => {
  it('toDomainProduct should map productDto to Product', () => {
    const pDto = new productIdDto();
    pDto.id = "1";
    const wDto = new warehouseIdDto();
    wDto.warehouseId = 99;
    const dto = {
      id: pDto ,
      name: 'Test Product',
      unitPrice: 10,
      quantity: 5,
      minThres: 1,
      maxThres: 50,
      warehouseId: wDto,
    };
    const product = DataMapper.toDomainProduct(dto);
    expect(product).toBeInstanceOf(Product);
    expect(product.getName()).toBe('Test Product');
    expect(product.getQuantity()).toBe(5);
    expect(product.getIdWarehouse()).toBe(99);
  });

  it('toDtoProduct should map Product to productDto', () => {
    const product = new Product(
      new ProductId("1"),
      'Dto Product',
      20,
      10,
      2,
      100,
      new WarehouseId(200),
    );
    const dto = DataMapper.toDtoProduct(product);
    expect(dto.name).toBe('Dto Product');
    expect(dto.unitPrice).toBe(20);
    expect(dto.quantity).toBe(10);
    expect(dto.warehouseId.warehouseId).toBe(200);
  });

  it('toDTO should map WarehouseId to warehouseIdDto', () => {
    const dto = DataMapper.toDTO(new WarehouseId(123));
    expect(dto).toEqual<warehouseIdDto>({ warehouseId: 123 });
  });

  it('internalOrderToDomain should throw if warehouseDeparture = warehouseDestination', async () => {
    const dto: InternalOrderDTO = {
      orderId: { id: 'I1' },
      items: [],
      orderState: { orderState: OrderState.PENDING },
      creationDate: new Date(),
      warehouseDeparture: 1,
      warehouseDestination: 1,
    };
    await expect(DataMapper.internalOrderToDomain(dto)).rejects.toThrow(
      /magazzino di partenza.*non può essere uguale/,
    );
  });

  it('orderIdToDomain should throw on invalid format', async () => {
    const badDto: OrderIdDTO = { id: 'X999' };
    await expect(DataMapper.orderIdToDomain(badDto)).rejects.toThrow(
      /Formato OrderId non valido/,
    );
  });

  it('orderStateToDomain should throw on invalid state', async () => {
    const bad = { orderState: 'INVALID' } as any;
    await expect(DataMapper.orderStateToDomain(bad)).rejects.toThrow(
      /Stato ordine non valido/,
    );
  });

  it('orderItemDetailToDomain should throw if reserved > ordered', async () => {
    const dto: OrderItemDetailDTO = {
      item: { itemId: { id: 1 }, quantity: 2 },
      quantityReserved: 5,
      unitPrice: 10,
    };
    await expect(DataMapper.orderItemDetailToDomain(dto)).rejects.toThrow(
      /Quantità riservata.*maggiore/,
    );
  });

  it('orderQuantityToDomain should map DTO to domain', async () => {
    const dto = {
      id: { id: 'I123' },
      items: [{ itemId: { id: 10 }, quantity: 2 }],
    };
    const domain = await DataMapper.orderQuantityToDomain(dto);
    expect(domain.getId()).toBe('I123');
    expect(domain.getItemId()[0].getItemId()).toBe(10);
  });

  it('warehouseIdToDomain should throw if invalid', () => {
    const dto = { warehouseId: NaN };
    expect(() => DataMapper.warehouseIdToDomain(dto)).toThrow(
      /WarehouseId non valido/,
    );
  });

  it('warehouseStatetoDto should map WarehouseState to DTO', () => {
    const warehouseState = new (class extends WarehouseId {
      constructor() {
        super(1);
      }
    })();
    const domain = {
      getState: () => 'OPEN',
      getId: () => 1,
    } as any;
    const dto = DataMapper.warehouseStatetoDto(domain);
    expect(dto.state).toBe('OPEN');
    expect(dto.warehouseId.warehouseId).toBe(1);
  });

  it("toDomainProduct should map productDto to Product", () => {
    const pDto = new productIdDto();
    pDto.id = "1";
    const dto = {
      id: pDto,
      name: "Test Product",
      unitPrice: 10,
      quantity: 5,
      minThres: 1,
      maxThres: 50,
      warehouseId: { warehouseId: 99 },
    };
    const product = DataMapper.toDomainProduct(dto);
    expect(product).toBeInstanceOf(Product);
    expect(product.getName()).toBe("Test Product");
    expect(product.getQuantity()).toBe(5);
    expect(product.getIdWarehouse()).toBe(99);
  });

  it("toDtoProduct should map Product to productDto", () => {
    const product = new Product(
      new ProductId("p1"),
      "Prodotto A",
      20,
      10,
      2,
      100,
      new WarehouseId(77)
    );
    const dto = DataMapper.toDtoProduct(product);
    expect(dto.id.id).toBe("p1");
    expect(dto.name).toBe("Prodotto A");
    expect(dto.unitPrice).toBe(20);
    expect(dto.quantity).toBe(10);
    expect(dto.warehouseId.warehouseId).toBe(77);
  });

  it("toBelowMinDTO should map Product to belowMinThresDto", () => {
    const product = new Product(
      new ProductId("p2"),
      "Prodotto B",
      5,
      3,
      10,
      50,
      new WarehouseId(10)
    );
    const dto = DataMapper.toBelowMinDTO(product);
    expect(dto.id).toBe("p2");
    expect(dto.quantity).toBe(3);
    expect(dto.minThres).toBe(10);
  });

  it("toAboveMaxDTO should map Product to aboveMaxThresDto", () => {
    const product = new Product(
      new ProductId("p3"),
      "Prodotto C",
      5,
      200,
      10,
      100,
      new WarehouseId(11)
    );
    const dto = DataMapper.toAboveMaxDTO(product);
    expect(dto.id).toBe("p3");
    expect(dto.quantity).toBe(200);
    expect(dto.maxThres).toBe(100);
  });

  it("toDTOProductQuantity should map productId + quantity to productQuantityDto", () => {
    const productId = new ProductId("p4");
    const dto = DataMapper.toDTOProductQuantity(productId, 42);
    expect(dto.productId.id).toBe("p4");
    expect(dto.quantity).toBe(42);
  });

  it("orderItemToDTO should map OrderItem to DTO", async () => {
    const orderItem = new OrderItem(new ItemId(3), 7);
    const dto = await DataMapper.orderItemToDTO(orderItem);
    expect(dto.itemId.id).toBe(3);
    expect(dto.quantity).toBe(7);
  });

  it("orderIdToDTO should map OrderId to DTO", async () => {
    const orderId = new OrderId("I789");
    const dto = await DataMapper.orderIdToDTO(orderId);
    expect(dto.id).toBe("I789");
  });

  it("orderStateToDTO should map OrderState to DTO", async () => {
    const dto = await DataMapper.orderStateToDTO(OrderState.PENDING);
    expect(dto.orderState).toBe(OrderState.PENDING);
  });

  it("orderItemDetailToDTO should map OrderItemDetail to DTO", async () => {
    const item = new OrderItem(new ItemId(4), 8);
    const detail = new OrderItemDetail(item, 3, 25);
    const dto = await DataMapper.orderItemDetailToDTO(detail);
    expect(dto.item.itemId.id).toBe(4);
    expect(dto.quantityReserved).toBe(3);
    expect(dto.unitPrice).toBe(25);
  });

  it("orderQuantityToDTO should map OrderQuantity to DTO", async () => {
    const orderId = new OrderId("S111");
    const items = [new OrderItem(new ItemId(5), 4)];
    const dto = await DataMapper.orderQuantityToDTO(orderId, items);
    expect(dto.id.id).toBe("S111");
    expect(dto.items[0].itemId.id).toBe(5);
    expect(dto.items[0].quantity).toBe(4);
  });

  it("productQuantityToDTO should map entity to productQuantityDto", () => {
    const entity = { productId: new ProductId("p6"), quantity: 12 };
    const dto = DataMapper.productQuantityToDTO(entity);
    expect(dto.productId.id).toBe("p6");
    expect(dto.quantity).toBe(12);
  });

  it("warehouseIdToDomain should map DTO to WarehouseId", () => {
    const dto = { warehouseId: 123 };
    const warehouseId = DataMapper.warehouseIdToDomain(dto);
    expect(warehouseId).toBeInstanceOf(WarehouseId);
    expect(warehouseId.getId()).toBe(123);
  });
});
