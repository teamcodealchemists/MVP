import { InventoryService } from "../../src/application/inventory.service";
import { InventoryRepository } from "src/domain/inventory.repository";
import { OutboundEventAdapter } from "src/infrastructure/adapters/outbound-event.adapter";
import { Product } from "src/domain/product.entity";
import { ProductId } from "src/domain/productId.entity";
import { ProductQuantity } from "src/domain/productQuantity.entity";
import { OrderId } from "src/domain/orderId.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";

// Helpers
const makeProduct = (id: string, qty = 10, reserved = 0, min = 2, max = 20) =>
  new Product(new ProductId(id), `Product-${id}`, 100, qty, reserved, min, max);

describe("InventoryService", () => {
  let service: InventoryService;
  let repo: InventoryRepository;
  let nats: OutboundEventAdapter;

  const makeProduct = (
    id: string,
    qty = 10,
    reserved = 0,
    min = 2,
    max = 20
  ) =>
    new Product(new ProductId(id), `Product-${id}`, 100, qty, reserved, min, max);

  beforeEach(() => {
    repo = {
      getById: jest.fn(),
      getAllProducts: jest.fn(),
      addProduct: jest.fn(),
      removeById: jest.fn(),
      updateProduct: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepository>;

    nats = {
      stockAdded: jest.fn(),
      stockRemoved: jest.fn(),
      stockUpdated: jest.fn(),
      stockShipped: jest.fn(),
      stockReceived: jest.fn(),
      reservedQuantities: jest.fn(),
      sufficientProductAvailability: jest.fn(),
      belowMinThres: jest.fn(),
      aboveMaxThres: jest.fn(),
    } as unknown as jest.Mocked<OutboundEventAdapter>;

    process.env.WAREHOUSE_ID = "1";
    service = new InventoryService(repo, nats);
  });

  // -----------------------------
  // addProduct
  // -----------------------------
  it("should add a new product and publish stockAdded", async () => {
    const product = makeProduct("1");
    (repo.getById as any).mockResolvedValue(null);

    await service.addProduct(product);

    expect(repo.addProduct).toHaveBeenCalledWith(product);
    expect(nats.stockAdded).toHaveBeenCalledWith(product, expect.any(WarehouseId));
  });

  it("should throw if product already exists", async () => {
    const product = new Product(
      new ProductId("p1"),   
      "Product-p1",         
      100,                   
      5,                     
      0,                     
      1,                     
      10                    
    );
    (repo.getById as any).mockResolvedValue(product);

    await expect(service.addProduct(product)).rejects.toThrow();
  });

  // -----------------------------
  // removeProduct
  // -----------------------------
  it("should remove product if exists", async () => {
    const product = makeProduct("1");
    (repo.getById as any).mockResolvedValue(product);

    const res = await service.removeProduct(product.getId());
    expect(repo.removeById).toHaveBeenCalledWith(product.getId());
    expect(nats.stockRemoved).toHaveBeenCalled();
    expect(res).toBe(true);
  });

  it("should throw if removing non-existing product", async () => {
    (repo.getById as any).mockResolvedValue(null);
    await expect(service.removeProduct(new ProductId("999"))).rejects.toThrow();
  });

  // -----------------------------
  // editProduct
  // -----------------------------
  it("should update existing product and publish stockUpdated", async () => {
    const product = makeProduct("1", 15);
    (repo.getById as any).mockResolvedValue(product);

    await service.editProduct(product);
    expect(repo.updateProduct).toHaveBeenCalledWith(product);
    expect(nats.stockUpdated).toHaveBeenCalledWith(product, expect.any(WarehouseId));
  });

  it("should throw if editing non-existing product", async () => {
    const product = makeProduct("1");
    (repo.getById as any).mockResolvedValue(null);
    await expect(service.editProduct(product)).rejects.toThrow();
  });

  // -----------------------------
  // getProduct
  // -----------------------------
  it("should return product if exists", async () => {
    const product = makeProduct("1");
    (repo.getById as any).mockResolvedValue(product);

    const result = await service.getProduct(product.getId());
    expect(result).toBe(product);
  });

  it("should throw if product not found", async () => {
    (repo.getById as any).mockResolvedValue(null);
    await expect(service.getProduct(new ProductId("2"))).rejects.toThrow();
  });

  // -----------------------------
  // checkProductExistence
  // -----------------------------
  it("should return true if product exists", async () => {
    const product = makeProduct("1");
    (repo.getById as any).mockResolvedValue(product);
    expect(await service.checkProductExistence(product.getId())).toBe(true);
  });

  it("should return false if product does not exist", async () => {
    (repo.getById as any).mockResolvedValue(null);
    expect(await service.checkProductExistence(new ProductId("99"))).toBe(false);
  });

  // -----------------------------
  // checkProductThres
  // -----------------------------
  it("should return true if product is within thresholds", async () => {
    const product = makeProduct("1", 10, 0, 5, 20);
    expect(await service.checkProductThres(product)).toBe(true);
  });

  it("should return false if product is outside thresholds", async () => {
    const product = makeProduct("1", 50, 0, 5, 20);
    expect(await service.checkProductThres(product)).toBe(false);
  });

  // -----------------------------
  // addProductQuantity
  // -----------------------------
  it("should increase product quantity", async () => {
    const product = makeProduct("1", 5);
    (repo.getById as any).mockResolvedValue(product);

    const pq = new ProductQuantity(product.getId(), 3);
    await service.addProductQuantity(pq);

    expect(repo.updateProduct).toHaveBeenCalled();
    expect(product.getQuantity()).toBe(8);
  });

  it("should throw if product not found when adding quantity", async () => {
    (repo.getById as any).mockResolvedValue(null);
    const pq = new ProductQuantity(new ProductId("1"), 3);
    await expect(service.addProductQuantity(pq)).rejects.toThrow();
  });

  // -----------------------------
  // checkProductAvailability
  // -----------------------------
  it("should return true if all products available", async () => {
    const product = makeProduct("1", 10);
    (repo.getById as any).mockResolvedValue(product);
    const pq = [new ProductQuantity(product.getId(), 5)];

    const res = await service.checkProductAvailability(new OrderId("1"), pq);
    expect(res).toBe(true);
    expect(nats.sufficientProductAvailability).toHaveBeenCalled();
  });

  it("should return false if product not available", async () => {
    (repo.getById as any).mockResolvedValue(null);
    const pq = [new ProductQuantity(new ProductId("1"), 5)];

    const res = await service.checkProductAvailability(new OrderId("1"), pq);
    expect(res).toBe(false);
    expect(nats.reservedQuantities).toHaveBeenCalled();
  });

  // -----------------------------
  // shipOrder
  // -----------------------------
  it("should ship order and update reserved quantities", async () => {
    const order = new OrderId("order1");
    const product = makeProduct("p1", 10, 5);
    (repo.getById as jest.Mock).mockResolvedValue(product);

    const pq = [new ProductQuantity(product.getId(), 3)];
    await service.shipOrder(order, pq);

    expect(repo.updateProduct).toHaveBeenCalled();
    expect(nats.stockShipped).toHaveBeenCalledWith(order);
  });

  // -----------------------------
  // reserveStock
  // -----------------------------
  it("should reserve stock if all products sufficient", async () => {
    const order = new OrderId("order2");
    const product = makeProduct("p1", 10);
    (repo.getById as jest.Mock).mockResolvedValue(product);

    const pq = [new ProductQuantity(product.getId(), 5)];
    await service.reserveStock(order, pq);

    expect(repo.updateProduct).toHaveBeenCalled();
    expect(nats.sufficientProductAvailability).toHaveBeenCalledWith(order);
  });

  it("should reserve stock and call reservedQuantities if not enough", async () => {
    const order = new OrderId("order3");
    const product = makeProduct("p1", 3);
    (repo.getById as jest.Mock).mockResolvedValue(product);

    const pq = [new ProductQuantity(product.getId(), 5)];
    await service.reserveStock(order, pq);

    expect(nats.reservedQuantities).toHaveBeenCalled();
    expect(repo.updateProduct).toHaveBeenCalled();
  });
  // -----------------------------
  // receiveStock
  // -----------------------------
  it("should receive stock and update products", async () => {
    const order = new OrderId("order4");
    const product = makeProduct("p1", 5, 0, 2, 10);
    (repo.getById as jest.Mock).mockResolvedValue(product);

    const pq = [new ProductQuantity(product.getId(), 3)];
    await service.receiveStock(order, pq);

    expect(repo.updateProduct).toHaveBeenCalled();
    expect(nats.stockReceived).toHaveBeenCalledWith(order);
  });

  it("should call aboveMaxThres if new quantity exceeds max", async () => {
    const order = new OrderId("order5");
    const product = makeProduct("p1", 9, 0, 2, 10);
    (repo.getById as jest.Mock).mockResolvedValue(product);

    const pq = [new ProductQuantity(product.getId(), 5)];
    await service.receiveStock(order, pq);

    expect(nats.aboveMaxThres).toHaveBeenCalled();
  });


  // Nota: puoi continuare con shipOrder, reserveStock, receiveStock
  // seguendo la stessa logica di mock + expect.
});
